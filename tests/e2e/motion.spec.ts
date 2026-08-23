import { expect, test } from '@playwright/test';

test('homepage communicates the portfolio focus', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AI WORKFLOW');
  await expect(page.getByRole('heading', { name: '工作流精选' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '视觉实践' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '关于与联系' })).toBeVisible();
});

test('reduced motion keeps the hero static and readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-hero-field]')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('editorial sections reveal after entering the viewport', async ({ page }) => {
  await page.goto('/');
  const target = page.locator('[data-reveal]').first();
  await target.scrollIntoViewIfNeeded();
  await expect(target).toHaveAttribute('data-reveal-state', 'visible');
});

test('reduced motion reveals content immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-reveal]').first()).toHaveAttribute('data-reveal-state', 'visible');
});
