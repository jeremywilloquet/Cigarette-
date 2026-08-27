# Clopes — compteur du jour

Petite app iPhone pour suivre ses cigarettes : tu fixes un objectif quotidien, et
tu décomptes à chaque cigarette fumée. Le compteur repart à zéro tous les jours à
minuit.

Pas d'App Store, pas de compte, pas de serveur : c'est une app web installable
qui s'ajoute à l'écran d'accueil et fonctionne hors connexion. Les données
restent dans le navigateur du téléphone.

## L'installer sur l'iPhone

1. Ouvrir **https://jeremywilloquet.github.io/Cigarette-/** dans **Safari**
   (l'ajout à l'écran d'accueil ne marche pas depuis Chrome sur iOS).
2. Bouton **Partager** (le carré avec la flèche, en bas de l'écran).
3. **Sur l'écran d'accueil** → **Ajouter**.

L'icône apparaît avec les autres apps. Ouverte depuis là, elle s'affiche en plein
écran, sans barre d'adresse, et marche même sans réseau.

> Pour que l'adresse fonctionne, GitHub Pages doit être activé sur le dépôt.
> Le chemin, avec les libellés de l'interface GitHub (en anglais) :
>
> 1. Onglet **Settings** du dépôt
> 2. Menu de gauche, sous **Code and automation** → **Pages**
> 3. **Build and deployment** → **Source** : **Deploy from a branch**
> 4. **Branch** : choisir la branche (`main` ou
>    `claude/ios-cigarette-counter-app-gagjsh`), garder **`/ (root)`** → **Save**
>
> Le premier déploiement prend une minute ou deux, puis un bandeau affiche
> *« Your site is live at … »*.

## Utilisation

- **J'en fume une** — enregistre une cigarette et décrémente le compteur.
- **Annuler la dernière** — en cas de faux appui.
- **Icône graphique** — ouvre les résultats détaillés (le mini-graphe du bas y
  mène aussi).
- **Roue crantée** — règle l'objectif quotidien (0 à 60), remet la journée à
  zéro, ou efface l'historique.

L'anneau se remplit au fil de la journée et change de couleur : vert, puis orange
quand il reste peu de marge, puis rouge au-delà de l'objectif. Sous le compteur,
les 14 derniers jours en barres, avec l'objectif en pointillés.

### Résultats

Sur 7, 30 ou 90 jours :

- **total**, **moyenne par jour**, **jours passés dans l'objectif** et
  **tendance** par rapport à la période précédente de même durée ;
- un histogramme **par jour**, objectif en pointillés ;
- une répartition **par heure**, qui fait ressortir l'heure de pic ;
- le **détail jour par jour**, avec l'écart à l'objectif.

Deux partis pris à connaître pour lire ces chiffres :

- les jours antérieurs au premier enregistrement sont exclus, sinon ils
  compteraient comme des journées à zéro et fausseraient les moyennes ;
- l'écart à l'objectif utilise l'objectif **actuel**, y compris sur les jours
  passés — les objectifs précédents ne sont pas conservés.

Un objectif à **0** est valide : utile pour une phase d'arrêt complet, où toute
cigarette compte comme un écart.

## Où sont les données

Dans le `localStorage` du navigateur, sous la clé `cigarette.v1` :

```json
{ "goal": 10, "log": { "2026-07-29": [1785300494613, 1785301203114] } }
```

Un horodatage par cigarette, ce qui permet d'afficher le temps écoulé depuis la
dernière. Rien ne sort du téléphone — il n'y a aucun serveur derrière l'app.

En contrepartie : effacer les données de navigation de Safari efface aussi
l'historique, et celui-ci ne se synchronise pas entre appareils.

## Structure

| Fichier                 | Rôle                                                     |
| ----------------------- | -------------------------------------------------------- |
| `index.html`            | Toute l'app — balisage, styles et logique dans un fichier |
| `manifest.webmanifest`  | Nom, icônes et affichage plein écran une fois installée   |
| `sw.js`                 | Service worker : mise en cache pour le mode hors ligne    |
| `icons/`                | Icônes d'écran d'accueil (générées)                       |
| `tools/make-icons.py`   | Régénère les icônes (`pip install pillow`)                |
| `marge/`                | Deuxième app : le calculateur de marge BOTTI FRUIT        |

## Développement

```sh
python3 -m http.server 8000   # puis http://localhost:8000
```

Un vrai serveur HTTP est nécessaire : ouvrir le fichier en `file://` empêche
l'enregistrement du service worker.

Après modification d'`index.html`, penser à incrémenter `CACHE` dans `sw.js`
(`clopes-v1` → `clopes-v2`) pour que les téléphones déjà équipés récupèrent la
nouvelle version.

## Autre app dans ce dépôt

`marge/` contient le **calculateur de marge BOTTI FRUIT** : même principe — une
page web installable sur l'écran d'accueil, tout en local — mais pour calculer
un prix de vente au stand des Halles.

- **https://jeremywilloquet.github.io/Cigarette-/marge/**
- Détails et formules : [`marge/README.md`](marge/README.md)

Les deux apps sont indépendantes : elles ont leur propre service worker, leur
propre cache et leur propre stockage.

Elles partagent en revanche la même origine, donc le même espace de caches. Les
deux service workers sont écrits en conséquence : chacun ne supprime que ses
propres anciens caches (préfixés `clopes-` et `marge-`), et ne répond qu'aux
navigations vers sa propre page. Sans ces deux règles, ouvrir une app ferait
perdre à l'autre son mode hors ligne.
