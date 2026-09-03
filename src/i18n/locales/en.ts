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
    title: "What we play?",
    playerCount: "Number of players",
    addPlayer: "Add a player",
    removePlayer: "Remove a player",
    players: { one: "player", other: "players" },
    byPlayerCount: "Games by player count",
  },
  language: {
    label: "Language",
  },
  content: {
    homeIntro:
      "Say how many of you there are and get a list of online games that work for that group. Every game here runs in a web browser and is free to play.",
    countIntro: (games: number, players: number) =>
      players === 1
        ? `${games} games you can play on your own, straight from a web browser and free.`
        : `${games} games that work with ${players} players, straight from a web browser and free.`,
    playerRange: (min: number, max: number) => {
      const label = (count: number) => (count === 1 ? "1 player" : `${count} players`);
      if (max === -1) return `${label(min)} or more`;
      if (min === max) return label(min);
      return `${min} to ${max} players`;
    },
    faqTitle: "Questions",
    faq: [
      {
        question: "Do these games cost anything?",
        answer: "No. Every game listed here is free to play.",
      },
      {
        question: "Do I need to install anything?",
        answer:
          "No. They all run in a web browser, on a computer or on a phone.",
      },
      {
        question: "Can I play on my own?",
        answer:
          "Yes. Set the player count to 1 and the list keeps only the games that work solo.",
      },
      {
        question: "How do I find a game for my group?",
        answer:
          "Enter how many of you there are: the list updates to the games that work with that many players.",
      },
    ],
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
    /** Title of a player-count page, given how many games it lists. */
    countTitle: (games: number, players: number) => string;
    countDescription: (games: number, players: number) => string;
  };
  header: {
    title: string;
    playerCount: string;
    addPlayer: string;
    removePlayer: string;
    players: { one: string; other: string };
    byPlayerCount: string;
  };
  language: {
    label: string;
  };
  content: {
    homeIntro: string;
    countIntro: (games: number, players: number) => string;
    /** "2 to 16 players", with `-1` meaning no upper limit. */
    playerRange: (min: number, max: number) => string;
    faqTitle: string;
    faq: readonly { question: string; answer: string }[];
  };
  gameDescriptions: Record<GameId, string>;
};
