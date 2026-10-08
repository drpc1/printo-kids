# Child profile save and delete Implementation Plan

## Overview

Rodzic zapisuje ulubioną postać aktywnego dziecka w menu z prawego górnego rogu i usuwa dowolny profil po potwierdzeniu. Postać obok Generuj zostaje wyborem na tę kartę. Profil przyjmuje nową ulubioną dopiero po „Zapisz”.

## Current State Analysis

Na `/` róg w `ProfileCorner` zakłada profil i przy co najmniej dwóch imionach każe wybrać dziecko (`src/components/WorksheetGenerator.tsx`). Zapisany profil ma `id`, `name` i `character` pod `printo-kids:child-profiles`. `writeChildProfiles` przepisuje całą tablicę i jest wołane tylko przy „Utwórz”. W menu jednego dziecka ulubiona jest do odczytu. Przy dwóch i więcej widać imiona oraz „Dodaj profil”. Nie ma „Zapisz” ani „Usuń”.

Klik wiersza na pasku Postać zmienia postać karty. `writeLastUsed` idzie wyłącznie wtedy, gdy nikt nie jest aktywny. Przy aktywnym dziecku klik dinozaura nie zmienia profilu ani klucza `printo-kids:last-used`. Wejście bierze ulubioną jedynego dziecka. Przy dwóch i więcej Generuj czeka, a pasek pokazuje ostatnią postać bez profilu (`openingVisit`).

Warunek blokady jest zamrożony na starcie wizyty: `visit.ask && activeId === null` (`src/components/WorksheetGenerator.tsx`). Skasowanie profili w trakcie wizyty, która zaczęła się od pytania, zostałoby przy tej fladze nawet po zejściu do zera dzieci. W `src/components/ui` są przycisk, dialog i pole tekstowe. Potwierdzenia nie ma. `DialogContent` ma `print:hidden`.

FR-009 i FR-010 są must-have. Poziom trudności i przeróbka listy postaci (US-03) są zaparkowane. Formularz zostaje przy czterech otwartych wierszach.

## Desired End State

Zosia ma ulubioną rakietę, pasek też pokazuje rakietę. W rogu rodzic wskazuje dinozaura i klika „Zapisz”. W profilu i na pasku jest dinozaur. Odświeżenie znowu daje dinozaura. „Zapisz” przy już wskazanej rakiecie jest nieaktywny. Zamknięcie okna po wskazaniu dinozaura bez „Zapisz” zostawia rakietę i nie rusza paska.

Ten sam start, ale rodzic najpierw wybiera samochodzik obok Generuj. Potem w rogu zapisuje dinozaura. Pasek zostaje przy samochodzik, labirynt bierze samochodzik, a profil dostaje dinozaura. Odświeżenie daje dinozaura. Klucz `printo-kids:last-used` przez ten zapis się nie zmienia.

Przy Antku na liście klik jego imienia, gdy w rogu Zosi wskazano dinozaura i nie zapisano, pokazuje „Zapisz i przełącz” oraz „Przełącz bez zapisu”. Pierwsze zapisuje dinozaura u Zosi i włącza Antka z jego ulubioną na pasku. Drugie zostawia Zosi rakietę i też włącza Antka. Gdy w rogu nadal jest rakieta, klik Antka przełącza od razu.

Usunięcie Basi, gdy aktywna jest Zosia, po potwierdzeniu zostawia Zosię i pasek. Anuluj nic nie kasuje. Usunięcie aktywnej Zosi przy samym Antku włącza Antka i Generuj. Gdy zostaje dwoje lub więcej, róg pokazuje „Profil”, pasek wraca do postaci bez profilu, Generuj czeka. Po ostatnim profilu róg pokazuje „Profil”, pasek wraca do postaci bez profilu, Generuj działa. Druk jednej strony A4 nie pokazuje rogu, „Zapisz”, „Usuń” ani ostrzeżenia.

### Key Discoveries:

- Jedno okno rogu przełącza menu i formularz. Potwierdzenie może być trzecim widokiem tego samego okna, a `DialogContent` już chowa się na wydruku (`src/components/ui/dialog.tsx`).
- `writeChildProfiles` przyjmuje całą tablicę. Zapis ulubionej i usunięcie są nową tablicą, nie nowym kluczem (`src/lib/child-profiles.ts`).
- `npm test` już uruchamia `src/lib/child-profiles.test.ts`. Stryker już mutuje `src/lib/child-profiles.ts`.

## What We're NOT Doing

- Edycję imienia, poziom trudności i jakiekolwiek nowe pole profilu.
- Zapis postaci z paska obok Generuj do profilu. Ten pasek zostaje wyborem na tę kartę.
- Przeróbkę listy postaci z US-03. W rogu zostają cztery otwarte wiersze.
- Wiersz „Bez profilu”, limit profili, osobną stronę profili i listę dzieci na stronie labiryntu.
- Ostrzeżenie przy zamknięciu okna, przy „Dodaj profil” i przy ponownym kliknięciu już aktywnego imienia. Ostrzeżenie jest tylko przy kliknięciu innego imienia, gdy wiersz w rogu różni się od zapisanej ulubionej.
- Nowy komponent potwierdzenia. Nie dokładamy `alert-dialog`.
- Konto, serwer, synchronizację i zmianę klucza `printo-kids:last-used` przy aktywnym profilu.

## Implementation Approach

Czyste funkcje w `src/lib/child-profiles.ts` liczą nową tablicę po zapisie ulubionej, pasek po „Zapisz” i wizytę po usunięciu. Wyspa woła istniejące `writeChildProfiles`. Przy `false` zostawia ekran i pokazuje „Nie udało się zapisać profilu”.

Menu rogu dostaje wiersze postaci i „Zapisz” dla aktywnego dziecka oraz „Usuń” przy każdym imieniu. Przy jednym dziecku „Usuń” jest w jego menu. Potwierdzenie usunięcia i ostrzeżenie przy przełączeniu są kolejnymi widokami tego samego dialogu. Pasek Postać i `writeLastUsed` zostają przy dzisiejszej regule: zapis klucza bez profilu tylko wtedy, gdy nikt nie jest aktywny.

## Critical Implementation Details

- **State sequencing** — Pasek po „Zapisz” zmienia się wyłącznie, gdy jest równy poprzedniej ulubionej. „Zapisz i przełącz” tej reguły nie stosuje: po udanym zapisie pasek bierze ulubioną dziecka, na które rodzic przeszedł. Generuj jest wyłączone, gdy profili jest co najmniej dwa i nikt nie jest aktywny. Flaga `visit.ask` ze startu wizyty nie może zostać włączona po usunięciu ostatniego profilu, bo wtedy Generuj zostałby zgaszony mimo pustej listy.
- **User experience spec** — Szkic w rogu startuje od zapisanej ulubionej i nie rusza paska. Zamknięcie okna oraz „Dodaj profil” porzucają szkic bez pytania. Ponowne kliknięcie już aktywnego imienia zostaje przy dzisiejszym wyborze: okno się zamyka, a pasek wraca do zapisanej ulubionej. Klik „Usuń” nie wybiera dziecka. Usunięcie aktywnego dziecka, nawet z brudnym szkicem, ma tylko potwierdzenie usunięcia.

## Phase 1: Kontrakt zapisu i usunięcia

### Overview

Reguły zapisu ulubionej, paska i usunięcia da się sprawdzić bez przeglądarki. Ekran w tej fazie się nie zmienia.

### Changes Required:

#### 1. Funkcje czyste

**File**: `src/lib/child-profiles.ts`

**Intent**: Faza 2 i 3 mają wołać jedną regułę paska i jedną regułę listy po usunięciu, zamiast rozstrzygać to w wyspie.

**Contract**: `withFavorite(profiles, id, character, allowed)` zwraca nową tablicę, w której ten `id` ma nową `character`, a `id` i `name` zostają. Kolejność pozostałych wpisów zostaje. Wynik to `null`, gdy nie ma takiego `id` albo `character` nie jest w `allowed`. `barAfterFavoriteSave(bar, previousFavorite, nextFavorite)` zwraca `nextFavorite`, gdy `bar` równa się `previousFavorite`. W przeciwnym razie zwraca `bar`. `visitAfterDelete(profiles, deletedId, activeId, barCharacter, lastUsed)` zwraca listę bez `deletedId` oraz `activeId`, `character` i `ask`. Gdy `activeId` jest ustawione i nie jest kasowanym id, zostają dotychczasowy aktywny, `barCharacter` i `ask: false`. Gdy kasowany jest aktywny albo nikt nie był aktywny, resztę listy rozstrzyga `openingVisit(remaining, lastUsed)`. Brak `deletedId` zwraca wejściową listę, tego samego aktywnego i `barCharacter`. `ask` jest wtedy `true` tylko, gdy `activeId` jest `null` i profili jest co najmniej dwa. Funkcje nie czytają magazynu i nie wołają `setItem`.

#### 2. Testy kontraktu

**File**: `src/lib/child-profiles.test.ts`

**Intent**: Przykłady z wywiadu mają paść na czerwono, zanim powstanie przycisk.

**Contract**: Styl jak w istniejącym pliku. Dozwolone identyfikatory: `none`, `samochodzik`, `rakieta`, `dinozaur`. `withFavorite` dla Zosi z rakietą na dinozaura zostawia imię Zosia i nie rusza Antka. Nieznane id oraz postać spoza zestawu dają `null`. `barAfterFavoriteSave("rakieta", "rakieta", "dinozaur")` daje `dinozaur`. `barAfterFavoriteSave("samochodzik", "rakieta", "dinozaur")` daje `samochodzik`. Usunięcie Basi przy aktywnej Zosi i pasku samochodzik zostawia Zosię, samochodzik i brak pytania. Usunięcie aktywnej Zosi przy samym Antku z dinozaurem włącza Antka, jego dinozaura i Generuj, niezależnie od `lastUsed` równego samochodzik. Usunięcie aktywnej Zosi, gdy zostają Antek i Basia, daje brak aktywnego, pasek `lastUsed` i pytanie. Usunięcie jedynej Zosi daje brak aktywnego, pasek `lastUsed` i brak pytania. Przy braku aktywnego: z trójki po usunięciu jednego zostaje pytanie i pasek `lastUsed`; z dwójki zostaje jedyny profil, jego postać i brak pytania. Brak kasowanego id nic nie zmienia. Żaden test nie woła `setItem`.

### Success Criteria:

#### Automated Verification:

- `npm test` obejmuje zapis dinozaura u Zosi bez zmiany imienia i bez ruszenia Antka, odmowę nieznanego id i postaci spoza zestawu, przejście paska z rakiety na dinozaura, zostawienie paska samochodzik, zostawienie aktywnej Zosi po usunięciu Basi, włączenie Antka po usunięciu aktywnej Zosi, pytanie i postać bez profilu gdy po usunięciu aktywnego zostaje dwoje, powrót do postaci bez profilu po usunięciu ostatniego oraz pytanie albo włączenie jedynego, gdy nikt nie był aktywny
- `npm run lint` przechodzi

**Implementation Note**: Ta faza nie ma sprawdzianu ręcznego. Po zielonym `npm test` i `npm run lint` można przejść do fazy 2.

---

## Phase 2: Zapis ulubionej w rogu

### Overview

Aktywne dziecko dostaje w rogu cztery wiersze i „Zapisz”. Pasek obok Generuj nadal zmienia tylko tę kartę.

### Changes Required:

#### 1. Szkic ulubionej i „Zapisz”

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Rodzic zmienia ulubioną tam, gdzie jest profil, a jednorazowa postać przy Generuj nie wchodzi do profilu sama.

**Contract**: Przy aktywnym dziecku menu pokazuje te same cztery wiersze co formularz tworzenia. Zaznaczenie startuje od zapisanej ulubionej. Klik wiersza w rogu ustawia tylko szkic: nie woła `setCharacter`, `writeLastUsed` ani `writeChildProfiles`. „Zapisz” jest nieaktywny, gdy szkic równa się zapisanej ulubionej. Klik „Zapisz” liczy tablicę przez `withFavorite` i zapisuje ją `writeChildProfiles`. Przy `false` okno zostaje, szkic zostaje, pasek zostaje, tekst to „Nie udało się zapisać profilu”. Przy sukcesie profil na ekranie ma nową postać, okno zostaje otwarte, „Zapisz” gaśnie, a pasek bierze `barAfterFavoriteSave`. Drugi klik w trakcie zapisu nic nie woła. Zamknięcie okna i „Dodaj profil” porzucają szkic. Ponowne otwarcie znowu zaznacza zapisaną ulubioną. Przy braku aktywnego dziecka wierszy i „Zapisz” nie ma. Odczytowy wiersz ulubionej przy jednym dziecku znika, bo zastępują go wiersze wyboru. Pasek Postać i warunek `rememberLastUsed={activeId === null}` zostają.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi po podpięciu zapisu w rogu
- `npm run lint` przechodzi po podpięciu zapisu w rogu

#### Manual Verification:

- Zosia z rakietą, pasek rakieta: dinozaur w rogu i „Zapisz” zostawiają dinozaura w profilu i na pasku, a odświeżenie znowu daje dinozaura
- Pasek najpierw samochodzik, potem „Zapisz” dinozaura: pasek zostaje samochodzik, odświeżenie daje dinozaura, a `printo-kids:last-used` się nie zmienia
- „Zapisz” jest nieaktywny, gdy w rogu wskazana jest już rakieta; zamknięcie okna po wskazaniu dinozaura bez „Zapisz” zostawia w profilu rakietę i nie rusza paska
- Druk jednej strony A4 nie pokazuje rogu ani „Zapisz”

**Implementation Note**: Po zielonym `npm test` i `npm run lint` zatrzymaj się na ręczne sprawdzenie czterech punktów powyżej, zanim ruszy faza 3.

---

## Phase 3: Usunięcie i przełączenie

### Overview

Każde imię da się usunąć po potwierdzeniu. Przejście na inne dziecko przy niezapisanym szkicu pyta, czy zapisać ulubioną.

### Changes Required:

#### 1. Blokada Generuj po zmianie listy

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Po usunięciu ostatniego dziecka karta ma dać się wygenerować, także gdy wizyta zaczęła się od pytania o imię.

**Contract**: Generuj jest `disabled` dokładnie wtedy, gdy `profiles.length >= 2` i `activeId === null`. Start wizyty przy dwóch i więcej nadal otwiera menu od pierwszego malowania przez `openingVisit`.

#### 2. „Usuń” i ostrzeżenie przy innym imieniu

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Rodzic kasuje wskazane dziecko bez stawania się nim i nie gubi szkicu ulubionej przez przypadek przy zmianie dziecka.

**Contract**: Przy dwóch i więcej każde imię z `sortProfiles` ma „Usuń”, które nie woła wyboru dziecka. Przy jednym dziecku „Usuń” jest w menu tego dziecka. „Usuń” otwiera w tym samym oknie tekst „Usunąć profil {imię}?” oraz „Usuń” i „Anuluj”. Anuluj i zamknięcie tego widoku wracają do menu bez zapisu. Potwierdzenie liczy `visitAfterDelete` z aktualnym `readLastUsed()` jako `lastUsed`, potem `writeChildProfiles` na zwróconej liście. Przy `false` lista, aktywny, pasek i szkic zostają, a tekst to „Nie udało się zapisać profilu”. Przy sukcesie ekran bierze zwróconego aktywnego, postać i `ask`. Okno zostaje na menu, gdy ktoś jeszcze jest na liście. Po usunięciu ostatniego profilu okno się zamyka. Kolejny klik rogu otwiera formularz, jak przy pustym magazynie.

Klik innego imienia, gdy jest aktywne dziecko i szkic różni się od jego zapisanej ulubionej, nie przełącza od razu. Widok pokazuje „Zapisz i przełącz” oraz „Przełącz bez zapisu”. „Przełącz bez zapisu” ustawia kliknięte dziecko i jego zapisaną ulubioną na pasku, szkic znika, profil poprzedniego dziecka zostaje. „Zapisz i przełącz” najpierw zapisuje szkic przez `withFavorite` i `writeChildProfiles`. Przy `false` zostaje poprzednie dziecko, szkic i tekst „Nie udało się zapisać profilu”, bez przełączenia. Przy sukcesie włącza kliknięte dziecko i ustawia pasek na jego zapisaną ulubioną. Klik innego imienia przy szkicu równym zapisanej ulubionej przełącza od razu, jak dziś. Klik już aktywnego imienia też zostaje przy dzisiejszym wyborze, bez ostrzeżenia.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi po podpięciu usunięcia i ostrzeżenia
- `npm run lint` przechodzi po podpięciu usunięcia i ostrzeżenia

#### Manual Verification:

- Przy aktywnej Zosi usunięcie Basi po potwierdzeniu zostawia Zosię i pasek, a Anuluj przy innym imieniu nic nie kasuje
- Usunięcie aktywnej Zosi: sam Antek staje się aktywny i Generuj działa; przy dwójce zostającej róg to „Profil”, pasek to postać bez profilu i Generuj czeka; po ostatnim profilu róg to „Profil”, pasek to postać bez profilu i Generuj działa
- Dinozaur w rogu bez „Zapisz”, potem klik Antka: widać „Zapisz i przełącz” oraz „Przełącz bez zapisu”; pierwsze zapisuje dinozaura u Zosi i włącza Antka, drugie zostawia Zosi rakietę i włącza Antka; bez zmiany w rogu klik Antka przełącza od razu
- Druk jednej strony A4 nie pokazuje „Usuń” ani ostrzeżenia o przełączeniu

**Implementation Note**: Po zielonym `npm test` i `npm run lint` zatrzymaj się na ręczne przejście czterech punktów, w tym druk jednej strony.

---

## Testing Strategy

### Unit Tests:

- `withFavorite` zmienia postać jednego id i odrzuca złe id oraz postać spoza zestawu.
- `barAfterFavoriteSave` podmienia pasek tylko wtedy, gdy nadal pokazuje poprzednią ulubioną.
- `visitAfterDelete` dla aktywnego, dla innego dziecka, dla pustej listy i dla braku aktywnego przy trójce oraz dwójce.

### Integration Tests:

- Brak osobnego runnera UI. Zapis, usunięcie, ostrzeżenie i druk zostają w sprawdzianie ręcznym faz 2 i 3.

### Manual Testing Steps:

1. Przy Zosi z rakietą zapisz dinozaura z rogu i odśwież stronę.
2. Ustaw na pasku samochodzik, zapisz w rogu dinozaura i sprawdź w narzędziach przeglądarki, że `printo-kids:last-used` nie przyjął dinozaura. Odśwież i sprawdź, że wraca dinozaur.
3. Wskaż dinozaura w rogu, zamknij okno bez „Zapisz” i sprawdź, że profil oraz pasek zostały.
4. Przy Zosi, Antku i Basi usuń Basię. Potem usuń aktywną Zosię przy samym Antku. Osobno doprowadź do dwóch pozostałych i do zera profili.
5. Przy brudnym szkicu Zosi sprawdź oba przyciski ostrzeżenia, a przy czystym szkicu sprawdź przełączenie bez ostrzeżenia.
6. Wydrukuj kartę i sprawdź jedną stronę A4 bez rogu, „Zapisz”, „Usuń” i ostrzeżenia.

## Performance Considerations

Lista profili dotyczy jednego gospodarstwa na jednym urządzeniu. Przepisanie tablicy przy zapisie i usunięciu nie wymaga pamięci podręcznej.

## Migration Notes

Istniejące wpisy `{id, name, character}` zostają. Brak klucza `printo-kids:child-profiles` nadal oznacza brak profili. `printo-kids:last-used` nie jest przepisywany na profil ani ruszany przy zapisie ulubionej, gdy ktoś jest aktywny.

## References

- Moduł profili: `src/lib/child-profiles.ts`
- Róg i pasek: `src/components/WorksheetGenerator.tsx`
- Poprzedni plasterek: `context/archive/2026-10-06-child-profile-create-select/plan.md`
- Wymagania: `context/foundation/prd.md` (FR-009, FR-010)
- Plasterek: `context/foundation/roadmap.md` (S-06)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Kontrakt zapisu i usunięcia

#### Automated

- [x] 1.1 `npm test` obejmuje zapis dinozaura u Zosi bez zmiany imienia i bez ruszenia Antka, odmowę nieznanego id i postaci spoza zestawu, przejście paska z rakiety na dinozaura, zostawienie paska samochodzik, zostawienie aktywnej Zosi po usunięciu Basi, włączenie Antka po usunięciu aktywnej Zosi, pytanie i postać bez profilu gdy po usunięciu aktywnego zostaje dwoje, powrót do postaci bez profilu po usunięciu ostatniego oraz pytanie albo włączenie jedynego, gdy nikt nie był aktywny — dbf06bc
- [x] 1.2 `npm run lint` przechodzi — dbf06bc

### Phase 2: Zapis ulubionej w rogu

#### Automated

- [ ] 2.1 `npm test` przechodzi po podpięciu zapisu w rogu
- [ ] 2.2 `npm run lint` przechodzi po podpięciu zapisu w rogu

#### Manual

- [ ] 2.3 Zosia z rakietą, pasek rakieta: dinozaur w rogu i „Zapisz” zostawiają dinozaura w profilu i na pasku, a odświeżenie znowu daje dinozaura
- [ ] 2.4 Pasek najpierw samochodzik, potem „Zapisz” dinozaura: pasek zostaje samochodzik, odświeżenie daje dinozaura, a `printo-kids:last-used` się nie zmienia
- [ ] 2.5 „Zapisz” jest nieaktywny, gdy w rogu wskazana jest już rakieta; zamknięcie okna po wskazaniu dinozaura bez „Zapisz” zostawia w profilu rakietę i nie rusza paska
- [ ] 2.6 Druk jednej strony A4 nie pokazuje rogu ani „Zapisz”

### Phase 3: Usunięcie i przełączenie

#### Automated

- [ ] 3.1 `npm test` przechodzi po podpięciu usunięcia i ostrzeżenia
- [ ] 3.2 `npm run lint` przechodzi po podpięciu usunięcia i ostrzeżenia

#### Manual

- [ ] 3.3 Przy aktywnej Zosi usunięcie Basi po potwierdzeniu zostawia Zosię i pasek, a Anuluj przy innym imieniu nic nie kasuje
- [ ] 3.4 Usunięcie aktywnej Zosi: sam Antek staje się aktywny i Generuj działa; przy dwójce zostającej róg to „Profil”, pasek to postać bez profilu i Generuj czeka; po ostatnim profilu róg to „Profil”, pasek to postać bez profilu i Generuj działa
- [ ] 3.5 Dinozaur w rogu bez „Zapisz”, potem klik Antka: widać „Zapisz i przełącz” oraz „Przełącz bez zapisu”; pierwsze zapisuje dinozaura u Zosi i włącza Antka, drugie zostawia Zosi rakietę i włącza Antka; bez zmiany w rogu klik Antka przełącza od razu
- [ ] 3.6 Druk jednej strony A4 nie pokazuje „Usuń” ani ostrzeżenia o przełączeniu
