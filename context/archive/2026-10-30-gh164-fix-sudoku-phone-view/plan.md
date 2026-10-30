# Sudoku digits centered in the cell on iPhone Implementation Plan

## Overview

Digits of the number sudoku sit at the top edge of the cell in Chrome and Brave on iPhone (WebKit), on screen and in print. We stop depending on `dominant-baseline` for the digits and place the baseline ourselves, so the digit is centered in every engine. GitHub issue 164.

## Current State Analysis

`SudokuSheet` draws digit cards as one `<g>` with `dominantBaseline="central"`, and each `<text>` gets `y = cellCenter.y` (`src/components/SudokuGenerator.tsx:316-337`). WebKit ignores `dominant-baseline` on SVG text, so `y` stays the baseline and the glyph sits above the cell center. Shapes are paths around the center and are not affected. Print uses the same SVG.

## Desired End State

A digit is vertically centered in its cell on the page and in print, in Chromium and in WebKit (Chrome and Brave on iPhone). Shape cards are unchanged. Verify: the `iphone-13` Playwright project passes the new digit check, and a card opened on an iPhone looks centered.

### Key Discoveries:

- Digit font size is `cellSize * SUDOKU_SHEET.digitScale` (0.6) in `src/lib/sudoku/sheet.ts:26`; the page component reads that table, so a new offset constant belongs next to it.
- Pure layout helpers live in `src/lib/sudoku/layout.ts` and are tested in `src/lib/sudoku/layout.test.ts`, which `npm test` already runs.
- `iphone-13` exists in `playwright.config.ts:51` only behind `E2E_WEBKIT` on Windows; the on-demand workflow is `.github/workflows/e2e-phone.yml`.
- `tests/e2e/sudoku-levels.spec.ts` already opens `/sudoku` and switches to digits, so the new e2e can reuse that flow.

## What We're NOT Doing

- Other cards that use `dominantBaseline="central"` (`SequenceGenerator.tsx:302`, `NonogramGenerator.tsx:361`, `NonogramSimpleSheet.tsx:141`) may show the same defect on iPhone. Out of scope; to be reported separately.
- No change to shape sudoku, instruction text, labels or thumbnails.
- No font change and no change to `digitScale`.

## Implementation Approach

Remove `dominantBaseline` from the digit `<g>` and give each digit an explicit baseline `y = center.y + digitSize * digitBaselineShift`, computed by a pure helper in `src/lib/sudoku/layout.ts`. The shift is a fraction of the font size (about half the digit height, starting at 0.35) stored in `SUDOKU_SHEET`. A plain `y` behaves the same in every engine and in print.

## Phase 1: Explicit digit baseline

### Overview

Add the constant and the helper, use them in `SudokuSheet`, and cover them with a Node test and a WebKit check.

### Changes Required:

#### 1. Constant

**File**: `src/lib/sudoku/sheet.ts`

**Intent**: Name the vertical offset of a digit baseline below the cell center, so the page and tests read one value.

**Contract**: `SUDOKU_SHEET.digitBaselineShift` — number, fraction of the digit font size; starts at `0.35`.

#### 2. Helper

**File**: `src/lib/sudoku/layout.ts`

**Intent**: Compute the baseline `y` of a digit from the cell center and the digit size, outside the component so it can be tested.

**Contract**: `sudokuDigitBaselineY(centerY: number, digitSize: number, shift: number): number` returns `centerY + digitSize * shift`.

#### 3. Page component

**File**: `src/components/SudokuGenerator.tsx`

**Intent**: Stop relying on `dominantBaseline` for digits and place each digit with the helper.

**Contract**: the digit `<g>` (lines 316-337) loses `dominantBaseline`; each `<text>` gets `y={sudokuDigitBaselineY(center.y, digitSize, SUDOKU_SHEET.digitBaselineShift)}`. Instruction and label texts keep `dominantBaseline="middle"`.

#### 4. Unit test

**File**: `src/lib/sudoku/layout.test.ts`

**Intent**: Pin the helper so the offset cannot be dropped silently.

**Contract**: a case where `sudokuDigitBaselineY(100, 12, 0.35)` is greater than 100 and equals `104.2`, and a case where the result stays inside the cell for each `cellSize` in `SUDOKU_SHEET` (baseline below the center, glyph top within the cell).

#### 5. WebKit check

**File**: `tests/e2e/sudoku-digits.spec.ts` (new)

**Intent**: Catch the regression in the engine where it happened.

**Contract**: open `/sudoku`, choose 9×9 and Cyfry, and for the first digit compare its `getBBox()` vertical center to its cell center; it must be within 0.15 of the cell size. Runs in every project; the `iphone-13` project is the one that failed before. The tolerance may need tuning against the real font.

### Success Criteria:

#### Automated Verification:

- Unit tests pass: `npm test`
- Linting passes: `npm run lint`
- Type check passes: `npx astro check`
- Build passes: `npm run build`
- Digit check passes in Chromium: `npx playwright test tests/e2e/sudoku-digits.spec.ts --project=chromium`
- Digit check passes in WebKit: `E2E_WEBKIT=1 npx playwright test tests/e2e/sudoku-digits.spec.ts --project=iphone-13`

#### Manual Verification:

- On an iPhone in Chrome or Brave, a 9×9 and a 6×6 digit card show every digit centered in its cell.
- The print preview from the same iPhone shows the same centering.
- Desktop Chrome, Firefox and Safari still show centered digits, and a shape card is unchanged.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Testing Strategy

### Unit Tests:

- `sudokuDigitBaselineY` value and its position inside each cell size.

### Integration Tests:

- `tests/e2e/sudoku-digits.spec.ts` on `chromium` and `iphone-13`.

### Manual Testing Steps:

1. Open `/sudoku` on an iPhone, choose 9×9 and Cyfry, generate, check centering.
2. Open the print preview and check the same card.
3. Repeat on desktop Chrome and Safari.

## Performance Considerations

None; one arithmetic expression per digit.

## References

- GitHub issue 164
- Digit rendering: `src/components/SudokuGenerator.tsx:316`
- Constants: `src/lib/sudoku/sheet.ts:26`
- Same pattern elsewhere (not in scope): `src/components/SequenceGenerator.tsx:302`, `src/components/NonogramGenerator.tsx:361`, `src/components/NonogramSimpleSheet.tsx:141`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Explicit digit baseline

#### Automated

- [x] 1.1 Unit tests pass: `npm test`
- [x] 1.2 Linting passes: `npm run lint`
- [x] 1.3 Type check passes: `npx astro check`
- [x] 1.4 Build passes: `npm run build`
- [x] 1.5 Digit check passes in Chromium: `npx playwright test tests/e2e/sudoku-digits.spec.ts --project=chromium`
- [x] 1.6 Digit check passes in WebKit: `E2E_WEBKIT=1 npx playwright test tests/e2e/sudoku-digits.spec.ts --project=iphone-13`

#### Manual

- [x] 1.7 On an iPhone in Chrome or Brave, a 9×9 and a 6×6 digit card show every digit centered in its cell
- [x] 1.8 The print preview from the same iPhone shows the same centering
- [x] 1.9 Desktop Chrome, Firefox and Safari still show centered digits, and a shape card is unchanged
