# Guide de Configuration du Cron Job

Le cron job vérifie automatiquement l'expiration des produits et envoie des notifications.

## 🚀 Méthodes pour Lancer le Cron

### 1. Script Node.js (Local/Production)

**Exécution manuelle :**
```bash
# Avec tsx (si installé)
npx tsx scripts/check-expirations.ts

# Ou avec ts-node
npx ts-node scripts/check-expirations.ts
```

**Ajouter au package.json :**
```json
{
  "scripts": {
    "check-expirations": "tsx scripts/check-expirations.ts"
  }
}
```

Puis exécuter :
```bash
npm run check-expirations
```

### 2. API Endpoint (Recommandé pour Production)

L'endpoint `/api/cron/check-expirations` peut être appelé par un service externe.

**Test manuel :**
```bash
curl -X GET "https://expira.io/api/cron/check-expirations" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Configuration requise :**
- Variable d'environnement `CRON_SECRET` doit être définie
- L'endpoint vérifie l'authentification via le header `Authorization`

### 3. Cron Linux/Unix (VPS/Server)

**Ajouter au crontab :**
```bash
# Éditer le crontab
crontab -e

# Ajouter une ligne pour exécuter toutes les 6 heures
0 */6 * * * curl -X GET "https://expira.io/api/cron/check-expirations" -H "Authorization: Bearer YOUR_CRON_SECRET" >> /var/log/expira-cron.log 2>&1

# Ou toutes les heures
0 * * * * curl -X GET "https://expira.io/api/cron/check-expirations" -H "Authorization: Bearer YOUR_CRON_SECRET" >> /var/log/expira-cron.log 2>&1

# Ou tous les jours à minuit
0 0 * * * curl -X GET "https://expira.io/api/cron/check-expirations" -H "Authorization: Bearer YOUR_CRON_SECRET" >> /var/log/expira-cron.log 2>&1
```

**Avec Node.js directement (si le script est sur le serveur) :**
```bash
# Toutes les 6 heures
0 */6 * * * cd /var/www/expira && /usr/bin/node scripts/check-expirations.js >> /var/log/expira-cron.log 2>&1
```

**Note :** Assurez-vous que le script est compilé en JavaScript ou utilisez `tsx`/`ts-node`.

### 4. Vercel Cron (Déploiement Vercel)

Le fichier `vercel.json` est déjà configuré :
```json
{
  "crons": [
    {
      "path": "/api/cron/check-expirations",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Configuration :**
1. Déployez sur Vercel
2. Ajoutez la variable d'environnement `CRON_SECRET` dans Vercel
3. Le cron s'exécutera automatiquement toutes les 6 heures

**Modifier la fréquence :**
- `0 */6 * * *` = Toutes les 6 heures
- `0 * * * *` = Toutes les heures
- `0 0 * * *` = Tous les jours à minuit
- `*/30 * * * *` = Toutes les 30 minutes

### 5. Services Externes (Gratuits)

#### cron-job.org (Gratuit)

1. Créez un compte sur https://cron-job.org
2. Créez un nouveau cron job :
   - **URL** : `https://expira.io/api/cron/check-expirations`
   - **Méthode** : GET
   - **Headers** : `Authorization: Bearer YOUR_CRON_SECRET`
   - **Schedule** : Toutes les 6 heures (ou selon vos besoins)
3. Enregistrez et activez

#### EasyCron (Gratuit)

1. Créez un compte sur https://www.easycron.com
2. Créez un nouveau cron job avec les mêmes paramètres que ci-dessus

#### GitHub Actions (Gratuit)

Créez `.github/workflows/check-expirations.yml` :
```yaml
name: Check Product Expirations

on:
  schedule:
    - cron: '0 */6 * * *'  # Toutes les 6 heures
  workflow_dispatch:  # Permet l'exécution manuelle

jobs:
  check-expirations:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: |
          curl -X GET "${{ secrets.APP_URL }}/api/cron/check-expirations" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**Configuration :**
1. Allez dans Settings > Secrets > Actions
2. Ajoutez :
   - `APP_URL` : `https://expira.io`
   - `CRON_SECRET` : Votre secret de cron

### 6. PM2 Cron (Avec PM2)

Si vous utilisez PM2 sur votre VPS :

**Installer pm2-cron :**
```bash
npm install -g pm2-cron
```

**Créer un fichier `ecosystem.config.js` :**
```javascript
module.exports = {
  apps: [
    {
      name: 'expira-cron',
      script: 'scripts/check-expirations.ts',
      interpreter: 'tsx',
      cron_restart: '0 */6 * * *',
      autorestart: false,
      watch: false,
    }
  ]
}
```

**Démarrer :**
```bash
pm2 start ecosystem.config.js
pm2 save
```

## 🔐 Configuration de la Sécurité

### Générer un CRON_SECRET

```bash
# Générer un secret aléatoire
openssl rand -base64 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Ajouter au .env

```env
CRON_SECRET=votre_secret_genere_ici
```

## 📊 Vérification et Logs

### Tester l'endpoint manuellement

```bash
# Avec curl
curl -X GET "http://localhost:3000/api/cron/check-expirations" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Réponse attendue
{
  "success": true,
  "message": "Expiration check completed"
}
```

### Vérifier les logs

**Si vous utilisez un cron Linux :**
```bash
# Voir les logs
tail -f /var/log/expira-cron.log
```

**Si vous utilisez PM2 :**
```bash
pm2 logs expira-cron
```

**Si vous utilisez Vercel :**
- Allez dans Vercel Dashboard > Functions > Logs

## ⚙️ Fréquences Recommandées

- **Toutes les 6 heures** : Pour la plupart des cas (défaut)
- **Toutes les heures** : Pour un monitoring plus fréquent
- **Toutes les 30 minutes** : Pour un monitoring en temps réel (nécessite plus de ressources)
- **Tous les jours à minuit** : Pour un monitoring quotidien

## 🐛 Dépannage

### Erreur "Unauthorized"

- Vérifiez que `CRON_SECRET` est défini dans `.env`
- Vérifiez que le header `Authorization: Bearer YOUR_CRON_SECRET` est correct
- Le secret doit correspondre exactement

### Le cron ne s'exécute pas

1. **Vérifier la configuration :**
   - Vérifiez que le cron est bien configuré
   - Vérifiez les logs pour les erreurs

2. **Tester manuellement :**
   ```bash
   curl -X GET "https://expira.io/api/cron/check-expirations" \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

3. **Vérifier les permissions :**
   - Assurez-vous que le script a les permissions d'exécution
   - Vérifiez que la base de données est accessible

### Erreurs de connexion à la base de données

- Vérifiez que `DATABASE_URL` est correctement configuré
- Vérifiez que PostgreSQL est en cours d'exécution
- Vérifiez les permissions de la base de données

## 📝 Exemple Complet pour VPS

```bash
# 1. Créer un script wrapper
cat > /var/www/expira/run-cron.sh << 'EOF'
#!/bin/bash
cd /var/www/expira
export $(cat .env | xargs)
/usr/bin/node scripts/check-expirations.js
EOF

# 2. Rendre exécutable
chmod +x /var/www/expira/run-cron.sh

# 3. Ajouter au crontab
crontab -e
# Ajouter :
0 */6 * * * /var/www/expira/run-cron.sh >> /var/log/expira-cron.log 2>&1

# 4. Vérifier
crontab -l
```

## 🎯 Résumé Rapide

**Pour un déploiement VPS :**
```bash
# Option 1: API Endpoint (recommandé)
0 */6 * * * curl -X GET "https://expira.io/api/cron/check-expirations" -H "Authorization: Bearer YOUR_CRON_SECRET"

# Option 2: Script direct
0 */6 * * * cd /var/www/expira && /usr/bin/node scripts/check-expirations.js
```

**Pour Vercel :**
- Le cron est automatiquement configuré via `vercel.json`
- Assurez-vous d'ajouter `CRON_SECRET` dans les variables d'environnement Vercel

**Pour tester localement :**
```bash
npm run check-expirations
# ou
curl -X GET "http://localhost:3000/api/cron/check-expirations" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

