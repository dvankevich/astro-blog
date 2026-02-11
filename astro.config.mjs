import { defineConfig } from "astro/config";

import preact from "@astrojs/preact";

export default defineConfig({
  site: "https://tutorial-first-astro-blog.netlify.app",
  integrations: [preact()],
});