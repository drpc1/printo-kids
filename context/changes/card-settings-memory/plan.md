# Profil i ostatnie parametry pamiętają ustawienia każdej karty — Plan wdrożenia

## Overview

Rodzic wraca na stronę dowolnej z sześciu kart i na pasku ma ustawienia, które ostatnio wybrał dla tej karty (PRD: US-08, FR-017, FR-006, Business Logic „Profil i zapamiętane ustawienia”). Przy aktywnym profilu każda zmiana na pasku zapisuje się w profilu od razu, a wiersz pod paskiem mówi „Zapamiętane dla {imię}”. Bez profilu urządzenie pamięta ustawienia osobno dla każdej karty. Stare profile i ostatnie parametry wczytują się bez migracji, a dawny `level` zostaje poziomem labiryntu.

## Current State Analysis

- Zapisuje się tylko `{character, level}`: profil w `printo-kids:child-profiles` (`src/lib/child-profiles.ts:14`), urządzenie w `printo-kids:last-used` (`src/lib/last-used.ts:11`), aktywny profil w `printo-kids:active-profile`.
- `level` to zawsze `LevelId` labiryntu. Pięć pozostałych stron (symetria, sekwencje, sudoku, nonogram, dyktando) trzyma poziom, kolory, kategorię i rozmiar w `useState` z wartościami domyślnymi i nie czyta ani nie pisze niczego do profilu. Ich `barCharacter`/`barLevel` to tylko wartości przekazywane oknu profilu (np. `SymmetryGenerator.tsx:35-36`).
- Pasek „Postać” jest tylko na labiryncie; zapis ostatnich parametrów robi tylko `WorksheetGenerator` (`handleLevelSelect`, `recordBarCharacter` w `src/lib/sheet/own-image-store.ts:87`), i tylko bez aktywnego profilu. Przy aktywnym profilu pasek labiryntu dziś nic nie zapisuje.
- `useChildProfileVisit` (`src/hooks/useChildProfileVisit.ts:42`) czyta stan startowy synchronicznie (`useState(() => readVisitStart(localStorage))`), więc przy pierwszym renderze nie ma wyścigu. Wyścig możliwy jest przy zmianie profilu (`onChoose`, `onCreated`, `onClearProfile`, `onDeleted`) oraz w stanie `waitingForChild` (≥2 profile, żaden niewybrany); wcześniej psuło to przycisk Poziom nonogramu (commit `ff0bd77`).
- Odczyt jest tolerancyjny: zły `level` → domyślny, nieznana postać → odrzucenie wpisu lub `none` (`acceptEntry`, `child-profiles.ts:241`).
- Okno profilu (`ProfileCorner.tsx`) nadal czyta i zapisuje poziom labiryntu (Utwórz, Edytuj, ulubiona); jego przebudowę robi S-29.

## Desired End State

- Każda z sześciu kart startuje z ustawieniami zapamiętanymi dla aktywnego profilu albo, bez profilu, dla urządzenia. Karta, której profil jeszcze nie używał, startuje z domyślnymi (nie z wartościami urządzenia).
- Zmiana na pasku zapisuje się od razu (profil albo urządzenie); przy aktywnym profilu pojawia się na ok. 2 s „Zapamiętane dla {imię}”, tylko po udanym zapisie.
- Zmiana profilu przy pokazanej karcie przestawia pasek i generuje nową kartę zgodną z nim (kolory tylko przerysowują). Nowy profil dziedziczy pasek bieżącej karty, pozostałe karty ma domyślne.
- Stary profil i stare `last-used` (tylko `character`, `level`) wczytują się bez zmian: `level` = poziom labiryntu, `cards` brak = domyślne.
- Weryfikacja: `npm test`, `npm run lint`, `npx astro check`, `npm run build`, nowy spec e2e przechodzi w CI.

### Key Discoveries:

- `writeLastUsed` (`last-used.ts:36`) zapisuje `JSON.stringify({character, level})`, a `withFavorite` (`child-profiles.ts:98-105`) buduje nowy obiekt profilu z samych starych pól. Po dodaniu `cards` oba **skasowałyby je** przy każdym zapisie postaci/ulubionej, więc muszą zachowywać `cards`.
- `writeChildProfiles` zwraca `boolean` (`child-profiles.ts:61`): na tym opiera się „komunikat tylko po udanym zapisie”.
- Wzorzec do powtórzenia: walidacja przy odczycie z wartością domyślną na pole, bez wersjonowanej migracji (`acceptEntry`, `levelField`).
- Nowy plik testowy trzeba dopisać do jawnej listy w skrypcie `test` w `package.json`; testów komponentów React w repo nie ma, więc zachowanie stron pokrywa e2e.
- Ustawienia kart to: symetria {poziom, kolory, kategoria}, sekwencje {poziom}, sudoku {rozmiar, poziom, symbole, kolory}, nonogram {poziom, kategoria}, dyktando {poziom, kategoria}. „Pokaż rozwiązanie” (nonogram, dyktando) się nie zapamiętuje.

## What We're NOT Doing

- Paska „Postać” na pięciu kartach, dymku z poleceniem i ich układu: to S-30 (po scaleniu tego PR).
- Przebudowy okna profilu (podsumowanie tylko do odczytu, usunięcie kontrolek poziomu), plakietek w katalogu i „Zacznij od nowa”: to S-29 i nice-to-have FR-032. Okno profilu zostaje bez zmian; jego poziom labiryntu dalej zapisuje `level`.
- Przenoszenia poziomu labiryntu do `cards.labirynt`: labirynt zostaje przy polach `level`.
- Zapamiętywania „Pokaż rozwiązanie”.
- Migracji danych ani wersjonowania zapisu.
- Zmiany ostatnio użytej postaci: nadal jedna wspólna, zapisywana tylko przez pasek labiryntu.

## Implementation Approach

Jeden moduł `src/lib/card-settings.ts` zna sześć kart: typy ustawień, wartości domyślne, tolerancyjne parsery (nieznane pole → domyślne; niepoprawne kombinacje sudoku normalizowane) i funkcje odczytu/zapisu jednej karty w mapie `cards`. Profil i klucz `last-used` dostają to samo opcjonalne pole `cards: {symetria?: …, sudoku?: …}`; labirynt używa `level`. Strony korzystają z nowego hooka `useCardSettings` położonego na `useChildProfileVisit`: zwraca ustawienia startowe, funkcję `remember(patch)` (profil albo urządzenie), wiersz komunikatu i opakowane handlery profilu. Istniejące `ProfileBar`, `barLevel`/`barCharacter` zostają nietknięte, więc S-30 wchodzi po tym PR bez konfliktu o sygnatury. Symetria jest pierwsza i potwierdza wzorzec, zanim ruszą cztery pozostałe karty.

## Critical Implementation Details

- **State sequencing:** przy zmianie profilu ustawienia karty trzeba zastosować w tej samej aktualizacji, w której zmienia się `activeId`, a generowanie nowej karty (gdy karta pokazana) ma wyjść z nowych wartości, nie ze stanu sprzed zmiany. Dotyczy `onChoose`, `onCreated` (dziedziczenie paska), `onClearProfile` i `onDeleted`.
- **Zachowanie `cards`:** każda funkcja przebudowująca profil albo `last-used` (`withFavorite`, `hrefForFavoriteSave` ścieżka z obrazkiem własnym, `profileToCreate`, `writeLastUsed`, `acceptEntry`) musi przenosić `cards`; dla tego jest test regresji.

## Faza 1: Rdzeń zapisu ustawień kart

### Overview

Czyste moduły bez Reacta: model, odczyt, zapis i zgodność wstecz. Po tej fazie nic nie zmienia się dla rodzica.

### Changes Required:

#### 1. Model ustawień kart

**File**: `src/lib/card-settings.ts` (nowy), `src/lib/card-settings.test.ts` (nowy)

**Intent**: Jedno miejsce, które zna ustawienia każdej z pięciu kart poza labiryntem, ich domyślne wartości i sposób bezpiecznego odczytu z dowolnego JSON-a.

**Contract**: `CardSettingsMap` (`symetria`, `sekwencje`, `sudoku`, `nonogram`, `dyktando`, każda opcjonalna); `defaultCardSettings(cardId)`; `parseCardSettings(raw: unknown): CardSettingsMap` (każde pole osobno: zły identyfikator → domyślny dla tego pola; sudoku: rozmiar 4 wymusza jeden poziom, symbole „cyfry” wyłączają kolory); `withCardSettings(map, cardId, patch)` zwraca nową mapę. Identyfikatory poziomów, rozmiarów i kategorii pochodzą z istniejących modułów `levels`/`sizes`/`templates`, bez kopiowania list.

#### 2. Profil z `cards`

**File**: `src/lib/child-profiles.ts` (+ `child-profiles.test.ts`)

**Intent**: Profil niesie opcjonalne `cards`; odczyt je parsuje, a funkcje przebudowujące profil go nie gubią.

**Contract**: `ChildProfile.cards?: CardSettingsMap`; `acceptEntry` parsuje `cards` (brak → pole nieobecne); `withFavorite` i `profileToCreate` zachowują/przyjmują `cards`; nowa `withProfileCards(profiles, id, cards): ChildProfile[] | null`.

#### 3. Ostatnie parametry z `cards`

**File**: `src/lib/last-used.ts` (+ `last-used.test.ts`)

**Intent**: Urządzenie pamięta ustawienia każdej karty obok postaci i poziomu labiryntu, a zapis jednej części nie kasuje reszty.

**Contract**: `LastUsed.cards: CardSettingsMap`; `readLastUsed` parsuje `cards` (stary wpis → `{}`); `writeLastUsed` zapisuje także `cards` i czyta bieżącą zawartość klucza tak, by zapis postaci i poziomu nie nadpisywał `cards` (i odwrotnie); nowa `writeLastUsedCards(storage, cards)`.

#### 4. Lista testów

**File**: `package.json`

**Intent**: Nowy plik testowy trafia do skryptu `test`.

**Contract**: dopisać `src/lib/card-settings.test.ts` do jawnej listy.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą, w tym: stary profil i stare `last-used` bez `cards` wczytują się z domyślnymi, zły identyfikator w jednym polu nie psuje reszty, `withFavorite` i `writeLastUsed` zachowują `cards`, normalizacja sudoku: `npm test`
- Lint: `npm run lint`
- Typy: `npx astro check`

#### Manual Verification:

- Dopasowanie nazw pól i wartości domyślnych do tabeli w PRD (Business Logic „Profil i zapamiętane ustawienia”) potwierdzone przy przeglądzie.

**Implementation Note**: Po tej fazie i zielonych testach zatrzymaj się na potwierdzenie przed Fazą 2.

---

## Faza 2: Hook, komunikat, labirynt i symetria

### Overview

Hook `useCardSettings` i wiersz komunikatu, podpięte do labiryntu (poziom zapisuje się przy aktywnym profilu) i symetrii (poziom, kolory, kategoria). Symetria jest wzorcem dla pozostałych kart.

### Changes Required:

#### 1. Hook `useCardSettings`

**File**: `src/hooks/useCardSettings.ts` (nowy), `src/hooks/useChildProfileVisit.ts`

**Intent**: Jedno miejsce, które mówi stronie, jakie ma ustawienia na starcie i po zmianie profilu, i zapisuje zmiany pod właściwym adresem (profil albo urządzenie).

**Contract**: `useCardSettings(cardId, visit)` zwraca `{ settings, remember(patch), note, corner }`. Start: ustawienia aktywnego profilu dla karty, a bez profilu `last-used.cards`; brak wpisu → `defaultCardSettings`. `remember` przy aktywnym profilu zapisuje do profilu (`withProfileCards` + `writeChildProfiles`, ustawia `note` tylko przy `true`), bez profilu do `last-used`. `corner` opakowuje `onChoose`/`onClearProfile`/`onDeleted`, żeby wołające je strony dostały nowe ustawienia; `onCreated` zapisuje do nowego profilu bieżące ustawienia tej karty (dziedziczenie paska). `useChildProfileVisit` wystawia to, czego brakuje (aktualizacja listy profili po zapisie `cards`), bez zmiany `ProfileBar` ani istniejących sygnatur.

#### 2. Wiersz „Zapamiętane dla {imię}”

**File**: `src/components/RememberedNote.tsx` (nowy)

**Intent**: Krótki komunikat w wierszu paska, który nie zasłania karty ani przycisków.

**Contract**: element `role="status"` w wierszu ustawień, widoczny ok. 2 s po udanym zapisie, bez zmiany wysokości wiersza (rezerwuje miejsce), kolory tylko z tokenów (`text-muted-foreground`), bez nowych kolorów.

#### 3. Labirynt

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Zmiana poziomu na pasku labiryntu zapisuje się od razu także przy aktywnym profilu (dziś tylko bez profilu).

**Contract**: `handleLevelSelect` przy `activeId !== null` zapisuje `profile.level` (przez `withFavorite`-podobną ścieżkę zachowującą postać i `cards`) i pokazuje komunikat; bez profilu bez zmian. Okno profilu i jego test e2e (`profile-level.spec.ts`) zostają.

#### 4. Symetria

**File**: `src/components/SymmetryGenerator.tsx`

**Intent**: Poziom, kolory i kategoria startują z zapamiętanych wartości i zapisują się przy każdej zmianie.

**Contract**: stany `levelId`, `categoryId`, `colors` inicjowane z `settings`; `handleLevelSelect`, `onSelect` kategorii i przełącznik kolorów wołają `remember`; po zmianie profilu przy pokazanej karcie pasek się przestawia i generuje się nowa karta, gdy zmienił się poziom lub kategoria (kolory tylko przerysowują). `waitingForChild` nadal blokuje zmiany i generowanie.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, `npm run build` przechodzą.
- Istniejące e2e labiryntu i profilu (`profile-level`, `level-bar`, `dialog-close`) przechodzą: `npx playwright test --project=chromium`

#### Manual Verification:

- `/symetria` z profilem: zmiana poziomu, kolorów i kategorii, odświeżenie → ta sama wartość; komunikat „Zapamiętane dla {imię}” pojawia się i znika, nie zasłania Generuj/Drukuj na telefonie.
- Bez profilu: to samo po odświeżeniu; „Bez profilu” po profilu pokazuje ustawienia urządzenia.
- Zmiana profilu przy pokazanej karcie generuje nową kartę zgodną z paskiem.
- Labirynt: zmiana poziomu z aktywnym profilem zostaje po odświeżeniu.

**Implementation Note**: Zatrzymaj się na potwierdzenie ręczne przed Fazą 3.

---

## Faza 3: Pozostałe cztery karty

### Overview

Ten sam wzorzec na sekwencjach, sudoku, nonogramie i dyktandzie.

### Changes Required:

#### 1. Sekwencje

**File**: `src/components/SequenceGenerator.tsx`

**Intent**: Poziom startuje z zapamiętanego i zapisuje się przy zmianie.

**Contract**: jak symetria (poziom).

#### 2. Sudoku

**File**: `src/components/SudokuGenerator.tsx`

**Intent**: Rozmiar, poziom, „Kształty / Cyfry” i kolory startują z zapamiętanych i zapisują się razem.

**Contract**: `settings`/`colors` inicjowane z zapamiętanych; `handleSettingChange` i przełącznik kolorów wołają `remember`. Zapamiętana kombinacja zawsze przechodzi normalizację z Fazy 1 (rozmiar 4 → jeden poziom, cyfry → bez kolorów), więc pasek nigdy nie pokazuje stanu, którego strona nie umie ustawić.

#### 3. Nonogram

**File**: `src/components/NonogramGenerator.tsx`

**Intent**: Poziom (`sizeId`) i kategoria startują z zapamiętanych; „Pokaż rozwiązanie” zawsze zaczyna wyłączone.

**Contract**: `remember` przy zmianie poziomu i kategorii; po zmianie profilu przy pokazanej karcie nowa karta na zapamiętanym poziomie i `showSolution` wraca do `false`.

#### 4. Dyktando

**File**: `src/components/DictationGenerator.tsx`

**Intent**: Poziom i kategoria startują z zapamiętanych; „Pokaż rozwiązanie” nie jest zapamiętywane.

**Contract**: jak nonogram.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, `npm run build` przechodzą.
- Istniejące e2e (`sudoku-levels`, `sudoku-colors`, `symmetry-colors`, `phone-layout`) przechodzą: `npx playwright test --project=chromium`

#### Manual Verification:

- Na każdej z czterech kart: zmiana ustawień, odświeżenie, wejście z katalogu → ten sam pasek; z profilem i bez.
- Sudoku: zapamiętane 6×6 / trudny / cyfry wraca bez kolorów i bez przełącznika kolorów.
- Nonogram i dyktando: „Pokaż rozwiązanie” po odświeżeniu wyłączone.
- Profil przełączony przy pokazanej karcie nonogramu nie wyłącza przycisku Poziom na stałe (regresja `ff0bd77`).

**Implementation Note**: Zatrzymaj się na potwierdzenie ręczne przed Fazą 4.

---

## Faza 4: E2E i porządki

### Overview

Automatyczna ochrona pętli zapisu na sześciu kartach i uprzątnięcie dawnego badania.

### Changes Required:

#### 1. Spec e2e

**File**: `tests/e2e/card-settings.spec.ts` (nowy)

**Intent**: Jeden sparametryzowany spec, który dla każdej z sześciu kart sprawdza: zmiana paska → przeładowanie → ten sam pasek, z profilem, bez profilu i ze starym profilem (zasianym przez `localStorage` w dawnym kształcie).

**Contract**: wzorzec jak istniejące specy (`profile-level.spec.ts`: seed w `localStorage`, `page.getByRole`); dodatkowo przypadek profilu, którego karta nie była używana (domyślne, nie wartości urządzenia), i przełączenia dwóch profili z pokazaną kartą.

#### 2. Archiwizacja starego badania

**File**: `context/changes/profile-age-and-levels/` → `context/archive/`

**Intent**: Folder z dawnym modelem z wiekiem staje się zastąpionym, w osobnym commicie.

**Contract**: przez `/10x-archive profile-age-and-levels` z adnotacją „zastąpiony przez card-settings-memory”.

#### 3. Roadmapa i PRD

**File**: `context/foundation/roadmap.md`

**Intent**: Odnotować, że S-28 zrealizował zapis ustawień kart; S-29 dostaje bez zmian okno profilu.

**Contract**: status S-28 zmienia `/10x-implement` i `/10x-archive`; tu tylko uzupełnienie, jeśli wykonanie odbiegło od PRD.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, `npm run build` przechodzą.
- Nowy spec przechodzi: `npx playwright test tests/e2e/card-settings.spec.ts --project=chromium`
- Całe e2e Chromium przechodzi: `npx playwright test --project=chromium`

#### Manual Verification:

- `context/changes/profile-age-and-levels` nie występuje w `context/changes/`, jest w `context/archive/` z adnotacją.
- Wydruk próbny jednej karty po zmianie paska wygląda jak dotąd (zapis ustawień nie zmienia karty A4).

---

## Testing Strategy

### Unit Tests:

- `card-settings.test.ts`: domyślne, tolerancyjny odczyt (śmieci, brak pól, zły identyfikator jednego pola), normalizacja sudoku, `withCardSettings`.
- `child-profiles.test.ts`: stary profil bez `cards`; `withFavorite`/`profileToCreate` zachowują `cards`; `withProfileCards`.
- `last-used.test.ts`: stary wpis; zapis postaci nie kasuje `cards` i odwrotnie.

### Integration Tests:

- `tests/e2e/card-settings.spec.ts`: pętla zapis → przeładowanie dla sześciu kart, z profilem, bez, ze starym profilem; nowy profil dziedziczy pasek bieżącej karty; profil bez wpisu karty ma domyślne.

### Manual Testing Steps:

1. Profil „Ola”, nonogram trudny + Zwierzęta, odśwież → bez zmian, komunikat „Zapamiętane dla Ola” po zmianie.
2. Drugi profil „Jaś” na nonogramie → domyślne; wróć do Oli → trudny + Zwierzęta.
3. „Bez profilu” → ustawienia urządzenia dla tej karty.
4. Telefon: komunikat nie zasłania Generuj/Drukuj.

## Performance Considerations

Zapisy to krótki JSON do `localStorage` przy kliknięciu; generowanie kart bez zmian (≤ 5 s). Zmiana profilu z pokazaną kartą generuje jedną kartę.

## Migration Notes

Brak migracji: pole `cards` jest opcjonalne, brak → domyślne; `level` zostaje poziomem labiryntu. Profil zapisany nową wersją i otwarty starym kodem traci tylko `cards` (reszta pól się wczyta), więc wycofanie PR nie psuje profili.

## References

- Roadmapa: `context/foundation/roadmap.md` (S-28); PRD: `context/foundation/prd.md` (US-08, US-22, FR-006, FR-017, Business Logic „Profil i zapamiętane ustawienia”)
- Dawne badanie (do archiwizacji): `context/changes/profile-age-and-levels/research.md`
- Zapis dziś: `src/lib/last-used.ts:36`, `src/lib/child-profiles.ts:98`, `src/hooks/useChildProfileVisit.ts:42`
- Wcześniejszy błąd wyścigu: commit `ff0bd77`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Rdzeń zapisu ustawień kart

#### Automated

- [ ] 1.1 Testy przechodzą, w tym: stary profil i stare `last-used` bez `cards` wczytują się z domyślnymi, zły identyfikator w jednym polu nie psuje reszty, `withFavorite` i `writeLastUsed` zachowują `cards`, normalizacja sudoku: `npm test`
- [ ] 1.2 Lint: `npm run lint`
- [ ] 1.3 Typy: `npx astro check`

#### Manual

- [ ] 1.4 Dopasowanie nazw pól i wartości domyślnych do tabeli w PRD (Business Logic „Profil i zapamiętane ustawienia”) potwierdzone przy przeglądzie.

### Phase 2: Hook, komunikat, labirynt i symetria

#### Automated

- [ ] 2.1 `npm test`, `npm run lint`, `npx astro check`, `npm run build` przechodzą.
- [ ] 2.2 Istniejące e2e labiryntu i profilu (`profile-level`, `level-bar`, `dialog-close`) przechodzą: `npx playwright test --project=chromium`

#### Manual

- [ ] 2.3 `/symetria` z profilem: zmiana poziomu, kolorów i kategorii, odświeżenie → ta sama wartość; komunikat „Zapamiętane dla {imię}” pojawia się i znika, nie zasłania Generuj/Drukuj na telefonie.
- [ ] 2.4 Bez profilu: to samo po odświeżeniu; „Bez profilu” po profilu pokazuje ustawienia urządzenia.
- [ ] 2.5 Zmiana profilu przy pokazanej karcie generuje nową kartę zgodną z paskiem.
- [ ] 2.6 Labirynt: zmiana poziomu z aktywnym profilem zostaje po odświeżeniu.

### Phase 3: Pozostałe cztery karty

#### Automated

- [ ] 3.1 `npm test`, `npm run lint`, `npx astro check`, `npm run build` przechodzą.
- [ ] 3.2 Istniejące e2e (`sudoku-levels`, `sudoku-colors`, `symmetry-colors`, `phone-layout`) przechodzą: `npx playwright test --project=chromium`

#### Manual

- [ ] 3.3 Na każdej z czterech kart: zmiana ustawień, odświeżenie, wejście z katalogu → ten sam pasek; z profilem i bez.
- [ ] 3.4 Sudoku: zapamiętane 6×6 / trudny / cyfry wraca bez kolorów i bez przełącznika kolorów.
- [ ] 3.5 Nonogram i dyktando: „Pokaż rozwiązanie” po odświeżeniu wyłączone.
- [ ] 3.6 Profil przełączony przy pokazanej karcie nonogramu nie wyłącza przycisku Poziom na stałe (regresja `ff0bd77`).

### Phase 4: E2E i porządki

#### Automated

- [ ] 4.1 `npm test`, `npm run lint`, `npx astro check`, `npm run build` przechodzą.
- [ ] 4.2 Nowy spec przechodzi: `npx playwright test tests/e2e/card-settings.spec.ts --project=chromium`
- [ ] 4.3 Całe e2e Chromium przechodzi: `npx playwright test --project=chromium`

#### Manual

- [ ] 4.4 `context/changes/profile-age-and-levels` nie występuje w `context/changes/`, jest w `context/archive/` z adnotacją.
- [ ] 4.5 Wydruk próbny jednej karty po zmianie paska wygląda jak dotąd (zapis ustawień nie zmienia karty A4).
