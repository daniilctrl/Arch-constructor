# Multi-stage Docker build for the Nest API in a pnpm workspace.
# Build context must be the monorepo root (so we can see packages/core).

# ---------- deps ----------
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/core/package.json packages/core/
RUN pnpm install --frozen-lockfile

# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY --from=deps /app ./
COPY packages/core ./packages/core
COPY apps/api ./apps/api

RUN pnpm --filter @arch/api prisma:generate
RUN pnpm --filter @arch/api build

# ---------- runtime ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Pull installed deps and built artefacts.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=build /app/packages/core ./packages/core
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3001

# Apply migrations on boot, then start. `prisma migrate deploy` is idempotent.
CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy && node dist/main.js"]
