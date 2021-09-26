FROM node:lts-alpine

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories; \
    apk add --no-cache \
    dumb-init; \
    npm install cnpm -g --registry=https://registry.nlark.com

WORKDIR /app

COPY package*.json ./

RUN cnpm i

COPY . .

ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "start"]