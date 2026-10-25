---
date: 2026-10-25
researcher: Claude (Opus 5.5)
git_commit: 8a1cd7d
branch: claude/adoring-mccarthy-571434
repository: drpc1/printo-kids
topic: "Graphic dictation first printable (S-23): page pattern, object source, outline rule"
tags: [research, graphic-dictation, symmetry-templates, card-catalog]
status: complete
last_updated: 2026-10-25
last_updated_by: Claude (Opus 5.5)
---

# Research: Graphic dictation first printable (S-23)

## Question

What does S-23 (US-17, FR-026) reuse from the codebase, where do the objects come from, and how many 6×15 template variants pass the outline rule (PRD Open Questions 11)?

## Summary

- The symmetry page is the pattern: `src/pages/symetria.astro` mounts `SymmetryGenerator` (`client:only="react"`) inside `GeneratorShell`; the component holds Generuj, level button, card SVG, Drukuj and `ProfileCorner` (`src/components/SymmetryGenerator.tsx:28-160`).
- Objects: `symmetryTemplatesFor("lat6")` returns the three 6×15 half templates (rocket, robot, strawberry) (`src/lib/symmetry/templates.ts:492-504`). `composeSymmetryCard(template, variants, rowOffset, level)` builds the half with holes as `details` (`src/lib/symmetry/generate.ts:84-110`); the full silhouette is cells ∪ details mirrored at `columns - 1 - col`.
- Of the 20 variant combinations of the 6×15 templates, 18 pass the outline rule (4-connected silhouette with holes filled, no vertex where two cells meet only diagonally): rocket 8/8, robot 8/8, strawberry 2/4. Both strawberry combinations with leaves variant 1 fail (`templates.ts:170`: `"gg..gg"` over `"..g.gg"` touches by a corner and leaves a separate piece).
- Variants that differ only in holes (rocket window, robot eyes, strawberry seeds) give the same outline. Distinct outlines among the 18 passing combinations: rocket 4, robot 4, strawberry 1 → 9 distinct pictures. A "new card" check must compare outlines, not variant keys.
- Command counts (runs of equal direction, start at top-left corner of the topmost row's leftmost cell, clockwise): rocket 24–40, robot 32–36, strawberry 44. Outline bounding box is 12×15 or 10×15.
- Catalog: `src/lib/cards.ts` `CARD_KINDS` (4 entries) + `public/thumbnails/*.svg` built by `scripts/build-thumbnails.mjs` from the real generators.
- Print contract test (`src/lib/sheet/print-contract.test.ts:10-17`) lists each page and generator by path; smoke (`scripts/smoke.mjs:31-38`) requests each page. Both list cards explicitly.

## Detailed findings

### Page pattern (symmetry)

- `src/pages/symetria.astro`: `Layout` → `GeneratorShell description=…` → `<SymmetryGenerator client:only="react" />`.
- `SymmetryGenerator.tsx`: `useChildProfileVisit` for the profile corner; toggles `has-sheet` on `#worksheet-home`; two layouts (hero before first card, bar + buttons after); `SymmetrySheet` draws an SVG with `aspect-[210/297]` and print classes `print:h-[297mm] print:w-[210mm]`.
- Drawing constants live in `src/lib/symmetry/sheet.ts` so the page and the thumbnail script share them; layout in `src/lib/symmetry/layout.ts` throws when the block does not fit inside the 10 mm inset.
- The sequence sheet (`src/lib/sequence/sheet.ts`) is the pattern for rows of fields under an instruction.

### Objects

- `SymmetryTemplate { id, width, height, base, parts[{id, variants}], holeColor }` (`templates.ts:19-30`).
- 6×15 list: `TEMPLATES_6_BY_15 = [ROCKET, ROBOT, STRAWBERRY]` used by lat5 and lat6 (`templates.ts:492-499`).
- S-21 (parallel, `template-object-catalog`) is adding objects and categories to this file; the dictation should reach templates through `symmetryTemplatesFor` (or an equivalent exported list) so new objects arrive without code changes, and must tolerate templates whose outline fails the rule.

### Outline rule probe

Probe (scratch, not committed): for each template and each variant combination, compose at row offset 0 on a 12-column half pair, mirror cells and holes, then check 4-connectivity, diagonal-only vertices, and trace the outer boundary clockwise.

| Template  | Combinations | Pass | Distinct outlines | Commands |
| --------- | ------------ | ---- | ----------------- | -------- |
| rakieta   | 8            | 8    | 4                 | 24–40    |
| robot     | 8            | 8    | 4                 | 32–36    |
| truskawka | 4            | 2    | 1                 | 44       |
| total     | 20           | 18   | 9                 | 24–44    |

### Sheet budget at 11 mm (6 lat)

Grid = object bounding box + 1 cell each side = 14×17 → 154×187 mm. Inside the 190×277 mm area, 90 mm are left above the grid for the instruction sentence and up to 44 commands.

## Gaps

- The layout of the command list (rows, glyph size) is a user decision (S-23 unknown); a mockup decides it before the plan.
- Counts above are for today's 3 templates; S-21 will change them.
