import fs from 'node:fs/promises'
import path from 'node:path'

const sourceLocale = 'it'
const targetLocales = ['it', 'en', 'fr', 'de', 'es']
const root = process.cwd()
const checkOnly = process.argv.includes('--check')

async function main() {
  const sourceFile = path.join(root, 'translations', `${sourceLocale}.json`)
  const masterData = JSON.parse(await fs.readFile(sourceFile, 'utf8'))
  const masterKeys = Object.keys(masterData).sort()
  let hasErrors = false

  for (const locale of targetLocales) {
    const outputFile = path.join(root, 'translations', `${locale}.json`)
    const fileExists = await fs.access(outputFile).then(() => true).catch(() => false)

    if (checkOnly) {
      if (!fileExists) {
        console.error(`${locale}: missing`)
        hasErrors = true
        continue
      }
      const localeData = JSON.parse(await fs.readFile(outputFile, 'utf8'))
      const localeKeys = Object.keys(localeData).sort()
      const missing = masterKeys.filter((key) => !localeKeys.includes(key))
      const extra = localeKeys.filter((key) => !masterKeys.includes(key))
      if (missing.length || extra.length) {
        console.error(`${locale}: missing ${missing.length}, extra ${extra.length}`)
        hasErrors = true
      } else {
        console.log(`${locale}: valid | ${masterKeys.length} keys`)
      }
      continue
    }

    const generated = Object.fromEntries(masterKeys.map((key) => [key, masterData[key]]))
    await fs.mkdir(path.dirname(outputFile), { recursive: true })
    await fs.writeFile(outputFile, JSON.stringify(generated, null, 2) + '\n', 'utf8')
    console.log(`Prepared ${locale}.json from Italian master`)
  }

  if (checkOnly && hasErrors) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
