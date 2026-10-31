# Poziom labiryntu w `cards.labirynt` — plan wdrożenia (GitHub 237)

## Overview

Poziom labiryntu leży dziś w osobnym polu `level` profilu i ostatnich parametrów, a pięć pozostałych kart trzyma ustawienia w `cards` (`CardSettingsMap`). Przez to `useCardPage`, `CardPage`, `ProfileCorner`, `useBarCharacter` i `useChildProfileVisit` przenoszą `barLevel` labiryntu tylko po to, żeby go nie zgubić. Plan przenosi poziom do `cards.labirynt`, przepina labirynt na `useCardSettings` i usuwa `barLevel` ze wspólnych komponentów. Dawne dane wczytują się bez zmian dla rodzica; migracja ma testy przed zmianą kodu, bo dotyczy danych w `localStorage`.

## Current State Analysis

Poziom labiryntu jest w czterech miejscach:

- `ChildProfile.level` — `src/lib/child-profiles.ts:19`, czytane w `acceptEntry` (`:298`), zapisywane przez `withFavorite`, `profileToCreate`, `withProfileLevel`.
- `LastUsed.level` — `src/lib/last-used.ts:14`, `levelField` (`:94`), `writeLastUsed` (`:41`).
- `ProfileBar.level` — `src/hooks/useChildProfileVisit.ts:12`, niesione przez `openingVisit`, `visitAfterDelete`, `BarChoice`, `onFavoriteSaved`.
- `barLevel` — `useCardPage` (`src/hooks/useCardPage.ts:18`), `useBarCharacter` (`:21`), `CardPage` (`:29`), `ProfileCorner` (`:62`), pięć stron kart.

Labirynt ma własną ścieżkę zapisu: `useMazeLevelMemory` (`src/hooks/useCardSettings.ts:135`) i `recordBarCharacter(..., level)` (`src/lib/sheet/own-image-store.ts:87`), zamiast `useCardSettings`. `card-summary.ts:52` czyta `profile.level` i uznaje labirynt za zawsze „użyty”.

### Key Discoveries:

- `parseCardSettings` ignoruje nieznane id kart (`card-settings.ts:101`), więc stary kod po cofnięciu wdrożenia odrzuci `cards.labirynt` i zostanie przy dawnym `level` (jeśli ten jeszcze jest). Dlatego przy odczycie `cards.labirynt` wygrywa z dawnym `level`, a gdy go nie ma, `level` jest źródłem.
- `useCardSettings` już obsługuje zapis do profilu albo do last-used, komunikat „Zapamiętane dla …” i przełączenie ustawień przy zmianie profilu (`onChoose`, `onClearProfile`, `onDeleted`). Nie obsługuje `onCreated`, bo inne karty przekazują nowemu profilowi swój pasek.
- Dziś `handleCreated` wywołuje `onApply` z poziomem nowego profilu (`useChildProfileVisit.ts:66`), czyli pasek labiryntu wraca do poziomu domyślnego po utworzeniu profilu. Po zmianie ten reset musi dać `onCreated` w `useCardSettings`.
- Testy e2e zasilają `localStorage` dawnym kształtem (`level` w last-used i w profilach), więc przy okazji sprawdzają zgodność wsteczną (`tests/e2e/level-bar.spec.ts:73`).
- `AGENTS.md:30` zawiera zdanie „The maze keeps its level memory outside `CardSettingsMap`”, które przestanie być prawdziwe.

## Desired End State

- `CardSettingsMap` ma klucz `labirynt` z polem `level`; labirynt czyta i zapisuje poziom przez `useCardSettings("labirynt")`.
- `ChildProfile` i `LastUsed` nie mają pola `level`; `ProfileBar`, `BarChoice`, `OpeningVisit` niosą tylko postać.
- `CardPage`, `ProfileCorner`, `useCardPage`, `useBarCharacter`, `useFavoriteCharacter` i `CatalogProfileCorner` nie znają typu poziomu labiryntu.
- Zapisane profile i ostatnie parametry w dawnym kształcie wczytują się, a poziom trafia do `cards.labirynt`. Zapis zapisuje już tylko nowy kształt.
- Weryfikacja: `npm test`, `npm run lint`, `npx astro check`, `npm run build` i specyfikacje e2e dotykające profilu przechodzą; ręcznie sprawdzone przepływy z dawnymi danymi.

## What We're NOT Doing

- Nie zmieniamy zachowania dla rodzica: nowy profil utworzony na `/maze` nadal zaczyna od domyślnego poziomu (Poziom 3, PRD US-08, decyzja 2026-10-27). Labirynt nie przekazuje nowemu profilowi poziomu z paska.
- Nie zapisujemy dawnego pola `level` obok `cards.labirynt` (brak zapisu podwójnego, brak wsparcia rollbacku).
- Nie robimy jednorazowej migracji przy starcie aplikacji; migracja dzieje się przy odczycie, a nowy kształt trafia do `localStorage` przy następnym zapisie.
- Nie zmieniamy `LevelId`, `LEVELS`, wyglądu paska ani okna profilu.
- Nie ruszamy PRD: opisuje już „poziom labiryntu” jako ustawienie karty i zgodność wsteczną.
- Nie uruchamiamy pełnego Strykera i nie gonimy za wynikiem; zakres nie dotyka generatora labiryntu. Jedynie wąski przebieg na plikach migracji (Faza 3, krok ręczny).

## Implementation Approach

Trzy fazy: (1) warstwa danych z testami migracji napisanymi przed zmianą kodu, (2) hooki i komponenty przepięte na nowy kształt, (3) dokumenty i pełna weryfikacja. Po fazie 1 typy w warstwie UI są tymczasowo niezgodne; `astro check` przechodzi dopiero po fazie 2.

## Critical Implementation Details

- **State sequencing** — Reset paska po utworzeniu profilu: `useCardSettings.corner.onCreated` ma wołać `visit.corner.onCreated(profile)` i potem `switchTo(profile.cards ?? {})`. Na `/maze` nowy profil nie ma `labirynt`, więc pasek wraca do domyślnego; na pozostałych kartach profil niesie bieżący pasek, więc `switchTo` daje te same ustawienia, a strony reagują tylko na różnicę (`next.level !== previous.level` itp.).
- **State sequencing** — Pierwszeństwo przy odczycie: poziom labiryntu to poprawne `cards.labirynt.level`, a gdy go nie ma lub jest niepoprawny, poprawne dawne `level`, a gdy i tego nie ma, poziom domyślny. Niepoprawne albo brakujące dawne `level` bez `cards.labirynt` nie tworzy klucza (zadziała domyślny poziom). Zapis (`writeLastUsed`, `writeLastUsedCards`, `writeChildProfiles`) nie zostawia dawnego `level`.

## Faza 1: Dane i migracja (test-first)

### Overview

Poziom labiryntu wchodzi do `CardSettingsMap`, odczyt dawnych danych przenosi go do `cards.labirynt`, a `level` znika z modeli profilu i last-used oraz z funkcji pomocniczych `lib`. Testy migracji powstają i padają przed zmianą kodu.

### Changes Required:

#### 1. Testy migracji (najpierw)

**Files**: `src/lib/card-settings.test.ts`, `src/lib/child-profiles.test.ts`, `src/lib/last-used.test.ts`, `src/lib/sheet/own-image-store.test.ts`, `src/lib/card-summary.test.ts`, `src/lib/catalog-badges.test.ts`

**Intent**: Zapisać oczekiwane zachowanie nowego kształtu i migracji, uruchomić je i potwierdzić, że padają, zanim zmieni się kod produkcyjny. Istniejące testy używające `level` w profilu, last-used, `withFavorite`, `profileToCreate`, `openingVisit`, `visitAfterDelete`, `recordBarCharacter` przepisać na nowy kształt.

**Contract**: Przypadki do pokrycia:

- odczyt profilu z dawnym `level` (np. `lat6`) daje `cards.labirynt.level === "lat6"`; profil z dawnym `level` i innymi kartami zachowuje te karty i dostaje `labirynt`;
- poprawne `cards.labirynt` wygrywa z dawnym `level`; niepoprawne albo brakujące `level` bez `cards.labirynt` nie tworzy `labirynt`; `cards.labirynt` z niepoprawnym `level` i poprawnym dawnym `level` daje dawne `level`, a bez poprawnego dawnego wraca do `DEFAULT_LEVEL_ID`;
- to samo dla `readLastUsed` (dawny `level` na najwyższym poziomie rekordu);
- `writeLastUsed({ character })` zachowuje poziom zmigrowany z dawnego rekordu i usuwa dawne `level`; `writeLastUsedCards` nie zostawia dawnego `level`; `writeChildProfiles` + `readChildProfiles` w obie strony nie zapisuje `level` na poziomie profilu;
- `withFavorite`, `profileToCreate`, `openingVisit`, `visitAfterDelete`, `recordBarCharacter` działają bez poziomu i zachowują `cards` (także `labirynt`);
- `cardSummaries`: labirynt zawsze „użyty”, badge i szczegół z `cards.labirynt` (domyślny poziom, gdy brak); `catalogBadges` pokazuje poziom labiryntu z `cards.labirynt` i ze zmigrowanego dawnego `level`.

#### 2. `CardSettingsMap` z labiryntem

**File**: `src/lib/card-settings.ts`

**Intent**: Dołożyć `labirynt` jako zwykłą kartę: typ, domyślne ustawienia, lista id, lista dozwolonych id poziomu (`LEVELS` z `./maze/levels.ts`) i wspólny odczyt rekordu z dawnym `level`.

**Contract**: `LabiryntSettings { level: LevelId }`; `CardSettingsMap.labirynt?`; `CARD_SETTINGS_IDS` zawiera `"labirynt"`; `DEFAULTS.labirynt = { level: DEFAULT_LEVEL_ID }`; `levelIds("labirynt")` zwraca id z `LEVELS`; nowa funkcja `parseStoredCards(record)` przyjmuje rekord z polami `cards` i opcjonalnym dawnym `level` i zwraca `CardSettingsMap` według reguły pierwszeństwa z „Critical Implementation Details”. Poprawić komentarz nad `SymmetrySettings` („except the maze”).

#### 3. Profil

**File**: `src/lib/child-profiles.ts`

**Intent**: Usunąć `level` z `ChildProfile` i funkcji, które go niosły; odczyt używa `parseStoredCards`.

**Contract**: `ChildProfile { id, name, character, image?, cards? }`; `acceptEntry` buduje `cards` przez `parseStoredCards(entry)` i dodaje klucz `cards` tylko gdy mapa niepusta; `withFavorite(profiles, id, character, allowed, imageHref?)`, `profileToCreate(id, name, character, imageHref, cards?)`; `BarChoice { character }`; `OpeningVisit { activeId, character, ask }`; `VisitAfterDelete` analogicznie; `withProfileLevel` usunięte (zastępuje je `withProfileCards` z `withCardSettings(..., "labirynt", ...)` w `useCardSettings`).

#### 4. Ostatnie parametry

**File**: `src/lib/last-used.ts`

**Intent**: Usunąć `level` z `LastUsed`; poziom labiryntu jest w `cards.labirynt`, a dawny rekord migruje przy odczycie.

**Contract**: `LastUsed { character, cards }`; `readLastUsed` używa `parseStoredCards`; `writeLastUsed(storage, { character })` zapisuje `{ character, cards? }` (cards zmigrowane z rekordu) i nie zapisuje `level`; `writeLastUsedCards` zapisuje `{ ...stored bez level, cards }`.

#### 5. Pozostałe funkcje `lib`

**Files**: `src/lib/sheet/own-image-store.ts`, `src/lib/card-summary.ts`, `src/lib/catalog-badges.ts`

**Intent**: `recordBarCharacter(storage, activeProfileId, character)` bez poziomu; `card-summary` czyta poziom labiryntu przez `cardSettingsOf(profile.cards ?? {}, "labirynt")` i nadal uznaje labirynt za użyty; `catalog-badges` bez zmiany logiki (zależy od `openingVisit`), dopasować tylko typy.

**Contract**: `summaryParts("labirynt", profile)` nigdy nie zwraca `null`.

### Success Criteria:

#### Automated Verification:

- Nowe testy migracji padły przed zmianą kodu (czerwone), a po zmianie przechodzą: `npm test`
- Lint plików `src/lib` przechodzi: `npx eslint src/lib`

#### Manual Verification:

- Przegląd diffu `src/lib`: nigdzie w `lib` nie zostało pole `level` profilu ani last-used poza kodem odczytu dawnego kształtu

**Implementation Note**: Po fazie 1 `astro check` nie przechodzi (UI używa starych typów). Zatrzymaj się na potwierdzenie ręczne przed fazą 2. Plain bullets tutaj, checkboxy tylko w `## Progress`.

---

## Faza 2: Hooki i komponenty

### Overview

Wspólne hooki i komponenty przestają znać poziom labiryntu; labirynt korzysta z `useCardSettings("labirynt")`; pięć stron kart traci `barLevel`.

### Changes Required:

#### 1. Hooki profilu i postaci

**Files**: `src/hooks/useChildProfileVisit.ts`, `src/hooks/useBarCharacter.ts`, `src/hooks/useCardPage.ts`, `src/hooks/useFavoriteCharacter.ts`

**Intent**: Usunąć poziom z `ProfileBar`, `ProfileCornerHandlers.onFavoriteSaved`, `barForStored`, `readVisitStart`, `handleCleared` i `handleDeleted`; `useBarCharacter(visit)` bez drugiego argumentu; `useCardPage` zwraca `{ visit, bar, favorite }`; `useFavoriteCharacter` woła `withFavorite` bez poziomu. Poprawić komentarze, które opisują `barLevel`.

**Contract**: `ProfileBar { character, ownImageHref? }`; `onFavoriteSaved(profiles, barCharacter, ownImageHref?)`; `visitCards` zostaje (niesie `labirynt`).

#### 2. `useCardSettings`

**File**: `src/hooks/useCardSettings.ts`

**Intent**: Usunąć `useMazeLevelMemory` i `withProfileLevel`; dodać `onCreated` do `corner` (patrz „Critical Implementation Details”); poprawić komentarze.

**Contract**: `useCardSettings("labirynt", visit, onSwitch)` działa jak dla innych kart; `corner.onCreated` wywołuje `visit.corner.onCreated(profile)` i `switchTo(profile.cards ?? {})`.

#### 3. Komponenty wspólne

**Files**: `src/components/CardPage.tsx`, `src/components/ProfileCorner.tsx`, `src/components/CatalogProfileCorner.tsx`

**Intent**: Usunąć prop `barLevel` z `CardPage` i `ProfileCorner`; `confirmDelete` przekazuje `{ character: barCharacter }`; `saveFavorite` woła `withFavorite` bez poziomu i `onFavoriteSaved` bez `barLevel`; `handleCreate` woła `profileToCreate` bez `DEFAULT_LEVEL_ID`; `CatalogProfileCorner` trzyma tylko postać. Poprawić komentarz `newProfileCards` w `CardPage` (labirynt nie przekazuje nowemu profilowi niczego, więc zaczyna od domyślnego poziomu).

**Contract**: `ProfileCorner` i `CardPage` nie importują `LevelId`.

#### 4. Labirynt

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Poziom pochodzi z `useCardSettings("labirynt", visit, onSwitch)` zamiast osobnego `useState` i `useMazeLevelMemory`; wybór poziomu woła `remember({ level })` i przerysowuje labirynt (jedna funkcja używana przez wybór i `onSwitch`); `corner` pochodzi z hooka; `applyProfileBar` dotyczy tylko postaci; `recordBarCharacter` bez poziomu; `newProfileCards` nie jest przekazywane (decyzja: nowy profil zaczyna od domyślnego poziomu); `note` z hooka poziomu łączy się z `favorite.note` jak dziś.

**Contract**: Po zmianie profilu lub wyczyszczeniu profilu pasek i narysowany labirynt zgadzają się z poziomem nowego profilu (z `cards.labirynt` albo domyślnym). Zachowane: `printDisabled`, `generateFailed` i tekst błędu przy poziomie, który nie układa się na kartce.

#### 5. Pięć stron kart

**Files**: `src/components/SymmetryGenerator.tsx`, `SequenceGenerator.tsx`, `SudokuGenerator.tsx`, `NonogramGenerator.tsx`, `DictationGenerator.tsx`

**Intent**: Nie destrukturyzować `barLevel` z `useCardPage()` i nie przekazywać go do `CardPage`.

**Contract**: Brak innych zmian zachowania.

#### 6. Specyfikacje e2e

**Files**: `tests/e2e/card-settings.spec.ts`, `tests/e2e/profile-summary.spec.ts` (oraz każda inna specyfikacja, która po uruchomieniu okaże się czytać zapisane `profiles[].level`)

**Intent**: Asercje czytające zapisany kształt (`profiles[0].level` w `card-settings.spec.ts:191-192`, `levelsOf` w `profile-summary.spec.ts:71-72`, `toMatchObject({ level: "lat6", … })` w `profile-summary.spec.ts:122-126`) zmienić na `cards.labirynt.level`. Zasiewy `localStorage` z dawnym `level` (`OLA`, `ANIA`, `own-image.spec.ts:71,103`, `level-bar.spec.ts:73`) zostają bez zmian jako test zgodności wstecznej.

**Contract**: Specyfikacje sprawdzają nowy zapisany kształt po zapisie i dawny kształt jako wejście.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Testy jednostkowe przechodzą: `npm test`
- Build przechodzi: `npm run build`
- Specyfikacje e2e dotykające profilu i labiryntu przechodzą na wolnym porcie: `E2E_PORT=4399 npx playwright test --project=chromium tests/e2e/level-bar.spec.ts tests/e2e/card-settings.spec.ts tests/e2e/catalog.spec.ts tests/e2e/profile-summary.spec.ts tests/e2e/favorite-character.spec.ts tests/e2e/own-image.spec.ts tests/e2e/dialog-close.spec.ts`
- `grep -rn "barLevel" src` nie zwraca nic

#### Manual Verification:

- Z dawnym zapisem w `localStorage` (profil z `level: "lat6"` i `printo-kids:last-used` z `level`) `/maze` pokazuje Poziom 4 (profil) lub poziom z last-used (bez profilu), a katalog pokazuje plakietkę „poz. 4”
- Zmiana poziomu na `/maze` przy aktywnym profilu pokazuje „Zapamiętane dla {imię}”, po odświeżeniu poziom zostaje, a w `localStorage` profil ma `cards.labirynt` i nie ma pola `level`
- Zmiana poziomu bez profilu zapisuje się w last-used po odświeżeniu
- Utworzenie profilu na `/maze` ustawia pasek na Poziom 3; utworzenie profilu na `/symmetry` nie zmienia paska symetrii, a w katalogu labirynt ma plakietkę „poz. 3”
- Przełączenie profilu na `/maze` przerysowuje kartę na poziom nowego profilu; usunięcie aktywnego profilu przełącza pasek na poziom następnego albo last-used

**Implementation Note**: Po fazie 2 i zielonych testach zatrzymaj się na ręczne potwierdzenie, zanim przejdziesz do fazy 3.

---

## Faza 3: Dokumenty i weryfikacja końcowa

### Overview

Dokumenty zgadzają się z kodem, a cała zmiana przechodzi pełne sprawdzenie.

### Changes Required:

#### 1. Dokumentacja

**Files**: `AGENTS.md`, komentarze w `src/lib/card-settings.ts`, `src/hooks/useCardPage.ts`, `src/hooks/useChildProfileVisit.ts`, `src/components/CardPage.tsx`

**Intent**: Zamienić zdanie „The maze keeps its level memory outside `CardSettingsMap`” na opis, że labirynt trzyma poziom w `cards.labirynt`, a dawne `level` jest czytane tylko przy odczycie; usunąć z komentarzy wzmianki o `barLevel` i „level stays in `level`”.

**Contract**: PRD bez zmian.

#### 2. Weryfikacja końcowa

**Intent**: Pełny przebieg CI lokalnie i przegląd diffu pod kątem pozostałości starego kształtu.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Testy przechodzą: `npm test`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- Pełne Chromium e2e przechodzi na wolnym porcie: `E2E_PORT=4399 npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`
- Brak pozostałości: `grep -rnE "withProfileLevel|useMazeLevelMemory|barLevel" src` nie zwraca nic

#### Manual Verification:

- `AGENTS.md` opisuje nowy kształt i nie sprzeciwia się kodowi
- Wąski przebieg Strykera na migracji, ocalałe mutanty przejrzane po jednym: `npm run mutate:maze -- --mutate "src/lib/last-used.ts"` (i analogicznie `src/lib/child-profiles.ts`); asercję dodajemy tylko, gdy mutant to błąd widoczny dla rodzica (zgubiony poziom), bez gonienia za 100%

---

## Testing Strategy

### Unit Tests:

- Migracja odczytu profilu i last-used (dawny `level`, oba pola, niepoprawne wartości), zapis bez dawnego pola, zachowanie `cards` przy `withFavorite`/`profileToCreate`, podsumowanie i plakietki labiryntu.
- Przypadki brzegowe: profil z dawnym `level` i bez `cards`; `cards` nie jest rekordem; `labirynt` z niepoprawnym poziomem; zapis postaci na urządzeniu z dawnym last-used zachowuje poziom.

### Integration Tests:

- Istniejące specyfikacje e2e zasilające dawny kształt `localStorage` (`level-bar`, `profile-summary`, `catalog`, `card-settings`) działają jako test zgodności wstecznej bez zmian lub z drobnymi poprawkami. Jeśli żadna specyfikacja nie zasila profilu z dawnym `level`, dołożyć jeden przypadek do `tests/e2e/profile-summary.spec.ts`.

### Manual Testing Steps:

1. Zasilić `localStorage` dawnym kształtem i otworzyć `/maze` oraz katalog.
2. Zmienić poziom z profilem i bez, odświeżyć, sprawdzić zapis w `localStorage`.
3. Utworzyć profil na `/maze` i na `/symmetry`, przełączyć i usunąć profil.

## Performance Considerations

Brak: zmiana nie dodaje odczytów poza istniejącymi.

## Migration Notes

Migracja odbywa się przy odczycie (`parseStoredCards`), bez przepisywania danych przy starcie. Nowy kształt trafia do `localStorage` przy następnym zapisie profilu albo last-used. Cofnięcie wdrożenia po zapisie nowego kształtu: stary kod zignoruje `cards.labirynt` i użyje poziomu domyślnego (akceptowane, decyzja z planowania).

## References

- Issue: GitHub 237 („Poziom labiryntu w profilu leży poza `cards`…”)
- PRD: `context/foundation/prd.md` US-08, „Profil i zapamiętane ustawienia”, Zgodność wsteczna
- Wzorzec: `src/hooks/useCardSettings.ts:57` (`useCardSettings`), `src/components/SymmetryGenerator.tsx`
- Ułatwia: GitHub 234 (`ProfileCorner` na stronie głównej bez stanu paska labiryntu)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Dane i migracja (test-first)

#### Automated

- [x] 1.1 Nowe testy migracji padły przed zmianą kodu (czerwone), a po zmianie przechodzą: `npm test` — e66a235
- [x] 1.2 Lint plików `src/lib` przechodzi: `npx eslint src/lib` — e66a235

#### Manual

- [x] 1.3 Przegląd diffu `src/lib`: nigdzie w `lib` nie zostało pole `level` profilu ani last-used poza kodem odczytu dawnego kształtu — e66a235

### Phase 2: Hooki i komponenty

#### Automated

- [x] 2.1 Lint przechodzi: `npm run lint` — 81851cf
- [x] 2.2 Typy przechodzą: `npx astro check` — 81851cf
- [x] 2.3 Testy jednostkowe przechodzą: `npm test` — 81851cf
- [x] 2.4 Build przechodzi: `npm run build` — 81851cf
- [x] 2.5 Specyfikacje e2e dotykające profilu i labiryntu przechodzą na wolnym porcie — 81851cf
- [x] 2.6 `grep -rn "barLevel" src` nie zwraca nic — 81851cf

#### Manual

- [x] 2.7 Z dawnym zapisem w `localStorage` `/maze` i katalog pokazują poziom z profilu lub z last-used — 81851cf
- [x] 2.8 Zmiana poziomu z profilem pokazuje „Zapamiętane dla {imię}”, po odświeżeniu zostaje, a profil w `localStorage` ma `cards.labirynt` i nie ma `level` — 81851cf
- [x] 2.9 Zmiana poziomu bez profilu zapisuje się w last-used po odświeżeniu — 81851cf
- [x] 2.10 Utworzenie profilu na `/maze` ustawia Poziom 3, a na `/symmetry` nie zmienia paska symetrii i daje plakietkę „poz. 3” labiryntu — 81851cf
- [x] 2.11 Przełączenie i usunięcie aktywnego profilu na `/maze` przerysowuje kartę na właściwy poziom — 81851cf

### Phase 3: Dokumenty i weryfikacja końcowa

#### Automated

- [x] 3.1 Lint przechodzi: `npm run lint` — 0e2c2cd
- [x] 3.2 Testy przechodzą: `npm test` — 0e2c2cd
- [x] 3.3 Typy przechodzą: `npx astro check` — 0e2c2cd
- [x] 3.4 Build przechodzi: `npm run build` — 0e2c2cd
- [x] 3.5 Pełne Chromium e2e przechodzi na wolnym porcie — 0e2c2cd
- [x] 3.6 Brak pozostałości `withProfileLevel|useMazeLevelMemory|barLevel` w `src` — 0e2c2cd

#### Manual

- [x] 3.7 `AGENTS.md` opisuje nowy kształt i nie sprzeciwia się kodowi — 0e2c2cd
- [x] 3.8 Wąski przebieg Strykera na migracji, ocalałe mutanty przejrzane po jednym — 0e2c2cd
