const fs = require('fs')
const path = require('path')

const projectRoot = process.cwd()

const parseArgs = () => {
  const cliArgs = process.argv.slice(2)

  if (cliArgs[0] === 'feature' && cliArgs[1]) {
    return cliArgs[1]
  }

  if (cliArgs[0] && cliArgs[0] !== 'feature') {
    return cliArgs[0]
  }

  const rawNpmArgv = process.env.npm_config_argv
  if (rawNpmArgv) {
    try {
      const parsed = JSON.parse(rawNpmArgv)
      const original = Array.isArray(parsed.original) ? parsed.original : []
      const idx = original.findIndex((item) => item === 'feature')
      if (idx !== -1 && original[idx + 1] && original[idx + 1] !== '--') {
        return original[idx + 1]
      }
    } catch (_err) {}
  }

  return process.env.npm_config_name
}

const featureArg = parseArgs()
if (!featureArg) {
  console.error(
    'Missing feature name. Usage: npm run undo -- feature <name> (example: npm run undo -- feature todo)'
  )
  process.exit(1)
}

const words = featureArg
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .split(/[^a-zA-Z0-9]+/)
  .filter(Boolean)
  .map((w) => w.toLowerCase())

if (words.length === 0) {
  console.error('Invalid feature name. Use letters/numbers only.')
  process.exit(1)
}

const toCamel = (items) =>
  items
    .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join('')

const pluralize = (value) => {
  if (value.endsWith('s')) return value
  if (value.endsWith('y') && !/[aeiou]y$/.test(value)) return `${value.slice(0, -1)}ies`
  return `${value}s`
}

const featureSingular = toCamel(words)
const featurePlural = pluralize(featureSingular)

const files = [
  path.join(projectRoot, 'routes', `${featureSingular}Routes.ts`),
  path.join(projectRoot, 'controllers', `${featureSingular}Controller.ts`),
  path.join(projectRoot, 'services', `${featureSingular}Services.ts`),
  path.join(projectRoot, 'repository', `${featureSingular}Repository.ts`),
  path.join(projectRoot, 'prisma', 'schema', `${featureSingular}.prisma`),
]

const deleted = []
const skipped = []

for (const filePath of files) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    deleted.push(filePath)
  } else {
    skipped.push(filePath)
  }
}

const routesIndexPath = path.join(projectRoot, 'routes', 'index.ts')
if (fs.existsSync(routesIndexPath)) {
  let routesIndex = fs.readFileSync(routesIndexPath, 'utf8')
  const importRegex = new RegExp(
    `^\\s*import\\s+${featureSingular}Router\\s+from\\s+['"]\\./${featureSingular}Routes['"]\\s*\\r?\\n`,
    'm'
  )
  const useRegex = new RegExp(
    `^\\s*router\\.use\\(${featureSingular}Router\\)\\s*\\r?\\n`,
    'm'
  )

  routesIndex = routesIndex.replace(importRegex, '')
  routesIndex = routesIndex.replace(useRegex, '')
  fs.writeFileSync(routesIndexPath, routesIndex, 'utf8')
}

console.log(`Feature "${featureSingular}" cleanup completed.`)
console.log('')
console.log('Deleted:')
if (deleted.length === 0) {
  console.log('- none')
} else {
  deleted.forEach((filePath) => console.log(`- ${path.relative(projectRoot, filePath)}`))
}

if (skipped.length > 0) {
  console.log('')
  console.log('Skipped (not found):')
  skipped.forEach((filePath) => console.log(`- ${path.relative(projectRoot, filePath)}`))
}

console.log('')
console.log('Next steps:')
console.log('1) npx prisma validate')
console.log('2) npx prisma generate')
console.log(`3) Optionally run npx prisma db push to remove "${featurePlural}" model mapping`)
