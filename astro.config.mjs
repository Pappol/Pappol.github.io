// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// Riccardo "Pappol" Parola — personal blog
// Deployed as a GitHub *user* site, so it lives at the domain root.
export default defineConfig({
  site: 'https://pappol.github.io',
  // mdx() lets posts authored as .mdx import and use components (e.g. <MusicEmbed>).
  // Plain .md posts keep working exactly as before.
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
