# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# Build the application
RUN npm run build

# ---------- Runtime Stage ----------
FROM nginx:alpine

# Copy the built app
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create a script to inject environment variables
RUN echo '#!/bin/sh\n\
echo "window._env_ = {" > /usr/share/nginx/html/config.js\n\
echo "  REACT_APP_BASEURL: \"$REACT_APP_BASEURL\"," >> /usr/share/nginx/html/config.js\n\
echo "  REACT_APP_EMAILJS_SERVICE_ID: \"$REACT_APP_EMAILJS_SERVICE_ID\"," >> /usr/share/nginx/html/config.js\n\
echo "  REACT_APP_EMAILJS_TEMPLATE_ID: \"$REACT_APP_EMAILJS_TEMPLATE_ID\"," >> /usr/share/nginx/html/config.js\n\
echo "  REACT_APP_EMAILJS_USER_ID: \"$REACT_APP_EMAILJS_USER_ID\"," >> /usr/share/nginx/html/config.js\n\
echo "  RZRPAY_KEYID: \"$RZRPAY_KEYID\"," >> /usr/share/nginx/html/config.js\n\
echo "  REACT_APP_SECRET_KEY: \"$REACT_APP_SECRET_KEY\"," >> /usr/share/nginx/html/config.js\n\
echo "  REACT_APP_IV: \"$REACT_APP_IV\"" >> /usr/share/nginx/html/config.js\n\
echo "};" >> /usr/share/nginx/html/config.js\n\
nginx -g "daemon off;"' > /docker-entrypoint.sh
 
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080

CMD ["/docker-entrypoint.sh"]
  