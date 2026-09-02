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
  gameDescriptions: {
    "uwufufu": "Vote dans des tournois sur des sujets variés.",
    "wikipedia-speedruns":
      "Enchaîne les pages Wikipédia pour atteindre un article cible le plus vite possible.",
    "more-or-less-game":
      "Devine si l'élément suivant a une valeur plus élevée ou plus faible que le précédent.",
    "damn-dog": "Devine le titre de l'article Wikihow.",
    "framed": "Devine le film en découvrant une image à la fois.",
    "the-higher-lower-game":
      "Devine ce qui est le plus recherché sur Google.",
    "le-petit-bac":
      "Jeu de mots où il faut trouver des mots commençant par la même lettre.",
    "connect-the-stars": "Trouve les liens entre les célébrités.",
    "make-it-meme":
      "Rivalise pour créer les memes les plus drôles à partir de modèles aléatoires.",
    "tier-list-maker":
      "Classe des objets, des personnages ou des idées dans des tier lists personnalisées.",
    "guess-the-game":
      "Identifie un jeu vidéo à partir d'une capture d'écran dévoilée petit à petit.",
    "tixid":
      "Un jeu de cartes narratif où les joueurs utilisent des illustrations abstraites pour inventer des indices créatifs et deviner ceux des autres.",
    "bombparty":
      "Tape des mots contenant les syllabes imposées avant que la bombe n'explose.",
    "popsauce":
      "Jeu de culture générale mêlant pop culture, images et réponses rapides.",
    "rentguessr": "Devine le prix du loyer à partir de photos de logements.",
    "openguessr":
      "Devine des lieux sur une carte à partir d'images Street View.",
    "squiz":
      "Quiz en ligne avec de nombreuses catégories et des parties rythmées.",
    "codenames":
      "Donne des indices malins pour aider ton équipe à trouver les bons mots de la grille.",
    "skribbl-io": "Dessine et devine des mots.",
    "gartic-phone": "Téléphone arabe avec des dessins et des phrases.",
    "linkterpol": "Devine si le portrait vient de LinkedIn ou d'Interpol.",
    "pedantix": "Découvre la page Wikipédia.",
    "cemantix": "Découvre le mot.",
    "brandcolorgame": "Devine la couleur de la marque.",
    "blindtest-gg":
      "Devine les chansons plus vite que tout le monde dans un blind test musical.",
    "what-the-tune":
      "Blind test musical : devine la chanson à partir d'un court extrait audio.",
  },
};
