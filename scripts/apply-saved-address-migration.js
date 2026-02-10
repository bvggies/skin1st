const { Client } = require('pg')
require('dotenv').config({ path: './api/.env' })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in environment')
  process.exit(1)
}

async function applyMigration() {
  // Strip sslmode from connection string and handle SSL separately
  let connectionString = DATABASE_URL.replace(/[?&]sslmode=[^&]*/g, '')
  const client = new Client({
    connectionString,
    ssl: connectionString.includes('rds.amazonaws.com') || connectionString.includes('neon.tech') 
      ? { rejectUnauthorized: false } 
      : undefined
  })

  try {
    await client.connect()
    console.log('Connected to database')

    // Check if table exists
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'SavedAddress'
      )
    `)

    if (checkTable.rows[0].exists) {
      console.log('SavedAddress table already exists')
      return
    }

    console.log('Applying migration: Creating SavedAddress table...')

    // Read migration SQL
    const fs = require('fs')
    const path = require('path')
    const migrationPath = path.join(__dirname, '../prisma/migrations/20260210120000_add_saved_address/migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Execute migration
    await client.query(migrationSQL)
    console.log('Migration applied successfully!')
  } catch (error) {
    console.error('Migration failed:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

applyMigration()
