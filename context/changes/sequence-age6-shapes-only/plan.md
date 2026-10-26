# Sekwencje, Poziom 3: same kształty — Implementation Plan

## Overview

Poziom 3 karty sekwencji (id `lat6`, etykieta nadal „6 lat”) ma składać się wyłącznie z obrazków. Issue #111: liczby +1 i +2 schodzą z tej karty, liczby zostają na Poziomie 4 tak jak dziś, każdy wiersz ma jedną odpowiedź, a karta mieści się na jednej stronie A4.

## Current State Analysis

`SEQUENCE_LEVELS` w `src/lib/sequence/levels.ts` jest jedyną tabelą, z której generator losuje reguły. Poziom 3 ma 8 pól, 7 wierszy, 2 luki i położenie `free`. Pula to `up1`, `up2`, `AB`, `AAB` i `ABC`, każda z `minRows: 1`, więc pięć wierszy jest gwarantowanych, a dwa są dowolne z tej piątki. `up1` i `up2` nie występują na żadnym innym poziomie.

Poziom 4 (`lat7`) ma te same 8×7, luki 2 oraz trzy wiersze z trzecią luką. Pula to `mixed`, `down1` i `groups`, każda z `minRows: 2`, plus jeden wiersz dowolny. Suma minimów to 6, więc dokładanie `up1` i `up2` przy `minRows` co najmniej 1 nie mieści się w siedmiu wierszach.

Jedna odpowiedź jest liczona względem całej listy reguł, nie tylko puli poziomu. Karta odrzuca wiersz, gdy inna reguła z listy daje inne wypełnienie luk. Geometria strony nie zależy od identyfikatorów reguł: oba poziomy dzielą jeden arkusz 8×7.

## Desired End State

Karta Poziomu 3 pokazuje tylko kształty w wzorach AB, AAB i ABC. Każdy z tych wzorów jest w co najmniej dwóch wierszach, a siódmy wiersz jest jednym z nich, więc na karcie jest układ 3, 2 i 2, a to, który wzór ma trzy wiersze, zależy od losowania. Nadal jest 8 pól, 7 wierszy, dokładnie 2 luki w wierszu i luki po polach, które pokazują regułę. Żaden wiersz nie zawiera cyfry.

Poziom 4 losuje to, co dziś: po dwa wiersze `mixed`, `down1` i `groups` oraz jeden dowolny. Generatory +1 i +2 zostają w kodzie, bo sprawdzanie jednej odpowiedzi nadal zna te reguły, ale żadna karta ich nie losuje. PRD opisuje tę samą mieszankę.

### Key Discoveries:

- `src/lib/sequence/levels.ts:56-65` — pula Poziomu 3. To jedyne miejsce, które trzeba zmienić w generatorze.
- `src/lib/sequence/levels.ts:67-80` — Poziom 4 jest już pełny (suma `minRows` 6 przy `rowCount` 7).
- `src/lib/sequence/rules.ts:10-19` i `src/lib/sequence/generate.ts:199-207` — lista reguł do dwuznaczności jest globalna. Wyjęcie `up1` i `up2` z puli poziomu nie wyłącza tego sprawdzenia.
- `src/lib/sequence/levels.test.ts:26-30` i `src/lib/sequence/generate.test.ts:141-155` — dokładne listy reguł. Test poziomów nie sprawdza `minRows` poza sumą `<= rowCount` (`levels.test.ts:33-37`).
- `src/lib/sequence/generate.test.ts:196-208` — liczby 1 i 20 są zbierane łącznie z Poziomu 3 i 4. Po tej zmianie zakres ma dowodzić sam Poziom 4.
- `context/foundation/prd.md:571` i `:582` — tabela i zdanie o pięciu regułach nadal wymagają +1 i +2 na Poziomie 3. Zdanie o całej liście reguł (`prd.md:565`) zostaje, bo opisuje sprawdzanie odpowiedzi, nie losowanie.
- `context/foundation/roadmap.md` nie ma Change ID `sequence-age6-shapes-only`. Etykiety „6 lat” / „7 lat” zmienia slice S-27, nie ta zmiana.

## What We're NOT Doing

- Przenoszenie `up1` i `up2` na Poziom 4 albo obniżanie jego `minRows`.
- Usuwanie reguł +1 i +2 z `rules.ts` albo z globalnej listy używanej do jednej odpowiedzi.
- Rosnące grupy (`groups`) na Poziomie 3.
- Zmiana długości ciągu, liczby wierszy, liczby luk i położenia luk na Poziomie 3 i 4.
- Zmiana Poziomów 1 i 2.
- Zmiana etykiet „6 lat” i „7 lat” na „Poziom 3” i „Poziom 4”.

## Implementation Approach

Jedna edycja tablicy poziomu: trzy reguły kształtów, każda z `minRows: 2`. Generator, układ strony i rysowanie pól zostają. Testy, które dziś pinują starą piątkę, pinują nową trójkę i minima. PRD dostaje ten sam opis, żeby następna zmiana nie przywróciła +1 i +2 z tabeli.

## Critical Implementation Details

Suma `minRows` na Poziomie 3 ma być 6 przy siedmiu wierszach. Generator zwraca `null` dopiero wtedy, gdy suma `minRows` jest większa niż 7: karta ma za dużo wierszy, sprawdzenie dodaje `row-count` i kolejne losowania się nie udają. Układ 3+2+2 oraz czwarta reguła z minimum 1 nadal mieszczą się w siedmiu wierszach i tylko zabierają wiersz dowolny. Sprawdzenie liczb 1–20 nie może dalej wymagać cyfr z Poziomu 3. Jeśli po zawężeniu do Poziomu 4 asercja 1 i 20 padnie, poprawia się próbkę Poziomu 4, a nie pulę Poziomu 3.

## Phase 1: Pula reguł Poziomu 3

### Overview

Poziom 3 losuje tylko AB, AAB i ABC, po co najmniej dwa wiersze. Testy, które wymagają `up1` i `up2` na tej karcie, opisują nową pulę. Poziom 4 i generatory liczb zostają.

### Changes Required:

#### 1. Tablica poziomów

**File**: `src/lib/sequence/levels.ts`

**Intent**: Zdjąć liczby +1 i +2 z karty Poziomu 3 i zagwarantować, że każdy z trzech wzorów kształtów pojawi się co najmniej dwa razy na siedmiu wierszach.

**Contract**: `lat6.rules` to wyłącznie `AB`, `AAB`, `ABC`, w tej kolejności, każda z `minRows: 2`. `fieldsPerRow` 8, `rowCount` 7, `gaps` 2, `extraGapRows` 0 i `gapPlacement: "free"` bez zmian. Wpis `lat7` bez zmian. `SequenceRuleId` oraz funkcje `up1` i `up2` bez zmian.

#### 2. Testy puli i jednej odpowiedzi

**File**: `src/lib/sequence/levels.test.ts`, `src/lib/sequence/generate.test.ts`

**Intent**: Przypiąć nową pulę i minima, żeby `minRows: 0` albo powrót `up1` nie przeszły testu, który patrzy tylko na sumę albo na unię ziaren.

**Contract**: Asercja reguł Poziomu 3 wymaga `AB`, `AAB`, `ABC` oraz `minRows` 2 przy każdej. Minima pozostałych poziomów zostają jak dziś: Poziom 1 ma `AB` z 5, Poziom 2 po 1, Poziom 4 po 2. Unia reguł wylosowanych dla `LAT6` w istniejących 300 ziarnach to `AAB`, `AB`, `ABC`. Unia `LAT7` zostaje `down1`, `groups`, `mixed`. Zbiór liczb 1–20 w teście „every shape and number appears” jest liczony tylko z `LAT7`. Test jednej odpowiedzi na wiersz zostaje dla wszystkich poziomów i nadal próbuje wypełnień spoza puli poziomu, w tym +1 i +2.

### Success Criteria:

#### Automated Verification:

- `node --experimental-strip-types --test src/lib/sequence/levels.test.ts` przechodzi, a Poziom 3 ma tylko AB, AAB i ABC z `minRows` 2
- `node --experimental-strip-types --test src/lib/sequence/generate.test.ts` przechodzi: karty Poziomu 3 losują tylko te trzy reguły, liczby 1–20 pochodzą z Poziomu 4, a każdy wiersz każdego poziomu ma jedną odpowiedź
- `npm test` przechodzi
- `npm run lint` przechodzi

#### Manual Verification:

- Na `/sekwencje` kilka kart poziomu „6 lat” nie ma cyfr, pokazuje wzory AB, AAB i ABC i mieści się na jednej stronie A4

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie, zanim zacznie się faza 2. W blokach faz są zwykłe wypunktowania. Odpowiadające im pola `- [ ]` są tylko w `## Progress`.

---

## Phase 2: Kontrakt w PRD

### Overview

Tabela sekwencji i doprecyzowanie z 2026-10-24 opisują Poziom 3 tak, jak losuje go faza 1. Zdanie o całej liście reguł i opis Poziomu 4 zostają.

### Changes Required:

#### 1. Tabela i doprecyzowanie Poziomu 3

**File**: `context/foundation/prd.md`

**Intent**: Zdjąć z kontraktu wymaganie liczb +1 i +2 na Poziomie 3, żeby kolejna zmiana nie przywróciła ich z tabeli.

**Contract**: Wiersz Poziomu 3 w tabeli „Karta sekwencji” w kolumnie reguł mówi o wzorach AB, AAB i ABC, bez liczb. Punkt doprecyzowania, który dziś wymaga po jednym ciągu z pięciu reguł i dwóch dowolnych, wymaga po dwa ciągi AB, AAB i ABC oraz jeden dowolny z tych trzech. Zdanie o Poziomie 4 w tym samym punkcie bez zmian. Akapit, który wymienia jawną listę reguł (w tym liczby +1 i +2, malejące, grupy i mieszane), bez zmian. Pytanie otwarte 9 dopisuje, że wydruk z 2026-10-24 nie obowiązuje już dla mieszanki +1 i +2 na Poziomie 3; reszta tego pytania zostaje.

### Success Criteria:

#### Automated Verification:

- W `context/foundation/prd.md` wiersz Poziomu 3 i punkt doprecyzowania wymagają dwóch ciągów AB, AAB i ABC oraz jednego dowolnego i nie wymagają +1 ani +2 na tym poziomie

#### Manual Verification:

- Zdanie o całej liście reguł nadal wymienia liczby +1 i +2, zdanie o Poziomie 4 w tym samym punkcie jest bez zmian, a pytanie otwarte 9 odnotowuje cofnięcie mieszanki +1/+2 tylko dla Poziomu 3

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie. W blokach faz są zwykłe wypunktowania. Odpowiadające im pola `- [ ]` są tylko w `## Progress`.

---

## Testing Strategy

### Unit Tests:

- Lista reguł i `minRows` Poziomu 3 oraz nietknięte minima pozostałych poziomów.
- Unia reguł z 300 ziaren dla Poziomu 3 i 4.
- Jedna odpowiedź na wiersz, liczona także regułami, których karta już nie losuje.
- Zakres liczb 1–20 tylko z Poziomu 4.

### Integration Tests:

- Brak nowego testu HTTP. `npm test` zostaje bramką produktu i już uruchamia oba pliki sekwencji.

### Manual Testing Steps:

1. Otworzyć `/sekwencje` i wybrać poziom „6 lat”.
2. Wylosować kilka kart i sprawdzić, że wiersze są samymi kształtami oraz że widać AB, AAB i ABC.
3. Sprawdzić podgląd wydruku: jedna strona A4, bez uciętego wiersza.
4. Wylosować poziom „7 lat” i sprawdzić, że nadal są liczby malejące oraz kształt na przemian z liczbą.

## Performance Considerations

Koszt losowania się nie zmienia. Pętla odrzuceń karty i sprawdzenie jednej odpowiedzi zostają przy tej samej liście reguł.

## Migration Notes

Nie ma zapisanych kart ani migracji. Profil nie wybiera reguł sekwencji. Identyfikator `lat6` zostaje, więc zapisane ustawienie poziomu nadal wskazuje tę samą kartę.

## References

- GitHub issue #111
- `src/lib/sequence/levels.ts`
- `src/lib/sequence/generate.test.ts`
- `context/foundation/prd.md` (sekcja „Karta sekwencji” i pytanie otwarte 9)
- Podobna tabela poziomów: `context/archive/2026-10-24-sequence-difficulty-levels/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Pula reguł Poziomu 3

#### Automated

- [x] 1.1 `node --experimental-strip-types --test src/lib/sequence/levels.test.ts` przechodzi, a Poziom 3 ma tylko AB, AAB i ABC z `minRows` 2 — e0c5d4f
- [x] 1.2 `node --experimental-strip-types --test src/lib/sequence/generate.test.ts` przechodzi: karty Poziomu 3 losują tylko te trzy reguły, liczby 1–20 pochodzą z Poziomu 4, a każdy wiersz każdego poziomu ma jedną odpowiedź — e0c5d4f
- [x] 1.3 `npm test` przechodzi — e0c5d4f
- [x] 1.4 `npm run lint` przechodzi — e0c5d4f

#### Manual

- [x] 1.5 Na `/sekwencje` kilka kart poziomu „6 lat” nie ma cyfr, pokazuje wzory AB, AAB i ABC i mieści się na jednej stronie A4 — e0c5d4f

### Phase 2: Kontrakt w PRD

#### Automated

- [x] 2.1 W `context/foundation/prd.md` wiersz Poziomu 3 i punkt doprecyzowania wymagają dwóch ciągów AB, AAB i ABC oraz jednego dowolnego i nie wymagają +1 ani +2 na tym poziomie — 56ede97

#### Manual

- [x] 2.2 Zdanie o całej liście reguł nadal wymienia liczby +1 i +2, zdanie o Poziomie 4 w tym samym punkcie jest bez zmian, a pytanie otwarte 9 odnotowuje cofnięcie mieszanki +1/+2 tylko dla Poziomu 3 — 56ede97
