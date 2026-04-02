# ============================================================
# Le Marché Africain — Multi-stage Dockerfile
# Optimisé pour Render, Railway, Fly.io
# La DB SQLite est pré-construite au build (schema + seed)
# ============================================================

# Stage 1 — Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json bun.lockb* ./
COPY prisma ./prisma/

# Install bun
RUN npm install -g bun@latest

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN bunx prisma generate

# Stage 2 — Build + Pre-build SQLite database
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g bun@latest

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# ---- Pre-build the SQLite database with schema + seed ----
ENV DATABASE_URL="file:/app/db/prebuilt.db"
RUN mkdir -p /app/db
RUN bunx prisma db push --skip-generate 2>&1
RUN bun run prisma/seed.ts 2>&1
# Verify the DB has data
RUN node -e "const {PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.product.count().then(c=>{console.log('Pre-built DB: '+c+' products');process.exit(c>0?0:1)})"

# Build Next.js (standalone output)
RUN bun run build

# Stage 3 — Production (minimal image)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy the pre-built SQLite database
COPY --from=builder /app/db/prebuilt.db ./db/prebuilt.db

# Copy entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

# Create writable DB directory with proper permissions
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app/db

# Set proper permissions
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/db/custom.db"

CMD ["./entrypoint.sh"]
