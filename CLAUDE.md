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
pnpm run check    # audit the built dist/ (canonical, hreflang, JSON-LD, sitemap)
pnpm run lint     # ESLint
pnpm run preview  # preview the build
```

No test suite in this repo.

## Structure

- `src/games.json` — the list of games (data source), with no translatable text. Each entry: `id`, `name`, `minPlayers`, `maxPlayers` (`-1` = no max), `link`.
- `src/games.ts` — typed access to that data: the `Game` type, `DEFAULT_PLAYERS`, and the player-count filter. Both the app and the prerender go through it, so they can never disagree on what belongs on a page.
- `src/i18n/` — internationalization (see dedicated section below).
- `src/components/` — `Game` (a game's card), `Games` (list filtered by player count), `LanguageSwitcher` (language selector), `PlayerCountNav` (links to the player-count pages), `Faq` (landing pages only).
- `src/App.tsx` — wires everything together, holds the route state (player count and whether this is a landing page) and keeps the URL in step with it.
- `src/routes.ts` — the URL scheme: which path each language and player count gets, how to parse one back, and the full list the build generates.
- `src/pageMeta.ts` — title and description of a page, used by both the build and the browser so they cannot drift.
- `src/structuredData.ts` — the JSON-LD each page carries, built from `games.json` and the locales.
- `src/entry-server.tsx` — build-time entry point: renders the app to HTML.
- `scripts/prerender.js` — injects that HTML into `dist/index.html` after `vite build`.
- `scripts/check-seo.js` — reads the built `dist/` back and fails the build on a broken canonical, non-reciprocal `hreflang`, duplicate title, unparseable JSON-LD, page missing from the sitemap, or a page that rendered no games.
- `src/stylesheets/` — shared Sass styles (variables, game styles, language switcher styles).

## Rendering

The site is prerendered at build time and hydrated in the browser. `pnpm run build`
runs three steps: the client build, an SSR build of `src/entry-server.tsx` into
`dist-ssr/`, then `scripts/prerender.js`, which renders every route and writes it
to `dist/<path>/index.html`, along with `sitemap.xml` and `llms.txt`. The build
fails if a page's games do not reach its file, so an empty page cannot ship
unnoticed, and then `scripts/check-seo.js` re-reads the output and fails on any
broken SEO invariant. That check deliberately inspects the files rather than
importing the code that wrote them: a check that re-derives its expectations
from the generator agrees with it even when both are wrong.

This matters because GitHub Pages serves files only, and crawlers that do not run
JavaScript — every generative engine among them — would otherwise receive an empty
`<div id="root">`. See [docs/seo-geo-audit.md](docs/seo-geo-audit.md).

Two constraints follow, and breaking either is silent:

- **Nothing browser-only during render.** `navigator`, `window` and `localStorage`
  do not exist at build time, and reading them while rendering makes the client
  disagree with the prerendered HTML. Put that work in an effect, the way
  `LanguageProvider` detects the language.
- **The first client render must reproduce the page's URL.** `main.tsx` parses
  the path and passes the route down; anything that makes the browser start from
  a different state than the build used will break hydration.

## URLs

One page per language and per player count — 33 in all, listed by `allRoutes()`
in `src/routes.ts`:

| Language | Landing | Player count |
| --- | --- | --- |
| English | `/` | `/games-for-4-players/` |
| French | `/fr/` | `/fr/jeux-a-4-joueurs/` |
| Spanish | `/es/` | `/es/juegos-para-4-jugadores/` |

English is unprefixed and is the `x-default` target. Each page carries a
self-referencing canonical and reciprocal `hreflang` annotations, both generated
from `src/routes.ts`, so adding a language or a player count updates every page
and the sitemap at once.

`vite.config.ts` therefore sets `base: "/"`: a relative base would resolve
`./assets/…` against `/fr/` and 404.

In the browser, a prefixed URL states the language and wins outright. Only the
unprefixed pages fall back to the visitor's own preference, and that redirect
uses `replaceState` so Back does not bounce between `/` and `/fr/`. Player-count
links are real anchors — they work without JavaScript and are what crawlers
follow — upgraded to in-place navigation when JavaScript is available. The
counter itself uses `replaceState`, since pushing one history entry per keystroke
would make Back unusable.

## Structured data

Every page carries JSON-LD from `src/structuredData.ts`, written into the static
HTML — the engines it is meant for do not run JavaScript, so injecting it at
runtime would be pointless.

Each page gets a `CollectionPage` wrapping an `ItemList` of `VideoGame`. The
vocabulary fits the data exactly: `numberOfPlayers` is a `QuantitativeValue`, and
`maxPlayers: -1` is expressed by *omitting* `maxValue` rather than by inventing a
number. Landing pages add `WebSite` and `FAQPage`; player-count pages add a
`BreadcrumbList`.

`dateModified` comes from the last commit touching `src/games.json` or
`src/i18n/locales` — not from the build clock, which would move on every deploy
and mean nothing. If git cannot answer, the field is omitted rather than guessed,
which is why the deploy workflow checks out with `fetch-depth: 0`.

Claims in the copy and in the markup (`isAccessibleForFree`, "nothing to
install") are the ones the README makes about the catalogue. If that stops being
true of every game, both the FAQ answers and `isAccessibleForFree` have to change.

## Performance

Two things here are easy to undo by accident:

- **The Google Fonts request lists only the weights the stylesheets apply** (600
  and 700, no italic). Widening it back to `ital,wght@0,100..900;1,100..900`
  costs 133 kB of latin subsets against 79 kB — measured, not estimated. Counter
  to intuition, a narrow *variable* range (`400..700`) beats naming static
  instances (`600;700`), which cost 121 kB.
- **The banner is preloaded**, injected by `scripts/prerender.js`, which digs its
  hashed filename out of the built CSS. It is a CSS background, so without the
  preload the browser only discovers the largest thing on the page after the
  stylesheet parses.

Still open, both deliberate: the game card favicons come from Google's favicon
service, 26 third-party requests carrying visitor data to a third party; and the
banner is a 56 kB JPEG rather than WebP. See `docs/seo-geo-audit.md`.

## Internationalization (i18n)

The site is available in **English**, **French** and **Spanish** (`src/i18n/locales/`). `en.ts` is the reference locale: **the build fails** if another locale is missing a key. Game descriptions live in the locale files (keyed by the game's `id` in `games.json`) and fall back to English when a translation is missing.

To add a language: see the "Adding a language" section of the [README](README.md).

## Git Workflow

`main` deploys automatically to production (no preview). Work is therefore always done on a feature branch, with a Pull Request before merging into `main`.

## Deployment

Automatic via [.github/workflows/deploy.yml](.github/workflows/deploy.yml): every push to `main` triggers a build and deployment to GitHub Pages via pnpm/Node 24. No review/preview branch — `main` is deployed directly.

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs lint and the full build — prerender and `check-seo` included — on every pull request, so a broken build is caught before it reaches `main` rather than during the deploy.

## Planned features (see README)

- Filters (mobile friendly / free / no download)
- Game images
- Adding new games
