# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

# ---------- Runtime Stage ----------
FROM nginx:alpine

# Copy build output
COPY --from=build /app/build /usr/share/nginx/html

# Create config.js with environment variables directly
RUN echo 'window._env_ = { \
    REACT_APP_BASEURL: "https://api.greenvy.store", \
    REACT_APP_EMAILJS_SERVICE_ID: "service_t9j0qkk", \
    REACT_APP_EMAILJS_TEMPLATE_ID: "template_ibnozre", \
    REACT_APP_EMAILJS_USER_ID: "lDUkHYN4AyCPTu_2y", \
    RZRPAY_KEYID: "rzp_test_yzTRoxfvXoHqcL", \
    REACT_APP_SECRET_KEY: "YmZkMzkzO2lpaDplczpzbjA7c29wYWF0Om9kZXNvY2s=", \
    REACT_APP_IV: "A1B2C3D4E5F60708" \
};' > /usr/share/nginx/html/config.js

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Cloud Run expects to listen on $PORT
ENV PORT=8080
EXPOSE ${PORT}    