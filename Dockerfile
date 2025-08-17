# Multi-stage Docker build for NestJS application
# Optimized for production with minimal image size

# ================================
# Base Stage - Common dependencies
# ================================
FROM node:20-slim AS base

# Install pnpm globally
RUN npm install -g pnpm@latest

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# ================================
# Development Stage
# ================================
FROM base AS development

# Install system dependencies including OpenSSL for Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose port and debug port
EXPOSE 3000 9229

# Start development server with hot reload
CMD ["pnpm", "start:dev"]

# ================================
# Build Stage - Compile TypeScript
# ================================
FROM base AS builder

# Install all dependencies for building
RUN pnpm install --frozen-lockfile

# Copy source code and configuration
COPY . .

# Generate Prisma client
RUN pnpm run db:generate

# Run type checking (skip lint for now - we'll fix formatting locally)
RUN pnpm run typecheck

# Build the application
RUN pnpm run build

# Remove development dependencies (disable prepare script to avoid husky issues)
RUN pnpm prune --prod --ignore-scripts

# ================================
# Production Stage - Minimal runtime
# ================================
FROM node:20-slim AS production

# Install system dependencies and create non-root user
RUN apt-get update && apt-get install -y \
    dumb-init \
    curl \
    ca-certificates \
    openssl \
    && groupadd -g 1001 nodejs \
    && useradd -r -u 1001 -g nodejs nestjs \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json for runtime
COPY package.json ./

# Copy production dependencies from builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy Prisma schema and generate client
COPY --chown=nestjs:nodejs ./prisma ./prisma

# Create logs directory
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

# Switch to non-root user
USER nestjs

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]