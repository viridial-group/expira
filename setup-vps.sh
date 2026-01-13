#!/bin/bash

# Script de configuration initiale du VPS pour expira.io
# À exécuter une seule fois lors de la première installation

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Configuration initiale du VPS pour expira.io${NC}"

# Vérifier que nous sommes root ou sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  Ce script nécessite les privilèges sudo${NC}"
    exit 1
fi

# Mise à jour du système
echo -e "${GREEN}📦 Mise à jour du système...${NC}"
apt update && apt upgrade -y

# Installation de Node.js 18
echo -e "${GREEN}📦 Installation de Node.js 18...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    echo -e "${YELLOW}Node.js est déjà installé: $(node --version)${NC}"
fi

# Installation de PM2
echo -e "${GREEN}📦 Installation de PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup
else
    echo -e "${YELLOW}PM2 est déjà installé${NC}"
fi

# Installation de Nginx
echo -e "${GREEN}📦 Installation de Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
else
    echo -e "${YELLOW}Nginx est déjà installé${NC}"
fi

# Installation de PostgreSQL
echo -e "${GREEN}📦 Installation de PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
else
    echo -e "${YELLOW}PostgreSQL est déjà installé${NC}"
fi

# Installation de Certbot
echo -e "${GREEN}📦 Installation de Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
else
    echo -e "${YELLOW}Certbot est déjà installé${NC}"
fi

# Installation de Git
echo -e "${GREEN}📦 Installation de Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install -y git
else
    echo -e "${YELLOW}Git est déjà installé${NC}"
fi

# Création du répertoire de l'application
echo -e "${GREEN}📁 Création du répertoire /var/www/expira...${NC}"
mkdir -p /var/www/expira
chown -R $SUDO_USER:$SUDO_USER /var/www/expira

# Configuration du firewall
echo -e "${GREEN}🔥 Configuration du firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo -e "${YELLOW}⚠️  Le firewall UFW sera activé. Voulez-vous continuer? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        ufw --force enable
    fi
else
    echo -e "${YELLOW}UFW n'est pas installé. Installation...${NC}"
    apt install -y ufw
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo -e "${YELLOW}⚠️  Le firewall UFW sera activé. Voulez-vous continuer? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        ufw --force enable
    fi
fi

# Création de la base de données
echo -e "${GREEN}🗄️  Configuration de la base de données...${NC}"
echo -e "${YELLOW}Voulez-vous créer la base de données maintenant? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${YELLOW}Entrez le nom de la base de données (défaut: expira):${NC}"
    read -r db_name
    db_name=${db_name:-expira}
    
    echo -e "${YELLOW}Entrez le nom d'utilisateur (défaut: expira_user):${NC}"
    read -r db_user
    db_user=${db_user:-expira_user}
    
    echo -e "${YELLOW}Entrez le mot de passe pour l'utilisateur:${NC}"
    read -rs db_password
    
    sudo -u postgres psql -c "CREATE DATABASE $db_name;" 2>/dev/null || echo "Base de données existe déjà"
    sudo -u postgres psql -c "CREATE USER $db_user WITH PASSWORD '$db_password';" 2>/dev/null || echo "Utilisateur existe déjà"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $db_name TO $db_user;"
    sudo -u postgres psql -c "ALTER USER $db_user CREATEDB;"
    
    echo -e "${GREEN}✅ Base de données créée: $db_name${NC}"
    echo -e "${GREEN}✅ Utilisateur créé: $db_user${NC}"
    echo -e "${YELLOW}📝 Ajoutez cette ligne à votre .env:${NC}"
    echo "DATABASE_URL=\"postgresql://$db_user:$db_password@localhost:5432/$db_name\""
fi

echo -e "${GREEN}✅ Configuration initiale terminée!${NC}"
echo -e "${GREEN}📝 Prochaines étapes:${NC}"
echo "1. Clonez votre repository dans /var/www/expira"
echo "2. Configurez le fichier .env avec toutes les variables nécessaires"
echo "3. Exécutez ./deploy.sh pour déployer l'application"
echo "4. Configurez Nginx avec le fichier nginx.conf"
echo "5. Obtenez un certificat SSL avec: sudo certbot --nginx -d expira.io -d www.expira.io"

