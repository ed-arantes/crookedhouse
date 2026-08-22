#!/usr/bin/env node
/**
 * Generate a SQL seed file from the translation JSON files.
 *
 * Usage:
 *   npx tsx scripts/seed-d1.ts
 *
 * Then run the generated SQL against your D1 database:
 *   wrangler d1 execute crookedhouse-translations --file=./migrations/0002_seed.sql
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const locales = ['it', 'en', 'fr', 'de', 'es'] as const
const italianOnly = process.argv.includes('--italian-only')
const selectedLocales: readonly (typeof locales)[number][] = italianOnly ? ['it'] : locales

function escapeSql(value: string): string {
  return value.replace(/'/g, "''").replace(/\s*\n\s*/g, ' ')
}

const lines: string[] = []

for (const locale of selectedLocales) {
  const raw = readFileSync(resolve(root, `seeds/translations/${locale}.json`), 'utf-8')
  const entries: Record<string, string | string[]> = JSON.parse(raw)

  for (const [key, value] of Object.entries(entries)) {
    const stored = Array.isArray(value) ? JSON.stringify(value) : String(value)
    lines.push(
      `INSERT INTO translations (locale, key, value) VALUES ('${escapeSql(locale)}', '${escapeSql(key)}', '${escapeSql(stored)}') ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;`,
    )
  }
}

const sql = lines.join('\n') + '\n'
const outputName = italianOnly ? '0003_seed_it.sql' : '0002_seed.sql'
const outPath = resolve(root, `migrations/${outputName}`)
writeFileSync(outPath, sql, 'utf-8')

console.log(`Wrote ${lines.length} INSERT statements to migrations/${outputName}`)
