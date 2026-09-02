import { useEffect } from "react";
import { pageMeta } from "./pageMeta";
import { buildUrl, type Route } from "./routes";

function setContent(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute("content", content);
}

/**
 * Keeps the document's metadata in step with the route once the page is
 * interactive. The prerendered HTML already carries the right values on
 * arrival; this is for what happens after, when the visitor changes the player
 * count or the language without a page load.
 */
export function useDocumentMeta(route: Route) {
  useEffect(() => {
    const { title, description } = pageMeta(route);
    const url = buildUrl(route);

    document.documentElement.lang = route.language;
    document.title = title;

    for (const selector of [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
    ]) {
      setContent(selector, title);
    }

    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ]) {
      setContent(selector, description);
    }

    setContent('meta[property="og:url"]', url);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
  }, [route]);
}
