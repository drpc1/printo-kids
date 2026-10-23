# Karta symetrii na A4 (S-12) Implementation Plan

## Overview

Nowa strona `/symetria` w katalogu kart. Rodzic klika Generuj i dostaje kartę A4: nad kratką 12×16 (kratka 15 mm) jest zdanie polecenia, a lewa połowa kratki ma czarną sylwetkę połowy obiektu (rakieta, robot albo truskawka) przy pionowej przerywanej osi. Dziecko dorysowuje drugą połowę. Karta ma jedną odpowiedź (odbicie), sprawdzaną przed pokazaniem. Drukuje się jako jedna strona A4 z marginesem 10 mm, także z telefonu. Strona ma ten sam profil dziecka w rogu co labirynt.

## Current State Analysis

Za `context/changes/symmetry-first-printable/research.md`:

- Powłoka `GeneratorShell.astro` jest wspólna i ma jedyny `@page { size: A4; margin: 0 }` (`src/components/GeneratorShell.astro:46-49`). Druk ukrywa `h1`, `p`, `a` i `button`, a pokazuje każdy `svg` w `#worksheet-home` (`:99-112`). Ekranowe ściśnięcie nagłówka zależy od klasy `has-maze` (`:51-75`), którą przełącza komponent labiryntu (`src/components/WorksheetGenerator.tsx:54-62`).
- Stan profili (wczytanie wizyty, utworzenie, wybór, wyczyszczenie, zapis ulubionych, usunięcie, pytanie o dziecko) siedzi w `WorksheetGenerator.tsx:39-53,110-152,404-414`. `ProfileCorner` dostaje go przez props (`src/components/ProfileCorner.tsx:40-62`).
- Wzorzec kartki: `MazeSheet` (`WorksheetGenerator.tsx:339-402`), czyli `<svg viewBox="0 0 210 297">` z klasami druku (`:363`) i kolorami `var(--card)` / `var(--foreground)`. Pasek: `GenerateButton`, `ACTION_BUTTON_CLASS` i `flex-1` na telefonie (`:24-25,191-208,231-254`).
- Katalog: `CARD_KINDS` (`src/lib/cards.ts:8-10`) i miniatury ze skryptu ze stałym ziarnem (`scripts/build-thumbnails.mjs`).
- Kontrakt druku czyta dziś tylko pliki labiryntu (`src/lib/sheet/print-contract.test.ts:9-11,29-76`). Smoke sprawdza `/` i `/labirynt` (`scripts/smoke.mjs:14-31`). `npm test` wylicza pliki jawnie (`package.json:12`).
- Brakuje: logiki symetrii, strony, komponentu, miniatury i testów.

## Desired End State

- Katalog na `/` ma drugą miniaturę „Symetria” (wygenerowaną z prawdziwego generatora), która prowadzi na `/symetria`.
- Na `/symetria` jest najpierw duży Generuj. Po kliknięciu pojawia się karta i pasek z Generuj i Drukuj. Każde kolejne Generuj daje kartę inną niż ta na ekranie.
- Karta: polecenie „Dorysuj drugą połowę tak, jak w lustrze.”, kratka 12×16 po 15 mm z cienką siatką w obu połowach i grubszą ramką, gruba przerywana oś pionowa, czarne kratki obiektu tylko po lewej, prawa połowa pusta, wszystko w marginesie 10 mm.
- Ten sam `ProfileCorner` co na labiryncie: tworzenie, wybór, edycja i usuwanie. Przy co najmniej 2 profilach i żadnym wybranym okno otwiera się samo, a Generuj czeka na wybór dziecka. Karta symetrii nie zależy jeszcze od profilu.
- Labirynt działa jak dziś. Jedyna zmiana w nim to nazwa klasy `has-sheet` i przeniesienie stanu profili do hooka.
- Sprawdzenie: `npm test`, `npm run lint`, `npx astro check`, `npm run build`, `npm run smoke` na podglądzie, lokalne e2e i ręczny podgląd druku.

### Key Discoveries:

- Polecenie musi być `<text>` w SVG, bo HTML `p` znika w druku (`GeneratorShell.astro:99-104`).
- Margines 10 mm leży w SVG, nie w `@page` (`context/archive/2026-09-29-print-a4-maze/plan.md:23`).
- 12 × 15 = 180 mm na 16 × 15 = 240 mm mieści się w polu 190×277 mm i zostawia 37 mm w pionie na polecenie (research.md, „Geometria”).
- `print-contract.test.ts` wyciąga klasy z `className={cn("…")}` (`:125-140`), więc nowy komponent musi trzymać ten zapis, żeby kontrakt go czytał.
- Plan testów, ryzyko 7: odbicie w teście nie może być liczone kodem, który rysuje kartę. Wyrocznią są ręcznie wpisane współrzędne (`context/foundation/test-plan.md`).

## What We're NOT Doing

- Poziomy symetrii, oś pozioma, obiekt odsunięty od osi i podpowiedzi. To S-13.
- Kody kolorów, legenda i przełącznik kolorów. To S-15. Szablony niosą jednak kolor każdej kratki od teraz, a kartka S-12 rysuje wszystko na czarno.
- Ostatnie parametry symetrii w `localStorage` i pola profilu właściwe dla symetrii. To S-14. Okno profilu na `/symetria` pokazuje te same pola co dziś (postać i poziom labiryntu), a co z polami jednego rodzaju karty, ustalimy później (decyzja użytkownika 2026-10-23).
- Ornamenty, inne obiekty niż rakieta, robot i truskawka, postacie z katalogu labiryntu.
- Zmiana `<title>` stron (odłożone F3 z F-03).
- Zmiana druku labiryntu, marginesów drukarki iOS (`print-printer-margins`) i reguł `@page`.
- Szary podgląd odpowiedzi na ekranie.

## Implementation Approach

Najpierw czysta logika z testami, bez UI. Potem bezpieczny refaktor wspólnych elementów (klasa powłoki i hook profilu), z labiryntem jako regresją. Dopiero potem nowa strona, a na końcu katalog, miniatura i e2e. Tak każda faza kończy się zielonymi testami, a ryzyko dla labiryntu siedzi w jednej, osobnej fazie.

## Critical Implementation Details

- **Importy w `src/lib/symmetry/`:** tylko względne, z rozszerzeniem `.ts` (jak `src/lib/maze/generate.ts:1`), bez aliasu `@/` i bez Reacta. `npm test` i `npm run thumbnails` uruchamiają te pliki przez `node --experimental-strip-types` (`package.json:12,15`), a ten nie rozwiązuje `@/`. Lint i build by tego nie wyłapały.
- **Kolejność w hooku profilu:** obsługa wyczyszczenia profilu czyta ostatnie parametry labiryntu (`readLastUsed`) i oddaje je stronie przez callback. Hook nie zapisuje `printo-kids:last-used`. Ten zapis zostaje w handlerach paska labiryntu (`WorksheetGenerator.tsx:92-104`), żeby strona symetrii nigdy go nie dotknęła.
- **Brak powtórki:** generator dostaje klucz poprzedniej karty i losuje ponownie, aż klucz będzie inny. Przy jednej możliwej karcie to nie ma końca, więc liczba prób jest ograniczona, a test gwarantuje, że możliwych kart jest więcej niż jedna.

## Phase 1: Logika karty symetrii

### Overview

Szablony obiektów, generator, walidator, odbicie i układ kartki jako czyste moduły w `src/lib/symmetry/`, testowane runnerem Node.

### Changes Required:

#### 1. Szablony obiektów

**File**: `src/lib/symmetry/templates.ts`

**Intent**: Katalog trzech szablonów: rakieta, robot, truskawka. Każdy to lewa połowa obiektu na siatce o szerokości połowy kratki (6 kolumn), dotykająca osi. Ma 2–3 wymienne części (np. okno i skrzydła rakiety, oczy i ręce robota, liście i pestki truskawki), a każda część ma co najmniej 2 warianty. Każda kratka niesie id koloru z palety (pod S-15).

**Contract**: `SYMMETRY_TEMPLATES: readonly SymmetryTemplate[]`. Szablon ma `id`, wysokość w wierszach (≤ 16), bazę i `parts`. Każda część ma listę wariantów, a wariant to zbiór kratek `{ col, row, color }`. `color` należy do `SYMMETRY_COLORS` (np. `red`, `green`, `yellow`, `blue`, `gray`, `black`). Format zapisu (np. wiersze znaków) wybiera implementujący, pod warunkiem że da się go czytać jak rysunek.

#### 2. Generator, walidator i odbicie

**File**: `src/lib/symmetry/generate.ts`

**Intent**: Złożyć kartę „5 lat” (12×16, oś pionowa) z losowego szablonu, losowych wariantów części i losowego przesunięcia w pionie w granicach siatki. Sprawdzić ją regułami PRD i oddać tylko kartę poprawną i różną od poprzedniej.

**Contract**:

- `SYMMETRY_SETTING = { columns: 12, rows: 16, cellSize: 15, axis: "vertical" }`. Jedno stałe ustawienie, poziomy dochodzą w S-13.
- `SymmetryCard = { columns, rows, axis, cells: readonly { col, row, color }[], key: string }`. `cells` to tylko połowa ze wzorem (kolumny 0..5). `key` jednoznacznie opisuje szablon, warianty i przesunięcie.
- `generateSymmetryCard(random: () => number, previousKey: string | null): SymmetryCard | null`. Zwraca `null`, gdy po ograniczonej liczbie prób nie ma poprawnej karty innej niż poprzednia.
- `symmetryCardProblems(card): readonly SymmetryProblem[]`. Pusta lista znaczy, że karta jest poprawna. Problemy: brak zamalowanej kratki; brak pustej kratki w połowie ze wzorem; kratka poza połową ze wzorem albo na osi; kratka poza siatką; powtórzona kratka; kolor spoza palety; wzór nie dotyka osi (żadna kratka w kolumnie 5).
- `mirrorAnswer(card): readonly { col, row, color }[]`. Odbicie `col → columns − 1 − col`, ten sam wiersz i kolor.

#### 3. Układ kartki A4

**File**: `src/lib/symmetry/layout.ts`

**Intent**: Policzyć położenie polecenia, kratki i osi na stronie 210×297 mm z wcięciem 10 mm. Kratka jest wyśrodkowana w poziomie, a polecenie z kratką w pionie.

**Contract**: `layoutSymmetrySheet({ pageWidth, pageHeight, inset, columns, rows, cellSize, instructionHeight, instructionGap })` zwraca `{ page, instruction: { x, y }, grid: { x, y, width, height }, axis: { x1, y1, x2, y2 } }`. Niezmiennik: polecenie, kratka i oś (łącznie z jej wysunięciem poza ramkę) leżą w polu `[inset, page − inset]`. Wywołanie z wymiarami, które się nie mieszczą, rzuca błąd zamiast zwrócić układ poza marginesem.

#### 4. Testy

**File**: `src/lib/symmetry/generate.test.ts`, `src/lib/symmetry/layout.test.ts`, `package.json`

**Intent**: Pokryć ryzyko 7 z planu testów niezależną wyrocznią i dopisać pliki do `npm test`.

**Contract**:

- Odbicie: mała ręcznie zapisana karta (np. kratki (5,0) i (2,3)) daje literalnie wpisane (6,0) i (9,3), z tymi samymi kolorami. Bez wołania kodu rysującego.
- Walidator odrzuca każdą złą kartę z osobna: pustą, pełną połowę, kratkę w kolumnie 6+, kratkę poza siatką, powtórzoną kratkę, obcy kolor, wzór niedotykający osi. Każdy przypadek sprawdza konkretny problem.
- Przegląd wszystkich kombinacji: każdy szablon × każdy zestaw wariantów × każde przesunięcie przechodzi walidator, a liczba różnych kluczy jest większa niż 1 dla każdego szablonu.
- `generateSymmetryCard` z deterministycznym PRNG zwraca klucz różny od `previousKey`. Gdy odrzucenie jest wymuszone (np. `random` zawsze wskazuje poprzednią kartę), zwraca `null` zamiast zapętlić się.
- Układ: dla ustawienia „5 lat” kratka ma 180×240 mm, polecenie i oś mieszczą się w 10 mm marginesu, a kratka jest wyśrodkowana w poziomie. Za duża siatka rzuca błąd.
- Nowe pliki dopisane do skryptu `test` w `package.json`.

#### 5. Plan testów

**File**: `context/foundation/test-plan.md`

**Intent**: Ta faza realizuje fazę 5 planu testów (ryzyko 7), więc plan testów ma to pokazywać.

**Contract**: Wiersz fazy 5 w §3 wskazuje folder `symmetry-first-printable`, ze statusem zgodnym z jego słownikiem. Ryzyko 7 (tabela ryzyk i Risk Response Guidance) zamiast „druga połowa jest pusta” mówi, że druga połowa zawiera tylko kratki podpowiedzi będące częścią odbicia, i nie całe odbicie (PRD Business Logic, 2026-10-23).

### Success Criteria:

#### Automated Verification:

- Testy symetrii i całe `npm test` przechodzą
- `npm run lint` przechodzi bez błędów
- `npx astro check` przechodzi bez błędów

#### Manual Verification:

- Wydruk tekstowy kilku kart z testu pokazuje rozpoznawalną rakietę, robota i truskawkę w każdej kombinacji wariantów

**Implementation Note**: Po zielonej automatyce i ręcznym przeglądzie kształtów czekamy na potwierdzenie przed fazą 2.

---

## Phase 2: Wspólna powłoka i hook profilu

### Overview

Przygotować to, co obie strony generatorów dzielą: ogólną klasę stanu karty w powłoce i stan profili w jednym hooku. Labirynt działa bez zmian.

### Changes Required:

#### 1. Klasa `has-sheet`

**File**: `src/components/GeneratorShell.astro`, `src/components/WorksheetGenerator.tsx`, `src/lib/sheet/print-contract.test.ts`

**Intent**: Zmienić nazwę `has-maze` na `has-sheet` w regułach ekranu i druku powłoki, w efekcie labiryntu i w asercjach kontraktu. Powłoka przestaje mówić „maze” do każdej karty.

**Contract**: Selektory `#worksheet-home.has-sheet` zastępują `#worksheet-home.has-maze` 1:1 (`GeneratorShell.astro:52-91`). W całym `src/` nie zostaje żadne `has-maze`.

#### 2. Hook stanu profili

**File**: `src/hooks/useChildProfileVisit.ts` (nowy), `src/components/WorksheetGenerator.tsx`

**Intent**: Wyciągnąć z komponentu labiryntu wczytanie wizyty, stan `profiles` / `activeId` / `ask`, `waitingForChild` i handlery `ProfileCorner` (utwórz, wybierz, wyczyść, zapisz ulubione, usuń, razem z zapisem `printo-kids:active-profile`). Strona dostaje wartości paska z profilu albo z ostatnich parametrów przez callback.

**Contract**: `useChildProfileVisit({ onApply })`. `onApply: (bar: { character: CharacterChoice; level: LevelId }) => void` jest wołane tam, gdzie dziś komponent woła `setCharacter` + `applyLevel` (`WorksheetGenerator.tsx:110-152`). Hook zwraca `{ profiles, activeId, ask, waitingForChild, visitStart: { character, level }, corner }`, gdzie `corner` to callbacki `onCreated`, `onChoose`, `onFavoriteSaved`, `onDeleted`, `onClearProfile` do `ProfileCorner`. Hook nie zapisuje `printo-kids:last-used`. Labirynt zachowuje `writeLastUsed` przy wyborze postaci i poziomu na pasku (`:92-104`) oraz własne `character` / `level`, startujące z `visitStart`.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, w tym zaktualizowany `print-contract.test.ts`
- W `src/` nie ma `has-maze`
- `npm run lint` i `npx astro check` przechodzą
- `npm run build` przechodzi
- Lokalne e2e labiryntu (`npx playwright test`) przechodzą bez zmian w testach

#### Manual Verification:

- Na `/labirynt` profil, pytanie o dziecko i ostatnie parametry działają jak przed zmianą

**Implementation Note**: To faza czystego refaktoru. Po zielonej automatyce i ręcznym sprawdzeniu labiryntu czekamy na potwierdzenie przed fazą 3.

---

## Phase 3: Strona `/symetria`

### Overview

Nowa wyspa React i strona Astro: przepływ Generuj → karta → Drukuj, kartka SVG i profil w rogu. Do tego kontrakt druku i smoke.

### Changes Required:

#### 1. Generator symetrii

**File**: `src/components/SymmetryGenerator.tsx` (nowy)

**Intent**: Ten sam przepływ co labirynt, bez paska „Postać” i bez poziomu. Na start duży Generuj, a po pierwszej karcie pasek z Generuj i Drukuj (na telefonie `flex-1`, od `sm` Drukuj po prawej). Drukuj woła `window.print()`. Ten sam `ProfileCorner` przez `useChildProfileVisit`. Gdy `waitingForChild`, Generuj jest nieaktywny, a okno profilu otwiera się samo. Kolejne Generuj przekazuje klucz bieżącej karty. Gdy generator zwróci `null`, pokazuje się `role="alert"` „Nie udało się ułożyć karty.”, a poprzednia karta zostaje. Efekt przełącza `has-sheet`, `justify-start` i `justify-center` na `#worksheet-home`, tak jak labirynt.

**Contract**: domyślny eksport `SymmetryGenerator`. Klasy kontrolek z `print:hidden` zapisane jako `className={cn("…")}`. Komponent nie czyta i nie zapisuje `printo-kids:last-used`. Wartości paska dla `ProfileCorner` (`barCharacter`, `barLevel`) trzyma we własnym stanie, startując z `visitStart` i aktualizując przez `onApply`. Ani `ProfileCorner`, ani labirynt się nie zmieniają. Stałe przycisku (`ACTION_BUTTON_CLASS`) i strony (210, 297, 10) są skopiowane lokalnie, tak jak robi to skrypt miniatur.

#### 2. Kartka symetrii

**File**: `src/components/SymmetryGenerator.tsx` (komponent `SymmetrySheet`)

**Intent**: Narysować kartę z `layoutSymmetrySheet` i `SymmetryCard`: polecenie jako `<text>` (7 mm, wyśrodkowane), cienką siatkę w obu połowach, grubszą ramkę, czarne kratki obiektu i grubą przerywaną oś, wysuniętą kilka mm poza ramkę. Prawa połowa bez kratek. Odpowiedź nie jest rysowana.

**Contract**: `<svg viewBox="0 0 210 297" role="img" aria-label="Symetria">` (jak `MazeSheet` z `aria-label="Labirynt"`, `WorksheetGenerator.tsx:365-366`; e2e szukają kartki przez `getByRole("img", { name: "Symetria" })`) z tymi samymi klasami co `MazeSheet` (`WorksheetGenerator.tsx:363`: `aspect-[210/297] … print:w-[210mm] print:h-[297mm] print:overflow-hidden print:ring-0`). Tło `var(--card)`. Kratki, siatka, ramka, oś i tekst w `var(--foreground)`. Bez hexów i klas palety (AGENTS.md, UI). Grubości w mm: siatka około 0,3, ramka 0,65, oś około 1,4 z kreską około `4 2.5`.

#### 3. Strona

**File**: `src/pages/symetria.astro` (nowy)

**Intent**: Strona w `GeneratorShell` z opisem i wyspą, wzorowana na `labirynt.astro`.

**Contract**: `<GeneratorShell description="Wygeneruj kartę symetrii i wydrukuj ją na kartce A4.">` oraz `<SymmetryGenerator client:only="react" />`, w `Layout` z `lang="pl"`.

#### 4. Kontrakt druku i smoke

**File**: `src/lib/sheet/print-contract.test.ts`, `scripts/smoke.mjs`

**Intent**: Te same gwarancje druku dla nowego komponentu i sprawdzian HTTP nowej strony.

**Contract**: Nowe testy: SVG `SymmetryGenerator.tsx` ma `print:w-[210mm]`, `print:h-[297mm]` i `print:overflow-hidden`; jego kontrolki mają `print:hidden`; `symetria.astro` używa `GeneratorShell` i `SymmetryGenerator`. Smoke dostaje krok „symetria renders the worksheet sentence”: `/symetria` → 200 i zdanie opisu.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, w tym nowe asercje kontraktu druku
- `npm run lint` i `npx astro check` przechodzą
- `npm run build` przechodzi
- `npm run smoke` przeciw `npm run preview` przechodzi, w tym krok `/symetria`

#### Manual Verification:

- Na `/symetria` Generuj daje kartę z poleceniem, kratką, osią i połową obiektu; kolejne Generuj zmienia kartę
- Podgląd druku w Chrome: jedna strona A4, kratka cała, margines co najmniej 10 mm, bez przycisków i nagłówka
- Pytanie o dziecko i blokada Generuj przy 2 profilach; profil wspólny z `/labirynt`

**Implementation Note**: Po zielonej automatyce i ręcznym podglądzie druku czekamy na potwierdzenie przed fazą 4.

---

## Phase 4: Katalog, miniatura i e2e

### Overview

Symetria wchodzi do katalogu z miniaturą z prawdziwego generatora. Przepływ i układ telefonu chronią lokalne testy Playwright. Na końcu ręczny druk w przeglądarkach.

### Changes Required:

#### 1. Katalog

**File**: `src/lib/cards.ts`

**Intent**: Drugi wpis katalogu.

**Contract**: `{ id: "symetria", title: "Symetria", href: "/symetria", thumbnail: "/thumbnails/symetria.svg" }` po labiryncie.

#### 2. Miniatura

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/symetria.svg` (generowany)

**Intent**: Ten sam skrypt pisze też miniaturę symetrii z `generateSymmetryCard` i `layoutSymmetrySheet` ze stałym ziarnem, więc wygląd nie rozjedzie się z kartą. Literalne kolory są tu dozwolone, tak jak w miniaturze labiryntu (`:3`).

**Contract**: `npm run thumbnails` daje bajtowo ten sam `public/thumbnails/symetria.svg` przy każdym uruchomieniu i nie zmienia `labirynt.svg`. Ziarno jest stałe, osobne dla symetrii.

#### 3. E2E

**File**: `tests/e2e/catalog.spec.ts`, `tests/e2e/phone-layout.spec.ts`

**Intent**: Pokryć US-05 i US-04 dla nowej strony tymi samymi wzorcami co labirynt.

**Contract**: katalog: link „Symetria” → `/symetria` → Generuj → widać kartę (`getByRole("img", { name: "Symetria" })`) → „Wszystkie karty” → profil wybrany wcześniej nadal wybrany. Telefon: na `/symetria` po Generuj nie ma przewijania w bok, a Generuj, Drukuj i Profil nie nachodzą na siebie, na tych samych rozmiarach ekranu co labirynt. Lokatory `getByRole` / `getByText`, bez `waitForTimeout`.

### Success Criteria:

#### Automated Verification:

- `npm run thumbnails` dwa razy daje ten sam `symetria.svg`
- `npm test`, `npm run lint`, `npx astro check` i `npm run build` przechodzą
- `npm run smoke` przeciw podglądowi przechodzi
- Lokalne `npx playwright test` przechodzi, w tym nowe przypadki symetrii

#### Manual Verification:

- Katalog na telefonie i komputerze pokazuje dwie czytelne miniatury
- Druk jednej strony A4 w Edge, Firefox, Brave i Safari na komputerze
- Na telefonie przyciski nie nachodzą na siebie, podgląd zostaje, wydruk to jedna strona A4
- Wydruk testowy: dziecko rozpoznaje obiekt, a kratka 15 mm daje się zamalować kredką

**Implementation Note**: Zakończenie fazy zamyka S-12. Status roadmapy i issue aktualizuje `/10x-archive`.

---

## Testing Strategy

### Unit Tests:

- Odbicie z ręcznie wpisaną wyrocznią, nie z kodu rysującego (ryzyko 7)
- Walidator: osobny przypadek dla każdego problemu z listy reguł PRD
- Pełny przegląd szablonów, wariantów i przesunięć oraz brak powtórki poprzedniej karty
- Układ: wymiary, środek, margines i błąd dla za dużej siatki
- Kontrakt druku dla nowego komponentu i strony

### Integration Tests:

- Smoke `/symetria` w CI
- Lokalne Playwright: katalog → Symetria → powrót z profilem; układ telefonu na `/symetria`

### Manual Testing Steps:

1. `npm run dev`, wejść z `/` w „Symetria”, kliknąć Generuj kilka razy, sprawdzić, czy kolejne karty się różnią.
2. Podgląd druku w Chrome: jedna strona, margines, brak przycisków.
3. Utworzyć dwa profile na `/symetria`, wyczyścić wybór i sprawdzić pytanie o dziecko oraz blokadę Generuj.
4. Powtórzyć druk w Edge, Firefox, Brave, Safari i na telefonie.

## Performance Considerations

Generowanie to złożenie kilkudziesięciu kratek z szablonu i walidacja, czyli mikrosekundy. Granica 5 s z PRD nie jest zagrożona. Ograniczona liczba prób przy powtórce chroni przed pętlą.

## Migration Notes

Bez zmian w danych zapisanych u rodzica. Klucze `localStorage` i kształt profili zostają. Hook profilu przenosi kod, nie format.

## References

- Research: `context/changes/symmetry-first-printable/research.md`
- PRD: US-06, FR-015, Business Logic „Karta symetrii” w `context/foundation/prd.md`
- Roadmapa S-12: `context/foundation/roadmap.md`
- Plan testów, ryzyko 7: `context/foundation/test-plan.md`
- Wzorzec kartki i paska: `src/components/WorksheetGenerator.tsx:24-25,191-208,339-402`
- Wzorzec miniatury: `scripts/build-thumbnails.mjs`
- Poprzednia zmiana z powłoką: `context/archive/2026-10-22-card-catalog-home/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Logika karty symetrii

#### Automated

- [x] 1.1 Testy symetrii i całe `npm test` przechodzą — d2667ee
- [x] 1.2 `npm run lint` przechodzi bez błędów — d2667ee
- [x] 1.3 `npx astro check` przechodzi bez błędów — d2667ee

#### Manual

- [x] 1.4 Wydruk tekstowy kilku kart z testu pokazuje rozpoznawalną rakietę, robota i truskawkę w każdej kombinacji wariantów — d2667ee

### Phase 2: Wspólna powłoka i hook profilu

#### Automated

- [x] 2.1 `npm test` przechodzi, w tym zaktualizowany `print-contract.test.ts` — 2ebcc90
- [x] 2.2 W `src/` nie ma `has-maze` — 2ebcc90
- [x] 2.3 `npm run lint` i `npx astro check` przechodzą — 2ebcc90
- [x] 2.4 `npm run build` przechodzi — 2ebcc90
- [x] 2.5 Lokalne e2e labiryntu (`npx playwright test`) przechodzą bez zmian w testach — 2ebcc90

#### Manual

- [x] 2.6 Na `/labirynt` profil, pytanie o dziecko i ostatnie parametry działają jak przed zmianą — 2ebcc90

### Phase 3: Strona `/symetria`

#### Automated

- [ ] 3.1 `npm test` przechodzi, w tym nowe asercje kontraktu druku
- [ ] 3.2 `npm run lint` i `npx astro check` przechodzą
- [ ] 3.3 `npm run build` przechodzi
- [ ] 3.4 `npm run smoke` przeciw `npm run preview` przechodzi, w tym krok `/symetria`

#### Manual

- [ ] 3.5 Na `/symetria` Generuj daje kartę z poleceniem, kratką, osią i połową obiektu; kolejne Generuj zmienia kartę
- [ ] 3.6 Podgląd druku w Chrome: jedna strona A4, kratka cała, margines co najmniej 10 mm, bez przycisków i nagłówka
- [ ] 3.7 Pytanie o dziecko i blokada Generuj przy 2 profilach; profil wspólny z `/labirynt`

### Phase 4: Katalog, miniatura i e2e

#### Automated

- [ ] 4.1 `npm run thumbnails` dwa razy daje ten sam `symetria.svg`
- [ ] 4.2 `npm test`, `npm run lint`, `npx astro check` i `npm run build` przechodzą
- [ ] 4.3 `npm run smoke` przeciw podglądowi przechodzi
- [ ] 4.4 Lokalne `npx playwright test` przechodzi, w tym nowe przypadki symetrii

#### Manual

- [ ] 4.5 Katalog na telefonie i komputerze pokazuje dwie czytelne miniatury
- [ ] 4.6 Druk jednej strony A4 w Edge, Firefox, Brave i Safari na komputerze
- [ ] 4.7 Na telefonie przyciski nie nachodzą na siebie, podgląd zostaje, wydruk to jedna strona A4
- [ ] 4.8 Wydruk testowy: dziecko rozpoznaje obiekt, a kratka 15 mm daje się zamalować kredką
