FROM node:12.14.0-alpine3.11

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package.json ./package.json

COPY .env.example ./.env

RUN npm install --production

RUN npm install typescript

COPY . .

RUN npm run build

RUN rm src -r

EXPOSE 3333

CMD ["node", "build/server.js"]