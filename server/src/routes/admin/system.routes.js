import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma.js'
import { asyncHandler, ApiError, ok } from '../../lib/errors.js'
import { validate } from '../../middleware/validate.js'
import { requireRole, requireOwner, ROLES } from '../../middleware/auth.js'
import { userCreateSchema, userUpdateSchema } from '../../schemas.js'
import { config } from '../../config.js'
import { adminJson } from '../../services/serialize.js'
import { recordActivity } from '../../lib/audit.js'
import { hashRefreshToken } from '../../services/tokens.js'
import { j, jparse } from '../../lib/json.js'

const router = Router()
const day = 24 * 60 * 60 * 1000

/* --------------------------------------------------------- Defaults & loader */

export const DEFAULT_SETTINGS = {
  site: {
    name: 'Aswapathy Raj',
    initials: 'AR',
    title: 'Full-Stack Developer',
    headline: 'I build modern, scalable web applications from interface to database and deployment.',
    siteUrl: '',
    email: '',
    location: '',
    timezone: '',
    availability: {
      available: true,
      label: 'Available for opportunities',
      unavailableLabel: 'Currently heads-down on a project',
    },
    github: '',
    linkedin: '',
    resume: '',
  },
  seo: {
    titleTemplate: '%s — Aswapathy Raj',
    defaultTitle: 'Aswapathy Raj — Full-Stack Developer',
    description: '',
    keywords: [],
    ogImage: '',
    twitterHandle: '',
    canonicalUrl: '',
    robots: 'index, follow',
    pages: {
      home: { title: '', description: '' },
      projects: { title: '', description: '' },
      projectDetail: { title: '', description: '' },
      about: { title: '', description: '' },
    },
  },
  contact: { provider: 'none', endpoint: '', web3formsAccessKey: '', fromName: '' },
  appearance: { theme: 'dark', customCursor: true, animations: true, githubActivity: true, progressBar: true },
  features: { maintenanceMode: false },
  about: {
    name: '',
    headline: '',
    paragraphs: [],
    focusAreas: [],
    lifecycleStages: [],
    profileImage: '',
  },
}

export async function getSettings() {
  const rows = await prisma.setting.findMany()
  const stored = Object.fromEntries(rows.map((row) => [row.key, jparse(row.value, {})]))
  return {
    site: { ...DEFAULT_SETTINGS.site, ...(stored.site ?? {}) },
    seo: { ...DEFAULT_SETTINGS.seo, ...(stored.seo ?? {}) },
    contact: { ...DEFAULT_SETTINGS.contact, ...(stored.contact ?? {}) },
    appearance: { ...DEFAULT_SETTINGS.appearance, ...(stored.appearance ?? {}) },
    features: { ...DEFAULT_SETTINGS.features, ...(stored.features ?? {}) },
    about: { ...DEFAULT_SETTINGS.about, ...(stored.about ?? {}) },
  }
}

async function setSetting(key, value) {
  await prisma.setting.upsert({
    where: { key },
    update: { value: j(value) },
    create: { key, value: j(value) },
  })
}

/* ----------------------------------------------------------------- Dashboard */

function series30(events) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const series = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today.getTime() - (29 - i) * day)
    return { date: d.toISOString().slice(0, 10), label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), visitors: 0, projectViews: 0, contacts: 0 }
  })
  const index = Object.fromEntries(series.map((s, i) => [s.date, i]))
  for (const event of events) {
    const dateKey = new Date(event.createdAt).toISOString().slice(0, 10)
    const idx = index[dateKey]
    if (idx === undefined) continue
    if (event.type === 'visit') series[idx].visitors += 1
    if (event.type === 'project_view') series[idx].projectViews += 1
    if (event.type === 'contact') series[idx].contacts += 1
  }
  return series
}

router.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * day)

const [
      projectCount,
      publishedCount,
      skillCount,
      messageUnread,
      messageTotal,
      recentActivity,
      events,
      popularProjects,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'published' } }),
      prisma.skill.count(),
      prisma.message.count({ where: { status: 'unread' } }),
      prisma.message.count(),
      prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { admin: true } }),
      prisma.analyticsEvent.findMany({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.project.findMany({
        where: { status: { not: 'draft' } },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { _count: { select: { versions: true } } },
      }),
    ])

    const views = events.filter((e) => e.type === 'visit').length
    const projectViews = events.filter((e) => e.type === 'project_view').length
    const contacts = events.filter((e) => e.type === 'contact').length
    const demoEvents = events.filter((e) => e.source === 'demo').length

const kpis = {
      projects: projectCount,
      published: publishedCount,
      skills: skillCount,
      messages: messageTotal,
      messageUnread,
      visitors: views,
      contacts,
    }

    // Recent activity merges audit logs with generated "new message" events so
    // the timeline reads naturally even before audit records exist.
    const recent = recentActivity.map((log) => ({
      id: log.id,
      kind: 'admin',
      title: describeAction(log.action),
      entity: log.entityTitle ?? log.entity,
      timestamp: log.createdAt,
      actor: log.admin?.name ?? 'System',
    }))

    const health = await systemHealth()

    ok(res, {
      data: {
        kpis,
        series: series30(events),
        popularProjects: popularProjects.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          status: p.status,
          featured: p.featured,
          versions: p._count.versions,
          updatedAt: p.updatedAt,
          views: events.filter((e) => e.type === 'project_view' && e.projectSlug === p.slug).length,
        })),
        recent,
        health,
        analytics: { demo: demoEvents > 0, hasEvents: events.length > 0 },
      },
    })
  }),
)

function describeAction(action) {
  const map = {
    'admin.login': 'Admin logged in',
    'admin.logout': 'Admin logged out',
    'admin.password_changed': 'Password changed',
    'project.created': 'Project created',
    'project.updated': 'Project updated',
    'project.published': 'Project published',
    'project.deleted': 'Project deleted',
    'project.duplicated': 'Project duplicated',
    'project.restored': 'Version restored',
    'settings.updated': 'Settings updated',
    'settings.seo_updated': 'SEO settings updated',
    'settings.appearance_updated': 'Appearance updated',
    'settings.contact_updated': 'Contact settings updated',
    'github.synced': 'GitHub synchronized',
  }
  return map[action] ?? action
}

async function systemHealth() {
  const checks = {
    portfolio: { status: 'ok', detail: 'Static site serving published content' },
  }

checks.api = { status: 'ok', detail: 'API responding' }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = { status: 'ok', detail: 'Database connected' }
  } catch {
    checks.database = { status: 'down', detail: 'Database unreachable' }
  }

  checks.cloud = {
    status: 'ok',
    detail: config.githubUsername ? `Connected as ${config.githubUsername}` : 'Not connected',
  }
  if (!config.githubUsername) checks.cloud.status = 'disconnected'

  try {
    const dir = path.resolve(config.storageLocalDir)
    fs.mkdirSync(dir, { recursive: true })
    fs.accessSync(dir, fs.constants.W_OK)
    checks.storage = { status: 'ok', detail: 'Local storage writable' }
  } catch {
    checks.storage = { status: 'down', detail: 'Storage not writable' }
  }

  return checks
}

router.get(
  '/system-status',
  asyncHandler(async (_req, res) => {
    ok(res, { data: await systemHealth() })
  }),
)

/* ------------------------------------------------------------- Settings API */

router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    ok(res, { data: await getSettings() })
  }),
)

router.put(
  '/settings',
  asyncHandler(async (req, res) => {
    const body = req.body ?? {}
    const current = await getSettings()
    for (const key of ['site', 'seo', 'contact', 'appearance', 'features', 'about']) {
      if (body[key] !== undefined && typeof body[key] === 'object') {
        const merged = { ...(current[key] ?? {}), ...body[key] }
        await setSetting(key, merged)
      }
    }
    await recordActivity({ req, action: 'settings.updated', entity: 'settings' })
    ok(res, { data: await getSettings() })
  }),
)

/* ------------------------------------------------------------------- SEO */

router.get(
  '/seo',
  asyncHandler(async (_req, res) => {
    const settings = await getSettings()
    ok(res, { data: settings.seo })
  }),
)

router.put(
  '/seo',
  asyncHandler(async (req, res) => {
    const current = await getSettings()
    const merged = { ...current.seo, ...(req.body ?? {}) }
    await setSetting('seo', merged)
    await recordActivity({ req, action: 'settings.seo_updated', entity: 'settings' })
    ok(res, { data: merged })
  }),
)

/* -------------------------------------------------------------- Appearance */

router.get(
  '/appearance',
  asyncHandler(async (_req, res) => {
    const settings = await getSettings()
    ok(res, { data: settings.appearance })
  }),
)

router.put(
  '/appearance',
  asyncHandler(async (req, res) => {
    const current = await getSettings()
    const merged = { ...current.appearance, ...(req.body ?? {}) }
    await setSetting('appearance', merged)
    await recordActivity({ req, action: 'settings.appearance_updated', entity: 'settings' })
    ok(res, { data: merged })
  }),
)

/* ------------------------------------------------------------------- About */

router.get(
  '/about',
  asyncHandler(async (_req, res) => {
    const settings = await getSettings()
    ok(res, { data: settings.about })
  }),
)

router.put(
  '/about',
  asyncHandler(async (req, res) => {
    const current = await getSettings()
    const merged = { ...current.about, ...(req.body ?? {}) }
    await setSetting('about', merged)
    await recordActivity({ req, action: 'settings.about_updated', entity: 'settings' })
    ok(res, { data: merged })
  }),
)

/* ------------------------------------------------------------------- Users */

router.get(
  '/users',
  requireRole(ROLES.ADMIN, ROLES.OWNER),
  asyncHandler(async (_req, res) => {
    const users = await prisma.admin.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { sessions: true } } },
    })
    ok(res, {
      data: users.map((user) => ({ ...adminJson(user), sessionCount: user._count.sessions })),
    })
  }),
)

router.post(
  '/users',
  requireRole(ROLES.ADMIN, ROLES.OWNER),
  validate(userCreateSchema),
  asyncHandler(async (req, res) => {
    const existing = await prisma.admin.findUnique({ where: { email: req.body.email } })
    if (existing) throw new ApiError(422, 'EMAIL_TAKEN', 'An admin already exists with that email.')

    const passwordHash = await bcrypt.hash(req.body.password, 12)
    const user = await prisma.admin.create({
      data: { name: req.body.name, email: req.body.email, passwordHash, role: req.body.role },
    })

    await recordActivity({ req, action: 'admin.created', entity: 'admin', entityId: user.id, entityTitle: user.email })
    ok(res, { data: adminJson(user) }, 201)
  }),
)

router.put(
  '/users/:id',
  requireRole(ROLES.ADMIN, ROLES.OWNER),
  validate(userUpdateSchema),
  asyncHandler(async (req, res) => {
    const target = await prisma.admin.findUnique({ where: { id: req.params.id } })
    if (!target) throw new ApiError(404, 'NOT_FOUND', 'Admin not found.')

    const data = { ...req.body }
    delete data.password

    // Only an owner may change roles; an administrator cannot promote someone
    // to owner or alter another owner.
    if (data.role) {
      if (req.auth.role !== ROLES.OWNER) {
        throw new ApiError(403, 'FORBIDDEN', 'Only the owner can change roles.')
      }
      if (data.role === ROLES.OWNER) data.role = ROLES.OWNER
    }

    if (req.auth.role !== ROLES.OWNER && target.role === ROLES.OWNER) {
      throw new ApiError(403, 'FORBIDDEN', 'You cannot modify the owner account.')
    }

    if (req.auth.adminId === target.id && data.role && data.role !== req.auth.role) {
      throw new ApiError(422, 'CANNOT_DEMOTE_SELF', 'You cannot change your own role.')
    }

    const user = await prisma.admin.update({ where: { id: target.id }, data })
    await recordActivity({ req, action: 'admin.updated', entity: 'admin', entityId: user.id, entityTitle: user.email })
    ok(res, { data: adminJson(user) })
  }),
)

router.delete(
  '/users/:id',
  requireOwner,
  asyncHandler(async (req, res) => {
    const target = await prisma.admin.findUnique({ where: { id: req.params.id } })
    if (!target) throw new ApiError(404, 'NOT_FOUND', 'Admin not found.')
    if (target.id === req.auth.adminId) {
      throw new ApiError(422, 'CANNOT_DELETE_SELF', 'You cannot delete your own account.')
    }
    await prisma.admin.delete({ where: { id: target.id } })
    await recordActivity({ req, action: 'admin.deleted', entity: 'admin', entityTitle: target.email })
    ok(res, { message: `"${target.name}" removed.` })
  }),
)

/* ---------------------------------------------------------------- Sessions */

router.get(
  '/sessions',
  asyncHandler(async (req, res) => {
    const sessions = await prisma.session.findMany({
      where: { adminId: req.auth.adminId },
      orderBy: { createdAt: 'desc' },
    })
    const currentRefresh = req.cookies?.pf_rt

    ok(res, {
      data: sessions.map((session) => ({
        id: session.id,
        device: session.device ?? 'Unknown device',
        ip: session.ip,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        revokedAt: session.revokedAt,
        current: currentRefresh
          ? session.tokenHash === hashRefreshToken(currentRefresh)
          : false,
      })),
    })
  }),
)

router.delete(
  '/sessions/:id',
  asyncHandler(async (req, res) => {
    const session = await prisma.session.findFirst({
      where: { id: req.params.id, adminId: req.auth.adminId },
    })
    if (!session) throw new ApiError(404, 'NOT_FOUND', 'Session not found.')

    const currentRefresh = req.cookies?.pf_rt
    if (currentRefresh && session.tokenHash === hashRefreshToken(currentRefresh)) {
      throw new ApiError(422, 'CURRENT_SESSION', 'To sign out this session, use Sign out.')
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    })
    await recordActivity({ req, action: 'session.revoked', entity: 'session' })
    ok(res, { message: 'Session revoked.' })
  }),
)

router.post(
  '/sessions/revoke-all',
  asyncHandler(async (req, res) => {
    // Every session except the one presenting the current cookie.
    const currentRefresh = req.cookies?.pf_rt
    await prisma.session.updateMany({
      where: {
        adminId: req.auth.adminId,
        ...(currentRefresh ? { NOT: { tokenHash: hashRefreshToken(currentRefresh) } } : {}),
      },
      data: { revokedAt: new Date() },
    })
    await recordActivity({ req, action: 'sessions.revoked_all', entity: 'session' })
    ok(res, { message: 'All other sessions were revoked.' })
  }),
)

/* ---------------------------------------------------------------- Activity */

router.get(
  '/activity',
  asyncHandler(async (req, res) => {
    const { page = '1', pageSize = '50', entity } = req.query
    const where = entity && entity !== 'all' ? { entity } : {}
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { id: true, name: true, email: true } } },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Math.min(200, Number(pageSize)),
      }),
      prisma.activityLog.count({ where }),
    ])

    ok(res, {
      data: logs.map((log) => ({
        id: log.id,
        action: log.action,
        actionLabel: describeAction(log.action),
        entity: log.entity,
        entityId: log.entityId,
        entityTitle: log.entityTitle,
        meta: log.meta,
        ip: log.ip,
        createdAt: log.createdAt,
        admin: log.admin
          ? { id: log.admin.id, name: log.admin.name, email: log.admin.email }
          : null,
      })),
      total,
      page: Number(page),
    })
  }),
)

export default router
