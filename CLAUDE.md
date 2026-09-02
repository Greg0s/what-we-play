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

Pas de suite de tests dans ce repo.

## Structure

- `src/games.json` — la liste des jeux (source de données), sans texte traduisible. Chaque entrée : `id`, `name`, `minPlayers`, `maxPlayers` (`-1` = pas de max), `link`.
- `src/i18n/` — internationalisation (voir section dédiée ci-dessous).
- `src/components/` — `Game` (carte d'un jeu), `Games` (liste filtrée par nombre de joueurs), `LanguageSwitcher` (sélecteur de langue).
- `src/App.tsx` — assemble le tout, gère l'état du nombre de joueurs et le rend via `Games`.
- `src/stylesheets/` — styles Sass partagés (variables, styles des jeux, du switcher de langue).

## Internationalisation (i18n)

Le site est disponible en **anglais**, **français** et **espagnol** (`src/i18n/locales/`). `en.ts` est la locale de référence : **le build échoue** si une autre locale manque une clé. Les descriptions des jeux sont dans les fichiers de locale (indexées par le `id` du jeu dans `games.json`) et retombent sur l'anglais si la traduction manque.

Pour ajouter une langue : voir la section "Adding a language" du [README](README.md).

## Workflow Git

`main` se déploie automatiquement en prod (pas de preview). On travaille donc toujours sur une branche de feature, avec une Pull Request avant de merger dans `main`.

## Déploiement

Automatique via [.github/workflows/deploy.yml](.github/workflows/deploy.yml) : tout push sur `main` déclenche un build et un déploiement sur GitHub Pages via pnpm/Node 24. Pas de branche de review/preview — `main` est déployé directement.

## Fonctionnalités prévues (voir README)

- Filtres (mobile friendly / gratuit / sans téléchargement)
- Images pour les jeux
- Ajout de nouveaux jeux
