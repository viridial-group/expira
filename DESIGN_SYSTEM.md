# Design System - expira

## Analyse du Design UX/UI

### 🎨 Palette de Couleurs

#### Couleurs Principales (Primary)
- **Primary 50**: `#f0f9ff` - Backgrounds très légers
- **Primary 100**: `#e0f2fe` - Badges, backgrounds légers
- **Primary 600**: `#0284c7` - Couleur principale (boutons, liens, icônes)
- **Primary 700**: `#0369a1` - Hover states
- **Primary 800**: `#075985` - Gradients, sections CTA

#### Couleurs Neutres (Gray)
- **Gray 50**: `#f9fafb` - Backgrounds de page
- **Gray 100**: `#f3f4f6` - Backgrounds de cartes secondaires
- **Gray 200**: `#e5e7eb` - Bordures
- **Gray 300**: `#d1d5db` - Bordures de champs
- **Gray 400**: `#9ca3af` - Icônes secondaires
- **Gray 600**: `#4b5563` - Texte secondaire
- **Gray 700**: `#374151` - Labels
- **Gray 900**: `#111827` - Texte principal

#### Couleurs de Statut
- **Green 500/600**: Statut actif, succès (`#10b981` / `#059669`)
- **Yellow 500/600**: Avertissements (`#eab308` / `#ca8a04`)
- **Red 500/600**: Erreurs, expiré (`#ef4444` / `#dc2626`)

#### Couleurs Accent (Storytelling)
- **Red 50/100/600**: Problèmes, urgence
- **Orange 50/100/600**: Stress, attention
- **Yellow 50/100/600**: Alertes

### 📐 Typographie

#### Hiérarchie des Titres
- **H1 Hero**: `text-5xl md:text-7xl font-bold` (Landing page)
- **H1 Standard**: `text-3xl font-bold` (Pages auth)
- **H2**: `text-4xl md:text-5xl font-bold` (Sections)
- **H3**: `text-2xl font-bold` (Sous-sections)
- **H4**: `text-xl font-semibold` (Cartes, footer)
- **H5**: `text-lg font-semibold` (Labels)

#### Corps de Texte
- **Large**: `text-xl md:text-2xl` (Descriptions hero)
- **Standard**: `text-base` (Par défaut)
- **Small**: `text-sm` (Métadonnées, labels)
- **Extra Small**: `text-xs` (Timestamps, badges)

#### Poids de Police
- **Bold**: `font-bold` - Titres principaux
- **Semibold**: `font-semibold` - Sous-titres, CTA
- **Medium**: `font-medium` - Labels, navigation
- **Regular**: Par défaut - Corps de texte

### 🎯 Espacements

#### Espacements de Sections
- **Large**: `py-20` (Sections principales)
- **Medium**: `py-16` (Sections secondaires)
- **Small**: `py-12` (Sections compactes)
- **Padding Top Hero**: `pt-32` (Compensation navigation fixe)

#### Containers
- **Max Width**: `max-w-7xl` (Contenu principal)
- **Max Width Narrow**: `max-w-5xl` (Pricing, contenu centré)
- **Max Width Form**: `max-w-md` (Formulaires)
- **Padding Horizontal**: `px-4 sm:px-6 lg:px-8`

#### Gaps
- **Grid Large**: `gap-8` (Cartes features)
- **Grid Medium**: `gap-6` (Stats, produits)
- **Grid Small**: `gap-4` (Éléments compacts)
- **Space Y**: `space-y-6` (Formulaires), `space-y-3` (Listes)

### 🧩 Composants

#### Navigation
```tsx
// Fixed navigation avec backdrop blur
<nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      {/* Logo + Links */}
    </div>
  </div>
</nav>
```

#### Boutons
- **Primary**: `bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition`
- **Secondary**: `bg-gray-100 text-gray-900 hover:bg-gray-200`
- **Outline**: `border-2 border-gray-300 hover:border-gray-400`
- **Large**: `px-8 py-4 text-lg font-semibold`

#### Cartes
- **Standard**: `bg-white rounded-xl p-8 shadow-lg`
- **Hover**: `hover:border-primary-300 hover:shadow-lg transition`
- **With Border**: `border border-gray-200`
- **Rounded Large**: `rounded-2xl` (Formulaires, pricing)

#### Badges
- **Primary Badge**: `bg-primary-100 text-primary-700 rounded-full px-4 py-2 text-sm font-medium`
- **Status Badge**: `bg-{color}-100 text-{color}-700`
- **Popular Badge**: `bg-primary-600 text-white text-sm font-semibold px-3 py-1 rounded-full`

#### Inputs
```tsx
// Input avec icône
<div className="relative">
  <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
  <input className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
</div>
```

#### Stats Cards
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600">Label</p>
      <p className="text-3xl font-bold text-gray-900">Value</p>
    </div>
    <Icon className="h-8 w-8 text-primary-600" />
  </div>
</div>
```

### 🎭 Patterns de Design

#### Hero Section
- Badge en haut: `inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full`
- Titre avec accent: `<span className="text-primary-600">Accent</span>`
- CTA buttons avec icônes
- Background gradient: `bg-gradient-to-b from-gray-50 to-white`

#### Section Storytelling (Problem)
- Background gradient: `bg-gradient-to-b from-red-50 via-orange-50 to-white`
- Cartes avec border-left coloré: `border-l-4 border-{color}-500`
- Icônes dans des containers colorés: `bg-{color}-100 rounded-lg`

#### Features Grid
- Grid responsive: `grid md:grid-cols-2 lg:grid-cols-3 gap-8`
- Icônes avec hover effect: `group-hover:bg-primary-600 transition`
- Border hover: `hover:border-primary-300`

#### Pricing Cards
- Popular card: `ring-2 ring-primary-600 scale-105`
- Badge "Most Popular": `bg-primary-600 text-white`
- Features list avec checkmarks verts

#### CTA Section
- Background gradient: `bg-gradient-to-r from-primary-600 to-primary-800`
- Texte blanc avec primary-100 pour sous-texte
- Bouton blanc avec texte primary

#### Footer
- Background: `bg-gray-900 text-gray-400`
- Links: `hover:text-white transition`
- Logo avec primary-400

### 📱 Responsive Design

#### Breakpoints
- **sm**: `640px` - Mobile large
- **md**: `768px` - Tablet
- **lg**: `1024px` - Desktop
- **xl**: `1280px` - Large desktop

#### Patterns Responsive
- Navigation: `hidden md:flex` pour desktop
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Typography: `text-4xl md:text-5xl`
- Spacing: `px-4 sm:px-6 lg:px-8`

### ✨ Animations & Transitions

#### Transitions Standard
- `transition` - Tous les éléments interactifs
- `hover:bg-primary-700` - Boutons
- `hover:shadow-lg` - Cartes
- `group-hover:` - Effets de groupe

#### Animations
- `animate-pulse` - Indicateurs de statut
- Custom scrollbar avec hover

### 🎨 États Visuels

#### États de Boutons
- **Default**: `bg-primary-600`
- **Hover**: `hover:bg-primary-700`
- **Disabled**: `disabled:opacity-50 disabled:cursor-not-allowed`
- **Loading**: Texte changeant

#### États de Cartes
- **Default**: `border border-gray-200`
- **Hover**: `hover:border-primary-300 hover:shadow-lg`
- **Active/Selected**: `ring-2 ring-primary-600`

### 📋 Checklist de Cohérence

Pour chaque nouvelle page/composant, vérifier:
- [ ] Utilisation de la palette primary (600, 700, 800)
- [ ] Typographie cohérente avec la hiérarchie
- [ ] Espacements standardisés (py-20, gap-8, etc.)
- [ ] Boutons avec styles primary/secondary
- [ ] Cartes avec rounded-xl/2xl et shadow-lg
- [ ] Responsive avec breakpoints md/lg
- [ ] Transitions sur éléments interactifs
- [ ] Icônes Lucide React avec tailles cohérentes (h-5, h-6, h-8)

