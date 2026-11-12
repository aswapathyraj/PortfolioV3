/**
 * Production build for Vercel.
 *
 * The SPA is built by the root build, and the serverless API functions under
 * /api import the Express app from server/ — they need the Prisma client
 * generated for the production database. Local development keeps the SQLite
 * schema, so we only switch providers for deployment builds (VERCEL_* set).
 */
import { execSync } from 'node:child_process'

const run = (cmd, cwd) => execSync(cmd, { stdio: 'inherit', cwd })

const isDeploy = Boolean(process.env.VERCEL) || process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview'
const schema = isDeploy ? 'prisma/schema.postgresql.prisma' : 'prisma/schema.prisma'
const label = isDeploy ? 'production (postgresql)' : 'local (sqlite)'

console.log(`[vercel-build] generating Prisma client for ${label}`)
run('npm install', 'server')
run(`npx --no-install prisma generate --schema ${schema}`, 'server')

console.log('[vercel-build] building the SPA')
run('npm run build', '.')
