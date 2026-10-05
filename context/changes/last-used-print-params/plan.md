# Last-used character Implementation Plan

## Overview

Rodzic bez profilu dziecka wraca na stronę i widzi w istniejącej kontrolce ostatnio wybraną postać, w tym „Bez postaci”. Może ją zmienić przed Generuj. Zapis powstaje w chwili kliknięcia wiersza w oknie i zostaje na urządzeniu.

## Current State Analysis

Kontrolka na `/` ma cztery wiersze: „Bez postaci” (`none`), Samochodzik, Rakieta, Dinozaur. Stan startowy to `none` (`src/components/WorksheetGenerator.tsx` około linii 15–20 i 34). Zamknięty przycisk czyta się „Postać: …”. Kliknięcie wiersza ustawia wybór i zamyka okno. Jeśli karta jest już na stronie, obrazek albo słowo Start zmienia się od razu, bez drugiego Generuj.

W `src/` nie ma `localStorage`. Odświeżenie zawsze wraca do „Bez postaci”. S-03 zostawiło pamięć świadomie na ten plasterek. FR-006 wymaga widocznej, edytowalnej wartości domyślnej. PRD trzyma ostatnie parametry na urządzeniu między wizytami, do czasu wyczyszczenia danych przeglądarki. Poziom trudności i profile dzieci są osobnymi plasterkami.

Wyspa jest `client:load` (`src/components/WorksheetHome.astro` linia 16). Serwer wyrenderuje więc pierwszą etykietę zanim przeglądarka odczyta magazyn. `npm test` uruchamia wyłącznie pliki wpisane w `package.json`.

## Desired End State

Po wejściu na `/` kontrolka od razu pokazuje zapamiętany wybór. Brak klucza, pusty zapis, zły JSON i identyfikator spoza zestawu dają „Postać: Bez postaci”. Wybór Rakiety, zamknięcie karty bez Generuj i ponowne wejście dają „Postać: Rakieta”. Wygenerowanie Dinozaura, zmiana na Rakietę i odświeżenie dają Rakietę. Wybór „Bez postaci” po nazwanej postaci i odświeżenie dają „Bez postaci” oraz Start po Generuj. Na stronie nie ma dodatkowego zdania. Druk nadal jest jedną stroną A4, a kontrolka wyboru się nie drukuje.

### Key Discoveries:

- Wybór postaci jest stanem wyspy, niezależnym od `generateMaze`. Karta podąża za wyborem natychmiast (`src/components/WorksheetGenerator.tsx`).
- Testy to `node --test` na jawnej liście plików (`package.json` skrypt `test`). Nowy plik testu trzeba dopisać do tej listy.
- Katalog postaci zostaje w komponencie. Moduł pamięci dostaje dozwolone identyfikatory z zewnątrz, żeby test nie importował Reacta.

## What We're NOT Doing

- Poziomy trudności. Zapis ma tylko pole `character`; późniejszy plasterek może dołożyć poziom do tego samego obiektu.
- Profile dzieci, selektor profilu i zapis ulubionej postaci profilu.
- Dopisek „z ostatniej karty”, osobny wiersz „użyj ostatniej” i pytanie, zanim „Bez postaci” nadpisze nazwaną postać.
- Przycisk czyszczenia pamięci w aplikacji. Nowy wybór zastępuje poprzedni. Wyczyszczenie danych przeglądarki wraca do „Bez postaci”.
- Zapis labiryntu, zmiana katalogu postaci, geometrii karty i `window.print()`.

## Implementation Approach

Czysty moduł w `src/lib/last-used.ts` czyta i zapisuje jeden obiekt JSON pod kluczem `printo-kids:last-used`. Pole to `character`. Dozwolone wartości to `none`, `samochodzik`, `rakieta`, `dinozaur`. Odczyt nieznanej wartości zwraca `none` i niczego nie zapisuje. Zapis przyjmuje identyfikator z zestawu, w tym `none`, i połyka błąd magazynu.

Faza 1 dowozi ten kontrakt i testy na podręczonym magazynie. Faza 2 podpina go pod istniejące kliknięcie wiersza i czyta go w inicjalizatorze stanu wyspy. Wyspa przechodzi na `client:only="react"`, żeby pierwsza etykieta kontrolki była wartością z magazynu. Nagłówek i wstęp strony zostają w HTML z serwera.

## Critical Implementation Details

- **Timing & lifecycle** — Odczyt ma być w leniwym inicjalizatorze `useState`, nie w efekcie po pierwszym malowaniu. Efekt najpierw pokazałby „Bez postaci”, a dopiero potem zapamiętaną postać. `client:load` renderuje ten zły start jeszcze na serwerze, więc dyrektywa wyspy to `client:only="react"`.
- **State sequencing** — Kliknięcie wiersza aktualizuje wybór na ekranie także wtedy, gdy `setItem` rzuci. Błąd magazynu dotyczy tylko następnej wizyty.

## Phase 1: Kontrakt ostatniego wyboru

### Overview

Moduł pamięci i testy reguł odczytu oraz zapisu, bez zmiany ekranu.

### Changes Required:

#### 1. Moduł ostatniego wyboru

**File**: `src/lib/last-used.ts`

**Intent**: Trzyma regułę FR-006 dla samej postaci, zanim dotknie jej kontrolka. Późniejszy plasterek profili ma dostać osobny klucz, a ten obiekt ma mieć gdzie dołożyć poziom trudności.

**Contract**: Klucz `printo-kids:last-used`. Zapisana wartość to JSON `{"character":"<id>"}`. `readLastUsed(storage, allowed)` zwraca identyfikator z listy `allowed`. Wynik to `none`, gdy `getItem` zwróci `null`, pusty string, tekst niebędący obiektem JSON (w tym goły string `"rakieta"`), albo pole `character` nie jest stringiem z `allowed`. `none` jest w `allowed` i jest legalnym odczytem. Odczyt nie wywołuje `setItem`. `writeLastUsed(storage, character)` zapisuje obiekt z tym polem. Wyjątek z `getItem` albo `setItem` nie wychodzi z funkcji: odczyt zwraca `none`, zapis kończy się po cichu. `storage` to podręczany obiekt z `getItem` / `setItem`, nie globalny `localStorage` wprost w teście.

#### 2. Rejestr testu

**File**: `package.json`

**Intent**: `npm test` ma uruchamiać nowy plik razem z istniejącymi testami labiryntu i karty.

**Contract**: Skrypt `test` dostaje `src/lib/last-used.test.ts` obok obecnych trzech plików. Pozostałe skrypty bez zmian.

#### 3. Testy kontraktu

**File**: `src/lib/last-used.test.ts`

**Intent**: Ustala widoczne wyniki z wywiadu na podręczonym magazynie, zanim powstanie ekran.

**Contract**: Przypadki odczytu, przy `allowed` równym czterem identyfikatorom z kontrolki: brak klucza, `""`, zły JSON, goły string `"rakieta"`, `{"character":"smok"}`, `{"character":"none"}`, `{"character":"samochodzik"}`, `{"character":"rakieta"}`, `{"character":"dinozaur"}`. Osobno: `getItem` i `setItem`, które rzucają, nie przerywają wywołania; po rzucającym `setItem` funkcja zapisu wraca normalnie. Zapis `none` i zapis `rakieta` dają przy kolejnym odczycie tę samą wartość. Styl testu jak w `src/lib/sheet/layout.test.ts` (`node:test`).

### Success Criteria:

#### Automated Verification:

- `npm test` akceptuje brak klucza, pusty string, zły JSON, goły string `rakieta`, identyfikator spoza zestawu, `none`, `samochodzik`, `rakieta` i `dinozaur`, a rzucający magazyn nie przerywa odczytu ani zapisu
- `npm run lint` przechodzi

**Implementation Note**: Ta faza nie ma sprawdzianu ręcznego. Po zielonym `npm test` i `npm run lint` można przejść do fazy 2.

---

## Phase 2: Kontrolka czyta i zapisuje postać

### Overview

Istniejąca kontrolka startuje z magazynu i zapisuje każdy wybór wiersza. Ekran nie dostaje nowego zdania ani nowego przycisku.

### Changes Required:

#### 1. Start wyspy po stronie przeglądarki

**File**: `src/components/WorksheetHome.astro`

**Intent**: Pierwsza etykieta „Postać:” ma być wartością z magazynu, a nie serwerowym „Bez postaci”.

**Contract**: `WorksheetGenerator` dostaje `client:only="react"`. Reszta `WorksheetHome.astro`, łącznie z `@page` i regułami druku, zostaje.

#### 2. Odczyt i zapis w kontrolce

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Spełnia FR-006 tą samą kontrolką. Rodzic widzi zapamiętany wybór przed Generuj i zmienia go tym samym oknem.

**Contract**: Stan `character` startuje z `readLastUsed` na `localStorage` i listy identyfikatorów `CHARACTER_CHOICES`. Kliknięcie wiersza, które dziś woła `onSelect(option.id)`, dodatkowo woła `writeLastUsed` z tym samym identyfikatorem, także dla `none`. Generuj i Drukuj nie zapisują. Zły odczyt zostaje przy `none` do następnego kliknięcia. Etykieta, `aria-label`, okno, katalog i rysunek karty zostają. Brak dopisku pod kontrolką.

### Success Criteria:

#### Automated Verification:

- `npm run lint` przechodzi po podpięciu kontrolki
- `npm test` przechodzi po podpięciu kontrolki

#### Manual Verification:

- Świeża wizyta pokazuje „Postać: Bez postaci”, a Generuj rysuje Start
- Wybór Rakiety i odświeżenie bez Generuj pokazuje „Postać: Rakieta” przed Generuj, bez dodatkowego zdania
- Po wygenerowaniu Dinozaura zmiana na Rakietę i odświeżenie przywraca Rakietę bez drugiego Generuj
- Wybór „Bez postaci” i odświeżenie przywraca „Bez postaci” oraz Start
- Identyfikator spoza zestawu w magazynie po odświeżeniu daje „Bez postaci”, a Generuj nadal działa
- Druk nadal chowa kontrolkę wyboru i daje jedną stronę A4

**Implementation Note**: Po zielonym lincie i testach zatrzymaj się na ręcznym przejściu kroków z Manual Verification, zanim plasterek zostanie uznany za skończony.

---

## Testing Strategy

### Unit Tests:

- Odczyt: brak klucza, pusty string, zły JSON, goły identyfikator, nieznany identyfikator, `none` i trzy nazwane postaci.
- Zapis i ponowny odczyt dla `none` i `rakieta`.
- `getItem` i `setItem`, które rzucają, nie wychodzą do wołającego.

### Integration Tests:

- Brak testu przeglądarkowego w tym repo. Przepływ wizyty zostaje w sprawdzianie ręcznym.

### Manual Testing Steps:

1. Wyczyść dane strony dla lokalnego dev. Wejdź na `/`. Potwierdź „Postać: Bez postaci”. Kliknij Generuj i potwierdź Start na karcie.
2. Wybierz Rakietę. Odśwież bez Generuj. Potwierdź „Postać: Rakieta” i brak dodatkowego zdania. Kliknij Generuj i potwierdź rakietę przy starcie.
3. Wygeneruj kartę, wybierz Dinozaura, potem Rakietę, bez drugiego Generuj. Odśwież. Potwierdź Rakietę.
4. Wybierz „Bez postaci”. Odśwież. Potwierdź „Postać: Bez postaci”. Generuj pokazuje Start.
5. W devtools ustaw `printo-kids:last-used` na `{"character":"smok"}`. Odśwież. Potwierdź „Bez postaci” i działający Generuj.
6. Wydrukuj kartę. Potwierdź jedną stronę A4 i brak kontrolki wyboru na wydruku.

## Performance Considerations

Jeden odczyt przy starcie wyspy i jeden zapis na kliknięcie wiersza. Brak sieci i brak pracy przy Generuj.

## Migration Notes

Istniejącego klucza nie ma. Pierwsza wizyta po wdrożeniu jest jak brak zapisu i startuje od „Bez postaci”. Zły kształt zostawiamy w magazynie do następnego wyboru; odczyt i tak pokazuje „Bez postaci”.

## References

- FR-006 i trwałość na urządzeniu: `context/foundation/prd.md`
- Plasterek S-04: `context/foundation/roadmap.md`
- Kontrolka i katalog: `src/components/WorksheetGenerator.tsx`
- Dyrektywa wyspy: `src/components/WorksheetHome.astro`
- S-03 zostawiło pamięć na S-04: `context/archive/2026-10-04-maze-character-choice/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Kontrakt ostatniego wyboru

#### Automated

- [x] 1.1 `npm test` akceptuje brak klucza, pusty string, zły JSON, goły string `rakieta`, identyfikator spoza zestawu, `none`, `samochodzik`, `rakieta` i `dinozaur`, a rzucający magazyn nie przerywa odczytu ani zapisu
- [x] 1.2 `npm run lint` przechodzi

### Phase 2: Kontrolka czyta i zapisuje postać

#### Automated

- [ ] 2.1 `npm run lint` przechodzi po podpięciu kontrolki
- [ ] 2.2 `npm test` przechodzi po podpięciu kontrolki

#### Manual

- [ ] 2.3 Świeża wizyta pokazuje „Postać: Bez postaci”, a Generuj rysuje Start
- [ ] 2.4 Wybór Rakiety i odświeżenie bez Generuj pokazuje „Postać: Rakieta” przed Generuj, bez dodatkowego zdania
- [ ] 2.5 Po wygenerowaniu Dinozaura zmiana na Rakietę i odświeżenie przywraca Rakietę bez drugiego Generuj
- [ ] 2.6 Wybór „Bez postaci” i odświeżenie przywraca „Bez postaci” oraz Start
- [ ] 2.7 Identyfikator spoza zestawu w magazynie po odświeżeniu daje „Bez postaci”, a Generuj nadal działa
- [ ] 2.8 Druk nadal chowa kontrolkę wyboru i daje jedną stronę A4
