FROM node:20

WORKDIR /usr/src/app

RUN rm -rf databases

RUN mkdir -p databases

COPY package.json ./

RUN npm install -g bun

RUN bun install

COPY . .

EXPOSE 3000

CMD ["bun", "run", "start"]
