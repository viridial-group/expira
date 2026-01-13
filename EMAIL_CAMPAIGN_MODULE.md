# Email Campaign Module - Documentation

## ✅ Implémentation Complète

Module complet pour créer et gérer des campagnes email pour les administrateurs.

## 📋 Fonctionnalités

### 1. **Modèle Prisma** (`prisma/schema.prisma`)

Nouveau modèle `EmailCampaign` pour stocker les campagnes :

```prisma
model EmailCampaign {
  id            String   @id @default(cuid())
  createdBy    String
  creator       User     @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  subject       String
  content       String   // HTML content
  recipientType String   // "all", "active", "trialing", "canceled", "custom"
  recipientEmails Json?  // Custom email list if recipientType is "custom"
  status        String   @default("draft") // "draft", "scheduled", "sending", "sent", "failed"
  sentCount     Int      @default(0)
  failedCount   Int      @default(0)
  totalRecipients Int    @default(0)
  scheduledAt   DateTime?
  sentAt        DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("email_campaigns")
}
```

### 2. **APIs Créées**

#### GET `/api/admin/campaigns`
- Liste toutes les campagnes avec pagination
- Filtre par statut
- Inclut les informations du créateur

#### POST `/api/admin/campaigns`
- Crée une nouvelle campagne
- Calcule automatiquement le nombre total de destinataires
- Support pour campagnes planifiées

#### GET `/api/admin/campaigns/[id]`
- Récupère les détails d'une campagne

#### PUT `/api/admin/campaigns/[id]`
- Met à jour une campagne (draft uniquement)
- Recalcule le nombre de destinataires si nécessaire

#### DELETE `/api/admin/campaigns/[id]`
- Supprime une campagne (draft uniquement)

#### POST `/api/admin/campaigns/[id]/send`
- Envoie la campagne à tous les destinataires
- Envoi par lots pour éviter la surcharge
- Met à jour les statistiques (sent, failed)
- Gère les erreurs et met à jour le statut

### 3. **Pages Admin**

#### `/dashboard/admin/campaigns` - Liste des campagnes
- **Statistiques** : Total, Sent, Drafts, Scheduled
- **Filtres** : Par statut
- **Tableau** avec :
  - Sujet et type de destinataires
  - Nombre de destinataires
  - Statut avec badges colorés
  - Statistiques d'envoi (sent/failed)
  - Date de création et d'envoi
  - Actions (Edit, Send, Delete pour drafts)
- **Pagination**

#### `/dashboard/admin/campaigns/new` - Créer une campagne
- Formulaire complet avec :
  - Sujet de l'email
  - Contenu HTML (éditeur texte)
  - Type de destinataires (all, active, trialing, canceled, custom)
  - Liste d'emails personnalisée (si custom)
  - Planification optionnelle
- Actions :
  - Save as Draft
  - Send Now

#### `/dashboard/admin/campaigns/[id]/edit` - Modifier une campagne
- Même formulaire que la création
- Pré-rempli avec les données existantes
- Actions :
  - Save Changes
  - Send Now

### 4. **Types de Destinataires**

- **all** : Tous les utilisateurs
- **active** : Utilisateurs avec abonnement actif
- **trialing** : Utilisateurs en période d'essai
- **canceled** : Utilisateurs avec abonnement annulé
- **custom** : Liste d'emails personnalisée

### 5. **Statuts de Campagne**

- **draft** : Brouillon (peut être modifié/supprimé)
- **scheduled** : Planifiée (sera envoyée à la date prévue)
- **sending** : En cours d'envoi
- **sent** : Envoyée (ne peut plus être modifiée)
- **failed** : Échec d'envoi

## 🚀 Utilisation

### Créer une campagne

1. Aller sur `/dashboard/admin/campaigns`
2. Cliquer sur "New Campaign"
3. Remplir le formulaire :
   - Sujet
   - Contenu HTML
   - Sélectionner les destinataires
   - Optionnel : Planifier l'envoi
4. Cliquer sur "Save as Draft" ou "Send Now"

### Envoyer une campagne

1. Depuis la liste, cliquer sur l'icône "Send" pour une draft
2. Ou depuis l'édition, cliquer sur "Send Now"
3. Confirmer l'envoi
4. La campagne sera envoyée par lots (10 emails à la fois)

### Modifier une campagne

1. Cliquer sur "Edit" pour une campagne en draft
2. Modifier les champs souhaités
3. Cliquer sur "Save Changes"

## 📊 Statistiques

Chaque campagne enregistre :
- **totalRecipients** : Nombre total de destinataires
- **sentCount** : Nombre d'emails envoyés avec succès
- **failedCount** : Nombre d'emails échoués

## 🔒 Sécurité

- **Accès admin uniquement** : Toutes les APIs vérifient le rôle admin
- **Protection des campagnes envoyées** : Impossible de modifier/supprimer une campagne déjà envoyée
- **Validation** : Vérification des champs requis avant création

## 🎨 Interface

- **Design moderne** avec cartes et badges colorés
- **Responsive** pour mobile et desktop
- **Feedback utilisateur** avec toasts pour les actions
- **Statistiques visuelles** avec icônes et couleurs

## 📝 Notes Techniques

### Envoi par lots
- Les emails sont envoyés par lots de 10
- Délai de 1 seconde entre les lots pour éviter le rate limiting
- Utilise `Promise.allSettled` pour gérer les erreurs individuellement

### Personnalisation
- Le contenu HTML peut inclure des variables comme `{{userName}}`
- Ces variables peuvent être remplacées lors de l'envoi (à implémenter si nécessaire)

### Intégration
- Utilise le système d'email existant (`sendEmailNotification`)
- Compatible avec les templates email existants
- S'intègre avec le système de notifications

## 🔄 Migration

Pour appliquer les changements :

```bash
cd /var/www/expira
npx prisma migrate dev --name add_email_campaigns
npx prisma generate
npm run build
pm2 restart expira
```

## ✅ Checklist

- ✅ Modèle Prisma créé
- ✅ APIs CRUD complètes
- ✅ API d'envoi avec gestion des lots
- ✅ Page de liste avec filtres
- ✅ Page de création
- ✅ Page d'édition
- ✅ Statistiques et métriques
- ✅ Sécurité admin
- ✅ Intégration dans le menu admin
- ✅ Gestion des erreurs
- ✅ Feedback utilisateur

---

**Date**: Janvier 2025
**Status**: ✅ Implémentation Complète

