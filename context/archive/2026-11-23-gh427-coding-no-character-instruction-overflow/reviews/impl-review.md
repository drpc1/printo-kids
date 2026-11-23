<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Wspólne polecenie bez postaci (GitHub 427)

- **Plan**: context/changes/gh427-coding-no-character-instruction-overflow/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-11-23
- **Verdict**: APPROVED
- **Findings**: 0 critical, 2 warnings, 3 observations

Automated checks on main after merge (PR #476): `npm test` 2068 pass / 0 fail (one earlier run had 2 timing-flaky failures, green on rerun), lint, `astro check` and `depcruise` clean. Dictation thumbnail bottom edge 279.9 mm (limit 287), so no overflow.

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

### F1 — Duplicate React key possible in PlainInstruction

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/PlainInstruction.tsx
- **Detail**: `key={line}` collides if two lines are identical. Cannot happen with today's texts.
- **Fix**: Use `key={`${index}-${line}`}` (the list is static).
- **Decision**: FIXED (key z indeksem)

### F2 — Cards test mirrors component inputs by hand

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/lib/plain-instruction-cards.test.ts
- **Detail**: `PLAIN_INSTRUCTIONS` is copied from the component call sites. `layoutPlainInstruction` throws at render if a sentence is too wide, so a component that later passes different text/size/inset stays green in the test but can crash the page.
- **Fix**: Add a per-card `plainInstructionInput(sheet, text)` helper used by both the component and the test.
  - Strength: one source of truth; test covers what renders.
  - Tradeoff: touches 16 components again.
  - Confidence: MED — pattern is simple but wide.
  - Blind spot: Not checked how many components build their input differently.
- **Decision**: SKIPPED (do osobnej zmiany: wspólny helper dotyka 16 komponentów)

### F3 — Dyktando width at the edge of the estimate

- **Severity**: 💡 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: src/lib/sheet/plain-instruction.ts:20
- **Detail**: Dyktando text is ~189 mm in the browser but 206 mm by the 0.5 estimate, so it breaks into two lines and its cell shrinks (≥85% of nominal). Intended per plan, but depends on font width; only ~6% margin on wider phone fonts.
- **Fix**: Leave; revisit if print on phones shows overflow.
- **Decision**: ACCEPTED (zgodne z planem)

### F4 — Thumbnail script escapes only < and >

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: scripts/build-thumbnails.mjs (plainInstructionSvg)
- **Detail**: A `&` in an instruction would produce invalid XML. No current text has one.
- **Fix**: Also replace `&` with `&amp;` first.
- **Decision**: FIXED (escape & w skrypcie miniatur)

### F5 — Helper returns baselines, plan said lineOffsets

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/sheet/plain-instruction.ts:74-80
- **Detail**: Equivalent and simpler for the component; minor contract drift.
- **Fix**: None needed.
- **Decision**: ACCEPTED (równoważne)
