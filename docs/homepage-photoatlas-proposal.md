# Proposition Homepage PhotoAtlas

## 1. Analyse de la homepage actuelle

La homepage actuelle est minimale.

Elle repose sur [src/app/page.tsx](src/app/page.tsx) qui délègue entièrement à [src/components/layout/MainContent.tsx](src/components/layout/MainContent.tsx).

Constat :

- la route / affiche directement la carte ;
- il n'y a pas de contenu éditorial d'entrée ;
- la promesse produit n'est pas explicitée avant l'usage ;
- la page répond bien au besoin d'un utilisateur déjà convaincu ;
- elle répond moins bien au besoin d'un nouveau visiteur qui découvre PhotoAtlas.

Ce qui est actuellement affiché sur / :

- header principal ;
- barre de recherche ;
- sélecteur de thème ;
- sidebar fonctionnelle ;
- carte comme contenu principal ;
- footer ;
- panneaux contextuels liés à l'usage outil.

Forces de la homepage actuelle :

- accès immédiat à l'outil ;
- cohérence avec la logique produit orientée usage ;
- expérience efficace pour un utilisateur qui sait déjà pourquoi il vient.

Limites de la homepage actuelle :

- ne raconte pas la proposition de valeur ;
- n'installe pas immédiatement l'identité photographique du projet ;
- laisse le visiteur comprendre seul ce qu'il peut faire ;
- fait commencer le parcours par l'outil, non par la promesse.

## 2. Analyse de /pourquoi-photoatlas

La page [src/app/pourquoi-photoatlas/page.tsx](src/app/pourquoi-photoatlas/page.tsx) est une page éditoriale complète, structurée et déjà très proche d'une homepage manifeste.

Structure actuelle observée :

- hero d'introduction avec titre Pourquoi PhotoAtlas ? ;
- sous-titre Le copilote intelligent des photographes ;
- texte de contexte sur la dispersion des outils ;
- CTA Ouvrir la carte ;
- section Le constat ;
- bloc citation autour de la question centrale ;
- section d'origine du projet avec incarnation par le créateur ;
- section Ce que PhotoAtlas propose déjà ;
- section La vision / ce qui arrive progressivement ;
- bloc philosophie ;
- bloc projet vivant ;
- citation finale manifeste.

Éléments forts :

- ton juste ;
- identité photographique claire ;
- récit cohérent ;
- présence d'un CTA déjà existant ;
- bonne hiérarchie desktop/mobile ;
- sections bien segmentées ;
- contenu déjà premium, sobre et crédible.

Éléments à surveiller si cette page devient la homepage :

- elle est un peu longue pour une vraie page d'accueil d'entrée ;
- certaines sections de vision/futur peuvent arriver trop tôt ;
- le hero actuel commence par une logique explicative, pas par une accroche émotionnelle forte ;
- la route / doit répondre très vite à Qu'est-ce que PhotoAtlas ? Pourquoi c'est utile ? Que faire maintenant ?

## 3. Ce qui fonctionne déjà

Ce qui fonctionne déjà pour une future homepage :

- le ton général ;
- la qualité rédactionnelle ;
- la crédibilité du projet ;
- l'incarnation par un photographe ;
- le CTA vers la carte ;
- les sections Le constat, Ce que PhotoAtlas propose déjà et Notre philosophie ;
- la citation finale, qui ancre fortement l'identité du projet.

Ce qui fonctionne déjà pour le parcours utilisateur :

- l'utilisateur comprend que PhotoAtlas n'est pas une carte générique ;
- l'utilisateur comprend que l'outil sert à préparer une sortie photo ;
- l'utilisateur comprend qu'il peut ensuite ouvrir la carte.

## 4. Ce qu'il faut conserver

À conserver dans la future homepage :

- l'identité photographique ;
- le positionnement Le copilote intelligent des photographes ;
- le lien fort entre inspiration et usage réel ;
- la section Le constat, mais condensée ;
- la section Ce que PhotoAtlas propose déjà ;
- le CTA Ouvrir la carte ;
- la section philosophie, sous une forme plus resserrée ;
- au moins un élément manifeste fort.

À conserver dans une page secondaire si la homepage est allégée :

- le détail complet du récit fondateur ;
- la roadmap implicite Ce qui arrive progressivement ;
- certains paragraphes longs sur la genèse du projet ;
- les répétitions utiles en page manifeste mais trop longues en page d'accueil.

## 5. Ce qu'il faut modifier

À modifier pour transformer /pourquoi-photoatlas en homepage efficace :

- remplacer le H1 actuel par l'accroche principale validée ;
- faire du CTA Ouvrir la carte le centre de gravité de la page ;
- raccourcir le hero ;
- remonter la promesse produit plus vite ;
- condenser la partie biographique ;
- réduire la place de la section vision future ;
- mieux distinguer ce qui aide maintenant de ce qui viendra plus tard.

À ne pas faire :

- transformer la page en landing page marketing standard ;
- empiler trop de cartes de fonctionnalités ;
- diluer la dimension photographique dans du discours produit trop générique ;
- supprimer tout le contenu éditorial au profit de la seule carte.

## 6. Structure proposée

Structure recommandée pour la future homepage :

1. HERO
2. PROMESSE
3. COMMENT ÇA FONCTIONNE
4. CE QUE PHOTOATLAS APPORTE DÉJÀ
5. CTA CENTRAL VERS LA CARTE
6. PHILOSOPHIE / MANIFESTE
7. LIEN VERS UNE PAGE SECONDAIRE PLUS DÉTAILLÉE

Pourquoi cette structure est recommandée :

- elle répond d'abord à l'émotion et à la curiosité ;
- elle explicite ensuite le rôle de l'outil ;
- elle donne un chemin d'action immédiat ;
- elle garde la profondeur éditoriale sans noyer le visiteur.

## 7. Hero

H1 :

"Et si votre prochaine photo était déjà là, quelque part ?"

CTA :

"Ouvrir la carte"

Proposition de rôle du hero :

- ouvrir sur la promesse sensible ;
- faire sentir qu'il existe un lieu, un instant et une lumière à découvrir ;
- enchaîner très vite sur la proposition concrète de PhotoAtlas.

Sous-texte recommandé du hero :

- une phrase courte expliquant que PhotoAtlas aide à savoir où aller, quand partir et pourquoi ce moment mérite une image ;
- une formulation plus proche du terrain que de la technique.

Le hero doit éviter :

- une longue explication ;
- une liste de fonctionnalités ;
- une surcharge visuelle qui détournerait du CTA principal.

## 8. Contenu à conserver

À conserver dans la homepage :

- le constat sur la dispersion des outils ;
- la question centrale : Où aller, à quelle heure, et pourquoi ? ;
- la section des fonctionnalités déjà disponibles ;
- le bloc philosophie ;
- la citation finale ou une citation manifeste équivalente ;
- l'incarnation du projet par son créateur, mais condensée.

À conserver dans une page secondaire détaillée :

- l'intégralité du récit du fondateur ;
- la section Ce qui arrive progressivement dans sa version complète ;
- les développements longs sur l'évolution du projet.

## 9. Contenu à déplacer

À déplacer plus bas dans la homepage :

- la carte complète des fonctionnalités disponibles ;
- la vision future ;
- le bloc projet vivant.

À déplacer éventuellement vers une page secondaire :

- les cartes FUTURE ;
- les détails trop roadmap ;
- les paragraphes de contexte les plus longs.

## 10. Contenu à supprimer

À supprimer de la homepage, au sens retirer de la première lecture principale :

- les redondances explicatives ;
- les formulations qui répètent l'idée de dispersion des outils si elle est déjà comprise ;
- les sections qui parlent plus du projet lui-même que du bénéfice utilisateur immédiat.

Il n'est pas recommandé de supprimer définitivement le contenu ;
le bon choix est plutôt de le déplacer hors de la première exposition.

## 11. Navigation

Navigation recommandée à terme :

- / → nouvelle homepage éditoriale
- /map → carte / outil principal, si cette route est créée
- /pourquoi-photoatlas → page secondaire longue ou redirection vers une ancre de la homepage

État recommandé :

- garder la homepage comme point d'entrée narratif ;
- garder la carte comme destination produit immédiate ;
- conserver une page de profondeur éditoriale si nécessaire.

Le lien principal du hero doit pointer vers la carte.

## 12. Responsive

Desktop :

- hero ample, respiration généreuse ;
- CTA très visible au-dessus de la ligne de flottaison ;
- sections alternant texte et respiration visuelle ;
- grille de fonctionnalités possible.

Tablet :

- garder les sections, mais resserrer la longueur de ligne ;
- maintenir le CTA visible sans scroll excessif ;
- limiter la densité des cartes simultanées.

Mobile :

- hero court et immédiatement lisible ;
- CTA Ouvrir la carte visible sans effort ;
- blocs éditoriaux courts ;
- éviter toute sensation de page trop longue avant l'action.

## 13. SEO

État actuel :

- la page /pourquoi-photoatlas a déjà des métadonnées éditoriales ;
- la homepage actuelle n'apporte quasiment pas de contenu indexable ;
- la future homepage gagnerait fortement en valeur SEO si elle devient éditoriale.

Recommandations :

- utiliser le H1 validé comme entrée émotionnelle ;
- conserver un sous-titre descriptif mentionnant clairement PhotoAtlas et la préparation photo ;
- organiser la page avec des H2 simples et lisibles ;
- conserver du texte indexable utile, sans surcharge ;
- réécrire à terme title et meta description de / pour refléter la nouvelle promesse d'accueil.

## 14. Mode clair / sombre

Le nouveau mode clair validé comme thème par défaut est compatible avec cette direction.

Recommandations :

- garder le mode sombre comme référence esthétique ;
- en clair, éviter les grands aplats blancs ;
- conserver des surfaces légèrement ivoire / pierre / gris doux ;
- maintenir un contraste fort sur le hero et le CTA ;
- vérifier les citations, cartes et panneaux éditoriaux dans les deux thèmes.

La future homepage éditoriale devra être pensée nativement pour les deux modes.

## 15. Risques

Risques réels identifiés :

- transformer la homepage en page trop longue avant l'action ;
- perdre l'accès immédiat à la carte pour les utilisateurs déjà convaincus ;
- surcharger le discours au lieu de guider ;
- trop déplacer de contenu sans prévoir une page secondaire pour le conserver ;
- faire dériver le ton vers une landing page trop SaaS.

Risque principal UX :

- si la carte devient trop enfouie, l'utilisateur orienté outil sera ralenti.

Mitigation :

- CTA Ouvrir la carte très visible, dès le hero ;
- lien persistant vers la carte dans la navigation ;
- hiérarchie éditoriale resserrée.

## 16. Ordre d'implémentation

Ordre recommandé :

1. définir la structure cible de la homepage ;
2. réécrire le hero avec le H1 validé ;
3. conserver et condenser la promesse produit ;
4. intégrer le CTA Ouvrir la carte comme action principale ;
5. déplacer le contenu secondaire long vers une page éditoriale dédiée ou vers le bas ;
6. reconnecter la navigation entre homepage et carte ;
7. vérifier responsive ;
8. vérifier mode clair et sombre ;
9. ajuster title, description et hiérarchie SEO.
