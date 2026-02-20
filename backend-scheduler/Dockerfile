FROM rust:1.92 AS builder
WORKDIR /app
COPY . .
RUN cargo build --release
FROM ubuntu:24.04
WORKDIR /app
RUN apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/scheduler /app/server 

CMD ["./server"]