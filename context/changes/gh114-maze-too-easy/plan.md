# Labirynty trudniejsze na każdym poziomie — plan implementacji

## Overview

Każdy poziom labiryntu dostaje własną szerokość alejki. Losowanie dostaje trzy zmiany: metę w losowej kolumnie dołu na Poziomach 1–5, backtracker zaczynający w losowej komórce i wybór najlepszego z kilkunastu labiryntów według oceny głębokich odnóg i odejścia od środka. Identyfikatory poziomów zostają, więc zapisane profile i ostatnie parametry wczytują się bez migracji. Źródło: GitHub 114 i testy na 4-latku i 6-latku z 2026-10-30 (`frame.md`).

## Current State Analysis

Z `frame.md` (pomiar 300 labiryntów na poziom, generator bez zmian):

| Poziom | Siatka | Alejka  | Algorytm          | Droga śr. (p10–p90) | Droga w środkowej trzeciej | Odnogi przy drodze 1. / 2. poł. |
| ------ | ------ | ------- | ----------------- | ------------------- | -------------------------- | ------------------------------- |
| 1      | 9×11   | 21,1 mm | Kruskal           | 21 (15–25)          | 60%                        | 6,7 / 6,0                       |
| 2      | 9×11   | 21,1 mm | backtracker       | 42 (27–61)          | 41%                        | 1,3 / 3,5                       |
| 3      | 13×16  | 14,6 mm | Kruskal           | 34 (26–44)          | 66%                        | 10,5 / 10,5                     |
| 4      | 13×16  | 14,6 mm | backtracker       | 82 (48–120)         | 45%                        | 2,4 / 5,4                       |
| 5      | 17×21  | 11,2 mm | backtracker       | 134 (77–195)        | 36%                        | 4,4 / 7,4                       |
| 6      | 27×33  | 7,0 mm  | backtracker, rogi | 307 (183–439)       | 33%                        | 9,6 / 14,0                      |

Przyczyny potwierdzone pomiarem:

- Start i meta Poziomów 1–5 leżą w tej samej środkowej kolumnie, więc najkrótsza droga to prosta w dół. Kruskal trzyma 60–66% drogi w środku. Poziom 6 ma rogi i tego objawu nie ma.
- Backtracker rośnie od wejścia (`src/lib/maze/generate.ts:28`, `96-119`). Pierwsza połowa drogi to długi korytarz z małą liczbą odnóg, a druga jest gęstsza. Stąd „od mety ciekawiej”.
- `mazeForSheet` (`generate.ts:71-80`) sprawdza tylko wymiary i jedną drogę. Nic nie ocenia karty, więc rozrzut jest duży.
- Poziomy 1–2 i 3–4 dzielą siatkę, więc i szerokość alejki (`src/lib/maze/levels.ts:28-107`).

Prototyp docelowego losowania (200 kart na poziom, najlepsza z 20, skrypt poza repo) pokazał to, co jest w tabeli Desired End State. Generowanie trwa do 34 ms na Poziomie 6.

## Desired End State

| Id           | Etykieta | Siatka (kol. × wiersze) | Alejka     | Start → meta                      | Algorytm      | Opis w liście poziomów                   |
| ------------ | -------- | ----------------------- | ---------- | --------------------------------- | ------------- | ---------------------------------------- |
| `lat3`       | Poziom 1 | 9×11                    | ok. 21 mm  | środek góry → losowa kolumna dołu | `kruskal`     | najszersze alejki, krótka droga          |
| `lat4`       | Poziom 2 | 11×13                   | ok. 17 mm  | środek góry → losowa kolumna dołu | `backtracker` | szerokie alejki, kręta droga             |
| `lat5`       | Poziom 3 | 13×16                   | ok. 15 mm  | środek góry → losowa kolumna dołu | `backtracker` | węższe alejki, dłuższa kręta droga       |
| `lat6`       | Poziom 4 | 15×18                   | ok. 13 mm  | środek góry → losowa kolumna dołu | `backtracker` | wąskie alejki, długa kręta droga         |
| `lat7`       | Poziom 5 | 19×23                   | ok. 10 mm  | środek góry → losowa kolumna dołu | `backtracker` | bardzo wąskie alejki, bardzo długa droga |
| `nastolatek` | Poziom 6 | 29×35                   | ok. 6,6 mm | lewy górny → prawy dolny róg      | `backtracker` | najwęższe alejki, start i meta w rogach  |

Etykiety, `barLabel`, `typicalAge` i `showCharacter` zostają bez zmian.

Meta na Poziomach 1–5 leży w dolnym wierszu, w losowej kolumnie oddalonej od środka o co najmniej 2 kolumny. Poziom 6 ma jedną dozwoloną kolumnę: prawy dolny róg (kolumna 28).

Oczekiwany wynik losowania z prototypu (nie progi testów, tylko orientacja):

| Poziom | Droga śr. (p10–p90) | Głębokie odnogi przy drodze, p10 (dziś → po) | Droga w środkowej trzeciej |
| ------ | ------------------- | -------------------------------------------- | -------------------------- |
| 1      | 22 (17–28)          | 2 → 5                                        | 46%                        |
| 2      | 48 (30–68)          | 1 → 5                                        | 25%                        |
| 3      | 74 (45–108)         | 3 → 5                                        | 36%                        |
| 4      | 102 (64–141)        | 2 → 6                                        | 32%                        |
| 5      | 173 (115–226)       | 3 → 8                                        | 37%                        |
| 6      | 386 (271–509)       | 4 → 13                                       | 30%                        |

„Głęboka odnoga” to odejście od drogi, za którym leży ślepy fragment o głębokości co najmniej 5 komórek.

Weryfikacja: `npm test`, `npm run lint`, `npx astro check`, `npm run build`, Playwright na projektach Chromium, wydruk próbny wszystkich poziomów i próba z dziećmi.

### Key Discoveries:

- Szerokość alejki to `(pageWidth − 2·inset) / columns` (`src/lib/sheet/layout.ts:56`), czyli 190 mm / kolumny. Pas nad i pod siatką musi mieć co najmniej ok. 11 mm (`layout.ts:65-66`), więc `rows · 190 / columns ≤ ~255`. Nowe siatki dają 225–234 mm wysokości.
- Pozycja mety pochodzi dziś z poziomu: `WorksheetGenerator.tsx:274-275` i `scripts/build-thumbnails.mjs:69-70` podają `level.exit.col`. Po zmianie meta jest cechą konkretnego labiryntu.
- `generateMaze` przyjmuje wstrzykiwany `random` i nie woła `Math.random` (`generate.test.ts:177-189`). Losowanie mety i wybór najlepszego z N muszą używać tego samego `random`, żeby test powtarzalności (`generate.test.ts:167-171`) dalej przechodził.
- `tests/e2e/level-bar.spec.ts:131-132` sprawdza opis Poziomu 3 „węższe alejki, krótka droga”.
- Lekcja z `context/archive/2026-10-11-winding-maze-path/` i `2026-10-16-random-maze-generator/plan.md`: ręczne układanie drogi (1260 linii, szablony drogi) dawało powtarzalne karty i zostało wycofane. Ten plan zostaje przy zwykłych drzewach rozpinających i dokłada tylko wybór z kilku losowań.

## What We're NOT Doing

- Ręczne układanie drogi, szablony drogi, pasma długości, limity odnóg, reguła biegu i tercje z `winding-maze-path`.
- Pętla losowań aż do trafienia w próg. Liczba losowań jest stała, a wybór bierze najlepszą kartę, nawet gdy żadna nie jest „idealna”.
- Ocena nagradzająca samą długość drogi. Długość rośnie przez siatkę i algorytm, nie przez wybór.
- Losowy start na Poziomach 1–5. Start i postać zostają na środku górnej krawędzi.
- Zmiana Poziomu 6 poza siatką 29×35 (rogi zostają).
- Pętle w odnogach (PRD je dopuszcza na Poziomie 6, ale nie wymaga).
- Zmiana identyfikatorów poziomów, migracja profili i ostatnich parametrów.
- Zmiana `@page`, insetu, marginesu, rozmiaru znaku postaci i napisu „Meta”.

## Implementation Approach

Najpierw generator, jego testy i wszyscy odbiorcy `Maze` i `Level.exit`: tabela poziomów, meta w labiryncie, losowanie i wybór. Potem napis „Meta” w skrajnej kolumnie, miniatura i e2e. Na końcu PRD i wydruk próbny. Wybór najlepszego z N jest częścią `generateMaze`, a nie `mazeForSheet`. Bramka zostaje zabezpieczeniem, a nie miejscem reguł trudności, jak w `random-maze-generator`.

## Critical Implementation Details

**Performance constraints**: Poziom 6 to 1015 komórek. Jedno losowanie z oceną trwa w prototypie ok. 1,7 ms, a 20 losowań ok. 34 ms. Budżet to 5 s na Generuj (PRD). Liczba losowań jest stała dla poziomu i nie zależy od czasu. W testach 20 kandydatów na wszystkich poziomach to ok. 70 ms na ziarno, więc próbka rozkładu jest liczona raz na poziom, a nie w każdej asercji osobno. Stryker uruchamia `generate.test.ts` przy każdym mutancie.

**Default level**: `DEFAULT_LEVEL_ID` zostaje `lat5` (Poziom 3), a to poziom z największym skokiem (droga ok. 34 → 74 komórek). Zobaczy go każda pierwsza wizyta i każdy nowy profil (PRD US-08). Decyzja: zostaje, a wydruk próbny to sprawdza (Phase 3).

## Phase 1: Generator i tabela poziomów

### Overview

Nowe siatki i algorytmy. Labirynt niesie swoje wejście i metę. Meta jest losowana, backtracker startuje z losowej komórki, a `generateMaze` zwraca najlepszy z N labiryntów według oceny.

### Changes Required:

#### 1. Tabela poziomów

**File**: `src/lib/maze/levels.ts`

**Intent**: Każdy poziom ma własną siatkę, Kruskal zostaje tylko na Poziomie 1, a meta Poziomów 1–5 jest wybierana z listy kolumn dolnego wiersza. Opisy poziomów odpowiadają nowej tabeli.

**Contract**: `Level` zastępuje `exit: MazePoint` polem `exitColumns: readonly number[]` (kolumny dolnego wiersza, z których losuje się metę). Dla Poziomów 1–5 to kolumny o odległości od kolumny wejścia ≥ 2, dla Poziomu 6 `[28]`. `entrance`, `columns`, `rows`, `algorithm` i `description` według tabeli Desired End State. Poziom 6: `entrance { row: 0, col: 0 }`, siatka 29×35. `DEFAULT_LEVEL_ID` zostaje `lat5`.

#### 2. Labirynt z wejściem i metą

**File**: `src/lib/maze/generate.ts`

**Intent**: Meta jest cechą wygenerowanego labiryntu, więc `Maze` ją niesie, a `countPaths`, `mazeForSheet` i kartka czytają ją z labiryntu.

**Contract**: `Maze` dostaje `entrance: MazePoint` i `exit: MazePoint`. `mazeForSheet(candidate, levelId)` zwraca `null`, gdy wymiary nie są siatką poziomu, wejście nie jest `level.entrance`, meta nie leży w dolnym wierszu w kolumnie z `level.exitColumns` albo `countPaths(candidate, candidate.entrance, candidate.exit) !== 1`.

#### 3. Losowanie i wybór najlepszego

**File**: `src/lib/maze/generate.ts`

**Intent**: Backtracker zaczyna w losowej komórce, żeby obie połowy drogi miały podobnie dużo odnóg. `generateMaze` losuje N kandydatów (każdy z własną metą) i zwraca tego z najwyższą oceną, żeby zniknęły karty z prawie prostą drogą.

**Contract**: `generateMaze(levelId, random)` ma tę samą sygnaturę i zwraca `Maze`. Dla każdego kandydata: losowa kolumna mety z `exitColumns`, budowa drzewa (Kruskal albo backtracker z losowej komórki), otwarcie ściany północnej wejścia i południowej mety. Ocena kandydata = 3 · (liczba głębokich odnóg przy drodze) − 10 · (udział komórek drogi w środkowej trzeciej kolumn). Głęboka odnoga to sąsiad komórki drogi spoza drogi, za którym poddrzewo ma głębokość ≥ 5 komórek. Remis rozstrzyga pierwszy kandydat. N = 20 na każdym poziomie. Wszystko używa tylko przekazanego `random`. Eksportowane są `generateCandidate(levelId, random): Maze` (jedno losowanie bez wyboru) i `scoreMaze(maze): number`; `generateMaze` je składa.

#### 4. Testy generatora

**File**: `src/lib/maze/generate.test.ts`

**Intent**: Testy pilnują nowej tabeli i cech kart, o które chodziło w testach z dziećmi, bez pinowania dokładnych liczb z prototypu.

**Contract**: Test tabeli `LEVELS` z nowymi siatkami, algorytmami, opisami i `exitColumns`. Każdy poziom na 5 ziarnach: siatka, otwarte wejście i meta, meta w `exitColumns`, jedna droga, każda komórka osiągalna. Testy rozkładu liczą próbkę każdego poziomu raz (100 ziaren `generateMaze` i 100 ziaren `generateCandidate`) i współdzielą ją między asercjami:

- mediana długości drogi rośnie z poziomu na poziom (1 < 2 < 3 < 4 < 5 < 6);
- na każdym poziomie 10. percentyl liczby głębokich odnóg w próbce `generateMaze` jest wyższy niż w próbce `generateCandidate`;
- na Poziomach 2–6 średnia liczba głębokich odnóg w pierwszej połowie drogi wynosi co najmniej 70% średniej w drugiej połowie;
- na Poziomach 1–5 średni udział drogi w środkowej trzeciej kolumn jest poniżej 50%;
- na Poziomach 1–5 meta trafia w co najmniej 3 różne kolumny.

Testy powtarzalności, braku `Math.random`, `countPaths` i `mazeForSheet` dostosowane do mety w labiryncie, plus przypadek: `mazeForSheet` odrzuca labirynt z metą w kolumnie spoza `exitColumns`. Test „Kruskal levels close both east and south” zostaje dla Poziomu 1.

#### 5. Odbiorcy labiryntu

**File**: `src/components/WorksheetGenerator.tsx`, `scripts/build-thumbnails.mjs`, `src/lib/sheet/layout.test.ts`, `src/lib/sheet/walls.test.ts`

**Intent**: Każdy, kto czytał `level.exit` albo budował `Maze`, przechodzi na metę z labiryntu w tej samej fazie, w której znika `Level.exit`, żeby `npm test`, `lint` i `astro check` przeszły po Fazie 1.

**Contract**: `MazeSheet` i skrypt miniatury podają `layoutSheet` `entranceColumn: maze.entrance.col` i `exitColumn: maze.exit.col`; `layoutSheet` bez zmian sygnatury. `layout.test.ts`: odczyty `level.exit` (`:84`, `:233-234`) przechodzą na `level.exitColumns`, a zapisane na sztywno kolumny 26 Poziomu 6 (`:113`, `:126`, `:128`) na 28. Test „younger levels keep Meta on the shared entrance and exit column” (`:187-197`) sprawdza każdą kolumnę z `exitColumns`, a nie równość z kolumną wejścia. `walls.test.ts:8-9` (`mazeOf`) buduje `Maze` z `entrance` i `exit`. `character.test.ts:77` (tekst `generateMaze(level, Math.random)`) zostaje prawdziwy.

#### 6. Mutacje

**File**: `src/lib/maze/generate.ts` (bez zmian w `stryker.config.json`)

**Intent**: Ocena i wybór kandydata to nowa logika na liście `mutate`, więc AGENTS.md wymaga zawężonego przebiegu Strykera.

**Contract**: `npx stryker run --mutate "src/lib/maze/generate.ts:<zakres scoreMaze i generateMaze>"`. Przeżyłe mutanty przeglądane pojedynczo; asercja dochodzi tylko wtedy, gdy mutant to widoczny dla rodzica błąd karty.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi z nowymi testami generatora
- `npm run lint` przechodzi
- `npx astro check` przechodzi
- Jedno wywołanie `generateMaze("nastolatek", …)` trwa poniżej 500 ms w teście czasu na 20 ziarnach
- Zawężony Stryker na `scoreMaze` i `generateMaze` uruchomiony, a przeżyłe mutanty przejrzane

#### Manual Verification:

- Na `/maze` w `npm run dev` po 5 kart z każdego poziomu: droga nie biegnie prosto w dół przy środku

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie przed fazą 2.

---

## Phase 2: Kartka, miniatura i e2e

### Overview

Kartka czyta metę z labiryntu już po Fazie 1. Ta faza sprawdza napis „Meta” w skrajnej kolumnie, przegenerowuje miniaturę i dostosowuje e2e.

### Changes Required:

#### 1. Napis „Meta” w skrajnej kolumnie

**File**: `src/lib/sheet/layout.test.ts`

**Intent**: „Meta” w skrajnej dozwolonej kolumnie nie wychodzi poza kartkę.

**Contract**: Dla każdego poziomu i każdej kolumny z `exitColumns`: środek napisu ± połowa szerokości (ok. 4 · 0,6 · 7 mm) leży w granicach 0–210 mm.

#### 2. Miniatura katalogu

**File**: `public/thumbnails/labirynt.svg` (z `scripts/build-thumbnails.mjs`)

**Intent**: Miniatura pokazuje labirynt z nowego generatora.

**Contract**: `public/thumbnails/labirynt.svg` przegenerowana skryptem. Jeśli ziarno w skrypcie daje nieładną kartę, wolno zmienić `SEED`.

#### 3. Testy e2e

**File**: `tests/e2e/level-bar.spec.ts`

**Intent**: E2e sprawdza nowy opis Poziomu 3.

**Contract**: `level-bar.spec.ts:132` oczekuje „węższe alejki, dłuższa kręta droga”. Pozostałe spec-e labiryntu (`seed.spec.ts`, `phone-layout.spec.ts`) przechodzą bez zmian albo z poprawką tylko tam, gdzie zakładały metę pod startem.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi
- `npm run lint` przechodzi
- `npx astro check` przechodzi
- `npm run build` przechodzi
- Playwright na projektach Chromium (`chromium`, `phone-360`, `pixel-7`, `tablet-768`) przechodzi

#### Manual Verification:

- Na `/maze` każdy poziom generuje kartę z metą poza środkiem (Poziomy 1–5) i z postacią na środku wejścia
- Podgląd wydruku w Chrome każdego poziomu to jedna strona A4, a ściany i ramka zachowują margines 10 mm
- Na telefonie (np. `phone-360`) Generuj i Drukuj nie nachodzą na siebie, a karta mieści się na A4
- Miniatura w katalogu na `/` pokazuje nowy labirynt

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie przed fazą 3.

---

## Phase 3: PRD i wydruk próbny

### Overview

PRD opisuje nowe siatki, alejki, losowanie i położenie mety. Wydruk próbny z dziećmi potwierdza, że karty są odrobinę trudniejsze.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: Tabela poziomów labiryntu i zdania o starcie i mecie odpowiadają nowemu generatorowi.

**Contract**: Business Logic, tabela poziomów labiryntu: alejki ok. 21 / 17 / 15 / 13 / 10 / 6,6 mm, siatki z tabeli Desired End State, losowanie (Poziom 1 „krótka droga, dużo krótkich odnóg”, Poziomy 2–6 „kręta droga”), typowa droga z prototypu (ok. 22 / 48 / 74 / 102 / 173 / 386 komórek). Zdania o dwóch poziomach dzielących alejkę i o krótkim poziomie przy tej samej alejce usunięte. Akapit o starcie i mecie: na Poziomach 1–5 start na środku górnej krawędzi, a meta w losowej kolumnie dolnej krawędzi, co najmniej 2 kolumny od środka. Nowe zdanie: generator wybiera z kilku losowań kartę z największą liczbą głębokich odnóg przy drodze i drogą najmniej trzymającą się środka. Te same zmiany w US-01 (Given/When/Then i Acceptance Criteria o „Meta” na środku dolnej krawędzi). Dopisek przy decyzji: 2026-10-30, GitHub 114, testy na 4-latku i 6-latku.

### Success Criteria:

#### Automated Verification:

- `npx prettier --check context/foundation/prd.md` przechodzi

#### Manual Verification:

- Wydruk próbny kilku kart z każdego poziomu: droga nie biegnie prosto w dół, są dłuższe ślepe uliczki i rozgałęzienia, a karty jednego poziomu mają podobną trudność
- Pierwsza karta po wejściu na `/maze` bez profilu (domyślny Poziom 3) nie zniechęca dziecka, które dziś robi Poziomy 1–3
- Próba z 4-latkiem: Poziomy 1–2 przechodzi, a Poziom 3 wymaga wyraźnie więcej uwagi niż dziś
- Próba z 6-latkiem: Poziomy 5–6 wymagają wyraźnie więcej uwagi niż dziś

---

## Testing Strategy

### Unit Tests:

- Tabela poziomów, cechy pojedynczej karty i cechy rozkładu na 200 ziarnach (Phase 1, punkt 4).
- `mazeForSheet` odrzuca złe wejście, metę spoza `exitColumns` i labirynt z dwiema drogami.
- Układ kartki dla każdej siatki i każdej kolumny mety (Phase 2, punkt 2).

### Integration Tests:

- Playwright: generowanie labiryntu, lista poziomów z nowym opisem, telefon.

### Manual Testing Steps:

1. Na `/maze` wygeneruj po 5 kart na każdym poziomie i obejrzyj drogę od startu.
2. Wydrukuj po 2 karty z każdego poziomu i sprawdź marginesy.
3. Daj karty dzieciom w tym samym wieku co w testach z 2026-10-30.

## Performance Considerations

20 losowań z oceną na Poziomie 6 trwa w prototypie ok. 34 ms, czyli daleko od limitu 5 s. Ocena przechodzi drogę i jej poddrzewa raz na kandydata.

## Migration Notes

Identyfikatory poziomów (`lat3` … `nastolatek`) się nie zmieniają, więc profile i ostatnie parametry wczytują się bez migracji. Labirynty nie są zapisywane, więc nie ma starych kart z dawną metą.

## References

- Frame: `context/changes/gh114-maze-too-easy/frame.md`
- Generator: `src/lib/maze/generate.ts:22-33`, `71-119`; poziomy: `src/lib/maze/levels.ts:28-107`
- Kartka: `src/components/WorksheetGenerator.tsx:256-339`, `src/lib/sheet/layout.ts:42-104`
- Miniatura: `scripts/build-thumbnails.mjs:58-77`
- Poprzednie zmiany: `context/archive/2026-10-11-winding-maze-path/plan.md`, `context/archive/2026-10-16-random-maze-generator/plan.md`
- GitHub 114: „Labirynty: odrobinę trudniejsze na każdym poziomie”

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Generator i tabela poziomów

#### Automated

- [x] 1.1 `npm test` przechodzi z nowymi testami generatora — 8248f63
- [x] 1.2 `npm run lint` przechodzi — 8248f63
- [x] 1.3 `npx astro check` przechodzi — 8248f63
- [x] 1.4 Jedno wywołanie `generateMaze("nastolatek", …)` trwa poniżej 500 ms w teście czasu na 20 ziarnach — 8248f63
- [x] 1.5 Zawężony Stryker na `scoreMaze` i `generateMaze` uruchomiony, a przeżyłe mutanty przejrzane — 8248f63

#### Manual

- [x] 1.6 Na `/maze` w `npm run dev` po 5 kart z każdego poziomu: droga nie biegnie prosto w dół przy środku — 8248f63

### Phase 2: Kartka, miniatura i e2e

#### Automated

- [x] 2.1 `npm test` przechodzi
- [x] 2.2 `npm run lint` przechodzi
- [x] 2.3 `npx astro check` przechodzi
- [x] 2.4 `npm run build` przechodzi
- [ ] 2.5 Playwright na projektach Chromium (`chromium`, `phone-360`, `pixel-7`, `tablet-768`) przechodzi

#### Manual

- [x] 2.6 Na `/maze` każdy poziom generuje kartę z metą poza środkiem (Poziomy 1–5) i z postacią na środku wejścia
- [x] 2.7 Podgląd wydruku w Chrome każdego poziomu to jedna strona A4, a ściany i ramka zachowują margines 10 mm
- [x] 2.8 Na telefonie (np. `phone-360`) Generuj i Drukuj nie nachodzą na siebie, a karta mieści się na A4
- [x] 2.9 Miniatura w katalogu na `/` pokazuje nowy labirynt

### Phase 3: PRD i wydruk próbny

#### Automated

- [ ] 3.1 `npx prettier --check context/foundation/prd.md` przechodzi

#### Manual

- [ ] 3.2 Wydruk próbny kilku kart z każdego poziomu: droga nie biegnie prosto w dół, są dłuższe ślepe uliczki i rozgałęzienia, a karty jednego poziomu mają podobną trudność
- [ ] 3.3 Pierwsza karta po wejściu na `/maze` bez profilu (domyślny Poziom 3) nie zniechęca dziecka, które dziś robi Poziomy 1–3
- [ ] 3.4 Próba z 4-latkiem: Poziomy 1–2 przechodzi, a Poziom 3 wymaga wyraźnie więcej uwagi niż dziś
- [ ] 3.5 Próba z 6-latkiem: Poziomy 5–6 wymagają wyraźnie więcej uwagi niż dziś
