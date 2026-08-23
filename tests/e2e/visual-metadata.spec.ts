import { expect, test } from '@playwright/test';

test('combines category and creative-era filters with AND logic', async ({ page }) => {
  await page.goto('/visuals/');

  const categoryGroup = page.getByRole('group', { name: '作品类别' });
  const eraGroup = page.getByRole('group', { name: '创作阶段' });
  await expect(categoryGroup).toBeVisible();
  await expect(eraGroup).toBeVisible();
  await expect(eraGroup.getByRole('button', { name: 'AI 前', exact: true })).toBeVisible();
  await expect(eraGroup.getByRole('button', { name: 'AI 辅助', exact: true })).toBeVisible();
  await expect(eraGroup.getByRole('button', { name: '混合制作', exact: true })).toBeVisible();

  await eraGroup.getByRole('button', { name: 'AI 辅助', exact: true }).click();
  await expect(page.locator('[data-visual]:visible')).toHaveCount(1);
  await expect(page.locator('[data-visual]:visible')).toContainText('编辑式海报实验');

  await categoryGroup.getByRole('button', { name: '自媒体封面', exact: true }).click();
  await expect(page.locator('[data-visual]:visible')).toHaveCount(0);
  await expect(page.locator('[data-gallery-empty]')).toBeVisible();

  await eraGroup.getByRole('button', { name: '混合制作', exact: true }).click();
  await expect(page.locator('[data-visual]:visible')).toHaveCount(1);
  await expect(page.locator('[data-visual]:visible')).toContainText('自媒体封面实验');
});

test('updates structured lightbox metadata after buttons and swipe navigation', async ({ page }) => {
  await page.goto('/visuals/');
  await page.locator('[data-visual]').filter({ hasText: '编辑式海报实验' }).locator('[data-lightbox-trigger]').click();

  const dialog = page.getByRole('dialog', { name: '作品大图' });
  const metadata = dialog.locator('[data-lightbox-caption]');
  await expect(dialog.getByRole('button', { name: '关闭作品大图' })).toBeFocused();
  await expect(metadata).toHaveAttribute('aria-live', 'polite');
  await expect(metadata).toHaveAttribute('aria-atomic', 'true');
  await expect(dialog.getByRole('heading', { level: 2, name: '编辑式海报实验' })).toBeVisible();
  await expect(dialog.locator('[data-lightbox-description]')).toContainText('暖米色画面以抽象节点');
  await expect(dialog.locator('[data-lightbox-era]')).toHaveText('AI 辅助');
  await expect(dialog.locator('[data-lightbox-tools]')).toContainText('SVG');
  await expect(dialog.locator('[data-lightbox-tools]')).toContainText('AI 辅助编排');

  await dialog.getByRole('button', { name: '下一张作品' }).click();
  await expect(dialog.getByRole('heading', { level: 2, name: '自媒体封面实验' })).toBeVisible();
  await expect(dialog.locator('[data-lightbox-description]')).toContainText('深咖啡画面以暖色轨道');
  await expect(dialog.locator('[data-lightbox-era]')).toHaveText('混合制作');
  await expect(dialog.locator('[data-lightbox-tools]')).toContainText('人工版式调整');

  const stage = dialog.locator('[data-lightbox-stage]');
  await stage.dispatchEvent('pointerdown', { pointerId: 1, isPrimary: true, clientX: 180, clientY: 400 });
  await stage.dispatchEvent('pointerup', { pointerId: 1, isPrimary: true, clientX: 300, clientY: 410 });
  await expect(dialog.getByRole('heading', { level: 2, name: '编辑式海报实验' })).toBeVisible();
  await expect(dialog.locator('[data-lightbox-era]')).toHaveText('AI 辅助');
});

test('shows demo visuals linked to the current workflow', async ({ page }) => {
  await page.goto('/workflows/wechat-writing/');

  const related = page.getByRole('region', { name: '这个流程产出的作品' });
  await expect(related).toBeVisible();
  await expect(related.locator('.visual-card')).toHaveCount(2);
  await expect(related).toContainText('编辑式海报实验');
  await expect(related).toContainText('自媒体封面实验');
  await expect(related.locator('[data-demo-badge]')).toHaveText(['结构示例', '结构示例']);
  await expect(related.getByRole('link', { name: '查看“编辑式海报实验”关联的项目' })).toBeVisible();
});

test('shows optional captions for project gallery images', async ({ page }) => {
  await page.goto('/projects/editorial-system/');

  const captions = page.locator('.project-gallery figcaption');
  await expect(captions).toHaveCount(2);
  await expect(captions.nth(0)).toHaveText('横版演示画面：暖米色底上以节点、曲线和大字构成从左向右展开的工作流结构。');
  await expect(captions.nth(1)).toHaveText('竖版演示画面：深咖啡底上以三组轨道、圆点和上下文字构成中心聚拢的结构。');
});
