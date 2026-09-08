import { defineConfig, devices } from "@playwright/test";

/**
 * Runs against the prerendered `dist/` build, not the dev server: SEO tags,
 * hydration and lazy-loaded favicons only exist in the shipped output, and
 * that is what these tests are meant to catch regressions in. Run
 * `pnpm run build` before `pnpm run test:e2e` — the web server below only
 * serves the existing `dist/`, it does not build it.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // In CI: inline PR annotations, plus an HTML report (with traces on retry)
  // uploaded as a build artifact for debugging a failure after the fact.
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "html",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
