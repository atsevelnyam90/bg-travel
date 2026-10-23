FROM node:22-bookworm-slim AS build
WORKDIR /app/portal
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# The public site imports these files directly; fail the build if a source transfer omitted them.
RUN test -s public/wp-content/themes/blacktomato/dist/css/base.css \
 && test -s public/wp-content/themes/blacktomato/dist/css/current.css \
 && test -s public/wp-content/themes/blacktomato/dist/css/home-inline.css
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_APP_NAME="BG Travel"
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
RUN pnpm build

FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
# Next standalone tracing omits pnpm's nested @swc/helpers dependency here.
COPY --from=build --chown=node:node /app/portal/node_modules ./node_modules
COPY --from=build --chown=node:node /app/portal/.next/standalone ./
COPY --from=build --chown=node:node /app/portal/.next/static ./.next/static
COPY --from=build --chown=node:node /app/portal/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
