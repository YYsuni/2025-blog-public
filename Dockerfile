# syntax=docker/dockerfile:1.7

# ===== Stage 1: Install dependencies =====
FROM node:22-alpine AS deps
# libc6-compat helps native modules on alpine; git is needed by pnpm for some packages
RUN apk add --no-cache libc6-compat git
# Install pnpm via npm (more reliable than corepack on alpine)
RUN npm install -g pnpm@10

WORKDIR /app

# Copy only manifest files so this layer caches independently
COPY package.json pnpm-lock.yaml* .npmrc* ./

# Use BuildKit's cache mount so the pnpm content-addressable store is reused
# across builds. Cuts install time from minutes to seconds when only source
# code (not package.json) has changed.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

# ===== Stage 2: Build the application =====
# .env.docker is the single source of truth for every variable in this
# project. The builder resolves build-time env in this priority order:
#
#   1. BuildKit secret (CI / production):
#        docker build --secret id=env_docker,src=.env.docker .
#      The file is mounted at build time only and never written to any image
#      layer, so secrets stay out of the registry.
#
#   2. .env.docker in the build context (local dev):
#        docker build .
#      The .dockerignore has `!.env.docker` so the file is shipped to the
#      builder context. Convenient, but the value DOES end up in the
#      intermediate builder layer — don't `docker push <builder-stage>`.
#
#   3. --build-arg / Dockerfile defaults (last-resort fallback).
#
# `set -a; . file` exports every KEY=value pair from the file into the
# shell's environment, which is exactly what Next.js reads at build time
# to inline `NEXT_PUBLIC_*` into the client bundle. `: ${VAR:?msg}` makes
# missing required keys fatal instead of silently empty.
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat git
RUN npm install -g pnpm@10

WORKDIR /app

# Reuse dependencies from the previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source (also brings in .env.docker when it's checked
# into the build context — see .dockerignore's `!.env.docker` rule).
COPY . .

# Load env then build. The `--mount=type=secret` is opt-in: if you don't pass
# `--secret id=env_docker,...` to `docker build`, the secret mount simply
# doesn't exist and the script falls through to .env.docker / ARGs.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    set -a; \
    if [ -f /run/secrets/env_docker ]; then \
        echo ">> [env] source: BuildKit secret"; \
        . /run/secrets/env_docker; \
    elif [ -f .env.docker ]; then \
        echo ">> [env] source: .env.docker (build context)"; \
        . ./.env.docker; \
    else \
        echo ">> [env] source: --build-arg / Dockerfile defaults"; \
    fi; \
    set +a && \
    pnpm config set store-dir /pnpm/store && \
    : "${NEXT_PUBLIC_SITE_URL:?NEXT_PUBLIC_SITE_URL must be set (via .env.docker, --secret, or --build-arg)}" && \
    pnpm build

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    # pnpm asks for interactive confirmation when removing the modules
    # directory; signal CI mode so it proceeds non-interactively in Docker.
    CI=1

# Strip devDependencies so the node_modules copied into the runtime image
# only contains production deps.
RUN pnpm prune --prod

# ===== Stage 3: Production runtime =====
FROM node:22-alpine AS runner
# tini provides a proper PID 1 that forwards signals (notably SIGTERM) to the
# Node process, so `docker stop` performs a graceful shutdown instead of
# waiting out the 10s SIGKILL default.
RUN apk add --no-cache libc6-compat tini

# PORT is configurable at build time; the literal 2025 below is just a
# documentation hint because Dockerfile `EXPOSE` does not expand variables.
# The actual listener is governed by the PORT env var consumed in CMD.
ARG PORT=2025
ENV PORT=$PORT \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0

# Create a non-root user for better security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy the minimal set of files needed at runtime
COPY --from=builder --chown=nextjs:nodejs /app/public            ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next             ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules      ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json      ./package.json

USER nextjs

# Literal: Dockerfile `EXPOSE` does not support variable expansion.
EXPOSE 2025

# tini as PID 1 ensures graceful shutdown. We invoke `node` directly instead
# of `pnpm start` so pnpm does not need to be installed in the runtime image.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "node node_modules/next/dist/bin/next start -p ${PORT:-2025}"]
