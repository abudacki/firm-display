#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if command -v pm2 >/dev/null 2>&1; then
  pm2 start npm --name firm-display -- start
  pm2 save
else
  echo "PM2 is not installed. Running with npm start."
  npm start
fi
