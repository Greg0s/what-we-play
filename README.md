# <img src="./public/what-we-play-title.png" alt="What we play?" width="500">

Find easily new games to play online with your friends (or alone)!

Indicate the number of players and find games to have fun :)

Visit the website: https://whatweplay.gregoiretinn.es/

## Languages

The site is available in **English**, **French** and **Spanish**. The browser
language is detected on the first visit and applied when it is supported,
English is used otherwise. Visitors can change it with the switcher in the
header, and their choice is remembered for the next visits.

### Adding a language

- Add the language code to `LANGUAGES` and its name to `LANGUAGE_NAMES` in
  `src/i18n/config.ts`.
- Copy `src/i18n/locales/en.ts` into `src/i18n/locales/<code>.ts`, translate the
  strings and register it in `src/i18n/locales/index.ts`.
- Add the URL prefix and the player-count slug for the language to `ROUTING` in
  `src/routes.ts`, and its Open Graph locale to `OG_LOCALES` in
  `src/i18n/config.ts`. Both are typed per language, so the build fails until
  they are there. The new language then gets its own pages, `hreflang`
  annotations and sitemap entries automatically.

`src/i18n/locales/en.ts` is the reference locale: the build fails if another
locale misses one of its keys. Game descriptions and search keywords
(`gameDescriptions`, `gameKeywords`) live in the locale files (keyed by the game
`id` from `src/games.json`) and fall back to English when a translation is
missing. Keywords are what lets the search find a game by a word its name and
description don't contain (“drawing”, “quiz”, “bluff”…); pick them in each
language's own terms rather than translating word for word.

When a game's site serves a translation at its own URL (e.g.
`garticphone.com/fr` or `gamedle.wtf/?lang=fr`), list it under
`localizedLinks` in `src/games.json`: the card then opens that page for
visitors reading What we play? in that language, and `link` everywhere else. Sites that pick their language from the
browser or an in-game setting need nothing.

## Planned features

- Add game images
- Add new games
