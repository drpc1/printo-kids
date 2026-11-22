<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Cienie (S-47) — plan implementacji

- **Plan**: context/changes/shadows-card/plan.md
- **Scope**: Phase 2 of 4
- **Reviewed phases**: 2
- **Date**: 2026-11-21
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 1 observation

Przegląd w głównej sesji bez agentów (mały zakres: 6 modułów i 2 pliki testów w `src/lib/shadows/`, `card-settings.ts`, `.dependency-cruiser.cjs`, `package.json`, skrypty w folderze zmiany; użytkowniczka prosiła o oszczędzanie tokenów).

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | WARNING |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Automatyczne: `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build` (wynik w opisie PR). Testy `shadows`: 27/27, w tym niezależna wyrocznia na 100 kartach każdego poziomu (rodziny, permutacja bez stałego punktu, różnica cieni ≥ progu) i układ w marginesie 10 mm z postacią i bez. Ręczne 2.6 (akceptacja podglądu) czeka na użytkowniczkę.

## Findings

### F1 — Nazwy i sygnatury inne niż w kontrakcie planu

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/shadows/levels.ts, layout.ts, engine.ts, src/lib/card-settings.ts
- **Detail**: `familyKind` → `familyRule`; `layoutShadowsSheet(card, hasCharacter)` → `(card, instructionBoxHeight)` jak w „Od najmniejszego”; `ShadowsSettings` w `card-settings.ts` już w fazie 2 i id `cienie` rzutowane do `CardKindId` do fazy 3 (wzór z S-48). Zachowanie bez zmian.
- **Fix**: Dopisać w planie (faza 2, punkty 1, 3, 4).
- **Decision**: FIXED

### F2 — Wspólny rysownik skryptów w folderze zmiany

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: context/changes/shadows-card/render.mts
- **Detail**: Rysownik z `catalog.mts` przeniesiony do `render.mts`, żeby podgląd i arkusz rysowały tak samo; nie jest kodem produktu. Strona w fazie 3 rysuje w React tym samym sposobem (dwa przejścia).
- **Fix**: Bez zmian.
- **Decision**: ACCEPTED
