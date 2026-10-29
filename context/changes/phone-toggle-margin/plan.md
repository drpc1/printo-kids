# Wyrównanie przełączników na telefonie Implementation Plan

## Overview

Na szerokości poniżej 640 px lewa krawędź toru przełącznika ma pokrywać się z lewą krawędzią napisu w przycisku ustawień z wiersza nad nim. Dotyczy to „Kolory” w sudoku, sekwencjach i symetrii oraz „Pokaż rozwiązanie” w nonogramie i dyktandzie. Od progu `sm` etykieta zostaje bez tego wcięcia, więc odstęp w jednej linii na szerszym ekranie zostaje `gap-3`. Źródło: GitHub issue #166.

## Current State Analysis

Przyciski ustawień są duchami, które deklarują `px-2`. Te z chevronem renderują napis 12 px w głąb pudełka, bo zostaje `has-[>svg]:px-3`. Pięć etykiet przełącznika to `flex items-center gap-2` bez poziomego paddingu, więc tor zaczyna się na lewej krawędzi wiersza. Wiersz to `flex-wrap` z `gap-3`. Pasek ustawień jest w kontenerze `print:hidden` i pojawia się dopiero, gdy karta jest wygenerowana.

Na telefonie wiersz łamie się i przełącznik zaczyna własną linię bliżej lewej krawędzi niż napis w przyciskach nad nim. `tests/e2e/phone-layout.spec.ts` mierzy bounding box i sprawdza, że kontrolki się nie zakrywają. Nie porównuje lewej krawędzi toru z napisem.

## Desired End State

Po wygenerowaniu karty, przy szerokości poniżej 640 px, lewa krawędź toru (bounding box przełącznika) jest równa lewej krawędzi napisu w najbliższym przycisku ustawień z linii powyżej, z tolerancją 1 px. Od 640 px wzwyż etykieta nie dokłada własnego lewego wcięcia. Przełącznik nadal tylko przełącza kolory albo rozwiązanie.

### Key Discoveries:

- `src/components/LevelChoice.tsx:51`, `src/components/SudokuChoice.tsx:41`, `src/components/SudokuSymbolsChoice.tsx:30` i `src/components/CharacterChoiceControl.tsx:60` — przyciski ustawień deklarują `px-2`. Przyciski z `ChevronDown` zostawiają też `has-[>svg]:px-3` z domyślnego rozmiaru `Button` (`src/components/ui/button.tsx`), i ten selektor wygrywa, więc napis zaczyna się 12 px w głąb pudełka. `SudokuSymbolsChoice` nie ma ikony, więc tam `px-2` naprawdę jest 8 px; domyślne sudoku 4×4 tego przycisku nie pokazuje.
- Etykiety bez wcięcia: `SudokuGenerator.tsx:166` („Kolory”, tylko przy `symbols === "shapes"`), `SequenceGenerator.tsx:120`, `SymmetryGenerator.tsx:137`, `NonogramGenerator.tsx:143`, `DictationGenerator.tsx:138`.
- Wiersz: `flex w-full min-w-0 flex-wrap items-center gap-3` (np. `SudokuGenerator.tsx:201`). `sm:` w tych plikach to próg 640 px.
- Pasek jest pod `{sheetShown ? (` i `print:hidden`. Domyślne sudoku to figury (`DEFAULT_SUDOKU_SETTINGS` w `src/lib/sudoku/levels.ts`).
- Projekt `phone-360` ma viewport 360×780 (`playwright.config.ts`). `tablet-768` ma 768 px, więc `max-sm:` go nie obejmuje. Ten sam plik testów uruchamia się na wszystkich projektach.

## What We're NOT Doing

- Zdejmowanie `px-2` z przycisków ustawień.
- Wcięcie od 640 px wzwyż, w tym na `tablet-768` i na desktopie.
- Wykrywanie złamania wiersza w CSS. Poniżej 640 px etykieta i tak bierze cały wiersz (`max-sm:basis-full`), więc przełącznik nie stoi obok przycisku.
- Nowy komponent etykiety. Pięć istniejących `className` dostaje `max-sm:basis-full` i `max-sm:px-3`.
- Asercja na `pixel-7`, `iphone-13`, `tablet-768` i `chromium`. Klasa działa na każdym viewportcie poniżej 640 px, ale porównanie krawędzi jest umową dla `phone-360`.
- Labirynt. Nie ma tam takiego przełącznika.
- Układ wydruku. Pasek ustawień jest `print:hidden`.
- Zachowanie przełącznika: kolory, rozwiązanie, zapamiętane ustawienia.

## Implementation Approach

Pięć etykiet dostaje `max-sm:basis-full` i `max-sm:px-3`. Poniżej 640 px etykieta jest jedynym elementem swojej linii, a brak ikony sprawia, że `px-3` to inset 12 px, ten sam co napis w przycisku z chevronem. Tor i napis zaczynają się w tym samym miejscu. Od `sm` obie klasy milczą: etykieta nie bierze całego wiersza, a odstęp zostaje `gap-3`.

Test jest osobnym specem, nie dopiskiem do `phone-layout.spec.ts`, żeby kontrakt „nie nachodzą na siebie” został osobno. Spec pomija asercję poza projektem `phone-360`, bo na szerszych projektach wcięcia nie ma i przełącznik często jest w tej samej linii.

## Critical Implementation Details

- Klasy to `max-sm:basis-full` i `max-sm:px-3`. `basis-full` bez `max-sm:` rozciągałby etykietę także od 640 px. `px-2` na etykiecie dałoby 8 px, a napis przycisku z chevronem stoi na 12 px. Samo `px-3` poszerzyłoby odstęp przed przełącznikiem także od 640 px.
- Punkt odniesienia to napis, nie pudełko przycisku. Przycisk z chevronem ma efektywny inset 12 px, więc jego lewa krawędź jest o 12 px wcześniej niż napis. Mierzyć lewą krawędź pierwszego `span` w przycisku (np. „Postać:”, „Poziom:”) i lewą krawędź `[role=switch]`.
- Przycisk odniesienia to najbliższy przycisk ustawień z linii powyżej przełącznika: jego dół jest nad górą przełącznika, a spośród przycisków na tej linii bierze się ten z najmniejszą współrzędną `x`. Sąsiad z tej samej linii nie jest odniesieniem.
- Pasek istnieje dopiero po wygenerowaniu karty. Sudoku mierzyć przy figurach. Przy cyfrach przełącznika „Kolory” nie ma.
- Równość krawędzi: różnica co najwyżej 1 px.
- `max-sm:basis-full` stawia etykietę na własnej linii poniżej 640 px. Jeśli na `phone-360` przełącznik nadal jest w tej samej linii co przycisk ustawień, nie porównywać sąsiada z boku. Zatrzymać się i zgłosić, że etykieta nie wzięła całego wiersza.

## Phase 1: Wcięcie poniżej sm

### Overview

Pięć etykiet dostaje `max-sm:basis-full` i `max-sm:px-3`. Na telefonie etykieta zajmuje własną linię, a tor przesuwa się o ten sam inset co napis przycisku z chevronem. Od 640 px obie klasy milczą.

### Changes Required:

#### 1. Etykiety przełączników

**File**: `src/components/SudokuGenerator.tsx`, `src/components/SequenceGenerator.tsx`, `src/components/SymmetryGenerator.tsx`, `src/components/NonogramGenerator.tsx`, `src/components/DictationGenerator.tsx`

**Intent**: Na szerokości poniżej 640 px lewa krawędź toru ma się pokrywać z lewą krawędzią napisu w wierszu ustawień nad przełącznikiem. Od `sm` odstęp w jednej linii zostaje `gap-3`.

**Contract**: Każda z pięciu etykiet zachowuje `text-muted-foreground flex items-center gap-2 text-base` i dostaje dodatkowo `max-sm:basis-full max-sm:px-3`. Bez bezwarunkowego `basis-full`, `px-3` i `px-2`. Tekst, `Switch`, `checked` i `onCheckedChange` zostają. Sudoku nadal renderuje etykietę tylko przy `symbols === "shapes"`.

### Success Criteria:

#### Automated Verification:

- `npm run lint` przechodzi

#### Manual Verification:

- Po wygenerowaniu karty przy szerokości 360 px lewa krawędź toru pokrywa się z lewą krawędzią napisu przycisku ustawień z linii powyżej na `/sudoku` (figury), `/sequences`, `/symmetry`, `/nonogram` i `/dictation`
- Przy szerokości 768 px i na desktopie przełącznik nie ma dodatkowego lewego wcięcia ponad `gap-3` wiersza

**Implementation Note**: Po zielonym `npm run lint` zatrzymać się na ręczne potwierdzenie obu sprawdzeń, zanim zacznie się faza 2.

---

## Phase 2: Asercja na phone-360

### Overview

Playwright na projekcie `phone-360` utrwala równość lewej krawędzi toru i napisu z linii powyżej dla pięciu kart. Poza tym projektem spec nie wykonuje tej asercji.

### Changes Required:

#### 1. Spec wyrównania

**File**: `tests/e2e/phone-toggle-align.spec.ts`

**Intent**: Regresja tych kilku pikseli ma wywracać test na `phone-360`, bez czerwonego wyniku na projektach, które nie dostają wcięcia.

**Contract**: Nowy spec, wzorowany na `viewportBox` z `tests/e2e/phone-layout.spec.ts`. Dla `/sudoku`, `/sequences`, `/symmetry`, `/nonogram` i `/dictation`: klik „Generuj”, poczekać na obraz karty (nazwy już używane w e2e: „Sudoku”, „Sekwencje”, „Symetria”, „Nonogram”, „Dyktando graficzne”). Przełącznik: `switch` o nazwie „Kolory” albo „Pokaż rozwiązanie”. Na projekcie `phone-360` lewa krawędź przełącznika i lewa krawędź pierwszego `span` w przycisku odniesienia różnią się co najwyżej o 1 px. Przycisk odniesienia jest na linii powyżej, jak w Critical Implementation Details. Poza `phone-360` ta asercja jest pominięta, a spec kończy się sukcesem. Istniejące testy w `phone-layout.spec.ts` zostają bez nowych asercji wyrównania.

### Success Criteria:

#### Automated Verification:

- `npx playwright test tests/e2e/phone-toggle-align.spec.ts --project=phone-360` przechodzi
- `npx playwright test tests/e2e/phone-toggle-align.spec.ts --project=chromium --project=tablet-768` przechodzi, bo asercja wyrównania jest pominięta poza `phone-360`

#### Manual Verification:

- Przełączenie „Kolory” albo „Pokaż rozwiązanie” nadal zmienia kartę, a lewa krawędź toru zostaje na miejscu

**Implementation Note**: Po zielonych obu komendach Playwright zatrzymać się na ręczne potwierdzenie przełącznika.

---

## Testing Strategy

### Unit Tests:

- Brak. Wcięcie jest klasą na etykiecie, a `npm test` nie renderuje tego paska.

### Integration Tests:

- Nowy spec `tests/e2e/phone-toggle-align.spec.ts` na `phone-360` dla pięciu tras.
- Ten sam spec na `chromium` i `tablet-768` tylko po to, żeby pominięcie asercji nie wywracało zestawu.

### Manual Testing Steps:

1. Przy 360 px wygenerować kartę na każdej z pięciu tras i porównać lewą krawędź toru z napisem przycisku z linii powyżej.
2. Przy 768 px i na szerokim oknie sprawdzić, że przełącznik nie jest dodatkowo odsunięty od sąsiada.
3. Przełączyć „Kolory” i „Pokaż rozwiązanie” i sprawdzić, że karta się zmienia, a tor nie skacze w bok.

## Performance Considerations

Jedna klasa responsywna na pięciu etykietach. Bez nowego stanu, bez pomiaru layoutu w aplikacji.

## Migration Notes

Brak. Ustawienia karty i wydruk zostają.

## References

- GitHub issue #166
- Etykiety: `src/components/SudokuGenerator.tsx:166`, `src/components/SequenceGenerator.tsx:120`, `src/components/SymmetryGenerator.tsx:137`, `src/components/NonogramGenerator.tsx:143`, `src/components/DictationGenerator.tsx:138`
- Przyciski z `px-2`: `src/components/CharacterChoiceControl.tsx:60`, `src/components/LevelChoice.tsx:51`, `src/components/SudokuChoice.tsx:41`
- Pomiar pudełka: `tests/e2e/phone-layout.spec.ts:21`
- Viewport: `playwright.config.ts` projekt `phone-360`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Wcięcie poniżej sm

#### Automated

- [x] 1.1 `npm run lint` przechodzi

#### Manual

- [x] 1.2 Po wygenerowaniu karty przy szerokości 360 px lewa krawędź toru pokrywa się z lewą krawędzią napisu przycisku ustawień z linii powyżej na `/sudoku` (figury), `/sequences`, `/symmetry`, `/nonogram` i `/dictation`
- [x] 1.3 Przy szerokości 768 px i na desktopie przełącznik nie ma dodatkowego lewego wcięcia ponad `gap-3` wiersza

### Phase 2: Asercja na phone-360

#### Automated

- [ ] 2.1 `npx playwright test tests/e2e/phone-toggle-align.spec.ts --project=phone-360` przechodzi
- [ ] 2.2 `npx playwright test tests/e2e/phone-toggle-align.spec.ts --project=chromium --project=tablet-768` przechodzi, bo asercja wyrównania jest pominięta poza `phone-360`

#### Manual

- [ ] 2.3 Przełączenie „Kolory” albo „Pokaż rozwiązanie” nadal zmienia kartę, a lewa krawędź toru zostaje na miejscu
