import type { Translation } from "./en";

export const es: Translation = {
  meta: {
    title:
      "¿A qué jugamos? ¡Encuentra un juego para jugar en línea con tus amigos!",
    description:
      "Encuentra el mejor juego para jugar en línea con tus amigos según el número de jugadores.",
    countTitle: (games: number, players: number) =>
      players === 1
        ? `${games} juegos en línea para jugar solo`
        : `${games} juegos en línea para ${players} jugadores`,
    countDescription: (games: number, players: number) =>
      players === 1
        ? `${games} juegos de navegador para jugar en solitario, todos gratis y sin instalar nada.`
        : `${games} juegos de navegador para ${players} jugadores, todos gratis y sin instalar nada.`,
  },
  header: {
    title: "¿A qué jugamos?",
    playerCount: "Número de jugadores",
    addPlayer: "Añadir un jugador",
    removePlayer: "Quitar un jugador",
    players: { one: "jugador", other: "jugadores" },
    byPlayerCount: "Juegos por número de jugadores",
  },
  language: {
    label: "Idioma",
  },
  content: {
    homeIntro:
      "Dinos cuántos sois y obtén la lista de juegos en línea que funcionan con ese grupo. Todos se juegan en un navegador y son gratis.",
    countIntro: (games: number, players: number) =>
      players === 1
        ? `${games} juegos para jugar en solitario, directamente en un navegador y gratis.`
        : `${games} juegos que funcionan con ${players} jugadores, directamente en un navegador y gratis.`,
    playerRange: (min: number, max: number) => {
      const label = (count: number) =>
        count === 1 ? "1 jugador" : `${count} jugadores`;
      if (max === -1) return `${label(min)} o más`;
      if (min === max) return label(min);
      return `${min} a ${max} jugadores`;
    },
    faqTitle: "Preguntas frecuentes",
    faq: [
      {
        question: "¿Estos juegos son gratis?",
        answer: "Sí. Todos los juegos que aparecen aquí son gratuitos.",
      },
      {
        question: "¿Hay que instalar algo?",
        answer:
          "No. Todos funcionan en un navegador, tanto en ordenador como en móvil.",
      },
      {
        question: "¿Se puede jugar en solitario?",
        answer:
          "Sí. Pon el contador en 1 y la lista se queda con los juegos que se pueden jugar solo.",
      },
      {
        question: "¿Cómo encuentro un juego para mi grupo?",
        answer:
          "Indica cuántos sois: la lista se actualiza con los juegos que funcionan con ese número de jugadores.",
      },
    ],
  },
  gameDescriptions: {
    "uwufufu": "Vota en torneos sobre temas muy variados.",
    "wikipedia-speedruns":
      "Recorre páginas de Wikipedia para llegar al artículo objetivo lo más rápido posible.",
    "more-or-less-game":
      "Adivina si el siguiente elemento tiene un valor mayor o menor que el anterior.",
    "damn-dog": "Adivina el título del artículo de Wikihow.",
    "framed": "Adivina la película viendo un fotograma cada vez.",
    "the-higher-lower-game": "Adivina qué se busca más en Google.",
    "le-petit-bac":
      "Juego de palabras en el que hay que encontrar palabras que empiecen por la misma letra.",
    "connect-the-stars": "Encuentra los vínculos entre famosos.",
    "make-it-meme":
      "Compite por crear los memes más divertidos a partir de plantillas aleatorias.",
    "tier-list-maker":
      "Ordena objetos, personajes o ideas en tier lists personalizadas.",
    "guess-the-game":
      "Identifica un videojuego a partir de una captura que se revela poco a poco.",
    "tixid":
      "Un juego de cartas narrativo en el que se usan ilustraciones abstractas para dar pistas creativas y adivinar las de los demás.",
    "bombparty":
      "Escribe palabras que contengan las sílabas indicadas antes de que explote la bomba.",
    "popsauce":
      "Juego de preguntas que mezcla cultura pop, imágenes y respuestas rápidas.",
    "rentguessr":
      "Adivina el precio del alquiler a partir de fotos de viviendas.",
    "openguessr":
      "Adivina lugares en el mapa a partir de imágenes de Street View.",
    "squiz": "Quiz en línea con muchas categorías y partidas trepidantes.",
    "codenames":
      "Da pistas ingeniosas para que tu equipo acierte las palabras correctas del tablero.",
    "skribbl-io": "Dibuja y adivina palabras.",
    "gartic-phone": "El juego del teléfono con dibujos y frases.",
    "linkterpol": "Adivina si el retrato es de LinkedIn o de Interpol.",
    "pedantix": "Descubre la página de Wikipedia.",
    "cemantix": "Descubre la palabra.",
    "brandcolorgame": "Adivina el color de la marca.",
    "blindtest-gg":
      "Adivina las canciones más rápido que nadie en un blind test musical.",
    "what-the-tune":
      "Blind test musical: adivina la canción a partir de un breve fragmento de audio.",
  },
};
