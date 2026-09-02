import { Router } from 'express'
import { prisma } from '../../lib/prisma.js'
import { asyncHandler, ApiError, ok } from '../../lib/errors.js'
import { validate } from '../../middleware/validate.js'
import { versionNoteSchema, projectSchema } from '../../schemas.js'
import { projectJson } from '../../services/serialize.js'
import { j, jparse } from '../../lib/json.js'

const router = Router()

/**
 * Maps an admin project payload to the writeable Project columns Prisma accepts.
 * The admin client echoes the full serialized project back, including read-only
 * derived fields (technologyCount, versionCount, featuredImage, id, timestamps,
 * screenshots). Spreading body directly would leak those into `data` and make
 * Prisma reject the write, so we pick only the storeable scalars.
 */
const STORABLE_FIELDS = [
  'slug',
  'title',
  'subtitle',
  'category',
  'year',
  'status',
  'featured',
  'accent',
  'image',
  'summary',
  'description',
  'problem',
  'solution',
  'features',
  'architecture',
  'database',
  'auth',
  'challenges',
  'learnings',
  'outcome',
  'caseSections',
  'github',
  'liveDemo',
  'seo',
  'publishedAt',
]

/** Serializes the JSON-backed case-study columns before Prisma writes them. */
function toStorable(body) {
  const out = {}
  for (const field of STORABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) out[field] = body[field]
  }
  out.features = j(out.features ?? [])
  out.architecture = j(out.architecture ?? null)
  out.database = j(out.database ?? null)
  out.auth = j(out.auth ?? [])
  out.challenges = j(out.challenges ?? [])
  out.learnings = j(out.learnings ?? [])
  out.outcome = j(out.outcome ?? [])
  out.caseSections = j(out.caseSections ?? [])
  out.seo = j(out.seo ?? {})
  return out
}

/** Tiny helper to load a project and deny access when it does not exist. */
async function loadProject(id) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      technologies: { include: { skill: true } },
      screenshots: true,
      _count: { select: { versions: true } },
    },
  })
  if (!project) throw new ApiError(404, 'NOT_FOUND', 'Project not found.')
  return project
}

const includeProject = {
  technologies: { include: { skill: true }, orderBy: { sortOrder: 'asc' } },
  screenshots: { orderBy: { sortOrder: 'asc' } },
  _count: { select: { versions: true } },
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, status, featured, page = '1', pageSize = '50' } = req.query

    const where = {
      ...(q
        ? { OR: [{ title: { contains: q } }, { slug: { contains: q } }, { summary: { contains: q } }] }
        : {}),
      ...(status && status !== 'all' ? { status } : {}),
      ...(featured === 'true' ? { featured: true } : {}),
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: includeProject,
        orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
        skip: (Math.max(1, Number(page)) - 1) * Number(pageSize),
        take: Math.min(200, Number(pageSize)),
      }),
      prisma.project.count({ where }),
    ])

    ok(res, {
      data: projects.map((p) => projectJson(p, { includeCaseStudy: false })),
      total,
      page: Number(page),
    })
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const project = await loadProject(req.params.id)
    ok(res, { data: projectJson(project) })
  }),
)

router.post(
  '/',
  validate(projectSchema),
  asyncHandler(async (req, res) => {
    const body = req.body

    const existing = await prisma.project.findUnique({ where: { slug: body.slug } })
    if (existing) {
      throw new ApiError(422, 'SLUG_TAKEN', 'A project already uses that slug.', { slug: body.slug })
    }

    const project = await prisma.project.create({
      data: {
        ...toStorable(body),
        technologies: body.technologies?.length
          ? {
              create: body.technologies.map((skillId, index) => ({ skillId, sortOrder: index })),
            }
          : undefined,
      },
      include: includeProject,
    })

    await prisma.projectVersion.create({
      data: {
        projectId: project.id,
        version: 1,
        note: 'Initial draft',
        status: project.status,
        payload: j(projectJson(project)),
        createdById: req.auth.adminId,
      },
    })

    ok(res, { data: projectJson(project) }, 201)
  }),
)

router.put(
  '/:id',
  validate(projectSchema.partial().passthrough()),
  asyncHandler(async (req, res) => {
    const body = req.body
    const current = await loadProject(req.params.id)

    if (body.slug && body.slug !== current.slug) {
      const existing = await prisma.project.findUnique({ where: { slug: body.slug } })
      if (existing) throw new ApiError(422, 'SLUG_TAKEN', 'A project already uses that slug.')
    }

    const project = await prisma.project.update({
      where: { id: current.id },
      data: {
        ...toStorable(body),
        technologies: body.technologies
          ? {
              deleteMany: {},
              create: body.technologies.map((skillId, index) => ({ skillId, sortOrder: index })),
            }
          : undefined,
      },
      include: includeProject,
    })

    const snapshot = projectJson(project)

    // Persist a version on every save so content can always be recovered.
    const lastVersion = await prisma.projectVersion.findFirst({
      where: { projectId: project.id },
      orderBy: { version: 'desc' },
    })

    await prisma.projectVersion.create({
      data: {
        projectId: project.id,
        version: (lastVersion?.version ?? 0) + 1,
        note: body._versionNote ?? null,
        status: project.status,
        payload: j(snapshot),
        createdById: req.auth.adminId,
      },
    })

    ok(res, { data: snapshot })
  }),
)

router.post(
  '/:id/publish',
  asyncHandler(async (req, res) => {
    const project = await loadProject(req.params.id)

    if (!project.title || !project.slug) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'A published project needs a title and slug.', {
        title: project.title ? undefined : 'required',
        slug: project.slug ? undefined : 'required',
      })
    }

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { status: 'published', publishedAt: project.status === 'published' ? project.publishedAt : new Date() },
      include: includeProject,
    })

    ok(res, { data: projectJson(updated), message: 'Project published.' })
  }),
)

router.post(
  '/:id/duplicate',
  asyncHandler(async (req, res) => {
    const source = await loadProject(req.params.id)
    const slug = `${source.slug}-copy`

    // Ensure a unique slug even across repeated duplications.
    let candidate = slug
    let counter = 1
    while (await prisma.project.findUnique({ where: { slug: candidate } })) {
      candidate = `${slug}-${++counter}`
    }

    const project = await prisma.project.create({
      data: {
        title: `${source.title} (Copy)`,
        slug: candidate,
        subtitle: source.subtitle,
        category: source.category,
        year: source.year,
        status: 'draft',
        featured: false,
        accent: source.accent,
        image: source.image,
        summary: source.summary,
        description: source.description,
        problem: source.problem,
        solution: source.solution,
        features: source.features,
        architecture: source.architecture,
        database: source.database,
        auth: source.auth,
        challenges: source.challenges,
        learnings: source.learnings,
        outcome: source.outcome,
        caseSections: source.caseSections,
        github: source.github,
        liveDemo: source.liveDemo,
        seo: source.seo,
        technologies: {
          create: (source.technologies ?? []).map((t, index) => ({
            skillId: typeof t === 'string' ? t : t.skillId,
            sortOrder: index,
          })),
        },
      },
      include: includeProject,
    })

    await prisma.projectVersion.create({
      data: {
        projectId: project.id,
        version: 1,
        note: 'Duplicated from a published project',
        status: 'draft',
        payload: j(projectJson(project)),
        createdById: req.auth.adminId,
      },
    })

    ok(res, { data: projectJson(project) }, 201)
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const project = await loadProject(req.params.id)
    await prisma.project.delete({ where: { id: project.id } })
    ok(res, { message: `"${project.title}" deleted.` })
  }),
)

// ---- Version history -------------------------------------------------------

router.get(
  '/:id/versions',
  asyncHandler(async (req, res) => {
    const versions = await prisma.projectVersion.findMany({
      where: { projectId: req.params.id },
      orderBy: { version: 'desc' },
    })
    ok(res, {
      data: versions.map((v) => ({
        id: v.id,
        version: v.version,
        note: v.note,
        status: v.status,
        createdAt: v.createdAt,
      })),
    })
  }),
)

router.get(
  '/:id/versions/:versionId',
  asyncHandler(async (req, res) => {
    const version = await prisma.projectVersion.findFirst({
      where: { id: req.params.versionId, projectId: req.params.id },
    })
    if (!version) throw new ApiError(404, 'NOT_FOUND', 'Version not found.')
    ok(res, { data: { ...version, payload: jparse(version.payload, null) } })
  }),
)

router.post(
  '/:id/versions/:versionId/restore',
  asyncHandler(async (req, res) => {
    const version = await prisma.projectVersion.findFirst({
      where: { id: req.params.versionId, projectId: req.params.id },
    })
    if (!version) throw new ApiError(404, 'NOT_FOUND', 'Version not found.')

    const payload = jparse(version.payload, {}) ?? {}
    const restored = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        slug: payload.slug,
        title: payload.title ?? 'Untitled',
        subtitle: payload.subtitle ?? null,
        category: payload.category ?? null,
        year: payload.year ?? null,
        accent: payload.accent ?? null,
        image: payload.image ?? null,
        summary: payload.summary ?? null,
        description: payload.description ?? null,
        problem: payload.problem ?? null,
        solution: payload.solution ?? null,
        features: j(payload.features ?? []),
        architecture: j(payload.architecture ?? null),
        database: j(payload.database ?? null),
        auth: j(payload.auth ?? []),
        challenges: j(payload.challenges ?? []),
        learnings: j(payload.learnings ?? []),
        outcome: j(payload.outcome ?? []),
        caseSections: j(payload.caseSections ?? []),
        github: payload.github ?? null,
        liveDemo: payload.liveDemo ?? null,
        seo: j(payload.seo ?? {}),
        technologies: {
          deleteMany: {},
          create: (payload.technologies ?? []).map((skillId, index) => ({ skillId, sortOrder: index })),
        },
      },
      include: includeProject,
    })

    const snapshot = projectJson(restored)
    const next = await prisma.projectVersion.findFirst({
      where: { projectId: restored.id },
      orderBy: { version: 'desc' },
    })
    await prisma.projectVersion.create({
      data: {
        projectId: restored.id,
        version: (next?.version ?? 0) + 1,
        note: `Restored from v${version.version}`,
        status: restored.status,
        payload: j(snapshot),
        createdById: req.auth.adminId,
      },
    })

    ok(res, { data: snapshot, message: `Restored v${version.version}.` })
  }),
)

export default router