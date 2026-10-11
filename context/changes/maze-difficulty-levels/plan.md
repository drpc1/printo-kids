# Poziomy trudności labiryntu — plan implementacji

## Overview

Rodzic wybiera na istniejącej kartce jeden z sześciu poziomów nazwanych wiekiem i dostaje labirynt A4 o alejce oraz długości drogi tego poziomu. Generator buduje labirynt pod regułę poziomu. Nie powtarza dzisiejszego rzeźbienia, aż trafi.

## Current State Analysis

`generateMaze` przyjmuje tylko `random` i zwraca siatkę 13×16 z wejściem `(0, 6)` i wyjściem `(15, 6)` (`src/lib/maze/generate.ts:14-44`). `countPaths` liczy drogi między tymi stałymi komórkami i nie czyta startu z wymiarów labiryntu (`src/lib/maze/generate.ts:47-80`). W 4000 losowaniach tym rzeźbieniem odnoga o najwyżej 6 komórkach pada w około 0,3% na siatce 9×11, a droga od 70 komórek na 13×16 jest na skraju próbki. Powtórka przez 5 sekund nie jest sposobem na te progi.

`layoutSheet` liczy szerokość komórki jako `(pageWidth - inset * 2) / columns` (`src/lib/sheet/layout.ts:40`). `MazeSheet` i tak podaje kolumnę etykiety `6` (`src/components/WorksheetGenerator.tsx:27`, `src/components/WorksheetGenerator.tsx:780`). Przy stronie 210×297 i insecie 10 cztery szerokości z PRD dają alejkę około 21,1 mm, 14,6 mm, 11,2 mm i 7,0 mm.

Zapis `printo-kids:last-used` to JSON `{ character }`, a profil to `id`, `name`, `character`. Oba zapisy nadpisują cały JSON (`src/lib/last-used.ts:27-29`, `src/lib/child-profiles.ts:54-56`). Wybór postaci jest dialogiem z listą przycisków na tej samej kartce, nie nowym ekranem.

## Desired End State

Pasek ma kontrolkę „Poziom:” z sześcioma nazwami. Generuj buduje labirynt wybranego poziomu. Drukuje się kartka, która jest na ekranie. Zmiana poziomu chowa kartkę do następnego Generuj.

| Id | Nazwa | Siatka | Wejście → wyjście | Droga (komórki) | Odnoga |
| --- | --- | --- | --- | --- | --- |
| `lat3` | 3 lata | 9×11 | środek góra → środek dół | ≤ 25 | ≤ 6 |
| `lat4` | 4 lata | 9×11 | środek góra → środek dół | ≥ 40 | ≤ 9 |
| `lat5` | 5 lat | 13×16 | środek góra → środek dół | ≤ 40 | ≤ 6 |
| `lat6` | 6 lat | 13×16 | środek góra → środek dół | ≥ 70 | bez limitu |
| `lat7` | 7–8 lat | 17×21 | środek góra → środek dół | 80–120 | bez limitu |
| `nastolatek` | nastolatek | 27×33 | lewy górny → prawy dolny | 150–300 | ≥ 25 |

Długość drogi liczy komórki jedynej drogi razem ze startem i metą. Odnoga to najdłuższy ciąg komórek poza tą drogą; pierwsza komórka poza drogą ma głębokość 1. Środek kolumny to `(columns - 1) / 2`. Wejście otwiera ścianę północną, meta południową. Przedziały są domknięte. Poziomy 5 lat i 6 lat nie dzielą żadnej długości: 41–69 nie pasuje do żadnego z nich.

Na poziomach do 7–8 lat wybrana postać stoi przy starcie, a „Bez postaci” zostawia napis Start. Nastolatek nie pokazuje postaci, pokazuje napis Start i nie musi mieć kółka. Zostaje dokładnie jedna droga start–meta.

Pusty zapis i nieznany poziom czytają się jako `lat5`. Wybór na pasku bez aktywnego profilu zapisuje się od razu. Profil dostaje poziom dopiero przy jawnym zapisie. Po 5 sekundach bez kartki widać „Nie udało się ułożyć tego poziomu.” Kartka spoza reguły się nie pojawia.

### Key Discoveries:

- Prosta droga środkiem 9×11 jest 4 kroki od krawędzi bocznej, więc odnoga ≤ 6 mieści drogę o 11 komórkach. Odnoga ≤ 3 tej prostej drogi nie mieści.
- Grzebień w kolumnie 6 na 13×16 daje 5 latom drogę 16 przy odnodze 6. Wężyk na 9×11 daje 4 latom drogę 91 przy odnodze 4. Droga ≥ 70 i pasmo 80–120 są kładzione w całości.
- `countPaths` i `LABEL_COLUMN` są wpisane jako kolumna 6 oraz wiersze 0 i 15. Nowa siatka bez ruszenia tych stałych rozjedzie otwór i napis.
- Zapis ostatniego użycia i profili nadpisuje cały JSON. Dopisanie poziomu tylko przy odczycie zniknie przy następnym zapisie postaci.

## What We're NOT Doing

- Nowy ekran albo osobna kontrolka długości drogi.
- Zmiana wzoru alejki, insetu 10 albo `@page { margin: 0 }`. Układ telefonu zostaje w S-09.
- Kółko na poziomie nastolatka. Drzewo bez cyklu spełnia regułę.
- Poziom dla osoby dorosłej.
- Losowanie dzisiejszym rzeźbieniem aż do trafienia w pasmo.
- Korekta progów po żywym sprawdzeniu kartki z dziećmi w wieku 4 lat oraz 6–7 lat. Ten plasterek wdraża liczby z tabeli.
- Przepisywanie `shape-notes.md` i słownika łatwy/średni/trudny w planie testów. Poza tym słownikiem ta zmiana rusza bullet §7 oraz zdania w §5 i §6 o braku komunikatu i o siatce 13×16.

## Implementation Approach

Tabela poziomów jest jednym modułem, z którego korzystają generator, kartka i pasek. Generator najpierw kładzie drogę o długości w paśmie, potem dołącza pozostałe komórki tak, żeby odnoga trzymała limit i nie powstała druga droga do mety. Bramka przed pokazaniem kartki odrzuca kandydata spoza reguły. Pasek korzysta z tego samego dialogu przycisków co postać.

## Critical Implementation Details

`countPaths` musi dostać komórki wejścia i wyjścia z poziomu. Zostawienie stałych `(0, 6)` i `(15, 6)` policzy drogę nie tam, gdzie jest otwór, gdy siatka nie jest 13×16.

Odnoga ≤ 6 przy 3 latach jest spełniona przez prostą drogę w kolumnie 4. Ta sama odnoga przy 5 latach jest spełniona przez prostą drogę w kolumnie 6. Nie trzeba losować rzeźbienia: w próbce 4000 labiryntów taki próg był skrajem, nie typem.

`writeLastUsed` i `writeChildProfiles` budują JSON od zera. Każde wywołanie po tej zmianie zapisuje też poziom. Zmiana poziomu czyści stan kartki w tym samym zdarzeniu, zanim rodzic zdąży kliknąć Drukuj.

## Phase 1: Generator pod regułę poziomu

### Overview

Moduł poziomu i generator zwracają labirynt zgodny z tabelą. Test na ustalonym ziarnie przechodzi dla każdego z sześciu id.

### Changes Required:

#### 1. Tabela poziomów

**File**: `src/lib/maze/levels.ts`

**Intent**: Jedno miejsce z id, nazwą, siatką, wejściem, wyjściem, pasmem drogi, limitem odnogi i tym, czy kartka pokazuje postać. Pasek i generator importują tę tabelę, a nie kopiują liczb.

**Contract**: Eksport `LEVELS` i `DEFAULT_LEVEL_ID = "lat5"`. Każdy wpis ma `id` z zestawu `lat3`, `lat4`, `lat5`, `lat6`, `lat7`, `nastolatek`, polską `label` z tabeli powyżej, `columns`, `rows`, `entrance`, `exit`, `pathMin`, `pathMax`, `spurMax`, `spurMin`, `showCharacter`. `null` w progu znaczy brak tej granicy. `showCharacter` jest `false` tylko dla `nastolatek`. Wejście i wyjście są zgodne z tabelą Desired End State.

#### 2. Generator i bramka

**File**: `src/lib/maze/generate.ts`

**Intent**: Zbudować labirynt pod regułę poziomu zamiast filtrować dzisiejsze rzeźbienie. Bramka nie puszcza na kartkę labiryntu spoza reguły.

**Contract**: `generateMaze(level, random)` zwraca labirynt tego poziomu. `countPaths(maze, entrance, exit)` liczy drogi między podanymi komórkami i kończy szukanie przy dwóch. `mazeForSheet(maze, level)` zwraca labirynt tylko gdy droga jest jedna, długość jest w paśmie i odnoga spełnia limit; inaczej `null`. Długość i odnoga liczone są tak, jak w Desired End State. Jedno wywołanie mieści się w limicie 5 sekund; pętla losowań przez 5 sekund nie jest sposobem na pasmo.

#### 3. Testy generatora

**File**: `src/lib/maze/generate.test.ts`

**Intent**: Zastąpić założenie, że każde ziarno jest kartką 13×16, sprawdzeniem kontraktu sześciu poziomów.

**Contract**: Dla każdego id jedno ustalone ziarno daje właściwe `columns` i `rows`, otwarte ściany wejścia i wyjścia, `countPaths === 1`, długość w paśmie i odnogę w limicie. Kandydat spoza pasma dostaje z `mazeForSheet` wartość `null`. Dotychczasowe ziarna 13×16 nie muszą same spełniać pasma `lat5`.

#### 4. Plan testów

**File**: `context/foundation/test-plan.md`

**Intent**: Zdanie, że zgodność z poziomem jest poza budżetem, dopóki poziomów nie ma, przestaje wyłączać te sześć poziomów. Zdania o Generuj bez komunikatu i o każdym ziarnie jako kartce 13×16 przestają być wyrocznią.

**Contract**: W §7 bullet o zgodności labiryntu z poziomem nie mówi już, że sprawdzenie czeka, aż poziomy powstaną. Reszta §7 zostaje. W §5 i w §6 zdanie o Generuj bez komunikatu mówi o komunikacie „Nie udało się ułożyć tego poziomu.” Zdanie o 34 ziarnach jako kartce 13×16 opisuje kontrakt sześciu poziomów. Słownik łatwy/średni/trudny zostaje.

#### 5. Wywołanie z kartki

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Jedyny przycisk Generuj woła generator nową sygnaturą. Pasek poziomu dochodzi w fazie 3.

**Contract**: `handleGenerate` woła `mazeForSheet(generateMaze(DEFAULT_LEVEL_ID, Math.random), level)` z `DEFAULT_LEVEL_ID`. Innych zmian w tym pliku faza 1 nie robi.

### Success Criteria:

#### Automated Verification:

- `npm test` sprawdza sześć poziomów: siatkę, jedną drogę, długość w paśmie i regułę odnogi
- `npm run lint` i `npx astro check` przechodzą

#### Manual Verification:

- W `context/foundation/test-plan.md` §7 zgodność z tymi sześcioma poziomami nie jest już poza budżetem, a §5 i §6 nie mówią już, że Generuj jest bez komunikatu ani że każde ziarno jest kartką 13×16

**Implementation Note**: Po zielonym `npm test`, `npm run lint` i `npx astro check` oraz po sprawdzeniu zdań w §5, §6 i §7 można przejść do fazy 2.

---

## Phase 2: Kartka dla czterech siatek

### Overview

Układ czyta siatkę i kolumnę wejścia z labiryntu. Cztery szerokości zostają przy wzorze alejki. Nastolatek ma napis Start w narożniku i nie ma znacznika postaci.

### Changes Required:

#### 1. Układ

**File**: `src/lib/sheet/layout.ts`

**Intent**: Etykieta i znacznik idą za kolumną wejścia labiryntu. Na nastolatku, gdzie postaci nie ma, zostaje napis Start.

**Contract**: `layoutSheet` dostaje kolumnę wejścia z poziomu, nie stałą `6`. Gdy `characterSelected` jest `false`, wynikiem jest napis Start i `mark: null`. Góra znacznika 30×30 dla siatek 9×11, 13×16 i 17×21 zostaje na stronie (`y >= 0`) przy stronie 210×297 i insecie 10. Szerokość komórki to `(210 - 20) / columns`.

#### 2. Rysowanie

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Ściany, Start, Meta i postać korzystają z wejścia poziomu. Na `nastolatek` kartka nie dostaje obrazka postaci, nawet gdy kontrolka ma wybraną postać.

**Contract**: `MazeSheet` przekazuje do układu `entrance.col` z poziomu i `characterSelected: level.showCharacter && characterSrc !== null`. Otwór w ścianie jest na komórce wejścia i wyjścia z poziomu. Wybrane id postaci w stanie paska się nie zmienia.

#### 3. Test układu

**File**: `src/lib/sheet/layout.test.ts`

**Intent**: Złapać rozsunięcie napisu i otworu oraz wyjście znacznika poza stronę na nowych siatkach.

**Contract**: Dla 9, 13, 17 i 27 kolumn szerokość komórki wynosi `190 / columns`. Dla poziomów ze środkowym wejściem napis albo środek znacznika leży na tej kolumnie. Dla `nastolatek` jest napis Start, nie ma znacznika, a punkt napisu leży na kolumnie 0. Dla trzech siatek z postacią góra znacznika 30×30 ma `y >= 0`.

### Success Criteria:

#### Automated Verification:

- Test układu daje szerokość komórki `190 / kolumny` dla 9, 13, 17 i 27
- Test układu kładzie napis albo postać na środkowej kolumnie poziomów do 7–8 lat, a na nastolatku napis Start bez znacznika postaci, z górą znacznika na stronie dla pozostałych trzech siatek
- `npm test` i `npm run lint` przechodzą

**Implementation Note**: Faza nie podpina jeszcze paska. Po zielonych testach układu można przejść do fazy 3.

---

## Phase 3: Wybór, zapis i Generuj

### Overview

Rodzic widzi poziom na istniejącej kartce. Zapis pamięta poziom. Generuj woła generator tego poziomu, a zmiana poziomu chowa kartkę.

### Changes Required:

#### 1. Ostatnie użycie

**File**: `src/lib/last-used.ts`

**Intent**: Ostatnie parametry obejmują poziom, a stary JSON bez pola nadal otwiera stronę.

**Contract**: Odczyt zwraca postać i id poziomu. Brak pola, pusty zapis, błąd i id spoza `LEVELS` dają `DEFAULT_LEVEL_ID`, a reguła postaci zostaje jak dziś (`none`, gdy postać jest zła). Zapis pisze JSON z `character` i `level`. Sam zapis postaci, bez `level`, przestaje być możliwy w sygnaturze używanej przez pasek.

#### 2. Profil

**File**: `src/lib/child-profiles.ts`

**Intent**: Profil niesie domyślny poziom i nie znika, gdy stare wpisy tego pola nie mają.

**Contract**: `ChildProfile` ma `level`. `acceptEntry` przy braku albo obcym `level` zostawia profil i wstawia `DEFAULT_LEVEL_ID`. Wpis o złym `id`, `name` albo `character` nadal odpada. Zapis odkłada `level` razem z pozostałymi polami. `openingVisit` ustawia poziom paska z jedynego profilu, inaczej z ostatniego użycia. `visitAfterDelete` dostaje poziom paska tak jak postać. Dwa wczesne powroty zostawiają ten poziom. Gdy znika aktywny profil, poziom bierze `openingVisit`.

#### 3. Pasek i Generuj

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Wybór poziomu stoi przy wyborze postaci. Kliknięcie Generuj buduje labirynt tego poziomu. Zmiana poziomu nie zostawia poprzedniej kartki do druku.

**Contract**: Kontrolka „Poziom:” jest dialogiem przycisków, jak „Postać:”, z sześcioma `label` z tabeli, na tej samej kartce przed Generuj i przy gotowej kartce. Bez aktywnego profilu wybór woła zapis ostatniego użycia od razu. Z aktywnym profilem wybór nie zapisuje profilu. Utworzenie profilu i jawny zapis ulubionej postaci zapisują poziom wtedy wybrany na pasku. Wybór profilu i przełączenie po zapisie ulubionej postaci wstawiają na pasek `level` tego profilu, tak jak dziś wstawiają postać. Zmiana id poziomu ustawia labirynt na `null` w tym samym zdarzeniu. `handleGenerate` woła `mazeForSheet(generateMaze(level, Math.random), level)` i przy `null` nie podmienia kartki oraz pokazuje „Nie udało się ułożyć tego poziomu.” Wywołanie kończy się w 5 sekundach.

#### 4. Testy zapisu

**File**: `src/lib/last-used.test.ts`, `src/lib/child-profiles.test.ts`

**Intent**: Stary magazyn bez poziomu nie gubi postaci ani profilu i nie zostawia obcego id.

**Contract**: Brak `level` i obce `level` dają `lat5`. Zapis odkłada podane id. Profil bez `level` zostaje na liście z `lat5`. Zły `character` nadal odrzuca wpis profilu. Dwa wczesne powroty `visitAfterDelete` zostawiają podany poziom paska. Skasowanie aktywnego profilu daje poziom z `openingVisit`.

#### 5. Kontrakt druku

**File**: `src/lib/sheet/print-contract.test.ts`

**Intent**: Drugi dialog na pasku nie wywraca listy klas chowanych przy druku.

**Contract**: Oczekiwana lista klas z `print:hidden` zawiera drugi raz `max-h-[calc(100dvh-2rem)] overflow-y-auto print:hidden`, bo dialog „Poziom:” kopiuje klasę dialogu postaci.

### Success Criteria:

#### Automated Verification:

- Test zapisu: brak pola poziomu i nieznany poziom czytają się jako `lat5`, zapis odkłada poziom, a profil bez poziomu zostaje
- `npm test`, `npm run lint` i `npx astro check` przechodzą

#### Manual Verification:

- Sześć poziomów po Generuj różni się alejką albo długością drogi, a nastolatek ma narożniki, napis Start i nie pokazuje postaci
- Zmiana poziomu chowa kartkę i Drukuj wraca dopiero po kolejnym Generuj
- Po odświeżeniu strony bez profilu widać ten sam poziom
- Przy aktywnym profilu zmiana poziomu na pasku nie zmienia profilu aż do jawnego zapisu, a wybór dziecka i usunięcie innego dziecka zostawiają na pasku poziom z tej samej reguły co postać
- Gdy ułożenie się nie uda, widać „Nie udało się ułożyć tego poziomu.” i kartka spoza reguły się nie pojawia

**Implementation Note**: Po zielonych testach zapisu i po ręcznym przejściu pięciu kroków plasterek jest gotowy do przeglądu implementacji.

---

## Testing Strategy

### Unit Tests:

- Sześć id: siatka, jedna droga, pasmo, odnoga, otwarte ściany wejścia i wyjścia.
- `mazeForSheet` zwraca `null` dla drogi poza pasmem i dla odnogi poza limitem.
- Odczyt starego JSON bez `level` oraz z obcym `level`.
- Układ: `190 / columns`, środek albo narożnik, brak znacznika na nastolatku, `y >= 0` znacznika na trzech pozostałych siatkach.

### Integration Tests:

- Brak nowego testu Playwright. `tests/e2e/seed.spec.ts` zostaje przy Generuj i napisach Start oraz Meta. Sześć poziomów pilnują testy Node.

### Manual Testing Steps:

1. Ustawić 3 lata, 5 lat, 7–8 lat i nastolatka. Po każdym Generuj sprawdzić alejkę, a na nastolatku narożniki, napis Start i brak postaci.
2. Przy kartce 5 lat przełączyć na 3 lata. Kartka znika. Drukuj nie drukuje poprzedniego labiryntu.
3. Wybrać 6 lat bez profilu, odświeżyć stronę, zobaczyć 6 lat.
4. Przy aktywnym profilu zmienić poziom, zapisać profil, odświeżyć i zobaczyć zapisany poziom. Bez zapisu odświeżenie wraca do poziomu profilu. Przy dwóch profilach wybór dziecka wstawia jego poziom. Usunięcie innego dziecka zostawia poziom z paska.
5. W teście wymusić `null` z bramki i sprawdzić zdanie „Nie udało się ułożyć tego poziomu.”

## Performance Considerations

Jedno zbudowanie labiryntu, także 27×33, ma się skończyć wyraźnie przed 5 sekundami. Limit 5 sekund jest odcięciem i komunikatem, nie budżetem na powtarzanie rzeźbienia.

## Migration Notes

Istniejący `printo-kids:last-used` i `printo-kids:child-profiles` bez `level` czytają się jako `lat5`. Następny zapis dopisuje pole. Wpis profilu nie jest usuwany tylko dlatego, że nie ma poziomu.

## References

- Related research: `context/changes/maze-difficulty-levels/research.md`
- Similar implementation: `src/lib/maze/generate.ts:27-87`
- Similar implementation: `src/lib/sheet/layout.ts:38-75`
- Similar implementation: `src/lib/last-used.ts:9-32`
- Product table: `context/foundation/prd.md:166-177`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Generator pod regułę poziomu

#### Automated

- [x] 1.1 `npm test` sprawdza sześć poziomów: siatkę, jedną drogę, długość w paśmie i regułę odnogi
- [x] 1.2 `npm run lint` i `npx astro check` przechodzą

#### Manual

- [x] 1.3 W `context/foundation/test-plan.md` §7 zgodność z tymi sześcioma poziomami nie jest już poza budżetem, a §5 i §6 nie mówią już, że Generuj jest bez komunikatu ani że każde ziarno jest kartką 13×16

### Phase 2: Kartka dla czterech siatek

#### Automated

- [ ] 2.1 Test układu daje szerokość komórki `190 / kolumny` dla 9, 13, 17 i 27
- [ ] 2.2 Test układu kładzie napis albo postać na środkowej kolumnie poziomów do 7–8 lat, a na nastolatku napis Start bez znacznika postaci, z górą znacznika na stronie dla pozostałych trzech siatek
- [ ] 2.3 `npm test` i `npm run lint` przechodzą

### Phase 3: Wybór, zapis i Generuj

#### Automated

- [ ] 3.1 Test zapisu: brak pola poziomu i nieznany poziom czytają się jako `lat5`, zapis odkłada poziom, a profil bez poziomu zostaje
- [ ] 3.2 `npm test`, `npm run lint` i `npx astro check` przechodzą

#### Manual

- [ ] 3.3 Sześć poziomów po Generuj różni się alejką albo długością drogi, a nastolatek ma narożniki, napis Start i nie pokazuje postaci
- [ ] 3.4 Zmiana poziomu chowa kartkę i Drukuj wraca dopiero po kolejnym Generuj
- [ ] 3.5 Po odświeżeniu strony bez profilu widać ten sam poziom
- [ ] 3.6 Przy aktywnym profilu zmiana poziomu na pasku nie zmienia profilu aż do jawnego zapisu, a wybór dziecka i usunięcie innego dziecka zostawiają na pasku poziom z tej samej reguły co postać
- [ ] 3.7 Gdy ułożenie się nie uda, widać „Nie udało się ułożyć tego poziomu.” i kartka spoza reguły się nie pojawia
