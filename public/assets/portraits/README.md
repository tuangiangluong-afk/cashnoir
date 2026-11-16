# Portraits d'archétypes

Dépose ici **5 PNG à fond transparent**, avec exactement ces noms :

| Fichier          | Archétype du jeu                              |
| ---------------- | --------------------------------------------- |
| `paris.png`      | Accro aux paris en panique (03h du mat')      |
| `cadre.png`      | Cadre sup' en sueur, costard froissé          |
| `flic.png`       | Flic ou indic trop propre sur lui (+ pièges)  |
| `fils-a-papa.png`| Fils à papa ruiné, arrogant                   |
| `courtier.png`   | Courtier de nuit, froid et pressé             |

## Cadrage

- **900 × 1100 px** conseillé (ratio ≈ 0.82), **buste coupé à la taille**.
- Le sujet doit **toucher le bas de l'image** : la scène l'aligne sur le comptoir.
- Fond transparent, pas d'ombre portée (la scène gère la lumière).
- Style visé : gravure / comic noir (Sin City, Max Payne) — forte masse noire, contre-jour.

## Comportement

- Le fichier est chargé à chaque nouveau client (`/assets/portraits/<clé>.png`).
- **S'il manque ou est illisible, la silhouette SVG est utilisée automatiquement** — aucun écran cassé, aucune erreur visible.
- Un fichier raté n'est pas redemandé avant le prochain rechargement de la page.
- La respiration et le halo coloré (colère / peur / piège / deal) s'appliquent aussi au PNG.
