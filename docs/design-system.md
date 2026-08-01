# Design System — PhotoAtlas

> Référence graphique complète. À consulter avant d'écrire tout nouveau composant.

---

## Philosophie

PhotoAtlas est une application utilisée plusieurs heures par les photographes. L'interface doit être :
- **Lisible** en toutes conditions (nuit, forte luminosité)
- **Discrète** pour ne pas distraire de la carte
- **Hiérarchisée** — chaque élément a un poids visuel précis
- **Cohérente** — zéro couleur codée directement dans les composants

Référence : Windy, Linear, Vercel Dashboard, Apple Plans.

---

## Palette (Design Tokens)

Tous les tokens sont définis dans `src/app/globals.css` via des variables CSS.

### Mode sombre (défaut de l'application)

| Token | Valeur OKLCH | Usage |
|---|---|---|
| `--background` | `oklch(0.145 0 0)` | Fond général (carte + app) |
| `--card` | `oklch(0.205 0 0)` | Surfaces / cartes / panneaux |
| `--muted` | `oklch(0.255 0 0)` | Fonds secondaires (hover, sections) |
| `--foreground` | `oklch(0.985 0 0)` | Texte principal — quasi-blanc |
| `--muted-foreground` | `oklch(0.72 0 0)` | Texte secondaire — gris moyen |
| `--primary` | `oklch(0.922 0 0)` | Accent primaire (interactif) |
| `--border` | `oklch(1 0 0 / 14%)` | Bordures (14% opacity sur blanc) |
| `--ring` | `oklch(0.65 0 0)` | Focus rings |

### Règles de contraste (WCAG)

| Paire | Ratio | Résultat |
|---|---|---|
| `foreground` / `background` | ~15:1 | ✅ AAA |
| `muted-foreground` / `background` | ~5.5:1 | ✅ AA |
| `muted-foreground/70` / `background` | ~3.8:1 | ✅ AA |
| ~~`muted-foreground/30`~~ | ~1.6:1 | ❌ Interdit |

**Règle absolue : ne jamais utiliser une opacité inférieure à 60% sur du texte lisible.**

---

## Typographie

### Hiérarchie

| Niveau | Classes Tailwind | Usage |
|---|---|---|
| Titre lieu | `text-xl font-bold tracking-tight` | Nom du lieu dans la fiche |
| Titre section | `text-[11px] font-semibold uppercase tracking-[0.1em]` | En-têtes de section |
| Corps | `text-sm` | Contenu principal |
| Secondaire | `text-xs text-muted-foreground` | Labels, métadonnées |
| Mono / coords | `font-mono text-xs` | Coordonnées GPS, valeurs numériques |

### Taille minimale de texte lisible

- **11px** pour les labels de section (uppercase, espacement augmenté)
- **12px (text-xs)** pour le texte secondaire
- **14px (text-sm)** pour le corps et les noms

⚠️ Ne jamais utiliser `text-[10px]` pour du texte fonctionnel — réservé aux ornements visuels.

---

## Espacements

### Grille de base : multiples de 4px

| Valeur | Usage |
|---|---|
| `p-2` / `gap-2` | Espacement interne minimal (boutons, badges) |
| `p-3` / `gap-3` | Espacement standard (lignes de données) |
| `p-4` / `gap-4` | Espacement section (padding des panneaux) |
| `py-2.5 px-3` | Pattern standard pour les lignes de card |
| `px-4 py-4` | Padding standard des sections de fiche lieu |

### Rayons

| Token | Valeur | Usage |
|---|---|---|
| `rounded-md` | 6px | Boutons, inputs |
| `rounded-lg` | 10px | Cards de section |
| `rounded-xl` | 12px | Score card (hero) |
| `rounded-full` | 9999px | Badges, chips |

---

## Composants

### Bouton Ghost (action secondaire)

```tsx
<button className="flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
  <Icon className="h-3.5 w-3.5" />
  Label
</button>
```

### Bouton désactivé (future fonctionnalité)

```tsx
<button
  disabled
  className="flex cursor-not-allowed items-center gap-1.5 rounded-md border border-border/20 px-3 py-1.5 text-xs font-medium text-muted-foreground/40"
  title="Bientôt disponible"
>
  <Icon className="h-3.5 w-3.5" />
  Label
</button>
```

### Chip de type (badge catégorie)

```tsx
<span className="inline-flex items-center gap-1.5 rounded-full border border-border/30 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
  <Icon className="h-3 w-3" />
  Label
</span>
```

### Badge "Bientôt disponible"

```tsx
<span className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
  Bientôt
</span>
```

### Card de section (conditions, localisation)

```tsx
<div className="overflow-hidden rounded-lg border border-border/20 bg-card">
  {/* DataRows */}
</div>
```

### En-tête de section

```tsx
<div className="mb-2.5 flex items-center gap-2">
  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
    Label
  </span>
</div>
```

### Ligne de données (dans une card)

```tsx
<div className="flex items-center justify-between border-b border-border/20 px-3 py-2.5 last:border-0">
  <div className="flex items-center gap-2.5">
    <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
    <span className="text-sm text-foreground/80">Label</span>
  </div>
  <span>Valeur</span>
</div>
```

---

## Score Photo (hero card)

Le score photo est l'élément central de la fiche lieu. Il doit toujours être affiché en premier et en taille importante, même sans données :

```tsx
<div className="rounded-xl border border-border/25 bg-muted/10 px-5 py-6 text-center">
  <div className="flex items-baseline justify-center gap-2">
    <span className="text-6xl font-black leading-none tabular-nums text-foreground/25">
      {score ?? "—"}
    </span>
    <span className="text-xl font-semibold text-muted-foreground">/100</span>
  </div>
  <p className="mt-3 text-xs text-muted-foreground">Message d'état</p>
  <div className="mt-3 flex justify-center gap-1.5">
    {/* Tags des sources de données manquantes */}
  </div>
</div>
```

---

## Bonnes pratiques

### ✅ À faire

- Utiliser les variables CSS via les classes Tailwind (`text-muted-foreground`, `bg-card`, etc.)
- Maintenir au minimum 60% d'opacité pour le texte lisible
- Utiliser `text-[11px] uppercase tracking-[0.1em]` pour les titres de section
- Wrapper chaque catégorie de données dans `rounded-lg border bg-card`
- Tester visuellement dans la sidebar collapsée ET dépliée

### ❌ À ne pas faire

- `text-muted-foreground/30` → jamais pour du texte fonctionnel
- `text-[10px]` → seulement pour les ornements (points séparateurs, etc.)
- Coder des couleurs directement (`text-[#666]`) → utiliser les tokens
- Utiliser `opacity-30` sur des textes — utiliser un token sémantique

---

## Architecture CSS

```
src/app/globals.css
  ├── @import "maplibre-gl/dist/maplibre-gl.css"
  ├── @import "tailwindcss"
  ├── @import "shadcn/tailwind.css"
  ├── @theme inline { }     ← mapping tokens → classes Tailwind
  ├── :root { }             ← palette light (non utilisée activement)
  ├── .dark { }             ← palette dark (défaut de l'app)
  └── @layer base { }       ← reset global
```

---

*Dernière mise à jour : sprint 9 — Design System*
