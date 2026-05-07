#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

DB_PATH="${DATABASE_PATH:-data/kiosk.sqlite}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p backups

if [ ! -f "$DB_PATH" ]; then
  echo "Database not found at $DB_PATH"
  exit 1
fi

sqlite3 "$DB_PATH" ".backup 'backups/kiosk-$STAMP.sqlite'"
echo "Backup written to backups/kiosk-$STAMP.sqlite"
