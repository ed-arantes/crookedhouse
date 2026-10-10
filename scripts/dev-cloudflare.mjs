import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const nextCli = resolve(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next')
const wranglerCli = resolve(projectRoot, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
const outputDirectory = resolve(projectRoot, 'out')

if (!existsSync(nextCli) || !existsSync(wranglerCli)) {
  console.error('Project dependencies are missing. Run npm install before starting local development.')
  process.exit(1)
}

if (!existsSync(outputDirectory)) mkdirSync(outputDirectory, { recursive: true })

let stopping = false
const children = []

function stop(exitCode = 0) {
  if (stopping) return
  stopping = true
  process.exitCode = exitCode

  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill()
  }
}

function start(cli, args, env = process.env) {
  const child = spawn(process.execPath, [cli, ...args], {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  })
  children.push(child)

  child.once('error', (error) => {
    console.error(error)
    stop(1)
  })
  child.once('exit', (code, signal) => {
    if (stopping) return
    console.error(`Local development process stopped (${signal ?? `exit code ${code}`}).`)
    stop(code ?? 1)
  })
}

console.info('Next.js hot reload: http://localhost:3000')
console.info('Cloudflare Pages Functions: http://localhost:8788')
console.info('Remote Cloudflare D1/R2 bindings are enabled; data changes affect those resources.')

start(wranglerCli, ['pages', 'dev', 'out', '--port', '8788'])
start(nextCli, ['dev', '--port', '3000'], {
  ...process.env,
  NEXT_DIST_DIR: '.next-cloudflare-dev',
  NEXT_PUBLIC_API_BASE_URL: 'http://localhost:8788',
})

process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())
