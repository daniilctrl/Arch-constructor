# Single-stage build for the Nest API in a pnpm workspace.
# Build context must be the monorepo root.
#
# We ship TypeScript source and run with tsx — same way as dev. This keeps
# dev/prod identical (single source of truth) and avoids a separate compile
# step for @arch/core. The startup cost is negligible for this app.

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

ENV NODE_ENV=production
# We need prisma CLI at runtime for `migrate deploy`. Tell pnpm to install
# devDependencies too despite NODE_ENV=production.
ENV NPM_CONFIG_PRODUCTION=false

# Install deps (cached layer).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/core/package.json packages/core/
RUN pnpm install --frozen-lockfile

# Copy sources.
COPY packages/core ./packages/core
COPY apps/api ./apps/api

# Generate Prisma client (binaryTargets include linux-musl-openssl-3.0.x).
RUN pnpm --filter @arch/api prisma:generate

EXPOSE 3001

# Apply migrations on boot, then start. `prisma migrate deploy` is idempotent.
CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy && pnpm start"]
