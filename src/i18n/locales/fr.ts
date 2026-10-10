import type { Translation } from "./en";

export const fr: Translation = {
  meta: {
    title: "À quoi on joue ? Trouve un jeu à jouer en ligne avec tes amis !",
    description:
      "Trouve le meilleur jeu à jouer en ligne avec tes amis selon le nombre de joueurs.",
    countTitle: (games: number, players: number) =>
      players === 1
        ? `${games} jeux en ligne à jouer seul`
        : `${games} jeux en ligne à jouer à ${players}`,
    countDescription: (games: number, players: number) =>
      players === 1
        ? `${games} jeux navigateur à jouer en solo, tous gratuits et sans rien à installer.`
        : `${games} jeux navigateur pour ${players} joueurs, tous gratuits et sans rien à installer.`,
  },
  header: {
    title: "À quoi on joue ?",
    // Honk has no narrow no-break space glyph, so « ? » is held by a plain one.
    question: (players: number) =>
      players === 1
        ? (["À quoi je joue", "en solo\u00a0?"] as const)
        : (["À quoi on joue", `à ${players}\u00a0?`] as const),
    playerCount: "Nombre de joueurs",
    howMany: "On est combien ?",
    addPlayer: "Ajouter un joueur",
    removePlayer: "Retirer un joueur",
    players: { one: "joueur", other: "joueurs" },
    handPicked: (count: number) => `${count} jeux choisis à la main`,
  },
  language: {
    label: "Langue",
  },
  theme: {
    light: "Passer au thème clair",
    dark: "Passer au thème sombre",
  },
  relief: {
    to3d: "Passer la télé en 3D",
    to2d: "Repasser la télé en 2D",
  },
  content: {
    playerRange: (min: number, max: number) => {
      const label = (count: number) =>
        count === 1 ? "1 joueur" : `${count} joueurs`;
      if (max === -1) return `${label(min)} ou plus`;
      if (min === max) return label(min);
      return `${min} à ${max} joueurs`;
    },
  },
  howItWorks: {
    trigger: "Comment ça marche ?",
    title: "Comment ça marche ?",
    intro:
      "À quoi on joue ?, c'est un site qui référence des jeux en ligne cools pour vos meilleures soirées avec vos amis et proches.",
    paragraph1: {
      before: "Les jeux sont sélectionnés avec 💖 par ",
      linkText: "un vrai humain",
      after: " qui a passé beaucoup d'heures à tous les découvrir !",
    },
    paragraph2:
      "Tous les jeux sont gratuits, facilement accessibles depuis un navigateur depuis n'importe quel support (ordinateur, téléphone, tablette, frigo connecté), jouable en solo ou à plusieurs : indique le nombre de joueur, tes filtres, parcours la liste, et amuse-toi !",
    close: "Fermer",
  },
  catalogue: {
    searchLabel: "Rechercher un jeu",
    searchPlaceholder: "Cherche un jeu, un thème, un mot-clé…",
    clearSearch: "Effacer la recherche",
    genresLabel: "Envie de…",
    allGenres: "Tout",
    optionsLabel: "Options",
    strangers: "Avec des inconnus",
    screenShare: "Partage d'écran",
    mobileFriendly: "Jouable sur mobile",
    noAccountNeeded: "Sans compte",
    resetFilters: "Tout effacer",
    resultCount: (count: number) => (count === 1 ? "1 jeu" : `${count} jeux`),
    scopeForPlayers: (players: number) =>
      players === 1 ? "pour 1 joueur" : `pour ${players} joueurs`,
    scopeFree: "gratuits, dans le navigateur",
    scopeSearch: (query: string) => `pour « ${query} », dans tout le catalogue`,
    scopeScreenShare: "à jouer en partage d'écran, quel que soit le nombre de joueurs",
    tagStrangers: "Avec des inconnus",
    tagScreenShare: "Partage d'écran",
    tagAccount: "Compte requis",
    tagNotMobile: "Pas sur mobile",
    play: "Jouer",
    emptyTitle: (query: string) => `Rien pour « ${query} »`,
    emptyFilters: "Aucun jeu ne coche toutes ces cases",
    emptyHint: "La télé a fouillé partout. Essaie « dessin », « musique », ou retire une option.",
  },
  genres: {
    drawing: { chip: "Dessin", band: "Dessin" },
    words: { chip: "Mots", band: "Mots" },
    trivia: { chip: "Quiz", band: "Quiz & culture" },
    music: { chip: "Musique", band: "Musique" },
    geography: { chip: "Géo", band: "Géo" },
    movies: { chip: "Ciné & JV", band: "Ciné & jeux vidéo" },
    fun: { chip: "Pour rire", band: "Pour rire" },
  },
  pick: {
    button: "Choisis pour nous",
    title: "Tirage au sort",
    noGame: "Aucun jeu à tirer au sort",
    firstLine: (players: number) =>
      players === 1 ? "Pour toi, ce sera…" : `Pour vous\u00a0${players}, ce sera…`,
    rerollLines: ["Sinon, il\u00a0y\u00a0a…", "Ou alors…", "Allez, celui-\u2060là\u00a0!", "Dernière idée…"],
    chosen: (name: string) => `Le hasard a choisi : ${name}`,
    launch: "Lancer la partie",
    newTab: "s'ouvre dans un nouvel onglet",
    reroll: "Relancer",
    loading: {
      shuffle: "On mélange les disquettes…",
      read: "Lecture de la disquette…",
      dice: "On lance les dés…",
    },
    note: (count: number, players: number | null) =>
      `Tiré au sort parmi ${count === 1 ? "1 jeu" : `${count} jeux`}${
        players === null ? "" : players === 1 ? " pour 1 joueur" : ` pour ${players} joueurs`
      }`,
    close: "Fermer le tirage",
    back: "Retour à la liste",
  },
  gameDescriptions: {
    uwufufu: "Vote dans des tournois sur des sujets variés.",
    "wikipedia-speedruns":
      "Enchaîne les pages Wikipédia pour atteindre un article cible le plus vite possible.",
    "more-or-less-game":
      "Devine si l'élément suivant a une valeur plus élevée ou plus faible que le précédent.",
    "damn-dog": "Devine le titre de l'article Wikihow.",
    framed: "Devine le film en découvrant une image à la fois.",
    "the-higher-lower-game": "Devine ce qui est le plus recherché sur Google.",
    "le-petit-bac":
      "Jeu de mots où il faut trouver des mots commençant par la même lettre.",
    "connect-the-stars": "Trouve les liens entre les célébrités.",
    "make-it-meme":
      "Rivalise pour créer les memes les plus drôles à partir de modèles aléatoires.",
    "tier-list-maker":
      "Classe des objets, des personnages ou des idées dans des tier lists personnalisées.",
    "guess-the-game":
      "Identifie un jeu vidéo à partir d'une capture d'écran dévoilée petit à petit.",
    tixid:
      "Un jeu de cartes narratif où les joueurs utilisent des illustrations abstraites pour inventer des indices créatifs et deviner ceux des autres.",
    bombparty:
      "Tape des mots contenant les syllabes imposées avant que la bombe n'explose.",
    popsauce:
      "Jeu de culture générale mêlant pop culture, images et réponses rapides.",
    rentguessr: "Devine le prix du loyer à partir de photos de logements.",
    openguessr: "Devine des lieux sur une carte à partir d'images Street View.",
    squiz:
      "Quiz en ligne avec de nombreuses catégories et des parties rythmées.",
    codenames:
      "Donne des indices malins pour aider ton équipe à trouver les bons mots de la grille.",
    "skribbl-io": "Dessine et devine des mots.",
    "gartic-phone": "Téléphone arabe avec des dessins et des phrases.",
    linkterpol: "Devine si le portrait vient de LinkedIn ou d'Interpol.",
    pedantix: "Découvre la page Wikipédia.",
    cemantix: "Découvre le mot.",
    brandcolorgame: "Devine la couleur de la marque.",
    "blindtest-gg":
      "Devine les chansons plus vite que tout le monde dans un blind test musical.",
    "what-the-tune":
      "Blind test musical : devine la chanson à partir d'un court extrait audio.",
    "ethnoguessr":
      "Devine l'origine ethnique ou géographique d'un visage moyen, puis place ta réponse sur la carte.",
    "spotle-movies": "Devine le film du jour en faisant des propositions.",
    "spotle-music": "Devine l'artiste de musique du jour en faisant des propositions.",
    "fermi": "Estime au plus juste la réponse à trois questions impossibles chaque jour.",
    "gamedle": "Devine le jeu vidéo à partir d'une capture pixelisée, de sa jaquette, d'un personnage ou de mots-clés.",
    "doggoguessr": "Devine d'où vient une race de chien sur une carte du monde.",
    "movieguessr": "Devine le film à partir d'un plan pris au hasard. Défi du jour, solo ou salons jusqu'à 50 joueurs.",
  },
  gameKeywords: {
    "uwufufu": ["tournoi", "vote", "préféré", "favori", "classement", "opinion", "débat"],
    "wikipedia-speedruns": [
      "wikipédia", "wiki", "course", "liens", "culture", "rapidité",
    ],
    "more-or-less-game": [
      "plus ou moins", "comparaison", "chiffres", "estimation", "statistiques", "culture",
    ],
    "damn-dog": ["wikihow", "images", "drôle", "illustration", "tutoriel", "absurde"],
    "framed": ["films", "cinéma", "quotidien", "image", "wordle", "culture"],
    "the-higher-lower-game": [
      "google", "recherche", "tendances", "comparaison", "popularité", "plus ou moins",
    ],
    "le-petit-bac": ["mots", "catégories", "lettres", "vocabulaire", "orthographe"],
    "connect-the-stars": [
      "célébrités", "stars", "films", "acteurs", "liens", "cinéma", "culture",
    ],
    "make-it-meme": [
      "meme", "humour", "drôle", "légende", "vote", "créativité", "soirée",
    ],
    "tier-list-maker": ["classement", "tier list", "débat", "opinion", "vote"],
    "guess-the-game": [
      "jeux vidéo", "gaming", "capture d'écran", "quotidien", "wordle", "culture",
    ],
    "tixid": [
      "dixit", "cartes", "histoire", "bluff", "imagination", "illustrations", "créativité", "jeu de société",
    ],
    "bombparty": [
      "mots", "frappe", "clavier", "orthographe", "syllabes", "rapidité", "vocabulaire",
    ],
    "popsauce": [
      "quiz", "culture générale", "pop culture", "images", "rapidité", "questions",
    ],
    "rentguessr": [
      "immobilier", "logement", "appartement", "loyer", "prix", "estimation", "géographie",
    ],
    "openguessr": [
      "geoguessr", "géographie", "carte", "street view", "voyage", "pays", "monde",
    ],
    "squiz": ["quiz", "culture générale", "questions", "connaissances", "kahoot"],
    "codenames": [
      "mots", "indices", "équipes", "association", "espions", "jeu de société", "déduction",
    ],
    "skribbl-io": ["dessin", "pictionary", "croquis", "deviner", "mots", "soirée"],
    "gartic-phone": [
      "dessin", "téléphone arabe", "croquis", "drôle", "soirée", "créativité",
    ],
    "linkterpol": ["linkedin", "interpol", "visages", "portraits", "criminels", "drôle"],
    "pedantix": ["wikipédia", "mots", "sémantique", "quotidien", "énigme", "culture"],
    "cemantix": ["mots", "sémantique", "quotidien", "énigme", "vocabulaire"],
    "brandcolorgame": ["logos", "marques", "couleurs", "design", "marketing", "mémoire"],
    "blindtest-gg": ["musique", "chansons", "blind test", "quiz", "artistes", "rapidité"],
    "what-the-tune": ["musique", "chansons", "blind test", "quiz", "heardle", "extrait"],
    "ethnoguessr": ["visages", "géographie", "carte", "origines", "pays", "monde"],
    "spotle-movies": ["films", "cinéma", "quotidien", "wordle", "acteurs", "indices"],
    "spotle-music": ["musique", "artiste", "chanteur", "quotidien", "wordle", "indices"],
    "fermi": ["estimation", "calcul", "maths", "chiffres", "quotidien", "culture générale", "casse-tête"],
    "gamedle": ["jeu vidéo", "quiz", "quotidien", "wordle", "deviner", "culture"],
    "doggoguessr": ["chien", "race", "géographie", "carte", "quotidien", "deviner"],
    "movieguessr": ["film", "cinéma", "quiz", "quotidien", "deviner", "culture"],
  },
};
