# Build stage
FROM node:20-slim AS builder

# ensure the desired directory exists and switch to it
RUN mkdir -p /app/frontend
WORKDIR /app/frontend

# copy the full source tree, then install dependencies
COPY . /app/frontend
RUN npm ci

RUN npm run build

# Runtime stage: use a full Node image so we can run `npm start`
FROM node:20-slim

WORKDIR /app/frontend
# copy everything from the builder (includes node_modules and .next)
COPY --from=builder /app/frontend /app/frontend

EXPOSE 5173
# use the same start script that's defined in package.json
CMD ["npm","run","start"]
