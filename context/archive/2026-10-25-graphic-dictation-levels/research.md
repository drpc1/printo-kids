# Research: graphic dictation levels (S-25)

## Question

Do the PRD levels (5 lat: ~14 mm cell, objects from the 4×12 half; 6 lat: today; 7 lat: ~8 mm, objects from the 9×24 half) fit one A4 page with the command list, and how many outlines does each level keep?

## Numbers (measured with the real generator, 2026-10-25, catalog of rocket / robot / strawberry)

| Level | Template level   | Whole object | Combinations | Pass the outline rule | Distinct outlines | Commands (min–max, median) |
| ----- | ---------------- | ------------ | ------------ | --------------------- | ----------------- | -------------------------- |
| 5 lat | lat4 (half 4×12) | 8×12         | 20           | 18                    | 9                 | 20–28, 24                  |
| 6 lat | lat6 (half 6×15) | 12×15        | 20           | 18                    | 9                 | 24–44, 36                  |
| 7 lat | lat7 (half 9×24) | 18×24        | 40           | 32                    | 14                | 36–76, 56                  |

Numbers will change with the S-21 catalog; tests do not pin them (`dictationVariantCount`).

## Fit

- Grid keeps one free cell around the object, so 5 lat is 10×14 at 14 mm (140×196 mm) and 7 lat is 20×26 at 8 mm (160×208 mm). 6 lat stays 14×17 at 11 mm.
- Usable page height is 277 mm. Instruction 7 + gap 6 + list + gap 6 + grid.
- 5 lat: 5 rows of 11 boxes (60 mm), total 275 mm, max 55 commands (largest card has 28).
- 7 lat: the grid leaves 50 mm. The 6 lat list (11 per row, 12 mm rows) fits only 4 rows = 44 commands, but 7 lat cards go up to 76. Decision: a denser list for 7 lat, 14 boxes per row, 8.3 mm rows, bold font 4.8 mm instead of 6, 6 rows, max 84 commands (total 276.8 mm). Measured in the browser: the widest command text uses 72% of its box on every level over 60 generations each. No card is dropped for the command limit at any level.

## Decision

List size is a per-level setting (`commandsPerRow`, `commandRowHeight`, `commandFontSize`, `maxCommands` in `levels.ts`); `DICTATION_MAX_COMMANDS` is gone. Level lives in page state, button is `LevelChoice`. Default level 6 lat (the card S-23 shipped).
