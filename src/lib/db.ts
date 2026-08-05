/**
 * Prisma Database Client — Wedabime Pramukayo CMS
 *
 * Uses PrismaNeonHTTP adapter for Cloudflare Workers compatibility.
 * - @prisma/client v6/edge + @prisma/adapter-neon v6 (versions MUST match)
 * - PrismaNeonHTTP: HTTP adapter that sends queries via Neon fetch API
 * - Passes DATABASE_URL directly to adapter (not a neon() function)
 * - No native query engine needed — adapter replaces it entirely
 * - Import from @prisma/client/edge to exclude 17MB native engine + 5MB WASM
 *
 * Lazy initialization via Proxy prevents DATABASE_URL errors during `next build`.
 */

import { PrismaNeonHTTP } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client/edge'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // PrismaNeonHTTP takes the connection string directly
  // It internally calls neon() to create the HTTP driver
  // No WebSocket or native binary engine needed
  const adapter = new PrismaNeonHTTP(process.env.DATABASE_URL!)
  return new PrismaClient({
    adapter,
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

// Export for direct SQL queries if needed (e.g., health check)
export { neon } from '@neondatabase/serverless'
