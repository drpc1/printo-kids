<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Karta symetrii na A4 (S-12)

- **Plan**: `context/changes/symmetry-first-printable/plan.md`
- **Scope**: Phase 3 of 4
- **Reviewed phases**: 3
- **Date**: 2026-10-23
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

Przegląd na zestage'owanym kodzie przed commitem fazy 3. Wszystkie punkty kontraktu fazy 3 zgodne z planem; nic z „What We're NOT Doing”. Druk: jedyny `svg` to kartka, ikony i alert ukryte; grubości w mm. React: klucze unikalne, brak nieaktualnych domknięć. Automatyka: `npm test` 175/175, lint, astro check, build, smoke 7/7; render sprawdzony w przeglądarce. Tryb ciemny zgłoszony przez recenzenta odrzucony: motyw to klasa `.dark` (`src/styles/global.css:4,61`), której nic w aplikacji nie włącza, więc ciemny wydruk jest dziś nieosiągalny.

## Findings

### F1 — Kontrakt druku symetrii nie trzyma wszystkich klas druku

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: `src/lib/sheet/print-contract.test.ts` (testy symetrii)
- **Detail**: Test SVG sprawdza `print:w-[210mm]`, `print:h-[297mm]` i `print:overflow-hidden`, ale nie `print:block`, `print:max-h-[297mm]` ani `print:ring-0` (bez `ring-0` na wydruku byłaby ramka ekranowa, bez `max-h` ryzyko drugiej strony). Test strony nie sprawdza `client:only="react"`, a bez niego wyspa renderowałaby się na serwerze z `localStorage`.
- **Fix**: Dodać te trzy klasy do asercji SVG symetrii i asercję `client:only="react"` w teście strony.
- **Decision**: FIXED — asercje print:block, print:max-h-[297mm], print:ring-0 i client:only="react"; sprawdzian zepsucia czerwony dla ring-0 i client:only

### F2 — Jednowyrazowa nazwa dostępna kartki

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: `src/components/SymmetryGenerator.tsx` (`aria-label="Symetria"`)
- **Detail**: „Symetria” to krótka nazwa dla czytnika ekranu; labirynt ma ten sam wzorzec („Labirynt”), a plan i e2e fazy 4 używają dokładnie tej nazwy.
- **Fix**: Zostawić dla spójności z labiryntem i planem; ewentualna zmiana nazw obu kartek to osobna drobna zmiana.
- **Decision**: ACCEPTED — spójność z labiryntem i lokatorem e2e fazy 4
