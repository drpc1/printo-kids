# Kodowanie (S-42) — plan implementacji

## Overview

Trzynasty rodzaj karty: „Kodowanie” (`/coding`, id `kodowanie`). Na A4 stoi kratka z szarymi przeszkodami, postacią w polu startu i zdaniem polecenia z dymkiem. Tryb „Zapisz” (domyślny): dziecko zapisuje strzałkami drogę do mety (flaga w szachownicę) w pustych polach pod kratką; pól jest tyle, ile kroków jedynej najkrótszej drogi, a pierwsze są wpisane szarym jako przykład. Tryb „Wykonaj”: pod kratką są podane strzałki, a dziecko zakreśla jeden z trzech obrazków (gwiazdka, serce, koło), na którym kończy się droga. Poziom 1–4 wyznacza kratkę (5×5 … 10×10), długość drogi, zakręty i zapis („3 →” na Poziomie 4). Profil pamięta poziom i tryb. Roadmapa M-7, S-42; wejście: ramka, makieta i decyzje z PR #410 (`context/changes/coding-card/`), PRD US-35, US-36, FR-045, FR-046, Business Logic „Karta kodowania”, Open Questions 18.

## Current State Analysis

Katalog ma dwanaście kart; ostatnia, zegar (S-41), przeszła drogę, którą ten plan powtarza (`context/archive/2026-11-15-clock-card/plan.md`): moduł `src/lib/clock/`, rejestry, strona, generator React, arkusz SVG, miniatura, testy. PRD, ramka (`frame.md`) i makieta (`mockup.mts`, SVG w skali 1:1) są już na `main` (PR #410), więc faza dokumentów jest mała. Makieta ma działający BFS z liczeniem najkrótszych dróg, losowanie obu trybów, wymiary w mm, sprawdzenie marginesu 10 mm i pomiar losowań.

Decyzje (ramka, PRD i odpowiedzi użytkowniczki 2026-11-17):

- tryb to przełącznik „Tryb” na pasku (Zapisz / Wykonaj), niezależny od poziomu; **domyślny Zapisz**;
- **bez „Pokaż rozwiązanie”** (odpowiedź da się sprawdzić okiem, prowadząc palcem po strzałkach);
- przy postaci „Brak” start to **kółko z napisem „Start”**;
- szare przeszkody (kreskowanie odpadło), trzy obrazki w Wykonaj, „3 →” na Poziomie 4, pola przykładu 1 / 1 / 2 / 2.

## Desired End State

Rodzic otwiera z katalogu „Kodowanie”, wybiera Poziom 1–4 (domyślnie Poziom 1) i tryb (lista „Tryb: Zapisz ▾”), klika Generuj i dostaje jedną stronę A4. Zmiana poziomu albo trybu przy pokazanej karcie od razu układa nową kartę. Profil i ostatnie parametry pamiętają poziom i tryb, katalog pokazuje plakietkę „poz. N”, okno profilu podsumowanie „Kodowanie: Poziom 2 · Zapisz”. „Jak to działa” opisuje kartę i wymienia ją w zdaniu „Poziomy”. Weryfikacja: `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`, Playwright na czterech projektach Chromium, smoke, przegląd każdego poziomu i trybu oraz wydruk na A4.

### Key Discoveries:

- Rejestr kart: `src/lib/cards.ts` (wpis „zegar” :100 jako wzór); katalog jest sortowany alfabetycznie, więc „Kodowanie” stanie samo we właściwym miejscu.
- Ustawienia: `src/lib/card-settings.ts` — `CardSettingsMap` (:119 pole `zegar`), `CARD_SETTINGS_IDS` (:136), `DEFAULTS` (:156), `levelIds()` (:286). **Pułapka**: gałąź `field === "mode"` w `fieldValue` (:254) sprawdza tylko `CLOCK_MODE_IDS`, więc zapisany tryb kodowania wracałby do domyślnego; trzeba ją zrobić zależną od karty.
- Nowa karta przy zmianie ustawienia: `applySettings` (`src/lib/sheet-state.ts`) generuje kartę, gdy `engine.spec.contentKey(settings)` różni się od pokazanej. Wzór: `ClockGenerator.tsx` (handlery `remember` + `applySettings`), `ClockModeChoice.tsx` (nakładka na `LevelChoice`, `label="Tryb"`).
- Kontrakt: `src/lib/card-contract.ts` (`CardSpec`: `problems`, `keyOf`, `contentKey`, `knownBad` ≥ 2 z `expectedCode`); `card-engines.test.ts` `INVENTORY` typowane po `CardKindId` (brak wpisu = błąd kompilacji). `CardTypeMap` i `CARD_ENGINES` w `card-engines.ts:42,61`.
- Podsumowanie: `summaryParts` w `card-summary.ts:156` (case „zegar” jako wzór: poziom, tryb zawsze, `badgeOf(level)`).
- Pas postaci: `CharacterInstruction` (`SpeechBand.tsx`), `layoutSpeechBand` i `SPEECH_BAND` (`src/lib/sheet/speech.ts`); makieta używa tego samego kodu. Znak postaci na kratce: `src/lib/sheet/character.ts`.
- Zapis „3 →”: kolejne kroki w tym samym kierunku łączą się w jedno polecenie, jak w dyktandzie graficznym (`src/lib/dictation/`); w makiecie to funkcja `groups`.
- Wyszukiwanie drogi labiryntu (`countPaths`, `src/lib/maze/generate.ts`) liczy drogi między ścianami komórek, więc karta ma własny BFS po polach (ok. 30 linii w makiecie).
- Bramki: skrypt `test` w `package.json:12` wymienia każdy plik testów (pilnuje `src/lib/test-script.test.ts`); regex `cards-only-through-engines` w `.dependency-cruiser.cjs:139`; `print-contract.test.ts` (stałe ścieżek `CLOCK_PAGE` :38, testy :450–:471: SVG 210×297 mm, brak `print:hidden`, strona bez własnego `@page`); `how-it-works.spec.ts` sprawdza dokładne brzmienie zdania „Poziomy” z `how-it-works.astro`.
- Koszt z makiety: w Zapisz średnio 47 / 199 / 640 / 2415 losowań kratki na kartę (Poziomy 1–4), 1,8–196 ms; mieści się w 5 s, ale plan celuje metą w daleką kratkę (niżej).
- Lekcja `context/foundation/lessons.md`: wartości druku mierzyć osobno w Safari, Chrome iOS i Brave iOS. Tekst w SVG: jawne przesunięcie linii bazowej zamiast `dominant-baseline` (`baselineShift`, GitHub 371).
- Kolizji nazw brak: nie ma `src/lib/coding`, trasy `/coding` ani id `kodowanie`.

## What We're NOT Doing

- „Pokaż rozwiązanie”, kolory, kategorie, osobna kontrolka kratki — decyzje 2026-11-17.
- Strzałki względne („obróć się w lewo”), skosy, wyszukiwanie drogi z `src/lib/maze`.
- Kreskowane przeszkody, krzyżyk zamiast trzech obrazków w Wykonaj (odrzucone na makiecie).
- Stryker na module kodowania (S-50), tagi katalogu (S-43), przebudowa „Jak to działa” (S-53) i podsumowania profilu (S-52), `test-plan.md` (S-51).
- Ocena rysunku dziecka; aplikacja zna odpowiedź, nie sprawdza zakreślenia.

## Implementation Approach

Ten sam rytm co zegar: każda faza na osobnej gałęzi z `origin/main` i PR do `main`, `/10x-impl-review` przed każdym PR (reguła repo), scala użytkowniczka. Najpierw dokumenty (CI pomija joby dla zmian tylko w `context/`), potem logika bez UI przeniesiona z makiety i przykryta testami, potem strona i rejestracja, na końcu wydruk próbny po scaleniu.

Reguły karty (wspólne dla PRD, kodu i testów):

| Poziom | Kratka | Bok pola | Przeszkody | Kroków | Zakrętów (min.) | Zapis                 | Pola przykładu | Opis w UI (z PRD)             |
| ------ | ------ | -------- | ---------- | ------ | --------------- | --------------------- | -------------- | ----------------------------- |
| 1      | 5×5    | 34 mm    | ok. 24%    | 6–8    | 1               | strzałka na krok      | 1              | „kratka 5×5, krótka droga”    |
| 2      | 6×6    | 29 mm    | ok. 26%    | 9–12   | 2               | strzałka na krok      | 1              | „kratka 6×6, dłuższa droga”   |
| 3      | 8×8    | 22 mm    | ok. 28%    | 13–17  | 3               | strzałka na krok      | 2              | „kratka 8×8, więcej zakrętów” |
| 4      | 10×10  | 18 mm    | ok. 30%    | 18–24  | 4               | „3 →” (kroki łączone) | 2              | „kratka 10×10, zapis „3 →””   |

| Tryb (id)           | Co jest na kartce                                                                   | Polecenie                                                                                                                                            | Opis w liście trybów          |
| ------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Zapisz (`zapisz`)   | postać na starcie, meta (flaga), pod kratką puste pola, pierwsze wpisane szarym     | „Zapisz strzałkami najkrótszą drogę do mety. Jedna strzałka to jeden krok.” (Poziom 4: „Zapisz najkrótszą drogę do mety. Liczba kratek i strzałka.”) | „dziecko zapisuje drogę”      |
| Wykonaj (`wykonaj`) | postać na starcie, trzy obrazki (gwiazdka, serce, koło), pod kratką podane strzałki | „Idź za strzałkami. Zakreśl, dokąd dojdziesz.”                                                                                                       | „dziecko idzie za strzałkami” |

- **Zapisz**: BFS od startu liczy odległość i liczbę najkrótszych dróg (liczba ucięta do 2). Kratka jest dobra, gdy do mety prowadzi dokładnie jedna najkrótsza droga o długości i zakrętach z poziomu. Szybsze losowanie niż w makiecie: po jednym BFS na kratkę wybrać metę spośród wszystkich pól z odległością w zakresie poziomu, liczbą dróg 1 i dość zakrętami (zamiast ślepego losowania mety); cel to mediana poniżej 100 losowań kratki na Poziomie 4.
- **Wykonaj**: droga losowana po wolnych polach bez wracania na to samo pole, z długością i zakrętami poziomu (nie musi być najkrótsza); trzy obrazki: cel na końcu drogi, dwa do 3 kroków od końca, poza drogą; który z trzech jest celem, losuje się.
- Pola odpowiedzi: Zapisz — tyle pól, ile kroków (Poziom 4: tyle, ile poleceń „n →”); pola przykładu to pierwsze kroki odpowiedzi szarym (w komponentach token z `global.css`, bez hexów). Strzałki rysowane kreską, nie znakiem czcionki.
- Pierwsze pole kratki to jedyne miejsce, gdzie stoi postać; przy „Brak” w polu startu jest kółko z napisem „Start”, a polecenie stoi bez dymka.
- Podsumowanie profilu: `Poziom N · <tryb>`, tryb zawsze, także domyślny. Plakietka katalogu: „poz. N”.

## Phase 1: Dokumenty

### Overview

Zamknięcie decyzji planu w PRD, roadmapie i glosariuszu; zmiana tylko w `context/`, więc CI pomija joby `ci`, `smoke`, `e2e`.

### Changes Required:

#### 1. PRD i roadmapa

**File**: `context/foundation/prd.md`, `context/foundation/roadmap.md`, `context/changes/coding-card/change.md`

**Intent**: Zapisać odpowiedzi użytkowniczki na Open Questions 18 i dopisać to, co ustalił plan, żeby kod i testy miały jedno źródło.

**Contract**: PRD: Open Questions 18 — domyślny tryb Zapisz, brak „Pokaż rozwiązanie” i kółko „Start” przy „Brak” jako **decyzje** 2026-11-17 (zostaje pytanie o wartości startowe, potwierdzane wydrukiem); tabela trybów Business Logic z kolumną „Opis w liście trybów” („dziecko zapisuje drogę”, „dziecko idzie za strzałkami”); w „Profil i zapamiętane ustawienia” zdanie o podsumowaniu „Kodowanie: Poziom 2 · Zapisz”; US-05: trasa `/coding` zatwierdzona (zamiast „propozycja”). Roadmapa S-42 i `change.md` (`planned`) przestawia już samo planowanie.

#### 2. Glosariusz

**File**: `context/domain/glossary.md`

**Intent**: Nazwać pojęcia karty przed kodem.

**Contract**: wiersze termin / znaczy / w kodzie / nie nazywaj: Kodowanie (karta; `kodowanie`, `CodingCard`, `src/lib/coding/`, `/coding`; nie „programowanie”, nie „coding worksheet”); Tryb (kodowania) (`mode`: `zapisz`, `wykonaj`; nie mylić z trybem zegara); Droga (ciąg kroków `Dir[]`, `path`; nie „trasa” — to adres strony); Krok (jedno przejście o pole, `step`); Pole przykładu (szare pola odpowiedzi, `exampleCells`; nie „podpowiedź” — to symetria); Obrazek-cel (`target`) i rozpraszacze (`distractors`); Polecenie „n →” (`DirGroup`); do wiersza „Rodzaj karty” dopisać id `kodowanie`.

### Success Criteria:

#### Automated Verification:

- Formatowanie dokumentów: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md context/domain/glossary.md context/changes/coding-card/*.md`
- Ustalenia są w PRD: `rg -n "US-35|US-36|FR-045|FR-046|Kodowanie: Poziom" context/foundation/prd.md` zwraca trafienia
- Makieta działa: `node --experimental-strip-types context/changes/coding-card/mockup.mts` kończy się bez błędu

#### Manual Verification:

- Diff PRD i roadmapy dotyczy tylko kodowania
- Użytkowniczka potwierdza opisy trybów i zdanie o podsumowaniu profilu

**Implementation Note**: po tej fazie zatrzymać się na potwierdzenie przed fazą 2.

---

## Phase 2: Logika karty

### Overview

Moduł `src/lib/coding/` bez UI i bez rejestracji w katalogu: poziomy, tryby, stałe druku, karta, BFS, generator, rozmieszczenie w mm, silnik. Algorytm przeniesiony z makiety, przyspieszony i przykryty testami z niezależnym oraklem.

### Changes Required:

#### 1. Poziomy, tryby i stałe druku

**File**: `src/lib/coding/levels.ts`, `src/lib/coding/sheet.ts`

**Intent**: Jedno miejsce na tabele poziomów i trybów oraz stałe druku, wspólne dla generatora, arkusza, miniatury i testów.

**Contract**: `CodingLevelId = "poziom1" | … | "poziom4"`, `DEFAULT_CODING_LEVEL_ID = "poziom1"`, `CodingLevel` (`id`, `label` „Poziom N”, `barLabel` „N”, `description`, `cols`, `rows`, `cell`, `obstacles`, `pathMin`, `pathMax`, `turnsMin`, `grouped` (zapis „n →”), `exampleCells`), `CODING_LEVELS`, `codingLevelById()`. `CodingModeId = "zapisz" | "wykonaj"`, `DEFAULT_CODING_MODE_ID = "zapisz"`, `CODING_MODES` (`id`, `label`, `description`, `instruction`, `instructionGrouped` dla Zapisz na Poziomie 4), `CODING_MODE_IDS`, `codingModeById()`. `CODING_SHEET` (`as const`, każda stała z jednozdaniowym komentarzem): strona 210×297, `inset` 10, pas postaci, odstępy, grubości linii, `groupBox` 27×16, rozmiar pola odpowiedzi z poziomu (`box` 22 / 20 / 16 / 16 mm), `baselineShift`, tokeny kolorów szarości.

#### 2. Karta i sprawdzanie

**File**: `src/lib/coding/card.ts`

**Intent**: Typ karty i stabilne kody problemów, żeby generator, `VerifiedCard` i testy sprawdzały to samo.

**Contract**: `Dir = "R" | "L" | "U" | "D"`, `Cell`, `CodingCard` (`level`, `mode`, `blocked: boolean[][]`, `start`, `goal`, `path: Dir[]`, `targets`: dla Wykonaj trzy obrazki z `kind` (`star`/`heart`/`circle`), `isGoal` i położeniem), `groupSteps(path)` (jak `groups` z makiety), `turnCount(path)`, `walk(card)` (odtwarza drogę ze strzałek po kratce), `codingKey(card)` (jedna funkcja klucza dla generatora i `problems`), `codingProblems(card, target)` zwraca kody: `settings-mismatch` (poziom/tryb karty różne od paska), `wrong-grid-size`, `start-or-goal-blocked`, `path-leaves-grid-or-hits-obstacle`, `path-revisits-cell`, `path-length-not-in-level`, `too-few-turns`, `path-not-ending-at-goal`, `shortest-path-not-unique` (Zapisz: liczba najkrótszych dróg do mety ≠ 1), `path-not-shortest` (Zapisz: odległość do mety ≠ długość drogi), `wrong-target-count` (Wykonaj ≠ 3 obrazki albo ≠ 1 cel), `distractor-on-path`, `distractor-too-far` (> 3 kroki od końca).

#### 3. BFS i generator

**File**: `src/lib/coding/search.ts`, `src/lib/coding/generate.ts`

**Intent**: Losowa karta zgodna z poziomem i trybem, różna od poprzedniej; `random` jedynym źródłem losowości; własny BFS po polach, bez korzystania z `src/lib/maze`.

**Contract**: `shortestPaths(blocked, start)` zwraca odległość i liczbę najkrótszych dróg ucięta do 2 dla każdego pola; `uniqueShortestPath(...)`. `generateCodingCard(random, previousKey, level, mode): CodingCard | null`, `MAX_ATTEMPTS`. Zapisz: losuje przeszkody i start, jeden BFS, wybiera metę spośród pól spełniających odległość, jedyność i zakręty poziomu (zamiast losowej mety); Wykonaj: losowy spacer bez powrotów, trzy obrazki, cel losowany. Odrzuca kartę z problemami albo z kluczem równym `previousKey`. Tasowanie Fisher–Yates, nie `sort` z losową funkcją.

#### 4. Rozmieszczenie na A4

**File**: `src/lib/coding/layout.ts`

**Intent**: Pozycje i wymiary w mm dla obu trybów i wszystkich poziomów, z postacią i bez; kratka na środku obszaru pod poleceniem (blok kratka + pola wyśrodkowany).

**Contract**: `layoutCodingSheet(card, instructionBoxHeight)` zwraca obszar polecenia, pozycję kratki, pola odpowiedzi (Zapisz: rzędy pól albo pól „n →” zawijane do szerokości; Wykonaj: rząd strzałek) i położenie pól przykładu, startu i mety. Rzuca, gdy cokolwiek przekracza margines 10 mm (tolerancja 1e-6 mm). Wymiary startowe z tabeli i z makiety.

#### 5. Silnik

**File**: `src/lib/coding/engine.ts`, `src/lib/card-settings.ts`

**Intent**: Podłączyć kartę do kontraktu kart.

**Contract**: `CodingSettings { level: CodingLevelId; mode: CodingModeId }` w `card-settings.ts`, jeszcze bez wpisu w `CardSettingsMap`. `codingSpec: CardSpec` (`kind: "kodowanie"` z rzutowaniem do rejestracji w fazie 3, `problems`, `keyOf`, `contentKey` = `` `${level}|${mode}` ``, leniwe `knownBad` z `expectedCode` co najmniej dla `shortest-path-not-unique`, `path-leaves-grid-or-hits-obstacle` i `distractor-on-path`). `codingEngine.generate` rzuca `CardExhausted` po `MAX_ATTEMPTS`, inaczej `VerifiedCard.require`.

#### 6. Testy, skrypt test, depcruise, podgląd

**File**: `src/lib/coding/*.test.ts`, `package.json`, `.dependency-cruiser.cjs`, `context/changes/coding-card/preview.mts`, `context/changes/coding-card/.gitignore`

**Intent**: Pokryć reguły karty niezależnym oraklem, wpiąć moduł w bramki, dać użytkowniczce podgląd z prawdziwego kodu.

**Contract**:

- Orakl `oracle.test.ts`, niezależny od `search.ts`: pełne wyliczenie wszystkich dróg prostych (DFS) w kratce z karty; w Zapisz dokładnie jedna droga najkrótsza i jest równa odpowiedzi karty; w Wykonaj odtworzenie strzałek po kratce kończy się na polu celu, nie wchodzi na przeszkodę ani poza kratkę, nie powtarza pola, a rozpraszacze nie leżą na drodze. Dla każdego poziomu × trybu na kilku ziarnach (dla Poziomu 4 mniej ziaren, ze względu na DFS).
- `search.test.ts`: BFS na ręcznie narysowanych kratkach (dwie równe drogi = liczba 2, kratka bez drogi, przeszkoda blokuje).
- `card.test.ts`: `groupSteps` („RRRU” → 3 →, 1 ↑), `turnCount`, każdy kod problemu daje oczekiwany wynik na `knownBad`.
- `generate.test.ts`: długość, zakręty, wielkość kratki i udział przeszkód z poziomu; kolejne Generuj daje inny klucz; czas: 20 kart Poziomu 4 w obu trybach mieści się w 5 s (NFR); średnia liczba losowań Poziomu 4 poniżej 500 (pilnuje przyspieszenia, bez przypinania dokładnych liczb).
- `layout.test.ts`: każdy tryb × poziom × z postacią i bez („Start” zamiast postaci) mieści się w 10 mm; pola odpowiedzi się nie nakładają; pola przykładu to pierwsze `exampleCells` pól.
- Nowe pliki testów w skrypcie `test`; `coding` w regexie `cards-only-through-engines`.
- `preview.mts` pisze SVG obu trybów na Poziomie 1 i 4 z prawdziwych modułów (SVG w `.gitignore` folderu). Makieta `mockup.mts` zostaje jako zapis decyzji.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint: `npm run lint`
- Zależności: `npm run depcruise`
- Typy: `npx astro check`
- Build: `npm run build`

#### Manual Verification:

- Użytkowniczka akceptuje podgląd z `preview.mts` (oba tryby, Poziom 1 i 4, z postacią i „Brak”)
- Przegląd diffu względem planu i makiety

**Implementation Note**: po tej fazie zatrzymać się na potwierdzenie przed fazą 3.

---

## Phase 3: Strona, katalog i profil

### Overview

Karta pojawia się w katalogu, ma stronę, pasek, arkusz, miniaturę, plakietkę i podsumowanie profilu; „Jak to działa” ją opisuje.

### Changes Required:

#### 1. Rejestracja

**File**: `src/lib/cards.ts`, `src/lib/card-settings.ts`, `src/lib/card-engines.ts`, `src/lib/card-summary.ts`

**Intent**: Dopisać kartę do rejestrów; kompilator pilnuje kompletności.

**Contract**: wpis `CARD_KINDS` (`id: "kodowanie"`, `title: "Kodowanie"`, `href: "/coding"`, `thumbnail: "/thumbnails/kodowanie.svg"`, `description` w 2–3 zdaniach: co dziecko robi w obu trybach i co jest na kartce); `CardSettingsMap.kodowanie`, `CARD_SETTINGS_IDS`, `DEFAULTS` (`poziom1`, `zapisz`), `case "kodowanie"` w `levelIds()`; gałąź `mode` w `fieldValue` zależna od karty (zegar: `CLOCK_MODE_IDS`, kodowanie: `CODING_MODE_IDS`), inaczej zapisany tryb wracałby do domyślnego; `CardTypeMap` i `CARD_ENGINES`; `case "kodowanie"` w `summaryParts()` (`badge: badgeOf(level)`, `level: level.label`, `extras: [mode.label]`). Usunąć rzutowanie `kind` z fazy 2.

#### 2. Strona, generator, arkusz

**File**: `src/pages/coding.astro`, `src/components/CodingGenerator.tsx`, `src/components/CodingModeChoice.tsx`, `src/components/CodingSheet.tsx`

**Intent**: Strona jak pozostałe karty; dwa ustawienia, z których każde przy pokazanej karcie układa nową kartę.

**Contract**: strona z `Layout`, `GeneratorShell` (`description` z „i wydrukuj”, `cardPageTitle("kodowanie")`), `<CodingGenerator client:only="react" />`. Generator na `CardPage`/`useCardPage`, `useCardSettings("kodowanie", …)`, `SheetState`; kontrolki `CharacterChoiceControl`, `LevelChoice`, `CodingModeChoice` (nakładka na `LevelChoice` jak `ClockModeChoice`: `label="Tryb"`, tytuł okna „Wybierz tryb”, opcje z opisem). Handlery poziomu i trybu: `remember(patch)` i `applySettings`, `disabled={waitingForChild}`; `handleProfileSwitch` przez `applySettings`. Brak przełącznika „Pokaż rozwiązanie”. Arkusz SVG 210×297 mm z klasami druku, `printColorAdjust`, `role="img"`, `aria-label="Kodowanie"`, `data-card-key`; `CharacterInstruction` albo samo polecenie; kratka, przeszkody szarym tokenem, postać w polu startu (kółko „Start” przy „Brak”), flaga w szachownicę rysowana kreską, strzałki rysowane kreską, obrazki gwiazdka/serce/koło, pola odpowiedzi i pola przykładu z `layoutCodingSheet`; kolory przez tokeny (`var(--foreground)`, `var(--card)`, `var(--muted-foreground)`), bez hexów; tekst z jawnym `baselineShift`. Brak `print:hidden` (karta nie ma rozwiązania na ekranie).

#### 3. Miniatura i „Jak to działa”

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/kodowanie.svg`, `src/pages/how-it-works.astro`, `tests/e2e/how-it-works.spec.ts`

**Intent**: Miniatura z prawdziwego generatora (stałe ziarno); zdanie „Poziomy” wymienia kodowanie.

**Contract**: sekcja kodowania w skrypcie miniatur (Zapisz, Poziom 2, stałe ziarno), komentarz nagłówka; commit tylko nowej miniatury (zmiany bajtów w innych cofnąć). W `how-it-works.astro` zdanie „Poziomy” rozszerzone o „kodowanie (Poziom 1–4)”, bez wieku; to samo brzmienie w `how-it-works.spec.ts`.

#### 4. Testy

**File**: `src/lib/card-engines.test.ts`, `src/lib/card-settings.test.ts`, `src/lib/card-summary.test.ts`, `src/lib/sheet/print-contract.test.ts`, `tests/e2e/*.spec.ts`

**Intent**: Dopisać kodowanie do tabel i dodać jego własne testy przeglądarkowe.

**Contract**:

- `INVENTORY`: `base` domyślne, `content` po jednym wariancie poziomu i trybu, `decoration: []`.
- `card-settings.test.ts`: domyślne, parsowanie zapisanego trybu, odrzucenie nieznanego trybu (także trybu zegara w ustawieniach kodowania; wraca domyślny).
- `card-summary.test.ts`: `SAVED_SETTINGS.kodowanie`, napisy „Poziom 1 · Zapisz”, „Poziom 4 · Wykonaj”, plakietka „poz. 4”.
- `print-contract.test.ts`: `CODING_PAGE`, klasy druku SVG, 210×297 mm, brak `print:hidden`, strona `/coding` bez własnego `@page`.
- e2e: wpisy `/coding` w `card-settings.spec.ts`, `character-speaks.spec.ts` (zdanie „Idź za strzałkami” lub zapis), `phone-settings-rows.spec.ts` (`/^Postać:/`, `/^Poziom:/`, `/^Tryb:/`), `profile-summary.spec.ts` („Kodowanie: …”), `phone-layout.spec.ts` (Generuj, Drukuj, Profil się nie nakładają); nowe `coding.spec.ts` (poziom i tryb układają nową kartę — inny `data-card-key`; zapamiętanie w profilu; plakietka; Zapisz ma tyle pól co kroków, Wykonaj ma trzy obrazki; „Brak” pokazuje „Start”) i `coding-reprint.spec.ts`. Każdy nowy plik e2e zaczyna się od `// Provenance: coding-card (S-42, US-35, US-36, FR-045, FR-046)`.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe: `npm test`
- Lint, zależności, typy, build: `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`
- E2E na czterech projektach Chromium z własnym portem: `E2E_PORT=4399 npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`
- Smoke na zbudowanym podglądzie: `BASE_URL=http://localhost:4399 npm run smoke`

#### Manual Verification:

- Użytkowniczka sprawdza każdy poziom i oba tryby na stronie oraz podgląd wydruku (jedna strona A4), z postacią i z „Brak”
- Miniatura w katalogu, plakietka „poz. N” przy profilu i podsumowanie „Kodowanie: Poziom N · tryb” w oknie profilu są poprawne
- Strona na telefonie: Generuj i Drukuj się nie zasłaniają, karta mieści się na A4

**Implementation Note**: po tej fazie zatrzymać się na potwierdzenie.

---

## Phase 4: Wydruk próbny

### Overview

Po scaleniu, nie blokuje wydania: wydruk obu trybów na kilku poziomach i próba z dzieckiem; ewentualna poprawka stałych w małym PR. Zamyka Open Questions 18.

### Changes Required:

#### 1. Poprawki stałych (tylko jeśli wydruk ich wymaga)

**File**: `src/lib/coding/levels.ts`, `src/lib/coding/sheet.ts`, `context/foundation/prd.md`, `context/foundation/roadmap.md`

**Intent**: Dopasować wielkość pól, strzałek, odcień szarości przykładu (odróżnialny od szarych przeszkód) albo długość drogi na Poziomie 4 do wydruku; commit mówi, co wymusiło zmianę.

**Contract**: wartości w `CODING_SHEET` i tabelach poziomów; PRD Business Logic „Karta kodowania” i Open Questions 18 oraz roadmapa S-42 zgodne z kodem.

### Success Criteria:

#### Automated Verification:

- Po ewentualnej poprawce: `npm test` i `npm run build`

#### Manual Verification:

- Wydruk każdego trybu (Poziom 1, 3, 4) na A4 jest jedną stroną w Safari, Chrome iOS i Brave iOS (lekcja: mierzyć każdą przeglądarkę osobno)
- Strzałka mieści się w polu 16 mm na Poziomach 3–4, szare pola przykładu nie mylą się z przeszkodami, droga 18–24 kroków nie jest za długa
- Dziecko zapisuje drogę w Zapisz i zakreśla obrazek w Wykonaj
- Open Questions 18 zamknięte w PRD, roadmapa S-42 zgodna

---

## Testing Strategy

### Unit Tests:

- Reguły karty dla każdego poziomu i trybu na wielu ziarnach (kratka, przeszkody, długość, zakręty, jedyność najkrótszej drogi w Zapisz, brak powrotów i obrazki poza drogą w Wykonaj).
- Niezależny orakl (DFS po wszystkich drogach prostych, inny kod niż BFS generatora) potwierdza jedną najkrótszą drogę i poprawność odpowiedzi Wykonaj.
- `knownBad` dla każdego kodu problemu; rozmieszczenie w marginesie 10 mm.
- Rejestry: silnik, ustawienia (parsowanie `mode` zależne od karty), podsumowanie, kontrakt druku.
- Stryker poza zakresem: S-50.

### Integration Tests:

- E2E: strona karty, poziom i tryb układają nową kartę, zapamiętanie w profilu, plakietka, podsumowanie, „Brak” = „Start”, ponowny druk, telefon.

### Manual Testing Steps:

1. Wygenerować oba tryby na Poziomie 1 i 4; sprawdzić okiem, że w Zapisz droga ze strzałek prowadzi do flagi, a w Wykonaj kończy się na jednym obrazku.
2. Zmienić tryb przy pokazanej karcie — nowa karta; odświeżyć stronę — poziom i tryb zostają.
3. Wydrukować oba tryby na A4 w trzech przeglądarkach iOS.

## Performance Considerations

Zapisz na Poziomie 4 to najdroższy przypadek (makieta: średnio ok. 2400 losowań, ok. 0,2 s). Wybór mety spośród wszystkich pól spełniających warunki po jednym BFS ma to obniżyć co najmniej kilkukrotnie; test czasu i średniej liczby losowań pilnuje NFR 5 s. Wykonaj kosztuje poniżej 1 ms.

## Migration Notes

Brak: nowe pole `cards.kodowanie` w zapisanych profilach ma wartość domyślną przez ogólne `parseStoredCards`; pole `mode` ma własną, zależną od karty gałąź w `fieldValue`.

## References

- Makieta i decyzje: `context/changes/coding-card/frame.md`, `mockup.mts`, `mockups.html`
- PRD: US-35, US-36, FR-045, FR-046, Business Logic „Karta kodowania”, Open Questions 18
- Wzór planu i kodu: `context/archive/2026-11-15-clock-card/plan.md`, `src/lib/clock/`, `src/components/ClockGenerator.tsx`, `src/components/ClockModeChoice.tsx`
- Zapis „n →”: `src/lib/dictation/`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Dokumenty

#### Automated

- [x] 1.1 Formatowanie dokumentów: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md context/domain/glossary.md context/changes/coding-card/*.md` — 5d78df2
- [x] 1.2 Ustalenia są w PRD: `rg -n "US-35|US-36|FR-045|FR-046|Kodowanie: Poziom" context/foundation/prd.md` zwraca trafienia
- [x] 1.3 Makieta działa: `node --experimental-strip-types context/changes/coding-card/mockup.mts` kończy się bez błędu — 5d78df2

#### Manual

- [x] 1.4 Diff PRD i roadmapy dotyczy tylko kodowania
- [ ] 1.5 Użytkowniczka potwierdza opisy trybów i zdanie o podsumowaniu profilu

### Phase 2: Logika karty

#### Automated

- [x] 2.1 Testy przechodzą: `npm test` — 0b06756
- [x] 2.2 Lint: `npm run lint` — 0b06756
- [x] 2.3 Zależności: `npm run depcruise` — 0b06756
- [x] 2.4 Typy: `npx astro check` — 0b06756
- [x] 2.5 Build: `npm run build` — 0b06756

#### Manual

- [ ] 2.6 Użytkowniczka akceptuje podgląd z `preview.mts` (oba tryby, Poziom 1 i 4, z postacią i „Brak”)
- [ ] 2.7 Przegląd diffu względem planu i makiety

### Phase 3: Strona, katalog i profil

#### Automated

- [ ] 3.1 Testy jednostkowe: `npm test`
- [ ] 3.2 Lint, zależności, typy, build: `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`
- [ ] 3.3 E2E na czterech projektach Chromium z własnym portem: `E2E_PORT=4399 npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`
- [ ] 3.4 Smoke na zbudowanym podglądzie: `BASE_URL=http://localhost:4399 npm run smoke`

#### Manual

- [ ] 3.5 Użytkowniczka sprawdza każdy poziom i oba tryby na stronie oraz podgląd wydruku (jedna strona A4), z postacią i z „Brak”
- [ ] 3.6 Miniatura w katalogu, plakietka „poz. N” przy profilu i podsumowanie „Kodowanie: Poziom N · tryb” w oknie profilu są poprawne
- [ ] 3.7 Strona na telefonie: Generuj i Drukuj się nie zasłaniają, karta mieści się na A4

### Phase 4: Wydruk próbny

#### Automated

- [ ] 4.1 Po ewentualnej poprawce: `npm test` i `npm run build`

#### Manual

- [ ] 4.2 Wydruk każdego trybu (Poziom 1, 3, 4) na A4 jest jedną stroną w Safari, Chrome iOS i Brave iOS
- [ ] 4.3 Strzałka mieści się w polu 16 mm na Poziomach 3–4, szare pola przykładu nie mylą się z przeszkodami, droga 18–24 kroków nie jest za długa
- [ ] 4.4 Dziecko zapisuje drogę w Zapisz i zakreśla obrazek w Wykonaj
- [ ] 4.5 Open Questions 18 zamknięte w PRD, roadmapa S-42 zgodna
