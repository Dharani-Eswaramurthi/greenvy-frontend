# ---------- Build Stage ----------
    FROM node:20-alpine AS build
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    COPY . .
    
    RUN npm run build
    
    # ---------- Runtime Stage ----------
    FROM nginx:alpine
    
    # Install envsubst (from gettext) to replace env vars at container start
    RUN apk add --no-cache gettext
    
    # Copy build output
    COPY --from=build /app/build /usr/share/nginx/html
    
    # Generate config.js.template with env variable placeholders
    RUN echo 'window._env_ = { \
      REACT_APP_BASEURL: "$REACT_APP_BASEURL", \
      REACT_APP_EMAILJS_SERVICE_ID: "$REACT_APP_EMAILJS_SERVICE_ID", \
      REACT_APP_EMAILJS_TEMPLATE_ID: "$REACT_APP_EMAILJS_TEMPLATE_ID", \
      REACT_APP_EMAILJS_USER_ID: "$REACT_APP_EMAILJS_USER_ID", \
      RZRPAY_KEYID: "$RZRPAY_KEYID" \
    };' > /usr/share/nginx/html/config.js.template
    
    # Copy custom nginx config
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Replace config.js.template with actual env vars at runtime
    CMD envsubst < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js \
        && exec nginx -g 'daemon off;'
    
    # Cloud Run expects to listen on $PORT
    ENV PORT=8080
    EXPOSE ${PORT}    