# Activer HTTPS pour expira.io

## Problème
Le site affiche "Not Secure" car il n'utilise pas encore HTTPS (certificat SSL).

## Solution en 3 étapes

### Étape 1: Vérifier que Nginx fonctionne en HTTP

```bash
# Vérifier que le site est accessible en HTTP
curl -I http://expira.io

# Vérifier la configuration Nginx actuelle
sudo cat /etc/nginx/sites-available/expira.io
```

### Étape 2: Obtenir le certificat SSL avec Certbot

```bash
# Obtenir le certificat SSL
sudo certbot --nginx -d expira.io -d www.expira.io
```

Certbot va:
1. Vérifier que le domaine pointe vers votre serveur
2. Obtenir le certificat SSL de Let's Encrypt
3. Modifier automatiquement votre configuration Nginx pour activer HTTPS
4. Configurer la redirection HTTP → HTTPS

**Répondez aux questions:**
- Email: Entrez votre email (pour les notifications de renouvellement)
- Terms of Service: Tapez `A` pour accepter
- Share email: Tapez `Y` ou `N` selon votre préférence

### Étape 3: Vérifier que HTTPS fonctionne

```bash
# Tester HTTPS
curl -I https://expira.io

# Vérifier la configuration Nginx
sudo nginx -t

# Redémarrer Nginx si nécessaire
sudo systemctl restart nginx
```

## Vérification

### 1. Vérifier le certificat SSL

```bash
# Voir les certificats installés
sudo certbot certificates

# Vérifier la date d'expiration
openssl s_client -connect expira.io:443 -servername expira.io < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

### 2. Tester dans le navigateur

1. Ouvrez `https://expira.io` (avec https://)
2. Vérifiez que le cadenas vert s'affiche
3. Vérifiez que HTTP redirige automatiquement vers HTTPS

### 3. Vérifier la redirection HTTP → HTTPS

```bash
# Tester la redirection
curl -I http://expira.io

# Doit retourner: HTTP/1.1 301 Moved Permanently
# Et: Location: https://expira.io
```

## Dépannage

### Erreur: "Failed to obtain certificate"

**Causes possibles:**

1. **Le DNS ne pointe pas vers votre serveur**
   ```bash
   # Vérifier
   ping expira.io
   # Doit retourner l'IP de votre serveur
   ```

2. **Le port 80 n'est pas accessible**
   ```bash
   # Vérifier le firewall
   sudo ufw status
   
   # Autoriser le port 80 si nécessaire
   sudo ufw allow 80/tcp
   ```

3. **Nginx n'est pas démarré**
   ```bash
   sudo systemctl status nginx
   sudo systemctl start nginx
   ```

4. **Un autre service utilise le port 80**
   ```bash
   sudo netstat -tlnp | grep :80
   sudo ss -tlnp | grep :80
   ```

### Erreur: "Domain not pointing to this server"

- Vérifiez que le DNS A record pointe vers l'IP de votre serveur
- Attendez la propagation DNS (peut prendre jusqu'à 48h)
- Vérifiez avec: `dig expira.io` ou `nslookup expira.io`

### Le certificat est obtenu mais le site est toujours "Not Secure"

1. **Vérifiez que vous accédez en HTTPS**
   - Utilisez `https://expira.io` (pas `http://`)
   - Ou vérifiez que la redirection HTTP → HTTPS fonctionne

2. **Vérifiez la configuration Nginx**
   ```bash
   sudo cat /etc/nginx/sites-available/expira.io
   ```
   
   Doit contenir:
   - Un bloc `server` pour le port 80 avec redirection
   - Un bloc `server` pour le port 443 avec SSL

3. **Vérifiez que les certificats existent**
   ```bash
   sudo ls -la /etc/letsencrypt/live/expira.io/
   ```
   
   Doit contenir:
   - `fullchain.pem`
   - `privkey.pem`

4. **Redémarrez Nginx**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Configuration manuelle (si Certbot échoue)

Si Certbot ne peut pas modifier automatiquement la configuration:

```bash
# 1. Obtenir le certificat en mode standalone
sudo certbot certonly --standalone -d expira.io -d www.expira.io

# 2. Copier la configuration HTTPS
sudo cp /var/www/expira/nginx.conf /etc/nginx/sites-available/expira.io

# 3. Tester
sudo nginx -t

# 4. Redémarrer
sudo systemctl restart nginx
```

## Renouvellement automatique

Certbot configure automatiquement le renouvellement. Vérifiez:

```bash
# Vérifier le timer
sudo systemctl status certbot.timer

# Tester le renouvellement
sudo certbot renew --dry-run
```

## Commandes utiles

```bash
# Voir les certificats
sudo certbot certificates

# Renouveler manuellement
sudo certbot renew --force-renewal

# Voir les logs Certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Vérifier la configuration Nginx
sudo nginx -t

# Recharger Nginx (sans redémarrer)
sudo nginx -s reload
```

