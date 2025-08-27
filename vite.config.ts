import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: path.resolve(__dirname, "public/sidepanel.html"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]"
      }
    },
    copyPublicDir: true,
  },
  publicDir: "public",
}));