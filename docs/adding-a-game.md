# Adding a game

A checklist for adding a game to the catalogue, written so that an AI agent
(or a person) can do it from just the game's URL. A game touches four files
and no code:

- `src/games.json` — the data
- `src/i18n/locales/en.ts`, `fr.ts`, `es.ts` — its description and search keywords

## 1. Find out what the game is

Open the game's site (its home page, how-to-play page, FAQ, multiplayer
page) and answer each question below. When the site doesn't say, pick the
option that matches how most people would play it, and say in the pull
request which fields were a guess.

| Question | Field |
| --- | --- |
| Fewest people who can play it? | `minPlayers` (usually `1` if there is a solo mode) |
| Most people in one game? No limit, or a public room anyone joins? | `maxPlayers` (`-1` = no max; a 1v1 duel mode means `2`) |
| Playable alone? | `solo` |
| Can you play against strangers matched online (ranked, public rooms)? | `soloWithStrangers` |
| Can people who know each other play together (private room, invite link, duel a friend)? | `multiplayer` |
| Can a group play it around one shared screen (a quiz or a daily puzzle everyone shouts answers at)? | `screenShare` |
| Comfortable on a phone? | `mobileFriendly` |
| Does the main game require an account? (An account that only unlocks extras, such as duels or saving, does not count.) | `accountNeeded` |
| Which kind of game is it? | `genre`, see below |
| Does the site serve French or Spanish at its own URL (`/fr/`, `?lang=es`…)? | `localizedLinks`, see below |

How the filters use these fields (`src/catalogue.ts`):

- `minPlayers`/`maxPlayers` decide which player-count pages list the game.
- « With strangers » keeps games with `soloWithStrangers`.
- « Screen share » keeps games with `screenShare` **and widens the list to
  every player count**: a solo daily quiz with `screenShare: true` shows up
  for a group of 6 when that option is on, so there is no need to inflate
  `maxPlayers` for it.
- « Mobile » keeps `mobileFriendly`, « No account » drops `accountNeeded`.
- `solo` and `multiplayer` are no longer shown or filtered on, but keep
  them accurate.

### Genre

One of `GENRES` in `src/games.ts`: `drawing`, `words`, `trivia`, `music`,
`geography`, `movies`, `fun`. It sets the card's colour and the « Feel
like… » chip. An unknown genre fails the build. Guessing games about places
go in `geography`, quizzes and general knowledge in `trivia`, films, series
and video games in `movies`; `fun` is the catch-all for anything else. Don't
add a genre without also adding its colour (`$genre-colors` in
`src/stylesheets/_variables.scss`) and its label in every locale (`genres`).

### Links

`link` is the game's main URL, in English when the site has one. If the
site serves French or Spanish at a URL of its own, add `localizedLinks`
(`{ "fr": "…", "es": "…" }`, only the languages that exist); a site that
picks its language from the browser or a setting needs nothing. Check each
URL actually opens in that language.

### Icon

Cards show the icon Google's favicon service has for `link`'s host
(`https://www.google.com/s2/favicons?domain=<host>&sz=64`). Open that URL:
if it returns 404 (Google's grey globe), Google has no icon for the site
(`e2e/favicons.spec.ts` fails on it too).
Then download the site's own icon (its `<link rel="icon">` or
`apple-touch-icon`; a logo cropped to its emblem if it has none), save it as
`public/favicons/<id>.png` (64 × 64, transparent or square) or `.svg`, and
set `"favicon": "/favicons/<id>.png"` on the entry, right after `link` (or
`localizedLinks`).

## 2. Add the entry to `src/games.json`

Append it at the end of the array, with the keys in this order:

```json
{
  "id": "timeguessr",
  "name": "TimeGuessr",
  "minPlayers": 1,
  "maxPlayers": 2,
  "link": "https://timeguessr.com/",
  "localizedLinks": {
    "fr": "https://timeguessr.com/fr",
    "es": "https://timeguessr.com/es"
  },
  "genre": "geography",
  "solo": true,
  "soloWithStrangers": true,
  "multiplayer": true,
  "screenShare": true,
  "mobileFriendly": true,
  "accountNeeded": false
}
```

- `id`: lowercase kebab-case, unique, stable (it keys the locale entries).
- `name`: the game's own name as the site writes it. It is not translated,
  so put a translated title in the keywords instead (see below).
- Two-space indentation, no trailing comma.

## 3. Describe it in every locale

In each of `en.ts`, `fr.ts` and `es.ts`, add a line at the end of both
`gameDescriptions` and `gameKeywords`, keyed by the `id`. The build fails if
`fr` or `es` misses a key that `en` has.

**Description**: one or two short sentences, in the second person
singular, imperative (« Devine… », « Adivina… », "Guess…"), like the
existing ones. Say what you do, then the modes worth knowing (« Solo, défi
du jour ou duels en 1 contre 1. »). If the game only exists in one language,
say so in the descriptions of the other languages (« In French. »).

**Keywords**: 5 to 9 words someone might type to find it, in that language,
that are not already in the name or description: the theme, the mechanic,
`daily`/`quotidien`/`diario` for daily games, a famous game it resembles
(`geoguessr`), and the game's translated title if it has one
(« 1 sur 8 milliards »). Keywords are never displayed; search ignores case
and accents.

```ts
// gameDescriptions
"timeguessr": "Devine où et quand une photo historique a été prise. Solo, défi du jour ou duels en 1 contre 1.",
// gameKeywords
"timeguessr": ["histoire", "photo", "année", "date", "carte", "géographie", "quotidien", "deviner", "geoguessr"],
```

## 4. Check

```bash
pnpm run lint
pnpm run build        # fails on a bad genre, a missing locale key, or a page left with no games
pnpm run test:e2e     # after the build
```

The favicon test loads every card's icon from `www.google.com`, which
redirects to `t0`–`t3.gstatic.com`; behind a
proxy that blocks it, it fails for that reason alone.

Nothing else needs changing: the pages, sitemap, `llms.txt`, JSON-LD and the
draw all read `games.json`. Open a pull request listing the games added and
any field that was a guess.
