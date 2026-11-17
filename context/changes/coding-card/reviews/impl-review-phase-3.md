<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Kodowanie (S-42)

- **Plan**: context/changes/coding-card/plan.md
- **Scope**: Phase 3 of 4
- **Reviewed phases**: 3
- **Date**: 2026-11-17
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 2 observations

Przegląd własny diffu fazy 3 względem planu (bez subagentów, żeby oszczędzić tokeny), plus podgląd karty w przeglądarce (Poziom 1, Zapisz, „Brak”).

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

## Findings

### F1 — Przeszkody w tokenie `--muted-foreground` wychodzą ciemne

- **Severity**: OBSERVATION
- **Impact**: LOW
- **Dimension**: Pattern Consistency
- **Location**: src/lib/coding/sheet.ts (`colors.obstacle`)
- **Detail**: Plan każe użyć tokenu z `global.css`, bez hexów. Na ekranie `--muted-foreground` jest ciemnobrązowy, więc przeszkody są ciemniejsze niż szary `#9a9a9a` z makiety i podglądu. To samo dotyczy szarego przykładu w polach odpowiedzi. Ocena na wydruku to zadanie fazy 4 (4.3).
- **Fix**: Jeśli wydruk pokaże, że przykład myli się z przeszkodami, dodać dedykowany token jasnej szarości w `global.css`.
- **Decision**: SKIPPED (do oceny w fazie 4)

### F2 — Test `character-speaks` zakładał jeden obrazek postaci

- **Severity**: OBSERVATION
- **Impact**: LOW
- **Dimension**: Success Criteria
- **Location**: tests/e2e/character-speaks.spec.ts
- **Detail**: Na karcie kodowania postać stoi w dymku i w polu startu (dwa obrazki). Test ma teraz pole `characterImages` (2 dla `/coding`, domyślnie 1).
- **Fix**: Już zastosowane.
- **Decision**: FIXED

## Kryteria sukcesu

- `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`: PASS.
- E2E na czterech projektach Chromium: PASS (po poprawce F2; jeden niestabilny test `sudoku-colors` na pixel-7 przeszedł przy ponownym biegu).
- Smoke na zbudowanym podglądzie: PASS.
- Manualne 3.5–3.7: oczekują na użytkowniczkę, nieodhaczone.
