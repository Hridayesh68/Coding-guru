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

# Environment configuration
ENV NODE_ENV=production
ENV PORT=5000
ENV JWT_SECRET=supersecret_jwt_coding_guru_key_2026_x7a9
ENV ADMIN_INVITE_KEY=admin123

EXPOSE 5000

# Volume for persistent SQLite database storage
VOLUME ["/app/db/data"]

# Start the unified full-stack server
CMD ["node", "server.js"]
