import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

const dbPath = path.join(__dirname, "prisma", "dev.db");

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: `file:${dbPath}`,
  },
  migrate: {
    async adapter() {
      const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
      return new PrismaBetterSqlite3({ url: `file:${dbPath}` });
    },
    seed: "node prisma/seed.js",
  },
});
