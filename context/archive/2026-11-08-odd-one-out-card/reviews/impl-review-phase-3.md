<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: S-34 Karta „Który nie pasuje”

- **Plan**: context/changes/odd-one-out-card/plan.md
- **Scope**: Phase 3 of 3
- **Reviewed phases**: 3
- **Date**: 2026-11-09
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Recenzent (zgodność i jakość) potwierdził MATCH dla Changes Required 1–4: rejestracja `niepasuje`, strona `/odd-one-out`, handler kolorów z `applySettings` (inaczej niż money), INVENTORY z kolorami w `content`, e2e reprint (postać zostawia kartę, kolory układają nową), wpisy w tabelach kart. Cztery adaptacje podwykonawcy uznane za uzasadnione: naprawa importu `sudokuBlock` w `scripts/build-thumbnails.mjs` (skrypt nie działał na HEAD), regex `/^\/[a-z-]+$/` w `how-it-works.spec.ts` (myślniki w `/odd-one-out`), nowy test telefonu w `phone-layout.spec.ts`, seed `niepasuje` w `profile-summary.spec.ts`.

Bramki: `npm test` (1185 pass), lint, depcruise, `astro check`, build; e2e na porcie 4399 dla `chromium`, `phone-360`, `pixel-7`, `tablet-768` (10 plików: 296 passed, 192 skipped zgodnie z konfiguracją projektów); smoke na `npm run preview -- --port 4399`: wszystkie kroki zielone. Kontrola celowego zepsucia: bez `applySettings` w handlerze kolorów dwa testy e2e kolorów są czerwone. Zrzuty strony (trudny z kolorami i bez, łatwy) obejrzane: każdy rząd ma jedną odpowiedź, rozpraszacze parami, ikony czytelne na ekranie.

Ręczne 3.8–3.11 (strona, wydruk A4, druk na iOS, katalog i profil) czekają na użytkowniczkę.

## Findings

### F1 — Kredka bez tokenu dałaby niewidoczny kształt

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/OddOneOutPicture.tsx:36
- **Detail**: Wypełnienie budowane z `--symmetry-${crayon}`; brak tokenu w `global.css` dałby pusty `fill` bez błędu.
- **Fix**: Test w `rules.test.ts`: każda `ODD_CRAYONS` ma token `--symmetry-*` w `global.css`.
- **Decision**: FIXED

### F2 — Naprawa importu w skrypcie miniatur poza zakresem karty

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: scripts/build-thumbnails.mjs (import `sudokuBlock`)
- **Detail**: Skrypt nie działał na HEAD (`sudokuBlock` przeniesiony do `sudoku/block.ts`). Ponowne wygenerowanie zmienia też bajty czterech innych miniatur; przywrócono je, w commicie jest tylko nowa `niepasuje.svg`.
- **Fix**: Zostaje w tej fazie (potrzebne do miniatury); opisane w PR.
- **Decision**: ACCEPTED

### F3 — Drobne nadmiarowości w komponencie

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/OddOneOutPicture.tsx:34, OddOneOutGenerator.tsx:130,156
- **Detail**: `item.shape ?? "circle"` po wcześniejszym zawężeniu, fragment z jednym dzieckiem, `cn()` z jednym stringiem — tak samo jak w `MoneyGenerator.tsx`.
- **Fix**: Bez zmian (zgodne ze wzorcem).
- **Decision**: DISMISSED
