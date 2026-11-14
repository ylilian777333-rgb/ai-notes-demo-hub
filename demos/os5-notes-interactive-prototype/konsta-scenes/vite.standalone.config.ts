import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(projectRoot, "standalone");

export default defineConfig({
  root,
  base: "./",
  plugins: [react()],
  build: {
    outDir: resolve(projectRoot, "../../daily-outing-ai-konsta"),
    emptyOutDir: true,
    cssCodeSplit: false,
  },
});
