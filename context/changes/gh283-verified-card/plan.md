# VerifiedCard: wspólny strażnik niezmiennika kart — plan wdrożenia

## Overview

Wprowadzamy jeden kontrakt dla wszystkich rodzajów kart: karta pokazana w UI ma typ `VerifiedCard<C>`, którego nie da się zbudować bez funkcji sprawdzającej rodzaju (`CardSpec.problems`), a rejestr `CARD_ENGINES` wymaga od każdego rodzaju silnika (`CardEngine`). Do tego jeden stan strony `SheetState` z przyczyną niepowodzenia: nieudane Generuj wyłącza kartę i pokazuje rodzicowi, dlaczego (D02 §7, odpowiedzi nr 2 i 5). Ten sam stan pilnuje drugiego niezmiennika, **I-9: zadanie na ekranie odpowiada ustawieniom treści na pasku** (poziom, rozmiar i „Kształty / Cyfry” sudoku, kategoria): każda ich zmiana przy pokazanej karcie od razu układa nową kartę. Postać, kolory i „Pokaż rozwiązanie” to ozdoby i zostawiają tę samą kartę. Do tego **ostrzeżenie przy ponownym druku tej samej karty** z wyborem „Nowa karta i drukuj” / „Drukuj tę samą” (decyzje właścicielki 2026-11-06: wydrukowała tę samą kartę dwa razy z inną postacią i dziecko dostało dwa takie same zadania; wyłączanie karty po zmianie postaci odrzuciła, bo przeszkadza przy przeglądaniu postaci przed drukiem). Zakres to fazy 0–3 i 3b z `context/domain/02-invariant-aggregate-refactor.md` (D02). Fazy D02 4 (definicja gotowości S-34..S-36), 5 (Stryker) i 6 (dokumenty) zostają poza tą zmianą.

GitHub #283. Karty S-34..S-36 (#265–#267) czekają na fazy 1–2 tego planu (kontrakt i SheetState), a w pełni na fazę 11 (rejestr wymuszony typem).

## Current State Analysis

Za D02 §3 (diagnoza I-1), sprawdzone w kodzie w tej sesji:

- Sześć kart ma funkcję `*Problems` o różnych sygnaturach, a labirynt ma tylko bramkę `mazeForSheet` (`src/lib/maze/generate.ts:114-130`) wołaną z komponentu (`src/components/WorksheetGenerator.tsx:52`, `:74`) i ze skryptu (`scripts/build-thumbnails.mjs:62`). Sonda D02 (dodatek A) pokazała 5 mutacji labiryntu, które bramka przyjmuje.
- Każdy generator zwraca `Karta | null`; siedem komponentów ma własne `useState(false)` na `generateFailed` (np. `SymmetryGenerator.tsx:33`), a `CardPage` pokazuje jeden tekst (`CardPage.tsx:13`, `:99`, `:145`). `null` nie niesie przyczyny.
- Generatory różnią się trybem i wejściem:
  - próbkujące z `MAX_ATTEMPTS = 20` i `previousKey`: symetria (`symmetry/generate.ts:49-69`), sekwencje (`sequence/generate.ts:56-68`, kolory `shapeColors` dokładane po sprawdzeniu), sudoku (`sudoku/generate.ts:269-301`), nonogram (`nonogram/generate.ts:38-64`, zwraca unię `NonogramCard | SimpleNonogramCard`), pieniądze (`money/generate.ts:89-101`);
  - dyktando nie próbkuje: losuje z leniwie zbudowanego katalogu już zweryfikowanych kart (`dictation/generate.ts:60-75`, `:93-126`); `null` znaczy „nie ma innego obrysu”;
  - labirynt jest konstrukcyjny (najlepszy z 20 kandydatów), bez `key` i bez `previousKey` (`maze/generate.ts:30`).
- Komponenty same tłumaczą ustawienia na obiekty poziomów (`symmetryLevelById`, `nonogramSizeById` itd.); po zmianie robi to silnik.
- Ustawienia każdego rodzaju są już typowane: `CardSettingsMap` i `CardSettingsOf<K>` (`src/lib/card-settings.ts:57-81`). `CARD_KINDS` ma `id: string` (`src/lib/cards.ts:1-10`).
- Skrypt `test` w `package.json` wylicza pliki ręcznie, a `src/lib/test-script.test.ts` pilnuje, by każdy plik `*.test.ts` w `src` i `scripts` był na liście.
- `npm run depcruise` obejmuje `src` i `tests`, nie `scripts/`; `tsPreCompilationDeps: true` (`.dependency-cruiser.cjs:267`).
- `SudokuGenerator.tsx:12` importuje wartość `sudokuBlock` z `sudoku/generate.ts`.
- Test `sheet/character.test.ts:78` pinuje regexem tekst `generateMaze(level, Math.random)` w komponencie.
- PRD:341 i PRD:815 (dyktando) mówią „Nieudane Generuj zostawia przełącznik i poprzednią kartę”; decyzja 7.2 z D02 to zmienia.
- I-9 jest dziś łamane w jednym miejscu: zmiana kategorii na pasku symetrii, nonogramu i dyktanda tylko zapisuje ustawienie (`SymmetryGenerator.tsx:97-99`, `NonogramGenerator.tsx:103-104`, `DictationGenerator.tsx:98-99`), więc stara karta zostaje drukowalna z nowym napisem na pasku; zmiana profilu z inną kategorią już generuje nową kartę (`SymmetryGenerator.tsx:64-67`). Poziom, a w sudoku rozmiar, poziom i „Kształty / Cyfry”, już generują nową kartę od razu (np. `SudokuGenerator.tsx:61-68`).
- Zmiana postaci (`useBarCharacter.select`, `setOwnImage`, `applyBar`: `src/hooks/useBarCharacter.ts:39-66`; w labiryncie `WorksheetGenerator.tsx:79-97`) podmienia postać na tej samej karcie i tak zostaje. Nic dziś nie ostrzega, że ta sama karta idzie do druku drugi raz; Drukuj woła `window.print()` w jednym miejscu (`CardPage.tsx:86`), a `src/components/ui/dialog.tsx` już jest.
- PRD US-20 (PRD:382): „Wybrana kategoria obowiązuje przy następnym Generuj”; US-17 i reguły dyktanda (PRD:341, PRD:815): „Sama zmiana kategorii go nie wyłącza” (przełącznik rozwiązania). Oba zdania przeczą I-9.

## Desired End State

- `src/lib/card-contract.ts` z `CardProblem`, `CardSpec`, `VerifiedCard`, `CardInvariantError`, `CardExhausted`, `CardEngine`.
- `src/lib/sheet-state.ts` z `SheetState<C>`, czystymi przejściami i `failureReason`. Karta w `showing` pamięta klucz treści, dla którego powstała (`contentKey`), i znacznik `printed`. Jedno przejście `applySettings` po każdej zmianie ustawień (pasek, profil) układa nową kartę, gdy klucz treści się różni (I-9). `printed` ustawia zdarzenie `beforeprint` (także Ctrl+P), kasuje go każda nowa karta.
- Każdy rodzaj w `CardSpec.contentKey(settings)` mówi, które jego ustawienia są treścią; skutek każdego ustawienia jest zgodny z tabelą „Ustawienie → skutek dla karty (I-9)” niżej i pilnowany testem.
- Drukuj na karcie z `printed` otwiera okno „Ta karta była już drukowana” z „Nowa karta i drukuj” (główny) i „Drukuj tę samą”; okno żyje w `CardPage`, jedno dla wszystkich kart.
- PRD US-20 i US-22 mówią o I-9 i ostrzeżeniu (faza 3); zdania dyktanda o kategorii i przełączniku (faza 10).
- Siedem silników (`src/lib/<karta>/engine.ts`), każdy ze `spec` i `knownBad`; `src/lib/card-engines.ts` z `CARD_ENGINES` typowanym mapą po `CardKindId`, bez `any`.
- Siedem komponentów dostaje karty wyłącznie przez `CARD_ENGINES` i trzyma stan w `SheetState`; nieudane Generuj albo zmiana poziomu przy pokazanej karcie przechodzi w `unavailable` (Drukuj wyłączone, widoczna przyczyna).
- `CARD_KINDS` jest `as const satisfies readonly CardKind[]`; dopisanie rodzaju bez silnika nie kompiluje się (`npx astro check`).
- Reguła depcruise `cards-only-through-engines` broni importu `src/lib/<karta>/generate.ts` z `src/components|hooks|pages`.
- Usunięte: `mazeForSheet`, publiczny eksport `generateMaze` (zostaje funkcją wewnętrzną modułu albo silnika), regex `character.test.ts:78`.
- Weryfikacja: `npm test`, `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build`, e2e Chromium na wolnym porcie (`E2E_PORT`) zielone; `src/lib/card-engines.test.ts` iteruje po `CARD_ENGINES` i nie ma w nim żadnego `todo`.

### Key Discoveries:

- Typowanie rejestru bez `any`: `CardSettingsOf<K>` już daje ustawienia rodzaju (`card-settings.ts:78`); brakuje tylko mapy typów kart (`CardTypeMap`) obok `CARD_ENGINES` (rozstrzyga D02 §9, punkt 3).
- `node --experimental-strip-types` (skrypt `test`) przyjmuje tylko składnię TS, którą da się wymazać. Szkic D02 4.3 używa właściwości parametrów konstruktora (`constructor(readonly kind…)`), których strip-types nie obsługuje: pola trzeba zadeklarować jawnie i przypisać w ciele konstruktora. Prywatność konstruktora `VerifiedCard` (`private constructor`) jest wymazywalna i działa tylko w `astro check`, więc test C9 (`@ts-expect-error`) sprawdza `astro check`, nie runner.
- Dyktando ma własny tryb (katalog): silnik nie ma pętli prób, `CardExhausted` niesie liczbę kart w katalogu po odfiltrowaniu `previousKey`.
- `printDisabled` wyłącza tylko przycisk Drukuj; druk z przeglądarki (Ctrl+P, menu) drukuje to, co jest w DOM. Stan bez druku (`unavailable`) musi więc nie renderować arkusza, a nie tylko wyłączać przycisk. Z tego samego powodu ostrzeżenie przy ponownym druku działa tylko na przycisku: `beforeprint` nie da się przerwać, więc Ctrl+P na drukowanej karcie drukuje bez pytania, ale ustawia `printed`, więc następny Drukuj już ostrzeże.
- I-9 liczony z klucza treści, a nie z rodzaju zdarzenia: każda ścieżka zmiany ustawień (pasek, zmiana profilu) idzie przez `applySettings`, które porównuje `contentKey`. Ścieżki zmiany postaci (pasek, „Ustaw jako ulubioną”, własny obrazek) nie dotykają `SheetState`. Bezpiecznik: `sheetView` przy różnym kluczu (handler, który ominął `applySettings`) nie renderuje arkusza i loguje `console.error`; rodzic tego stanu nie powinien zobaczyć, test N17 go pilnuje.
- Nie wiemy, czy rodzic wydrukował, czy anulował okno druku; `printed` znaczy „okno druku było otwarte”. Fałszywe ostrzeżenie po anulowaniu kosztuje jedno kliknięcie.
- Brak e2e dla tekstu niepowodzenia (`grep "Nie udało" tests/e2e` = 0); zmiana zachowania po nieudanym Generuj nie łamie istniejących e2e, ale też nic jej dziś nie pilnuje w przeglądarce.

## What We're NOT Doing

- Faza D02 4 (punkt „silnik w `CARD_ENGINES` + `spec` + `knownBad`” w definicji gotowości S-34..S-36 w `roadmap.md`): osobny dopisek przy otwarciu tych kart.
- Faza D02 5 (Stryker na `card-contract.ts` i spec labiryntu): osobna zmiana po tej; ta zmiana nie rusza `stryker/*.config.json`.
- Faza D02 6 (słownik, TP §2, doprecyzowanie PRD:670): osobna zmiana. Wyjątek: dwa zdania PRD o dyktandzie (PRD:341, PRD:815), które ta zmiana unieważnia, poprawiamy w fazie 10, bo inaczej kod przeczy PRD.
- Szlaczki: kontrakt wymaga `problems`, ale nie mówi, co sprawdza (D02 §7.1). Brak „trybu bez sprawdzalnej odpowiedzi”.
- Gwarancja I-2 („nowa karta przy każdym Generuj”) dla labiryntu: dziś jej nie ma i nie dochodzi; silnik labiryntu ignoruje `previousKey`.
- Osobny tekst przyczyny dla każdego kodu `CardInvariantError`: rodzic dostaje jeden tekst „błąd aplikacji” z kodem (patrz faza 3).
- Stan „nieaktualna” (karta wyłączona do Generuj po zmianie postaci albo kategorii): rozważony i odrzucony 2026-11-06. Postać zmienia się na żywo na tej samej karcie, kategoria układa nową kartę od razu jak poziom.
- Ostrzeżenie przy Ctrl+P / druku z menu przeglądarki: nie da się go przerwać z `beforeprint`.
- Pamiętanie `printed` po odświeżeniu strony: karty nie są przechowywane (PRD, Access Control), więc znacznik żyje tylko w stanie strony.
- Dopisanie I-9 do D02 i słownika: osobna zmiana dokumentów (faza D02 6).
- D01 R-1…R-14 poza R-9 i R-10.
- Wspólne stałe A4 (D01 A10), przeniesienie katalogu szablonów (D01 #3).

## Implementation Approach

Pionowo, rodzaj po rodzaju: każda faza to jeden PR do `main`, który zostawia działający produkt (decyzja delegowana, patrz brief). Kolejność: inwentaryzacja → kontrakt → stan strony → labirynt (największa luka) → pieniądze → symetria → sekwencje → sudoku → nonogram → dyktando → domknięcie rejestru. Pieniądze idą zaraz po labiryncie, bo mają najprostsze wejście (sam poziom); dyktando ostatnie, bo ma inny tryb i czeka na decyzję R-9.

Tryb pracy:

- fazy 1–3 i część „spec + silnik” faz 4–10: **`/10x-tdd`** (red → green → refactor);
- część „komponent na `SheetState`”, skrypt miniatur i faza 11: **`/10x-implement`**, z regresją e2e.

**Wzorzec migracji rodzaju (fazy 4–10).** Każda z tych faz robi to samo dla jednego rodzaju:

1. `src/lib/<karta>/engine.ts`: `<karta>Spec` (adapter dzisiejszej `*Problems` na `CardProblem[]`, `keyOf`, `knownBad` przeniesione z testu zbiorczego) i `<karta>Engine` owijający dzisiejszy generator bez zmiany jego pętli. Silnik tłumaczy `CardSettingsOf<K>` na obiekty poziomu, `null` → `CardExhausted`, a wynik przepuszcza przez `VerifiedCard.require` (niezależna druga kontrola; gdy bramka kosztu z fazy 2 tego zabroni dla danego rodzaju, pętla przechodzi na `VerifiedCard.check`).
2. Test spec rodzaju w jego `generate.test.ts` albo nowym `engine.test.ts` (dopisanym do skryptu `test`).
3. `src/lib/card-engines.test.ts`: adapter rodzaju zastąpiony silnikiem; jego wpisy `todo` zamknięte.
4. `<karta>Spec.contentKey(settings)` zgodny z tabelą I-9 niżej, z testem: zmiana każdego ustawienia „treść” zmienia klucz, zmiana każdego ustawienia „ozdoba” go nie zmienia.
5. Komponent `*Generator.tsx`: jedna wartość stanu `SheetState<C>` zamiast pary `card` + `generateFailed`; Generuj woła `generateSheet`, a każda zmiana ustawień (pasek, profil) woła `applySettings` w handlerze i ustawia gotową wartość (`setSheet(next)`, nie updater). Dzisiejsze osobne ścieżki „poziom generuje od razu” znikają w `applySettings`. Widok liczy `sheetView(state, contentKey z paska)`; `CardPage` dostaje `sheetShown = view.kind !== "idle"`, `printDisabled = view.kind !== "showing"`, `generateFailed = failure !== null`, `failedText = failureReason(...)`, `printedBefore = view.printed` i `onRegenerate` (ten sam handler co Generuj). Arkusz renderuje się tylko w `showing`.
6. e2e strony rodzaju na wolnym porcie (z `window.print` podmienionym w `addInitScript` na licznik): zmiana postaci zostawia tę samą kartę; drugi Drukuj tej samej karty otwiera ostrzeżenie; „Nowa karta i drukuj” daje inną kartę i drukuje; „Drukuj tę samą” drukuje bez zmiany karty; na rodzajach z kategorią zmiana kategorii od razu daje nową kartę.

### Ustawienie → skutek dla karty (I-9)

Dwa rodzaje ustawień (decyzja 2026-11-06): **treść** zmienia zadanie, więc jej zmiana przy pokazanej karcie od razu układa nową kartę; **ozdoba** zostawia tę samą kartę. Postać jest ozdobą (US-21): zmienia się na pokazanej karcie. Nieudana nowa karta → `unavailable` z przyczyną (decyzja 7.2). Zmiana treści bez pokazanej karty (`idle`) nie generuje, jak dziś. Zmiana profilu idzie przez to samo `applySettings`: inny klucz treści → nowa karta, inna tylko postać → ta sama karta. Ostrzeżenie przy ponownym druku jest niezależne od tabeli: dotyczy każdej karty z `printed`, bez względu na to, co zmieniono.

| Karta     | Ustawienie                          | Rodzaj               | Skutek przy pokazanej karcie                                        | Dziś                                          |
| --------- | ----------------------------------- | -------------------- | ------------------------------------------------------------------- | --------------------------------------------- |
| Labirynt  | poziom                              | treść                | nowa od razu                                                        | nowa od razu (`WorksheetGenerator.tsx:66-77`) |
| Labirynt  | postać (w tym własny obrazek)       | ozdoba               | ta sama karta, inna postać                                          | ta sama karta, inna postać                    |
| Symetria  | poziom                              | treść                | nowa od razu                                                        | nowa od razu                                  |
| Symetria  | kategoria                           | treść                | **nowa od razu**                                                    | ta sama karta, nowy napis na pasku            |
| Symetria  | kolory                              | ozdoba               | ta sama karta (US-09)                                               | ta sama karta                                 |
| Symetria  | postać                              | ozdoba               | ta sama karta, inna postać                                          | ta sama karta, inna postać                    |
| Sekwencje | poziom                              | treść                | nowa od razu                                                        | nowa od razu                                  |
| Sekwencje | kolory                              | ozdoba               | ta sama karta (kredki losowane przy Generuj, PRD „Karta sekwencji”) | ta sama karta                                 |
| Sekwencje | postać                              | ozdoba               | ta sama karta, inna postać                                          | ta sama karta, inna postać                    |
| Sudoku    | rozmiar, poziom, „Kształty / Cyfry” | treść                | nowa od razu                                                        | nowa od razu (`SudokuGenerator.tsx:61-68`)    |
| Sudoku    | kolory                              | ozdoba               | ta sama karta (US-14)                                               | ta sama karta                                 |
| Sudoku    | postać                              | ozdoba               | ta sama karta, inna postać                                          | ta sama karta, inna postać                    |
| Nonogram  | poziom                              | treść                | nowa od razu, „Pokaż rozwiązanie” wyłączone (US-16)                 | nowa od razu                                  |
| Nonogram  | kategoria                           | treść                | **nowa od razu, „Pokaż rozwiązanie” wyłączone**                     | ta sama karta, nowy napis na pasku            |
| Nonogram  | „Pokaż rozwiązanie”                 | ozdoba (tylko ekran) | ta sama karta (US-15)                                               | ta sama karta                                 |
| Nonogram  | postać                              | ozdoba               | ta sama karta, inna postać                                          | ta sama karta, inna postać                    |
| Dyktando  | poziom                              | treść                | nowa od razu, „Pokaż rozwiązanie” wyłączone (US-17)                 | nowa od razu                                  |
| Dyktando  | kategoria                           | treść                | **nowa od razu, „Pokaż rozwiązanie” wyłączone** (zmienia PRD:341)   | ta sama karta, nowy napis na pasku            |
| Dyktando  | „Pokaż rozwiązanie”                 | ozdoba (tylko ekran) | ta sama karta (US-17)                                               | ta sama karta                                 |
| Dyktando  | postać                              | ozdoba               | ta sama karta, inna postać                                          | ta sama karta, inna postać                    |
| Pieniądze | poziom                              | treść                | nowa od razu                                                        | nowa od razu                                  |
| Pieniądze | postać                              | ozdoba               | ta sama karta, inna postać                                          | ta sama karta, inna postać                    |

Pogrubione wiersze to jedyna zmiana zachowania z I-9; poza nimi dochodzi ostrzeżenie przy ponownym druku i `unavailable` po nieudanej nowej karcie (7.2).

Kolejne karty (S-34..S-36) dopisują swoje wiersze przez `contentKey` w swoim spec; ta tabela przechodzi do dokumentów w fazie D02 6.

## Critical Implementation Details

**Strip-types.** Klasy kontraktu (`VerifiedCard`, `CardInvariantError`, `CardExhausted`) bez właściwości parametrów konstruktora, `enum` i `namespace`; inaczej `npm test` padnie na składni, choć `astro check` przejdzie.

**State sequencing.** W `unavailable` arkusz się nie renderuje (także dla Ctrl+P), a pasek ustawień zostaje (`sheetShown` = true). Zmiana ustawień zapisuje ustawienie i woła `applySettings` w tym samym handlerze, z nowymi ustawieniami (nie z odczytu stanu po renderze); inaczej bezpiecznik `sheetView` mignie przez jeden render. „Nowa karta i drukuj” musi drukować dopiero nową kartę: `window.print()` po zatwierdzeniu renderu (`flushSync` albo efekt na znaczniku „drukuj po renderze”), a przy nieudanej nowej karcie (`unavailable`) nie drukuje wcale. Listener `beforeprint` ustawia `printed` tylko w `showing`. Każdy komponent musi rysować arkusz tylko w `showing`; dziś labirynt robi to przez `maze === null` (`WorksheetGenerator.tsx:130`), pozostałe zakładają kartę zawsze, gdy `sheetShown`. Przełącznik „Pokaż rozwiązanie” (nonogram, dyktando) w `unavailable` jest bez znaczenia; udane Generuj i tak go wyłącza, jak dziś.

**Strict mode.** Silnik zużywa losowość, więc nie wolno go wołać w updaterze `setState` (React woła updatery dwa razy w dev). Silnik w handlerze, potem `setSheet(next)`.

## Faza 1: Inwentaryzacja niezmiennika (bez zmiany kodu produkcyjnego)

### Overview

Test zbiorczy na dzisiejszych generatorach i `*Problems`, z `knownBad` dla siedmiu kart. Przypadki, które dziś padają, to znaleziska: wchodzą jako `todo` i trafiają do pliku znalezisk do przejrzenia z właścicielką. Tryb: `/10x-tdd`.

### Changes Required:

#### 1. Test zbiorczy

**File**: `src/lib/card-engines.test.ts` (nowy), dopisany na końcu skryptu `test` w `package.json`

**Intent**: Dla każdego z siedmiu rodzajów, przez lokalną tabelę adapterów (generator dzisiejszy + `*Problems`, dla labiryntu `generateMaze` + `mazeForSheet` + sprawdzenia, których bramka nie ma), sprawdzić D02 4.4 pkt 2–5: legalność (każdy poziom/ustawienie × N ziaren), różnorodność (`previousKey`, z tolerancją wyczerpania tam, gdzie PRD dopuszcza), czas (< 5 s średnio na poziom; domyka D01 R-10 dla symetrii i dyktanda) i żywotność (`knownBad` odrzucane z oczekiwanym kodem). Ziarna deterministyczne (`mulberry32` jak w `build-thumbnails.mjs`), żeby test był powtarzalny.

**Contract**: Tabela adapterów ma kształt przyszłego `CardEngine` (`generate(settings, random, previousKey)`, `problems(card, settings)`, `knownBad`), żeby fazy 4–10 podmieniały wpis jeden na jeden. Przypadek, który dziś pada, dostaje `{ todo: "<kod znaleziska z phase0-findings.md>" }`; asercja zostaje ta sama.

#### 2. `knownBad` siedmiu kart

**File**: `src/lib/card-engines.test.ts`

**Intent**: Labirynt: N3, N5, N6 (otwarta zewnętrzna ściana), N7 (ściana jednostronna w dwóch odmianach) i N13 (odcięta komórka) z D02 6.2. Każda dziś przechodzi bramkę, więc wszystkie są `todo` do fazy 4. Pozostałe sześć kart: przypadki wyprowadzone z istniejących testów negatywnych przy ich `*Problems` (np. `hints-reveal-all` dla symetrii, `not-unique` dla sudoku, `tie-rows` dla pieniędzy). Do tego sondy dwóch znanych miękkich miejsc: łatwy nonogram z wierszem opisanym niejednoznacznie (D01 A5) i dyktando ze startem poza lewym górnym rogiem (D01 R-9).

**Contract**: wpis `knownBad` = `{ name, card, settings, expectedCode }`; `expectedCode` to dzisiejsza wartość z unii `*Problem` danej karty albo kod labiryntu z D02 4.8.

#### 3. Plik znalezisk

**File**: `context/changes/gh283-verified-card/phase0-findings.md` (nowy)

**Intent**: Każdy `todo` z testu: kod, karta, co padło, czy to luka strażnika czy defekt generatora, i która faza go zamyka. R-9 i A5 osobno jako pytania do właścicielki.

**Contract**: jeden wiersz tabeli na `todo`; kody w teście i w pliku są te same.

### Success Criteria:

#### Automated Verification:

- `npm test` zielone (przypadki znalezisk jako `todo`, nie jako błędy)
- `src/lib/card-engines.test.ts` jest na liście skryptu `test` (strażnik `test-script.test.ts` zielony)
- `npm run lint` i `npx astro check` zielone
- `git diff --stat main` nie dotyka plików produkcyjnych w `src/` poza `src/lib/card-engines.test.ts`

#### Manual Verification:

- Właścicielka przejrzała `phase0-findings.md` i rozstrzygnęła R-9 (sprawdzenie startu w `dictationSpec` albo usunięcie zdania z PRD:794) oraz łatwy nonogram (A5), jeśli coś znaleziono; rozstrzygnięcia są wpisane w plik znalezisk przed fazą 9

**Implementation Note**: Po zielonej automatyce zatrzymać się na przegląd znalezisk z właścicielką.

---

## Faza 2: Kontrakt `card-contract.ts`

### Overview

Typy i klasy kontraktu z testami C1–C9 (D02 6.1) oraz bramka kosztu kopii i zamrożenia na największych kartach. Tryb: `/10x-tdd`.

### Changes Required:

#### 1. Kontrakt

**File**: `src/lib/card-contract.ts` (nowy)

**Intent**: Jedyne miejsce, które buduje `VerifiedCard`: `require` (rzuca `CardInvariantError`) i `check` (zwraca problemy bez wyjątku). Karta w `VerifiedCard` to zamrożona głęboko kopia (`structuredClone` + rekurencyjne `Object.freeze`).

**Contract**: sygnatury z D02 4.3 z trzema zmianami. (0) `CardSpec` dostaje `contentKey(settings: S): string`: klucz ustawień „treść” rodzaju (tabela I-9); ozdoby do niego nie wchodzą. (1) `CardSpec.kind` i `VerifiedCard.kind` są typu `CardKindId`, który w tej fazie jest jeszcze `string` (alias); faza 11 zawęża go do unii z `CARD_KINDS`. (2) `CardExhausted` niesie `kind` i `attempts` (dla dyktanda: liczba kart w katalogu po odfiltrowaniu `previousKey`). Pola klas deklarowane jawnie (strip-types).

#### 2. Testy kontraktu

**File**: `src/lib/card-contract.test.ts` (nowy, dopisany do skryptu `test`)

**Intent**: C1–C9 z D02 6.1, z silnikami testowymi zbudowanymi w pliku (próbkujący dla C7, konstrukcyjny dla C8). C9 (`new VerifiedCard` poza modułem) jako linia z `@ts-expect-error`, pilnowana przez `npx astro check`.

**Contract**: C6 brzmi „zmiana wejściowej karty po `require` nie zmienia `verified.card`”. Jeśli bramka kosztu (niżej) każe zrezygnować z kopii, C6 zmienia się na „`require` zamraża wejście (silnik oddaje kartę na własność)”, a decyzję zapisuje się w `phase0-findings.md`.

#### 3. Bramka kosztu

**File**: `src/lib/card-contract.test.ts`

**Intent**: Zmierzyć `require` (kopia + zamrożenie, bez `problems`) na największych dzisiejszych kartach: labirynt Poziom 6 (29×35), nonogram trudny (18×24), sudoku 9×9 trudny, dyktando trudne. Budżet: mediana < 20 ms na kartę (z wyłączeniem przy `MUTATION_RUN`, jak w `maze/generate.test.ts:200`). Rozstrzyga D02 §9 punkt 4.

**Contract**: test czasu w stylu istniejących (`performance.now()`, średnia z kilku przebiegów).

### Success Criteria:

#### Automated Verification:

- `npm test` zielone, w tym C1–C8 i bramka kosztu
- `npx astro check` zielone, a usunięcie `@ts-expect-error` przy C9 daje błąd kompilacji (sprawdzone raz lokalnie)
- `npm run lint` zielone

---

## Faza 3: `SheetState` i przyczyna niepowodzenia

### Overview

Czysty stan strony (D02 4.6, faza 3b, włączona) z dwoma niezmiennikami: nieudane Generuj wyłącza kartę z przyczyną (7.2, 7.5) i zadanie na ekranie odpowiada ustawieniom treści na pasku (I-9), plus znacznik `printed` dla ostrzeżenia przy ponownym druku. Do tego zmiany PRD, które I-9 i ostrzeżenie wprowadzają. Okno ostrzeżenia w `CardPage` wchodzi w fazie 4 z pierwszym rodzajem, który je zasila. Tryb: `/10x-tdd` (stan, przyczyna), `/10x-implement` (PRD).

### Changes Required:

#### 1. Stan i przejścia

**File**: `src/lib/sheet-state.ts` (nowy)

**Intent**: `SheetState<C>` (`idle` z `failure | null`, `showing` z `VerifiedCard`, kluczem treści, dla którego karta powstała, i `printed`, `unavailable` z `failure` i kluczem treści ostatniej próby) i funkcja przejścia, która woła silnik i łapie wyłącznie `CardExhausted` i `CardInvariantError`; każdy inny błąd leci dalej. Przy `CardInvariantError` `console.error` z kodem (dla twórcy). `applySettings` to jedyna droga zmiany ustawień przy pokazanej karcie: ten sam klucz treści → stan bez zmian (ozdoby), inny → `generateSheet` (I-9). `markPrinted` ustawia `printed` w `showing`. Widok `sheetView(state, contentKey)`: przy `showing` z innym kluczem (handler ominął `applySettings`) zwraca `unavailable` bez przyczyny dla rodzica i loguje `console.error` — bezpiecznik, nie stan UX.

**Contract**: `generateSheet(state, engine, settings, random): SheetState<C>`; `previousKey` bierze z karty w `showing` (I-2). `applySettings(state, engine, settings, random): SheetState<C>`: w `idle` zwraca `idle` z wyczyszczonym `failure` (jak dziś); w `showing` i `unavailable` porównuje `engine.spec.contentKey(settings)` z zapisanym kluczem. `markPrinted(state): SheetState<C>`. `sheetView(state, contentKey): { kind: "idle" | "showing" | "unavailable"; printed: boolean; … }`. Typ `CardFailure = CardExhausted | CardInvariantError`.

#### 2. Przyczyna dla rodzica

**File**: `src/lib/sheet-state.ts`

**Intent**: `failureReason(failure, context)`: dla `CardExhausted` krótki tekst z poziomem i, gdy rodzaj ma kategorię, kategorią („Nie ma więcej różnych kart w kategorii … na tym poziomie.”); dla `CardInvariantError` jeden tekst „Karta nie przeszła sprawdzenia (kod: …). To błąd aplikacji.” z pierwszym kodem. Ostateczne brzmienie ustala implementacja (D02 4.5).

**Contract**: `context` = `{ levelLabel: string; categoryLabel?: string }`, podawany przez komponent z danych, które już ma.

#### 3. Testy

**File**: `src/lib/sheet-state.test.ts` (nowy, dopisany do skryptu `test`)

**Intent**: N16 (przejścia: `showing` + porażka → `unavailable`; `idle` + porażka → `idle` z `failure`; `unavailable` + sukces → `showing`; `TypeError` z silnika → wyjątek leci, stan bez zmiany; `previousKey` brany z `showing`) i N15 w wersji ogólnej (oba rodzaje porażki dają niepusty tekst; tekst `CardInvariantError` zawiera kod; tekst `CardExhausted` zawiera kategorię, gdy jest). Nowy N17 (I-9 i druk): `applySettings` w `showing` z tym samym kluczem treści → ten sam obiekt stanu (ta sama karta, `printed` zachowane); z innym kluczem → nowa karta z innym `key` i `printed = false`; z innym kluczem i porażką → `unavailable`; w `unavailable` z innym kluczem → nowa próba; w `idle` → `idle` bez generowania. `markPrinted` w `showing` → `printed = true`, w `idle` i `unavailable` bez zmian; udane `generateSheet` po `markPrinted` → `printed = false`. `sheetView` z kluczem innym niż w `showing` → `unavailable` i `console.error`.

#### 4. PRD dla I-9 i ostrzeżenia

**File**: `context/foundation/prd.md` (US-20 PRD:382, US-22 PRD:402-414)

**Intent**: Zapisać reguły tam, gdzie rodzic je spotyka, w tym samym PR co stan, który je definiuje (bez osobnego PR dokumentów). US-20: zdanie „Wybrana kategoria obowiązuje przy następnym Generuj, jak każde ustawienie generatora” zastąpione: zmiana kategorii przy pokazanej karcie od razu układa nową kartę, jak zmiana poziomu. US-22: dwa nowe kryteria: (1) gdy Generuj albo nowa karta po zmianie ustawienia się nie udały, w miejscu karty jest krótka przyczyna, a Drukuj jest wyłączone; (2) Drukuj na karcie, która już była drukowana, pyta „Ta karta była już drukowana” z wyborem „Nowa karta i drukuj” i „Drukuj tę samą”; zmiana postaci, kolorów i „Pokaż rozwiązanie” nie robi nowej karty. US-21 i US-08 bez zmian (postać zostaje ozdobą). Zdania dyktanda (PRD:341, PRD:815) zmieniają się w fazie 10 razem z jego kodem. PRD zmienia się przed kodem kart (fazy 4–10); do końca fazy 10 część stron jeszcze go nie spełnia, co jest zapisane w opisie PR.

### Success Criteria:

#### Automated Verification:

- `npm test` zielone, w tym N15 i N16
- `npm run lint` i `npx astro check` zielone
- `npm test` zielone, w tym N17 (I-9 i `printed`)

#### Manual Verification:

- Właścicielka zatwierdziła brzmienie zmian US-20 i US-22

---

## Faza 4: Labirynt pionowo

### Overview

`mazeSpec` z dziesięcioma kodami, silnik labiryntu, komponent na `SheetState`, skrypt miniatur; usunięcie `mazeForSheet` i publicznego `generateMaze`. Tryb: spec i silnik `/10x-tdd`; komponent, skrypt i testy treści `/10x-implement`.

### Changes Required:

#### 1. Spec i silnik

**File**: `src/lib/maze/engine.ts` (nowy), `src/lib/maze/generate.ts`

**Intent**: `mazeSpec.problems(maze, settings)` sprawdza kody z D02 4.8 w tej kolejności: `grid-size` (przerywa dalsze), `entrance-position`, `entrance-sealed`, `exit-position`, `exit-sealed`, `outer-wall-open`, `wall-mismatch`, `no-route`, `several-routes`, `unreachable-cells` (D02 §7.4: osiągalność wszystkich komórek jest regułą produktu). `mazeEngine.generate` = dzisiejsza pętla 20 kandydatów i `scoreMaze`, potem `VerifiedCard.require` na zwycięzcy (konstrukcyjny: naruszenie to `CardInvariantError`, nigdy `CardExhausted`). `keyOf` = zapis ścian; `previousKey` ignorowany.

**Contract**: settings = `CardSettingsOf<"labirynt">` (`{ level }`); nieznany `levelId` → zwykły `Error` z `levelById` (N10). `countPaths` i `scoreMaze` zostają w `generate.ts`; `mazeForSheet` znika, `generateMaze` przestaje być eksportowany poza silnik i testy modułu.

#### 2. Testy labiryntu

**File**: `src/lib/maze/generate.test.ts` (testy `mazeForSheet` z `:289-343` zamienione na testy `mazeSpec`), `src/lib/card-engines.test.ts`

**Intent**: L1–L6 i N1–N14 z D02 6.2, asercje na `code`; N12 pinuje kolejność. W teście zbiorczym adapter labiryntu zastąpiony `mazeEngine`, `todo` labiryntu zamknięte.

#### 3. Komponent i stan

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: `maze`, `sheetShown`, `generateFailed` zastąpione jednym `SheetState<Maze>`; `handleGenerate` i `redrawForLevel` wołają `generateSheet` w handlerze. `GENERATE_FAILED_TEXT` zastąpiony `failureReason`.

**Contract**: Zachowanie po zmianie poziomu bez pokazanej karty bez zmian (stan `idle`, kasuje przyczynę). Po nieudanym Generuj przy pokazanej karcie: `unavailable`, Drukuj wyłączone, przyczyna widoczna.

#### 3a. Ostrzeżenie przy ponownym druku

**File**: `src/components/CardPage.tsx`, `src/hooks/useCardPage.ts`, nowy `src/components/ReprintDialog.tsx` (z `src/components/ui/dialog.tsx`)

**Intent**: Jedno okno dla wszystkich kart. `CardPage` dostaje opcjonalne `printedBefore` i `onRegenerate`; Drukuj przy `printedBefore` otwiera okno zamiast `window.print()`. „Nowa karta i drukuj” (główny) woła `onRegenerate`, a druk rusza po renderze nowej karty i tylko gdy nowa karta jest w `showing`; „Drukuj tę samą” woła `window.print()`. Listener `beforeprint` (w hooku strony) woła `markPrinted`. Strony jeszcze nie przeniesione nie podają `printedBefore`, więc działają jak dziś.

**Contract**: teksty okna ustala implementacja w granicach PRD US-22 (faza 3); przyciski z `src/components/ui/button.tsx`; okno i jego przyciski `print:hidden`.

#### 4. Testy treści i skrypt

**File**: `src/lib/sheet/character.test.ts:78`, `src/lib/sheet/walls.test.ts:3`, `:46`, `scripts/build-thumbnails.mjs:62-65`

**Intent**: Regex `generateMaze\(level, Math\.random\)` usunięty (D02 tabela 5, wiersz 8); `walls.test.ts` bierze labirynt z `mazeEngine`; skrypt miniatur woła `mazeEngine.generate` (rzuca sam).

**Contract**: `npm run thumbnails` daje bajt w bajt ten sam `public/thumbnails/labirynt.svg` co przed zmianą (to samo ziarno, ta sama pętla).

### Success Criteria:

#### Automated Verification:

- `npm test` zielone; w `card-engines.test.ts` brak `todo` labiryntu
- `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- `grep -rn "mazeForSheet" src scripts` nie zwraca trafień
- `npm run thumbnails` nie zmienia `public/thumbnails/labirynt.svg` (`git diff --exit-code public/thumbnails`)
- e2e Chromium dla stron labiryntu (`npx playwright test --project=chromium` z `E2E_PORT` na wolnym porcie) zielone
- I-9 i druk: test `contentKey` rodzaju zgodny z tabelą „Ustawienie → skutek” i e2e (zmiana postaci zostawia tę samą kartę; drugi Drukuj otwiera ostrzeżenie; „Nowa karta i drukuj” daje inną kartę; „Drukuj tę samą” jej nie zmienia) zielone

#### Manual Verification:

- `/maze`: Generuj na każdym poziomie daje kartę jak przed zmianą (bez różnic wizualnych), druk A4 bez zmian
- Wymuszona porażka (np. tymczasowo w devtools albo przez zły poziom w `localStorage`) pokazuje przyczynę i wyłącza Drukuj
- Ostrzeżenie w prawdziwym oknie druku Chromium: Drukuj → anuluj → Drukuj pokazuje okno; Ctrl+P na drukowanej karcie drukuje bez pytania, a następny Drukuj ostrzega; „Nowa karta i drukuj” pokazuje w podglądzie druku nową kartę; okno ostrzeżenia na telefonie (375 px) mieści oba przyciski

**Implementation Note**: Po zielonej automatyce zatrzymać się na ręczne sprawdzenie `/maze`.

---

## Faza 5: Pieniądze pionowo

### Overview

Wzorzec migracji dla „Kto ma więcej?”. Tryb: spec i silnik `/10x-tdd`, komponent `/10x-implement`.

### Changes Required:

#### 1. Silnik, test zbiorczy, komponent

**File**: `src/lib/money/engine.ts` (nowy), `src/lib/card-engines.test.ts`, `src/components/MoneyGenerator.tsx`

**Intent**: `moneySpec.problems(card, { level })` owija `moneyCardProblems(card, moneyLevelById(level))`; `knownBad` z testów `money/rules.test.ts`. Komponent według wzorca.

**Contract**: settings = `CardSettingsOf<"pieniadze">`; `keyOf` = `card.key`.

### Success Criteria:

#### Automated Verification:

- `npm test` zielone; brak `todo` pieniędzy w `card-engines.test.ts`
- `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- e2e `tests/e2e/money.spec.ts` i `card-settings.spec.ts` (Chromium, `E2E_PORT`) zielone
- I-9 i druk: test `contentKey` rodzaju zgodny z tabelą „Ustawienie → skutek” i e2e (zmiana postaci zostawia tę samą kartę; drugi Drukuj otwiera ostrzeżenie; „Nowa karta i drukuj” daje inną kartę; „Drukuj tę samą” jej nie zmienia) zielone

#### Manual Verification:

- Strona „Kto ma więcej?”: Generuj na trzech poziomach i druk bez zmian wizualnych

---

## Faza 6: Symetria pionowo

### Overview

Wzorzec migracji dla symetrii. Tryb: spec i silnik `/10x-tdd`, komponent `/10x-implement`.

### Changes Required:

#### 1. Silnik, test zbiorczy, komponent

**File**: `src/lib/symmetry/engine.ts` (nowy), `src/lib/card-engines.test.ts`, `src/components/SymmetryGenerator.tsx`

**Intent**: `symmetrySpec` owija `symmetryCardProblems`; silnik tłumaczy `{ level, category }` na `symmetryLevelById` i kategorię; `colors` nie wpływa na kartę (przełącznik kolorów dalej nie generuje nowej karty). Pusta kategoria (`templates.length === 0`) → `CardExhausted` z `attempts = 0`.

**Contract**: settings = `CardSettingsOf<"symetria">`; `knownBad` z kodów `symmetry/generate.ts:30-41` (np. `hints-reveal-all`, `hint-not-in-answer`).

### Success Criteria:

#### Automated Verification:

- `npm test` zielone; brak `todo` symetrii; test czasu symetrii (nowy w teście zbiorczym) zielony
- `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- e2e `symmetry-colors.spec.ts`, `card-settings.spec.ts`, `level-bar.spec.ts` (Chromium, `E2E_PORT`) zielone
- I-9 i druk: test `contentKey` rodzaju zgodny z tabelą „Ustawienie → skutek” i e2e (zmiana postaci zostawia tę samą kartę; drugi Drukuj otwiera ostrzeżenie; „Nowa karta i drukuj” daje inną kartę; „Drukuj tę samą” jej nie zmienia) zielone

#### Manual Verification:

- `/symmetry`: Generuj w kilku kategoriach i poziomach, przełącznik kolorów zostawia tę samą kartę
- `/symmetry`: zmiana kategorii przy pokazanej karcie od razu daje kartę z nowej kategorii; wąska kategoria bez innej karty pokazuje przyczynę

---

## Faza 7: Sekwencje pionowo

### Overview

Wzorzec migracji dla sekwencji. Tryb: spec i silnik `/10x-tdd`, komponent `/10x-implement`.

### Changes Required:

#### 1. Silnik, test zbiorczy, komponent

**File**: `src/lib/sequence/engine.ts` (nowy), `src/lib/card-engines.test.ts`, `src/components/SequenceGenerator.tsx`

**Intent**: `sequenceSpec.problems` owija `sequenceCardProblems(card, sequenceLevelById(level))` (wiersze sprawdza ono samo przez `sequenceRowProblems`); sprawdzenie idzie na karcie z `shapeColors`, czyli tej, która trafia do UI.

**Contract**: settings = `CardSettingsOf<"sekwencje">`; `knownBad` z testów `sequence/generate.test.ts` (np. `ambiguous`, `duplicate-row`).

### Success Criteria:

#### Automated Verification:

- `npm test` zielone; brak `todo` sekwencji
- `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- e2e `sequence-colors.spec.ts`, `card-settings.spec.ts` (Chromium, `E2E_PORT`) zielone
- I-9 i druk: test `contentKey` rodzaju zgodny z tabelą „Ustawienie → skutek” i e2e (zmiana postaci zostawia tę samą kartę; drugi Drukuj otwiera ostrzeżenie; „Nowa karta i drukuj” daje inną kartę; „Drukuj tę samą” jej nie zmienia) zielone

#### Manual Verification:

- `/sequences`: Generuj na czterech poziomach, kolory zostawiają tę samą kartę

---

## Faza 8: Sudoku pionowo

### Overview

Wzorzec migracji dla sudoku plus wyniesienie `sudokuBlock`, żeby komponent nie importował wartości z `sudoku/generate.ts`. Tryb: spec i silnik `/10x-tdd`, komponent `/10x-implement`.

### Changes Required:

#### 1. `sudokuBlock` poza generatorem

**File**: `src/lib/sudoku/block.ts` (nowy), `src/lib/sudoku/generate.ts`, `src/components/SudokuGenerator.tsx:12`, `:179`

**Intent**: Funkcja przenosi się bez zmiany; `generate.ts` i komponent importują ją z nowego modułu (warunek reguły depcruise z fazy 11).

#### 2. Silnik, test zbiorczy, komponent

**File**: `src/lib/sudoku/engine.ts` (nowy), `src/lib/card-engines.test.ts`, `src/components/SudokuGenerator.tsx`

**Intent**: `sudokuSpec` owija `sudokuCardProblems`. Druga kontrola w `require` liczy rozwiązania drugi raz; jeśli test czasu 9×9 trudnego przekracza budżet istniejącego testu `sudoku/generate.test.ts`, silnik przechodzi na `VerifiedCard.check` w pętli (zapisane w kodzie komentarzem i w `phase0-findings.md`).

**Contract**: settings = `CardSettingsOf<"sudoku">` (`SudokuCardSettings`); `colors` nie wpływa na kartę.

### Success Criteria:

#### Automated Verification:

- `npm test` zielone; brak `todo` sudoku; czas 9×9 trudnego w budżecie
- `grep -n "sudoku/generate" src/components/SudokuGenerator.tsx` zwraca tylko importy typów
- `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- e2e `sudoku-*.spec.ts` (Chromium, `E2E_PORT`) zielone
- I-9 i druk: test `contentKey` rodzaju zgodny z tabelą „Ustawienie → skutek” i e2e (zmiana postaci zostawia tę samą kartę; drugi Drukuj otwiera ostrzeżenie; „Nowa karta i drukuj” daje inną kartę; „Drukuj tę samą” jej nie zmienia) zielone

#### Manual Verification:

- `/sudoku`: 4×4, 6×6 i 9×9 na każdym poziomie, kształty i cyfry, kolory bez nowej planszy

---

## Faza 9: Nonogram pionowo

### Overview

Wzorzec migracji dla nonogramu z unią dwóch typów kart i rozstrzygnięciem A5 z fazy 1. Tryb: spec i silnik `/10x-tdd`, komponent `/10x-implement`.

### Changes Required:

#### 1. Silnik, test zbiorczy, komponent

**File**: `src/lib/nonogram/engine.ts` (nowy), `src/lib/card-engines.test.ts`, `src/components/NonogramGenerator.tsx`

**Intent**: `nonogramSpec.problems` rozgałęzia się po rodzaju karty: łatwa → `simpleNonogramProblems`, klasyczna → `nonogramCardProblems`. Jeśli właścicielka po fazie 1 zdecydowała dodać sprawdzenie jednoznaczności łatwego poziomu (A5), dochodzi tu jako nowy kod i jego `knownBad`; jeśli nie, `todo` A5 zamienia się w test dokumentujący „jednoznaczność z konstrukcji” i znika z listy `todo`.

**Contract**: settings = `CardSettingsOf<"nonogram">`; typ karty `NonogramCard | SimpleNonogramCard`. „Pokaż rozwiązanie” zostaje stanem komponentu poza `SheetState` i wyłącza się przy każdej nowej karcie (Generuj, poziom, a teraz też kategoria).

### Success Criteria:

#### Automated Verification:

- `npm test` zielone; brak `todo` nonogramu
- `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- e2e `card-settings.spec.ts`, `level-bar.spec.ts` (Chromium, `E2E_PORT`) zielone
- I-9 i druk: test `contentKey` rodzaju zgodny z tabelą „Ustawienie → skutek” i e2e (zmiana postaci zostawia tę samą kartę; drugi Drukuj otwiera ostrzeżenie; „Nowa karta i drukuj” daje inną kartę; „Drukuj tę samą” jej nie zmienia) zielone

#### Manual Verification:

- `/nonogram`: trzy poziomy, kategorie, „Pokaż rozwiązanie” działa jak przed zmianą
- `/nonogram`: zmiana kategorii przy pokazanej karcie od razu daje kartę z nowej kategorii i wyłącza „Pokaż rozwiązanie”

---

## Faza 10: Dyktando pionowo

### Overview

Silnik dla trybu katalogowego, rozstrzygnięcie R-9 z fazy 1 i poprawka dwóch zdań PRD, które przeczą decyzji 7.2. Tryb: spec i silnik `/10x-tdd`, komponent i PRD `/10x-implement`.

### Changes Required:

#### 1. Silnik, test zbiorczy, komponent

**File**: `src/lib/dictation/engine.ts` (nowy), `src/lib/card-engines.test.ts`, `src/components/DictationGenerator.tsx`

**Intent**: `dictationSpec` owija `dictationCardProblems` i, jeśli właścicielka tak zdecydowała (R-9), sprawdza punkt startu w lewym górnym rogu sylwetki nowym kodem z `knownBad`. Silnik bierze kartę z katalogu jak dziś; brak innego obrysu → `CardExhausted` z liczbą kart katalogu. `maxCommands` zostaje filtrem katalogu.

**Contract**: settings = `CardSettingsOf<"dyktando">`. Każda nowa karta (Generuj, poziom, kategoria) wyłącza „Pokaż rozwiązanie”; nieudana nowa karta przechodzi w `unavailable`.

#### 2. PRD

**File**: `context/foundation/prd.md:341`, `:815`

**Intent**: Zdania „Sama zmiana kategorii go nie wyłącza. Nieudane Generuj zostawia przełącznik i poprzednią kartę.” zastąpione zdaniami zgodnymi z I-9 i decyzją 7.2: zmiana kategorii układa nową kartę i wyłącza przełącznik jak zmiana poziomu; nieudane Generuj wyłącza kartę i pokazuje przyczynę. Jeśli R-9 rozstrzygnięto usunięciem reguły, w tym samym PR wypada zdanie o punkcie startu z PRD:794.

### Success Criteria:

#### Automated Verification:

- `npm test` zielone; brak `todo` dyktanda; test czasu dyktanda (z budową katalogu) zielony
- `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- e2e `card-settings.spec.ts`, `level-bar.spec.ts` (Chromium, `E2E_PORT`) zielone
- `grep -nE "Nieudane Generuj zostawia|Sama zmiana kategorii go nie wyłącza" context/foundation/prd.md` nie zwraca trafień
- I-9 i druk: test `contentKey` rodzaju zgodny z tabelą „Ustawienie → skutek” i e2e (zmiana postaci zostawia tę samą kartę; drugi Drukuj otwiera ostrzeżenie; „Nowa karta i drukuj” daje inną kartę; „Drukuj tę samą” jej nie zmienia) zielone

#### Manual Verification:

- `/dictation`: trzy poziomy, kategorie, „Pokaż rozwiązanie” jak dotąd; nieudane Generuj w wąskiej kategorii pokazuje przyczynę
- `/dictation`: zmiana kategorii przy pokazanej karcie od razu daje kartę z nowej kategorii i wyłącza „Pokaż rozwiązanie”

---

## Faza 11: Rejestr wymuszony typem i domknięcie

### Overview

`CARD_KINDS` jako stała z unią id, `CARD_ENGINES` typowany mapą, test zbiorczy na rejestrze, reguła depcruise i pełna regresja. Tryb: `/10x-implement` (test kompletności rejestru i „brak `todo`” test-first).

### Changes Required:

#### 1. Rejestr rodzajów

**File**: `src/lib/cards.ts`

**Intent**: `CARD_KINDS` `as const satisfies readonly CardKind[]`; `CardKindId` = unia id. Alias `CardKindId = string` z `card-contract.ts` zastąpiony importem.

**Contract**: `CardKind.id` zostaje `string` w interfejsie; zawęża go `as const`. `cardsInCatalogOrder` i istniejące testy `cards.test.ts` bez zmian zachowania.

#### 2. Rejestr silników

**File**: `src/lib/card-engines.ts` (nowy)

**Intent**: `CARD_ENGINES` ze wszystkimi siedmioma silnikami; brak silnika dla rodzaju z `CARD_KINDS` to błąd kompilacji.

**Contract**:

```ts
interface CardTypeMap {
  labirynt: Maze; symetria: SymmetryCard; sekwencje: SequenceCard; sudoku: SudokuCard;
  nonogram: NonogramCard | SimpleNonogramCard; dyktando: DictationCard; pieniadze: MoneyCard;
}
export const CARD_ENGINES = { … } satisfies {
  [K in CardKindId]: CardEngine<CardSettingsOf<K>, CardTypeMap[K]>;
};
```

`CardSettingsId` i `CardKindId` muszą być tą samą unią; pilnuje tego dzisiejszy test `card-settings.test.ts:33` i asercja typu w `card-engines.ts`.

#### 3. Test zbiorczy na rejestrze

**File**: `src/lib/card-engines.test.ts`

**Intent**: Lokalna tabela adapterów znika; test iteruje po `CARD_ENGINES` i dochodzą D02 4.4 pkt 1 (kompletność: klucze `CARD_ENGINES` = id `CARD_KINDS`) i pkt 6 (`VerifiedCard.card` zamrożony). Dochodzi też I-9: dla każdego rodzaju zmiana ustawienia „ozdoba” nie zmienia `contentKey`, a każdego „treść” zmienia. Nowy test: plik nie zawiera `todo` (czyta własne źródło jak `print-contract.test.ts`).

#### 4. Reguła depcruise

**File**: `.dependency-cruiser.cjs`

**Intent**: `cards-only-through-engines` z D02 4.7: `src/(components|hooks|pages)/` nie importuje wartości z `src/lib/(maze|symmetry|sequence|sudoku|nonogram|dictation|money)/generate.ts` (importy typów dozwolone).

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- `npm run smoke` na zbudowanym podglądzie zielone
- pełne e2e Chromium (`chromium`, `phone-360`, `pixel-7`, `tablet-768`) z `E2E_PORT` zielone
- tymczasowe dopisanie rodzaju do `CARD_KINDS` bez silnika daje błąd `npx astro check` (sprawdzone raz lokalnie, niezacommitowane)
- tymczasowy import `generateSymmetryCard` w komponencie daje błąd `npm run depcruise` (sprawdzone raz lokalnie, niezacommitowane)

#### Manual Verification:

- Wszystkie siedem stron kart: Generuj, zmiana poziomu, druk A4 bez różnic wizualnych względem `main` sprzed zmiany
- Na telefonie (pane 375 px) komunikat przyczyny nie zasłania Generuj ani Drukuj

---

## Testing Strategy

### Unit Tests:

- Kontrakt: C1–C9 i bramka kosztu (faza 2).
- Stan i przyczyna: N15, N16 i N17 (I-9, `printed`) (faza 3).
- I-9 per rodzaj: `contentKey` zgodny z tabelą „Ustawienie → skutek” (fazy 4–10), zbiorczo w fazie 11.
- Labirynt: L1–L6, N1–N14, kolejność kodów (faza 4).
- Każdy rodzaj: `knownBad` odrzucane z oczekiwanym kodem; spec zgodny z dzisiejszymi `*Problems`.
- Test zbiorczy: legalność, różnorodność, czas (< 5 s), żywotność, zamrożenie, kompletność rejestru, brak `todo`.

### Integration Tests:

- e2e Chromium stron migrowanego rodzaju w każdej fazie 4–10, pełne e2e w fazie 11. Uruchamiać z `E2E_PORT` na wolnym porcie, bo `reuseExistingServer` inaczej testuje serwer z innego checkoutu.

### Manual Testing Steps:

1. Na każdej stronie karty: Generuj na każdym poziomie, zmiana kategorii/kolorów, druk A4 (podgląd druku Chromium).
2. Wymuszona porażka (wąska kategoria, zły poziom w `localStorage`): przyczyna widoczna, Drukuj wyłączone, kolejne udane Generuj wraca do `showing`.
3. Miniatury: `npm run thumbnails` bez zmian w `public/thumbnails`.

## Performance Considerations

- Budżet PRD: generowanie ≤ 5 s (I-4); test zbiorczy sprawdza go dla każdego rodzaju i poziomu.
- Kopia i zamrożenie: mediana < 20 ms na największej karcie (faza 2), inaczej zamrożenie bez kopii.
- Druga kontrola w `require` dla kart próbkujących: w budżecie istniejących testów czasu danego rodzaju, inaczej przejście na `VerifiedCard.check` w pętli (najbardziej zagrożone: sudoku 9×9 trudne, nonogram trudny).
- Testy czasu wyłączone przy `MUTATION_RUN=1`, jak dziś.

## Migration Notes

- Dane zapisane (`localStorage`: profile, ustawienia kart, ostatnie parametry, id poziomów) bez zmian (D02 §8, wiersz „Bez zmiany”).
- Zmiana zachowania widoczna dla rodzica: po nieudanym Generuj albo zmianie poziomu przy pokazanej karcie karta znika z druku i widać przyczynę. Wchodzi rodzaj po rodzaju (fazy 4–10). Druga zmiana widoczna (I-9): na symetrii, nonogramie i dyktandzie zmiana kategorii przy pokazanej karcie od razu układa nową kartę (jak poziom). Trzecia: Drukuj na już drukowanej karcie pyta, czy wygenerować nową. Postać, kolory i „Pokaż rozwiązanie” działają jak dziś. PRD opisuje to od fazy 3; między fazą 3 a 10 strony, których rodzaj jeszcze nie przeszedł migracji, zachowują się po staremu.
- Rollback: każda faza to jeden PR; revert PR rodzaju przywraca jego dzisiejszy komponent i generator. Fazy 1–3 nie zmieniają zachowania.

## References

- Plan refaktoru: `context/domain/02-invariant-aggregate-refactor.md` (D02: §4 kontrakt, §6 fazy i przypadki C1–C9, N1–N16, §7 decyzje, §9 ryzyka)
- Destylacja domeny: `context/domain/01-domain-distillation.md` (D01 §5, A5, A9, R-9, R-10)
- `src/lib/maze/generate.ts:30-130`, `src/lib/symmetry/generate.ts:49-69`, `src/lib/dictation/generate.ts:60-126`, `src/lib/card-settings.ts:57-81`, `src/lib/cards.ts:1-10`
- `src/components/WorksheetGenerator.tsx:42-77`, `src/components/CardPage.tsx:13`, `:99`, `:145`
- `src/lib/test-script.test.ts`, `.dependency-cruiser.cjs:267`, `scripts/build-thumbnails.mjs:62`
- `AGENTS.md` „Tests and CI” (`E2E_PORT`, joby `ci`, `smoke`, `e2e`)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Inwentaryzacja niezmiennika

#### Automated

- [ ] 1.1 `npm test` zielone (przypadki znalezisk jako `todo`, nie jako błędy)
- [ ] 1.2 `src/lib/card-engines.test.ts` jest na liście skryptu `test` (strażnik `test-script.test.ts` zielony)
- [ ] 1.3 `npm run lint` i `npx astro check` zielone
- [ ] 1.4 `git diff --stat main` nie dotyka plików produkcyjnych w `src/` poza `src/lib/card-engines.test.ts`

#### Manual

- [ ] 1.5 Właścicielka przejrzała `phase0-findings.md` i rozstrzygnęła R-9 oraz łatwy nonogram (A5)

### Phase 2: Kontrakt card-contract.ts

#### Automated

- [ ] 2.1 `npm test` zielone, w tym C1–C8 i bramka kosztu
- [ ] 2.2 `npx astro check` zielone, a usunięcie `@ts-expect-error` przy C9 daje błąd kompilacji
- [ ] 2.3 `npm run lint` zielone

### Phase 3: SheetState i przyczyna niepowodzenia

#### Automated

- [ ] 3.1 `npm test` zielone, w tym N15 i N16
- [ ] 3.2 `npm run lint` i `npx astro check` zielone
- [ ] 3.3 `npm test` zielone, w tym N17 (I-9 i `printed`)

#### Manual

- [ ] 3.4 Właścicielka zatwierdziła brzmienie zmian US-20 i US-22

### Phase 4: Labirynt pionowo

#### Automated

- [ ] 4.1 `npm test` zielone; w `card-engines.test.ts` brak `todo` labiryntu
- [ ] 4.2 `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- [ ] 4.3 `grep -rn "mazeForSheet" src scripts` nie zwraca trafień
- [ ] 4.4 `npm run thumbnails` nie zmienia `public/thumbnails/labirynt.svg`
- [ ] 4.5 e2e Chromium dla stron labiryntu z `E2E_PORT` zielone
- [ ] 4.8 I-9 i druk: test `contentKey` i e2e (postać, ostrzeżenie przy ponownym druku) zielone

#### Manual

- [ ] 4.6 `/maze`: Generuj na każdym poziomie i druk A4 bez różnic wizualnych
- [ ] 4.7 Wymuszona porażka pokazuje przyczynę i wyłącza Drukuj
- [ ] 4.9 Ostrzeżenie przy ponownym druku w prawdziwym oknie druku i na telefonie

### Phase 5: Pieniądze pionowo

#### Automated

- [ ] 5.1 `npm test` zielone; brak `todo` pieniędzy w `card-engines.test.ts`
- [ ] 5.2 `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- [ ] 5.3 e2e `money.spec.ts` i `card-settings.spec.ts` (Chromium, `E2E_PORT`) zielone
- [ ] 5.5 I-9 i druk: test `contentKey` i e2e (postać, ostrzeżenie przy ponownym druku) zielone

#### Manual

- [ ] 5.4 Strona „Kto ma więcej?”: Generuj na trzech poziomach i druk bez zmian wizualnych

### Phase 6: Symetria pionowo

#### Automated

- [ ] 6.1 `npm test` zielone; brak `todo` symetrii; test czasu symetrii zielony
- [ ] 6.2 `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- [ ] 6.3 e2e `symmetry-colors.spec.ts`, `card-settings.spec.ts`, `level-bar.spec.ts` (Chromium, `E2E_PORT`) zielone
- [ ] 6.5 I-9 i druk: test `contentKey` i e2e (postać, ostrzeżenie przy ponownym druku) zielone

#### Manual

- [ ] 6.4 `/symmetry`: Generuj w kilku kategoriach i poziomach, kolory zostawiają tę samą kartę
- [ ] 6.6 `/symmetry`: zmiana kategorii od razu daje kartę z nowej kategorii

### Phase 7: Sekwencje pionowo

#### Automated

- [ ] 7.1 `npm test` zielone; brak `todo` sekwencji
- [ ] 7.2 `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- [ ] 7.3 e2e `sequence-colors.spec.ts`, `card-settings.spec.ts` (Chromium, `E2E_PORT`) zielone
- [ ] 7.5 I-9 i druk: test `contentKey` i e2e (postać, ostrzeżenie przy ponownym druku) zielone

#### Manual

- [ ] 7.4 `/sequences`: Generuj na czterech poziomach, kolory zostawiają tę samą kartę

### Phase 8: Sudoku pionowo

#### Automated

- [ ] 8.1 `npm test` zielone; brak `todo` sudoku; czas 9×9 trudnego w budżecie
- [ ] 8.2 `SudokuGenerator.tsx` importuje z `sudoku/generate` tylko typy
- [ ] 8.3 `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- [ ] 8.4 e2e `sudoku-*.spec.ts` (Chromium, `E2E_PORT`) zielone
- [ ] 8.6 I-9 i druk: test `contentKey` i e2e (postać, ostrzeżenie przy ponownym druku) zielone

#### Manual

- [ ] 8.5 `/sudoku`: wszystkie rozmiary i poziomy, kształty i cyfry, kolory bez nowej planszy

### Phase 9: Nonogram pionowo

#### Automated

- [ ] 9.1 `npm test` zielone; brak `todo` nonogramu
- [ ] 9.2 `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- [ ] 9.3 e2e `card-settings.spec.ts`, `level-bar.spec.ts` (Chromium, `E2E_PORT`) zielone
- [ ] 9.5 I-9 i druk: test `contentKey` i e2e (postać, ostrzeżenie przy ponownym druku) zielone

#### Manual

- [ ] 9.4 `/nonogram`: trzy poziomy, kategorie, „Pokaż rozwiązanie” jak przed zmianą
- [ ] 9.6 `/nonogram`: zmiana kategorii od razu daje kartę z nowej kategorii

### Phase 10: Dyktando pionowo

#### Automated

- [ ] 10.1 `npm test` zielone; brak `todo` dyktanda; test czasu dyktanda zielony
- [ ] 10.2 `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- [ ] 10.3 e2e `card-settings.spec.ts`, `level-bar.spec.ts` (Chromium, `E2E_PORT`) zielone
- [ ] 10.4 PRD nie zawiera zdania „Nieudane Generuj zostawia”
- [ ] 10.6 I-9 i druk: test `contentKey` i e2e (postać, ostrzeżenie przy ponownym druku) zielone

#### Manual

- [ ] 10.5 `/dictation`: poziomy, kategorie, „Pokaż rozwiązanie”; nieudane Generuj pokazuje przyczynę
- [ ] 10.7 `/dictation`: zmiana kategorii od razu daje kartę z nowej kategorii

### Phase 11: Rejestr wymuszony typem i domknięcie

#### Automated

- [ ] 11.1 `npm test`, `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` zielone
- [ ] 11.2 `npm run smoke` na zbudowanym podglądzie zielone
- [ ] 11.3 Pełne e2e Chromium z `E2E_PORT` zielone
- [ ] 11.4 Rodzaj w `CARD_KINDS` bez silnika daje błąd `npx astro check`
- [ ] 11.5 Import `generateSymmetryCard` w komponencie daje błąd `npm run depcruise`

#### Manual

- [ ] 11.6 Siedem stron kart: Generuj, zmiana poziomu i druk A4 bez różnic wizualnych
- [ ] 11.7 Na telefonie komunikat przyczyny nie zasłania Generuj ani Drukuj
