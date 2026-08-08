#!/bin/sh
set -e

# Ensure data directory exists
mkdir -p /data

# Run migrations against the persistent volume DB
DATABASE_URL="file:/data/storiq.db" npx prisma migrate deploy --schema=./prisma/schema.prisma

# Start Next.js
exec node server.js
