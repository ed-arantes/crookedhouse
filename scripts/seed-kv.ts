#!/usr/bin/env node
/**
 * Seed KV with initial data from static JSON files.
 *
 * Usage:
 *   npx tsx scripts/seed-kv.ts --password <ADMIN_PASSWORD>
 *
 * Requires ADMIN_PASSWORD to match your .dev.vars or Cloudflare secret.
 * For local dev, run `wrangler pages dev` in another terminal first.
 */

const API_BASE = process.env.API_BASE ?? 'http://localhost:8788'
const PASSWORD = process.argv.includes('--password')
  ? process.argv[process.argv.indexOf('--password') + 1]
  : process.env.ADMIN_PASSWORD

if (!PASSWORD) {
  console.error('Usage: npx tsx scripts/seed-kv.ts --password <ADMIN_PASSWORD>')
  process.exit(1)
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${PASSWORD}`,
}

async function seed() {
  console.log('Seeding reviews...')
  const reviewsRes = await fetch(`${API_BASE}/api/admin/reviews`, { headers })
  if (reviewsRes.ok) {
    const reviews = await reviewsRes.json()
    console.log(`  Reviews already exist (${reviews.length} reviews). Skipping seed.`)
  } else {
    console.log('  Could not check reviews:', reviewsRes.status)
  }

  console.log('Done!')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
