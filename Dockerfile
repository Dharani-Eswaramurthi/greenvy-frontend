FROM node:20-alpine AS build
WORKDIR /app

# Clean up any existing build artifacts
RUN rm -rf build/ node_modules/ package-lock.json

WORKDIR /

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine

# Copy build output to Nginx html folder
COPY --from=build /build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run expects the container to listen on $PORT
ENV PORT=8080
RUN sed -i "s/listen       80;/listen       ${PORT};/" /etc/nginx/conf.d/default.conf \
 && sed -i "s/listen  \[::\]:80;/listen  \[::\]:${PORT};/" /etc/nginx/conf.d/default.conf

# Expose the port
EXPOSE ${PORT}

CMD ["nginx", "-g", "daemon off;"]