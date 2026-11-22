# Karta „Cienie”: Poziom 1–4 i pozy jednej rzeczy (GitHub 452) Implementation Plan

## Overview

Karta „Cienie” dostaje czwarty, najtrudniejszy poziom: sześć póz jednej rzeczy (kot, pies, królik, ptak, miś), różniących się jednym szczegółem obrysu. Przy czterech poziomach nazwy łatwy / średni / trudny przechodzą na „Poziom 1–4” (FR-001). Źródła: PRD US-42, FR-052, Business Logic „Karta „Cienie”” i Open Questions 22 oraz zaakceptowana makieta `context/changes/shadows-poses-level/poses.mts`.

## Current State Analysis

- `src/lib/shadows/levels.ts` ma trzy poziomy (`latwy`, `sredni`, `trudny`) z polami `label`, `barLabel`, `description`, `pairCount`, `familyRule` (`dowolne` / `rozne` / `warianty`) i `pictureSize`.
- `src/lib/shadows/raster.ts:7` ma jeden próg `MIN_SHADOW_DIFFERENCE = 0.08`. Używają go `card.ts:78` (reguła karty), `card.test.ts:76` i `pictures.test.ts:56`; ten ostatni pilnuje, by każde dwa cienie całego katalogu różniły się o 0,08.
- `src/lib/shadows/families.ts` ma 13 rodzin (`kind: "warianty" | "rozne"`), a `shadowPictureById` i `familyOfPicture` szukają tylko w nich.
- `generate.ts:22` losuje obrazki według `familyRule`, a `card.ts:45` (`familiesFit`) sprawdza to samo.
- Na pasku poziomy pokazuje `LevelChoice` z `SHADOWS_LEVELS` (`src/components/ShadowsGenerator.tsx:69`). Odczyt ustawień przyjmuje identyfikatory z `SHADOWS_LEVELS` (`src/lib/card-settings.ts:29`).
- Plakietka katalogu to `badgeOf` (`src/lib/card-summary.ts:222`): przy liczbowym `barLabel` pokazuje „poz. N”.
- Stare nazwy poziomów stoją w tekstach i testach:
  - `src/lib/cards.ts:18`: opis karty.
  - `src/pages/how-it-works.astro:9`: „Cienie” na liście kart z poziomami łatwy / średni / trudny.
  - `tests/e2e/shadows.spec.ts`, `tests/e2e/shadows-reprint.spec.ts`: wybór „łatwy”, „średni”, „trudny”.
- Makieta mierzy najmniejsze różnice dwóch póz w rodzinie: ptak 0,029, kot 0,038, pies 0,065, królik 0,062, miś 0,062.

## Desired End State

- Pasek „Cienie” pokazuje Poziom 1–4 z opisami z PRD. Domyślny jest Poziom 1.
- Zapisane profile z `latwy` / `sredni` / `trudny` wczytują się jako Poziom 1 / 2 / 3.
- Poziom 4 układa kartę z 6 z 8 póz jednej rodziny póz.
- Katalog i plakietki pokazują „poz. N”.

### Key Discoveries:

- Etykiety liczbowe dają plakietkę „poz. N” bez zmian w `card-summary.ts`: `badgeOf` sprawdza tylko `barLabel`.
- Pozy nie mogą trafić do `SHADOW_FAMILIES`, bo `pictures.test.ts:56` wymaga 0,08 między wszystkimi cieniami katalogu. Poziom 1 losuje też z dowolnych rodzin.

## What We're NOT Doing

- Zmiana identyfikatorów poziomów i migracja zapisanych danych.
- Pozy na Poziomach 1–3 i mieszanie póz z rodzinami katalogu.
- Kategorie, przełącznik „Kolory” i „Pokaż rozwiązanie”.
- Nowa miniatura katalogu.
- Zamknięcie Open Questions 22 bez wydruku.

## Implementation Approach

Dwie fazy, każda na osobnej gałęzi z PR do `main` i z `/10x-impl-review` przed PR:

1. Sama zmiana nazw, bez nowego zachowania, żeby CI zostało zielone.
2. Katalog póz i Poziom 4 z własnym progiem różnicy cieni.

## Critical Implementation Details

- Próg zależy od poziomu, nie od obrazka. Reguła karty (`shadowsCardProblems`) bierze próg z poziomu. Test katalogu zostaje na 0,08 dla `SHADOW_FAMILIES`. Pozy mają osobny test: każde dwie pozy rodziny różnią się co najmniej o próg Poziomu 4.
- Próg Poziomu 4 to 0,025, poniżej najmniejszej różnicy z makiety (0,029, dziób ptaka). Dzięki temu każda karta z 6 póz przechodzi. Komentarz przy progu odsyła do Open Questions 22. Wydruk może go podnieść, a wtedy test póz pokaże, które pary odpadają.

## Phase 1: Poziom 1–3 zamiast łatwy / średni / trudny

### Overview

Zmiana etykiet i tekstów bez nowego poziomu.

### Changes Required:

#### 1. Poziomy

**File**: `src/lib/shadows/levels.ts`
**Intent**: Nazwy poziomów jako numery (FR-001), bo karta będzie miała cztery poziomy.
**Contract**: Identyfikatory bez zmian. `label`: „Poziom 1”, „Poziom 2”, „Poziom 3”. `barLabel`: „1”, „2”, „3”. Opisy bez zmian. Komentarz typu wskazuje US-42.

#### 2. Teksty

**File**: `src/pages/how-it-works.astro`
**Intent**: „Jak to działa” mówi o numerach.
**Contract**: „Cienie” przechodzą z listy kart z łatwy / średni / trudny do kart z numerami, jako „Cienie” (Poziom 1–3). Faza 2 zmienia to na Poziom 1–4. Opis w `cards.ts` nie używa nazw poziomów, więc w tej fazie zostaje.

#### 3. Testy

**File**: `tests/e2e/shadows.spec.ts`, `tests/e2e/shadows-reprint.spec.ts`, inne specy i testy jednostkowe, które oczekują „łatwy” / „średni” / „trudny” przy „Cienie” (np. `src/lib/card-summary.test.ts`, `tests/e2e/how-it-works.spec.ts`, `tests/e2e/profile-summary.spec.ts`)
**Intent**: Testy wybierają poziomy po nowych nazwach.
**Contract**: Przycisk „Poziom: 1”, a opcje „Poziom 1”–„Poziom 3”, jak w kodowaniu (`tests/e2e/coding.spec.ts:41`). Plakietka „poz. 1”.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi
- `npm run lint` i `npx astro check` przechodzą
- `npx playwright test tests/e2e/shadows.spec.ts tests/e2e/shadows-reprint.spec.ts --project=chromium` przechodzi (z wolnym `E2E_PORT`)

#### Manual Verification:

- Na `/shadows` pasek pokazuje Poziom 1–3 z opisami. Profil zapisany wcześniej z „trudny” otwiera się na Poziomie 3.

---

## Phase 2: Poziom 4 z pozami

### Overview

Katalog póz z makiety, Poziom 4 z własnym progiem, testy i wydruk.

### Changes Required:

#### 1. Katalog póz

**File**: `src/lib/shadows/pictures/pozy.ts` (nowy), `src/lib/shadows/families.ts`, `src/lib/shadows/picture-format.ts`
**Intent**: Pięć rodzin póz z zaakceptowanej makiety, każda z 8 pozami (3 szczegóły × 2 stany).
**Contract**:

- `ShadowFamilyKind` dostaje `"pozy"`.
- Rysunki są przeniesione 1:1 z `poses.mts` (funkcje `draw`, identyfikatory póz `kot-010` itd., etykieta pozy z nazw stanów).
- `families.ts` eksportuje osobne `SHADOW_POSE_FAMILIES`. `SHADOW_FAMILIES` zostaje bez zmian.
- `shadowPictureById` i `familyOfPicture` szukają w obu listach.

#### 2. Poziom 4 i próg

**File**: `src/lib/shadows/levels.ts`, `src/lib/shadows/raster.ts`, `src/lib/shadows/card.ts`, `src/lib/shadows/generate.ts`
**Intent**: Nowy poziom z PRD i próg zależny od poziomu.
**Contract**:

- `ShadowsLevelId` dostaje `"pozy"`, a `ShadowsFamilyRule` dostaje `"pozy"`.
- `ShadowsLevel` dostaje `minShadowDifference`: 0,08 dla Poziomów 1–3 (`MIN_SHADOW_DIFFERENCE`) i 0,025 dla Poziomu 4, z komentarzem o Open Questions 22.
- Poziom 4: `label` „Poziom 4”, `barLabel` „4”, opis „6 par, jedna rzecz w różnych pozach”, `pairCount` 6, `pictureSize` 35.
- `drawPictures` dla `pozy` bierze rodzinę z `SHADOW_POSE_FAMILIES` i 6 jej póz.
- `familiesFit` dla `pozy` wymaga jednej rodziny rodzaju `pozy`; Poziomy 1–3 nadal odrzucają pozy.
- `shadowsCardProblems` porównuje z `level.minShadowDifference`.

#### 3. Teksty

**File**: `src/lib/cards.ts`, `src/pages/how-it-works.astro`
**Intent**: Opis karty kończy się na „…po jedną rzecz w różnych pozach”, a „Jak to działa” podaje „Cienie” (Poziom 1–4).
**Contract**: Jedno zdanie w `description`, jak w PRD; w `how-it-works.astro` „Poziom 1–3” przy „Cienie” zmienia się na „Poziom 1–4”.

#### 4. Testy

**File**: `src/lib/shadows/pictures.test.ts`, `card.test.ts`, `engine.test.ts`, `tests/e2e/shadows.spec.ts`
**Intent**: Pilnują reguł Poziomu 4.
**Contract**:

- Test katalogu (0,08) zostaje tylko dla `SHADOW_FAMILIES`.
- Test generatora w `card.test.ts:76` porównuje różnicę cieni z `level.minShadowDifference` zamiast `MIN_SHADOW_DIFFERENCE`, bo inaczej Poziom 4 go nie przejdzie.
- Nowy test: każda rodzina póz ma 8 różnych póz, każde dwie różnią się co najmniej o próg Poziomu 4, a żadna poza nie ma cienia równego odbiciu cienia innej pozy tej rodziny.
- Generator na Poziomie 4 daje kartę bez problemów i z 6 pozami jednej rodziny.
- Poziom 1 nigdy nie bierze pozy.
- `familiesFit` odrzuca mieszanie póz z innymi rodzinami.
- E2E dostaje wiersz `{ option: "Poziom 4", pairs: 6 }`.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, w tym nowe testy póz
- `npm run lint`, `npm run depcruise` i `npx astro check` przechodzą
- `npx playwright test tests/e2e/shadows.spec.ts --project=chromium` przechodzi (z wolnym `E2E_PORT`)

#### Manual Verification:

- Na `/shadows` Poziom 4 układa kartę z 6 póz jednej rzeczy, a kolejne Generuj daje inne pozy albo inną rodzinę.
- Wydruk Poziomu 4 (Safari, Chrome iOS) to jedna strona A4. Użytkowniczka odróżnia cienie póz, także dziób ptaka i zgięte ucho kota. Wynik trafia do Open Questions 22 w PRD.

---

## Testing Strategy

### Unit Tests:

- Próg i pozy: test rodzin póz, test odbić, Poziom 4 w `card.test.ts` i `engine.test.ts`.

### Integration Tests:

- E2E `shadows.spec.ts`: liczba par na każdym poziomie i domyślny Poziom 1.

### Manual Testing Steps:

1. Otwórz `/shadows`, wybierz Poziom 4 i kliknij Generuj kilka razy.
2. Wydrukuj i porównaj cienie najbliższych póz.

## Migration Notes

Brak: identyfikatory poziomów zostają, a nowy `pozy` czyta się jak każdy inny poziom z `SHADOWS_LEVELS`.

## References

- PRD: US-42, FR-052, Business Logic „Karta „Cienie””, Open Questions 22
- Makieta: `context/changes/shadows-poses-level/poses.mts`, `poses.png`, `card-*.png`
- Poprzednia zmiana: `context/archive/2026-11-20-shadows-card/`

## Progress

### Phase 1: Poziom 1–3 zamiast łatwy / średni / trudny

#### Automated

- [x] 1.1 `npm test` przechodzi
- [x] 1.2 `npm run lint` i `npx astro check` przechodzą
- [x] 1.3 `npx playwright test tests/e2e/shadows.spec.ts tests/e2e/shadows-reprint.spec.ts --project=chromium` przechodzi (z wolnym `E2E_PORT`)

#### Manual

- [x] 1.4 Na `/shadows` pasek pokazuje Poziom 1–3 z opisami. Profil zapisany wcześniej z „trudny” otwiera się na Poziomie 3.

### Phase 2: Poziom 4 z pozami

#### Automated

- [x] 2.1 `npm test` przechodzi, w tym nowe testy póz
- [x] 2.2 `npm run lint`, `npm run depcruise` i `npx astro check` przechodzą
- [x] 2.3 `npx playwright test tests/e2e/shadows.spec.ts --project=chromium` przechodzi (z wolnym `E2E_PORT`)

#### Manual

- [x] 2.4 Na `/shadows` Poziom 4 układa kartę z 6 póz jednej rzeczy, a kolejne Generuj daje inne pozy albo inną rodzinę.
- [x] 2.5 Wydruk Poziomu 4 (Safari, Chrome iOS) to jedna strona A4. Użytkowniczka odróżnia cienie póz, także dziób ptaka i zgięte ucho kota. Wynik trafia do Open Questions 22 w PRD.
