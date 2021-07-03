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
FROM node:16-buster-slim as node-builder
LABEL builder=true

RUN mkdir -p /root/app
WORKDIR /root/app

ADD ./client ./client
WORKDIR /root/app/client
RUN npm ci
RUN NODE_ENV=production npm run build

#
# RUST BUILDER
#
FROM rust:1.53-slim-buster as rust-builder
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

ADD ./server ./server
WORKDIR ./server
RUN cargo build --release

#
# RUNNER
#
FROM debian:buster-slim as runner
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

