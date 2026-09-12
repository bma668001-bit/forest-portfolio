import { expect, test } from '@playwright/test';

for (const width of [320, 390, 768]) {
  test(`visual archive has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/visuals/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

for (const width of [320, 390]) {
  test(`homepage display heading fits inside the ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const headingSize = await page.locator('.hero h1').evaluate((heading) => {
      const firstLine = document.createRange();
      firstLine.selectNodeContents(heading.firstChild as Text);
      const lineRects = [...firstLine.getClientRects()];
      return {
        minLeft: Math.min(...lineRects.map((rect) => rect.left)),
        maxRight: Math.max(...lineRects.map((rect) => rect.right)),
      };
    });
    expect(headingSize.minLeft).toBeGreaterThanOrEqual(0);
    expect(headingSize.maxRight).toBeLessThanOrEqual(width + 1);
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
  await page.locator('[data-gallery] [data-lightbox-trigger]').first().click();
  const stage = page.locator('[data-lightbox-stage]');
  await stage.dispatchEvent('pointerdown', { pointerId: 1, isPrimary: true, clientX: 300, clientY: 400 });
  await stage.dispatchEvent('pointerup', { pointerId: 1, isPrimary: true, clientX: 180, clientY: 410 });
  await expect(page.locator('[data-lightbox-caption]')).toContainText('美好童行品牌视觉');
  await expect(page.getByRole('button', { name: '上一张作品' })).toBeVisible();
  await expect(page.getByRole('button', { name: '下一张作品' })).toBeVisible();
});

test('mobile archive keeps the load control easy to tap', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/visuals/');
  const progress = page.locator('[data-gallery-progress]');
  const more = page.getByRole('button', { name: '加载更多作品' });
  const [progressBox, moreBox] = await Promise.all([progress.boundingBox(), more.boundingBox()]);

  expect(progressBox).not.toBeNull();
  expect(moreBox).not.toBeNull();
  expect(moreBox!.width).toBeGreaterThanOrEqual(progressBox!.width - 1);
  expect(moreBox!.height).toBeGreaterThanOrEqual(44);
});

test('mobile uses a compact responsive portrait candidate', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#about');

  const portrait = page.locator('.about-section__portrait img');
  await portrait.scrollIntoViewIfNeeded();
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAttribute('srcset', /forest-portrait-640\.webp 640w/);

  const currentSource = await portrait.evaluate((image) => (image as HTMLImageElement).currentSrc);
  expect(currentSource).toMatch(/forest-portrait-(640|1024)\.webp$/);
});
