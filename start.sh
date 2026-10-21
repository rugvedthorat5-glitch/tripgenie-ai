#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Ensuring MongoDB is running…"
if command -v brew >/dev/null 2>&1; then
  brew services start mongodb/brew/mongodb-community@8.0 >/dev/null 2>&1 || true
fi

echo "==> Starting backend on :5050…"
cd "$ROOT/backend"
if [ ! -d node_modules ]; then npm install; fi
if [ ! -f .env ]; then cp .env.example .env; fi
node src/scripts/seed.js || true
node src/index.js &
BACK_PID=$!

cleanup() {
  kill "$BACK_PID" 2>/dev/null || true
}
trap cleanup EXIT

if command -v adb >/dev/null 2>&1; then
  echo "==> Configuring USB Android port forwarding…"
  adb reverse tcp:5050 tcp:5050 2>/dev/null || true
  adb reverse tcp:8081 tcp:8081 2>/dev/null || true
fi

sleep 2
echo "==> Starting Expo with tunnel for mobile connection…"
cd "$ROOT/frontend"
if [ ! -d node_modules ]; then npm install; fi
if [ ! -f .env ]; then cp .env.example .env; fi
npx expo start --tunnel
