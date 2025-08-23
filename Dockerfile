# ---------- Build Stage ----------
    FROM node:20-alpine AS build
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    COPY . .
    
    RUN npm run build
    
    # ---------- Runtime Stage ----------
    FROM node:20-alpine
    
    # Install serve to run the React app and gettext for envsubst
    RUN npm install -g serve && apk add --no-cache gettext
    
    # Copy build output
    COPY --from=build /app/build /app/build
    
    # Copy template for config.js
    RUN echo 'window._env_ = { \
      REACT_APP_BASEURL: "${REACT_APP_BASEURL}", \
      REACT_APP_EMAILJS_SERVICE_ID: "${REACT_APP_EMAILJS_SERVICE_ID}", \
      REACT_APP_EMAILJS_TEMPLATE_ID: "${REACT_APP_EMAILJS_TEMPLATE_ID}", \
      REACT_APP_EMAILJS_USER_ID: "${REACT_APP_EMAILJS_USER_ID}", \
      RZRPAY_KEYID: "${RZRPAY_KEYID}", \
      REACT_APP_SECRET_KEY: "${REACT_APP_SECRET_KEY}", \
      REACT_APP_IV: "${REACT_APP_IV}" \
    };' > /app/build/config.js.template
    
    # Entry point script to replace env vars at runtime
    RUN echo '#!/bin/sh\n\
    envsubst < /app/build/config.js.template > /app/build/config.js\n\
    exec serve -s build -l ${PORT:-8080}\n' > /docker-entrypoint.sh \
     && chmod +x /docker-entrypoint.sh
    
    # Set working directory
    WORKDIR /app
    
    # Cloud Run expects PORT
    ENV PORT=8080
    EXPOSE ${PORT}
    
    CMD ["/docker-entrypoint.sh"]
    