# Configuration SMS Notifications

## ✅ Implémentation Complète

Le système de notifications SMS a été intégré avec support pour plusieurs fournisseurs gratuits.

## 📱 Fournisseurs Supportés

### 1. **Twilio** (Recommandé - Gratuit au démarrage)
- **Crédit gratuit** : $15.50 pour commencer
- **Prix** : ~$0.0075 par SMS (US/Canada)
- **Avantages** : Très fiable, API simple, bonne documentation
- **Inscription** : https://www.twilio.com/try-twilio

### 2. **Vonage (Nexmo)** (Alternative gratuite)
- **Crédit gratuit** : Disponible
- **Prix** : Variable selon le pays
- **Avantages** : Alternative à Twilio
- **Inscription** : https://www.vonage.com/

## 🔧 Configuration

### Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# Activer les notifications SMS
SMS_ENABLED=true

# Choisir le fournisseur (twilio ou vonage)
SMS_PROVIDER=twilio

# Configuration Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890  # Numéro Twilio (format E.164)

# Configuration Vonage (Alternative)
VONAGE_API_KEY=your_api_key
VONAGE_API_SECRET=your_api_secret
VONAGE_FROM_NUMBER=expira  # Nom de l'expéditeur ou numéro
```

## 📝 Configuration Twilio

### Étape 1 : Créer un compte Twilio
1. Allez sur https://www.twilio.com/try-twilio
2. Créez un compte gratuit
3. Vous recevrez un crédit de $15.50

### Étape 2 : Obtenir un numéro de téléphone
1. Dans le dashboard Twilio, allez dans "Phone Numbers" > "Buy a number"
2. Choisissez un numéro (gratuit pour les numéros de test)
3. Notez le numéro au format E.164 (ex: +1234567890)

### Étape 3 : Récupérer les credentials
1. Dans le dashboard, allez dans "Account" > "API Keys & Tokens"
2. Copiez votre `Account SID` et `Auth Token`
3. Ajoutez-les dans votre `.env`

### Étape 4 : Tester
1. Utilisez le numéro de test Twilio pour tester sans coût
2. Numéro de test : `+15005550006` (gratuit)

## 📝 Configuration Vonage (Alternative)

### Étape 1 : Créer un compte Vonage
1. Allez sur https://www.vonage.com/
2. Créez un compte gratuit
3. Accédez au dashboard API

### Étape 2 : Récupérer les credentials
1. Dans le dashboard, allez dans "API Keys"
2. Créez une nouvelle clé API
3. Copiez votre `API Key` et `API Secret`
4. Ajoutez-les dans votre `.env`

## 🔢 Format des Numéros de Téléphone

Le système utilise le format **E.164** :
- Format : `+[code pays][numéro]`
- Exemples :
  - US/Canada : `+1234567890`
  - France : `+33123456789`
  - UK : `+441234567890`

Le système formate automatiquement les numéros si nécessaire.

## 🎯 Utilisation

### 1. Ajouter un numéro de téléphone
1. Allez dans **Settings** > **Profile**
2. Entrez votre numéro de téléphone au format E.164
3. Cliquez sur **Save Changes**

### 2. Activer les notifications SMS
1. Allez dans **Settings** > **Notifications**
2. Activez le toggle **SMS Notifications**

### 3. Recevoir des SMS
Les SMS sont automatiquement envoyés pour :
- ✅ **Erreurs critiques** : Quand un produit est expiré ou inaccessible
- ✅ **Notifications importantes** : Selon vos préférences

## 🔐 Vérification du Numéro

Pour l'instant, la vérification du numéro est manuelle. Vous pouvez :
1. Envoyer un SMS de test depuis le dashboard admin
2. Vérifier manuellement dans la base de données

**Note** : Une fonctionnalité de vérification automatique par code SMS peut être ajoutée plus tard.

## 💰 Coûts

### Twilio
- **Gratuit** : $15.50 de crédit au démarrage
- **Prix** : ~$0.0075 par SMS (US/Canada)
- **Prix international** : Variable selon le pays

### Vonage
- **Gratuit** : Crédit disponible au démarrage
- **Prix** : Variable selon le pays

## 🚀 Fonctionnalités

### ✅ Implémenté
- Envoi de SMS via Twilio
- Envoi de SMS via Vonage (alternative)
- Format automatique des numéros (E.164)
- Validation des numéros de téléphone
- Intégration avec le système de notifications
- Gestion du numéro dans Settings
- SMS automatiques pour erreurs critiques

### 🔜 À venir
- Vérification automatique par code SMS
- Historique des SMS envoyés
- Templates de messages SMS
- Préférences de notification par type d'alerte

## 📊 Exemples de Messages SMS

```
Product Check: example.com
Website is accessible (Status: 200, Response time: 234ms)
```

```
Product Check: example.com
Domain not found - the website does not exist or DNS lookup failed
```

```
Product Expired: example.com
Your product "example.com" has expired. Please renew it immediately.
```

## 🛠️ Dépannage

### SMS non envoyés
1. Vérifiez que `SMS_ENABLED=true` dans `.env`
2. Vérifiez les credentials Twilio/Vonage
3. Vérifiez que le numéro est au format E.164
4. Vérifiez les logs du serveur pour les erreurs

### Erreur "Invalid phone number"
- Assurez-vous que le numéro est au format E.164
- Exemple correct : `+1234567890`
- Exemple incorrect : `1234567890` (manque le +)

### Erreur "Twilio credentials not configured"
- Vérifiez que toutes les variables d'environnement sont définies
- Redémarrez le serveur après avoir modifié `.env`

## 📚 Ressources

- [Twilio Documentation](https://www.twilio.com/docs)
- [Vonage Documentation](https://developer.vonage.com/)
- [E.164 Format](https://en.wikipedia.org/wiki/E.164)

---

**Date** : Janvier 2025
**Status** : ✅ Implémentation Complète

