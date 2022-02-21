FROM node:16-alpine

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# CMD [ "npm", "start" ]