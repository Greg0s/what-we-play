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
  theme: {
    light: "Cambiar a tema claro",
    dark: "Cambiar a tema oscuro",
  },
  content: {
    playerRange: (min: number, max: number) => {
      const label = (count: number) =>
        count === 1 ? "1 jugador" : `${count} jugadores`;
      if (max === -1) return `${label(min)} o más`;
      if (min === max) return label(min);
      return `${min} a ${max} jugadores`;
    },
  },
  howItWorks: {
    trigger: "Cómo funciona",
    title: "Cómo funciona",
    intro:
      "¿A qué jugamos? es un sitio que reúne juegos en línea geniales para vuestras mejores noches con amigos y familia.",
    paragraph1: {
      before: "Los juegos están elegidos con 💖 por ",
      linkText: "una persona real",
      after: " que ha pasado muchas horas descubriéndolos todos.",
    },
    paragraph2:
      "Todos los juegos son gratis, fácilmente accesibles desde un navegador en cualquier dispositivo (ordenador, teléfono, tableta, nevera conectada), jugables en solitario o en grupo: indica cuántos sois, tus filtros, recorre la lista y ¡diviértete!",
    close: "Cerrar",
  },
  catalogue: {
    searchPlaceholder: "Busca un juego por nombre, etiqueta o palabra clave",
    clearSearch: "Borrar búsqueda",
    searchingWholeCatalogue:
      "Buscando en todo el catálogo — el número de jugadores se ignora mientras buscas.",
    backTo: (players: number) =>
      `Volver a ${players} ${players === 1 ? "jugador" : "jugadores"}`,
    resultCount: (count: number) => (count === 1 ? "1 juego" : `${count} juegos`),
    scopeForPlayers: (players: number) =>
      players === 1 ? "para 1 jugador" : `para ${players} jugadores`,
    scopeAll: (total: number) => `de los ${total} juegos`,
    emptyTitle: (query: string) => `Nada coincide con «${query}»`,
    emptyHint:
      "Prueba el nombre de un juego, una palabra clave como «dibujo» o «música», o una etiqueta como «solo».",
    filtersButton: "Filtros",
    resetFilters: "Restablecer filtros",
    screenShareLabel: "Pantalla compartida",
    screenShareDescription:
      "Juegos que técnicamente no son multijugador, pero son divertidos jugados en grupo por pantalla compartida.",
    mobileFriendly: "Apto para móvil",
    noAccountNeeded: "No requiere cuenta",
    showResults: (count: number) =>
      count === 1 ? "Mostrar 1 juego" : `Mostrar ${count} juegos`,
    tagSolo: "Jugable en solitario",
    tagSoloWithStrangers: "Jugable con desconocidos",
    tagMultiplayer: "Partida privada posible",
    tagScreenShare: "Jugable por pantalla compartida",
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
    "ethnoguessr":
      "Adivina el origen étnico o geográfico de un rostro promediado y coloca tu respuesta en el mapa.",
    "spotle-movies": "Adivina la película del día haciendo propuestas.",
    "spotle-music": "Adivina el artista musical del día haciendo propuestas.",
    "fermi": "Estima lo más cerca posible la respuesta a tres preguntas imposibles cada día.",
    "gamedle": "Adivina el videojuego a partir de una captura pixelada, su portada, un personaje o palabras clave.",
    "doggoguessr": "Adivina de dónde viene una raza de perro en un mapa del mundo.",
    "movieguessr": "Adivina la película a partir de un plano al azar. Reto diario, solo o salas de hasta 50 jugadores.",
  },
  gameKeywords: {
    "uwufufu": ["torneo", "votar", "favorito", "clasificación", "opinión", "debate"],
    "wikipedia-speedruns": [
      "wiki", "carrera", "enlaces", "cultura", "conocimientos", "velocidad",
    ],
    "more-or-less-game": [
      "más o menos", "comparación", "números", "estimación", "estadísticas",
    ],
    "damn-dog": ["wikihow", "imágenes", "gracioso", "ilustración", "tutorial", "absurdo"],
    "framed": ["películas", "cine", "diario", "fotograma", "wordle", "cultura"],
    "the-higher-lower-game": [
      "google", "búsquedas", "tendencias", "comparación", "popularidad", "más o menos",
    ],
    "le-petit-bac": [
      "tutti frutti", "basta", "stop", "palabras", "categorías", "letras", "vocabulario",
    ],
    "connect-the-stars": [
      "famosos", "celebridades", "películas", "actores", "vínculos", "cine", "cultura",
    ],
    "make-it-meme": ["meme", "humor", "gracioso", "votar", "creatividad", "fiesta"],
    "tier-list-maker": ["clasificación", "ranking", "tier list", "debate", "opinión"],
    "guess-the-game": ["videojuegos", "gaming", "captura", "diario", "wordle", "cultura"],
    "tixid": [
      "dixit", "cartas", "historias", "farol", "imaginación", "ilustraciones", "creatividad", "juego de mesa",
    ],
    "bombparty": [
      "palabras", "mecanografía", "teclado", "ortografía", "sílabas", "velocidad", "vocabulario",
    ],
    "popsauce": [
      "trivia", "preguntas", "cultura pop", "imágenes", "velocidad", "cultura general",
    ],
    "rentguessr": [
      "inmobiliaria", "vivienda", "piso", "alquiler", "precio", "estimación", "geografía",
    ],
    "openguessr": [
      "geoguessr", "geografía", "mapa", "street view", "viajes", "países", "mundo",
    ],
    "squiz": [
      "quiz", "trivia", "cultura general", "preguntas", "conocimientos", "kahoot",
    ],
    "codenames": [
      "palabras", "pistas", "equipos", "asociación", "espías", "juego de mesa", "deducción",
    ],
    "skribbl-io": ["dibujo", "pictionary", "boceto", "adivinar", "palabras", "fiesta"],
    "gartic-phone": [
      "dibujo", "teléfono descompuesto", "teléfono escacharrado", "boceto", "gracioso", "fiesta",
    ],
    "linkterpol": ["linkedin", "interpol", "caras", "retratos", "criminales", "gracioso"],
    "pedantix": ["palabras", "semántica", "diario", "acertijo", "cultura", "francés"],
    "cemantix": ["palabras", "semántica", "diario", "acertijo", "vocabulario", "francés"],
    "brandcolorgame": ["logos", "marcas", "colores", "diseño", "marketing", "memoria"],
    "blindtest-gg": [
      "música", "canciones", "blind test", "quiz", "artistas", "velocidad",
    ],
    "what-the-tune": ["música", "canciones", "blind test", "quiz", "heardle", "audio"],
    "ethnoguessr": ["caras", "geografía", "mapa", "orígenes", "países", "mundo"],
    "spotle-movies": ["películas", "cine", "diario", "wordle", "actores", "pistas"],
    "spotle-music": ["música", "artista", "cantante", "diario", "wordle", "pistas"],
    "fermi": ["estimación", "cálculo", "matemáticas", "números", "diario", "cultura general", "rompecabezas"],
    "gamedle": ["videojuego", "quiz", "diario", "wordle", "adivinar", "trivia"],
    "doggoguessr": ["perro", "raza", "geografía", "mapa", "diario", "adivinar"],
    "movieguessr": ["película", "cine", "quiz", "diario", "adivinar", "trivia"],
  },
};
