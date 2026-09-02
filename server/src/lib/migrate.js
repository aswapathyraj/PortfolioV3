import { projects as staticProjects } from '../../../src/data/projects.js'
import { skillCategories } from '../../../src/data/skills.js'
import { experience as staticExperience } from '../../../src/data/experience.js'
import { securityControls } from '../../../src/data/security.js'
import { engineeringSteps } from '../../../src/data/engineering.js'
import { apiEndpoints, apiMeta } from '../../../src/data/api.js'
import { aboutIntro, focusAreas, lifecycleStages } from '../../../src/data/about.js'
import { siteConfig } from '../../../src/config.js'
import { j } from './json.js'

/**
 * Migrates the static portfolio data files into the database.
 *
 * Idempotent: every write is an upsert keyed on the natural slug/id, so the
 * script can be re-run safely. Settings are only written when a key is missing,
 * so values edited later in the CMS are never clobbered by a re-run.
 *
 *   npm run migrate:portfolio   (from server/)
 */

const mapProjectStatus = (status) =>
  status === 'shipped' ? 'published' : status === 'placeholder' ? 'draft' : status

export async function migratePortfolio(prisma) {
  const counts = { projects: 0, skills: 0, experience: 0, security: 0, engineering: 0, api: 0 }

  /* ---- Skills (migrate first so projects can reference them) ---- */
  let skillOrder = 0
  for (const category of skillCategories) {
    for (const skill of category.skills) {
      await prisma.skill.upsert({
        where: { id: skill.id },
        update: {
          name: skill.name,
          category: category.id,
          icon: skill.icon ?? null,
          description: skill.description ?? null,
          sortOrder: skillOrder++,
        },
        create: {
          id: skill.id,
          name: skill.name,
          category: category.id,
          icon: skill.icon ?? null,
          description: skill.description ?? null,
          featured: false,
          sortOrder: skillOrder++,
        },
      })
      counts.skills += 1
    }
  }

  /* ---- Projects ---- */
  for (const project of staticProjects) {
    if (project.status === 'placeholder') continue

    const technologies = (project.technologies ?? []).filter(Boolean)

    const saved = await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        title: project.title,
        subtitle: project.subtitle ?? null,
        category: project.category ?? null,
        year: project.year ?? null,
        status: mapProjectStatus(project.status),
        featured: Boolean(project.featured),
        accent: project.accent ?? null,
        image: project.image ?? null,
        summary: project.summary ?? null,
        description: project.description ?? null,
        problem: project.problem ?? null,
        solution: project.solution ?? null,
        features: j(project.features ?? []),
        architecture: j(project.architecture ?? null),
        database: j(project.database ?? null),
        auth: j(project.auth ?? []),
        challenges: j(project.challenges ?? []),
        learnings: j(project.learnings ?? []),
        outcome: j(project.outcome ?? []),
        github: project.github ?? null,
        liveDemo: project.liveDemo ?? null,
        publishedAt: project.status === 'shipped' ? new Date() : undefined,
      },
      create: {
        slug: project.slug,
        title: project.title,
        subtitle: project.subtitle ?? null,
        category: project.category ?? null,
        year: project.year ?? null,
        status: mapProjectStatus(project.status),
        featured: Boolean(project.featured),
        accent: project.accent ?? null,
        image: project.image ?? null,
        summary: project.summary ?? null,
        description: project.description ?? null,
        problem: project.problem ?? null,
        solution: project.solution ?? null,
        features: j(project.features ?? []),
        architecture: j(project.architecture ?? null),
        database: j(project.database ?? null),
        auth: j(project.auth ?? []),
        challenges: j(project.challenges ?? []),
        learnings: j(project.learnings ?? []),
        outcome: j(project.outcome ?? []),
        github: project.github ?? null,
        liveDemo: project.liveDemo ?? null,
        publishedAt: project.status === 'shipped' ? new Date() : null,
      },
    })

    // Re-link technologies against the real Project row id.
    await prisma.projectSkill.deleteMany({ where: { projectId: saved.id } })
    for (let index = 0; index < technologies.length; index += 1) {
      const skillId = technologies[index]
      const skillExists = await prisma.skill.findUnique({ where: { id: skillId } })
      if (!skillExists) continue
      await prisma.projectSkill.upsert({
        where: {
          projectId_skillId: { projectId: saved.id, skillId },
        },
        update: { sortOrder: index },
        create: { projectId: saved.id, skillId, sortOrder: index },
      })
    }
    counts.projects += 1
  }

  /* ---- Experience ---- */
  for (let index = 0; index < staticExperience.length; index += 1) {
    const item = staticExperience[index]
    await prisma.experience.upsert({
      where: { id: item.id },
      update: {
        role: item.role,
        org: item.org,
        startDate: item.period,
        endDate: item.current ? null : item.period,
        current: Boolean(item.current),
        icon: item.icon ?? null,
        summary: item.summary ?? null,
        highlights: j(item.highlights ?? []),
        stack: j(item.stack ?? []),
        projects: j(item.projects ?? []),
        visible: true,
        sortOrder: index,
      },
      create: {
        id: item.id,
        role: item.role,
        org: item.org,
        startDate: item.period,
        endDate: item.current ? null : item.period,
        current: Boolean(item.current),
        icon: item.icon ?? null,
        summary: item.summary ?? null,
        highlights: j(item.highlights ?? []),
        stack: j(item.stack ?? []),
        projects: j(item.projects ?? []),
        visible: true,
        sortOrder: index,
      },
    })
    counts.experience += 1
  }

  /* ---- Security ---- */
  for (let index = 0; index < securityControls.length; index += 1) {
    const item = securityControls[index]
    await prisma.securityItem.upsert({
      where: { id: item.id },
      update: {
        label: item.label,
        value: item.value ?? null,
        icon: item.icon ?? null,
        level: item.level,
        summary: item.summary ?? null,
        detail: item.detail ?? null,
        projects: j(item.projects ?? []),
        visible: true,
        sortOrder: index,
      },
      create: {
        id: item.id,
        label: item.label,
        value: item.value ?? null,
        icon: item.icon ?? null,
        level: item.level,
        summary: item.summary ?? null,
        detail: item.detail ?? null,
        projects: j(item.projects ?? []),
        visible: true,
        sortOrder: index,
      },
    })
    counts.security += 1
  }

  /* ---- Engineering ---- */
  for (let index = 0; index < engineeringSteps.length; index += 1) {
    const item = engineeringSteps[index]
    await prisma.engineeringItem.upsert({
      where: { id: item.id },
      update: {
        number: item.number ?? null,
        title: item.title,
        icon: item.icon ?? null,
        what: item.what ?? null,
        tech: j(item.tech ?? []),
        why: item.why ?? null,
        example: j(item.example ?? null),
        visible: true,
        sortOrder: index,
      },
      create: {
        id: item.id,
        number: item.number ?? null,
        title: item.title,
        icon: item.icon ?? null,
        what: item.what ?? null,
        tech: j(item.tech ?? []),
        why: item.why ?? null,
        example: j(item.example ?? null),
        visible: true,
        sortOrder: index,
      },
    })
    counts.engineering += 1
  }

  /* ---- API documentation ---- */
  for (let index = 0; index < apiEndpoints.length; index += 1) {
    const item = apiEndpoints[index]
    await prisma.apiEndpoint.upsert({
      where: { id: item.id },
      update: {
        method: item.method,
        path: item.path,
        summary: item.summary,
        description: item.description ?? null,
        auth: Boolean(item.auth),
        query: j(item.query ?? []),
        params: j(item.params ?? []),
        body: j(item.body ?? null),
        sampleBody: j(item.sampleBody ?? null),
        sampleParams: j(item.sampleParams ?? null),
        statuses: j(item.statuses ?? []),
        visible: true,
        sortOrder: index,
      },
      create: {
        id: item.id,
        method: item.method,
        path: item.path,
        summary: item.summary,
        description: item.description ?? null,
        auth: Boolean(item.auth),
        query: j(item.query ?? []),
        params: j(item.params ?? []),
        body: j(item.body ?? null),
        sampleBody: j(item.sampleBody ?? null),
        sampleParams: j(item.sampleParams ?? null),
        statuses: j(item.statuses ?? []),
        visible: true,
        sortOrder: index,
      },
    })
    counts.api += 1
  }

  /* ---- Settings (only when absent, so CMS edits survive re-runs) ---- */

  const existing = await prisma.setting.findMany()
  const present = new Set(existing.map((row) => row.key))

  const siteSettings = {
    name: siteConfig.name,
    initials: siteConfig.initials,
    title: siteConfig.title,
    headline: siteConfig.headline,
    siteUrl: siteConfig.siteUrl,
    email: siteConfig.email,
    location: siteConfig.location,
    timezone: siteConfig.timezone,
    availability: siteConfig.availability,
    github: siteConfig.github,
    linkedin: siteConfig.linkedin,
    resume: siteConfig.resume,
  }

  const seoSettings = {
    titleTemplate: siteConfig.seo.titleTemplate,
    defaultTitle: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.description,
    keywords: siteConfig.seo.keywords,
    ogImage: siteConfig.seo.ogImage,
    twitterHandle: siteConfig.seo.twitterHandle,
    canonicalUrl: siteConfig.siteUrl,
    robots: 'index, follow',
    pages: {
      home: { title: '', description: '' },
      projects: { title: '', description: '' },
      projectDetail: { title: '', description: '' },
      about: { title: '', description: '' },
    },
  }

  const contactSettings = {
    provider: siteConfig.contactForm.provider,
    endpoint: siteConfig.contactForm.endpoint ?? '',
    web3formsAccessKey: '',
    fromName: 'Portfolio Contact Form',
  }

  const appearanceSettings = {
    theme: 'dark',
    customCursor: Boolean(siteConfig.features.customCursor),
    animations: true,
    githubActivity: Boolean(siteConfig.features.githubActivity),
    progressBar: Boolean(siteConfig.features.scrollProgressBar),
  }

  const aboutSettings = {
    name: siteConfig.name,
    headline: siteConfig.headline,
    paragraphs: aboutIntro,
    focusAreas,
    lifecycleStages,
    profileImage: '',
  }

  const settingsToWrite = [
    ['site', siteSettings],
    ['seo', seoSettings],
    ['contact', contactSettings],
    ['appearance', appearanceSettings],
    ['about', aboutSettings],
    ['features', { maintenanceMode: false }],
  ]

  for (const [key, value] of settingsToWrite) {
    if (present.has(key)) continue
    await prisma.setting.create({ data: { key, value: j(value) } })
  }

  void apiMeta

  return counts
}