import { Router } from 'express'
import { asyncHandler, ApiError, ok } from '../../lib/errors.js'
import { memoryUpload, saveFile, allowedMime } from '../../services/storage.js'
import { recordActivity } from '../../lib/audit.js'

const router = Router()

/**
 * POST /api/admin/uploads
 * multipart: file, kind ('image' | 'resume' | 'ogimage'), subdir ('project' | 'profile' | 'resume' | 'og' ...)
 *
 * MIME/size rules are enforced inside saveFile, filenames are server-generated,
 * and files are stored outside any executable directory.
 */
router.post(
  '/',
  memoryUpload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'NO_FILE', 'No file was uploaded.')

    const kind = req.body.kind ?? 'image'
    if (!allowedMime[kind]) throw new ApiError(400, 'INVALID_KIND', 'Unknown upload purpose.')

    const subdir = ['project', 'profile', 'resume', 'og', 'misc'].includes(req.body.subdir)
      ? req.body.subdir
      : 'misc'

    const result = await saveFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      kind,
      subdir,
    })

    await recordActivity({
      req,
      action: 'upload.created',
      entity: 'upload',
      entityTitle: `${kind} · ${subdir}`,
      meta: { url: result.url, size: result.size },
    })
    ok(res, { data: result }, 201)
  }),
)

export default router