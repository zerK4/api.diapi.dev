FROM oven/bun:alpine

WORKDIR /usr/src/app

RUN mkdir -p databases

COPY package.json .
COPY bun.lockb .

COPY src src
COPY tsconfig.json .
COPY drizzle.config.ts .

RUN bun install

COPY . .

CMD ["bun", "run", "start"]

EXPOSE 3000
