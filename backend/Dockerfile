# backend/Dockerfile (multi-stage)

FROM rust:latest AS builder
WORKDIR /app/build

# System deps
RUN apt-get update && apt-get install -y \
    libssl-dev pkg-config ca-certificates build-essential \
    libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# -------------------------
# 1. Cache dependencies
# -------------------------
COPY Cargo.toml Cargo.lock ./
COPY what_anime_shared/Cargo.toml ./what_anime_shared/
COPY anisong_api/Cargo.toml ./anisong_api/
COPY database_api/Cargo.toml ./database_api/
COPY spotify_api/Cargo.toml ./spotify_api/
COPY anilist_api/Cargo.toml ./anilist_api/

# dummy sources so cargo fetch works
RUN mkdir -p what_anime_shared/src anisong_api/src database_api/src spotify_api/src anilist_api/src \
    && echo "// dummy" > what_anime_shared/src/lib.rs \
    && echo "// dummy" > anisong_api/src/lib.rs \
    && echo "// dummy" > database_api/src/lib.rs \
    && echo "// dummy" > spotify_api/src/lib.rs \
    && echo "// dummy" > anilist_api/src/lib.rs \
    && mkdir -p src \
    && echo "fn main(){}" > src/main.rs

RUN cargo fetch

COPY . .

RUN cargo build --release

# Optional: install sqlx-cli (not needed unless you actually use it)
RUN cargo install sqlx-cli --no-default-features --features postgres

# -------------------------
# Runtime
# -------------------------
FROM debian:bookworm-slim
ENV RUST_LOG=info

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home appuser

COPY --from=builder /app/build/target/release/backend /usr/local/bin/backend
COPY --from=builder /usr/local/cargo/bin/sqlx /usr/local/bin/sqlx

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8005
CMD ["/usr/local/bin/backend"]