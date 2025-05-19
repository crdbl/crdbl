# Stage 0: Base
FROM node:22-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NX_DAEMON=false
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_HOME="/pnpm"
RUN corepack enable && corepack install --global pnpm@latest
WORKDIR /src

# Stage 1: Build
FROM base AS builder
COPY \
  .npmrc \
  eslint* \
  nx.json \
  package.json \
  pnpm-lock.yaml \
  pnpm-workspace.yaml \
  tsconfig* \
  ./
RUN pnpm install --prod --frozen-lockfile

# Stage 2: Build App
FROM builder as builder-web
ENV NODE_ENV=production
COPY apps/web ./apps/web
COPY libs/utils ./libs/utils
RUN cd apps/web && pnpm install
RUN pnpm nx run @crdbl/web:build

# Stage 3: Build Runner
FROM joseluisq/static-web-server:2 AS runner-web
ENV SERVER_ROOT=/app
COPY --from=builder-web /src/apps/web/dist ${SERVER_ROOT}
