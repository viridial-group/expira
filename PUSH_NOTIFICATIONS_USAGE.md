# Guide d'Utilisation des Push Notifications

## 📱 Pour les Utilisateurs

### Activer les Push Notifications

1. **Aller dans Settings** :
   - Connectez-vous à votre compte
   - Allez dans **Dashboard > Settings > Notifications**

2. **Activer les notifications** :
   - Cliquez sur le bouton **"Enable Push Notifications"**
   - Votre navigateur vous demandera la permission
   - Cliquez sur **"Autoriser"** ou **"Allow"**

3. **Vérifier l'activation** :
   - Le bouton devrait changer en **"Disable Push Notifications"**
   - Vous recevrez un message de confirmation

### Désactiver les Push Notifications

- Cliquez sur **"Disable Push Notifications"** dans Settings > Notifications
- Les notifications seront désactivées immédiatement

## 👨‍💻 Pour les Développeurs

### 1. Envoyer une Push Notification à un Utilisateur

```typescript
import { sendPushNotification } from '@/lib/push-notifications'

// Envoyer une notification simple
await sendPushNotification(userId, {
  title: 'Product Expired',
  message: 'Your product "example.com" has expired.',
  url: '/dashboard/products',
})

// Notification avec options avancées
await sendPushNotification(userId, {
  title: 'Urgent: SSL Certificate Expiring',
  message: 'Your SSL certificate will expire in 3 days.',
  icon: '/icon-192x192.png',
  badge: '/badge-72x72.png',
  tag: 'ssl-expiry',
  requireInteraction: true, // Notification reste visible jusqu'à interaction
  url: '/dashboard/products/123',
  data: {
    productId: '123',
    type: 'ssl_expiry',
  },
})
```

### 2. Envoyer à Plusieurs Utilisateurs

```typescript
import { sendPushNotificationToUsers } from '@/lib/push-notifications'

// Envoyer à plusieurs utilisateurs
const userIds = ['user1', 'user2', 'user3']
const result = await sendPushNotificationToUsers(userIds, {
  title: 'Maintenance Scheduled',
  message: 'Scheduled maintenance on Saturday at 2 AM.',
  url: '/dashboard',
})

console.log(`Sent: ${result.sent}, Failed: ${result.failed}`)
```

### 3. Vérifier le Statut d'Abonnement

```typescript
import { getUserPushSubscriptionStatus } from '@/lib/push-notifications'

const status = await getUserPushSubscriptionStatus(userId)
console.log(`Subscribed: ${status.subscribed}`)
console.log(`Active subscriptions: ${status.count}`)
```

### 4. Utiliser avec le Système de Notifications

Les push notifications sont automatiquement envoyées via `createNotification()` :

```typescript
import { createNotification } from '@/lib/notifications'

// Envoie automatiquement une push notification
await createNotification(
  userId,
  'push', // ou 'in_app' pour envoyer aussi une push
  'Product Check Failed',
  'Your product "example.com" is not responding.'
)
```

### 5. Exemples d'Intégration

#### Exemple 1 : Notification lors d'une expiration de produit

```typescript
// Dans app/api/products/[id]/check/route.ts
if (status === 'expired') {
  await createNotification(
    user.id,
    'push', // Envoie push + in-app
    'Product Expired',
    `Your product "${product.name}" has expired.`
  )
}
```

#### Exemple 2 : Notification pour erreur critique

```typescript
if (checkStatus === 'error' && isCritical) {
  await createNotification(
    userId,
    'push',
    'Critical Error Detected',
    `Your product "${product.name}" is experiencing critical issues.`
  )
}
```

#### Exemple 3 : Notification personnalisée

```typescript
import { sendPushNotification } from '@/lib/push-notifications'

// Notification avec redirection personnalisée
await sendPushNotification(userId, {
  title: 'New Feature Available',
  message: 'Check out our new dashboard analytics!',
  url: '/dashboard/analytics',
  tag: 'feature-announcement',
  requireInteraction: false,
})
```

## 🔧 API Endpoints

### POST `/api/push/subscribe`

S'abonner aux push notifications (appelé automatiquement par `PushNotificationManager`).

**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "base64_encoded_key",
    "auth": "base64_encoded_key"
  }
}
```

### POST `/api/push/unsubscribe`

Se désabonner des push notifications.

**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/..."
}
```

## 📊 Structure des Données

### PushNotificationPayload

```typescript
interface PushNotificationPayload {
  title: string                    // Titre de la notification
  message: string                  // Message de la notification
  icon?: string                    // URL de l'icône (défaut: /icon-192x192.png)
  badge?: string                   // URL du badge (défaut: /icon-192x192.png)
  tag?: string                     // Tag pour regrouper les notifications
  requireInteraction?: boolean     // Notification reste visible (défaut: false)
  url?: string                     // URL de redirection au clic (défaut: /dashboard/notifications)
  data?: any                       // Données personnalisées
}
```

## 🎯 Cas d'Usage Recommandés

### 1. Notifications Critiques
- Expirations de produits (≤ 7 jours)
- Erreurs critiques de produits
- Échecs de vérification importants

### 2. Notifications Informatives
- Nouvelles fonctionnalités
- Mises à jour de maintenance
- Rappels de renouvellement

### 3. Notifications de Sécurité
- Changements de statut SSL
- Alertes de sécurité
- Activité suspecte

## ⚙️ Configuration

### Variables d'Environnement Requises

```env
# Clés VAPID (générées avec scripts/generate-vapid-keys.js)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=votre_cle_publique
VAPID_PRIVATE_KEY=votre_cle_privee
VAPID_SUBJECT=mailto:admin@expira.io
```

### Service Worker

Le service worker doit être accessible à `/sw.js`. Il gère :
- Réception des push notifications
- Affichage des notifications
- Redirection au clic

## 🔍 Dépannage

### La notification n'apparaît pas

1. **Vérifier les permissions** :
   - Le navigateur doit avoir la permission "Notifications"
   - Vérifier dans les paramètres du navigateur

2. **Vérifier HTTPS** :
   - Les push notifications nécessitent HTTPS (sauf localhost)
   - Vérifier que le site est en HTTPS

3. **Vérifier le service worker** :
   - Ouvrir DevTools > Application > Service Workers
   - Vérifier que le service worker est actif

4. **Vérifier les clés VAPID** :
   - Les clés doivent être correctement configurées
   - Vérifier dans `.env`

### Erreur "Push subscription failed"

- Vérifier que les clés VAPID sont correctes
- Vérifier que le service worker est enregistré
- Vérifier la console du navigateur pour plus de détails

## 📝 Notes Importantes

- Les push notifications fonctionnent même si l'utilisateur n'a pas l'onglet ouvert
- Les notifications sont automatiquement nettoyées si l'abonnement devient invalide
- Un utilisateur peut avoir plusieurs abonnements (différents appareils/navigateurs)
- Les notifications sont envoyées à tous les abonnements actifs d'un utilisateur

## 🔄 Intégration Automatique

Les push notifications sont **automatiquement envoyées** dans les cas suivants :

### 1. Vérification de Produit (`/api/products/[id]/check`)
- ✅ Envoie une push notification si le produit a un problème
- ✅ Envoie aussi un email et SMS (si critique)

### 2. Vérification d'Expiration (`checkProductExpiration()`)
- ✅ Envoie une push notification pour toutes les expirations
- ✅ Envoie aussi un email et SMS (si ≤ 7 jours)

### 3. Notifications Générales (`createNotification()`)
- ✅ Si `type === 'push'` ou `type === 'in_app'`, envoie automatiquement une push
- ✅ Crée aussi une notification in-app dans le dashboard

## 🎯 Exemple Complet d'Intégration

```typescript
// Dans votre API route ou fonction
import { createNotification } from '@/lib/notifications'

// Exemple : Notification lors d'une erreur de vérification
if (productCheckFailed) {
  await createNotification(
    userId,
    'push', // Envoie push + in-app
    'Product Check Failed',
    `Your product "${productName}" is not responding.`
  )
}

// Exemple : Notification personnalisée avec redirection
import { sendPushNotification } from '@/lib/push-notifications'

await sendPushNotification(userId, {
  title: 'SSL Certificate Expiring',
  message: 'Your SSL certificate will expire in 5 days.',
  url: `/dashboard/products/${productId}`,
  tag: 'ssl-expiry',
  requireInteraction: true,
})
```

