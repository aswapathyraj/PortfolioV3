import 'dotenv/config'

const required = (key, fallback) => process.env[key] ?? fallback

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  apiUrl: process.env.API_URL ?? 'http://localhost:4000',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret-change-me',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET ?? 'dev-only-refresh-change-me',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
  refreshTokenTtlMs: Number(process.env.REFRESH_TOKEN_TTL_MS ?? 14 * 24 * 60 * 60 * 1000),

  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieDomain: process.env.COOKIE_DOMAIN ?? undefined,

  storageProvider: required('STORAGE_PROVIDER', 'local'),
  storageLocalDir: process.env.STORAGE_LOCAL_DIR ?? './uploads',

  githubUsername: process.env.GITHUB_USERNAME ?? '',
  web3formsAccessKey: process.env.WEB3FORMS_ACCESS_KEY ?? '',
}

export const isProd = config.env === 'production'