# Stage 1: Build
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

# Copy source files
COPY . .

# Build the React app
RUN pnpm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built files to nginx directory
COPY --from=builder /app/build /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon on;"]
