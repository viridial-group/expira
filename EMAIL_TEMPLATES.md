# Email Templates Documentation

## ✅ Templates Disponibles

Le système inclut plusieurs templates d'email professionnels et responsives pour communiquer avec vos utilisateurs.

## 📧 Templates Disponibles

### 1. **Welcome Email** (`getWelcomeEmailTemplate`)
Email de bienvenue pour les nouveaux utilisateurs.

**Utilisation:**
```typescript
import { getWelcomeEmailTemplate, sendMarketingEmail } from '@/lib/email-templates'

// Option 1: Obtenir le HTML
const html = getWelcomeEmailTemplate({
  userName: 'John Doe'
})

// Option 2: Envoyer directement
await sendMarketingEmail('user@example.com', 'welcome', {
  userName: 'John Doe'
})
```

**Données disponibles:**
- `userName`: Nom de l'utilisateur

### 2. **Invitation Email** (`getInvitationEmailTemplate`)
Email pour inviter des personnes à utiliser expira.

**Utilisation:**
```typescript
await sendMarketingEmail('friend@example.com', 'invitation', {
  userName: 'Jane',
  inviterName: 'John Doe'
})
```

**Données disponibles:**
- `userName`: Nom de la personne invitée
- `inviterName`: Nom de la personne qui invite

### 3. **Marketing Email** (`getMarketingEmailTemplate`)
Email marketing pour promouvoir expira et ses fonctionnalités.

**Utilisation:**
```typescript
await sendMarketingEmail('prospect@example.com', 'marketing', {
  userName: 'Prospect Name'
})
```

**Données disponibles:**
- `userName`: Nom du destinataire

### 4. **Expiration Warning Email** (`getExpirationWarningEmailTemplate`)
Email d'alerte pour les produits qui expirent bientôt.

**Utilisation:**
```typescript
await sendMarketingEmail('user@example.com', 'expiration', {
  userName: 'John Doe',
  productName: 'example.com',
  daysUntilExpiry: 7,
  url: 'https://example.com'
})
```

**Données disponibles:**
- `userName`: Nom de l'utilisateur
- `productName`: Nom du produit
- `daysUntilExpiry`: Nombre de jours avant expiration
- `url`: URL du produit

### 5. **Feature Announcement Email** (`getFeatureAnnouncementEmailTemplate`)
Email pour annoncer de nouvelles fonctionnalités.

**Utilisation:**
```typescript
await sendMarketingEmail('user@example.com', 'feature', {
  userName: 'John Doe',
  featureName: 'SMS Notifications',
  featureDescription: 'You can now receive SMS alerts for critical issues!'
})
```

**Données disponibles:**
- `userName`: Nom de l'utilisateur
- `featureName`: Nom de la fonctionnalité
- `featureDescription`: Description de la fonctionnalité

## 🚀 API d'Invitation

### POST `/api/marketing/send-invitation`

Envoyer des invitations en masse.

**Request Body:**
```json
{
  "emails": ["user1@example.com", "user2@example.com"],
  "message": "Optional custom message"
}
```

**Response:**
```json
{
  "success": true,
  "sent": 2,
  "failed": 0,
  "total": 2
}
```

**Exemple d'utilisation:**
```typescript
const response = await fetch('/api/marketing/send-invitation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emails: ['friend1@example.com', 'friend2@example.com'],
    message: 'Check out this amazing tool!'
  })
})
```

## 🎨 Caractéristiques des Templates

### Design
- ✅ **Responsive**: S'adapte à tous les appareils
- ✅ **Moderne**: Design professionnel avec gradients
- ✅ **Accessible**: Bon contraste et structure claire
- ✅ **Branded**: Couleurs et style cohérents avec expira

### Structure
- Header avec logo et branding
- Contenu principal personnalisable
- Footer avec liens et informations légales
- Call-to-action (CTA) clairs

### Couleurs
- Primary: `#0ea5e9` (Bleu expira)
- Success: `#22c55e` (Vert)
- Warning: `#f59e0b` (Orange)
- Danger: `#ef4444` (Rouge)

## 📝 Exemples d'Utilisation

### Dans le code backend

```typescript
import { sendMarketingEmail } from '@/lib/email-templates'

// Après l'inscription
await sendMarketingEmail(user.email, 'welcome', {
  userName: user.name
})

// Annoncer une nouvelle fonctionnalité
await sendMarketingEmail(user.email, 'feature', {
  userName: user.name,
  featureName: 'SMS Notifications',
  featureDescription: 'Receive SMS alerts for critical issues'
})
```

### Dans une route API

```typescript
import { sendMarketingEmail } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  const { email, userName } = await request.json()
  
  await sendMarketingEmail(email, 'invitation', {
    userName,
    inviterName: 'expira Team'
  })
  
  return NextResponse.json({ success: true })
}
```

## 🔧 Personnalisation

Tous les templates utilisent la fonction `getBaseTemplate` qui fournit:
- Structure HTML responsive
- Header avec branding expira
- Footer avec liens légaux
- Styles inline pour compatibilité email

Pour personnaliser, modifiez les fonctions dans `lib/email-templates.ts`.

## 📊 Statistiques

Les templates sont optimisés pour:
- ✅ Taux d'ouverture élevé
- ✅ Taux de clic optimisé
- ✅ Compatibilité avec tous les clients email
- ✅ Temps de chargement rapide

## 🎯 Meilleures Pratiques

1. **Personnalisation**: Utilisez toujours le nom de l'utilisateur
2. **CTA clairs**: Un seul call-to-action principal par email
3. **Urgence**: Utilisez les couleurs appropriées (rouge pour urgent)
4. **Test**: Testez toujours les emails avant l'envoi en masse
5. **Spam**: Respectez les règles anti-spam (opt-out, etc.)

## 📚 Ressources

- [Email Template Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)
- [Responsive Email Design](https://www.emailonacid.com/blog/article/email-development/responsive-email-design/)

---

**Date**: Janvier 2025
**Status**: ✅ Implémentation Complète

