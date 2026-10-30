# Sekwencje, Poziom 4 (lat7): wiersze z jedną odpowiedzią dla dziecka — plan wdrożenia

## Overview

Na `lat7` (Poziom 4) część wierszy przechodzi `sequenceAnswers`, a dziecko widzi w nich drugą sensowną odpowiedź. Naprawiamy trzy rzeczy: wiersz `mixed` zawsze pokazuje co najmniej dwie liczby, `groups` na lat7 zastępuje wzór ABB, a sprawdzenie dwuznaczności zna dwa odczytania spoza dzisiejszej listy (rosnące grupy w wariantach oraz okres 5–6 widoczny w całości). Sprawdzenie jest jedno, dla wszystkich poziomów.

## Current State Analysis

- `sequenceRowProblems` odrzuca wiersz, gdy `sequenceAnswers` daje inną liczbę odpowiedzi niż 1 (`src/lib/sequence/generate.ts:208-215`). `sequenceAnswers` filtruje `hypotheses(n)` po widocznych polach (`generate.ts:145-157`).
- `hypotheses(n)` = wzory kształtów o okresie 1..n/2 + `ruleSequences` dla ośmiu reguł (`src/lib/sequence/rules.ts:168-189`). `mixed` zna tylko krok +1 (`rules.ts:138-149`), `groups` tylko A, AB, ABB… z jednym A i jednym B (`rules.ts:136-137`).
- Luki na lat6/lat7 (`gapPlacement: "free"`) losuje `drawGaps` z pól od `shownBefore(rule)` (`generate.ts:121-134`, `rules.ts:25-34`). `mixed` ma `shownBefore` 2, więc przy 3 lukach może zostać jedna widoczna liczba.
- Zakres defektu (research.md, Dopisek 1–2): `mixed` z jedną liczbą — 44 z 2361 wierszy; `groups` na 8 polach nie pokazuje reguły; cztery układy ABB mają drugą odpowiedź; na lat5 oba układy `AAB` z 2 lukami i na lat6 jeden układ `AAB` mają drugą odpowiedź po poszerzeniu.

## Desired End State

- Żaden wiersz żadnego poziomu nie przechodzi walidacji, jeśli ma drugą odpowiedź w ramach: wzorów kształtów, ośmiu reguł (z `groups`), rosnących grup w wariantach oraz okresu 5–6 widocznego w całości.
- Lat7 losuje reguły `mixed`, `down1`, `ABB`; `groups` nie jest już regułą żadnego poziomu, zostaje hipotezą.
- `mixed` na lat7 ma zawsze co najmniej dwie widoczne liczby.
- Weryfikacja: `npm test`, `npm run lint`, `npx astro check`; pomiar odsetka kart, dla których `generateSequenceCard` zwraca `null`, na każdym poziomie (w tym lat5) jest równy 0 na próbie 1000 kart; czas Generuj dalej ≪ 5 s.

### Key Discoveries:

- `hypotheses` jest „zamknięte" na liście: nowa reguła musi dostać „sąsiednie" odczytania (`rules.ts:178-189`).
- `periodicSequences` liczy tylko okresy ≤ n/2 (`rules.ts:154-166`), więc okres 5–6 nigdy nie był hipotezą; ma być liczony wprost z widocznych pól, nie przez wyliczanie 7^5 jednostek.
- Poszerzenie wycina na lat5 oba układy `AAB` z 2 lukami (`drawGaps` w trybie `end` ma ich w puli); karta nadal musi się losować w limicie `MAX_ATTEMPTS` 20 (`generate.ts:48`, `generate.ts:58-64`).

## What We're NOT Doing

- Kroków ±2 i ±3 w hipotezach liczbowych (research: przy ≥2 widocznych liczbach krok wynika z danych; zabezpieczenie nie jest potrzebne po poprawce `mixed`).
- Okresu do n−1 (odrzuciłby zbyt wiele układów i zagroziłby losowaniu lat6/lat7).
- Zmian układu karty (dłuższe wiersze), liczby wierszy ani liczby luk na poziomach.
- Zmian lat4; zmian zapisanych identyfikatorów poziomów (`lat7` zostaje).
- Przywracania `groups` jako reguły któregokolwiek poziomu.

## Implementation Approach

Test-first, od najwęższej poprawki do szerokiej: (1) `mixed`, (2) poszerzone sprawdzenie z pomiarem wpływu na lat5/lat6, (3) ABB na lat7, (4) PRD i test oracle'a z niezależnym szerokim zbiorem odczytań. Poszerzenie sprawdzenia przed ABB, żeby pomiar lat5 był czysty. Jeśli pomiar w fazie 2 pokaże karty bez wyniku (null) na lat5, stop i powrót do planu (decyzja o przydziale luk zależnym od reguły wymaga ponownego pytania).

## Faza 1: `mixed` z co najmniej dwiema widocznymi liczbami

### Overview

Wiersz `mixed` z jedną widoczną liczbą nie jest wygenerowany ani zaakceptowany przez walidator.

### Changes Required:

#### 1. Reguła wiersza i losowanie luk

**File**: `src/lib/sequence/generate.ts`

**Intent**: Wiersz `mixed` ma po zdjęciu luk co najmniej dwie widoczne liczby. Dla `drawGaps` (tryb `free`) odrzucamy wylosowany układ luk niespełniający tego warunku (próba w pętli `drawRow`), a `sequenceRowProblems` dostaje nowy problem, żeby sam walidator łapał takie wiersze.

**Contract**: nowy wariant `SequenceRowProblem` (np. `"too-few-numbers"`) zwracany dla `rule === "mixed"`, gdy widocznych liczb jest < 2. Stała minimalnej liczby widocznych liczb mieszka obok `SHOWN_BEFORE` w `rules.ts` (np. `MIXED_MIN_VISIBLE_NUMBERS = 2`). Pozostałe reguły bez zmian.

#### 2. Test

**File**: `src/lib/sequence/generate.test.ts`

**Intent**: Czerwony test na wierszu `3 kolo _ kolo _ kolo _ kolo` (luki 2, 4, 6 w `mixed` z jedną liczbą) oraz test, że 1000 kart lat7 nie zawiera wiersza `mixed` z mniej niż dwiema widocznymi liczbami.

**Contract**: używa istniejącego helpera losowego generatora i `sequenceRowProblems`; nie zmienia oracle'a.

### Success Criteria:

#### Automated Verification:

- Nowe testy `mixed` przechodzą, w tym wiersz z jedną liczbą ma problem: `node --experimental-strip-types --test src/lib/sequence/generate.test.ts`
- Typy: `npx astro check`
- Lint: `npm run lint`

#### Manual Verification:

- Ręczne wygenerowanie kilku kart lat7 pokazuje w wierszach `mixed` co najmniej dwie liczby.

**Implementation Note**: po fazie i przejściu testów pauza na ręczne potwierdzenie.

---

## Faza 2: Poszerzone sprawdzenie dwuznaczności

### Overview

`sequenceAnswers` uwzględnia rosnące grupy w wariantach i okres 5–6 widoczny w całości, dla wszystkich poziomów.

### Changes Required:

#### 1. Rosnące grupy w wariantach

**File**: `src/lib/sequence/rules.ts`

**Intent**: `hypotheses(n)` zawiera też rosnące grupy z innym początkiem bloku oraz z rosnącym A zamiast B (około 250 ciągów więcej przy n = 8, +8%), żeby wiersz z drugim odczytaniem grup nie był uznany za jednoznaczny.

**Contract**: nowa funkcja pomocnicza budująca warianty obok `growingGroups`; `ruleSequences("groups")` (i przez to `followsRule("groups", …)`) pozostaje bez zmian, warianty trafiają tylko do `hypotheses`, żeby `followsRule` dalej mówiło wprost, co jest regułą.

#### 2. Okres 5–6 widoczny w całości

**File**: `src/lib/sequence/generate.ts`

**Intent**: `sequenceAnswers` doliczają odpowiedzi z okresów 5 i 6 (i do n−1 nie), ale tylko wtedy, gdy dziecko widzi okres w całości: każde pole jednostki ma widoczne pole w tej klasie reszt, a jedno pole jednostki widać co najmniej dwa razy. Liczone w O(n) z widocznych pól, bez wyliczania 7^5 jednostek; odpowiedzi dochodzą do tego samego zbioru krotek co dotychczas.

**Contract**: ta sama sygnatura `sequenceAnswers(visible)`; dodatkowa odpowiedź zbudowana z widocznych pól to krotka wartości luk według jednostki. Jedyny kontrakt zewnętrzny to dalej „liczba odpowiedzi = 1 ⇒ wiersz jednoznaczny".

#### 3. Testy i pomiar

**File**: `src/lib/sequence/generate.test.ts`

**Intent**: Testy: cztery układy ABB z research.md (`A B B A B B _ _`, `A B B _ B B _ _`, `A B B A B _ _ _`, `A B B A B _ _ B`) mają drugą odpowiedź; lat5 `A A B A A _ _` i lat6 `A A B A A _ A _` mają teraz problem `ambiguous`; wiersze, które mają jedną odpowiedź, przechodzą. Pomiar (jednorazowy skrypt poza repo, wynik zapisany w notatce zmiany): odsetek `generateSequenceCard === null` i mediana/p99 czasu dla lat4–lat7 na 1000 kartach.

**Contract**: pomiar wchodzi do Progress jako kryterium; `null` > 0 na lat5 zatrzymuje wdrożenie i wraca do planu.

### Success Criteria:

#### Automated Verification:

- Testy sekwencji przechodzą: `node --experimental-strip-types --test src/lib/sequence/generate.test.ts src/lib/sequence/levels.test.ts`
- Typy i lint: `npx astro check` oraz `npm run lint`
- Pomiar 1000 kart na poziom: `null` = 0 na lat4–lat7, p99 czasu < 100 ms

#### Manual Verification:

- Generuj na lat5 i lat6 daje karty z wierszami AAB (z jedną luką na lat5), bez widocznych niejednoznaczności na wydruku próbnym.

**Implementation Note**: jeśli pomiar pokaże `null` > 0, pauza i powrót do planu.

---

## Faza 3: ABB zamiast `groups` na lat7

### Overview

Lat7 losuje `mixed`, `down1` i nową regułę `ABB`; wiersz ABB mieści się w 8 polach i pokazuje regułę przed lukami.

### Changes Required:

#### 1. Reguła ABB

**File**: `src/lib/sequence/rules.ts`

**Intent**: Nowy `SequenceRuleId` `"ABB"`: wzór kształtów o jednostce `[A, B, B]` powtarzanej w 8 polach. `SHOWN_BEFORE.ABB = 3` (cała jednostka widoczna przed pierwszą luką, jak AAB/ABC). `rowFromRule`, `ruleSequences`, `RULE_IDS` i `followsRule` dostają tę regułę; `groups` zostaje w `RULE_IDS`, `rowFromRule`, `ruleSequences` jako hipoteza i nie jest już użyta przez żaden poziom.

**Contract**: `PATTERN_UNITS.ABB = [0, 1, 1]`; `SequenceRuleId` = `"AB" | "AAB" | "ABC" | "ABB" | "up1" | "up2" | "down1" | "groups" | "mixed"`.

#### 2. Definicja poziomu

**File**: `src/lib/sequence/levels.ts`

**Intent**: Lat7: `rules: mixed ×2, down1 ×2, ABB ×2` (reszta wierszy z dowolnej z trzech), opis poziomu przestaje mówić „grupy" (np. „kształt z liczbą, liczby w dół, wzór kształtów; 2–3 puste pola").

**Contract**: `SequenceLevel.rules` dla `lat7`; pozostałe pola bez zmian (`gaps: 2`, `extraGapRows: 3`, `free`).

#### 3. Testy

**File**: `src/lib/sequence/generate.test.ts`, `src/lib/sequence/levels.test.ts`

**Intent**: Zmienić asercje: `rulesOf(LAT7)` = `["ABB", "down1", "mixed"]`, `FIRST_GAP_BY_RULE` dostaje `ABB: 3`, wiersz przykładowy zamiast `groups`; test „serce, krzyżyk i strzałka" nie zakłada już `groups`; oracle (`generate.test.ts:474-498`) ma nowy, niezależny od `hypotheses` zbiór odczytań (patrz Faza 4).

**Contract**: zero zmiany publicznych sygnatur.

### Success Criteria:

#### Automated Verification:

- Wszystkie testy sekwencji: `node --experimental-strip-types --test src/lib/sequence/generate.test.ts src/lib/sequence/levels.test.ts src/lib/sequence/layout.test.ts src/lib/sequence/colors.test.ts src/lib/sequence/shapes.test.ts`
- Cały zestaw: `npm test`
- `npx astro check` i `npm run lint`
- Pomiar z fazy 2 powtórzony na lat7: `null` = 0

#### Manual Verification:

- Karta lat7 w podglądzie ma wiersze `mixed`, `down1` i ABB; ABB pokazuje całą jednostkę przed lukami; karta mieści się na A4 (`/sequences`).

---

## Faza 4: PRD, oracle i przegląd poziomów

### Overview

PRD i testy mówią to samo co kod; poziomy lat4–lat6 sprawdzone tym samym zbiorem odczytań.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: W „Karta sekwencji": Poziom 4 = „mieszane: kształt z liczbą, malejące, wzór ABB"; lista reguł dostaje ABB, a rosnące grupy zostają wymienione jako odczytanie, które sprawdzenie zna; dopisek „Mieszane: co najmniej dwie widoczne liczby"; doprecyzowanie dwuznaczności o odczytania spoza listy (rosnące grupy w wariantach, okres 5–6 widoczny w całości). Poprawić zdania o lat7 w „Doprecyzowanie z planu poziomów" (3 pierwsze pola dla grup → ABB).

**Contract**: sekcja Business Logic „Karta sekwencji" oraz wiersz tabeli Poziom 4; US-11 i FR-020 bez zmian co do liczb.

#### 2. Oracle w testach

**File**: `src/lib/sequence/generate.test.ts`

**Intent**: Niezależny oracle: osobna lista odczytań zbudowana w teście (wzory kształtów o okresie ≤ 6, reguły liczbowe z krokami ±1..±3, rosnące grupy w wariantach), do którego porównywane są wiersze z `generateSequenceCard` na każdym poziomie (kilkaset kart); test wymaga jednej odpowiedzi dla każdego wiersza.

**Contract**: oracle nie importuje `hypotheses`; różnica między oracle'em a produkcyjnym sprawdzeniem jest sygnałem regresji.

#### 3. Notatka zamknięcia

**File**: `context/changes/gh117-sequence-lat7-ambiguity/change.md`

**Intent**: Dopisać wyniki pomiaru (null, czasy) i listę zmienionych reguł do Notes.

**Contract**: bez zmian frontmattera poza standardowym przepływem skilla.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, `npm run build`
- Test oracle'a przechodzi dla lat4–lat7

#### Manual Verification:

- Wydruk próbny karty lat7 (3–4 karty): w każdym wierszu dziecko widzi jedną odpowiedź.

---

## Testing Strategy

### Unit Tests:

- Cztery układy ABB z drugą odpowiedzią i dwa układy AAB (lat5/lat6) — `ambiguous`.
- `mixed` z jedną widoczną liczbą — nowy problem; z dwiema — poprawny.
- Wiersze `down1` z 3 lukami (20/20) dalej przechodzą.
- `followsRule("groups", …)` bez zmian (zachowanie reguły), `followsRule("ABB", …)` dla `A B B A B B A B`.

### Integration Tests:

- 1000 kart na każdym poziomie: brak `null`, każdy wiersz ma jedną odpowiedź według niezależnego oracle'a.

### Manual Testing Steps:

1. `/sequences`, Poziom 4: kilka razy Generuj, sprawdzić wiersze mixed (≥2 liczby) i ABB.
2. Poziom 2 i 3: Generuj, karta się układa.
3. Druk próbny jednej karty lat7.

## Performance Considerations

`hypotheses(8)` rośnie z 3049 do ok. 3300 ciągów (+8%); `sequenceAnswers` ok. 0,1 ms/wywołanie. Okres 5–6 liczony wprost, O(n). Dzisiejszy czas lat7: mediana ok. 2 ms, p99 14 ms.

## Migration Notes

Brak: identyfikatory poziomów (`lat7`) i zapisane profile bez zmian. `groups` zostaje w typie `SequenceRuleId`.

## References

- Related research: `context/changes/gh117-sequence-lat7-ambiguity/research.md`
- Sprawdzenie dwuznaczności: `src/lib/sequence/generate.ts:145-157`, `:166-217`
- Hipotezy: `src/lib/sequence/rules.ts:168-189`
- Definicja poziomów: `src/lib/sequence/levels.ts:80-95`
- Oracle w testach: `src/lib/sequence/generate.test.ts:474-498`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: `mixed` z co najmniej dwiema widocznymi liczbami

#### Automated

- [x] 1.1 Nowe testy `mixed` przechodzą, w tym wiersz z jedną liczbą ma problem: `node --experimental-strip-types --test src/lib/sequence/generate.test.ts` — 7c0b6ed
- [x] 1.2 Typy przechodzą: `npx astro check` — 7c0b6ed
- [x] 1.3 Lint przechodzi: `npm run lint` — 7c0b6ed

#### Manual

- [x] 1.4 Ręczne wygenerowanie kilku kart lat7 pokazuje w wierszach `mixed` co najmniej dwie liczby — 7c0b6ed

### Phase 2: Poszerzone sprawdzenie dwuznaczności

#### Automated

- [x] 2.1 Testy sekwencji przechodzą: `node --experimental-strip-types --test src/lib/sequence/generate.test.ts src/lib/sequence/levels.test.ts` — 7c0b6ed
- [x] 2.2 Typy i lint przechodzą: `npx astro check` oraz `npm run lint` — 7c0b6ed
- [x] 2.3 Pomiar 1000 kart na poziom: `null` = 0 na lat4–lat7, p99 czasu < 100 ms — 7c0b6ed

#### Manual

- [x] 2.4 Generuj na lat5 i lat6 daje karty z wierszami AAB, bez widocznych niejednoznaczności na wydruku próbnym — 7c0b6ed

### Phase 3: ABB zamiast `groups` na lat7

#### Automated

- [x] 3.1 Wszystkie testy sekwencji przechodzą: `node --experimental-strip-types --test src/lib/sequence/generate.test.ts src/lib/sequence/levels.test.ts src/lib/sequence/layout.test.ts src/lib/sequence/colors.test.ts src/lib/sequence/shapes.test.ts` — 7c0b6ed
- [x] 3.2 Cały zestaw przechodzi: `npm test` — 7c0b6ed
- [x] 3.3 Typy i lint przechodzą: `npx astro check` oraz `npm run lint` — 7c0b6ed
- [x] 3.4 Pomiar z fazy 2 powtórzony na lat7: `null` = 0 — 7c0b6ed

#### Manual

- [x] 3.5 Karta lat7 w podglądzie ma wiersze `mixed`, `down1` i ABB; ABB pokazuje całą jednostkę przed lukami; karta mieści się na A4 (`/sequences`) — 7c0b6ed

### Phase 4: PRD, oracle i przegląd poziomów

#### Automated

- [x] 4.1 `npm test`, `npm run lint`, `npx astro check` i `npm run build` przechodzą — 7c0b6ed
- [x] 4.2 Test oracle'a przechodzi dla lat4–lat7 — 7c0b6ed

#### Manual

- [x] 4.3 Wydruk próbny karty lat7 (3–4 karty): w każdym wierszu dziecko widzi jedną odpowiedź — 7c0b6ed
