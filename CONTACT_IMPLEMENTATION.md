# Implémentation Contact Form & Admin Panel

## ✅ Fonctionnalités Implémentées

### 1. **Modèles de Base de Données**

#### ContactMessage
- `id`: Identifiant unique
- `name`: Nom du contact
- `email`: Email du contact
- `subject`: Sujet du message
- `message`: Contenu du message
- `status`: Statut (new, read, replied, archived)
- `createdAt`: Date de création
- `updatedAt`: Date de mise à jour

#### ContactResponse
- `id`: Identifiant unique
- `contactMessageId`: Référence au message
- `userId`: Référence à l'admin qui répond
- `message`: Contenu de la réponse
- `createdAt`: Date de création

#### User (Mise à jour)
- Ajout du champ `role`: "user" ou "admin" (par défaut: "user")

### 2. **APIs Créées**

#### `/api/contact` (POST)
- Sauvegarde un message de contact
- Validation des données (name, email, subject, message)
- Envoi d'email de notification à l'admin (si configuré)
- Retourne un message de confirmation

#### `/api/admin/contact` (GET)
- Récupère tous les messages de contact (admin seulement)
- Support de filtrage par statut (all, new, read, replied, archived)
- Pagination (page, limit)
- Inclut les réponses associées

#### `/api/admin/contact` (PATCH)
- Met à jour le statut d'un message (admin seulement)
- Statuts possibles: new, read, replied, archived

#### `/api/admin/contact/response` (POST)
- Crée une réponse à un message (admin seulement)
- Envoie un email au contact avec la réponse
- Met à jour le statut du message à "replied"

#### `/api/admin/check` (GET)
- Vérifie si l'utilisateur actuel est admin
- Utilisé pour afficher conditionnellement le lien admin

### 3. **Pages Créées**

#### `/contact` - Page de Contact
- Formulaire de contact moderne et responsive
- Champs: Name, Email, Subject, Message
- Validation côté client
- Page de confirmation après envoi
- Design cohérent avec le reste du site

#### `/dashboard/admin/contact` - Page Admin
- Liste des messages avec filtres
- Recherche par nom, email, sujet, message
- Filtres par statut (all, new, read, replied, archived)
- Vue détaillée d'un message
- Formulaire de réponse intégré
- Gestion des statuts (marquer comme lu, archiver)
- Affichage des réponses précédentes

### 4. **Composants Mis à Jour**

#### Badge
- Ajout du variant "info" pour les badges bleus

#### DashboardLayout
- Ajout conditionnel du lien "Contact Messages" pour les admins
- Vérification du rôle via `/api/admin/check`

## 🔧 Configuration Requise

### 1. Migration Prisma

Exécutez la migration pour créer les nouvelles tables :

```bash
npx prisma migrate dev --name add_contact_and_admin_role
```

### 2. Créer un Utilisateur Admin

Pour créer un utilisateur admin, vous pouvez :

**Option 1: Via SQL direct**
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@expira.io';
```

**Option 2: Via Prisma Studio**
```bash
npx prisma studio
```
Puis modifier manuellement le champ `role` de l'utilisateur.

**Option 3: Via script Node.js**
```javascript
// scripts/create-admin.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.update({
    where: { email: 'admin@expira.io' },
    data: { role: 'admin' },
  })
  console.log('Admin created:', admin)
}

main()
```

### 3. Variables d'Environnement

Assurez-vous d'avoir configuré :
```env
ADMIN_EMAIL=admin@expira.io  # Email pour recevoir les notifications
SMTP_USER=...
SMTP_PASS=...
SMTP_HOST=...
SMTP_PORT=...
```

## 📊 Flux Utilisateur

### Scénario 1: Utilisateur Envoie un Message
1. Va sur `/contact`
2. Remplit le formulaire
3. Soumet le message
4. Reçoit une confirmation
5. L'admin reçoit un email de notification

### Scénario 2: Admin Consulte les Messages
1. Se connecte avec un compte admin
2. Voit le lien "Contact Messages" dans le sidebar
3. Accède à `/dashboard/admin/contact`
4. Voit la liste des messages
5. Peut filtrer par statut ou rechercher

### Scénario 3: Admin Répond à un Message
1. Sélectionne un message dans la liste
2. Voit les détails du message
3. Écrit une réponse
4. Envoie la réponse
5. Le contact reçoit un email avec la réponse
6. Le statut du message passe à "replied"

## 🎨 Caractéristiques Visuelles

### Page Contact
- Design moderne avec gradients
- Formulaire responsive
- Page de confirmation avec animation
- Navigation cohérente avec le site

### Page Admin
- Layout en deux colonnes (liste + détail)
- Badges colorés pour les statuts
- Recherche et filtres en temps réel
- Formulaire de réponse intégré
- Affichage des réponses précédentes

### Badges de Statut
- **New**: Badge bleu (primary)
- **Read**: Badge bleu clair (info)
- **Replied**: Badge vert (success)
- **Archived**: Badge gris (gray)

## 🔐 Sécurité

- ✅ Vérification d'authentification sur toutes les APIs admin
- ✅ Vérification du rôle admin avant d'accéder aux fonctionnalités
- ✅ Validation des données d'entrée (Zod)
- ✅ Protection CSRF via cookies httpOnly
- ✅ Pas d'exposition de données sensibles côté client

## 📝 Statuts des Messages

- **new**: Message non lu
- **read**: Message lu mais non répondu
- **replied**: Message auquel on a répondu
- **archived**: Message archivé

## 🚀 Prochaines Étapes

1. **Notifications en temps réel**: Ajouter des notifications push pour les nouveaux messages
2. **Statistiques**: Dashboard avec statistiques sur les messages
3. **Templates de réponse**: Sauvegarder des templates de réponse réutilisables
4. **Tags/Catégories**: Permettre de catégoriser les messages
5. **Export**: Exporter les messages en CSV/PDF
6. **Recherche avancée**: Recherche par date, statut, etc.

---

**Date**: Janvier 2025
**Status**: ✅ Implémentation Complète

