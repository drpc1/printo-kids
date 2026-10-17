# Wybór poziomu w profilu dziecka — plan implementacji

## Overview

Panele „Dodaj profil” i „Edytuj” dostają przycisk „Poziom: …”, który otwiera listę sześciu poziomów z `LEVELS`, tak jak przycisk postaci otwiera listę postaci. Profil zapisuje poziom wybrany w panelu, a nie poziom z paska.

## Current State Analysis

- `ChildProfile.level` istnieje (`src/lib/child-profiles.ts`), a `withFavorite(profiles, id, character, level, allowed)` już zapisuje poziom.
- `src/components/ProfileCorner.tsx` pokazuje w obu panelach `ProfileLevelNote` (sam tekst) i przekazuje do zapisu `barLevel`. Przycisk „Zapisz” w edycji porównuje `barLevel` z poziomem profilu.
- Postać ma szkice `draftCharacter` (tworzenie) i `favoriteDraft` (edycja) oraz panele `draft-list` / `favorite-list` z `CharacterChoiceRows`.
- `barAfterFavoriteSave(bar, previous, next)` decyduje, czy pasek przejmuje nową postać; `WorksheetGenerator.handleFavoriteSaved` ustawia tylko postać.

## Desired End State

- „Dodaj profil”: przycisk „Poziom: <label>” (start: poziom z paska), lista sześciu poziomów, wybór wraca do formularza; „Utwórz” zapisuje wybrany poziom, a pasek przejmuje poziom nowego profilu (jak dziś przy `onCreated`).
- „Edytuj”: przycisk „Poziom: <label>” (start: poziom profilu), lista, powrót do edycji. „Zapisz” aktywny, gdy zmieniła się postać albo poziom. Po zapisie pasek przejmuje nowy poziom, gdy pokazywał poprzedni poziom profilu; inaczej zostaje.
- Anulowanie, zamknięcie dialogu i zmiana aktywnego profilu po usunięciu porzucają szkic poziomu, jak szkic postaci.

### Key Discoveries:

- `src/components/ProfileCorner.tsx:493` — `ProfileLevelNote` do zastąpienia kontrolką.
- `src/components/WorksheetGenerator.tsx` `handleFavoriteSaved` — jedyne miejsce w pliku paska, które ta zmiana dotyka; `applyLevel` czyści labirynt przy zmianie poziomu.

## What We're NOT Doing

- Bez zmian w układzie paska i w liście „Poziom:” na pasku (`LevelChoiceControl`) — tym zajmuje się `level-bar-fixes`. Wspólna lista poziomów dla paska i profilu to możliwy follow-up.
- Bez zmian w formacie zapisu profili ani w `last-used`.

## Implementation Approach

`barAfterFavoriteSave` staje się generyczna (`<T extends string>`) i obsługuje zarówno postać, jak i poziom. `withFavorite` odrzuca nieznany poziom tak jak nieznaną postać. W `ProfileCorner` dochodzą szkice `draftLevel` i `levelDraft`, panele `draft-level-list` i `favorite-level-list`, kontrolka `ProfileLevelControl` i lista `LevelChoiceRows`. `onFavoriteSaved` przekazuje też poziom paska.

## Phase 1: Wybór poziomu w profilu

### Changes Required:

#### 1. Logika profili

**File**: `src/lib/child-profiles.ts`, `src/lib/child-profiles.test.ts`

**Intent**: `withFavorite` zwraca `null` dla poziomu spoza `LEVELS`; `barAfterFavoriteSave` działa dla poziomu.

**Contract**: `barAfterFavoriteSave<T extends string>(bar: T, previous: T, next: T): T`. Testy: zapis samego poziomu, odrzucenie nieznanego poziomu, pasek przejmuje / zostawia poziom.

#### 2. Panele profilu

**File**: `src/components/ProfileCorner.tsx`

**Intent**: szkice poziomu, dwa panele listy, kontrolka „Poziom: …” zamiast notki; zapis bierze poziom ze szkicu.

**Contract**: `onFavoriteSaved(profiles, barCharacter: string, barLevel: LevelId)`.

#### 3. Pasek po zapisie

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: `handleFavoriteSaved` wywołuje `applyLevel(barLevel)`.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- E2E przechodzą lokalnie: `npx playwright test`

#### Manual Verification:

- „Dodaj profil”: wybór poziomu z listy, „Utwórz” — pasek pokazuje wybrany poziom
- „Edytuj”: zmiana samego poziomu włącza „Zapisz”; po zapisie pasek przejmuje poziom, jeśli pokazywał poprzedni poziom profilu
- „Anuluj” w edycji porzuca szkic poziomu

## Testing Strategy

Jednostkowo `withFavorite` i `barAfterFavoriteSave` w `child-profiles.test.ts`; panele ręcznie w przeglądarce.

## References

- Poprzednia zmiana: `context/archive/2026-10-11-maze-difficulty-levels/plan.md`
- Wzorzec: `CharacterChoiceRows` i `ProfileCharacterControl` w `src/components/ProfileCorner.tsx`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Wybór poziomu w profilu

#### Automated

- [x] 1.1 Testy jednostkowe przechodzą: `npm test` — ccfb414 — 28c06f1
- [x] 1.2 Lint przechodzi: `npm run lint` — ccfb414 — 28c06f1
- [x] 1.3 Typy przechodzą: `npx astro check` — ccfb414 — 28c06f1
- [x] 1.4 Build przechodzi: `npm run build` — ccfb414 — 28c06f1
- [x] 1.5 E2E przechodzą lokalnie: `npx playwright test` — ccfb414 — 28c06f1

#### Manual

- [x] 1.6 „Dodaj profil”: wybór poziomu z listy, „Utwórz” — pasek pokazuje wybrany poziom — ccfb414 — 28c06f1
- [x] 1.7 „Edytuj”: zmiana samego poziomu włącza „Zapisz”; po zapisie pasek przejmuje poziom, jeśli pokazywał poprzedni poziom profilu — ccfb414 — 28c06f1
- [x] 1.8 „Anuluj” w edycji porzuca szkic poziomu — ccfb414 — 28c06f1
