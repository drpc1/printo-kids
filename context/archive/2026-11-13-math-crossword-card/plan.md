# Krzyżówka matematyczna (S-40) — plan implementacji

## Overview

Jedenasty rodzaj karty: krzyżówka matematyczna. Działania „a ○ b = c” biegną w prawo albo w dół i krzyżują się we wspólnych polach z liczbami, a każde pole (liczba, znak działania, „=”) jest kratką, jak w zeszytach ćwiczeń, które pokazała użytkowniczka. Część liczb jest wpisana, reszta pusta. Dziecko dochodzi do każdego pustego pola bez zgadywania, więc odpowiedź jest jedna. Karta ma siedem poziomów (Poziom 1–7), które zmieniają rodzaj działań, największą liczbę, wielkość krzyżówki i liczbę pustych pól. Poza tym zachowuje się jak pozostałe karty: A4 z marginesem 10 mm, czarny druk bez odpowiedzi, postać przy poleceniu, profil pamięta poziom. Issue: drpc1/printo-kids#371, roadmapa M-6 S-40.

## Current State Analysis

Katalog ma dziesięć kart. Każda przechodzi tę samą drogę: rejestr `CARD_KINDS`, ustawienia w `card-settings.ts`, silnik w `card-engines.ts`, podsumowanie profilu w `card-summary.ts`, strona `.astro` z generatorem i arkuszem, miniatura, tabele w testach. Algorytm krzyżówki istnieje tylko w makiecie `context/changes/math-crossword-card/mockup.mts` (układanie działań, wypełnianie liczbami z cofaniem, puste pola z „łańcuchem”). Makiety, poziomy, zakresy i puste pola zaakceptowała użytkowniczka 2026-11-13 (zapis w `change.md`).

## Desired End State

Rodzic otwiera z katalogu „Krzyżówka matematyczna” (`/math-crossword`), wybiera Poziom 1–7 (domyślnie Poziom 2), klika Generuj i dostaje jedną stronę A4 z krzyżówką. „Pokaż rozwiązanie” pokazuje brakujące liczby na ekranie, nigdy na wydruku. Profil i ostatnie parametry pamiętają poziom, katalog pokazuje plakietkę „poz. N”, okno profilu podsumowanie „Krzyżówka matematyczna: Poziom N”. Strona „Jak to działa” opisuje kartę i jej poziomy. PRD i glosariusz opisują kartę. Weryfikacja: `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`, Playwright na czterech projektach Chromium, smoke, przegląd każdego poziomu i wydruk na A4.

### Key Discoveries:

- Rejestr kart: `src/lib/cards.ts:10-91` (`CardKind` z `description` na „Jak to działa”); kolejność katalogu alfabetyczna (`cardsInCatalogOrder`, :96), więc krzyżówka sama staje przed „Kto ma więcej?”.
- Ustawienia: `src/lib/card-settings.ts` — interfejs ustawień (:72-81), `CardSettingsMap` (:83-94), `CARD_SETTINGS_IDS` (:98-109), `DEFAULTS` (:116-127), wyczerpujący `switch` w `levelIds()` (:229-252). `parseStoredCards` i `useCardSettings` są ogólne.
- Silniki: `src/lib/card-engines.ts:26-54` (`CardTypeMap`, `CARD_ENGINES`, `satisfies` + `kindsAndSettingsAgree` — brak wpisu to błąd kompilacji).
- Podsumowanie profilu i plakietka: `src/lib/card-summary.ts:56-146` (`summaryParts`), `badgeOf()` :162-164 daje „poz. N” dla liczbowego `barLabel`.
- Wzór numerowanych poziomów: `src/lib/pattern-lines/levels.ts` (id `poziom1`…, `barLabel` „1”…, `DEFAULT_…_LEVEL_ID`).
- Wzór modułu karty: `src/lib/pattern-lines/{sheet,levels,card,generate,layout,engine}.ts`; kontrakt `src/lib/card-contract.ts` (`CardSpec` :17-27, `VerifiedCard` :66-98, `CardEngine` :100-108); bez `enum` i parameter properties (strip-types).
- „Pokaż rozwiązanie”: `src/components/NonogramGenerator.tsx:51,108,242` i `DictationGenerator.tsx:48,103,303` — stan `solutionFor === card.key`, nie jest ustawieniem, nie trafia do spec ani profilu.
- Polecenie z postacią: `CharacterInstruction` (`src/components/SpeechBand.tsx:72`), wysokość `instructionBoxHeight` (`src/lib/sheet/speech.ts:62`).
- Najbliższe solvery: nonogram bez zgadywania (`src/lib/nonogram/solve.ts`) z niezależną wyrocznią (`src/lib/nonogram/oracle.test.ts`); sudoku z liczeniem rozwiązań (`src/lib/sudoku/generate.ts:154`, wyrocznia `bruteforce.test.ts`).
- Testy: skrypt `test` w `package.json:12` wymienia każdy plik (pilnuje `src/lib/test-script.test.ts`); depcruise reguła `cards-only-through-engines` z regexem folderów (`.dependency-cruiser.cjs:139`); `card-engines.test.ts` `INVENTORY` (:159-287) wymaga ≥1 `knownBad`; `print-contract.test.ts` (:29-34, :353-462) ma listy stron; e2e tabele w `card-settings`, `character-speaks`, `phone-settings-rows`, `phone-toggle-align`, `profile-summary`, `phone-layout`; `how-it-works.spec.ts:55-56` sprawdza dokładne brzmienie zdania „Poziomy”. Smoke obchodzi katalog sam (`scripts/smoke.mjs:98-115`). Żaden test nie ma liczby 10 na sztywno.
- Strona „Jak to działa”: zdanie „Poziomy” jest wpisane ręcznie w `src/pages/how-it-works.astro:9`.
- Lekcja `context/foundation/lessons.md`: wartości druku mierzyć osobno w Safari, Chrome iOS i Brave iOS.

## What We're NOT Doing

- Osobna kontrolka liczby pustych pól — puste pola rosną z poziomem (decyzja 2026-11-13).
- Wiek pod opisem poziomu — jak wszystkie karty z M-5.
- Działania z więcej niż jednym znakiem (np. „a + b − c = d”) i kolejność wykonywania działań.
- Ramka „Użyj:” z brakującymi liczbami.
- Kolory, kategorie i obrazki na karcie; tagi katalogu (S-43); przepisanie strony „Jak to działa” (S-44) — tu tylko opis karty i jedno zdanie o poziomach.
- Stryker jako bramka; ewentualny przebieg mutacyjny osobno, jak `m5-stryker-new-cards`.
- Poprawki nieaktualnych nazw w innych miejscach (np. „Skopiuj rysunek na kratce” w `release.md`, przestarzały wiersz id w glosariuszu poza dopisaniem krzyżówki).

## Implementation Approach

Ten sam rytm co S-35 i S-36: każda faza na osobnej gałęzi z PR do `main`, `/10x-impl-review` przed każdym PR, scala użytkowniczka. Najpierw dokumenty (CI pomija joby dla zmian w `context/`), potem logika bez UI (generator przeniesiony z makiety, z testami i wyrocznią), potem strona i rejestracja, na końcu wydruk próbny po scaleniu.

Reguły karty (wspólne dla PRD, kodu i testów):

| Poziom | Działania | Największa liczba | Działań (cel) | Kratka do | Puste (cel) | Najwyżej pustych w działaniu | Łańcuch do |
| ------ | --------- | ----------------- | ------------- | --------- | ----------- | ---------------------------- | ---------- |
| 1      | +         | 10                | 5             | 26 mm     | 40%         | 1                            | 1          |
| 2      | + −       | 10                | 9             | 24 mm     | 45%         | 1                            | 1          |
| 3      | + −       | 20                | 13            | 17 mm     | 50%         | 2                            | 2          |
| 4      | + −       | 100               | 12            | 16 mm     | 50%         | 2                            | 3          |
| 5      | ·         | 30                | 12            | 16 mm     | 50%         | 2                            | 3          |
| 6      | · :       | 50                | 15            | 14,5 mm   | 55%         | 2                            | 4          |
| 7      | + − · :   | 100               | 20            | 13,5 mm   | 60%         | 2                            | 4          |

- Działanie: dwie liczby, jeden znak, wynik; wszystkie liczby od 1 do największej liczby poziomu. Mnożenie w tabliczce mnożenia (czynniki 2–10); dzielenie: dzielnik i iloraz 2–10, bez reszty, dzielna różna od dzielnika. Znaki: „+”, „−” (U+2212), „·”, „:”.
- Krzyżówka: działanie zajmuje pięć kratek w prawo albo w dół; każde nowe przecina już stojące w polu z liczbą (jedno albo dwa przecięcia); kratki dwóch działań nie stykają się bokiem poza przecięciem, a przed i za działaniem jest pusto.
- Łańcuch: puste pole ma łańcuch 1, gdy wynika z działania, w którym reszta liczb jest wpisana; łańcuch N, gdy najpierw trzeba wyliczyć pole o łańcuchu N−1. Karta, której nie da się rozwiązać samymi działaniami z jedną brakującą liczbą, nie jest pokazana.
- To samo działanie (np. 1 + 1 = 2) drugi raz na karcie tylko wtedy, gdy nie ma innego.
- „Cel” w tabeli: generator dąży do tej liczby działań i pustych pól; karta z mniejszą liczbą działań niż cel o więcej niż ustalona tolerancja nie jest pokazana (tolerancja w `levels.ts`, z komentarzem).
- Polecenie: „Uzupełnij krzyżówkę. Działania czytaj w prawo i w dół.”

## Phase 1: Dokumenty

### Overview

PRD i glosariusz opisują krzyżówkę tak, jak ją zaakceptowała użytkowniczka. Zmiana tylko w `context/`, więc CI pomija joby `ci`, `smoke`, `e2e`.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: Dopisać kartę do wymagań, żeby kod i testy miały jedno źródło reguł. Każda zmiana z datą 2026-11-13 i odwołaniem do S-40.

**Contract**:

- Success Criteria → Secondary: dwa punkty (rodzic generuje krzyżówkę matematyczną…; wybiera Poziom 1–7…).
- US-31 „Rodzic generuje krzyżówkę matematyczną do druku” i US-32 „Rodzic wybiera poziom krzyżówki matematycznej” z Acceptance Criteria (jedna odpowiedź bez zgadywania, A4/10 mm, czarny druk bez odpowiedzi, „Pokaż rozwiązanie” tylko na ekranie i wyłączane przy nowej karcie, postać przy poleceniu, warunki telefonu jak US-04; poziomy z tabeli, bez wieku, profil pamięta poziom).
- US-05: zdanie o katalogu — od M-6 jedenaście rodzajów, z miniaturą krzyżówki.
- US-22: „Jak to działa” wymienia też krzyżówkę i jej poziomy.
- FR-041 (generowanie) i FR-042 (poziomy) w nowej podsekcji Functional Requirements, z linią Socrates tam, gdzie był kontrargument (np. „samo dodawanie z pustym składnikiem to odejmowanie” → kept: tak działają zeszyty ćwiczeń).
- Business Logic: „### Karta krzyżówki matematycznej” — tabela poziomów z Implementation Approach, reguły działań, krzyżówki, łańcucha, polecenie, „Reguły, które generator sprawdza”, „Wartości są startowe i zostają potwierdzone na wydruku”.
- „### Poziomy”: krzyżówka ma Poziom 1–7, bez wieku.
- „### Profil i zapamiętane ustawienia”: wiersz „Krzyżówka matematyczna | poziom”; zdanie o „Pokaż rozwiązanie” obejmuje też krzyżówkę.
- Non-Functional Requirements: krzyżówka spełnia te same granice (do 5 s, A4, 10 mm, czarny druk bez odpowiedzi, te same przeglądarki).
- Non-Goals: zdanie o kamieniu M-6 (krzyżówka jako pierwsza karta M-6).
- Open Questions: nowe pytanie „Czy startowe wartości poziomów krzyżówki pasują dziecku?” (Owner: user, Block: nie; potwierdza wydruk w fazie 4).

#### 2. Glosariusz

**File**: `context/domain/glossary.md`

**Intent**: Nazwać pojęcia karty przed kodem, żeby kod, testy i UI używały tych samych słów.

**Contract**: wiersze w formacie termin / znaczy / w kodzie / nie nazywaj:

- Krzyżówka matematyczna — `krzyzowka`, `MathCrosswordCard`, `src/lib/math-crossword/`, strona `/math-crossword`; nie „krzyżówka liczbowa”, nie „math puzzle”.
- Działanie — `Equation` (`a`, `op`, `b`, `c`); nie „równanie” w UI, nie „hasło”.
- Puste pole — `blanks`; nie „luka” w kodzie.
- Łańcuch — `chainDepth`; nie „trudność” (trudność to poziom).
- Do wiersza „Rodzaj karty” dopisać id `krzyzowka`.

### Success Criteria:

#### Automated Verification:

- Formatowanie dokumentów: `npx prettier --check context/foundation/prd.md context/domain/glossary.md`
- PRD ma nowe numery: `rg -n "US-31|US-32|FR-041|FR-042" context/foundation/prd.md` zwraca trafienia

#### Manual Verification:

- Użytkowniczka potwierdza zmienione zdania PRD (tabela poziomów, reguły, „Pokaż rozwiązanie”, Poziom 2 domyślny)

**Implementation Note**: po tej fazie zatrzymać się na potwierdzenie przed fazą 2.

---

## Phase 2: Logika karty

### Overview

Moduł `src/lib/math-crossword/` bez UI i bez rejestracji w katalogu: poziomy, generator, sprawdzanie, rozmieszczenie w mm, silnik. Algorytm przeniesiony z makiety i przykryty testami.

### Changes Required:

#### 1. Poziomy i stałe druku

**File**: `src/lib/math-crossword/levels.ts`, `src/lib/math-crossword/sheet.ts`

**Intent**: Jedno miejsce na tabelę poziomów i stałe druku, wspólne dla generatora, arkusza, miniatury i testów.

**Contract**: `MathCrosswordLevelId = "poziom1" | … | "poziom7"`, `DEFAULT_MATH_CROSSWORD_LEVEL_ID = "poziom2"`, `MathCrosswordLevel` (`id`, `label` „Poziom N”, `barLabel` „N”, `description` np. „dodawanie i odejmowanie do 20”, `ops`, `max`, `equations`, `maxCell`, `blankShare`, `maxBlanksPerEquation`, `maxChain`, `cols`, `rows`), `MATH_CROSSWORD_LEVELS`, `mathCrosswordLevelById()`. `MATH_CROSSWORD_SHEET` (`as const`, każda stała z jednozdaniowym komentarzem): strona 210×297, `inset` 10, pas polecenia, `plainInstructionSize`, grubość ramki kratki, wielkość cyfr, polecenie.

#### 2. Karta i sprawdzanie

**File**: `src/lib/math-crossword/card.ts`

**Intent**: Typ karty i stabilne kody problemów, żeby generator i `VerifiedCard` sprawdzały to samo.

**Contract**: `MathCrosswordCard` (`level`, `cells` z pozycją i rodzajem `num`/`op`/`eq`, `equations: Equation[]`, `values`, `blanks`), `mathCrosswordKey(card)` (jedna funkcja klucza dla generatora i `problems`), `chainDepth(card)`, `mathCrosswordProblems(card, level)` zwraca kody: `false-equation`, `number-out-of-range`, `op-not-allowed` (znak spoza poziomu albo mnożenie/dzielenie poza tabliczką), `cells-touch` (kratki stykają się poza przecięciem), `needs-guessing`, `chain-too-long`, `too-many-blanks-in-equation`, `too-few-equations`, `no-blanks`.

#### 3. Generator

**File**: `src/lib/math-crossword/generate.ts`

**Intent**: Losowa karta zgodna z poziomem, różna od poprzedniej; `random` jedynym źródłem losowości.

**Contract**: `generateMathCrosswordCard(random, previousKey, level): MathCrosswordCard | null`, `MAX_ATTEMPTS`. Kroki jak w makiecie: układanie działań z preferencją proporcji strony i wypełnienia siatki, wypełnianie liczbami z cofaniem (z budżetem kroków), unikanie powtórzonych działań, wybór pustych pól w kolejności Fisher–Yates (nie `sort` z losową funkcją) z limitami poziomu. Odrzuca kartę z problemami albo z kluczem równym `previousKey`.

#### 4. Rozmieszczenie na A4

**File**: `src/lib/math-crossword/layout.ts`

**Intent**: Pozycje kratek w mm; kratka największa, jaka się mieści, nie większa niż `maxCell` poziomu; krzyżówka wyśrodkowana w obszarze pod poleceniem (jak w makiecie).

**Contract**: `layoutMathCrosswordSheet(card, instructionBoxHeight)` zwraca rozmiar kratki, pozycje i obszar polecenia; rzuca, gdy coś przekracza margines 10 mm (tolerancja 1e-6 mm).

#### 5. Silnik

**File**: `src/lib/math-crossword/engine.ts`

**Intent**: Podłączyć kartę do kontraktu kart.

**Contract**: `mathCrosswordSpec: CardSpec` (`kind: "krzyzowka"` z rzutowaniem jak w S-35 do czasu rejestracji w fazie 3, `problems`, `keyOf`, `contentKey` = poziom, leniwe `knownBad` z `expectedCode` dla co najmniej `false-equation` i `needs-guessing`), `mathCrosswordEngine.generate` rzuca `CardExhausted` po `MAX_ATTEMPTS`, inaczej `VerifiedCard.require`. Typ `MathCrosswordSettings { level }` w `card-settings.ts`, jeszcze bez wpisu w `CardSettingsMap`.

#### 6. Testy, skrypt test, depcruise, podgląd

**File**: `src/lib/math-crossword/*.test.ts`, `package.json`, `.dependency-cruiser.cjs`, `context/changes/math-crossword-card/preview.mts`

**Intent**: Pokryć reguły karty i wpiąć moduł w istniejące bramki; dać użytkowniczce podgląd z prawdziwego kodu.

**Contract**:

- Testy obok plików (`node:test`, `node:assert/strict`). Dla każdego poziomu i kilku ziaren: wszystkie działania prawdziwe, liczby w zakresie, znaki z poziomu, tabliczka mnożenia, brak styków, łańcuch i puste w działaniu w limitach, kolejne Generuj daje inny klucz, generowanie poniżej 5 s (próg z zapasem jak w nonogramie).
- `oracle.test.ts`: niezależne przeszukanie wszystkich rozwiązań (bez kodu generatora) potwierdza dokładnie jedno rozwiązanie na Poziomach 1–3; na wyższych próbka z ograniczonym czasem.
- `knownBad` każdego kodu daje oczekiwany kod.
- `layout.test.ts`: każdy poziom mieści się w 10 mm, kratka ≤ `maxCell`, z postacią i bez.
- Nowe pliki testów w skrypcie `test`; `math-crossword` w regexie `cards-only-through-engines`.
- `preview.mts` pisze SVG każdego poziomu do folderu zmiany (SVG w `.gitignore` folderu, commitowany tylko skrypt). Makieta `mockup.mts` zostaje jako zapis decyzji.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint: `npm run lint`
- Zależności: `npm run depcruise`
- Typy: `npx astro check`
- Build: `npm run build`

#### Manual Verification:

- Użytkowniczka akceptuje podgląd wszystkich siedmiu poziomów z `preview.mts`
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

**Contract**: wpis `CARD_KINDS` (`id: "krzyzowka"`, `title: "Krzyżówka matematyczna"`, `href: "/math-crossword"`, `thumbnail`, `description` w 2–3 zdaniach: co dziecko robi i co jest na kartce); `CardSettingsMap.krzyzowka`, `CARD_SETTINGS_IDS`, `DEFAULTS` (Poziom 2), `case` w `levelIds()`; `CardTypeMap` i `CARD_ENGINES`; `case` w `summaryParts()` („Poziom N”). Usunąć rzutowanie `kind` z fazy 2.

#### 2. Strona, generator, arkusz

**File**: `src/pages/math-crossword.astro`, `src/components/MathCrosswordGenerator.tsx`, `src/components/MathCrosswordSheet.tsx`

**Intent**: Strona jak pozostałe karty; „Pokaż rozwiązanie” jak w nonogramie.

**Contract**: strona z `Layout`, `GeneratorShell` (`description` z „i wydrukuj”), `<MathCrosswordGenerator client:only="react" />`. Generator na `CardPage`/`useCardPage`, `useCardSettings("krzyzowka", …)`, `SheetState`; kontrolki `CharacterChoiceControl`, `LevelChoice`, `SettingToggle` „Pokaż rozwiązanie” (`solutionFor === card.key`, nie ustawienie, wyłączone po Generuj i zmianie poziomu, nieaktywne przy braku karty). Arkusz SVG 210×297 mm z klasami druku, `printColorAdjust`, `role="img"`, `aria-label`, `data-card-key`; `CharacterInstruction` albo samo polecenie; każda kratka z ramką, liczby pogrubione, „·” i „:” pogrubione; rozwiązanie szarymi cyframi w pustych polach z `print:hidden`.

#### 3. Miniatura i „Jak to działa”

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/krzyzowka.svg`, `src/pages/how-it-works.astro`, `tests/e2e/how-it-works.spec.ts`

**Intent**: Miniatura z prawdziwego generatora (stałe ziarno); zdanie „Poziomy” wymienia krzyżówkę.

**Contract**: sekcja krzyżówki w skrypcie miniatur (Poziom 2, stałe ziarno), komentarz nagłówka; commit tylko nowej miniatury (zmiany bajtów w innych cofnąć). W zdaniu `how-it-works.astro:9` krzyżówka dochodzi do kart z numerami („… krzyżówka matematyczna (Poziom 1–7)”), bez wieku; to samo brzmienie w `how-it-works.spec.ts:55-56`.

#### 4. Testy

**File**: `src/lib/card-engines.test.ts`, `src/lib/card-settings.test.ts`, `src/lib/card-summary.test.ts`, `src/lib/sheet/print-contract.test.ts`, `tests/e2e/*.spec.ts`

**Intent**: Dopisać krzyżówkę do tabel i dodać jej własne testy przeglądarkowe.

**Contract**: `INVENTORY` (`content: level`, `decoration: []`), domyślne i parsowanie ustawień, `SAVED_SETTINGS` i test podsumowania, ścieżki i listy w `print-contract`; e2e: tabele w `card-settings`, `character-speaks`, `phone-settings-rows`, `phone-toggle-align` (przełącznik „Pokaż rozwiązanie”), fixture i asercje w `profile-summary`, test w `phone-layout`; nowe `math-crossword.spec.ts` (poziomy, zapamiętanie, plakietka, „Pokaż rozwiązanie” nie drukuje się i wyłącza się przy nowej karcie) i `math-crossword-reprint.spec.ts`. Każdy nowy plik e2e zaczyna się od `// Provenance: math-crossword-card (S-40, US-31, US-32, FR-041, FR-042)`.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe: `npm test`
- Lint, zależności, typy, build: `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`
- E2E na czterech projektach Chromium z własnym portem: `E2E_PORT=4399 npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`
- Smoke na zbudowanym podglądzie: `BASE_URL=http://localhost:4399 npm run smoke`

#### Manual Verification:

- Użytkowniczka sprawdza każdy poziom na stronie, „Pokaż rozwiązanie” i podgląd wydruku (jedna strona A4)
- Miniatura w katalogu, plakietka „poz. N” przy profilu i podsumowanie w oknie profilu są poprawne
- Strona na telefonie: Generuj i Drukuj się nie zasłaniają, karta mieści się na A4

**Implementation Note**: po tej fazie zatrzymać się na potwierdzenie.

**Addendum (2026-11-14, na prośbę użytkowniczki po podglądzie strony)**: wolne miejsca w siatce otoczone kratkami działań ze wszystkich czterech stron są zakreskowane (`gaps` w `layout.ts`, wzór w `MathCrosswordSheet.tsx` i w miniaturze), żeby nie wyglądały jak pola do wpisania. Czytelność kreskowania na czarno-białej drukarce sprawdza faza 4. „Pokaż rozwiązanie” jest przy braku karty ukryte (jak w nonogramie), nie nieaktywne.

---

## Phase 4: Wydruk próbny

### Overview

Po scaleniu, nie blokuje wydania: wydruk wszystkich poziomów i próba z dzieckiem; ewentualna poprawka stałych w małym PR.

### Changes Required:

#### 1. Poprawki stałych (tylko jeśli wydruk ich wymaga)

**File**: `src/lib/math-crossword/levels.ts`, `src/lib/math-crossword/sheet.ts`, `context/foundation/prd.md`

**Intent**: Dopasować wielkość kratki, liczbę działań albo pustych pól do wydruku; commit mówi, co wymusiło zmianę. Zamknąć pytanie o wartości poziomów w Open Questions z datą i decyzją.

**Contract**: wartości w tabeli poziomów; PRD Business Logic i Open Questions zgodne z kodem.

### Success Criteria:

#### Automated Verification:

- Po ewentualnej poprawce: `npm test` i `npm run build`

#### Manual Verification:

- Wydruk każdego poziomu na A4 jest jedną stroną w Safari, Chrome iOS i Brave iOS (lekcja: mierzyć każdą przeglądarkę osobno)
- Cyfry mieszczą się w kratkach także na Poziomie 7 (13,5 mm), a dziecko daje radę wpisać liczby na Poziomach 1–2
- Open Question o wartościach poziomów krzyżówki zamknięte w PRD

---

## Testing Strategy

### Unit Tests:

- Reguły karty dla każdego poziomu na wielu ziarnach (działania, zakresy, znaki, tabliczka, styki, łańcuch, puste w działaniu, różny klucz).
- Niezależna wyrocznia jednego rozwiązania.
- `knownBad` dla każdego kodu problemu; rozmieszczenie w marginesie 10 mm.
- Rejestry: silnik, ustawienia, podsumowanie, kontrakt druku.

### Integration Tests:

- E2E: strona karty, poziomy, zapamiętanie w profilu, plakietka, „Pokaż rozwiązanie” (ekran tak, druk nie), ponowny druk, telefon.

### Manual Testing Steps:

1. Wygenerować każdy poziom i sprawdzić rachunki na kilku kartach.
2. Włączyć „Pokaż rozwiązanie”, zmienić poziom — przełącznik się wyłącza.
3. Wydrukować Poziom 1, 4 i 7 na A4 w trzech przeglądarkach iOS.

## Performance Considerations

Generowanie do 5 s (NFR). Wypełnianie liczbami ma budżet kroków; Poziom 7 (cztery działania do 100, 20 działań) to najcięższy przypadek — test czasu z zapasem jak w nonogramie.

## Migration Notes

Brak: nowe pole `cards.krzyzowka` w zapisanych profilach ma wartość domyślną przez ogólne `parseStoredCards`.

## References

- Makiety i decyzje: `context/changes/math-crossword-card/mockup.mts`, `mockups.html`, `change.md`
- Wzór planu: `context/archive/2026-11-09-copy-the-drawing-card/plan.md`, `context/archive/2026-11-09-pattern-lines-card/plan.md`
- Wzór modułu: `src/lib/pattern-lines/`; „Pokaż rozwiązanie”: `src/components/NonogramGenerator.tsx:51`
- Issue: drpc1/printo-kids#371

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Dokumenty

#### Automated

- [x] 1.1 Formatowanie dokumentów: `npx prettier --check context/foundation/prd.md context/domain/glossary.md` — cab6ada
- [x] 1.2 PRD ma nowe numery: `rg -n "US-31|US-32|FR-041|FR-042" context/foundation/prd.md` zwraca trafienia — cab6ada

#### Manual

- [x] 1.3 Użytkowniczka potwierdza zmienione zdania PRD (tabela poziomów, reguły, „Pokaż rozwiązanie”, Poziom 2 domyślny) — cab6ada

### Phase 2: Logika karty

#### Automated

- [x] 2.1 Testy przechodzą: `npm test` — ce0d1e5
- [x] 2.2 Lint: `npm run lint` — ce0d1e5
- [x] 2.3 Zależności: `npm run depcruise` — ce0d1e5
- [x] 2.4 Typy: `npx astro check` — ce0d1e5
- [x] 2.5 Build: `npm run build` — ce0d1e5

#### Manual

- [x] 2.6 Użytkowniczka akceptuje podgląd wszystkich siedmiu poziomów z `preview.mts` — ce0d1e5
- [x] 2.7 Przegląd diffu względem planu i makiety — ce0d1e5

### Phase 3: Strona, katalog i profil

#### Automated

- [x] 3.1 Testy jednostkowe: `npm test` (add0a18)
- [x] 3.2 Lint, zależności, typy, build: `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build` (add0a18)
- [x] 3.3 E2E na czterech projektach Chromium z własnym portem: `E2E_PORT=4399 npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768` (add0a18)
- [x] 3.4 Smoke na zbudowanym podglądzie: `BASE_URL=http://localhost:4399 npm run smoke` (add0a18)

#### Manual

- [x] 3.5 Użytkowniczka sprawdza każdy poziom na stronie, „Pokaż rozwiązanie” i podgląd wydruku (jedna strona A4)
- [x] 3.6 Miniatura w katalogu, plakietka „poz. N” przy profilu i podsumowanie w oknie profilu są poprawne (add0a18)
- [x] 3.7 Strona na telefonie: Generuj i Drukuj się nie zasłaniają, karta mieści się na A4 (add0a18)

### Phase 4: Wydruk próbny

#### Automated

- [x] 4.1 Po ewentualnej poprawce: `npm test` i `npm run build`

#### Manual

- [x] 4.2 Wydruk każdego poziomu na A4 jest jedną stroną w Safari, Chrome iOS i Brave iOS (lekcja: mierzyć każdą przeglądarkę osobno)
- [x] 4.3 Cyfry mieszczą się w kratkach także na Poziomie 7 (13,5 mm), a dziecko daje radę wpisać liczby na Poziomach 1–2
- [x] 4.4 Open Question o wartościach poziomów krzyżówki zamknięte w PRD
