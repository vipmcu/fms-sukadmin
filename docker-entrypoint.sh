#!/bin/sh
set -e

echo "🚀 [fms-sukadmin] Starting container initialization..."

# 1. Check database connectivity and run migrations
if [ -n "$DATABASE_URL" ]; then
  echo "📡 [fms-sukadmin] Applying Prisma migrations..."
  n=0
  until [ "$n" -ge 30 ]
  do
    prisma migrate deploy && break
    n=$((n+1))
    echo "⏳ [fms-sukadmin] Database not ready yet, retrying in 2s ($n/30)..."
    sleep 2
  done

  if [ "$n" -ge 30 ]; then
    echo "❌ [fms-sukadmin] Database migration failed or timed out after 60s."
    exit 1
  fi
  echo "✅ [fms-sukadmin] Database migrations successfully applied."

  # 2. Bootstrap initial production admin if configured
  if [ -n "$BOOTSTRAP_ADMIN_EMAIL" ] && [ -n "$BOOTSTRAP_ADMIN_PASSWORD" ]; then
    echo "👤 [fms-sukadmin] Running bootstrap setup for $BOOTSTRAP_ADMIN_EMAIL..."
    if [ -f "prisma/bootstrap.cjs" ]; then
      node prisma/bootstrap.cjs || echo "ℹ️ Bootstrap completed or already seeded."
    fi
  fi
fi

echo "✨ [fms-sukadmin] Launching Next.js Production Server on port ${PORT:-3010}..."
exec "$@"
