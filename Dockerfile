FROM node:22-alpine

WORKDIR /app

COPY . .

RUN yarn install

RUN yarn build

EXPOSE 4000

CMD [ "yarn", "serve:ssr" ]
