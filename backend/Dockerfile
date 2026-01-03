# backend/Dockerfile (multi-stage)
# Build stage
FROM rust:1.72-slim AS builder
WORKDIR /work

# Install system deps for building and Postgres client for sqlx-cli (if needed)
RUN apt-get update && apt-get install -y libssl-dev pkg-config ca-certificates build-essential \
    libpq-dev curl && rm -rf /var/lib/apt/lists/*

# Cache dependencies
COPY Cargo.toml Cargo.lock ./
# if you use workspace, copy workspace manifests accordingly
RUN mkdir src && echo "fn main(){}" > src/main.rs
RUN cargo fetch

# Copy source & build release
COPY . .
RUN cargo build --release

# install sqlx-cli so we can run migrations from container
RUN cargo install sqlx-cli --no-default-features --features postgres

# Runtime stage
FROM debian:bookworm-slim
ENV RUST_LOG=info
WORKDIR /app

# Create non-root user
RUN useradd --create-home appuser
# Copy binary + migrations (if present)
COPY --from=builder /work/target/release/your_binary_name /usr/local/bin/your_binary_name
COPY --from=builder /usr/local/cargo/bin/sqlx /usr/local/bin/sqlx
COPY --from=builder /work/migrations /app/migrations

# chown
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["/usr/local/bin/your_binary_name"]
