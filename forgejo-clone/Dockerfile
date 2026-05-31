FROM node:20-alpine AS base
RUN apk add --no-cache git libc6-compat

# ─── Dependencies ────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json ./
# npm install au lieu de npm ci (pas besoin de package-lock.json)
RUN npm install

# ─── Builder ─────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Runner ──────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p /git-repos && chown nextjs:nodejs /git-repos

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
