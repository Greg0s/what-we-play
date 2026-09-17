# a-quoi-on-joue (What we play?)

Front-end site listing online games (solo or multiplayer) to help quickly find something to play based on the number of players. Deployed on GitHub Pages: https://whatweplay.gregoiretinn.es/

## Keeping this file up to date

This file must stay accurate. Whenever a change makes any statement here
incorrect or incomplete, update the relevant section in the same change —
treat an outdated `CLAUDE.md` as a bug in that change, not separate cleanup.

## Stack & structure

- React 19 + TypeScript + Vite, Sass (`sass-embedded`) for styling
- `react-icons` (the `fa6` set, plus a couple of `tb` icons in the language switcher) for every icon — no custom SVGs
- **Package manager: pnpm** (not npm/yarn — the lockfile is `pnpm-lock.yaml`)

Structure:

- `src/games.json` — the game data (no translatable text): `id`, `name`, `minPlayers`/`maxPlayers` (`-1` = no max), `link`, tag booleans (`solo`, `soloWithStrangers`, `multiplayer`, `screenShare`), filter booleans (`mobileFriendly`, `accountNeeded`). Hand-editable without touching code.
- `src/games.ts` — typed access to that data (the `Game` type, the player-count filter, `playerRangeShort`). Both the app and the prerender go through it, so they can never disagree on what belongs on a page.
- `src/i18n/` — internationalization (see below). `src/theme/` — light/dark mode (see Theming below).
- `src/components/` — `Game` (card), `Games` (search + one filter chip per tag/filter boolean), `FilterSheet` (mobile bottom sheet, same filters), `LanguageSwitcher`, `ThemeSwitcher`, `HowItWorks` (header modal). `howMany.tsx`/`title.tsx` are exported but unused — `App.tsx` builds the header inline instead.
- `src/App.tsx` — wires everything together, holds the route state (player count, landing or not) and keeps the URL in step with it.
- `src/routes.ts` — the URL scheme (see URLs below). `src/pageMeta.ts` — per-page title/description. `src/structuredData.ts` — per-page JSON-LD.
- `src/entry-server.tsx` + `scripts/prerender.js` — build-time render into `dist/<path>/index.html`, `sitemap.xml`, `llms.txt`. `scripts/check-seo.js` — audits the built `dist/` (see Rendering below).
- `e2e/` — Playwright tests against the built `dist/` (`playwright.config.ts` at the repo root). `src/stylesheets/` — the rest of the Sass, roughly one file per feature.

## Working on this project

```bash
pnpm install      # install dependencies
pnpm run dev      # dev server (http://localhost:5173)
pnpm run build    # typecheck, client + SSR build, prerender, then check-seo (see Rendering)
pnpm run check    # re-run just the check-seo audit against an existing dist/
pnpm run lint     # ESLint, config in eslint.config.js
pnpm run preview  # serve the built dist/ (also what e2e tests run against)
pnpm run test:e2e # Playwright — run `pnpm run build` first, it does not build for you
```

## Rendering

The site is prerendered at build time and hydrated in the browser, because
GitHub Pages serves files only and crawlers that don't run JavaScript —
every generative engine among them — would otherwise get an empty
`<div id="root">`. `scripts/check-seo.js` re-reads the built `dist/` after
prerendering and fails the build on a broken canonical, non-reciprocal
`hreflang`, duplicate title, unparseable JSON-LD, or a page with no games —
deliberately by inspecting the output files rather than importing the code
that wrote them. See [docs/seo-geo-audit.md](docs/seo-geo-audit.md).

Two constraints follow, and breaking either is silent:

- **Nothing browser-only during render.** `navigator`, `window` and
  `localStorage` don't exist at build time — do that detection in an effect,
  the way `LanguageProvider` and `ThemeProvider` do.
- **The first client render must reproduce the page's URL.** `main.tsx`
  parses the path and passes the route down; anything that starts the
  browser from a different state than the build used breaks hydration.

## Testing

Playwright e2e tests (`e2e/`, run with `pnpm run test:e2e`) exercise the
built `dist/` through `vite preview`, not the dev server: hydration, lazy
favicons and per-page SEO tags only exist in that output. The exhaustive
SEO audit across all 33 pages is still `scripts/check-seo.js`, which gates
the build — the e2e suite only smoke-tests a few representative pages.
Tests import shared logic from `src/` (`gamesForPlayerCount`, locale files,
`pageMeta`) instead of hardcoding expected counts or strings, so a test only
breaks when behavior actually changes.

## URLs

One page per language × player count — 33 in all, listed by `allRoutes()` in
`src/routes.ts`: landing at `/`, `/fr/`, `/es/`; player-count pages at e.g.
`/games-for-4-players/`, `/fr/jeux-a-4-joueurs/`. English is unprefixed and
is the `x-default`. Canonical and reciprocal `hreflang` on every page are
generated from `routes.ts`, so adding a language or a player count updates
every page and the sitemap at once. `vite.config.ts` sets `base: "/"` for
this reason — a relative base would resolve `./assets/…` against `/fr/` and
404. In the browser, a prefixed URL wins outright; only unprefixed pages
fall back to the visitor's preference, via `replaceState` (also used by the
player-count control) so Back doesn't fill up with one entry per change.

## Structured data

Every page carries JSON-LD from `src/structuredData.ts`, written into the
static HTML. `maxPlayers: -1` is expressed by *omitting* `maxValue`, never
by inventing a number. `dateModified` comes from the last commit touching
`src/games.json` or `src/i18n/locales`, not the build clock — this is why
the deploy workflow checks out with `fetch-depth: 0`.

Claims in the copy and markup (`isAccessibleForFree`, "nothing to install")
mirror what the README says about the catalogue. If that stops being true
of every game, `meta.countDescription` (every locale), the intro line in
`buildLlmsTxt` (`src/entry-server.tsx`), and `isAccessibleForFree` all have
to change together.

## Performance

Two things here are easy to undo by accident — see `docs/seo-geo-audit.md`
for the measurements:

- The Google Fonts request lists only the weights the stylesheets apply
  (600 and 700, no italic); widening it costs real, measured kilobytes.
- The banner is preloaded by `scripts/prerender.js`, which digs its hashed
  filename out of the built CSS — it's a CSS background image, so without
  the preload the browser only discovers it after the stylesheet parses.

## Internationalization

English, French, Spanish (`src/i18n/locales/`). `en.ts` is the reference
locale: **the build fails** if another locale is missing a key. Game
descriptions live in the locale files, keyed by the game's `id`, and fall
back to English when a translation is missing. To add a language, see the
"Adding a language" section of the [README](README.md).

## Theming

Light/dark via `src/theme/` (`ThemeProvider`, `useTheme`) and
`ThemeSwitcher`. The mode lives as `data-theme="dark"` on `<html>` (light is
the attribute's absence); every themed color is a `--color-*` custom
property in `App.scss`. Persistence and first-visit detection mirror the
language switcher: `localStorage` (`what-we-play:theme`) once chosen,
`prefers-color-scheme` before that. `index.html` carries an inline script
that re-implements that same lookup before `<head>` finishes parsing, since
it runs before React and can't import `src/theme/config.ts` — without it,
dark mode would flash light before hydration. If the storage key or default
logic in `src/theme/config.ts` changes, update that inline script by hand.

## Git workflow & deployment

`main` deploys automatically to GitHub Pages on every push
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) — no
preview environment. Work is always done on a feature branch with a Pull
Request before merging. [.github/workflows/ci.yml](.github/workflows/ci.yml)
runs lint, the full build (prerender + `check-seo`) and the Playwright suite
on every PR, so a broken build or user-facing flow is caught before `main`.

## Reference docs

- [docs/seo-geo-audit.md](docs/seo-geo-audit.md) — the SEO/GEO audit behind
  the Rendering, URLs, Structured data and Performance choices above.
- [README.md](README.md) — adding a language, planned features.
