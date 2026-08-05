import path from "node:path";
import type { PrismaConfig } from "prisma";

// Prisma v7 configuration
// Connection URL is no longer in schema.prisma — it's configured here for migrations
// At runtime, the PrismaNeonHttp adapter handles the connection

export default {
  earlyAccess: true,
  schema: path.join(__dirname, "schema.prisma"),

  migrate: {
    async url() {
      // For prisma migrate commands, use DATABASE_URL from environment
      return process.env.DATABASE_URL ?? "";
    },
  },
} satisfies PrismaConfig;
