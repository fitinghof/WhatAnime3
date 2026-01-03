# Build stage
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage: distroless
FROM gcr.io/distroless/nodejs20

WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3000
CMD ["server.js"]
