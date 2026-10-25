<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Graphic dictation first printable (S-23)

- **Plan**: context/changes/graphic-dictation-first-printable/plan.md
- **Mode**: Deep (local verification, no sub-agent)
- **Date**: 2026-10-25
- **Verdict**: SOUND (with warnings)
- **Findings**: 0 critical, 2 warnings, 1 observation

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | PASS    |
| Lean Execution        | PASS    |
| Architectural Fitness | PASS    |
| Blind Spots           | WARNING |
| Plan Completeness     | WARNING |

## Grounding

Grounding: 6/6 paths ✓ (symetria.astro, SymmetryGenerator.tsx, cards.ts, build-thumbnails.mjs, print-contract.test.ts, smoke.mjs), 3/3 symbols ✓ (symmetryTemplatesFor, composeSymmetryCard, CARD_KINDS), brief↔plan ✓

## Findings

### F1 — Random draws with rejection can return null as S-21 adds failing variants

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Phase 1 — Card
- **Detail**: The plan copies symmetry's "draw template + variants, retry up to N" loop. With 4/20 failing today and only 9 distinct outlines, and with S-21 objects that may fail the rule more often, a bounded retry can end in "Nie udało się ułożyć karty." although valid cards exist.
- **Fix ⭐ Recommended**: Enumerate every (template, variant) combination of the level once (20 today), keep those that pass the rule and fit the sheet, dedupe by outline key, then pick uniformly among outlines whose key differs from the previous one. Null only when fewer than one other outline exists.
  - Strength: Never fails while two valid outlines exist; uniform over pictures, not over hole variants.
  - Tradeoff: Enumeration grows with the product of variant counts; cheap at today's sizes (tens to low hundreds).
  - Confidence: HIGH — 20 combinations probe ran in milliseconds.
  - Blind spot: S-21 variant counts unknown; memoize per level.
- **Decision**: FIXED (Fix)

### F2 — Layout throws during render if an outline has too many commands

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1 — Card / Phase 2 — Layout
- **Detail**: layoutDictationSheet throws when the list does not fit, and the React sheet calls it in render; an S-21 object with >55 commands would crash the page instead of being skipped.
- **Fix**: Export `DICTATION_MAX_COMMANDS` (the largest count that fits, derived in sheet/layout and covered by a test) and skip outlines above it in the generator.
- **Decision**: FIXED

### F3 — Manual step 1.3 is better as a PR note than a gate

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1 — Success Criteria
- **Detail**: Exact counts (20/16/9) change when S-21 lands; asserting them in tests would break on merge.
- **Fix**: Keep the manual check; tests assert only that at least two distinct outlines pass and that strawberry leaves variant 1 fails.
- **Decision**: FIXED
