# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY .mastra/output/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY .mastra/output/ ./

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app ./

# Expose the port your app runs on (adjust if needed)
EXPOSE 4111

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "index.mjs"]
