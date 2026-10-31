#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/opt/miss-france-pronos/backups"

if [ $# -eq 0 ]; then
  echo "Usage: $0 <backup-file>"
  echo "Fichiers disponibles:"
  ls -lh "$BACKUP_DIR"/mfp_*.sql.gz 2>/dev/null || echo "Aucun backup trouvé"
  exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
  echo "❌ Fichier non trouvé: $FILE"
  exit 1
fi

echo "⚠️  ATTENTION: Cette opération va ÉCRASER la base de données actuelle!"
read -p "Êtes-vous sûr? (oui/non): " confirm
if [ "$confirm" != "oui" ]; then
  echo "Annulé."
  exit 1
fi

echo "🔄 Restauration depuis $FILE..."

if [ -f /.dockerenv ]; then
  gunzip -c "$FILE" | psql -h postgres -U mfp_user miss_france_pronos
else
  gunzip -c "$FILE" | docker exec -i mfp-postgres psql -U mfp_user miss_france_pronos
fi

echo "✅ Restauration terminée"