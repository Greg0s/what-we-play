import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import { LanguageProvider } from "./i18n";

const container = document.getElementById("root")!;

const app = (
  <StrictMode>
    <LanguageProvider>
      <App />
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
