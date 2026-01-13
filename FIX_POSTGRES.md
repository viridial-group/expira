# Correction du Problème de Connexion PostgreSQL

## Problème
Prisma ne peut pas se connecter à PostgreSQL malgré que la base de données existe.

## Solutions

### 1. Vérifier que PostgreSQL tourne

```bash
sudo systemctl status postgresql
```

Si ce n'est pas actif:
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Vérifier que PostgreSQL écoute sur le bon port

```bash
sudo netstat -tlnp | grep 5432
# ou
sudo ss -tlnp | grep 5432
```

Vous devriez voir quelque chose comme:
```
tcp  0  0  127.0.0.1:5432  0.0.0.0:*  LISTEN  postgres
```

### 3. Vérifier la configuration PostgreSQL

```bash
# Vérifier le fichier de configuration principal
sudo cat /etc/postgresql/*/main/postgresql.conf | grep listen_addresses

# Vérifier pg_hba.conf (méthode d'authentification)
sudo cat /etc/postgresql/*/main/pg_hba.conf
```

### 4. Corriger le DATABASE_URL dans .env

Votre DATABASE_URL doit correspondre à l'utilisateur que vous avez créé.

**Si vous utilisez l'utilisateur "expira" (comme dans votre cas):**

```bash
cd /var/www/expira
nano .env
```

Modifiez la ligne DATABASE_URL:
```env
DATABASE_URL="postgresql://expira:VOTRE_MOT_DE_PASSE@localhost:5432/expira"
```

**Si vous voulez créer l'utilisateur "expira_user":**

```bash
sudo -u postgres psql
```

Dans PostgreSQL:
```sql
CREATE USER expira_user WITH PASSWORD 'VOTRE_MOT_DE_PASSE_SECURISE';
GRANT ALL PRIVILEGES ON DATABASE expira TO expira_user;
ALTER USER expira_user CREATEDB;
\q
```

Puis dans .env:
```env
DATABASE_URL="postgresql://expira_user:VOTRE_MOT_DE_PASSE@localhost:5432/expira"
```

### 5. Tester la connexion manuellement

```bash
# Avec l'utilisateur expira
psql -U expira -d expira -h localhost

# Ou avec expira_user (si créé)
psql -U expira_user -d expira -h localhost
```

Si ça demande un mot de passe, c'est bon signe. Entrez le mot de passe.

### 6. Si la connexion échoue: Configurer pg_hba.conf

```bash
# Éditer le fichier de configuration
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Ajoutez ou modifiez cette ligne (vers le début du fichier):
```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Puis redémarrez PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### 7. Vérifier les permissions de la base de données

```bash
sudo -u postgres psql expira
```

Dans PostgreSQL:
```sql
-- Vérifier les permissions
\du

-- Vérifier les permissions sur la base de données
\l expira

-- Si nécessaire, donner les permissions
GRANT ALL PRIVILEGES ON DATABASE expira TO expira;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO expira;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO expira;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO expira;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO expira;
\q
```

### 8. Tester avec Prisma

```bash
cd /var/www/expira

# Tester la connexion
npx prisma db pull

# Si ça fonctionne, exécuter les migrations
npx prisma migrate deploy
```

## Solution Rapide (si vous utilisez l'utilisateur "expira")

```bash
# 1. Vérifier que PostgreSQL tourne
sudo systemctl status postgresql

# 2. Vérifier le mot de passe de l'utilisateur expira
sudo -u postgres psql
ALTER USER expira WITH PASSWORD 'NOUVEAU_MOT_DE_PASSE';
\q

# 3. Mettre à jour .env
cd /var/www/expira
nano .env
# Modifier: DATABASE_URL="postgresql://expira:NOUVEAU_MOT_DE_PASSE@localhost:5432/expira"

# 4. Tester la connexion
psql -U expira -d expira -h localhost
# Entrez le mot de passe

# 5. Si la connexion fonctionne, tester Prisma
npx prisma db pull
npx prisma migrate deploy
```

## Dépannage Avancé

### Vérifier les logs PostgreSQL

```bash
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### Vérifier que PostgreSQL écoute sur localhost

```bash
sudo cat /etc/postgresql/*/main/postgresql.conf | grep listen_addresses
```

Doit contenir:
```
listen_addresses = 'localhost'
```

Si ce n'est pas le cas:
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
# Modifier: listen_addresses = 'localhost'
sudo systemctl restart postgresql
```

### Vérifier le firewall

```bash
sudo ufw status
# Si le firewall bloque, autoriser localhost (normalement pas nécessaire)
```

## Solution Alternative: Utiliser un socket Unix

Si les connexions TCP ne fonctionnent pas, vous pouvez utiliser un socket Unix:

Dans `.env`:
```env
DATABASE_URL="postgresql://expira:VOTRE_MOT_DE_PASSE@/expira?host=/var/run/postgresql"
```

