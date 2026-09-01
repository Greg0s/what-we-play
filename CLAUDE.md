# a-quoi-on-joue (What we play?)

Site front-end qui recense des jeux en ligne (solo ou multi) pour aider à trouver rapidement quoi jouer selon le nombre de joueurs. Déployé sur GitHub Pages : https://whatweplay.gregoiretinn.es/

## Stack

- React 19 + TypeScript + Vite
- Sass (`sass-embedded`) pour le style
- **Gestionnaire de paquets : pnpm** (pas npm/yarn — le lockfile est `pnpm-lock.yaml`)

## Commandes

```bash
pnpm install      # installer les dépendances
pnpm run dev      # serveur de dev (http://localhost:5173)
pnpm run build    # build de prod (tsc -b && vite build) dans dist/
pnpm run lint     # ESLint
pnpm run preview  # prévisualiser le build
```

## Structure

- `src/games.json` — la liste des jeux (source de données). Chaque entrée : `name`, `description`, `minPlayers`, `maxPlayers` (`-1` = pas de max), `link`.
- `src/components/` — `Game` (carte d'un jeu), `Games` (liste filtrée), `HowMany` (sélecteur du nombre de joueurs), `Title`.
- `src/App.tsx` — assemble le tout, gère l'état du nombre de joueurs et le filtrage.

## Workflow Git

`main` se déploie automatiquement en prod (pas de preview). On travaille donc toujours sur une branche de feature, avec une Pull Request avant de merger dans `main`.

## Déploiement

Automatique via [.github/workflows/deploy.yml](.github/workflows/deploy.yml) : tout push sur `main` déclenche un build et un déploiement sur GitHub Pages. Pas de branche de review/preview — `main` est déployé directement.

## Fonctionnalités prévues (voir README)

- Filtres (mobile friendly / gratuit / sans téléchargement)
- Images pour les jeux
- Ajout de nouveaux jeux
