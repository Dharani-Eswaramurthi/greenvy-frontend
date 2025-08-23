FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine

# Install a simple HTTP server
RUN npm install -g serve

WORKDIR /app

# Copy build output
COPY --from=build /app/build ./build

# Cloud Run expects the container to listen on $PORT
ENV PORT=8080

# Expose the port
EXPOSE ${PORT}

# Start the server
CMD ["serve", "-s", "build", "-l", "8080"]