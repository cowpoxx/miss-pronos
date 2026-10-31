#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/opt/miss-france-pronos/backups"
DATE=$(date +%F_%H-%M)
FILE="$BACKUP_DIR/mfp_$DATE.sql.gz"

echo "📦 Backup de la base de données..."

# Si on est dans le conteneur backup
if [ -f /.dockerenv ]; then
  pg_dump -h postgres -U mfp_user miss_france_pronos | gzip > "$FILE"
else
  # Depuis l'hôte
  docker exec mfp-postgres pg_dump -U mfp_user miss_france_pronos | gzip > "$FILE"
fi

# Garde 30 jours
find "$BACKUP_DIR" -name 'mfp_*.sql.gz' -mtime +30 -delete

echo "✅ Backup saved: $FILE"
ls -lh "$FILE"