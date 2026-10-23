# Poziomy karty symetrii (S-13) Implementation Plan

## Overview

Karta symetrii dostaje cztery poziomy nazwane wiekiem (4, 5, 6, 7 lat) wybierane na pasku strony `/symetria`. Poziom zmienia siatkę, rozmiar kratki, katalog szablonów i podpowiedź. PRD: US-07, FR-016. Poziom żyje tylko w stanie strony; profil i ostatnie parametry to S-14, kolory to S-15.

## Current State Analysis

- Jedno stałe ustawienie `SYMMETRY_SETTING` (12×16, 15 mm, oś pionowa) w `src/lib/symmetry/generate.ts:6` czytają generator, `composeSymmetryCard`, `SymmetrySheet` (`SymmetryGenerator.tsx`) i `scripts/build-thumbnails.mjs:11,111-114`.
- Szablony (rakieta, robot, truskawka) to lewa połowa 6 kolumn × 15 wierszy; kolumna 5 dotyka osi (`templates.ts:166-170`). Nie mieszczą się w połowie 4×12 poziomu 4 lat.
- `symmetryCardProblems` (`generate.ts:82-129`) liczy połowę z `columns/2`, a komórki po drugiej stronie osi uznaje za błąd `outside-pattern-half`, więc podpowiedź 4 lat nie ma gdzie żyć.
- `layoutSymmetrySheet` (`layout.ts:29-45`) mieści wszystkie cztery siatki z PRD (najwyższy blok 257 mm z 277 mm) bez zmian.
- Klucz karty `szablon:warianty:przesunięcie` nie zawiera poziomu (`generate.ts:59-78`).
- Strona symetrii nie ma paska poziomu. Wzorem jest `LevelChoiceControl` w `src/components/WorksheetGenerator.tsx:246-283`.

## Desired End State

Na `/symetria` jest przycisk „Poziom: 5 lat” (domyślnie 5 lat). Wybór poziomu od razu generuje nową kartę tego poziomu. Poziomy:

| Poziom | Kratka | Siatka | Katalog szablonów     | Podpowiedź                |
| ------ | ------ | ------ | --------------------- | ------------------------- |
| 4 lata | 20 mm  | 8×12   | proste, połowa 4×12   | 3 kratki odbicia przy osi |
| 5 lat  | 15 mm  | 12×16  | obecne 6×15           | brak                      |
| 6 lat  | 12 mm  | 14×20  | obecne 6×15, przy osi | brak                      |
| 7 lat  | 10 mm  | 18×24  | bogate, połowa 9×24   | brak                      |

Oś zawsze pionowa, obiekt zawsze dotyka osi, odpowiedź zawsze jest dokładnym odbiciem. Każdy poziom drukuje się jako jedna strona A4 z marginesem 10 mm, także na telefonie. Wszystko weryfikują `npm test`, e2e i przegląd wydruku.

### Key Discoveries:

- Oś pozioma i odsunięcie od osi odpadły po makiecie (2026-10-23): obiekty z katalogu są symetryczne lewo–prawo, obrócone leżałyby na boku, a odsunięta połowa przestaje być jednym obiektem. Poziom 7 lat różni się więc bogatszymi szablonami, nie położeniem.
- Podpowiedzi muszą być osobnym polem karty: `cells` zostaje lewą połową, a `hints` są podzbiorem `mirrorAnswer`.
- Szablon o szerokości mniejszej niż połowa siatki (6 lat: 6 z 7) trzeba przesunąć w prawo, żeby dotykał osi.

## What We're NOT Doing

- Osi poziomej i obiektów odsuniętych od osi (decyzja z makiety; PRD poprawiamy w fazie 4).
- Ornamentów generowanych z reguł (PRD Open Questions 7 zostaje otwarte).
- Nowych obiektów poza rakietą, robotem i truskawką (po trzy rysunki na poziom 4 i 7 lat).
- Zapisu poziomu w profilu i w ostatnich parametrach (S-14) oraz kolorów (S-15).
- Zmiany wyglądu miniatury w katalogu: skrypt miniatur wskazuje poziom 5 lat jawnie.
- Zmiany `layout.ts` i `ProfileCorner` (poziom w jego pasku to nadal poziom labiryntu).

## Implementation Approach

Najpierw model poziomów i generator z walidatorem znającym poziom, sprawdzone testami na obecnych szablonach (5 i 6 lat). Potem nowe katalogi (4 i 7 lat), które tylko dopisują dane. Na końcu strona z paskiem, rysowanie podpowiedzi i testy kontraktu. PRD i przegląd wydruku zamykają slice.

## Faza 1: Model poziomów i generator

### Overview

Poziom staje się parametrem generatora, walidatora i klucza karty; podpowiedzi dostają własne pole. Działa dla 5 i 6 lat na obecnych szablonach; 4 i 7 lat dochodzą w fazie 2.

### Changes Required:

#### 1. Poziomy

**File**: `src/lib/symmetry/levels.ts` (nowy)

**Intent**: Jedno miejsce z definicją czterech poziomów, na wzór `src/lib/maze/levels.ts`.

**Contract**: `SymmetryLevelId = "lat4" | "lat5" | "lat6" | "lat7"`; `SymmetryLevel { id, label, columns, rows, cellSize, hintCount }`; `SYMMETRY_LEVELS`, `DEFAULT_SYMMETRY_LEVEL_ID = "lat5"`, `symmetryLevelById(id)`. Wartości jak w tabeli powyżej; `label` to „4 lata”, „5 lat”, „6 lat”, „7 lat”.

#### 2. Generator i walidator

**File**: `src/lib/symmetry/generate.ts`

**Intent**: Usunąć `SYMMETRY_SETTING`; generator, `symmetryRowOffsets` i `composeSymmetryCard` dostają poziom. Karta niesie `levelId`, `cellSize` i `hints`. Walidator liczy połowę z poziomu i sprawdza podpowiedzi.

**Contract**: `generateSymmetryCard(random, previousKey, level)`; `SymmetryCard` rośnie o `levelId`, `cellSize`, `hints: readonly SymmetryCell[]`. Klucz: `poziom:szablon:warianty:przesunięcie`. Szablon jest przesuwany w kolumnach o `połowa − szerokość szablonu`, żeby dotykał osi. Podpowiedź: `hintCount` kratek odbicia z kolumny przy osi, w różnych wierszach, równomiernie wzdłuż obiektu. Nowe problemy walidatora: `hint-not-in-answer` (kratka spoza `mirrorAnswer`), `hints-reveal-all` (podpowiedzi pokrywają całe odbicie), `hint-count-mismatch`. `outside-pattern-half` dotyczy tylko `cells`. `mirrorAnswer` nadal odbija tylko `cells`; pełna odpowiedź = odbicie, podpowiedzi są jego częścią.

#### 3. Szablony: szerokość

**File**: `src/lib/symmetry/templates.ts`

**Intent**: Szablon deklaruje szerokość, żeby generator mógł go ustawić przy osi na dowolnej połowie. Obecne trzy szablony dostają `width: 6`; eksport katalogu staje się mapą poziom → szablony (na razie 5 i 6 lat wskazują obecne, 4 i 7 lat dochodzą w fazie 2).

**Contract**: `SymmetryTemplate.width`; `symmetryTemplatesFor(levelId)`.

#### 4. Testy

**File**: `src/lib/symmetry/levels.test.ts` (nowy), `src/lib/symmetry/generate.test.ts`, `package.json` (skrypt `test`)

**Intent**: Tabela poziomów odpowiada PRD i każdy poziom mieści się w `layoutSymmetrySheet` z marginesem 10 mm; generator dla 5 i 6 lat daje karty, które przechodzą walidator i dotykają osi; testy walidatora pokrywają nowe problemy podpowiedzi (podpowiedź spoza odbicia, podpowiedzi całego odbicia, zła liczba). Test „is the 5 lat row” zastąpiony testem tabeli. `levels.test.ts` dopisany do skryptu `npm test`.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Każdy poziom mieści się w `layoutSymmetrySheet` (test w `levels.test.ts`)

**Implementation Note**: Po fazie i zielonych testach pauza na potwierdzenie przed fazą 2. Faza bez zmiany UI, więc bez kryteriów ręcznych.

---

## Faza 2: Katalogi szablonów 4 lat i 7 lat

### Overview

Sześć nowych rysunków: rakieta, robot i truskawka w prostej wersji na połowę 4×12 i w bogatej wersji na połowę 9×24.

### Changes Required:

#### 1. Katalog 4 lat

**File**: `src/lib/symmetry/templates.ts`

**Intent**: Trzy proste szablony (mniej szczegółów, grubsze kształty) o szerokości 4 i wysokości do 12, z losowanymi częściami i wariantami jak obecne. Kolor każdej kratki jak w obecnych szablonach (S-15).

**Contract**: `width: 4`, `height ≤ 12`; kolumna 3 dotyka osi; co najmniej 3 kratki w kolumnie przy osi (potrzebne podpowiedzi); co najmniej dwie części z dwoma wariantami.

#### 2. Katalog 7 lat

**File**: `src/lib/symmetry/templates.ts`

**Intent**: Trzy bogate szablony (więcej części i szczegółów) o szerokości do 9 i wysokości do 24, z większą liczbą losowanych części niż katalogi 4–6 lat.

**Contract**: `width ≤ 9`, `height ≤ 24`; kolumna przy osi dotyka osi; co najmniej trzy części z wariantami.

#### 3. Testy katalogów

**File**: `src/lib/symmetry/generate.test.ts`

**Intent**: Dla każdego poziomu: każdy szablon, każdy zestaw wariantów i każde przesunięcie daje kartę bez problemów walidatora; różne warianty rysują różne kratki; szablon szerszy lub wyższy niż połowa siatki poziomu nie przechodzi (rzuca).

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`

#### Manual Verification:

- Nowe obiekty 4 lat i 7 lat są rozpoznawalne (rakieta, robot, truskawka) na podglądzie z fazy 3

**Implementation Note**: Rysunki ocenia człowiek na podglądzie w fazie 3; poprawki rysunków wracają do tej fazy.

---

## Faza 3: Pasek poziomu, podpowiedzi i miniatura

### Overview

Strona dostaje wybór poziomu i rysuje kartę z jej własnym rozmiarem kratki oraz podpowiedziami. Miniatura i testy kontraktu są dostosowane.

### Changes Required:

#### 1. Pasek poziomu

**File**: `src/components/SymmetryGenerator.tsx`

**Intent**: Przycisk „Poziom: …” z listą czterech poziomów w oknie dialogowym, wzorowany na `LevelChoiceControl` z labiryntu, dostępny przed pierwszą kartą i nad kartą. Stan poziomu (domyślnie `lat5`) żyje tylko w komponencie. Zmiana poziomu generuje od razu nową kartę tego poziomu. Pasek nie dotyka profilu; `barLevel` w `ProfileCorner` zostaje poziomem labiryntu.

**Contract**: Komponent nie dodaje kolorów spoza tokenów i używa `cn()`. Przyciski Generuj, Drukuj i Profil nie nachodzą na siebie na telefonie.

#### 2. Rysowanie karty

**File**: `src/components/SymmetryGenerator.tsx`

**Intent**: `SymmetrySheet` bierze `cellSize` i `hints` z karty; podpowiedzi rysuje tak samo jak kratki wzoru (czarne zamalowane). Polecenie nad kratką bez zmian.

#### 3. Miniatura

**File**: `scripts/build-thumbnails.mjs`

**Intent**: Wskazać poziom 5 lat jawnie w wywołaniu generatora i układu; obrazek miniatury się nie zmienia.

#### 4. Testy kontraktu i e2e

**File**: `src/lib/sheet/print-contract.test.ts`, `tests/e2e/phone-layout.spec.ts`, `tests/e2e/catalog.spec.ts`

**Intent**: Kontrakt druku nadal przechodzi (SVG 210×297 mm, kontrolki ukryte w druku). E2E na telefonie przechodzi przez cztery poziomy: pasek poziomu nie zasłania Generuj, Drukuj i Profil, karta mieści się bez przewijania w bok. E2E katalogu: zmiana poziomu daje nową kartę.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint, typy i build przechodzą: `npm run lint`, `npx astro check`, `npm run build`
- E2E przechodzą: `npx playwright test`
- Miniatura buduje się bez zmiany obrazka: `node scripts/build-thumbnails.mjs` i `git diff --stat public`

#### Manual Verification:

- Pasek poziomu wygląda spójnie z labiryntem na komputerze i telefonie
- Obiekty 4 i 7 lat są rozpoznawalne na podglądzie
- Podpowiedź 4 lat wygląda jak początek odbicia i nie zdradza całości

**Implementation Note**: Pauza na ocenę wizualną przed fazą 4.

---

## Faza 4: PRD i przegląd wydruku

### Overview

Dokumenty zgodne z decyzjami i potwierdzenie na papierze lub w podglądzie druku.

### Changes Required:

#### 1. PRD i roadmapa

**File**: `context/foundation/prd.md`, `context/foundation/roadmap.md`

**Intent**: Usunąć z Business Logic i tabeli pojęcie „odsunięty od osi” i kolumnę położenia (obiekt zawsze przy osi); opisać poziom 7 lat jako bogatsze szablony 9×24 i poziom 4 lat jako proste szablony 4×12; zamknąć Open Questions 5 na podstawie przeglądu.

### Success Criteria:

#### Automated Verification:

- Pliki sformatowane: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md`

#### Manual Verification:

- Podgląd druku Chrome każdego z czterech poziomów: jedna strona A4, margines 10 mm, czarny druk
- Przegląd poziomu 4 i 7 lat na papierze lub w PDF: kratka, podpowiedź i trudność odpowiednie

**Implementation Note**: Po fazie `/10x-impl-review` i `/10x-archive`.

---

## Testing Strategy

### Unit Tests:

- Tabela poziomów = PRD; każdy poziom mieści się w układzie A4 z marginesem 10 mm.
- Każdy szablon × zestaw wariantów × przesunięcie × poziom daje kartę bez problemów walidatora.
- Walidator odrzuca: podpowiedź spoza odbicia, podpowiedzi pokrywające całe odbicie, złą liczbę podpowiedzi, kratkę po złej stronie osi, szablon szerszy niż połowa.
- Klucz zawiera poziom: ten sam obraz na dwóch poziomach ma różne klucze.

### Integration Tests:

- E2E telefon: cztery poziomy, kontrolki nie zasłaniają się, brak przewijania w bok.
- E2E: zmiana poziomu generuje nową kartę.

### Manual Testing Steps:

1. Dla każdego poziomu: Generuj kilka razy, ocenić rozpoznawalność i trudność.
2. Podgląd druku każdego poziomu.
3. Zmiana poziomu przy pokazanej karcie i z profilem wybranym w rogu.

## Performance Considerations

Generowanie ma dużą rezerwę względem 5 s (do 20 prób, kilkadziesiąt kratek); poziom 7 lat ma do 9×24 kratek w połowie, nadal o rzędy wielkości mniej niż budżet.

## Migration Notes

Nie dotyczy: poziom nie jest zapisywany (profil to S-14).

## References

- Related research: `context/changes/symmetry-difficulty-levels/research.md`
- Archiwum bazowe: `context/archive/2026-10-23-symmetry-first-printable/`
- Wzór poziomów: `src/lib/maze/levels.ts`, `src/components/WorksheetGenerator.tsx:246-283`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Model poziomów i generator

#### Automated

- [ ] 1.1 Testy przechodzą: `npm test`
- [ ] 1.2 Lint przechodzi: `npm run lint`
- [ ] 1.3 Typy przechodzą: `npx astro check`
- [ ] 1.4 Każdy poziom mieści się w `layoutSymmetrySheet` (test w `levels.test.ts`)

### Phase 2: Katalogi szablonów 4 lat i 7 lat

#### Automated

- [ ] 2.1 Testy przechodzą: `npm test`
- [ ] 2.2 Lint przechodzi: `npm run lint`

#### Manual

- [ ] 2.3 Nowe obiekty 4 lat i 7 lat są rozpoznawalne (rakieta, robot, truskawka) na podglądzie z fazy 3

### Phase 3: Pasek poziomu, podpowiedzi i miniatura

#### Automated

- [ ] 3.1 Testy przechodzą: `npm test`
- [ ] 3.2 Lint, typy i build przechodzą: `npm run lint`, `npx astro check`, `npm run build`
- [ ] 3.3 E2E przechodzą: `npx playwright test`
- [ ] 3.4 Miniatura buduje się bez zmiany obrazka: `node scripts/build-thumbnails.mjs` i `git diff --stat public`

#### Manual

- [ ] 3.5 Pasek poziomu wygląda spójnie z labiryntem na komputerze i telefonie
- [ ] 3.6 Obiekty 4 i 7 lat są rozpoznawalne na podglądzie
- [ ] 3.7 Podpowiedź 4 lat wygląda jak początek odbicia i nie zdradza całości

### Phase 4: PRD i przegląd wydruku

#### Automated

- [ ] 4.1 Pliki sformatowane: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md`

#### Manual

- [ ] 4.2 Podgląd druku Chrome każdego z czterech poziomów: jedna strona A4, margines 10 mm, czarny druk
- [ ] 4.3 Przegląd poziomu 4 i 7 lat na papierze lub w PDF: kratka, podpowiedź i trudność odpowiednie
