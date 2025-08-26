FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies (use npm ci for clean install in production)
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create a non-root user to run the application (security best practice)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the /app directory to the non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose the port the app runs on
EXPOSE 5005

# Define environment variable
ENV NODE_ENV=production
ENV PORT=5005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5005/health || exit 1

# Command to run the application
CMD ["node", "server.js"]