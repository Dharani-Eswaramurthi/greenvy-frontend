# ---------- Build Stage ----------
FROM node:20-alpine as build
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

EXPOSE 8080

CMD ["serve", "-s", "build", "-l", "8080"]
  