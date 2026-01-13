# Correction des Permissions PostgreSQL

## Problème
Erreur: `permission denied for schema public`

L'utilisateur de la base de données n'a pas les permissions nécessaires sur le schéma `public`.

## Solution

### 1. Se connecter à PostgreSQL en tant que superutilisateur

```bash
sudo -u postgres psql
```

### 2. Donner toutes les permissions nécessaires

Dans le shell PostgreSQL, exécutez ces commandes (remplacez `expira_user` par votre utilisateur si différent):

```sql
-- Se connecter à la base de données expira
\c expira

-- Donner les permissions sur le schéma public
GRANT ALL ON SCHEMA public TO expira_user;
GRANT ALL ON SCHEMA public TO public;

-- Donner les permissions sur toutes les tables existantes
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO expira_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO expira_user;

-- Donner les permissions sur les futures tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO expira_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO expira_user;

-- Donner le droit de créer des objets dans le schéma
GRANT CREATE ON SCHEMA public TO expira_user;

-- Vérifier les permissions
\dn+ public

-- Quitter
\q
```

### 3. Si vous utilisez l'utilisateur "expira" (pas expira_user)

```sql
\c expira

GRANT ALL ON SCHEMA public TO expira;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO expira;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO expira;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO expira;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO expira;
GRANT CREATE ON SCHEMA public TO expira;
\q
```

### 4. Solution complète (copier-coller)

Si vous utilisez `expira_user`:
```bash
sudo -u postgres psql <<EOF
\c expira
GRANT ALL ON SCHEMA public TO expira_user;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO expira_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO expira_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO expira_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO expira_user;
GRANT CREATE ON SCHEMA public TO expira_user;
EOF
```

Si vous utilisez `expira`:
```bash
sudo -u postgres psql <<EOF
\c expira
GRANT ALL ON SCHEMA public TO expira;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO expira;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO expira;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO expira;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO expira;
GRANT CREATE ON SCHEMA public TO expira;
EOF
```

### 5. Tester avec Prisma

```bash
cd /var/www/expira

# Tester la connexion
npx prisma db pull

# Exécuter les migrations
npx prisma migrate deploy
```

## Vérification

```bash
# Vérifier les permissions
sudo -u postgres psql expira -c "\dn+ public"

# Vérifier les permissions de l'utilisateur
sudo -u postgres psql expira -c "\du expira_user"
# ou
sudo -u postgres psql expira -c "\du expira"
```

## Note sur le port 5433

J'ai remarqué que votre DATABASE_URL utilise le port `5433` au lieu de `5432`. Vérifiez:

```bash
# Vérifier quel port PostgreSQL utilise
sudo ss -nlpt | grep postgres

# Si c'est 5433, c'est correct
# Sinon, vérifiez votre .env
cat /var/www/expira/.env | grep DATABASE_URL
```

## Solution Alternative: Réinitialiser les permissions du schéma public

Si les permissions sont vraiment corrompues:

```bash
sudo -u postgres psql expira <<EOF
-- Révoquer toutes les permissions
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM expira_user;

-- Redonner les permissions de base
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT CREATE ON SCHEMA public TO PUBLIC;
GRANT ALL ON SCHEMA public TO expira_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO expira_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO expira_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO expira_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO expira_user;
EOF
```

