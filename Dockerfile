# syntax=docker/dockerfile:1
# Image produksi website STAI Morowali (Next.js standalone + Payload CMS).
#
#   docker build --build-arg NEXT_PUBLIC_SERVER_URL=https://staimorowali.ac.id -t stai-morowali-web .
#   docker run -p 3000:3000 -v stai_media:/app/media \
#     -e DATABASE_URL=... -e PAYLOAD_SECRET=... stai-morowali-web
#
# Migrasi database (src/migrations) dijalankan otomatis saat container start.
# Build disarankan di CI/mesin build, bukan di VPS 3 GB (next build boros RAM).

FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
    BUILD_STANDALONE=true \
    NEXT_TELEMETRY_DISABLED=1
# Semua halaman dirender dinamis, jadi build tidak perlu terhubung ke database.
RUN DATABASE_URL=postgres://build:build@127.0.0.1:1/build PAYLOAD_SECRET=build-only pnpm build

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Berkas unggahan Payload disimpan di /app/media — pasang sebagai volume agar tidak hilang.
RUN mkdir -p media && chown nextjs:nodejs media
USER nextjs
EXPOSE 3000
VOLUME ["/app/media"]
CMD ["node", "server.js"]
