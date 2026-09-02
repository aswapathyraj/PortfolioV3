import { Router } from 'express'
import { prisma } from '../../lib/prisma.js'
import { asyncHandler, ApiError, ok } from '../../lib/errors.js'
import { validate } from '../../middleware/validate.js'
import { messagePatchSchema, contactSettingsScheme } from '../../schemas.js'
import { j, jparse } from '../../lib/json.js'
import { createNotification } from '../../lib/audit.js'
import { recordActivity } from '../../lib/audit.js'

const router = Router()
const messagesRouter = Router() // mounted at /messages below

/* ---------------------------------------------------------------- Messages */

const listOptions = (query) => {
  const { q, status, page = '1', pageSize = '50' } = query
  return {
    where: {
      ...(status && status !== 'all' ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { subject: { contains: q } },
              { body: { contains: q } },
            ],
          }
        : {}),
    },
    status,
    page: Number(page),
    pageSize: Math.min(200, Number(pageSize)),
  }
}

messagesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { where, page, pageSize } = listOptions(req.query)
    const [data, total, unread] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.message.count({ where }),
      prisma.message.count({ where: { status: 'unread' } }),
    ])
    ok(res, { data, total, unread, page })
  }),
)

messagesRouter.get(
  '/meta',
  asyncHandler(async (_req, res) => {
    const [unread, read, archived, spam, total] = await Promise.all([
      prisma.message.count({ where: { status: 'unread' } }),
      prisma.message.count({ where: { status: 'read' } }),
      prisma.message.count({ where: { status: 'archived' } }),
      prisma.message.count({ where: { status: 'spam' } }),
      prisma.message.count(),
    ])
    ok(res, { data: { unread, read, archived, spam, total } })
  }),
)

messagesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const message = await prisma.message.findUnique({ where: { id: req.params.id } })
    if (!message) throw new ApiError(404, 'NOT_FOUND', 'Message not found.')
    ok(res, { data: message })
  }),
)

messagesRouter.patch(
  '/:id',
  validate(messagePatchSchema),
  asyncHandler(async (req, res) => {
    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: req.body,
    })
    ok(res, { data: message })
  }),
)

messagesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.message.delete({ where: { id: req.params.id } })
    ok(res, { message: 'Message deleted.' })
  }),
)

router.use('/messages', messagesRouter)

/* ------------------------------------------------------- Contact settings */

const validateContactConfig = (value) => {
  const cfg = value ?? {}
  const provider = cfg.provider ?? 'none'

  if (provider === 'none') {
    return {
      ok: true,
      provider,
      status: 'idle',
      note: 'Form validates and offers a mailto fallback. Nothing is delivered automatically.',
    }
  }

  if (provider === 'mailto') {
    return {
      ok: true,
      provider,
      status: 'ready',
      note: 'Submissions open the visitor email client pre-filled.',
    }
  }

  if (provider === 'endpoint') {
    const url = cfg.endpoint
    if (!url) {
      return {
        ok: false,
        provider,
        status: 'incomplete',
        note: 'Configuration incomplete. Endpoint URL is missing — messages cannot currently be delivered.',
      }
    }
    let validUrl = true
    try {
      new URL(url)
    } catch {
      validUrl = false
    }
    return {
      ok: validUrl,
      provider,
      status: validUrl ? 'ready' : 'invalid',
      note: validUrl
        ? 'Messages will be POSTed to the configured endpoint.'
        : 'The configured endpoint URL is not a valid URL.',
    }
  }

  if (provider === 'web3forms') {
    const key = cfg.web3formsAccessKey
    if (!key) {
      return {
        ok: false,
        provider,
        status: 'incomplete',
        note: 'Configuration incomplete. Web3Forms access key is missing — messages cannot currently be delivered.',
      }
    }
    return {
      ok: true,
      provider,
      status: 'ready',
      note: 'Messages will be sent through Web3Forms to the inbox that owns this access key.',
    }
  }

  return { ok: false, provider, status: 'unknown', note: 'Unknown provider.' }
}

router.get(
  '/contact',
  asyncHandler(async (_req, res) => {
    const setting = await prisma.setting.findUnique({ where: { key: 'contact' } })
    const value = jparse(setting?.value, null) ?? { provider: 'none', endpoint: '', web3formsAccessKey: '', fromName: '' }
    const diagnostics = validateContactConfig(value)
    ok(res, { data: value, diagnostics })
  }),
)

router.put(
  '/contact',
  validate(contactSettingsScheme),
  asyncHandler(async (req, res) => {
    const value = req.body
    await prisma.setting.upsert({
      where: { key: 'contact' },
      update: { value: j(value) },
      create: { key: 'contact', value: j(value) },
    })
    const diagnostics = validateContactConfig(value)
    await recordActivity({ req, action: 'settings.contact_updated', entity: 'settings' })
    ok(res, { data: value, diagnostics })
  }),
)

/* ---------------------------------------------------------- Notifications */

router.get(
  '/notifications',
  asyncHandler(async (_req, res) => {
    const items = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
    const unread = items.filter((n) => !n.read).length
    ok(res, { data: items, unread })
  }),
)

router.post(
  '/notifications/read',
  asyncHandler(async (req, res) => {
    const ids = req.body?.ids ?? []
    if (ids.length === 0) {
      await prisma.notification.updateMany({ data: { read: true } })
    } else {
      await prisma.notification.updateMany({ where: { id: { in: ids } }, data: { read: true } })
    }
    ok(res, { message: 'Notifications marked as read.' })
  }),
)

router.delete(
  '/notifications',
  asyncHandler(async (_req, res) => {
    await prisma.notification.deleteMany({})
    ok(res, { message: 'Notifications cleared.' })
  }),
)

export default router