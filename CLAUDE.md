# a-quoi-on-joue (What we play?)

Front-end site listing online games (solo or multiplayer) to help quickly find something to play based on the number of players. Deployed on GitHub Pages: https://whatweplay.gregoiretinn.es/

## Keeping this file up to date

This file must stay accurate. Whenever a change makes any statement here
incorrect or incomplete, update the relevant section in the same change —
treat an outdated `CLAUDE.md` as a bug in that change, not separate cleanup.

## Stack & structure

- React 19 + TypeScript + Vite, Sass (`sass-embedded`) for styling
- `react-icons` (the `fa6` set, plus a few `tb` icons: the language switcher, the dice, the Enter arrow, the ↗ arrow) for every icon. The only drawn SVGs are illustrations, not icons: the TV, the pawns, the cord, the bubble's tail and the 3D glasses (whose lenses carry the 2D/3D state)
- **Package manager: pnpm** (not npm/yarn — the lockfile is `pnpm-lock.yaml`)

Structure:

- `src/games.json` — the game data (no translatable text): `id`, `name`, `minPlayers`/`maxPlayers` (`-1` = no max), `link` (plus optional `localizedLinks` — `{ "fr": …, "es": … }` — for sites that serve a translation at its own URL; cards and JSON-LD use it for the page's language and fall back to `link`), `genre` (one of `GENRES` in `src/games.ts`; an unknown one fails the build), tag booleans (`solo`, `soloWithStrangers`, `multiplayer`, `screenShare`), filter booleans (`mobileFriendly`, `accountNeeded`). Hand-editable without touching code. `solo` and `multiplayer` are no longer shown or filtered on.
- `src/games.ts` — typed access to that data (the `Game` type, `GENRES`, the player-count filter, `gameLink`, `playerRangeShort`). Both the app and the prerender go through it, so they can never disagree on what belongs on a page.
- `src/catalogue.ts` — what the list shows: player count, search, genre and the four options (with strangers, screen share — which widens to the whole catalogue —, mobile, no account). `src/tv.ts` — the TV's screen (one pair of eyes per player, moods, reels) in TV units, and the 3D pawns. `src/ui.ts` — small helpers the components share.
- `src/i18n/` — internationalization (see below). `src/theme/` — light/dark mode (see Theming below). `src/relief/` — the 2D/3D TV (see below).
- `src/components/` — `Studio` (the banner: the bubble with the H1, the TV, the cord, the sticker and the keypad, whose keys are real links to each player-count page and whose Enter key draws a game), `Tv` + `TvScreen` (the mascot, flat and 3D), `PickDrawer` (the draw on wide screens), `PickScreen` (the draw on phones), `Floppy`, `Games` (search, genres, options, cards), `Game` (card), `GlassesSwitch`, `LanguageSwitcher`, `ThemeSwitcher`, `HowItWorks` (header modal, full screen on phones, where it hides the floating « Pick for us » button).
- `src/App.tsx` — wires everything together: the route state (player count, landing or not) kept in step with the URL, the catalogue state, the TV's moods (`useTvMood`) and the draw (`usePick`).
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

Both drawings of the TV (and of the floppy) are always in the markup, so the
prerender never has to know the visitor's 2D/3D choice; CSS shows one of them.

Two constraints follow, and breaking either is silent:

- **Nothing browser-only during render.** `navigator`, `window` and
  `localStorage` don't exist at build time — do that detection in an effect,
  the way `LanguageProvider`, `ThemeProvider` and `ReliefProvider` do. The
  same goes for randomness: a game is only ever drawn in a click handler.
- **The first client render must reproduce the page's URL.** `main.tsx`
  parses the path and passes the route down; anything that starts the
  browser from a different state than the build used breaks hydration.

## Testing

Playwright e2e tests (`e2e/`, run with `pnpm run test:e2e`) exercise the
built `dist/` through `vite preview`, not the dev server: hydration, lazy
favicons and per-page SEO tags only exist in that output. The exhaustive
SEO audit across all 33 pages is still `scripts/check-seo.js`, which gates
the build — the e2e suite only smoke-tests a few representative pages, plus
the keypad, the options and genres, the draw (drawer and phone screen), the
3D glasses, and two layout guards: the TV's call stays inside its screen at
every player count, and the H1 holds on two lines above the keypad in every
language (`Studio` shrinks it when Honk renders a line too wide). The favicon test needs `www.google.com`: it fails behind a proxy
that blocks it, not because of the code.
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
10+ stepper) so Back doesn't fill up with one entry per change; a key of the
keypad pushes a history entry. The phone's pick screen has no URL: it is an
overlay, not a page.

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

Easy to undo by accident — see `docs/seo-geo-audit.md` for the
measurements:

- The Google Fonts request is two families: Archivo, a variable font asked
  for over its `wdth` 62..125 and `wght` 400..900 axes (one file per subset,
  whatever the range), and Honk. No italic, no third family: each one costs
  real, measured kilobytes.
- The banner has no photo any more (the TV and the gradient are CSS and
  inline SVG), so there is nothing to preload: `scripts/prerender.js` no
  longer touches the template beyond the head and the root.

## Internationalization

English, French, Spanish (`src/i18n/locales/`). `en.ts` is the reference
locale: **the build fails** if another locale is missing a key. Game
descriptions and search keywords (`gameDescriptions`, `gameKeywords`) live in
the locale files, keyed by the game's `id`, and fall back to English when a
translation is missing. Keywords are never displayed: the search
(`src/catalogue.ts`, fed by `App.tsx`) matches name, description, keywords,
genre and tag labels, ignoring case and accents — adding a game means giving it keywords in every locale. To add a language, see the
"Adding a language" section of the [README](README.md).

## Theming

Light/dark via `src/theme/` (`ThemeProvider`, `useTheme`) and
`ThemeSwitcher`. The mode lives as `data-theme="dark"` on `<html>` (light is
the attribute's absence); every themed color is a `--color-*` custom
property in `App.scss` (page, card, line, shadow, text, muted, soft, deck,
studio gradient). The TV, the keys and the floppies keep fixed inks
(`src/stylesheets/_variables.scss`): only their solid shadows turn pink at
night. The genre colours live there too, as `$genre-colors`. Persistence and first-visit detection mirror the
language switcher: `localStorage` (`what-we-play:theme`) once chosen,
`prefers-color-scheme` before that. `index.html` carries an inline script
that re-implements that same lookup before `<head>` finishes parsing, since
it runs before React and can't import `src/theme/config.ts` — without it,
dark mode would flash light before hydration. If the storage key or default
logic in `src/theme/config.ts` changes, update that inline script by hand.

## 2D / 3D

The TV is flat by default; the 3D glasses in the top bar (`GlassesSwitch`)
turn it into a CSS 3D Mac with one pawn per player, and the floppy gains
thickness. Nothing else on the page changes. The choice lives in
`src/relief/` (`ReliefProvider`, `useRelief`) like the theme: `localStorage`
(`what-we-play:relief`), `data-relief="3d"` on `<html>`, and the same inline
script in `index.html` sets it before the first paint — keep its key in step
with `src/relief/config.ts`. A switch plays a short red/cyan anaglyph flicker,
then the pawns drop in (or hop off first); `mode` flips at the click, `view`
(what is drawn) at the middle of the flicker. With reduced motion it is
immediate. Never put `filter`, `opacity`, `overflow` or `clip-path` on a
`preserve-3d` node of the Mac (see `src/stylesheets/mac.scss`): it flattens it.

## The draw

« Pick for us » draws among the games the list currently shows. On wide
screens (`usePick`) the TV's eyes become slot machine reels, then a floppy
pops out of its slot into a drawer under the banner, the TV says a line in a
bubble above it, and a yellow sticker closes it (the floppy goes back in
first). Below 640 px the keypad's Enter key gives way to a floating button
that opens `PickScreen`, a full-screen overlay where the TV keeps changing
expressions between draws. The floppy's flight is measured from the TV's slot
at run time, so it holds at every width.

## Load animation

`src/stylesheets/intro.scss` staggers the TV's bubble, the keypad, the search
bar, genres, options and cards in on page load — CSS only, so it plays from the prerendered HTML's first
paint. It must not replay when cards mount later (filters, player count), so
`App.tsx` sets `data-intro="done"` on `<html>` after `INTRO_DURATION_MS` and
every intro rule is scoped to `:root:not([data-intro="done"])`. If the
sequence gets longer, raise that constant with it. The banner itself stays
static on purpose (largest paint, holds the layout); only its TV switches its
screen on.

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
