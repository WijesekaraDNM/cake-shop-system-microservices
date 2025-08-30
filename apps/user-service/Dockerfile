FROM node:22-alpine3.20

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 5002

CMD ["node", "src/app.js"]
