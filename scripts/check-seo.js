/**
 * Checks the built site, after prerendering, and fails the build on anything
 * that would quietly undo the SEO work.
 *
 * It reads `dist/` only — it does not import the code that produced it. A check
 * that re-derives its expectations from the generator would agree with it even
 * when both are wrong; this one looks at the files a crawler will actually
 * download.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");

const problems = [];
const fail = (message) => problems.push(message);

async function exists(relative) {
  try {
    await stat(path.join(distDir, relative));
    return true;
  } catch {
    return false;
  }
}

async function htmlFiles(dir = distDir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const found = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(full)));
    else if (entry.name === "index.html") found.push(full);
  }

  return found;
}

const first = (html, pattern) => html.match(pattern)?.[1];

// ---------------------------------------------------------------- required files

for (const file of ["robots.txt", "sitemap.xml", "llms.txt", "index.html"]) {
  if (!(await exists(file))) fail(`Fichier manquant : dist/${file}`);
}

const robots = await readFile(path.join(distDir, "robots.txt"), "utf8");
const sitemapDeclaration = first(robots, /^Sitemap:\s*(\S+)$/m);
if (!sitemapDeclaration) fail("robots.txt ne déclare pas de Sitemap");

const origin = sitemapDeclaration
  ? new URL(sitemapDeclaration).origin
  : "https://whatweplay.gregoiretinn.es";

// ---------------------------------------------------------------- pages

const pages = new Map();

for (const file of await htmlFiles()) {
  const relative = path.relative(distDir, path.dirname(file));
  const url = `${origin}/${relative === "" ? "" : `${relative}/`}`.replace(
    /\\/g,
    "/"
  );
  const html = await readFile(file, "utf8");

  pages.set(url, {
    file: path.relative(root, file),
    html,
    lang: first(html, /<html lang="([^"]+)"/),
    title: first(html, /<title>([^<]*)<\/title>/),
    description: first(html, /<meta name="description" content="([^"]*)"/),
    canonical: first(html, /rel="canonical" href="([^"]+)"/),
    alternates: Object.fromEntries(
      [...html.matchAll(/rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(
        (m) => [m[1], m[2]]
      )
    ),
    cards: (html.match(/class="game"/g) ?? []).length,
    jsonLd: [...html.matchAll(
      /<script type="application\/ld\+json">(.*?)<\/script>/gs
    )].map((m) => m[1]),
  });
}

if (pages.size === 0) fail("Aucune page trouvée dans dist/");

for (const [url, page] of pages) {
  const where = page.file;

  if (!page.title) fail(`${where} : pas de <title>`);
  if (!page.description) fail(`${where} : pas de meta description`);
  if (!page.lang) fail(`${where} : pas d'attribut lang`);
  if (page.cards === 0) fail(`${where} : aucune carte de jeu dans le HTML`);

  if (page.canonical !== url) {
    fail(`${where} : canonical "${page.canonical}" au lieu de "${url}"`);
  }

  // hreflang has to be reciprocal, or search engines ignore the whole cluster.
  for (const [hreflang, target] of Object.entries(page.alternates)) {
    if (hreflang === "x-default") continue;

    const other = pages.get(target);
    if (!other) {
      fail(`${where} : hreflang ${hreflang} pointe vers ${target}, qui n'existe pas`);
      continue;
    }
    if (other.lang !== hreflang) {
      fail(`${where} : hreflang ${hreflang} pointe vers une page en ${other.lang}`);
    }
    if (other.alternates[page.lang] !== url) {
      fail(`${where} : ${target} ne renvoie pas vers cette page en ${page.lang}`);
    }
  }

  const xDefault = page.alternates["x-default"];
  if (!xDefault || pages.get(xDefault)?.lang !== "en") {
    fail(`${where} : x-default absent ou non anglais (${xDefault})`);
  }

  if (page.jsonLd.length === 0) fail(`${where} : aucun JSON-LD`);

  for (const raw of page.jsonLd) {
    let block;
    try {
      block = JSON.parse(raw.replaceAll("\\u003c", "<"));
    } catch (error) {
      fail(`${where} : JSON-LD illisible — ${error.message}`);
      continue;
    }

    if (block["@type"] !== "CollectionPage") continue;

    const items = block.mainEntity?.itemListElement ?? [];
    if (items.length !== page.cards) {
      fail(`${where} : ${items.length} jeux en JSON-LD pour ${page.cards} cartes`);
    }
    if (items.length !== block.mainEntity?.numberOfItems) {
      fail(`${where} : numberOfItems ne correspond pas à la liste`);
    }
    for (const { item } of items) {
      for (const field of ["name", "url", "description", "numberOfPlayers"]) {
        if (!item?.[field]) fail(`${where} : "${item?.name}" sans ${field}`);
      }
    }
  }
}

// Duplicate titles mean two pages competing for the same query.
for (const field of ["title", "description"]) {
  const seen = new Map();
  for (const [url, page] of pages) {
    const value = page[field];
    if (seen.has(value)) {
      fail(`${field} identique sur ${seen.get(value)} et ${url} : « ${value} »`);
    } else {
      seen.set(value, url);
    }
  }
}

// ---------------------------------------------------------------- sitemap

const sitemap = await readFile(path.join(distDir, "sitemap.xml"), "utf8");
const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));

for (const url of pages.keys()) {
  if (!listed.has(url)) fail(`sitemap.xml n'annonce pas ${url}`);
}
for (const url of listed) {
  if (!pages.has(url)) fail(`sitemap.xml annonce ${url}, qui n'a pas été généré`);
}

// ---------------------------------------------------------------- verdict

if (problems.length > 0) {
  console.error(`check-seo : ${problems.length} problème(s)\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `check-seo : ${pages.size} pages — canonical, hreflang réciproques, JSON-LD, ` +
    `titres uniques et sitemap cohérents`
);
