FROM node:16

WORKDIR /app

COPY package*.json ./
RUN npm ci
RUN npm upgrade

COPY . .

EXPOSE $PORT

CMD ["npm", "start"]
