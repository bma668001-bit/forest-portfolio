# Workflow Case Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the four supplied public-account workflow graphics as a compact, reusable case gallery on the “公众号快速创作” detail page.

**Architecture:** Add an optional gallery array to workflow content, render it through a focused Astro component, and keep the layout CSS-only. Copy the original PNG files unchanged into a stable public path.

**Tech Stack:** Astro 7, Zod content schema, YAML/Markdown frontmatter, CSS Grid, Playwright.

---

### Task 1: Define gallery behavior

**Files:**
- Create: `tests/e2e/workflow-gallery.spec.ts`

- [ ] Add a Playwright test that expects a “案例图解” region with four ordered images and captions on `/workflows/wechat-writing/`.
- [ ] Add assertions that `/workflows/video-booklist/` has no empty gallery and that 390px uses one column without overflow.
- [ ] Run `npx playwright test tests/e2e/workflow-gallery.spec.ts` and confirm it fails because the gallery does not exist.

### Task 2: Add reusable gallery data and rendering

**Files:**
- Create: `src/components/WorkflowCaseGallery.astro`
- Modify: `src/content.config.ts`
- Modify: `src/pages/workflows/[id].astro`
- Modify: `src/styles/global.css`

- [ ] Extend workflow schema with `gallery: z.array(projectImage).default([])`.
- [ ] Render the component only when `entry.data.gallery.length > 0`.
- [ ] Build semantic figures with intrinsic width and height, alt text, numbered labels and optional captions.
- [ ] Use a two-column desktop grid and one-column layout below 640px; preserve each image’s 4:3 ratio with `height: auto`.

### Task 3: Import the four originals and metadata

**Files:**
- Create: `public/images/workbenches/wechat-writing/content-system.png`
- Create: `public/images/workbenches/wechat-writing/six-step-flow.png`
- Create: `public/images/workbenches/wechat-writing/privacy-boundary.png`
- Create: `public/images/workbenches/wechat-writing/reusable-deliverables.png`
- Modify: `src/data/workflows/wechat-writing.md`

- [ ] Copy all four PNG files without recompression and verify source/destination SHA-256 hashes match.
- [ ] Add the four gallery records in numerical order, each with `width: 1448`, `height: 1086`, accurate alt text and concise captions.
- [ ] Run the focused test and confirm all cases pass.

### Task 4: Verify the site

**Files:**
- Verify only

- [ ] Run `npm run check` and confirm zero diagnostics and all unit tests pass.
- [ ] Run `npm run build` and confirm all static routes build.
- [ ] Run `npm run test:e2e` and confirm the full desktop/mobile suite passes.
- [ ] Inspect the case gallery at 1440px and 390px for correct order, proportions and spacing.
