import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://yushi91.com",
  output: "static",
  integrations: [sitemap()],
});
