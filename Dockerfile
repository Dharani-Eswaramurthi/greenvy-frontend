FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Set base URL for API (only available at build time in React)
ARG REACT_APP_BASEURL=https://api.greenvy.store
ENV REACT_APP_BASEURL=$REACT_APP_BASEURL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
ENV PORT=8080
CMD ["nginx", "-g", "daemon off;"]