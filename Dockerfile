# ---- Build stage ----
    FROM node:20-alpine AS build
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build
    
    # ---- Runtime stage ----
    FROM nginx:alpine
    
    # Install envsubst (for replacing env vars in JS at runtime)
    RUN apk add --no-cache gettext
    
    # Copy build output
    COPY --from=build /app/build /usr/share/nginx/html
    
    # Add a template config.js file (will be replaced at startup)
    COPY public/config.js /usr/share/nginx/html/config.js.template
    
    # Copy nginx configuration
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Cloud Run expects the container to listen on $PORT
    ENV PORT=8080
    RUN sed -i "s/listen       80;/listen       ${PORT};/" /etc/nginx/conf.d/default.conf \
     && sed -i "s/listen  \[::\]:80;/listen  \[::\]:${PORT};/" /etc/nginx/conf.d/default.conf
    
    EXPOSE ${PORT}
    
    # Replace env vars in config.js.template -> config.js on container start
    CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js && exec nginx -g 'daemon off;'"]
    