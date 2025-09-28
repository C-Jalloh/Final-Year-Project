#!/bin/bash

# Chelal HMS - Database Backup Script
echo "💾 Chelal HMS - Database Backup Script"
echo "======================================"

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/chelal_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "📤 Creating database backup..."
docker-compose exec db bash -c "pg_dump -U chelal_user -d chelal_db" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_FILE"
    echo "📊 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "❌ Backup failed!"
    exit 1
fi

echo "🧹 Cleaning up old backups (keeping last 5)..."
cd $BACKUP_DIR
ls -t chelal_backup_*.sql | tail -n +6 | xargs -r rm
echo "✅ Cleanup complete!"

echo ""
echo "💡 To restore from backup, run:"
echo "   docker-compose exec -T db psql -U chelal_user -d chelal_db < $BACKUP_FILE"