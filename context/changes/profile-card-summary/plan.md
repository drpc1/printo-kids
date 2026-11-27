# Podsumowanie kart w oknie profilu (S-52) Implementation Plan

## Overview

Okno edycji profilu pokazuje dziś wszystkie 16 kart w wierszach `min-h-11` (ok. 700 px). Po zmianie pokazuje wiersze tylko kart, których profil używa, a pozostałe karty trafiają do jednego zwijanego wiersza „Domyślne (N)” z linkami do ich stron. Zmienia się tylko widok: dane profilu, `cardSummaries` i plakietki katalogu zostają bez zmian.

## Current State Analysis

- `ProfileSummary` (`src/components/ProfileCorner.tsx:574`) mapuje `cardSummaries(profile, today)` na `<li><a>` z tytułem i `detail`; karty nieużywane mają `detail = "domyślne"` w pochyłej, szarej czcionce.
- `CardSummary.used` już istnieje (`src/lib/card-summary.ts:24-34`); labirynt jest zawsze `used`, więc lista użytych ma co najmniej jeden wiersz.
- Kolejność to kolejność katalogu (alfabetyczna po polsku); podział na dwie grupy ją zachowuje, jeśli filtrujemy tę samą tablicę.
- Wzorzec zwijania: natywne `<details>`/`<summary>` z `group` i `ChevronDown` w `src/components/HowItWorksRow.astro:10-20`.
- `tests/e2e/profile-summary.spec.ts` przypina dziś linki wszystkich kart (m.in. „Sekwencje domyślne”, „Dyktando graficzne domyślne”), kolejność alfabetyczną, nawigację przez wiersz Nonogram i zasięg okna (`the edit window keeps the character row reachable…`).
- `src/lib/card-summary.test.ts` jest już w skrypcie `test` w `package.json`.

## Desired End State

Okno edycji profilu ma: zdanie o zasadzie, wiersze użytych kart (tytuł i szczegóły, link do strony karty), pod nimi zwinięty wiersz „Domyślne (N)”, po rozwinięciu linki z samym tytułem do pozostałych kart. Gdy profil używa wszystkich kart, wiersza „Domyślne” nie ma. Okno mieści się na telefonie, wiersz „Postać” jest osiągalny, brak przepełnienia poziomego. Weryfikacja: testy e2e na `chromium`, `phone-360`, `tablet-768` i ręczne sprawdzenie w przeglądarce.

### Key Discoveries:

- `used` w `cardSummaries` wystarcza do podziału, bez zmiany danych (`src/lib/card-summary.ts:36-57`).
- Wzorzec `<details>` jest już w repo (`HowItWorksRow.astro`), bez nowych bibliotek.
- Test e2e „zasięgu” mierzy `getByRole("list")` w oknie; po zmianie są dwie listy, więc selektor trzeba zawęzić.

## What We're NOT Doing

- Nie zmieniamy danych profilu, formatu zapisu ani migracji; stare profile czytają się jak dotąd.
- Nie ruszamy `cardSummaries`, plakietek katalogu (`catalog-badges.ts`), paska kart, listy postaci, strony „Jak to działa” ani innych okien.
- Nie dodajemy grup według umiejętności ani edycji ustawień w oknie (US-08: tylko do odczytu).
- Nie ruszamy S-51 (`test-plan-m7`).

## Implementation Approach

Mała czysta funkcja `splitCardSummaries` dzieli wynik `cardSummaries` na `used` i `defaults` (kolejność katalogu zachowana) i ma test jednostkowy. `ProfileSummary` renderuje wiersze użytych i, gdy `defaults` nie jest puste, `<details>` „Domyślne (N)” z linkami. Wiersze domyślnych nie mają tekstu „domyślne” (ta informacja jest w nazwie grupy). Kolory z tokenów roli, klasy przez `cn()`, bez `'use client'`.

## Phase 1: Podział użyte/domyślne

### Overview

Czysta funkcja bez UI.

### Changes Required:

#### 1. Funkcja podziału

**File**: `src/lib/card-summary.ts`

**Intent**: Dodać funkcję, która dzieli listę `CardSummary` na karty używane i domyślne, zachowując kolejność katalogu, żeby widok nie liczył tego sam.

**Contract**: `export function splitCardSummaries(summaries: CardSummary[]): { used: CardSummary[]; defaults: CardSummary[] }`; `used` to elementy z `used === true`, `defaults` reszta; suma elementów równa wejściu, kolejność względna bez zmian.

#### 2. Test jednostkowy

**File**: `src/lib/card-summary.test.ts`

**Intent**: Pilnować podziału: profil z samym labiryntem, profil z kilkoma użytymi kartami, profil używający wszystkich kart (pusta lista domyślnych), kolejność i brak utraty kart.

**Contract**: nowy `describe` w istniejącym pliku (jest już w skrypcie `test`).

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Test jest czerwony po celowym zepsuciu (np. odwrócony warunek `used`), potem przywrócony

#### Manual Verification:

- Brak (czysta funkcja bez UI)

**Implementation Note**: Po fazie i zielonych testach commit; manualnej weryfikacji brak.

---

## Phase 2: Widok i testy e2e

### Overview

Nowy `ProfileSummary` i dostosowanie testów e2e.

### Changes Required:

#### 1. Widok

**File**: `src/components/ProfileCorner.tsx`

**Intent**: Pokazać wiersze użytych kart jak dziś, a nieużywane w zwijanym wierszu „Domyślne (N)” z linkami (sam tytuł, `min-h-11` dla celu dotyku); wiersza nie renderować, gdy `defaults` jest puste. Zdanie o zasadzie zostaje bez zmian.

**Contract**: `<details>` z `<summary>` (natywna obsługa klawiatury), `ChevronDown` obracany `group-open:rotate-180`, ten sam wzór focusu co wiersze; pole `used` kart w grupie użytych już nie wymaga stylu „pochylonego”; brak nowych zależności, kolory tylko z tokenów roli (`border-border`, `text-muted-foreground`), klasy przez `cn()`. Użyte wiersze mają selektor listy odróżnialny od listy domyślnych (dwie osobne `<ul>`).

#### 2. Testy e2e

**File**: `tests/e2e/profile-summary.spec.ts`

**Intent**: Dostosować testy do nowego widoku bez osłabiania pilnowania: użyte karty mają link i szczegóły, nieużywane są osiągalne po rozwinięciu, kolejność alfabetyczna w obu grupach, zasięg okna na telefonie i tablecie, nawigacja przez wiersz.

**Contract**:

- Test „shows the rule and a read-only summary”: użyte (Labirynt, Symetria, Sudoku, Nonogram, Kto ma więcej, Skopiuj obrazek, Szlaczki, Krzyżówka matematyczna, Zegar, Kodowanie, Od najmniejszego, Labirynt liczbowy, Cienie) mają link ze szczegółami; „Sekwencje” i „Dyktando graficzne” nie mają linku przed rozwinięciem, po rozwinięciu `Domyślne (3)` mają link z samym tytułem. (Liczba „3” musi zgadzać się z danymi `ANIA`; do sprawdzenia przy implementacji, bo `ANIA` używa 13 kart, a labirynt jest zawsze użyty, czyli domyślne to Sekwencje, Dyktando graficzne oraz Który nie pasuje lub inna nieużyta karta.)
- Nowy test: profil z samym labiryntem (jeden wiersz użytych, „Domyślne (15)” zwinięty, rozwinięcie myszą i klawiaturą Enter/Space, link do karty działa, profil zostaje wybrany).
- Nowy test: profil używający wszystkich kart nie ma wiersza „Domyślne”.
- Test „zasięgu”: lista użytych i rozwinięta lista domyślnych mieszczą się w ramce okna; `getByRole("list")` zawężone tak, by obejmowało obie listy.
- Dodać próbę z celowym zepsuciem (np. brak `<details>` albo filtr odwrócony) i potwierdzić, że test jest czerwony.

### Success Criteria:

#### Automated Verification:

- E2E przechodzą na `chromium`, `phone-360` i `tablet-768`: `E2E_PORT=4399 npx playwright test tests/e2e/profile-summary.spec.ts`
- Lint i typy: `npm run lint`, `npx astro check`
- Test e2e jest czerwony po celowym zepsuciu widoku

#### Manual Verification:

- Okno nie rośnie z liczbą kart, wiersz „Domyślne” zwinięty
- Rozwijanie myszą i klawiaturą działa

**Implementation Note**: Po fazie i zielonych testach commit; manualna weryfikacja w fazie 3.

---

## Phase 3: PRD, weryfikacja ręczna i komendy

### Overview

Dokumentacja, kontrola w przeglądarce i pełne bramki.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: W US-08 (zdanie „Okno profilu pokazuje imię, ulubioną postać, usuwanie profilu i podsumowanie…”) opisać nowy widok: wiersze użytych kart, zwinięty wiersz „Domyślne (N)” z linkami do pozostałych, brak wiersza, gdy użyte są wszystkie.

**Contract**: bez zmiany FR-017 ani danych.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build` zielone
- E2E jak w fazie 2 na trzech projektach

#### Manual Verification:

- Na `preview_start` „dev”: profil z kilkoma użytymi kartami i profil z samym labiryntem; okno nie rośnie z liczbą kart
- Przy 375 px brak przepełnienia poziomego, wiersz „Postać” osiągalny
- Link do karty działa i profil zostaje wybrany

---

## Testing Strategy

### Unit Tests:

- `splitCardSummaries`: sam labirynt, kilka użytych, wszystkie użyte, kolejność katalogu

### Integration Tests:

- E2E okna profilu: użyte wiersze, zwinięte domyślne, rozwinięcie myszą i klawiaturą, nawigacja, zasięg na telefonie i tablecie

### Manual Testing Steps:

1. Profil z kilkoma kartami: okno ma wiersze użytych i zwinięte „Domyślne (N)”.
2. Profil z samym labiryntem: jeden wiersz i „Domyślne (15)”.
3. 375 px: brak przepełnienia, „Postać” osiągalny.

## Performance Considerations

Brak; podział 16 elementów.

## Migration Notes

Brak migracji; dane profilu bez zmian.

## References

- Brief: `context/changes/profile-card-summary/change.md`
- Wzorzec zwijania: `src/components/HowItWorksRow.astro:10-20`
- Widok dziś: `src/components/ProfileCorner.tsx:574`
- Dane: `src/lib/card-summary.ts:36-57`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Podział użyte/domyślne

#### Automated

- [x] 1.1 Testy jednostkowe przechodzą: `npm test` — cad9c91b
- [x] 1.2 Lint przechodzi: `npm run lint` — cad9c91b
- [x] 1.3 Test jest czerwony po celowym zepsuciu, potem przywrócony — cad9c91b

### Phase 2: Widok i testy e2e

#### Automated

- [x] 2.1 E2E przechodzą na `chromium`, `phone-360` i `tablet-768`
- [x] 2.2 Lint i typy: `npm run lint`, `npx astro check`
- [x] 2.3 Test e2e jest czerwony po celowym zepsuciu widoku

#### Manual

- [ ] 2.4 Okno nie rośnie z liczbą kart, wiersz „Domyślne” zwinięty
- [ ] 2.5 Rozwijanie myszą i klawiaturą działa

### Phase 3: PRD, weryfikacja ręczna i komendy

#### Automated

- [ ] 3.1 `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build` zielone
- [ ] 3.2 E2E jak w fazie 2 na trzech projektach

#### Manual

- [ ] 3.3 Profil z kilkoma użytymi kartami i profil z samym labiryntem w przeglądarce
- [ ] 3.4 Przy 375 px brak przepełnienia poziomego, wiersz „Postać” osiągalny
- [ ] 3.5 Link do karty działa i profil zostaje wybrany
