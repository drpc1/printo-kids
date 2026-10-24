# Poziomy karty sekwencji (S-17) Implementation Plan

## Overview

Rodzic wybiera na `/sekwencje` poziom nazwany wiekiem (4, 5, 6, 7 lat) i dostaje kartę zgodną z tabelą „Karta sekwencji” z PRD: długość ciągu, rodzaj reguł, liczba ciągów i liczba pustych pól (US-11, FR-020). Dziś strona ma jedno stałe ustawienie „5 lat”. Poziomy 6 i 7 lat wprowadzają liczby i nowe reguły, więc walidator „jedna odpowiedź” przechodzi z samych wzorów powtarzanych na jawną listę reguł. Poziom żyje w stanie strony (jak poziom symetrii); profil go nie zapamiętuje (US-08 odłożone).

## Current State Analysis

- `src/lib/sequence/levels.ts` ma typ z literałami (`id: "lat5"`, `fieldsPerRow: 7`, `rowCount: 6`, `twoGapRows: 3`) i jedną stałą `SEQUENCE_LEVEL_LAT5`. Używa jej `SequenceGenerator.tsx` i `scripts/build-thumbnails.mjs`.
- `src/lib/sequence/generate.ts`: wiersz to wzór `AB`/`AAB`/`ABC` na czterech kształtach. `sequenceAnswers` próbuje okresów 1 do ½ długości i zwraca zbiór krotek odpowiedzi. `sequenceRowProblems(row, n)` wymusza lukę w ostatnim polu, drugą lukę w drugiej połowie i wzór widoczny przed pierwszą luką. `generateSequenceCard` losuje całą kartę do 20 razy i odrzuca ją jako całość.
- `src/lib/sequence/layout.ts` liczy pole tylko z szerokości i rzuca, gdy wiersze się nie mieszczą (Addendum S-16). Wszystkie cztery poziomy mieszczą się z zapasem: 5 pól → pole 32,8 mm, 7 → 23,2 mm, 8 → 20,2 mm; 7 wierszy po 20,2 mm to około 170 mm z 262 mm dostępnych.
- `src/components/SequenceGenerator.tsx`: pasek ma tylko Generuj i Drukuj; `SequenceSheet` rysuje tylko kształty i „?”. Wzorzec poziomu: `SymmetryGenerator.tsx` (`levelControl` nad przyciskami, `handleLevelSelect` generuje nową kartę, gdy karta jest na ekranie i profil nie czeka na wybór dziecka) i `SymmetryLevelChoice.tsx`.
- Testy: `generate.test.ts` ma wyrocznię próbującą wszystkich wypełnień luk (ryzyko 8 w `context/foundation/test-plan.md`). `layout.test.ts` i `shapes.test.ts` zostają. `src/lib/sheet/print-contract.test.ts` pilnuje klas druku wyspy.
- Miniatura katalogu jest budowana z `SEQUENCE_LEVEL_LAT5` stałym ziarnem; e2e `catalog.spec.ts` (w tym „each Generuj draws a different card”) i `phone-layout.spec.ts` mają wpisy sekwencji.

## Desired End State

Na stronie sekwencji przycisk „Poziom: 5 lat” (jak w symetrii). Wybór poziomu przy widocznej karcie od razu daje nową kartę tego poziomu. Każdy poziom zgodny z tabelą:

| Poziom | Pola w ciągu | Ciągi | Reguły                                                                            | Puste pola w ciągu | Gdzie są luki                                                                   |
| ------ | ------------ | ----- | --------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------- |
| 4 lata | 5            | 5     | wzór AB z dwoma kształtami                                                        | 1                  | zawsze ostatnie pole                                                            |
| 5 lat  | 7            | 6     | AB, AAB, ABC z kształtami (jak dziś)                                              | 1–2 (3 ciągi po 2) | ostatnie pole; druga luka w polu 5 lub 6                                        |
| 6 lat  | 8            | 7     | liczby +1, liczby +2, wzory AB/AAB/ABC z kształtami                               | 2                  | dowolne dwa pola od drugiego (wzór widoczny przed pierwszą luką)                |
| 7 lat  | 8            | 7     | kształt na przemian z liczbą rosnącą, liczby malejące o 1, rosnące grupy A·AB·ABB | 2–3 (3 ciągi po 3) | dowolne pola od trzeciego; liczba luk w ciągu ograniczona jego regułą (maxGaps) |

Każdy ciąg ma dokładnie jedną odpowiedź względem całej listy reguł, każda karta mieści się na A4 z marginesem 10 mm, a generowanie trwa poniżej 5 s. Liczba w polu to gruba cyfra na środku (decyzja użytkowniczki).

### Key Discoveries:

- Hipotezy skończonej listy reguł zastępują „undetermined” z S-16: gdy żadne widoczne pole nie wiąże luki, pasuje wiele wypełnień, więc ciąg jest niejednoznaczny. Zachowanie dla poziomu 5 lat zostaje takie samo (`generate.ts:97-135`).
- Wyrocznia w teście ma pozostać niezależna od walidatora: próbuje wszystkich wypełnień luk z 24 symboli (4 kształty i liczby 1–20) i sprawdza przynależność całego ciągu do reguły osobnym predykatem w pliku testu (`generate.test.ts:18-38` jako wzór).
- Poziom 4 lat jest jednoznaczny z konstrukcji: widoczne `A B A B`, a okres 2 jest jedynym dozwolonym (max okres = ⌊5/2⌋ = 2).
- Pole wypełnia szerokość wiersza, więc najkrótszy ciąg daje największe pole (32,8 mm). Kształt skaluje się z polem (`shapeScale`), „?” ma stały rozmiar.

## What We're NOT Doing

- Profil dziecka i ostatnie parametry dla poziomu sekwencji (US-08/FR-017 odłożone).
- Reguły poza listą z PRD (np. liczby malejące o 2, rosnące o 3, liczby powyżej 20).
- Zmiany wspólnych plików poza potrzebą: `GenerateButton.tsx`, `SymmetryLevelChoice.tsx`, `src/lib/cards.ts` (ma je ruszać #81 i S-19). Przycisk poziomu to osobny plik `SequenceLevelChoice.tsx`; ujednolicenie trzech kopii to osobna zmiana.
- Kolory, odpowiedzi na kartce, zmiana wyglądu kształtów.
- Zmiana wyglądu miniatury (zmieni się tylko wylosowana karta).

## Implementation Approach

Faza 1 przenosi całą logikę do `src/lib/sequence` i dowodzi jej testami, zanim dotknie UI. Wiersz zapamiętuje swoją regułę (`rule`) i elementy, które mogą być kształtem albo liczbą. Walidator buduje przestrzeń hipotez dla długości _n_ ze wszystkich reguł i liczy różne krotki odpowiedzi zgodne z widocznymi polami. Generator losuje wiersze pojedynczo z ponawianiem (nie całą kartę), bo przy 8 polach i 2–3 lukach część losowań jest niejednoznaczna. Karta jest losowana wierszami w granicach poziomu (minimalna liczba ciągów każdej reguły, liczba ciągów z trzema lukami) i dalej sprawdzana jako całość. Faza 2 dodaje liczbę w polu i pasek poziomu. Faza 3 domyka miniaturę, e2e, dokumenty i ręczny druk.

## Phase 1: Poziomy, reguły i generator

### Overview

Cztery poziomy z tabeli PRD, jawna lista reguł, walidator „jedna odpowiedź” na całej liście, generator wierszami. Poziom 5 lat zachowuje parametry karty (7 pól, 6 ciągów, wzory AB/AAB/ABC, luki jak dziś), ale walidator sprawdza teraz całą listę reguł, więc część wierszy z dwiema lukami, którą pasują też rosnące grupy (np. `X X Y X _ Y _`), jest odrzucana i losowana ponownie. Zmienia się też karta wylosowana z danego ziarna.

### Changes Required:

#### 1. Poziomy

**File**: `src/lib/sequence/levels.ts`

**Intent**: Uogólnić typ do czterech poziomów i opisać każdy danymi z tabeli PRD, tak by generator i testy czytały je z jednego miejsca.

**Contract**: `SequenceLevelId = "lat4" | "lat5" | "lat6" | "lat7"`; `SequenceLevel { id; label; fieldsPerRow; rowCount; rules: readonly { rule: SequenceRuleId; minRows: number }[]` (reguły dozwolone na poziomie z minimalną liczbą ciągów, resztę do `rowCount` losuje się z nich); `gapCounts: readonly number[]` (dozwolone liczby luk w ciągu); `multiGapRows: number` (ile ciągów ma największą dozwoloną liczbę luk, 0 gdy wszystkie mają jedną); `gapPlacement: "end" | "free"`. Eksporty: `SEQUENCE_LEVELS`, `sequenceLevelById(id)`, `DEFAULT_SEQUENCE_LEVEL_ID = "lat5"`, `SEQUENCE_LEVEL_LAT5` (alias, żeby skrypt miniatur nie wymagał zmian). `"end"`: ostatnie pole jest luką, a druga luka leży w drugiej połowie ciągu (poziomy 4 i 5). `"free"`: luki w dowolnym miejscu po polach pokazujących regułę (poziomy 6 i 7).

#### 2. Reguły

**File**: `src/lib/sequence/rules.ts` (nowy)

**Intent**: Jedno miejsce z jawną listą reguł: jak z reguły powstaje ciąg (do losowania) i jak z całej listy powstaje przestrzeń hipotez dla długości _n_ (do walidacji). Obie strony używają tej samej definicji reguły, ale test sprawdza ją osobną wyrocznią.

**Contract**: `SequenceItem = SequenceShape | number`. `SequenceRuleId = "AB" | "AAB" | "ABC" | "up1" | "up2" | "down1" | "groups" | "mixed"`. Reguły: wzory kształtów (okres 1 do ⌊n/2⌋ po czterech kształtach, jak w S-16), liczby `s, s+1, …` / `s, s+2, …` / `s, s−1, …` w zakresie 1–20, grupy A·AB·ABB (bloki `A`, `AB`, `ABB`, … sklejone i ucięte do _n_, A≠B), mieszane (stały kształt na przemian z liczbą rosnącą o 1; kształt na polach parzystych albo nieparzystych). `rowFromRule(rule, n, random)` zwraca pełny ciąg; `hypotheses(n)` zwraca wszystkie ciągi długości _n_ ze wszystkich reguł; `shownBefore(rule)` to najmniejszy indeks pierwszej luki (AB 2, AAB 3, ABC 3, liczby 2, grupy 3, mieszane 2). Każda reguła ma `maxGaps` (ile luk daje jeszcze jedną odpowiedź w praktyce), ustalane w kroku pomiaru poniżej.

#### 3. Generator i walidator

**File**: `src/lib/sequence/generate.ts`

**Intent**: Wiersz niesie `rule` zamiast `pattern`; `sequenceAnswers` liczy krotki odpowiedzi z przestrzeni hipotez; walidator zna oba rodzaje rozmieszczenia luk; generator losuje wiersze z ponawianiem i składa kartę zgodną z poziomem.

**Contract**: `SequenceRow { rule; values: readonly SequenceItem[]; gaps: readonly number[] }`; `SequenceCard { levelId; fieldsPerRow; rows; key }`. `sequenceAnswers(visible, n)` zwraca `{ answers }` (różne krotki zgodnych hipotez; koniec z `undetermined`). `sequenceRowProblems(row, level)` zwraca: `wrong-length`, `unknown-item`, `rule-mismatch`, `gap-count`, `last-not-gap`, `second-gap-outside-second-half`, `gap-before-rule-shown`, `no-answer`, `ambiguous`, `answer-mismatch`. `sequenceCardProblems(card, level)` dokłada `row-count`, `missing-rule`, `gap-row-count`, `duplicate-row`. `generateSequenceCard(random, previousKey, level)` zachowuje sygnaturę. Wiersz jest ponawiany do 50 razy, karta do 20 razy (inny `key` niż poprzednia).

**Krok pomiaru (pierwszy w fazie):** dla każdej reguły i liczby luk 2 i 3 policzyć, ile ze wszystkich rozmieszczeń luk daje jedną odpowiedź. Wartości `maxGaps` i ewentualne zawężenie ciągów z trzema lukami na poziomie 7 lat wynikają z tego pomiaru i trafiają do `rules.ts` oraz opisu fazy w Progress. Jeśli reguła z trzema lukami nie ma żadnego poprawnego rozmieszczenia, trzy luki dostają tylko reguły, które je mają (liczba ciągów z trzema lukami zostaje 3, jeśli to możliwe).

#### 4. Testy logiki

**Files**: `src/lib/sequence/generate.test.ts`, `src/lib/sequence/levels.test.ts` (nowy), `package.json` (skrypt `test` dostaje `levels.test.ts`)

**Intent**: Dla każdego z czterech poziomów dowieść: kształt karty zgodny z tabelą PRD, jedna odpowiedź z niezależnej wyroczni, brak powtórzonych ciągów, inna karta niż poprzednia, czas poniżej 5 s. Tabela poziomów jest sprawdzona ręcznie napisaną wyrocznią jak w `symmetry/levels.test.ts`.

**Contract**: Wyrocznia w teście nie importuje `rules.ts`: ma własny predykat „ciąg należy do reguły X” zapisany od nowa z definicji PRD (okresowość, różnice liczb, bloki A·AB·ABB, przemienność) i próbuje wszystkich wypełnień luk z 24 symboli. Poprawny ciąg to taki, dla którego dokładnie jedno wypełnienie należy do którejkolwiek reguły. Liczba ziaren: 300 na poziom, a dla poziomu z trzema lukami tyle, by test trwał do około 20 s (24³ = 13 824 wypełnień na ciąg; zacząć od 60). Test 5 lat dodatkowo sprawdza, że żaden wiersz nie jest dwuznaczny względem grup. Testy walidatora: ciąg dwuznaczny, ciąg bez odpowiedzi, luka przed pokazaniem reguły, luka w złym miejscu; osobne przypadki dla liczb (`2, _, 6, 8, _`), grup i mieszanych. Break-check po implementacji: osłabić walidator (np. akceptować `ambiguous`), zobaczyć czerwony test, cofnąć.

### Success Criteria:

#### Automated Verification:

- Testy logiki sekwencji przechodzą dla czterech poziomów: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Break-check: po osłabieniu walidatora (`ambiguous` przestaje odrzucać) test wyroczni jest czerwony

#### Manual Verification:

- Pomiar reguła × liczba luk jest zapisany w opisie fazy (ile rozmieszczeń daje jedną odpowiedź) i uzasadnia `maxGaps`
- Generowanie karty 7 lat trwa poniżej 5 s (typowo poniżej 100 ms) przy 100 kolejnych Generuj w skrypcie

**Implementation Note**: Po fazie 1 i zielonych testach zatrzymaj się na potwierdzenie przed fazą 2.

---

## Phase 2: Strona: liczba w polu i pasek poziomu

### Overview

Wyspa rysuje liczby, pokazuje przycisk poziomu i generuje kartę wybranego poziomu. Każdy poziom mieści się na A4 z marginesem 10 mm.

### Changes Required:

#### 1. Stałe rysowania liczby

**File**: `src/lib/sequence/sheet.ts`

**Intent**: Dodać stałe liczby obok stałych kształtów, żeby miniatura i strona czytały te same wartości.

**Contract**: `numberFontScale` (rozmiar czcionki jako ułamek boku pola, start 0,5 do dostrojenia na wydruku), `numberFontWeight: 700`, tekst na środku pola. Liczba to czarny wypełniony tekst bezszeryfowy, bez ramki.

#### 2. Pasek poziomu

**Files**: `src/components/SequenceLevelChoice.tsx` (nowy), `src/components/SequenceGenerator.tsx`

**Intent**: Przycisk „Poziom: 5 lat” z oknem z czterema wierszami (jak `SymmetryLevelChoice`), stan `levelId` na stronie (domyślnie `lat5`), `generateFor(id)` jak w symetrii: zmiana poziomu przy widocznej karcie i profilu nie czekającym na wybór dziecka generuje nową kartę; przy ekranie startowym tylko zmienia poziom. `SequenceSheet` rysuje element jako kształt albo liczbę i dalej pustą ramkę z „?” dla luk. Wszystkie klasy przez `cn()`, bez `'use client'`, kolory tylko tokenami.

**Contract**: Przycisk poziomu stoi nad przyciskami Generuj/Drukuj na pasku z kartą i nad dużym Generuj na ekranie startowym (układ jak `SymmetryGenerator.tsx:117-151`), a klasy `print:hidden` zostają na kontenerze pasków. Etykieta przycisku: `Poziom: <label>`, z `aria-label` jak w symetrii.

#### 3. Układ i kontrakt druku

**Files**: `src/lib/sequence/layout.test.ts`, `src/lib/sheet/print-contract.test.ts` (tylko jeśli dotyka zmienionych klas)

**Intent**: Test układu dla każdego z czterech poziomów: pola nie przekraczają marginesu 10 mm, wiersze mieszczą się pod poleceniem, nic nie rzuca. Liczba dwucyfrowa mieści się w polu (szerokość tekstu < bok pola przy `numberFontScale`).

**Contract**: Bez zmian w `layout.ts` (Addendum S-16: układ rzuca zamiast ograniczać wysokością).

### Success Criteria:

#### Automated Verification:

- Testy układu dla czterech poziomów i kontrakt druku przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`

#### Manual Verification:

- Na `npm run dev` pod `/sekwencje` przycisk „Poziom: 5 lat” otwiera listę czterech poziomów, a wybór poziomu przy widocznej karcie daje od razu nową kartę tego poziomu
- Liczby są czytelnymi grubymi cyframi na środku pola, dwucyfrowe też, i nie wchodzą na ramkę ani na „?”
- Podgląd druku w Chrome na komputerze: jedna strona A4 bez paska, z marginesem co najmniej 10 mm, dla każdego z czterech poziomów
- Profil w rogu i pasek poziomu nie zasłaniają kart ani przycisków na telefonie

**Implementation Note**: Po fazie 2 zatrzymaj się na potwierdzenie przed fazą 3.

---

## Phase 3: Miniatura, e2e, dokumenty i druk

### Overview

Domknięcie plasterka: katalog i testy przeglądarkowe, zapis decyzji w PRD i planie testów, ręczny druk potwierdzający wartości startowe (Open Questions 9).

### Changes Required:

#### 1. Miniatura

**Files**: `scripts/build-thumbnails.mjs` (bez zmian, jeśli alias `SEQUENCE_LEVEL_LAT5` działa), `public/thumbnails/*sekwencje*.svg`

**Intent**: Losowanie wierszami zmienia kolejność użycia ziarna, więc ta sama liczba ziarna może dać inną kartę. Przegenerować miniaturę, obejrzeć ją i upewnić się, że drugie uruchomienie nie zmienia plików. Miniatura zostaje kartą 5 lat, więc nie rysuje liczb.

**Contract**: `npm run thumbnails` dwukrotnie; `git diff --exit-code public/thumbnails` po drugim bez zmian.

#### 2. E2E

**Files**: `tests/e2e/catalog.spec.ts`, `tests/e2e/phone-layout.spec.ts`

**Intent**: Nowy test w `catalog.spec.ts`: wybór „4 lata” w oknie poziomu daje kartę z 5 wierszami po 5 pól (25 ramek pól), wybór „7 lat” — z 7 wierszami po 8 (56), a kolejne Generuj dalej daje inną kartę. W `phone-layout.spec.ts`: przycisk poziomu, Generuj, Drukuj i Profil nie nachodzą na siebie na telefonie.

**Contract**: Selektory przez role i nazwy dostępne (`getByRole("button", { name: /Poziom/ })`); uruchamiane z własnym portem: `E2E_PORT=4398 npx playwright test tests/e2e/catalog.spec.ts tests/e2e/phone-layout.spec.ts`.

#### 3. Dokumenty

**Files**: `context/foundation/prd.md`, `context/foundation/test-plan.md`

**Intent**: PRD, Business Logic „Karta sekwencji”: dopisać decyzje z tego planu (rosnące grupy to bloki A, AB, ABB sklejone i ucięte do długości ciągu; liczby w zakresie 1–20; gruba cyfra na środku pola; mieszane = stały kształt na przemian z liczbą rosnącą o 1; luki na poziomach 6–7 w dowolnym miejscu po polach pokazujących regułę; liczba luk 7 lat zgodna z pomiarem). Test-plan, ryzyko 8: wyrocznia sprawdza teraz pełną listę reguł i symbole z liczbami; zaktualizować opis wyroczni i „czego nie sprawdza”.

**Contract**: Po edycji `npx prettier --write` na obu plikach (jak S-16). Roadmapa: status wg skilla `/10x-implement` i `/10x-archive`.

### Success Criteria:

#### Automated Verification:

- Testy produktu przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- Miniatury są powtarzalne: po pierwszym `npm run thumbnails` pliki w `public/thumbnails` są w stage (`git add`), a po drugim `git diff --exit-code public/thumbnails` nie pokazuje zmian
- Smoke przechodzi na podglądzie: `npm run smoke`
- E2E katalogu i telefonu przechodzą: `E2E_PORT=4398 npx playwright test tests/e2e/catalog.spec.ts tests/e2e/phone-layout.spec.ts`

#### Manual Verification:

- Miniatura „Sekwencje” w katalogu wygląda jak karta, czytelnie na telefonie (2 kolumny) i na komputerze
- Wydruk czterech poziomów (po jednym arkuszu): jedna strona A4 z marginesem co najmniej 10 mm w Chrome na komputerze; liczby i „?” czytelne; pole wystarcza dziecku na wpisanie liczby albo narysowanie kształtu
- Druk z telefonu jednego poziomu (Safari na iOS albo Chrome na Androidzie): jedna strona A4, a Generuj, Poziom i Drukuj nie nachodzą na siebie
- Wartości startowe poziomów (długość ciągu, liczba luk, zakres liczb) ocenione na wydruku; uwagi zapisane w Open Questions 9 PRD
- Labirynt, symetria i sudoku działają jak przed zmianą

---

## Testing Strategy

### Unit Tests:

- Tabela poziomów z PRD (ręcznie napisana wyrocznia) i domyślny poziom 5 lat
- Karta każdego poziomu: liczba ciągów, pól, luk, reguły z minimalną liczbą, brak powtórzonych ciągów, luki zgodne z rozmieszczeniem poziomu
- Jedna odpowiedź ciągu z niezależnej wyroczni (24 symbole, predykat przynależności do reguł, bez importu `rules.ts`)
- Walidator: ciąg dwuznaczny, bez odpowiedzi, z lukiem przed pokazaniem reguły, liczby, grupy, mieszane
- Układ każdego poziomu w granicach marginesu; czas generowania; inny `key` niż poprzednia karta

### Integration Tests:

- E2E: wybór poziomu zmienia liczbę pól na karcie, kolejne Generuj daje inną kartę, pasek na telefonie nie nakłada się

### Manual Testing Steps:

1. Otworzyć `/sekwencje`, wybrać każdy poziom i przeczytać kartę: czy da się ją rozwiązać jedną odpowiedzią w każdej luce.
2. Wydrukować po jednej karcie z każdego poziomu i sprawdzić margines oraz czytelność liczb.
3. Powtórzyć na telefonie.

## Performance Considerations

Przestrzeń hipotez dla _n_ = 8 to kilkaset ciągów (wzory: 4+16+64+256, liczby: około 60, grupy i mieszane: około 200), a sprawdzenie jednego ciągu to porównanie z każdą z nich. Wiersz jest ponawiany do 50 razy, więc pełna karta kosztuje rzędu milisekund. Budżet 5 s dotyczy całego Generuj.

## Migration Notes

Brak danych do migracji: poziom żyje w stanie strony. Zmieniają się nazwy w typach (`pattern` → `rule`, `levelId`), więc skrypt miniatur i testy trzeba przejrzeć w tej samej fazie.

## References

- PRD: `context/foundation/prd.md` (US-10, US-11, FR-019, FR-020, Business Logic „Karta sekwencji”, Open Questions 9)
- Roadmapa: `context/foundation/roadmap.md` (S-17)
- Poprzedni plasterek: `context/archive/2026-10-23-sequences-first-printable/plan.md` (Addendum)
- Wzorzec poziomów: `src/components/SymmetryGenerator.tsx`, `src/components/SymmetryLevelChoice.tsx`, `src/lib/symmetry/levels.ts`, `src/lib/symmetry/levels.test.ts`
- Ryzyko 8: `context/foundation/test-plan.md`
- Issue: drpc1/printo-kids#78

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Poziomy, reguły i generator

#### Automated

- [ ] 1.1 Testy logiki sekwencji przechodzą dla czterech poziomów: `npm test`
- [ ] 1.2 Lint przechodzi: `npm run lint`
- [ ] 1.3 Typy przechodzą: `npx astro check`
- [ ] 1.4 Break-check: po osłabieniu walidatora (`ambiguous` przestaje odrzucać) test wyroczni jest czerwony

#### Manual

- [ ] 1.5 Pomiar reguła × liczba luk jest zapisany w opisie fazy i uzasadnia `maxGaps`
- [ ] 1.6 Generowanie karty 7 lat trwa poniżej 5 s (typowo poniżej 100 ms) przy 100 kolejnych Generuj w skrypcie

### Phase 2: Strona: liczba w polu i pasek poziomu

#### Automated

- [ ] 2.1 Testy układu dla czterech poziomów i kontrakt druku przechodzą: `npm test`
- [ ] 2.2 Lint przechodzi: `npm run lint`
- [ ] 2.3 Typy przechodzą: `npx astro check`
- [ ] 2.4 Build przechodzi: `npm run build`

#### Manual

- [ ] 2.5 Na `npm run dev` pod `/sekwencje` przycisk „Poziom: 5 lat” otwiera listę czterech poziomów, a wybór poziomu przy widocznej karcie daje od razu nową kartę tego poziomu
- [ ] 2.6 Liczby są czytelnymi grubymi cyframi na środku pola, dwucyfrowe też, i nie wchodzą na ramkę ani na „?”
- [ ] 2.7 Podgląd druku w Chrome na komputerze: jedna strona A4 bez paska, z marginesem co najmniej 10 mm, dla każdego z czterech poziomów
- [ ] 2.8 Profil w rogu i pasek poziomu nie zasłaniają kart ani przycisków na telefonie

### Phase 3: Miniatura, e2e, dokumenty i druk

#### Automated

- [ ] 3.1 Testy produktu przechodzą: `npm test`
- [ ] 3.2 Lint przechodzi: `npm run lint`
- [ ] 3.3 Typy przechodzą: `npx astro check`
- [ ] 3.4 Build przechodzi: `npm run build`
- [ ] 3.5 Miniatury są powtarzalne: po pierwszym `npm run thumbnails` pliki w `public/thumbnails` są w stage (`git add`), a po drugim `git diff --exit-code public/thumbnails` nie pokazuje zmian
- [ ] 3.6 Smoke przechodzi na podglądzie: `npm run smoke`
- [ ] 3.7 E2E katalogu i telefonu przechodzą: `E2E_PORT=4398 npx playwright test tests/e2e/catalog.spec.ts tests/e2e/phone-layout.spec.ts`

#### Manual

- [ ] 3.8 Miniatura „Sekwencje” w katalogu wygląda jak karta, czytelnie na telefonie (2 kolumny) i na komputerze
- [ ] 3.9 Wydruk czterech poziomów: jedna strona A4 z marginesem co najmniej 10 mm w Chrome na komputerze; liczby i „?” czytelne; pole wystarcza dziecku
- [ ] 3.10 Druk z telefonu jednego poziomu (Safari na iOS albo Chrome na Androidzie): jedna strona A4, a Generuj, Poziom i Drukuj nie nachodzą na siebie
- [ ] 3.11 Wartości startowe poziomów ocenione na wydruku; uwagi zapisane w Open Questions 9 PRD
- [ ] 3.12 Labirynt, symetria i sudoku działają jak przed zmianą
