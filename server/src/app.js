import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config, isProd } from './config.js'
import { notFound, errorHandler } from './lib/errors.js'
import authRoutes from './routes/auth.routes.js'
import publicRoutes from './routes/public.routes.js'
import adminRoutes from './routes/admin.routes.js'

export const app = express()

const allowedOrigins = [config.frontendUrl, config.apiUrl]

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin and server-to-server calls without an Origin header.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
      if (!isProd) return callback(null, true) // permissive in development
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())

// Uploaded media — served from a non-executable directory, safe filenames only.
app.use('/uploads', express.static(config.storageLocalDir, { maxAge: '7d', immutable: false }))

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/public', publicRoutes)

app.get('/', (_req, res) => {
  res.json({ service: 'portfolio-api', status: 'ok', time: new Date().toISOString() })
})

app.use(notFound)
app.use(errorHandler)