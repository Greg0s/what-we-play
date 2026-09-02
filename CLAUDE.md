# a-quoi-on-joue (What we play?)

Front-end site listing online games (solo or multiplayer) to help quickly find something to play based on the number of players. Deployed on GitHub Pages: https://whatweplay.gregoiretinn.es/

## Stack

- React 19 + TypeScript + Vite
- Sass (`sass-embedded`) for styling
- **Package manager: pnpm** (not npm/yarn — the lockfile is `pnpm-lock.yaml`)

## Commands

```bash
pnpm install      # install dependencies
pnpm run dev      # dev server (http://localhost:5173)
pnpm run build    # production build into dist/, prerendered (see Rendering)
pnpm run lint     # ESLint
pnpm run preview  # preview the build
```

No test suite in this repo.

## Structure

- `src/games.json` — the list of games (data source), with no translatable text. Each entry: `id`, `name`, `minPlayers`, `maxPlayers` (`-1` = no max), `link`.
- `src/games.ts` — typed access to that data: the `Game` type, `DEFAULT_PLAYERS`, and the player-count filter. Both the app and the prerender go through it, so they can never disagree on what belongs on a page.
- `src/i18n/` — internationalization (see dedicated section below).
- `src/components/` — `Game` (a game's card), `Games` (list filtered by player count), `LanguageSwitcher` (language selector).
- `src/App.tsx` — wires everything together, holds the player-count state and renders it via `Games`.
- `src/entry-server.tsx` — build-time entry point: renders the app to HTML.
- `scripts/prerender.js` — injects that HTML into `dist/index.html` after `vite build`.
- `src/stylesheets/` — shared Sass styles (variables, game styles, language switcher styles).

## Rendering

The site is prerendered at build time and hydrated in the browser. `pnpm run build`
runs three steps: the client build, an SSR build of `src/entry-server.tsx` into
`dist-ssr/`, then `scripts/prerender.js`, which renders the page and writes the
markup into `dist/index.html`. The build fails if that markup does not reach the
file, so an empty page cannot ship unnoticed.

This matters because GitHub Pages serves files only, and crawlers that do not run
JavaScript — every generative engine among them — would otherwise receive an empty
`<div id="root">`. See [docs/seo-geo-audit.md](docs/seo-geo-audit.md).

Two constraints follow, and breaking either is silent:

- **Nothing browser-only during render.** `navigator`, `window` and `localStorage`
  do not exist at build time, and reading them while rendering makes the client
  disagree with the prerendered HTML. Put that work in an effect, the way
  `LanguageProvider` detects the language.
- **The page is prerendered in English at `DEFAULT_PLAYERS`.** That is the state
  the first client render has to reproduce; it then switches to the visitor's
  language in a layout effect, before the first paint.

## Internationalization (i18n)

The site is available in **English**, **French** and **Spanish** (`src/i18n/locales/`). `en.ts` is the reference locale: **the build fails** if another locale is missing a key. Game descriptions live in the locale files (keyed by the game's `id` in `games.json`) and fall back to English when a translation is missing.

To add a language: see the "Adding a language" section of the [README](README.md).

## Git Workflow

`main` deploys automatically to production (no preview). Work is therefore always done on a feature branch, with a Pull Request before merging into `main`.

## Deployment

Automatic via [.github/workflows/deploy.yml](.github/workflows/deploy.yml): every push to `main` triggers a build and deployment to GitHub Pages via pnpm/Node 24. No review/preview branch — `main` is deployed directly.

## Planned features (see README)

- Filters (mobile friendly / free / no download)
- Game images
- Adding new games
