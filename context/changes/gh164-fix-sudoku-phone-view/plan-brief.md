# Sudoku digits centered in the cell on iPhone — Plan Brief

> Full plan: `context/changes/gh164-fix-sudoku-phone-view/plan.md`

## What & Why

Digits of the number sudoku sit at the top edge of the cell in Chrome and Brave on iPhone, on screen and in print (GitHub issue 164). Those browsers use WebKit, which ignores `dominant-baseline` on SVG text, so the digit baseline lands at the cell center instead of the digit itself.

## Starting Point

`SudokuSheet` in `src/components/SudokuGenerator.tsx` draws digits with `dominantBaseline="central"` and `y` at the cell center. Shape cards use paths and are fine.

## Desired End State

A digit is centered in its cell on the page and in print in Chromium and WebKit. Shape cards are unchanged.

## Key Decisions Made

| Decision     | Choice                                                | Why (1 sentence)                                            |
| ------------ | ----------------------------------------------------- | ----------------------------------------------------------- |
| Scope        | Sudoku digits only                                    | Matches issue 164; other cards get their own reports.       |
| Technique    | Explicit baseline offset from `SUDOKU_SHEET`          | Same result in every engine and in print, testable in Node. |
| Verification | Node unit test plus e2e on `chromium` and `iphone-13` | The defect only shows in WebKit.                            |
| Phases       | One                                                   | The change is a few lines in three files plus tests.        |

## Scope

**In scope:** `digitBaselineShift` constant, `sudokuDigitBaselineY` helper, `SudokuSheet` digits, unit test, e2e digit check.

**Out of scope:** other `dominantBaseline="central"` texts (sequences, nonogram, easy nonogram), shape sudoku, fonts, `digitScale`.

## Architecture / Approach

Drop `dominantBaseline` from the digit group; each digit's `y` is the cell center plus a fraction of the font size (start 0.35), computed by a pure helper next to the other sudoku layout code.

## Phases at a Glance

| Phase                      | What it delivers                                  | Key risk                                               |
| -------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| 1. Explicit digit baseline | Centered digits plus unit and WebKit e2e coverage | Shift 0.35 and the e2e tolerance need real-font tuning |

**Prerequisites:** Playwright WebKit installed to run `iphone-13`; an iPhone for the manual check.
**Estimated effort:** ~1 short session.

## Open Risks & Assumptions

- The shift 0.35 is an estimate from digit height; the manual check on iPhone confirms or adjusts it.
- WebKit coverage is not in default CI (`E2E_WEBKIT` on Windows, on-demand workflow `e2e-phone.yml`).
- Other cards with `dominantBaseline="central"` likely show the same defect.

## Success Criteria (Summary)

- Digits are centered on iPhone Chrome and Brave, on screen and in print.
- Desktop browsers and shape cards look unchanged.
- `npm test`, lint, type check, build and the digit e2e pass.
