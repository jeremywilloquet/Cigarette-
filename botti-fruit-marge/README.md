# BOTTI FRUIT — calculateur de marge

App iPhone pour calculer un prix de vente au stand du Marché Couvert des Halles,
à Chambéry. On saisit le prix d'achat, la main d'œuvre et l'emballage, on choisit
une méthode (coefficient, taux de marque ou prix visé), et le prix TTC s'affiche
en direct sur une étiquette, avec la décomposition complète et une alerte quand
la marge n'y est pas.

Pas de compte, pas de serveur : tout le calcul et la liste des produits restent
sur le téléphone.

## Lancer l'app

Depuis ce dossier :

```sh
npm install       # installer les dépendances
npx expo start    # démarrer le serveur de développement
```

Un QR code s'affiche dans le terminal. Sur l'iPhone :

1. installer **Expo Go** depuis l'App Store ;
2. ouvrir l'app **Appareil photo** et viser le QR code ;
3. toucher la notification qui apparaît — l'app s'ouvre dans Expo Go.

Le téléphone et l'ordinateur doivent être sur le même réseau Wi-Fi. Si le réseau
bloque la connexion (Wi-Fi public, réseau d'entreprise), lancer
`npx expo start --tunnel` à la place.

Aucun Mac n'est nécessaire : Expo Go suffit pour utiliser l'app au quotidien.

## Ce que fait le calcul

Le prix d'achat est **toujours saisi au kilo**. En mode portion, il est ramené au
poids servi :

```
PA matière   = prix d'achat au kg × (poids portion / 1000)
PA HT total  = PA matière + main d'œuvre + emballage
```

Puis, selon la méthode :

| Méthode        | Formule                                       |
| -------------- | --------------------------------------------- |
| Coefficient    | `PV HT = PA HT total × coefficient`            |
| Taux de marque | `PV HT = PA HT total / (1 − taux / 100)`       |
| Prix visé      | `PV HT = PV TTC visé / (1 + TVA / 100)`        |

L'**arrondi psychologique** monte le prix TTC à la finale `,90` supérieure
(8,32 € → 8,90 € ; 8,95 € → 9,90 €). Quand il est actif, la marge, le taux de
marque et le coefficient sont recalculés **sur le prix arrondi** : ce sont les
chiffres du prix réellement affiché en boutique, pas ceux du prix théorique.

Les cas limites ne cassent rien : champs vides, taux de marque à 100 % ou plus,
portion de 0 g, TVA à 0 % — le prix retombe à `0,00 €` plutôt que sur une erreur.

## Les alertes

| Situation                                      | Badge   |
| ---------------------------------------------- | ------- |
| Mode kilo et coefficient réel < ×2              | Orange  |
| Coefficient réel entre ×2,5 et ×3,5             | Vert    |
| Sinon, taux de marque réel < 25 %               | Orange  |
| Sinon                                           | Vert    |

## La liste des produits

Le bouton **Ajouter** enregistre le calcul en cours (nom, unité, prix d'achat
détaillé, PV HT et TTC, coefficient, taux de marque, date) dans le stockage local
du téléphone, via AsyncStorage. La liste survit à la fermeture complète de l'app.
La croix rouge supprime une ligne.

## Structure

| Fichier                          | Rôle                                              |
| -------------------------------- | ------------------------------------------------- |
| `App.tsx`                        | L'écran unique : état, saisie, assemblage          |
| `src/theme.ts`                   | Palette, polices, espacements                      |
| `src/lib/calc.ts`                | Les formules et l'arrondi psychologique            |
| `src/lib/format.ts`              | Nombres à la française, saisie au clavier décimal   |
| `src/lib/alerts.ts`              | Lecture métier du résultat                         |
| `src/lib/storage.ts`             | Lecture / écriture de la liste (AsyncStorage)      |
| `src/components/PriceTag.tsx`    | L'étiquette de prix suspendue                      |
| `src/components/ComparisonList.tsx` | La liste comparative et ses suppressions        |
| `src/components/`                | `Card`, `SegmentedControl`, `InputField`, `AlertBadge` |

Les polices (Fraunces, IBM Plex Mono, Inter) sont importées graisse par graisse
plutôt que depuis la racine des paquets `@expo-google-fonts` : la racine embarque
les 51 variantes (~9 Mo) alors que huit suffisent.

## Développement

```sh
npx tsc --noEmit                  # vérification des types
npx expo export --platform ios    # vérifier que le bundle se construit
```
