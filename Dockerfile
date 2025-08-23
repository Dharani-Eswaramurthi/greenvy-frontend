# Use Node.js for both build and runtime
FROM node:20-alpine AS build

WORKDIR /
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from build stage
COPY --from=build /build ./build

# Copy server file
COPY server.js ./

# Install additional dependencies for the server
RUN npm install express cors http-proxy-middleware

# Expose port
EXPOSE 8080

# Set environment variable for port
ENV PORT=8080

# Start the Express server
CMD ["node", "server.js"]
