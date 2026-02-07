import { Signer } from '@aws-sdk/rds-signer'
import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const CONNECTION_LIMIT = 5
const SSL_MODE = 'require'

/**
 * Append connection_limit and sslmode to a PostgreSQL URL if not already present.
 */
function ensureParams(url: string): string {
  const q = url.includes('?') ? url : url + '?'
  const add: string[] = []
  if (!/connection_limit=/.test(url)) add.push(`connection_limit=${CONNECTION_LIMIT}`)
  if (!/sslmode=/.test(url)) add.push(`sslmode=${SSL_MODE}`)
  if (add.length === 0) return url
  return url + (url.endsWith('?') ? '' : '&') + add.join('&')
}

/** Infer AWS region from RDS hostname (e.g. xxx.us-east-1.rds.amazonaws.com) or use env. */
function getAwsRegion(): string {
  const fromEnv = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
  if (fromEnv) return fromEnv
  const host =
    process.env.AWS_POSTGRES_HOST ||
    process.env.AWS_PGHOST ||
    process.env.PGHOST ||
    ''
  const match = host.match(/\.([a-z]{2}-[a-z]+-\d+)\.rds\.amazonaws\.com/)
  return match ? match[1] : 'us-east-1'
}

/**
 * Generate a short-lived IAM auth token for RDS/Aurora (no static password needed).
 * Uses default credential chain (Vercel injects credentials when using Aurora + AWS_ROLE_ARN).
 */
async function getIamAuthToken(host: string, port: string, user: string): Promise<string> {
  const signer = new Signer({
    hostname: host,
    port: Number(port, 10),
    username: user,
    region: getAwsRegion(),
  })
  return signer.getAuthToken()
}

/**
 * Build PostgreSQL connection URL for AWS Aurora (or any Postgres).
 * Prefer DATABASE_URL; otherwise build from AWS_POSTGRES_* env vars.
 * If host/user are set but password is not, uses IAM authentication (no password edit required).
 */
function getConnectionUrl(): string {
  const explicit = process.env.DATABASE_URL?.trim()
  if (explicit) {
    return ensureParams(explicit)
  }
  const host =
    process.env.AWS_POSTGRES_HOST ||
    process.env.AWS_PGHOST ||
    process.env.PGHOST
  const db =
    process.env.AWS_POSTGRES_DB ||
    process.env.PGDATABASE ||
    process.env.POSTGRES_DATABASE ||
    'postgres'
  const user =
    process.env.AWS_POSTGRES_USER ||
    process.env.AWS_PGUSER ||
    process.env.PGUSER ||
    'postgres'
  const password =
    process.env.AWS_POSTGRES_PASSWORD ||
    process.env.AWS_PGPASSWORD ||
    process.env.PGPASSWORD ||
    process.env.POSTGRES_PASSWORD
  const port =
    process.env.AWS_POSTGRES_PORT ||
    process.env.PGPORT ||
    process.env.POSTGRES_PORT ||
    '5432'
  if (!host) {
    throw new Error(
      'Database config: set DATABASE_URL or (AWS_PGHOST or AWS_POSTGRES_HOST). For IAM auth leave password unset and set AWS_REGION if needed.'
    )
  }
  // Synchronous path: use password if provided
  if (password && password.trim()) {
    const encodedPassword = encodeURIComponent(password)
    return `postgresql://${user}:${encodedPassword}@${host}:${port}/${db}?sslmode=${SSL_MODE}&connection_limit=${CONNECTION_LIMIT}`
  }
  // IAM auth: we cannot call async getIamAuthToken() from sync getConnectionUrl().
  // So we use a placeholder and replace it in createPrisma() when we have the token.
  return `postgresql://${user}:__IAM_TOKEN__@${host}:${port}/${db}?sslmode=${SSL_MODE}&connection_limit=${CONNECTION_LIMIT}`
}

/** True when the connection URL uses the IAM token placeholder. */
function needsIamToken(url: string): boolean {
  return url.includes('__IAM_TOKEN__')
}

// Singleton: one PrismaClient per process. Do NOT create new client per request.
function createPrismaWithUrl(url: string): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: { db: { url } },
  })
}

let prismaInstance: PrismaClient | null = null
let prismaPromise: Promise<PrismaClient> | null = null

/**
 * Returns the Prisma client. Use this in API routes so IAM auth works when no password is set.
 * When using a password or DATABASE_URL, the client is created at load; when using IAM, it's created on first call.
 */
export async function getPrisma(): Promise<PrismaClient> {
  if (prismaInstance) return prismaInstance
  if (prismaPromise) return prismaPromise
  prismaPromise = (async (): Promise<PrismaClient> => {
    let url = getConnectionUrl()
    if (needsIamToken(url)) {
      const host =
        process.env.AWS_POSTGRES_HOST ||
        process.env.AWS_PGHOST ||
        process.env.PGHOST!
      const port =
        process.env.AWS_POSTGRES_PORT ||
        process.env.PGPORT ||
        process.env.POSTGRES_PORT ||
        '5432'
      const user =
        process.env.AWS_POSTGRES_USER ||
        process.env.AWS_PGUSER ||
        process.env.PGUSER ||
        'postgres'
      const token = await getIamAuthToken(host, port, user)
      url = url.replace('__IAM_TOKEN__', encodeURIComponent(token))
    }
    const client = createPrismaWithUrl(url)
    prismaInstance = client
    if (process.env.NODE_ENV === 'development') global.prisma = client
    return client
  })()
  return prismaPromise
}

// Sync path: when we have a real password or DATABASE_URL, create client at load so existing sync imports still work.
const initialUrl = getConnectionUrl()
if (!needsIamToken(initialUrl)) {
  prismaInstance = global.prisma ?? createPrismaWithUrl(initialUrl)
  if (process.env.NODE_ENV === 'development') global.prisma = prismaInstance
}

/**
 * Default export: PrismaClient when password/DATABASE_URL is set; Promise<PrismaClient> when using IAM auth.
 * In API routes use: const prisma = await getPrisma() so both cases work.
 */
export default prismaInstance ?? getPrisma()
