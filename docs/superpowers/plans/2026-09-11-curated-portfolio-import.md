# Curated Portfolio Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import the approved 59-image shortlist into the public visual archive and feature eight representative images on the homepage.

**Architecture:** Keep source artwork untouched. Copy selected JPG files to stable lowercase paths under `public/images/visuals/`, generate manifest entries from the reviewed ID mapping, then use the existing visual importer to generate Astro content records. Treat every image as AI-assisted unless the author later supplies a different production record.

**Tech Stack:** Astro content collections, Node/Python import tooling, Vitest, Playwright.

---

### Task 1: Lock the approved selection in tests

**Files:**
- Create: `tests/unit/portfolio-import.test.ts`
- Modify: `tests/e2e/gallery.spec.ts`

- [ ] Assert 59 manifest records, 8 featured records, four required categories, no demo records, safe filenames, and existing image files.
- [ ] Run `npm run test -- tests/unit/portfolio-import.test.ts` and confirm it fails because only two demo records exist.

### Task 2: Copy and register the curated images

**Files:**
- Create: `scripts/import-curated-portfolio.py`
- Create: `public/images/visuals/{commercial,ecommerce,festival,social}/...`
- Modify: `content/visuals-manifest.json`
- Generate: `src/data/visuals/generated/*.yaml`

- [ ] Map each approved ID to a human-readable title, category, alt text, stable filename, display order, and featured flag.
- [ ] Copy without altering files under `F:\王力宏的文件\作品集素材\5.15压缩作品集`.
- [ ] Remove the two generated demo records and run `npm run content:visuals`.
- [ ] Run `npm run test -- tests/unit/portfolio-import.test.ts` and confirm it passes.

### Task 3: Verify archive behavior and public output

**Files:**
- Modify: `tests/e2e/gallery.spec.ts`
- Modify: `tests/e2e/profile.spec.ts`
- Modify: `tests/e2e/visual-metadata.spec.ts`

- [ ] Update obsolete two-item demo assertions to the real 59-item archive behavior.
- [ ] Run `npm run check`, `npm run build`, and `npm run test:e2e`.
- [ ] Start the local preview and verify the visual archive returns HTTP 200.
