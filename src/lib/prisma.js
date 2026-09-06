import { PrismaClient } from "@prisma/client";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// Required for Neon serverless in Node.js runtime (not edge)
// In Edge Runtime (Vercel Edge / Cloudflare Workers), remove this import
if (typeof WebSocket === "undefined") {
  const { WebSocket } = await import("ws");
  neonConfig.webSocketConstructor = WebSocket;
}

const globalForPrisma = globalThis;

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}

export default prisma;