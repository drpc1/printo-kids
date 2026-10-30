# Wspólny szkielet strony karty (GH 192) Implementation Plan

## Overview

Sześć wysp generatorów (`WorksheetGenerator`, `SymmetryGenerator`, `SequenceGenerator`, `SudokuGenerator`, `NonogramGenerator`, `DictationGenerator`) powtarza tę samą powłokę strony. Wyciągamy ją do jednego hooka i jednego komponentu, żeby siódma karta była tylko kontrolkami, regułami i arkuszem SVG. Przy okazji ujednolicamy wiersz kontrolek ustawień tak, żeby wyglądał dobrze na telefonie i komputerze niezależnie od liczby kontrolek.

## Current State Analysis

Szczegóły i kotwice: `context/changes/gh192-pages-sceleton/research.md`. Skrót:

- Powtarza się w sześciu wyspach: efekt `has-sheet` / `justify-*` na `#worksheet-home`, komunikat „nie udało się ułożyć”, `ProfileCorner` z tymi samymi handlerami, dwa układy przycisków (z kartą i bez), `RememberedNote`, blokada `waitingForChild`, `window.print()` (np. `SymmetryGenerator.tsx:49-57, 153-208`).
- Pięć kart powtarza łańcuch `useChildProfileVisit` → `useBarCharacter` → `useFavoriteCharacter` oraz stan `barLevel` i `applyProfileBar` (`SymmetryGenerator.tsx:36-40, 98-101`).
- Labirynt trzyma postać i poziom we własnym stanie (`WorksheetGenerator.tsx:39-40, 89-128`) i pamięta poziom przez `useMazeLevelMemory` (`useCardSettings.ts:135-158`).
- Wiersz kontrolek przed pierwszą kartą różni się między kartami (`gap-2`/`gap-3`, `max-sm:justify-start`, dwupoziomowy układ Nonogramu). Układ Nonogramu to celowa poprawka GH #173 pilnowana przez `tests/e2e/phone-settings-rows.spec.ts`.
- `src/lib/sheet/print-contract.test.ts` czyta źródła generatorów i wymaga w każdym dokładnych list klas `print:hidden` (linie 78-82, 115-118, 141-144, 173-176, 205-209, 240-244) oraz `<CharacterChoiceControl` i `useBarCharacter(` w pięciu kartach (297-307).
- `src/lib/sheet/character.test.ts:73-86` też czyta `WorksheetGenerator.tsx` (wywołanie `characterSheetSrc(` i `generateMaze(level, Math.random)`); te fragmenty zostają w wyspie labiryntu, więc test nie wymaga zmian, ale trzeba go uruchomić po fazie 3.
- `GeneratorShell.astro` (Astro) trzyma `@page`, nagłówek i reguły CSS `.has-sheet`; zostaje Astro.

## Desired End State

- Nowa karta składa się z: kontrolek ustawień, reguł generowania (`generateFor`, `handleProfileSwitch`), arkusza SVG i trzech wywołań (hook strony, `useCardSettings`, komponent strony). Nie kopiuje paska, profilu ani druku.
- Wszystkie sześć stron (z labiryntem) używa jednego komponentu strony i jednego wiersza kontrolek ustawień. Wiersz spełnia dwie reguły z #173 niezależnie od liczby kontrolek: tekst pierwszej kontrolki w kolejnej linii zaczyna się tam, gdzie „Postać”, a odstęp między zawiniętymi liniami jest ten sam wszędzie, także nad „Kategorią”.
- Weryfikacja: `npm run lint`, `npm test`, `npx astro check`, `npm run build` i e2e na czterech projektach Chromium są zielone; stan końcowy sprawdzony ręcznie na telefonie i komputerze.

### Key Discoveries:

- `useChildProfileVisit` przyjmuje `onApply` przy wywołaniu, a pozostałe hooki zależą od jego wyniku; wspólny hook musi je składać w tej kolejności (`useChildProfileVisit.ts:45`, `useBarCharacter.ts:19`).
- `useCardSettings(cardId, visit, onSwitch)` zależy od reguł karty (`onSwitch`), więc zostaje w karcie (`useCardSettings.ts:57-61`).
- Labirynt nie przekazuje `newProfileCards` do `ProfileCorner` (`WorksheetGenerator.tsx:142-153`).
- Test druku sprawdza zapisy `cn("…")` w źródłach: po przeniesieniu klas do komponentu strony asercje muszą się przenieść razem z nimi (wcześniejsza zmiana GH 81 zostawiła je w wyspach właśnie z tego powodu).

## What We're NOT Doing

- Nie wciągamy labiryntu do `CardSettingsMap` i nie zmieniamy ścieżki pamięci poziomu labiryntu (`useMazeLevelMemory`, `recordBarCharacter`).
- Labirynt zostaje przy własnym stanie postaci i nie przechodzi na `useBarCharacter`.
- Nie ruszamy generatorów, układów w mm ani rysowania SVG żadnej karty.
- Nie zmieniamy `GeneratorShell.astro` ani strony głównej.
- Nie dodajemy nowego rodzaju karty i nie dotykamy roadmapy (zadanie nie ma etykiety `roadmap-slice`).

## Implementation Approach

Cztery fazy, od najmniej do najbardziej widocznej zmiany: najpierw hook (czysty stan, bez zmian wyglądu), potem komponent strony z jednym wierszem kontrolek (jedyna faza zmieniająca wygląd), potem labirynt, na końcu uogólnienie e2e i zasada dla kolejnych kart. Test druku przepisujemy w fazie 2, w tej samej zmianie co przeniesienie klas, bo inaczej `npm test` jest czerwony.

## Phase 1: Hook stanu strony karty

### Overview

Wspólny hook składa łańcuch profilu, postaci paska i ulubionej oraz `barLevel`. Pięć kart przestaje go powielać. Wygląd się nie zmienia.

### Changes Required:

#### 1. Nowy hook

**File**: `src/hooks/useCardPage.ts`

**Intent**: Zebrać to, co dziś powtarza się na początku każdej wyspy karty: `useChildProfileVisit`, `useBarCharacter`, `useFavoriteCharacter` i `barLevel` z `applyProfileBar`.

**Contract**: `useCardPage()` zwraca `{ visit, bar, favorite, barLevel }`. Wewnętrznie przekazuje do `useChildProfileVisit` funkcję `onApply`, która woła `bar.applyBar(next)` i `setBarLevel(next.level)`. `useCardSettings` zostaje poza hookiem, bo bierze `onSwitch` z reguł karty.

#### 2. Pięć kart

**File**: `src/components/SymmetryGenerator.tsx`, `SequenceGenerator.tsx`, `SudokuGenerator.tsx`, `NonogramGenerator.tsx`, `DictationGenerator.tsx`

**Intent**: Zastąpić lokalny łańcuch hooków i `applyProfileBar` wywołaniem `useCardPage()`.

**Contract**: Zachowanie i markup bez zmian.

#### 3. Test druku

**File**: `src/lib/sheet/print-contract.test.ts`

**Intent**: Nadążyć za przeniesieniem wywołania `useBarCharacter(` z kart do hooka.

**Contract**: Asercja z linii 304-307 sprawdza `useBarCharacter(` w `src/hooks/useCardPage.ts`, a w pięciu kartach sprawdza wywołanie `useCardPage(`. Pozostałe asercje bez zmian.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Testy przechodzą, w tym zaktualizowany test druku: `npm test`
- Typy i build przechodzą: `npx astro check && npm run build`
- E2E przechodzi na projektach Chromium: `npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`

#### Manual Verification:

- Na każdej z pięciu kart: zmiana profilu, wybór postaci i „Ustaw jako ulubioną” działają jak przed zmianą.

**Implementation Note**: Po tej fazie i zielonych testach zatrzymaj się na potwierdzenie ręczne.

---

## Phase 2: Komponent strony karty i wspólny wiersz kontrolek

### Overview

Komponent strony przejmuje całą powłokę pięciu kart. Wprowadzamy jeden wiersz kontrolek ustawień. To jedyna faza, w której zmienia się wygląd (drobne odstępy w Nonogramie, Dyktandzie i innych).

### Changes Required:

#### 1. Komponent strony

**File**: `src/components/CardPage.tsx`

**Intent**: Jedno miejsce na efekt `has-sheet`, komunikat błędu, dwa układy Generuj/Drukuj, `ProfileCorner`, `RememberedNote` i blokadę `waitingForChild`.

**Contract**: Przyjmuje zwykłe dane, a nie wynik hooka, żeby pasował także do labiryntu: `profiles`, `activeId`, `ask`, `waitingForChild`, `barCharacter`, `barLevel`, `corner` (`ProfileCornerHandlers`), opcjonalne `newProfileCards`, `note`, `sheetShown`, `controls` (kontrolki karty jako `ReactNode`), `sheet` (arkusz SVG), `onGenerate`, `generateFailed` i tekst błędu (domyślnie „Nie udało się ułożyć karty."). Karty podają dane z `useCardPage()` i `useCardSettings`, labirynt ze swojego stanu. `onGenerate` jest wywoływane tylko gdy `!waitingForChild`; `Generuj` ma `disabled={waitingForChild}`. Zapisy `cn("… print:hidden")` mieszkają tylko tu.

#### 2. Wspólny wiersz kontrolek

**File**: `src/components/CardPage.tsx` (lub osobny `CardSettingsRow.tsx`, jeśli plik robi się za duży)

**Intent**: Jeden wiersz z jedną regułą odstępów i zawijania, używany przed kartą i po jej pokazaniu, tak by działał dla 2-6 kontrolek na telefonie i komputerze.

**Contract**: Reguły do spełnienia: (1) pierwsza kontrolka w zawiniętej linii zaczyna swój tekst w tym samym x co „Postać”, także dla przycisków bez ikony (wniosek z #173: `px-2 max-sm:px-3`); (2) odstęp między liniami jest jeden wszędzie, w tym nad „Kategorią” w Nonogramie. Dwupoziomowy układ Nonogramu znika. Najbliższy `div` nad kontrolkami zachowuje klasę `flex-wrap`, bo `phone-settings-rows.spec.ts:74` i `phone-toggle-align.spec.ts:45` szukają go przez `ancestor::div[contains(@class,'flex-wrap')][1]`. Wartości odstępów ustala implementer przy użyciu `tests/e2e/phone-settings-rows.spec.ts`.

#### 3. Pięć kart

**File**: `SymmetryGenerator.tsx`, `SequenceGenerator.tsx`, `SudokuGenerator.tsx`, `NonogramGenerator.tsx`, `DictationGenerator.tsx`

**Intent**: Zostawić w każdej tylko kontrolki, reguły generowania i arkusz; resztę oddać `CardPage`.

**Contract**: Kontrolki karty to ten sam fragment, który dziś trafia do wiersza. `showSolution` (Nonogram, Dyktando) zostaje stanem karty, jak i jego zerowanie w `generateFor`.

#### 4. Test wiersza telefonu

**File**: `tests/e2e/phone-settings-rows.spec.ts`

**Intent**: Dostosować test Nonogramu (`:109-138`) do ujednoliconego wiersza w tej samej fazie, żeby e2e było zielone po fazie 2.

**Contract**: Test nie zakłada już, że „Postać”, „Poziom” i „Kategoria” zawijają się do trzech osobnych linii. Sprawdza reguły: tekst kontrolki w zawiniętej linii zaczyna się jak „Postać”, a odstępy między liniami są równe. Test sudoku (`:56-88`) zostaje, o ile wiersz spełnia obie reguły. Rozszerzenie na wszystkie strony jest w fazie 4.

#### 5. Test druku

**File**: `src/lib/sheet/print-contract.test.ts`

**Intent**: Pilnować tego samego kontraktu na nowym miejscu.

**Contract**: Listy `print:hidden` asertowane raz dla `CardPage.tsx`; w kartach zostają asercje SVG, `printColorAdjust`, grupy rozwiązania z `print:hidden`, `<CharacterChoiceControl`, `useCardPage(` oraz `<CardPage`. W teście usunąć asercje, które dotyczyły wyłącznie zapisów przeniesionych z wysp.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Testy przechodzą, w tym przepisany `print-contract.test.ts`: `npm test`
- Typy i build przechodzą: `npx astro check && npm run build`
- E2E przechodzi na czterech projektach Chromium: `npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`

#### Manual Verification:

- Pięć kart przed i po wygenerowaniu na telefonie (360 px) i komputerze: wiersz kontrolek wygląda równo, nic nie nachodzi na Generuj i Drukuj.
- Podgląd wydruku każdej z pięciu kart nie pokazuje paska, a arkusz mieści się na jednej stronie A4.
- Nonogram i Dyktando: „Pokaż rozwiązanie” działa, a wydruk go nie zawiera.

**Implementation Note**: Po tej fazie zatrzymaj się na potwierdzenie ręczne wyglądu.

---

## Phase 3: Labirynt na szkielecie

### Overview

`WorksheetGenerator` używa `CardPage` i wspólnego wiersza, ale zachowuje własny stan postaci i poziomu.

### Changes Required:

#### 1. Wyspa labiryntu

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Oddać powłokę komponentowi strony, bez zmiany pamięci poziomu i postaci.

**Contract**: Labirynt podaje `CardPage` te same zwykłe dane co karty (kontrakt z fazy 2): `profiles`, `activeId`, `ask`, `waitingForChild` z `useChildProfileVisit`, obecną postać i poziom ze swojego stanu, `corner` z `visit.corner`, `note` (`mazeLevelMemory.note ?? favorite.note`), bez `newProfileCards`, kontrolki (Postać, Poziom) i `MazeSheet`. Przycisk Drukuj bez warunku `maze === null` (przy pokazanym pasku karta zawsze istnieje).

#### 2. Test druku

**File**: `src/lib/sheet/print-contract.test.ts`

**Intent**: Zastąpić asercje listy `print:hidden` z `WORKSHEET_GENERATOR` (linie 77-82) asercją na `CardPage.tsx`; zostawić `print:hidden` dialogu poziomu i `CharacterChoiceControl`.

**Contract**: Asercja `<WorksheetGenerator` na stronie `maze.astro` (linia 92) bez zmian.

### Success Criteria:

#### Automated Verification:

- Lint, testy, typy i build: `npm run lint && npm test && npx astro check && npm run build`
- E2E na czterech projektach Chromium: `npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`

#### Manual Verification:

- Labirynt: wybór poziomu 1-6 i postaci, zapis przy aktywnym profilu („Zapamiętane dla …”) i bez profilu, Poziom 6 z postacią nad startem.
- Druk labiryntu na jednej stronie A4 bez paska.

**Implementation Note**: Po tej fazie zatrzymaj się na potwierdzenie ręczne.

---

## Phase 4: E2E dla wszystkich kart i zasada dla kolejnych

### Overview

Reguły wiersza z #173 sprawdzane na każdej karcie, a nie tylko na sudoku i nonogramie. Krótka zasada dla autora następnej karty.

### Changes Required:

#### 1. Uogólnienie testu wiersza

**File**: `tests/e2e/phone-settings-rows.spec.ts`

**Intent**: Sprawdzić obie reguły (start tekstu zawiniętej kontrolki, jednakowy odstęp między liniami) dla wszystkich sześciu stron przed i po pierwszej karcie, na `phone-360`.

**Contract**: Pętla po `/maze`, `/symmetry`, `/sequences`, `/sudoku`, `/nonogram`, `/dictation`; pozostałe projekty tylko otwierają stronę i potwierdzają kontrolki (jak dziś). Zachować nagłówek Provenance i dopisać GH 192.

#### 2. Zasada w AGENTS.md

**File**: `AGENTS.md`

**Intent**: Powiedzieć agentowi, że nowa karta siada na `CardPage` i `useCardPage`, a nie kopiuje wyspę.

**Contract**: Jedno zdanie w sekcji „Structure and conventions”, bez zmiany innych reguł.

### Success Criteria:

#### Automated Verification:

- Lint, testy, typy i build: `npm run lint && npm test && npx astro check && npm run build`
- Uogólniony test wiersza przechodzi na czterech projektach Chromium: `npx playwright test tests/e2e/phone-settings-rows.spec.ts --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`

#### Manual Verification:

- Kontrola końcowa na telefonie i komputerze: wszystkie sześć stron przed i po Generuj wygląda spójnie, a druk jest bez zmian.

---

## Testing Strategy

### Unit Tests:

- `print-contract.test.ts` jest jedynym testem dotykającym źródeł komponentów; przepisany w fazach 1-3 tak, by pilnował tych samych niezmienników (klasy `print:hidden`, SVG 210×297 mm, kolory druku, `CharacterChoiceControl`).

### Integration Tests:

- Istniejące e2e (`card-settings`, `level-bar`, `phone-layout`, `phone-settings-rows`, `phone-toggle-align` i pozostałe w `tests/e2e/`) muszą zostać zielone w każdej fazie. Zmiana oczekiwań w którymkolwiek poza `phone-settings-rows` oznacza regresję do zbadania, nie test do poprawienia.

### Manual Testing Steps:

1. Dla każdej karty: Generuj, zmiana ustawienia, zmiana profilu, Drukuj (podgląd wydruku).
2. Telefon 360 px i komputer: wiersz kontrolek przed i po pierwszej karcie.
3. Dwa profile: blokada Generuj, gdy strona czeka na wybór dziecka.

## Performance Considerations

Brak. Zmiana przenosi markup i stan między plikami.

## Migration Notes

Brak zmian formatu danych w `localStorage`.

## References

- Related research: `context/changes/gh192-pages-sceleton/research.md`
- Issue: GH 192 „Wspólny szkielet strony karty przed kolejnym rodzajem”
- Poprzednia konsolidacja: `context/archive/2026-10-24-generate-button-shared/plan-brief.md`
- Poprawka wiersza ustawień: `context/archive/2026-10-29-phone-settings-rows/plan-brief.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Hook stanu strony karty

#### Automated

- [x] 1.1 Lint przechodzi: `npm run lint` — ab1b523
- [x] 1.2 Testy przechodzą, w tym zaktualizowany test druku: `npm test` — ab1b523
- [x] 1.3 Typy i build przechodzą: `npx astro check && npm run build` — ab1b523
- [x] 1.4 E2E przechodzi na projektach Chromium: `npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768` — ab1b523

#### Manual

- [x] 1.5 Na każdej z pięciu kart: zmiana profilu, wybór postaci i „Ustaw jako ulubioną” działają jak przed zmianą. — ab1b523

### Phase 2: Komponent strony karty i wspólny wiersz kontrolek

#### Automated

- [x] 2.1 Lint przechodzi: `npm run lint` — 1551fcb
- [x] 2.2 Testy przechodzą, w tym przepisany `print-contract.test.ts`: `npm test` — 1551fcb
- [x] 2.3 Typy i build przechodzą: `npx astro check && npm run build` — 1551fcb
- [x] 2.4 E2E przechodzi na czterech projektach Chromium: `npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768` — 1551fcb

#### Manual

- [x] 2.5 Pięć kart przed i po wygenerowaniu na telefonie (360 px) i komputerze: wiersz kontrolek wygląda równo, nic nie nachodzi na Generuj i Drukuj. — 1551fcb
- [x] 2.6 Podgląd wydruku każdej z pięciu kart nie pokazuje paska, a arkusz mieści się na jednej stronie A4. — 1551fcb
- [x] 2.7 Nonogram i Dyktando: „Pokaż rozwiązanie” działa, a wydruk go nie zawiera. — 1551fcb

### Phase 3: Labirynt na szkielecie

#### Automated

- [x] 3.1 Lint, testy, typy i build: `npm run lint && npm test && npx astro check && npm run build`
- [x] 3.2 E2E na czterech projektach Chromium: `npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`

#### Manual

- [x] 3.3 Labirynt: wybór poziomu 1-6 i postaci, zapis przy aktywnym profilu i bez profilu, Poziom 6 z postacią nad startem.
- [x] 3.4 Druk labiryntu na jednej stronie A4 bez paska.

### Phase 4: E2E dla wszystkich kart i zasada dla kolejnych

#### Automated

- [ ] 4.1 Lint, testy, typy i build: `npm run lint && npm test && npx astro check && npm run build`
- [ ] 4.2 Uogólniony test wiersza przechodzi na czterech projektach Chromium: `npx playwright test tests/e2e/phone-settings-rows.spec.ts --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`

#### Manual

- [ ] 4.3 Kontrola końcowa na telefonie i komputerze: wszystkie sześć stron przed i po Generuj wygląda spójnie, a druk jest bez zmian.
