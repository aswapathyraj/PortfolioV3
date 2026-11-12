/**
 * Public data hydration layer.
 *
 * Every section that renders CMS-managed content reads through this module
 * instead of importing src/data/* directly. The module starts seeded with the
 * static data files (so a static build and the first paint always render), then
 * `hydratePublicData()` swaps in whatever the live /api/public/* backend
 * returns and notifies subscribers so the mounted sections can re-read and
 * re-render.
 *
 * Static files that have no backend counterpart (education, security level
 * legend, api meta/tones, category labels) are intentionally kept as the
 * (decorative) fallback and are merged _around_ API content.
 */

import { publicApi } from './publicApi.js'
import { siteConfig } from '../config.js'

// ---- Static baseline ------------------------------------------------
import * as staticProjects from '../data/projects.js'
import * as staticSkills from '../data/skills.js'
import * as staticExperience from '../data/experience.js'
import * as staticSecurity from '../data/security.js'
import * as staticEngineering from '../data/engineering.js'
import * as staticApi from '../data/api.js'

// ---- Mutable live snapshots (seeded with the static data) ----------
let projects = staticProjects.projects
let skillCategories = staticSkills.skillCategories
let allSkills = staticSkills.allSkills
let experience = staticExperience.experience
let securityControls = staticSecurity.securityControls
let engineeringSteps = staticEngineering.engineeringSteps
let apiEndpoints = staticApi.apiEndpoints
let siteProfile = null
let siteSeo = null

// Metadata that never comes from the API.
const education = staticExperience.education
const experienceNote = staticExperience.experienceNote
const securityLevels = staticSecurity.securityLevels
const securityNote = staticSecurity.securityNote
const apiMeta = staticApi.apiMeta
const methodTones = staticApi.methodTones

// ---- Subscription (version bump → components re-read) --------------
let version = 0
const listeners = new Set()

function bump() {
  version += 1
  listeners.forEach((l) => l(version))
}

/** Forces a re-render of any consumer when the live data changes. */
export const subscribePublicData = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const getPublicDataVersion = () => version

// ---- Derived project helpers ---------------------------------------
/**
 * Publishes only what the live site treats as a real project. The backend has
 * no "placeholder" concept, so every published project counts.
 */
const realProjects = () => projects.filter((p) => p.status !== 'placeholder')

const featuredProjects = () => projects.filter((p) => p.featured)

export const getProjectBySlug = (slug) => projects.find((p) => p.slug === slug)

export const projectsUsingSkill = (skillId) =>
  realProjects().filter((p) => p.technologies.includes(skillId))

export const getSkillById = (id) => allSkills.find((skill) => skill.id === id)

export const resolveSkillNames = (ids = []) => ids.map((id) => getSkillById(id)?.name ?? id)

// ---- Accessors (functions so ESM bindings stay live) ---------------
export function getProjects() {
  return projects
}
export function getSkillCategories() {
  return skillCategories
}
export function getAllSkills() {
  return allSkills
}
export function getSkillCount() {
  return allSkills.length
}
export function getExperience() {
  return experience
}
export function getSecurityControls() {
  return securityControls
}
export function getEngineeringSteps() {
  return engineeringSteps
}
export function getApiEndpoints() {
  return apiEndpoints
}
export function getEducation() {
  return education
}
export function getExperienceNote() {
  return experienceNote
}
export function getSecurityLevels() {
  return securityLevels
}
export function getSecurityNote() {
  return securityNote
}
export function getApiMeta() {
  return apiMeta
}
export function getMethodTones() {
  return methodTones
}
export function getSiteProfile() {
  return siteProfile
}
export function getSiteSeo() {
  return siteSeo
}
/**
 * Builds the effective feature flags from the CMS appearance settings over the
 * static defaults. The admin stores appearance keys (customCursor, animations,
 * githubActivity, progressBar); the static config uses scrollProgressBar and has
 * no animations flag, so we map them so components can read a single source.
 */
function effectiveFeatures(appearance) {
  if (!appearance) return siteConfig.features
  return {
    ...siteConfig.features,
    customCursor: appearance.customCursor ?? siteConfig.features.customCursor,
    githubActivity: appearance.githubActivity ?? siteConfig.features.githubActivity,
    scrollProgressBar: appearance.progressBar ?? siteConfig.features.scrollProgressBar,
  }
}

/**
 * Effective site identity: the static config by default, overlaid with whatever
 * fields the live profile API carries (name, title, headline, availability,
 * location, timezone, links, appearance). Never mutates the static config.
 *
 * The CMS appearance object is folded into `features` so the same flag the
 * components read (customCursor / githubActivity / scrollProgressBar) reflects
 * admin edits, and is exposed verbatim as `appearance` with its `theme`.
 */
export function getSite() {
  const appearance = siteProfile?.appearance
  return {
    ...siteConfig,
    ...(siteProfile ?? {}),
    appearance,
    features: effectiveFeatures(appearance),
  }
}
export function getFeaturedProjects() {
  return featuredProjects()
}
export function getRealProjects() {
  return realProjects()
}

// ---- Hydration ------------------------------------------------------
/**
 * Fetches every CMS-managed collection from the public API and merges it into
 * the live snapshots, preserving static metadata the API does not carry.
 * Never throws: on any failure it leaves the existing (static) data in place.
 *
 * The happy path is a single /bootstrap request. If that fails — older
 * backend, partial outage — it falls back to the individual endpoints so a
 * degraded API still updates what it can.
 */
export async function hydratePublicData() {
  let payload = null
  try {
    payload = await publicApi.bootstrap()
  } catch {
    payload = null
  }

  if (payload) {
    return applyLiveData({
      projects: payload.projects,
      skills: payload.skills,
      experience: payload.experience,
      security: payload.security,
      engineering: payload.engineering,
      apiDocs: payload.apiDocs,
      profile: payload.profile,
      seo: payload.seo,
    })
  }

  let skills, projectsData, experienceData, securityData, engineeringData, apiData, profile, seo
  try {
    ;[skills, projectsData, experienceData, securityData, engineeringData, apiData, profile, seo] =
      await Promise.allSettled([
        publicApi.skills(),
        publicApi.projects(),
        publicApi.experience(),
        publicApi.security(),
        publicApi.engineering(),
        publicApi.apiDocs(),
        publicApi.profile(),
        publicApi.seo(),
      ])
  } catch {
    return false
  }

  return applyLiveData({
    projects: projectsData.status === 'fulfilled' ? projectsData.value : undefined,
    skills: skills.status === 'fulfilled' ? skills.value : undefined,
    experience: experienceData.status === 'fulfilled' ? experienceData.value : undefined,
    security: securityData.status === 'fulfilled' ? securityData.value : undefined,
    engineering: engineeringData.status === 'fulfilled' ? engineeringData.value : undefined,
    apiDocs: apiData.status === 'fulfilled' ? apiData.value : undefined,
    profile: profile.status === 'fulfilled' ? profile.value : undefined,
    seo: seo.status === 'fulfilled' ? seo.value : undefined,
  })
}

/** Merges a set of live collections into the snapshots. */
function applyLiveData(live) {
  const {
    projects: projectsData,
    skills: skillsData,
    experience: experienceData,
    security: securityData,
    engineering: engineeringData,
    apiDocs: apiDocsData,
    profile: profileData,
    seo: seoData,
  } = live

  let changed = false

  if (Array.isArray(projectsData)) {
    projects = projectsData
    changed = true
  }

  if (Array.isArray(skillsData)) {
    skillCategories = rebuildSkillCategories(skillsData)
    changed = true
  }

  if (Array.isArray(experienceData)) {
    experience = experienceData.map(normalizeExperience)
    changed = true
  }

  if (Array.isArray(securityData)) {
    securityControls = securityData
    changed = true
  }

  if (Array.isArray(engineeringData)) {
    engineeringSteps = engineeringData
    changed = true
  }

  if (Array.isArray(apiDocsData)) {
    apiEndpoints = apiDocsData
    changed = true
  }

  if (profileData) {
    siteProfile = profileData
    changed = true
  }

  if (seoData) {
    siteSeo = seoData
    changed = true
  }

  // Rebuild the derived skill→project cross-references now that both sides are live.
  if (Array.isArray(projectsData) && Array.isArray(skillsData)) {
    allSkills = rebuildAllSkills(skillCategories)
    changed = true
  }

  if (changed) bump()
  return changed
}

/** Scores an experience row from the API into the shape the section expects. */
function normalizeExperience(item) {
  const start = item.startDate?.trim()
  const end = item.endDate?.trim()
  const period = start || end ? [start, end].filter(Boolean).join(' — ') : item.period ?? ''
  return {
    id: item.id,
    role: item.role,
    org: item.org,
    period,
    current: Boolean(item.current),
    icon: item.icon ?? '',
    summary: item.summary ?? '',
    highlights: Array.isArray(item.highlights) ? item.highlights : [],
    stack: Array.isArray(item.stack) ? item.stack : [],
    projects: Array.isArray(item.projects) ? item.projects : [],
  }
}

/**
 * Rebuilds the grouped skill categories. Category labels/icons/blurbs are
 * decorative and come from the static skeleton; each category's skill list is
 * produced from the API by category id, falling back to the static skills for
 * that category (so nothing disappears if the backend omits a section).
 */
function rebuildSkillCategories(apiSkills) {
  const byCategory = {}
  apiSkills.forEach((skill) => {
    const key = skill.category || 'other'
    ;(byCategory[key] ||= []).push(skill)
  })

  return staticSkills.skillCategories.map((category) => {
    const apiList = byCategory[category.id] ?? []
    const staticById = new Map(category.skills.map((s) => [s.id, s]))

    // Prefer API entries; keep any static skill not present in the API.
    const merged = apiList.map((s) => normalizeSkill(s))
    staticById.forEach((staticSkill, id) => {
      if (!apiList.some((s) => s.id === id)) merged.push(staticSkill)
    })

    return { ...category, skills: merged }
  })
}

function rebuildAllSkills(categories) {
  return categories.flatMap((category) =>
    category.skills.map((skill) => ({
      ...skill,
      categoryId: category.id,
      categoryLabel: category.label,
      projects: projectsUsingSkill(skill.id).map((p) => ({ slug: p.slug, title: p.title })),
    })),
  )
}

function normalizeSkill(skill) {
  return {
    id: skill.id,
    name: skill.name,
    icon: skill.icon ?? '',
    description: skill.description ?? '',
  }
}