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

Le prix d'achat est **toujours saisi au kilo**. En mode portion, il est ramené au
poids servi :

```
PA matière   = prix d'achat au kg × (poids portion / 1000)
PA HT total  = PA matière + main d'œuvre + emballage
```

Puis, selon la méthode choisie :

| Méthode        | Formule                                  |
| -------------- | ---------------------------------------- |
| Coefficient    | `PV HT = PA HT total × coefficient`       |
| Taux de marque | `PV HT = PA HT total / (1 − taux / 100)`  |
| Prix visé      | `PV HT = PV TTC visé / (1 + TVA / 100)`   |

L'**arrondi psychologique** monte le prix TTC à la finale `,90` supérieure
(8,32 € → 8,90 € ; 8,95 € → 9,90 €). Quand il est actif, la marge, le taux de
marque et le coefficient sont recalculés **sur le prix arrondi** : ce sont les
chiffres du prix réellement affiché en boutique, pas ceux du prix théorique.

Les cas limites ne cassent rien : champs vides, taux de marque à 100 % ou plus,
portion de 0 g, TVA à 0 % — le prix retombe à `0,00 €` plutôt que sur une erreur.

## Les alertes

| Situation                           | Badge  |
| ----------------------------------- | ------ |
| Mode kilo et coefficient réel < ×2   | Orange |
| Coefficient réel entre ×2,5 et ×3,5  | Vert   |
| Sinon, taux de marque réel < 25 %    | Orange |
| Sinon                                | Vert   |

## Où sont les données

Dans le `localStorage` du navigateur, sous la clé `botti.marge.v1` : un tableau
de produits, le plus récent en premier.

```json
[{ "name": "Fraises gariguette", "unit": "kg", "priceTTC": 8.9, "coefficient": 2.56 }]
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
