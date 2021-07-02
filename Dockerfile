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
FROM node:lts-buster-slim as node-builder
LABEL builder=true
RUN apt-get update \
 && apt-get install -y python build-essential \
 && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /root/app
WORKDIR /root/app

ADD ./client ./client
WORKDIR /root/app/client
RUN npm ci
RUN NODE_ENV=production npm run build

#
# RUST BUILDER
#
FROM rust:1.52-slim-buster as rust-builder
LABEL builder=true

RUN mkdir -p /root/app
WORKDIR /root/app
RUN apt-get update && \
      apt-get install -y \
      build-essential \
      cmake \
      curl \
      file \
      git \
      # libpq-dev \
      libssl-dev \
      pkgconf \
      xutils-dev \
      ca-certificates

ADD ./server ./server
WORKDIR ./server
RUN cargo build --release

#
# RUNNER
#
FROM node:15-buster-slim as runner
RUN apt-get update \
 && apt-get install -y git libssl1.1 \
 && rm -rf /var/lib/apt/lists/*
RUN npm install -g concurrently
RUN mkdir /root/app
WORKDIR /root/app
WORKDIR /root/app
COPY --from=node-builder /root/app/client/build ./public
COPY --from=rust-builder /root/app/server/target/release/slice-n-dice-server .
COPY --from=golang-builder /root/app/gateway/slice-gateway .

ENV GATEWAY_URL http://:8090
ENV SERVER_URL http://localhost:8091
ENV READ_URL http://localhost:8092

EXPOSE 8090
CMD concurrently -n 'Gateway,Server' -c 'yellow,cyan' --kill-others './slice-gateway' './slice-n-dice-server'

