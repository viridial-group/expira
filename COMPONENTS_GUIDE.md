# Guide d'Utilisation des Composants UI

Ce guide explique comment utiliser les composants UI réutilisables du design system expira.

## Installation

Les composants sont déjà disponibles dans `/components/ui/`. Importez-les comme suit :

```tsx
import { Button, Card, Input, Badge, StatusIcon } from '@/components/ui'
```

## Composants Disponibles

### 1. Button

Bouton standardisé avec variants et tailles.

```tsx
import { Button } from '@/components/ui'

// Primary (par défaut)
<Button>Click me</Button>

// Secondary
<Button variant="secondary">Cancel</Button>

// Outline
<Button variant="outline">Learn More</Button>

// Danger
<Button variant="danger">Delete</Button>

// Tailles
<Button size="sm">Small</Button>
<Button size="md">Medium (défaut)</Button>
<Button size="lg">Large</Button>

// Avec loading
<Button loading={isLoading}>Submit</Button>

// Avec icône
<Button>
  <Save className="h-5 w-5 mr-2" />
  Save
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'danger' (défaut: 'primary')
- `size`: 'sm' | 'md' | 'lg' (défaut: 'md')
- `loading`: boolean (défaut: false)
- Toutes les props HTML button standard

### 2. Card

Carte standardisée avec padding et hover optionnels.

```tsx
import { Card } from '@/components/ui'

// Card basique
<Card>
  <h3>Title</h3>
  <p>Content</p>
</Card>

// Avec hover effect
<Card hover>
  <p>Hover me</p>
</Card>

// Tailles de padding
<Card padding="sm">Small padding</Card>
<Card padding="md">Medium padding (défaut)</Card>
<Card padding="lg">Large padding</Card>
```

**Props:**
- `padding`: 'sm' | 'md' | 'lg' (défaut: 'md')
- `hover`: boolean (défaut: false)
- `className`: string (classes supplémentaires)

### 3. Input

Champ de saisie avec label, icône et gestion d'erreur.

```tsx
import { Input } from '@/components/ui'
import { Mail } from 'lucide-react'

// Input basique
<Input
  type="email"
  placeholder="you@example.com"
/>

// Avec label
<Input
  label="Email Address"
  type="email"
  required
/>

// Avec icône
<Input
  label="Email"
  type="email"
  icon={<Mail className="h-5 w-5" />}
/>

// Avec erreur
<Input
  label="Email"
  type="email"
  error="Email is required"
/>
```

**Props:**
- `label`: string (label au-dessus de l'input)
- `error`: string (message d'erreur)
- `icon`: ReactNode (icône à gauche)
- `required`: boolean (affiche un astérisque)
- Toutes les props HTML input standard

### 4. Badge

Badge pour afficher des statuts ou labels.

```tsx
import { Badge } from '@/components/ui'

// Variants
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="gray">Gray</Badge>

// Tailles
<Badge size="sm">Small</Badge>
<Badge size="md">Medium (défaut)</Badge>
```

**Props:**
- `variant`: 'primary' | 'success' | 'warning' | 'error' | 'gray' (défaut: 'primary')
- `size`: 'sm' | 'md' (défaut: 'md')
- `className`: string (classes supplémentaires)

### 5. StatusIcon

Icône de statut standardisée.

```tsx
import { StatusIcon } from '@/components/ui'

// Statuts
<StatusIcon status="active" />
<StatusIcon status="success" />
<StatusIcon status="warning" />
<StatusIcon status="error" />
<StatusIcon status="expired" />

// Tailles
<StatusIcon status="active" size="sm" />
<StatusIcon status="active" size="md" />
<StatusIcon status="active" size="lg" />
```

**Props:**
- `status`: 'active' | 'success' | 'warning' | 'error' | 'expired'
- `size`: 'sm' | 'md' | 'lg' (défaut: 'md')
- `className`: string (classes supplémentaires)

## Exemples d'Utilisation

### Formulaire Complet

```tsx
import { Button, Card, Input } from '@/components/ui'
import { Mail, Lock, Save } from 'lucide-react'

function LoginForm() {
  return (
    <Card padding="lg">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      <form className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          required
          icon={<Mail className="h-5 w-5" />}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          required
          icon={<Lock className="h-5 w-5" />}
        />
        <Button type="submit" className="w-full">
          <Save className="h-5 w-5 mr-2" />
          Sign In
        </Button>
      </form>
    </Card>
  )
}
```

### Liste avec Statuts

```tsx
import { Card, Badge, StatusIcon } from '@/components/ui'

function ProductList({ products }) {
  return (
    <div className="space-y-4">
      {products.map(product => (
        <Card key={product.id} hover>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <StatusIcon status={product.status} />
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.url}</p>
              </div>
            </div>
            <Badge variant={product.status === 'active' ? 'success' : 'warning'}>
              {product.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}
```

## Migration des Pages Existantes

Pour migrer une page existante vers les nouveaux composants :

1. **Remplacer les boutons** :
```tsx
// Avant
<button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
  Submit
</button>

// Après
<Button>Submit</Button>
```

2. **Remplacer les cartes** :
```tsx
// Avant
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  Content
</div>

// Après
<Card>Content</Card>
```

3. **Remplacer les inputs** :
```tsx
// Avant
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Email
  </label>
  <input className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
</div>

// Après
<Input label="Email" type="email" />
```

## Bonnes Pratiques

1. **Utilisez toujours les composants UI** pour maintenir la cohérence
2. **Ne modifiez pas directement les styles** des composants, utilisez `className` si nécessaire
3. **Respectez les variants** définis pour chaque composant
4. **Utilisez les icônes Lucide React** pour rester cohérent
5. **Testez la responsivité** avec les breakpoints md/lg

## Support

Pour toute question ou suggestion d'amélioration, référez-vous au fichier `DESIGN_SYSTEM.md` pour les guidelines complètes.

