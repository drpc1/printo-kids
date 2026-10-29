# Replace Bez postaci with Brak Implementation Plan

## Overview

Rodzic czyta „Brak” tam, gdzie dziś czyta „Bez postaci”: na zamkniętym przycisku paska („Postać: Brak”) i w wierszu listy postaci. Jedyna etykieta siedzi przy id `none` w katalogu. Id, brak obrazka i napis „Start” na labiryncie zostają.

## Current State Analysis

GitHub #180 („Etykieta braku postaci to Brak”) opisuje podmianę widocznego napisu. Katalog ma jeden wiersz braku postaci: `id: "none"`, `label: "Bez postaci"`, `src: null` (`src/lib/sheet/character.ts:1`). Przycisk i wiersze listy biorą tę etykietę; osobnej kopii napisu w komponentach nie ma.

Testy powtarzają starą frazę w asercjach: `src/lib/sheet/character.test.ts` (oczekiwany katalog, tytuły dwóch testów, etykieta id spoza katalogu), `tests/e2e/character-speaks.spec.ts` (wybór wiersza, nazwa przycisku, tytuł testu), `tests/e2e/favorite-character.spec.ts` (przycisk przy zapisanym własnym zdjęciu bez pliku) i `tests/e2e/profile-summary.spec.ts` (wiersz na liście nowego profilu, `exact: true`). Issue wymienia trzy pierwsze pliki; czwarty też trzyma frazę.

Komentarz w `src/hooks/useBarCharacter.ts:25` i komentarz na górze `tests/e2e/character-speaks.spec.ts` używają starej frazy. PRD, plan testów, outcome w roadmapie i archiwum planów też.

## Desired End State

Na karcie i w oknie profilu zamknięty przycisk czyta się „Postać: Brak”, a wiersz braku postaci czyta się „Brak”. Wygenerowany labirynt przy tym wyborze dalej ma napis „Start” i nie ma obrazka. Id `none` zostaje w zapisie ostatniego wyboru i profilu. Komentarze oraz dokumenty produktowe nadal mogą zawierać „Bez postaci”.

### Key Discoveries:

- Etykieta jest jednym polem `label` przy `none` (`src/lib/sheet/character.ts:1`). Reszta UI składa się z tej wartości.
- `characterRow` dla id spoza katalogu zwraca ten sam wiersz, więc test jednostkowy musi oczekiwać nowej etykiety (`src/lib/sheet/character.test.ts:52-59`).
- Locator w `pickCharacter` dopasowuje nazwę jako podciąg (`tests/e2e/character-speaks.spec.ts:22-24`). „Brak” jest podciągiem „Postać: Brak” tak samo, jak „Bez postaci” jest podciągiem „Postać: Bez postaci”. `profile-summary.spec.ts:173` już używa `exact: true`.

## What We're NOT Doing

- Zmiana id `none`, `src: null`, rysowania „Start” ani układu kartki.
- Przepisanie komentarza w `src/hooks/useBarCharacter.ts` i komentarza na górze `tests/e2e/character-speaks.spec.ts`.
- Przepisanie `context/foundation/prd.md`, `context/foundation/test-plan.md`, `context/foundation/roadmap.md` i czegokolwiek w `context/archive/`.
- Migracja `localStorage`. Zapis trzyma id, nie etykietę.

## Implementation Approach

Podmienić jedną etykietę w katalogu i te asercje oraz tytuły testów, które nazywają starą frazę. Komponentów nie ruszać. Gdzie locator ma `exact: true`, zostawić to. Komentarze zostawić, nawet gdy dalej mówią „Bez postaci”.

## Phase 1: Etykieta i testy, które ją trzymają

### Overview

Rodzic widzi „Brak”, a testy, które dziś wymagają „Bez postaci”, wymagają nowej frazy. Komentarze w tych plikach zostają.

### Changes Required:

#### 1. Katalog postaci

**File**: `src/lib/sheet/character.ts`

**Intent**: Jedyna etykieta, którą czyta rodzic, ma brzmieć „Brak”.

**Contract**: Pole `label` wiersza `id: "none"` zmienia się z „Bez postaci” na „Brak”. `id` i `src` zostają.

#### 2. Test katalogu

**File**: `src/lib/sheet/character.test.ts`

**Intent**: Oczekiwany katalog i powrót dla id spoza katalogu opisują nową etykietę, tak jak tytuły tych dwóch testów.

**Contract**: Wpis `none` w oczekiwanym katalogu ma `label: "Brak"`. Asercja `row.label` dla id spoza katalogu oczekuje „Brak”. Tytuły testów, które mówią „Bez postaci”, mówią „Brak”. Pozostałe asercje katalogu bez zmian.

#### 3. E2E kart i profilu

**File**: `tests/e2e/character-speaks.spec.ts`

**Intent**: Wybór braku postaci i nazwa zamkniętego przycisku używają frazy, którą rodzic widzi.

**Contract**: Argumenty `pickCharacter` i nazwa przycisku „Postać: …” używają „Brak”. Tytuł testu, który nazywa starą frazę, używa „Brak”. Komentarz na górze pliku zostaje. Locator zostaje dopasowaniem nazwy bez dokładania `exact`, tak jak dziś.

**File**: `tests/e2e/favorite-character.spec.ts`

**Intent**: Wejście z własnym zdjęciem bez pliku dalej pokazuje brak postaci na przycisku, już pod nową etykietą.

**Contract**: Nazwa przycisku „Postać: …” w teście wejścia bez obrazka używa „Brak”. Reszta scenariusza bez zmian.

**File**: `tests/e2e/profile-summary.spec.ts`

**Intent**: Wiersz braku postaci na liście nowego profilu ma nową nazwę dostępną.

**Contract**: Locator wiersza używa nazwy „Brak” i zostaje przy `exact: true`.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, a test katalogu oczekuje etykiety „Brak” dla wiersza `none` i dla id spoza katalogu
- `npx playwright test tests/e2e/character-speaks.spec.ts tests/e2e/favorite-character.spec.ts tests/e2e/profile-summary.spec.ts` przechodzi
- `npm run lint` przechodzi

#### Manual Verification:

- Świeże `/maze` pokazuje zamknięty przycisk „Postać: Brak”; otwarta lista ma wiersz „Brak”; generowanie przy tym wierszu daje napis „Start” i brak obrazka
- Na `/symmetry` wybór „Brak” zostawia samo zdanie polecenia, bez obrazka postaci
- Lista postaci przy dodawaniu profilu ma wiersz „Brak”

**Implementation Note**: Po zielonych kontrolach automatycznych zatrzymaj się na ręczne potwierdzenie kryteriów manualnych, zanim zmiana zostanie uznana za domkniętą.

---

## Testing Strategy

### Unit Tests:

- Katalog: etykieta `none` to „Brak”, kolejność i adresy plików bez zmian.
- Id spoza katalogu wraca do wiersza `none` z etykietą „Brak” i `src: null`.

### Integration Tests:

- Playwright: pięć kart w `character-speaks.spec.ts` wybiera „Brak” i nie rysuje obrazka; przycisk czyta się „Postać: Brak”.
- `favorite-character.spec.ts`: własne zdjęcie bez pliku pokazuje „Postać: Brak” i nie proponuje nadpisania.
- `profile-summary.spec.ts`: wiersz „Brak” jest pod nagłówkiem listy, locator z `exact: true`.

### Manual Testing Steps:

1. Otwórz `/maze` bez zapisu. Sprawdź przycisk „Postać: Brak”, wiersz „Brak” i kartkę ze „Start” bez obrazka.
2. Otwórz `/symmetry`, wybierz „Brak”, wygeneruj. Zostaje zdanie polecenia, bez obrazka.
3. Dodaj profil i otwórz listę ulubionej postaci. Wiersz braku postaci brzmi „Brak”.

## Performance Considerations

Krótsza etykieta zwęża przycisk. Nie ma budżetu wydajności. Testy układu łapią przycisk po prefiksie „Postać:”, nie po szerokości tej frazy.

## Migration Notes

Zapis ostatniego wyboru i profilu trzyma id `none`, nie polską etykietę. Podmiana napisu nie wymaga migracji danych.

## References

- GitHub issue #180, „Etykieta braku postaci to Brak”
- Katalog: `src/lib/sheet/character.ts:1`
- Test katalogu: `src/lib/sheet/character.test.ts:18-59`
- E2E: `tests/e2e/character-speaks.spec.ts:22-44`, `tests/e2e/favorite-character.spec.ts:128`, `tests/e2e/profile-summary.spec.ts:173`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Etykieta i testy, które ją trzymają

#### Automated

- [x] 1.1 `npm test` przechodzi, a test katalogu oczekuje etykiety „Brak” dla wiersza `none` i dla id spoza katalogu
- [x] 1.2 `npx playwright test tests/e2e/character-speaks.spec.ts tests/e2e/favorite-character.spec.ts tests/e2e/profile-summary.spec.ts` przechodzi
- [x] 1.3 `npm run lint` przechodzi

#### Manual

- [x] 1.4 Świeże `/maze` pokazuje zamknięty przycisk „Postać: Brak”; otwarta lista ma wiersz „Brak”; generowanie przy tym wierszu daje napis „Start” i brak obrazka
- [x] 1.5 Na `/symmetry` wybór „Brak” zostawia samo zdanie polecenia, bez obrazka postaci
- [x] 1.6 Lista postaci przy dodawaniu profilu ma wiersz „Brak”
