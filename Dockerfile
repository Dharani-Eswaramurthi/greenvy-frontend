FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g serve
COPY . .
RUN npm run build

ENV PORT=8080
CMD ["serve", "-s", "build", "-l", "8080"]
