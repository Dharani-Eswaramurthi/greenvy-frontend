FROM node:20-alpine AS build
WORKDIR /
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine

# Copy build output
COPY --from=build /build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf


# Cloud Run requires listening on $PORT
ENV PORT=8080
RUN sed -i "s/listen       80;/listen       ${PORT};/" /etc/nginx/conf.d/default.conf \
 && sed -i "s/listen  \[::\]:80;/listen  \[::\]:${PORT};/" /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
