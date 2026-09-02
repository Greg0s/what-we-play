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

`src/i18n/locales/en.ts` is the reference locale: the build fails if another
locale misses one of its keys. Game descriptions live in the locale files (keyed
by the game `id` from `src/games.json`) and fall back to English when a
translation is missing.

## Planned features

- Add filters (mobile friendly/free/need download): for now all games are free and without download
- Add game images
- Add new games
