#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

git pull --ff-only
npm install
npm run db:seed
npm run build

if command -v pm2 >/dev/null 2>&1; then
  pm2 restart firm-display || pm2 start npm --name firm-display -- start
  pm2 save
else
  echo "Update complete. PM2 is not installed, so restart the app manually."
fi
