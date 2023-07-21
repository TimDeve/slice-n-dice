#
# GOLANG BUILDER
#
FROM golang:1.16 as golang-builder
LABEL builder=true

RUN mkdir -p /root/app

ADD ./gateway /root/app/gateway

WORKDIR /root/app/gateway

RUN go get -d -v ./...

RUN go build -o slice-gateway ./...

#
# NODE BUILDER
#
FROM node:16-bullseye-slim as node-builder
LABEL builder=true

RUN npm install --global pnpm@8

RUN mkdir -p /root/app/client
WORKDIR /root/app/client

ADD client/package.json client/pnpm-lock.yaml client/.npmrc ./
RUN pnpm install --frozen-lockfile

ADD client .
RUN NODE_ENV=production pnpm run build

#
# RUST BUILDER
#
FROM rust:1.61-slim-bullseye as rust-builder
LABEL builder=true

RUN mkdir -p /root/app
WORKDIR /root/app
RUN apt-get update \
 && apt-get install -y \
            build-essential \
            git \
            libssl-dev \
            pkgconf \
            ca-certificates \
 && rm -rf /var/lib/apt/lists/*

RUN cargo new --bin server --name slice-n-dice-server
WORKDIR ./server
ADD ./server/Cargo.lock ./server/Cargo.toml ./
RUN cargo build --release

ADD ./server .
RUN rm ./target/release/deps/*slice_n_dice_server*
RUN cargo build --release

#
# RUNNER
#
FROM debian:bullseye-slim as runner
RUN apt-get update \
 && apt-get install -y \
            libssl1.1 \
            supervisor \
 && rm -rf /var/lib/apt/lists/*

RUN mkdir /root/app
WORKDIR /root/app

RUN mkdir -p /var/log/supervisor
COPY supervisord.conf supervisord.conf

COPY --from=node-builder /root/app/client/build ./public
COPY --from=rust-builder /root/app/server/target/release/slice-n-dice-server .
COPY --from=golang-builder /root/app/gateway/slice-gateway .

ENV GATEWAY_URL http://:8090
ENV SERVER_URL http://localhost:8091
ENV READ_URL http://localhost:8092

EXPOSE 8090
CMD ["supervisord", "-n", "-c", "/root/app/supervisord.conf"]

