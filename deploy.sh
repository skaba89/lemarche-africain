#!/bin/bash
# ============================================================
# Script de déploiement Fly.io
# Usage: ./deploy.sh
# ============================================================
set -e

echo "🚀 Déploiement de Le Marché Africain sur Fly.io..."

# Vérifier flyctl
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl n'est pas installé. Installation..."
    curl -L https://fly.io/install.sh | sh
fi

# Se connecter (ou se déconnecter/reconnecter)
echo "📝 Connexion à Fly.io..."
flyctl auth login

# Lancer l'app
echo "🏗️  Lancement de l'application..."
flyctl launch --no-deploy --region cdg

# Déployer
echo "📦 Déploiement en cours..."
flyctl deploy

# Attendre que l'app soit prête
echo "⏳ Attente du démarrage..."
sleep 10

# Initialiser la base de données
echo "🗄️  Initialisation de la base de données..."
flyctl ssh --command "cd /app && npx prisma db push --skip-generate 2>/dev/null && npx prisma db seed 2>/dev/null || echo '⚠️  Seed partiel ou déjà fait'"

echo ""
echo "✅ Déploiement terminé !"
echo "📋 Votre app est disponible sur :"
flyctl status
echo ""
echo "🔗 Pour ouvrir l'app :"
echo "   flyctl open"
echo ""
echo "📝 Pour voir les logs :"
echo "   flyctl logs"
echo ""
echo "🔗 Pour initialiser la DB (si besoin) :"
echo "   flyctl ssh --command 'cd /app && npx prisma db push && npx prisma db seed'"
