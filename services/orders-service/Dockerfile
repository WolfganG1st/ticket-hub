FROM node:22-alpine AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY services/orders-service ./services/orders-service

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages
COPY --from=dependencies /app/services/orders-service ./services/orders-service
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Build the service and its dependencies
RUN pnpm --filter orders-service... build

FROM base AS deploy
WORKDIR /app
COPY --from=build /app /app

# Expose port
EXPOSE 3002

# Start the service
CMD ["node", "services/orders-service/dist/main-http.js"]
