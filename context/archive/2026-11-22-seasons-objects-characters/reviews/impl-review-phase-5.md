<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Zima: obiekty i postacie w oknie dat (S-54)

- **Plan**: context/changes/seasons-objects-characters/plan.md
- **Scope**: Phase 5 of 6
- **Reviewed phases**: 5
- **Date**: 2026-11-23
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 1 observation

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | WARNING |

Evidence:

- `WINTER_WINDOW` (1.12–29.02) is defined in `src/lib/sheet/character.ts`; Bałwanek uses it, and Pingwin (`/characters/pingwin.webp`, already on main) is added with contentLeft/Right 298/298.
- The penguin drawing already has the standard frame (outline y 96–415 of 512, centered), measured by `normalize-pingwin.mts`, so no recrop is needed.
- Unit tests cover November, December–6.01, January–February (29.02 in 2028) and March. The e2e file `winter-characters.spec.ts` checks December, February (picking Pingwin shows it on the card) and 1 March. `christmas-characters.spec.ts` now checks the off-window case in March, since February is inside the winter window.
- Lint, depcruise, `npm test` (2052 passing), astro check and build are green.

## Findings

### F1 — Bałwanek leaves the list on 15–30 November

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Success Criteria
- **Location**: src/lib/sheet/character.ts:19
- **Detail**: Under the plan ("Bałwanek: okno 1.12–29.02"), Bałwanek moves from the Christmas window (15.11–6.01) to the winter window. From 15 to 30 November the list therefore offers only Mikołaj and Renifer, while before this change it offered Bałwanek too. This affects the current days (today is 23.11).
- **Fix A ⭐ Recommended**: Give Bałwanek the union window 15.11–29.02.
  - Strength: Nothing is lost in November, and Bałwanek stays until the end of winter.
  - Tradeoff: The window no longer matches the Zima category (1.12) exactly.
  - Confidence: HIGH — a one-line window change plus test updates.
  - Blind spot: None significant.
- **Fix B**: Keep it as in the plan (1.12–29.02).
  - Strength: Consistent with the Zima category.
  - Tradeoff: Bałwanek disappears from the list for two weeks in November.
  - Confidence: HIGH.
  - Blind spot: A child whose favourite is Bałwanek keeps it, because a selected character stays on the list.
- **Decision**: FIXED — Fix B (okno 1.12–29.02 jak w planie, decyzja użytkowniczki 2026-11-23)

### F2 — Manual check 5.3 is pending

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: N/A
- **Detail**: Two things are unchecked: whether the 16-row list in December is cut off on a phone, and whether Pingwin looks like the rest of the set on the card and at the level 6 maze start.
- **Fix**: Check on staging with a December date.
- **Decision**: PENDING
