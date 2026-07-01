import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Reeflog — Vite build config.
// Vercel auto-detects Vite: build = `vite build`, output = `dist`.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
