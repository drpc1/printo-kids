# S-34 Karta „Który nie pasuje” Implementation Plan

## Overview

Dokładamy ósmy rodzaj karty: „Który nie pasuje” (GitHub drpc1/printo-kids#265, roadmap S-34, PRD US-25, US-26, FR-035, FR-036). Karta ma rzędy obrazków, a w każdym rzędzie dokładnie jeden obrazek łamie regułę rzędu (kształt, rozmiar, liczba, kolor po włączeniu kolorów, kategoria obiektu). Dziecko zakreśla ten obrazek. Są trzy poziomy (łatwy / średni / trudny) i przełącznik „Kolory”. Profil pamięta poziom i kolory, karta ma miniaturę w katalogu i opis w „Jak to działa”, a postać stoi przy poleceniu.

Plan wynika z makiet zatwierdzonych przez użytkowniczkę 2026-11-08 (`mockup.mts`, `icons.mts`, `mockup-*.svg` w tym folderze). Makiety zmieniły trzy rzeczy względem PRD: zamiast pikselowych sylwetek z katalogu szablonów reguła kategorii używa nowych ikon wektorowych, poziomy różnią się rozpraszaczami i subtelnością różnic, a przełącznik „Kolory” układa nową kartę.

## Current State Analysis

Wzorcem jest karta „Kto ma więcej?” (S-33), ostatnia dodana i jedyna z poziomami łatwy/średni/trudny oraz przełącznikiem kolorów (`research.md`, „Miejsca, które dotyka nowa karta”):

- moduł `src/lib/money/` (`levels.ts`, `rules.ts`, `generate.ts`, `engine.ts`, `layout.ts`, `sheet.ts`, `colors.ts` + testy),
- rejestr `src/lib/cards.ts:10` (`CARD_KINDS` z `description`), ustawienia `src/lib/card-settings.ts:37-92` i `levelIds` (`:194-212`), silniki `src/lib/card-engines.ts` (`CardTypeMap`, `CARD_ENGINES` z `satisfies`), podsumowanie `src/lib/card-summary.ts:95-110`,
- strona `src/pages/money.astro` i island `src/components/MoneyGenerator.tsx` na `CardPage` / `useCardPage` / `useCardSettings` / `sheet-state`,
- miniatura `scripts/build-thumbnails.mjs:439-505`, test druku `src/lib/sheet/print-contract.test.ts:18,181-197`, reguła `.dependency-cruiser.cjs:139`, inwentarz silników `src/lib/card-engines.test.ts:225`, e2e `tests/e2e/money*.spec.ts` i tabele kart w `card-settings.spec.ts:69`, `profile-summary.spec.ts:26`, `phone-layout.spec.ts`, `phone-settings-rows.spec.ts`, `phone-toggle-align.spec.ts`, `character-speaks.spec.ts`.

Po S-33 testy i `scripts/smoke.mjs` biorą liczbę i adresy kart z katalogu, więc nowa karta nie wymaga zmiany liczb w testach.

Gotowe elementy: `sudokuShapePath` i `SUDOKU_SHAPES_4` (`src/lib/sudoku/shapes.ts:245`, `:22`) oraz dziewięć kredek `--symmetry-*` (`src/styles/global.css:60-68`). Katalog szablonów symetrii odpada dla tej karty: jego pikselowe sylwetki okazały się nieczytelne w rzędzie obrazków (decyzja użytkowniczki 2026-11-08).

## Desired End State

Na `/odd-one-out` rodzic wybiera poziom i kolory, klika Generuj i dostaje kartę A4: polecenie „Który nie pasuje? Zakreśl go.” z postacią w dymku oraz 5 albo 6 rzędów obrazków w ramkach. W każdym rzędzie jest dokładnie jedna odpowiedź. Karta jest jedną stroną A4 z marginesem 10 mm, bez odpowiedzi. Zmiana poziomu albo kolorów przy pokazanej karcie układa nową kartę. Profil pamięta poziom i kolory, katalog pokazuje miniaturę i plakietkę, a „Jak to działa” opisuje kartę. `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`, smoke i e2e są zielone.

### Key Discoveries:

- Mechanizm „zmiana ustawienia układa nową kartę” już istnieje: `applySettings` w `src/lib/sheet-state.ts:61-74` rysuje nową kartę, gdy zmieni się `contentKey`. Wystarczy, że `contentKey` tej karty zawiera kolory, a przełącznik woła `applySettings` (w money kolory są ozdobą i nie wchodzą do `contentKey`, `src/lib/money/engine.ts`).
- Inwentarz silników (`card-engines.test.ts:225`) dzieli ustawienia na `content` i `decoration`. Tu kolory należą do `content`, a `decoration` jest puste.
- Rejestr `CARD_ENGINES` (`card-engines.ts`) i `kindsAndSettingsAgree` wymagają, żeby id karty było naraz w `CARD_KINDS`, `CardSettingsMap` i `CARD_ENGINES`. Dlatego moduł logiki (faza 2) wchodzi bez rejestracji, a rejestracja razem ze stroną (faza 3), żeby katalog nie linkował do nieistniejącej strony.
- `astro/no-set-html-directive` jest błędem ESLint. Ikony nie mogą więc być wklejanym tekstem SVG (jak w makiecie): mają być danymi (lista prostych figur), które rysuje React na stronie i skrypt miniatury.
- Wysokość druku mierzy się osobno w Safari, Chrome iOS i Brave iOS (`context/foundation/lessons.md`).

## What We're NOT Doing

- Przełącznik „Pokaż rozwiązanie”: karta go nie ma (decyzja 2026-11-08, jak „Kto ma więcej?” i sekwencje).
- Sylwetki z katalogu szablonów symetrii w regule kategorii ani kategoria „Kształty”.
- Reguła „sekwencja AB/AAB” (roadmap, Parking lot).
- Testy mutacyjne Stryker dla generatora. Reguły pokrywają testy jednostkowe z ręcznym oraklem; ewentualny Stryker należy do #263.
- Opis poziomów w akapicie „Poziomy” strony „Jak to działa” i jego test zgodności (S-37). Ta zmiana dokłada tylko `description` karty w `CARD_KINDS`.
- Osobna bramka wydruku przed stroną: wydruk na papierze sprawdza użytkowniczka na gotowej stronie, w fazie 3 (decyzja 2026-11-08).

## Implementation Approach

Trzy fazy, każda w osobnej gałęzi i osobnym PR-ze do `main`. Przed każdym PR-em uruchamiamy `/10x-impl-review`, a niczego nie scalamy samodzielnie. Faza 1 aktualizuje PRD, żeby kod nie wyprzedzał zapisanych decyzji. Faza 2 to czysta logika z testami. Faza 3 podpina kartę do produktu.

Decyzje z makiet i planowania (2026-11-08):

- Id `niepasuje`, strona `/odd-one-out`, tytuł „Który nie pasuje”, polecenie „Który nie pasuje? Zakreśl go.”. Poziomy `latwy` / `sredni` / `trudny`, domyślnie `sredni`. Ustawienia: `level`, `colors` (domyślnie wyłączone).
- Cechy obrazka: kształt (koło, kwadrat, trójkąt, serce, krzyżyk: `SUDOKU_SHAPES_4`), rozmiar (duży / mały), liczba (grupa 1–6 sztuk ułożona jak oczka kostki), kolor (kredka, tylko z kolorami), kategoria (ikona wektorowa, tylko na trudnym).
- Poziomy (wartości startowe; potwierdza wydruk w fazie 3):

| Poziom | Obrazków / rzędów | Reguły                                       | Rozpraszacze            | Mały / duży | Grupy w regule liczby            |
| ------ | ----------------- | -------------------------------------------- | ----------------------- | ----------- | -------------------------------- |
| łatwy  | 4 / 5             | kształt, rozmiar                             | brak (reszta jednakowa) | 0,5         | —                                |
| średni | 5 / 5             | kształt, rozmiar, liczba, kolor (z kolorami) | 1 cecha parami          | 0,55        | większość 2 albo 3, odstający ±1 |
| trudny | 6 / 6             | wszystkie, w tym kategoria                   | 2 cechy parami          | 0,72        | większość 4 albo 5, odstający ±1 |

- Rozpraszacz to cecha inna niż reguła rzędu, która zmienia się tak, że każda jej wartość występuje w rzędzie co najmniej dwa razy, więc niczego nie wskazuje. Rozpraszaczami mogą być kolor (tylko z kolorami), kształt i rozmiar. Liczba nie jest rozpraszaczem. W rzędzie kategorii jedynym rozpraszaczem jest rozmiar, bo ikony zostają czarne.
- Jednoznaczność rzędu (reguła sprawdzana przez `problems`): cecha reguły ma dokładnie jeden obrazek z wartością występującą w rzędzie raz (to jest odpowiedź), a każda inna cecha nie ma żadnego takiego obrazka. Kształt nie jest sprawdzany w rzędzie kategorii (każda ikona jest inna). Bez kolorów żaden obrazek nie ma kredki, a reguła „kolor” nie występuje.
- Liczba rozpraszaczy to górna granica: rząd dostaje najwyżej tyle rozpraszaczy, ile mówi poziom, i tyle, ile cech jest dostępnych (np. trudny bez kolorów w rzędzie kształtu ma tylko rozmiar, a rząd kategorii zawsze tylko rozmiar). `problems` nie sprawdza liczby rozpraszaczy, tylko jednoznaczność.
- Rozkład reguł: każda reguła poziomu (zależna od kolorów) występuje na karcie co najmniej raz, pozostałe rzędy są losowe, a dwa sąsiednie rzędy nie mają tej samej reguły. Jedna karta nie pokazuje dwa razy tego samego rzędu, a kolejna karta ma inny `key` niż poprzednia.
- Rząd kategorii: n−1 różnych ikon jednej kategorii i jedna ikona innej kategorii. Pięć kategorii po 5 ikon (Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny, Domy i budowle; lista w `icons.mts`), więc większość w rzędzie trudnego (5 ikon) zawsze się mieści.
- Kolory układają nową kartę (odstępstwo od US-26, poprawione w fazie 1): `contentKey` = poziom + kolory.

## Critical Implementation Details

- **Ikony jako dane, nie tekst SVG.** Ikona to lista prostych figur w pudełku 100×100 (koło, elipsa z opcjonalnym obrotem, prostokąt z opcjonalnym zaokrągleniem, wielokąt, ścieżka `d`, linia), każda z tonem `ink` (sylwetka) albo `paper` (biały detal). Strona rysuje ton przez `var(--foreground)` / `var(--card)`, a skrypt miniatury przez `#000` / `#fff`. Nie ma `dangerouslySetInnerHTML` ani hexów w komponentach. Kształty i współrzędne przenosimy z `icons.mts` (makieta zatwierdzona) z poprawkami z makiety: większe odstępy w grupach oraz grubszy banan.
- **Kredki karty.** Reguła i rozpraszacz koloru losują z siedmiu kredek `--symmetry-*`: red, blue, green, orange, purple, yellow, brown. Gray i black odpadają, bo mylą się z konturem w druku.

## Faza 1: PRD zgodne z makietą

### Overview

Zapisujemy w PRD decyzje z makiet i planowania. Zmiana dotyczy tylko `context/`, więc CI pomija joby `ci`, `smoke` i `e2e`.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: US-25 i Business Logic „Karta „Który nie pasuje””: kategoria obiektu to proste ikony wektorowe w pięciu kategoriach (po pięć obiektów), a nie sylwetki z katalogu szablonów. Zdanie o obiektach z kilkoma kategoriami odpada, bo ikona ma jedną kategorię. W Business Logic zmieniają się oba zdania o regule kategorii (lista reguł z „kategoria obiektu (czarna sylwetka z katalogu szablonów)” oraz „przy kategorii obiektu to czarne sylwetki z katalogu szablonów”), a „kolor (dziewięć kredek z sudoku)” zamienia się na siedem kredek (bez szarej i czarnej). US-26, FR-036 i tabela poziomów dostają nowy opis: liczba obrazków, rozpraszacze, subtelność rozmiaru, grupy w regule liczby. Przełącznik „Kolory” na tej karcie układa nową kartę, bo kolor jest częścią zadania: zmiana w US-26, w Business Logic oraz wyjątek w zdaniu US-22 „Zmiana postaci, kolorów i „Pokaż rozwiązanie” nie układa nowej karty”. Open Questions 14 dostaje notę, że wartości „Który nie pasuje” potwierdza wydruk po S-34.

**Contract**: Sekcje US-25, US-26, US-22 (jedno zdanie), FR-035, FR-036, Business Logic „Karta „Który nie pasuje””, Open Questions 14. Każda zmiana z datą 2026-11-08 i odnośnikiem „GitHub 265”, jak przy innych decyzjach.

#### 2. Roadmapa

**File**: `context/foundation/roadmap.md`

**Intent**: S-34 ma status `planning` (ustawiony przy planowaniu); faza 1 commituje go razem z PRD, a `/10x-implement` przestawi go na `in-progress`.

**Contract**: Wiersz S-34 w „At a glance” i linia `- **Status:**` w bloku S-34.

### Success Criteria:

#### Automated Verification:

- Prettier akceptuje pliki: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md`
- PRD nie zawiera już sylwetek z katalogu szablonów w regule kategorii tej karty: `rg -n "kategori\w* obiektu \(czarna sylwetka|przy kategorii obiektu to czarne sylwetki|kolor \(dziewięć kredek z sudoku\)" context/foundation/prd.md` nie zwraca nic

#### Manual Verification:

- Użytkowniczka czyta zmienione zdania PRD i potwierdza, że oddają makietę (ikony, poziomy, kolory układają nową kartę)

**Implementation Note**: Po fazie 1 zatrzymaj się na potwierdzenie przed fazą 2.

---

## Faza 2: Logika karty

### Overview

Moduł `src/lib/odd-one-out/` bez UI i bez rejestracji w katalogu: poziomy, ikony, cechy i jednoznaczność, generator, silnik, układ A4. Wszystko pokryte testami.

### Changes Required:

#### 1. Poziomy

**File**: `src/lib/odd-one-out/levels.ts`, `levels.test.ts`

**Intent**: `ODD_ONE_OUT_LEVELS` z wartościami z tabeli w „Implementation Approach”: `id`, `label`, `barLabel`, `description` (pół zdania o tym, co zmienia poziom, bez wieku), liczba obrazków i rzędów, reguły, liczba rozpraszaczy, stosunek małego obrazka do dużego, liczebności grup. Do tego `DEFAULT_ODD_ONE_OUT_LEVEL_ID = "sredni"`, `oddOneOutLevelById` i `rulesFor(level, colors)` (kolor tylko z kolorami).

**Contract**: Kształt jak `MONEY_LEVELS` (`src/lib/money/levels.ts`); `OddOneOutLevelId = "latwy" | "sredni" | "trudny"`.

#### 2. Ikony

**File**: `src/lib/odd-one-out/icons.ts`, `icons.test.ts`

**Intent**: 25 ikon z makiety jako dane (patrz „Critical Implementation Details”), z `id`, nazwą (tylko do testów i komentarzy, nie na karcie) i kategorią.

**Contract**: `IconCategory = "zwierzeta" | "jedzenie" | "przyroda" | "kosmos" | "budowle"`; każda kategoria ma co najmniej 5 ikon (test); każda figura mieści się w pudełku 0–100 (test); ikona ma co najmniej jedną figurę `ink`.

#### 3. Cechy, reguły i karta

**File**: `src/lib/odd-one-out/rules.ts`, `rules.test.ts`

**Intent**: Typy obrazka, rzędu i karty, funkcja „samotników” cechy i `oddOneOutCardProblems(card, level, colors)` sprawdzające: liczbę rzędów i obrazków, jednoznaczność każdego rzędu, zgodność `answer` z samotnikiem reguły, regułę z listy poziomu i kolorów, brak kredek bez kolorów, rząd kategorii z n−1 ikonami jednej kategorii, każdą regułę poziomu co najmniej raz, różne reguły w sąsiednich rzędach i brak powtórzonego rzędu.

**Contract**:

```ts
type OddRule = "shape" | "size" | "count" | "color" | "category";
interface OddItem {
  shape: SudokuShapeId | null; // null = ikona
  icon: string | null; // id ikony
  size: "big" | "small";
  count: number; // 1–6
  crayon: OddCrayon | null; // null bez kolorów
}
interface OddRow {
  rule: OddRule;
  items: readonly OddItem[];
  answer: number;
}
interface OddOneOutCard {
  levelId: OddOneOutLevelId;
  colors: boolean;
  rows: readonly OddRow[];
  key: string;
}
```

Kody problemów są stabilne (np. `ambiguous-row`, `answer`, `rule-not-in-level`, `crayon-without-colors`, `missing-rule`, `adjacent-rule`, `duplicate-row`, `row-count`, `row-size`, `category-row`). Testy mają ręcznie wpisane rzędy dobre i złe (oracle ręczny, bez przepisywania funkcji samotników).

#### 4. Generator i silnik

**File**: `src/lib/odd-one-out/generate.ts`, `generate.test.ts`, `engine.ts`, `engine.test.ts`

**Intent**: `generateOddOneOutCard(random, previousKey, level, colors)` losuje rozkład reguł, a potem każdy rząd: podstawę, odstający obrazek i rozpraszacze. Odrzuca rząd, który nie przechodzi jednoznaczności, i kartę, która nie przechodzi `oddOneOutCardProblems`; po `MAX_ATTEMPTS` zwraca `null`. Silnik ma kształt `moneyEngine`: `null` → `CardExhausted`, wynik przez `VerifiedCard.require`. `contentKey` = `${level}|${colors}`. `knownBad`: co najmniej rząd dwuznaczny (rozpraszacz z samotnikiem), kredka bez kolorów i powtórzony rząd.

**Contract**: `oddOneOutEngine: CardEngine<OddOneOutSettings, OddOneOutCard>`, `oddOneOutSpec.kind = "niepasuje"`. Typy `CardKindId` i `OddOneOutSettings` są potrzebne przed rejestracją: `OddOneOutSettings { level; colors }` żyje w `card-settings.ts` (bez wpisu w `CardSettingsMap` do fazy 3), a `kind` w fazie 2 rzutujemy tak jak `TOY` w `card-contract.test.ts`. Faza 3 usuwa rzutowanie. Generator dla każdego poziomu i obu wartości kolorów daje kartę w 200 losowaniach z różnymi ziarnami bez `null` (test, także czas: 200 kart poniżej 2 s).

#### 5. Układ A4

**File**: `src/lib/odd-one-out/sheet.ts`, `layout.ts`, `layout.test.ts`

**Intent**: Stałe rysunku w mm (strona, margines 10 mm, pas postaci 26 mm, odstęp 6 mm, odstęp rzędów, ramka rzędu, grubość konturu, układ grup) oraz `layoutOddOneOutSheet` (pozycja rzędów i pól obrazków) i `groupOffsets(count)` (oczka kostki). Czytają je strona, test druku i skrypt miniatury.

**Contract**: Test: rzędy każdego poziomu mieszczą się w marginesie 10 mm; pole obrazka ma co najmniej 25 mm na trudnym; kształty grupy 6 na trudnym, w rozmiarze małym i dużym, nie nachodzą na siebie (prostokąty otaczające rozłączne) i mieszczą się w polu.

#### 6. Testy i granice

**File**: `package.json` (lista `test`), `.dependency-cruiser.cjs:139`

**Intent**: Nowe pliki testów w skrypcie `test`; `odd-one-out` w regule `cards-only-through-engines`.

**Contract**: `npm test` uruchamia wszystkie nowe testy.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Zależności przechodzą: `npm run depcruise`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`

#### Manual Verification:

- Przegląd diffu: reguła jednoznaczności i rozpraszacze odpowiadają opisowi w „Implementation Approach”, a ikony odpowiadają makiecie

**Implementation Note**: Po fazie 2 zatrzymaj się na potwierdzenie przed fazą 3.

---

## Faza 3: Strona, katalog i profil

### Overview

Karta wchodzi do produktu: rejestracja, strona, island, miniatura, podsumowanie w profilu, testy druku i e2e. Ręczna część obejmuje sprawdzenie strony i wydruk na papierze.

### Changes Required:

#### 1. Rejestracja i ustawienia

**File**: `src/lib/cards.ts`, `src/lib/card-settings.ts`, `src/lib/card-engines.ts`, `src/lib/card-summary.ts`, `src/lib/odd-one-out/engine.ts`

**Intent**: Wpis `niepasuje` w `CARD_KINDS` (tytuł „Który nie pasuje”, `/odd-one-out`, miniatura, `description` w 2–3 zdaniach: co dziecko robi i co jest na kartce). `niepasuje` w `CardSettingsMap`, `CARD_SETTINGS_IDS`, `DEFAULTS` (`{ level: "sredni", colors: false }`) i `levelIds`, silnik w `CardTypeMap` i `CARD_ENGINES`, case w `summaryParts` (poziom, „kolory” w extras), usunięcie rzutowania `kind` z fazy 2.

**Contract**: Kształt jak `pieniadze` w każdym z tych plików. Katalog i „Jak to działa” czytają `CARD_KINDS`, więc karta trafia tam sama.

#### 2. Strona i island

**File**: `src/pages/odd-one-out.astro`, `src/components/OddOneOutGenerator.tsx`

**Intent**: Strona jak `money.astro`. Island jak `MoneyGenerator.tsx`: postać, poziom i „Kolory” na pasku, `CardPage`, `sheet-state`. Zmiana poziomu i zmiana kolorów wołają `applySettings`, więc przy pokazanej karcie układają nową. Uwaga: w `MoneyGenerator.tsx` przełącznik kolorów tylko zapamiętuje wartość, bo tam kolory są ozdobą. Tu handler kolorów działa jak handler poziomu (`memory.remember`, potem `applySettings` poza `waitingForChild`). SVG karty: pas z postacią i dymkiem albo samym poleceniem, ramki rzędów, kształty przez `sudokuShapePath` (kontur `var(--foreground)` na `var(--card)` bez kolorów, wypełnienie `var(--symmetry-*)` z kolorami), grupy z `groupOffsets`, ikony z danych. Komponenty rysujące ikonę i obrazek trzymamy w osobnym pliku `src/components/OddOneOutPicture.tsx`, jeśli island przekroczy rozmiar `MoneyGenerator.tsx`.

**Contract**: SVG ma `print:h-[297mm] print:w-[210mm] print:overflow-hidden` jak money; klasy przez `cn()`; brak hexów i palet Tailwind; `aria-label="Który nie pasuje"`.

#### 3. Miniatura

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/niepasuje.svg`

**Intent**: Miniatura z prawdziwego generatora (stałe ziarno, średni poziom bez kolorów, samo polecenie bez postaci) i stałych `sheet.ts`, jak blok money.

**Contract**: `node --experimental-strip-types scripts/build-thumbnails.mjs` tworzy `public/thumbnails/niepasuje.svg`; plik jest commitowany.

#### 4. Testy

**File**: `src/lib/sheet/print-contract.test.ts`, `src/lib/card-engines.test.ts`, `src/lib/card-settings.test.ts`, `src/lib/card-summary.test.ts`, `tests/e2e/odd-one-out.spec.ts`, `tests/e2e/odd-one-out-reprint.spec.ts`, tabele kart w `tests/e2e/card-settings.spec.ts`, `profile-summary.spec.ts`, `phone-layout.spec.ts`, `phone-settings-rows.spec.ts`, `phone-toggle-align.spec.ts`, `character-speaks.spec.ts`

**Intent**:

- Test druku: SVG 210×297 mm z `overflow-hidden`, ukryte kontrolki w druku, strona na wspólnym shellu.
- Inwentarz silników: wszystkie poziomy × kolory, `mayExhaust: () => false`, a kolory w `content`, nie w `decoration`.
- Ustawienia i podsumowanie: odczyt zapisanych ustawień, odrzucenie nieznanego poziomu, „kolory” w podsumowaniu.
- E2E strony: Generuj daje 5 albo 6 rzędów z właściwą liczbą obrazków; zmiana poziomu i zmiana kolorów układają nową kartę; karta trzyma margines 10 mm; plakietka w katalogu pokazuje poziom profilu; Generuj, Drukuj i Profil nie nachodzą na siebie na telefonie.
- Reprint: ostrzeżenie przed ponownym drukiem, wzorowane na `money-reprint.spec.ts`. Odwrotnie niż `sequence-reprint.spec.ts` i `symmetry-reprint.spec.ts`: zmiana postaci zostawia tę samą kartę, a przełącznik kolorów układa nową (i zdejmuje stan „już drukowana”).
- Tabele kart: wpis `niepasuje` tam, gdzie money ma wpis.

**Contract**: Wzorce `money.spec.ts` i `money-reprint.spec.ts`; plik e2e zaczyna się linią `// Provenance: odd-one-out-card (S-34, US-25, US-26, FR-035, FR-036)`.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Zależności przechodzą: `npm run depcruise`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- E2E nowej karty i tabel kart przechodzą na wolnym porcie: `E2E_PORT=4399 npx playwright test tests/e2e/odd-one-out.spec.ts tests/e2e/odd-one-out-reprint.spec.ts tests/e2e/card-settings.spec.ts tests/e2e/profile-summary.spec.ts tests/e2e/phone-layout.spec.ts tests/e2e/phone-settings-rows.spec.ts tests/e2e/phone-toggle-align.spec.ts tests/e2e/character-speaks.spec.ts tests/e2e/catalog.spec.ts tests/e2e/how-it-works.spec.ts`
- Sprawdzian HTTP przechodzi na zbudowanej stronie, jak w CI: po `npm run build` uruchom w tle `npm run preview -- --port 4399`, poczekaj, aż `curl -sf http://localhost:4399/` odpowie, potem `BASE_URL=http://localhost:4399 npm run smoke`

#### Manual Verification:

- Użytkowniczka otwiera `/odd-one-out`, generuje karty na każdym poziomie, z kolorami i bez, i potwierdza, że w każdym rzędzie widać jedną odpowiedź
- Użytkowniczka drukuje kartę łatwą, średnią z kolorami i trudną na A4 i potwierdza czytelność ikon, małych grup (4 wśród piątek) i różnicy rozmiaru na trudnym; nieczytelną ikonę wymieniamy na inny obiekt tej samej kategorii
- Druk jest jedną stroną w Safari, Chrome iOS i Brave iOS (pomiar w każdej osobno, `lessons.md`)
- Katalog pokazuje miniaturę i plakietkę poziomu przy profilu, a okno profilu pokazuje podsumowanie

**Implementation Note**: Po fazie 3 i potwierdzeniu wydruku plan jest zakończony; poprawki wartości po wydruku (rozmiar, liczebności, ikony) wchodzą w tę fazę.

---

## Testing Strategy

### Unit Tests:

- Jednoznaczność rzędu na ręcznie wpisanych rzędach: dobry rząd każdej reguły, rząd z dwoma samotnikami, rząd z samotnikiem w rozpraszaczu, rząd z kredką bez kolorów, rząd kategorii z ikoną spoza kategorii większości.
- Generator: dla każdego poziomu i kolorów każda reguła poziomu co najmniej raz, brak sąsiednich takich samych reguł, brak powtórzeń, inny `key` niż poprzedni, wartości cech w zakresie poziomu (liczebności grup, rozmiary).
- Silnik: `knownBad` odrzucony z oczekiwanym kodem (test żywotności w `card-engines.test.ts`).
- Układ: margines 10 mm, grupy bez nachodzenia.

### Integration Tests:

- E2E strony, reprintu i tabel kart (faza 3).

### Manual Testing Steps:

1. `/odd-one-out`: Generuj na każdym poziomie, z kolorami i bez; w każdym rzędzie wskazać odpowiedź.
2. Przełączyć „Kolory” przy pokazanej karcie: pojawia się nowa karta.
3. Wydruk A4 trzech kart (łatwa, średnia z kolorami, trudna); iOS: Safari, Chrome, Brave.

## Performance Considerations

Losowanie rzędu z odrzucaniem jest tanie (makieta: 27 rzędów bez zauważalnego czasu). Test generatora pilnuje, że 200 kart powstaje poniżej 2 s, daleko pod limitem 5 s z PRD.

## Migration Notes

Nowe pole `niepasuje` w `cards` profilu i ostatnich parametrów. Starsze zapisy go nie mają, więc karta startuje z ustawieniami domyślnymi (`parseCardSettings` zostawia brakującą kartę pustą).

## References

- Badanie: `context/changes/odd-one-out-card/research.md`
- Makiety: `context/changes/odd-one-out-card/mockup.mts`, `icons.mts`, `mockup-*.svg`, `mockups.html`
- Wzorzec karty: `src/lib/money/engine.ts`, `src/components/MoneyGenerator.tsx`, `context/archive/2026-11-01-coins-who-has-more/plan.md`
- Issue: drpc1/printo-kids#265

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: PRD zgodne z makietą

#### Automated

- [x] 1.1 Prettier akceptuje pliki: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md`
- [x] 1.2 PRD nie zawiera już sylwetek z katalogu szablonów w regule kategorii tej karty

#### Manual

- [x] 1.3 Użytkowniczka potwierdza, że zmienione zdania PRD oddają makietę

### Phase 2: Logika karty

#### Automated

- [ ] 2.1 Testy jednostkowe przechodzą: `npm test`
- [ ] 2.2 Lint przechodzi: `npm run lint`
- [ ] 2.3 Zależności przechodzą: `npm run depcruise`
- [ ] 2.4 Typy przechodzą: `npx astro check`
- [ ] 2.5 Build przechodzi: `npm run build`

#### Manual

- [ ] 2.6 Przegląd diffu: jednoznaczność, rozpraszacze i ikony zgodne z planem i makietą

### Phase 3: Strona, katalog i profil

#### Automated

- [ ] 3.1 Testy jednostkowe przechodzą: `npm test`
- [ ] 3.2 Lint przechodzi: `npm run lint`
- [ ] 3.3 Zależności przechodzą: `npm run depcruise`
- [ ] 3.4 Typy przechodzą: `npx astro check`
- [ ] 3.5 Build przechodzi: `npm run build`
- [ ] 3.6 E2E nowej karty i tabel kart przechodzą na wolnym porcie
- [ ] 3.7 Sprawdzian HTTP przechodzi na zbudowanej stronie

#### Manual

- [ ] 3.8 Użytkowniczka sprawdza karty na każdym poziomie, z kolorami i bez
- [ ] 3.9 Wydruk A4 trzech kart: czytelność ikon, małych grup i rozmiaru
- [ ] 3.10 Druk jest jedną stroną w Safari, Chrome iOS i Brave iOS
- [ ] 3.11 Katalog pokazuje miniaturę i plakietkę, a okno profilu podsumowanie
