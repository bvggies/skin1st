/**
 * Copy all data from Neon (source) to RDS (target).
 * Uses DATABASE_URL_SOURCE and DATABASE_URL_TARGET. Schema must already exist on target (run migrations first).
 *
 * Usage (from project root):
 *   Set env:
 *     DATABASE_URL_SOURCE = Neon connection string
 *     DATABASE_URL_TARGET = RDS connection string
 *   Then:
 *     node scripts/copy-neon-to-rds.js
 *
 * Or with api/.env for target and .env for source:
 *     node -r dotenv/config scripts/copy-neon-to-rds.js
 *   (with DATABASE_URL_SOURCE and DATABASE_URL_TARGET in env or .env)
 *
 * Requires: npm install pg (run from root: npm install -D pg, or cd api && npm install -D pg)
 */

const path = require('path')
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
  require('dotenv').config({ path: path.join(__dirname, '..', 'api', '.env') })
} catch (_) {}

const { Client } = require('pg')

// Tables in dependency order (no FK violations when inserting in this order)
const TABLE_ORDER = [
  'User',
  'Category',
  'Brand',
  'Coupon',
  'Product',
  'ProductImage',
  'Variant',
  'Cart',
  'CartItem',
  'Order',
  'OrderItem',
  'OrderStatusHistory',
  'EventTracking',
  'GuaranteeClaim',
  'Review',
  'SavedAddress',
  'RefreshToken',
  'Wishlist',
  'SiteSettings',
]

function parseUrl(url) {
  if (!url || typeof url !== 'string') return null
  try {
    const u = new URL(url)
    const auth = u.username && u.password ? `${decodeURIComponent(u.username)}:${decodeURIComponent(u.password)}` : ''
    return {
      connectionString: url,
      ssl: url.includes('sslmode=require') || url.includes('ssl=require') ? { rejectUnauthorized: false } : false,
    }
  } catch (e) {
    return null
  }
}

async function getTableColumns(client, tableName) {
  // Prisma uses PascalCase table names; try as-is then lowercase
  for (const name of [tableName, tableName.toLowerCase()]) {
    const res = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
      [name]
    )
    if (res.rows.length > 0) return res.rows.map((r) => r.column_name)
  }
  return []
}

async function getActualTableName(client, name) {
  for (const n of [name, name.toLowerCase()]) {
    const r = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
      [n]
    )
    if (r.rows[0]) return r.rows[0].table_name
  }
  return name
}

async function copyTable(source, target, tableName) {
  const actualName = await getActualTableName(source, tableName)
  const columns = await getTableColumns(source, actualName)
  if (columns.length === 0) {
    console.log(`  Skip ${tableName}: table not found or no columns`)
    return 0
  }

  const cols = columns.map((c) => `"${c}"`).join(', ')
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
  const conflictCols = await getPrimaryKeyColumn(source, actualName)
  const onConflict = conflictCols.length > 0
    ? ` ON CONFLICT (${conflictCols.map((c) => `"${c}"`).join(', ')}) DO NOTHING`
    : ''

  const selectRes = await source.query(`SELECT ${cols} FROM "${actualName}"`)
  const rows = selectRes.rows
  if (rows.length === 0) {
    console.log(`  ${actualName}: 0 rows`)
    return 0
  }

  // Check target has this table (e.g. RDS might be missing some migrations)
  const targetActual = await getActualTableName(target, tableName)
  const targetCols = await getTableColumns(target, targetActual)
  if (targetCols.length === 0) {
    console.log(`  ${actualName}: skipped (table does not exist on target)`)
    return 0
  }

  let inserted = 0
  for (const row of rows) {
    const values = columns.map((col) => row[col])
    try {
      await target.query(
        `INSERT INTO "${targetActual}" (${cols}) VALUES (${placeholders})${onConflict}`,
        values
      )
      inserted++
    } catch (err) {
      if (err.code === '23505') {
        // unique_violation - skip
      } else if (err.code === '42P01') {
        console.log(`  ${actualName}: skipped (table does not exist on target)`)
        return 0
      } else {
        console.error(`  ${actualName} row error:`, err.message)
        throw err
      }
    }
  }
  console.log(`  ${actualName}: ${inserted}/${rows.length} rows`)
  return inserted
}

async function getPrimaryKeyColumn(client, tableName) {
  const res = await client.query(
    `SELECT a.attname
     FROM pg_index i
     JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
     JOIN pg_class c ON c.oid = i.indrelid
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relname = $1 AND i.indisprimary AND a.attnum > 0 AND NOT a.attisdropped`,
    [tableName]
  )
  return res.rows.map((r) => r.attname)
}

async function main() {
  const sourceUrl = process.env.DATABASE_URL_SOURCE || process.env.DATABASE_URL
  const targetUrl = process.env.DATABASE_URL_TARGET

  if (!targetUrl) {
    console.error('Set DATABASE_URL_TARGET to your RDS (or new DB) connection string.')
    process.exit(1)
  }

  const sourceConfig = parseUrl(sourceUrl)
  const targetConfig = parseUrl(targetUrl)
  if (!sourceConfig || !targetConfig) {
    console.error('Invalid DATABASE_URL_SOURCE or DATABASE_URL_TARGET.')
    process.exit(1)
  }

  // Force relaxed SSL so RDS/Neon certs work (self-signed or chain issues).
  // Strip sslmode from URL so pg doesn't override with verify-full.
  const stripSslMode = (u) => u.replace(/\?sslmode=[^&]+&?|&sslmode=[^&]+/, (m) => (m.includes('?') && !m.includes('&') ? '?' : ''))
  const sourceUrlClean = stripSslMode(sourceUrl).replace(/\?$/, '') || sourceUrl
  const targetUrlClean = stripSslMode(targetUrl).replace(/\?$/, '') || targetUrl
  const sslRelaxed = { rejectUnauthorized: false }
  console.log('Connecting to source (Neon)...')
  const source = new Client({ connectionString: sourceUrlClean, ssl: sslRelaxed })
  console.log('Connecting to target (RDS)...')
  const target = new Client({ connectionString: targetUrlClean, ssl: sslRelaxed })

  try {
    await source.connect()
    await target.connect()
  } catch (err) {
    console.error('Connection failed:', err.message)
    process.exit(1)
  }

  try {
    console.log('Copying tables...')
    let total = 0
    for (const table of TABLE_ORDER) {
      try {
        const n = await copyTable(source, target, table)
        total += n
      } catch (err) {
        console.error(`Failed on table ${table}:`, err.message)
        throw err
      }
    }
    console.log('Done. Total rows copied:', total)
  } finally {
    await source.end()
    await target.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
