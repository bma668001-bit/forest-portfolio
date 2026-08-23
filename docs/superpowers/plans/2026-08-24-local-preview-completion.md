# Local Portfolio Preview Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the local portfolio preview with visual project details, a repeatable bulk visual-import pipeline, restrained reveal motion, and polished mobile interaction.

**Architecture:** Extend the existing Astro Content Layer with a `projects` collection and static detail routes. Keep bulk ingestion outside page components: a Node script validates a JSON manifest, derives image dimensions, and writes deterministic YAML records; shared client scripts progressively enhance reveal motion and touch interactions without compromising static rendering.

**Tech Stack:** Astro 7, TypeScript 6, Astro Content Layer, CSS, Canvas 2D, Node.js, `yaml`, `image-size`, Vitest, Playwright

---

## File map

```text
src/content.config.ts                       Add project schema
src/data/projects/editorial-system.md       Demo representative project
src/pages/projects/[id].astro               Generated project detail route
src/components/ProjectGallery.astro         Editorial project image sequence
src/components/VisualCard.astro             Optional project detail link
src/pages/visuals/index.astro               Optional project link per gallery item
src/scripts/reveal.ts                       Viewport reveal enhancement
src/scripts/gallery.ts                      Swipe and body-lock improvements
src/layouts/BaseLayout.astro                Load reveal behavior once
src/styles/global.css                       Project, motion, and mobile styles
content/visuals-manifest.json               Canonical bulk visual metadata
scripts/lib/visual-manifest.mjs             Validation and deterministic YAML rendering
scripts/import-visuals.mjs                  Filesystem importer CLI
src/data/visuals/generated/*.yaml           Generated visual content records
tests/unit/visual-manifest.test.ts           Manifest validation and rendering tests
tests/e2e/projects.spec.ts                   Project route and link tests
tests/e2e/motion.spec.ts                     Reveal and reduced-motion tests
tests/e2e/mobile.spec.ts                     320/390/768px interaction tests
README.md                                   Local preview and bulk-import guide
```

### Task 1: Add representative visual project details

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/data/projects/editorial-system.md`
- Create: `src/components/ProjectGallery.astro`
- Create: `src/pages/projects/[id].astro`
- Modify: `src/components/VisualCard.astro`
- Modify: `src/pages/visuals/index.astro`
- Modify: `src/data/visuals/editorial-poster.yaml`
- Test: `tests/e2e/projects.spec.ts`

- [ ] **Step 1: Write the failing project route test**

```ts
import { expect, test } from '@playwright/test';

test('a representative visual links to its project story', async ({ page }) => {
  await page.goto('/visuals/');
  await page.getByRole('link', { name: '查看项目：编辑式视觉系统' }).click();
  await expect(page).toHaveURL(/projects\/editorial-system\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('编辑式视觉系统');
  await expect(page.getByText('项目背景')).toBeVisible();
  await expect(page.getByRole('link', { name: '返回视觉作品' })).toBeVisible();
});
```

- [ ] **Step 2: Verify RED**

Run: `npm run test:e2e -- projects.spec.ts --project=desktop`

Expected: FAIL because the project link and route do not exist.

- [ ] **Step 3: Add a strict `projects` collection**

Required fields: `title`, `summary`, `year`, `category`, `role`, `duration`, `order`, `draft`, `featured`, `cover`, `gallery`, and `tools`. `gallery` is an array of the shared image schema and must contain at least one item.

- [ ] **Step 4: Add the demo project and route**

Create `editorial-system.md` with honest framework-demo copy, the two existing abstract SVGs, and Markdown sections named `项目背景`, `处理方式`, and `下一步替换`. Generate `/projects/[id]/` with `getStaticPaths()`, render its cover, facts, Markdown body, project gallery, and return link.

- [ ] **Step 5: Connect visual entries without breaking the lightbox**

Set `projectId: editorial-system` on `editorial-poster.yaml`. Keep the image button dedicated to lightbox behavior; add a separate text link with accessible name `查看项目：编辑式视觉系统`. Add the same optional link behavior to homepage `VisualCard`.

- [ ] **Step 6: Verify GREEN and commit**

Run: `npm run check; npm run test:e2e -- projects.spec.ts`

Expected: collection validation passes and desktop/mobile project navigation tests pass.

```powershell
git add src/content.config.ts src/data/projects src/data/visuals/editorial-poster.yaml src/components/ProjectGallery.astro src/components/VisualCard.astro src/pages/projects src/pages/visuals tests/e2e/projects.spec.ts
git commit -m "feat: add representative visual project stories"
```

### Task 2: Build the deterministic bulk visual importer

**Files:**
- Modify: `package.json`
- Create: `content/visuals-manifest.json`
- Create: `scripts/lib/visual-manifest.mjs`
- Create: `scripts/import-visuals.mjs`
- Create: `tests/unit/visual-manifest.test.ts`
- Create: `src/data/visuals/generated/editorial-poster.yaml`
- Create: `src/data/visuals/generated/social-cover.yaml`
- Delete: `src/data/visuals/editorial-poster.yaml`
- Delete: `src/data/visuals/social-cover.yaml`

- [ ] **Step 1: Write failing manifest tests**

```ts
import { describe, expect, it } from 'vitest';
import { normalizeManifest, renderVisualYaml } from '../../scripts/lib/visual-manifest.mjs';

const valid = { id: 'poster-001', file: 'demo/workflow-field.svg', title: '编辑式海报实验', alt: '暖米色抽象工作流海报', category: '海报', year: 2026, order: 10, featured: true, projectId: 'editorial-system' };

describe('visual manifest', () => {
  it('rejects duplicate ids', () => {
    expect(() => normalizeManifest([valid, valid])).toThrow(/duplicate id: poster-001/i);
  });

  it('rejects parent-directory file paths', () => {
    expect(() => normalizeManifest([{ ...valid, file: '../secret.png' }])).toThrow(/unsafe file path/i);
  });

  it('renders deterministic content fields', () => {
    expect(renderVisualYaml(valid, { width: 1600, height: 1000 })).toContain('projectId: editorial-system');
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- visual-manifest.test.ts`

Expected: FAIL because `scripts/lib/visual-manifest.mjs` does not exist.

- [ ] **Step 3: Install importer dependencies and add scripts**

Run: `npm install --save-dev yaml image-size`

Add:

```json
"content:visuals": "node scripts/import-visuals.mjs",
"content:visuals:check": "node scripts/import-visuals.mjs --check"
```

- [ ] **Step 4: Implement validation and deterministic rendering**

`normalizeManifest()` must reject non-array input, missing required fields, duplicate IDs, IDs outside `[a-z0-9-]+`, absolute paths, `..` segments, invalid years, non-positive order values, and empty alt text. `renderVisualYaml()` must serialize fields in a stable order using `yaml`, omit empty `projectId`, and include dimensions derived from the real image.

- [ ] **Step 5: Implement the filesystem CLI**

Resolve every image under `public/images/` and verify the final absolute path stays inside that directory. Use `image-size` to read dimensions. Normal mode writes only inside `src/data/visuals/generated/`; `--check` performs no writes and fails if generated content differs or is missing. It must never delete hand-written content outside `generated/`.

- [ ] **Step 6: Migrate the two demo visuals through the manifest**

Add both current records to `content/visuals-manifest.json`, generate their YAML, delete the former hand-written duplicates, then run the importer twice to prove idempotence.

- [ ] **Step 7: Verify GREEN and commit**

Run: `npm test; npm run content:visuals:check; npm run build`

Expected: unit tests pass, check mode reports two current records, and the site builds without duplicate content IDs.

```powershell
git add package.json package-lock.json content scripts src/data/visuals tests/unit/visual-manifest.test.ts
git commit -m "feat: add bulk visual content importer"
```

### Task 3: Add restrained editorial reveal motion

**Files:**
- Create: `src/scripts/reveal.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/HomeSections.astro`
- Modify: `src/pages/workflows/index.astro`
- Modify: `src/pages/visuals/index.astro`
- Modify: `src/pages/thoughts/index.astro`
- Modify: `src/styles/global.css`
- Test: `tests/e2e/motion.spec.ts`

- [ ] **Step 1: Extend motion tests and verify RED**

```ts
test('editorial sections reveal after entering the viewport', async ({ page }) => {
  await page.goto('/');
  const target = page.locator('[data-reveal]').first();
  await target.scrollIntoViewIfNeeded();
  await expect(target).toHaveAttribute('data-reveal-state', 'visible');
});

test('reduced motion reveals content immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-reveal]').first()).toHaveAttribute('data-reveal-state', 'visible');
});
```

Run: `npm run test:e2e -- motion.spec.ts --project=desktop`

Expected: FAIL because reveal attributes are absent.

- [ ] **Step 2: Implement progressive enhancement**

Mark large sections and repeated rows with `data-reveal`; load `reveal.ts` once from `BaseLayout`. The script must immediately show all targets when reduced motion is requested or `IntersectionObserver` is unavailable. Otherwise, observe with `rootMargin: '0px 0px -8% 0px'`, set `data-reveal-state="visible"`, then unobserve.

- [ ] **Step 3: Add motion styling**

Use opacity plus at most 24px vertical translation over 650ms. Repeated rows may use a CSS `--reveal-index` delay capped at 240ms. Never animate body text character-by-character. Reduced-motion CSS must remove transforms and durations.

- [ ] **Step 4: Verify and commit**

Run: `npm run check; npm run test:e2e -- motion.spec.ts`

```powershell
git add src/scripts/reveal.ts src/layouts/BaseLayout.astro src/components/HomeSections.astro src/pages/workflows/index.astro src/pages/visuals/index.astro src/pages/thoughts/index.astro src/styles/global.css tests/e2e/motion.spec.ts
git commit -m "feat: add motion-safe editorial reveals"
```

### Task 4: Polish mobile layout and touch interaction

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/scripts/gallery.ts`
- Modify: `src/styles/global.css`
- Create: `tests/e2e/mobile.spec.ts`

- [ ] **Step 1: Write failing mobile behavior tests**

```ts
import { expect, test } from '@playwright/test';

for (const width of [320, 390, 768]) {
  test(`layout has no horizontal overflow at ${width}px`, async ({ page }) => {
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
```

- [ ] **Step 2: Verify RED**

Run: `npm run test:e2e -- mobile.spec.ts --project=mobile`

Expected: navigation state test fails because body state is not implemented.

- [ ] **Step 3: Implement mobile navigation and touch improvements**

Set and remove `body[data-navigation-open="true"]`; lock overflow only while open; close on link selection, Escape, and viewport change above 960px. Give mobile navigation, filter, lightbox, and pagination controls a minimum 44px hit area. Make filters horizontally scrollable at 640px without wrapping the page.

- [ ] **Step 4: Add lightbox swipe**

Track one primary pointer inside the dialog stage. A horizontal movement of at least 56px with vertical movement below 48px moves previous/next; smaller movement does nothing. Keep buttons and keyboard behavior unchanged.

- [ ] **Step 5: Tune typography at 320px and safe areas**

Use `100dvh` with `100svh` fallback, `env(safe-area-inset-*)` padding for fixed navigation/lightbox, smaller hero tracking, single-column project facts, and `overflow-wrap: anywhere` for long metadata. Preserve the approved desktop composition.

- [ ] **Step 6: Verify and commit**

Run: `npm run check; npm run test:e2e -- mobile.spec.ts; npm run test:e2e -- gallery.spec.ts navigation.spec.ts`

```powershell
git add src/components/Header.astro src/scripts/gallery.ts src/styles/global.css tests/e2e/mobile.spec.ts
git commit -m "feat: polish mobile portfolio interactions"
```

### Task 5: Complete local preview documentation and visual QA

**Files:**
- Modify: `README.md`
- Create: `docs/content/visual-import-guide.md`
- Create: `tests/e2e/local-preview.spec.ts`

- [ ] **Step 1: Add a local preview route smoke test**

The test must visit `/`, `/workflows/`, `/visuals/`, `/projects/editorial-system/`, `/thoughts/`, and one workflow/article detail; assert one visible level-one heading and no console errors for each route.

- [ ] **Step 2: Document the exact preview workflow**

README must lead with `npm install` and `npm run dev`, list the local URL, explain demo content, and separate “local preview” from “GitHub publishing.” The import guide must include the exact JSON fields, recommended filename scheme, supported image formats, compression guidance, importer/check commands, and a worked three-item manifest.

- [ ] **Step 3: Run production and browser verification**

Run:

```powershell
npm run content:visuals:check
npm run check
npm run build
npm run test:e2e
git diff --check
```

Expected: all commands exit 0, all project/detail routes exist in `dist/`, and no test reports console errors or horizontal overflow.

- [ ] **Step 4: Capture and inspect local previews**

Capture full-page screenshots at 1440×1000 and 390×844 for home, visuals, and the demo project. Inspect typography cropping, section rhythm, filter behavior, project gallery, footer, and mobile safe areas. Correct any demonstrated defects with a failing regression test before changing production code.

- [ ] **Step 5: Commit**

```powershell
git add README.md docs/content tests/e2e/local-preview.spec.ts
git commit -m "docs: complete local portfolio preview workflow"
```

## Acceptance checkpoint

- A visual entry can open either the lightbox or its related project story.
- Adding many visuals is a manifest operation, not a component edit.
- Import validation rejects unsafe paths, duplicate IDs, missing images, and incomplete metadata.
- Reveal motion is restrained and all content is immediately readable with reduced motion.
- Navigation, filters, lightbox, details, and project pages work at 320px, 390px, 768px, and desktop widths.
- Every primary and detail route is locally previewable without GitHub.
- `npm run content:visuals:check`, `npm run check`, `npm run build`, and all Playwright tests pass.
