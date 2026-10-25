# Nonogram — pierwsza drukowalna karta (S-22) Implementation Plan

## Overview

Nowy rodzaj karty „Nonogram” pod `/nonogram`: rodzic klika Generuj i dostaje kartę A4 z pustą kratką 12×15, liczbami przy wierszach i nad kolumnami; rozwiązaniem jest cała sylwetka obiektu z szablonów symetrii (połowa 6×15 + odbicie, bez kolorów, dziury puste). Karta jest pokazana tylko wtedy, gdy liczby wyznaczają dokładnie ten jeden obrazek bez zgadywania. Realizuje US-15 i FR-024 (PRD), slice S-22 roadmapy, issue drpc1/printo-kids#93.

## Current State Analysis

- Szablony obiektów żyją w `src/lib/symmetry/templates.ts`, dostępne przez `symmetryTemplatesFor(levelId)` (`templates.ts:502`): `lat4` → połowy 4×12, `lat5`/`lat6` → 6×15, `lat7` → 9×24. Katalog 6×15 daje 20 wariantów (rakieta 8, robot 8, truskawka 4).
- Składanie szablonu z wariantami części i klucz karty: `composeSymmetryCard` (`src/lib/symmetry/generate.ts:77-105`); pętla „inna niż poprzednia” z `MAX_ATTEMPTS = 20` (`generate.ts:37-58`).
- Wzorzec strony: `src/components/SymmetryGenerator.tsx` + `src/pages/symetria.astro`; układ kartki z rzucaniem przy przekroczeniu marginesu: `src/lib/symmetry/layout.ts:29`; stałe rysunku dla strony i miniatury: `src/lib/symmetry/sheet.ts`.
- Rejestracja rodzaju karty: `src/lib/cards.ts`, `scripts/build-thumbnails.mjs` → `public/thumbnails/`, `src/lib/sheet/print-contract.test.ts`, `scripts/smoke.mjs`, skrypt `test` w `package.json`.
- Sonda z research (`research.md`): propagacja linii rozwiązuje w całości każdy z 80 wariantów (8×12: 20, 12×15: 20, 18×24: 40), najdłużej 31,6 ms na wariant.

## Desired End State

- Katalog na `/` ma kafelek „Nonogram” z miniaturą pustej karty z liczbami; klik otwiera `/nonogram`.
- `/nonogram`: róg profilu, przed kartą przycisk Generuj; po karcie pasek z przełącznikiem „Pokaż rozwiązanie”, Generuj i Drukuj; poniżej karta SVG A4. Bez paska „Postać”, bez wyboru rozmiaru.
- Karta: polecenie „Zamaluj kratki według liczb. Co się ukryło?”, kratka 12×15 po 12 mm, pogrubione liczby 6 mm z lewej każdego wiersza i nad każdą kolumną (pusty wiersz/kolumna: 0), grubsza linia co 5 kratek od lewej i od góry, gruba ramka. Nazwa obiektu nigdzie na karcie.
- „Pokaż rozwiązanie” (domyślnie wyłączone) zamalowuje sylwetkę tylko na ekranie; druk zawsze pusty. Przełączenie nie generuje nowej karty.
- Każde Generuj daje inny klucz (obiekt albo wariant) niż poprzednia karta.
- Druk: jedna strona A4, nic poza marginesem 10 mm; na telefonie Generuj i Drukuj nie nachodzą na siebie.
- Solver i układ kartki są przetestowane także dla 8×12 i 18×24 (pod S-24).

### Key Discoveries:

- Na siatce 12×15 szablon 6×15 wypełnia ramkę bez przesunięcia (`templates.ts:66-183`), więc obraz = szablon + odbicie `col → 11 - col`.
- Dziury zostają puste same: to kratki „.” szablonu; `findHoles`/`holeColor` dotyczą tylko kolorów symetrii.
- `ROBOT_7` ma 23 wiersze (`templates.ts:352-356`): na 18×24 jeden wiersz ma liczbę 0 — przypadek do testu.
- Najwięcej liczb w wariantach 12×15: 5 przy wierszu, 4 nad kolumną (sonda makiety).

## What We're NOT Doing

- Wybór rozmiaru na pasku i strony 8×12 / 18×24 (S-24). Rozmiary istnieją tylko w kodzie i testach.
- Wybór kategorii obiektów (S-26) i nowe obiekty (S-21).
- Zmiana formatu lub eksportów `src/lib/symmetry/templates.ts` (równolegle zmienia go S-21).
- Kolory na nonogramie, rozwiązanie na wydruku, zapis ustawień w profilu lub w ostatnich parametrach.
- Nonogram z postaciami z katalogu labiryntu.
- Solver ze zgadywaniem: karta, której nie rozwiąże sama propagacja linii, odpada (decyzja planu), nawet jeśli ma jedno rozwiązanie.

## Implementation Approach

Logika w nowym katalogu `src/lib/nonogram/` jak przy innych kartach, czysta i z wstrzykiwanym `random`. Rozmiary to tabela odwzorowująca rozmiar na zestaw szablonów symetrii (`mały → lat4`, `średni → lat5`, `duży → lat7`), więc nowe obiekty z S-21 przyjdą same. Solver to propagacja linii (każda linia: które kratki muszą być zamalowane / puste przy danych liczbach i znanych kratkach) do punktu stałego; karta przechodzi, gdy propagacja wyznacza każdą kratkę i wynik równa się sylwetce. Propagacja linii jest poprawna logicznie, więc pełne wyznaczenie oznacza dokładnie jedno rozwiązanie i brak zgadywania. Strona kopiuje układ `SymmetryGenerator` bez poziomu i kolorów, z jednym przełącznikiem.

## Critical Implementation Details

- **Druk bez rozwiązania**: zamalowane kratki rozwiązania rysuje osobna grupa SVG z klasą `print:hidden`, renderowana tylko przy włączonym przełączniku; test kontraktu druku sprawdza tę klasę, żeby przełącznik zostawiony włączony nie trafił na papier.

## Phase 1: Logika nonogramu

### Overview

Rozmiary, obraz z szablonu, liczby, solver i generator, z testami na wszystkich wariantach trzech rozmiarów.

### Changes Required:

#### 1. Rozmiary

**File**: `src/lib/nonogram/sizes.ts`

**Intent**: Jedna tabela rozmiarów, żeby S-24 dodał tylko wybór na pasku. Strona S-22 używa `sredni`.

**Contract**: `NonogramSizeId = "maly" | "sredni" | "duzy"`; `NonogramSize { id, label, columns, rows, cellSize, digitSize, templateLevel: SymmetryLevelId }`; wartości: mały 8×12, 14 mm, cyfry 6, `lat4`; średni 12×15, 12 mm, cyfry 6, `lat5`; duży 18×24, 7 mm, cyfry 5, `lat7`; `DEFAULT_NONOGRAM_SIZE_ID = "sredni"`; `nonogramSizeById`.

#### 2. Obraz i liczby

**File**: `src/lib/nonogram/clues.ts`

**Intent**: Obraz z szablonu (base + wybrane warianty części + odbicie, wyśrodkowany w poziomie jak w symetrii, od górnego wiersza) i liczby wierszy/kolumn.

**Contract**: `nonogramImage(template, variants, size): boolean[][]` (wiersze × kolumny; rzuca dla szablonu większego niż połowa siatki); `lineClue(cells: readonly boolean[]): number[]` (pusta linia → `[0]`); `nonogramClues(image): { rows: number[][]; columns: number[][] }`.

#### 3. Solver

**File**: `src/lib/nonogram/solve.ts`

**Intent**: Wyznaczenie obrazu z samych liczb propagacją linii; wynik mówi, czy każda kratka jest wyznaczona.

**Contract**: `solveLine(known: readonly CellState[], clue: readonly number[]): CellState[] | null` (`CellState = "filled" | "empty" | "unknown"`, null przy sprzeczności); `solveNonogram(clues, columns, rows): { status: "solved"; image: boolean[][] } | { status: "stuck" } | { status: "contradiction" }`.

#### 4. Generator i reguły

**File**: `src/lib/nonogram/generate.ts`

**Intent**: Losuje szablon i warianty z zestawu rozmiaru, odrzuca karty łamiące reguły i równe poprzedniej, jak `generateSymmetryCard`.

**Contract**: `NonogramCard { sizeId, columns, rows, cellSize, solution: boolean[][], clues, key }`, klucz `rozmiar:szablon:warianty` (bez nazwy obiektu w UI); `composeNonogramCard(template, variants, size)`; `nonogramCardProblems(card): NonogramProblem[]` z `"no-filled-cell" | "clue-mismatch" | "not-line-solvable" | "solution-mismatch"`; `generateNonogramCard(random, previousKey, size): NonogramCard | null` z `MAX_ATTEMPTS = 20`; `nonogramVariants(size)` wylicza wszystkie kombinacje wariantów (dla testów i notatki w PR).

#### 5. Testy

**File**: `src/lib/nonogram/clues.test.ts`, `src/lib/nonogram/solve.test.ts`, `src/lib/nonogram/generate.test.ts`, `package.json`

**Intent**: Liczby (pusta linia, kilka ciągów, odbicie symetryczne), solver na małych przypadkach (jednoznaczny, niejednoznaczny 2×2 po przekątnej → `stuck`, sprzeczny → `contradiction`), dla każdego rozmiaru każdy wariant przechodzi albo odpada zgodnie z regułami, przynajmniej jeden wariant każdego rozmiaru przechodzi, każdy szablon rozmiaru średniego ma co najmniej jeden przechodzący wariant (żeby obiekt z S-21, który nigdy nie wyjdzie na nonogramie, zaczerwienił CI), przejście wszystkich wariantów rozmiaru trwa poniżej 5 s, dziury zostają puste w rozwiązaniu (np. okno rakiety), pusty wiersz robota 18×24 ma liczbę `[0]`, kolejne Generuj z `previousKey` daje inny klucz. Liczba wariantów z jednym rozwiązaniem trafia do `t.diagnostic`.

**Contract**: nowe pliki dopisane do skryptu `test` w `package.json`.

### Success Criteria:

#### Automated Verification:

- Testy nonogramu przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`

**Implementation Note**: Po fazie automatycznej przejdź dalej; ta faza nie ma kroków ręcznych.

---

## Phase 2: Układ kartki

### Overview

Pozycje polecenia, pasów liczb i kratki na A4, z rzucaniem przy przekroczeniu marginesu.

### Changes Required:

#### 1. Stałe rysunku

**File**: `src/lib/nonogram/sheet.ts`

**Intent**: Jedno źródło stałych dla strony i miniatury, jak `SYMMETRY_SHEET`.

**Contract**: `NONOGRAM_SHEET { pageWidth: 210, pageHeight: 297, inset: 10, instructionSize: 7, instructionGap: 6, instructionText: "Zamaluj kratki według liczb. Co się ukryło?", gridStroke: 0.3, blockStroke: 0.8, frameStroke: 0.8, blockEvery: 5, clueGap: 2, clueSlot: 1.1 /* × digitSize */ }`.

#### 2. Układ

**File**: `src/lib/nonogram/layout.ts`

**Intent**: Liczy szerokość pasa liczb wierszy z najdłuższej listy, wysokość pasa nad kolumnami z najdłuższej listy, centruje blok na stronie i rzuca, gdy nie mieści się w marginesie.

**Contract**: `layoutNonogramSheet(input: { columns, rows, cellSize, digitSize, maxRowClues, maxColumnClues, ...NONOGRAM_SHEET page fields }): { page, instruction: {x,y}, grid: {x,y,width,height}, rowClueX(index), columnClueY(index) }` — pozycje liczb: przy wierszu wyrównane do prawej przy kratce, nad kolumną wyrównane do dołu przy kratce; `blockLines(count)` zwraca indeksy grubszych linii (0, 5, 10, …, count).

#### 3. Testy

**File**: `src/lib/nonogram/layout.test.ts`, `package.json`

**Intent**: Dla każdego rozmiaru i najdłuższych list liczb z jego wariantów cały blok mieści się w 10 mm; za duże ustawienie rzuca; grubsze linie co 5 (12 kolumn → 0, 5, 10, 12). Punkt odniesienia z review planu (blok liczby + kratka): 12×15 po 12 mm, cyfry 6 → ok. 179×221 mm; 18×24 po 7 mm, cyfry 5 → ok. 161×211 mm; 8×12 po 14 mm, cyfry 6 → ok. 134×151 mm; dostępne 190×277 mm.

### Success Criteria:

#### Automated Verification:

- Testy układu przechodzą: `npm test`
- Lint przechodzi: `npm run lint`

---

## Phase 3: Strona i katalog

### Overview

Strona `/nonogram`, kafelek w katalogu, miniatura, kontrakt druku i smoke.

### Changes Required:

#### 1. Komponent strony

**File**: `src/components/NonogramGenerator.tsx`

**Intent**: Kopia przepływu `SymmetryGenerator` bez poziomu i kolorów: `useChildProfileVisit` + `ProfileCorner`, przełączanie klas `#worksheet-home`, przed kartą przycisk „hero”, po karcie pasek z `Switch` „Pokaż rozwiązanie”, Generuj „quiet” i Drukuj; komunikat „Nie udało się ułożyć karty.” przy `null`. Rozmiar stały `sredni`.

**Contract**: oba kontenery kontrolek z `print:hidden`; SVG z klasami jak symetria (`print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0`), `aria-label="Nonogram"`, kolory tylko `var(--foreground)` i `var(--card)`; grupa rozwiązania z klasą `print:hidden` rysowana tylko przy włączonym przełączniku.

#### 2. Strona

**File**: `src/pages/nonogram.astro`

**Intent**: `Layout` + `GeneratorShell description="Wygeneruj nonogram i wydrukuj go na kartce A4."` + `<NonogramGenerator client:only="react" />`.

#### 3. Katalog i miniatura

**File**: `src/lib/cards.ts`, `scripts/build-thumbnails.mjs`, `public/thumbnails/nonogram.svg`

**Intent**: Piąty rodzaj `{ id: "nonogram", title: "Nonogram", href: "/nonogram", thumbnail: "/thumbnails/nonogram.svg" }`; miniatura z prawdziwego generatora i układu ze stałym ziarnem, pusta karta z liczbami (bez rozwiązania).

#### 4. Kontrakt druku i smoke

**File**: `src/lib/sheet/print-contract.test.ts`, `scripts/smoke.mjs`

**Intent**: Testy jak dla symetrii: SVG 210×297 mm z `overflow-hidden`, `printColorAdjust`, `print:hidden` na kontrolkach, strona przez `GeneratorShell` z `client:only="react"`, grupa rozwiązania ukryta w druku. Lista klas z `print:hidden` w `NonogramGenerator.tsx` ma trzy pozycje: dwa kontenery kontrolek (jak w symetrii) i grupę rozwiązania. Smoke: `/nonogram` zwraca 200 i zdanie strony.

### Success Criteria:

#### Automated Verification:

- Wszystkie testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- Miniatury budują się bez zmian w pozostałych plikach: `npm run thumbnails`

#### Manual Verification:

- Kafelek „Nonogram” w katalogu otwiera `/nonogram`, a link „Wszystkie karty” wraca
- Generuj pokazuje kartę 12×15 z liczbami, kolejne Generuj zmienia kartę, „Pokaż rozwiązanie” zamalowuje sylwetkę bez zmiany karty
- Podgląd wydruku (desktop Chrome) to jedna strona A4 bez rozwiązania, także z włączonym przełącznikiem
- Na telefonie (widok 375 px) Generuj i Drukuj nie nachodzą na siebie, karta mieści się w szerokości

**Implementation Note**: Po automatycznej weryfikacji zatrzymaj się na ręczne potwierdzenie od użytkowniczki.

---

## Phase 4: Dokumentacja

### Overview

PRD i roadmapa zgodne z decyzjami tej zmiany.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: Tabela „Karta nonogramu”: średni 12 mm (decyzja z makiety 2026-10-25), grubsza linia co 5 kratek, cyfry 6 mm; reguła „bez zgadywania” obok „dokładnie jedno rozwiązanie”; US-15 dopuszcza podgląd rozwiązania tylko na ekranie; Open Questions 11 z liczbą wariantów 12×15, które przechodzą.

### Success Criteria:

#### Automated Verification:

- Prettier nie zmienia plików Markdown: `npx prettier --check context/foundation/prd.md context/changes/nonogram-first-printable`

---

## Testing Strategy

### Unit Tests:

- Liczby: pusta linia, linia pełna, kilka ciągów, symetria liczb kolumn (kolumna `c` i `columns-1-c` mają te same liczby).
- Solver: jednoznaczny, niejednoznaczny (stuck), sprzeczny (contradiction), czas < 5 s na wszystkich wariantach każdego rozmiaru.
- Generator: klucz różny od poprzedniego, `null` gdy jedyny wariant równa się poprzedniemu, dziury puste, pusty wiersz → `[0]`.
- Układ: każdy rozmiar w marginesie, rzucanie przy przekroczeniu.

### Integration Tests:

- Kontrakt druku (pliki źródłowe) i smoke HTTP.

### Manual Testing Steps:

1. `npm run dev`, katalog → Nonogram → Generuj kilka razy.
2. Włącz „Pokaż rozwiązanie”, sprawdź sylwetkę i podgląd wydruku (pusty).
3. Widok telefonu 375 px: przyciski i karta.

## Performance Considerations

Propagacja linii: najdłużej ok. 32 ms na wariant w sondzie; generator robi najwyżej 20 prób, więc daleko od 5 s.

## Migration Notes

Brak: nowa strona, bez danych na urządzeniu.

## References

- Research: `context/changes/nonogram-first-printable/research.md`
- Wzorzec: `src/components/SymmetryGenerator.tsx`, `src/lib/symmetry/generate.ts:37-105`, `src/lib/symmetry/layout.ts:29`
- PRD: US-15, FR-024, Business Logic „Karta nonogramu”, Open Questions 11
- Roadmapa: S-22 (`context/foundation/roadmap.md`)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Logika nonogramu

#### Automated

- [x] 1.1 Testy nonogramu przechodzą: `npm test` — 8ff9ac2
- [x] 1.2 Lint przechodzi: `npm run lint` — 8ff9ac2
- [x] 1.3 Typy przechodzą: `npx astro check` — 8ff9ac2

### Phase 2: Układ kartki

#### Automated

- [x] 2.1 Testy układu przechodzą: `npm test` — a017c37
- [x] 2.2 Lint przechodzi: `npm run lint` — a017c37

### Phase 3: Strona i katalog

#### Automated

- [x] 3.1 Wszystkie testy przechodzą: `npm test` — 08a3919
- [x] 3.2 Lint przechodzi: `npm run lint` — 08a3919
- [x] 3.3 Typy przechodzą: `npx astro check` — 08a3919
- [x] 3.4 Build przechodzi: `npm run build` — 08a3919
- [x] 3.5 Miniatury budują się bez zmian w pozostałych plikach: `npm run thumbnails` — 08a3919

#### Manual

- [x] 3.6 Kafelek „Nonogram” w katalogu otwiera `/nonogram`, a link „Wszystkie karty” wraca — 08a3919
- [x] 3.7 Generuj pokazuje kartę 12×15 z liczbami, kolejne Generuj zmienia kartę, „Pokaż rozwiązanie” zamalowuje sylwetkę bez zmiany karty — 08a3919
- [x] 3.8 Podgląd wydruku (desktop Chrome) to jedna strona A4 bez rozwiązania, także z włączonym przełącznikiem — 08a3919
- [x] 3.9 Na telefonie (widok 375 px) Generuj i Drukuj nie nachodzą na siebie, karta mieści się w szerokości — 08a3919

### Phase 4: Dokumentacja

#### Automated

- [x] 4.1 Prettier nie zmienia plików Markdown: `npx prettier --check context/foundation/prd.md context/changes/nonogram-first-printable` — 03ba441
