import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        journal: `${root}index.html`,
        minimal: `${root}minimal.html`,
        original: `${root}original.html`,
      },
    },
  },
});
