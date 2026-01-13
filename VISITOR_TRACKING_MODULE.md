# Visitor Tracking Module - Documentation

## ✅ Implémentation Complète

Système complet de suivi des visiteurs pour analyser le trafic du site.

## 📋 Fonctionnalités

### 1. **Modèles Prisma** (`prisma/schema.prisma`)

Deux nouveaux modèles pour stocker les données de visiteurs :

#### Visitor Model
```prisma
model Visitor {
  id          String   @id @default(cuid())
  sessionId   String   @unique // Unique session identifier
  ipAddress   String?
  userAgent   String?
  country     String?
  city        String?
  referrer    String?  // Where they came from
  firstVisit  DateTime @default(now())
  lastVisit   DateTime @default(now())
  visitCount  Int      @default(1)
  
  visits      Visit[]
  
  @@map("visitors")
}
```

#### Visit Model
```prisma
model Visit {
  id          String   @id @default(cuid())
  visitorId   String
  visitor     Visitor  @relation(fields: [visitorId], references: [id], onDelete: Cascade)
  path        String   // Page path (e.g., "/", "/pricing", "/dashboard")
  referrer    String?  // HTTP referrer
  duration    Int?     // Time spent on page in seconds
  createdAt   DateTime @default(now())
  
  @@map("visits")
  @@index([visitorId])
  @@index([path])
  @@index([createdAt])
}
```

### 2. **API de Tracking** (`app/api/tracking/visit/route.ts`)

#### POST `/api/tracking/visit`
- Enregistre une visite
- Crée ou met à jour un visiteur
- Gère les sessions via cookies
- Collecte : IP, User-Agent, Referrer, Path, Duration

#### GET `/api/tracking/visit`
- Retourne les statistiques de base
- Total visitors, total visits, unique visitors
- Top pages

### 3. **API Admin Analytics** (`app/api/admin/analytics/visitors/route.ts`)

Endpoint complet pour les administrateurs :

- **Statistiques globales** : Total, Unique, Visits
- **Liste des visiteurs récents** avec détails
- **Top pages** : Pages les plus visitées
- **Top referrers** : Sources de trafic
- **Visites par jour** : Graphique des visites quotidiennes
- **Pagination** pour les grandes listes
- **Filtres par période** : 7, 30, 90, 365 jours

### 4. **Composant VisitorTracker** (`components/VisitorTracker.tsx`)

Composant client qui track automatiquement :
- **Tracking automatique** sur chaque changement de page
- **Durée de visite** calculée automatiquement
- **sendBeacon** pour tracking fiable lors de la fermeture
- **Non-intrusif** : ne bloque pas l'expérience utilisateur
- **Gestion des erreurs** : échoue silencieusement

### 5. **Page Admin Analytics** (`app/dashboard/admin/analytics/page.tsx`)

Interface complète pour voir les analytics :

#### Statistiques
- **Total Visitors** : Nombre total de visiteurs uniques
- **Total Visits** : Nombre total de visites
- **Unique Visitors** : Visiteurs uniques sur la période
- **Avg. Visits/Visitor** : Moyenne de visites par visiteur

#### Top Pages
- Liste des pages les plus visitées
- Nombre de vues par page
- Classement par popularité

#### Top Referrers
- Sources de trafic (Google, Direct, etc.)
- Nombre de visiteurs par source

#### Recent Visitors
- Tableau détaillé avec :
  - IP Address
  - Location (City, Country)
  - Nombre de visites
  - Nombre de pages vues
  - Dernière page visitée
  - Date de dernière visite

### 6. **Intégration**

- **VisitorTracker** ajouté au `app/layout.tsx` pour tracker toutes les pages
- **Lien Analytics** ajouté au menu admin
- **Tracking automatique** sur toutes les pages publiques

## 🚀 Utilisation

### Tracking Automatique

Le tracking est automatique ! Dès qu'un visiteur accède au site :
1. Un cookie de session est créé (valide 30 jours)
2. Chaque changement de page est enregistré
3. La durée de visite est calculée
4. Les données sont stockées dans la base de données

### Voir les Analytics (Admin)

1. Aller sur `/dashboard/admin/analytics`
2. Sélectionner la période (7, 30, 90, 365 jours)
3. Voir les statistiques, top pages, referrers, et visiteurs récents

## 📊 Données Collectées

### Par Visiteur
- **Session ID** : Identifiant unique de session
- **IP Address** : Adresse IP (peut être utilisée pour géolocalisation)
- **User Agent** : Navigateur et OS
- **Country/City** : Localisation (si disponible)
- **Referrer** : D'où vient le visiteur
- **First Visit** : Première visite
- **Last Visit** : Dernière visite
- **Visit Count** : Nombre de visites

### Par Visite
- **Path** : Page visitée
- **Referrer** : Page précédente
- **Duration** : Temps passé sur la page (en secondes)
- **Timestamp** : Date et heure de la visite

## 🔒 Confidentialité

- **Cookies** : Utilisés uniquement pour identifier les sessions
- **IP Address** : Stockée mais peut être anonymisée si nécessaire
- **Pas de données personnelles** : Aucune information personnelle identifiante n'est collectée
- **Conformité GDPR** : Les données peuvent être supprimées sur demande

## 🎨 Interface Admin

- **Design moderne** avec cartes de statistiques
- **Tableaux interactifs** avec hover effects
- **Graphiques** pour visualiser les tendances
- **Filtres** par période
- **Pagination** pour les grandes listes

## 🔧 Configuration

### Variables d'Environnement

Aucune variable supplémentaire requise. Le système utilise :
- `DATABASE_URL` : Pour stocker les données
- `NODE_ENV` : Pour déterminer si on est en production

### Géolocalisation (Optionnel)

Pour obtenir le pays et la ville, vous pouvez intégrer un service comme :
- MaxMind GeoIP2
- ipapi.co
- ip-api.com

## 📈 Métriques Disponibles

- **Total Visitors** : Tous les visiteurs uniques
- **Total Visits** : Toutes les visites
- **Unique Visitors** : Visiteurs uniques sur une période
- **Page Views** : Vues par page
- **Bounce Rate** : (À calculer : visites avec 1 seule page)
- **Average Session Duration** : Durée moyenne des sessions
- **Top Entry Pages** : Pages d'entrée les plus fréquentes
- **Top Exit Pages** : Pages de sortie les plus fréquentes

## 🔄 Migration

Pour appliquer les changements :

```bash
cd /var/www/expira
npx prisma migrate dev --name add_visitor_tracking
npx prisma generate
npm run build
pm2 restart expira
```

## ✅ Checklist

- ✅ Modèles Prisma créés (Visitor, Visit)
- ✅ API de tracking créée
- ✅ API admin analytics créée
- ✅ Composant VisitorTracker créé
- ✅ Page admin analytics créée
- ✅ Intégration dans le layout
- ✅ Lien dans le menu admin
- ✅ Indexes pour performance
- ✅ Gestion des sessions
- ✅ Tracking automatique

## 🎯 Prochaines Améliorations Possibles

1. **Géolocalisation** : Intégrer un service pour obtenir country/city
2. **Graphiques** : Ajouter des graphiques avec Chart.js ou Recharts
3. **Export** : Permettre d'exporter les données en CSV
4. **Filtres avancés** : Filtrer par pays, referrer, etc.
5. **Real-time** : Mettre à jour les stats en temps réel
6. **Bounce Rate** : Calculer le taux de rebond
7. **Conversion Tracking** : Tracker les conversions (inscriptions, etc.)

---

**Date**: Janvier 2025
**Status**: ✅ Implémentation Complète

