# Stage 1: Build Stage
FROM node:20 AS builder

# Set the working directory
WORKDIR /app

RUN printenv

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the TypeScript files
RUN npm run build

RUN npx prisma generate

# Production Stage
FROM node:20-slim AS production

WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

# Copy built files and the full node_modules from the builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/openapi/schema.yaml ./openapi/schema.yaml

RUN npm ci --only=production

COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Expose the port
EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:4000/api/health || exit 1

# Start the app
CMD ["node", "dist/src/index.js"]