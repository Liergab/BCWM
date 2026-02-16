const fs = require('fs')
const path = require('path')

const projectRoot = process.cwd()

const parseFeatureArg = () => {
  if (process.argv[2]) return process.argv[2]

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

const featureArg = parseFeatureArg()
if (!featureArg) {
  console.error(
    'Missing feature name. Usage: npm run feature -- <name> (example: npm run feature -- todo)'
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

const toPascal = (items) => items.map((w) => w[0].toUpperCase() + w.slice(1)).join('')
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
const featurePascal = toPascal(words)
const featurePlural = pluralize(featureSingular)
const featurePluralPascal = featurePlural[0].toUpperCase() + featurePlural.slice(1)

const files = {
  route: path.join(projectRoot, 'routes', `${featureSingular}Routes.ts`),
  controller: path.join(projectRoot, 'controllers', `${featureSingular}Controller.ts`),
  service: path.join(projectRoot, 'services', `${featureSingular}Services.ts`),
  repository: path.join(projectRoot, 'repository', `${featureSingular}Repository.ts`),
  prisma: path.join(projectRoot, 'prisma', 'schema', `${featureSingular}.prisma`),
}

const alreadyExists = Object.values(files).filter((filePath) => fs.existsSync(filePath))
if (alreadyExists.length > 0) {
  console.error('Aborted. These files already exist:')
  alreadyExists.forEach((filePath) => console.error(`- ${path.relative(projectRoot, filePath)}`))
  process.exit(1)
}

const writeFile = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${content.trim()}\n`, 'utf8')
}

writeFile(
  files.repository,
  `
import { GenericRepository } from './genericRepository'

export interface ${featurePascal}Entity {
  id: string
  name: string
  description: string
}

class ${featurePascal}Repository extends GenericRepository<${featurePascal}Entity> {
  constructor() {
    super('${featureSingular}')
  }
}

export default new ${featurePascal}Repository()
`
)

writeFile(
  files.service,
  `
import ${featurePascal}Repository, { ${featurePascal}Entity } from '../repository/${featureSingular}Repository'

export type Create${featurePascal}DTO = Pick<${featurePascal}Entity, 'name' | 'description'>
export type Update${featurePascal}DTO = Partial<Create${featurePascal}DTO>

class ${featurePascal}Service {
  async create${featurePascal}(data: Create${featurePascal}DTO): Promise<${featurePascal}Entity> {
    return (await ${featurePascal}Repository.add(data)) as ${featurePascal}Entity
  }

  async getAll${featurePluralPascal}(): Promise<${featurePascal}Entity[]> {
    return await ${featurePascal}Repository.docs()
  }

  async get${featurePascal}ById(id: string): Promise<${featurePascal}Entity | null> {
    return await ${featurePascal}Repository.doc(id)
  }

  async update${featurePascal}(id: string, data: Update${featurePascal}DTO): Promise<${featurePascal}Entity | null> {
    return await ${featurePascal}Repository.update(id, data)
  }

  async delete${featurePascal}(id: string): Promise<${featurePascal}Entity | null> {
    return await ${featurePascal}Repository.delete(id)
  }
}

export default new ${featurePascal}Service()
`
)

writeFile(
  files.controller,
  `
import { NextFunction, Request, Response } from 'express'
import ${featurePascal}Service from '../services/${featureSingular}Services'

export const create${featurePascal} = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const created = await ${featurePascal}Service.create${featurePascal}(req.body)
    res.status(201).json({ data: created })
  } catch (error) {
    next(error)
  }
}

export const getAll${featurePluralPascal} = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await ${featurePascal}Service.getAll${featurePluralPascal}()
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const get${featurePascal} = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await ${featurePascal}Service.get${featurePascal}ById(req.params.id)
    if (!data) {
      res.status(404).json({ message: '${featurePascal} not found' })
      return
    }
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const update${featurePascal} = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await ${featurePascal}Service.update${featurePascal}(req.params.id, req.body)
    if (!data) {
      res.status(404).json({ message: '${featurePascal} not found' })
      return
    }
    res.status(200).json({ data })
  } catch (error) {
    next(error)
  }
}

export const delete${featurePascal} = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await ${featurePascal}Service.delete${featurePascal}(req.params.id)
    if (!deleted) {
      res.status(404).json({ message: '${featurePascal} not found' })
      return
    }
    res.status(200).json({ message: '${featurePascal} deleted' })
  } catch (error) {
    next(error)
  }
}
`
)

writeFile(
  files.route,
  `
import express from 'express'
import * as controller from '../controllers/${featureSingular}Controller'

const ${featureSingular}Router = express.Router()

${featureSingular}Router.post('/${featurePlural}', controller.create${featurePascal})
${featureSingular}Router.get('/${featurePlural}', controller.getAll${featurePluralPascal})
${featureSingular}Router.get('/${featurePlural}/:id', controller.get${featurePascal})
${featureSingular}Router.patch('/${featurePlural}/:id', controller.update${featurePascal})
${featureSingular}Router.delete('/${featurePlural}/:id', controller.delete${featurePascal})

export default ${featureSingular}Router
`
)

writeFile(
  files.prisma,
  `
model ${featurePascal} {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String

  @@map("${featurePlural}")
}
`
)

const routesIndexPath = path.join(projectRoot, 'routes', 'index.ts')
if (fs.existsSync(routesIndexPath)) {
  let routesIndex = fs.readFileSync(routesIndexPath, 'utf8')
  const importLine = `import ${featureSingular}Router from './${featureSingular}Routes'`
  const useLine = `router.use(${featureSingular}Router)`

  if (!routesIndex.includes(importLine)) {
    routesIndex = routesIndex.replace(
      /(const router = express\.Router\(\)\s*)/m,
      `${importLine}\n$1`
    )
  }

  if (!routesIndex.includes(useLine)) {
    routesIndex = routesIndex.replace(/(export default router)/m, `${useLine}\n\n$1`)
  }

  fs.writeFileSync(routesIndexPath, routesIndex, 'utf8')
}

console.log(`Feature "${featureSingular}" scaffolded successfully.`)
console.log('Generated:')
Object.values(files).forEach((filePath) => {
  console.log(`- ${path.relative(projectRoot, filePath)}`)
})
console.log('- routes/index.ts (updated)')
console.log('')
console.log('Next steps:')
console.log('1) npx prisma validate')
console.log('2) npx prisma db push')
console.log('3) npx prisma generate')
