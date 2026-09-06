import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),

  // Direct URL for prisma migrate (bypasses pgbouncer connection pooler)
  datasource: {
    url: process.env.DIRECT_URL,
  },

  migrate: {
    // Standard pg adapter for Node.js migrate environment
    async adapter() {
      const { Pool } = await import("pg");
      const { PrismaPg } = await import("@prisma/adapter-pg");
      const pool = new Pool({ connectionString: process.env.DIRECT_URL });
      return new PrismaPg(pool);
    },
    seed: "node prisma/seed.js",
  },
});