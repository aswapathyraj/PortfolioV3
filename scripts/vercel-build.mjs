/**
 * Production build for Vercel.
 *
 * The SPA is built by the root build, and the serverless API functions under
 * /api import the Express app from server/ — they need the Prisma client
 * generated for the production database. Local development keeps the SQLite
 * schema, so we only switch providers for deployment builds (VERCEL_* set).
 */
import { execSync } from 'node:child_process'

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })

const isDeploy = Boolean(process.env.VERCEL) || process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview'
const schema = isDeploy ? 'server/prisma/schema.postgresql.prisma' : 'server/prisma/schema.prisma'
const label = isDeploy ? 'production (postgresql)' : 'local (sqlite)'

console.log(`[vercel-build] generating Prisma client for ${label}`)
run('npm --prefix server install')
run(`npx prisma generate --schema ${schema}`)

console.log('[vercel-build] building the SPA')
run('npm run build')
