import { PrismaClient } from '@prisma/client'

// Neon/PgBouncer in transaction mode cannot reuse prepared statements, which
// surfaces as "prepared statement already exists" (42P05). The direct endpoint
// bypasses the pooler, so prefer it when it is configured; otherwise fall
// back to the pooled URL.
const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL

export const prisma = new PrismaClient(url ? { datasourceUrl: url } : undefined)
