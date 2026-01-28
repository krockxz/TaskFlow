# TaskFlow Dockerfile
# Multi-stage build for optimized production image using Next.js standalone output

# Stage 1: Base image with dependencies
FROM node:20-alpine AS base
# Install libc6-compat for better compatibility with Prisma and native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
# Copy package files
COPY package.json package-lock.json* ./
# Install dependencies using npm ci for reproducible builds
RUN npm ci

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app
# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY . .
# Generate Prisma client (required for database access)
RUN npx prisma generate
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1
# Build the application with standalone output
RUN npm run build

# Stage 4: Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
# Standalone server and dependencies (minimal output from Next.js)
COPY --from=builder /app/.next/standalone ./
# Static files (CSS, JS chunks)
COPY --from=builder /app/.next/static ./.next/static
# Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma
# Prisma client and engine (required for database operations)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Set ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Set environment variables for the server
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the server using the standalone server.js
CMD ["node", "server.js"]
