# Poprawki paska poziomu — plan implementacji

## Overview

Zmiana poziomu przy gotowej kartce przegenerowuje labirynt do nowego poziomu, zamiast wracać do strony startowej — tak samo jak zmiana postaci zostawia kartkę. Na komputerze pasek ma dwa rzędy: Postać i Poziom, a pod nimi Generuj i Drukuj obok siebie.

## Current State Analysis

`applyLevel` w `src/components/WorksheetGenerator.tsx:82-89` przy każdej zmianie poziomu ustawia `maze` na `null`. Widok kartki, klasa `has-maze` (`:58-67`) i pasek z Drukuj (`:159-187`) zależą tylko od `maze !== null`, więc po zmianie poziomu strona wraca do układu startowego. `applyLevel` wołają: wybór poziomu na pasku (`handleLevelSelect`, `:98-103`), nowy profil (`:109-114`), wybór profilu (`:116-120`) i usunięcie profilu (`:127-133`).

Pasek przy kartce (`:160-187`) to jeden wiersz z `flex-wrap`: grupa Postać + Poziom (`w-full sm:w-auto`), Generuj (`flex-1 sm:flex-none`) i Drukuj (`flex-1 sm:ml-auto sm:flex-none`). Kolumna strony ma `max-w-xl` (`src/components/WorksheetHome.astro:9`), czyli 576 px. Pomiar przy 1280 px (2026-10-17): Postać „Bez postaci” 185 px, Poziom „5 lat” 141 px, Generuj 155 px, Drukuj 144 px, odstęp 16 px — razem ok. 670 px, więc Generuj zostaje w pierwszym rzędzie, a Drukuj spada do drugiego. Z obrazkiem i „Samochodzik” oraz „nastolatek” wychodzi ok. 750 px. Na telefonie grupa selektorów ma `w-full`, więc Generuj i Drukuj już dziś stoją razem w drugim rzędzie.

`print-contract.test.ts` sprawdza dokładną listę klas z `print:hidden` w `WorksheetGenerator.tsx`. `tests/e2e/phone-layout.spec.ts:66-91` sprawdza, że Generuj, Drukuj i Postać się nie nakładają i mieszczą w szerokości ekranu; projekt `chromium` to desktop 1280 px.

## Desired End State

- Przy widocznej kartce zmiana poziomu (pasek, nowy profil, wybór profilu, usunięcie profilu) od razu układa labirynt nowego poziomu. Kartka zostaje, Drukuj jest aktywny i drukuje labirynt poziomu z paska. Postać się nie zmienia.
- Gdy po zmianie poziomu ułożenie się nie uda: kartka znika, pasek zostaje w układzie kartki, widać „Nie udało się ułożyć tego poziomu.”, a Drukuj jest wyszarzony (`disabled`). Udane Generuj przywraca kartkę i aktywne Drukuj.
- Bez kartki zmiana poziomu tylko ustawia poziom (jak dziś); pierwsze nieudane Generuj zostawia stronę startową z komunikatem (jak dziś).
- Na komputerze (`sm` i szerzej) pasek ma rząd 1: Postać i Poziom, rząd 2: Generuj po lewej, Drukuj po prawej, przy każdej postaci i każdym poziomie, bez obcinania napisów. Telefon zostaje w obecnym układzie.

### Key Discoveries:

- Układ telefonu (`w-full` grupy selektorów) to już dwa rzędy — desktop ma przejąć ten sam podział zamiast `sm:w-auto` (`WorksheetGenerator.tsx:161`).
- Klasa `has-maze` steruje zwijaniem nagłówka i dopełnieniem (`WorksheetHome.astro:26-51`) — musi iść za widokiem kartki, nie za samym labiryntem, żeby pasek po nieudanym ułożeniu nie przeskoczył do układu startowego.
- `handleGenerate` wychodzi wcześnie przy `waitingForChild` (`:70-72`); przegenerowanie przy zmianie poziomu ma działać także wtedy, bo kartka już jest na ekranie.

## What We're NOT Doing

- Wybór poziomu w profilu dziecka (tworzenie i edycja) — osobna zmiana.
- Zmiana szerokości kolumny, rozmiarów przycisków albo napisów „Postać:” / „Poziom:”.
- Zmiana generatora, `mazeForSheet`, zapisu ostatniego użycia i profili.
- Zmiana układu na telefonie.
- Edycja zarchiwizowanego planu `maze-difficulty-levels` (zdanie „Zmiana poziomu chowa kartkę”).

## Implementation Approach

Widok kartki staje się osobnym stanem obok labiryntu: włącza go pierwsze udane Generuj, a nieudane ułożenie po zmianie poziomu zeruje tylko labirynt. Jedno miejsce (`applyLevel`) obsługuje wszystkie źródła zmiany poziomu. Pasek desktopu dostaje ten sam podział na dwa rzędy co telefon.

## Critical Implementation Details

**State sequencing** — `applyLevel` układa labirynt dla nowego `next`, nie dla `level` ze stanu: w tym samym zdarzeniu `level` jest jeszcze stary. Komunikat o nieudanym ułożeniu ustawia się w tym samym zdarzeniu, w którym zeruje się labirynt.

## Phase 1: Przegenerowanie przy zmianie poziomu

### Overview

Zmiana poziomu przy widocznej kartce układa nowy labirynt; nieudane ułożenie zostawia pasek kartki z komunikatem i wyszarzonym Drukuj.

### Changes Required:

#### 1. Widok kartki i zmiana poziomu

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Kartka nie znika przy zmianie poziomu, tylko dostaje labirynt nowego poziomu; widok kartki przeżywa nieudane ułożenie.

**Contract**: Stan „widok kartki” jest `true` po pierwszym udanym Generuj i zostaje `true` do przeładowania strony. Układ paska, klasa `has-maze` i miejsce kartki zależą od tego stanu. `applyLevel(next)` przy zmianie poziomu i widocznej kartce woła `mazeForSheet(generateMaze(next, Math.random), next)`: wynik nie-`null` podmienia labirynt i czyści komunikat; `null` zeruje labirynt i pokazuje „Nie udało się ułożyć tego poziomu.”. Bez widoku kartki `applyLevel` tylko ustawia poziom i czyści komunikat. Drukuj ma `disabled`, gdy labiryntu nie ma. Zachowanie przy tym samym poziomie (brak zmiany) zostaje.

#### 2. Test przegenerowania

**File**: `tests/e2e/level-bar.spec.ts` (nowy)

**Intent**: Złapać powrót do strony startowej po zmianie poziomu.

**Contract**: Po Generuj (domyślnie 5 lat) wybór „3 lata” w dialogu „Poziom:” zostawia `img` „Labirynt”, aktywny przycisk Drukuj i zmienia liczbę kolumn siatki (szerokość SVG labiryntu w komórkach rozpoznawalna po liczbie ścian albo atrybutach — test porównuje ściany przed i po). Test działa na wszystkich projektach Playwright.

### Success Criteria:

#### Automated Verification:

- `npx playwright test tests/e2e/level-bar.spec.ts` przechodzi: zmiana poziomu przy kartce zostawia kartkę z innymi ścianami i aktywnym Drukuj
- `npm test`, `npm run lint` i `npx astro check` przechodzą

#### Manual Verification:

- Na komputerze: Generuj, potem zmiana poziomu na pasku i przez wybór profilu — kartka zostaje i pokazuje labirynt nowego poziomu
- Z wymuszonym `null` w bramce (tylko w worktree, przywrócone): zmiana poziomu przy kartce chowa kartkę, zostawia pasek z komunikatem i wyszarzonym Drukuj; udane Generuj przywraca kartkę

**Implementation Note**: Po zielonych bramkach i ręcznym sprawdzeniu można przejść do fazy 2.

---

## Phase 2: Pasek w dwóch rzędach na komputerze

### Overview

Na komputerze Postać i Poziom stoją w pierwszym rzędzie, a Generuj i Drukuj razem w drugim.

### Changes Required:

#### 1. Układ paska

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Generuj i Drukuj nie rozdzielają się na dwa rzędy na komputerze, niezależnie od długości nazw postaci i poziomu.

**Contract**: Pasek przy kartce: rząd selektorów (Postać, Poziom, komunikat) ma pełną szerokość na każdym ekranie; rząd akcji ma Generuj i Drukuj w jednej linii — na telefonie po połowie szerokości jak dziś, od `sm` Generuj po lewej, Drukuj wyrównany do prawej. Klasy przez `cn()`. Napisy, rozmiary przycisków i szerokość kolumny bez zmian.

#### 2. Kontrakt druku

**File**: `src/lib/sheet/print-contract.test.ts`

**Intent**: Lista klas z `print:hidden` odpowiada nowemu paskowi.

**Contract**: Oczekiwana lista zawiera klasę nowego kontenera paska; dialogi bez zmian.

#### 3. Test paska na komputerze

**File**: `tests/e2e/level-bar.spec.ts`

**Intent**: Złapać rozjechanie przycisków na komputerze po dodaniu kontrolki.

**Contract**: Na projekcie `chromium` (1280 px), z postacią i poziomem o najdłuższych nazwach z `localStorage` (`Samochodzik`, `nastolatek`), Generuj i Drukuj mają ten sam środek w pionie (±2 px), Postać i Poziom leżą nad nimi, a żaden z czterech przycisków nie nachodzi na inny.

### Success Criteria:

#### Automated Verification:

- `npx playwright test` przechodzi, w tym test paska na komputerze i dotychczasowe testy telefonu
- `npm test`, `npm run lint`, `npx astro check` i `npm run build` przechodzą

#### Manual Verification:

- Na komputerze pasek ma dwa rzędy: Postać i Poziom, pod nimi Generuj po lewej i Drukuj po prawej, także dla Samochodzika i poziomu nastolatek
- Na telefonie układ paska wygląda jak przed zmianą

**Implementation Note**: Po zielonych bramkach i ręcznym sprawdzeniu zmiana jest gotowa do review.

---

## Testing Strategy

### Unit Tests:

- `print-contract.test.ts`: lista klas `print:hidden` po zmianie paska.

### Integration Tests:

- Playwright `tests/e2e/level-bar.spec.ts`: przegenerowanie po zmianie poziomu (wszystkie projekty) i dwa rzędy paska na komputerze (`chromium`).
- Dotychczasowe `phone-layout.spec.ts` i `seed.spec.ts` zostają zielone.

### Manual Testing Steps:

1. Generuj na 5 latach, zmień na 3 lata, potem na nastolatka — kartka zostaje i za każdym razem ma siatkę wybranego poziomu.
2. Z dwoma profilami o różnych poziomach: przy kartce wybierz drugi profil — kartka przegenerowuje się do jego poziomu.
3. Wymuś `null` w bramce (tylko w worktree), zmień poziom przy kartce — komunikat, brak kartki, Drukuj wyszarzony; przywróć plik.
4. Na komputerze z Samochodzikiem i nastolatkiem: dwa rzędy, nic się nie nakłada. Na telefonie bez zmian.

## Performance Considerations

Jedno ułożenie trwa poniżej 1 ms, więc przegenerowanie w zdarzeniu zmiany poziomu nie opóźnia interfejsu.

## Migration Notes

Brak — zapis w `localStorage` się nie zmienia.

## References

- Zarchiwizowany plan poziomów: `context/archive/2026-10-11-maze-difficulty-levels/plan.md`
- Pasek i zmiana poziomu: `src/components/WorksheetGenerator.tsx:82-187`
- Kolumna strony i `has-maze`: `src/components/WorksheetHome.astro:9`, `:26-51`
- Test telefonu: `tests/e2e/phone-layout.spec.ts:66-91`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Przegenerowanie przy zmianie poziomu

#### Automated

- [x] 1.1 `npx playwright test tests/e2e/level-bar.spec.ts` przechodzi: zmiana poziomu przy kartce zostawia kartkę z innymi ścianami i aktywnym Drukuj — 1917389
- [x] 1.2 `npm test`, `npm run lint` i `npx astro check` przechodzą — 1917389

#### Manual

- [x] 1.3 Na komputerze: Generuj, potem zmiana poziomu na pasku i przez wybór profilu — kartka zostaje i pokazuje labirynt nowego poziomu — 1917389
- [x] 1.4 Z wymuszonym `null` w bramce (tylko w worktree, przywrócone): zmiana poziomu przy kartce chowa kartkę, zostawia pasek z komunikatem i wyszarzonym Drukuj; udane Generuj przywraca kartkę — 1917389

### Phase 2: Pasek w dwóch rzędach na komputerze

#### Automated

- [x] 2.1 `npx playwright test` przechodzi, w tym test paska na komputerze i dotychczasowe testy telefonu
- [x] 2.2 `npm test`, `npm run lint`, `npx astro check` i `npm run build` przechodzą

#### Manual

- [x] 2.3 Na komputerze pasek ma dwa rzędy: Postać i Poziom, pod nimi Generuj po lewej i Drukuj po prawej, także dla Samochodzika i poziomu nastolatek
- [x] 2.4 Na telefonie układ paska wygląda jak przed zmianą
