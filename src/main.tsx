import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import { LanguageProvider } from "./i18n";
import { parseRoute } from "./routes";

const container = document.getElementById("root")!;

// The URL says which page this is, and the build rendered that same route into
// this file — so parsing it here is what makes the first client render match.
const route = parseRoute(window.location.pathname);

const app = (
  <StrictMode>
    <LanguageProvider initialLanguage={route.language}>
      <App route={route} />
    </LanguageProvider>
  </StrictMode>
);

// The production build ships prerendered markup, so we hydrate it. `vite dev`
// serves the bare index.html with an empty root, where there is nothing to
// hydrate and we mount normally.
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
