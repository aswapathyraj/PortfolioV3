import { prisma } from '../lib/prisma.js'
import { j } from '../lib/json.js'

/**
 * Records an auditable action. Called from route handlers after successful
 * mutations so important changes can always be traced back to an admin.
 */
export async function recordActivity({ req, action, entity, entityId, entityTitle, meta }) {
  try {
    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id ?? null,
        action,
        entity: entity ?? null,
        entityId: entityId ?? null,
        entityTitle: entityTitle ?? null,
        meta: j(meta ?? null),
        ip: req.ip ?? null,
        userAgent: req.headers['user-agent']?.slice(0, 300) ?? null,
      },
    })
  } catch (err) {
    // Logging must never break the action it is recording.
    // eslint-disable-next-line no-console
    console.error('[audit]', err)
  }
}

export async function createNotification(type, title, body) {
  try {
    await prisma.notification.create({ data: { type, title, body: body ?? null } })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[notify]', err)
  }
}