import type { Genre } from "../../games";

/**
 * English is the reference locale: its shape defines the `Translation` type
 * and the other locales must provide exactly the same keys.
 */
export const en = {
  meta: {
    title: "What we play? Find a game to play online with your friends!",
    description:
      "Find the best game to play online with your friends based on player count.",
    countTitle: (games: number, players: number) =>
      players === 1
        ? `${games} online games to play alone`
        : `${games} online games to play with ${players} players`,
    countDescription: (games: number, players: number) =>
      players === 1
        ? `${games} browser games you can play on your own, all free and with nothing to install.`
        : `${games} browser games for ${players} players, all free and with nothing to install.`,
  },
  header: {
    /** The site's name, as used in page titles and the top bar. */
    title: "What we play?",
    /** The page's question, the H1 the TV asks, on two lines. */
    question: (players: number) =>
      players === 1
        ? (["What do I play", "solo?"] as const)
        : (["What do we play", `with ${players}?`] as const),
    playerCount: "Number of players",
    howMany: "How many are we?",
    addPlayer: "Add a player",
    removePlayer: "Remove a player",
    players: { one: "player", other: "players" },
    handPicked: (count: number) => `${count} games picked by hand`,
  },
  language: {
    label: "Language",
  },
  theme: {
    light: "Switch to light theme",
    dark: "Switch to dark theme",
  },
  relief: {
    to3d: "Switch the TV to 3D",
    to2d: "Back to the flat TV",
  },
  content: {
    playerRange: (min: number, max: number) => {
      const label = (count: number) => (count === 1 ? "1 player" : `${count} players`);
      if (max === -1) return `${label(min)} or more`;
      if (min === max) return label(min);
      return `${min} to ${max} players`;
    },
  },
  howItWorks: {
    trigger: "How it works",
    title: "How it works",
    intro:
      "What we play? is a site that lists cool online games for your best nights in with friends and family.",
    paragraph1: {
      before: "The games are hand-picked with 💖 by ",
      linkText: "a real human",
      after: " who spent many hours discovering all of them!",
    },
    paragraph2:
      "Every game is free, easily accessible from a browser on any device (computer, phone, tablet, smart fridge), playable solo or with others: enter your number of players, your filters, browse the list, and have fun!",
    close: "Close",
  },
  catalogue: {
    searchLabel: "Search a game",
    searchPlaceholder: "Search a game, a theme, a keyword…",
    clearSearch: "Clear search",
    genresLabel: "Feel like…",
    allGenres: "All",
    optionsLabel: "Options",
    strangers: "With strangers",
    screenShare: "Screen share",
    mobileFriendly: "Mobile friendly",
    noAccountNeeded: "No account",
    resetFilters: "Clear all",
    resultCount: (count: number) => (count === 1 ? "1 game" : `${count} games`),
    scopeForPlayers: (players: number) =>
      players === 1 ? "for 1 player" : `for ${players} players`,
    scopeFree: "free, in your browser",
    scopeSearch: (query: string) => `for “${query}”, across the whole catalogue`,
    scopeScreenShare: "to play over screen share, whatever the player count",
    tagStrangers: "With strangers",
    tagScreenShare: "Screen share",
    tagAccount: "Account needed",
    tagNotMobile: "Not on mobile",
    play: "Play",
    emptyTitle: (query: string) => `Nothing for “${query}”`,
    emptyFilters: "No game ticks all these boxes",
    emptyHint: "The TV searched everywhere. Try “drawing”, “music”, or remove an option.",
  },
  genres: {
    drawing: { chip: "Drawing", band: "Drawing" },
    words: { chip: "Words", band: "Words" },
    trivia: { chip: "Trivia", band: "Trivia & culture" },
    music: { chip: "Music", band: "Music" },
    geography: { chip: "Geo", band: "Geography" },
    movies: { chip: "Movies & games", band: "Movies & video games" },
    fun: { chip: "For laughs", band: "Just for laughs" },
  },
  pick: {
    button: "Pick for us",
    title: "Random pick",
    noGame: "No game to pick from",
    firstLine: (players: number) =>
      players === 1 ? "For you, it'll be…" : `For the ${players} of you, it'll be…`,
    rerollLines: ["Or else, there's…", "Or maybe…", "Come on, this one!", "Last idea…"],
    chosen: (name: string) => `Chance picked: ${name}`,
    launch: "Start playing",
    newTab: "opens in a new tab",
    reroll: "Reroll",
    note: (count: number, players: number | null) =>
      `Drawn from ${count === 1 ? "1 game" : `${count} games`}${
        players === null ? "" : players === 1 ? " for 1 player" : ` for ${players} players`
      }`,
    close: "Close the draw",
    back: "Back to the list",
  },
  gameDescriptions: {
    "uwufufu": "Vote in tournaments about various subjects",
    "wikipedia-speedruns":
      "Race through Wikipedia pages to reach a target article as fast as possible.",
    "more-or-less-game":
      "Guess if the next item is higher or lower in value compared to the previous.",
    "damn-dog": "Guess the Wikihow article's title",
    "framed": "Guess the movie by seeing one frame at a time.",
    "the-higher-lower-game": "Guess what gets Googled more.",
    "le-petit-bac":
      "Word game where you find words starting with the same letter.",
    "connect-the-stars": "Find links between celebrities",
    "make-it-meme":
      "Compete to create the funniest memes from random templates.",
    "tier-list-maker":
      "Rank items, characters, or ideas into custom tier lists.",
    "guess-the-game":
      "Identify a video game from a progressively revealed screenshot.",
    "tixid":
      "A storytelling card game where players use abstract illustrations to spark creative clues and imaginative guesses.",
    "bombparty": "Type words with given letter combos before the bomb explodes.",
    "popsauce":
      "Party trivia game mixing pop culture, images, and quick guesses.",
    "rentguessr": "Guess rent price based on accommodations images.",
    "openguessr": "Guess locations on a map based on Street View images.",
    "squiz":
      "Online quiz game with multiple categories and fast-paced challenges.",
    "codenames":
      "Give clever clues to help your team guess the right words on the grid.",
    "skribbl-io": "Draw and guess words.",
    "gartic-phone": "Telephone Game with drawings and texts.",
    "linkterpol": "Guess if the portrait is from LinkedIn or from Interpol.",
    "pedantix": "Discover the Wikipedia page.",
    "cemantix": "Discover the word.",
    "brandcolorgame": "Guess the brand's color.",
    "blindtest-gg":
      "Guess songs faster than everyone else in a music blind test.",
    "what-the-tune":
      "Music blind test: guess the song from a short audio clip.",
    "ethnoguessr":
      "Guess a person's ethnic or geographic origin from an averaged face, then place your answer on the map.",
    "spotle-movies": "Guess the movie of the day by making guesses.",
    "spotle-music": "Guess the music artist of the day by making guesses.",
    "fermi": "Estimate the answer to three impossible questions every day, as close as you can.",
    "gamedle": "Guess the video game from a pixelated screenshot, its cover, a character or keywords.",
    "doggoguessr": "Guess where a dog breed comes from on a world map.",
    "movieguessr": "Guess the movie from a random shot. Daily challenge, solo, or rooms of up to 50 players.",
  },
  gameKeywords: {
    "uwufufu": [
      "tournament", "vote", "bracket", "favorite", "ranking", "opinion", "debate",
    ],
    "wikipedia-speedruns": ["wiki", "race", "links", "culture", "knowledge", "speed"],
    "more-or-less-game": [
      "higher or lower", "comparison", "numbers", "estimate", "stats", "trivia",
    ],
    "damn-dog": ["wikihow", "images", "funny", "illustration", "tutorial", "absurd"],
    "framed": ["movies", "film", "cinema", "daily", "screenshot", "wordle"],
    "the-higher-lower-game": [
      "google", "search", "trends", "comparison", "popularity", "estimate",
    ],
    "le-petit-bac": [
      "scattergories", "words", "categories", "letters", "vocabulary", "spelling",
    ],
    "connect-the-stars": [
      "celebrities", "famous", "movies", "actors", "links", "cinema", "culture",
    ],
    "make-it-meme": ["meme", "humor", "funny", "caption", "vote", "creativity", "party"],
    "tier-list-maker": ["ranking", "tier list", "debate", "opinion", "vote"],
    "guess-the-game": [
      "video games", "gaming", "screenshot", "daily", "wordle", "culture",
    ],
    "tixid": [
      "dixit", "cards", "storytelling", "bluff", "imagination", "illustrations", "creativity", "board game",
    ],
    "bombparty": [
      "words", "typing", "keyboard", "spelling", "syllables", "speed", "vocabulary",
    ],
    "popsauce": ["trivia", "quiz", "pop culture", "images", "speed", "questions"],
    "rentguessr": [
      "real estate", "housing", "apartment", "rent", "price", "estimate", "geography",
    ],
    "openguessr": [
      "geoguessr", "geography", "map", "street view", "travel", "countries", "world",
    ],
    "squiz": ["quiz", "trivia", "general knowledge", "questions", "culture", "kahoot"],
    "codenames": [
      "words", "clues", "teams", "association", "spies", "board game", "deduction",
    ],
    "skribbl-io": ["drawing", "pictionary", "sketch", "guess", "words", "party"],
    "gartic-phone": [
      "drawing", "telephone", "chinese whispers", "sketch", "funny", "party", "creativity",
    ],
    "linkterpol": ["linkedin", "interpol", "faces", "portraits", "criminals", "funny"],
    "pedantix": [
      "wikipedia", "words", "semantic", "daily", "riddle", "culture", "french",
    ],
    "cemantix": [
      "words", "semantic", "semantle", "daily", "riddle", "vocabulary", "french",
    ],
    "brandcolorgame": ["logos", "brands", "colors", "design", "marketing", "memory"],
    "blindtest-gg": ["music", "songs", "blind test", "name that tune", "quiz", "artists"],
    "what-the-tune": [
      "music", "songs", "blind test", "name that tune", "quiz", "heardle",
    ],
    "ethnoguessr": ["faces", "geography", "map", "origins", "countries", "world"],
    "spotle-movies": ["movies", "film", "cinema", "daily", "wordle", "actors", "clues"],
    "spotle-music": ["music", "artist", "singer", "daily", "wordle", "clues"],
    "fermi": ["estimation", "math", "numbers", "daily", "trivia", "guess", "puzzle"],
    "gamedle": ["video game", "quiz", "daily", "wordle", "guess", "trivia"],
    "doggoguessr": ["dog", "breed", "geography", "map", "daily", "guess"],
    "movieguessr": ["movie", "film", "cinema", "quiz", "daily", "guess"],
  },
} as const;

/** Ids of the games we have a description for. */
export type GameId = keyof (typeof en)["gameDescriptions"];

/** Shape every locale has to follow. */
export type Translation = {
  meta: {
    title: string;
    description: string;
    /** Title of a player-count page, given how many games it lists. */
    countTitle: (games: number, players: number) => string;
    countDescription: (games: number, players: number) => string;
  };
  header: {
    /** The site's name: page titles, the top bar. */
    title: string;
    /** The H1: the question the TV asks, on two lines. */
    question: (players: number) => readonly [string, string];
    playerCount: string;
    /** Taped on the keypad. */
    howMany: string;
    addPlayer: string;
    removePlayer: string;
    players: { one: string; other: string };
    /** The round sticker in the banner. */
    handPicked: (count: number) => string;
  };
  language: {
    label: string;
  };
  theme: {
    /** Label of the switcher when clicking it would select this mode. */
    light: string;
    dark: string;
  };
  /** Label of the 3D glasses, i.e. what a click does. */
  relief: {
    to3d: string;
    to2d: string;
  };
  content: {
    /** "2 to 16 players", with `-1` meaning no upper limit. */
    playerRange: (min: number, max: number) => string;
  };
  howItWorks: {
    /** Label of the header button that opens the modal. */
    trigger: string;
    title: string;
    intro: string;
    /** Split around `linkText` so it can be rendered as a link to the portfolio. */
    paragraph1: { before: string; linkText: string; after: string };
    paragraph2: string;
    /** Label of the modal's close button. */
    close: string;
  };
  catalogue: {
    searchLabel: string;
    searchPlaceholder: string;
    clearSearch: string;
    genresLabel: string;
    allGenres: string;
    optionsLabel: string;
    strangers: string;
    screenShare: string;
    mobileFriendly: string;
    noAccountNeeded: string;
    resetFilters: string;
    resultCount: (count: number) => string;
    scopeForPlayers: (players: number) => string;
    /** Appended to the player-count scope. */
    scopeFree: string;
    scopeSearch: (query: string) => string;
    scopeScreenShare: string;
    tagStrangers: string;
    tagScreenShare: string;
    tagAccount: string;
    tagNotMobile: string;
    play: string;
    emptyTitle: (query: string) => string;
    emptyFilters: string;
    emptyHint: string;
  };
  /** `chip` on the genre buttons, `band` on cards and floppies. */
  genres: Record<Genre, { chip: string; band: string }>;
  pick: {
    button: string;
    title: string;
    noGame: string;
    /** What the TV says on the first draw… */
    firstLine: (players: number) => string;
    /** …and on each reroll, in order, then it loops. */
    rerollLines: readonly string[];
    chosen: (name: string) => string;
    launch: string;
    newTab: string;
    reroll: string;
    /** `players` is null when the pick ignored the player count (search, screen share). */
    note: (count: number, players: number | null) => string;
    close: string;
    back: string;
  };
  gameDescriptions: Record<GameId, string>;
  /**
   * Extra search terms per game, for what its name and description don't say
   * ("drawing", "quiz"…). Never displayed, only matched by the search.
   */
  gameKeywords: Record<GameId, readonly string[]>;
};
