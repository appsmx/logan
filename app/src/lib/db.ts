import { PrismaClient } from '@prisma/client'

// Schema version key — bump when Prisma schema gains new models so the dev-mode
// singleton is recreated with the freshly generated PrismaClient. Turbopack
// preserves `globalThis` across hot reloads, so without a version bump the old
// instance (missing new model accessors like `legalAsset` / `supportAsset`)
// would persist indefinitely.
const SCHEMA_VERSION = 'v10_git_tools_a'

const KEY = `prisma_${SCHEMA_VERSION}`

const globalForPrisma = globalThis as unknown as Record<string, PrismaClient | undefined>

console.log('[db.ts] loading db.ts; KEY=', KEY, 'cached?', !!globalForPrisma[KEY])

export const db =
  globalForPrisma[KEY] ??
  new PrismaClient({
    log: ['query'],
  })

const _dbAny = db as unknown as Record<string, unknown>
console.log('[db.ts] db keys:', Object.keys(_dbAny).filter((k) => typeof _dbAny[k] === 'object').slice(0, 30))
console.log('[db.ts] has legalAsset?', !!_dbAny.legalAsset, 'has supportAsset?', !!_dbAny.supportAsset, 'has financeAsset?', !!_dbAny.financeAsset, 'has marketingAsset?', !!_dbAny.marketingAsset)
console.log('[db.ts] has gitAction?', !!_dbAny.gitAction)

if (process.env.NODE_ENV !== 'production') globalForPrisma[KEY] = db


