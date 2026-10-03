<!-- PLAN-REVIEW-REPORT -->
# Plan Review: Print A4 maze

- **Plan**: `context/changes/print-a4-maze/plan.md`
- **Mode**: Deep
- **Date**: 2026-10-03
- **Verdict**: SOUND
- **Findings**: 0 critical, 1 warning, 1 observation

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| End-State Alignment | PASS |
| Lean Execution | PASS |
| Architectural Fitness | PASS |
| Blind Spots | PASS |
| Plan Completeness | WARNING |

## Grounding

Grounding: 7/7 paths ✓, 6/6 symbols ✓, brief↔plan ✓

## Findings

### F1 — Print contract misses the rules that spill onto a second page

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1 — Print layout / Critical Implementation Details
- **Detail**: `#worksheet-home` has `min-h-screen`. `Layout.astro` sets `html, body { height: 100% }`. In print, `100vh` can be the screen, taller than A4, so a 297mm sheet can spill a blank second page after padding and `max-w-xl` are gone. Criterion 1.5 also hides buttons, and Generuj lives in the React island, which a scoped Astro style does not reach.
- **Fix**: In the home page’s unscoped print style, set `min-height: 0` on `#worksheet-home` and `height: auto` on `html, body`, and hide buttons from that same style. Leave on-screen classes, `Layout.astro`, and `global.css` unchanged.
- **Decision**: FIXED (print-only height reset)

### F2 — Manual check never sets the dialog’s Margins control

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 1 manual verification, manual testing step 3
- **Detail**: The steps say to turn headers and footers off. The dialog also has Margins. Default keeps `@page` margin 0, so the 10mm inset stays. Minimum or Custom shrinks the maze and fails the same-size check.
- **Fix**: State that the pass bar is margins left at Default and headers and footers off.
- **Decision**: FIXED (manual steps updated)
