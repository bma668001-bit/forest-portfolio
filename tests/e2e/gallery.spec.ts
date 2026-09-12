import { expect, test } from '@playwright/test';

test('homepage shows the eight approved featured visuals', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.visual-feature-grid .visual-card')).toHaveCount(8);
});

test('homepage introduces four pre-AI traditional works', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-traditional-visual]')).toHaveCount(4);
  await expect(page.getByRole('region', { name: '传统设计基础' })).toContainText('AI 前');
});

test('archive keeps eight traditional works outside the 57-item AI archive', async ({ page }) => {
  await page.goto('/visuals/');
  await expect(page.locator('#traditional [data-traditional-visual]')).toHaveCount(8);
  await expect(page.locator('[data-gallery-count]')).toHaveText('已展示 8 / 57');
  await expect(page.locator('[data-visual]:visible')).toHaveCount(8);
});

test('traditional lightbox navigation stays inside the pre-AI group', async ({ page }) => {
  await page.goto('/visuals/');
  await page.locator('#traditional [data-lightbox-trigger]').first().click();
  const dialog = page.getByRole('dialog', { name: '作品大图' });
  await expect(dialog).toContainText('四季视觉·冬');
  await page.keyboard.press('ArrowRight');
  await expect(dialog).toContainText('迎端午·粽情在吉选');
  await expect(dialog).not.toContainText('成都慢生活');
});

test('a long visual archive is never left transparent by reveal motion', async ({ page }) => {
  await page.goto('/visuals/');
  const archive = page.locator('.gallery-section');
  await archive.scrollIntoViewIfNeeded();
  await expect(archive).toHaveCSS('opacity', '1');
});

test('shows the archive in eight-item batches and resets on category changes', async ({ page }) => {
  await page.goto('/visuals/');
  const visible = page.locator('[data-visual]:visible');
  const status = page.locator('[data-gallery-count]');
  const more = page.getByRole('button', { name: '加载更多作品' });

  await expect(visible).toHaveCount(8);
  await expect(status).toHaveText('已展示 8 / 57');
  await more.click();
  await expect(visible).toHaveCount(16);

  await page.getByRole('button', { name: '自媒体封面', exact: true }).click();
  await expect(visible).toHaveCount(8);
  await expect(status).toHaveText('已展示 8 / 11');
  await more.click();
  await expect(visible).toHaveCount(11);
  await expect(more).toBeHidden();
});

test('keeps navigation and sticky filters clear of artwork', async ({ page }) => {
  await page.goto('/visuals/');
  await page.locator('.gallery-grid').scrollIntoViewIfNeeded();
  const geometry = await page.evaluate(() => {
    const header = document.querySelector('.site-header')!.getBoundingClientRect();
    const filters = document.querySelector('.gallery-filters')!.getBoundingClientRect();
    return {
      headerBottom: header.bottom,
      filterTop: filters.top,
      headerBackground: getComputedStyle(document.querySelector('.site-header')!).backgroundColor,
    };
  });

  expect(geometry.filterTop).toBeGreaterThanOrEqual(geometry.headerBottom - 1);
  expect(geometry.headerBackground).not.toBe('rgba(0, 0, 0, 0)');
});

test('filters gallery items without navigation', async ({ page }) => {
  await page.goto('/visuals/');
  await page.getByRole('button', { name: '自媒体封面', exact: true }).click();
  await expect(page.locator('[data-visual]:visible')).toHaveCount(8);
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
