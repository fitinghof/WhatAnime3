# backend/Dockerfile (multi-stage)
# Build stage using the latest Rust
# NOTE: this Dockerfile assumes the build context is the backend
# directory itself (it contains Cargo.toml and all path‑dependency
# crates).  You can still build from the repo root with
# `docker build -f backend/Dockerfile .`, but it is not required.
# The cache step copies the manifests so `cargo fetch` can populate
# the registry cache without the full source tree.
FROM rust:latest AS builder
# build in a subdirectory under the canonical container root
WORKDIR /whatanime/backend/build

# Install system deps for building and Postgres client for sqlx-cli (if needed)
RUN apt-get update && apt-get install -y libssl-dev pkg-config ca-certificates build-essential \
    libpq-dev curl && rm -rf /var/lib/apt/lists/*

# Cache dependencies
# copy the workspace manifest and each member's Cargo.toml so cargo fetch can resolve them
COPY Cargo.toml Cargo.lock ./
# backend crate shares the top-level lockfile, only its manifest is needed
# COPY Cargo.toml ./backend/
COPY what_anime_shared/Cargo.toml ./what_anime_shared/
COPY anisong_api/Cargo.toml ./anisong_api/
COPY database_api/Cargo.toml ./database_api/
COPY spotify_api/Cargo.toml ./spotify_api/
COPY anilist_api/Cargo.toml ./anilist_api/

# create minimal lib.rs files for each path‑dependency so that Cargo
# can parse their manifests during the `cargo fetch` step.  Otherwise
# the manifests are seen without any targets and fetch errors out.
RUN mkdir -p what_anime_shared/src \
    anisong_api/src \
    database_api/src \
    spotify_api/src \
    anilist_api/src \
 && echo "// dummy" > what_anime_shared/src/lib.rs \
 && echo "// dummy" > anisong_api/src/lib.rs \
 && echo "// dummy" > database_api/src/lib.rs \
 && echo "// dummy" > spotify_api/src/lib.rs \
 && echo "// dummy" > anilist_api/src/lib.rs

# dummy main to allow `cargo fetch` without full source
RUN mkdir -p src && echo "fn main(){}" > src/main.rs
# cargo fetch must be run in a directory containing Cargo.toml; the
# previous COPY step places the workspace root manifest at the current
# working directory (/whatanime/backend/build)
RUN [ -f Cargo.toml ] && cargo fetch || (echo "Cargo.toml missing; build context likely wrong" && exit 1)

# Copy the rest of the repository and build the release binary.
# We don't actually have a `[workspace]` section in Cargo.toml, so
# `--workspace` would fail; build the default package instead.
COPY . .
RUN cargo build --release

# install sqlx-cli so we can run migrations from container
RUN cargo install sqlx-cli --no-default-features --features postgres

# Runtime stage
FROM debian:bookworm-slim
ENV RUST_LOG=info
# place the app in the unified project tree so other services can see it
WORKDIR /whatanime/backend

# install minimal runtime libraries used by our binary
# (reqwest/openssl, postgres client, and CA certificates)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home appuser
# Copy binary + migrations (if present)
COPY --from=builder /whatanime/backend/build/target/release/backend /usr/local/bin/backend
COPY --from=builder /usr/local/cargo/bin/sqlx /usr/local/bin/sqlx
COPY --from=builder /whatanime/backend/build/migrations /app/migrations

# fix ownership and switch off root
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8005
CMD ["/usr/local/bin/backend"]
