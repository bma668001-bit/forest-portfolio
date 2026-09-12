import { expect, test } from '@playwright/test';

test('keeps useful category filters and hides the redundant creative-era filter', async ({ page }) => {
  await page.goto('/visuals/');

  const categoryGroup = page.getByRole('group', { name: '作品类别' });
  await expect(categoryGroup).toBeVisible();
  await expect(page.getByRole('group', { name: '创作阶段' })).toHaveCount(0);
  for (const category of ['商业视觉', '电商主图', '节日热点图', '自媒体封面']) {
    await expect(categoryGroup.getByRole('button', { name: category, exact: true })).toBeVisible();
  }

  await categoryGroup.getByRole('button', { name: '商业视觉', exact: true }).click();
  await expect(page.locator('[data-visual]:visible')).toHaveCount(8);
  await expect(page.locator('[data-gallery-count]')).toHaveText('已展示 8 / 12');

  await categoryGroup.getByRole('button', { name: '自媒体封面', exact: true }).click();
  await expect(page.locator('[data-visual]:visible')).toHaveCount(8);
  await expect(page.locator('[data-gallery-count]')).toHaveText('已展示 8 / 13');
  await expect(page.locator('[data-visual]:visible').first()).toContainText('32 岁转做 AI 设计');
});

test('updates structured lightbox metadata after buttons and swipe navigation', async ({ page }) => {
  await page.goto('/visuals/');
  await page.locator('[data-visual]').filter({ hasText: '成都慢生活' }).locator('[data-lightbox-trigger]').click();

  const dialog = page.getByRole('dialog', { name: '作品大图' });
  const metadata = dialog.locator('[data-lightbox-caption]');
  await expect(dialog.getByRole('button', { name: '关闭作品大图' })).toBeFocused();
  await expect(metadata).toHaveAttribute('aria-live', 'polite');
  await expect(metadata).toHaveAttribute('aria-atomic', 'true');
  await expect(dialog.getByRole('heading', { level: 2, name: '成都慢生活' })).toBeVisible();
  await expect(dialog.locator('[data-lightbox-description]')).toContainText('AI 辅助完成的商业视觉练习');
  await expect(dialog.locator('[data-lightbox-era]')).toHaveText('AI 辅助');
  await expect(dialog.locator('[data-lightbox-tools]')).toContainText('AI 生图');
  await expect(dialog.locator('[data-lightbox-tools]')).toContainText('版式设计');

  await dialog.getByRole('button', { name: '下一张作品' }).click();
  await expect(dialog.getByRole('heading', { level: 2, name: '美好童行品牌视觉' })).toBeVisible();
  await expect(dialog.locator('[data-lightbox-era]')).toHaveText('AI 辅助');

  const stage = dialog.locator('[data-lightbox-stage]');
  await stage.dispatchEvent('pointerdown', { pointerId: 1, isPrimary: true, clientX: 180, clientY: 400 });
  await stage.dispatchEvent('pointerup', { pointerId: 1, isPrimary: true, clientX: 300, clientY: 410 });
  await expect(dialog.getByRole('heading', { level: 2, name: '成都慢生活' })).toBeVisible();
  await expect(dialog.locator('[data-lightbox-era]')).toHaveText('AI 辅助');
});

test('does not attach unverified portfolio works to a workflow', async ({ page }) => {
  await page.goto('/workflows/wechat-writing/');

  const related = page.getByRole('region', { name: '这个流程产出的作品' });
  await expect(related).toHaveCount(0);
  await expect(page.locator('[data-demo-badge]')).toHaveCount(0);
});

test('shows optional captions for project gallery images', async ({ page }) => {
  await page.goto('/projects/book-video-workbench/');

  const captions = page.locator('.project-gallery figcaption');
  await expect(captions).toHaveCount(2);
  await expect(captions).toHaveText([
    '文案二创界面：原文与改写并排查看，确认后继续处理分镜和图片。',
    '半自动剪辑进度看板：集中查看各选题的素材、转录和剪映草稿状态，字幕与导出保留人工处理。',
  ]);
});
