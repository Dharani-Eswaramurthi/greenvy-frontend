# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

RUN npm install -g serve


ENV PORT=8080
EXPOSE ${PORT}

CMD exec serve -s build
  