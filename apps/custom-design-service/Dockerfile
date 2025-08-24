# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Create uploads directory with proper permissions
RUN mkdir -p uploads/reference-images && \
    chown -R node:node uploads

# Copy the rest of the application code
COPY . .

# Create a non-root user to run the application
RUN chown -R node:node /app
USER node

# Expose the port the app runs on
EXPOSE 5006

# # Add health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node healthcheck.js || exit 1

# Start the application
CMD ["npm", "start"]