# Okno profilu z podsumowaniem i plakietki w katalogu — Implementation Plan

## Overview

Rodzic tworzy profil, podając tylko imię i postać. Okno profilu traci kontrolki poziomu, pokazuje jedno zdanie o zasadzie i podsumowanie ustawień sześciu kart tylko do odczytu; każdy wiersz prowadzi do strony karty. W katalogu na `/` przy wybranym profilu miniatury kart, których profil używał, mają zieloną plakietkę z zapamiętanym poziomem. To S-29 z roadmapy M-4 (PRD US-05, US-08, FR-007, FR-017). Makieta zaakceptowana 2026-10-27 (opis w `change.md`).

## Current State Analysis

- `ProfileCorner` ma dwa wybory poziomu labiryntu, które dziś zmieniają `profile.level`: w formularzu tworzenia (`draftLevel`, `ProfileLevelControl`, panel `draft-level-list`) i w oknie edycji (`favoriteLevelDraft`, panel `favorite-level-list`). Zapis ulubionej postaci przekazuje przy okazji poziom (`withFavorite`, `barAfterFavoriteSave(barLevel, …)`). Poziom labiryntu ustawia się już na pasku strony `/labirynt` i zapisuje sam (`useMazeLevelMemory`, S-28).
- Ustawienia pozostałych pięciu kart leżą w `profile.cards` (`CardSettingsMap`, `src/lib/card-settings.ts`); karta, której profil nie używał, nie ma wpisu. Dawny poziom profilu to `profile.level` i zostaje poziomem labiryntu (PRD, zgodność wstecz).
- Katalog `CardCatalog.astro` jest statyczny (SSR) i nie czyta profilu. Profil i aktywny wybór są w `localStorage` (`readChildProfiles`, `readActiveProfile`, `openingVisit` w `src/lib/child-profiles.ts`). Strony generatorów to wyspy `client:only="react"`.
- `tests/e2e/profile-level.spec.ts` sprawdza dziś wybór poziomu w oknie profilu i przestanie mieć sens.

## Desired End State

- Formularz „Dodaj profil”: imię i postać. Nowy profil dostaje `profile.level` = domyślny poziom labiryntu (Poziom 3), a karty startują z paska strony, na której powstał (jak dziś, `newProfileCards`).
- Okno edycji profilu: imię, ulubiona postać, zdanie „Ustawienia każdej karty zapamiętują się same, a ulubiona postać zmienia się tylko jawnie.”, lista sześciu wierszy (nazwa karty, ustawienia, `›`), każdy to link do strony karty; karty, których profil nie używał, mają kursywą „domyślne”. Anuluj/Zapisz jak dziś, ale Zapisz zmienia tylko postać.
- Katalog: nad siatką linia „Profil: {imię}” (zarezerwowane miejsce, bez skoku układu), na miniaturach używanych kart zielona plakietka w prawym dolnym rogu, wystająca poza krawędź („poz. 4”, „średni”, sudoku „6×6 · średni”). Plakietki pojawiają się po wczytaniu. Bez wybranego profilu (kilka profili bez wyboru, „Bez profilu”, brak profili) katalog wygląda jak dziś.

### Key Discoveries:

- `src/components/ProfileCorner.tsx:99,106,626,496` — cztery miejsca poziomu do usunięcia; `LevelChoiceRows` (`:691`) jest eksportowane i używane przez `WorksheetGenerator`, zostaje.
- `src/lib/child-profiles.ts:68` (`withFavorite` zachowuje `cards`), `:158` (`profileToCreate` z `cards`) — nie trzeba zmieniać formatu danych.
- `src/lib/child-profiles.ts:openingVisit` już rozstrzyga, który profil jest aktywny (zapamiętany, jedyny, „none”, kilka bez wyboru); katalog ma użyć tej samej reguły, zamiast pisać własną.
- `Level.barLabel` jest cyfrą dla kart numerowanych (maze, symetria, sekwencje) i słowem dla łatwy/średni/trudny; `label` to pełna nazwa („Poziom 4”, „średni”).
- `AGENTS.md`: `npm test` wylicza pliki jawnie w `package.json`, nowy plik testu trzeba dopisać.

## What We're NOT Doing

- Ulubiona postać zmieniana tylko jawnie, „Ustaw jako ulubioną”, „Tylko na tę kartę” (S-31) i strona „Jak to działa” (S-32). Znaczenie „Zapisz” przy postaci zostaje bez zmian.
- Zmiany formatu danych w `localStorage`.
- Okno profilu na katalogu (katalog pokazuje tylko podpis i plakietki), wybór profilu na katalogu.
- Plakietki bez profilu (z ostatnich parametrów urządzenia) i plakietki na kartach, których profil nie używał.
- „Zacznij od nowa” (FR-032, nice-to-have).

## Implementation Approach

Trzy fazy, każda z własnym PR-em. Faza 1 dodaje czystą funkcję podsumowania (jedno źródło tekstów dla okna i katalogu, testowana jednostkowo). Faza 2 przebudowuje okno profilu i przepisuje e2e. Faza 3 dodaje skrypt katalogu (Astro, bez React). Teksty ustawień liczy tylko `card-summary`, więc okno i plakietki nie rozjeżdżają się.

## Phase 1: Podsumowanie ustawień kart (biblioteka)

### Overview

Czysta funkcja zamieniająca profil w sześć pozycji: nazwa, href, plakietka, szczegół, flaga „używana”.

### Changes Required:

#### 1. Moduł podsumowania

**File**: `src/lib/card-summary.ts`

**Intent**: Jedno miejsce, które z `ChildProfile` wylicza dla każdej z sześciu kart (kolejność i tytuły z `CARD_KINDS`) to, co pokazują okno profilu i katalog.

**Contract**: `cardSummaries(profile: ChildProfile): CardSummary[]` z `CardSummary = { id: string; title: string; href: string; used: boolean; badge: string | null; detail: string }`. Labirynt jest zawsze `used` (poziom z `profile.level`, nazwa `levelById(...).label`, np. „Poziom 4”); pozostałe karty `used` tylko gdy `profile.cards?.[id]` istnieje. Dla `used === false`: `badge = null`, `detail = "domyślne"`. `badge` to sam poziom: poziom numerowany (`barLabel` złożone z cyfr) jako „poz. N”, nazwany jako `label`; sudoku jako „{rozmiar} · {poziom}”, a przy 4×4 samo „4×4” (4×4 nie ma poziomów, `sudokuHasLevels`). `detail` to poziom plus: symetria — „kolory” gdy włączone i etykieta kategorii; nonogram i dyktando — etykieta kategorii; sudoku — „kształty”/„cyfry” tylko gdy rozmiar ma wybór symboli (`sudokuHasSymbolChoice`) i „kolory” tylko przy kształtach z włączonymi kolorami; sekwencje — sam poziom; człony oddzielone „ · ”.

#### 2. Testy jednostkowe

**File**: `src/lib/card-summary.test.ts`, `package.json`

**Intent**: Pilnują wartości widocznych dla rodzica: dawny profil bez `cards`, profil z pełnymi `cards`, sudoku 4×4 / 6×6 / cyfry, kolory, kategoria.

**Contract**: Plik dopisany do skryptu `test` w `package.json`. Przypadki: (a) profil bez `cards` i z `level: "lat6"` → labirynt „poz. 4”/„Poziom 4”, pięć kart `used: false`, `badge: null`; (b) profil z `cards` jak w makiecie (nonogram średni/Zwierzęta, sudoku 6×6 średni kształty, symetria Poziom 3 z kolorami) → oczekiwane teksty; (c) sudoku 4×4 → plakietka „4×4”, detal bez poziomu i bez symboli; (d) sudoku 9×9 cyfry → bez „kolory”; (e) liczba pozycji i kolejność zgodne z `CARD_KINDS`.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Break-check: zepsucie reguły plakietki dla sudoku 4×4 w `card-summary.ts` czerwieni test, po cofnięciu zielony

#### Manual Verification:

- Teksty z testów zgadzają się z makietą zaakceptowaną przez użytkowniczkę

**Implementation Note**: Po fazie zatrzymaj się na potwierdzeniu użytkowniczki, jeśli ma uwagi do tekstów; potem faza 2.

---

## Phase 2: Okno profilu bez poziomu, z podsumowaniem

### Overview

Usunięcie kontrolek poziomu z `ProfileCorner`, dodanie zdania i listy podsumowania w oknie edycji.

### Changes Required:

#### 1. Formularz tworzenia i okno edycji

**File**: `src/components/ProfileCorner.tsx`

**Intent**: Usunąć `ProfileLevelControl`, panele `favorite-level-list` i `draft-level-list`, stany `draftLevel` i `favoriteLevelDraft` oraz ich obsługę. Nowy profil dostaje `DEFAULT_LEVEL_ID`. Zapis ulubionej postaci zachowuje `profile.level` bez zmian i nie rusza poziomu paska (`barLevel` przekazywany dalej bez przeliczania). W panelu edycji dodać zdanie i listę podsumowania z `cardSummaries(activeProfile)`.

**Contract**: Sygnatury `ProfileCorner` i `onFavoriteSaved` zostają (strony generatorów nic nie zmieniają). Warunek aktywności „Zapisz”: `favoriteDraft !== activeProfile.character` albo dotknięty własny obrazek. Lista: `<ul>` z `<li><a href={summary.href}>` (nazwa karty pogrubiona, po prawej `detail` i `›`, `detail` kursywą gdy `!used`), wiersz min. wysokości 44 px, kolory tylko z tokenów (`border`, `muted-foreground`), `cn()`. Zdanie: „Ustawienia każdej karty zapamiętują się same, a ulubiona postać zmienia się tylko jawnie.”.

#### 2. Przepisanie e2e poziomu profilu

**File**: `tests/e2e/profile-level.spec.ts` → `tests/e2e/profile-summary.spec.ts`

**Intent**: Zastąpić test wyboru poziomu testem nowego okna: formularz bez poziomu, nowy profil z domyślnym poziomem, okno edycji z listą i linkami, dawny profil z poziomem w wierszu Labirynt.

**Contract**: Chromium desktop (jak dotąd). Przypadki: (a) „Dodaj profil” nie ma przycisku „Poziom:”, po „Utwórz” `localStorage` ma `level: "lat5"`; (b) dla profilu zasianego z `level: "lat6"` i `cards` okno edycji pokazuje wiersze „Labirynt · Poziom 4”, „Nonogram · średni · Zwierzęta”, „Sekwencje · domyślne”, zdanie o zasadzie, brak „Poziom:”; (c) kliknięcie wiersza Nonogram przechodzi na `/nonogram`, a profil zostaje wybrany; (d) „Zapisz” jest wyłączone do czasu zmiany postaci; (e) po „Utwórz” na `/labirynt` pasek pokazuje „Poziom: 3”; (f) na phone-360 i pixel-7 „Zapisz” i „Anuluj” są osiągalne (po przewinięciu `dialog-body`), a lista nie wychodzi poza okno. Dodać przypisanie Provenance w nagłówku pliku zgodnie z konwencją repo.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, `npm run build` przechodzą
- E2E: `E2E_PORT=4399 npx playwright test tests/e2e/profile-summary.spec.ts tests/e2e/phone-layout.spec.ts tests/e2e/card-settings.spec.ts tests/e2e/catalog.spec.ts` na projektach chromium, phone-360, pixel-7, tablet-768
- Break-check: wstawienie z powrotem przycisku „Poziom:” w formularzu czerwieni test (a)

#### Manual Verification:

- Okno edycji na telefonie mieści się bez przycinania i bez zasłaniania przycisków
- Dawny profil z poziomem pokazuje go w wierszu Labirynt

**Implementation Note**: Po fazie pauza na potwierdzenie ręczne, potem faza 3.

---

## Phase 3: Plakietki w katalogu

### Overview

Skrypt Astro w katalogu czyta aktywny profil po wczytaniu strony i wypełnia sloty plakietek oraz podpis. Bez React (decyzja po przeglądzie planu, F1: React SSR na Cloudflare nie jest jeszcze używany w repo, a plakietki nie są interaktywne).

### Changes Required:

#### 1. Siatka katalogu z plakietkami

**File**: `src/components/CardCatalog.astro`, nowy `src/lib/catalog-badges.ts`

**Intent**: Siatka miniatur zostaje w całości renderowana przez Astro, bez hydratacji. Każdy kafelek dostaje pusty, ukryty slot plakietki, a nad siatką stoi zarezerwowana linia podpisu. `<script>` w komponencie po wczytaniu strony czyta `readChildProfiles`, `readActiveProfile`, `openingVisit`, wyznacza aktywny profil i tylko wtedy wypełnia sloty kart `used` tekstem `cardSummaries(...).badge` oraz podpis „Profil: {imię}”. Czysta część (który profil jest aktywny, jakie plakietki) siedzi w `src/lib/catalog-badges.ts` i jest testowana jednostkowo; skrypt tylko wpisuje wynik w DOM.

**Contract**: `catalogBadges(storage): { profileName: string | null; badges: Record<string, string> }` (puste `badges` bez aktywnego profilu). Slot: `<span data-badge-for={kind.id} hidden>` w opakowaniu miniatury z `relative`; plakietka w prawym dolnym rogu (`absolute`), wystaje o połowę poza krawędź; klasy z tokenów (`bg-primary text-primary-foreground`, pierścień `ring-background`), `cn()` w Astro przez `class:list`/`cn`, tekst 14 px, `whitespace-nowrap`; link kafelka dostaje większy odstęp przed nazwą (stały, dla wszystkich). Linia podpisu zawsze `min-h-6`. Odświeżenie na `pageshow` (powrót z cache przeglądarki) i na zdarzeniu `storage`. Bez aktywnego profilu sloty zostają ukryte, a kafelki wyglądają jak dziś. Dostępna nazwa linku to nazwa karty z dopiskiem plakietki; istniejące testy `getByRole("link", { name: "Labirynt" })` (dopasowanie przez zawieranie) nadal działają. Import `@/lib/*` w skrypcie Astro sprawdzić w `npm run build`.

#### 2. Testy katalogu i telefonu

**File**: `src/lib/catalog-badges.test.ts` (dopisać do skryptu `test` w `package.json`), `tests/e2e/catalog.spec.ts`, `tests/e2e/phone-layout.spec.ts`

**Intent**: Pilnować wyboru aktywnego profilu, plakietek i ich układu w 2 kolumnach.

**Contract**: Jednostkowe: aktywny profil, kilka profili bez wyboru, „none”, jedyny profil bez zapisanego wyboru, brak profili. E2E: (a) profil zasiany z `cards`, aktywny → na kafelkach Labirynt, Symetria, Sudoku, Nonogram plakietki „poz. 4”, „poz. 3”, „6×6 · średni”, „średni”, a Sekwencje i Dyktando bez; (b) dwa profile bez wyboru oraz „Bez profilu” → brak plakietek; (c) przejście katalog → generator → katalog zachowuje plakietki; (d) na phone-360 i pixel-7 plakietka mieści się w kafelku i w widoku, nie nachodzi na nazwę karty ani sąsiedni kafelek, kafelki nie zmieniają wysokości po pojawieniu się plakietek. Provenance dopisane zgodnie z konwencją.

#### 3. Drobna poprawka PRD

**File**: `context/foundation/prd.md`

**Intent**: Doprecyzować US-05: miniatura karty, której profil jeszcze nie używał, nie ma plakietki (decyzja 2026-10-27); okno profilu: nowy profil startuje z domyślnym poziomem labiryntu.

**Contract**: Jedno zdanie w kryteriach US-05 i jedno w US-08; bez zmiany numeracji i innych treści.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, `npm run build` przechodzą
- E2E na chromium, phone-360, pixel-7, tablet-768: `E2E_PORT=4399 npx playwright test tests/e2e/catalog.spec.ts tests/e2e/phone-layout.spec.ts tests/e2e/card-settings.spec.ts tests/e2e/profile-summary.spec.ts`
- Smoke strony głównej: `npm run smoke` przy działającym serwerze
- Break-check: usunięcie filtra `used` w `catalog-badges.ts` czerwieni test jednostkowy i przypadek (a)

#### Manual Verification:

- Na telefonie (2 kolumny) plakietki są czytelne i nie zasłaniają treści kart
- Po zmianie ustawienia karty na jej stronie i powrocie do katalogu plakietka pokazuje nowy poziom
- Strona nie skacze po wczytaniu plakietek

**Implementation Note**: Po fazie pauza na potwierdzenie ręczne.

---

## Testing Strategy

### Unit Tests:

- `card-summary.test.ts`: teksty plakietek i szczegółów, dawny profil, sudoku 4×4 / 6×6 / cyfry, kolejność kart.

### Integration Tests:

- `profile-summary.spec.ts` (okno), `catalog.spec.ts` (plakietki, brak profilu), `phone-layout.spec.ts` (układ 2 kolumn). CI uruchamia e2e na chromium, phone-360, pixel-7, tablet-768.

### Manual Testing Steps:

1. Utwórz profil na `/labirynt`, ustaw poziomy na kilku kartach, wróć do katalogu: plakietki pasują do pasków.
2. Otwórz edycję profilu: lista zgadza się z plakietkami; kliknij wiersz, trafiasz na kartę.
3. Dawny profil (ręcznie wpisany w `localStorage` z samym `level`) pokazuje poziom jako Labirynt.

## Performance Considerations

Skrypt czyta trzy klucze `localStorage` raz po zamontowaniu i na `pageshow`/`storage`; brak kosztu generowania kart na katalogu.

## Migration Notes

Brak zmiany formatu. Stare profile ładują się bez migracji; istniejące profile zachowują swój `level`, który staje się widoczny jako poziom labiryntu. Skutek uboczny wybranej decyzji: na `/labirynt` utworzenie profilu ustawia pasek na Poziom 3 (domyślny), zamiast zachować bieżący poziom paska.

## References

- PRD: `context/foundation/prd.md` (US-05, US-08, US-22, FR-007, FR-017)
- Roadmapa: `context/foundation/roadmap.md` (S-29)
- Okno profilu: `src/components/ProfileCorner.tsx`
- Ustawienia kart: `src/lib/card-settings.ts`, `src/hooks/useCardSettings.ts`, `src/lib/child-profiles.ts`
- Katalog: `src/components/CardCatalog.astro`, `src/lib/cards.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Podsumowanie ustawień kart (biblioteka)

#### Automated

- [ ] 1.1 Testy jednostkowe przechodzą: `npm test`
- [ ] 1.2 Lint przechodzi: `npm run lint`
- [ ] 1.3 Typy przechodzą: `npx astro check`
- [ ] 1.4 Break-check: zepsucie reguły plakietki dla sudoku 4×4 czerwieni test

#### Manual

- [ ] 1.5 Teksty z testów zgadzają się z makietą zaakceptowaną przez użytkowniczkę

### Phase 2: Okno profilu bez poziomu, z podsumowaniem

#### Automated

- [ ] 2.1 `npm test`, `npm run lint`, `npx astro check`, `npm run build` przechodzą
- [ ] 2.2 E2E okna profilu, phone-layout, card-settings i catalog zielone na chromium, phone-360, pixel-7, tablet-768
- [ ] 2.3 Break-check: przywrócenie przycisku „Poziom:” w formularzu czerwieni test

#### Manual

- [ ] 2.4 Okno edycji na telefonie mieści się bez przycinania i bez zasłaniania przycisków
- [ ] 2.5 Dawny profil z poziomem pokazuje go w wierszu Labirynt

### Phase 3: Plakietki w katalogu

#### Automated

- [ ] 3.1 `npm test`, `npm run lint`, `npx astro check`, `npm run build` przechodzą
- [ ] 3.2 E2E katalogu, phone-layout, card-settings i profile-summary zielone na chromium, phone-360, pixel-7, tablet-768
- [ ] 3.3 `npm run smoke` przechodzi przy działającym serwerze
- [ ] 3.4 Break-check: usunięcie filtra `used` w `catalog-badges.ts` czerwieni test jednostkowy i przypadek (a)

#### Manual

- [ ] 3.5 Na telefonie (2 kolumny) plakietki są czytelne i nie zasłaniają treści kart
- [ ] 3.6 Po zmianie ustawienia i powrocie do katalogu plakietka pokazuje nowy poziom
- [ ] 3.7 Strona nie skacze po wczytaniu plakietek
