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
    playerCount: "Nombre de joueurs",
    addPlayer: "Ajouter un joueur",
    removePlayer: "Retirer un joueur",
    players: { one: "joueur", other: "joueurs" },
    byPlayerCount: "Jeux par nombre de joueurs",
  },
  language: {
    label: "Langue",
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
    paragraph1: {
      before:
        "À quoi on joue, c'est un site qui référence des jeux cools à jouer entre amis, sélectionnés avec amour par ",
      linkText: "un vrai humain",
      after: ", qui a passé beaucoup d'heures à tous les découvrir !",
    },
    paragraph2:
      "Tous les jeux sont gratuits, jouables en ligne depuis un navigateur, en solo ou à plusieurs : indique le nombre de joueurs, parcours la liste, et amuse-toi !",
    close: "Fermer",
  },
  catalogue: {
    searchPlaceholder: "Cherche un jeu par nom, tag ou mot-clé",
    clearSearch: "Effacer la recherche",
    searchingWholeCatalogue:
      "Recherche dans tout le catalogue — le nombre de joueurs est ignoré pendant que tu cherches.",
    backTo: (players: number) =>
      `Retour à ${players} ${players === 1 ? "joueur" : "joueurs"}`,
    resultCount: (count: number) => (count === 1 ? "1 jeu" : `${count} jeux`),
    scopeForPlayers: (players: number) =>
      players === 1 ? "pour 1 joueur" : `pour ${players} joueurs`,
    scopeAll: (total: number) => `sur les ${total} jeux`,
    emptyTitle: (query: string) => `Aucun résultat pour « ${query} »`,
    emptyHint:
      "Essaie un nom de jeu, un mot-clé comme « dessin » ou « musique », ou un tag comme « solo ».",
    filtersButton: "Filtres",
    screenShareLabel: "Partage d'écran",
    screenShareDescription:
      "Une seule personne doit avoir le jeu ouvert : partage ton écran en appel et tout le monde joue depuis la même fenêtre. Pas de salon, pas de lien à envoyer.",
    mobileFriendly: "Adapté au mobile",
    noAccountNeeded: "Sans compte nécessaire",
    showResults: (count: number) =>
      count === 1 ? "Afficher 1 jeu" : `Afficher ${count} jeux`,
    tagSolo: "Jouable en solo",
    tagSoloWithStrangers: "Solo contre des inconnus en ligne",
    tagMultiplayer: "Multijoueur avec des gens que tu connais",
    tagScreenShare: "Jouable en partage d'écran",
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
  },
};
