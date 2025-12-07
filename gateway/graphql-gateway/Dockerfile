FROM node:22-alpine AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY gateway/graphql-gateway ./gateway/graphql-gateway

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages
COPY --from=dependencies /app/gateway/graphql-gateway ./gateway/graphql-gateway
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Build the service and its dependencies
RUN pnpm --filter graphql-gateway... build

FROM base AS deploy
WORKDIR /app
COPY --from=build /app /app

# Expose port
EXPOSE 4000

# Start the service
CMD ["node", "gateway/graphql-gateway/dist/main.js"]
