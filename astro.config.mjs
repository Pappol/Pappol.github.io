// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Riccardo "Pappol" Parola — personal blog
// Deployed as a GitHub *user* site, so it lives at the domain root.
export default defineConfig({
  site: 'https://pappol.github.io',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
