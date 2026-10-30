# Auto i autobus w katalogu obiektów symetrii (GH #118) Implementation Plan

## Overview

Dodajemy do katalogu szablonów dwa obiekty, `auto` i `autobus`, w kategorii „Kosmos i maszyny”, w trzech rozmiarach połowy (4×12, 6×15, 9×24). Oba w widoku z boku, stylizowane tak, by były symetryczne lewo–prawo (kabina na osi, jednakowe końce). Nonogram i dyktando biorą obiekty z tego samego katalogu, więc nowe pojazdy trafiają też tam, o ile przejdą ich odrzucenia.

## Current State Analysis

- Kategoria „Kosmos i maszyny” ma 4 obiekty (rakieta, robot, balon, UFO) w `src/lib/symmetry/objects/kosmos.ts`; eksport `KOSMOS` trzyma tablice `half4`, `half6`, `half9` (`kosmos.ts:534-538`).
- Szablon to `SymmetryTemplate` z `base`, `parts` (warianty części), `holeColor`, `categories` (`template-format.ts`). Rysunek czyta `drawing()`, litery kolorów: r g y b o s k n.
- Katalog składa `templates.ts:31`; kategorie w `OBJECT_CATEGORIES` (`template-format.ts`).
- `templates.test.ts` sprawdza dla każdego obiektu i rozmiaru: te same obiekty w każdym rozmiarze, szerokość 4/6/≤9, sylwetka w jednym kawałku bez styku rogami, kategorie.
- Nie ma osobnych list obiektów poza plikami kategorii; `grep` po `balon`/`ufo` trafia tylko w `kosmos.ts`.

## Desired End State

Generuj na karcie symetrii, nonogramie i dyktandzie potrafi wylosować auto i autobus (kategoria „Wszystkie” lub „Kosmos i maszyny”) w każdym poziomie. Testy katalogu przechodzą z dwoma nowymi obiektami, a pojazdy są czytelne na podglądzie w połowie 4×12.

### Key Discoveries:

- Dodanie obiektu do istniejącej kategorii nie dotyka ustawień profilu ani listy kategorii (`templates.ts:31`).
- Szablon 4×12 musi mieć co najmniej 3 zamalowane kratki na osi (kratki podpowiedzi poziomu 1 to ich lustra), komentarz w `kosmos.ts:89-90`.
- Obiekt nie może mieć części stykających się tylko rogiem, bo psuje obrys dyktanda (`templates.test.ts`, `CORNER_TOUCH_ALLOWED`).

## What We're NOT Doing

- Nowej kategorii „Pojazdy” (decyzja: zostaje „Kosmos i maszyny”).
- Widoku z przodu i z góry.
- Zmian w generatorze, układzie karty, nonogramie, dyktandzie, ustawieniach profilu.
- Dodatkowych pojazdów poza autem i autobusem.

## Implementation Approach

Rysujemy pojazd w widoku z boku, w którym przód i tył są takie same: kabina (dach i okna) na osi, nadwozie przez całą szerokość połowy, po jednym kole w połowie. Autobus jest dłuższy w proporcji do wysokości: rząd okien, duże nadwozie. Auto ma niską, wąską kabinę. W każdym rozmiarze ułożenie w ramce odpowiada innym obiektom (oś w ostatniej kolumnie). Części losowane: kształt kabiny lub dachu, układ okien, bagażnik lub kogut (warianty różne, ale każdy w jednym kawałku bez styku rogami).

## Phase 1: Szablony auta i autobusu

### Overview

Dwa obiekty w trzech rozmiarach w `kosmos.ts`, dopisane do `KOSMOS`.

### Changes Required:

#### 1. Szablony pojazdów

**File**: `src/lib/symmetry/objects/kosmos.ts`

**Intent**: Na podstawie zatwierdzonej makiety (`mockup-drawings.json`) dodać `CAR_4`, `CAR_6`, `CAR_9` i `BUS_4`, `BUS_6`, `BUS_9` w stylu istniejących szablonów, z `holeColor` dla okien i `categories: ["kosmos"]`, i dopisać je do `half4`, `half6`, `half9`.

**Contract**: ids `auto` i `autobus` takie same w każdym rozmiarze; szerokość 4 / 6 / ≤9; w 4×12 co najmniej 3 zamalowane kratki w kolumnie osi; sylwetka w jednym kawałku bez styku rogami w co najmniej jednym zestawie wariantów; kolory tylko z ośmiu liter `drawing()`.

### Success Criteria:

#### Automated Verification:

- Testy katalogu przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`

#### Manual Verification:

- Auto i autobus są rozpoznawalne na podglądzie karty symetrii w poziomach 1, 2 i 4 (4×12, 6×15, 9×24)
- Odbicie daje pojazd z jednakowymi końcami, bez dziwnych szwów na osi

---

## Phase 2: Testy, nonogram i dyktando, PRD

### Overview

Pilnujemy obecności pojazdów w każdym rozmiarze, sprawdzamy odrzucenia nonogramu i dyktanda oraz uzupełniamy dokumentację.

### Changes Required:

#### 1. Test obecności obiektów

**File**: `src/lib/symmetry/templates.test.ts`

**Intent**: Dodać test, że `auto` i `autobus` są w kategorii „Kosmos i maszyny” w każdym z trzech rozmiarów.

**Contract**: Używa `symmetryTemplatesFor(levelId)` i `SIZES` jak sąsiednie testy; nie pinuje liczby wariantów.

#### 2. Katalog w PRD

**File**: `context/foundation/prd.md`

**Intent**: W tabeli „Katalog szablonów obiektów” dopisać auto ✓ i autobus ✓ w wierszu „Kosmos i maszyny”, poprawić liczbę obiektów 22 → 24 i dopisać, że pojazdy są wyjątkiem od „pionowy”: widok z boku, niski i szeroki, wypełnia całą szerokość siatki.

**Contract**: Edycja zdań w sekcji „Katalog szablonów obiektów” bez zmiany reguł kart.

### Success Criteria:

#### Automated Verification:

- Wszystkie testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Budowanie przechodzi: `npm run build`

#### Manual Verification:

- Kilkakrotne Generuj w nonogramie i dyktandzie (kategoria „Kosmos i maszyny”) pokazuje auto i autobus lub wybiera inne obiekty bez błędu
- Pojazdy mieszczą się na karcie w marginesie 10 mm na telefonie

---

## Testing Strategy

### Unit Tests:

- Istniejące testy katalogu obejmują nowe obiekty automatycznie (jeden kawałek, brak styku rogami, szerokość, kategorie, co najmniej cztery obiekty).
- Nowy test obecności `auto` i `autobus` w każdym rozmiarze.

### Integration Tests:

- Istniejące testy nonogramu i dyktanda przechodzą z nowymi obiektami; generator pomija warianty, które łamią ich reguły.

### Manual Testing Steps:

1. Otwórz `/symmetry`, wybierz kategorię „Kosmos i maszyny”, klikaj Generuj aż pojawi się auto i autobus; sprawdź poziomy 1, 2, 4.
2. Włącz kolory i sprawdź kolory kratek i okien.
3. To samo na nonogramie (poziomy łatwy, średni, trudny) i dyktandzie.

## Performance Considerations

Dwa obiekty więcej w katalogu; wpływ na czas Generuj pomijalny.

## References

- Issue: GH #118
- Wzorzec szablonu: `src/lib/symmetry/objects/kosmos.ts:281-532` (balon, UFO)
- Format: `src/lib/symmetry/template-format.ts`
- Testy katalogu: `src/lib/symmetry/templates.test.ts`
- Zatwierdzona makieta (2026-10-30): `context/changes/gh118-car-bus/mockup-drawings.json`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Szablony auta i autobusu

#### Automated

- [x] 1.1 Testy katalogu przechodzą: `npm test` — 46f763a
- [x] 1.2 Lint przechodzi: `npm run lint` — 46f763a
- [x] 1.3 Typy przechodzą: `npx astro check` — 46f763a

#### Manual

- [x] 1.4 Auto i autobus są rozpoznawalne na podglądzie karty symetrii w poziomach 1, 2 i 4 (4×12, 6×15, 9×24) — 46f763a
- [x] 1.5 Odbicie daje pojazd z jednakowymi końcami, bez dziwnych szwów na osi — 46f763a

### Phase 2: Testy, nonogram i dyktando, PRD

#### Automated

- [x] 2.1 Wszystkie testy przechodzą: `npm test`
- [x] 2.2 Lint przechodzi: `npm run lint`
- [x] 2.3 Budowanie przechodzi: `npm run build`

#### Manual

- [x] 2.4 Kilkakrotne Generuj w nonogramie i dyktandzie (kategoria „Kosmos i maszyny”) pokazuje auto i autobus lub wybiera inne obiekty bez błędu
- [x] 2.5 Pojazdy mieszczą się na karcie w marginesie 10 mm na telefonie
