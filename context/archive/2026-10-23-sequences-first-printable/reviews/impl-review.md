<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Karta sekwencji na A4 (S-16)

- **Plan**: context/changes/sequences-first-printable/plan.md
- **Scope**: Full plan (phases 1–3 of 3)
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-10-24
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

## Verification

- Faza 3 vs plan: wpis w `cards.ts`, miniatura z prawdziwego generatora (drugi `npm run thumbnails` bez zmian), krok smoke, trzy testy kontraktu druku (bez testu kolorów, jak w planie), skrypt `test`, ryzyko 8 w `test-plan.md`, e2e katalogu i telefonu. Brak plików poza planem.
- `npm test` 235/235, lint czysty, `astro check` 0 błędów, build przechodzi, smoke 8/8, Playwright (katalog + telefon) 42 zielone na własnym porcie.
- Break-checki: kontrakt druku (usunięte `print:ring-0` → czerwony), kształty, walidator.
- Ręczne 2.5–2.8 i 3.8–3.12 odhaczone po potwierdzeniu użytkowniczki.
- Fazy 1–2 były już recenzowane (`impl-review-phase-1-2.md`: F1 i F2 naprawione, F3 sprawdzone przy druku fazy 3).

## Findings

### F1 — Diff `test-plan.md` jest szerszy niż jedno ryzyko

- **Severity**: OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Scope Discipline
- **Location**: context/foundation/test-plan.md (tabele §2)
- **Detail**: Dodanie dwóch wierszy zmieniło 38 linii, bo Prettier przeliczył szerokość kolumn obu tabel. S-18 też dopisze ryzyko do tych tabel, więc przy scalaniu konflikt obejmie całe tabele, nie tylko dwie linie.
- **Fix**: Zostawić. Kto scala drugi, bierze `git checkout --theirs` dla tabel i dopisuje swój wiersz, po czym puszcza `npx prettier --write`.
  - Strength: Format zgadza się z lint-staged; ręczne zachowanie starych szerokości wyszłoby przy następnym commicie.
  - Tradeoff: Jednorazowy konflikt przy scalaniu ze S-18.
  - Confidence: HIGH — Prettier jest w hooku commita.
  - Blind spot: Nie wiem, w jakiej kolejności scalą się PR-y.
- **Decision**: DEFERRED (decyzja przy scalaniu PR ze S-18)

### F2 — Brak e2e „każde Generuj daje inną kartę” dla sekwencji

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: tests/e2e/catalog.spec.ts
- **Detail**: US-10 mówi, że każde Generuj daje nową kartę. Unit test pilnuje `previousKey`, ale połączenie z wyspą (`card?.key ?? null` w `SequenceGenerator.tsx`) nie ma testu; symetria ma taki e2e. Plan go nie wymagał.
- **Fix**: Dodać test na wzór symetrii: trzy kolejne Generuj, `innerHTML` karty za każdym razem inny.
- **Decision**: FIXED (e2e w catalog.spec.ts)

### F3 — Trzy kopie przycisku Generuj

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architecture
- **Location**: src/components/GenerateButton.tsx
- **Detail**: Wspólny `GenerateButton` używa tylko sekwencja. `WorksheetGenerator.tsx` i `SymmetryGenerator.tsx` zostały przy swoich kopiach (świadoma decyzja planu, bo pliki współdzielone z S-18).
- **Fix**: Osobna zmiana po scaleniu S-16 i S-18: przepiąć labirynt, symetrię i sudoku na wspólny plik.
- **Decision**: DEFERRED (osobna zmiana po scaleniu S-16 i S-18)
