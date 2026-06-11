#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo ".env file not found"
  exit 1
fi

set -a
source .env
set +a

DB_NAME="${DATABASE_URL##*/}"
DB_NAME="${DB_NAME%%\?*}"

if ! psql "$DATABASE_URL" -Atqc "SELECT 1" >/dev/null 2>&1; then
  echo "Database $DB_NAME does not exist. Creating it."
  createdb "$DB_NAME"
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Applying migrations..."
npx prisma migrate dev --name init --skip-generate

echo "Seeding database..."
npx prisma db seed

echo "Starting Next.js dev server..."
npm run dev
