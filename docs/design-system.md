# Design System — PhotoAtlas

## Principes

PhotoAtlas est conçu pour des sessions longues, sur écran sombre comme en forte luminosité. La carte reste le contexte, mais le lieu sélectionné et les recommandations forment la hiérarchie principale.

Les règles obligatoires sont : lisibilité WCAG AA, texte fonctionnel de 14 px minimum, cible interactive de 44 × 44 px minimum, focus clavier visible et couleurs exclusivement issues des tokens.

## Tokens

Tous les tokens vivent dans `src/app/globals.css` et sont exposés à Tailwind par `@theme inline`.

### Surfaces et texte

| Token              | Usage                                  |
| ------------------ | -------------------------------------- |
| `background`       | arrière-plan principal                 |
| `card`             | cartes et panneaux                     |
| `popover`          | menus flottants                        |
| `foreground`       | texte principal                        |
| `muted-foreground` | texte secondaire lisible               |
| `muted`            | surfaces secondaires                   |
| `border`           | séparation visible des surfaces        |
| `ring`             | focus clavier                          |
| `overlay`          | voile et panneau flottant sur la carte |

Le texte secondaire sombre utilise une luminance renforcée. Une opacité ne doit jamais servir à rendre un texte fonctionnel illisible. Les anciennes classes de texte sous 14 px disposent d’un garde-fou CSS global, mais les nouveaux composants doivent utiliser directement `text-sm` ou plus.

### Couleurs sémantiques

| Token                                              | Usage                                 |
| -------------------------------------------------- | ------------------------------------- |
| `success`                                          | condition favorable, validation       |
| `warning`                                          | vigilance, opportunité à confirmer    |
| `destructive`                                      | erreur ou condition défavorable       |
| `info`                                             | information temporelle et navigation  |
| `score-excellent`                                  | score ≥ 85                            |
| `score-good`                                       | score de 68 à 84                      |
| `score-average`                                    | score de 50 à 67                      |
| `score-poor`                                       | score inférieur à 50                  |
| `astro`, `sunrise`, `sunset`, `landscape`, `storm` | identité des familles photographiques |

Il est interdit d’utiliser une couleur Tailwind chromatique directement dans un nouveau composant. Utiliser par exemple `text-success`, `border-warning/30` ou `text-astro`.

## Hiérarchie typographique

| Niveau                  |  Taille cible | Usage                          |
| ----------------------- | ------------: | ------------------------------ |
| Titre principal / lieu  |      36–42 px | lieu sélectionné, vue majeure  |
| Titre de recommandation |      22–24 px | opportunité principale, résumé |
| Titre de carte          |      18–20 px | en-tête de chaque carte        |
| Texte principal         |      16–18 px | explications et contenus       |
| Texte secondaire        |      14–16 px | métadonnées et aides           |
| Légende                 | 14 px minimum | source, unité, annotation      |

Les valeurs importantes utilisent une graisse forte et des chiffres tabulaires. Les heures conseillées sont affichées au minimum en 24 px dans les cartes de recommandation.

## Espacement et surfaces

- Carte standard : rayon 16 px, bordure visible, padding 20 px.
- Espacement entre cartes : 12 à 20 px selon le viewport.
- En-tête de carte : icône 20 px dans une cible visuelle de 44 px.
- Groupe d’informations : padding minimum 16 px.
- Panneau lieu desktop : largeur maximale 512 px, limitée à 42 % du viewport.
- Panneau lieu mobile : bottom sheet de 88 vh maximum.

## Scores

Un score n’est jamais présenté comme un nombre isolé. `ScoreIndicator` associe :

- un anneau coloré ;
- un statut textuel (`Excellent`, `Très bon`, `Correct`, `Défavorable`) ;
- la valeur sur 100.

Les classements et événements utilisent `ScoreBar`. Les étoiles ne font plus partie du langage visuel des recommandations.

## Timeline

La timeline est verticale. Chaque événement possède une heure en chiffres tabulaires, un nœud de 36 px, une icône, un libellé et, si pertinent, une barre de score. La ligne utilise uniquement les tokens `info` et `astro`.

## Accessibilité WCAG AA

- Contraste normal : au moins 4,5:1.
- Texte large : au moins 3:1, sans utiliser ce seuil pour contourner la lisibilité.
- Corps de texte : 16 px recommandé, jamais moins de 14 px.
- Cible tactile : 44 × 44 px minimum.
- Focus : contour de 3 px avec décalage de 2 px.
- Ne jamais transmettre une information uniquement par la couleur : les scores comportent toujours un libellé et une valeur.
- Les icônes décoratives utilisent `aria-hidden`; les commandes ont un nom accessible.
- Les animations respectent `prefers-reduced-motion`.

## Responsive

- Desktop : sidebar persistante, carte centrale et panneau lieu latéral.
- Ordinateur portable : panneau limité à 42 % pour préserver la carte.
- Tablette et mobile : sidebar en superposition et fiche lieu en bottom sheet.
- Les cartes horaires passent d’une à deux colonnes lorsque l’espace le permet.
- Les contrôles flottants conservent une marge de 16 px et une cible de 44 px minimum.

## Checklist composant

Avant validation :

1. Aucun texte sous `text-sm`.
2. Aucune couleur chromatique brute dans le composant.
3. Toute commande mesure au moins 44 × 44 px.
4. Le focus clavier est visible.
5. Le contenu reste compréhensible sans couleur.
6. Les textes secondaires utilisent `muted-foreground` sans opacité faible.
7. La mise en page fonctionne à 375 px, 768 px, 1280 px et 2560 px.

Dernière mise à jour : revue UX et accessibilité du tableau de bord PhotoAtlas.
