# Na wydruku labirynt z postacią niżej, równy margines góra i dół (S-11) — plan wdrożenia

## Overview

Na każdym poziomie oprócz nastolatka cały blok karty — postać albo napis „Start”, labirynt i „Meta” — schodzi w dół o jedną wartość. Wartość jest taka, że przy postaci biały pas nad postacią równa się białemu pasowi pod napisem „Meta”. Wersja ze „Start” schodzi o tyle samo. Roadmapa S-11, issue drpc1/printo-kids#35.

## Current State Analysis

- `layoutSheet` (`src/lib/sheet/layout.ts:41-78`) dzieli wolną wysokość `277 − wysokość siatki` na dwa równe pasy: `labelBand = (innerHeight − gridHeight) / 2` (`:45-46`). Siatka zaczyna się w `inset + labelBand` (`:48`), „Start” stoi na środku górnego pasa (`:51`), „Meta” na środku dolnego (`:52`), a znak postaci 30×30 dolną krawędzią na górze siatki (`:63-68`).
- Przy postaci góra i dół są nierówne. Biały pas nad postacią / pod „Meta” (krawędź napisu przy czcionce 7 mm): 9×11 — 2,4 / 17,7 mm, 13×16 — 1,6 / 17,3 mm, 17×21 — 1,1 / 17,1 mm. Bez postaci układ jest dziś symetryczny (ok. 17,7 / 17,3 mm).
- `MazeSheet` (`src/components/WorksheetGenerator.tsx:326-381`) tylko czyta wynik układu: `characterSelected: level.showCharacter && characterSrc !== null` (`:337`), napisy mają `fontSize={7}` i `dominantBaseline="middle"` (`:362-367`, `:373-377`). Ten sam SVG jest na ekranie i w druku.
- Poziom nastolatka: `showCharacter: false`, start i meta w narożnych kolumnach (`src/lib/maze/levels.ts`), „Meta” pod siatką na kolumnie 26 (`layout.test.ts:94-113`, archiwum `teen-meta-beside-exit`).
- `layout.test.ts` sprawdza: ściany 10 mm od boków i co najmniej 10 od góry i dołu (`:15-25`), „Meta” pod siatką i co najmniej 10 od krawędzi (`:27-39`), znak 30×30 na wejściu ze spodem na górze siatki i `mark.y >= 0` (`:41-52`), „Start” w górnym paśmie (`:54-65`).
- `layout.ts` jest w `mutate` w `stryker.config.json`; `layout.test.ts` jest w komendzie Strykera.

## Desired End State

- Na poziomach 3 lata do 7–8 lat blok schodzi o `s`, wspólne dla wersji z postacią i ze „Start” na danej siatce. Przy postaci biały pas nad górą znaku równa się białemu pasowi pod dolną krawędzią napisu „Meta” (środek napisu + 3,5 mm). Dla siatek z produktu: 9×11 `s` ≈ 7,65 mm, pasy ≈ 10,0 mm; 13×16 `s` ≈ 7,86 mm, pasy ≈ 9,4 mm; 17×21 `s` ≈ 7,96 mm, pasy ≈ 9,1 mm.
- Wersja ze „Start” na tych poziomach schodzi o to samo `s`: ok. 25 mm bieli nad „Start” i ok. 9–10 mm pod „Meta”.
- Ściany labiryntu zostają co najmniej 10 mm od każdej krawędzi kartki (od dołu ok. 23 mm). Odstępy wewnątrz bloku, rozmiar znaku 30×30 i kolumny napisów się nie zmieniają.
- Poziom nastolatka wygląda dokładnie jak dziś.
- Wydruk do PDF w Chrome na komputerze i w Safari na iPhonie jest jedną stroną z przesuniętym blokiem.

### Key Discoveries:

- Wzór przesunięcia przy postaci: `s = (pageHeight − metaY − labelHeight/2 − originY + markSize) / 2`, liczony z dzisiejszych `originY` i `metaY`; wtedy `originY + s − markSize = pageHeight − (metaY + s + labelHeight/2)`.
- Przesunięcie zależy od poziomu, nie od wyboru postaci, więc `layoutSheet` potrzebuje informacji „ten poziom pokazuje postać” (`level.showCharacter`), a nie tylko `characterSelected`. Brak obrazka postaci (`characterSrc === null`) na poziomie z postacią daje „Start” przesunięty o to samo `s`.
- `test-plan.md` §5 opisuje dziś znacznik: „Góra znacznika nie musi mieć 10 od krawędzi”. Zostaje prawdą (przy 13×16 i 17×21 pas ma ok. 9,1–9,4 mm), ale opis położenia bloku trzeba dopisać.

## What We're NOT Doing

- Poziom nastolatka: bez przesunięcia i bez zmian w teście `nastolatek`.
- Druk z iPhone'a z podwójnym marginesem (`print-printer-margins`, #38): osobna zmiana, planowana po S-11 na nowym układzie.
- Rozmiar znaku postaci (zostaje 30×30), odstęp „Meta” od siatki, kolumny „Start” i „Meta”, szerokość siatki i inset 10 mm z boków.
- Wyrównanie wersji ze „Start”: schodzi o to samo `s`, więc jej góra i dół będą nierówne (decyzja użytkowniczki: „wszystko o tyle samo w dół”).
- `@page`, `@media print` i `print-contract.test.ts`.

## Implementation Approach

Jedna zmiana w czystym module układu z testami, potem ręczny druk. `layoutSheet` dostaje informację o poziomie z postacią i wysokość napisu, liczy `s` i dodaje je do wszystkich współrzędnych pionowych bloku. `MazeSheet` przekazuje `level.showCharacter` i wysokość napisu z tej samej stałej, której używa `fontSize`.

## Phase 1: Przesunięcie bloku w `layoutSheet`

### Overview

Układ liczy i stosuje wspólne przesunięcie bloku dla poziomów z postacią; testy pilnują równych pasów, wspólnego `s` i niezmienionego nastolatka.

### Changes Required:

#### 1. Układ kartki

**File**: `src/lib/sheet/layout.ts`

**Intent**: Na poziomie, który pokazuje postać, cały blok (siatka, znak albo „Start”, „Meta”) schodzi o `s` liczone tak, by przy znaku postaci biały pas nad nim równał się białemu pasowi pod napisem „Meta”. Na innych poziomach układ jest bez zmian.

**Contract**: `SheetLayoutInput` dostaje dwa pola: `levelShowsCharacter: boolean` i `labelHeight: number` (wysokość napisu w jednostkach strony; dolna krawędź „Meta” to `meta.y + labelHeight / 2`). Przy `levelShowsCharacter === false` wynik jest identyczny z dzisiejszym. Przy `true` `maze.y`, `meta.y`, `start.y` i `mark.y` są dzisiejszymi wartościami powiększonymi o to samo `s = (pageHeight − metaY − labelHeight/2 − originY + markSize) / 2`, niezależnie od `characterSelected`. Pozycje poziome bez zmian.

#### 2. Rysunek kartki

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: `MazeSheet` przekazuje do układu, czy poziom pokazuje postać, i wysokość napisu z tej samej stałej co `fontSize` napisów.

**Contract**: Nowa stała modułu dla rozmiaru napisu (7) używana w obu `<text fontSize>` i jako `labelHeight`; `levelShowsCharacter: level.showCharacter`. `characterSelected` bez zmian.

#### 3. Testy układu

**File**: `src/lib/sheet/layout.test.ts`

**Intent**: Testy opisują nową regułę zamiast dzisiejszego położenia i pilnują granic.

**Contract**: Pomocnicze `layoutFor` / `layoutForLevel` przekazują `levelShowsCharacter` i `labelHeight: 7`. Nowe przypadki:

- Dla każdego poziomu z postacią (`showCharacter`): przy `characterSelected: true` `mark.y` (biały pas nad znakiem) równa się `297 − (meta.y + 3,5)` z dokładnością 0,01.
- Dla każdego poziomu z postacią: `maze.y` jest takie samo przy `characterSelected: true` i `false`, a `start.y` ze „Start” jest dzisiejszym `start.y` plus to samo przesunięcie co `maze.y`.
- Dla każdego poziomu z postacią: ściany co najmniej 10 od góry i od dołu, „Meta” (środek) co najmniej 10 od dołu, `mark.y >= 0`.
- `nastolatek`: `maze.y`, `meta.y` i `start.y` są równe wartościom przy `levelShowsCharacter: false` (dzisiejsze), test istniejący zostaje.
  Dotychczasowe asercje o znaku 30×30 na wejściu, „Meta” pod siatką i kolumnach zostają.

### Success Criteria:

#### Automated Verification:

- Testy produktu przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Sprawdzenie typów przechodzi: `npx astro check`
- Build przechodzi: `npm run build`
- Playwright przechodzi: `npx playwright test`
- Zawężony Stryker na `layout.ts` nie zostawia przeżytego mutanta, który zmienia położenie bloku widoczne dla rodzica: `npx stryker run --mutate "src/lib/sheet/layout.ts"`

#### Manual Verification:

- Na ekranie przy 5 latach z postacią biały pas nad postacią i pod „Meta” wyglądają na równe, a przy nastolatku karta wygląda jak przed zmianą

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie użytkowniczki przed fazą 2.

---

## Phase 2: Ręczny druk i dokumenty

### Overview

Dowód na wydruku i opis nowej reguły w planie testów.

### Changes Required:

#### 1. Plan testów

**File**: `context/foundation/test-plan.md`

**Intent**: §5 opisuje położenie bloku: na poziomach z postacią blok schodzi tak, że biały pas nad znakiem równa się pasowi pod „Meta”, „Start” schodzi o tyle samo, nastolatek bez zmian.

**Contract**: Akapit „Układ kartki” w §5; zdanie „Góra znacznika nie musi mieć 10 od krawędzi” zostaje.

### Success Criteria:

#### Automated Verification:

- Commit dokumentu przechodzi przez lint-staged (Prettier)

#### Manual Verification:

- Druk do PDF w Chrome na komputerze (marginesy domyślne, bez nagłówków i stopek): 3 lata i 7–8 lat, z postacią i bez; jedna strona, biały pas nad postacią i pod „Meta” na oko równy, ściany nieobcięte
- Druk w Safari na iPhonie: te same cztery karty; jedna strona, blok niżej niż przed zmianą (szerszy margines iOS zostaje w `print-printer-margins`)
- Poziom nastolatka drukuje się jak przed zmianą

---

## Testing Strategy

### Unit Tests:

- `layout.test.ts`: równe pasy przy postaci na każdym poziomie z postacią, wspólne przesunięcie dla „Start”, granice 10 mm dla ścian, nastolatek bez zmian.

### Integration Tests:

- `npx playwright test`: istniejące testy układu strony (`phone-layout`, `level-bar`, `seed`) mają przejść bez zmian, bo zmienia się tylko wnętrze SVG.

### Manual Testing Steps:

1. Wygeneruj 3 lata z postacią i bez, wydrukuj do PDF w Chrome, porównaj biały pas nad postacią i pod „Meta”.
2. Powtórz dla 7–8 lat i dla nastolatka.
3. Powtórz druk 3 lat i 7–8 lat w Safari na iPhonie.

## Performance Considerations

Brak. Jedno dodawanie na współrzędnych.

## Migration Notes

Brak danych do migracji.

## References

- Roadmapa: `context/foundation/roadmap.md` (S-11), issue drpc1/printo-kids#35
- Układ: `src/lib/sheet/layout.ts:41-78`, testy `src/lib/sheet/layout.test.ts`
- Rysunek: `src/components/WorksheetGenerator.tsx:326-381`
- Decyzja o znaku 30 mm w pasie 10 mm: `context/archive/2026-10-04-maze-character-choice/reviews/impl-review.md`, PRD (US-04, margines dotyczy ścian i ramki)
- Druk z iPhone'a: `context/changes/print-printer-margins/change.md`, #38

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Przesunięcie bloku w `layoutSheet`

#### Automated

- [x] 1.1 Testy produktu przechodzą: `npm test` — 5ad9265
- [x] 1.2 Lint przechodzi: `npm run lint` — 5ad9265
- [x] 1.3 Sprawdzenie typów przechodzi: `npx astro check` — 5ad9265
- [x] 1.4 Build przechodzi: `npm run build` — 5ad9265
- [x] 1.5 Playwright przechodzi: `npx playwright test` — 5ad9265
- [x] 1.6 Zawężony Stryker na `layout.ts` nie zostawia przeżytego mutanta, który zmienia położenie bloku widoczne dla rodzica: `npx stryker run --mutate "src/lib/sheet/layout.ts"` — 5ad9265

#### Manual

- [x] 1.7 Na ekranie przy 5 latach z postacią biały pas nad postacią i pod „Meta” wyglądają na równe, a przy nastolatku karta wygląda jak przed zmianą — 5ad9265

### Phase 2: Ręczny druk i dokumenty

#### Automated

- [x] 2.1 Commit dokumentu przechodzi przez lint-staged (Prettier)

#### Manual

- [ ] 2.2 Druk do PDF w Chrome na komputerze (marginesy domyślne, bez nagłówków i stopek): 3 lata i 7–8 lat, z postacią i bez; jedna strona, biały pas nad postacią i pod „Meta” na oko równy, ściany nieobcięte
- [ ] 2.3 Druk w Safari na iPhonie: te same cztery karty; jedna strona, blok niżej niż przed zmianą (szerszy margines iOS zostaje w `print-printer-margins`)
- [ ] 2.4 Poziom nastolatka drukuje się jak przed zmianą
