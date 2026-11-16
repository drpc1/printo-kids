<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Zegar (S-41)

- **Plan**: context/changes/clock-card/plan.md
- **Scope**: Phase 2 of 4
- **Reviewed phases**: 2
- **Date**: 2026-11-16
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 4 observations

Commit 861b7e6. Dwa przeglądy równoległe (zgodność z planem; bezpieczeństwo i wzorce względem `src/lib/math-crossword/` i `src/lib/pattern-lines/`). Bramki 2.1–2.5 (npm test 1750/1751 z 1 pominiętym jak dotąd, lint, depcruise, astro check, build) i dwie kontrole z celowo zepsutym kodem (kąt wskazówki godzinowej, reguła minut nowych) przeszły przed commitem; testy zegara powtórzone przez recenzentów: 113/113. Każda pętla generatora ma granicę, losowość tylko z wstrzykniętego `random`, margines 10 mm z tolerancją 1e-6, rejestracja w katalogu nietknięta (faza 3).

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

### F1 — Komentarz silnika obiecuje sprawdzenie, którego nie ma w teście

- **Severity**: 💬 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/clock/engine.ts:28, src/lib/clock/engine.test.ts
- **Detail**: Komentarz mówi, że test specyfikacji sprawdza, czy karty bazowe `knownBad` (`sound`, `fullHours`, `dayHours`, `matchHours`) nie mają problemów; `engine.test.ts` tego nie robi. Gdyby baza sama łamała regułę, `knownBad` przechodziłby z „cudzego” powodu.
- **Fix**: Dopisać w `engine.test.ts` asercję, że każda karta bazowa ma pustą listę `clockProblems`.
- **Decision**: FIXED — asercja w engine.test.ts („the sound bases of the known bad cards have no problem”), karty bazowe w eksportowanej knownBadBases(); test zaczerwienił się na zepsutej bazie

### F2 — Ścieżka „poza marginesem” w layout nie ma testu

- **Severity**: 💬 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/clock/layout.ts:297-307, src/lib/clock/layout.test.ts:184-188
- **Detail**: Testy pokrywają oba wyjątki „brak miejsca”, ale nie wyjątek przy przekroczeniu marginesu 10 mm; dziś żadna karta go nie wywołuje, więc mutacja tej gałęzi przeszłaby niezauważona.
- **Fix**: Zostawić (gałąź obronna, układ liczony tak, żeby się mieścił; podobnie w krzyżówce) albo dopisać test z wymuszonym za dużym pasem polecenia, jeśli da się go wywołać bez zmiany API.
- **Decision**: SKIPPED — gałąź obronna, jak w krzyżówce

### F3 — Rozszerzenia względem planu: `clockProblems(card, target)` i dwa kody

- **Severity**: 💬 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/clock/card.ts:99-123
- **Detail**: Plan opisał `clockProblems(card)` z ośmioma kodami. Kod przyjmuje też ustawienia (`target`) i dodaje `settings-mismatch` (poziom, tryb albo 24 h karty różne od paska, wzór `level-mismatch` ze szlaczków) oraz wymaga zwykłej kolejności (`order` = 0, 1, 2…) poza Połączem w `order-not-permutation`, żeby jedna karta nie miała dwóch kluczy. Intencja planu zachowana; plan jest źródłem prawdy dla kolejnych przeglądów.
- **Fix**: Dopisać w planie pod fazą 2 krótki addendum o tych rozszerzeniach.
- **Decision**: FIXED — addendum w planie pod fazą 2

### F4 — Faza 3 musi usunąć rzutowanie `kind` także w teście

- **Severity**: 💬 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architecture
- **Location**: src/lib/clock/engine.ts:20, src/lib/clock/engine.test.ts:9-10
- **Detail**: `const KIND = "zegar" as CardKindId` jest tymczasowe (jak w S-40); plan fazy 3 każe usunąć rzutowanie w silniku, ale nie wspomina obejścia `kindOf` w `engine.test.ts`, które porównuje `kind` jako zwykły napis.
- **Fix**: Dopisać w addendum fazy 2, że faza 3 usuwa rzutowanie w `engine.ts` i obejście w `engine.test.ts`.
- **Decision**: FIXED — addendum w planie pod fazą 2 (faza 3 usuwa rzutowanie i obejście w teście)

Pomniejsze, bez osobnej pozycji: polecenia trybów stoją w `CLOCK_MODES` (zgodnie z planem; szlaczki trzymają je w `*_SHEET`), `CLOCK_SHEET.bandHeight` nieużywane (jak w krzyżówce), test `CardExhausted` sprawdza `attempts > 0`, nie `=== MAX_ATTEMPTS`.
