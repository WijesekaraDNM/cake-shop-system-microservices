# Use Node.js LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose port (your service seems to run on 3003 from scripts)
EXPOSE 3003

# Command to start the consumer service
CMD ["npm", "start"]