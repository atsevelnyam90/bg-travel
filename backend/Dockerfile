FROM node:22-bookworm-slim AS build
WORKDIR /app/backend
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* && corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile
COPY tsconfig.json tsup.config.ts ./
COPY scripts ./scripts
COPY src ./src
RUN pnpm build

FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=4000 COREPACK_HOME=/opt/corepack
WORKDIR /app/backend
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* && mkdir -p /opt/corepack && corepack enable \
    && corepack prepare pnpm@11.22.0 --activate
COPY --from=build /app/backend /app/backend
RUN mkdir -p /app/backend/storage/legacy-travel-files && chown -R node:node /app/backend/storage
USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]
