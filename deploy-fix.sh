#!/bin/bash

# Script de déploiement pour expira.io (Version corrigée)
# Usage: ./deploy-fix.sh [production|staging]
# 
# IMPORTANT: Exécutez ce script SANS sudo pour les commandes npm
# Utilisez: bash deploy-fix.sh production
# Le script demandera sudo uniquement pour les opérations nécessitant les privilèges root

set -e

ENVIRONMENT=${1:-production}
DOMAIN="expira.io"
APP_NAME="expira"
APP_DIR="/var/www/${APP_NAME}"
REPO_URL="https://github.com/viridial-group/expira.git"
BRANCH="main"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Déploiement de ${APP_NAME} sur ${DOMAIN} (${ENVIRONMENT})${NC}"

# Vérifier que nous ne sommes PAS root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Ne pas exécuter ce script en tant que root!${NC}"
    echo -e "${YELLOW}   Utilisez: bash deploy-fix.sh production${NC}"
    echo -e "${YELLOW}   Le script demandera sudo quand nécessaire${NC}"
    exit 1
fi

# Vérifier que npm est disponible
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas trouvé dans le PATH${NC}"
    echo -e "${YELLOW}   Assurez-vous que Node.js et npm sont installés${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm trouvé: $(which npm)${NC}"
echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Créer le répertoire de l'application si nécessaire (nécessite sudo)
if [ ! -d "$APP_DIR" ]; then
    echo -e "${GREEN}📁 Création du répertoire ${APP_DIR}${NC}"
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
fi

cd $APP_DIR

# Cloner le repo si nécessaire
if [ ! -d ".git" ]; then
    echo -e "${GREEN}📥 Clonage du repository${NC}"
    git clone $REPO_URL .
    git checkout $BRANCH
else
    echo -e "${GREEN}🔄 Mise à jour du code${NC}"
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
fi

# Installer les dépendances
echo -e "${GREEN}📦 Installation des dépendances${NC}"
npm ci --production=false

# Générer le client Prisma
echo -e "${GREEN}🗄️  Génération du client Prisma${NC}"
npx prisma generate

# Exécuter les migrations
echo -e "${GREEN}🔄 Exécution des migrations${NC}"
npx prisma migrate deploy

# Build du projet
echo -e "${GREEN}🔨 Build du projet${NC}"
npm run build

# Vérifier que le fichier .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Le fichier .env n'existe pas. Créez-le avec les variables d'environnement nécessaires.${NC}"
    echo -e "${YELLOW}   Exemple de variables requises:${NC}"
    echo "   - DATABASE_URL"
    echo "   - NEXTAUTH_SECRET"
    echo "   - NEXTAUTH_URL=https://${DOMAIN}"
    echo "   - STRIPE_SECRET_KEY"
    echo "   - STRIPE_PUBLISHABLE_KEY"
    echo "   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD"
    echo "   - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN (optionnel)"
fi

# Redémarrer l'application avec PM2
echo -e "${GREEN}🔄 Redémarrage de l'application${NC}"
if pm2 list | grep -q "${APP_NAME}"; then
    pm2 restart ${APP_NAME}
else
    pm2 start npm --name "${APP_NAME}" -- start
    pm2 save
fi

# Vérifier le statut
pm2 status ${APP_NAME}

echo -e "${GREEN}✅ Déploiement terminé avec succès!${NC}"
echo -e "${GREEN}🌐 Votre application est disponible sur https://${DOMAIN}${NC}"

