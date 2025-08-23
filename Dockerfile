# ---------- Build Stage ----------
    FROM node:20-alpine AS build

    # Set working directory
    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy source code
    COPY . .
    
    # Set base URL for API (only available at build time in React)
    ARG REACT_APP_BASEURL=https://api.greenvy.store
    ENV REACT_APP_BASEURL=$REACT_APP_BASEURL
    
    # Build the app
    RUN npm run build
    
    
    # ---------- Nginx Stage ----------
    FROM nginx:alpine
    
    # Copy build output from builder
    COPY --from=build /app/build /usr/share/nginx/html
    
    # Copy custom nginx.conf
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Cloud Run expects the app to listen on $PORT
    ENV PORT=8080
    RUN sed -i "s/listen       80;/listen       ${PORT};/" /etc/nginx/conf.d/default.conf \
     && sed -i "s/listen  \[::\]:80;/listen  \[::\]:${PORT};/" /etc/nginx/conf.d/default.conf
    
    CMD ["nginx", "-g", "daemon off;"]
    