import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  build: {
    rollupOptions: {
      input: {
        journal: `${root}index.html`,
        journalLanding: `${root}journal.html`,
        minimal: `${root}minimal.html`,
        original: `${root}original.html`,
      },
    },
  },
});
