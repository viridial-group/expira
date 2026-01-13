# Fix: Prisma Payment Model Error

## Problème

L'erreur suivante apparaît lors du build :
```
Type error: Object literal may only specify known properties, and 'payments' does not exist in type 'SubscriptionInclude<DefaultArgs>'.
```

## Cause

Le client Prisma n'a pas été régénéré après l'ajout du modèle `Payment` dans le schéma. Le schéma Prisma est correct, mais TypeScript ne reconnaît pas encore la relation `payments`.

## Solution

### Sur votre machine locale (si vous avez des problèmes de permissions)

```bash
# Option 1: Nettoyer et régénérer
cd /Users/mac/sass
rm -rf node_modules/.prisma
npx prisma generate

# Option 2: Si vous avez des problèmes de permissions
sudo rm -rf node_modules/.prisma
sudo npx prisma generate
```

### Sur le serveur VPS (recommandé)

Après avoir appliqué la migration, régénérez le client Prisma :

```bash
cd /var/www/expira
npx prisma generate
npm run build
```

## Étapes complètes pour le déploiement

1. **Appliquer la migration** :
   ```bash
   cd /var/www/expira
   npx prisma migrate dev --name add_payment_model
   ```
   
   Ou en production :
   ```bash
   npx prisma migrate deploy
   ```

2. **Régénérer le client Prisma** :
   ```bash
   npx prisma generate
   ```

3. **Rebuild l'application** :
   ```bash
   npm run build
   ```

4. **Redémarrer l'application** :
   ```bash
   pm2 restart expira
   ```

## Vérification

Pour vérifier que tout fonctionne :

```bash
# Vérifier que le client Prisma est à jour
npx prisma validate

# Vérifier que la relation existe
npx prisma studio
# Ouvrir Subscription et vérifier qu'il y a une relation "payments"
```

## Note

Le schéma Prisma (`prisma/schema.prisma`) est correct avec la relation :
```prisma
model Subscription {
  ...
  payments Payment[]
  ...
}

model Payment {
  ...
  subscriptionId        String?
  subscription          Subscription? @relation(fields: [subscriptionId], references: [id], onDelete: SetNull)
  ...
}
```

Une fois le client Prisma régénéré, l'erreur TypeScript disparaîtra.

