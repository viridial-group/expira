# Configuration Stripe - Produits et Prix

## 📋 Produits à Créer dans Stripe Dashboard

### 1. **Starter Plan**

#### Détails du Produit
- **Nom du Produit**: `expiraIo Starter`
- **Description**: `Perfect for individuals and small projects. Monitor up to 10 products with daily checks and email notifications.`
- **Type**: Subscription (recurring)

#### Prix Mensuel
- **Montant**: `$9.00 USD`
- **Intervalle**: `monthly`
- **Type de Prix**: `recurring`
- **Nom du Prix**: `Starter Monthly`
- **Description**: `Starter plan - Monthly billing`

#### Caractéristiques Incluses
- ✅ Up to 10 products
- ✅ Daily checks
- ✅ Email notifications
- ✅ Basic analytics
- ✅ Email support

#### Configuration Stripe
```
Product Name: expiraIo Starter
Product Description: Perfect for individuals and small projects. Monitor up to 10 products with daily checks and email notifications.

Price:
  - Amount: $9.00
  - Currency: USD
  - Billing Period: Monthly
  - Recurring: Yes
```

---

### 2. **Professional Plan** (Most Popular)

#### Détails du Produit
- **Nom du Produit**: `expiraIo Professional`
- **Description**: `Ideal for growing businesses. Monitor up to 100 products with hourly checks, email + SMS notifications, advanced analytics, and priority support.`
- **Type**: Subscription (recurring)

#### Prix Mensuel
- **Montant**: `$29.00 USD`
- **Intervalle**: `monthly`
- **Type de Prix**: `recurring`
- **Nom du Prix**: `Professional Monthly`
- **Description**: `Professional plan - Monthly billing`

#### Caractéristiques Incluses
- ✅ Up to 100 products
- ✅ Hourly checks
- ✅ Email + SMS notifications
- ✅ Advanced analytics
- ✅ Priority support
- ✅ API access

#### Configuration Stripe
```
Product Name: expiraIo Professional
Product Description: Ideal for growing businesses. Monitor up to 100 products with hourly checks, email + SMS notifications, advanced analytics, and priority support.

Price:
  - Amount: $29.00
  - Currency: USD
  - Billing Period: Monthly
  - Recurring: Yes
```

---

### 3. **Enterprise Plan**

#### Détails du Produit
- **Nom du Produit**: `expiraIo Enterprise`
- **Description**: `For large organizations. Unlimited products, real-time monitoring, all notification types, custom reports, dedicated support, custom integrations, and SLA guarantee.`
- **Type**: Subscription (recurring)

#### Prix Mensuel
- **Montant**: `$99.00 USD`
- **Intervalle**: `monthly`
- **Type de Prix**: `recurring`
- **Nom du Prix**: `Enterprise Monthly`
- **Description**: `Enterprise plan - Monthly billing`

#### Caractéristiques Incluses
- ✅ Unlimited products
- ✅ Real-time monitoring
- ✅ All notification types
- ✅ Custom reports
- ✅ Dedicated support
- ✅ Custom integrations
- ✅ SLA guarantee

#### Configuration Stripe
```
Product Name: expiraIo Enterprise
Product Description: For large organizations. Unlimited products, real-time monitoring, all notification types, custom reports, dedicated support, custom integrations, and SLA guarantee.

Price:
  - Amount: $99.00
  - Currency: USD
  - Billing Period: Monthly
  - Recurring: Yes
```

---

## 🎯 Caractéristiques Compétitives à Mettre en Avant

### Essai Gratuit
- **14 jours d'essai gratuit** sur tous les plans
- Aucune carte de crédit requise pour commencer
- Annulation gratuite pendant l'essai

### Garantie
- **30 jours de garantie remboursement**
- Annulation à tout moment
- Pas de contrat à long terme

### Sécurité
- Paiement sécurisé via Stripe (256-bit SSL)
- Conformité PCI DSS
- Chiffrement des données

### Transparence
- Prix clairs sans frais cachés
- Résumé de commande détaillé
- FAQ intégrée

---

## 📝 Instructions pour Stripe Dashboard

### Étape 1: Créer les Produits

1. Allez dans **Stripe Dashboard** → **Products**
2. Cliquez sur **"Add product"**
3. Pour chaque plan, remplissez:
   - **Name**: Nom du produit (ex: "expiraIo Starter")
   - **Description**: Description complète avec caractéristiques
   - **Pricing model**: "Recurring"
   - **Price**: Montant en USD
   - **Billing period**: "Monthly"

### Étape 2: Récupérer les Price IDs

Après avoir créé chaque produit/prix, copiez le **Price ID** (commence par `price_...`)

### Étape 3: Configurer les Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # ou sk_live_... en production
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (à remplacer par vos vrais Price IDs)
STRIPE_STARTER_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PROFESSIONAL_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx
```

### Étape 4: Configurer le Trial Period

Dans le code, le trial period de 14 jours est déjà configuré dans `create-checkout/route.ts`:

```typescript
subscription_data: {
  trial_period_days: 14,
  ...
}
```

**Note**: Assurez-vous que les produits dans Stripe permettent les périodes d'essai.

---

## 🔧 Configuration Avancée (Optionnel)

### Codes Promotionnels

Les codes promotionnels sont déjà activés dans le checkout. Vous pouvez créer des codes dans Stripe Dashboard:

1. Allez dans **Products** → **Coupons**
2. Créez des coupons (ex: "WELCOME20" pour 20% de réduction)
3. Les utilisateurs pourront les utiliser lors du checkout

### Webhooks

Configurez le webhook pour gérer les événements:

1. Allez dans **Developers** → **Webhooks**
2. Ajoutez l'endpoint: `https://expira.io/api/subscriptions/webhook`
3. Sélectionnez les événements:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copiez le **Webhook signing secret** dans `.env`

---

## 📊 Résumé des Produits

| Plan | Prix Mensuel | Produits Max | Vérifications | Notifications | Support |
|------|--------------|-------------|--------------|--------------|---------|
| **Starter** | $9 | 10 | Daily | Email | Email |
| **Professional** | $29 | 100 | Hourly | Email + SMS | Priority |
| **Enterprise** | $99 | Unlimited | Real-time | All types | Dedicated |

---

## ✅ Checklist de Configuration

- [ ] Créer le produit "expiraIo Starter" avec prix $9/mois
- [ ] Créer le produit "expiraIo Professional" avec prix $29/mois
- [ ] Créer le produit "expiraIo Enterprise" avec prix $99/mois
- [ ] Copier les Price IDs dans `.env`
- [ ] Configurer le webhook avec les événements nécessaires
- [ ] Tester le checkout en mode test
- [ ] Vérifier que le trial period de 14 jours fonctionne
- [ ] Tester les codes promotionnels (optionnel)

---

**Date**: Janvier 2025
**Status**: ✅ Prêt pour Configuration

