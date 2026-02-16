FROM node:18-alpine

WORKDIR /app

# Copy root package files (if any)
COPY package*.json ./

# Copy server directory
COPY server/ ./server/

WORKDIR /app/server

# Install dependencies
RUN npm install

# Expose port
EXPOSE ${PORT:-3001}

# Start server
CMD ["npm", "start"]
