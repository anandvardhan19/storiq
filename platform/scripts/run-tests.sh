#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo ""
echo "Starting Chhayavastralaya API tests..."
echo "Make sure the dev server is running at http://localhost:3000"
echo ""

npx tsx scripts/test-api.ts
