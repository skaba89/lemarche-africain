#!/bin/sh
# ============================================================
# Entrypoint — Copy pre-built SQLite DB at startup
# La DB est pré-construite pendant le Docker build
# ============================================================
set -e

echo "🗄️  Le Marché Africain — Initialisation..."

# Ensure DATABASE_URL points to the container path
export DATABASE_URL="file:/app/db/custom.db"

# Copy the pre-built database if it doesn't exist
if [ ! -f /app/db/custom.db ]; then
  echo "📦 Premier démarrage — Copie de la base de données pré-construite..."
  cp /app/db/prebuilt.db /app/db/custom.db
  echo "✅ Base de données prête (64 produits, 9 catégories) !"
else
  echo "✅ Base de données existante — Démarrage normal"
fi

# Start the application
echo "🚀 Démarrage du serveur sur le port ${PORT:-3000}..."
exec node server.js
