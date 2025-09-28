#!/bin/bash

# Chelal HMS - Safe Cleanup Script (preserves data)
echo "🧹 Chelal HMS - Safe Cleanup Script"
echo "==================================="
echo "This script stops containers but PRESERVES all data"

echo "🛑 Stopping all services (keeping data safe)..."
docker-compose down

echo "🗑️  Removing unused containers, networks, and images..."
docker system prune -f

echo "💾 Database volumes are SAFE and preserved!"
echo ""
echo "💡 To restart services: docker-compose up -d"
echo "💡 To backup data: ./backup-database.sh"
echo "💡 To remove data (DANGER): docker-compose down -v"
echo ""
echo "✅ Safe cleanup complete!"