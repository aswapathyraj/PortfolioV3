import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

import projectsRoutes from './admin/projects.routes.js'
import contentRoutes from './admin/content.routes.js'
import communicationRoutes from './admin/communication.routes.js'
import systemRoutes from './admin/system.routes.js'
import integrationsRoutes from './admin/integrations.routes.js'
import uploadsRoutes from './admin/uploads.routes.js'

/**
 * Every admin route sits behind authentication. Authorization decisions are
 * made per-path with requireRole/requireOwner *on the server* — the frontend
 * hides actions for UX, never for enforcement.
 */
const router = Router()

router.use(requireAuth)

router.use('/projects', projectsRoutes)
router.use('/', contentRoutes) // skills, experience, security, engineering, api-endpoints
router.use('/', communicationRoutes) // messages, contact, notifications
router.use('/', systemRoutes) // dashboard, settings, seo, appearance, about, users, sessions, activity
router.use('/', integrationsRoutes) // analytics, github
router.use('/uploads', uploadsRoutes)

export default router