FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN mkdir -p uploads/images uploads/models

EXPOSE 3000

CMD ["sh", "-c", "yarn sequelize db:migrate --config config/index.js && node server.js"]
