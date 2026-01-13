# Déploiement Rapide - Commandes Essentielles

Guide rapide avec les commandes essentielles pour déployer expira.io.

## 🚀 Déploiement en 15 étapes

### 1. Connexion et mise à jour
```bash
ssh root@votre-serveur
sudo apt update && sudo apt upgrade -y
```

### 2. Installation Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Vérifier
```

### 3. Installation PM2
```bash
sudo npm install -g pm2
pm2 startup  # Suivre les instructions
```

### 4. Installation Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5. Installation PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 6. Création base de données
```bash
sudo -u postgres psql
```
Dans PostgreSQL:
```sql
CREATE DATABASE expira;
CREATE USER expira_user WITH PASSWORD 'VOTRE_MOT_DE_PASSE';
GRANT ALL PRIVILEGES ON DATABASE expira TO expira_user;
ALTER USER expira_user CREATEDB;
\q
```

### 7. Installation Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 8. Cloner le projet
```bash
sudo mkdir -p /var/www/expira
sudo chown -R $USER:$USER /var/www/expira
cd /var/www/expira
git clone https://github.com/viridial-group/expira.git .
```

### 9. Configuration .env
```bash
cd /var/www/expira
nano .env
```
Ajoutez toutes les variables (voir MANUAL_DEPLOY.md pour la liste complète)

### 10. Installation dépendances
```bash
cd /var/www/expira
npm ci --production=false
```

### 11. Configuration Prisma
```bash
npx prisma generate
npx prisma migrate deploy
```

### 12. Build
```bash
npm run build
```

### 13. Configuration Nginx (HTTP)
```bash
sudo cp nginx.conf.temp /etc/nginx/sites-available/expira.io
sudo ln -s /etc/nginx/sites-available/expira.io /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 14. Démarrer l'application
```bash
pm2 start npm --name "expira" -- start
pm2 save
pm2 status
```

### 15. Obtenir SSL
```bash
sudo certbot --nginx -d expira.io -d www.expira.io
```

## ✅ Vérification

```bash
# Application
pm2 status
curl http://localhost:3000

# Nginx
sudo systemctl status nginx

# Base de données
sudo systemctl status postgresql

# SSL
curl -I https://expira.io
```

## 🔄 Mise à jour

```bash
cd /var/www/expira
git pull origin main
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart expira
```

## 📝 Logs

```bash
# Application
pm2 logs expira

# Nginx
sudo tail -f /var/log/nginx/expira-error.log
```

---

**Pour plus de détails, consultez [MANUAL_DEPLOY.md](./MANUAL_DEPLOY.md)**

