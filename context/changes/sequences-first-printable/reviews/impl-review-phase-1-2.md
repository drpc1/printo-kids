<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Karta sekwencji na A4 (S-16)

- **Plan**: context/changes/sequences-first-printable/plan.md
- **Scope**: Phases 1–2 of 3
- **Reviewed phases**: 1, 2
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

- `npm test` 202/202, `npm run lint` czysty, `npx astro check` 0 błędów, `npm run build` przechodzi (uruchomione po kodzie fazy 2).
- Break-check fazy 1: osłabienie warunku `ambiguous` zaczerwieniło test.
- Ręczne 2.5–2.8 odhaczone po potwierdzeniu użytkowniczki na buildzie produkcyjnym (preview).

## Findings

### F1 — Układ rzuca zamiast ograniczać pole wysokością

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/sequence/layout.ts:30
- **Detail**: Plan mówi, że szerokość pola jest „ograniczona też wysokością”. Implementacja liczy pole tylko z szerokości i rzuca, gdy wiersze się nie mieszczą (inaczej test „20 wierszy rzuca” z planu nie miałby sensu). Dla „5 lat” wynik jest ten sam (23,2 mm).
- **Fix**: Dopisać w planie jedno zdanie o tej decyzji (addendum), żeby S-17 nie szukało ograniczenia wysokością.
- **Decision**: FIXED (addendum w planie)

### F2 — Brak testu geometrii kształtów

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/sequence/shapes.ts
- **Detail**: `sequenceShapeOutline` nie ma testu, a czytają ją strona i (w fazie 3) skrypt miniatur. Plan nie wymagał testu, ale regresja (np. kształt wystający z kwadratu `size`) wyszłaby dopiero na wydruku.
- **Fix**: Mały test: każdy kształt mieści się w kwadracie `size` wokół (cx, cy), a wynik jest deterministyczny.
- **Decision**: FIXED (shapes.test.ts)

### F3 — `dominantBaseline="hanging"` przy „?” różni się między przeglądarkami

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/SequenceGenerator.tsx (tekst „?” pustego pola)
- **Detail**: Położenie „?” zależy od obsługi `hanging` w druku Firefox/Safari. Chrome wygląda dobrze. Ryzyko jest kosmetyczne, ale „?” nie może wejść w środek pola.
- **Fix**: Nic nie zmieniać teraz; sprawdzić w ręcznym druku fazy 3 (3.9–3.11). Jeśli się rozjedzie, użyć jawnego `y` z `questionSize * 0.8` zamiast `hanging`.
- **Decision**: DEFERRED (sprawdza ręczny druk fazy 3)
