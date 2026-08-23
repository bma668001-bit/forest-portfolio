import type { APIRoute } from 'astro';
import { joinBase } from '../lib/url';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(joinBase(import.meta.env.BASE_URL, 'sitemap-index.xml'), site);

  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemap.href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
