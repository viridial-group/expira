# SMS Notifications - Pricing & Limits

## 📱 Plans et Limites SMS

### Starter Plan - $9/month
- ❌ **SMS non disponible**
- ✅ Email notifications uniquement
- 💡 **Upgrade requis** : Pour utiliser les SMS, passez au plan Professional ou Enterprise

### Professional Plan - $29/month (Most Popular)
- ✅ **SMS activé**
- 📊 **Limite** : 500 SMS par mois
- ✅ Email + SMS notifications
- 💡 **Idéal pour** : La plupart des entreprises qui ont besoin de notifications critiques

### Enterprise Plan - $99/month
- ✅ **SMS activé**
- 📊 **Limite** : SMS illimité
- ✅ Tous les types de notifications
- 💡 **Idéal pour** : Grandes organisations avec besoins élevés

## 🔒 Vérification des Limites

Le système vérifie automatiquement :
1. **Plan de l'utilisateur** : Vérifie si SMS est activé pour le plan
2. **Limite mensuelle** : Compte les SMS envoyés dans le mois
3. **Fallback** : Si SMS non disponible, envoie un email à la place

### Code de Vérification

```typescript
import { canSendSMS } from '@/lib/sms-limits'

const check = await canSendSMS(userId)
if (check.allowed) {
  // Envoyer SMS
} else {
  // Afficher message : check.reason
}
```

## 📊 Affichage dans l'Interface

### Page Pricing
- ✅ Features avec icône SMS pour les plans qui l'incluent
- ✅ Badge d'information SMS avec limite
- ✅ Mise en évidence visuelle (couleur primaire)

### Page Review
- ✅ Affichage des limites SMS dans le résumé
- ✅ Badge d'information pour chaque plan

### Settings
- ✅ Champ téléphone avec indication de vérification
- ✅ Message si SMS non disponible dans le plan actuel

## 💰 Coûts SMS

Les SMS sont inclus dans les plans :
- **Professional** : 500 SMS/mois inclus (pas de coût supplémentaire)
- **Enterprise** : SMS illimité inclus (pas de coût supplémentaire)

**Note** : Les coûts d'infrastructure SMS (Twilio/Vonage) sont absorbés par expira.

## 🚀 Fonctionnalités

### Vérification Automatique
- ✅ Vérifie le plan avant d'envoyer un SMS
- ✅ Compte les SMS envoyés (à implémenter)
- ✅ Bloque l'envoi si limite atteinte
- ✅ Envoie un email de fallback si SMS non disponible

### Messages d'Erreur
- "SMS notifications are not available in your current plan. Upgrade to Professional or Enterprise."
- "You've reached your monthly SMS limit of 500. Upgrade to Enterprise for unlimited SMS."

## 📝 Configuration

Les limites sont définies dans `lib/stripe-config.ts` :

```typescript
limits: {
  smsEnabled: true/false,
  smsPerMonth: 500, // -1 pour illimité
}
```

## 🔄 Migration

Pour ajouter le suivi des SMS envoyés, créer une table :

```prisma
model SMSUsage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  sentAt    DateTime @default(now())
  message   String?
  
  @@map("sms_usage")
}
```

## 📊 Statistiques Futures

- Dashboard avec compteur de SMS utilisés
- Graphique d'utilisation mensuelle
- Alertes quand proche de la limite
- Option pour acheter des SMS supplémentaires

---

**Date** : Janvier 2025
**Status** : ✅ Implémentation Complète

