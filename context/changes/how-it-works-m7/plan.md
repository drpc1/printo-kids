# „Jak to działa” przy 16 kartach: zwijane wiersze — Implementation Plan

## Overview

Strona „Jak to działa” (S-53, MS-05, US-22, FR-031) ma przy 16 kartach zostać czytelna: zasady profilu, poziomów i postaci stoją na górze, a każdy rodzaj karty jest zwijanym wierszem (`<details>`). Po rozwinięciu wiersz pokazuje opis rodzaju z `CARD_KINDS`, poziomy tej karty z pół-zdaniowymi opisami i link do generatora. Akapit „Poziomy” traci ręczne wyliczanie kart i zostaje przy zasadach ogólnych.

## Current State Analysis

`src/pages/how-it-works.astro` (68 linii) renderuje 16 kart jako `h3` z linkiem i `<p>` z opisem (ok. 4900 znaków łącznie), a pod nimi sześć sekcji zasad. Akapit „Poziomy” (`how-it-works.astro:9`) ręcznie wylicza, które karty mają łatwy/średni/trudny, a które numery, więc z każdą kartą rośnie i może się rozjechać z paskiem. Dane poziomów każdej karty już istnieją w `src/lib/<karta>/levels.ts` jako wiersze `label` / `description` / opcjonalnie `typicalAge` (te same zasilają `LevelChoice` na pasku). Wyjątki: pieniądze (`moneyLevels(currency)`, opisy zależą od waluty), sudoku (`SUDOKU_LEVELS` bez opisu; opis liczy `sudokuLevelDescription`), nonogram (`NONOGRAM_SIZES` w `nonogram/sizes.ts`), labirynt (tablica nazywa się `LEVELS`).

## Desired End State

Wejście na `/how-it-works` pokazuje nagłówek, zasady (poziomy w ujęciu ogólnym, profil, ulubiona postać, postać na karcie, święta i zima, dane) i listę 16 zwiniętych wierszy z tytułami kart w kolejności katalogu. Rozwinięcie wiersza pokazuje opis rodzaju, poziomy tej karty (nazwa, pół zdania, a przy labiryncie, symetrii, sekwencjach i dyktandzie typowy wiek) i link do generatora. Lista poziomów na stronie jest zbudowana z tych samych danych co pasek, więc nie rozjeżdża się z nim.

### Key Discoveries:

- Wszystkie `levels.ts` to czysta dana z lekkimi importami; jedyne niesprawdzone zależności to `shadows/raster.ts` → `picture-format.ts` i `money/sheet.ts` (do sprawdzenia buildem na workerd).
- `LevelRow` (`src/components/LevelRow.tsx`) pokazuje, jak składa się wiersz: nazwa, opis, wiek tylko gdy jest opis.
- Test e2e `tests/e2e/how-it-works.spec.ts:46-84` pilnuje nagłówków `h2`, tekstów zasad, akapitu „Poziomy” (`:55-58`) i struktury `h3` + link + następny `<p>`.
- Opis rodzaju zostaje w `CARD_KINDS` (PRD US-05); PRD US-05 jest już zaktualizowane (commit `fdb30a41`).

## What We're NOT Doing

- Bez zmiany treści opisów w `CARD_KINDS` ani poziomów w `levels.ts`.
- Bez wyboru trybów (zegar, kodowanie), kategorii obiektów ani waluty w wierszu karty, poza tym, co już jest w opisie rodzaju.
- Bez React, JS ani biblioteki do zwijania: czysty `<details>`.
- Bez wyszukiwarki, spisu treści i osobnych stron kart (odrzucone opcje A, C, D).
- Bez zmiany stopki ani linku „Jak to działa” z generatorów.

## Implementation Approach

Nowy moduł `src/lib/card-levels.ts` zbiera wiersze poziomów każdej karty w jednej, jednolitej postaci, a strona tylko je wypisuje. Wyjątki (pieniądze, sudoku, nonogram, labirynt) obsługuje ten moduł, nie strona. Zwijanie robi natywny `<details>`, domyślnie zamknięty. Test jednostkowy pilnuje, że każda karta z `CARD_KINDS` ma wiersze poziomów, więc nowa karta bez wpisu w rejestrze wywali test.

## Faza 1: Dane poziomów kart

### Overview

Jeden moduł zwraca dla identyfikatora karty listę grup wierszy poziomów, gotową do wypisania na stronie.

### Changes Required:

#### 1. Rejestr poziomów

**File**: `src/lib/card-levels.ts` (nowy)

**Intent**: Zebrać poziomy wszystkich 16 kart z istniejących plików `levels.ts` w jednej postaci, żeby strona nie znała kształtu danych poszczególnych kart.

**Contract**: Eksportuje `CardLevelRow { label: string; description?: string; typicalAge?: string }`, `CardLevelGroup { heading?: string; rows: readonly CardLevelRow[] }` i `cardLevelGroups(id: CardKindId): readonly CardLevelGroup[]`. Jedna grupa bez `heading` dla kart z jedną listą poziomów (w tym nonogram i „Skopiuj obrazek”, które biorą `NONOGRAM_SIZES` / `COPY_DRAWING_LEVELS`). Pieniądze: wiersze z `moneyLevels("pln")` (opisy dla złotych; waluta zmienia nominały, co już mówi opis rodzaju). Sudoku: trzy grupy z nagłówkiem rozmiaru (4×4, 6×6, 9×9); 4×4 ma jeden wiersz bez poziomów, 6×6 i 9×9 po trzy z opisem z `sudokuLevelDescription`. Labirynt: import `LEVELS` pod aliasem. `typicalAge` przechodzi tylko tam, gdzie dane go mają (labirynt, symetria, sekwencje, dyktando).

#### 2. Test rejestru

**File**: `src/lib/card-levels.test.ts` (nowy), plus wpis w skrypcie `test` w `package.json`

**Intent**: Wymusić, że każda karta z `CARD_KINDS` ma niepuste wiersze z nazwą, i że wiek jest tylko przy czterech kartach, które go mają.

**Contract**: Test iteruje po `CARD_KINDS`; dla każdej `cardLevelGroups(id)` ma co najmniej jedną grupę z co najmniej jednym wierszem i niepustym `label`; wiersze z `typicalAge` należą wyłącznie do `labirynt`, `symetria`, `sekwencje`, `dyktando`; sudoku ma trzy grupy.

### Success Criteria:

#### Automated Verification:

- Nowy test przechodzi: `npm test`
- Reguły zależności nie narzekają na nowy moduł: `npm run depcruise`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`

#### Manual Verification:

- Wiersze poziomów z rejestru zgadzają się z tym, co pokazuje pasek wybranej karty (np. labirynt, sudoku 6×6, pieniądze w złotych).

---

## Faza 2: Strona ze zwijanymi wierszami

### Overview

Strona pokazuje zasady na górze i 16 zwiniętych wierszy kart z poziomami wewnątrz.

### Changes Required:

#### 1. Układ strony

**File**: `src/pages/how-it-works.astro`

**Intent**: Przenieść sekcje zasad nad listę kart, skrócić akapit „Poziomy” do zasad ogólnych (poziom wybiera się na pasku; karty mają łatwy / średni / trudny albo numery; opis przy każdym poziomie; poziomy nie oceniają dziecka, numery i nazwy nie są porównywalne między kartami; szczegóły poziomów danej karty są w jej wierszu), a „Rodzaje kart” zbudować z `<details>`.

**Contract**: Sekcja „Rodzaje kart” (`h2`) zawiera po jednym `<details>` na kartę w kolejności `cardsInCatalogOrder()`, domyślnie zamkniętym. `<summary>` zawiera `h3` z tytułem karty. Po rozwinięciu: opis z `CARD_KINDS`, lista poziomów z `cardLevelGroups` (grupy z nagłówkiem dla sudoku, wiek jako trzecia linia tam, gdzie jest) i link do generatora. Link jest poza `<summary>`, żeby kliknięcie w niego nie zwijało wiersza. Cel dotykowy `<summary>` ma co najmniej `min-h-11` jak istniejące linki; fokus widoczny jak w pozostałych elementach strony. Kolory z tokenów roli (`foreground`, `muted-foreground`, `border`), klasy przez `cn()` tam, gdzie się je składa.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi na workerd: `npm run build`
- Format zgodny: `npm run format`

#### Manual Verification:

- Na `/how-it-works` widać zasady na górze, a 16 wierszy jest zwiniętych i mieści się na jednym-dwóch ekranach.
- Rozwinięcie karty pokazuje opis, poziomy z opisami i działający link do generatora.
- Wiersz da się rozwinąć klawiaturą (Enter/Spacja) i fokus jest widoczny.
- Na szerokości telefonu (375 px) nic nie wychodzi poza ekran, a tytuły się nie ucinają.

---

## Faza 3: Testy i domknięcie

### Overview

Test e2e odpowiada nowej strukturze, a zmiana jest sprawdzona na uruchomionej stronie.

### Changes Required:

#### 1. Test e2e strony

**File**: `tests/e2e/how-it-works.spec.ts`

**Intent**: Dostosować asercje do `<details>` i dołożyć sprawdzenia nowego zachowania, nie osłabiając pilnowania zasad i kolejności kart.

**Contract**: Test „describes every card kind in catalog order” sprawdza nagłówki `h3` w kolejności katalogu, że wiersze są domyślnie zamknięte, a po kliknięciu `summary` widać opis i link do generatora (`href` na `^\/[a-z-]+$`). Test zasad (`:37-66`) nie pilnuje już ręcznego wyliczenia kart w akapicie „Poziomy” (asercje `:55-58` wymienić na sprawdzenie zasad ogólnych), zachowuje resztę (profil, ulubiona postać, święta, brak słowa „filtr”). Nowa asercja: rozwinięty wiersz „Labirynt” pokazuje wiek („zwykle ok.”), a „Cienie” nie.

### Success Criteria:

#### Automated Verification:

- E2E strony przechodzi: `npx playwright test tests/e2e/how-it-works.spec.ts --project=chromium` (z `E2E_PORT` ustawionym na wolny port)
- Całość lokalnie: `npm run lint && npm run depcruise && npm test && npx astro check && npm run build`

#### Manual Verification:

- Strona wygląda dobrze w jasnym i ciemnym motywie, jeśli aplikacja ma oba.
- „Jak to działa” z katalogu i ze stopki generatora nadal otwiera się i wraca przez „Wszystkie karty”.

**Implementation Note**: Po zakończeniu fazy 3 zaktualizować roadmapę (S-53 `done`) przez `/10x-archive`.

---

## Testing Strategy

### Unit Tests:

- Rejestr: każda karta ma wiersze poziomów; wiek tylko przy czterech kartach; sudoku ma trzy grupy.

### Integration Tests:

- E2E: kolejność kart, domyślnie zamknięte wiersze, rozwinięcie pokazuje opis i link, zasady ogólne na górze.

### Manual Testing Steps:

1. Otworzyć `/how-it-works` na desktopie i na 375 px.
2. Rozwinąć labirynt, sudoku, pieniądze i nonogram (karty z wyjątkami) i porównać z paskiem.
3. Przejść klawiaturą po kilku wierszach.

## Performance Considerations

Brak. Strona jest renderowana po stronie serwera z danych statycznych; dochodzą importy lekkich plików `levels.ts`. Build na workerd w fazie 2 potwierdza, że `shadows/raster.ts` i `money/sheet.ts` ładują się bez problemu.

## References

- Roadmapa: `context/foundation/roadmap.md` (S-53)
- PRD: `context/foundation/prd.md` (US-05, US-22, FR-031)
- Wzorzec wiersza poziomu: `src/components/LevelRow.tsx`
- Dane poziomów: `src/lib/*/levels.ts`, `src/lib/nonogram/sizes.ts`, `src/lib/sudoku/levels.ts:44` (`sudokuLevelDescription`), `src/lib/money/levels.ts:110` (`moneyLevels`)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Dane poziomów kart

#### Automated

- [x] 1.1 Nowy test przechodzi: `npm test`
- [x] 1.2 Reguły zależności nie narzekają na nowy moduł: `npm run depcruise`
- [x] 1.3 Lint przechodzi: `npm run lint`
- [x] 1.4 Typy przechodzą: `npx astro check`

#### Manual

- [x] 1.5 Wiersze poziomów z rejestru zgadzają się z paskiem wybranej karty (labirynt, sudoku 6×6, pieniądze w złotych)

### Phase 2: Strona ze zwijanymi wierszami

#### Automated

- [ ] 2.1 Lint przechodzi: `npm run lint`
- [ ] 2.2 Typy przechodzą: `npx astro check`
- [ ] 2.3 Build przechodzi na workerd: `npm run build`
- [ ] 2.4 Format zgodny: `npm run format`

#### Manual

- [ ] 2.5 Zasady na górze, 16 wierszy zwiniętych i mieści się na jednym-dwóch ekranach
- [ ] 2.6 Rozwinięcie karty pokazuje opis, poziomy z opisami i działający link do generatora
- [ ] 2.7 Wiersz da się rozwinąć klawiaturą, fokus jest widoczny
- [ ] 2.8 Na szerokości telefonu (375 px) nic nie wychodzi poza ekran, tytuły się nie ucinają

### Phase 3: Testy i domknięcie

#### Automated

- [ ] 3.1 E2E strony przechodzi: `npx playwright test tests/e2e/how-it-works.spec.ts --project=chromium`
- [ ] 3.2 Całość lokalnie: `npm run lint && npm run depcruise && npm test && npx astro check && npm run build`

#### Manual

- [ ] 3.3 Strona wygląda dobrze w jasnym i ciemnym motywie, jeśli aplikacja ma oba
- [ ] 3.4 „Jak to działa” z katalogu i ze stopki generatora otwiera się i wraca przez „Wszystkie karty”
