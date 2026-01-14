# Configuration des Notifications Push

## Prérequis

Les notifications push nécessitent des clés VAPID (Voluntary Application Server Identification) pour fonctionner.

## 1. Générer les clés VAPID

Exécutez la commande suivante pour générer vos clés VAPID :

```bash
node scripts/generate-vapid-keys.js
```

Cela générera :
- **Public Key** : À ajouter dans `.env` comme `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- **Private Key** : À ajouter dans `.env` comme `VAPID_PRIVATE_KEY`
- **Subject** : Email de contact (optionnel, par défaut: `mailto:admin@expira.io`)

## 2. Ajouter les clés à votre fichier .env

```env
# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-WHGMM3NB

# Push Notifications (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=votre_cle_publique_ici
VAPID_PRIVATE_KEY=votre_cle_privee_ici
VAPID_SUBJECT=mailto:admin@expira.io
```

## 3. Installer les dépendances

```bash
npm install
```

Assurez-vous que `web-push` est installé :
```bash
npm list web-push
```

## 4. Créer la migration Prisma

```bash
npx prisma migrate dev --name add_push_subscriptions
npx prisma generate
```

## 5. Vérifier le Service Worker

Le service worker doit être accessible à `/sw.js`. Vérifiez que le fichier `public/sw.js` existe.

## 6. Tester les notifications push

1. Allez dans Settings > Notifications
2. Cliquez sur "Enable Push Notifications"
3. Autorisez les notifications dans votre navigateur
4. Vous devriez voir "Push notifications enabled!"

## Dépannage

### Le bouton reste en "Loading..."

**Causes possibles :**
1. **Clé VAPID non configurée** : Vérifiez que `NEXT_PUBLIC_VAPID_PUBLIC_KEY` est défini dans `.env`
2. **Service Worker non accessible** : Vérifiez que `/sw.js` est accessible
3. **Navigateur non compatible** : Les notifications push nécessitent HTTPS (sauf en localhost)

### "Push notifications not configured"

La clé VAPID publique n'est pas configurée. Ajoutez `NEXT_PUBLIC_VAPID_PUBLIC_KEY` à votre `.env`.

### "Push notifications not supported in your browser"

Votre navigateur ne supporte pas les notifications push ou vous n'êtes pas en HTTPS.

### Erreur lors de l'enregistrement

Vérifiez la console du navigateur pour plus de détails. Les erreurs courantes :
- Service worker non accessible
- Clé VAPID invalide
- Permissions refusées

## Notes importantes

- Les notifications push nécessitent **HTTPS** en production (sauf localhost)
- Le service worker doit être accessible depuis la racine du site
- Les clés VAPID doivent être les mêmes pour tous les environnements (dev/prod)
- Ne partagez jamais votre clé privée VAPID publiquement

