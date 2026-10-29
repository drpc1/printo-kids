# Podpis „Ulubiona postać” na liście z edycji profilu Implementation Plan

## Overview

W edycji profilu lista postaci nie mówi, do czego służy: tytuł „Wybierz postać” jest tylko dla czytnika ekranu. Ta zmiana zamienia ten tytuł, wyłącznie na liście otwartej z edycji, na widoczne „Ulubiona postać”. Czytnik ogłasza te same słowa. To GitHub issue 167.

## Current State Analysis

Edycja profilu i formularz „Dodaj profil” otwierają ten sam panel w `src/components/ProfileCorner.tsx`. Gałąź `panel === "favorite-list" || panel === "draft-list"` (`ProfileCorner.tsx:376-390`) renderuje jeden `DialogTitle` z klasą `sr-only` i tekstem „Wybierz postać” (`ProfileCorner.tsx:378`), a pod nim wspólne `CharacterChoiceRows`. Na ekranie widać tylko wiersze postaci.

Przycisk, który otwiera listę z edycji, to `ProfileCharacterControl` (`ProfileCorner.tsx:394-398`). Widać na nim nazwę postaci; nazwa dostępna to `Postać: ${label}` (`ProfileCorner.tsx:548`). Testy w `tests/e2e/profile-summary.spec.ts` (między innymi linia 112) pilnują tej nazwy. Zdanie „…a ulubiona postać zmienia się tylko jawnie.” stoi na panelu edycji (`ProfileCorner.tsx:563-564`), nie na liście.

Pasek karty ma własny dialog w `src/components/CharacterChoiceControl.tsx` z osobną kopią ukrytego tytułu „Wybierz postać” (`CharacterChoiceControl.tsx:69`). `DialogTitle` bez `sr-only` jest widoczny i ma styl `text-lg font-semibold` (`src/components/ui/dialog.tsx:140-147`).

## Desired End State

Rodzic w edycji profilu otwiera listę postaci i widzi nad wierszami jeden tytuł „Ulubiona postać”. Czytnik ekranu ogłasza ten sam tytuł. Nie ma obok drugiego „Wybierz postać”.

Lista przy „Dodaj profil” zostaje przy ukrytym „Wybierz postać”. Lista na pasku karty też. Przycisk „Postać: …” i zdanie o jawnej zmianie postaci zostają bez zmian.

Sprawdzenie: na Chromium nagłówek „Ulubiona postać” jest widoczny tylko po otwarciu listy z edycji.

### Key Discoveries:

- Jeden `DialogTitle` obsługuje dwie listy. Zmiana samego tekstu bez warunku na `favorite-list` podpisałaby też tworzenie profilu.
- `DialogTitle` jest nazwą okna. Widoczny tytuł i nazwa dla czytnika to ten sam element, gdy odpadnie `sr-only`.
- Żaden test nie sprawdza dziś tekstu „Wybierz postać”. Testy sprawdzają nazwę przycisku `Postać:`.

## What We're NOT Doing

- Podpisu „Ulubiona postać” przy przycisku na panelu edycji. Przycisk dalej pokazuje nazwę postaci i ma nazwę dostępną `Postać: …`.
- Zmiany listy przy tworzeniu profilu i listy na pasku karty, w tym stopki „Tylko na tę kartę” i „Ustaw jako ulubioną {imię}”.
- Drugiego, osobnego podpisu obok zostawionego „Wybierz postać”.
- Zmiany zdania na panelu edycji, katalogu postaci, zapisu profilu i danych w `localStorage`.

## Implementation Approach

Jedna faza. W istniejącej gałęzi panelu tytuł zależy od tego, która lista jest otwarta: `favorite-list` dostaje widoczny `DialogTitle` „Ulubiona postać”, `draft-list` zostaje przy ukrytym „Wybierz postać”. Wiersze postaci zostają wspólne. Dowód jest w istniejących testach przeglądarki okna profilu i paska, bo tam te trzy powierzchnie już się otwierają.

## Critical Implementation Details

Gałąź `favorite-list` i `draft-list` jest jedna. Tytuł musi być warunkowy. W tej gałęzi zostaje dokładnie jeden `DialogTitle`: dla listy z edycji bez `sr-only` i z tekstem „Ulubiona postać”, dla listy tworzenia profilu bez zmiany. `CharacterChoiceControl.tsx` ma własną kopię „Wybierz postać” i ta kopia zostaje.

## Phase 1: Widoczny tytuł listy z edycji

### Overview

Lista otwarta z edycji profilu pokazuje tytuł „Ulubiona postać”, a test przeglądarki pilnuje, że pozostałe dwie listy go nie mają.

### Changes Required:

#### 1. Tytuł listy z edycji

**File**: `src/components/ProfileCorner.tsx`

**Intent**: Rodzic ma zobaczyć, że lista otwarta z edycji służy do wyboru ulubionej postaci. Tworzenie profilu zostaje osobnym miejscem.

**Contract**: Gdy `panel === "favorite-list"`, jedyny `DialogTitle` tej gałęzi ma tekst dokładnie „Ulubiona postać” i nie ma klasy `sr-only`. Gdy `panel === "draft-list"`, `DialogTitle` zostaje „Wybierz postać” z `sr-only`. `CharacterChoiceRows`, `ProfileCharacterControl` i zdanie na panelu edycji bez zmian.

#### 2. Dowód na trzech powierzchniach

**File**: `tests/e2e/profile-summary.spec.ts`, `tests/e2e/favorite-character.spec.ts`

**Intent**: Regresja ma złapać podpis, który wyleci na tworzenie profilu albo na pasek, oraz zniknięcie widocznego tytułu z edycji.

**Contract**: Po otwarciu listy z edycji nagłówek „Ulubiona postać” jest widoczny, a nagłówka „Wybierz postać” w tym oknie nie ma. Po otwarciu listy z „Dodaj profil” i po otwarciu listy z paska karty nagłówka „Ulubiona postać” nie ma. Istniejące asercje nazwy `Postać:` zostają.

### Success Criteria:

#### Automated Verification:

- Na Chromium widać nagłówek „Ulubiona postać” tylko po otwarciu listy z edycji profilu, a nie na liście tworzenia profilu ani na liście paska: `E2E_PORT=4399 npx playwright test tests/e2e/profile-summary.spec.ts tests/e2e/favorite-character.spec.ts --project=chromium`
- Lint przechodzi: `npm run lint`

#### Manual Verification:

- W edycji profilu lista postaci ma jeden widoczny tytuł „Ulubiona postać” i nie pokazuje obok „Wybierz postać”
- Lista przy „Dodaj profil” i lista na pasku karty nie pokazują „Ulubiona postać”
- Na telefonie ostatni wiersz listy z edycji da się dosunąć przewijaniem

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

## Testing Strategy

### Unit Tests:

Logika zapisu i katalog postaci się nie zmieniają. `npm test` nie jest dowodem tej zmiany.

### Integration Tests:

Dowodem są dwa istniejące pliki Playwright: `tests/e2e/profile-summary.spec.ts` (edycja i tworzenie profilu) oraz `tests/e2e/favorite-character.spec.ts` (pasek). Asercja dotyczy widocznego nagłówka, nie samego wystąpienia nazwy w drzewie dostępności, bo ukryty tytuł i tak jest w tym drzewie.

### Manual Testing Steps:

1. Otwórz edycję istniejącego profilu, kliknij wiersz postaci i sprawdź, że nad listą widać tylko „Ulubiona postać”.
2. Wróć, wybierz „Dodaj profil”, otwórz listę postaci i sprawdź, że tego napisu nie ma.
3. Na stronie karty otwórz listę z paska i sprawdź, że tego napisu nie ma, a stopka oferty ulubionej zostaje jak dotąd.
4. Na wąskim ekranie otwórz listę z edycji i dosuń przewijaniem ostatni wiersz.

## Performance Considerations

Dochodzi jeden wiersz tytułu w już przewijanym oknie. Nie ma osobnego budżetu wydajności.

## Migration Notes

Dane profilu i ostatnio użyta postać zostają bez zmian. Nie ma migracji.

## References

- GitHub issue 167: podpis „Ulubiona postać” przy liście postaci w edycji profilu
- Wspólna lista: `src/components/ProfileCorner.tsx:376-390`
- Osobna lista paska: `src/components/CharacterChoiceControl.tsx:69`
- Wcześniejszy kontrakt okna profilu: `context/archive/2026-10-27-profile-window-summary/plan.md`
- Wcześniejszy kontrakt jawnej ulubionej: `context/archive/2026-10-27-favorite-character-explicit/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Widoczny tytuł listy z edycji

#### Automated

- [x] 1.1 Na Chromium widać nagłówek „Ulubiona postać” tylko po otwarciu listy z edycji profilu, a nie na liście tworzenia profilu ani na liście paska: `E2E_PORT=4399 npx playwright test tests/e2e/profile-summary.spec.ts tests/e2e/favorite-character.spec.ts --project=chromium`
- [x] 1.2 Lint przechodzi: `npm run lint`

#### Manual

- [ ] 1.3 W edycji profilu lista postaci ma jeden widoczny tytuł „Ulubiona postać” i nie pokazuje obok „Wybierz postać”
- [ ] 1.4 Lista przy „Dodaj profil” i lista na pasku karty nie pokazują „Ulubiona postać”
- [ ] 1.5 Na telefonie ostatni wiersz listy z edycji da się dosunąć przewijaniem
