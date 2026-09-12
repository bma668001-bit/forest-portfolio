# Traditional Portfolio Portfolio Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish eight selected pre-AI Photoshop works as a distinct traditional-design proof layer on the homepage and visual archive.

**Architecture:** Add a dedicated Astro content collection and a reusable traditional-work grid. Keep this collection outside the existing 59-item AI archive so category filtering and batch counts remain unchanged. Reuse the existing lightbox on the archive page by grouping triggers, while limiting traditional images to their natural pixel dimensions.

**Tech Stack:** Astro 7, TypeScript, Astro content collections, CSS Grid, Playwright, Vitest.

---

### Task 1: Add failing archive and homepage acceptance tests

**Files:**
- Modify: `tests/e2e/gallery.spec.ts`
- Modify: `tests/e2e/image-ratio.spec.ts`

- [x] **Step 1: Write tests for the approved counts and separation**

Add assertions that the homepage contains four `[data-traditional-visual]` cards, the archive contains eight, and the existing archive status remains `已展示 8 / 59`.

- [x] **Step 2: Write the proportional-image test**

At 390, 768, and 1440 pixels, measure every `.traditional-visual img` and assert rendered height equals `clientWidth * naturalHeight / naturalWidth` within one pixel.

- [x] **Step 3: Run the tests to verify RED**

Run: `npx playwright test tests/e2e/gallery.spec.ts tests/e2e/image-ratio.spec.ts`

Expected: FAIL because no traditional work elements exist yet.

### Task 2: Copy assets and define traditional-work content

**Files:**
- Create: `public/images/visuals/traditional/traditional-winter.jpg`
- Create: `public/images/visuals/traditional/traditional-dragon-boat.jpg`
- Create: `public/images/visuals/traditional/traditional-anniversary.jpg`
- Create: `public/images/visuals/traditional/traditional-thai-food-festival.jpg`
- Create: `public/images/visuals/traditional/traditional-orange.jpg`
- Create: `public/images/visuals/traditional/traditional-brand-week.jpg`
- Create: `public/images/visuals/traditional/traditional-labor-day.jpg`
- Create: `public/images/visuals/traditional/traditional-spring-festival.jpg`
- Create: `src/data/traditional-visuals/*.yaml`
- Modify: `src/content.config.ts`

- [x] **Step 1: Copy the selected source files without changing the originals**

Map `4, 6, 7, 10, 13, 14, 17, 18.jpg` to the stable English filenames above.

- [x] **Step 2: Add the collection schema**

Define `traditionalVisuals` with `title`, `order`, `draft`, `description`, `skill`, `featured`, and the existing image shape.

- [x] **Step 3: Add eight YAML records**

Record the verified natural dimensions, public image path, Chinese alt text, concise description, and `featured: true` only for images 4, 7, 13, and 17.

- [x] **Step 4: Validate the content model**

Run: `npm run build`

Expected: Astro content validation and build complete without errors.

### Task 3: Render the reusable traditional-work grid

**Files:**
- Create: `src/components/TraditionalVisualGrid.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/components/HomeSections.astro`
- Modify: `src/pages/visuals/index.astro`

- [x] **Step 1: Create a reusable grid component**

The component accepts traditional-work entries plus `mode: 'preview' | 'archive'`. Preview cards link to `/visuals/#traditional`; archive cards expose grouped lightbox metadata.

- [x] **Step 2: Load four featured records on the homepage**

Fetch `traditionalVisuals`, sort by order, filter `featured`, and pass them into `HomeSections`.

- [x] **Step 3: Upgrade the homepage foundation section**

Keep the existing copy and add exactly four preview cards.

- [x] **Step 4: Add the independent archive section**

Fetch all eight records and render them before `.gallery-section` under `id="traditional"`. Do not give these cards `data-visual`, so filters and counts continue to address only AI works.

### Task 4: Extend lightbox grouping and responsive styling

**Files:**
- Modify: `src/scripts/gallery.ts`
- Modify: `src/styles/global.css`

- [x] **Step 1: Group lightbox navigation**

Register every `[data-lightbox-trigger]`, navigate only among triggers with the same `data-lightbox-group`, and keep AI hidden-item filtering intact.

- [x] **Step 2: Limit traditional lightbox enlargement**

When `data-original-limit="true"`, set the dialog image maximum width to the record's natural width; clear that limit for AI archive images.

- [x] **Step 3: Add the asymmetric traditional grid**

Use balanced horizontal and vertical card spans on desktop, two columns on tablet, and one column on mobile. Every image uses `width: 100%; height: auto; object-fit: contain`.

- [x] **Step 4: Run focused tests**

Run: `npx playwright test tests/e2e/gallery.spec.ts tests/e2e/image-ratio.spec.ts tests/e2e/mobile.spec.ts`

Expected: all focused desktop and mobile tests pass.

### Task 5: Full verification

**Files:**
- Verify only

- [x] **Step 1: Validate content and types**

Run: `npm run check`

Expected: zero Astro diagnostics and all Vitest tests pass.

- [x] **Step 2: Build the static site**

Run: `npm run build`

Expected: all routes build successfully.

- [x] **Step 3: Run the complete browser suite**

Run: `npm run test:e2e`

Expected: zero Playwright failures.

- [x] **Step 4: Verify the live preview**

Request `/` and `/visuals/` from `http://127.0.0.1:4321` and confirm HTTP 200, four homepage traditional cards, eight archive traditional cards, and an unchanged `8 / 59` AI archive status.
