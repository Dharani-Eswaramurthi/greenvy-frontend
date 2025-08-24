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

ENV PORT=8080
EXPOSE ${PORT}

CMD exec serve -s build
  