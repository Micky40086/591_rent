FROM node:latest

WORKDIR /app

RUN apt update

COPY package*.json ./

RUN npm install
RUN npx playwright install --with-deps

CMD ["node", "index.js"]
