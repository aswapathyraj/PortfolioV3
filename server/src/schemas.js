import { z } from 'zod'

const optionalString = z.string().trim().max(10_000).nullable().optional()

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').max(254),
  password: z.string().min(1, 'Password is required').max(256),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(256),
  newPassword: z.string().min(10, 'Use at least 10 characters').max(128),
})

const urlLike = (label = 'URL') =>
  z
    .string()
    .trim()
    .refine(
      (value) => {
        if (!value) return true
        try {
          const parsed = new URL(value)
          return parsed.protocol === 'http:' || parsed.protocol === 'https:'
        } catch {
          return false
        }
      },
      { message: `${label} must be a valid http(s) URL` },
    )

export const projectSchema = z.object({
  title: z.string().trim().min(1, 'Project title is required').max(160),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers, hyphens only')
    .max(120),
  subtitle: z.string().trim().max(200).nullable().optional(),
  category: z.string().trim().max(80).nullable().optional(),
  year: z.string().trim().max(20).nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  accent: z.string().trim().max(40).nullable().optional(),
  image: z.string().trim().max(500).nullable().optional(),
  summary: optionalString,
  description: optionalString,
  problem: optionalString,
  solution: optionalString,
  features: z.array(z.object({ title: z.string().max(200), detail: z.string().max(2000) })).optional(),
  architecture: z.unknown().optional().nullable(),
  database: z.unknown().optional().nullable(),
  auth: z.array(z.object({ label: z.string().max(200), detail: z.string().max(3000) })).optional(),
  challenges: z.array(z.object({ title: z.string().max(300), detail: z.string().max(3000) })).optional(),
  learnings: z.array(z.string().max(3000)).optional(),
  outcome: z.array(z.string().max(3000)).optional(),
  caseSections: z.unknown().optional().nullable(),
  github: urlLike('Repository URL').nullable().optional(),
  liveDemo: urlLike('Live demo URL').nullable().optional(),
  seo: z
    .object({
      seoTitle: z.string().trim().max(160).optional().nullable(),
      metaDescription: z.string().trim().max(320).optional().nullable(),
      ogImage: z.string().trim().max(500).optional().nullable(),
      canonical: z.string().trim().max(500).optional().nullable(),
    })
    .optional()
    .nullable(),
  technologies: z.array(z.string().max(100)).optional(),
})

export const versionNoteSchema = z.object({
  note: z.string().trim().max(500).optional().nullable(),
})

export const skillSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, 'Skill id is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers, hyphens only')
    .max(80),
  name: z.string().trim().min(1, 'Name is required').max(80),
  category: z.string().trim().min(1).max(60).default('other'),
  icon: z.string().trim().max(60).nullable().optional(),
  description: optionalString,
  proficiency: z.number().int().min(0).max(100).nullable().optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
})

export const experienceSchema = z.object({
  role: z.string().trim().min(1).max(160),
  org: z.string().trim().min(1).max(160),
  location: z.string().trim().max(160).nullable().optional(),
  startDate: z.string().trim().max(40).nullable().optional(),
  endDate: z.string().trim().max(40).nullable().optional(),
  current: z.boolean().default(false),
  icon: z.string().trim().max(60).nullable().optional(),
  summary: optionalString,
  highlights: z.array(z.string().max(2000)).optional(),
  stack: z.array(z.string().max(100)).optional(),
  projects: z.array(z.string().max(100)).optional(),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const securityItemSchema = z.object({
  label: z.string().trim().min(1).max(160),
  value: z.string().trim().max(160).nullable().optional(),
  icon: z.string().trim().max(60).nullable().optional(),
  level: z.enum(['implemented', 'studied']).default('studied'),
  summary: optionalString,
  detail: optionalString,
  projects: z.array(z.string().max(100)).optional(),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const engineeringItemSchema = z.object({
  number: z.string().trim().max(10).nullable().optional(),
  title: z.string().trim().min(1).max(160),
  icon: z.string().trim().max(60).nullable().optional(),
  what: optionalString,
  tech: z.array(z.string().max(100)).optional(),
  why: optionalString,
  example: z
    .object({ project: z.string().max(120).optional().nullable(), note: z.string().max(2000).optional().nullable() })
    .nullable()
    .optional(),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const apiEndpointSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
  path: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(200),
  description: optionalString,
  auth: z.boolean().default(false),
  query: z.array(z.unknown()).optional(),
  params: z.array(z.unknown()).optional(),
  body: z.unknown().optional().nullable(),
  sampleBody: z.unknown().optional().nullable(),
  sampleParams: z.unknown().optional().nullable(),
  statuses: z.array(z.unknown()).optional(),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const messagePatchSchema = z.object({
  status: z.enum(['unread', 'read', 'archived', 'spam']).optional(),
})

export const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
})

export const userCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  role: z.enum(['owner', 'admin', 'editor']).default('editor'),
  password: z.string().min(10, 'Use at least 10 characters').max(128),
})

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().max(254).optional(),
  role: z.enum(['owner', 'admin', 'editor']).optional(),
})

export const settingPatchSchema = z
  .object({
    value: z.unknown(),
  })
  .passthrough()

export const contactSettingsScheme = z.object({
  provider: z.enum(['none', 'mailto', 'endpoint', 'web3forms']).default('none'),
  endpoint: z.string().trim().max(500).optional().nullable().default(''),
  web3formsAccessKey: z.string().trim().max(200).optional().nullable().default(''),
  fromName: z.string().trim().max(120).optional().nullable().default(''),
})

export const publicContactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(20).max(2000),
})

export const suggestion = (name) => {
  // Placeholder export so imports stay stable.
  return name
}