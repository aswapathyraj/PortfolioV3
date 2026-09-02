import { Router } from 'express'
import { prisma } from '../../lib/prisma.js'
import { asyncHandler, ApiError, ok } from '../../lib/errors.js'
import { config } from '../../config.js'
import { recordActivity } from '../../lib/audit.js'
import { j, jparse } from '../../lib/json.js'

const router = Router()

/* ----------------------------------------------------------------- Analytics */

const day = 24 * 60 * 60 * 1000

/** Builds a zero-filled 30-day series for a given metric. */
function seriesFor(events, days = 30) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getTime() - (days - 1 - i) * day)
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      count: 0,
    }
  })
  const index = Object.fromEntries(series.map((s, i) => [s.date, i]))
  for (const event of events) {
    const key = new Date(event.createdAt).toISOString().slice(0, 10)
    if (index[key] !== undefined) series[index[key]].count += 1
  }
  return series
}

function breakdown(events, field) {
  const counts = {}
  for (const event of events) {
    const key = event[field] || 'Unknown'
    counts[key] = (counts[key] ?? 0) + 1
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, count]) => ({ name, count }))
}

router.get(
  '/analytics',
  asyncHandler(async (_req, res) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * day)
    const [events, demoCount, liveCount] = await Promise.all([
      prisma.analyticsEvent.findMany({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.analyticsEvent.count({ where: { source: 'demo' } }),
      prisma.analyticsEvent.count({ where: { source: 'live' } }),
    ])

    if (events.length === 0) {
      return ok(res, {
        connected: false,
        data: null,
        message: 'Analytics not connected. No events have been recorded yet.',
        note: 'The public portfolio records visits, project views, and contact submissions. Open the site once data flows; until then the section shows demo data you can seed below.',
      })
    }

    const visits = events.filter((e) => e.type === 'visit')
    const projectViews = events.filter((e) => e.type === 'project_view')
    const contacts = events.filter((e) => e.type === 'contact')

    const topProjects = breakdown(projectViews, 'projectSlug')
    const topPaths = breakdown(events, 'path')
    const countries = breakdown(events, 'country')
    const devices = breakdown(events, 'device')
    const browsers = breakdown(events, 'browser')
    const referrers = breakdown(events, 'referrer')

    const uniqueVisitors = new Set(
      events.filter((e) => e.type === 'visit' && e.visitorId).map((e) => e.visitorId),
    ).size

    ok(res, {
      connected: true,
      demo: demoCount > 0,
      source: demoCount > 0 && liveCount === 0 ? 'demo' : liveCount > 0 ? 'mixed' : 'live',
      demoCount,
      liveCount,
      data: {
        stats: {
          visitors: visits.length,
          uniqueVisitors,
          projectViews: projectViews.length,
          pageViews: visits.length,
          contacts: contacts.length,
          conversionRate: contacts.length && visits.length ? contacts.length / visits.length : 0,
        },
        series: {
          visitors: seriesFor(visits),
          projectViews: seriesFor(projectViews),
          contacts: seriesFor(contacts),
        },
        breakdowns: { topProjects, topPaths, countries, devices, browsers, referrers },
      },
    })
  }),
)

router.post(
  '/analytics/seed-demo',
  asyncHandler(async (req, res) => {
    const now = Date.now()
    const rows = []

    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
    const pick = (arr) => arr[randomInt(0, arr.length - 1)]
    const dateAt = (daysAgo, hour) => new Date(now - daysAgo * day - (23 - hour) * 60 * 60 * 1000)

    const paths = ['/', '/about', '/skills', '/projects', '/projects/qr-food-ordering', '/projects/cameraport', '/projects/are-you-a-girl', '/api', '/contact']
    const countries = ['India', 'United States', 'United Kingdom', 'Germany', 'Australia', 'Canada', 'Singapore', 'Netherlands']
    const devices = ['Desktop', 'Mobile', 'Tablet']
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge']
    const referrers = ['Direct', 'github.com', 'google.com', 'linkedin.com', 'web3forms']

    // Rough but plausible 30 days of traffic. Clearly flagged `source: demo`.
    let visitorIp = 1
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
          visitorId: `demo-${visitorIp++}`,
          createdAt: dateAt(daysAgo, hour),
          source: 'demo',
        })
        if (Math.random() < 0.12) rows.push({ type: 'project_view', projectSlug: pick(['qr-food-ordering', 'cameraport', 'are-you-a-girl', 'developer-portfolio']), path: '/projects', createdAt: dateAt(daysAgo, hour), source: 'demo' })
        if (Math.random() < 0.03) rows.push({ type: 'contact', path: '/contact', createdAt: dateAt(daysAgo, hour), source: 'demo' })
      }
    }

    // Idempotent: seeding replaces demo rows so re-running does not compound.
    await prisma.$transaction([
      prisma.analyticsEvent.deleteMany({ where: { source: 'demo' } }),
      prisma.analyticsEvent.createMany({ data: rows }),
    ])

    await recordActivity({ req, action: 'analytics.demo_seeded', entity: 'analytics' })
    ok(res, {
      message: `Seeded ${rows.length} demo events (marked demo). These are development data, not real metrics.`,
    })
  }),
)

router.delete(
  '/analytics/demo',
  asyncHandler(async (_req, res) => {
    await prisma.analyticsEvent.deleteMany({ where: { source: 'demo' } })
    ok(res, { message: 'Demo analytics removed.' })
  }),
)

/* ------------------------------------------------------------------ GitHub */

const GITHUB_CACHE_TTL_MS = 15 * 60 * 1000

async function fetchGithubProfile(username) {
  const headers = { Accept: 'application/vnd.github+json' }
  const [user, repos, events, contributions] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers }),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers }),
    fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers }),
    fetch(`https://github.com/users/${username}/contributions`, { headers: { Accept: 'text/html' } }),
  ])

  if (user.status === 403 || user.status === 429) {
    throw Object.assign(new Error('GitHub rate limit reached.'), { code: 'RATE_LIMITED' })
  }
  if (!user.ok) throw new Error(`GitHub returned ${user.status}.`)

  const userJson = await user.json()
  const reposJson = await repos.json()

  let pushEvents = 0
  if (events.ok) {
    const eventsJson = await events.json()
    pushEvents = eventsJson.filter((e) => e.type === 'PushEvent').length
  }

  // Contribution graph parsed from the public HTML (best effort).
  let contribTotal = NaN
  if (contributions.ok) {
    const html = await contributions.text()
    const match = html.match(/<h2[^>]*>\s*([\d,]+)\s+contributions?/i)
    if (match) contribTotal = Number(match[1].replace(/,/g, ''))
  }

  return {
    username,
    avatar: userJson.avatar_url,
    name: userJson.name,
    publicRepos: userJson.public_repos,
    followers: userJson.followers,
    stars: reposJson.reduce((sum, repo) => sum + (repo.stargazers_count ?? 0), 0),
    forks: reposJson.reduce((sum, repo) => sum + (repo.forks_count ?? 0), 0),
    commits: pushEvents,
    pullRequests: 0,
    contributions: Number.isFinite(contribTotal) ? contribTotal : null,
    syncedAt: new Date().toISOString(),
  }
}

router.get(
  '/github',
  asyncHandler(async (_req, res) => {
    const username = config.githubUsername
    if (!username) {
      return ok(res, {
        connected: false,
        data: null,
        message: 'GitHub not connected. Set GITHUB_USERNAME in the server environment to enable it.',
      })
    }

    const cache = await prisma.githubCache.findUnique({ where: { id: 'default' } })
    const cachedData = cache ? jparse(cache.data, null) : null
    const fresh =
      cache?.syncedAt && Date.now() - new Date(cache.syncedAt).getTime() < GITHUB_CACHE_TTL_MS

    if (fresh && cachedData) {
      return ok(res, { connected: true, fromCache: true, data: cachedData })
    }

    try {
      const data = await fetchGithubProfile(username)
      await prisma.githubCache.upsert({
        where: { id: 'default' },
        update: { username, data: j(data), status: 'ok', message: null, syncedAt: new Date() },
        create: { id: 'default', username, data: j(data), status: 'ok', syncedAt: new Date() },
      })
      return ok(res, { connected: true, fromCache: false, data })
    } catch (err) {
      // Graceful degradation: never 500 when GitHub is down or rate-limited.
      const degraded = cachedData
        ? {
            ...cachedData,
            syncedAt: cache?.syncedAt,
          }
        : null
      return ok(res, {
        connected: false,
        degraded: true,
        fromCache: !!degraded,
        message:
          err.code === 'RATE_LIMITED'
            ? 'GitHub temporarily unavailable — API rate limit reached. Showing cached data.'
            : `GitHub temporarily unavailable. Showing cached data.`,
        data: degraded,
      })
    }
  }),
)

router.post(
  '/github/sync',
  asyncHandler(async (req, res) => {
    const username = config.githubUsername
    if (!username) throw new ApiError(422, 'NOT_CONFIGURED', 'Set GITHUB_USERNAME first.')

    try {
      const data = await fetchGithubProfile(username)
      await prisma.githubCache.upsert({
        where: { id: 'default' },
        update: { username, data: j(data), status: 'ok', message: null, syncedAt: new Date() },
        create: { id: 'default', username, data: j(data), status: 'ok', syncedAt: new Date() },
      })
      await recordActivity({ req, action: 'github.synced', entity: 'github' })
      return ok(res, { message: 'GitHub synchronized.', data })
    } catch (err) {
      const cache = await prisma.githubCache.findUnique({ where: { id: 'default' } })
      if (cache?.data) {
        await prisma.githubCache.update({
          where: { id: 'default' },
          data: { status: 'degraded', message: err.message, syncedAt: cache.syncedAt },
        })
      }
      throw new ApiError(
        err.code === 'RATE_LIMITED' ? 429 : 502,
        err.code === 'RATE_LIMITED' ? 'GITHUB_RATE_LIMITED' : 'GITHUB_UNAVAILABLE',
        err.message,
      )
    }
  }),
)

export default router