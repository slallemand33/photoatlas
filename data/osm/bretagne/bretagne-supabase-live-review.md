# Comparaison Catalogue Bretagne / Supabase LIVE

## Résumé

- Catalogue : 105
- Portée de lecture live réellement visible : 22 spots
- Status visibles : verified=22
- Verdict de comparaison exhaustive : BLOCKED
- Cause : la clé publishable locale ne donne accès qu'à la surface publiée visible et ne permet pas d'inspecter l'état complet réel de public.spots.

## EXISTANT_CORRECT

- Aucun

## EXISTANT_A_CORRIGER

- Aucun

## NOUVEAU

- Phare de la Jument (lighthouse)
- Phare de Pen-Men (lighthouse)
- Phare des Roches-Douvres (lighthouse)
- Phare du Four (lighthouse)
- Phare du Petit Minou (lighthouse)
- Phare des Sept-Îles (lighthouse)
- Phare de la Croix (lighthouse)
- Phare de Tévennec (lighthouse)
- Phare de Trézien (lighthouse)
- Phare des Moutons (lighthouse)
- Phare des Pierres-Noires (lighthouse)
- Phare du Créac'h (lighthouse)
- Phare du Grand-Jardin (lighthouse)
- Phare du Millier (lighthouse)
- Phare du Portzic (lighthouse)
- Phare du Rosédo (lighthouse)
- Château de Fougères (castle)
- Observatoire du marais de Séné (observatory)
- Château de Rustéphan (ruins)
- Phare de Kéréon (lighthouse)
- Phare de Kergadec (lighthouse)
- Phare de l'Aber Ildut (lighthouse)
- Phare de l'île de Sein (lighthouse)
- Phare de l'Île Vierge (lighthouse)
- Phare de la Vieille (lighthouse)
- Phare du Toulinguet (lighthouse)
- Phare et fort de Penfret (lighthouse)
- Fort Cigogne (fortification)
- Phare de Goulphar (lighthouse)
- Phare de Lanvaon (lighthouse)
- Phare du Cap Fréhel (lighthouse)
- Château de Fontenay (castle)
- Château de Kéralio (castle)
- Château de la Sécardais (castle)
- Château de Lupin (castle)
- Château du Bot (castle)
- Fort de Taillefer (fortification)
- Le Vieux Pont Suspendu (monument)
- Observatoire (observatory)
- Observatoire (observatory)
- ... 65 autres

## DOUBLON_AMBIGU

- Aucun

## Types

| Type | Catalogue | Existant correct | À corriger | Nouveau | Ambigu |
|---|---:|---:|---:|---:|---:|
| lighthouse | 39 | 0 | 0 | 39 | 0 |
| observatory | 23 | 0 | 0 | 23 | 0 |
| castle | 18 | 0 | 0 | 18 | 0 |
| ruins | 14 | 0 | 0 | 14 | 0 |
| fortification | 5 | 0 | 0 | 5 | 0 |
| monument | 2 | 0 | 0 | 2 | 0 |
| bird_reserve | 2 | 0 | 0 | 2 | 0 |
| viewpoint | 1 | 0 | 0 | 1 | 0 |
| bridge | 1 | 0 | 0 | 1 | 0 |

## Status

| Status | Nombre |
|---|---:|
| verified | 22 |

## Coordonnées

- Distance calculée uniquement pour les correspondances live visibles et fiables
- Les écarts > 50 m sont listés dans EXISTANT_A_CORRIGER

## Anomalies

- Les 39 phares KEEP sont correctement retenus dans le catalogue local, mais leur présence réelle en base complète ne peut pas être vérifiée exhaustivement avec l'accès live courant
- Même limite pour les observatoires, châteaux, ruines et fortifications
- Aucun accès live complet aux lignes candidate/non publiées n'est disponible dans l'environnement courant

### Futures opérations potentielles

INSERT :
105

UPDATE status :
indéterminable sans accès live complet

UPDATE spot_type_id :
0

Aucune opération :
0

## Contrôle

- Somme des quatre catégories calculées : 105
- Cette somme couvre 105 spots du catalogue, mais uniquement par rapport aux 22 lignes live visibles.
- Verdict final : BLOCKED

## Production

Supabase :
NON MODIFIÉ

public.spots :
NON MODIFIÉ

