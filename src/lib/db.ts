/**
 * Prisma Database Client — Wedabime Pramukayo CMS
 *
 * Uses DEFERRED (lazy) initialization to prevent PrismaClient from being
 * instantiated at module-import time. During `next build`, pages that import
 * this module will NOT trigger PrismaClient instantiation — it only happens
 * when an actual DB query is executed at request-time.
 *
 * This fixes: "Environment variable not found: DATABASE_URL" during build,
 * because the build environment doesn't have DATABASE_URL set.
 *
 * Pattern: We use a Proxy so that `db.siteSetting.findMany()` works as normal,
 * but the underlying PrismaClient is only created on first property access.
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

/**
 * Lazy-initialized Prisma client.
 *
 * - In development: uses global singleton to survive hot-reloads
 * - In production: creates a new client per cold start
 * - During build: the client is NEVER instantiated because no queries run
 *   (all pages use force-dynamic, so they only run at request-time)
 */
let _prismaClient: PrismaClient | undefined

function getPrismaClient(): PrismaClient {
  if (!_prismaClient) {
    // In development, reuse the global singleton to avoid connection leaks from HMR
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

// Export a Proxy that defers PrismaClient creation until first property access
// This means `import { db } from '@/lib/db'` does NOT throw if DATABASE_URL is missing
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient()
    const value = Reflect.get(client, prop, receiver)
    // Bind methods to the actual client so `this` is correct
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
