<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Cienie (S-47) — plan implementacji

- **Plan**: context/changes/shadows-card/plan.md
- **Scope**: Phase 3 of 4
- **Reviewed phases**: 3
- **Date**: 2026-11-22
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 1 observation

Przegląd w głównej sesji bez agentów (zakres wzorowany 1:1 na „Labiryncie liczbowym” S-49; użytkowniczka prosiła o oszczędzanie tokenów).

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | WARNING |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Automatyczne: `npm test` 1998/1998, `npm run lint`, `npm run depcruise`, `npx astro check` (0 błędów), `npm run build`, e2e na czterech projektach Chromium (393 przeszło, 207 pominiętych z założenia projektów), smoke na serwerze dev (`/shadows` 200). Ręczne 3.5–3.7 czekają na użytkowniczkę (przeglądarka w sesji nie dostała dostępu do localhost; wygląd sprawdzony na miniaturze z tego samego kodu rysowania).

## Findings

### F1 — Poprawki rysunków z gałęzi fazy 2 w PR fazy 3

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: src/lib/shadows/pictures/_, picture-format.ts, pictures.test.ts, context/changes/shadows-card/catalog-_, prd.md, plan.md
- **Detail**: PR #444 scalono na pierwszym commicie fazy 2; późniejsze commity tej gałęzi (przerysowane obrazki, rodzina kwiatów, 8 obrazków w każdej rodzinie, detal `stroke` bez obrysu, akceptacja 2.6) nie weszły do `main`. Gałąź fazy 3 scala `origin/claude/shadows-card-p2`, żeby ich nie zgubić.
- **Fix**: Scalone do tej gałęzi; opis PR to mówi.
- **Decision**: ACCEPTED

### F2 — Przesunięcie linii bazowej polecenia bez stałej w SHADOWS_SHEET

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/ShadowsSheet.tsx, scripts/build-thumbnails.mjs
- **Detail**: Inne karty trzymają `baselineShift` w module arkusza; tu 0,36 stoi w komponencie i w skrypcie miniatur. Ta sama wartość co w „Labiryncie liczbowym”.
- **Fix**: Bez zmian w tej fazie; można przenieść do `SHADOWS_SHEET` przy fazie 4.
- **Decision**: ACCEPTED
