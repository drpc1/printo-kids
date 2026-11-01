<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: S-33 Karta „Kto ma więcej?”

- **Plan**: context/changes/coins-who-has-more/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3, 4, 5
- **Date**: 2026-11-01
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warnings, 2 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | WARNING |
| Success Criteria    | PASS    |

## Findings

### F1 — Rozmiar zwykłego polecenia wpisany w trzech miejscach

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/MoneyGenerator.tsx:16
- **Detail**: Plan mówi „stałe z sheet.ts”, a sekwencje trzymają rozmiar polecenia w `SEQUENCE_SHEET.instructionSize`. Tu 7 jest literałem w komponencie, a skrypt miniatury ma 7 i makieta 7,5, więc strona, miniatura i makieta mogą się rozjechać.
- **Fix**: Dodać `plainInstructionSize: 7` do `MONEY_SHEET` i czytać je w komponencie, `build-thumbnails.mjs` i `money-mockup.mjs`.
- **Decision**: FIXED (stała `plainInstructionSize` w `MONEY_SHEET`, czytana przez komponent, miniaturę i makietę)

### F2 — Krok 4.6 (wydruk w Safari, Chrome iOS i Brave iOS) odhaczony bez dowodu w repo

- **Severity**: 💡 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Success Criteria
- **Location**: plan.md, Progress 4.6
- **Detail**: Krok został odhaczony na podstawie ogólnego potwierdzenia przed commitem fazy 4. W diffie nie ma śladu pomiaru na iOS, a lessons.md każe mierzyć każdą przeglądarkę osobno. Automatycznie sprawdzono tylko druk w Chromium (klasy `print:*`, margines 10 mm przez `getBBox`).
- **Fix**: Potwierdzić jednym zdaniem, że wydruk z każdej z trzech przeglądarek był jedną stroną A4; jeśli nie, cofnąć 4.6 i zmierzyć.
- **Decision**: PENDING

### F3 — Poziom trudny: kupki bywają duże (do 10 sztuk, sumy bliskie 50 zł)

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/money/generate.ts (drawPile)
- **Detail**: Liczba sztuk jest losowana równomiernie od 1 do `maxPieces`, więc na trudnym i średnim często wychodzą kupki 6–10 sztuk. Reguły planu są spełnione; trudność dla dziecka potwierdzi dopiero wydruk (Open Questions 14).
- **Fix**: Bez zmian teraz; po wydruku ewentualnie obniżyć `MAX_PIECES` w `sheet.ts`.
- **Decision**: PENDING

## Sprawdzone bez uwag

- Plan↔kod: wszystkie pliki z faz 1–5 istnieją i zgadzają się z intencją; odchylenia (łatwy z mieszanymi monetami, limit `MAX_PIECES`) są zapisane w planie i PRD.
- Bramki z fazy 4 uruchomione na końcu: `npm test` 888, lint, `astro check`, build, e2e na 4 projektach Chromium (323 przeszło), smoke. Po ostatnich commitach (tylko PRD i plan) przeszły testy modułu money, ustawień, podsumowania i `cards`, oraz `prettier --check`.
- Poza zakresem (zgodnie z „What We're NOT Doing”): kolory, grosze, banknoty powyżej 20 zł, ocena rysunku.
- Miniatury innych kart są nieaktualne względem swoich generatorów (`npm run thumbnails` je zmienia); nie dotyczy tej zmiany i nie zostały ruszone.
