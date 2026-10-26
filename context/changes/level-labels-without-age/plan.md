# Poziomy bez wieku — plan implementacji

## Overview

S-27 z kamienia M-4. Rodzic wybiera Poziom 1–6 w labiryncie, Poziom 1–4 w symetrii i sekwencjach oraz łatwy / średni / trudny w dyktandzie, jak już w sudoku i nonogramie. Każdy wiersz listy poziomów ma trzy linie: nazwę, pół zdania o tym, co widać na kartce, i — przy kartach, które miały dawną nazwę wiekową — typowy wiek („zwykle ok. 5 lat”). Pasek pokazuje krótką etykietę („Poziom: 3”). Zapisane identyfikatory poziomów zostają, więc profile i ostatnie parametry wczytują się bez zmian.

## Current State Analysis

- Etykiety wiekowe są danymi w czterech plikach poziomów: `src/lib/maze/levels.ts` (`label: "3 lata"` … `"nastolatek"`), `src/lib/symmetry/levels.ts`, `src/lib/sequence/levels.ts` (`"4 lata"` … `"7 lat"`), `src/lib/dictation/levels.ts` (`"5 lat"`, `"6 lat"`, `"7 lat"`). Sudoku (`src/lib/sudoku/levels.ts` `SUDOKU_LEVELS`) i nonogram (`src/lib/nonogram/sizes.ts` `NONOGRAM_SIZES`) mają już łatwy / średni / trudny.
- Listy rysują trzy komponenty, każdy z własnym `Button` w wierszu (`DIALOG_ROW_CLASS`, jedna linia tekstu):
  - `src/components/LevelChoice.tsx` — symetria, sekwencje, dyktando; ten sam komponent rysuje też „Kategoria” (`CategoryChoice.tsx`).
  - `src/components/SudokuChoice.tsx` — sudoku („Rozmiar” i „Poziom”) i nonogram („Poziom”).
  - `LevelChoiceRows` w `src/components/ProfileCorner.tsx:685` — pasek labiryntu (`WorksheetGenerator.tsx:258` `LevelChoiceControl`) i okno profilu (`ProfileCorner.tsx:477`, `ProfileLevelControl` w `:668`).
- Przycisk paska pokazuje `level.label` po „Poziom:” (`LevelChoice.tsx:40-44`, `SudokuChoice.tsx:39-43`, `WorksheetGenerator.tsx:275-279`, `ProfileCorner.tsx:669-678`).
- Miniatury katalogu nie pokazują etykiety poziomu (`src/lib/cards.ts` nie czyta `label`).
- Testy przypinają etykiety: `src/lib/maze/generate.test.ts:14-75`, `src/lib/symmetry/levels.test.ts:19-22`, `src/lib/sequence/levels.test.ts:18-21`; e2e klikają po nazwie: `tests/e2e/catalog.spec.ts:120-167`, `level-bar.spec.ts:61-115`, `phone-layout.spec.ts:154,292`, `profile-level.spec.ts:25-43`, `sudoku-levels.spec.ts` (łatwy / średni / trudny, bez zmian nazw).
- Podgląd na stronie (2026-10-26, okno labiryntu, 375×812): wiersz w trzech liniach mieści sześć poziomów bez przewijania; `Button` ma `whitespace-nowrap`, więc wiersz potrzebuje kolumny i zawijania.

## Desired End State

- Pasek: „Poziom: 3” (labirynt, symetria, sekwencje), „Poziom: średni” (dyktando, nonogram, sudoku). Aria-label paska: „Poziom: 3”.
- Okno listy: każdy wiersz to nazwa („Poziom 3” / „łatwy”), pod nią opis, pod nim — tylko w labiryncie, symetrii, sekwencjach i dyktandzie — wiek, jaśniejszym tekstem. Teksty dosłownie z tabeli „Brzmienie” niżej.
- Okno profilu (wybór poziomu labiryntu przy tworzeniu i edycji) pokazuje te same nazwy i wiersze.
- Zapisane `lat3`…`nastolatek`, `lat4`…`lat7`, `lat5`…`lat7`, `latwy`…`trudny` działają bez migracji.
- PRD mówi to samo co kod: OQ12 zamknięte na „tak, przy kartach z dawną nazwą”.

### Brzmienie (zatwierdzone 2026-10-26)

| Karta     | id           | Lista    | Pasek  | Opis                                                  | Wiek              |
| --------- | ------------ | -------- | ------ | ----------------------------------------------------- | ----------------- |
| Labirynt  | `lat3`       | Poziom 1 | 1      | szerokie alejki, krótka droga                         | zwykle ok. 3 lata |
| Labirynt  | `lat4`       | Poziom 2 | 2      | szerokie alejki, długa kręta droga                    | zwykle ok. 4 lata |
| Labirynt  | `lat5`       | Poziom 3 | 3      | węższe alejki, krótka droga                           | zwykle ok. 5 lat  |
| Labirynt  | `lat6`       | Poziom 4 | 4      | węższe alejki, długa kręta droga                      | zwykle ok. 6 lat  |
| Labirynt  | `lat7`       | Poziom 5 | 5      | wąskie alejki, bardzo długa droga                     | zwykle 7–8 lat    |
| Labirynt  | `nastolatek` | Poziom 6 | 6      | najwęższe alejki, start i meta w rogach               | zwykle nastolatki |
| Symetria  | `lat4`       | Poziom 1 | 1      | duża kratka, podpowiedź przy osi                      | zwykle ok. 4 lata |
| Symetria  | `lat5`       | Poziom 2 | 2      | średnia kratka, bez podpowiedzi                       | zwykle ok. 5 lat  |
| Symetria  | `lat6`       | Poziom 3 | 3      | mniejsza kratka, bez podpowiedzi                      | zwykle ok. 6 lat  |
| Symetria  | `lat7`       | Poziom 4 | 4      | mała kratka, bogatsze obiekty                         | zwykle ok. 7 lat  |
| Sekwencje | `lat4`       | Poziom 1 | 1      | dwa kształty na zmianę, 1 puste pole                  | zwykle ok. 4 lata |
| Sekwencje | `lat5`       | Poziom 2 | 2      | wzory z kształtów, 1–2 puste pola                     | zwykle ok. 5 lat  |
| Sekwencje | `lat6`       | Poziom 3 | 3      | liczby i wzory, 2 puste pola                          | zwykle ok. 6 lat  |
| Sekwencje | `lat7`       | Poziom 4 | 4      | kształt z liczbą, liczby w dół, grupy; 2–3 puste pola | zwykle ok. 7 lat  |
| Dyktando  | `lat5`       | łatwy    | łatwy  | duża kratka, prosty obiekt                            | zwykle ok. 5 lat  |
| Dyktando  | `lat6`       | średni   | średni | mniejsza kratka, więcej poleceń                       | zwykle ok. 6 lat  |
| Dyktando  | `lat7`       | trudny   | trudny | mała kratka, bogaty obiekt, najwięcej poleceń         | zwykle ok. 7 lat  |
| Nonogram  | `latwy`      | łatwy    | łatwy  | znaczki przy wierszach, duża kratka                   | —                 |
| Nonogram  | `sredni`     | średni   | średni | liczby przy wierszach i kolumnach                     | —                 |
| Nonogram  | `trudny`     | trudny   | trudny | liczby, gęsta kratka, bogatszy obrazek                | —                 |
| Sudoku    | `latwy`      | łatwy    | łatwy  | 6×6: 12 pustych pól z 36 · 9×9: 35 pustych pól z 81   | —                 |
| Sudoku    | `sredni`     | średni   | średni | 6×6: 18 pustych pól z 36 · 9×9: 45 pustych pól z 81   | —                 |
| Sudoku    | `trudny`     | trudny   | trudny | 6×6: 22 puste pola z 36 · 9×9: 52 puste pola z 81     | —                 |

Sudoku pokazuje jeden opis: dla wybranego rozmiaru („12 pustych pól z 36”). 4×4 nie ma wyboru poziomu. Wiersze „Rozmiar” i „Kategoria” zostają jednolinijkowe.

### Key Discoveries:

- `LevelChoice` i `SudokuChoice` przyjmują `{ id, label }[]`; „Kategoria” też idzie przez `LevelChoice` (`CategoryChoice.tsx:24`), więc opis i wiek muszą być opcjonalne.
- `LevelChoiceRows` jest eksportowany i używany w dwóch miejscach (pasek labiryntu, okno profilu) — jedna zmiana obejmuje oba.
- `DIALOG_ROW_CLASS` (`ProfileCorner.tsx:36`) ustawia `justify-start`, ale wiersz jest jedną linią `whitespace-nowrap` z shadcn `Button`.
- Dyktando i nonogram mają pole `templateLevel: SymmetryLevelId` — to identyfikatory, nie etykiety; nie ruszać.

## What We're NOT Doing

- Bez zmiany identyfikatorów poziomów, kluczy zapisu, `last-used.ts`, `child-profiles.ts` i domyślnych poziomów.
- Bez pamięci ustawień w profilu (S-28), podsumowania w oknie profilu i plakietek w katalogu (S-29), postaci przy poleceniu (S-30). Wybór poziomu labiryntu w oknie profilu zostaje (usuwa go S-29); dostaje tylko nowe nazwy i wiersze.
- Bez logiki pasków poza tekstem przycisku i wierszami listy.
- Bez wieku przy sudoku i nonogramie (nigdy nie miały dawnej nazwy wiekowej).
- Bez opisów przy „Rozmiar” (sudoku) i „Kategoria”.
- Bez zmiany komentarzy i nazw testów, które opisują poziomy przez `lat5` itp. jako identyfikatory.
- Bez strony „Jak to działa” (S-32) i komunikatu „Zapamiętane dla” (S-28).

## Implementation Approach

Faza 1 przenosi całe brzmienie do danych: każdy poziom dostaje nazwę na listę, krótką etykietę na pasek, opis i opcjonalny wiek; sudoku dostaje funkcję opisu z liczby pustych pól. Testy jednostkowe przypinają brzmienie. W tej samej fazie PRD zamyka OQ12. Po fazie 1 przycisk paska przez chwilę pokazuje „Poziom: Poziom 3”, a e2e lokalnie są czerwone (zaakceptowane; CI nie uruchamia Playwrighta). Obie fazy idą w jednym PR — fazy 1 nie scalamy osobno. Faza 2 dodaje jeden wspólny wiersz listy w trzech liniach i podpina go w trzech komponentach, pasek czyta krótką etykietę, a e2e przechodzą na nowe nazwy.

## Critical Implementation Details

- **Nazwy dostępne w e2e:** z opisem i wiekiem w przycisku wiersza jego nazwa dostępna to „Poziom 3 węższe alejki, krótka droga zwykle ok. 5 lat”. Lokatory wierszy muszą brać nazwę od początku (np. regex `^Poziom 3\b` albo `^łatwy\b`), a nie ciąg bez `exact` — inaczej „5 lat” z wieku trafi w zły wiersz. Przycisk paska zostaje rozpoznawalny po `^Poziom:`.

## Phase 1: Brzmienie w danych i PRD

### Overview

Wszystkie teksty z tabeli „Brzmienie” są w plikach poziomów, przypięte testami; PRD opisuje wiek przy opisie.

### Changes Required:

#### 1. Kształt poziomu z nazwą, etykietą paska, opisem i wiekiem

**File**: `src/lib/maze/levels.ts`, `src/lib/symmetry/levels.ts`, `src/lib/sequence/levels.ts`, `src/lib/dictation/levels.ts`

**Intent**: Zamienić etykiety wiekowe na nazwy bez wieku i dopisać opis oraz typowy wiek, dosłownie z tabeli „Brzmienie”.

**Contract**: Interfejsy `Level`, `SymmetryLevel`, `SequenceLevel`, `DictationLevel` mają `label` (nazwa na liście: „Poziom 3” / „łatwy”), `barLabel` (tekst po „Poziom:” na pasku: „3” / „łatwy”), `description: string`, `typicalAge: string` (te cztery karty mają wiek zawsze). Identyfikatory i pozostałe pola bez zmian.

#### 2. Nonogram i sudoku: opisy

**File**: `src/lib/nonogram/sizes.ts`, `src/lib/sudoku/levels.ts`

**Intent**: Nonogram dostaje `barLabel` i `description` przy każdym poziomie. Sudoku dostaje `barLabel` przy `SUDOKU_LEVELS` i funkcję opisu poziomu dla rozmiaru, liczoną z `sudokuBlankCount`, z polską odmianą „pustych pól” / „puste pola”.

**Contract**: `NonogramSize` ma `barLabel`, `description` (bez wieku). `sudokuLevelDescription(size: 6 | 9, level: SudokuLevelId): string` zwraca `"<n> <puste pola|pustych pól> z <size²>"`; forma „puste pola”, gdy `n % 10` ∈ {2,3,4} i `n % 100` ∉ {12,13,14}, w pozostałych przypadkach „pustych pól”.

#### 3. Testy jednostkowe brzmienia

**File**: `src/lib/maze/generate.test.ts`, `src/lib/symmetry/levels.test.ts`, `src/lib/sequence/levels.test.ts`, `src/lib/sudoku/levels.test.ts`, nowy `src/lib/dictation/levels.test.ts` i `src/lib/nonogram/sizes.test.ts` (dopisane do skryptu `test` w `package.json`)

**Intent**: Przypiąć tabelę „Brzmienie” (label, barLabel, opis, wiek) dla każdej karty i sześć opisów sudoku; sprawdzić, że żadna nazwa ani etykieta paska nie zawiera „lat” ani „nastolat”, a identyfikatory są te same co przed zmianą.

**Contract**: Istniejące asercje etykiet zamienione na nowe brzmienie; nowe pliki w `npm test`.

#### 4. PRD

**File**: `context/foundation/prd.md`

**Intent**: Zapisać decyzję z 2026-10-26: przy kartach z dawną nazwą wiekową (labirynt, symetria, sekwencje, dyktando) wiersz listy ma pod opisem typowy wiek z kolumny „Dawna nazwa”; sudoku i nonogram bez wieku.

**Contract**: Dokładnie te miejsca, nic poza nimi:

- `prd.md:403` (US-22, kryterium o wierszu listy) — wiersz ma nazwę, opis i, przy czterech kartach, typowy wiek; przykład pokazuje trzy linie, nie „nazwa · opis”.
- `prd.md:412` (FR-001) — dopisany typowy wiek przy kartach z dawną nazwą.
- `prd.md:527` (zdanie pod tabelą labiryntu) — kolumna „Dawna nazwa” nie jest nazwą poziomu, ale jest źródłem dopisku o typowym wieku.
- `prd.md:665` (Business Logic „Poziomy”) — opis trzech linii; przykład w tym samym kształcie co w US-22.
- `prd.md:752` (Open Questions 12) — przekreślone i zamknięte 2026-10-26: tak, pod opisem, tylko labirynt, symetria, sekwencje, dyktando.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- W tablicach poziomów sześciu kart żadna `label` ani `barLabel` nie zawiera „lat” ani „nastolat”: sprawdza test z punktu 3

#### Manual Verification:

- PRD: OQ12, US-22, FR-001 i „Poziomy” mówią to samo co tabela „Brzmienie”

**Implementation Note**: Po fazie 1 i zielonych sprawdzeniach automatycznych zatrzymaj się na potwierdzenie przeglądu PRD przed fazą 2.

---

## Phase 2: Wiersz w trzech liniach i pasek

### Overview

Trzy listy poziomów rysują ten sam wiersz (nazwa, opis, wiek), pasek pokazuje krótką etykietę, e2e znają nowe nazwy.

### Changes Required:

#### 1. Wspólny wiersz listy

**File**: nowy `src/components/LevelRow.tsx` (albo eksport obok `DIALOG_ROW_CLASS` w `ProfileCorner.tsx`)

**Intent**: Jedna zawartość wiersza listy: nazwa w pierwszej linii, opis w drugiej (`text-muted-foreground`, mniejszy), wiek w trzeciej (tym samym tonem, gdy jest). Wiersz zawija tekst i układa linie w kolumnie od lewej; bez nowych kolorów (tylko tokeny ról), klasy przez `cn()`.

**Contract**: Komponent przyjmuje `label`, opcjonalne `description` i `typicalAge`; bez opisu renderuje samą nazwę jak dziś (używa go też „Kategoria” i „Rozmiar”). Zawijanie i kolumna (`whitespace-normal`, `flex-col`, `items-start`) dochodzą przez `cn()` tylko do przycisków wierszy z opisem; `DIALOG_ROW_CLASS` zostaje bez zmian, bo używa go też lista postaci z obrazkami.

#### 2. Podpięcie w trzech listach i na pasku

**File**: `src/components/LevelChoice.tsx`, `src/components/SudokuChoice.tsx`, `src/components/ProfileCorner.tsx` (`LevelChoiceRows`, `ProfileLevelControl`), `src/components/WorksheetGenerator.tsx` (`LevelChoiceControl`), `src/components/SudokuGenerator.tsx`, `src/components/NonogramGenerator.tsx`, `src/components/SymmetryGenerator.tsx`, `src/components/SequenceGenerator.tsx`, `src/components/DictationGenerator.tsx`

**Intent**: Wiersze list używają wspólnego wiersza; przycisk paska i jego aria-label pokazują `barLabel` (fallback: `label`, dla „Kategoria” i „Rozmiar”). Sudoku przekazuje opis poziomu dla bieżącego rozmiaru.

**Contract**: Typ opcji w `LevelChoice` i `SudokuChoice` rozszerzony o opcjonalne `barLabel`, `description`, `typicalAge`. Wywołania z generatorów przekazują dane poziomów bez zmiany logiki wyboru, zapisu i generowania.

#### 3. Testy e2e

**File**: `tests/e2e/catalog.spec.ts`, `tests/e2e/level-bar.spec.ts`, `tests/e2e/phone-layout.spec.ts`, `tests/e2e/profile-level.spec.ts`, `tests/e2e/sudoku-levels.spec.ts`

**Intent**: Przejść na nowe nazwy paska („Poziom: 3”) i wierszy (lokator od początku nazwy). Dopisać sprawdzenie, że wiersz listy labiryntu pokazuje opis i wiek, a wiersz sudoku 6×6 „12 pustych pól z 36”. W `phone-layout.spec.ts` dopisać, że okno listy labiryntu na telefonie mieści sześć wierszy bez przewijania.

**Contract**: Te same przypadki co dziś, nowe nazwy; trzy nowe asercje opisane wyżej. Pomocnik `choose()` w `sudoku-levels.spec.ts:8-12` wybiera wiersz regexem od początku nazwy (`^<opcja>\b`), a nie `exact`, dla obu pasków. Przypadek „longest names” w `level-bar.spec.ts:59-63` przechodzi na `nastolatek` → „Poziom: 6” z Samochodzikiem, z komentarzem, że szerokość paska wyznacza teraz nazwa postaci.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- E2E przechodzą: `npx playwright test`

#### Manual Verification:

- Na komputerze i na telefonie (375×812) listy poziomów sześciu kart wyglądają jak zatwierdzony wariant C: nazwa, opis, wiek; sudoku i nonogram bez wieku
- Okno profilu (tworzenie i edycja) pokazuje „Poziom: 3” i te same wiersze
- Profil i ostatnie parametry zapisane przed zmianą (np. poziom `nastolatek`) otwierają się na „Poziom: 6”
- Druk karty bez zmian (opis i wiek nie trafiają na kartkę)

**Implementation Note**: Po fazie 2 i zielonych sprawdzeniach automatycznych zatrzymaj się na ręczne potwierdzenie wyglądu.

---

## Testing Strategy

### Unit Tests:

- Brzmienie każdego poziomu sześciu kart (label, barLabel, description, typicalAge) zgodne z tabelą.
- `sudokuLevelDescription` dla sześciu kombinacji, w tym obie formy odmiany (12 → „pustych pól”, 22 i 52 → „puste pola”).
- Identyfikatory poziomów i domyślne poziomy bez zmian.

### Integration Tests:

- E2E: wybór poziomu po nowej nazwie na labiryncie, symetrii, sekwencjach, sudoku; okno profilu; układ paska na telefonie; lista labiryntu mieści się na telefonie.

### Manual Testing Steps:

1. Otwórz `/labirynt`, kliknij „Poziom: 3”, sprawdź sześć wierszy w trzech liniach, wybierz Poziom 6 — pasek „Poziom: 6”, start w rogu.
2. Powtórz na `/symetria`, `/sekwencje`, `/dyktando`, `/nonogram`, `/sudoku` (6×6 i 9×9).
3. Zmień widok na telefon (375×812) i powtórz 1.
4. Z profilem utworzonym przed zmianą otwórz `/labirynt` — pasek pokazuje numer zapisanego poziomu.

## Migration Notes

Brak migracji: zapisane dane trzymają identyfikatory, a te się nie zmieniają.

## References

- Roadmapa: `context/foundation/roadmap.md` — S-27
- PRD: `context/foundation/prd.md` — FR-001, FR-016, FR-020, FR-027, US-07, US-11, US-18, US-22, Business Logic „Poziomy”, Open Questions 12
- Listy: `src/components/LevelChoice.tsx`, `src/components/SudokuChoice.tsx`, `src/components/ProfileCorner.tsx:685`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Brzmienie w danych i PRD

#### Automated

- [x] 1.1 Testy jednostkowe przechodzą: `npm test` — 55c6f5c
- [x] 1.2 Lint przechodzi: `npm run lint` — 55c6f5c
- [x] 1.3 Typy przechodzą: `npx astro check` — 55c6f5c
- [x] 1.4 W tablicach poziomów sześciu kart żadna `label` ani `barLabel` nie zawiera „lat” ani „nastolat”: sprawdza test z punktu 3 — 55c6f5c

#### Manual

- [x] 1.5 PRD: OQ12, US-22, FR-001 i „Poziomy” mówią to samo co tabela „Brzmienie” — 55c6f5c

### Phase 2: Wiersz w trzech liniach i pasek

#### Automated

- [x] 2.1 Testy jednostkowe przechodzą: `npm test` — 59c5203
- [x] 2.2 Lint przechodzi: `npm run lint` — 59c5203
- [x] 2.3 Typy przechodzą: `npx astro check` — 59c5203
- [x] 2.4 Build przechodzi: `npm run build` — 59c5203
- [x] 2.5 E2E przechodzą: `npx playwright test` — 59c5203

#### Manual

- [x] 2.6 Na komputerze i na telefonie (375×812) listy poziomów sześciu kart wyglądają jak zatwierdzony wariant C: nazwa, opis, wiek; sudoku i nonogram bez wieku — 59c5203
- [x] 2.7 Okno profilu (tworzenie i edycja) pokazuje „Poziom: 3” i te same wiersze — 59c5203
- [x] 2.8 Profil i ostatnie parametry zapisane przed zmianą (np. poziom `nastolatek`) otwierają się na „Poziom: 6” — 59c5203
- [x] 2.9 Druk karty bez zmian (opis i wiek nie trafiają na kartkę) — 59c5203
