# Postać mówi polecenie na każdej karcie — plan implementacji

## Overview

S-30 z kamienia M-4 (US-21, FR-030, US-03). Strony symetrii, sekwencji, sudoku, nonogramu i dyktanda dostają pasek „Postać” jak labirynt. Wybrana postać (z katalogu albo własny obrazek) stoi na kartce w kolorze, z lewej strony, a zdanie polecenia jest w jej dymku. Przy „Bez postaci” karta wygląda jak dziś. Zadanie, odpowiedź, druk na jednej stronie A4 i margines 10 mm zostają bez zmian; labirynt nie zmienia się wcale. Ulubiona postać i „Ustaw jako ulubioną” to S-31, pamięć ustawień to S-28 (scalone).

Makieta zaakceptowana 2026-10-27 na prawdziwej stronie (dyktando trudne z dinozaurem, symetria z rakietą): postać ok. 26 mm z lewej od marginesu, dymek z ogonkiem w jej stronę obok, polecenie w dymku (dwa wiersze, gdy długie), reszta karty niżej.

## Current State Analysis

- Postać jest tylko na labiryncie: `CharacterChoiceControl` i stan paska (`character`, `ownImageHref`, wybór, własny obrazek, `applyProfileBar`) siedzą w `src/components/WorksheetGenerator.tsx:32-125,212-260`; obraz rysuje `MazeSheet` (`:344-352`) z odsunięciem `characterContentLeft` (`src/lib/sheet/character.ts`).
- Pięć pozostałych stron trzyma `barCharacter` i `barLevel` tylko po to, by róg profilu je znał (`SymmetryGenerator.tsx:33-34,92-95`); nie mają paska „Postać” ani obrazka na kartce. Komentarze nad komponentami mówią „It has no character bar” i trzeba je poprawić.
- Zapis wyboru z paska bez profilu: `recordBarCharacter(localStorage, activeId, id, level)` w `src/lib/sheet/own-image-store.ts:90`; przy aktywnym profilu nie zapisuje nic (zmiana tylko na wizytę, ulubioną zmienia róg profilu). To zostaje; S-31 zmieni znaczenie.
- Układy arkusza liczą pas polecenia jako pole tekstu o wysokości czcionki (7 mm; sudoku: 2 linie po 6,5 mm) i środkują cały blok na stronie: `src/lib/symmetry/layout.ts:29` (`instructionHeight`), `src/lib/sequence/layout.ts:30`, `src/lib/nonogram/layout.ts:72,126` (klasyczny i znaczki, `instructionSize`), `src/lib/dictation/layout.ts:60` (`instructionSize`), `src/lib/sudoku/layout.ts:35` (linie). Wszystkie rzucają błąd, gdy blok nie mieści się w 277 mm.
- Zapas wysokości (wewnętrzna 277 mm) po zamianie pola polecenia 7 mm na pas 26 mm (przyrost +19 mm; sudoku +10 mm względem 16 mm):
  - symetria: blok 7+6+240+4 = 257, z pasem 276 — mieści się na każdym poziomie (kratki 20/15/12/10 mm dają zawsze 240 mm wysokości);
  - sekwencje: 5–7 rzędów pól rozłożonych w dostępnej wysokości, zapas ponad 70 mm;
  - sudoku: 185 / 193 / 205 mm, z pasem o 10 mm więcej, mieści się;
  - nonogram: najwyższy trudny 24×7 mm plus pasma liczb, zapas ponad 50 mm; łatwy ze znaczkami podobnie;
  - **dyktando**: 275 / 266 / 277 mm dziś, bo `maxCommands` (55, 55, 84) wypełnia stronę. Z pasem się nie mieści: wymaga zmniejszenia kratki (decyzja poniżej).
- Postać rysuje się jako `<image>` w SVG kartki; `GeneratorShell.astro` ma reguły druku kartki (`@media print`), a `print-contract.test.ts` odczytuje pliki generatorów jako tekst i pilnuje ich klas. Pięć kart już ustawia `printColorAdjust: exact` na SVG (labirynt nie); kolorowa postać wymaga go na każdej, żeby się wydrukowała w kolorze, więc zostaje i test go pilnuje.
- Katalog postaci ma tylko `contentLeft` (pusty margines z lewej, ułamek kwadratowego pliku 1024 px). Bez marginesu z prawej nie da się dobrać szerokości dymka do szerokiej postaci (jednorożec, smok).

## Desired End State

- Strona każdej z pięciu kart ma pasek „Postać” obok poziomu i innych ustawień, taki jak na labiryncie (ta sama lista 11 postaci, „Bez postaci”, własny obrazek).
- Karta z wybraną postacią: u góry, w polu o wysokości 26 mm, stoi z lewej postać w kolorze (od lewej krawędzi marginesu 10 mm), obok dymek z ogonkiem w jej stronę z poleceniem (jedna linia 7,5 albo dwie linie 6,2 w dymku). Reszta karty (zadanie) leży pod pasem z przerwą, jaką karta miała pod poleceniem.
- Z „Bez postaci” karta jest taka sama jak dziś, co do kratki i położenia; miniatury katalogu się nie zmieniają.
- Karta nadal jest jedną stroną A4 z marginesem 10 mm na każdym poziomie, rozmiarze i kategorii; kratka dyktanda zmniejsza się tylko wtedy, gdy postać jest wybrana (decyzja poniżej).
- Postać drukuje się w kolorze niezależnie od przełącznika kolorów i od druku czarnego; żadne pole zadania nie używa postaci.
- Odpowiedź, rozwiązanie na ekranie i generator nie zmieniają się; zmiana postaci nie generuje nowej karty i nie zmienia ustawień karty.

### Decyzje z rozmowy (2026-10-27)

| Decyzja                         | Wybór                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Wygląd                          | Makieta: postać 26 mm z lewej, dymek obok, ogonek w stronę postaci                                            |
| Złożoność                       | MEDIUM, 3 pytania                                                                                             |
| Dyktando nie mieści się z pasem | Zmniejszyć kratkę do największej, która się mieści (reguła ogólna dla kart, które się nie mieszczą)           |
| Testy                           | Jednostkowe układów i kontrakt druku, plus e2e Playwright: pasek i dymek na 5 kartach, „Bez postaci”, telefon |

### Key Discoveries

- Wszystkie układy mają już parametr „wysokość pola polecenia”; pas postaci to wartość 26 zamiast 7 (sudoku: jedna dodatkowa wysokość pola zamiast liczby linii), więc zmiana układu jest mała i zachowuje środkowanie bloku.
- Symetria mieści się z pasem o 1 mm (276 z 277), więc żaden dodatek nad zadaniem (przerwa pod pasem) nie może być większy niż dziś; przerwa pod pasem zostaje wartością karty (`instructionGap`), w tym oś wystaje 4 mm w przerwę.
- Kratka dyktanda z pasem liczy się z liczby poleceń karty: trudne 277 − 26 − 6 − 6 − (wiersze × 8,3) na 26 wierszy (6 wierszy → 7,2 mm, 5 wierszy → 7,8 mm); łatwe i średnie przy 55 poleceniach (5 wierszy po 12 mm) 179 mm na 14 i 17 wierszy → 12,7 i 10,5 mm, ale przy typowych 20–44 poleceniach (3–4 wiersze) nominalne 14 i 11 mm się mieszczą.

## What We're NOT Doing

- Labirynt: bez zmian układu, bez dymka; jego strona nie przechodzi na nowy hook (zostaje jak jest).
- Ulubiona postać, „Tylko na tę kartę”, „Ustaw jako ulubioną”, komunikat o zapamiętaniu postaci — S-31. Semantyka zapisu postaci z paska zostaje dzisiejsza.
- Zmiany okna profilu, katalogu i plakietek (S-29), strona „Jak to działa” (S-32), nowe postaci, prawa do postaci (PRD OQ 3).
- Postać jako treść zadania (sylwetka, obrys). Pola zadania nigdy nie używają postaci.
- Nowe kolory: dymek i obrys używają tokenów (`var(--foreground)`, `var(--card)`), bez nowych literałów kolorów.
- Zmiana poleceń, obiektów, poziomów, rozmiarów, `maxCommands` ani żadnego generatora.
- Wydruk próbny nie jest automatyczny: sprawdza go użytkowniczka w fazie 5.

## Implementation Approach

Jedna wspólna geometria pasa (czysta funkcja z testami) i jeden komponent SVG rysują postać i dymek na każdej karcie; każda strona dodaje pasek „Postać” przez wspólny przycisk i wspólny hook stanu paska. Układy kart dostają pas jako wysokość pola polecenia, gdy postać jest wybrana, a bez postaci — dzisiejszą wartość. Karty, których zadanie się nie mieści, dostają zmniejszoną kratkę z jednej funkcji dopasowania; w praktyce tylko dyktando. Fazy idą od fundamentu przez karty o największym zapasie do najciaśniejszej, a kończą się kontraktem druku i e2e. Wszystkie pięć stron i S-28/S-31 dzielą pliki, więc zmiany w stronach są małe i lokalne (pasek, stan, jeden komponent).

## Critical Implementation Details

- **Szerokość dymka od postaci:** dymek zaczyna się za widoczną częścią postaci. Dodaj do katalogu `contentRight` (pusty margines z prawej jako ułamek pliku) tak jak `contentLeft`; repo nie ma biblioteki do pikseli PNG, więc zmierz go jednorazowo (np. skryptem Playwright na canvasie) i zapisz jako stałe. Własny obrazek ma oba marginesy 0 i nie musi być kwadratowy (skalowany do maksymalnej krawędzi), więc dymek zaczyna się za prawą krawędzią pola 26 mm. Bez tego dymek zasłoni szeroką postać albo zostawi dziurę przy wąskiej.
- **Pas tylko z postacią:** `bandHeight` to 26 mm, gdy `character !== "none"` i jest czym rysować (katalog albo własny obrazek ze zdjęciem); inaczej układ dostaje dzisiejszą wysokość pola, więc „Bez postaci” i własny obrazek bez pliku wyglądają jak dziś.
- **Kolor w druku:** SVG kartki każdej z pięciu kart zachowuje `printColorAdjust: exact` (już je mają), bo bez tego przeglądarka może wydrukować `<image>` w szarości lub zgubić tło dymka.

## Faza 1: Wspólny pas z postacią i dymkiem

### Overview

Fundament bez zmiany wyglądu żadnej karty: geometria pasa, reguła dopasowania kratki, komponent SVG, wspólny przycisk „Postać” i hook paska.

### Changes Required:

#### 1. Geometria pasa

**File**: `src/lib/sheet/speech.ts` (nowy), `src/lib/sheet/speech.test.ts` (nowy)

**Intent**: Czysta funkcja, która dla szerokości strony, marginesu, postaci (id, `contentLeft`, `contentRight`) i linii polecenia zwraca prostokąt postaci, prostokąt dymka, ogonek i położenie linii tekstu oraz wysokość pasa.

**Contract**: Stałe pasa: wysokość postaci 26 mm (kwadrat), postać zaczyna się na marginesie z odsunięciem `contentLeft`, dymek zaczyna się za prawą krawędzią widocznej postaci + długość ogonka, kończy na prawym marginesie, rogi 5 mm, obrys 0,6 mm. Tekst: jedna linia 7,5 mm; gdy polecenie ma wiele zdań (rozdzielane po kropce) — jedna linia na zdanie, 6,2 mm, wyśrodkowane w dymku. `bandHeight(characterShown)` zwraca 26 albo wartość „bez postaci”. Test: dymek ani postać nie wychodzą poza margines 10 mm, tekst mieści się w dymku dla najdłuższego polecenia każdej z pięciu kart i dla każdej postaci katalogu, ogonek wskazuje postać.

#### 2. Dopasowanie kratki

**File**: `src/lib/sheet/speech.ts`, `src/lib/sheet/speech.test.ts`

**Intent**: Jedna funkcja zwraca największą kratkę (krok 0,1 mm, nie większą niż nominalna), przy której blok zadania mieści się w wysokości dostępnej pod pasem.

**Contract**: `fitCellSize({ nominal, rows, fixedHeight, innerHeight })` → liczba w mm, `nominal` gdy się mieści; nigdy mniej niż 0, a test sprawdza wartości z tabeli w Key Discoveries.

#### 3. Dane katalogu

**File**: `src/lib/sheet/character.ts`, `src/lib/sheet/character.test.ts`

**Intent**: Dodać `contentRight` do jedenastu postaci (z pikseli `public/characters/*.png`, jak `contentLeft`) i funkcję `characterContentRight(id)` (0 dla własnego obrazka i nieznanych).

**Contract**: `contentRight` jako ułamek 0–1 pliku kwadratowego; test pilnuje, że dla każdej postaci `contentLeft + contentRight < 1` i że widoczna szerokość nie przekracza wysokości (kwadrat).

#### 4. Komponent pasa

**File**: `src/components/SpeechBand.tsx` (nowy)

**Intent**: Rysuje w SVG kartki postać (`<image>`), dymek (obrys i ogonek jako jedna ścieżka) i linie tekstu z geometrii pasa. Brak postaci → sam tekst wyśrodkowany jak dziś.

**Contract**: Props: `layout` z `speech.ts`, `characterSrc: string | null`, `lines`. Kolory tylko `var(--foreground)` i `var(--card)`; tekst `fontFamily="ui-sans-serif, system-ui, sans-serif"` jak dziś; `role` nie dodaje się (SVG ma `role="img"` z etykietą karty).

#### 5. Wspólny przycisk i hook paska

**File**: `src/components/CharacterChoiceControl.tsx` (nowy, przeniesiony z `WorksheetGenerator.tsx:212-260`), `src/hooks/useBarCharacter.ts` (nowy)

**Intent**: Wyciągnąć przycisk „Postać” z maze do osobnego pliku (labirynt importuje go bez zmiany wyglądu) i dać pięciu stronom jeden hook stanu paska: `character`, `ownImageHref`, wybór z listy, własny obrazek, `applyProfileBar` i zapis `recordBarCharacter`.

**Contract**: `useBarCharacter(visit, barLevel)` zwraca `{ character, ownImageHref, characterSrc, onSelect, onCopied, applyBar, label, thumbSrc }`. Zachowuje dzisiejsze zasady zapisu (bez profilu zapisuje ostatnio użytą; z profilem tylko stan wizyty). `characterSrc` to katalogowy plik albo własny obrazek, `null` dla „Bez postaci” i dla własnego bez pliku.

### Success Criteria:

#### Automated Verification:

- Testy geometrii pasa i dopasowania kratki przechodzą: `npm test`
- Lint bez błędów: `npm run lint`
- `npx astro check` bez błędów
- Labirynt bez zmian wyglądu: test kontraktu druku i istniejące e2e labiryntu zielone
- `src/lib/sheet/speech.test.ts` jest w skrypcie `test` w `package.json` i `npm test` go uruchamia

#### Manual Verification:

- Strona labiryntu: przycisk „Postać” wygląda i działa jak przed zmianą

**Implementation Note**: Po fazie i zielonych testach automatycznych czekaj na potwierdzenie ręczne przed fazą 2.

---

## Faza 2: Symetria i sekwencje

### Overview

Pierwsze dwie karty z postacią i dymkiem. Obie mają duży zapas; symetria jest ciasna o 1 mm i pilnuje reguły przerwy.

### Changes Required:

#### 1. Układy

**File**: `src/lib/symmetry/layout.ts`, `src/lib/sequence/layout.ts` (+ testy `layout.test.ts`)

**Intent**: Pole polecenia (`instructionHeight`) przyjmuje wysokość pasa; środek polecenia (`instruction.y`) staje się środkiem pasa. Bez postaci wartości bez zmian.

**Contract**: Brak zmiany sygnatur; testy: każdy poziom symetrii i sekwencji z `bandHeight` 26 mieści się w 10 mm (bez wyjątku), z 7 daje dokładnie dzisiejsze współrzędne.

#### 2. Strony

**File**: `src/components/SymmetryGenerator.tsx`, `src/components/SequenceGenerator.tsx`

**Intent**: Pasek „Postać” jako pierwszy element paska (jak labirynt) w obu układach strony (przed kartą i z kartą), stan z `useBarCharacter`, `SpeechBand` zamiast pola tekstu w `SymmetrySheet`/sekwencji; `printColorAdjust: exact` na SVG zostaje. Zmiana postaci rysuje tę samą kartę od nowa, nie generuje nowej. Poprawić komentarz „no character bar”.

**Contract**: Pas pokazuje polecenie z `SYMMETRY_SHEET.instructionText` / `SEQUENCE_SHEET.instructionText`; pole zadania nie dostaje postaci.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check` zielone
- Testy układów dla wszystkich poziomów z pasem i bez
- Układ paska na telefonie: `npx playwright test tests/e2e/phone-layout.spec.ts --project=phone-360 --project=pixel-7`

#### Manual Verification:

- Symetria i sekwencje: postać po lewej, dymek z poleceniem, karta mieści się na stronie, „Bez postaci” jak dotąd
- Przełączenie Kolory na symetrii nie zmienia postaci ani karty

---

## Faza 3: Sudoku i nonogram

### Overview

Dwie karty z kilkoma układami: sudoku trzy rozmiary, nonogram klasyczny (średni, trudny) i znaczki (łatwy).

### Changes Required:

#### 1. Układy

**File**: `src/lib/sudoku/layout.ts`, `src/lib/nonogram/layout.ts` (+ testy)

**Intent**: Sudoku: nowa opcjonalna wysokość pola polecenia zastępuje liczbę linii, gdy jest pas. Nonogram klasyczny i znaczki: `instructionSize` przyjmuje wysokość pasa. Środkowanie bloku zostaje.

**Contract**: `SudokuSheetInput.instructionBoxHeight?: number` (gdy podane, zastępuje `instructionLineCount × size + gaps`). Testy: każdy rozmiar i poziom z pasem mieści się w 10 mm; bez pasa współrzędne bez zmian.

#### 2. Strony

**File**: `src/components/SudokuGenerator.tsx`, `src/components/NonogramGenerator.tsx`, `src/components/NonogramSimpleSheet.tsx`

**Intent**: Pasek „Postać” jak w fazie 2, `SpeechBand` z dwoma liniami polecenia dla sudoku (istniejące dwa zdania) i jedną/dwoma dla nonogramu i znaczków; `printColorAdjust: exact` zostaje. „Pokaż rozwiązanie” i zmiana poziomu zostają bez zmian.

**Contract**: Nonogram i sudoku pokazują postać także przy rozwiązaniu na ekranie; postać nie jest częścią rozwiązania ani kratki.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check` zielone
- Testy układów dla każdego rozmiaru/poziomu z pasem i bez
- Układ paska na telefonie: `npx playwright test tests/e2e/phone-layout.spec.ts --project=phone-360 --project=pixel-7`

#### Manual Verification:

- Sudoku 4×4, 6×6, 9×9 (kształty i cyfry) i nonogram łatwy/średni/trudny: postać po lewej, dymek czytelny, nic nie wchodzi w margines

---

## Faza 4: Dyktando z zmniejszaną kratką

### Overview

Najciaśniejsza karta: lista poleceń i kratka wypełniają dziś całą stronę.

### Changes Required:

#### 1. Dopasowanie kratki

**File**: `src/lib/dictation/layout.ts`, `src/lib/dictation/levels.ts`, `src/lib/dictation/layout.test.ts`, `src/lib/dictation/levels.test.ts`

**Intent**: Gdy postać jest wybrana, strona liczy kratkę z `fitCellSize` z faktycznej liczby poleceń wygenerowanej karty (nie z `maxCommands`) i przekazuje ją do układu; bez postaci kratka nominalna. Kratka może więc różnić się między kartami tego samego poziomu, ale tylko gdy lista poleceń jest długa.

**Contract**: `dictationCellSize(level, commandCount, withBand)` → mm; bez pasa kratka nominalna; z pasem największa kratka z krokiem 0,1 mm, przy której blok mieści się w 10 mm dla `ceil(commandCount / commandsPerRow)` wierszy listy. Przy typowych liczbach poleceń (łatwe do 33 = 3 wiersze, średnie do 44 = 4 wiersze) kratka zostaje nominalna; zmniejsza się dopiero gęsta lista (łatwe i średnie 55 poleceń: ≈ 12,7 i ≈ 10,5 mm; trudne ≈ 7,2–7,8 mm). Test: każdy poziom z `maxCommands` poleceń i z pasem mieści się w 10 mm; kratka z pasem ≥ 85% nominalnej; obrys obiektu dalej mieści się w kratce (kolumny × wiersze bez zmian); ta sama karta ma tę samą kratkę po przełączeniu postaci.

#### 2. Strona

**File**: `src/components/DictationGenerator.tsx`

**Intent**: Pasek „Postać”, `SpeechBand` z dwoma zdaniami polecenia, kratka z `dictationCellSize`, kropka startu i rozwiązanie na ekranie skalują się z kratką; `printColorAdjust: exact` zostaje.

**Contract**: Zmiana postaci przelicza kartę (kratka, lista, obrys) bez generowania nowego obiektu.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, `npm run build` zielone
- Test układu dyktanda ze wszystkimi poziomami z pasem i bez przechodzi

#### Manual Verification:

- Dyktando trudne z postacią: lista 84 poleceń, kratka czytelna na wydruku próbnym, nic nie wychodzi poza 10 mm

---

## Faza 5: Kontrakt druku, e2e i wydruk próbny

### Overview

Zabezpieczenie: kontrakt druku, przeglądarka i telefon, ręczny wydruk.

### Changes Required:

#### 1. Kontrakt druku

**File**: `src/lib/sheet/print-contract.test.ts`, `package.json` (lista plików `test`)

**Intent**: Każdy generator kart rysuje `SpeechBand`, każdy SVG kartki ma `printColorAdjust: exact`, a żaden generator poza labiryntem nie ma komentarza „no character bar”.

**Contract**: Testy czytają pliki jak dotychczasowe i pilnują obecności `SpeechBand` oraz braku zakodowanych literałów kolorów w `speech`/`SpeechBand`.

#### 2. e2e

**File**: `tests/e2e/character-speaks.spec.ts` (nowy; nagłówek Provenance jak w sąsiednich plikach)

**Intent**: Dla pięciu kart: pasek „Postać” jest, wybór Dinozaura rysuje postać i dymek z poleceniem w SVG kartki (`<image>` z `/characters/dinozaur.png`), „Bez postaci” zostawia sam tekst bez `<image>`, nic nie nachodzi na Generuj i Drukuj; na telefonie (projekt phone) karta mieści się w szerokości.

**Contract**: Selektory po rolach i etykietach (`Postać: ...`), nie po klasach; bez nowych zależności.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, `npm run build` zielone
- e2e Chromium: `npx playwright test tests/e2e/character-speaks.spec.ts` (oraz pełny zestaw bez regresji)

#### Manual Verification:

- Wydruk próbny pięciu kart z postacią na kolorowej i czarno-białej drukarce: postać w kolorze (szarość na czarno-białej), karta w jednej stronie A4, marginesy 10 mm
- Własny obrazek jako postać i „Bez postaci” na jednej karcie
- Telefon (375 px): pasek „Postać” nie zasłania Generuj i Drukuj, karta mieści się

---

## Testing Strategy

### Unit Tests:

- `speech.ts`: geometria pasa dla wszystkich postaci i najdłuższego polecenia każdej karty; `fitCellSize` na wartościach z tabeli
- układy wszystkich kart: każdy poziom/rozmiar z pasem i bez; współrzędne bez pasa równe dzisiejszym
- `character.ts`: `contentRight`

### Integration Tests:

- e2e Chromium: pasek, postać, dymek, „Bez postaci”, telefon; istniejące e2e (card-settings, level-bar, phone-layout) bez regresji

### Manual Testing Steps:

1. Dla każdej z pięciu kart wybierz postać, wygeneruj kartę i sprawdź podgląd
2. Zmień postać przy pokazanej karcie: ta sama karta, nowa postać
3. Wydrukuj próbnie dyktando trudne i sudoku 9×9 z postacią

## Performance Considerations

Brak: dodatkowy obrazek PNG na kartce (już używany na labiryncie); generowanie bez zmian i dalej poniżej 5 s.

## Migration Notes

Brak zmian zapisanych danych. Postać z paska zapisuje się tak jak dziś na labiryncie (bez profilu: ostatnio użyta; z profilem tylko na wizytę, do S-31).

## References

- Roadmapa: `context/foundation/roadmap.md` sekcja „### S-30”
- PRD: `context/foundation/prd.md` US-21, FR-030, US-03, Business Logic „Postać na kartach”
- Wzorzec postaci i druku: `src/components/WorksheetGenerator.tsx`, `src/lib/sheet/character.ts`, `src/lib/sheet/print-contract.test.ts`
- Układy: `src/lib/{symmetry,sequence,sudoku,nonogram,dictation}/layout.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Wspólny pas z postacią i dymkiem

#### Automated

- [ ] 1.1 Testy geometrii pasa i dopasowania kratki przechodzą: `npm test`
- [ ] 1.6 `src/lib/sheet/speech.test.ts` jest w skrypcie `test` w `package.json` i `npm test` go uruchamia
- [ ] 1.2 Lint bez błędów: `npm run lint`
- [ ] 1.3 `npx astro check` bez błędów
- [ ] 1.4 Labirynt bez zmian wyglądu: test kontraktu druku i istniejące e2e labiryntu zielone

#### Manual

- [ ] 1.5 Strona labiryntu: przycisk „Postać” wygląda i działa jak przed zmianą

### Phase 2: Symetria i sekwencje

#### Automated

- [ ] 2.1 `npm test`, `npm run lint`, `npx astro check` zielone
- [ ] 2.2 Testy układów dla wszystkich poziomów z pasem i bez
- [ ] 2.5 e2e układu paska na telefonie bez regresji: `npx playwright test tests/e2e/phone-layout.spec.ts --project=phone-360 --project=pixel-7`

#### Manual

- [ ] 2.3 Symetria i sekwencje: postać po lewej, dymek z poleceniem, karta mieści się na stronie, „Bez postaci” jak dotąd
- [ ] 2.4 Przełączenie Kolory na symetrii nie zmienia postaci ani karty

### Phase 3: Sudoku i nonogram

#### Automated

- [ ] 3.1 `npm test`, `npm run lint`, `npx astro check` zielone
- [ ] 3.2 Testy układów dla każdego rozmiaru/poziomu z pasem i bez
- [ ] 3.4 e2e układu paska na telefonie bez regresji: `npx playwright test tests/e2e/phone-layout.spec.ts --project=phone-360 --project=pixel-7`

#### Manual

- [ ] 3.3 Sudoku 4×4, 6×6, 9×9 (kształty i cyfry) i nonogram łatwy/średni/trudny: postać po lewej, dymek czytelny, nic nie wchodzi w margines

### Phase 4: Dyktando z zmniejszaną kratką

#### Automated

- [ ] 4.1 `npm test`, `npm run lint`, `npx astro check`, `npm run build` zielone
- [ ] 4.2 Test układu dyktanda ze wszystkimi poziomami z pasem i bez przechodzi

#### Manual

- [ ] 4.3 Dyktando trudne z postacią: lista 84 poleceń, kratka czytelna na wydruku próbnym, nic nie wychodzi poza 10 mm

### Phase 5: Kontrakt druku, e2e i wydruk próbny

#### Automated

- [ ] 5.1 `npm test`, `npm run lint`, `npx astro check`, `npm run build` zielone
- [ ] 5.2 e2e Chromium: `npx playwright test tests/e2e/character-speaks.spec.ts` (oraz pełny zestaw bez regresji)

#### Manual

- [ ] 5.3 Wydruk próbny pięciu kart z postacią na kolorowej i czarno-białej drukarce: postać w kolorze (szarość na czarno-białej), karta w jednej stronie A4, marginesy 10 mm
- [ ] 5.4 Własny obrazek jako postać i „Bez postaci” na jednej karcie
- [ ] 5.5 Telefon (375 px): pasek „Postać” nie zasłania Generuj i Drukuj, karta mieści się
