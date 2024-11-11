import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig({
  plugins: [
    react({
      swcOptions: {
        jsc: {
          transform: {
            react: {
              runtime: "automatic",
              development: process.env.NODE_ENV === "development",
              refresh: true,
            },
          },
        },
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}"],
      },
    }),
    viteCompression({
      algorithm: "brotliCompress",
      threshold: 10240,
    }),
    analyzer({
      open: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "ui-vendor": ["@radix-ui/react-icons", "@radix-ui/react-slot"],
          "motion-vendor": ["framer-motion"],
        },
      },
    },
    sourcemap: true,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "zustand"],
  },
  server: {
    port: 3000,
    open: true,
  },
});
