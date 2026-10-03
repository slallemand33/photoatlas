=== INVESTIGATION BANC D'ARGUIN ===

### Relation pilote

relation/2244863

- Type OSM : relation
- Id : 2244863
- Tags observés :
  - name = Banc d'Arguin
  - natural = sand
  - type = multipolygon
  - CLC:code = 331
  - CLC:id = FR-261034
  - CLC:year = 2006
- Nom : Banc d'Arguin
- name:fr : absent sur la relation
- official_name : absent
- Géométrie : multipolygon
- Nature de la géométrie : surface
- Membres identifiés :
  - way/42726876, rôle outer
  - way/4543353, rôle outer

Lecture : la relation pilote représente explicitement une entité surfacique nommée Banc d'Arguin, avec `natural=sand`.

### Objet catalogue

way/42726876

- Type OSM : way
- Id : 42726876
- Tags observés :
  - name = Banc d'Arguin
  - name:fr = Banc d'Arguin
  - name:en = Banc d'Arguin
  - name:ar = حوض أركين
  - natural = coastline
- Géométrie : LineString dans l'export géométrique; utilisé comme anneau externe dans la relation multipolygon
- Nature de la géométrie : ligne / limite
- Position éditoriale actuelle : 44.5700806, -1.2561434

Lecture : le way catalogue n'est pas la surface du banc; il représente une ligne de côte nommée qui sert aussi de bord externe à la relation surfacique.

### Géométrie

relation/2244863 :

- Géométrie exportée : MultiPolygon
- bbox :
  - minLon = -1.2650371
  - minLat = 44.5644828
  - maxLon = -1.2199652
  - maxLat = 44.6048601
- centre de bbox approximatif : 44.58467145, -1.24250115

way/42726876 :

- Géométrie exportée : LineString
- bbox :
  - minLon = -1.2561434
  - minLat = 44.5644828
  - maxLon = -1.2199652
  - maxLat = 44.6016981
- centre de bbox approximatif : 44.58309045, -1.2380543

Réserve naturelle du Banc d'Arguin, way/65711371 :

- Géométrie exportée : LineString dans l'objet way, MultiPolygon dans l'export surfacique
- bbox :
  - minLon = -1.2994477
  - minLat = 44.5457970
  - maxLon = -1.2095809
  - maxLat = 44.6136161
- centre de bbox approximatif : 44.57970655, -1.2545143

Lecture : la relation 2244863 et le way 42726876 se recouvrent géographiquement. La réserve naturelle est plus large et volontairement tracée large selon son propre tag `note`.

### Distance

Coordonnées du pilote :

- 44.5829443
- -1.2384633

Coordonnées éditoriales :

- 44.5700806
- -1.2561434

Écart pilote vs éditorial : environ 2002 m.

Distances vers les centres géométriques observés :

- pilote -> centre bbox du way/42726876 : environ 36 m
- pilote -> centre bbox de la relation/2244863 : environ 373 m
- pilote -> centre bbox de la réserve naturelle : environ 1321 m
- éditorial -> centre bbox du way/42726876 : environ 2036 m
- éditorial -> centre bbox de la relation/2244863 : environ 1949 m
- éditorial -> centre bbox de la réserve naturelle : environ 1078 m

Lecture : la position pilote est proche du centre géométrique du way nommé et reste cohérente avec la relation surfacique. La position éditoriale correspond à l'extrémité sud-ouest d'un segment du way, pas à un point représentatif central de l'ensemble.

### Relations

- way/42726876 est membre direct de relation/2244863, rôle `outer`.
- way/4543353 est aussi membre direct de relation/2244863, rôle `outer`.
- relation/2244863 est donc construite à partir du way catalogue et d'un second way nommé `Banc d'Arguin Ouest`.
- La réserve naturelle liée au secteur est un objet distinct : way/65711371, avec `boundary=protected_area` et `leisure=nature_reserve`.

Conclusion relationnelle : le way catalogue n'est pas indépendant de la relation pilote; il en est un composant direct.

### Autres représentations OSM

Objets pertinents identifiés dans le PBF autour d'Arguin :

- relation/2244863, `name=Banc d'Arguin`, `natural=sand`, multipolygon
- way/42726876, `name=Banc d'Arguin`, `natural=coastline`
- way/4543353, `name=Banc d'Arguin Ouest`, `natural=coastline`
- way/65711371, `name=Réserve naturelle du Banc d'Arguin`, `boundary=protected_area`, `leisure=nature_reserve`, `ref:FR:INPN=FR3600005`

Lecture : les représentations pertinentes ne décrivent pas toutes la même chose. Le way 42726876 décrit une limite côtière nommée, la relation 2244863 décrit la surface sableuse, et la réserve naturelle décrit un périmètre de protection plus large.

### Réserve naturelle

Objet identifié : way/65711371

- name = Réserve naturelle du Banc d'Arguin
- boundary = protected_area
- leisure = nature_reserve
- protect_class = 4
- protection_title = Réserve naturelle nationale
- ref:FR:INPN = FR3600005
- note = contour volontairement large pour suivre l'évolution naturelle du banc

Conclusion : la réserve naturelle et le banc sont des entités distinctes mais liées.

- Le banc = entité géographique sableuse nommée
- La réserve = périmètre de protection plus large et volontairement élargi

### Identité

Réponse : B

Le même ensemble géographique, mais deux sous-entités différentes.

Justification :

- relation/2244863 représente le Banc d'Arguin comme surface `natural=sand`
- way/42726876 représente une limite côtière nommée `natural=coastline`
- way/42726876 est membre direct de la relation
- les bbox se recouvrent totalement
- la réserve naturelle est encore une troisième entité, plus large

### Meilleure représentation PhotoAtlas

Pour un type PhotoAtlas attendu `sandbank`, la meilleure représentation est la relation/2244863.

Justification :

- elle porte le tag sémantique le plus cohérent : `natural=sand`
- elle représente une surface, pas une simple ligne de côte
- elle agrège explicitement les deux bords externes du banc
- elle est plus adaptée à une destination géographique qu'un segment de coastline

Le way/42726876 reste utile comme composant géométrique, mais pas comme représentation principale d'un `sandbank`.

### Coordonnées recommandées

Coordonnées recommandées : conserver les coordonnées existantes du pilote.

Raison :

- elles sont proches du centre géométrique du way nommé `Banc d'Arguin`
- elles restent aussi relativement proches du centre de bbox de la relation `natural=sand`
- les coordonnées éditoriales actuelles correspondent à un nœud périphérique du way, situé sur le bord sud-ouest, et non à un point représentatif central

### Justification

L'écart n'est pas un simple artefact arbitraire de centroïde.

- La relation pilote et le way catalogue ne sont pas la même géométrie au sens strict.
- Ils appartiennent au même ensemble géographique, mais décrivent deux niveaux différents : surface sableuse contre ligne de côte.
- La coordonnée éditoriale actuelle reprend un sommet de la ligne de côte : -1.2561434 / 44.5700806, visible comme nœud du way 42726876.
- La coordonnée pilote 44.5829443 / -1.2384633 est beaucoup plus représentative de l'ensemble investigué.

### Décision technique

KEEP_EXISTING

La meilleure recommandation technique est de conserver la représentation pilote existante pour l'import, sans basculer vers la coordonnée éditoriale actuelle et sans remplacer automatiquement la géométrie de référence.