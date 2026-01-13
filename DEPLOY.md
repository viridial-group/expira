# Guide de Déploiement - expira.io

Ce guide vous explique comment déployer l'application expira sur votre VPS.

> **📖 Pour un guide de déploiement manuel étape par étape, consultez [MANUAL_DEPLOY.md](./MANUAL_DEPLOY.md)**

## Prérequis

- Un VPS avec Ubuntu 20.04+ ou Debian 11+
- Un nom de domaine pointant vers votre VPS (expira.io)
- Accès SSH avec privilèges sudo
- Node.js 18+ installé
- PostgreSQL ou MySQL installé et configuré

## Installation initiale sur le VPS

### 1. Mise à jour du système

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Installation de Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Installation de PM2

```bash
sudo npm install -g pm2
```

### 4. Installation de Nginx

```bash
sudo apt install -y nginx
```

### 5. Installation de PostgreSQL (ou MySQL)

**PostgreSQL:**
```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres createdb expira
sudo -u postgres createuser expira_user
sudo -u postgres psql -c "ALTER USER expira_user WITH PASSWORD 'VOTRE_MOT_DE_PASSE';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE expira TO expira_user;"
```

### 6. Installation de Certbot (pour SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

## Configuration du projet

### 1. Cloner le repository

```bash
cd /var/www
sudo git clone https://github.com/VOTRE_USERNAME/expira.git
sudo chown -R $USER:$USER /var/www/expira
cd expira
```

### 2. Configurer les variables d'environnement

Créez le fichier `.env`:

```bash
nano .env
```

Ajoutez les variables suivantes:

```env
# Base de données
DATABASE_URL="postgresql://expira_user:VOTRE_MOT_DE_PASSE@localhost:5432/expira"

# NextAuth
NEXTAUTH_SECRET="GÉNÉREZ_UNE_CLÉ_SECRÈTE_ALÉATOIRE"
NEXTAUTH_URL="https://expira.io"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="votre-email@gmail.com"
SMTP_PASSWORD="votre-mot-de-passe-app"
EMAIL_FROM="noreply@expira.io"
FROM_NAME="expira"

# SMS (Twilio - optionnel)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"

# Environnement
NODE_ENV="production"
```

**Générer NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Installer les dépendances et build

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
```

## Configuration Nginx

### 1. Copier la configuration

```bash
sudo cp nginx.conf /etc/nginx/sites-available/expira.io
sudo ln -s /etc/nginx/sites-available/expira.io /etc/nginx/sites-enabled/
```

### 2. Tester la configuration

```bash
sudo nginx -t
```

### 3. Obtenir le certificat SSL

```bash
sudo certbot --nginx -d expira.io -d www.expira.io
```

### 4. Redémarrer Nginx

```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Configuration PM2

### 1. Démarrer l'application

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Vérifier le statut

```bash
pm2 status
pm2 logs expira
```

## Script de déploiement

### 1. Rendre le script exécutable

```bash
chmod +x deploy.sh
```

### 2. Modifier le script

Éditez `deploy.sh` et modifiez:
- `REPO_URL` avec l'URL de votre repository Git
- `BRANCH` si vous utilisez une autre branche que `main`

### 3. Exécuter le déploiement

```bash
sudo ./deploy.sh production
```

## Commandes utiles

### PM2

```bash
# Voir les logs
pm2 logs expira

# Redémarrer
pm2 restart expira

# Arrêter
pm2 stop expira

# Voir les métriques
pm2 monit
```

### Nginx

```bash
# Tester la configuration
sudo nginx -t

# Redémarrer
sudo systemctl restart nginx

# Voir les logs
sudo tail -f /var/log/nginx/expira-error.log
```

### Base de données

```bash
# Accéder à PostgreSQL
sudo -u postgres psql expira

# Voir les migrations
npx prisma migrate status

# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration
```

### Certificat SSL

```bash
# Renouveler le certificat
sudo certbot renew

# Tester le renouvellement
sudo certbot renew --dry-run
```

## Mise à jour automatique (Optionnel)

Pour activer le renouvellement automatique du certificat SSL:

```bash
sudo systemctl enable certbot.timer
```

## Monitoring

### Vérifier que tout fonctionne

1. **Application:** https://expira.io
2. **PM2:** `pm2 status`
3. **Nginx:** `sudo systemctl status nginx`
4. **Base de données:** `sudo systemctl status postgresql`
5. **Logs:** `pm2 logs expira --lines 50`

## Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
pm2 logs expira --err

# Vérifier les variables d'environnement
cat .env

# Vérifier la connexion à la base de données
npx prisma db pull
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que l'application tourne
pm2 status

# Vérifier le port
netstat -tlnp | grep 3000

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/expira-error.log
```

### Problème de certificat SSL

```bash
# Vérifier le certificat
sudo certbot certificates

# Renouveler manuellement
sudo certbot renew --force-renewal
```

## Sécurité

1. **Firewall:** Configurez UFW pour n'autoriser que les ports nécessaires
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **Fail2ban:** Installez Fail2ban pour protéger contre les attaques
   ```bash
   sudo apt install fail2ban
   ```

3. **Mises à jour:** Configurez les mises à jour automatiques
   ```bash
   sudo apt install unattended-upgrades
   ```

## Backup

### Base de données

```bash
# Backup PostgreSQL
sudo -u postgres pg_dump expira > backup_$(date +%Y%m%d).sql

# Restaurer
sudo -u postgres psql expira < backup_YYYYMMDD.sql
```

### Fichiers

```bash
# Backup du code
tar -czf expira_backup_$(date +%Y%m%d).tar.gz /var/www/expira
```

## Support

Pour toute question ou problème, consultez les logs:
- Application: `pm2 logs expira`
- Nginx: `/var/log/nginx/expira-error.log`
- Système: `journalctl -u nginx`

