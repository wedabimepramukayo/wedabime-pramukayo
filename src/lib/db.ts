/**
 * Prisma Database Client — Wedabime Pramukayo CMS
 *
 * Uses Neon serverless driver + Prisma adapter for Cloudflare Pages compatibility.
 * The Neon serverless driver works on Edge/V8 runtime (Cloudflare Workers),
 * unlike the standard `pg` driver which requires Node.js.
 *
 * Lazy initialization via Proxy prevents DATABASE_URL errors during `next build`.
 */

import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const neonPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaNeon(neonPool)
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
 * - Uses Neon serverless driver → works on Cloudflare Pages (Edge/V8 runtime)
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
