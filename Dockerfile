# Build stage for Mastra application
FROM node:20-slim AS builder

WORKDIR /app

# Copy the entire project for Mastra build
COPY . .

# Install Mastra CLI and dependencies
RUN npm install -g @mastra/cli && \
    npm install

# Build the Mastra application
RUN mastra build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy only the built application from builder stage
COPY --from=builder /app/.mastra/output ./

# Install production dependencies
RUN npm ci --only=production

# Expose the Mastra default port
EXPOSE 4111

# Set environment variables
ENV NODE_ENV=production

# Start the Mastra server
CMD ["node", "index.mjs"]
