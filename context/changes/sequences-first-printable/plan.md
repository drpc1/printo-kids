# Karta sekwencji na A4 (S-16) Implementation Plan

## Overview

Nowa strona `/sekwencje` w katalogu kart. Rodzic klika Generuj i dostaje kartę A4 z poleceniem „Co pasuje w puste pole? Uzupełnij.” i sześcioma ciągami po 7 pól, jeden pod drugim. Pola mają obrysy kształtów (koło, kwadrat, trójkąt, gwiazdka). W każdym ciągu brakuje jednego albo dwóch elementów, a dziecko dorysowuje je w pustych polach. Każdy ciąg ma dokładnie jedną odpowiedź, a generator sprawdza ją przed pokazaniem karty. Karta drukuje się jako jedna strona A4 z marginesem 10 mm, także z telefonu. Strona ma ten sam profil dziecka w rogu co labirynt i symetria. Pierwsza wersja ma jedno stałe ustawienie: wiersz „5 lat” z PRD. Poziomy dochodzą w S-17.

## Current State Analysis

- Katalog: `CARD_KINDS` z dwoma wpisami (`src/lib/cards.ts:8-11`), rysowany przez `src/components/CardCatalog.astro`. Miniatury to statyczne SVG w `public/thumbnails/`, budowane z prawdziwych generatorów ze stałym ziarnem (`scripts/build-thumbnails.mjs`, sekcja symetrii `:88-153`).
- Strona generatora: `src/pages/symetria.astro` (11 linii) wkłada wyspę `client:only="react"` do `GeneratorShell` z jednym zdaniem opisu. `GeneratorShell.astro` ma jedyny `@page` i drukuje każdy `svg` w `#worksheet-home`. Klasę `has-sheet` przełącza wyspa (`src/components/SymmetryGenerator.tsx:40-48`).
- Wzorzec wyspy: `SymmetryGenerator.tsx`. Profil przez `useChildProfileVisit` (`:28-30`), `GenerateButton` i `ACTION_BUTTON_CLASS` (`:18-19,157-180`). Duży Generuj na starcie, potem pasek Generuj/Drukuj (`:117-151`). Komunikat „Nie udało się ułożyć karty.”, gdy generator zwraca `null` (`:15,50-58`). Karta to `<svg viewBox="0 0 210 297">` z klasami druku (`:199-207`) i kolorami `var(--card)` / `var(--foreground)`.
- Wzorzec logiki: `src/lib/symmetry/`. Generator dostaje `random: () => number` i `previousKey`, a kartę zwraca dopiero, gdy walidator nie zgłasza problemów (`generate.ts:42-62`). Stałe rysunku są w `sheet.ts`, a czysty układ w `layout.ts`, który rzuca, gdy ustawienie nie mieści się w marginesie (`layout.ts:30-55`).
- Kontrakty: `print-contract.test.ts` czyta klasy z zapisu `className={cn("…")}` (`:160-175`) i ma testy symetrii (`:80-111`). Smoke sprawdza `/`, `/labirynt` i `/symetria` (`scripts/smoke.mjs:17-35`). `npm test` wylicza pliki testów jawnie (`package.json`, skrypt `test`). E2E: `tests/e2e/catalog.spec.ts` (katalog → generator → „Wszystkie karty”) i `tests/e2e/phone-layout.spec.ts:95-120` (Generuj, Drukuj i Profil nie nachodzą na siebie na `/symetria`).
- Brakuje: logiki sekwencji, strony, wyspy, miniatury i testów.
- Równolegle idzie S-18 (sudoku, worktree `picture-sudoku-worksheet-da47fb`). Dotknie tych samych wspólnych plików: `cards.ts`, `build-thumbnails.mjs`, `smoke.mjs`, `print-contract.test.ts`, skryptu `test`, `catalog.spec.ts` i `phone-layout.spec.ts`.

## Desired End State

- Katalog na `/` ma miniaturę „Sekwencje” (z prawdziwego generatora), która prowadzi na `/sekwencje`.
- Na `/sekwencje` jest najpierw duży Generuj. Po kliknięciu pojawia się karta i pasek z Generuj i Drukuj, bez przycisku poziomu. Każde kolejne Generuj daje kartę inną niż ta na ekranie.
- Karta: na górze polecenie „Co pasuje w puste pole? Uzupełnij.”, pod nim 6 wierszy po 7 pól, bez numerów wierszy. Pola wypełniają szerokość wiersza (około 23 mm każde). Każde pole ma cienką ramkę. Wypełnione pole ma obrys kształtu, a puste pole ma ramkę przerywaną i mały „?” w prawym górnym rogu, poza środkiem pola. Wszystko jest w marginesie 10 mm, a druk jest czarny i bez odpowiedzi.
- Na karcie każdy z trzech wzorów (AB, AAB, ABC) pojawia się co najmniej raz, a kolejność wierszy jest losowa. Dokładnie 3 wiersze mają jedną lukę, a 3 mają dwie. Luka jest zawsze w polu 7. Druga luka, jeśli jest, leży w polu 5 albo 6. Wzór jest widoczny w całości przed pierwszą luką. Dwa wiersze karty nigdy nie są identyczne.
- Ten sam `ProfileCorner` co na pozostałych stronach. Karta sekwencji nie zależy od profilu.
- Labirynt i symetria działają bez zmian.
- Sprawdzenie: `npm test`, `npm run lint`, `npx astro check`, `npm run build`, `npm run smoke` na podglądzie, lokalne e2e i ręczny podgląd druku.

### Key Discoveries:

- Polecenie musi być `<text>` w SVG, bo HTML `p` znika w druku (`src/components/GeneratorShell.astro`, blok `@media print`).
- Margines 10 mm leży w SVG, nie w `@page` (wzorzec `layoutSymmetrySheet`, `src/lib/symmetry/layout.ts:30-55`).
- Szerokość: 7 pól i 6 odstępów po 0,2 pola daje 8,2 pola na 190 mm, czyli pole około 23,2 mm. Wysokość: 6 wierszy w około 264 mm pod poleceniem daje mniej więcej 44 mm na wiersz, więc szerokość jest ograniczeniem. Przy 5 polach (4 lata w S-17) ten sam wzór daje około 32,8 mm, zgodnie z decyzją „krótszy ciąg, większe pole”.
- Klasy druku muszą być zapisane jako `className={cn("…")}`, żeby `print-contract.test.ts` je czytał (`:160-175`).
- Plan testów, ryzyko 7: wyrocznia w teście nie może używać kodu, który rozwiązuje kartę (`context/foundation/test-plan.md`). Tutaj wyrocznią jest pełne przeszukanie wszystkich wypełnień luk, niezależne od walidatora.

## What We're NOT Doing

- Poziomy sekwencji, przycisk poziomu, liczby, ciągi rosnące i malejące, rosnące grupy i ciągi mieszane. To S-17, które też rozszerzy walidator o reguły liczbowe.
- Ostatnie parametry sekwencji w `localStorage` i pola profilu właściwe dla sekwencji (S-14, poza M-3). Okno profilu na `/sekwencje` pokazuje te same pola co dziś (postać i poziom labiryntu), tak jak na `/symetria`.
- Numery wierszy (decyzja użytkownika: bez numerów).
- Wzory przesunięte w fazie (np. start od ABA). Ciąg zawsze zaczyna się od początku wzoru.
- Odpowiedzi na kartce i podgląd odpowiedzi na ekranie.
- Pasek „Postać” i zmiana `<title>`.
- Marginesy drukarki iOS poza tym, co powłoka już robi.

## Implementation Approach

Ten sam podział co przy symetrii. Czysta logika w `src/lib/sequence/` dostaje źródło losowości, więc ta sama funkcja zasila stronę, testy i miniaturę ze stałym ziarnem. Walidator wylicza odpowiedź tylko z widocznych pól i zgłasza problem, gdy do luk pasuje zero albo więcej niż jedna odpowiedź. Sprawdza każdy powtarzający się wzór o długości od 1 do połowy ciągu (przy 7 polach: 1, 2 i 3), nie tylko trzy wzory losowane. Wyspa `SequenceGenerator` rysuje kartę jako SVG 210×297 w `GeneratorShell`. Geometria kształtów jest w jednym module, który czyta też skrypt miniatur, więc miniatura nie rozjedzie się z wydrukiem.

Kolejność faz wynika z decyzji o S-18. Fazy 1 i 2 dotykają tylko nowych plików. Wpisy we wspólnych plikach idą w fazie 3. Kto scala drugi, robi rebase i dopisuje swoje linie obok linii drugiej karty.

## Critical Implementation Details

- **Walidator nie ufa zapisanej odpowiedzi.** Wiersz trzyma pełny ciąg (`values`) i indeksy luk, ale walidator liczy odpowiedź tylko z pól poza lukami i porównuje ją z `values` w lukach. Inaczej wiersz z błędnie zapisaną odpowiedzią przeszedłby sprawdzenie.
- **Granice reguł luk są dokładne.** Przy `n = 7` (indeksy 0–6): jedna luka zawsze w indeksie `n − 1`. Druga, jeśli jest, w indeksie od `ceil(n / 2)` do `n − 2` (czyli 4 albo 5, pola 5–6 licząc od 1). Pierwsza luka ma indeks co najmniej równy długości wzoru (wzór widoczny w całości przed luką). Okresy sprawdzane w jednoznaczności: od 1 do `floor(n / 2)`.

## Phase 1: Logika karty sekwencji

### Overview

Kształty, wzory, generator wierszy i karty, walidator jednej odpowiedzi, układ A4 i stałe rysunku, z testami. Tylko nowe pliki w `src/lib/sequence/`.

### Changes Required:

#### 1. Ustawienie poziomu

**File**: `src/lib/sequence/levels.ts`

**Intent**: Jedno stałe ustawienie „5 lat” w kształcie, który S-17 rozszerzy o kolejne poziomy bez zmiany generatora.

**Contract**: `SequenceLevel { id: "lat5"; label: "5 lat"; fieldsPerRow: 7; rowCount: 6; patterns: readonly ["AB", "AAB", "ABC"]; twoGapRows: 3 }` oraz `SEQUENCE_LEVEL_LAT5` / `DEFAULT_SEQUENCE_LEVEL_ID = "lat5"`.

#### 2. Kształty

**File**: `src/lib/sequence/shapes.ts`

**Intent**: Lista czterech kształtów i ich geometria w jednym miejscu, czytana przez stronę i przez skrypt miniatur.

**Contract**: `type SequenceShape = "kolo" | "kwadrat" | "trojkat" | "gwiazdka"`, `SEQUENCE_SHAPES`, oraz `sequenceShapeOutline(shape, cx, cy, size)`, która zwraca opis prymitywu SVG (`{ kind: "circle", cx, cy, r }` albo `{ kind: "polygon", points }`) wpisanego w kwadrat `size`. Kształty mają podobną wielkość wizualną, tak żeby żaden nie wyglądał na „większy” element ciągu.

#### 3. Generator i walidator

**File**: `src/lib/sequence/generate.ts`

**Intent**: Losuje kartę 6 wierszy zgodną z decyzjami i zwraca ją dopiero wtedy, gdy walidator karty i każdego wiersza nie zgłasza problemów, a klucz różni się od poprzedniego.

**Contract**:

- `type SequencePattern = "AB" | "AAB" | "ABC"`.
- `SequenceRow { pattern; values: readonly SequenceShape[] /* pełny ciąg, długość n */; gaps: readonly number[] /* rosnące indeksy luk */ }`.
- `SequenceCard { levelId: "lat5"; fieldsPerRow: number; rows: readonly SequenceRow[]; key: string }`. Klucz opisuje każdy wiersz (wzór, kształty, luki), więc dwie karty o tym samym kluczu wyglądają tak samo.
- `generateSequenceCard(random, previousKey, level): SequenceCard | null`, z limitem prób jak `MAX_ATTEMPTS` w symetrii. Losowanie: każdy z trzech wzorów raz, pozostałe 3 wiersze z dowolnego wzoru, kolejność przetasowana. 3 losowe wiersze dostają drugą lukę (indeks 4 albo 5). Kształty jednostki wzoru są różne (AB: 2 różne, AAB: A ≠ B, ABC: 3 różne) i losowane z czterech.
- `sequenceAnswers(visible: readonly (SequenceShape | null)[], maxPeriod): { answers: readonly (readonly SequenceShape[])[]; undetermined: boolean }`. Bierze każdy okres `p` od 1 do `maxPeriod`, przy którym widoczne pola są zgodne (pola o tym samym `i mod p` są równe). Jeśli każda luka ma widoczne pole w tej samej klasie reszt, okres daje krotkę odpowiedzi dla luk; `answers` to różne takie krotki. Jeśli zgodny okres zostawia którąś lukę bez widocznego odpowiednika, `undetermined` jest `true`.
- `sequenceRowProblems(row, n)` zwraca listę z: `"wrong-length"`, `"unknown-shape"`, `"pattern-mismatch"` (`values` nie powtarza jednostki wzoru od indeksu 0 albo jednostka łamie regułę różnych kształtów), `"gap-count"` (nie 1–2), `"last-not-gap"`, `"second-gap-outside-second-half"`, `"gap-before-pattern-shown"`, `"no-answer"` (`answers` puste i `undetermined` fałszywe), `"ambiguous"` (`undetermined` albo więcej niż jedna krotka w `answers`), `"answer-mismatch"` (jedyna odpowiedź ≠ `values` w lukach).
- `sequenceCardProblems(card, level)` dodaje: `"row-count"`, `"missing-pattern"`, `"two-gap-row-count"` (≠ `twoGapRows`), `"duplicate-row"`.

#### 4. Stałe rysunku i układ A4

**Files**: `src/lib/sequence/sheet.ts`, `src/lib/sequence/layout.ts`

**Intent**: Stałe rysunku (wspólne dla strony i miniatury) i czysta funkcja, która rozmieszcza polecenie i siatkę pól na stronie oraz rzuca, gdy ustawienie nie mieści się w marginesie.

**Contract**:

- `SEQUENCE_SHEET`: `pageWidth: 210`, `pageHeight: 297`, `inset: 10`, `instructionSize`, `instructionGap`, `instructionText: "Co pasuje w puste pole? Uzupełnij."`, `fieldGapRatio: 0.2`, grubość ramki pola, grubość i kreska ramki pustego pola, grubość obrysu kształtu, skala kształtu w polu, wielkość „?”.
- `layoutSequenceSheet({ pageWidth, pageHeight, inset, fieldsPerRow, rowCount, fieldGapRatio, instructionHeight, instructionGap })` → `{ page, instruction: { x, y }, fieldSize, rows: { y; fields: { x; y }[] }[] }`. Szerokość pola: `innerWidth / (n + (n − 1) · ratio)`, ograniczona też wysokością. Wiersze rozłożone równo w pionie pod poleceniem, cały blok w marginesie. Rzuca, gdy blok nie mieści się w polu wewnątrz marginesu.

#### 5. Testy

**Files**: `src/lib/sequence/generate.test.ts`, `src/lib/sequence/layout.test.ts`

**Intent**: Pokazać, że każda karta z generatora ma w każdym wierszu dokładnie jedną odpowiedź, sprawdzoną niezależną wyrocznią, i że układ zostaje w marginesie.

**Contract**:

- Wyrocznia w teście: dla każdego wiersza przeszukuje wszystkie `4^luk` wypełnienia luk i liczy te, przy których pełny ciąg jest okresowy z jakimś `p ≤ floor(n / 2)`. Oczekuje dokładnie jednego wypełnienia, równego `values` w lukach. Nie importuje `sequenceAnswers`.
- Wiele ziaren (np. 500 kart z deterministycznego `mulberry32`): każda karta przechodzi `sequenceCardProblems`, ma 6 wierszy, każdy wzór, dokładnie 3 wiersze z dwiema lukami, lukę w indeksie 6, drugą lukę w 4 albo 5, brak duplikatów wierszy. Każdy wzór, każdy kształt i oba indeksy drugiej luki pojawiają się w próbie.
- `previousKey`: kolejna karta ma inny klucz niż poprzednia.
- Ręczne przypadki walidatora (wpisane literalnie, bez generatora). Każdy sprawdza, że lista problemów zawiera oczekiwany problem, a nie że jest nim cała lista, bo jeden zły wiersz może łamać kilka reguł naraz. Te przypadki to jedyna ochrona gałęzi `"ambiguous"` i `"gap-before-pattern-shown"`: przy „5 lat” (AB, AAB, ABC i luki w 4 albo 5 oraz 6) generator zawsze daje wiersze jednoznaczne, więc próba z ziaren tych gałęzi nie dotknie. Przypadki: widoczne pola `koło kwadrat koło ? ? ? ?` przy `maxPeriod = 3` → `sequenceAnswers` zwraca dwie różne odpowiedzi (okres 2: kwadrat koło kwadrat koło; okres 3: koło kwadrat koło koło), a wiersz z takimi lukami dostaje `"ambiguous"`; luka w indeksie 2 przy ABC → `"gap-before-pattern-shown"`; druga luka w indeksie 3 → `"second-gap-outside-second-half"`; brak luki w indeksie 6 → `"last-not-gap"`; błędna wartość w luce → `"answer-mismatch"`; jednostka AB z dwoma takimi samymi kształtami → `"pattern-mismatch"`.
- Układ: dla `lat5` pole ma około 23,2 mm, wszystkie pola i polecenie leżą w `[10, 200] × [10, 287]`, wiersze nie nachodzą na siebie, a 7 pól z odstępami wypełnia szerokość wewnątrz marginesu. Ustawienie, które się nie mieści (np. 20 wierszy), rzuca.

### Success Criteria:

#### Automated Verification:

- Testy logiki sekwencji przechodzą: `node --experimental-strip-types --test src/lib/sequence/generate.test.ts src/lib/sequence/layout.test.ts`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`

**Implementation Note**: Po fazie 1 i zielonej automatyce przejdź od razu do fazy 2. Faza nie ma kroków ręcznych.

---

## Phase 2: Strona `/sekwencje`

### Overview

Wyspa `SequenceGenerator` i strona `/sekwencje`. Tylko nowe pliki. Strona jest osiągalna po adresie, ale jeszcze nie z katalogu.

### Changes Required:

#### 0. Wspólny przycisk Generuj

**File**: `src/components/GenerateButton.tsx`

**Intent**: `GenerateButton` i `ACTION_BUTTON_CLASS` są dziś skopiowane w `WorksheetGenerator.tsx:23,177` i `SymmetryGenerator.tsx:18,157`. Sekwencje biorą je z jednego nowego pliku zamiast robić trzecią kopię. Labirynt i symetria zostają bez zmian w tej zmianie (pliki wspólne z S-18). Ich przepięcie to osobny krok.

**Contract**: eksport `ACTION_BUTTON_CLASS` (ten sam ciąg klas co w symetrii) i `GenerateButton({ onClick, tone: "hero" | "quiet", disabled, className? })`, zachowanie i wygląd jak `SymmetryGenerator.tsx:157-180`.

#### 1. Wyspa karty sekwencji

**File**: `src/components/SequenceGenerator.tsx`

**Intent**: Przepływ jak w `SymmetryGenerator`, bez przycisku poziomu i bez przełącznika kolorów: duży Generuj, potem pasek Generuj/Drukuj, karta pod spodem, `ProfileCorner` z `useChildProfileVisit` i komunikat przy `null` z generatora.

**Contract**:

- Przełącza `has-sheet`, `justify-start` i `justify-center` na `#worksheet-home` tak jak `SymmetryGenerator.tsx:40-48`.
- Generuj i Drukuj używają `GenerateButton` i `ACTION_BUTTON_CLASS` z `@/components/GenerateButton`.
- `generateSequenceCard(Math.random, card?.key ?? null, SEQUENCE_LEVEL_LAT5)`. Generuj czeka, gdy `waitingForChild`.
- Dokładnie dwie klasy z `print:hidden`, zapisane jako `className={cn("…")}`: `"flex w-full flex-col gap-3 print:hidden"` i `"flex flex-col items-center gap-6 print:hidden"`.
- `SequenceSheet`: `<svg viewBox="0 0 210 297" role="img" aria-label="Sekwencje">` z tymi samymi klasami druku co karta symetrii (`print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0`). Rysuje tło `var(--card)`, polecenie jako `<text>`, ramkę każdego pola, obrys kształtu w wypełnionym polu (z `sequenceShapeOutline`), przerywaną ramkę i mały „?” w prawym górnym rogu pustego pola. Kolor tylko `var(--foreground)`, bez wypełnień kształtów.

#### 2. Strona

**File**: `src/pages/sekwencje.astro`

**Intent**: Strona generatora na wzór `symetria.astro`.

**Contract**: `Layout title="PrintoKids" lang="pl"`, `GeneratorShell description="Wygeneruj kartę sekwencji i wydrukuj ją na kartce A4."`, wewnątrz `<SequenceGenerator client:only="react" />`.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- Testy produktu nadal przechodzą: `npm test`

#### Manual Verification:

- Na `npm run dev` pod `/sekwencje` duży Generuj pokazuje kartę z poleceniem i 6 wierszami po 7 pól. Kolejne Generuj daje inną kartę.
- Kształty są czytelnymi obrysami, a puste pole ma przerywaną ramkę i mały „?” w rogu, który nie wchodzi w środek pola.
- Podgląd druku w Chrome na komputerze pokazuje jedną stronę A4 bez paska, nagłówka i profilu, z marginesem co najmniej 10 mm.
- Profil w rogu działa jak na `/symetria` (wybór, tworzenie, pytanie o dziecko przy 2 profilach).

**Implementation Note**: Po fazie 2 i zielonej automatyce zatrzymaj się na ręczne potwierdzenie od człowieka, zanim zaczniesz fazę 3.

---

## Phase 3: Katalog, wspólne pliki i e2e

### Overview

Wpięcie sekwencji we wspólne pliki: katalog, miniatura, smoke, kontrakt druku, skrypt `test` i e2e. To jedyna faza, która może dać konflikty z S-18. Kto scala drugi, robi rebase i zostawia wpisy obu kart.

### Changes Required:

#### 1. Katalog i miniatura

**Files**: `src/lib/cards.ts`, `scripts/build-thumbnails.mjs`, `public/thumbnails/sekwencje.svg`

**Intent**: Trzecia miniatura w katalogu, zbudowana z prawdziwego generatora i układu.

**Contract**: wpis `{ id: "sekwencje", title: "Sekwencje", href: "/sekwencje", thumbnail: "/thumbnails/sekwencje.svg" }` po symetrii. Skrypt dostaje sekcję sekwencji z własnym stałym ziarnem, która rysuje te same elementy co `SequenceSheet` (ze `SEQUENCE_SHEET` i `sequenceShapeOutline`) w dosłownej czerni. `npm run thumbnails` dwa razy z rzędu daje identyczne pliki.

#### 2. Smoke i kontrakt druku

**Files**: `scripts/smoke.mjs`, `src/lib/sheet/print-contract.test.ts`

**Intent**: Smoke sprawdza, że `/sekwencje` odpowiada 200 ze zdaniem opisu. Kontrakt druku sprawdza klasy SVG sekwencji, dokładnie dwie klasy `print:hidden` i to, że strona używa powłoki z wyspą `client:only="react"`.

**Contract**: krok smoke `"sekwencje renders the worksheet sentence"`; w kontrakcie stałe `SEQUENCE_PAGE` i `SEQUENCE_GENERATOR` oraz trzy testy na wzór testów symetrii (`print-contract.test.ts:80-111`), bez testu kolorów.

#### 3. Skrypt testów

**File**: `package.json`

**Intent**: `npm test` uruchamia testy sekwencji.

**Contract**: skrypt `test` dostaje `src/lib/sequence/generate.test.ts src/lib/sequence/layout.test.ts`.

#### 4. Ryzyko w planie testów

**File**: `context/foundation/test-plan.md`

**Intent**: Ryzyko „ciąg sekwencji wygląda na gotowy, a do luki pasuje zero albo więcej niż jedna odpowiedź” dostaje wiersz w mapie ryzyk i w „Risk Response Guidance”, tak jak ryzyko 7 symetrii. Od niego zależy, gdzie wolno uruchamiać testy mutacyjne (AGENTS.md).

**Contract**: nowy numer ryzyka, kolejny po ostatnim na `main` w chwili scalania. S-18 też dopisze ryzyko, więc kto scala drugi, bierze następny numer. Ochrona: wyrocznia przeszukująca luki w `src/lib/sequence/generate.test.ts`.

#### 5. E2E

**Files**: `tests/e2e/catalog.spec.ts`, `tests/e2e/phone-layout.spec.ts`

**Intent**: Te same ochrony co dla symetrii (US-04, US-05).

**Contract**:

- Katalog: link „Sekwencje” na `/` prowadzi na `/sekwencje`. Generuj pokazuje kartę (`role="img"`, nazwa „Sekwencje”), a „Wszystkie karty” wraca na `/`. Tylko projekt `chromium`, jak reszta testów katalogu.
- Telefon: na `/sekwencje` po Generuj nie ma przewijania w bok, a Generuj, Drukuj i Profil nie nachodzą na siebie. Ten sam wzorzec co `phone-layout.spec.ts:95-120`. Komentarz o pochodzeniu na górze plików dostaje `sequences-first-printable`.

### Success Criteria:

#### Automated Verification:

- Testy produktu przechodzą, razem z testami sekwencji: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- Miniatury są powtarzalne: po pierwszym `npm run thumbnails` pliki w `public/thumbnails` są w stage (`git add`), a po drugim `git diff --exit-code public/thumbnails` nie pokazuje zmian
- Smoke przechodzi na podglądzie: `npm run smoke`
- E2E katalogu i telefonu przechodzą: `npx playwright test tests/e2e/catalog.spec.ts tests/e2e/phone-layout.spec.ts`

#### Manual Verification:

- Miniatura „Sekwencje” w katalogu wygląda jak karta, czytelnie na telefonie (2 kolumny) i na komputerze.
- Druk z `/sekwencje` to jedna strona A4 z marginesem co najmniej 10 mm w Chrome, Edge, Brave, Firefox i Safari na komputerze.
- Druk z telefonu (Safari na iOS i Chrome na Androidzie) to jedna strona A4, a Generuj i Drukuj nie nachodzą na siebie.
- Wydrukowana karta: kształty i „?” czytelne, pole około 23 mm wystarcza 5-latkowi na dorysowanie kształtu.
- Labirynt i symetria działają jak przed zmianą.

**Implementation Note**: Po fazie 3 i zielonej automatyce zatrzymaj się na ręczne potwierdzenie od człowieka. Przy scalaniu po S-18 rozwiąż konflikty tak, żeby zostały wpisy obu kart.

---

## Testing Strategy

### Unit Tests:

- Wyrocznia przeszukująca wszystkie wypełnienia luk dla każdego wiersza wygenerowanych kart (ryzyko jednej odpowiedzi).
- Reguły karty: 6 wierszy, każdy wzór, dokładnie 3 wiersze z dwiema lukami, brak duplikatów, inny klucz niż poprzednia karta.
- Ręczne przypadki każdego problemu walidatora.
- Układ w marginesie 10 mm i rzucanie przy ustawieniu, które się nie mieści.

### Integration Tests:

- Kontrakt druku (klasy SVG, `print:hidden`, powłoka i `client:only`).
- Smoke `/sekwencje`.
- E2E: katalog → Sekwencje → karta → „Wszystkie karty”; układ telefonu.

### Manual Testing Steps:

1. `npm run dev`, wejdź na `/`, kliknij miniaturę „Sekwencje”.
2. Kliknij Generuj kilka razy; za każdym razem karta jest inna, a każdy wiersz ma jedną oczywistą odpowiedź.
3. Otwórz podgląd druku: jedna strona A4, bez paska i profilu, margines co najmniej 10 mm.
4. Powtórz na telefonie (Safari na iOS, Chrome na Androidzie) i w Brave.
5. Wydrukuj jedną kartę i sprawdź, czy 5-latek mieści rysunek w polu.

## Performance Considerations

Wiersz ma 7 pól i sprawdza najwyżej 3 okresy, a wyrocznia w testach co najwyżej `4^2` wypełnień. Losowanie z odrzucaniem trwa ułamek milisekundy, daleko od limitu 5 s.

## Migration Notes

Brak. Nowa strona i nowe pliki; zapisane profile i ostatnie parametry się nie zmieniają.

## References

- PRD: US-10, FR-019, Business Logic „Karta sekwencji” (`context/foundation/prd.md`)
- Roadmapa: S-16 (`context/foundation/roadmap.md`)
- Decyzje z makiety: `context/changes/sequences-first-printable/change.md`
- Wzorzec: `context/archive/2026-10-23-symmetry-first-printable/plan.md`, `src/components/SymmetryGenerator.tsx`, `src/lib/symmetry/generate.ts:42-62`, `src/lib/symmetry/layout.ts:30-55`
- Kontrakt druku: `src/lib/sheet/print-contract.test.ts:80-111,160-175`
- Plan testów, ryzyko 7: `context/foundation/test-plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Logika karty sekwencji

#### Automated

- [x] 1.1 Testy logiki sekwencji przechodzą: `node --experimental-strip-types --test src/lib/sequence/generate.test.ts src/lib/sequence/layout.test.ts` — 368f948
- [x] 1.2 Lint przechodzi: `npm run lint` — 368f948
- [x] 1.3 Typy przechodzą: `npx astro check` — 368f948

### Phase 2: Strona `/sekwencje`

#### Automated

- [x] 2.1 Lint przechodzi: `npm run lint`
- [x] 2.2 Typy przechodzą: `npx astro check`
- [x] 2.3 Build przechodzi: `npm run build`
- [x] 2.4 Testy produktu nadal przechodzą: `npm test`

#### Manual

- [x] 2.5 Na `npm run dev` pod `/sekwencje` duży Generuj pokazuje kartę z poleceniem i 6 wierszami po 7 pól. Kolejne Generuj daje inną kartę.
- [x] 2.6 Kształty są czytelnymi obrysami, a puste pole ma przerywaną ramkę i mały „?” w rogu, który nie wchodzi w środek pola.
- [x] 2.7 Podgląd druku w Chrome na komputerze pokazuje jedną stronę A4 bez paska, nagłówka i profilu, z marginesem co najmniej 10 mm.
- [x] 2.8 Profil w rogu działa jak na `/symetria` (wybór, tworzenie, pytanie o dziecko przy 2 profilach).

### Phase 3: Katalog, wspólne pliki i e2e

#### Automated

- [ ] 3.1 Testy produktu przechodzą, razem z testami sekwencji: `npm test`
- [ ] 3.2 Lint przechodzi: `npm run lint`
- [ ] 3.3 Typy przechodzą: `npx astro check`
- [ ] 3.4 Build przechodzi: `npm run build`
- [ ] 3.5 Miniatury są powtarzalne: po pierwszym `npm run thumbnails` pliki w `public/thumbnails` są w stage (`git add`), a po drugim `git diff --exit-code public/thumbnails` nie pokazuje zmian
- [ ] 3.6 Smoke przechodzi na podglądzie: `npm run smoke`
- [ ] 3.7 E2E katalogu i telefonu przechodzą: `npx playwright test tests/e2e/catalog.spec.ts tests/e2e/phone-layout.spec.ts`

#### Manual

- [ ] 3.8 Miniatura „Sekwencje” w katalogu wygląda jak karta, czytelnie na telefonie (2 kolumny) i na komputerze.
- [ ] 3.9 Druk z `/sekwencje` to jedna strona A4 z marginesem co najmniej 10 mm w Chrome, Edge, Brave, Firefox i Safari na komputerze.
- [ ] 3.10 Druk z telefonu (Safari na iOS i Chrome na Androidzie) to jedna strona A4, a Generuj i Drukuj nie nachodzą na siebie.
- [ ] 3.11 Wydrukowana karta: kształty i „?” czytelne, pole około 23 mm wystarcza 5-latkowi na dorysowanie kształtu.
- [ ] 3.12 Labirynt i symetria działają jak przed zmianą.
