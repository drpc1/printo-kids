<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Maze character choice

- **Plan**: context/changes/maze-character-choice/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-10-04
- **Verdict**: APPROVED
- **Findings**: 0 critical 1 warning 0 observations

Replaces the earlier phases-1–2 report. Prior F1–F4 (JPG sources, quiet Postać control, has-maze chrome, Progress 2.4 wording) were triaged and remain FIXED via addenda / JPG deletion.

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 — 30 mm figure sits ~1.6 mm from the A4 top edge

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/components/WorksheetGenerator.tsx:184
- **Detail**: `markY = originY - 30` puts the 30-unit PNG at y≈1.58 in a 210×297 sheet. Print CSS now keeps the job on one A4 page (`@media screen` for has-maze padding; print padding 0). Typical printer unprintable margins are 3–5 mm, so a slice of the figure can disappear on paper while looking fine on screen. The addendum chose 30 mm sitting on the grid so corridors stay clear; the original 20-unit mark would have sat ~11.6 mm from the top.
- **Fix A ⭐ Recommended**: Keep the 30 mm mark. Parents asked for this size; screen and one-page print already match. Accept that some printers may clip the top of the figure.
  - Strength: Matches the accepted phase 3 contract and the printed page the parent just confirmed.
  - Tradeoff: Physical printers with a hard margin can cut the character.
  - Confidence: HIGH — y≈1.58 is arithmetic from inset 10 + labelBand − 30.
  - Blind spot: Not measured on a specific home printer.
- **Fix B**: Shrink the mark so its top stays at or below the 10 mm inset (about 21.6 mm, inside the label band), accepting either a smaller figure or overlap with the first corridor.
  - Strength: More of the drawing survives cheap printer margins.
  - Tradeoff: Reverses the 30 mm / no-corridor-cover choice.
  - Confidence: MEDIUM — depends how much margin the parent’s printer actually eats.
  - Blind spot: No printer-margin measurement in this repo.
- **Decision**: FIXED via Fix A — keep 30 mm; accept that some printers may clip the top of the figure
