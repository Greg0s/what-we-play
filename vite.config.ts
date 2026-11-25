import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The client and the server builds must agree on the day (src/featured.ts):
// `BUILD_DAY` pins it, otherwise it is today, in UTC.
const buildDay = process.env.BUILD_DAY ?? new Date().toISOString().slice(0, 10);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  define: {
    __BUILD_DAY__: JSON.stringify(buildDay),
  },
});
