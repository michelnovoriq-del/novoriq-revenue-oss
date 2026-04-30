#!/bin/bash

echo "[🔧] Assassinating ghost Next.js processes..."

# 1. Kill the specific PID the terminal warned you about
kill -9 181839 2>/dev/null || true

# 2. Sweep for any other stuck Next.js background processes
pkill -f "next" 2>/dev/null || true

# 3. Nuke the Next.js cache to prevent corrupted lockfiles
echo "[🧹] Clearing corrupted frontend cache..."
rm -rf .next

# 4. Inject a strict port command into package.json so it never fights the backend
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts.dev = 'next dev -p 3001';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

echo "[🚀] Booting Frontend strictly on port 3001..."
npm run dev
