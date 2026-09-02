import { Router } from 'express'
import { prisma } from '../../lib/prisma.js'
import { asyncHandler, ApiError, ok } from '../../lib/errors.js'
import { validate } from '../../middleware/validate.js'
import { j, jparse } from '../../lib/json.js'
import {
  skillSchema,
  experienceSchema,
  securityItemSchema,
  engineeringItemSchema,
  apiEndpointSchema,
  reorderSchema,
} from '../../schemas.js'

const router = Router()

/* ------------------------- JSON-backed field (de)serialisers ------------- */

const experienceStorable = (body) => ({
  ...body,
  highlights: j(body.highlights ?? []),
  stack: j(body.stack ?? []),
  projects: j(body.projects ?? []),
})

const experienceReadable = (item) => ({
  ...item,
  highlights: jparse(item.highlights, []),
  stack: jparse(item.stack, []),
  projects: jparse(item.projects, []),
})

const securityStorable = (body) => ({ ...body, projects: j(body.projects ?? []) })
const securityReadable = (item) => ({ ...item, projects: jparse(item.projects, []) })

const engineStorable = (body) => ({
  ...body,
  tech: j(body.tech ?? []),
  example: j(body.example ?? null),
})
const engineReadable = (item) => ({ ...item, tech: jparse(item.tech, []), example: jparse(item.example, null) })

const endpointStorable = (body) => ({
  ...body,
  query: j(body.query ?? []),
  params: j(body.params ?? []),
  body: j(body.body ?? null),
  sampleBody: j(body.sampleBody ?? null),
  sampleParams: j(body.sampleParams ?? null),
  statuses: j(body.statuses ?? []),
})
const endpointReadable = (item) => ({
  ...item,
  query: jparse(item.query, []),
  params: jparse(item.params, []),
  body: jparse(item.body, null),
  sampleBody: jparse(item.sampleBody, null),
  sampleParams: jparse(item.sampleParams, null),
  statuses: jparse(item.statuses, []),
})

/* ------------------------------------------------------------------ Skills */

router.get(
  '/skills',
  asyncHandler(async (_req, res) => {
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      include: { _count: { select: { projects: true } } },
    })

    const data = skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      icon: skill.icon ?? '',
      description: skill.description ?? '',
      proficiency: skill.proficiency,
      featured: skill.featured,
      sortOrder: skill.sortOrder,
      usedIn: skill._count.projects,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
    }))

    ok(res, { data })
  }),
)

router.post(
  '/skills',
  validate(skillSchema),
  asyncHandler(async (req, res) => {
    const exists = await prisma.skill.findUnique({ where: { id: req.body.id } })
    if (exists) throw new ApiError(422, 'ID_TAKEN', 'A skill with that id already exists.')

    const skill = await prisma.skill.create({ data: req.body })
    const usedIn = await prisma.projectSkill.count({ where: { skillId: skill.id } })
    ok(res, { data: { ...skill, usedIn } }, 201)
  }),
)

router.put(
  '/skills/:id',
  validate(skillSchema.partial()),
  asyncHandler(async (req, res) => {
    const existing = await prisma.skill.findUnique({ where: { id: req.params.id } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Skill not found.')

    const { id, ...rest } = req.body

    if (id && id !== existing.id) {
      const collision = await prisma.skill.findUnique({ where: { id } })
      if (collision) throw new ApiError(422, 'ID_TAKEN', 'A skill with that id already exists.')
      await prisma.$transaction([
        prisma.projectSkill.updateMany({ where: { skillId: existing.id }, data: { skillId: id } }),
        prisma.skill.delete({ where: { id: existing.id } }),
        prisma.skill.create({ data: { ...rest, id } }),
      ])
      const skill = await prisma.skill.findUnique({ where: { id } })
      const usedIn = await prisma.projectSkill.count({ where: { skillId: id } })
      return ok(res, { data: { ...skill, usedIn } })
    }

    const skill = await prisma.skill.update({ where: { id: existing.id }, data: rest })
    const usedIn = await prisma.projectSkill.count({ where: { skillId: skill.id } })
    ok(res, { data: { ...skill, usedIn } })
  }),
)

router.delete(
  '/skills/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.skill.findUnique({ where: { id: req.params.id } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Skill not found.')

    const uses = await prisma.projectSkill.count({ where: { skillId: existing.id } })
    if (uses > 0) {
      throw new ApiError(
        409,
        'SKILL_IN_USE',
        `"${existing.name}" is used by ${uses} project${uses === 1 ? '' : 's'}. Remove it from those projects first.`,
      )
    }

    await prisma.skill.delete({ where: { id: existing.id } })
    ok(res, { message: `"${existing.name}" deleted.` })
  }),
)

router.post(
  '/skills/reorder',
  validate(reorderSchema),
  asyncHandler(async (req, res) => {
    await prisma.$transaction(
      req.body.orderedIds.map((id, index) =>
        prisma.skill.update({ where: { id }, data: { sortOrder: index } }),
      ),
    )
    ok(res, { message: 'Order updated.' })
  }),
)

/* -------------------------------------------------------------- Experience */

router.get(
  '/experience',
  asyncHandler(async (_req, res) => {
    const items = await prisma.experience.findMany({ orderBy: { sortOrder: 'asc' } })
    ok(res, { data: items.map(experienceReadable) })
  }),
)

router.post(
  '/experience',
  validate(experienceSchema),
  asyncHandler(async (req, res) => {
    const max = await prisma.experience.aggregate({ _max: { sortOrder: true } })
    const item = await prisma.experience.create({
      data: { ...experienceStorable(req.body), sortOrder: (max._max.sortOrder ?? 0) + 1 },
    })
    ok(res, { data: experienceReadable(item) }, 201)
  }),
)

router.put(
  '/experience/:id',
  validate(experienceSchema.partial()),
  asyncHandler(async (req, res) => {
    const item = await prisma.experience.update({
      where: { id: req.params.id },
      data: experienceStorable(req.body),
    })
    ok(res, { data: experienceReadable(item) })
  }),
)

router.delete(
  '/experience/:id',
  asyncHandler(async (req, res) => {
    await prisma.experience.delete({ where: { id: req.params.id } })
    ok(res, { message: 'Experience entry deleted.' })
  }),
)

router.post(
  '/experience/reorder',
  validate(reorderSchema),
  asyncHandler(async (req, res) => {
    await prisma.$transaction(
      req.body.orderedIds.map((id, index) =>
        prisma.experience.update({ where: { id }, data: { sortOrder: index } }),
      ),
    )
    ok(res, { message: 'Order updated.' })
  }),
)

/* --------------------------------------------------------------- Security */

router.get(
  '/security',
  asyncHandler(async (_req, res) => {
    const items = await prisma.securityItem.findMany({ orderBy: { sortOrder: 'asc' } })
    ok(res, { data: items.map(securityReadable) })
  }),
)

router.post(
  '/security',
  validate(securityItemSchema),
  asyncHandler(async (req, res) => {
    const max = await prisma.securityItem.aggregate({ _max: { sortOrder: true } })
    const item = await prisma.securityItem.create({
      data: { ...securityStorable(req.body), sortOrder: (max._max.sortOrder ?? 0) + 1 },
    })
    ok(res, { data: securityReadable(item) }, 201)
  }),
)

router.put(
  '/security/:id',
  validate(securityItemSchema.partial()),
  asyncHandler(async (req, res) => {
    const item = await prisma.securityItem.update({
      where: { id: req.params.id },
      data: securityStorable(req.body),
    })
    ok(res, { data: securityReadable(item) })
  }),
)

router.delete(
  '/security/:id',
  asyncHandler(async (req, res) => {
    await prisma.securityItem.delete({ where: { id: req.params.id } })
    ok(res, { message: 'Security item deleted.' })
  }),
)

router.post(
  '/security/reorder',
  validate(reorderSchema),
  asyncHandler(async (req, res) => {
    await prisma.$transaction(
      req.body.orderedIds.map((id, index) =>
        prisma.securityItem.update({ where: { id }, data: { sortOrder: index } }),
      ),
    )
    ok(res, { message: 'Order updated.' })
  }),
)

/* ------------------------------------------------------------ Engineering */

router.get(
  '/engineering',
  asyncHandler(async (_req, res) => {
    const items = await prisma.engineeringItem.findMany({ orderBy: { sortOrder: 'asc' } })
    ok(res, { data: items.map(engineReadable) })
  }),
)

router.post(
  '/engineering',
  validate(engineeringItemSchema),
  asyncHandler(async (req, res) => {
    const max = await prisma.engineeringItem.aggregate({ _max: { sortOrder: true } })
    const item = await prisma.engineeringItem.create({
      data: { ...engineStorable(req.body), sortOrder: (max._max.sortOrder ?? 0) + 1 },
    })
    ok(res, { data: engineReadable(item) }, 201)
  }),
)

router.put(
  '/engineering/:id',
  validate(engineeringItemSchema.partial()),
  asyncHandler(async (req, res) => {
    const item = await prisma.engineeringItem.update({
      where: { id: req.params.id },
      data: engineStorable(req.body),
    })
    ok(res, { data: engineReadable(item) })
  }),
)

router.delete(
  '/engineering/:id',
  asyncHandler(async (req, res) => {
    await prisma.engineeringItem.delete({ where: { id: req.params.id } })
    ok(res, { message: 'Engineering step deleted.' })
  }),
)

router.post(
  '/engineering/reorder',
  validate(reorderSchema),
  asyncHandler(async (req, res) => {
    await prisma.$transaction(
      req.body.orderedIds.map((id, index) =>
        prisma.engineeringItem.update({ where: { id }, data: { sortOrder: index } }),
      ),
    )
    ok(res, { message: 'Order updated.' })
  }),
)

/* -------------------------------------------------------- API documentation */

router.get(
  '/api-endpoints',
  asyncHandler(async (_req, res) => {
    const items = await prisma.apiEndpoint.findMany({ orderBy: { sortOrder: 'asc' } })
    ok(res, { data: items.map(endpointReadable) })
  }),
)

router.post(
  '/api-endpoints',
  validate(apiEndpointSchema),
  asyncHandler(async (req, res) => {
    const max = await prisma.apiEndpoint.aggregate({ _max: { sortOrder: true } })
    const item = await prisma.apiEndpoint.create({
      data: { ...endpointStorable(req.body), sortOrder: (max._max.sortOrder ?? 0) + 1 },
    })
    ok(res, { data: endpointReadable(item) }, 201)
  }),
)

router.put(
  '/api-endpoints/:id',
  validate(apiEndpointSchema.partial()),
  asyncHandler(async (req, res) => {
    const item = await prisma.apiEndpoint.update({
      where: { id: req.params.id },
      data: endpointStorable(req.body),
    })
    ok(res, { data: endpointReadable(item) })
  }),
)

router.delete(
  '/api-endpoints/:id',
  asyncHandler(async (req, res) => {
    await prisma.apiEndpoint.delete({ where: { id: req.params.id } })
    ok(res, { message: 'Endpoint deleted.' })
  }),
)

router.post(
  '/api-endpoints/reorder',
  validate(reorderSchema),
  asyncHandler(async (req, res) => {
    await prisma.$transaction(
      req.body.orderedIds.map((id, index) =>
        prisma.apiEndpoint.update({ where: { id }, data: { sortOrder: index } }),
      ),
    )
    ok(res, { message: 'Order updated.' })
  }),
)

export default router