# Profil klikalny na stronie głównej Implementation Plan

## Overview

Katalog kart (`/`) ma dostać ten sam `ProfileCorner` w tym samym rogu co strony generatorów, tak by rodzic mógł z głównej wybrać, dodać, edytować i usunąć profil albo wybrać „Bez profilu”. Róg zastępuje dzisiejszy podpis „Profil: imię” nad miniaturami. GitHub issue 234.

## Current State Analysis

- `ProfileCorner` nie zależy od `WorksheetGenerator`. Dostaje profile, aktywny profil i handlery z `useChildProfileVisit`; stan paska (`barCharacter`, `barLevel`) wykorzystuje tylko do przeniesienia paska przez usunięcie profilu (`visitAfterDelete`) i przez zapis ulubionej postaci (`barAfterFavoriteSave`).
- Strona główna to czysty Astro ([src/pages/index.astro](src/pages/index.astro)). Podpis „Profil: imię” i plakietki poziomów rysuje skrypt w [src/components/CardCatalog.astro](src/components/CardCatalog.astro) przez `catalogBadges(localStorage)`, odświeżany na `pageshow` i `storage`. `storage` nie odpala się w tej samej karcie, więc zmiana profilu w oknie nie odświeżyłaby plakietek.
- Strony generatorów montują wyspy przez `client:only="react"` (np. [src/pages/maze.astro](src/pages/maze.astro)), bo `useChildProfileVisit` czyta `localStorage` w inicjalizatorze stanu.
- Przycisk rogu jest `absolute top-4 right-4`, a na desktopie `fixed` (`sm:pointer-fine:fixed`). Główna ma `py-12`, generatory `py-20`.

## Desired End State

Na `/` w prawym górnym rogu stoi przycisk z imieniem aktywnego profilu albo „Profil”. Otwiera to samo okno co w generatorach (wybór, dodanie, edycja, usunięcie, „Bez profilu”, podsumowanie kart). Po każdej zmianie plakietki na miniaturach odświeżają się od razu w tej samej karcie. Wybrany profil zostaje po przejściu katalog ↔ generatory (US-05). Podpis „Profil: …” nie istnieje.

Weryfikacja: `npm run lint`, `npm test`, `npx astro check`, `npm run build`, E2E katalogu na Chromium i telefonie.

### Key Discoveries:

- [src/components/ProfileCorner.tsx:58](src/components/ProfileCorner.tsx:58) przyjmuje `barCharacter`/`barLevel` jako zwykłe propsy; na głównej wystarczy trzymać je w stanie z `onApply`.
- [src/hooks/useChildProfileVisit.ts:61](src/hooks/useChildProfileVisit.ts:61) zapisuje aktywny profil i wywołuje `onApply`; `ProfileCorner` zapisuje listę profili przed `onCreated`/`onDeleted`.
- `newProfileCards` jest opcjonalny ([src/components/CardPage.tsx:48](src/components/CardPage.tsx:48)): nowy profil z głównej startuje z domyślnymi ustawieniami kart.
- [tests/e2e/catalog.spec.ts:302](tests/e2e/catalog.spec.ts:302) i `:322` zależą od tekstu „Profil: …”.

## What We're NOT Doing

- Nie zmieniamy `ProfileCorner`, `useChildProfileVisit` ani `child-profiles` (żadnych nowych propsów ani wydzielania; komponent już działa bez `WorksheetGenerator`).
- Nie przepisujemy katalogu na React; plakietki zostają w skrypcie Astro.
- Okno profilu nie otwiera się samo na głównej, także przy co najmniej dwóch profilach i żadnym wybranym (pytanie „które dziecko?” czeka na stronę karty).
- Bez zmiany modelu danych ani kluczy `localStorage`.

## Implementation Approach

Nowa wyspa `CatalogProfileCorner` używa `useChildProfileVisit` z `onApply` zapisującym pasek w stanie i renderuje `ProfileCorner` z `ask={false}`. Wyspa po każdej zmianie profilu lub aktywnego profilu wysyła zdarzenie okna, a skrypt katalogu odświeża plakietki. Zapisy do `localStorage` dzieją się w handlerach przed renderem, więc efekt na `[profiles, activeId]` widzi już nowy stan.

## Phase 1: Róg profilu na katalogu

### Overview

Klikalny profil na głównej, odświeżanie plakietek w tej samej karcie, usunięcie podpisu.

### Changes Required:

#### 1. Wyspa rogu profilu

**File**: `src/components/CatalogProfileCorner.tsx` (nowy)

**Intent**: Podłączyć `ProfileCorner` do strony głównej bez `WorksheetGenerator`: stan wizyty z `useChildProfileVisit`, pasek trzymany w stanie tylko po to, by przekazać go do rogu, i sygnał do katalogu po każdej zmianie profilu.

**Contract**: `export default function CatalogProfileCorner()` bez propsów. `ask` zawsze `false`; `newProfileCards` pominięte. Efekt na `[profiles, activeId]` wywołuje `window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))`. Nazwa zdarzenia jest wspólną stałą (np. `src/lib/catalog-badges.ts`), importowaną przez wyspę i skrypt katalogu. Bez dyrektyw `'use client'`; klasy przez `cn()`.

#### 2. Katalog: bez podpisu, nasłuch zdarzenia

**File**: `src/components/CardCatalog.astro`

**Intent**: Usunąć akapit `data-profile-caption` i kod, który go wypełnia; odświeżać plakietki także na zdarzenie z wyspy.

**Contract**: `showBadges` zostaje, traci gałąź podpisu; dodatkowy `window.addEventListener(PROFILE_CHANGED_EVENT, showBadges)`. `catalogBadges` może nadal zwracać `profileName` (używają go testy); nieużywane pole usuwamy tylko jeśli żaden test go nie potrzebuje.

#### 3. Montaż na stronie głównej

**File**: `src/pages/index.astro`

**Intent**: Zamontować wyspę (`client:only="react"`) i dać nagłówkowi zapas miejsca, żeby róg (do 12 rem szerokości) nie zasłaniał „PrintoKids” na telefonie 360 px.

**Contract**: `<CatalogProfileCorner client:only="react" />` w `<main>`; górny padding `main` jak w `GeneratorShell` (`py-20`), jeśli zrzut z telefonu pokaże nakładanie.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Testy jednostkowe przechodzą: `npm test`
- Build przechodzi: `npm run build`

#### Manual Verification:

- Na `/` w rogu jest imię aktywnego profilu albo „Profil”; klik otwiera okno z wyborem, dodaniem, edycją, usunięciem i „Bez profilu”.
- Po wyborze, dodaniu, usunięciu i „Bez profilu” plakietki na miniaturach zmieniają się bez przeładowania.
- Przy dwóch profilach i żadnym wybranym okno nie otwiera się samo.
- Na telefonie 360 px róg nie zasłania nagłówka ani miniatur.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Testy i dokumentacja

### Overview

Testy jednostkowe przejść plakietek, E2E rogu na głównej, aktualizacja PRD.

### Changes Required:

#### 1. Testy jednostkowe plakietek

**File**: `src/lib/catalog-badges.test.ts`

**Intent**: Sprawdzić, że to, co robi teraz róg na głównej, daje poprawny obraz katalogu: po „Bez profilu” katalog jest zwykły, po usunięciu aktywnego profilu przy dwóch pozostałych jest zwykły, a nowy profil bez używanych kart pokazuje imię i zero plakietek. Najpierw sprawdzić, które z tych przypadków pokrywają dzisiejsze testy, i dopisać brakujące.

**Contract**: Test pozostaje na liście `npm test` w `package.json` (już jest).

#### 2. E2E rogu na głównej

**File**: `tests/e2e/catalog.spec.ts`

**Intent**: Przepisać asercje oparte na „Profil: …” na przycisk rogu i dodać ścieżki: wybór profilu z głównej, dodanie, edycja (ulubiona postać), usunięcie, „Bez profilu”, brak auto-otwarcia przy dwóch profilach bez wyboru, plakietki odświeżone po zmianie, profil zachowany po przejściu do generatora i z powrotem.

**Contract**: Testy `chromium` według istniejącego wzorca `seedProfiles`; jeden test układu na telefonie sprawdzający, że róg i nagłówek się nie zasłaniają (projekt `phone-360`).

#### 3. PRD

**File**: `context/foundation/prd.md`

**Intent**: Dopisać do US-05 kryterium: profil na stronie głównej jest klikalny jak w generatorach (wybór, dodanie, edycja, usunięcie, „Bez profilu”), a okno nie otwiera się samo.

**Contract**: Jedna linia w „Acceptance Criteria” US-05; bez zmian numeracji.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Testy jednostkowe przechodzą: `npm test`
- E2E katalogu przechodzą: `E2E_PORT=4399 npx playwright test tests/e2e/catalog.spec.ts --project=chromium --project=phone-360`
- Build przechodzi: `npm run build`

#### Manual Verification:

- Wydruk strony kart generatora nie zmienił się (róg ma `print:hidden`); katalog nie jest drukowany.
- PRD czyta się spójnie z US-08 (zapamiętany poziom na miniaturze).

---

## Testing Strategy

### Unit Tests:

- `catalogBadges` po „Bez profilu”, po usunięciu aktywnego profilu, dla nowego profilu bez używanych kart.

### Integration Tests:

- E2E katalogu: pełny cykl profilu na głównej i przejście do generatora.

### Manual Testing Steps:

1. Otwórz `/` z dwoma profilami i bez wyboru: okno nie otwiera się samo, róg pokazuje „Profil”.
2. Wybierz profil, wejdź w Labirynt: ten sam profil w rogu; wróć: plakietki widoczne.
3. Dodaj, edytuj ulubioną postać, usuń profil; wybierz „Bez profilu”.

## Performance Considerations

Wyspa `client:only` dochodzi do strony głównej; to jeden komponent React bez danych z serwera. Skrypt plakietek dalej czyta `localStorage` synchronicznie.

## References

- Issue: GitHub 234
- Wzorzec montażu: `src/pages/maze.astro`
- Wzorzec seedowania testów: `tests/e2e/catalog.spec.ts:267`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Róg profilu na katalogu

#### Automated

- [x] 1.1 Lint przechodzi: `npm run lint` — 0a68ab5
- [x] 1.2 Typy przechodzą: `npx astro check` — 0a68ab5
- [x] 1.3 Testy jednostkowe przechodzą: `npm test` — 0a68ab5
- [x] 1.4 Build przechodzi: `npm run build` — 0a68ab5

#### Manual

- [x] 1.5 Na `/` w rogu jest imię aktywnego profilu albo „Profil”; klik otwiera okno z wyborem, dodaniem, edycją, usunięciem i „Bez profilu” — 0a68ab5
- [x] 1.6 Po wyborze, dodaniu, usunięciu i „Bez profilu” plakietki na miniaturach zmieniają się bez przeładowania — 0a68ab5
- [x] 1.7 Przy dwóch profilach i żadnym wybranym okno nie otwiera się samo — 0a68ab5
- [x] 1.8 Na telefonie 360 px róg nie zasłania nagłówka ani miniatur — 0a68ab5

### Phase 2: Testy i dokumentacja

#### Automated

- [x] 2.1 Lint przechodzi: `npm run lint`
- [x] 2.2 Testy jednostkowe przechodzą: `npm test`
- [x] 2.3 E2E katalogu przechodzą: `E2E_PORT=4399 npx playwright test tests/e2e/catalog.spec.ts --project=chromium --project=phone-360`
- [x] 2.4 Build przechodzi: `npm run build`

#### Manual

- [x] 2.5 Wydruk strony kart generatora nie zmienił się (róg ma `print:hidden`); katalog nie jest drukowany
- [x] 2.6 PRD czyta się spójnie z US-08 (zapamiętany poziom na miniaturze)
