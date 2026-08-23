import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isUserSite = repo.endsWith('.github.io');

export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  base: process.env.GITHUB_ACTIONS === 'true' && !isUserSite ? `/${repo}/` : '/',
  integrations: [sitemap()],
  build: { assets: '_assets' },
});
