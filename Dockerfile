FROM node:20-alpine

WORKDIR /

COPY package*.json ./
RUN npm install -f
COPY . .
RUN npm run build

# Install serve to run the React app
RUN npm install -g serve

# Cloud Run expects the container to listen on $PORT
ENV PORT=8080

# Expose the port
EXPOSE ${PORT}

# Start the server
CMD ["serve", "-s", "build", "-l", "8080"]