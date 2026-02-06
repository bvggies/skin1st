import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Serverless: use one PrismaClient per process. Do NOT open persistent connections.
// For Neon: set DATABASE_URL to the *pooled* connection string (host contains -pooler)
// to avoid exhausting compute. In Vercel/serverless, each invocation may be a new
// process, so we avoid creating multiple clients per request by reusing global in dev.
function createPrisma() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

const prisma = global.prisma ?? createPrisma()
if (process.env.NODE_ENV === 'development') global.prisma = prisma

export default prisma
