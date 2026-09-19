import { access, readFile, readdir, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const errors = []

for (const requiredFile of [
  'README.md',
  'CHANGELOG.md',
  'docs/components.md',
  'docs/migration.md',
]) {
  try {
    await access(resolve(root, requiredFile))
  } catch {
    errors.push(`Missing release document: ${requiredFile}`)
  }
}

function collectExportTargets(value, targets = []) {
  if (typeof value === 'string' && value.startsWith('./dist/')) targets.push(value)
  else if (value && typeof value === 'object') {
    Object.values(value).forEach((entry) => collectExportTargets(entry, targets))
  }
  return targets
}

for (const target of collectExportTargets(packageJson.exports)) {
  try {
    await access(resolve(root, target))
  } catch {
    errors.push(`Missing export target: ${target}`)
  }
}

let distBytes = 0
let distFiles = 0
async function inspectDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) await inspectDirectory(path)
    else {
      distFiles += 1
      distBytes += (await stat(path)).size
      if (/\.(?:test|spec)\.d\.ts$/.test(entry.name)) {
        errors.push(
          `Test declaration leaked into package: ${path.slice(root.length + 1)}`,
        )
      }
    }
  }
}

await inspectDirectory(resolve(root, 'dist'))
const maxBytes = 8 * 1024 * 1024
if (distBytes > maxBytes) {
  errors.push(`dist is ${(distBytes / 1024 / 1024).toFixed(2)} MiB; budget is 8 MiB`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(
    `Package contract valid: ${distFiles} files, ${(distBytes / 1024 / 1024).toFixed(2)} MiB`,
  )
}
