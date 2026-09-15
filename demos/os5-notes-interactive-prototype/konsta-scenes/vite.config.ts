import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot=fileURLToPath(new URL(".",import.meta.url));

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  build: {
    outDir: resolve(projectRoot, "../assets"),
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: resolve(projectRoot, "src/index.tsx"),
      name: "OS5KonstaScenesBundle",
      formats: ["iife"],
      fileName: () => "os5-konsta-scenes.js"
    },
    rollupOptions: {
      output: {
        assetFileNames: assetInfo => assetInfo.name?.endsWith(".css")
          ? "os5-konsta-scenes.css"
          : "os5-konsta-[name][extname]"
      }
    }
  }
});
