/**
 * Run Prisma migrations using Aurora when AWS_PGHOST (or AWS_POSTGRES_HOST) is set.
 * Builds DATABASE_URL from AWS_* env vars (with IAM token if no password) so the
 * Vercel build uses Aurora instead of Neon. Run from repo root: cd api && node scripts/migrate-deploy.js
 */
const path = require('path')
const { execSync } = require('child_process')

async function main() {
  const apiDir = path.join(__dirname, '..')
  try {
    require('dotenv').config({ path: path.join(apiDir, '.env') })
    // Also load root .env so "node scripts/migrate-deploy.js" from repo root finds vars
    require('dotenv').config({ path: path.join(apiDir, '..', '.env') })
  } catch (_) {}

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
    process.env.POSTGRES_PASSWORD ||
    process.env.RDS_PASSWORD
  const port =
    process.env.AWS_POSTGRES_PORT ||
    process.env.PGPORT ||
    process.env.POSTGRES_PORT ||
    '5432'
  const sslMode = 'require'
  const connectionLimit = 5

  let databaseUrl = process.env.DATABASE_URL
  // Use DATABASE_URL as-is when it's already a full RDS URL (not Neon). Otherwise build from AWS_* when host is set.
  const useAwsVars = host && (!databaseUrl || databaseUrl.includes('neon.tech'))

  if (useAwsVars) {
    // Aurora default DB is "postgres"; if env still has Neon's "neondb", use postgres
    const dbName = (db === 'neondb' ? 'postgres' : db)
    let pass = (password && password.trim()) ? password : null
    if (!pass) {
      try {
        const { Signer } = require('@aws-sdk/rds-signer')
        const region =
          process.env.AWS_REGION ||
          process.env.AWS_DEFAULT_REGION ||
          (host.match(/\.([a-z]{2}-[a-z]+-\d+)\.rds\.amazonaws\.com/) || [])[1] ||
          'us-east-1'
        const signer = new Signer({
          hostname: host,
          port: parseInt(port, 10),
          username: user,
          region,
        })
        pass = await signer.getAuthToken()
      } catch (iamErr) {
        console.warn('migrate-deploy: no RDS password and IAM auth failed at build time — skipping migrations.', iamErr.message)
        process.exit(0)
      }
    }
    const encoded = encodeURIComponent(pass)
    databaseUrl = `postgresql://${user}:${encoded}@${host}:${port}/${dbName}?sslmode=${sslMode}&connection_limit=${connectionLimit}`
  }

  if (!databaseUrl) {
    console.warn('migrate-deploy: DATABASE_URL not set at build time — skipping migrations. Set DATABASE_URL in Vercel env for build if you want migrations on deploy.')
    process.exit(0)
  }

  process.env.DATABASE_URL = databaseUrl
  // If a previous deploy left migrations as failed (P3009), mark them rolled back so deploy can retry
  const failedMigrationsToResolve = [
    '20250102000000_add_eligible_for_return',
    '20260205000000_add_product_order_indexes',
  ]
  for (const name of failedMigrationsToResolve) {
    try {
      execSync(
        `npx prisma migrate resolve --rolled-back "${name}" --schema=../prisma/schema.prisma`,
        { cwd: apiDir, env: process.env, stdio: 'pipe' }
      )
    } catch (_) {
      // Ignore: migration may not be in failed state
    }
  }
  try {
    execSync('npx prisma migrate deploy --schema=../prisma/schema.prisma', {
      cwd: apiDir,
      env: process.env,
      stdio: 'inherit',
    })
  } catch (err) {
    if (err.stdout) process.stdout.write(err.stdout)
    if (err.stderr) process.stderr.write(err.stderr)
    console.error('migrate-deploy: prisma migrate deploy failed', err.message)
    process.exit(err.status == null ? 1 : err.status)
  }
}

main().catch((err) => {
  console.error('migrate-deploy:', err.message || err)
  process.exit(1)
})
