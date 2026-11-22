# „Skopiuj obrazek” z kształtami dyktanda (S-55) — plan

## Overview

Karta „Skopiuj obrazek” losuje dziś tylko obiekty z katalogu szablonów symetrii. Po tej zmianie losuje też kształty z katalogu dyktanda, które nie muszą być symetryczne (np. skarpeta, ryba, dinozaur): 15 z 16 kształtów, bez klucza poziomego, każdy na poziomach, na których ma rysunek, także odbity w poziomie. Po włączeniu kolorów kształt ma własny kolorowy rysunek z kredką w każdej kratce. Pięć kształtów dostaje nowe rysunki, wspólne z dyktandem (S-55, GitHub drpc1/printo-kids#379; PRD US-27, US-28, FR-037, Business Logic „Karta „Skopiuj obrazek”” i „Karta dyktanda graficznego”).

## Current State Analysis

- Karta zna tylko szablon symetrii: `CopyDrawingCard` ma `templateId` i `variants` (`src/lib/copy-drawing/card.ts:4-14`), klucz to `level:templateId:variants` (`card.ts:19-21`), `expectedPattern` odbudowuje sylwetkę z szablonu przez `nonogramImage` i `centerSilhouette` (`card.ts:54-71`), a `copyDrawingProblems` porównuje z nią wzór karty (`card.ts:78-101`).
- Generator losuje szablon z `symmetryTemplatesFor(level.size.templateLevel, category)`, potem wariant każdej części, do `MAX_ATTEMPTS = 20` prób (`src/lib/copy-drawing/generate.ts:13-34`); `composeCopyDrawingCard` buduje kartę z szablonu (`generate.ts:37-49`).
- Kolory odbijają kratki szablonu na całą siatkę, przesuwają je jak `centerSilhouette` i malują dziury `holeColor` (`src/lib/copy-drawing/colors.ts:12-48`); `closedCells` szuka dziur (`colors.ts:51-88`). Strona woła tylko `copyDrawingCellColors(card)` (`src/components/CopyDrawingSheet.tsx:74`).
- Silnik ma `knownBad` z kartą z generatora (`src/lib/copy-drawing/engine.ts:26-63`); `contentKey` to `level|category`, a kolory nie wchodzą do spec (`engine.ts:74`).
- Poziomy karty to rozmiary nonogramu `latwy/sredni/trudny` z siatkami 8×12, 12×15 i 18×24 (`src/lib/copy-drawing/levels.ts`, `src/lib/nonogram/sizes.ts`); dyktando ma poziomy `lat5/lat6/lat7` (`src/lib/dictation/levels.ts:3`).
- Kształty dyktanda to bitmapy z `#` i `.` (`src/lib/dictation/shapes.ts:9-18`); `shapeSilhouette` czyta tylko `#` (`shapes.ts:598-620`), `dictationShapesFor` filtruje po poziomie i kategorii (`shapes.ts:582-592`). Dyktando wypełnia dziury przy obrysie, więc kolor litery nie zmienia obrysu.
- Litery kredek są w `COLOR_LETTERS` w `src/lib/symmetry/template-format.ts:71-80`, nieeksportowane; czyta je `drawing()`.
- Miniatura karty powstaje z generatora z ziarnem (`scripts/build-thumbnails.mjs:641-648`, `COPY_SEED = 20261109`, poziom domyślny `sredni`); miniatura dyktanda też (`DICTATION_SEED`, poziom `lat6`, `build-thumbnails.mjs:408-411`).

## Desired End State

- Generuj na „Skopiuj obrazek” daje, przy każdym poziomie i kategorii, obiekt z szablonów albo kształt dyktanda; każdy obiekt (szablon albo kształt) ma tę samą szansę, potem wariant części albo odbicie.
- Kształt jest wyśrodkowany w poziomie i, jak dziś, w pionie (`centerSilhouette`); odbity kształt ma odwrócone kolumny i kolory.
- Z kolorami kształt ma kredkę z litery w każdej kratce; dziury (sanki) zostają białe. Prawa kratka zostaje pusta. Przełącznik nadal nie układa nowej karty.
- Klucz kart szablonów jest taki jak dziś; karta kształtu ma własny, inny klucz. `copyDrawingProblems` sprawdza kartę kształtu tak samo jak kartę szablonu.
- Klucz poziomy zostaje tylko w dyktandzie. Dyktando rysuje nowe bitmapy renifera, ciężarówki, helikoptera (średni), dinozaura i skarpety, a jego testy obrysu są zielone.
- Weryfikacja: `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`, e2e `tests/e2e/copy-drawing.spec.ts`, wydruk próbny.

### Key Discoveries:

- `mockup-colors.json` ma dokładnie 15 kształtów (bez `klucz-poziomy`); jego zamalowane kratki pokrywają się z dzisiejszymi bitmapami, poza pięcioma przerysowanymi kształtami (dinozaur na 3 poziomach, helikopter `lat6`, ciężarówka `lat6`/`lat7`, skarpeta na 3 poziomach, renifer `lat7`), gdzie JSON ma już nowe rysunki z `REDRAWN` (`mockup.mts:48`, `bitmapsOf` w `mockup.mts:515-519`). Plik JSON jest więc jedynym źródłem bitmap dla 15 kształtów.
- Wszystkie rysunki mieszczą się w siatce karty: `lat5` ≤ 8×12, `lat6` ≤ 12×15, `lat7` ≤ 18×24 (najszersze: dinozaur i skarpeta `lat6` po 12 kolumn, klucz pionowy `lat7` 18×24, czyli całą siatkę).
- Dziury (puste kratki otoczone kształtem) mają tylko sanki: 5 na `lat6`, 12 na `lat7`. Klucz poziomy `lat7` ma 2, ale nie wchodzi na kartę.
- Makieta liczy przesunięcie w poziomie `floor((columns − width) / 2)` (`mockup.mts:469-475`); to samo przyjmuje plan, żeby karta wyglądała jak zatwierdzona makieta.
- `shapes.test.ts:31-60` już sprawdza każdy kształt prosto i odbity (`outlineProblems`, `dictationCardFromSilhouette`, `dictationCardProblems`, `maxCommands`) i że kształt nie jest symetryczny; makieta przepuściła przez te same reguły pięć nowych rysunków (`mockup.mts:497-513`).

## What We're NOT Doing

- Klucz poziomy na karcie „Skopiuj obrazek” (decyzja użytkowniczki 2026-11-21).
- Kolorów w dyktandzie: dyktando nadal rysuje sam obrys, litery kredek tylko zastępują `#`.
- Zmiany układu kartki, wielkości kratek, polecenia, paska ani ustawień karty (`CopyDrawingSettings` bez zmian, `contentKey` bez zmian).
- Opisu karty w `CARD_KINDS` (`src/lib/cards.ts:80`) i strony „Jak to działa”: opis jest ogólny („obrazek”) i zostaje.
- Aktualizacji `context/foundation/test-plan.md` (ryzyko 12 mówi o sylwetce z szablonów): to S-51.
- Osobnej szansy dla kształtów i szablonów jako grup: każdy obiekt ma równą szansę (decyzja z planowania).
- Commita `preview.html` (podgląd makiety); `mockup.mts` i `mockup-colors.json` zostają w folderze zmiany jako źródło.

## Implementation Approach

Najpierw kształty dostają kolory i nowe rysunki w jednym katalogu, wspólnym z dyktandem, i znacznik, czy wchodzą na kartę. Dyktando widzi tylko nowe rysunki; jego testy pilnują obrysu. Potem karta „Skopiuj obrazek” dostaje dyskryminowane pole `picture` (szablon albo kształt), a jedna funkcja buduje wzór i kolory dla obu rodzajów, tak żeby generator, `copyDrawingProblems` i `copyDrawingCellColors` czytały to samo. Klucz szablonu się nie zmienia, więc karty szablonów wyglądają i liczą powtórki jak dziś.

## Critical Implementation Details

- **Kolejność przesunięć:** wzór kształtu powstaje w kolejności: bitmapa (odbita, gdy `mirrored`) → wstawiona w siatkę poziomu z przesunięciem `floor((columns − width) / 2)` od lewej, od wiersza 0 → `centerSilhouette`. Kolory przesuwa się tak samo (`silhouetteRowShift` z tego samego nieprzesuniętego obrazu), inaczej kolor rozjedzie się z czarnym wzorem. Najprościej mieć jedną funkcję, która zwraca siatkę liter albo kredek, i z niej brać i wzór (`!== null`), i kolory.
- **Losowanie:** pula to lista obiektów poziomu i kategorii (szablony z `symmetryTemplatesFor` ∪ kształty z `dictationShapesFor` z `onCopyDrawing`), jedno `pick` na obiekt, potem `variants` szablonu albo `mirrored = pick(random, 2) === 1`. Nie rozwijać puli do wszystkich wariantów: wtedy szablon z wieloma wariantami miałby większą szansę niż kształt.

## Phase 1: Kolorowe kształty dyktanda

### Overview

Kształty dyktanda dostają litery kredek zamiast `#`, pięć kształtów nowe rysunki, a każdy kształt znacznik, czy wchodzi na kartę „Skopiuj obrazek”. Dyktando działa jak dziś, z nowymi rysunkami.

### Changes Required:

#### 1. Litery kredek w jednym miejscu

**File**: `src/lib/symmetry/template-format.ts`

**Intent**: Wystawić odczyt litery kredki, żeby kształty dyktanda i karta „Skopiuj obrazek” używały tych samych liter co `drawing()`, bez drugiej tabeli.

**Contract**: Nowy eksport, np. `symmetryColorOfLetter(letter: string): SymmetryColor | undefined` (albo eksport `COLOR_LETTERS`), oparty na dzisiejszej tabeli `r g y b o s k n`. `drawing()` zachowuje się jak dziś, łącznie z błędem przy nieznanej literze.

#### 2. Bitmapy w kolorach, nowe rysunki i znacznik karty

**File**: `src/lib/dictation/shapes.ts`

**Intent**: Zastąpić wiersze `#` wszystkich 15 kształtów wierszami z `context/changes/copy-drawing-asymmetric-shapes/mockup-colors.json` (to przenosi też nowe rysunki renifera, ciężarówki, helikoptera `lat6`, dinozaura i skarpety); klucz poziomy, którego nie ma w JSON, dostaje `y` w miejscu każdego `#`. Kształt mówi, czy wchodzi na kartę „Skopiuj obrazek”.

**Contract**:

- Komentarz `DictationShape` opisuje wiersze jako litery kredek (`r g y b o s k n`, jak w szablonach symetrii) i `.` dla pustej kratki; dyktando czyta każdą literę jako kratkę sylwetki.
- `DictationShape` dostaje wymagane pole `onCopyDrawing: boolean` (`false` tylko dla `klucz-poziomy`, `true` dla pozostałych 15), z komentarzem o decyzji 2026-11-21.
- `shapeSilhouette` traktuje każdy znak inny niż `.` jako kratkę sylwetki i rzuca błąd przy znaku, który nie jest `.` ani literą kredki (jak `drawing()`).
- Komentarze kształtów przerysowanych mówią krótko, co się zmieniło (S-55, np. renifer 13×19 z krótszym tułowiem).
- Bitmapy przepisuje się z JSON-a, nie ręcznie: najlepiej jednorazowym skryptem w folderze zmiany albo ostrożnym kopiowaniem; po przepisaniu `mockup.mts` nadal się uruchamia (jego `REDRAWN` staje się równe katalogowi).

#### 3. Testy kształtów

**File**: `src/lib/dictation/shapes.test.ts`

**Intent**: Pilnować liter i znacznika karty; dotychczasowe testy obrysu zostają i przechodzą z nowymi rysunkami.

**Contract**:

- Nowy test: każdy znak każdego wiersza każdego kształtu to `.` albo litera kredki; żaden kształt nie ma `#`.
- Nowy test: `onCopyDrawing` jest `false` dokładnie dla `klucz-poziomy`.
- Nowy test: nieznana litera w rysunku rzuca błąd w `shapeSilhouette`.
- Kształty tylko z testu (`partial`, `ragged`, pierścień z dziurą, `shapes.test.ts:64-95`) dostają litery i `onCopyDrawing`.
- Test rozmiarów nowych rysunków jest zbędny: rozmiary pilnuje test fazy 2 (kształt mieści się w siatce karty), a obrys pilnuje `shapes.test.ts:31-60`.

#### 4. Miniatury

**File**: `scripts/build-thumbnails.mjs` (bez zmian), `public/thumbnails/dyktando.svg`

**Intent**: Nowe rysunki zmieniają katalog obrysów dyktanda, więc miniatura dyktanda z ziarnem może wyjść inna. Przebudować miniatury (`npm run thumbnails`) i zostawić zmienioną `dyktando.svg`; pozostałe pliki nie powinny się zmienić.

**Contract**: `git diff --stat public/thumbnails` pokazuje najwyżej `dyktando.svg`.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, w tym nowe testy liter i `onCopyDrawing` i dotychczasowe testy obrysu kształtów (prosto i odbite, `maxCommands`)
- `npm run lint` przechodzi
- `npm run depcruise` przechodzi
- `npx astro check` przechodzi
- `npm run build` przechodzi
- `npm run thumbnails` zmienia najwyżej `public/thumbnails/dyktando.svg`

#### Manual Verification:

- Strona dyktanda (`/dictation`) pokazuje nowe rysunki renifera (trudny), ciężarówki (średni, trudny), helikoptera (średni), dinozaura i skarpety; obrys jest czytelny, a „Pokaż rozwiązanie” rysuje kreskę po obrysie
- Przed PR-em fazy: `/10x-impl-review copy-drawing-asymmetric-shapes` i poprawki z przeglądu

**Implementation Note**: Po fazie i zielonych bramkach zatrzymaj się na ręczne potwierdzenie, zanim zaczniesz fazę 2.

---

## Phase 2: Kształty na karcie „Skopiuj obrazek”

### Overview

Karta nazywa szablon albo kształt, generator losuje z obu katalogów z równą szansą każdego obiektu, a sprawdzenie, kolory i silnik obsługują kartę kształtu.

### Changes Required:

#### 1. Poziom karty zna poziom dyktanda

**File**: `src/lib/copy-drawing/levels.ts`

**Intent**: Każdy poziom karty wie, który poziom dyktanda daje jego kształty, żeby generator i sprawdzenie nie liczyły tego osobno.

**Contract**: `CopyDrawingLevel` dostaje pole `dictationLevel: DictationLevelId` (`latwy → lat5`, `sredni → lat6`, `trudny → lat7`), z komentarzem, że rysunki tych poziomów mieszczą się w siatkach 8×12, 12×15 i 18×24. `levels.test.ts` sprawdza mapowanie.

#### 2. Karta nazywa szablon albo kształt

**File**: `src/lib/copy-drawing/card.ts`

**Intent**: Zastąpić `templateId` i `variants` jednym polem, które mówi, skąd jest obrazek, i budować wzór obu rodzajów w jednym miejscu.

**Contract**:

- `CopyDrawingCard` dostaje `picture: CopyDrawingPicture`, gdzie `CopyDrawingPicture = { kind: "template"; templateId: string; variants: readonly number[] } | { kind: "shape"; shapeId: string; mirrored: boolean }`; pola `templateId` i `variants` znikają z karty.
- `copyDrawingKey(levelId, picture)`: szablon daje dzisiejszy klucz `level:templateId:variants`; kształt daje klucz z osobnym znacznikiem, np. `level:ksztalt:<shapeId>:<prosty|odbity>`, który nie może się pokryć z kluczem szablonu.
- `expectedPattern(level, picture)`: dla szablonu jak dziś; dla kształtu bitmapa z `dictationShapesFor(level.dictationLevel, "wszystkie")` tylko z `onCopyDrawing`, odbita przy `mirrored`, wstawiona w siatkę z przesunięciem `floor((columns − width) / 2)` i wyśrodkowana `centerSilhouette`; `null`, gdy kształtu nie ma, nie ma rysunku na poziomie, nie wchodzi na kartę albo się nie mieści w siatce.
- Jedna wewnętrzna funkcja daje siatkę kratek kształtu z literą (albo kredką) w każdej kratce sylwetki, po odbiciu i przesunięciach; `expectedPattern` i `copyDrawingCellColors` z niej korzystają.
- `copyDrawingProblems` bez nowych kodów: zły kształt, odbicie albo wzór to `not-silhouette`.

#### 3. Generator

**File**: `src/lib/copy-drawing/generate.ts`

**Intent**: Losować obiekt z równą szansą spośród szablonów i kształtów poziomu i kategorii, potem jego wariant.

**Contract**:

- Pula: `symmetryTemplatesFor(level.size.templateLevel, category)` ∪ `dictationShapesFor(level.dictationLevel, category)` z `onCopyDrawing` (ta sama kategoria, „Wszystkie” obejmuje oba katalogi przez cały rok). Pusta pula → `null`, jak dziś.
- Próba: `pick` obiektu z puli; szablon → `variants` jak dziś; kształt → `mirrored = pick(random, 2) === 1`. `MAX_ATTEMPTS` i odrzucenie poprzedniego klucza bez zmian.
- `composeCopyDrawingCard` przyjmuje `picture` i poziom (szablon albo kształt podaje się przez `picture`); dla kształtu bierze wzór z tej samej funkcji co `expectedPattern`.

#### 4. Kolory

**File**: `src/lib/copy-drawing/colors.ts`

**Intent**: Kolory karty kształtu biorą kredkę z litery każdej kratki, po odbiciu i przesunięciach wzoru; dziury zostają białe.

**Contract**: `copyDrawingCellColors(card)` rozgałęzia się po `card.picture.kind`: szablon jak dziś; kształt → siatka z funkcji z pkt 2, litery zamienione na `SymmetryColor` przez eksport z fazy 1, bez `holeColor` (dziury `null`). `null`, gdy kształtu nie ma albo nie ma rysunku na poziomie.

#### 5. Silnik

**File**: `src/lib/copy-drawing/engine.ts`

**Intent**: `knownBad` dalej łamie każdą regułę i dostaje przypadek karty kształtu.

**Contract**: Dotychczasowe przypadki zostają (karta z ziarnem może teraz wyjść kształtem; `turned` nadal daje inny wzór). Nowy przypadek: karta kształtu z `mirrored` odwróconym względem wzoru → `not-silhouette`. Kartę kształtu buduje się `composeCopyDrawingCard` z konkretnym kształtem, np. `dinozaur` na średnim, nie z ziarna.

#### 6. Testy

**Files**: `src/lib/copy-drawing/card.test.ts`, `generate.test.ts`, `colors.test.ts`, `engine.test.ts`, `levels.test.ts`

**Intent**: Pokryć kartę kształtu na każdym poziomie i w każdej kategorii, odbicie, kolory, klucze i reguły.

**Contract** (testy nazwane):

- Każdy kształt z `onCopyDrawing` na każdym poziomie, na którym ma rysunek, prosto i odbity: karta bez problemów, wzór mieści się w siatce, ma pustą kratkę, a odbity wzór różni się od prostego.
- Klucz poziomy nie trafia na kartę: `composeCopyDrawingCard` z nim daje `not-silhouette`, a generator nigdy go nie losuje.
- Klucze wszystkich kart poziomu (wszystkie warianty szablonów i oba odbicia kształtów) są różne; klucz szablonu ma dzisiejszą postać.
- Generator: dla każdego poziomu i każdej kategorii z `OBJECT_CATEGORY_CHOICES` (już jest, `generate.test.ts:20-33`) plus test, że przy wielu losowaniach na każdym poziomie trafiają się i szablony, i kształty, i oba odbicia, a kształt kategorii „Boże Narodzenie” (skarpeta na łatwym) pada w tej kategorii.
- Równa szansa obiektu: z deterministycznym `random` obiekt o indeksie i pada przy `random` w przedziale i-tym puli (test na wybór obiektu, nie na częstość).
- Wyśrodkowanie: kształt węższy niż siatka ma po lewej `floor((columns − width) / 2)` pustych kolumn, a puste wiersze nad i pod różnią się najwyżej o jeden.
- Kolory kształtu: kratka sylwetki ma kredkę swojej litery (np. skarpeta: szary mankiet, paski czerwone i zielone), odbity kształt ma odbite kolory, każda kratka z kolorem jest kratką wzoru, dziury sanek są `null`, nieznany kształt daje `null`.
- `copyDrawingProblems`: karta kształtu z obcym `shapeId`, z odwróconym `mirrored`, z poziomem bez rysunku → `not-silhouette`; dotychczasowe testy szablonów przepisane na `picture`.
- `engine.test.ts`: nowy przypadek `knownBad` łamie dokładnie swoją regułę (jeśli test iteruje po `knownBad`, dochodzi sam).
- 200 kart w mniej niż 2 s (`generate.test.ts:57-67`) zostaje.

#### 7. Mutacje

**Intent**: Wąski Stryker na zmienionych zakresach (AGENTS.md: tylko kod tej zmiany, ocalałe mutanty po kolei, asercja tylko dla błędu widocznego dla dziecka albo rodzica).

**Contract**: `npm run mutate:copy-drawing -- --mutate "src/lib/copy-drawing/generate.ts:<start>-<end>"` i to samo dla zmienionych zakresów `card.ts` i `colors.ts`. Wynik i decyzje dla ocalałych w `context/changes/copy-drawing-asymmetric-shapes/reviews/stryker-results.md`.

#### 8. Miniatura karty

**File**: `public/thumbnails/kopiuj.svg`

**Intent**: Generator z ziarnem `COPY_SEED` może teraz dać kształt albo inny szablon. Przebudować miniatury (`npm run thumbnails`) i zostawić zmienioną `kopiuj.svg`, jeśli wygląda dobrze; ziarna nie zmieniać, chyba że obrazek jest nieczytelny w miniaturze.

**Contract**: `git diff --stat public/thumbnails` pokazuje najwyżej `kopiuj.svg`.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, w tym nowe testy karty kształtu, generatora, kolorów i silnika
- `npm run lint` przechodzi
- `npm run depcruise` przechodzi
- `npx astro check` przechodzi
- `npm run build` przechodzi
- `npm run thumbnails` zmienia najwyżej `public/thumbnails/kopiuj.svg`
- Wąski Stryker na zmienionych zakresach `generate.ts`, `card.ts` i `colors.ts`, wynik w `reviews/stryker-results.md`

#### Manual Verification:

- Na `/copy-drawing` kolejne Generuj dają szablony i kształty na każdym poziomie; kształt odbity wygląda jak w makiecie, kolory po włączeniu zgadzają się z makietą, przełącznik nie zmienia karty
- Kategoria (np. Zwierzęta, Boże Narodzenie) daje kształty tylko ze swojej kategorii; klucz poziomy nie pada w „Domy i budowle”
- Przed PR-em fazy: `/10x-impl-review copy-drawing-asymmetric-shapes` i poprawki z przeglądu

**Implementation Note**: Po fazie i zielonych bramkach zatrzymaj się na ręczne potwierdzenie, zanim zaczniesz fazę 3.

---

## Phase 3: Wydruk próbny i staging

### Overview

Sprawdzenie na papierze i na stagingu, że kształty w kolorach i odbite drukują się czytelnie na jednej stronie A4, a dyktando z nowymi rysunkami dalej się drukuje.

### Changes Required:

#### 1. Wydruk i telefon

**Intent**: Ręczne sprawdzenie po scaleniu faz 1–2 na stagingu (`main`), według `context/foundation/lessons.md` („Mierz wartości druku w każdej przeglądarce iOS osobno”).

**Contract**: Lista ręczna w opisie PR-a; zmiany kodu tylko, gdy wydruk coś pokaże (wtedy jako poprawka w tej fazie).

#### 2. E2E

**File**: `tests/e2e/copy-drawing.spec.ts` (bez zmian, chyba że test zakłada szablon)

**Intent**: Istniejące e2e karty zostają zielone z nową pulą obiektów (kolory nie zmieniają `data-card-key`, kolor kratki, druk).

**Contract**: `E2E_PORT=4399 npx playwright test tests/e2e/copy-drawing.spec.ts` na projektach Chromium.

### Success Criteria:

#### Automated Verification:

- `E2E_PORT=4399 npx playwright test tests/e2e/copy-drawing.spec.ts` przechodzi na projektach `chromium`, `phone-360`, `pixel-7`, `tablet-768`
- `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check` i `npm run build` przechodzą

#### Manual Verification:

- Wydruk karty z kształtem w kolorach i odbitym, na każdym poziomie, to jedna strona A4 w Safari, Chrome iOS i Brave iOS; kolory czytelne, na trudnym (kratka 5 mm) też
- Wydruk dyktanda z nowymi rysunkami (renifer, ciężarówka, helikopter, dinozaur, skarpeta) to jedna strona A4, a polecenia prowadzą po obrysie
- Strona `/copy-drawing` na telefonie: Generuj i Drukuj nie nachodzą na siebie, karta mieści się w podglądzie
- Przed PR-em fazy: `/10x-impl-review copy-drawing-asymmetric-shapes` i poprawki z przeglądu

---

## Testing Strategy

### Unit Tests:

- Kształty: litery kredek, `onCopyDrawing`, błąd nieznanej litery, obrys prosto i odbity (istniejące).
- Karta: wzór kształtu na każdym poziomie, odbicie, wyśrodkowanie, klucze różne i klucz szablonu bez zmian, reguły `not-silhouette` dla kształtu.
- Generator: każdy poziom i kategoria, mieszanka szablonów i kształtów, wybór obiektu z równą szansą, wyczerpanie prób, czas 200 kart.
- Kolory: kredka litery, odbite kolory, dziury białe, kolor tylko na kratkach wzoru.
- Silnik: nowy przypadek `knownBad`.

### Integration Tests:

- E2E `tests/e2e/copy-drawing.spec.ts` bez zmian zachowania.

### Manual Testing Steps:

1. Na `/copy-drawing` przejść łatwy, średni i trudny w „Wszystkie”, „Zwierzęta” i „Boże Narodzenie”, z kolorami i bez; porównać kilka kształtów z `preview.html`.
2. Na `/dictation` sprawdzić pięć przerysowanych kształtów z „Pokaż rozwiązanie”.
3. Wydrukować kartę z kształtem w kolorach i odbitym w Safari, Chrome iOS i Brave iOS.

## Performance Considerations

Pula rośnie o 15 kształtów; jedna próba to jedna bitmapa, więc koszt Generuj się nie zmienia. Test 200 kart w mniej niż 2 s zostaje.

## Migration Notes

Karta nie jest zapisywana (US-08), więc zmiana `CopyDrawingCard` nie wymaga migracji. Klucz szablonów zostaje taki sam; karta kształtu ma nowy klucz, nigdy wcześniej nie wydany.

## References

- Makieta: `context/changes/copy-drawing-asymmetric-shapes/mockup.mts`, `mockup-colors.json` (podgląd `preview.html`, nie do commitu)
- Zmiana: `context/changes/copy-drawing-asymmetric-shapes/change.md`
- PRD: US-27, US-28, FR-037, Business Logic „Karta „Skopiuj obrazek”” i „Karta dyktanda graficznego”
- Glosariusz: „Kształt dyktanda” w `context/domain/glossary.md`
- Roadmapa: S-55 w `context/foundation/roadmap.md`
- Wcześniejsze zmiany karty: `context/archive/2026-11-09-copy-the-drawing-card/`, `context/archive/2026-11-09-copy-drawing-colors/`, `context/archive/2026-11-13-gh363-copy-drawing-fill/`
- Wzór losowania kształtów z odbiciem: `src/lib/dictation/generate.ts:116-121`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Kolorowe kształty dyktanda

#### Automated

- [x] 1.1 `npm test` przechodzi, w tym nowe testy liter i `onCopyDrawing` i dotychczasowe testy obrysu kształtów (prosto i odbite, `maxCommands`) — 262da3f3
- [x] 1.2 `npm run lint` przechodzi — 262da3f3
- [x] 1.3 `npm run depcruise` przechodzi — 262da3f3
- [x] 1.4 `npx astro check` przechodzi — 262da3f3
- [x] 1.5 `npm run build` przechodzi — 262da3f3
- [x] 1.6 `npm run thumbnails` zmienia najwyżej `public/thumbnails/dyktando.svg` — 262da3f3

#### Manual

- [x] 1.7 Strona dyktanda (`/dictation`) pokazuje nowe rysunki renifera (trudny), ciężarówki (średni, trudny), helikoptera (średni), dinozaura i skarpety; obrys jest czytelny, a „Pokaż rozwiązanie” rysuje kreskę po obrysie — 262da3f3
- [x] 1.8 Przed PR-em fazy: `/10x-impl-review copy-drawing-asymmetric-shapes` i poprawki z przeglądu

### Phase 2: Kształty na karcie „Skopiuj obrazek”

#### Automated

- [x] 2.1 `npm test` przechodzi, w tym nowe testy karty kształtu, generatora, kolorów i silnika — 5f140220
- [x] 2.2 `npm run lint` przechodzi — 5f140220
- [x] 2.3 `npm run depcruise` przechodzi — 5f140220
- [x] 2.4 `npx astro check` przechodzi — 5f140220
- [x] 2.5 `npm run build` przechodzi — 5f140220
- [x] 2.6 `npm run thumbnails` zmienia najwyżej `public/thumbnails/kopiuj.svg` — 5f140220
- [x] 2.7 Wąski Stryker na zmienionych zakresach `generate.ts`, `card.ts` i `colors.ts`, wynik w `reviews/stryker-results.md` — 5f140220

#### Manual

- [x] 2.8 Na `/copy-drawing` kolejne Generuj dają szablony i kształty na każdym poziomie; kształt odbity wygląda jak w makiecie, kolory po włączeniu zgadzają się z makietą, przełącznik nie zmienia karty — 5f140220
- [x] 2.9 Kategoria (np. Zwierzęta, Boże Narodzenie) daje kształty tylko ze swojej kategorii; klucz poziomy nie pada w „Domy i budowle” — 5f140220
- [x] 2.10 Przed PR-em fazy: `/10x-impl-review copy-drawing-asymmetric-shapes` i poprawki z przeglądu — 5f140220

### Phase 3: Wydruk próbny i staging

#### Automated

- [x] 3.1 `E2E_PORT=4399 npx playwright test tests/e2e/copy-drawing.spec.ts` przechodzi na projektach `chromium`, `phone-360`, `pixel-7`, `tablet-768` — 39ed8216
- [x] 3.2 `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check` i `npm run build` przechodzą — 39ed8216

#### Manual

- [x] 3.3 Wydruk karty z kształtem w kolorach i odbitym, na każdym poziomie, to jedna strona A4 w Safari, Chrome iOS i Brave iOS; kolory czytelne, na trudnym (kratka 5 mm) też — 39ed8216
- [x] 3.4 Wydruk dyktanda z nowymi rysunkami (renifer, ciężarówka, helikopter, dinozaur, skarpeta) to jedna strona A4, a polecenia prowadzą po obrysie — 39ed8216
- [x] 3.5 Strona `/copy-drawing` na telefonie: Generuj i Drukuj nie nachodzą na siebie, karta mieści się w podglądzie — 39ed8216
- [x] 3.6 Przed PR-em fazy: `/10x-impl-review copy-drawing-asymmetric-shapes` i poprawki z przeglądu — 39ed8216
