/**
 * In-browser mock API for the API Explorer.
 *
 * This is NOT a network client. Nothing here opens a connection — every handler
 * reads the site's own data files and returns a shaped response object, so what
 * the explorer displays is genuinely produced by the code you are looking at.
 *
 * What is real:  the payloads, the status codes, the error envelope, and the
 *                `POST /api/contact` validation (shared with the live form).
 * What is not:   the latency, which is a fixed constant so the explorer can
 *                demonstrate a loading state. It is labelled as simulated.
 */

import { realProjects, getProjectBySlug } from '../data/projects.js'
import { skillCategories, allSkills } from '../data/skills.js'
import { validateContact } from './validate.js'

/** Fixed, and surfaced in the UI as "simulated" — not a measured round trip. */
export const SIMULATED_LATENCY_MS = 220

const MAX_LIMIT = 50
const DEFAULT_LIMIT = 10

const ok = (status, body) => ({ status, body })

const error = (status, code, message, details) =>
  ok(status, {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  })

const projectSummary = (project) => ({
  slug: project.slug,
  title: project.title,
  category: project.category,
  year: project.year,
  stack: project.technologies,
  caseStudy: `/projects/${project.slug}`,
})

const handlers = {
  'get-health': () =>
    ok(200, {
      status: 'ok',
      service: 'portfolio-mock-api',
      version: '1.0.0',
      checks: { data: 'ok', validation: 'ok' },
    }),

  'list-projects': ({ query = {} }) => {
    const rawLimit = query.limit
    let limit = DEFAULT_LIMIT

    if (rawLimit !== undefined && rawLimit !== '') {
      const parsed = Number(rawLimit)
      if (!Number.isInteger(parsed) || parsed < 1) {
        return error(400, 'INVALID_QUERY_PARAM', '`limit` must be a positive integer.', {
          limit: rawLimit,
        })
      }
      limit = Math.min(parsed, MAX_LIMIT)
    }

    const tech = query.tech?.trim()
    const filtered = tech
      ? realProjects.filter((project) => project.technologies.includes(tech))
      : realProjects

    return ok(200, {
      count: Math.min(filtered.length, limit),
      total: filtered.length,
      filter: tech ? { tech } : null,
      data: filtered.slice(0, limit).map(projectSummary),
    })
  },

  'get-project': ({ params = {} }) => {
    const project = getProjectBySlug(params.slug)

    if (!project || project.status === 'placeholder') {
      return error(404, 'PROJECT_NOT_FOUND', `No project exists with slug "${params.slug ?? ''}".`, {
        available: realProjects.map((p) => p.slug),
      })
    }

    return ok(200, {
      data: {
        ...projectSummary(project),
        summary: project.summary,
        problem: project.problem,
        solution: project.solution,
        features: project.features.map((feature) => feature.title),
        architecture: project.architecture
          ? project.architecture.rows.map((row) => row.map((node) => node.label))
          : null,
        database: project.database
          ? project.database.tables.map((table) => ({
              table: table.name,
              columns: table.columns.length,
            }))
          : null,
      },
    })
  },

  'list-skills': ({ query = {} }) => {
    const category = query.category?.trim()

    if (category) {
      const match = skillCategories.find((group) => group.id === category)
      if (!match) {
        return error(400, 'UNKNOWN_CATEGORY', `"${category}" is not a valid category.`, {
          valid: skillCategories.map((group) => group.id),
        })
      }
      return ok(200, {
        category: match.id,
        count: match.skills.length,
        data: match.skills.map((skill) => ({
          id: skill.id,
          name: skill.name,
          usedIn: allSkills.find((s) => s.id === skill.id)?.projects.map((p) => p.slug) ?? [],
        })),
      })
    }

    return ok(200, {
      count: allSkills.length,
      data: skillCategories.map((group) => ({
        category: group.id,
        label: group.label,
        skills: group.skills.map((skill) => skill.name),
      })),
    })
  },

  'get-stack': () =>
    ok(200, {
      data: {
        frontend: skillCategories.find((g) => g.id === 'frontend').skills.map((s) => s.name),
        backend: skillCategories.find((g) => g.id === 'backend').skills.map((s) => s.name),
        database: skillCategories.find((g) => g.id === 'database').skills.map((s) => s.name),
        security: skillCategories.find((g) => g.id === 'security').skills.map((s) => s.name),
        tools: skillCategories.find((g) => g.id === 'tools').skills.map((s) => s.name),
      },
    }),

  'post-contact': ({ body }) => {
    if (!body || typeof body !== 'object') {
      return error(422, 'INVALID_BODY', 'Request body must be a JSON object.')
    }

    const { valid, errors } = validateContact(body)

    if (!valid) {
      return error(422, 'VALIDATION_FAILED', 'One or more fields are invalid.', errors)
    }

    return ok(202, {
      accepted: true,
      message: 'Payload is valid and would be queued for delivery.',
      note: 'This explorer endpoint validates only and never delivers. The live contact form sends through the provider set in src/config.js → contactForm.',
      received: {
        name: body.name.trim(),
        email: body.email.trim(),
        subject: body.subject.trim(),
        messageLength: body.message.trim().length,
      },
    })
  },
}

/**
 * Executes a mock request.
 *
 * @returns {Promise<{ status: number, body: unknown, latencyMs: number, simulated: true }>}
 */
export function mockRequest(endpointId, { params, query, body } = {}) {
  const handler = handlers[endpointId]

  return new Promise((resolve) => {
    setTimeout(() => {
      if (!handler) {
        resolve({
          ...error(501, 'NOT_IMPLEMENTED', `No mock handler registered for "${endpointId}".`),
          latencyMs: SIMULATED_LATENCY_MS,
          simulated: true,
        })
        return
      }

      let result
      try {
        result = handler({ params, query, body })
      } catch (cause) {
        // A handler throwing is a bug in this file, not a user error — surface
        // it as a 500 with a real shape instead of leaking a stack trace.
        if (import.meta.env.DEV) console.error('[mockApi]', cause)
        result = error(500, 'HANDLER_ERROR', 'The mock handler threw while building a response.')
      }

      resolve({ ...result, latencyMs: SIMULATED_LATENCY_MS, simulated: true })
    }, SIMULATED_LATENCY_MS)
  })
}

export const statusText = {
  200: 'OK',
  202: 'Accepted',
  400: 'Bad Request',
  404: 'Not Found',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
}
