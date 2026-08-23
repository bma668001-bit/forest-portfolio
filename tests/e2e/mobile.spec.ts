import { expect, test } from '@playwright/test';

for (const width of [320, 390, 768]) {
  test(`visual archive has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/visuals/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('mobile navigation locks and restores page scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '打开导航' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-navigation-open', 'true');
  await page.getByRole('button', { name: '关闭导航' }).click();
  await expect(page.locator('body')).not.toHaveAttribute('data-navigation-open', 'true');
});

test('lightbox supports horizontal swipe while keeping button controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/visuals/');
  await page.locator('[data-lightbox-trigger]').first().click();
  const stage = page.locator('[data-lightbox-stage]');
  await stage.dispatchEvent('pointerdown', { pointerId: 1, isPrimary: true, clientX: 300, clientY: 400 });
  await stage.dispatchEvent('pointerup', { pointerId: 1, isPrimary: true, clientX: 180, clientY: 410 });
  await expect(page.locator('[data-lightbox-caption]')).toContainText('自媒体封面实验');
  await expect(page.getByRole('button', { name: '上一张作品' })).toBeVisible();
  await expect(page.getByRole('button', { name: '下一张作品' })).toBeVisible();
});
