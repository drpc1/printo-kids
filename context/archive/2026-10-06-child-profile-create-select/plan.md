# Child profile create and select Implementation Plan

## Overview

Rodzic zakłada w prawym górnym rogu opcjonalny lokalny profil dziecka — imię i ulubiona postać — i przy co najmniej dwójce dzieci wskazuje aktywne dziecko, zanim wygeneruje kartę. Wydruk nie wymaga profilu. Zapis zostaje w przeglądarce, osobno od ostatniej postaci bez profilu.

## Current State Analysis

Strona `/` to nagłówek, zdanie o karcie A4 i wyspa `WorksheetGenerator` (`src/components/WorksheetHome.astro`). Przed labiryntem widać „Postać:” i Generuj. Po labiryncie po lewej są Postać i ciche Generuj, po prawej Drukuj (`src/components/WorksheetGenerator.tsx`). Katalog to `none`, `samochodzik`, `rakieta`, `dinozaur`. Kliknięcie wiersza od razu zmienia obrazek na karcie i woła `writeLastUsed`.

Ostatnia postać bez profilu leży w `localStorage` pod `printo-kids:last-used` jako `{"character":"<id>"}` (`src/lib/last-used.ts`). Zły odczyt zwraca `none` i nic nie zapisuje. Błąd zapisu jest połykany. W `src/` nie ma profilu, imienia ani selektora. W `src/components/ui` są przycisk i dialog; nie ma pola tekstowego.

FR-007 i FR-008 są must-have. Ten plasterek dowozi imię i ulubioną postać. Poziom trudności jest zaparkowany. Jawny zapis zmian profilu i usunięcie po potwierdzeniu to S-06. Druk chowa przyciski wewnątrz `#worksheet-home`; treść dialogu ma już `print:hidden`, bo portal radix wychodzi poza ten węzeł (`src/components/ui/dialog.tsx`).

## Desired End State

Brak profili: róg pokazuje „Profil”. Klik otwiera okno z imieniem i czterema wierszami postaci. Anuluj nic nie zapisuje. Utworzenie „Zosia” z rakietą zostawia w rogu „Zosia”, na pasku „Postać: Rakieta”, a Generuj działa. Odświeżenie przy samej Zosi znowu pokazuje rakietę.

Przy samej Zosi kliknięcie dinozaura zmienia postać tylko w tej wizycie. Odświeżenie wraca do rakiety. Klucz `printo-kids:last-used` przez to kliknięcie się nie zmienia.

Dwoje dzieci, Zosia z rakietą i Antek z dinozaurem, a ostatnia postać bez profilu to samochodzik: wejście otwiera menu imion, pasek pokazuje Samochodzik, Generuj nie działa. Zamknięcie menu bez imienia zostawia Generuj wyłączone. Kliknięcie Zosi ustawia rakietę i włącza Generuj. Kliknięcie dinozaura znowu dotyczy tylko tej wizyty. Odświeżenie pyta jeszcze raz; po ponownym wyborze Zosi wraca rakieta, a samochodzik w kluczu bez profilu zostaje.

Menu układa imiona alfabetycznie po polsku. „Dodaj profil” jest na dole. Nowy profil od razu staje się aktywny. Druk jednej strony A4 nie pokazuje rogu, menu ani przycisków.

### Key Discoveries:

- Klik wiersza postaci zawsze woła `writeLastUsed` (`src/components/WorksheetGenerator.tsx`). Przy aktywnym profilu ten zapis zepsułby ostatnią postać bez profilu.
- `npm test` uruchamia tylko pliki wpisane w `package.json`. Stryker mutuje tylko moduły z tej listy (`stryker.config.json`).
- Katalog postaci zostaje w komponencie. Moduł profili dostaje dozwolone identyfikatory z zewnątrz, tak jak `readLastUsed`.

## What We're NOT Doing

- Poziom trudności i jakiekolwiek dalsze pola profilu. Zapisany profil ma `id`, `name` i `character`.
- Jawny zapis zmienionej postaci z powrotem do profilu i usunięcie profilu. To S-06. W menu nie ma wiersza „Bez profilu”.
- Limit liczby profili.
- Lista dzieci na stronie labiryntu, osobna strona profili i profil w pasku obok Postaci.
- Przenoszenie `printo-kids:last-used` do profilu, zapis labiryntu, zmiana katalogu postaci, geometrii karty i `window.print()`.
- Konto, serwer i synchronizacja. Zły albo wyczyszczony magazyn przeglądarki wygląda jak brak profili.

## Implementation Approach

Czysty moduł `src/lib/child-profiles.ts` czyta i zapisuje tablicę pod kluczem `printo-kids:child-profiles`. Odczyt nic nie zapisuje. Zły dokument daje pustą listę. Wpis z pustym `id`, zdublowanym `id`, imieniem spoza reguł albo postacią spoza zestawu wypada z odczytu i nie jest zapisywany z powrotem. Aktywne dziecko na czas wizyty trzyma wyspa, nie magazyn: przy jednym profilu wynika z jedynego wpisu, przy dwóch i więcej zaczyna się jako brak wyboru.

Róg jest w tej samej wyspie co Postać, `fixed` do rogu okna, wewnątrz `#worksheet-home`. Jedno okno dialogu ma widok menu albo widok formularza. Pole imienia to wspólny input z katalogu shadcn, którego dziś nie ma. Klik postaci woła `writeLastUsed` tylko wtedy, gdy w tej wizycie nie ma aktywnego profilu.

## Critical Implementation Details

- **State sequencing** — Przy dwóch i więcej profilach Generuj jest wyłączone od pierwszego malowania, nie po efekcie. Inaczej da się wygenerować kartę, zanim rodzic zobaczy pytanie. Stan otwartego menu na starcie wizyty też jest początkowy, nie dociągnięty efektem.
- **Timing & lifecycle** — Dzisiejszy klik wiersza postaci zapisuje `printo-kids:last-used` bezwarunkowo. Zapis tego klucza zostaje wyłącznie przy braku aktywnego profilu: zero profili albo dwójka przed wyborem imienia. Wybór dziecka i klik postaci przy aktywnym profilu tego klucza nie ruszają.
- **User experience spec** — Portal dialogu wychodzi poza `#worksheet-home`, więc sam selektor `button` z arkusza druku go nie chowa. Treść okna zostaje przy `print:hidden` już obecnym na `DialogContent`. Przycisk rogu zostaje w `#worksheet-home` i dodatkowo ma `print:hidden`.

## Phase 1: Kontrakt zapisu

### Overview

Moduł profili i testy reguł imienia, postaci i odczytu, bez zmiany ekranu.

### Changes Required:

#### 1. Moduł profili

**File**: `src/lib/child-profiles.ts`

**Intent**: Ustala lokalny zapis FR-007, zanim powstanie róg. Klucz ostatniej postaci bez profilu zostaje osobny, żeby jednorazowa zmiana karty nie mieszała się z dzieckiem.

**Contract**: Klucz `printo-kids:child-profiles`. Zapisana wartość to JSON `{"profiles":[{"id":"<id>","name":"<imię>","character":"<id>"}]}`. `readChildProfiles(storage, allowed)` zwraca tablicę. Wynik to `[]`, gdy `getItem` da `null`, `""`, tekst niebędący obiektem, brak tablicy `profiles`, albo `getItem` rzuci. Wpis zostaje, gdy `id` jest niepustym stringiem i nie powtarza się wcześniej, `character` jest w `allowed`, a imię przechodzi reguły wobec już zatrzymanych imion. Odczyt nie wywołuje `setItem`. `profileNameError(name, existingNames)` zwraca `"empty"`, `"too-long"`, `"duplicate"` albo `null`. Imię do zapisu to tekst po obcięciu spacji na brzegach. Puste daje `"empty"`. Więcej niż 40 punktów kodowych daje `"too-long"`. Drugie imię równe po `toLocaleLowerCase("pl")` daje `"duplicate"`. `writeChildProfiles(storage, profiles)` zapisuje dokładnie podaną tablicę i zwraca `true`. Wyjątek z `setItem` daje `false` i nie wychodzi z funkcji. `storage` jest podręczany, jak w `src/lib/last-used.ts`.

#### 2. Rejestr testu i mutacji

**File**: `package.json`

**Intent**: `npm test` ma uruchamiać nowy plik razem z istniejącymi testami.

**Contract**: Skrypt `test` dostaje `src/lib/child-profiles.test.ts` obok obecnej listy. Pozostałe skrypty bez zmian.

**File**: `stryker.config.json`

**Intent**: Nowy moduł z testem Node wchodzi do tej samej listy mutacji co `src/lib/last-used.ts`.

**Contract**: Tablica `mutate` dostaje `src/lib/child-profiles.ts`. Reszta konfiguracji bez zmian.

#### 3. Testy kontraktu

**File**: `src/lib/child-profiles.test.ts`

**Intent**: Ustala widoczne reguły imienia i odczytu na podręczonym magazynie, zanim powstanie róg.

**Contract**: Styl jak w `src/lib/last-used.test.ts` (`node:test`, podręczany magazyn, który liczy zapisy). Dozwolone identyfikatory: `none`, `samochodzik`, `rakieta`, `dinozaur`. Odczyt: brak klucza, `""`, zły JSON, obiekt bez tablicy, wpis z postacią spoza zestawu, wpis z pustym `id`, dwa wpisy o tym samym `id` (zostaje pierwszy), imię z samych spacji. Odczyt żadnego z tych przypadków nie woła `setItem`. `profileNameError`: `" Zosia "` przy pustej liście daje `null` i zapisane imię to `Zosia`; `"   "` daje `"empty"`; 40 znaków `a` daje `null`; 41 znaków `a` daje `"too-long"`; `"zosia"` przy istniejącym `Zosia` daje `"duplicate"`. Zapis profilu Zosi z rakietą i kolejny odczyt zwracają to samo imię, `id` i `character`. Rzucające `setItem` daje `false` i nie przerywa wywołania.

### Success Criteria:

#### Automated Verification:

- `npm test` obejmuje brak klucza, pusty string, zły JSON, imię po obcięciu spacji, puste imię, duplikat bez względu na wielkość liter, 40 i 41 znaków, postać spoza zestawu oraz odczyt, który nie wywołuje zapisu
- `npm run lint` przechodzi

**Implementation Note**: Ta faza nie ma sprawdzianu ręcznego. Po zielonym `npm test` i `npm run lint` można przejść do fazy 2.

---

## Phase 2: Róg i założenie

### Overview

Róg pozwala założyć pierwszy profil. Jedno dziecko od wejścia ustawia ulubioną postać. Pytanie przy dwójce i blokada Generuj wchodzą w fazie 3.

### Changes Required:

#### 1. Pole imienia

**File**: `src/components/ui/input.tsx`

**Intent**: Formularz profilu używa wspólnego pola tekstowego, którego w katalogu jeszcze nie ma.

**Contract**: Plik pochodzi z `npx shadcn@latest add input`. Brak ręcznie składanego pola z własnymi klasami koloru.

#### 2. Róg, menu jednego dziecka i formularz

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Rodzic zakłada profil bez ruszania paska Postać / Generuj / Drukuj i widzi ulubioną postać, zanim wygeneruje kartę.

**Contract**: Przycisk rogu jest `fixed` w prawym górnym rogu okna, wewnątrz drzewa `#worksheet-home`, z `print:hidden`. Bez aktywnego profilu napis to „Profil”. Z aktywnym — imię, obcięte wielokropkiem, gdy nie mieści się w rogu; pełne imię jest w `aria-label` i w menu. Brak profili: klik otwiera formularz. Jeden profil: klik otwiera menu z imieniem, zapisaną ulubioną postacią i „Dodaj profil”, bez listy wyboru. „Dodaj profil” przełącza to samo okno na formularz. Formularz ma etykietę „Imię”, te same cztery wiersze postaci co kontrolka Postać (zaznaczona jest postać z paska), „Utwórz” i „Anuluj”. Anuluj przy braku profili zamyka okno. Anuluj przy istniejących profilach wraca do menu. Zamknięcie bez „Utwórz” nic nie zapisuje. „Utwórz” woła `profileNameError`. Przy błędzie okno zostaje, a tekst to „Wpisz imię”, „Imię może mieć najwyżej 40 znaków” albo „Takie imię już jest”. Przy `writeChildProfiles` równym `false` okno zostaje z tekstem „Nie udało się zapisać profilu” i lista na ekranie się nie zmienia. Sukces zamyka okno, robi nowy profil aktywnym i ustawia pasek na wybraną w formularzu postać, bez `writeLastUsed`. `id` pochodzi z `crypto.randomUUID()`. Start przy dokładnie jednym poprawnym profilu: ten profil jest aktywny, pasek pokazuje jego `character`, Generuj działa. Start przy zerze: pasek zostaje przy `readLastUsed`, Generuj działa. Klik wiersza postaci woła `writeLastUsed` tylko, gdy nie ma aktywnego profilu. Generuj i Drukuj profilu nie zapisują.

### Success Criteria:

#### Automated Verification:

- `npm run lint` przechodzi po podpięciu rogu
- `npm test` przechodzi po podpięciu rogu

#### Manual Verification:

- Brak profili: róg pokazuje „Profil”, Anuluj nic nie zapisuje, utworzenie „Zosia” z rakietą pokazuje w rogu „Zosia” i na pasku „Postać: Rakieta”, a odświeżenie zostawia rakietę
- Przy samej Zosi kliknięcie dinozaura zmienia postać w tej wizycie; odświeżenie wraca do rakiety, a klucz `printo-kids:last-used` zostaje bez zmian
- Puste imię, drugie „zosia” i imię dłuższe niż 40 znaków zostają w oknie z komunikatem i nie dopisują profilu
- Druk jednej strony A4 nie pokazuje rogu, menu ani przycisków

**Implementation Note**: Po zielonym `npm test` i `npm run lint` zatrzymaj się na ręczne sprawdzenie czterech punktów powyżej, zanim ruszy faza 3.

---

## Phase 3: Wybór przy dwóch i więcej

### Overview

Wejście przy co najmniej dwóch profilach pyta, które to dziecko. Generuj czeka na imię. Jedno dziecko nadal wchodzi bez pytania.

### Changes Required:

#### 1. Stan otwarcia wizyty i kolejność imion

**File**: `src/lib/child-profiles.ts`

**Intent**: Reguła wspólnego tabletu i alfabetu ma być sprawdzalna bez przeglądarki, tym samym modułem co zapis.

**Contract**: `openingVisit(profiles, lastUsed)` zwraca aktywne `id`, postać paska i to, czy pytać o dziecko. Pusta lista: brak aktywnego `id`, postać `lastUsed`, bez pytania. Jeden profil: jego `id`, jego `character`, bez pytania. Dwa i więcej: brak aktywnego `id`, postać `lastUsed`, z pytaniem. `sortProfiles(profiles)` układa kopię przez `localeCompare` z locale `pl`. Kolejność dla Antek, Basia, Łucja, Zosia to Antek, Basia, Łucja, Zosia. Funkcje nie czytają magazynu.

#### 2. Testy wizyty

**File**: `src/lib/child-profiles.test.ts`

**Intent**: Blokada Generuj i kolejność menu nie mogą zależeć od ręcznego klikania.

**Contract**: Przypadki `openingVisit`: zero profili i `lastUsed` równe `samochodzik` puszczają Generuj z tą postacią; jeden profil Zosi z rakietą puszcza Generuj z rakietą i bez pytania; Zosia i Antek przy `lastUsed` równym `samochodzik` zostawiają samochodzik i pytają. Osobno kolejność Antek, Basia, Łucja, Zosia.

#### 3. Menu wyboru

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Przy dwójce dzieci rodzic wskazuje aktywne dziecko, zanim powstanie karta, a imiona nie leżą na stronie labiryntu.

**Contract**: Start wizyty bierze `openingVisit`. Pytanie otwiera menu od pierwszego malowania. Menu pokazuje imiona z `sortProfiles`, a pod nimi „Dodaj profil”. Wiersz aktywnego imienia jest zaznaczony tak jak zaznaczony wiersz postaci. Przed wyborem róg pokazuje „Profil”, pasek pokazuje postać z `openingVisit`, a Generuj jest `disabled` i nie woła `generateMaze`. Zamknięcie menu bez imienia zostawia Generuj wyłączone; ponowny klik rogu otwiera menu. Klik imienia ustawia ten profil jako aktywny, pasek na jego `character`, zamyka menu i włącza Generuj, bez `writeLastUsed`. „Utwórz” przy już istniejących profilach też robi nowy profil aktywnym i włącza Generuj w tej wizycie. Odświeżenie przy dwóch i więcej znowu zaczyna od `openingVisit`, więc poprzedni wybór nie wraca sam. Jeden profil zostaje przy regule fazy 2.

### Success Criteria:

#### Automated Verification:

- `npm test` sprawdza start wizyty: zero i jedno dziecko puszczają Generuj, dwoje bez wyboru zostawia ostatnią postać bez profilu i blokuje Generuj, a imiona układają się Antek, Basia, Łucja, Zosia
- `npm run lint` przechodzi

#### Manual Verification:

- Zosia (rakieta) i Antek (dinozaur), a ostatnia postać bez profilu to samochodzik: wejście otwiera menu, pasek pokazuje Samochodzik, Generuj nie działa; zamknięcie menu bez imienia zostawia Generuj wyłączone
- Kliknięcie Zosi ustawia „Postać: Rakieta” i włącza Generuj; kliknięcie dinozaura zmienia tylko tę wizytę; odświeżenie znowu pyta, a po ponownym wyborze Zosi wraca rakieta
- Menu układa Antek przed Zosią, „Dodaj profil” jest na dole, a nowy profil od razu staje się aktywny
- Druk jednej strony A4 nadal nie pokazuje rogu ani menu

**Implementation Note**: Po zielonym `npm test` i `npm run lint` zatrzymaj się na ręczne przejście czterech punktów, w tym druk jednej strony.

---

## Testing Strategy

### Unit Tests:

- Odczyt i zapis `printo-kids:child-profiles` na podręczonym magazynie, łącznie z tym, że odczyt nie zapisuje.
- Reguły imienia: trim, puste, 40 i 41 punktów kodowych, duplikat po `toLocaleLowerCase("pl")`.
- `openingVisit` dla zera, jednego i dwóch profili oraz kolejność Antek, Basia, Łucja, Zosia.

### Integration Tests:

- Brak osobnego runnera UI. Wejście, menu i druk zostają w sprawdzianie ręcznym faz 2 i 3.

### Manual Testing Steps:

1. Załóż Zosię z rakietą przy pustym magazynie profili i odśwież stronę.
2. Zmień postać na dinozaura, odśwież i sprawdź w narzędziach przeglądarki, że `printo-kids:last-used` nie przyjął dinozaura.
3. Odrzuć puste imię, „zosia” i imię o długości 41.
4. Dołóż Antka z dinozaurem, odśwież, sprawdź blokadę Generuj, wybór Zosi i powrót rakiety po kolejnym odświeżeniu.
5. Wydrukuj kartę i sprawdź jedną stronę A4 bez rogu i bez menu.

## Performance Considerations

Lista profili jest nieograniczona, ale dotyczy jednego gospodarstwa na jednym urządzeniu. Sortowanie przy otwarciu menu nie wymaga pamięci podręcznej.

## Migration Notes

Brak klucza `printo-kids:child-profiles` oznacza brak profili. `printo-kids:last-used` nie jest przepisywany na profil. Istniejąca ostatnia postać zostaje ścieżką bez dziecka.

## References

- Podobny magazyn: `src/lib/last-used.ts`
- Poprzedni plan klucza bez profilu: `context/archive/2026-10-05-last-used-print-params/plan.md`
- Wymagania: `context/foundation/prd.md` (FR-007, FR-008)
- Plasterek: `context/foundation/roadmap.md` (S-05)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Kontrakt zapisu

#### Automated

- [x] 1.1 `npm test` obejmuje brak klucza, pusty string, zły JSON, imię po obcięciu spacji, puste imię, duplikat bez względu na wielkość liter, 40 i 41 znaków, postać spoza zestawu oraz odczyt, który nie wywołuje zapisu — 077ca3c
- [x] 1.2 `npm run lint` przechodzi — 077ca3c

### Phase 2: Róg i założenie

#### Automated

- [x] 2.1 `npm run lint` przechodzi po podpięciu rogu
- [x] 2.2 `npm test` przechodzi po podpięciu rogu

#### Manual

- [x] 2.3 Brak profili: róg pokazuje „Profil”, Anuluj nic nie zapisuje, utworzenie „Zosia” z rakietą pokazuje w rogu „Zosia” i na pasku „Postać: Rakieta”, a odświeżenie zostawia rakietę
- [x] 2.4 Przy samej Zosi kliknięcie dinozaura zmienia postać w tej wizycie; odświeżenie wraca do rakiety, a klucz `printo-kids:last-used` zostaje bez zmian
- [x] 2.5 Puste imię, drugie „zosia” i imię dłuższe niż 40 znaków zostają w oknie z komunikatem i nie dopisują profilu
- [x] 2.6 Druk jednej strony A4 nie pokazuje rogu, menu ani przycisków

### Phase 3: Wybór przy dwóch i więcej

#### Automated

- [x] 3.1 `npm test` sprawdza start wizyty: zero i jedno dziecko puszczają Generuj, dwoje bez wyboru zostawia ostatnią postać bez profilu i blokuje Generuj, a imiona układają się Antek, Basia, Łucja, Zosia — 9e00412
- [x] 3.2 `npm run lint` przechodzi — 9e00412

#### Manual

- [x] 3.3 Zosia (rakieta) i Antek (dinozaur), a ostatnia postać bez profilu to samochodzik: wejście otwiera menu, pasek pokazuje Samochodzik, Generuj nie działa; zamknięcie menu bez imienia zostawia Generuj wyłączone — 9e00412
- [x] 3.4 Kliknięcie Zosi ustawia „Postać: Rakieta” i włącza Generuj; kliknięcie dinozaura zmienia tylko tę wizytę; odświeżenie znowu pyta, a po ponownym wyborze Zosi wraca rakieta — 9e00412
- [x] 3.5 Menu układa Antek przed Zosią, „Dodaj profil” jest na dole, a nowy profil od razu staje się aktywny — 9e00412
- [x] 3.6 Druk jednej strony A4 nadal nie pokazuje rogu ani menu — 9e00412
