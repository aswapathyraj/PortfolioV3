import { prisma } from './lib/prisma.js'
import { migratePortfolio } from './lib/migrate.js'

/**
 * Development bootstrapping.
 *
 *   npm run db:setup
 *
 * Creates the owner account, migrates the existing portfolio data files into
 * the database, seeds clearly-labelled demo analytics, and writes a welcome
 * notification. Idempotent — safe to re-run.
 */

const day = 24 * 60 * 60 * 1000

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@aswapathyraj.dev'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'developer-admin-2026'
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'Aswapathy Raj'

async function ensureOwner() {
  const bcrypt = (await import('bcryptjs')).default
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)

  const existing = await prisma.admin.findUnique({ where: { email: ADMIN_EMAIL } })
  if (existing) {
    // Never downgrade or rotate the password on a re-run.
    return existing
  }

  const admin = await prisma.admin.create({
    data: { name: ADMIN_NAME, email: ADMIN_EMAIL, passwordHash, role: 'owner' },
  })
  // eslint-disable-next-line no-console
  console.log(`[seed] owner created — ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  return admin
}

function buildDemoAnalytics() {
  const now = Date.now()
  const rows = []
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  const pick = (arr) => arr[randomInt(0, arr.length - 1)]
  const dateAt = (daysAgo, hour) => new Date(now - daysAgo * day - (23 - hour) * 60 * 60 * 1000)

  const paths = ['/', '/about', '/skills', '/projects', '/projects/qr-food-ordering', '/projects/cameraport', '/projects/are-you-a-girl', '/api', '/contact']
  const countries = ['India', 'United States', 'United Kingdom', 'Germany', 'Australia', 'Canada', 'Singapore', 'Netherlands']
  const devices = ['Desktop', 'Mobile', 'Tablet']
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge']
  const referrers = ['Direct', 'github.com', 'google.com', 'linkedin.com']

  let visitorId = 1
  for (let daysAgo = 29; daysAgo >= 0; daysAgo -= 1) {
    const visitors = randomInt(2, 14)
    for (let i = 0; i < visitors; i += 1) {
      const hour = randomInt(8, 23)
      rows.push({
        type: 'visit',
        path: pick(paths),
        device: pick(devices),
        browser: pick(browsers),
        country: pick(countries),
        referrer: pick(referrers),
        visitorId: `demo-${visitorId++}`,
        createdAt: dateAt(daysAgo, hour),
        source: 'demo',
      })
      if (Math.random() < 0.12) {
        rows.push({ type: 'project_view', projectSlug: pick(['qr-food-ordering', 'cameraport', 'are-you-a-girl', 'developer-portfolio']), path: '/projects', createdAt: dateAt(daysAgo, hour), source: 'demo' })
      }
      if (Math.random() < 0.03) {
        rows.push({ type: 'contact', path: '/contact', createdAt: dateAt(daysAgo, hour), source: 'demo' })
      }
    }
  }
  return rows
}

export async function seed() {
  // eslint-disable-next-line no-console
  console.log('[seed] migrating portfolio data files → database…')
  const counts = await migratePortfolio(prisma)
  // eslint-disable-next-line no-console
  console.log('[seed]', counts)

  await ensureOwner()

  const demo = buildDemoAnalytics()
  await prisma.$transaction([
    prisma.analyticsEvent.deleteMany({ where: { source: 'demo' } }),
    prisma.analyticsEvent.createMany({ data: demo }),
  ])
  // eslint-disable-next-line no-console
  console.log(`[seed] demo analytics seeded — ${demo.length} events (marked demo)`)

  await prisma.notification.deleteMany({ where: { type: 'welcome' } })
  await prisma.notification.create({
    data: { type: 'welcome', title: 'Welcome to your Portfolio Control Center', body: 'Dashboard data is seeded for development. Publish content to make it appear on the live site.' },
  })
  // eslint-disable-next-line no-console
  console.log('[seed] done')
}

// Run directly: `node src/seed.js`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seed()
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[seed] failed', err)
      process.exit(1)
    })
    .finally(async () => prisma.$disconnect())
}