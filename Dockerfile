# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
# Fix permission for vite and other binaries
RUN chmod -R +x node_modules/.bin
RUN npm run build

# Stage 2: Final Image
FROM python:3.9-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    build-essential \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend dependencies and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy built frontend from Stage 1
# Note: Stage 1 WORKDIR was /app/frontend, so the build output is in /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/static

# Copy start script to root and make it executable
COPY backend/app/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port (Railway uses PORT env var)
EXPOSE 8000

# Start command
CMD ["/bin/sh", "/app/start.sh"]
