<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Poziomy karty sekwencji (S-17)

- **Plan**: context/changes/sequence-difficulty-levels/plan.md
- **Mode**: Deep (pierwsza wersja bez sub-agenta; weryfikację najryzykowniejszych założeń na kodzie dodano po uwadze użytkowniczki)
- **Date**: 2026-10-24
- **Verdict**: SOUND
- **Findings**: 0 critical, 1 warning, 4 observations

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | PASS    |
| Lean Execution        | PASS    |
| Architectural Fitness | PASS    |
| Blind Spots           | WARNING |
| Plan Completeness     | PASS    |

## Grounding

8/8 ścieżek ✓ (levels.ts, generate.ts, layout.ts, sheet.ts, SequenceGenerator.tsx, SymmetryLevelChoice.tsx, build-thumbnails.mjs, print-contract.test.ts), symbole `SEQUENCE_LEVEL_LAT5`, `sequenceAnswers`, `twoGapRows` ✓ (używane tylko w `src/lib/sequence`, `SequenceGenerator.tsx`, `layout.test.ts`, `build-thumbnails.mjs`), Progress↔fazy ✓ (6, 8 i 12 wierszy zgodnych z kryteriami), brief↔plan ✓.

## Findings

### F1 — Plan mówił, że poziom 5 lat zostaje bez zmian, a walidator na pełnej liście reguł odrzuci część jego wierszy

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 1, Changes Required 3 (Generator i walidator)
- **Detail**: Wiersz AAB z dwiema lukami, np. `X X Y X _ Y _`, pasuje także do reguły rosnących grup (`X X Y X Y Y X`), która daje inną odpowiedź. Przy zgodności z PRD („z całej listy reguł”) taki wiersz jest dwuznaczny i generator go odrzuca. Plan twierdził, że 5 lat zachowuje się jak dotąd.
- **Fix**: Poprawić zdanie w planie i dodać test, że żaden wygenerowany wiersz 5 lat nie jest dwuznaczny względem grup. Ponawianie wierszy pokrywa większą liczbę odrzuceń.
- **Decision**: FIXED

### F2 — Koszt wyroczni dla trzech luk

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 1, Testy logiki
- **Detail**: 24³ = 13 824 wypełnień na ciąg razy 7 ciągów razy liczba ziaren to setki milionów sprawdzeń predykatów; 100 ziaren może wydłużyć `npm test` ponad miarę.
- **Fix**: Liczbę ziaren dla poziomu z trzema lukami dobrać tak, by test trwał do około 20 s (start 60).
- **Decision**: FIXED

### F3 — Przycisk poziomu: plan nie wymieniał wszystkiego, co kopiuje się z `SymmetryLevelChoice`

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 2, pasek poziomu
- **Detail**: Sub-agent potwierdził wzorzec (`SymmetryGenerator.tsx:50-72`, `levelControl` w `:83`), ale komponent poziomu ma też `DIALOG_ROW_CLASS` z `ProfileCorner`, sr-only `DialogTitle`, `print:hidden` na `DialogContent` i `aria-pressed`. Komunikat o nieudanym generowaniu już jest w wyspie.
- **Fix**: Dopisać te elementy do kontraktu fazy 2.
- **Decision**: FIXED

### F4 — E2E: liczenie pól i test telefonu

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 3, E2E
- **Detail**: SVG ma tło strony jako `<rect>`, więc liczenie `rect` daje pól + 1. Test symetrii na telefonie (`phone-layout.spec.ts:176-195`) już przechodzi po wszystkich poziomach i obsługuje okno Radix, które ukrywa tło.
- **Fix**: Liczyć `<g>` w SVG, ograniczyć do `chromium`, a test telefonu zrobić pętlą po czterech poziomach.
- **Decision**: FIXED

### F5 — Skrypt miniatur nie jest sprawdzany typami

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 3, Miniatura
- **Detail**: `scripts/build-thumbnails.mjs:251-275` rysuje `values[i]` jako kształt. Po zmianie typu na kształt lub liczbę kompilator tego nie zauważy; poziom 5 lat liczb nie ma, więc działa, ale błąd byłby cichy.
- **Fix**: Dodać strażnika, który rzuca, gdy pole zawiera liczbę.
- **Decision**: FIXED

Wyliczenie układu sub-agenta: pole 32,76 / 23,17 / 20,21 mm, minimalna wysokość wierszy 190,0 / 162,2 / 165,7 mm z 262 mm; poprawiono wartość „około 170 mm” w planie. Uwaga na szerokość: dwucyfrowa liczba przy `numberFontScale` 0,5 ma około 12 mm w polu 20,2 mm i narożnik z „?” jest blisko; sprawdza to ręczny druk (2.6, 3.9).
