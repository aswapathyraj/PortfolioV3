import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import multer from 'multer'
import { config } from '../config.js'
import { ApiError } from '../lib/errors.js'

/**
 * Storage abstraction.
 *
 * Every file written by the CMS flows through `saveFile` so the implementation
 * can be swapped between local disk and cloud storage without touching route
 * code. Currently only `local` is implemented — that is the default for
 * development. To add an S3 provider, implement the same `saveFile` contract
 * behind `STORAGE_PROVIDER === 's3'` and return a public URL.
 */

export const allowedMime = {
  image: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
  resume: ['application/pdf'],
  ogimage: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
}

export const sizeLimits = {
  image: 5 * 1024 * 1024,
  resume: 10 * 1024 * 1024,
  ogimage: 5 * 1024 * 1024,
}

const EXTENSIONS = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
}

const resolveUploadDir = () =>
  path.resolve(process.cwd(), config.storageLocalDir.replace(/^\.\//, ''))

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function localPathRelative(relativeDir) {
  const cwd = process.cwd()
  return relativeDir.startsWith(cwd) ? relativeDir.slice(cwd.length).replace(/\\/g, '/') : relativeDir
}

/**
 * Persists a file to the configured provider.
 *
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {string} mimeType
 * @param {'image'|'resume'|'ogimage'} kind  — decides MIME + size rules
 * @param {string} [subdir] — e.g. "project", "profile", "resume"
 * @returns {Promise<{ url: string, name: string, size: number }>}
 */
export async function saveFile({ buffer, originalName, mimeType, kind = 'image', subdir = 'misc' }) {
  const allowed = allowedMime[kind] ?? allowedMime.image
  const maxBytes = sizeLimits[kind] ?? sizeLimits.image

  if (!allowed.includes(mimeType)) {
    throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', `Unsupported file type " ${mimeType}".`)
  }
  if (buffer.length > maxBytes) {
    throw new ApiError(413, 'FILE_TOO_LARGE', `File exceeds the ${Math.round(maxBytes / 1024 / 1024)}MB limit.`)
  }

  const extension = EXTENSIONS[mimeType] ?? path.extname(originalName).toLowerCase() ?? '.bin'
  const safeName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`

  if (config.storageProvider !== 'local') {
    // A defined-but-unimplemented provider must not silently lose uploads.
    throw new ApiError(501, 'STORAGE_NOT_CONFIGURED', `Storage provider "${config.storageProvider}" is not configured.`)
  }

  const dir = path.join(resolveUploadDir(), subdir)
  ensureDir(dir)

  const fullPath = path.join(dir, safeName)
  fs.writeFileSync(fullPath, buffer)

  const relative = path.join(config.storageLocalDir.replace(/^\.\//, ''), subdir, safeName).replace(/\\/g, '/')
  return { url: `/uploads/${subdir}/${safeName}`, name: safeName, size: buffer.length, relative }
}

/** Multer memory-storage instance; validation is done in saveFile. */
export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
})

export function resolveMediaUrl(url) {
  return url
}

export { config as storageConfig }