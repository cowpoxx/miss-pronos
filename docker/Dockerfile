# ──────────────────────────────────────────────
# Base
# ──────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ──────────────────────────────────────────────
# Dependencies
# ──────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

# ──────────────────────────────────────────────
# Builder (for app)
# ──────────────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache openssl python3 make g++   # Prisma/Next.js build needs these
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# ──────────────────────────────────────────────
# Schema (for migrations)
# ──────────────────────────────────────────────
FROM base AS schema
RUN apk add --no-cache openssl libc6-compat python3 make g++   # Prisma needs openssl at runtime
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --no-dev
COPY prisma ./prisma
COPY package.json .
CMD ["pnpm", "exec", "prisma", "db", "push", "--skip-generate"]

# ──────────────────────────────────────────────
# Runner (production)
# ──────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copie le build standalone de Next.js (ordre correct)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -q --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]