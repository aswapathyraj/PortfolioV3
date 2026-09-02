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

router.get(
  '/profile',
  asyncHandler(async (_req, res) => {
    const settings = await getSettings()
    ok(res, {
      data: {
        name: settings.site.name || DEFAULT_SETTINGS.site.name,
        initials: settings.site.initials || DEFAULT_SETTINGS.site.initials,
        title: settings.site.title || DEFAULT_SETTINGS.site.title,
        headline: settings.site.headline || DEFAULT_SETTINGS.site.headline,
        availability: settings.site.availability ?? DEFAULT_SETTINGS.site.availability,
        location: settings.site.location ?? '',
        timezone: settings.site.timezone ?? '',
        email: settings.site.email ?? '',
        github: settings.site.github ?? '',
        linkedin: settings.site.linkedin ?? '',
        resume: settings.site.resume ?? '',
        about: settings.about ?? DEFAULT_SETTINGS.about,
        maintenance: settings.features?.maintenanceMode ?? false,
        appearance: settings.appearance ?? DEFAULT_SETTINGS.appearance,
        contact: settings.contact ?? DEFAULT_SETTINGS.contact,
      },
    })
  }),
)

router.get(
  '/projects',
  asyncHandler(async (req, res) => {
    const projects = await prisma.project.findMany({
      where: PUBLISHED,
      include: projectInclude,
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
    })

    const tech = req.query.tech?.trim()
    const filtered = tech ? projects.filter((p) => (p.technologies ?? []).some((t) => t.skillId === tech)) : projects

    ok(res, {
      data: filtered.map((p) => projectJson(p)),
      total: filtered.length,
    })
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
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      include: { projects: { include: { project: { select: { slug: true, title: true } } } } },
    })

    ok(res, {
      data: skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        icon: skill.icon ?? '',
        description: skill.description ?? '',
        featured: skill.featured,
        projects: skill.projects
          .filter((link) => link.project.status === 'published')
          .map((link) => ({ slug: link.project.slug, title: link.project.title })),
      })),
    })
  }),
)

router.get(
  '/experience',
  asyncHandler(async (_req, res) => {
    const items = await prisma.experience.findMany({
      where: { visible: true },
      orderBy: { sortOrder: 'asc' },
    })
    ok(res, {
      data: items.map((item) => ({
        ...item,
        highlights: jparse(item.highlights, []),
        stack: jparse(item.stack, []),
        projects: jparse(item.projects, []),
      })),
    })
  }),
)

router.get(
  '/security',
  asyncHandler(async (_req, res) => {
    const items = await prisma.securityItem.findMany({
      where: { visible: true },
      orderBy: { sortOrder: 'asc' },
    })
    ok(res, {
      data: items.map((item) => ({ ...item, projects: jparse(item.projects, []) })),
    })
  }),
)

router.get(
  '/engineering',
  asyncHandler(async (_req, res) => {
    const items = await prisma.engineeringItem.findMany({
      where: { visible: true },
      orderBy: { sortOrder: 'asc' },
    })
    ok(res, {
      data: items.map((item) => ({
        ...item,
        tech: jparse(item.tech, []),
        example: jparse(item.example, null),
      })),
    })
  }),
)

router.get(
  '/api-docs',
  asyncHandler(async (_req, res) => {
    const endpoints = await prisma.apiEndpoint.findMany({
      where: { visible: true },
      orderBy: { sortOrder: 'asc' },
    })
    ok(res, {
      data: endpoints.map((endpoint) => ({
        ...endpoint,
        query: jparse(endpoint.query, []),
        params: jparse(endpoint.params, []),
        body: jparse(endpoint.body, null),
        sampleBody: jparse(endpoint.sampleBody, null),
        sampleParams: jparse(endpoint.sampleParams, null),
        statuses: jparse(endpoint.statuses, []),
      })),
    })
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