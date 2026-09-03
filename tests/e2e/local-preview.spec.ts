import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/workflows/',
  '/workflows/wechat-writing/',
  '/visuals/',
  '/projects/book-video-workbench/',
  '/thoughts/',
  '/thoughts/from-design-to-workflow/',
];

for (const route of routes) {
  test(`${route} renders a complete local preview without console errors`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const response = await page.goto(route);

    expect(response?.ok()).toBe(true);
    const pageHeading = page.locator('main h1');
    await expect(pageHeading).toHaveCount(1);
    await expect(pageHeading).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
}
