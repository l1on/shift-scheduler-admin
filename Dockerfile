FROM node:10-alpine

WORKDIR /app

COPY . /app

RUN npm install --only=production && rm package-lock.json

CMD ["npm", "start"]