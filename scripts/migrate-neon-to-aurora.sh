#!/usr/bin/env bash
# Migrate data from Neon (source) to AWS Aurora (target).
# Usage:
#   export DATABASE_URL_SOURCE="postgresql://..."   # Neon
#   export DATABASE_URL_TARGET="postgresql://..."   # Aurora
#   ./scripts/migrate-neon-to-aurora.sh
# Prerequisites: pg_dump and psql in PATH; run Prisma migrations on TARGET first.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_FILE="${SCRIPT_DIR}/neon_data.sql"

if [ -z "$DATABASE_URL_SOURCE" ] || [ -z "$DATABASE_URL_TARGET" ]; then
  echo "Set DATABASE_URL_SOURCE (Neon) and DATABASE_URL_TARGET (Aurora)."
  exit 1
fi

echo "Dumping data from Neon (source)..."
pg_dump "$DATABASE_URL_SOURCE" \
  --data-only \
  --no-owner \
  --inserts \
  -f "$OUTPUT_FILE"

echo "Loading data into Aurora (target)..."
# Run in one session so FK triggers stay disabled during load
( echo "SET session_replication_role = replica;"; cat "$OUTPUT_FILE"; echo "SET session_replication_role = DEFAULT;"; ) | psql "$DATABASE_URL_TARGET" -v ON_ERROR_STOP=1

echo "Done. Verify with: GET /api/health and row counts on both DBs."
