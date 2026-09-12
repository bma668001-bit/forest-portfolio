import { expect, test } from '@playwright/test';

for (const route of ['/', '/visuals/']) {
  test(`traditional work images never render larger than their source on ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route);
    const images = page.locator(`${route === '/' ? '.legacy-band' : '#traditional'} .traditional-visual img`);
    expect(await images.count()).toBeGreaterThan(0);

    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) =>
        el.complete && el.naturalWidth > 0)).toBe(true);
      const size = await img.evaluate((el: HTMLImageElement) => ({
        renderedWidth: el.getBoundingClientRect().width,
        renderedHeight: el.getBoundingClientRect().height,
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
      }));
      expect(size.renderedWidth).toBeLessThanOrEqual(size.naturalWidth + 1);
      expect(size.renderedHeight).toBeLessThanOrEqual(size.naturalHeight + 1);
    }
  });
}

for (const width of [390, 768, 1440]) {
  test(`traditional work images preserve their natural ratio at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/visuals/');
    const images = page.locator('#traditional .traditional-visual img');
    await expect(images).toHaveCount(8);
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) =>
        el.complete && el.naturalWidth > 0)).toBe(true);
      const size = await img.evaluate((el: HTMLImageElement) => ({
        width: el.clientWidth,
        height: el.clientHeight,
        expectedHeight: el.clientWidth * el.naturalHeight / el.naturalWidth,
      }));
      expect(size.width).toBeGreaterThan(0);
      expect(Math.abs(size.height - size.expectedHeight)).toBeLessThanOrEqual(1);
    }
  });

  test(`detail images preserve their natural ratio at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const routes = new Set<string>();
    for (const archive of ['/', '/workflows/', '/visuals/']) {
      await page.goto(archive);
      const links = await page.locator('a[href]').evaluateAll((anchors) =>
        anchors.map((anchor) => anchor.getAttribute('href')!).filter((href) =>
          /^\/(workflows|projects)\/[^/]+\/$/.test(href)),
      );
      links.forEach((href) => routes.add(href));
    }
    expect(routes.size).toBeGreaterThan(0);
    for (const route of routes) {
      await page.goto(route);
      const images = page.locator('.detail-cover, .project-gallery img');
      expect(await images.count(), route).toBeGreaterThan(0);
      for (const img of await images.all()) {
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((el: HTMLImageElement) =>
          el.complete && el.naturalWidth > 0), { message: route }).toBe(true);
        const size = await img.evaluate((el: HTMLImageElement) => ({
          width: el.clientWidth,
          height: el.clientHeight,
          expectedHeight: el.clientWidth * el.naturalHeight / el.naturalWidth,
        }));
        expect(size.width, route).toBeGreaterThan(0);
        expect(Math.abs(size.height - size.expectedHeight), route).toBeLessThanOrEqual(1);
      }
    }
  });
}
