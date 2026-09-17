#!/usr/bin/env bash
# Restore the full plux public-schema dump into a target Supabase DATABASE_URL.
#
# Usage:
#   DATABASE_URL='postgresql://postgres....' ./scripts/restore-full-db.sh
#   # or
#   ./scripts/restore-full-db.sh 'postgresql://...'
#
# Prefer the direct (non-pooler) connection string from Supabase → Settings → Database.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DUMP="${ROOT}/supabase/dumps/plux-full-db-for-new-supabase.sql"
PSQL_BIN="${PSQL_BIN:-/usr/lib/postgresql/17/bin/psql}"
if [[ ! -x "$PSQL_BIN" ]]; then
  PSQL_BIN="$(command -v psql)"
fi

DB_URL="${1:-${DATABASE_URL:-${TARGET_DATABASE_URL:-}}}"
if [[ -z "${DB_URL}" ]]; then
  echo "Missing DATABASE_URL (or pass as first argument)" >&2
  exit 1
fi
if [[ ! -f "$DUMP" ]]; then
  echo "Dump not found: $DUMP" >&2
  exit 1
fi

echo "Restoring $(basename "$DUMP") ($(du -h "$DUMP" | cut -f1)) into target..."
export PGSSLMODE="${PGSSLMODE:-require}"
"$PSQL_BIN" "$DB_URL" -v ON_ERROR_STOP=1 -f "$DUMP"
echo "Restore finished."
