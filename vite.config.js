import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";
import monacoEditorPluginModule from 'vite-plugin-monaco-editor';
import svgr from 'vite-plugin-svgr';
import { analyzer } from "vite-bundle-analyzer";
import { fileURLToPath } from 'url';
// Constants
const monacoEditorPlugin = monacoEditorPluginModule.default;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MONACO_WORKERS = ['json', 'css', 'html', 'typescript'];
const PWA_CACHE_DURATION = 60 * 60 * 24 * 30; // 30 days in seconds

const DIRECTORIES = [
  '__tests__',
  'actions',
  'ai',
  'api',
  'assets',
  'components',
  'config',
  'constants',
  'context',
  'hooks',
  'lib',
  'middleware',
  'pages',
  'router',
  'services',
  'store',
  'utils',
  'workers',
];

const createAliases = (basePath, dirs) => {
  const aliases = { '@': basePath };
  dirs.forEach(dir => {
    aliases[dir] = path.join(basePath, dir);
  });
  return aliases;
};

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      swcOptions: {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
              development: process.env.NODE_ENV === 'development',
              refresh: true,
            },
          },
        },
      },
    }),
    svgr(),
    monacoEditorPlugin({ languageWorkers: ['editorWorkerService'] }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
      },
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      threshold: 10240,
    }),
    analyzer({
      open: true,
    }),
  ],
  resolve: {
    alias: {
      ...createAliases(path.resolve(__dirname, 'src'), DIRECTORIES),
      humanIcons: path.resolve(__dirname, 'src/assets/humanIcons'),
      // Replace the constants alias with this:
      constants: path.resolve(
        __dirname,
        'node_modules/rollup-plugin-node-polyfills/polyfills/constants.js'
      ),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-icons', '@radix-ui/react-slot'],
          'motion-vendor': ['framer-motion'],
        },
      },
    },
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
  },
  server: {
    port: 3000,
    open: true,
  },
});
