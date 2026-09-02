/**
 * English is the reference locale: its shape defines the `Translation` type
 * and the other locales must provide exactly the same keys.
 */
export const en = {
  meta: {
    title: "What we play? Find a game to play online with your friends!",
    description:
      "Find the best game to play online with your friends based on player count.",
  },
  header: {
    title: "What we play?",
    playerCount: "Number of players",
    addPlayer: "Add a player",
    removePlayer: "Remove a player",
    players: { one: "player", other: "players" },
  },
  language: {
    label: "Language",
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
  },
} as const;

/** Ids of the games we have a description for. */
export type GameId = keyof (typeof en)["gameDescriptions"];

/** Shape every locale has to follow. */
export type Translation = {
  meta: {
    title: string;
    description: string;
  };
  header: {
    title: string;
    playerCount: string;
    addPlayer: string;
    removePlayer: string;
    players: { one: string; other: string };
  };
  language: {
    label: string;
  };
  gameDescriptions: Record<GameId, string>;
};
