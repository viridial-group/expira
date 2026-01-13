#!/bin/bash

# Script de déploiement pour expira.io
# Usage: ./deploy.sh [production|staging]

set -e  # Arrêter en cas d'erreur

ENVIRONMENT=${1:-production}
DOMAIN="expira.io"
APP_NAME="expira"
APP_DIR="/var/www/${APP_NAME}"
REPO_URL="https://github.com/viridial-group/expira.git"
BRANCH="main"

# Charger le PATH de l'utilisateur pour trouver npm/node
export PATH="/usr/local/bin:/usr/bin:/bin:$HOME/.nvm/versions/node/$(node -v 2>/dev/null | sed 's/v//')/bin:$PATH"

# Trouver npm et node
NPM=$(which npm || echo "/usr/bin/npm")
NODE=$(which node || echo "/usr/bin/node")

# Si npm n'est pas trouvé, essayer avec le chemin de l'utilisateur non-root
if [ ! -f "$NPM" ] || [ "$EUID" -eq 0 ]; then
    # Essayer de trouver npm dans le home de l'utilisateur original
    ORIGINAL_USER=${SUDO_USER:-$USER}
    if [ -n "$ORIGINAL_USER" ] && [ "$ORIGINAL_USER" != "root" ]; then
        USER_HOME=$(eval echo ~$ORIGINAL_USER)
        if [ -f "$USER_HOME/.nvm/nvm.sh" ]; then
            source "$USER_HOME/.nvm/nvm.sh"
        fi
        # Essayer de trouver npm dans le PATH de l'utilisateur
        NPM=$(sudo -u $ORIGINAL_USER which npm 2>/dev/null || echo "npm")
        NODE=$(sudo -u $ORIGINAL_USER which node 2>/dev/null || echo "node")
    fi
fi

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Déploiement de ${APP_NAME} sur ${DOMAIN} (${ENVIRONMENT})${NC}"

# Détecter l'utilisateur original (celui qui a lancé sudo)
ORIGINAL_USER=${SUDO_USER:-$USER}
if [ "$EUID" -eq 0 ] && [ -z "$SUDO_USER" ]; then
    # Si on est root directement, essayer de trouver un utilisateur non-root
    # Chercher dans /home pour trouver un utilisateur
    for user_dir in /home/*; do
        if [ -d "$user_dir" ]; then
            ORIGINAL_USER=$(basename "$user_dir")
            break
        fi
    done
    # Si aucun utilisateur trouvé, utiliser root
    if [ -z "$ORIGINAL_USER" ] || [ "$ORIGINAL_USER" = "root" ]; then
        ORIGINAL_USER="root"
    fi
fi

# Trouver npm dans le système
find_npm() {
    # Chercher npm dans les chemins standards
    for path in /usr/local/bin/npm /usr/bin/npm /opt/nodejs/bin/npm; do
        if [ -f "$path" ]; then
            echo "$path"
            return 0
        fi
    done
    
    # Si on a un utilisateur non-root, chercher dans son home
    if [ "$ORIGINAL_USER" != "root" ] && [ -n "$ORIGINAL_USER" ]; then
        USER_HOME=$(eval echo ~$ORIGINAL_USER)
        # Chercher avec nvm
        if [ -d "$USER_HOME/.nvm" ]; then
            for node_version in "$USER_HOME/.nvm/versions/node"/*; do
                if [ -f "$node_version/bin/npm" ]; then
                    echo "$node_version/bin/npm"
                    return 0
                fi
            done
        fi
        # Chercher avec which en tant que cet utilisateur
        NPM_PATH=$(sudo -u $ORIGINAL_USER which npm 2>/dev/null || echo "")
        if [ -n "$NPM_PATH" ] && [ -f "$NPM_PATH" ]; then
            echo "$NPM_PATH"
            return 0
        fi
    fi
    
    # Dernier recours: utiliser npm directement (peut échouer)
    echo "npm"
}

NPM_CMD=$(find_npm)
echo -e "${GREEN}📦 Utilisation de npm: $NPM_CMD${NC}"

# Fonction pour exécuter des commandes avec le bon utilisateur
run_as_user() {
    local cmd="$*"
    if [ "$EUID" -eq 0 ]; then
        # Si on est root, exécuter avec l'utilisateur original
        if [ -n "$ORIGINAL_USER" ] && [ "$ORIGINAL_USER" != "root" ]; then
            USER_HOME=$(eval echo ~$ORIGINAL_USER)
            if [ -f "$USER_HOME/.nvm/nvm.sh" ]; then
                sudo -u $ORIGINAL_USER bash -c "source $USER_HOME/.nvm/nvm.sh && cd $APP_DIR && $cmd"
            else
                sudo -u $ORIGINAL_USER -E bash -c "cd $APP_DIR && $cmd"
            fi
        else
            # Si on est root et pas d'utilisateur trouvé, essayer directement
            cd $APP_DIR
            eval "$cmd"
        fi
    else
        # Si on n'est pas root, exécuter directement
        cd $APP_DIR
        eval "$cmd"
    fi
}

# Le script peut être exécuté sans sudo (demandera sudo si nécessaire)
# Mais npm doit être disponible dans le PATH de l'utilisateur actuel

# Créer le répertoire de l'application si nécessaire
if [ ! -d "$APP_DIR" ]; then
    echo -e "${GREEN}📁 Création du répertoire ${APP_DIR}${NC}"
    if [ "$EUID" -eq 0 ]; then
        mkdir -p $APP_DIR
        if [ -n "$ORIGINAL_USER" ] && [ "$ORIGINAL_USER" != "root" ]; then
            chown -R $ORIGINAL_USER:$ORIGINAL_USER $APP_DIR
        fi
    else
        sudo mkdir -p $APP_DIR
        sudo chown -R $USER:$USER $APP_DIR
    fi
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
run_as_user "npm ci --production=false"

# Générer le client Prisma
echo -e "${GREEN}🗄️  Génération du client Prisma${NC}"
run_as_user "npx prisma generate"

# Exécuter les migrations
echo -e "${GREEN}🔄 Exécution des migrations${NC}"
run_as_user "npx prisma migrate deploy"

# Build du projet
echo -e "${GREEN}🔨 Build du projet${NC}"
run_as_user "npm run build"

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

