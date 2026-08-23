import { expect, test } from '@playwright/test';

test('filters gallery items without navigation', async ({ page }) => {
  await page.goto('/visuals/');
  await page.getByRole('button', { name: '自媒体封面' }).click();
  await expect(page.locator('[data-visual]:visible')).toHaveCount(1);
  await expect(page).toHaveURL(/visuals\/$/);
});

test('opens and closes the lightbox with keyboard focus restored', async ({ page }) => {
  await page.goto('/visuals/');
  const trigger = page.locator('[data-lightbox-trigger]').first();
  await trigger.click();
  await expect(page.getByRole('dialog', { name: '作品大图' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '作品大图' })).toBeHidden();
  await expect(trigger).toBeFocused();
});
