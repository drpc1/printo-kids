# Phone settings rows Implementation Plan

## Overview

Na telefonie dwa rzędy ustawień karty nie trzymają linii (GitHub issue #173). W sudoku napis „Kształty” / „Cyfry” zaczyna się 4 px bardziej w lewo niż „Postać” i „Rozmiar”. W nonogramie, zanim pojawi się kartka, odstęp nad „Kategorią” jest większy niż odstęp między zawiniętymi „Postacią” i „Poziomem”.

## Current State Analysis

Przycisk z chevronem (`CharacterChoiceControl`, `SudokuChoice`, `LevelChoice`) ma w klasie `px-2`, a domyślny rozmiar `Button` dokłada `has-[>svg]:px-3`. Ikona wygrywa, więc napis stoi 12 px od lewej krawędzi przycisku. To ten sam inset, do którego `max-sm:px-3` dosuwa przełącznik.

`SudokuSymbolsChoice` nie ma ikony. Oba przyciski zostają przy `px-2`, więc napis stoi 8 px od lewej. Ramki przycisków już się pokrywają z ramkami wiersza wyżej. Rozjazd widać na napisie, gdy grupa zawinie się do własnej linii. Wybór symboli jest tylko przy 6×6 i 9×9. Domyślne 4×4 go nie renderuje.

Nonogram przed kartką trzyma „Postać” i „Poziom” w `flex flex-wrap … gap-2`, a „Kategorię” jako kolejne dziecko kolumny `gap-6`. Gdy „Postać” i „Poziom” schodzą na dwie linie, odstęp między nimi zostaje 8 px, a odstęp od tej pary do „Kategorii” zostaje 24 px. Notatka i „Generuj” są w tej samej kolumnie `gap-6`. Po pokazaniu kartki cała belka jest już jednym `flex-wrap` z `gap-3`.

## Desired End State

Poniżej 640 px lewa krawędź napisu „Kształty” pokrywa się z lewą krawędzią napisu „Postać”. Przed kartką nonogramu odstęp między „Kategorią” a „Poziomem” jest taki sam jak między „Postacią” a „Poziomem”, także gdy ustawienia schodzą na trzy linie. Od 640 px oba układy zostają jak dziś. Sprawdzenie geometrii jest na projekcie Playwright `phone-360`.

### Key Discoveries:

- `has-[>svg]:px-3` w `src/components/ui/button.tsx` daje przyciskowi z chevronem inset 12 px mimo `px-2` na komponencie.
- `SudokuSymbolsChoice` (`src/components/SudokuSymbolsChoice.tsx`) renderuje dwa przyciski bez ikony w `flex items-center gap-1`.
- Gałąź nonogramu przed kartką jest w `src/components/NonogramGenerator.tsx` (kolumna `gap-6`, rząd `gap-2`).
- `tests/e2e/phone-toggle-align.spec.ts` mierzy bounding box tylko na `phone-360` i na szerszych projektach kończy się po otwarciu karty.

## What We're NOT Doing

- Dosuwanie rzędu nonogramu do lewej. Zostaje `justify-center`.
- Belka nonogramu po „Generuj”, przełącznik „Pokaż rozwiązanie” i pięć etykiet przełączników.
- Sekwencje, symetria, dyktando i labirynt.
- Zmiana `Button`, `has-[>svg]:px-3` albo `px-2` na przyciskach z chevronem.
- Warunek CSS „tylko gdy są trzy linie”. Poniżej `sm` odstęp nad „Kategorią” jest `gap-2` także wtedy, gdy „Postać” i „Poziom” mieszczą się w jednej linii.

## Implementation Approach

Jedna faza, dwie klasy i jeden spec. Przyciski symboli dostają `max-sm:px-3`, więc poniżej `sm` napis ma te same 12 px co napis przycisku z chevronem. W nonogramie rząd „Postać” / „Poziom” i „Kategoria” wchodzą do własnej kolumny `gap-6 max-sm:gap-2`. Zewnętrzna kolumna zostaje przy `gap-6`, więc odstęp do notatki i „Generuj” się nie zmienia. Od `sm` wewnętrzna kolumna też ma `gap-6`, czyli dzisiejszy odstęp nad „Kategorią”.

## Critical Implementation Details

Test, który porówna lewe krawędzie ramek przycisków, przejdzie bez poprawki. Porównać trzeba napis: pierwszy `span` w przycisku „Postać” i tekst przycisku „Kształty” (węzeł tekstowy, bez opakowania w `span`). `px-3` ląduje na przyciskach, nie na wrapperze grupy. Padding wrappera przesunąłby ramkę.

`gap-2` nie może wejść na zewnętrzną kolumnę nonogramu. Ścisnąłby odstęp nad „Generuj”. Ścisnąć wolno tylko kolumnę, której dziećmi są rząd „Postać” / „Poziom” i „Kategoria”.

## Phase 1: Wiersze ustawień na telefonie

### Overview

Na telefonie napisy sudoku zaczynają się w tym samym miejscu, a trzy linie nonogramu przed kartką mają jeden odstęp. Od 640 px układ zostaje.

### Changes Required:

#### 1. Inset przycisków symboli

**File**: `src/components/SudokuSymbolsChoice.tsx`

**Intent**: Poniżej `sm` napis „Kształty” i „Cyfry” zaczyna się 12 px od lewej krawędzi przycisku, tak jak napis „Postać”. Od `sm` zostaje dzisiejsze `px-2`.

**Contract**: Każdy z dwóch przycisków zachowuje `text-muted-foreground hover:text-foreground h-auto py-1 text-base font-normal` oraz `px-2` i dostaje `max-sm:px-3`. Wrapper zostaje `flex items-center gap-1`, bez paddingu i bez `basis-full`. `SudokuGenerator.tsx` bez zmian klas. Ten sam komponent jest przed i po „Generuj”.

#### 2. Odstęp nad „Kategorią” przed kartką

**File**: `src/components/NonogramGenerator.tsx`

**Intent**: Gdy „Postać” i „Poziom” zawiną się na dwie linie, odstęp w dół do „Kategorii” jest tym samym `gap-2`. Od `sm` odstęp nad „Kategorią” zostaje `gap-6`. Odstęp do notatki i „Generuj” zostaje `gap-6`.

**Contract**: W gałęzi `sheetShown === false` rząd `flex flex-wrap items-center justify-center gap-2` oraz `categoryControl` wchodzą do wrappera `flex flex-col items-center gap-6 max-sm:gap-2`. `RememberedNote`, `GenerateButton` i notatka błędu zostają dziećmi zewnętrznej kolumny `gap-6`. Gałąź po kartce, `justify-center` rzędu i `gap-2` wewnątrz rzędu bez zmian.

#### 3. Geometria na phone-360

**File**: `tests/e2e/phone-settings-rows.spec.ts`

**Intent**: Spec łapie obie różnice, które widać na 360 px, i nie wymaga geometrii tam, gdzie inset i ciaśniejszy odstęp nie obowiązują albo zawinięcie nie jest gwarantowane.

**Contract**: Wzorzec jak `tests/e2e/phone-toggle-align.spec.ts`: pomiar tylko przy `testInfo.project.name === "phone-360"`. Inne projekty otwierają stronę, potwierdzają kontrolki i kończą bez porównywania pudełek. Plik nie wchodzi do skryptu `test` w `package.json`.

Sudoku, przed „Generuj”: wybrać rozmiar 6×6 (na 4×4 przycisków symboli nie ma). Na `phone-360` przycisk „Kształty” leży w linii poniżej przycisku „Postać” i jest najdalej z lewej wśród przycisków tej linii. Lewa krawędź jego tekstu i lewego `span` przycisku „Postać” różnią się co najwyżej o 1 px.

Nonogram, bez „Generuj”: na `phone-360` przyciski „Postać”, „Poziom” i „Kategoria” zajmują trzy osobne linie. Odstęp pionowy między „Postacią” a „Poziomem” i między „Poziomem” a „Kategorią” różnią się co najwyżej o 1 px. Odstęp liczony z bounding boxów przycisków.

### Success Criteria:

#### Automated Verification:

- Spec `tests/e2e/phone-settings-rows.spec.ts` przechodzi: `npx playwright test tests/e2e/phone-settings-rows.spec.ts`
- Lint przechodzi: `npm run lint`

#### Manual Verification:

- Na telefonie napis „Kształty” zaczyna się tam gdzie „Postać”, a trzy linie nonogramu mają równy odstęp
- Od 640 px padding symboli i odstęp nad „Kategorią” oraz nad „Generuj” zostają jak dziś

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- Brak nowego testu Node. Klasy nie dowodzą insetu: `px-2` przy chevronie i tak daje 12 px. Skrypt `test` w `package.json` bez zmian.

### Integration Tests:

- Jeden spec Playwright. `phone-360` mierzy napis sudoku po wyborze 6×6 i oba odstępy nonogramu przed kartką. Pozostałe projekty Chromium tylko otwierają obie strony.

### Manual Testing Steps:

1. Szerokość telefonu, `/sudoku`, rozmiar 6×6: „Kształty” w linii pod „Postacią”, napisy zaczynają się w tym samym miejscu. Po „Generuj” ten sam inset, gdy grupa jest na własnej linii.
2. Szerokość telefonu, `/nonogram`, przed „Generuj”: trzy linie, odstęp „Postać”–„Poziom” równy „Poziom”–„Kategoria”. Odstęp nad „Generuj” zostaje wyraźnie większy.
3. Od 640 px: przyciski symboli zostają ciaśniejsze niż przyciski z chevronem, a „Kategoria” zostaje pod rzędem z odstępem jak przed zmianą.

## Performance Considerations

Zmiana klas układu. Brak kosztu w czasie generowania karty.

## Migration Notes

Brak danych do przeniesienia. Ustawienia karty w pamięci przeglądarki zostają.

## References

- GitHub issue #173
- Podobny pomiar: `tests/e2e/phone-toggle-align.spec.ts`
- Inset chevronu: `src/components/ui/button.tsx` (`has-[>svg]:px-3`)
- Poprzednia decyzja o 12 px: `context/archive/2026-10-29-phone-toggle-margin/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Wiersze ustawień na telefonie

#### Automated

- [x] 1.1 Spec `tests/e2e/phone-settings-rows.spec.ts` przechodzi: `npx playwright test tests/e2e/phone-settings-rows.spec.ts` — f0c974d
- [x] 1.2 Lint przechodzi: `npm run lint` — f0c974d

#### Manual

- [x] 1.3 Na telefonie napis „Kształty” zaczyna się tam gdzie „Postać”, a trzy linie nonogramu mają równy odstęp — 9b6a21b
- [x] 1.4 Od 640 px padding symboli i odstęp nad „Kategorią” oraz nad „Generuj” zostają jak dziś — 9b6a21b
