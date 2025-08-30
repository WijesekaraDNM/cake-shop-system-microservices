#!/bin/sh
# entrypoint.sh

# Run Prisma migrations before starting the app
npx prisma migrate deploy

# Start the app
node dist/index.js
