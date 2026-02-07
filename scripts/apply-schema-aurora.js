#!/usr/bin/env node
/**
 * Apply Prisma migrations to AWS Aurora.
 * Set AWS_POSTGRES_* or DATABASE_URL in .env (or in shell), then: node scripts/apply-schema-aurora.js
 */

const path = require('path')
const fs = require('fs')
const os = require('os')
const { execSync } = require('child_process')

function loadEnv(filePath, overwrite = false) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  content.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (m) {
      const key = m[1]
      let val = m[2].trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1)
      if (overwrite || !process.env[key]) process.env[key] = val
    }
  })
}

const rootDir = path.resolve(__dirname, '..')
const apiDir = path.join(rootDir, 'api')
const rootEnv = path.join(rootDir, '.env')
const apiEnv = path.join(apiDir, '.env')
const rootEnvBak = path.join(rootDir, '.env.bak-aurora-run')
const apiEnvBak = path.join(apiDir, '.env.bak-aurora-run')
if (fs.existsSync(apiEnvBak) && !fs.existsSync(apiEnv)) {
  fs.renameSync(apiEnvBak, apiEnv)
}
if (fs.existsSync(rootEnvBak) && !fs.existsSync(rootEnv)) {
  fs.renameSync(rootEnvBak, rootEnv)
}
loadEnv(rootEnv)
loadEnv(apiEnv, true) // api/.env wins (Aurora vars)
if (!process.env.AWS_POSTGRES_HOST && fs.existsSync(apiEnvBak)) {
  loadEnv(apiEnvBak, true)
}

const host = process.env.AWS_POSTGRES_HOST || process.env.PGHOST
const db = process.env.AWS_POSTGRES_DB || process.env.PGDATABASE || 'postgres'
const user = process.env.AWS_POSTGRES_USER || process.env.PGUSER || 'postgres'
const password = process.env.AWS_POSTGRES_PASSWORD || process.env.PGPASSWORD
const port = process.env.AWS_POSTGRES_PORT || process.env.PGPORT || '5432'

// Prefer Aurora (AWS_*) when set, so migrations run against Aurora even if DATABASE_URL points to Neon
let url
if (host && password) {
  const enc = encodeURIComponent(password)
  url = `postgresql://${user}:${enc}@${host}:${port}/${db}?sslmode=require`
} else {
  url = process.env.DATABASE_URL
}

if (!url) {
  console.error('Set DATABASE_URL to Aurora URL, or set AWS_POSTGRES_HOST + AWS_POSTGRES_PASSWORD (and optionally AWS_POSTGRES_DB, AWS_POSTGRES_USER, AWS_POSTGRES_PORT) in .env')
  process.exit(1)
}

const apiEnvPath = apiEnv
const rootEnvPath = rootEnv
let apiRenamed = false
let rootRenamed = false
try {
  if (fs.existsSync(apiEnvPath)) {
    fs.renameSync(apiEnvPath, apiEnvBak)
    apiRenamed = true
  }
  if (fs.existsSync(rootEnvPath)) {
    fs.renameSync(rootEnvPath, rootEnvBak)
    rootRenamed = true
  }
  const minimalEnv = { PATH: process.env.PATH, DATABASE_URL: url }
  if (process.env.LANG) minimalEnv.LANG = process.env.LANG
  if (process.env.NODE_ENV) minimalEnv.NODE_ENV = process.env.NODE_ENV
  console.log('Running Prisma migrate against Aurora (DATABASE_URL from env)...')
  const schemaArg = path.join(rootDir, 'prisma', 'schema.prisma')
  const escapedUrl = url.replace(/"/g, '\\"')
  const cmd = process.platform === 'win32'
    ? `set "DATABASE_URL=${escapedUrl}" && npx prisma migrate deploy --schema="${schemaArg}"`
    : `DATABASE_URL="${escapedUrl}" npx prisma migrate deploy --schema="${schemaArg}"`
  execSync(cmd, {
    stdio: 'inherit',
    cwd: apiDir,
    shell: true,
    env: minimalEnv
  })
} finally {
  if (apiRenamed && fs.existsSync(apiEnvBak)) {
    fs.renameSync(apiEnvBak, apiEnvPath)
  }
  if (rootRenamed && fs.existsSync(rootEnvBak)) {
    fs.renameSync(rootEnvBak, rootEnvPath)
  }
}
