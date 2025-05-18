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
FROM builder as builder-api
RUN apk add --no-cache wget
ENV NODE_ENV=production
COPY apps/api ./apps/api
COPY libs/utils ./libs/utils
RUN cd apps/api && pnpm install
RUN pnpm nx run @crdbl/api:build
CMD ["pnpm", "nx", "run", "@crdbl/api:start"]

# # TODO slim image size
# FROM base AS runner-api
# ENV NODE_ENV=production
# COPY --from=builder-api /src/apps/api/dist /src/apps/api/dist
# COPY --from=builder-api /src/apps/api/package.json /src/apps/api/
