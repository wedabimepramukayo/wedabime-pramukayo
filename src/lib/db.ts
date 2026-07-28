/**
 * Prisma Database Client — Wedabime Pramukayo CMS
 *
 * Uses PrismaNeonHttp adapter for Cloudflare Workers compatibility.
 * - @prisma/client/edge: Edge runtime client (no binary query engine needed)
 * - PrismaNeonHttp: HTTP adapter that sends queries via Neon fetch API
 * - Passes DATABASE_URL directly to adapter (not a neon() function)
 *
 * This is the officially recommended approach for Prisma on Cloudflare Workers:
 *   https://opennext.js.org/cloudflare/troubleshooting
 *
 * Lazy initialization via Proxy prevents DATABASE_URL errors during `next build`.
 */

import { PrismaNeonHttp } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client/edge'
import { neon } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // PrismaNeonHttp takes the connectionString directly
  // It internally uses neon() HTTP driver to send queries over HTTPS
  // No WebSocket or native binary engine needed
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {
    poolQueryViaFetch: true,
  })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

/**
 * Lazy-initialized Prisma client using Proxy.
 *
 * - In development: reuses global singleton (HMR-safe)
 * - In production: creates client per cold start
 * - During build: NEVER instantiated (no queries run, force-dynamic on all DB pages)
 * - Uses Neon HTTP adapter → works on Cloudflare Workers (Edge/V8 runtime)
 */
let _prismaClient: PrismaClient | undefined

function getPrismaClient(): PrismaClient {
  if (!_prismaClient) {
    if (process.env.NODE_ENV !== 'production' && globalForPrisma.prisma) {
      _prismaClient = globalForPrisma.prisma
    } else {
      _prismaClient = createPrismaClient()
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = _prismaClient
      }
    }
  }
  return _prismaClient
}

// Proxy defers PrismaClient creation until first property access
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient()
    const value = Reflect.get(client, prop, receiver)
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

// Export neon() for direct SQL queries if needed (e.g., health check)
export { neon }
