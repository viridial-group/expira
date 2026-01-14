# Dépannage des Push Notifications

## 🔍 Vérifications de Base

### 1. Vérifier les Clés VAPID

```bash
# Vérifier que les clés sont définies dans .env
echo $NEXT_PUBLIC_VAPID_PUBLIC_KEY
echo $VAPID_PRIVATE_KEY
```

**Si les clés n'existent pas :**
```bash
node scripts/generate-vapid-keys.js
```

Puis ajoutez-les à votre `.env` :
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=votre_cle_publique
VAPID_PRIVATE_KEY=votre_cle_privee
VAPID_SUBJECT=mailto:admin@expira.io
```

### 2. Vérifier l'Abonnement

**Dans la console du navigateur (F12) :**
```javascript
// Vérifier le service worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg)
  if (reg) {
    reg.pushManager.getSubscription().then(sub => {
      console.log('Subscription:', sub)
      if (sub) {
        console.log('Endpoint:', sub.endpoint)
        console.log('Keys:', {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))),
          auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth'))))
        })
      }
    })
  }
})
```

### 3. Vérifier les Permissions

```javascript
// Vérifier la permission de notification
console.log('Notification permission:', Notification.permission)

// Si "denied", l'utilisateur doit l'activer dans les paramètres du navigateur
```

### 4. Vérifier HTTPS

**Important :** Les push notifications nécessitent HTTPS en production (sauf localhost).

- ✅ `http://localhost:3000` - Fonctionne
- ✅ `https://expira.io` - Fonctionne
- ❌ `http://expira.io` - Ne fonctionne PAS

## 🐛 Problèmes Courants

### Problème 1 : "Push notifications not configured"

**Cause :** `NEXT_PUBLIC_VAPID_PUBLIC_KEY` n'est pas défini.

**Solution :**
1. Générez les clés VAPID
2. Ajoutez-les au `.env`
3. Redémarrez le serveur de développement
4. Rebuild l'application en production

### Problème 2 : Service Worker ne s'enregistre pas

**Vérifications :**
1. Le fichier `/sw.js` existe dans `public/sw.js`
2. Le service worker est accessible à `https://expira.io/sw.js`
3. Vérifiez la console pour les erreurs

**Solution :**
```bash
# Vérifier que le fichier existe
ls -la public/sw.js

# Tester l'accès
curl https://expira.io/sw.js
```

### Problème 3 : Abonnement réussi mais notifications ne s'affichent pas

**Causes possibles :**
1. Le service worker ne reçoit pas les notifications
2. Le format du payload est incorrect
3. Les notifications sont bloquées par le navigateur

**Vérifications :**

1. **Vérifier que l'abonnement est enregistré en base :**
```sql
SELECT * FROM push_subscriptions WHERE enabled = true;
```

2. **Tester l'envoi manuel :**
Utilisez l'endpoint de test `/api/push/test` (voir ci-dessous)

3. **Vérifier les logs du service worker :**
- Ouvrez DevTools > Application > Service Workers
- Cliquez sur "Inspect" pour voir les logs

### Problème 4 : Notifications s'affichent mais sans contenu

**Cause :** Format du payload incorrect.

**Solution :** Vérifiez que le payload contient `title` et `message` :
```javascript
{
  title: "Mon titre",
  message: "Mon message",
  body: "Mon message" // Alternative
}
```

### Problème 5 : Erreur "Failed to enable push notifications"

**Causes possibles :**
1. Permission refusée
2. Service worker non accessible
3. Clé VAPID invalide

**Solution :**
1. Vérifiez les permissions dans les paramètres du navigateur
2. Vérifiez que le service worker est accessible
3. Vérifiez que les clés VAPID sont correctes

## 🧪 Test Manuel

### Test 1 : Vérifier l'Abonnement

```javascript
// Dans la console du navigateur
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    if (sub) {
      console.log('✅ Abonné:', sub.endpoint)
    } else {
      console.log('❌ Non abonné')
    }
  })
})
```

### Test 2 : Envoyer une Notification de Test

Utilisez l'endpoint `/api/push/test` (voir ci-dessous) ou testez manuellement :

```bash
# Récupérer l'endpoint depuis la base de données
# Puis utiliser web-push pour envoyer
```

### Test 3 : Vérifier le Service Worker

```javascript
// Dans la console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs)
  regs.forEach(reg => {
    console.log('Scope:', reg.scope)
    console.log('Active:', reg.active)
  })
})
```

## 🔧 Solutions Avancées

### Forcer la Réinscription

Si l'abonnement semble corrompu :

```javascript
// Dans la console du navigateur
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    if (sub) {
      sub.unsubscribe().then(() => {
        console.log('Désabonné, réessayez depuis Settings')
      })
    }
  })
})
```

### Vérifier les Logs Serveur

Vérifiez les logs du serveur pour voir les erreurs lors de l'envoi :

```bash
# Si vous utilisez PM2
pm2 logs

# Si vous utilisez Vercel
# Vérifiez dans le dashboard Vercel > Functions > Logs
```

### Vérifier la Base de Données

```sql
-- Vérifier les abonnements actifs
SELECT 
  ps.id,
  ps.userId,
  ps.enabled,
  ps.createdAt,
  u.email
FROM push_subscriptions ps
JOIN users u ON ps.userId = u.id
WHERE ps.enabled = true;
```

## 📝 Checklist de Dépannage

- [ ] Clés VAPID générées et configurées
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` dans `.env`
- [ ] `VAPID_PRIVATE_KEY` dans `.env`
- [ ] Service worker accessible à `/sw.js`
- [ ] Permissions de notification accordées
- [ ] HTTPS activé (en production)
- [ ] Abonnement enregistré en base de données
- [ ] Service worker actif dans DevTools
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Pas d'erreurs dans les logs serveur

## 🆘 Support

Si le problème persiste :

1. **Collectez les informations :**
   - Console du navigateur (erreurs)
   - Logs serveur
   - État du service worker
   - État de l'abonnement

2. **Vérifiez les logs :**
   ```bash
   # Logs serveur
   tail -f logs/app.log
   
   # Logs PM2
   pm2 logs
   ```

3. **Testez avec l'endpoint de test :**
   Utilisez `/api/push/test` pour envoyer une notification de test

