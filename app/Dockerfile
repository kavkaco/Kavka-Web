FROM node:22-alpine as builder

WORKDIR /build

COPY . /build

RUN yarn

RUN yarn build

FROM node:22-alpine as runtime

WORKDIR /app

COPY --from=builder /build .

EXPOSE 4000

CMD [ "yarn", "serve:ssr" ]
