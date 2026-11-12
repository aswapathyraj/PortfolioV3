import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { asyncHandler, ApiError, ok } from '../lib/errors.js'
import { validate } from '../middleware/validate.js'
import { publicContactSchema } from '../schemas.js'
import { getSettings, DEFAULT_SETTINGS } from './admin/system.routes.js'
import { projectJson } from '../services/serialize.js'
import { createNotification } from '../lib/audit.js'
import { jparse } from '../lib/json.js'

/**
 * Public portfolio API — consumed by the live site with a static-data fallback.
 *
 * These endpoints are deliberately thin: they only ever return *published*
 * content, merged with the site settings the owner manages in the CMS.
 */

const router = Router()

const PUBLISHED = { status: 'published' }

const projectInclude = {
  technologies: { include: { skill: true }, orderBy: { sortOrder: 'asc' } },
  screenshots: { orderBy: { sortOrder: 'asc' } },
}

/**
 * Public GETs are edge-cacheable: the content changes only when the owner edits
 * it in the CMS, so a short shared-cache window removes the lambda + database
 * round trip from every visitor's page load. `s-maxage` governs the CDN;
 * `stale-while-revalidate` keeps the edge serving content while it refreshes.
 */
const EDGE_CACHE = 'public, max-age=0, s-maxage=60, stale-while-revalidate=600'

router.use((req, res, next) => {
  if (req.method === 'GET') res.set('Cache-Control', EDGE_CACHE)
  next()
})

/* ------------------------------------------------------------------ loaders */

const loadProfile = async (settings) => {
  const s = settings ?? (await getSettings())
  return {
    name: s.site.name || DEFAULT_SETTINGS.site.name,
    initials: s.site.initials || DEFAULT_SETTINGS.site.initials,
    title: s.site.title || DEFAULT_SETTINGS.site.title,
    headline: s.site.headline || DEFAULT_SETTINGS.site.headline,
    availability: s.site.availability ?? DEFAULT_SETTINGS.site.availability,
    location: s.site.location ?? '',
    timezone: s.site.timezone ?? '',
    email: s.site.email ?? '',
    github: s.site.github ?? '',
    linkedin: s.site.linkedin ?? '',
    resume: s.site.resume ?? '',
    about: s.about ?? DEFAULT_SETTINGS.about,
    maintenance: s.features?.maintenanceMode ?? false,
    appearance: s.appearance ?? DEFAULT_SETTINGS.appearance,
    contact: s.contact ?? DEFAULT_SETTINGS.contact,
  }
}

const loadProjects = async () => {
  const projects = await prisma.project.findMany({
    where: PUBLISHED,
    include: projectInclude,
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
  })
  return projects.map((p) => projectJson(p))
}

const loadSkills = async () => {
  const skills = await prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    include: { projects: { include: { project: { select: { slug: true, title: true } } } } },
  })
  return skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    category: skill.category,
    icon: skill.icon ?? '',
    description: skill.description ?? '',
    featured: skill.featured,
    projects: skill.projects
      .filter((link) => link.project.status === 'published')
      .map((link) => ({ slug: link.project.slug, title: link.project.title })),
  }))
}

const loadExperience = async () => {
  const items = await prisma.experience.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
  })
  return items.map((item) => ({
    ...item,
    highlights: jparse(item.highlights, []),
    stack: jparse(item.stack, []),
    projects: jparse(item.projects, []),
  }))
}

const loadSecurity = async () => {
  const items = await prisma.securityItem.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
  })
  return items.map((item) => ({ ...item, projects: jparse(item.projects, []) }))
}

const loadEngineering = async () => {
  const items = await prisma.engineeringItem.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
  })
  return items.map((item) => ({
    ...item,
    tech: jparse(item.tech, []),
    example: jparse(item.example, null),
  }))
}

const loadApiDocs = async () => {
  const endpoints = await prisma.apiEndpoint.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
  })
  return endpoints.map((endpoint) => ({
    ...endpoint,
    query: jparse(endpoint.query, []),
    params: jparse(endpoint.params, []),
    body: jparse(endpoint.body, null),
    sampleBody: jparse(endpoint.sampleBody, null),
    sampleParams: jparse(endpoint.sampleParams, null),
    statuses: jparse(endpoint.statuses, []),
  }))
}

// Attach a privacy-safe visitor id built server-side. Registered before any
// route so /contact and /events can rely on it.
router.use((req, _res, next) => {
  const fingerprint = `${req.ip ?? 'x'}|${req.headers['user-agent'] ?? ''}`
  req.visitorId = () => {
    let hash = 5381
    const value = `${process.env.ANALYTICS_SALT ?? 'pf'}|${fingerprint}`
    for (let i = 0; i < value.length; i += 1) {
      hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0
    }
    return `v${hash.toString(36)}`
  }
  // eslint-disable-next-line no-unused-vars
  req.bodyVisitorId = () => req.visitorId()
  next()
})

router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`
      ok(res, { price: 'ok', service: 'portfolio-api', database: 'ok' })
    } catch {
      throw new ApiError(503, 'DATABASE_DOWN', 'Database unreachable.')
    }
  }),
)

/**
 * Bootstrap — everything the public site needs in one request.
 *
 * The home page used to fire eight parallel calls (projects, skills,
 * experience, security, engineering, api-docs, profile, seo), which meant eight
 * lambda invocations and eight sets of database queries for every visitor. One
 * endpoint, one round trip, one cache entry.
 */
router.get(
  '/bootstrap',
  asyncHandler(async (_req, res) => {
    const settings = await getSettings()
    const [profile, seo, projects, skills, experience, security, engineering, apiDocs] =
      await Promise.all([
        loadProfile(settings),
        Promise.resolve(settings.seo),
        loadProjects(),
        loadSkills(),
        loadExperience(),
        loadSecurity(),
        loadEngineering(),
        loadApiDocs(),
      ])

    ok(res, { data: { profile, seo, projects, skills, experience, security, engineering, apiDocs } })
  }),
)

router.get(
  '/profile',
  asyncHandler(async (_req, res) => {
    ok(res, { data: await loadProfile() })
  }),
)

router.get(
  '/projects',
  asyncHandler(async (req, res) => {
    const projects = await loadProjects()

    const tech = req.query.tech?.trim()
    // projectJson() flattens technologies to skill-id strings.
    const filtered = tech
      ? projects.filter((p) => (p.technologies ?? []).includes(tech))
      : projects

    ok(res, { data: filtered, total: filtered.length })
  }),
)

router.get(
  '/projects/:slug',
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findFirst({
      where: { slug: req.params.slug, ...PUBLISHED },
      include: projectInclude,
    })
    if (!project) throw new ApiError(404, 'PROJECT_NOT_FOUND', 'No published project has that slug.')
    ok(res, { data: projectJson(project) })
  }),
)

router.get(
  '/skills',
  asyncHandler(async (_req, res) => {
    ok(res, { data: await loadSkills() })
  }),
)

router.get(
  '/experience',
  asyncHandler(async (_req, res) => {
    ok(res, { data: await loadExperience() })
  }),
)

router.get(
  '/security',
  asyncHandler(async (_req, res) => {
    ok(res, { data: await loadSecurity() })
  }),
)

router.get(
  '/engineering',
  asyncHandler(async (_req, res) => {
    ok(res, { data: await loadEngineering() })
  }),
)

router.get(
  '/api-docs',
  asyncHandler(async (_req, res) => {
    ok(res, { data: await loadApiDocs() })
  }),
)

router.get(
  '/seo',
  asyncHandler(async (_req, res) => {
    const settings = await getSettings()
    ok(res, { data: settings.seo })
  }),
)

/* ------------------------------------------------- Contact + event intake */

async function deliver(viaPostJson, cfg, payload) {
  // Delivery is best-effort and must never fake success.
  if (cfg.provider === 'endpoint' && cfg.endpoint) {
    return viaPostJson(cfg.endpoint, payload)
  }
  if (cfg.provider === 'web3forms' && cfg.web3formsAccessKey) {
    return viaPostJson('https://api.web3forms.com/submit', {
      ...payload,
      access_key: cfg.web3formsAccessKey,
    })
  }
  return null
}

router.post(
  '/contact',
  validate(publicContactSchema),
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body
    const settings = await getSettings()
    const cfg = settings.contact ?? {}

    const stored = await prisma.message.create({
      data: { name, email, subject, body: message, status: 'unread', source: 'api' },
    })

    await prisma.analyticsEvent.create({
      data: {
        type: 'contact',
        source: 'live',
        path: '/contact',
        visitorId: req.bodyVisitorId(),
      },
    })

    await createNotification('message', 'New contact message', `${name} · ${subject || 'no subject'}`)

    let delivered = false
    let deliveryNote = null
    try {
      const result = await deliver(
        async (url, payload) => {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          return response.ok
        },
        cfg,
        { name, email, subject, message },
      )
      delivered = Boolean(result)
      deliveryNote = delivered ? 'Delivered through the configured provider.' : null
    } catch {
      delivered = false
      deliveryNote = 'Provider delivery failed; the message is stored in the inbox.'
    }

    ok(res, { message: stored.id, delivered, deliveryNote }, 202)
  }),
)

router.post(
  '/events',
  asyncHandler(async (req, res) => {
    const { type, projectSlug, path } = req.body ?? {}
    if (!['visit', 'project_view'].includes(type)) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Event type must be "visit" or "project_view".')
    }

    const ua = req.headers['user-agent'] ?? ''
    const device = /Mobi|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop'
    const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Other'

    await prisma.analyticsEvent.create({
      data: {
        type,
        source: 'live',
        projectSlug: projectSlug || null,
        path: path || null,
        device,
        browser,
        visitorId: req.visitorId(),
      },
    })

    ok(res, { recorded: true })
  }),
)

export default router