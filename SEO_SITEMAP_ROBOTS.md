# Guide Sitemap XML et Robots.txt

## 📋 Vue d'Ensemble

Le sitemap XML et le fichier robots.txt sont essentiels pour le SEO et l'indexation de votre site par les moteurs de recherche.

## 🗺️ Sitemap XML

### Qu'est-ce qu'un Sitemap ?

Un sitemap XML est un fichier qui liste toutes les pages importantes de votre site web. Il aide les moteurs de recherche à :
- Découvrir toutes vos pages
- Comprendre la structure de votre site
- Indexer vos pages plus rapidement
- Comprendre la fréquence de mise à jour de chaque page

### Localisation

Le sitemap est généré automatiquement par Next.js à partir de `app/sitemap.ts` et accessible à :
- **URL** : `https://expira.io/sitemap.xml`

### Pages Incluses dans le Sitemap

| Page | URL | Priorité | Fréquence |
|------|-----|----------|-----------|
| Homepage | `/` | 1.0 | Daily |
| Pricing | `/pricing` | 0.9 | Weekly |
| Affiliate | `/affiliate` | 0.8 | Monthly |
| Contact | `/contact` | 0.7 | Monthly |
| FAQ | `/faq` | 0.7 | Monthly |
| Terms | `/terms` | 0.5 | Yearly |
| Privacy | `/privacy` | 0.5 | Yearly |
| Login | `/login` | 0.6 | Monthly |
| Register | `/register` | 0.6 | Monthly |
| Forgot Password | `/forgot-password` | 0.4 | Monthly |

### Comment Vérifier le Sitemap

1. **Accéder directement** :
   ```
   https://expira.io/sitemap.xml
   ```

2. **Via Google Search Console** :
   - Allez dans [Google Search Console](https://search.google.com/search-console)
   - Ajoutez votre site
   - Allez dans "Sitemaps"
   - Ajoutez `sitemap.xml`
   - Soumettez

3. **Via la ligne de commande** :
   ```bash
   curl https://expira.io/sitemap.xml
   ```

### Mettre à Jour le Sitemap

Le sitemap est généré dynamiquement par Next.js. Pour ajouter une nouvelle page :

1. Ouvrez `app/sitemap.ts`
2. Ajoutez une nouvelle entrée :
   ```typescript
   {
     url: `${baseUrl}/nouvelle-page`,
     lastModified: now,
     changeFrequency: 'monthly',
     priority: 0.7,
   }
   ```
3. Redéployez l'application

### Priorités et Fréquences

**Priorités (0.0 - 1.0)** :
- `1.0` : Page la plus importante (homepage)
- `0.9` : Pages importantes (pricing, features)
- `0.7-0.8` : Pages secondaires importantes
- `0.5-0.6` : Pages moins importantes
- `0.4` : Pages peu importantes

**Fréquences** :
- `always` : Change à chaque accès
- `hourly` : Change toutes les heures
- `daily` : Change quotidiennement
- `weekly` : Change hebdomadairement
- `monthly` : Change mensuellement
- `yearly` : Change annuellement
- `never` : Ne change jamais

## 🤖 Robots.txt

### Qu'est-ce que robots.txt ?

Le fichier robots.txt indique aux robots des moteurs de recherche quelles pages ils peuvent ou ne peuvent pas explorer.

### Localisation

Le robots.txt est généré automatiquement par Next.js à partir de `app/robots.ts` et accessible à :
- **URL** : `https://expira.io/robots.txt`

### Configuration Actuelle

**Pages Autorisées** :
- ✅ `/` (Homepage)
- ✅ `/pricing`
- ✅ `/contact`
- ✅ `/affiliate`
- ✅ `/faq`
- ✅ `/terms`
- ✅ `/privacy`
- ✅ `/login`
- ✅ `/register`

**Pages Bloquées** :
- ❌ `/api/` (Toutes les routes API)
- ❌ `/dashboard/` (Pages privées du dashboard)
- ❌ `/admin/` (Pages d'administration)
- ❌ `/reset-password` (Pages sensibles)
- ❌ `/forgot-password` (Pages sensibles)
- ❌ `/_next/` (Fichiers internes Next.js)

### Comment Vérifier robots.txt

1. **Accéder directement** :
   ```
   https://expira.io/robots.txt
   ```

2. **Via la ligne de commande** :
   ```bash
   curl https://expira.io/robots.txt
   ```

3. **Tester avec Google** :
   - Utilisez [Google Search Console](https://search.google.com/search-console)
   - Allez dans "URL Inspection"
   - Testez votre robots.txt

### Règles par User-Agent

**Tous les robots (`*`)** :
- Accès aux pages publiques
- Blocage des pages privées et API

**Googlebot** :
- Accès aux pages publiques importantes
- Blocage des pages d'authentification (pour éviter le duplicate content)

**Bingbot** :
- Même configuration que Googlebot

## 🔧 Utilisation et Bonnes Pratiques

### 1. Soumettre le Sitemap à Google

1. Allez sur [Google Search Console](https://search.google.com/search-console)
2. Sélectionnez votre propriété
3. Allez dans "Sitemaps" dans le menu de gauche
4. Entrez `sitemap.xml`
5. Cliquez sur "Envoyer"

### 2. Soumettre le Sitemap à Bing

1. Allez sur [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Ajoutez votre site
3. Allez dans "Sitemaps"
4. Entrez `https://expira.io/sitemap.xml`
5. Cliquez sur "Submit"

### 3. Vérifier l'Indexation

**Google** :
```bash
# Rechercher dans Google
site:expira.io
```

**Bing** :
```bash
# Rechercher dans Bing
site:expira.io
```

### 4. Surveiller les Erreurs

**Google Search Console** :
- Allez dans "Couverture"
- Vérifiez les erreurs d'indexation
- Corrigez les problèmes signalés

**Bing Webmaster Tools** :
- Allez dans "Index Explorer"
- Vérifiez les pages indexées
- Identifiez les problèmes

## 📊 Monitoring et Analytics

### Vérifier les Statistiques

1. **Google Search Console** :
   - Pages indexées
   - Requêtes de recherche
   - Performances
   - Erreurs d'indexation

2. **Bing Webmaster Tools** :
   - Pages indexées
   - Requêtes de recherche
   - Erreurs d'indexation

### Outils Utiles

- **Google Search Console** : https://search.google.com/search-console
- **Bing Webmaster Tools** : https://www.bing.com/webmasters
- **XML Sitemap Validator** : https://www.xml-sitemaps.com/validate-xml-sitemap.html
- **Robots.txt Tester** : https://www.google.com/webmasters/tools/robots-testing-tool

## 🐛 Dépannage

### Le Sitemap n'est pas accessible

1. **Vérifier l'URL** :
   ```bash
   curl https://expira.io/sitemap.xml
   ```

2. **Vérifier la configuration** :
   - Assurez-vous que `NEXT_PUBLIC_APP_URL` est correctement défini
   - Vérifiez que le fichier `app/sitemap.ts` existe

3. **Vérifier les logs** :
   - Consultez les logs du serveur pour les erreurs

### Robots.txt bloque des pages importantes

1. **Vérifier la configuration** :
   - Ouvrez `app/robots.ts`
   - Vérifiez que les pages importantes sont dans `allow`

2. **Tester** :
   ```bash
   curl https://expira.io/robots.txt
   ```

### Pages non indexées

1. **Vérifier robots.txt** :
   - Assurez-vous que la page n'est pas bloquée

2. **Vérifier le sitemap** :
   - Assurez-vous que la page est dans le sitemap

3. **Demander l'indexation** :
   - Utilisez Google Search Console > URL Inspection
   - Cliquez sur "Demander l'indexation"

## 📝 Checklist SEO

- [ ] Sitemap XML accessible à `/sitemap.xml`
- [ ] Robots.txt accessible à `/robots.txt`
- [ ] Sitemap soumis à Google Search Console
- [ ] Sitemap soumis à Bing Webmaster Tools
- [ ] Toutes les pages publiques dans le sitemap
- [ ] Pages privées bloquées dans robots.txt
- [ ] Priorités correctes dans le sitemap
- [ ] Fréquences de mise à jour appropriées
- [ ] Monitoring actif dans Search Console
- [ ] Erreurs d'indexation corrigées

## 🚀 Prochaines Étapes

1. **Soumettre le sitemap** à Google et Bing
2. **Surveiller l'indexation** dans Search Console
3. **Optimiser les priorités** selon les performances
4. **Mettre à jour régulièrement** le sitemap
5. **Corriger les erreurs** d'indexation rapidement

## 📚 Ressources

- [Google Sitemaps Documentation](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Robots.txt Specification](https://www.robotstxt.org/)
- [Next.js Sitemap Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js Robots Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)

