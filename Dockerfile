# -----------------------------------------------------------
# 1. Base Image: Debian Bookworm Slim with OpenSSL and Curl
# -----------------------------------------------------------
FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    curl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# -----------------------------------------------------------
# 2. Dependencies Stage
# -----------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci --legacy-peer-deps

# -----------------------------------------------------------
# 3. Builder Stage
# -----------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV AUTH_SECRET="placeholder_build_secret_12345678"
RUN npx prisma generate
RUN npm run build
RUN npx esbuild prisma/bootstrap.ts --bundle --platform=node --target=node20 --format=cjs --outfile=prisma/bootstrap.cjs

# -----------------------------------------------------------
# 4. Production Runner Stage (Minimal & Secure Non-Root)
# -----------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"

# Install Prisma CLI for database migrations
RUN npm install -g prisma@6.19.3

# Create secure non-root system user and group (UID 1001)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set up public folder and persistent uploads directory with proper permissions
COPY --from=builder /app/public ./public
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

# Copy Next.js standalone build artifacts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema, migrations, and bundled bootstrap script
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3010

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3010/ || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
