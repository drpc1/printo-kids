// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  redirects: {
    "/labirynt": "/maze",
    "/symetria": "/symmetry",
    "/sekwencje": "/sequences",
    "/dyktando": "/dictation",
  },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  session: false,
  adapter: cloudflare({ imageService: "compile" }),
});
