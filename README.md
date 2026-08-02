# PhotoAtlas

**Le copilote intelligent des photographes**

PhotoAtlas est une plateforme web destinée aux photographes de paysage, d'astrophotographie et de phénomènes météorologiques. L'objectif est de répondre à une seule question en un seul endroit :

> **"Où dois-je aller photographier aujourd'hui ?"**

Au lieu d'ouvrir Windy, Meteoblue, Light Pollution Map, PhotoPills, Clear Outside ou Blitzortung séparément, PhotoAtlas centralise toutes ces informations dans une interface unifiée.

La page éditoriale **[Pourquoi PhotoAtlas ?](http://localhost:3000/pourquoi-photoatlas)** présente l’origine du projet, sa démarche photographique, les outils déjà disponibles et la vision de son évolution.

---

## Fonctionnalités prévues

- Carte interactive (MapLibre GL)
- Météo, vent, nuages, brouillard, orages
- Pollution lumineuse
- Informations astronomiques (Soleil, Lune, Voie Lactée)
- Spots photo et points d'intérêt
- Score de conditions photo
- Aide à la décision multi-critères

---

## Stack technique

| Outil                                        | Rôle                                 |
| -------------------------------------------- | ------------------------------------ |
| [Next.js 16](https://nextjs.org)             | Framework React (App Router)         |
| [React 19](https://react.dev)                | Interface utilisateur                |
| [TypeScript](https://www.typescriptlang.org) | Typage statique                      |
| [Tailwind CSS v4](https://tailwindcss.com)   | Styles utilitaires                   |
| [shadcn/ui](https://ui.shadcn.com)           | Composants UI accessibles            |
| [MapLibre GL](https://maplibre.org)          | Carte interactive open-source        |
| [Zustand](https://zustand-demo.pmnd.rs)      | État global léger                    |
| [TanStack Query](https://tanstack.com/query) | Cache et synchronisation des données |
| [pnpm](https://pnpm.io)                      | Gestionnaire de paquets              |

---

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (thème, providers)
│   └── page.tsx            # Page d'accueil
│
├── components/
│   ├── layout/             # Conteneurs structurels (Header, Sidebar, Main)
│   └── ui/                 # Composants shadcn/ui
│
├── features/               # Modules fonctionnels indépendants
│   ├── map/                # (futur) Carte interactive
│   ├── weather/            # (futur) Couches météo
│   ├── astronomy/          # (futur) Soleil, Lune, Voie Lactée
│   ├── lightPollution/     # (futur) Pollution lumineuse
│   └── spots/              # (futur) Spots photo
│
├── services/               # Couche d'accès aux API externes
├── stores/                 # Stores Zustand
├── hooks/                  # Hooks React réutilisables
├── lib/                    # Utilitaires partagés
└── types/                  # Types TypeScript globaux
```

### Principes architecturaux

- **Aucun appel API dans les composants React** — toujours via `services/`
- **Server Components par défaut** — `"use client"` uniquement si nécessaire
- **Features isolées** — chaque fonctionnalité est autonome dans `features/`
- **Zéro `any` TypeScript** — le typage strict est imposé par ESLint
- **Mobile-first** — l'interface s'adapte du mobile au desktop

---

## Démarrage

### Prérequis

- Node.js ≥ 20
- pnpm ≥ 9

### Installation

```bash
pnpm install
```

### Développement

```bash
pnpm dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

### Build de production

```bash
pnpm build
pnpm start
```

### Qualité du code

```bash
pnpm lint           # ESLint
pnpm format         # Prettier (correction automatique)
pnpm format:check   # Prettier (vérification uniquement)
pnpm type-check     # TypeScript (sans compilation)
```

---

## Conventions de code

- Composants : PascalCase (`AppHeader.tsx`)
- Hooks : camelCase préfixé `use` (`useGeolocation.ts`)
- Services : camelCase (`weatherService.ts`)
- Stores : camelCase préfixé `use` (`useMapStore.ts`)
- Exports depuis un `index.ts` par dossier lorsque pertinent

---

## Roadmap

- [x] Étape 1 — Fondations (structure, config, layout)
- [ ] Étape 2 — Carte interactive (MapLibre GL)
- [ ] Étape 3 — Géolocalisation et navigation
- [ ] Étape 4 — Couches météo
- [ ] Étape 5 — Pollution lumineuse
- [ ] Étape 6 — Informations astronomiques
- [ ] Étape 7 — Spots photo
- [ ] Étape 8 — Score de conditions photo

---

## Licence

Projet privé — tous droits réservés.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
