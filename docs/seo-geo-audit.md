# Audit SEO & GEO — What we play?

Audit statique du dépôt (révision `1a2665e`) et du build de production généré
localement via `pnpm run build`. « GEO » est lu ici comme *Generative Engine
Optimization* : être trouvé et cité par ChatGPT, Perplexity, Claude et les AI
Overviews de Google. Le volet géographique/linguistique est traité sous l'angle
`hreflang`.

| Axe | État | Résumé |
| --- | --- | --- |
| SEO classique | Fragile | Une seule URL indexable, contenu rendu en JS, pas de sitemap ni de robots.txt |
| GEO | Nul | Les crawlers IA n'exécutent pas le JS : ils reçoivent une page vide |
| Ciblage linguistique | Perdu | FR et ES existent mais n'ont pas d'URL propre |
| Fondations | Saines | Données propres, i18n typée, responsive, lint vert — tout est réparable |

## 1. Le constat central

Le corps du document réellement servi par GitHub Pages :

```html
<!-- dist/index.html -->
<body>
  <div id="root"></div>
</body>
```

Zéro mot de contenu. Le seul texte lisible sans JavaScript est le `<title>` et
la `meta description`, tous deux figés en anglais. Les 26 jeux, leurs
descriptions traduites en 3 langues et leurs plages de joueurs — environ
2 500 caractères de contenu unique — sont entièrement injectés par le bundle JS.

**Pourquoi c'est plus grave pour le GEO que pour le SEO.** Googlebot sait
exécuter du JavaScript, dans une seconde vague de crawl, avec un délai et sans
garantie. Les crawlers des moteurs génératifs, eux, ne rendent pratiquement pas
le JS : `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`,
`Applebot-Extended`, `CCBot` récupèrent le HTML brut et s'arrêtent là. Pour eux
le site est une page blanche titrée — il ne peut être ni résumé, ni comparé, ni
cité. Or « quel jeu jouer en ligne à 5 ? » est exactement le type de question
qu'on pose désormais à un assistant.

**La bonne nouvelle.** L'hébergement statique n'est pas un obstacle. Le contenu
est 100 % connu au moment du build (26 entrées JSON, 3 locales typées) : un
pré-rendu à la compilation produit du HTML complet sans changer d'hébergeur.

## 2. Constats détaillés

Vérifiés sur le build de production réel, pas sur le code source.

### P0 — bloquants

1. **Rendu entièrement côté client.** `dist/index.html` → `<body><div id="root"></div></body>`.
2. **Une seule URL pour tout le site.** La langue et le nombre de joueurs vivent
   dans un `useState` (`src/App.tsx:8`) et dans `localStorage`
   (`src/i18n/config.ts`), jamais dans l'URL. Aucun lien partageable vers « les
   jeux à 4 », trois versions linguistiques sur la même adresse.
3. **Pas de `robots.txt`.** Aucune directive de crawl, aucune déclaration de
   sitemap, aucune position explicite vis-à-vis des crawlers IA.
4. **Pas de `sitemap.xml`.** Rien à soumettre à Search Console ni à Bing.
5. **Aucune donnée structurée.** Pas une ligne de JSON-LD, alors que le modèle
   de données correspond presque exactement à `schema.org/VideoGame`, qui
   possède une propriété `numberOfPlayers` — littéralement le critère de tri du
   site.

### P1 — importants

6. **`og:image` en URL relative.** `content="./what-we-play-metadata.jpg"` : la
   spec Open Graph exige une URL absolue. Facebook, LinkedIn, Slack, Discord et
   X ne résolvent pas ce chemin — les partages sortent sans visuel. Idem
   `twitter:image`.
7. **Pas de `hreflang`, pas d'URL par langue.** Googlebot crawle en `en-US` : il
   ne verra jamais les versions FR et ES. Deux traductions complètes, invisibles.
8. **`lang="en"` figé dans le HTML.** `document.documentElement.lang` n'est
   corrigé qu'après hydratation (`src/i18n/LanguageProvider.tsx`).
9. **Pas de `rel="canonical"`.**
10. **Contenu très mince.** Même rendu : un titre et 26 libellés courts. Rien
    pour la longue traîne, rien qu'un modèle puisse citer avec du contexte.
11. **Polices Google chargées via `@import` CSS** (`src/App.scss:2`). Chaîne
    HTML → CSS → CSS Google → fichiers, en série et bloquant le rendu, sans
    `preconnect`. Trois familles dont deux variables. Impact direct sur le LCP.

### P2 — finitions

12. **Type MIME de favicon incohérent** : `type="image/svg+xml"` sur un PNG.
    Pas d'`apple-touch-icon` ni de manifeste.
13. **Balises Twitter en `property=`** au lieu de `name=`. Et
    `<meta name="title">` n'existe dans aucune spec.
14. **Métadonnées sociales incomplètes** : manquent `og:site_name`, `og:locale`,
    `og:locale:alternate`, `og:image:width`/`height`/`alt`, `theme-color`.
15. **26 requêtes tierces pour les favicons des jeux**
    (`src/components/game.tsx:10`, service de favicons Google) : requêtes
    cross-origin sans `preconnect`, dépendance externe, fuite de données.
16. **204 ko de JS (65 ko gzip) pour 26 liens.** Le LCP dépend intégralement de
    l'exécution du bundle.
17. **Structure sémantique plate** : pas de `<main>`, la grille est un `<div>` et
    non une liste, 26 `<h2>` frères sans titre de section, liens
    `target="_blank"` sans `rel` explicite.

## 3. Plan d'amélioration

Cinq phases dans un ordre de dépendance réel.

### Phase 0 — réparer ce qui est cassé (~1 h, aucun risque) — ✅ faite

Corrections isolées dans `index.html` et `public/`.

- URL absolues pour `og:image` et `twitter:image`.
- Ajouter `rel="canonical"`.
- Corriger le type MIME de la favicon, ajouter `apple-touch-icon` et `theme-color`.
- Passer les balises Twitter en `name=`, supprimer `meta name="title"`.
- Compléter l'Open Graph (`og:site_name`, `og:locale`, dimensions, `alt`).
- Créer `public/robots.txt` avec déclaration de sitemap et politique crawlers IA.
- Sortir les polices du CSS : `preconnect` + `<link stylesheet>` dans le `<head>`,
  et `preconnect` vers `www.google.com` pour les favicons.

Deux points relevés à l'exécution. `src/i18n/LanguageProvider.tsx` interrogeait
des balises supprimées ou renommées ici (`meta[name="title"]`,
`meta[property="twitter:*"]`) : ses sélecteurs ont été mis à jour, sans quoi le
changement de langue aurait silencieusement cessé de mettre à jour les
métadonnées. Et pour que la ligne `Sitemap:` du `robots.txt` ne pointe pas vers
un fichier absent, un `public/sitemap.xml` statique à une seule URL a été livré ;
la phase 2 le remplacera par un fichier généré.

### Phase 1 — pré-rendre le HTML au build (~½ journée, débloque tout) — ✅ faite

L'application reste une SPA React ; on ajoute une étape de génération statique
qui écrit le HTML final dans `dist/`.

- Adopter `vite-react-ssg` (intégration Vite + React 19, gère routes et `<head>`
  par page), ou un script `renderToStaticMarkup` maison d'environ 40 lignes si
  l'on préfère zéro dépendance.
- Hydrater au lieu de monter : `hydrateRoot` dans `src/main.tsx`.
- Rendre `detectLanguage()` compatible SSR (les gardes `typeof navigator`
  existent déjà, vérifier `localStorage`).
- Vérifier que les jeux apparaissent dans le HTML brut.

Réalisé avec un script maison (`scripts/prerender.js`) plutôt qu'avec
`vite-react-ssg` : ce dernier est bâti autour de react-router, que le projet
n'utilise pas encore. Le choix se rediscutera en phase 2, quand il y aura de
vraies routes. À noter, le rendu utilise `renderToString` et non
`renderToStaticMarkup` : seul le premier produit un balisage hydratable.

Le corps de `dist/index.html` passe de 0 à ~1 140 caractères de texte lisible
sans JavaScript, soit les 16 jeux de la vue par défaut (4 joueurs). Les 10 autres
restent hors du HTML tant que la phase 2 n'a pas créé une page par nombre de
joueurs. Le compteur de joueurs, lui, vit dans un attribut `value` et non dans du
texte : un robot lit « joueurs » sans le nombre, ce que la phase 2 corrige aussi.

Deux points d'attention introduits ici, documentés dans `CLAUDE.md` : plus rien
ne doit lire `navigator`, `window` ou `localStorage` pendant le rendu, sous peine
de désaccord silencieux avec le HTML prérendu ; et `pnpm run dev` monte l'appli
normalement là où la production hydrate, `main.tsx` distinguant les deux cas.

> **Piège.** `vite.config.ts` utilise `base: "./"`. Dès que des pages existent
> dans des sous-dossiers (`/fr/`), un chemin relatif y résout vers
> `/fr/assets/…` qui n'existe pas. Passer à `base: "/"` avec la phase 2.

### Phase 2 — passer de 1 à ~33 pages indexables (~1 journée, fort impact) — ✅ faite

Personne ne cherche « annuaire de jeux » ; tout le monde cherche « jeu en ligne
à 4 ».

| Langue | Accueil | Page par nombre de joueurs | Pages |
| --- | --- | --- | --- |
| Anglais | `/` | `/games-for-4-players/` | 1 + 10 |
| Français | `/fr/` | `/fr/jeux-a-4-joueurs/` | 1 + 10 |
| Espagnol | `/es/` | `/es/juegos-para-4-jugadores/` | 1 + 10 |

- Générer les pages 1 à 10 joueurs ; au-delà le catalogue se répète — garder le
  compteur libre côté client.
- `hreflang` réciproque sur chaque page, plus `x-default` vers l'anglais.
- `lang` et `canonical` corrects par page, écrits dans le HTML statique.
- Titre et description uniques par page (« 12 jeux en ligne à jouer à 4,
  gratuits et sans installation »).
- `sitemap.xml` généré depuis `games.json` et la liste des locales, avec `lastmod`.
- Le compteur met à jour l'URL sans rechargement.

33 pages générées, vérifiées automatiquement : canonique auto-référente partout,
`hreflang` réciproques (chaque page cite les trois langues plus `x-default`, et
chaque cible renvoie bien vers elle), titres et descriptions tous uniques. Le
catalogue passe de 16 à **26 jeux sur 26** présents dans le HTML statique.

Deux écarts par rapport à la liste ci-dessus, tous deux volontaires :

- **`replaceState` plutôt que `pushState` pour le compteur.** Le champ est un
  contrôle continu : `pushState` créait une entrée d'historique par frappe, ce
  qui rendait le bouton Retour inutilisable. Les actions discrètes — changement
  de langue, clic sur un lien de nombre de joueurs — poussent bien une entrée.
- **Un `<nav>` de liens 1 à 10 ajouté sous le compteur.** Sans lui les 30 pages
  générées seraient orphelines, atteignables par le seul sitemap, ce qui est le
  plus sûr moyen de ne pas les faire explorer. Ce sont de vrais `<a href>` :
  ils fonctionnent sans JavaScript et se comportent en navigation interne quand
  il est disponible. C'est le seul ajout visible de cette phase.

Pas de `lastmod` dans le sitemap : la seule date disponible au build est celle du
déploiement, et la faire changer à chaque déploiement sans que le contenu bouge
apprend surtout aux robots à ignorer le signal. À reprendre en phase 3 avec
`dateModified`.

Reste ouvert : `/` et `/games-for-4-players/` listent les mêmes jeux, avec des
titres différents. C'est le recouvrement classique accueil//catégorie, que les
moteurs arbitrent seuls ; le paragraphe d'introduction de la phase 3 le lèvera.

> **Corrigé dans cette phase.** Le filtre de
> `src/components/games.tsx` écrit
> `(players >= min && players <= max) || max === -1` : quand `maxPlayers` vaut
> `-1`, le minimum est ignoré. Sans effet visible aujourd'hui (tous les jeux sans
> maximum ont `minPlayers: 1`), mais un futur jeu « 2 joueurs minimum, pas de
> maximum » apparaîtrait sur la page « 1 joueur » — et l'erreur serait figée dans
> du HTML indexé. Corrigé en
> `players >= min && (max === -1 || players <= max)`, après vérification que
> l'ancienne et la nouvelle formule donnent exactement le même résultat pour
> chaque jeu de 1 à 99 joueurs — la correction ne change rien aujourd'hui, elle
> ferme la porte.

### Phase 3 — rendre le contenu citable par les modèles (~1 journée, cœur du GEO) — ✅ faite

- JSON-LD `ItemList` de `VideoGame` par page : `numberOfPlayers`, `playMode`,
  `gamePlatform: "Web browser"`, `url`. Le schéma épouse exactement `games.json`.
- JSON-LD `WebSite` sur l'accueil : nom, description, `inLanguage`.
- `BreadcrumbList` sur les pages par nombre de joueurs.
- Un paragraphe d'introduction répondant directement à la question de la page,
  en tête de document — c'est cette phrase que les modèles reprennent.
- Une FAQ courte (3 à 5 questions réelles) balisée en `FAQPage`.
- Afficher le nombre de joueurs en texte sur chaque carte (« 2 à 16 joueurs ») :
  l'information est dans les données mais n'apparaît nulle part à l'écran.
- `llms.txt` à la racine : index Markdown du catalogue. Convention émergente,
  coût quasi nul.
- Exposer `dateModified` — la fraîcheur pèse dans la sélection des sources.

69 blocs JSON-LD générés et validés : 33 `CollectionPage` (une par page), 3
`WebSite` et 3 `FAQPage` (accueils seulement), 30 `BreadcrumbList` (pages de
comptage). Le texte lisible sans JavaScript passe de ~1 140 à ~1 970 caractères
sur l'accueil.

Décisions prises en chemin :

- **`maxValue` est omis quand `maxPlayers` vaut `-1`**, plutôt que rempli d'un
  nombre arbitraire : c'est ainsi que schema.org exprime « pas de limite », et
  inventer un maximum serait une affirmation que les données ne portent pas.
- **La FAQ n'est que sur les trois accueils.** La répéter sur les 33 pages
  aurait fabriqué du contenu dupliqué, et c'est là qu'atterrit une question
  « c'est quoi ce site ». Effet de bord utile : l'accueil et
  `/games-for-4-players/` ne se ressemblent plus, ce qui lève le recouvrement
  signalé en phase 2.
- **`dateModified` vient du dernier commit touchant `src/games.json` ou
  `src/i18n/locales`**, pas de l'horloge du build. Si git ne peut pas répondre
  (clone superficiel), le champ est omis plutôt que deviné — d'où le
  `fetch-depth: 0` ajouté au workflow de déploiement.
- **`<main>` ajouté et `rel="noopener"` sur les liens de jeux**, deux constats P2
  de l'audit qui tombaient à leur place ici.
- **La hauteur des cartes passe de 10,75 à 12,5 rem** pour loger la plage de
  joueurs sans tronquer les descriptions ; vérifié qu'aucune carte n'est coupée.

Réserve sur la FAQ : Google a retiré les résultats enrichis `FAQPage` en 2023
pour la plupart des sites. Le balisage reste utile pour les moteurs génératifs,
qui y lisent des paires question/réponse propres, mais il ne faut pas en attendre
d'affichage enrichi dans les résultats de recherche.

Les affirmations du contenu et du balisage (`isAccessibleForFree`, « sans rien
installer ») reprennent ce que le README avance sur le catalogue. Si cela cesse
d'être vrai de tous les jeux, les réponses de la FAQ et `isAccessibleForFree`
doivent bouger ensemble.

`public/robots.txt` proposé :

```
User-agent: *
Allow: /

# Moteurs génératifs — autorisés pour être cité en réponse
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ClaudeBot
User-agent: PerplexityBot
User-agent: Google-Extended
User-agent: Applebot-Extended
Allow: /

Sitemap: https://whatweplay.gregoiretinn.es/sitemap.xml
```

C'est une décision, pas une évidence technique : autoriser ces robots, c'est
accepter que le catalogue serve à entraîner et à alimenter des réponses
d'assistants. Pour un annuaire dont le but est d'être trouvé, l'autorisation est
cohérente — mais elle se choisit.

### Phase 4 — performance et mesure (~½ journée)

- Auto-héberger les favicons des jeux (récupérées au build, converties en WebP) :
  supprime 26 requêtes tierces et la dépendance à Google.
- Précharger `banner.jpg` et le convertir en WebP/AVIF (56 ko, élément LCP probable).
- Réduire les familles de polices : Honk ne sert qu'au `h1`, Roboto est chargé en
  variable 100–900 romain *et* italique.
- Déclarer le site dans Google Search Console et Bing Webmaster Tools, soumettre
  le sitemap.
- Ajouter un contrôle au CI : échouer le build si `dist/index.html` ne contient
  pas les 26 noms de jeux — c'est le garde-fou anti-régression.
- Tester régulièrement les questions cibles sur ChatGPT, Perplexity et les AI
  Overviews : le site est-il cité, et avec quelles données ?

## 4. Par où commencer

| Ordre | Action | Effort | Impact SEO | Impact GEO |
| --- | --- | --- | --- | --- |
| 1 | Phase 0 — métadonnées et `robots.txt` | ~1 h | Faible | Faible |
| 2 | Phase 1 — pré-rendu du HTML | ~½ j | **Décisif** | **Décisif** |
| 3 | Phase 2 — URL par langue et par nombre de joueurs | ~1 j | Fort | Moyen |
| 4 | Phase 3 — JSON-LD, contenu, `llms.txt` | ~1 j | Moyen | Fort |
| 5 | Phase 4 — performance et mesure | ~½ j | Moyen | Faible |

Si une seule chose devait être faite : **la phase 1**. Tant que le HTML est vide,
les balises méta soignées, les traductions et les 26 jeux n'existent pour aucun
moteur. Les phases 2 et 3 n'ont d'ailleurs pas de sens avant elle — elles
produisent du contenu que personne ne lirait.

La phase 0 peut partir tout de suite : indépendante, sans risque, et elle répare
au passage un bug visible pour les humains — les aperçus de partage sans image.

## Méthode et limites

Audit statique du dépôt à la révision `1a2665e` et du build de production généré
localement (`pnpm run build`, Vite 7). Le domaine public n'était pas joignable
depuis l'environnement d'analyse ; les constats portent donc sur les fichiers
effectivement déployés par `.github/workflows/deploy.yml`, qui publie `dist/`
tel quel.

Non couvert : netlinking et autorité de domaine, analyse concurrentielle,
recherche de mots-clés chiffrée, données réelles de Search Console (le site n'y
est pas déclaré), mesure de Core Web Vitals sur le terrain — seules les tailles
de bundle et la chaîne de chargement ont été examinées.
