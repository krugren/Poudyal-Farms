import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { join } from 'path';

const globalForPrisma = globalThis;

function createPrismaClient() {
  // Use absolute path without file: prefix — let the adapter handle it
  const dbPath = join(process.cwd(), 'prisma', 'dev.db');
  
  const adapter = new PrismaBetterSqlite3({ url: dbPath });

  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

export default prisma;
