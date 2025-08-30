# FROM node:18-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install --production

# COPY . .

# EXPOSE 5001

# CMD ["node", "src/app.js"]


FROM node:22-alpine3.20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5001

CMD ["npm", "start"]
