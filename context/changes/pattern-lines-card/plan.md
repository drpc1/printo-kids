# S-36 Karta „Szlaczki” Implementation Plan

## Overview

Dokładamy dziesiąty rodzaj karty „Szlaczki” (roadmap S-36, PRD US-29, US-30, FR-039, FR-040, Business Logic „Karta szlaczków”, Open Questions 15), ostatnią z czterech kart M-5. Karta ma cztery poziomy (Poziom 1–4) w trzech trybach: kropki (P1–P2), dwa powtórzenia po kropkach i dalej samo (P3), kontynuacja wzoru linią w liniaturze (P4). Rzędów jest 4 / 5 / 6 / 7, wzór każdego rzędu jest losowany z puli poziomu z losowaną długością kroku i łagodnością. Na P3–P4 pasek ma przełącznik „Linie” (domyślnie włączony, zapamiętany w profilu, nie układa nowej karty). Karta nie ma obrazków; postać stoi przy poleceniu.

Plan wynika z `frame.md` (decyzje użytkowniczki 2026-11-09), PRD (już zmienionego według frame) i `research.md`. Geometria wzorów, parametry poziomów i rozkład rzędów są w `mockup-v6.mts`; plan przenosi je do modułu produktu, naprawia trzy rzeczy, które wyszły z pomiaru makiety (zlewające się kropki, zbyt bliskie kropki ostrych wzorów, skrzyżowania w części wykropkowanej P3), i oddziela stałe druku do jednego pliku, bo wartości są startowe i zmieni je wydruk.

## Current State Analysis

- Baza: `origin/main` 2cc8520, S-33, S-34 i S-35 w kodzie. Wzorcem kształtu modułu jest `src/lib/copy-drawing/` (levels / generate / engine / layout / sheet / card), wzorcem silnika z `knownBad` `src/lib/odd-one-out/engine.ts`, wzorcem przełącznika widocznego na części poziomów sudoku (`sudokuHasSymbolChoice`, `SudokuGenerator.tsx:100-135`, `normalizeSudoku`). Lista miejsc do wpisania karty: `research.md`, część (a).
- Szlaczki nie mają katalogu szablonów ani siatki. Wszystko, co robi `nonogramImage` w S-35, tu nie istnieje; karta to czysta geometria w mm.
- `fieldValue` w `card-settings.ts` rozpoznaje pole boolean wyłącznie po nazwie `colors`; nowe pole `lines` wymaga dopisania.
- Wszystkie testy zbiorcze (`catalog.spec.ts`, `how-it-works.spec.ts`, `smoke.mjs`, `cards.test.ts`, plakietki) biorą karty z katalogu (S-33), więc nowa karta nie zmienia liczb w tych testach.
- `card-engines.test.ts` ma pole `decoration` (ustawienia, które nie zmieniają karty); dotąd puste dla kart bez kolorów, tu pierwszy raz sprawdza przełącznik „Linie” z `decoration: [{ lines: false }]`.
- Makieta v6 ma też wady, które trzeba poprawić przy przenoszeniu (pomiar na 400 ziarnach × 4 poziomy, `research.md`, „Pomiar makiety”): kropki 0,5–1,0 mm od siebie na końcach gładkich odcinków, kropki z różnych ramion 1,9–2,4 mm od siebie (`pointed`, `bricks`), kolumna „Wysokość / krok” P4 w PRD nie odpowiada liniaturze, `[...pool].sort(() => random() - 0.5)` jako tasowanie.

## Desired End State

Na `/patterns` rodzic wybiera poziom (a na P3–P4 przełącznik „Linie”), klika Generuj i dostaje kartę A4: zdanie polecenia (w dymku postaci albo samo) i 4–7 rzędów szlaczków rozłożonych równo do dołu kartki, w trybie zgodnym z poziomem. Karta jest jedną stroną A4 z marginesem 10 mm; wzory nie wychodzą z rzędu ani za margines; w trybie kropek ścieżka się nie krzyżuje. Zmiana poziomu przy pokazanej karcie układa nową kartę, „Linie” i postać nie. Profil pamięta poziom i „Linie”, katalog ma miniaturę i plakietkę „poz. N”, „Jak to działa” opisuje kartę. `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`, smoke i e2e są zielone. Wydruk próbny i próba z dzieckiem potwierdziły (albo poprawiły) stałe w `sheet.ts`.

### Key Discoveries:

- Wszystkie wzory P1–P2 mają zero skrzyżowań (400 ziarn), ale w części wykropkowanej P3 krzyżują się `loops` i `oChain` z konstrukcji (pętla przecina sama siebie). To jedyny konflikt z regułą „kropki bez skrzyżowań”; reguła w teście dotyczy P1–P2.
- Skrajne `x` wzorów to 0,0…184 mm, więc „pętle cofają się w lewo” nie wychodzą za początek jednostki; test to zamraża.
- Na P4 wysokość wzoru wyznacza liniatura (X = 6,5 mm), nie `ratio`; jedyną losowaną wielkością jest krok 12–20 mm.
- Wolna przerwa między skrajami rzędów to 25–49 mm, więc rozkład równomierny nie grozi zachodzeniem rzędów; P1 ma dodatkowe 15 mm zapasu na dole.
- `phone-settings-rows` i `phone-toggle-align` muszą wejść na poziom, na którym przełącznik „Linie” jest widoczny; domyślny poziom (P2) go nie ma.

## What We're NOT Doing

- Obrazki startu i celu w rzędach, kategorie, pole „Brak”, kontury i kolory (osobna zmiana, szkic w `issue-draft.md`); przełącznik „Kolory” (decyzja 2026-11-09).
- Ocena rysunku dziecka. Test sprawdza regułę wzoru i geometrię, nie to, czy dziecko trafiło.
- Odrzucone wzory: kreski pionowe i skośne, fala po skosie, pierścienie, piramidki, błyskawice, motywy z postaciami i znakami towarowymi (nie kopiujemy `bolt` ani `pyramid` z makiety).
- Opis poziomów w akapicie „Poziomy” strony „Jak to działa” i jego test zgodności (S-37); ta zmiana dokłada tylko `description` karty w `CARD_KINDS`.
- Zmiana PRD poza korektą kolumny P4 i zapisem wyników wydruku (faza 1 i 4); Stryker nie jest bramką.

## Implementation Approach

Cztery fazy. Fazy 1–3 mają osobne gałęzie i PR-y do `main`; niczego nie scalamy samodzielnie. **Faza 4 (ręczna weryfikacja) nie ma własnego PR-a:** poprawki stałych z wydruku i próby z dzieckiem idą jako commity do gałęzi fazy 3, a użytkowniczka scala PR fazy 3 dopiero po fazie 4. Przed każdym PR-em fazy uruchamiamy `/10x-impl-review` (w briefie każdej fazy).

Decyzje przyjęte w planie (do potwierdzenia przy `/10x-plan-review`, wszystkie odwracalne):

- Id `szlaczki`, strona `/patterns`, tytuł „Szlaczki”. Poziomy `poziom1` … `poziom4` (etykieta „Poziom N”, `barLabel` „N”, plakietka „poz. N”). Ustawienia: `level`, `lines`. **Domyślny poziom: Poziom 2** (5–6 lat, kropki, bez przełącznika), `lines: true`.
- `contentKey(settings) = level`; `lines` jest dekoracją, postać też. Zmiana poziomu układa nową kartę.
- Karta niesie specyfikację rzędów (id wzoru, krok, wysokość, liczba powtórzeń), nie ścieżki. Ścieżki liczy czysta `rowGeometry(row, level, lines)` używana przez komponent i test.
- **P3, pętle i kółeczka w części wykropkowanej zostają** (skrzyżowania z konstrukcji; szara ścieżka pokazuje kierunek), test „bez skrzyżowań” dotyczy P1–P2. Próba z dzieckiem w fazie 4 rozstrzyga, czy wzory wypadają z puli P3 (zostają w P4).
- Polecenie zależy od trybu (teksty z makiety): P1–P2 „Prowadź ołówek po kropkach.”, P3 „Poprowadź po kropkach, potem rysuj dalej sam.”, P4 „Dokończ szlaczek do końca linii.”. Wartości w `sheet.ts`, jedno zdanie na poziom; test postaci bierze zdanie domyślnego poziomu.
- Szarości (ścieżka pod kropkami, linie pomocnicze, liniatura): istniejące tokeny `muted-foreground` i `border`; jeśli kontrast nie wystarcza na wydruku, nowy token w `src/styles/global.css`. Bez hexów w komponencie.
- Tasowanie puli: Fisher–Yates na kopii, `random` z argumentu.
- Stałe druku w jednym pliku `src/lib/pattern-lines/sheet.ts`: promień i rozstaw kropek, kółko startu, grubości linii, ścieżka pod kropkami, linie pomocnicze, liniatura X, `bottomPad`, odstępy. Strona, test druku, skrypt miniatur i podgląd czytają tylko stąd.

## Faza 1: Dokumenty zgodne z planem

### Overview

Zmiana tylko w `context/`, więc CI pomija `ci`, `smoke` i `e2e`. Usuwa rozjazdy zanim kod zacznie z nich korzystać.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: Tabela poziomów w „Karta szlaczków” mówi o P4 „Wysokość / krok 0,6–1,0”, a rysunek ma wysokość z liniatury. Zapisujemy to, co zatwierdzona makieta rysuje: na P4 wysokość wyznacza liniatura (małe elementy 6,5 mm, wysokie 13 mm), a losowany jest tylko krok 12–20 mm. Dopisujemy jedno zdanie o P3: pętle i kółeczka w części wykropkowanej mogą się krzyżować (reguła „bez skrzyżowań” dotyczy trybu samych kropek, P1–P2). Wpis o stałych druku (jeden plik) nie wchodzi do PRD.

**Contract**: Business Logic „Karta szlaczków” (tabela poziomów, akapit „Reguły, które generator sprawdza”), US-29 (drugi punkt kryteriów o skrzyżowaniach). Zmiany z datą 2026-11-09 i odnośnikiem „S-36 plan”.

#### 2. Roadmapa i słownik

**File**: `context/foundation/roadmap.md`, `context/domain/glossary.md`

**Intent**: Blok S-36 mówi o „ośmiu rzędach”; ma być 4–7. Status `ready` → `planning` (faza 1 commituje go razem z PRD, `/10x-implement` przestawi na `in-progress`). Dwie „Unknowns” dostają odpowiedź (wydruk próbny i dwa tryby na jednym pasku: opis poziomu mówi tryb). W słowniku wiersz „zaplanowane… nie twórz ich nazw w kodzie” traci wszystkie trzy karty: S-34 i S-35 są wdrożone, S-36 ma otwarty kamień; dopisz terminy: szlaczek, liniatura, tryb kropek (nazwy w kodzie: `PatternLines*`, `patternLines*`, id `szlaczki`).

**Contract**: wiersz S-36 w „At a glance” i blok S-36 w roadmapie (Outcome, Unknowns, Status); wiersz 103 i nowe wiersze w `glossary.md`. Prettier może przeformatować tabelę; zmieniamy tylko komórki, których dotyczy zmiana.

### Success Criteria:

#### Automated Verification:

- Prettier akceptuje pliki: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md context/domain/glossary.md`
- PRD nie ma starej wartości P4: `rg -n "0,6–1,0" context/foundation/prd.md` nie zwraca wiersza P4 tabeli szlaczków w tej postaci
- Roadmapa nie mówi o ośmiu rzędach: `rg -n "ośmioma rzędami" context/foundation/roadmap.md` nic nie zwraca

#### Manual Verification:

- Użytkowniczka czyta zmienione zdania PRD (P4, P3) i potwierdza, że oddają makietę

**Implementation Note**: Po fazie 1 zatrzymaj się na potwierdzenie przed fazą 2. Przed PR-em: `/10x-impl-review`.

---

## Faza 2: Logika karty

### Overview

Moduł `src/lib/pattern-lines/` bez UI i bez rejestracji w katalogu: poziomy, stałe druku, jednostki wzorów, ścieżki i kropki, karta i jej sprawdzenie, generator, silnik, układ A4. Do tego skrypt podglądu, który rysuje karty z prawdziwych modułów do SVG, żeby kształty (kółeczka, laseczki) i pierwszy wydruk linii dało się obejrzeć przed stroną. Wszystko pokryte testami.

### Changes Required:

#### 1. Poziomy

**File**: `src/lib/pattern-lines/levels.ts`, `levels.test.ts`

**Intent**: `PATTERN_LINES_LEVELS` z polami dla rodzica (`id`, `label`, `barLabel`, `description` mówiąca wprost o trybie, bez wieku) i polami rysunku (`mode` `dots` | `dotsThenFree` | `line`, `pool` jako lista id wzorów, `rows`, `period`, `ratio`, `maxHeight`, `bottomPad`, `repeats` dla trybu P3 (2) i P4 (min 3), `ruled`, `instruction`). Plus `DEFAULT_PATTERN_LINES_LEVEL_ID = "poziom2"`, `patternLinesLevelById`, `patternLinesHasGuides(id)` (P3–P4).

**Contract**: Kształt jak `COPY_DRAWING_LEVELS` / `SYMMETRY_LEVELS` (bez `typicalAge`). Wartości z tabeli PRD: rzędy 4 / 5 / 6 / 7, krok 40–52 / 30–42 / 22–30 / 12–20 mm, `ratio` 0,2–0,42 / 0,35–0,6 / 0,5–0,85 / (P4: nie dotyczy), `maxHeight` 20 / 18 / 15 / 13, `bottomPad` 15 / 0 / 0 / 0. Test: wartości tabeli, pule są podzbiorami `PATTERNS`, każda pula ma co najmniej tyle wzorów co rzędów, `patternLinesHasGuides` prawdziwe tylko dla P3–P4.

#### 2. Stałe druku

**File**: `src/lib/pattern-lines/sheet.ts`

**Intent**: **Jedno miejsce** dla wszystkiego, co zmieni wydruk próbny: kropki (P1 r 1,1 / rozstaw 4; P2 i część wykropkowana P3 r 0,9 / 3,5; kółko startu = r + 1,2, grubość 0,5), ścieżka pod kropkami (0,8 mm), linia wzoru (P3 1,0; P4 0,6), linie pomocnicze P3 (0,3 mm, przerywane 1,2/1,2) i blada linia dolna, liniatura (X 6,5; grubości 0,25 / 0,2; wzory przerywania), `bottomPad`, margines 10 mm, odstęp pasa 6 mm, miejsce na podpis nad pierwszym rzędem (0: karta nie ma podpisów rzędów, a makieta zostawiała tam 4 mm, więc to świadoma zmiana układu do sprawdzenia na wydruku), długość rzędu (szerokość − 6), minimalny odstęp kropek jako ułamek rozstawu (0,7), minimalna przerwa kropek z różnych ramion (0,6 mm).

**Contract**: `PATTERN_LINES_SHEET` jako `as const`, każde pole z jednozdaniowym komentarzem; zero importów poza typami. Strona, test druku, skrypt miniatur i skrypt podglądu importują tylko stąd.

#### 3. Jednostki wzorów

**File**: `src/lib/pattern-lines/patterns.ts`, `patterns.test.ts`

**Intent**: Przeniesienie `U`, `compose` i rekordów `P` z `mockup-v6.mts` jako `PATTERNS` (id, nazwa, `unit`, `sharp`, `span`, `fixedRatio`, `ling`, `count`). Bez `bolt` i `pyramid`. Dopracowanie `oChain` (łącznik styczny do koła, nie nachodzi na nie) i `sticks` (laseczka z haczykiem czytelna jako „i”); kształt zatwierdza użytkowniczka na podglądzie z kroku 7 przed fazą 3.

**Contract**: Jednostka to `Pt[]` w jednostkach 0–1; test: każda jednostka ma co najmniej dwa punkty, `x` w [0, 1], pierwszy punkt w `x = 0`, ostatni w `x = 1`; wzory z `count` mają `count` ≥ 1; `oChain`: łącznik nie przecina koła (żaden odcinek łącznika nie wchodzi do wnętrza okręgu poza punktem styku).

#### 4. Ścieżki, kropki, geometria rzędu

**File**: `src/lib/pattern-lines/paths.ts`, `paths.test.ts`

**Intent**: `rowPath`, `dotsOn` (z naprawą: nie stawia kropki bliżej niż `0,7 × rozstaw` od poprzedniej, poza narożnikiem i końcem ścieżki), `segmentsCross` / `selfCrossings`, `rowGeometry(row, level, lines)` zwracające dane do rysunku: ścieżka wzoru, kropki, kółko startu, linie pomocnicze, linie liniatury. Wszystko w mm względem środka rzędu, bez DOM.

**Contract**: Testy na ręcznie wpisanych ścieżkach: zygzak bez skrzyżowań, ósemka z jednym skrzyżowaniem; kropki leżą na ścieżce, każdy narożnik ma kropkę, kolejne kropki ≥ `0,7 × rozstaw`; `rowGeometry` P3 daje dokładnie 2 powtórzenia w kropkach i brak kropek dalej; P4 ≥ 3 powtórzenia linią; `lines=false` zostawia tylko bladą linię dolną.

#### 5. Karta i sprawdzenie

**File**: `src/lib/pattern-lines/card.ts`, `card.test.ts`

**Intent**: Typ `PatternLinesCard { levelId; rows: PatternRow[]; key }` (`PatternRow { patternId; period; height?; count }`, gdzie `height` istnieje tylko na P1–P3) i `patternLinesProblems(card, level)` ze stabilnymi kodami: `row-count`, `not-in-pool`, `duplicate-pattern`, `crossing` (P1–P2), `dots-too-close`, `trace-repeats` (P3 dokładnie 2, P4 co najmniej 3), `out-of-row`, `level-mismatch`. Na P4 wysokość wyznacza liniatura, więc wiersz jej nie niesie, nie wchodzi ona do klucza, a `out-of-row` porównuje skrajne punkty `rowGeometry` z pasem liniatury z `sheet.ts` (od górnej linii do bladej linii pod dolną; pas jest nierówny względem środka rzędu); na P1–P3 granicą jest `wysokość / 2`. Klucz liczy jedna funkcja `patternLinesKey` (wzór + krok, a na P1–P3 także wysokość, zaokrąglone do 0,1 mm, kolejność rzędów), używana przez generator i sprawdzenie.

**Contract**: Testy z ręcznymi kartami dobrymi i złymi: powtórzony wzór, wzór spoza puli, skrzyżowanie na P2, kropki zlane (rozstaw 1 mm), P3 z 3 powtórzeniami, wzór poza rzędem.

#### 6. Generator, silnik, układ

**File**: `src/lib/pattern-lines/generate.ts`, `generate.test.ts`, `engine.ts`, `engine.test.ts`, `layout.ts`, `layout.test.ts`

**Intent**: `generatePatternLinesCard(random, previousKey, level)`: tasuje kopię puli (Fisher–Yates), dla każdego rzędu losuje krok i łagodność z zakresu poziomu, na P1–P3 liczy wysokość (jak `makeRows`: `min(maxHeight, krok / span × (fixedRatio ?? ratio × sharp))`, `line` ma 0; na P4 tylko krok), odrzuca kartę z kluczem `previousKey` lub z problemami (do `MAX_ATTEMPTS`, potem `null`). Silnik jak `copyDrawingEngine`: `null` → `CardExhausted`, wynik przez `VerifiedCard.require`; `contentKey = level`; `knownBad` ze `seeded` (skrzyżowanie P2, P3 z trzema powtórzeniami, powtórzony wzór). `layoutPatternLinesSheet(level, instructionBoxHeight)` zwraca pas polecenia i środki rzędów (pierwszy pod poleceniem, ostatni przy dolnym marginesie minus `bottomPad`, odstępy równe), rzuca błąd, gdy rząd wychodzi poza margines 10 mm.

**Contract**: Typ `PatternLinesSettings { level; lines }` żyje już w tej fazie w `card-settings.ts` (bez wpisu w `CardSettingsMap`), bo silnik go importuje; `CardSpec.kind` ma typ `CardKindId`, który dostaje `"szlaczki"` dopiero w fazie 3, więc w fazie 2 `kind` rzutujemy jak `TOY` w `card-contract.test.ts` (tak zrobiło S-35), a faza 3 usuwa rzutowanie. Test generatora: dla każdego poziomu 200 kart poniżej 2 s, każda bez problemów, rzędy bez powtórzeń wzoru, kolejna karta ma inny `key`; ostre wzory (`pointed`, `bricks`) przechodzą sprawdzenie kropek na każdym ziarnie z 400. Pomiar makiety: kropki z różnych ramion są w `pointed` P2 1,93 mm, `pointed` P3 2,37, `bricks` P3 2,10, a próg to `2r + 0,6` = 2,4 mm, więc bez zmian test padnie. Kolejność poprawek: (1) próg jest stałą w `sheet.ts`, nie liczbą w teście; (2) najpierw zmieniamy geometrię jednostki (szerszy kąt szczytu `pointed`, mniejsze wypustki `bricks`) i oglądamy ją na podglądzie z kroku 7; (3) wzór wypada z puli albo zmienia się zakres kroku z tabeli PRD wyłącznie za zgodą użytkowniczki. Test układu: każdy poziom mieści się w 10 mm z postacią (pas 26 mm) i bez, P1 ma o 15 mm większy dolny zapas, odstępy równe, rzędy nie zachodzą na siebie.

#### 7. Podgląd

**File**: `context/changes/pattern-lines-card/preview.mts`

**Intent**: Skrypt (jak `mockup-v6.mts`, nie kod produktu) rysujący z prawdziwych modułów po jednej karcie na poziom (P3–P4 także z wyłączonymi liniami) do `preview-*.svg` w skali 1:1 oraz `previews.html`. Służy do zatwierdzenia kształtu kółeczek i laseczek i jako pierwszy wydruk linii przed stroną.

**Contract**: `node --experimental-strip-types context/changes/pattern-lines-card/preview.mts` zapisuje SVG; importuje wyłącznie `src/lib/pattern-lines/*` (żadnych własnych stałych). Commitujemy tylko skrypt; `preview-*.svg` i `previews.html` trafiają do `.gitignore` w folderze zmiany.

#### 8. Testy i granice

**File**: `package.json` (lista `test`), `.dependency-cruiser.cjs:139`

**Intent**: Nowe pliki testów w skrypcie `test` (pilnuje `src/lib/test-script.test.ts`); `pattern-lines` w regule `cards-only-through-engines`.

**Contract**: `npm test` uruchamia wszystkie nowe testy; `npm run depcruise` zielone.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Zależności przechodzą: `npm run depcruise`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`

#### Manual Verification:

- Użytkowniczka ogląda `previews.html` i zatwierdza kształt kółeczek (o a) i laseczek (i) albo wskazuje poprawki
- Przegląd diffu: reguły sprawdzenia i układ odpowiadają „Implementation Approach” i makiecie v6
- (opcjonalnie, nie bramka) pierwszy wydruk `preview-*.svg` w 100%: kropki i szara ścieżka są widoczne; wyniki wchodzą do fazy 4

**Implementation Note**: Po fazie 2 zatrzymaj się na potwierdzenie przed fazą 3. Przed PR-em: `/10x-impl-review`.

---

## Faza 3: Strona, katalog i profil

### Overview

Karta wchodzi do produktu: rejestracja, ustawienia z „Linie”, strona, island, arkusz SVG, miniatura, podsumowanie w profilu, testy druku i e2e. PR tej fazy nie jest scalany, dopóki nie przejdzie faza 4.

### Changes Required:

#### 1. Rejestracja i ustawienia

**File**: `src/lib/cards.ts`, `src/lib/card-settings.ts`, `src/lib/card-engines.ts`, `src/lib/card-summary.ts`, `src/lib/pattern-lines/engine.ts`

**Intent**: Wpis `szlaczki` w `CARD_KINDS` (tytuł „Szlaczki”, `/patterns`, miniatura, `description` w 2–3 zdaniach: dziecko prowadzi ołówek po kropkach albo kontynuuje pokazany wzór; na kartce rzędy szlaczków; poziom zmienia tryb, wzory i liczbę rzędów, na wyższych poziomach przełączasz linie pomocnicze). `szlaczki` w `CardSettingsMap` (typ `PatternLinesSettings` jest już z fazy 2), usunięcie rzutowania `kind` z fazy 2,, `CARD_SETTINGS_IDS`, `DEFAULTS` (`{ level: "poziom2", lines: true }`), `levelIds`; w `fieldValue` pole boolean także dla `lines`; **bez** gałęzi w `normalizeCard` (ukryta wartość `lines` zostaje). Silnik w `CardTypeMap` i `CARD_ENGINES`; `case "szlaczki"` w `summaryParts` (`extras` „bez linii” tylko przy `lines === false` na poziomie z przełącznikiem).

**Contract**: Kształt jak `kopiuj` w każdym z tych plików. Tolerancyjny odczyt: nieznany poziom lub nie-boolean `lines` w magazynie → wartość domyślna pola; stary profil bez `szlaczki` startuje z domyślnymi.

#### 2. Strona i island

**File**: `src/pages/patterns.astro`, `src/components/PatternLinesGenerator.tsx`, `src/components/PatternLinesSheet.tsx`, `src/styles/global.css` (tylko jeśli potrzebny token szarości)

**Intent**: Strona jak `copy-drawing.astro`. Island jak `CopyDrawingGenerator.tsx`: postać i poziom (`LevelChoice`) na pasku, `{patternLinesHasGuides(level) ? <SettingToggle label="Linie" … /> : null}`, `CardPage`, `sheet-state`; zmiana poziomu woła `applySettings`, „Linie” tylko `memory.remember({ lines })`. Arkusz SVG rysuje `rowGeometry` z kroku 4 fazy 2: polecenie (pas z postacią i dymkiem albo samo zdanie z `PATTERN_LINES_SHEET`), rzędy, kropki, kółko startu, linie.

**Contract**: SVG ma `viewBox="0 0 210 297"`, `print:h-[297mm] print:w-[210mm] print:overflow-hidden`, klasy przez `cn()`, czerń `var(--foreground)`, szarości z tokenów (bez hexów i palet Tailwind), `aria-label="Szlaczki"`, `data-card-key`, `data-testid`/atrybuty rzędów potrzebne e2e (`data-row`, `data-pattern`). Linie pomocnicze i liniatura drukują się (są częścią zadania).

#### 3. Miniatura

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/szlaczki.svg`

**Intent**: Miniatura z prawdziwego generatora (stałe ziarno, Poziom 2, samo polecenie bez postaci) i stałych `sheet.ts`, jak blok `kopiuj`. Nagłówek skryptu wymienia nową kartę. Do commitu idzie tylko nowa miniatura; zmienione bajty innych miniatur przywracamy.

**Contract**: `node --experimental-strip-types scripts/build-thumbnails.mjs` tworzy `public/thumbnails/szlaczki.svg`.

#### 4. Testy

**File**: `src/lib/sheet/print-contract.test.ts`, `src/lib/card-engines.test.ts`, `src/lib/card-settings.test.ts`, `src/lib/card-summary.test.ts`, `tests/e2e/patterns.spec.ts`, `tests/e2e/patterns-reprint.spec.ts`, tabele w `tests/e2e/card-settings.spec.ts`, `profile-summary.spec.ts`, `phone-layout.spec.ts`, `phone-settings-rows.spec.ts`, `phone-toggle-align.spec.ts`, `character-speaks.spec.ts`

**Intent**:

- Test druku: SVG 210×297 mm z `overflow-hidden`, kontrolki ukryte w druku, linie pomocnicze nie ukryte, strona pod `/patterns`, nowy generator na listach generatorów.
- Inwentarz silników: `szlaczki` z `settingsList` poziom × `lines`, `mayExhaust: () => false`, `usesPreviousKey: true`, `content` (inny poziom), **`decoration: [{ lines: false }]`**.
- Ustawienia i podsumowanie: odczyt zapisanych ustawień, odrzucenie nieznanego poziomu i nie-boolean `lines`, „bez linii” w podsumowaniu tylko na P3–P4, ukryta wartość `lines` przeżywa przejście P3 → P2 → P3.
- E2E strony: Generuj daje liczbę rzędów poziomu (4 / 5 / 6 / 7); P1–P2 mają kropki, P3 dokładnie dwa powtórzenia kropek w rzędzie, P4 liniaturę; przełącznik „Linie” jest tylko na P3–P4, zostawia tę samą kartę (`data-card-key` bez zmian) i jest zapamiętany w profilu; zmiana poziomu układa nową kartę; wzory nie wychodzą poza margines 10 mm (granice SVG); plakietka „poz. N” w katalogu; Generuj, Drukuj i Profil nie nachodzą na siebie na telefonie (z „Linie” jak test `money`).
- Reprint: ostrzeżenie przed ponownym drukiem (zmiana postaci i „Linie” zostawia kartę, zmiana poziomu układa nową).
- Tabele kart: wpis `szlaczki` tam, gdzie jest `kopiuj`; `phone-settings-rows` i `phone-toggle-align` wchodzą na Poziom 3 (`prepare`), zdanie w `character-speaks` to polecenie domyślnego poziomu.

**Contract**: Plik e2e zaczyna się linią `// Provenance: pattern-lines-card (S-36, US-29, US-30, FR-039, FR-040)`. E2E uruchamiane z `E2E_PORT`, żeby nie trafić w serwer innego checkoutu.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Zależności przechodzą: `npm run depcruise`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- E2E nowej karty i tabel kart przechodzą na wolnym porcie: `E2E_PORT=4399 npx playwright test tests/e2e/patterns.spec.ts tests/e2e/patterns-reprint.spec.ts tests/e2e/card-settings.spec.ts tests/e2e/profile-summary.spec.ts tests/e2e/phone-layout.spec.ts tests/e2e/phone-settings-rows.spec.ts tests/e2e/phone-toggle-align.spec.ts tests/e2e/character-speaks.spec.ts tests/e2e/catalog.spec.ts tests/e2e/how-it-works.spec.ts --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`
- Sprawdzian HTTP przechodzi na zbudowanej stronie: po `npm run build` w tle `npm run preview -- --port 4399`, po odpowiedzi `curl -sf http://localhost:4399/` uruchom `BASE_URL=http://localhost:4399 npm run smoke`

#### Manual Verification:

- Użytkowniczka otwiera `/patterns`, generuje karty na każdym poziomie, przełącza „Linie” na P3–P4 i potwierdza, że zmienia się tylko liniatura, a karta zostaje
- Katalog pokazuje miniaturę i plakietkę poziomu przy profilu; okno profilu pokazuje podsumowanie (z „bez linii”, gdy wyłączone)

**Implementation Note**: PR fazy 3 otwórz, ale nie scalaj; po `/10x-impl-review` przejdź do fazy 4 na tej samej gałęzi.

---

## Faza 4: Wydruk próbny i próba z dzieckiem

### Overview

Ręczna weryfikacja przed scaleniem (PRD Open Questions 15, frame „Confidence”). Wartości w `sheet.ts` i zakresy w `levels.ts` są startowe; ta faza je potwierdza albo zmienia. Poprawki to commity do gałęzi fazy 3, nie osobny PR.

### Changes Required:

#### 1. Poprawki stałych po wydruku

**File**: `src/lib/pattern-lines/sheet.ts`, `src/lib/pattern-lines/levels.ts`, `src/lib/pattern-lines/patterns.ts`

**Intent**: Zmieniamy tylko to, co wynika z wydruku albo z próby z dzieckiem: promień i rozstaw kropek, grubość ścieżki pod kropkami, grubość linii P3/P4, wysokość liniatury, `bottomPad`, zakresy kroku i łagodności, pula P3 (czy pętle i kółeczka zostają), kształty trudnych wzorów. Po zmianie testy z fazy 2 muszą przechodzić bez osłabiania.

**Contract**: Każda zmiana wartości ma w komunikacie commitu, co ją wymusiło (np. „P2: kropki r 1,0, bo 0,9 ginie na drukarce domowej”).

#### 2. Zamknięcie dokumentów

**File**: `context/foundation/prd.md`, `context/foundation/roadmap.md`

**Intent**: Open Questions 15 dostaje wynik (przekreślone z datą i ustaleniem albo dopisane, co zostaje otwarte); wartości w tabeli „Karta szlaczków” zgodne z `levels.ts` i `sheet.ts`; S-36 `done` (przestawia `/10x-archive`).

**Contract**: Liczby w PRD i w kodzie są takie same (sprawdza przegląd).

#### 3. Stryker (opcjonalnie, nie bramka)

**File**: `src/lib/card-settings.ts`

**Intent**: Wąski przebieg tylko na liniach odczytu ustawień szlaczków (gałąź `lines` w `fieldValue`, `case "szlaczki"` w `levelIds`): `npm run mutate:local-data -- --mutate "src/lib/card-settings.ts:START-END"`; zakres linii bierzemy z diffu po fazie 3 (numery z badania są przybliżone). Przeżyłe mutanty przeglądamy pojedynczo; asercję dodajemy tylko, gdy mutant to widoczny błąd (zapis „Linie” zgubiony, zły poziom wczytany).

**Contract**: Wynik (zabite / przeżyłe, decyzje) trafia do `reviews/impl-review-phase-4.md`; brak wyniku nie blokuje scalenia.

### Success Criteria:

#### Automated Verification:

- Po poprawkach `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check` i `npm run build` przechodzą
- E2E z fazy 3 przechodzą ponownie na wolnym porcie

#### Manual Verification:

- Wydruk A4 w 100% czterech kart (P1, P2, P3 z liniami i bez, P4 z liniami i bez): kropki P1 (r 1,1) i P2 (r 0,9) są widoczne, szara ścieżka pod kropkami czytelna, linia 0,6 mm na P4 widoczna, liniatura 6,5 mm i jej przerywana środkowa czytelne; każda karta to jedna strona A4 z marginesem 10 mm
- Próba z dzieckiem 3–4 lata (P1): przechodzi zygzak i górki, zatrzymuje rękę w ostrym punkcie; dolny zapas 15 mm jest wygodny
- Próba z dzieckiem 6–7 lat (P3): kropki klocków i rur nie są za ciasne; pętle i kółeczka po kropkach są zrozumiałe mimo skrzyżowań; dwa powtórzenia po kropkach wystarczają, by dziecko kontynuowało wzór
- Próba z dzieckiem 8–10 lat (P4): spirale i „fala i pętla” przy kroku 12–14 mm nie są za ciasne
- Użytkowniczka potwierdza kształt kółeczek (o a) i laseczek (i) na wydruku
- Open Questions 15 w PRD ma wynik, a wartości w PRD są zgodne z kodem
- (opcjonalnie, nie bramka) Stryker wąsko na odczycie ustawień szlaczków w `card-settings.ts`, wynik w przeglądzie fazy 4
- (po scaleniu na stagingu, poza bramką) Druk jest jedną stroną w Safari, Chrome iOS i Brave iOS (pomiar w każdej osobno, `lessons.md`); ewentualna poprawka jako mały PR

**Implementation Note**: Po fazie 4 (bez punktu iOS, który wymaga stagingu) użytkowniczka scala PR fazy 3; punkt iOS sprawdza po scaleniu, a poprawka, jeśli będzie potrzebna, idzie małym PR-em. Jeśli wydruk wymusi większe zmiany (np. inna grubość linii na całej karcie), wracamy do planu zamiast łatać.

---

## Testing Strategy

### Unit Tests:

- Poziomy, jednostki wzorów, ścieżki i kropki (skrzyżowania, odstępy, narożniki), `rowGeometry`, karta (kody problemów na kartach dobrych i złych), generator (200 kart na poziom poniżej 2 s, brak powtórzeń, nowy `key`), układ (margines 10 mm, równe odstępy, zapas P1).
- Silnik: `knownBad` odrzucony z oczekiwanym kodem (test żywotności w `card-engines.test.ts`); `decoration: [{ lines: false }]` zostawia tę samą kartę.
- Ustawienia: tolerancyjny odczyt `level` i `lines`, ukryta wartość `lines` przeżywa zmianę poziomu.

### Integration Tests:

- E2E strony i reprintu oraz tabel kart (faza 3); plakietka w katalogu; telefon: Generuj, Drukuj, Profil i „Linie” osobno.

### Manual Testing Steps:

1. `/patterns`: Generuj na każdym poziomie; na P3–P4 przełączyć „Linie” (karta ta sama), zmienić poziom (nowa karta).
2. Wydruk A4 czterech poziomów i próba z dzieckiem (faza 4).
3. Po scaleniu, na stagingu, iOS: Safari, Chrome, Brave — jedna strona.

## Performance Considerations

Generator losuje do `MAX_ATTEMPTS` razy i liczy ścieżki z kilkudziesięciu punktów na rząd, czyli koszt jest znikomy; test pilnuje 200 kart poniżej 2 s, daleko pod limitem 5 s z PRD. Sprawdzenie skrzyżowań jest O(n²) na ścieżce kilkuset odcinków dla 4–7 rzędów, niezauważalne.

## Migration Notes

Nowe pole `szlaczki` w `cards` profilu i ostatnich parametrów. Starsze zapisy go nie mają, więc karta startuje z ustawieniami domyślnymi (odczyt jest tolerancyjny). Pole `lines` dodane do istniejącego wpisu (gdyby pojawiły się starsze wpisy bez niego) czyta się jako `true`.

## References

- Frame: `context/changes/pattern-lines-card/frame.md`
- Badanie: `context/changes/pattern-lines-card/research.md`
- Makieta: `context/changes/pattern-lines-card/mockup-v6.mts`, `mockup-v6-*.svg`, `mockups.html`
- Wzorce: `src/lib/copy-drawing/`, `src/lib/odd-one-out/engine.ts`, `src/components/CopyDrawingGenerator.tsx`, `src/components/SudokuGenerator.tsx`, `context/changes/copy-the-drawing-card/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Dokumenty zgodne z planem

#### Automated

- [ ] 1.1 Prettier akceptuje pliki: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md context/domain/glossary.md`
- [ ] 1.2 PRD nie ma starej wartości P4: `rg -n "0,6–1,0" context/foundation/prd.md` nie zwraca wiersza P4 tabeli szlaczków w tej postaci
- [ ] 1.3 Roadmapa nie mówi o ośmiu rzędach: `rg -n "ośmioma rzędami" context/foundation/roadmap.md` nic nie zwraca

#### Manual

- [ ] 1.4 Użytkowniczka potwierdza, że zmienione zdania PRD (P4, P3) oddają makietę

### Phase 2: Logika karty

#### Automated

- [ ] 2.1 Testy jednostkowe przechodzą: `npm test`
- [ ] 2.2 Lint przechodzi: `npm run lint`
- [ ] 2.3 Zależności przechodzą: `npm run depcruise`
- [ ] 2.4 Typy przechodzą: `npx astro check`
- [ ] 2.5 Build przechodzi: `npm run build`

#### Manual

- [ ] 2.6 Użytkowniczka zatwierdza kształt kółeczek (o a) i laseczek (i) na podglądzie
- [ ] 2.7 Przegląd diffu: reguły sprawdzenia i układ zgodne z planem i makietą
- [ ] 2.8 (opcjonalnie, nie bramka) Pierwszy wydruk `preview-*.svg` w 100%: kropki i szara ścieżka są widoczne; wyniki wchodzą do fazy 4

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

- [ ] 3.8 Użytkowniczka sprawdza karty na każdym poziomie i działanie „Linie” na P3–P4
- [ ] 3.9 Katalog pokazuje miniaturę i plakietkę, a okno profilu podsumowanie

### Phase 4: Wydruk próbny i próba z dzieckiem

#### Automated

- [ ] 4.1 Po poprawkach `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check` i `npm run build` przechodzą
- [ ] 4.2 E2E z fazy 3 przechodzą ponownie na wolnym porcie

#### Manual

- [ ] 4.3 Wydruk A4 czterech kart (P3 i P4 z liniami i bez): kropki, ścieżka, linia 0,6 mm i liniatura czytelne, jedna strona z marginesem 10 mm
- [ ] 4.4 Próba z dzieckiem 3–4 lata (P1): zygzak i górki, dolny zapas
- [ ] 4.5 Próba z dzieckiem 6–7 lat (P3): klocki i rury, pętle i kółeczka po kropkach, dwa powtórzenia wystarczają
- [ ] 4.6 Próba z dzieckiem 8–10 lat (P4): spirale i „fala i pętla” nie są za ciasne
- [ ] 4.7 Użytkowniczka potwierdza kształt kółeczek i laseczek na wydruku
- [ ] 4.8 Open Questions 15 w PRD ma wynik, wartości PRD zgodne z kodem
- [ ] 4.9 (opcjonalnie, nie bramka) Stryker wąsko na odczycie ustawień szlaczków w `card-settings.ts`, wynik w przeglądzie fazy 4
- [ ] 4.10 (po scaleniu na stagingu, poza bramką) Druk jest jedną stroną w Safari, Chrome iOS i Brave iOS
