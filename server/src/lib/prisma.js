import { PrismaClient } from '@prisma/client'

/**
 * Prisma client for the serverless API.
 *
 * Neon-style hosts expose two URLs: a pooled one (transaction mode, many
 * clients multiplexed over a few connections) and a direct one (session mode,
 * capped at ~15 clients). Two failure modes come with them:
 *
 *   - pooled without `pgbouncer=true` -> "prepared statement already exists"
 *     (42P05), because transaction pooling cannot reuse prepared statements;
 *   - direct without a connection limit -> "max clients reached in session
 *     mode" (EMAXCONNSESSION), because every lambda opens its own pool.
 *
 * So: prefer the pooled URL with pgbouncer=true, and if only a direct URL is
 * available, cap the pool so the sum stays under the server's limit.
 */
const isPooled = (url) => typeof url === 'string' && /pooler/i.test(url)

const withParam = (url, key, value) => {
  if (!url) return url
  if (new RegExp(`[?&]${key}=`).test(url)) return url
  return `${url}${url.includes('?') ? '&' : '?'}${key}=${value}`
}

function resolveUrl() {
  const pooled = process.env.DATABASE_URL
  const direct = process.env.DIRECT_DATABASE_URL

  if (isPooled(pooled)) return withParam(pooled, 'pgbouncer', 'true')
  if (isPooled(direct)) return withParam(direct, 'pgbouncer', 'true')

  // Direct-only: keep each instance's pool small so concurrent lambdas stay
  // under the server's max-client cap.
  return withParam(direct || pooled, 'connection_limit', '4')
}

const url = resolveUrl()

export const prisma = new PrismaClient(url ? { datasourceUrl: url } : undefined)
