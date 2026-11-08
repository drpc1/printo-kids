# Refactor ustawień kart i profilu: jedna ścieżka zapisu, komunikat o porażce, strażnik rejestru

## Overview

Zamieniamy wyniki eksploracji (`research.md`, K1 i pierwszy krok K2) w cztery małe, odwracalne fazy. Zapisy listy profili przechodzą przez jedną funkcję w `src/lib`, która czyta świeżo, przekształca, zapisuje i zwraca wynik. To naprawia TD-1 (usunięcie i utworzenie profilu zapisują ze stanu Reacta, więc stara zakładka może cofnąć zmianę z innej) i usuwa podwójną implementację ulubionej postaci. Porażka zapisu ustawień karty staje się widoczna na pasku. Do tego strażnik rejestru kart i naprawa skryptu `npm test`. Format danych na dysku się nie zmienia.

## Current State Analysis

- `writeChildProfiles` jest wołane w 5 miejscach nietestowego kodu. Trzy czytają profile tuż przed zapisem (`useCardSettings.ts:79→85`, `useFavoriteCharacter.ts:31→38`, `ProfileCorner.tsx:244→255`), dwa zapisują listę ze stanu (`ProfileCorner.tsx:187` usuwanie, `:300` tworzenie).
- `saveFavorite` (`ProfileCorner.tsx:237-262`) i `useFavoriteCharacter.save` (`:26-44`) to dwie niezależne implementacje „odczyt → `withFavorite` → zapis”.
- `useCardSettings.persist` (`useCardSettings.ts:71-89`) cicho pomija zapis, gdy profil zniknął, i ignoruje wynik `writeChildProfiles` oraz `writeLastUsedCards` (`:75`). Notatka „Zapamiętane dla” (`useRememberNote`, `RememberedNote.tsx`) ma stałą wysokość wiersza przy aktywnym profilu, więc nie przesuwa układu.
- `writeLastUsed` (`last-used.ts:38`) zwraca `void`, zachowuje `cards` i przenosi stary `level` do `cards`, ale nie zachowuje nieznanych pól. `writeLastUsedCards` (`:52`) zachowuje wszystkie pola i kasuje `level`. Jedyny wołający `writeLastUsed` to `recordBarCharacter` (`own-image-store.ts:91`). Historia (`git log --follow`): 4 commity, żaden `fix`; plan `card-settings-memory/plan.md:80` świadomie zostawił ten podział.
- `summaryParts` (`card-summary.ts:52-108`) ma `default: return null`, więc karta bez wpisu cicho zostaje bez odznaki. `card-summary.test.ts` mapuje `CARD_KINDS`, więc tego nie łapie.
- `package.json:12` (skrypt `test`) wymienia `src/lib/last-used.test.ts` dwa razy. Sklejony token z `analytics.test.ts` naprawiło już #280 (`790c4c5`), a `src/lib/test-script.test.ts` pilnuje, że skrypt wymienia wszystkie istniejące testy; duplikatu nie wykrywa.
- W repo nie ma testów hooków ani komponentów (brak jsdom/testing-library, brak `*.test.tsx`). `npm test` obejmuje tylko `src/lib` i 3 skrypty, więc logika ma zostać w czystych funkcjach `lib`; zachowanie UI sprawdza e2e.

## Desired End State

- Każda zmiana listy profili (usunięcie, utworzenie, ulubiona, ustawienia karty) przechodzi przez `updateProfiles` w `src/lib/child-profiles.ts`. Lista, która trafia na dysk, pochodzi ze świeżego odczytu, więc zmiana z innej otwartej strony nie jest cofana.
- Gdy przy aktywnym profilu zapis ustawień karty się nie uda (kwota, zablokowany storage, profil zniknął w innej zakładce), pasek pokazuje krótki komunikat w tym samym wierszu co „Zapamiętane dla {imię}”. Układ strony się nie przesuwa.
- Dodanie karty z `CARD_KINDS` bez wpisu w `summaryParts` łamie test. `npm test` uruchamia wszystkie pliki, w tym `analytics.test.ts`.
- Obie funkcje zapisu `last-used` zwracają `boolean`, a test dokumentuje różnicę w obsłudze nieznanych pól.

### Key Discoveries:

- Czyste transformacje (`withFavorite`, `withProfileCards`, `profileToCreate`, `visitAfterDelete`) już istnieją; brakuje tylko funkcji składającej „świeży odczyt → transformacja → zapis → wynik” (`research.md`, K1).
- `RememberedNote` renderuje `<p role="status">` o stałej wysokości `h-5` tylko przy aktywnym profilu (`RememberedNote.tsx:7`); komunikat błędu mieści się w nim bez zmiany układu.
- Wszystkie 7 generatorów podaje `note={memory.note ?? favorite.note}` (`DictationGenerator.tsx:116` i sześć pozostałych). Jeśli oba hooki zwrócą ten sam typ obiektu, generatory nie wymagają zmian.
- `tests/e2e/card-settings.spec.ts:146, 192, 313` asertują `getByRole("status")` z tekstem „Zapamiętane dla Ola”; ten kontrakt tekstu zostaje.

## What We're NOT Doing

- K3 (labirynt na `useCardPage`): odroczone decyzją użytkownika. Różnice labiryntu (`newProfileCards`, `LevelChoiceControl`, brak `waitingForChild` przy poziomie) zostają nietknięte.
- Scalenie dwóch writerów `last-used` w jedną funkcję: tylko test pinujący i wynik `boolean` (brak błędu w historii, jeden wołający, dziś nie ma nieznanych pól).
- Wywodzenie `CARD_SETTINGS_IDS`, `DEFAULTS`, `levelIds`, `summaryParts` z jednej definicji (dalsze kroki K2), iteracja po rejestrze w `print-contract.test.ts` i miniaturach.
- K4 (migracja starego `level`), nasłuch `storage` na stronach kart (TD-8a), wspólny licznik notatki (TD-9), rozbicie `ProfileCorner.tsx`.
- Reguła ESLint `no-restricted-globals` dla `localStorage` w `src/components` i `src/hooks`.
- Widoczny komunikat o porażce zapisu `last-used` bez aktywnego profilu: wiersz notatki nie istnieje bez profilu, a nowy przesunąłby układ, więc ta porażka zostaje cicha.
- Nowa zależność testowa (jsdom, testing-library).
- Wspólna notatka dla `useCardSettings` i `useFavoriteCharacter` (TD-9): generatory składają `memory.note ?? favorite.note`, więc błąd zapisu ulubionej bywa niewidoczny, gdy w tym samym czasie świeci „Zapamiętane dla”. Znane ograniczenie, wąskie okno czasowe.

## Implementation Approach

Plan powstał 2026-11-03; od tego czasu `main` poszedł do przodu (m.in. gh283, zmiany w `CardPage.tsx`). Implementuj z nowej gałęzi od aktualnego `origin/main` i przed fazą 4 sprawdź `CardPage.tsx` i `RememberedNote.tsx`. Fazy rosną od najtańszych i niezależnych do tych, które zmieniają zachowanie. Faza 1 jest niezależna od reszty i uruchamia pełne CI (zmiana `package.json`). Faza 2 dodaje funkcję obok starych, bez wołających. Faza 3 przepina wołających od najbardziej błędnych (`ProfileCorner` usuwanie/tworzenie) do tych, które już czytają świeżo. Faza 4 dopiero na gotowym wyniku `{ok}` dokłada widoczny komunikat. Każda faza to osobny commit. Fazy 2→3→4 zależą od siebie po kolei.

## Phase 1: Skrypt testów i strażniki

### Overview

Usuwa zdublowany wpis w skrypcie `test`, dodaje strażnika rejestru kart i pinuje zachowanie obu writerów `last-used`. Bez zmian zachowania aplikacji.

### Changes Required:

#### 1. Skrypt `test`

**File**: `package.json`

**Intent**: Usunąć zdublowany wpis `src/lib/last-used.test.ts`, żeby ten plik uruchamiał się raz; uruchomić `npm test` lokalnie przed wypchnięciem.

**Contract**: `scripts.test` zawiera `src/lib/last-used.test.ts` dokładnie raz i nadal wymienia `src/lib/analytics.test.ts` jako osobną ścieżkę. Żadnego innego pliku testowego nie dodajemy ani nie usuwamy.

#### 2. Strażnik `summaryParts`

**File**: `src/lib/card-summary.test.ts`

**Intent**: Wykryć kartę z `CARD_KINDS`, której brakuje wpisu w `summaryParts` (dziś `default: return null` ukrywa to).

**Contract**: Dla każdego `id` z `CARD_KINDS` profil z zapisanymi ustawieniami tej karty daje `used: true` w `cardSummaries`. Ustawienia każdej karty pochodzą z mapy fixture'ów w samym teście (wartości z `DEFAULTS` w `card-settings.ts` albo jawne); `id` z `CARD_KINDS` bez fixture'a łamie test z czytelnym komunikatem, więc nowa karta wymaga wpisu w obu miejscach. Test nie zależy od liczby kart.

#### 3. Writery `last-used`

**File**: `src/lib/last-used.ts`, `src/lib/last-used.test.ts`

**Intent**: Pokazać wynik zapisu postaci i udokumentować różnicę między writerami testem; nie scalać ich.

**Contract**: `writeLastUsed(storage, { character }): boolean` (`true` po zapisie, `false` po wyjątku storage); `recordBarCharacter` zostaje `void`. Testy pinują: `writeLastUsed` zachowuje `cards` i przenosi stary `level`, ale gubi nieznane pole; `writeLastUsedCards` zachowuje nieznane pole i kasuje `level`; oba zwracają `false` na storage rzucającym wyjątek. Istniejące testy `last-used.test.ts:143, :158, :209` zostają zielone.

### Success Criteria:

#### Automated Verification:

- Wszystkie testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Zależności bez naruszeń: `npm run depcruise`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`

**Implementation Note**: Po fazie i zielonych testach automatycznych zatrzymaj się na potwierdzenie człowieka przed fazą 2. Odpowiadające pola `- [ ]` są w sekcji `## Progress`.

---

## Phase 2: `updateProfiles` w `lib`

### Overview

Dodaje jedną funkcję zapisu listy profili obok istniejących, bez wołających w UI. Cała logika jest testowalna na `memoryStorage`.

### Changes Required:

#### 1. Funkcja zapisu

**File**: `src/lib/child-profiles.ts`

**Intent**: Złożyć „świeży odczyt → transformacja → zapis → wynik” w jednym miejscu, żeby żaden wołający nie składał tego ręcznie ani nie zapisywał listy ze stanu.

**Contract**: `updateProfiles(storage, allowedCharacters, transform): UpdateResult`. `transform(stored: ChildProfile[]) => ChildProfile[] | null` jest czystą funkcją (np. wrapper na `withFavorite`, `withProfileCards`); `null` oznacza, że zmiany nie da się zastosować (profil zniknął, nazwa zajęta). `UpdateResult = { ok: true; before: ChildProfile[]; profiles: ChildProfile[] } | { ok: false; reason: "unavailable" | "write-failed" }` (`before` to świeża lista odczytana tuż przed transformacją, dla wołających, którzy z niej liczą wynik pochodny, np. `visitAfterDelete` albo wczesne wyjście w `saveFavorite`); `"unavailable"` gdy `transform` zwróciło `null`, `"write-failed"` gdy `writeChildProfiles` zwróciło `false` albo storage rzucił wyjątek. Funkcja nie rzuca. Format danych na dysku bez zmian.

#### 2. Testy

**File**: `src/lib/child-profiles.test.ts`

**Intent**: Pokryć scenariusze, których UI nie da się przetestować jednostkowo.

**Contract**: Na `memoryStorage`: profil znika między odczytem a zapisem (`unavailable`, dysk bez zmian); storage rzuca wyjątek przy `setItem` (`write-failed`); dwa kolejne `updateProfiles` nie gubią się nawzajem (drugi widzi wynik pierwszego); `transform` dostaje świeżą listę, nie tę z wcześniejszego odczytu; `before` w wyniku to ta sama lista, którą dostał `transform`.

### Success Criteria:

#### Automated Verification:

- Nowe i dotychczasowe testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Zależności bez naruszeń: `npm run depcruise`
- Typy przechodzą: `npx astro check`

**Implementation Note**: Po fazie i zielonych testach zatrzymaj się na potwierdzenie przed fazą 3.

---

## Phase 3: Przepięcie wołających

### Overview

Wszystkie pięć zapisów listy profili idzie przez `updateProfiles`. Pierwsze dwa to naprawa TD-1, reszta usuwa zdublowaną implementację.

### Changes Required:

#### 1. e2e dwóch zakładek (najpierw, przed edycją kodu)

**File**: `tests/e2e/card-settings.spec.ts` (albo `profile-summary.spec.ts`, zależnie od istniejącego helpera menu profilu)

**Intent**: Test chroniący TD-1 przed regresją, napisany i uruchomiony na kodzie sprzed przepięcia, żeby dowieść, że łapie błąd.

**Contract**: Dwie strony w jednym kontekście przeglądarki. Strona A ładuje się z profilem Ola. Zapis profilu Ania do `localStorage` z drugiej strony (symulacja drugiej zakładki; strony kart nie nasłuchują `storage`). Strona A usuwa Olę przez okno profilu. Po usunięciu `localStorage` nadal zawiera Anię. Kolejność w fazie: najpierw ten test i jego czerwone uruchomienie na niezmienionym `ProfileCorner.tsx` (wynik zapisujemy w raporcie fazy), dopiero potem punkty 2–4.

#### 2. Usuwanie i tworzenie profilu (naprawa TD-1)

**File**: `src/components/ProfileCorner.tsx`

**Intent**: `confirmDelete` i `handleCreate` przestają zapisywać listę ze stanu `profiles`.

**Contract**: `confirmDelete`: `transform` zwraca `visitAfterDelete(stored, …).profiles` na liście ze świeżego odczytu; po `ok: true` wołający liczy `visitAfterDelete(result.before, …)` z tymi samymi argumentami, żeby dostać `activeId` i resztę dla `onDeleted(next)`. Przed napisaniem kodu potwierdzić, że `visitAfterDelete` jest czysta względem swoich argumentów (wtedy oba wywołania dają ten sam wynik); jeśli nie, wynik wynosimy domknięciem z `transform`. Profil usunięty już w innej zakładce nie jest błędem (usunięcie jest idempotentne). `handleCreate` dopisuje profil do świeżej listy; jeśli wewnątrz `transform` nazwa jest już zajęta w świeżej liście, wynik to `unavailable`, mapowany na istniejący `SAVE_ERROR_TEXT`. Blokady (`deleteLock`, `createLock`) i teksty błędów formularza zostają.

#### 3. Ulubiona postać

**File**: `src/components/ProfileCorner.tsx`, `src/hooks/useFavoriteCharacter.ts`

**Intent**: `saveFavorite` i `useFavoriteCharacter.save` wołają ten sam kod zapisu zamiast dwóch kopii odczyt → `withFavorite` → zapis.

**Contract**: Oba używają `updateProfiles` z `transform` opartym o `withFavorite`. Zachowanie bez zmian: `saveFavorite` dalej wychodzi bez zapisu, gdy wybór równa się obecnej ulubionej (wyjście liczone na świeżej liście, `transform` zwraca wtedy tę samą listę bez zmian, a wołający rozpoznaje to po `before`); `useFavoriteCharacter.save` dalej zwraca `boolean`.

#### 4. Ustawienia karty

**File**: `src/hooks/useCardSettings.ts`

**Intent**: Ścieżka z aktywnym profilem w `persist` używa `updateProfiles` zamiast ręcznego odczytu, zapisu i cichego pominięcia.

**Contract**: `transform` opiera się o `withProfileCards`. Po `ok: true` hook wywołuje `visit.replaceProfiles(profiles)` i `show(name)` jak dziś. Wynik `{ok: false}` jest tu jeszcze ignorowany (komunikat dochodzi w fazie 4). Ścieżka bez profilu (`writeLastUsedCards`) bez zmian.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Zależności bez naruszeń: `npm run depcruise`
- Typy przechodzą: `npx astro check`
- e2e profilu i ustawień kart przechodzi na wolnym porcie: `E2E_PORT=4399 npx playwright test card-settings profile-summary favorite-character --project=chromium`
- Build przechodzi: `npm run build`

#### Manual Verification:

- e2e dwóch zakładek jest czerwony na kodzie sprzed przepięcia i zielony po nim (oba uruchomienia opisane w raporcie fazy)
- Usuwanie i tworzenie profilu, zmiana ulubionej z okna i spod listy postaci działają jak wcześniej
- W drugiej zakładce dodany profil przetrwa usunięcie innego profilu w pierwszej

**Implementation Note**: Po fazie i zielonych testach zatrzymaj się na potwierdzenie przed fazą 4.

---

## Phase 4: Komunikat o porażce zapisu na pasku

### Overview

Wynik `{ok: false}` z `updateProfiles` (i `false` z `useFavoriteCharacter.save`) pokazuje krótki komunikat w istniejącym wierszu notatki, tylko przy aktywnym profilu.

### Changes Required:

#### 1. Typ notatki

**File**: `src/hooks/useCardSettings.ts`, `src/components/RememberedNote.tsx`, `src/components/CardPage.tsx`

**Intent**: Notatka niesie rodzaj (zapamiętane albo błąd), żeby ten sam wiersz mógł pokazać oba bez zmiany generatorów.

**Contract**: `RememberNote = { text: string; tone: "saved" | "error" }`. `useRememberNote` zwraca `{ note: RememberNote | null; show(name); showError() }` z tym samym timerem i czasem widoczności. `RememberedNote` renderuje wiersz o stałej wysokości jak dziś; dla `tone: "error"` używa tokenu `destructive` z `global.css` (bez nowych kolorów, `cn()` do klas). `CardPage` dostaje `note: RememberNote | null`. Siedem generatorów nie wymaga zmian, bo `memory.note ?? favorite.note` zachowuje typ.

#### 2. Wywołanie w hookach

**File**: `src/hooks/useCardSettings.ts`, `src/hooks/useFavoriteCharacter.ts`

**Intent**: Porażka zapisu przy aktywnym profilu kończy się komunikatem zamiast ciszy.

**Contract**: W `persist`, gdy `visit.activeId !== null` i `updateProfiles` zwróciło `ok: false` (oba powody), wołamy `showError()`. W `useFavoriteCharacter.save`, gdy wynik jest `false`, to samo. Tekst: „Nie udało się zapamiętać ustawień” (stała w jednym miejscu). Ścieżka bez profilu zostaje cicha.

#### 3. PRD

**File**: `context/foundation/prd.md`

**Intent**: Nowe zachowanie UI jest decyzją produktową (US-22), więc dostaje zapis w wymaganiach.

**Contract**: W kryteriach akceptacji US-22 jedno zdanie: gdy zapis ustawień do aktywnego profilu się nie uda, w tym samym wierszu co „Zapamiętane dla {imię}” pojawia się krótki komunikat o błędzie, który znika sam i nie zasłania karty ani przycisków; bez profilu komunikatu nie ma.

#### 4. e2e porażki zapisu

**File**: `tests/e2e/card-settings.spec.ts`

**Intent**: Chronić komunikat i brak nakładania na Generuj/Drukuj.

**Contract**: Profil Ola aktywny, strona karty załadowana; w stronie `setItem` dla klucza profili rzuca wyjątek. Zmiana ustawienia na pasku: wiersz `role="status"` pokazuje komunikat błędu, a wysokość wiersza i pozycje Generuj/Drukuj się nie zmieniają (wzorzec testu nakładania z tego samego pliku). Komunikat znika sam.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Zależności bez naruszeń: `npm run depcruise`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- Pełny zestaw e2e na wolnym porcie przechodzi: `E2E_PORT=4399 npx playwright test`
- Smoke przechodzi: `npm run smoke`

#### Manual Verification:

- Na komputerze i na telefonie komunikat błędu nie zasłania karty, Generuj ani Drukuj, i znika sam
- Kolor komunikatu błędu jest czytelny i odróżnia się od „Zapamiętane dla”

---

## Testing Strategy

### Unit Tests:

- `updateProfiles`: profil znika, storage rzuca, kolejne zapisy się nie gubią, `transform` dostaje świeżą listę.
- `writeLastUsed` / `writeLastUsedCards`: różnica w nieznanych polach i `level`, wynik `boolean`.
- `cardSummaries`: każda karta z `CARD_KINDS` daje `used: true` po zapisie ustawień.

### Integration Tests:

- e2e dwóch zakładek (usunięcie nie cofa dodania z drugiej).
- e2e porażki zapisu: komunikat w wierszu notatki, układ bez przesunięcia.
- Istniejące e2e: `card-settings`, `profile-summary`, `favorite-character`, `catalog`.

### Manual Testing Steps:

1. Dwie zakładki z kartą, w jednej dodać profil, w drugiej usunąć inny: oba efekty zostają.
2. Symulować pełny storage (DevTools) i zmienić poziom przy aktywnym profilu: widać komunikat błędu.
3. Telefon: komunikat nie nakłada się na Generuj i Drukuj.

## Performance Considerations

Dodatkowy odczyt `localStorage` przy usuwaniu i tworzeniu profilu (mały JSON). Bez wpływu na limit 5 s generowania.

## Migration Notes

Brak migracji: format danych w `printo-kids:child-profiles` i `printo-kids:last-used` się nie zmienia, więc seedy e2e (≥10 plików) zostają. Odwracalność: każda faza to osobny commit.

## References

- Related research: `context/changes/refactor-opportunities/research.md`
- Źródło długu: `context/changes/profile-settings-flow/research.md`
- Świeży odczyt jako decyzja nośna: `context/archive/2026-10-26-card-settings-memory/plan.md:80, :120`
- Wzorzec testu nakładania: `tests/e2e/card-settings.spec.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Skrypt testów i strażniki

#### Automated

- [ ] 1.1 Wszystkie testy jednostkowe przechodzą: `npm test`
- [ ] 1.2 Lint przechodzi: `npm run lint`
- [ ] 1.3 Zależności bez naruszeń: `npm run depcruise`
- [ ] 1.4 Typy przechodzą: `npx astro check`
- [ ] 1.5 Build przechodzi: `npm run build`

### Phase 2: `updateProfiles` w `lib`

#### Automated

- [ ] 2.1 Nowe i dotychczasowe testy przechodzą: `npm test`
- [ ] 2.2 Lint przechodzi: `npm run lint`
- [ ] 2.3 Zależności bez naruszeń: `npm run depcruise`
- [ ] 2.4 Typy przechodzą: `npx astro check`

### Phase 3: Przepięcie wołających

#### Automated

- [ ] 3.1 Testy jednostkowe przechodzą: `npm test`
- [ ] 3.2 Lint przechodzi: `npm run lint`
- [ ] 3.3 Zależności bez naruszeń: `npm run depcruise`
- [ ] 3.4 Typy przechodzą: `npx astro check`
- [ ] 3.5 e2e profilu i ustawień kart przechodzi na wolnym porcie: `E2E_PORT=4399 npx playwright test card-settings profile-summary favorite-character --project=chromium`
- [ ] 3.6 Build przechodzi: `npm run build`

#### Manual

- [ ] 3.7 e2e dwóch zakładek jest czerwony na kodzie sprzed przepięcia i zielony po nim (oba uruchomienia opisane w raporcie fazy)
- [ ] 3.8 Usuwanie i tworzenie profilu, zmiana ulubionej z okna i spod listy postaci działają jak wcześniej
- [ ] 3.9 W drugiej zakładce dodany profil przetrwa usunięcie innego profilu w pierwszej

### Phase 4: Komunikat o porażce zapisu na pasku

#### Automated

- [ ] 4.1 Testy jednostkowe przechodzą: `npm test`
- [ ] 4.2 Lint przechodzi: `npm run lint`
- [ ] 4.3 Zależności bez naruszeń: `npm run depcruise`
- [ ] 4.4 Typy przechodzą: `npx astro check`
- [ ] 4.5 Build przechodzi: `npm run build`
- [ ] 4.6 Pełny zestaw e2e na wolnym porcie przechodzi: `E2E_PORT=4399 npx playwright test`
- [ ] 4.7 Smoke przechodzi: `npm run smoke`

#### Manual

- [ ] 4.8 Na komputerze i na telefonie komunikat błędu nie zasłania karty, Generuj ani Drukuj, i znika sam
- [ ] 4.9 Kolor komunikatu błędu jest czytelny i odróżnia się od „Zapamiętane dla”
