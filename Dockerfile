# ---------- Build Stage ----------
    FROM node:20-alpine AS build
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    COPY . .
    
    RUN npm run build
    
    # ---------- Runtime Stage ----------
    FROM nginx:alpine
    
    # Install gettext for envsubst
    RUN apk add --no-cache gettext
    
    # Copy build output
    COPY --from=build /app/build /usr/share/nginx/html
    
    # Copy template for config.js
    RUN echo 'window._env_ = { \
      REACT_APP_BASEURL: "${REACT_APP_BASEURL}", \
      REACT_APP_EMAILJS_SERVICE_ID: "${REACT_APP_EMAILJS_SERVICE_ID}", \
      REACT_APP_EMAILJS_TEMPLATE_ID: "${REACT_APP_EMAILJS_TEMPLATE_ID}", \
      REACT_APP_EMAILJS_USER_ID: "${REACT_APP_EMAILJS_USER_ID}", \
      RZRPAY_KEYID: "${RZRPAY_KEYID}", \
      REACT_APP_SECRET_KEY: "${REACT_APP_SECRET_KEY}", \
      REACT_APP_IV: "${REACT_APP_IV}" \
    };' > /usr/share/nginx/html/config.js.template
    
    # Entry point script to replace env vars at runtime
    RUN echo '#!/bin/sh\n\
    envsubst < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js\n\
    exec nginx -g "daemon off;"\n' > /docker-entrypoint.sh \
     && chmod +x /docker-entrypoint.sh
    
    # Cloud Run expects PORT
    ENV PORT=8080
    EXPOSE ${PORT}
    
    CMD ["/docker-entrypoint.sh"]
    