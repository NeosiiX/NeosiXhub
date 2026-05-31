#!/bin/sh
set -e

echo "=== DevHub Starting ==="
echo "Running DB schema push..."

# Tenter db push avec le prisma local, ignorer si ça échoue
./node_modules/prisma/build/index.js db push \
  --accept-data-loss \
  --schema=./prisma/schema.prisma 2>&1 && echo "DB ready!" || echo "DB push failed (continuing anyway)"

echo "Starting Next.js server..."
exec node server.js
