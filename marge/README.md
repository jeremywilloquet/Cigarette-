# BOTTI FRUIT — calculateur de marge

Calculateur de prix de vente pour le stand du Marché Couvert des Halles, à
Chambéry. On saisit le prix d'achat, la main d'œuvre et l'emballage, on choisit
une méthode, et le prix TTC s'affiche en direct sur une étiquette, avec la
décomposition complète et une alerte quand la marge n'y est pas.

Comme le compteur de cigarettes du dépôt : pas d'App Store, pas de compte, pas
de serveur. C'est une app web installable qui s'ajoute à l'écran d'accueil et
fonctionne hors connexion.

## L'installer sur l'iPhone

1. Ouvrir **https://jeremywilloquet.github.io/Cigarette-/marge/** dans **Safari**
   (l'ajout à l'écran d'accueil ne marche pas depuis Chrome sur iOS).
2. Bouton **Partager** (le carré avec la flèche, en bas de l'écran).
3. **Sur l'écran d'accueil** → **Ajouter**.

> L'adresse ne répondra qu'une fois ce dossier présent sur la branche que
> GitHub Pages publie. Le réglage est dans **Settings** → **Pages**.

## Le calcul

Tout part de ce qui est **réellement produit**, pas de ce qui est acheté. Avec
4 kg d'avocats on ne fait pas 4 kg de guacamole mais 3,2 : c'est sur 3,2 que la
marge se calcule.

Puis le lot se répartit entre les **formats de conditionnement**. Chaque unité
vendue emporte sa part du lot — son poids rapporté à la production — donc sa
part de matière et de main d'œuvre. Le contenant, lui, se paie entier à chaque
unité.

```
coût matière du lot = Σ (quantité × prix) de chaque ingrédient
part d'une unité    = poids du format / quantité produite
contenant par unité = (nombre de boîtes × prix d'une boîte) / nombre d'unités
revient d'une unité = (matière + main d'œuvre) × sa part + son contenant
```

Le **nombre de boîtes** se remplit tout seul avec le nombre d'unités : une
barquette par portion. Il ne se renseigne que quand les deux diffèrent — un
couvercle vendu à part (deux boîtes par unité), un double emballage, de la
casse, ou une partie vendue en vrac.

C'est ce qui fait qu'**une barquette de 100 g ne revient pas à la moitié d'une
barquette de 200 g** : à 0,20 €, le contenant pèse 1 €/kg sur du 200 g et
2 €/kg sur du 100 g. Aucun « prix d'emballage au kilo » ne peut être juste pour
les deux à la fois — d'où la saisie par format.

La main d'œuvre se saisit **pour tout le lot** (répartie au prorata du poids) ou
**par unité vendue**. Les ingrédients se cumulent, chacun dans l'unité de sa
facture — au kilo, au litre ou à la pièce ; les grammes et les millilitres sont
ramenés tout seuls au prix de référence.

La production se compte **en kilos** ou **en pièces**. En pièces, un format n'a
pas de poids : une pièce est une pièce.

Pour vendre **au kilo**, il suffit d'un format de 1 000 g sans contenant : son
nombre est alors le nombre de kilos vendus en vrac, et l'étiquette affiche le
prix au kilo. Un même lot peut donc partir moitié en bouteilles, moitié au
kilo.

Si la répartition ne tombe pas juste, l'app le dit : ce qui reste non
conditionné pèse sur la marge du lot, ce qui est le comportement voulu.

Puis, selon la méthode choisie :

| Méthode        | Formule                                       |
| -------------- | --------------------------------------------- |
| Coefficient    | `PV HT = revient × coefficient`                |
| Taux de marque | `PV HT = revient / (1 − taux / 100)`           |
| Prix visé      | `PV HT = PV TTC visé / (1 + TVA / 100)`        |

Coefficient et taux de marque s'appliquent à tous les formats ; le prix visé se
saisit format par format, puisqu'il n'a de sens que pour un format donné.

L'**arrondi psychologique** monte chaque prix TTC à la finale `,90` supérieure
(8,32 € → 8,90 € ; 8,95 € → 9,90 €). Quand il est actif, la marge, le taux de
marque et le coefficient sont recalculés **sur le prix arrondi** : ce sont les
chiffres du prix réellement affiché en boutique.

L'app affiche **une étiquette par format**, puis un récapitulatif du lot entier :
coût de revient total, chiffre d'affaires et marge réelle.

Les cas limites ne cassent rien : champs vides, quantité produite à zéro, taux de
marque à 100 % ou plus, TVA à 0 % — le prix retombe à `0,00 €`. Sans quantité
produite, aucun prix n'est affiché, même si le contenant est déjà connu : il
ignorerait la matière.

### Un exemple

| | |
| --- | --- |
| Avocats | 4 kg à 9,50 €/kg = 38,00 € |
| Citrons verts | 6 pièces à 0,40 € = 2,40 € |
| Coriandre | 60 g à 18,00 €/kg = 1,08 € |
| **Coût matière** | **41,48 €** |
| Production | 3,2 kg — rendement 80 % |
| Main d'œuvre | 20,00 € pour le lot |
| 10 barquettes de 200 g | 10 boîtes à 0,20 € — revient 4,04 € → **10,66 € TTC** |
| 12 barquettes de 100 g | 12 boîtes à 0,20 € — revient 2,12 € → **5,59 € TTC** |
| Coût de revient total | 65,88 € |
| Chiffre d'affaires HT | 164,70 € |
| **Marge sur la production** | **98,82 €** |

## Les alertes

| Situation                           | Badge  |
| ----------------------------------- | ------ |
| Mode kilo et coefficient réel < ×2   | Orange |
| Coefficient réel entre ×2,5 et ×3,5  | Vert   |
| Sinon, taux de marque réel < 25 %    | Orange |
| Sinon                                | Vert   |

## Où sont les données

Dans le `localStorage` du navigateur, sous la clé `botti.marge.v2` : un tableau
de produits, le plus récent en premier, recette et formats compris.

```json
[{ "name": "Guacamole", "produced": 3.2, "producedUnit": "kg",
   "batchCost": 65.88, "batchMargin": 98.82,
   "formats": [{ "label": "Barquette 200 g", "count": 10, "priceTTC": 10.66 }],
   "ingredients": [{ "name": "Avocats", "qty": "4", "unit": "kg", "price": "9,50" }] }]
```

Rien ne sort du téléphone. En contrepartie : effacer les données de navigation
de Safari efface aussi la liste, et celle-ci ne se synchronise pas entre
appareils.

## Structure

| Fichier                        | Rôle                                                     |
| ------------------------------ | -------------------------------------------------------- |
| `index.html`                   | Toute l'app — balisage, styles et logique dans un fichier |
| `manifest.webmanifest`         | Nom, icônes et affichage plein écran une fois installée   |
| `sw.js`                        | Service worker : cache pour le mode hors ligne            |
| `icons/`                       | Icônes d'écran d'accueil (générées)                       |
| `../tools/make-marge-icons.py` | Régénère les icônes (`pip install pillow`)                |

Les polices (Fraunces pour les titres et le prix, IBM Plex Mono pour les
chiffres, Inter pour le texte) viennent de Google Fonts. Le service worker les
garde en cache après le premier chargement, et une pile de polices système prend
le relais si elles ne se chargent pas.

## Développement

```sh
python3 -m http.server 8000   # puis http://localhost:8000/marge/
```

Un vrai serveur HTTP est nécessaire : ouvrir le fichier en `file://` empêche
l'enregistrement du service worker.

Après modification d'`index.html`, penser à incrémenter `CACHE` dans `sw.js`
(`marge-v1` → `marge-v2`) pour que les téléphones déjà équipés récupèrent la
nouvelle version.
