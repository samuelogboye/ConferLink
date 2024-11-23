# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source files
COPY . .

# Build the TypeScript code
RUN pnpm run build

# Stage 2: Run
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies
RUN pnpm install --production

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]
