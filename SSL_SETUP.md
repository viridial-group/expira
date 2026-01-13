# Guide de Configuration SSL pour expira.io

## Problème
L'erreur indique que le certificat SSL n'existe pas encore. Il faut d'abord configurer Nginx en HTTP, puis obtenir le certificat SSL avec Certbot.

## Solution en 3 étapes

### Étape 1: Configuration Nginx temporaire (HTTP)

1. **Supprimez la configuration actuelle** (si elle existe):
   ```bash
   sudo rm /etc/nginx/sites-enabled/expira.io
   ```

2. **Copiez la configuration temporaire**:
   ```bash
   sudo cp nginx.conf.temp /etc/nginx/sites-available/expira.io
   ```

3. **Créez le lien symbolique**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/expira.io /etc/nginx/sites-enabled/
   ```

4. **Testez la configuration**:
   ```bash
   sudo nginx -t
   ```

5. **Redémarrez Nginx**:
   ```bash
   sudo systemctl restart nginx
   ```

6. **Vérifiez que l'application fonctionne**:
   - Assurez-vous que PM2 est démarré: `pm2 status`
   - Vérifiez que l'application écoute sur le port 3000: `netstat -tlnp | grep 3000`
   - Testez l'accès: `curl http://localhost:3000` ou ouvrez `http://expira.io` dans votre navigateur

### Étape 2: Obtenir le certificat SSL avec Certbot

1. **Vérifiez que Certbot est installé**:
   ```bash
   certbot --version
   ```
   Si ce n'est pas le cas:
   ```bash
   sudo apt update
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Vérifiez que le DNS pointe correctement**:
   ```bash
   ping expira.io
   # Doit retourner l'IP de votre serveur (148.230.112.148)
   ```

3. **Obtenez le certificat SSL**:
   ```bash
   sudo certbot --nginx -d expira.io -d www.expira.io
   ```

   Certbot va:
   - Vérifier que le domaine pointe vers votre serveur
   - Obtenir le certificat SSL
   - Modifier automatiquement votre configuration Nginx pour activer HTTPS
   - Configurer le renouvellement automatique

4. **Testez le renouvellement automatique**:
   ```bash
   sudo certbot renew --dry-run
   ```

### Étape 3: Configuration finale (HTTPS)

Une fois le certificat obtenu, Certbot aura automatiquement modifié votre configuration Nginx. Vous pouvez maintenant:

1. **Vérifier la configuration**:
   ```bash
   sudo nginx -t
   ```

2. **Redémarrer Nginx**:
   ```bash
   sudo systemctl restart nginx
   ```

3. **Tester l'accès HTTPS**:
   - Ouvrez `https://expira.io` dans votre navigateur
   - Vérifiez que le cadenas SSL s'affiche

4. **Optionnel: Remplacer par la configuration complète**:
   Si vous voulez utiliser la configuration complète avec tous les headers de sécurité:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/expira.io
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Vérification

### Vérifier que tout fonctionne:

1. **HTTP redirige vers HTTPS**:
   ```bash
   curl -I http://expira.io
   # Doit retourner: HTTP/1.1 301 Moved Permanently
   ```

2. **HTTPS fonctionne**:
   ```bash
   curl -I https://expira.io
   # Doit retourner: HTTP/1.1 200 OK
   ```

3. **Certificat SSL valide**:
   ```bash
   openssl s_client -connect expira.io:443 -servername expira.io
   # Vérifiez la date d'expiration du certificat
   ```

## Dépannage

### Erreur: "Failed to obtain certificate"

**Causes possibles:**
1. Le DNS ne pointe pas vers votre serveur
   - Vérifiez: `ping expira.io` doit retourner l'IP de votre serveur
   - Attendez la propagation DNS (peut prendre jusqu'à 48h)

2. Le port 80 n'est pas accessible
   - Vérifiez le firewall: `sudo ufw status`
   - Autorisez le port 80: `sudo ufw allow 80/tcp`

3. Nginx n'est pas démarré
   - Vérifiez: `sudo systemctl status nginx`
   - Démarrez: `sudo systemctl start nginx`

### Erreur: "Address already in use"

Un autre service utilise le port 80 ou 443:
```bash
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### Le certificat expire bientôt

Renouvelez manuellement:
```bash
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

## Renouvellement automatique

Certbot configure automatiquement un timer systemd pour renouveler les certificats. Vérifiez:
```bash
sudo systemctl status certbot.timer
```

## Commandes utiles

```bash
# Voir les certificats installés
sudo certbot certificates

# Renouveler tous les certificats
sudo certbot renew

# Tester le renouvellement
sudo certbot renew --dry-run

# Voir les logs Certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

