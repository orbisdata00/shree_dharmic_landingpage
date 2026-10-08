#!/bin/bash

set -euo pipefail

APP_NAME="shree-dharmic-landingpage"
PORT="7004"

VERSION=$(date +"%Y%m%d%H%M%S")

IMAGE="${APP_NAME}:release-${VERSION}"
CONTAINER="${APP_NAME}-${VERSION}"

echo "=========================================="
echo " Deploying ${APP_NAME}"
echo "=========================================="
echo "Image:     ${IMAGE}"
echo "Container: ${CONTAINER}"
echo "Port:      ${PORT}"
echo "=========================================="

echo ""
echo ">>> Building Docker image..."
docker build -t "${IMAGE}" .

echo ""
echo ">>> Stopping existing containers..."

docker ps -q \
    --filter "name=${APP_NAME}-" | \
    xargs -r docker stop

echo ""
echo ">>> Removing existing containers..."

docker ps -aq \
    --filter "name=${APP_NAME}-" | \
    xargs -r docker rm

echo ""
echo ">>> Starting new container..."

docker run -d \
    --name "${CONTAINER}" \
    --restart unless-stopped \
    -p "${PORT}:80" \
    "${IMAGE}"

echo ""
echo ">>> Deployment completed."

echo ""
echo ">>> Container status:"
docker ps --filter "name=${CONTAINER}"

echo ""
echo ">>> Testing application..."

sleep 2

if curl -fsS "http://127.0.0.1:${PORT}" >/dev/null; then
    echo "Application is UP: http://127.0.0.1:${PORT}"
else
    echo "ERROR: Application health check failed."
    echo ""
    echo "Container logs:"
    docker logs "${CONTAINER}"
    exit 1
fi

echo ""
echo "=========================================="
echo " Deployment successful"
echo "=========================================="
