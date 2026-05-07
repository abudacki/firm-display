#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example. Edit it before adding Graph credentials."
fi

npm install
npm run db:seed
npm run build

echo "Setup complete. Start with ./scripts/start.sh"
