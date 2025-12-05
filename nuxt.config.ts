import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import tsConfigPaths from 'vite-tsconfig-paths';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint"],
  devtools: { enabled: true },
  css: ["~/assets/styles/main.css"],
  compatibilityDate: "2025-05-15",

  runtimeConfig: {
    public: {
      chatApiUrl: process.env.CHAT_API_URL || 'http://localhost:3001'
    }
  },

  vite: {
    plugins: [
      tailwindcss(),
      tsConfigPaths(),
      {
        name: "force-full-reload",
        handleHotUpdate(ctx) {
          if (ctx.file.endsWith(".ts")) {
            ctx.server.ws.send({
              type: "full-reload",
              path: "src/*",
            });
          }
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  },

  eslint: {
    config: {
      stylistic: {
        indent: "tab",
        semi: true,
      },
    },
  },
});
