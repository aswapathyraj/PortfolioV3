import { jparse } from '../lib/json.js'

/** Shared response shapes so admin, public, and version snapshots never diverge. */

export const adminJson = (admin) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  avatarUrl: admin.avatarUrl,
  lastLoginAt: admin.lastLoginAt,
  createdAt: admin.createdAt,
})

export const projectJson = (project, { includeCaseStudy = true } = {}) => {
  const base = {
    id: project.id,
    slug: project.slug,
    title: project.title,
    subtitle: project.subtitle ?? '',
    category: project.category ?? '',
    year: project.year ?? '',
    status: project.status,
    featured: project.featured,
    accent: project.accent ?? '',
    image: project.image ?? '',
    github: project.github ?? '',
    liveDemo: project.liveDemo ?? '',
    summary: project.summary ?? '',
    technologies: (project.technologies ?? []).map((t) => (typeof t === 'string' ? t : t.skillId).trim()),
    technologyCount: project.technologies?.length ?? 0,
    screenshots: (project.screenshots ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((shot) => ({ id: shot.id, url: shot.url, caption: shot.caption ?? '', alt: shot.alt ?? '', isFeatured: shot.isFeatured })),
    featuredImage: (project.screenshots ?? []).find((shot) => shot.isFeatured)?.url ?? project.image ?? '',
    publishedAt: project.publishedAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    versionCount: project._count?.versions ?? undefined,
  }

  if (!includeCaseStudy) return base

  return {
    ...base,
    description: project.description ?? '',
    problem: project.problem ?? '',
    solution: project.solution ?? '',
    features: jparse(project.features, []),
    architecture: jparse(project.architecture, null),
    database: jparse(project.database, null),
    auth: jparse(project.auth, []),
    challenges: jparse(project.challenges, []),
    learnings: jparse(project.learnings, []),
    outcome: jparse(project.outcome, []),
    caseSections: jparse(project.caseSections, []),
    seo: jparse(project.seo, {}),
  }
}

/** Full snapshot stored in a ProjectVersion, including skill ids. */
export const snapshotProject = (project) => {
  const json = projectJson(project)
  return {
    ...json,
    technologies: (project.technologies ?? []).map((t) => (typeof t === 'string' ? t : t.skillId)),
  }
}