#!/usr/bin/env bash
set -e

# ==========================================
# Coding Guru Docker Hub Push Script (Linux/macOS)
# ==========================================

read -p "Enter your Docker Hub Username: " DOCKER_USER
if [ -z "$DOCKER_USER" ]; then
    echo "Error: Docker Hub username cannot be empty."
    exit 1
fi

IMAGE_TAG="${DOCKER_USER}/coding-guru:latest"

echo ""
echo "[1/3] Building unified production container..."
docker build -t "$IMAGE_TAG" .

echo ""
echo "[2/3] Authenticating with Docker Hub..."
docker login

echo ""
echo "[3/3] Pushing image to Docker Hub ($IMAGE_TAG)..."
docker push "$IMAGE_TAG"

echo ""
echo "========================================================"
echo "SUCCESS! Your image is live on Docker Hub: $IMAGE_TAG"
echo "Anyone can now run it on any OS with a single command:"
echo ""
echo "  docker run -d -p 5000:5000 $IMAGE_TAG"
echo "========================================================"
