import { expect, test } from '@playwright/test';

test('filters gallery items without navigation', async ({ page }) => {
  await page.goto('/visuals/');
  await page.getByRole('button', { name: '自媒体封面' }).click();
  await expect(page.locator('[data-visual]:visible')).toHaveCount(1);
  await expect(page).toHaveURL(/visuals\/$/);
});

test('exposes the live artwork metadata as the lightbox description', async ({ page }) => {
  await page.goto('/visuals/');
  const trigger = page.locator('[data-lightbox-trigger]').first();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: '作品大图' });
  const caption = page.locator('#lightbox-caption');

  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-describedby', 'lightbox-caption');
  await expect(caption).toHaveAttribute('aria-live', 'polite');
  await expect(caption).toHaveAttribute('aria-atomic', 'true');
});

test('browses the lightbox with ArrowRight and restores its original trigger on Escape', async ({ page }) => {
  await page.goto('/visuals/');
  const trigger = page.locator('[data-lightbox-trigger]').first();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: '作品大图' });
  const title = dialog.locator('[data-lightbox-title]');

  const initialTitle = await title.textContent();
  await page.keyboard.press('ArrowRight');
  await expect(title).not.toHaveText(initialTitle ?? '');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
