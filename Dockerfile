ARG ALPINE_VERSION=3.23

FROM node:24-alpine${ALPINE_VERSION} AS base
RUN corepack disable \
    && rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Build app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN if [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Runtime image without npm/yarn
FROM alpine:${ALPINE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libstdc++ libc6-compat \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=base /usr/local/bin/node /usr/local/bin/node
COPY --from=base /usr/local/bin/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p .next && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 5000

CMD ["node", "server.js"]