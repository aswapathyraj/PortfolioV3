/**
 * Portfolio data migration CLI.
 *
 *   node scripts/migrate-portfolio.mjs   (from server/)
 *
 * Imports the existing static content in ../src/data into the database, idempotently.
 */
import { prisma } from '../src/lib/prisma.js'
import { migratePortfolio } from '../src/lib/migrate.js'

try {
  const counts = await migratePortfolio(prisma)
  // eslint-disable-next-line no-console
  console.log('Migration complete:', counts)
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Migration failed:', err)
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}