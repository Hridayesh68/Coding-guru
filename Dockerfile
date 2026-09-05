# ==========================================
# Stage 1: Build Frontend SPA
# ==========================================
FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Unified Full-Stack Container
# ==========================================
FROM node:20-bookworm-slim AS production

# Install compiler engines for C++ (g++), Python 3, Java (OpenJDK JDK), and SQLite3
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    python3 \
    default-jdk \
    sqlite3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev --build-from-source

# Copy backend application source
COPY backend/ ./

# Copy built frontend assets into backend/dist for static serving
COPY --from=frontend-builder /app/frontend/dist ./dist

# Create SQLite data directory and temporary execution sandbox
RUN mkdir -p /app/db/data /tmp/coding-guru-executions

# Non-sensitive defaults only — secrets MUST be injected via --env-file at runtime
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Volume for persistent SQLite database storage
VOLUME ["/app/db/data"]

# The .env file is expected to be mounted at /app/.env at container start:
#   docker run --env-file .env -p 5000:5000 hridayesh68/coding-guru
# Or bind-mount it:
#   docker run -v $(pwd)/.env:/app/.env -p 5000:5000 hridayesh68/coding-guru
CMD ["node", "server.js"]
