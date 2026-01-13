# Démarrer PostgreSQL - Guide Rapide

## Problème
PostgreSQL n'écoute pas sur le port 5432, ce qui signifie qu'il n'est pas démarré ou mal configuré.

## Solution

### 1. Vérifier le statut de PostgreSQL

```bash
sudo systemctl status postgresql
```

### 2. Démarrer PostgreSQL

```bash
# Démarrer le service
sudo systemctl start postgresql

# Activer le démarrage automatique au boot
sudo systemctl enable postgresql

# Vérifier le statut
sudo systemctl status postgresql
```

### 3. Vérifier que PostgreSQL écoute sur le port 5432

```bash
sudo ss -nlpt | grep 5432
```

Vous devriez voir quelque chose comme:
```
LISTEN 0  244  127.0.0.1:5432  0.0.0.0:*  users:(("postgres",pid=12345,fd=3))
```

### 4. Si PostgreSQL ne démarre pas: Vérifier les logs

```bash
# Voir les logs récents
sudo journalctl -u postgresql -n 50

# Ou les logs PostgreSQL directement
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### 5. Vérifier la configuration

```bash
# Vérifier que PostgreSQL est configuré pour écouter
sudo cat /etc/postgresql/*/main/postgresql.conf | grep listen_addresses
```

Doit contenir:
```
listen_addresses = 'localhost'          # ou '*' pour toutes les interfaces
```

Si ce n'est pas le cas:
```bash
# Trouver le fichier de configuration
sudo find /etc/postgresql -name postgresql.conf

# Éditer (remplacez VERSION par votre version, ex: 16)
sudo nano /etc/postgresql/16/main/postgresql.conf

# Modifier la ligne:
listen_addresses = 'localhost'

# Redémarrer
sudo systemctl restart postgresql
```

### 6. Vérifier le port dans la configuration

```bash
sudo cat /etc/postgresql/*/main/postgresql.conf | grep port
```

Doit être:
```
port = 5432
```

### 7. Si PostgreSQL ne démarre toujours pas

```bash
# Vérifier les permissions des répertoires de données
sudo ls -la /var/lib/postgresql/

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h

# Réinitialiser PostgreSQL (ATTENTION: supprime les données)
# UNIQUEMENT si vous n'avez pas de données importantes
sudo systemctl stop postgresql
sudo rm -rf /var/lib/postgresql/*/main
sudo -u postgres /usr/lib/postgresql/*/bin/initdb -D /var/lib/postgresql/*/main
sudo systemctl start postgresql
```

## Commandes de vérification complète

```bash
# 1. Statut du service
sudo systemctl status postgresql

# 2. Port d'écoute
sudo ss -nlpt | grep 5432

# 3. Processus PostgreSQL
ps aux | grep postgres

# 4. Connexion de test
sudo -u postgres psql -c "SELECT version();"
```

## Solution Rapide (Commandes à exécuter dans l'ordre)

```bash
# 1. Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 2. Vérifier qu'il tourne
sudo systemctl status postgresql

# 3. Vérifier le port
sudo ss -nlpt | grep 5432

# 4. Tester la connexion
sudo -u postgres psql -c "SELECT version();"

# 5. Si tout fonctionne, tester avec Prisma
cd /var/www/expira
npx prisma db pull
```

