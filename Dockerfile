# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL=https://stroistroy.ru
ARG NEXT_PUBLIC_YM_ID=
ARG NEXT_PUBLIC_GA_ID=
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_YM_ID=$NEXT_PUBLIC_YM_ID
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
# 2 GB VPS: без swap TypeScript-check съедает RAM и «висит» часами
ENV SKIP_TYPE_CHECK=1
ENV NODE_OPTIONS=--max-old-space-size=1536
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/.data && chown nextjs:nodejs /app/.data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
