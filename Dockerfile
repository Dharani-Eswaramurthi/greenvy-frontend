# ---------- Build Stage ----------
  FROM node:20-alpine AS build
  WORKDIR /app
  
  COPY package*.json ./
  RUN npm install
  COPY . .
  RUN npm run build
  
  # ---------- Runtime Stage ----------
  FROM node:20-alpine
  
  RUN npm install -g serve
  
  WORKDIR /app
  COPY --from=build /app/build ./build
  
  # Inject runtime env vars into config.js
  RUN echo 'window._env_ = { \
    REACT_APP_BASEURL: "${REACT_APP_BASEURL}", \
    REACT_APP_EMAILJS_SERVICE_ID: "${REACT_APP_EMAILJS_SERVICE_ID}", \
    REACT_APP_EMAILJS_TEMPLATE_ID: "${REACT_APP_EMAILJS_TEMPLATE_ID}", \
    REACT_APP_EMAILJS_USER_ID: "${REACT_APP_EMAILJS_USER_ID}", \
    RZRPAY_KEYID: "${RZRPAY_KEYID}", \
    REACT_APP_SECRET_KEY: "${REACT_APP_SECRET_KEY}", \
    REACT_APP_IV: "${REACT_APP_IV}" \
  };' > ./build/config.js
  
  ENV PORT=8080
  EXPOSE ${PORT}
  
  CMD ["sh", "-c", "serve -s build -l $PORT"]
  