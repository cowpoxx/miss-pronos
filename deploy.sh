#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="miss.thannenkirchmarche.fr"
VPS_USER="ubuntu"
VPS_PATH="/opt/miss-france-pronos"

echo "🔨 Build images..."
docker build -f docker/Dockerfile -t mfp-app:latest .
docker build -f docker/Dockerfile --target builder -t mfp-schema:latest .

echo "💾 Save images..."
docker save mfp-app:latest mfp-schema:latest | gzip > /tmp/mfp-images.tar.gz

echo "📦 Sync vers VPS..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '*.log' \
  --exclude '.env*' \
  --exclude 'uploads' \
  --exclude 'postgres/data' \
  --exclude 'backups' \
  . "$VPS_USER@$VPS_HOST:$VPS_PATH/"

echo "📤 Envoi image Docker..."
scp /tmp/mfp-images.tar.gz "$VPS_USER@$VPS_HOST:/tmp/"

echo "🔧 Deploy sur VPS..."
ssh "$VPS_USER@$VPS_HOST" << 'ENDSSH'
  set -euo pipefail
  cd /opt/miss-france-pronos

  docker load < /tmp/mfp-images.tar.gz
  rm /tmp/mfp-images.tar.gz

  docker compose up -d --remove-orphans

  docker image prune -f

  echo "✅ Déploiement OK"
ENDSSH

echo "🎉 Fini !"