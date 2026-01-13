# Guide de Déploiement Manuel - expira.io

Ce guide vous explique comment déployer manuellement l'application expira sur votre VPS, étape par étape.

## Prérequis

- VPS avec Ubuntu 20.04+ ou Debian 11+
- Accès SSH avec privilèges sudo
- Domaine expira.io pointant vers votre VPS
- Node.js 18+ installé
- PostgreSQL installé et configuré

## Étape 1: Connexion au serveur

```bash
ssh root@votre-serveur-ip
# ou
ssh votre-utilisateur@votre-serveur-ip
```

## Étape 2: Mise à jour du système

```bash
sudo apt update
sudo apt upgrade -y
```

## Étape 3: Installation des dépendances système

### Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier l'installation
node -v  # Doit afficher v18.x.x ou supérieur
npm -v   # Doit afficher la version de npm
```

### PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivez les instructions affichées
```

### Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### Certbot (pour SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

## Étape 4: Configuration de la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Dans le shell PostgreSQL, exécutez:
CREATE DATABASE expira;
CREATE USER expira_user WITH PASSWORD 'VOTRE_MOT_DE_PASSE_SECURISE';
GRANT ALL PRIVILEGES ON DATABASE expira TO expira_user;
ALTER USER expira_user CREATEDB;
\q
```

**Note:** Remplacez `VOTRE_MOT_DE_PASSE_SECURISE` par un mot de passe fort.

**Important:** Si vous avez des problèmes de connexion, consultez [FIX_POSTGRES.md](./FIX_POSTGRES.md)

## Étape 5: Cloner le repository

```bash
# Créer le répertoire
sudo mkdir -p /var/www/expira
sudo chown -R $USER:$USER /var/www/expira

# Cloner le repo
cd /var/www/expira
git clone https://github.com/viridial-group/expira.git .

# Vérifier la branche
git branch
git checkout main
```

## Étape 6: Configuration des variables d'environnement

```bash
cd /var/www/expira

# Créer le fichier .env
nano .env
```

Ajoutez le contenu suivant (remplacez les valeurs par les vôtres):

```env
# Base de données
DATABASE_URL="postgresql://expira_user:VOTRE_MOT_DE_PASSE@localhost:5432/expira"

# NextAuth
NEXTAUTH_SECRET="GÉNÉREZ_UNE_CLÉ_ALÉATOIRE_ICI"
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

Sauvegardez avec `Ctrl+O`, puis `Enter`, puis `Ctrl+X`.

## Étape 7: Installation des dépendances

```bash
cd /var/www/expira

# Installer les dépendances
npm ci --production=false

# Vérifier qu'il n'y a pas d'erreurs
```

## Étape 8: Configuration de Prisma

```bash
cd /var/www/expira

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
sudo -u postgres psql

# Vérifier que la base de données est connectée
npx prisma db pull
```

## Étape 9: Build de l'application

```bash
cd /var/www/expira

# Build du projet Next.js
npm run build

# Vérifier qu'il n'y a pas d'erreurs
```

## Étape 10: Configuration Nginx (HTTP d'abord)

```bash
# Copier la configuration temporaire (sans SSL)
sudo cp /var/www/expira/nginx.conf.temp /etc/nginx/sites-available/expira.io

# Créer le lien symbolique
    sudo ln -s /etc/nginx/sites-available/expira.io /etc/nginx/sites-enabled/

# Supprimer la configuration par défaut (optionnel)
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Si OK, redémarrer Nginx
sudo systemctl restart nginx
```

## Étape 11: Démarrer l'application avec PM2

```bash
cd /var/www/expira

# Démarrer l'application
pm2 start npm --name "expira" -- start

# Sauvegarder la configuration PM2
pm2 save

# Vérifier le statut
pm2 status
pm2 logs expira
```

## Étape 12: Vérifier que l'application fonctionne

```bash
# Tester localement
curl http://localhost:3000

# Tester via le domaine (si DNS est configuré)
curl http://expira.io
```

Si vous voyez du HTML, c'est bon signe!

## Étape 13: Obtenir le certificat SSL

```bash
# Obtenir le certificat SSL avec Certbot
sudo certbot --nginx -d expira.io -d www.expira.io

# Certbot va:
# 1. Vérifier que le domaine pointe vers votre serveur
# 2. Obtenir le certificat SSL
# 3. Modifier automatiquement votre configuration Nginx
```

**Si vous avez des erreurs:**
- Vérifiez que le DNS pointe vers votre serveur: `ping expira.io`
- Vérifiez que le port 80 est ouvert: `sudo ufw allow 80/tcp`
- Vérifiez que Nginx fonctionne: `sudo systemctl status nginx`

## Étape 14: Configuration finale Nginx (optionnel)

Si vous voulez utiliser la configuration complète avec tous les headers de sécurité:

```bash
# Sauvegarder la configuration actuelle (modifiée par Certbot)
sudo cp /etc/nginx/sites-available/expira.io /etc/nginx/sites-available/expira.io.backup

# Copier la configuration complète
sudo cp /var/www/expira/nginx.conf /etc/nginx/sites-available/expira.io

# Tester
sudo nginx -t

# Si OK, redémarrer
sudo systemctl restart nginx
```

## Étape 15: Configuration du firewall

```bash
# Autoriser les ports nécessaires
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

## Étape 16: Vérification finale

### Vérifier que tout fonctionne:

1. **Application PM2:**
   ```bash
   pm2 status
   pm2 logs expira --lines 50
   ```

2. **Nginx:**
   ```bash
   sudo systemctl status nginx
   sudo tail -f /var/log/nginx/expira-error.log
   ```

3. **Base de données:**
   ```bash
   sudo systemctl status postgresql
   sudo -u postgres psql expira -c "SELECT COUNT(*) FROM \"User\";"
   ```

4. **Accès web:**
   - Ouvrez `https://expira.io` dans votre navigateur
   - Vérifiez que le cadenas SSL s'affiche
   - Testez la connexion/inscription

## Commandes utiles pour la maintenance

### Redémarrer l'application

```bash
cd /var/www/expira
pm2 restart expira
```

### Voir les logs

```bash
# Logs de l'application
pm2 logs expira

# Logs Nginx
sudo tail -f /var/log/nginx/expira-error.log
sudo tail -f /var/log/nginx/expira-access.log

# Logs système
sudo journalctl -u nginx -f
```

### Mettre à jour le code

```bash
cd /var/www/expira

# Récupérer les dernières modifications
git pull origin main

# Installer les nouvelles dépendances (si nécessaire)
npm ci --production=false

# Générer Prisma (si le schéma a changé)
npx prisma generate

# Exécuter les nouvelles migrations
npx prisma migrate deploy

# Rebuild
npm run build

# Redémarrer
pm2 restart expira
```

### Backup de la base de données

```bash
# Créer un backup
sudo -u postgres pg_dump expira > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurer un backup
sudo -u postgres psql expira < backup_YYYYMMDD_HHMMSS.sql
```

### Renouveler le certificat SSL

```bash
# Renouveler manuellement
sudo certbot renew --force-renewal

# Tester le renouvellement automatique
sudo certbot renew --dry-run

# Redémarrer Nginx après renouvellement
sudo systemctl restart nginx
```

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

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL tourne
sudo systemctl status postgresql

# Tester la connexion
psql -U expira_user -d expira -h localhost

# Vérifier les permissions
sudo -u postgres psql -c "\du"
```

### Le certificat SSL expire

```bash
# Vérifier la date d'expiration
sudo certbot certificates

# Renouveler
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

## Checklist de déploiement

- [ ] Système mis à jour
- [ ] Node.js 18+ installé
- [ ] PM2 installé et configuré
- [ ] Nginx installé et configuré
- [ ] PostgreSQL installé et base de données créée
- [ ] Repository cloné dans `/var/www/expira`
- [ ] Fichier `.env` créé avec toutes les variables
- [ ] Dépendances installées (`npm ci`)
- [ ] Client Prisma généré (`npx prisma generate`)
- [ ] Migrations exécutées (`npx prisma migrate deploy`)
- [ ] Application buildée (`npm run build`)
- [ ] Nginx configuré (HTTP)
- [ ] Application démarrée avec PM2
- [ ] Application accessible en HTTP
- [ ] Certificat SSL obtenu avec Certbot
- [ ] Application accessible en HTTPS
- [ ] Firewall configuré
- [ ] Tout fonctionne correctement

## Support

Si vous rencontrez des problèmes:

1. Consultez les logs: `pm2 logs expira` et `sudo tail -f /var/log/nginx/expira-error.log`
2. Vérifiez que tous les services tournent: `pm2 status`, `sudo systemctl status nginx`, `sudo systemctl status postgresql`
3. Vérifiez les variables d'environnement dans `.env`
4. Consultez `SSL_SETUP.md` pour les problèmes SSL
5. Consultez `DEPLOY.md` pour plus de détails

