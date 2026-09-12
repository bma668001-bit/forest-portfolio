# Visual Archive Browsing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent the fixed navigation from overlapping artwork and make the 59-work archive comfortable to browse through category filtering and eight-item batches.

**Architecture:** Keep all visual records server-rendered for searchability and no-script access. The existing gallery controller owns one additional `visibleLimit` state, recalculates matching totals after every category change, and progressively removes `hidden` from matching records. Shared CSS navigation-height variables keep the fixed header and sticky filter rail separated across desktop and mobile.

**Tech Stack:** Astro 7, TypeScript browser scripts, CSS, Playwright, Vitest

---

### Task 1: Lock the browsing behavior with failing browser tests

**Files:**
- Modify: `tests/e2e/gallery.spec.ts`
- Modify: `tests/e2e/mobile.spec.ts`

- [ ] **Step 1: Add tests for the first batch, category reset, and progressive loading**

Add Playwright assertions that the initial archive has 8 visible items and a `已展示 8 / 59` status; clicking `加载更多` raises the visible count to 16; selecting `自媒体封面` resets the visible count to 8 and reports `已展示 8 / 13`; loading once more shows all 13 and hides the button.

```ts
test('shows the archive in eight-item batches and resets on category changes', async ({ page }) => {
  await page.goto('/visuals/');
  const visible = page.locator('[data-visual]:visible');
  const status = page.locator('[data-gallery-count]');
  const more = page.getByRole('button', { name: '加载更多作品' });

  await expect(visible).toHaveCount(8);
  await expect(status).toHaveText('已展示 8 / 59');
  await more.click();
  await expect(visible).toHaveCount(16);

  await page.getByRole('button', { name: '自媒体封面', exact: true }).click();
  await expect(visible).toHaveCount(8);
  await expect(status).toHaveText('已展示 8 / 13');
  await more.click();
  await expect(visible).toHaveCount(13);
  await expect(more).toBeHidden();
});
```

- [ ] **Step 2: Add a navigation-overlap test**

Scroll an artwork beneath the header, then assert that the header has an opaque-enough computed background and the sticky filters begin at or below the header bottom.

```ts
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
```

- [ ] **Step 3: Run the tests and verify RED**

Run: `npm run test:e2e -- gallery.spec.ts --project=desktop --workers=1`

Expected: FAIL because all 59 works are visible, no count/load button exists, and the header background is transparent.

- [ ] **Step 4: Commit the failing tests**

```bash
git add tests/e2e/gallery.spec.ts tests/e2e/mobile.spec.ts
git commit -m "test: define paged visual archive behavior"
```

### Task 2: Implement category batches and archive controls

**Files:**
- Modify: `src/pages/visuals/index.astro`
- Modify: `src/scripts/gallery.ts`
- Modify: `src/styles/global.css`
- Test: `tests/e2e/gallery.spec.ts`

- [ ] **Step 1: Simplify filters and add the load controls**

Remove the rendered creative-era filter group while retaining `data-era` on each work. Add controls after the grid:

Render `hidden={index >= 8}` on gallery figures so the no-script page starts with a manageable first batch while keeping every record in the HTML.

```astro
<div class="gallery-progress" data-gallery-progress aria-live="polite">
  <span data-gallery-count>已展示 8 / {visuals.length}</span>
  <button type="button" data-gallery-more aria-label="加载更多作品">加载更多</button>
</div>
```

- [ ] **Step 2: Add eight-item pagination to the gallery controller**

Use category as the active public filter, compute matches before rendering, and update count/button state from one function:

```ts
const batchSize = 8;
let visibleLimit = batchSize;
const count = document.querySelector<HTMLElement>('[data-gallery-count]');
const more = document.querySelector<HTMLButtonElement>('[data-gallery-more]');

const matchingItems = () => items.filter((item) => (
  activeFilters.category === '全部' || item.dataset.category === activeFilters.category
));

const render = () => {
  const matches = matchingItems();
  const shown = Math.min(visibleLimit, matches.length);
  items.forEach((item) => { item.hidden = !matches.includes(item) || matches.indexOf(item) >= shown; });
  if (count) count.textContent = `已展示 ${shown} / ${matches.length}`;
  if (more) more.hidden = shown >= matches.length;
  if (empty) empty.hidden = matches.length > 0;
};

more?.addEventListener('click', () => {
  visibleLimit += batchSize;
  render();
});
```

On a category button click, set `visibleLimit = batchSize` before `render()`. Preserve the existing lightbox logic so it navigates only through non-hidden records.

- [ ] **Step 3: Style the progress controls**

Add a centered editorial control with a fine top rule, compact count, and pill-shaped load button that follows the existing ink/paper palette. Keep it full-width on mobile.

```css
.gallery-progress { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 4rem; padding-top: 1rem; border-top: 1px solid var(--line); }
.gallery-progress span { font-size: .7rem; letter-spacing: .08em; }
.gallery-progress button { padding: .7rem 1.1rem; border: 1px solid var(--line); border-radius: 100%; background: transparent; cursor: pointer; }
.gallery-progress button:hover { background: var(--ink); color: var(--paper); }
.gallery-progress button[hidden] { display: none; }
```

- [ ] **Step 4: Run the targeted tests and verify GREEN**

Run: `npm run build && npm run test:e2e -- gallery.spec.ts visual-metadata.spec.ts mobile.spec.ts --workers=1`

Update `tests/e2e/visual-metadata.spec.ts` to remove assertions for the hidden creative-era buttons. Assert that the four category buttons remain available, `商业视觉` reports 8 visible works from 12 total, and `自媒体封面` reports 8 visible works from 13 total. Expected: all targeted tests pass.

- [ ] **Step 5: Commit the gallery behavior**

```bash
git add src/pages/visuals/index.astro src/scripts/gallery.ts src/styles/global.css tests/e2e/gallery.spec.ts tests/e2e/mobile.spec.ts tests/e2e/visual-metadata.spec.ts
git commit -m "feat: add progressive visual archive browsing"
```

### Task 3: Separate fixed navigation from artwork

**Files:**
- Modify: `src/styles/global.css`
- Test: `tests/e2e/gallery.spec.ts`
- Test: `tests/e2e/mobile.spec.ts`

- [ ] **Step 1: Introduce a shared header height**

Add `--header-height: 5rem` to `:root`, use it for the header row, and offset sticky filters with the same variable.

```css
:root { --header-height: 5rem; }
.site-header { background: color-mix(in srgb, var(--paper) 94%, transparent); backdrop-filter: blur(16px); border-bottom: 1px solid var(--line); }
.site-header__inner { min-height: var(--header-height); border-bottom: 0; }
.gallery-filters { top: var(--header-height); }
```

- [ ] **Step 2: Make the mobile layer explicit**

At the existing mobile breakpoint, preserve the same shared height and ensure the opened navigation remains above both artwork and filters.

```css
@media (max-width: 960px) {
  .site-header { mix-blend-mode: normal; }
  .site-nav[data-open='true'] { z-index: 31; }
}
```

- [ ] **Step 3: Run navigation and mobile regression tests**

Run: `npm run build && npm run test:e2e -- gallery.spec.ts mobile.spec.ts navigation.spec.ts --workers=1`

Expected: all tests pass at desktop and mobile viewports; no horizontal overflow or overlap regression.

- [ ] **Step 4: Run the complete verification suite**

Run: `npm run content:visuals:check`

Expected: 59 visual records checked.

Run: `npm run check`

Expected: Astro reports zero diagnostics and all Vitest tests pass.

Run: `npm run build`

Expected: 12 static routes build successfully.

Run: `npm run test:e2e`

Expected: the complete desktop/mobile Playwright suite passes.

- [ ] **Step 5: Commit the navigation fix**

```bash
git add src/styles/global.css tests/e2e/gallery.spec.ts tests/e2e/mobile.spec.ts
git commit -m "fix: keep portfolio navigation clear of artwork"
```
