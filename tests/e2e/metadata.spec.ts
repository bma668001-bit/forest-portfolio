import { expect, test, type Page } from '@playwright/test';

async function structuredDataTypes(page: Page) {
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  return scripts.map((script) => (JSON.parse(script) as Record<string, unknown>)['@type']);
}

test('homepage exposes complete default sharing metadata', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-preview\.png$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', '森林');
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'zh_CN');
  expect(await structuredDataTypes(page)).toContain('WebSite');
});

test('article exposes article metadata and its published time', async ({ page }) => {
  await page.goto('/thoughts/from-design-to-workflow/');

  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute('content', '2026-09-03T00:00:00.000Z');
  expect(await structuredDataTypes(page)).toContain('Article');
});

test('project exposes CreativeWork structured data', async ({ page }) => {
  await page.goto('/projects/book-video-workbench/');

  expect(await structuredDataTypes(page)).toContain('CreativeWork');
});

test('unknown pages ask search engines not to index them', async ({ page }) => {
  await page.goto('/not-a-real-page/');

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
});

test('robots points crawlers to the sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt');

  expect(response.status()).toBe(200);
  expect(await response.text()).toMatch(/^Sitemap: https?:\/\/\S+\/sitemap-index\.xml$/m);
});
