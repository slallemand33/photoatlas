# Webcams

## Rôle dans PhotoAtlas

Les webcams rapprochent la préparation numérique de la réalité du terrain. Une fois un lieu
sélectionné, la carte **Webcams proches** affiche les caméras publiques les plus proches pour aider à
évaluer visuellement la visibilité, les nuages, le brouillard, la neige, la pluie ou l’état de la mer.

Cette fonctionnalité ne modifie pas la carte principale et ne cherche pas à interpréter
automatiquement les images. Elle fournit une observation visuelle complémentaire aux données météo
et astronomiques.

## Source

La première implémentation utilise l’API **Windy Webcams V3**, documentée sur
<https://api.windy.com/webcams/docs>.

- recherche : `GET /webcams/api/v3/webcams?nearby=latitude,longitude,rayon` ;
- détail : `GET /webcams/api/v3/webcams/{webcamId}` ;
- authentification : en-tête serveur `x-windy-api-key` ;
- attribution et liens vers Windy présents près de chaque contexte d’affichage.

Les images ne sont jamais téléchargées ni enregistrées par PhotoAtlas. Le navigateur utilise
directement les URL temporaires renvoyées par Windy.

## Architecture

```text
Panneau React
  → webcamApi (client)
    → /api/webcams et /api/webcams/[id] (Next.js)
      → WebcamService (tri et distance)
        → WindyWebcamsProvider (appel externe authentifié)
```

Le dossier `features/webcams/` isole les composants, hooks, services, store, types et utilitaires.
`WebcamService` dépend du contrat `IWebcamsProvider` : un autre fournisseur pourra donc remplacer
Windy sans modifier les composants React.

La recherche demande jusqu’à 50 webcams dans le rayon configuré, puis `WebcamService` calcule la
distance géographique et trie les résultats localement. Cette étape est nécessaire car l’API Windy
V3 ne propose plus de tri serveur par distance. L’interface n’affiche ensuite que les résultats les
plus proches afin de rester compacte.

## Clé API

La clé doit être définie uniquement côté serveur :

```dotenv
WINDY_WEBCAMS_API_KEY=...
```

Elle figure sous forme de valeur factice dans `.env.example`. La valeur réelle doit être ajoutée dans
les variables d’environnement locales et dans **Vercel → Project Settings → Environment Variables**
pour les environnements souhaités. Le nom ne commence volontairement pas par `NEXT_PUBLIC_` et le
provider est protégé par `server-only` : la clé ne peut donc pas entrer dans le bundle navigateur.

## Cache et expiration des images

Les URL d’images Windy contiennent des jetons temporaires. Le cache React Query est court et une
actualisation a lieu toutes les huit minutes pendant que la carte est montée. L’ouverture d’une
webcam déclenche une requête de détail séparée afin d’obtenir une URL récente. Une image en erreur
provoque également une actualisation des métadonnées.

Les routes internes autorisent seulement un petit cache privé pour la liste. Le détail utilise
`no-store`. Aucun contenu d’image n’est mis en cache en base par PhotoAtlas.

## Limites

- la disponibilité, la fréquence de mise à jour et l’orientation des caméras dépendent de leurs
  propriétaires ;
- une image n’est pas une mesure météo et peut être ancienne ou prise de nuit ;
- l’offre gratuite limite les tailles d’images et la durée de validité de leurs URL ;
- certaines zones ne disposent d’aucune webcam publique dans le rayon choisi ;
- Windy peut modifier ses quotas ou rendre temporairement une caméra indisponible.

## Ajouter un fournisseur

1. Implémenter `IWebcamsProvider` dans `features/webcams/services/`.
2. Normaliser les résultats vers le type `Webcam`.
3. Injecter le provider dans `WebcamService` côté serveur.
4. Ajouter l’attribution et les obligations de licence du nouveau fournisseur.
5. Conserver les appels externes et les secrets hors des composants React.
