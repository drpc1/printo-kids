# Kreska pod kategoriami sezonowymi — Implementation Plan

## Overview

Na liście kategorii (symetria, nonogram, dyktando, „Skopiuj obrazek”) kategorie sezonowe („Boże Narodzenie” 15.11–6.01, „Zima” 1.12–29.02) mają być oddzielone kreską od kategorii całorocznych, tak jak sezonowe postacie na liście postaci (GitHub 454). Poza oknem dat kategorii i kreski nie ma.

## Current State Analysis

Lista postaci liczy `separatorAfter` (id ostatniego widocznego wiersza sezonowego) w `src/lib/sheet/character.ts:114-126` i rysuje `<Separator />` po tym wierszu w `src/components/ProfileCorner.tsx:663`. Lista kategorii to `CategoryChoice` na wspólnym `LevelChoice` i nie ma kreski. Kolejność już jest dobra: „Wszystkie”, kategorie z oknem, kategorie stałe (`OBJECT_CATEGORY_CHOICES`, `src/lib/symmetry/templates.ts:70`).

## Desired End State

Gdy na liście jest co najmniej jedna kategoria sezonowa, pod ostatnią z nich stoi ta sama kreska (`Separator`) co na liście postaci. Poza oknami dat (lub gdy wszystkie sezonowe są poza oknem) kreski nie ma. Pozostałe karty używające `LevelChoice` (poziomy) są bez zmian.

### Key Discoveries:

- `windowOf(category)` w `templates.ts:62` rozpoznaje kategorię sezonową.
- `objectCategoryChoicesOn(today)` w `templates.ts:87` zwraca już przefiltrowaną listę.
- Wzorzec kreski: `ProfileCorner.tsx:663` z `@/components/ui/separator`.

## What We're NOT Doing

- Bez kreski po „Wszystkie”.
- Bez zmian w kolejności, oknach dat ani w liście postaci.
- Bez nowych tokenów kolorów ani stylów kreski.

## Implementation Approach

Czysta funkcja w `templates.ts` wylicza `separatorAfter` dla danego dnia; `CategoryChoice` przekazuje wynik do `LevelChoice`, który opcjonalnie rysuje `Separator` po tym wierszu. Reszta konsumentów `LevelChoice` nie przekazuje propsa i nie zmienia się.

## Phase 1: Funkcja separatora kategorii

### Overview

Logika bez UI, z testem.

### Changes Required:

#### 1. Funkcja w katalogu kategorii

**File**: `src/lib/symmetry/templates.ts`

**Intent**: Dodać funkcję zwracającą id ostatniej widocznej kategorii z oknem dat w dniu `today`, albo `null`, gdy żadnej nie ma.

**Contract**: `objectCategorySeparatorAfterOn(today: Date): ObjectCategoryChoiceId | null`, oparta na `objectCategoryChoicesOn(today)` i `windowOf`. „Wszystkie” nigdy nie jest zwracane.

#### 2. Test

**File**: `src/lib/object-categories.test.ts`

**Intent**: Pokryć dni: tylko Boże Narodzenie (15–30.11), obie sezonowe (grudzień, styczeń do 6.01), tylko Zima (7.01–29.02), poza oknami (lipiec → `null`).

**Contract**: Oczekiwane wartości: `boze-narodzenie`, `zima`, `zima`, `null`; kolejność z `objectCategoryChoicesOn` zgodna z założeniem, że sezonowe stoją zaraz po „Wszystkie”.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`

#### Manual Verification:

- Brak (logika bez UI)

---

## Phase 2: Kreska w liście kategorii

### Overview

Rysowanie kreski w `LevelChoice` i podłączenie w `CategoryChoice`.

### Changes Required:

#### 1. LevelChoice

**File**: `src/components/LevelChoice.tsx`

**Intent**: Opcjonalny prop `separatorAfter?: Id | null`; po wierszu o tym id rysować `<Separator />` (jak `ProfileCorner.tsx:663`).

**Contract**: Brak propsa = brak zmiany zachowania. Wiersze nadal z `key`, kreska z kluczem `${id}-line`.

#### 2. CategoryChoice

**File**: `src/components/CategoryChoice.tsx`

**Intent**: Przekazać `objectCategorySeparatorAfterOn(today)` do `LevelChoice`, z tej samej daty co lista.

**Contract**: Używa tego samego `useToday()` co `choices`.

### Success Criteria:

#### Automated Verification:

- Lint, format i typy: `npm run lint` oraz `npx astro check`
- Testy: `npm test`
- Zależności: `npm run depcruise`

#### Manual Verification:

- W oknie dat lista kategorii na symetrii ma kreskę pod ostatnią kategorią sezonową; poza oknem nie ma ani kategorii, ani kreski
- Lista poziomów na pozostałych kartach bez kreski i bez zmian

---

## Testing Strategy

### Unit Tests:

- `objectCategorySeparatorAfterOn` dla czterech przypadków z fazy 1.

### Manual Testing Steps:

1. Otworzyć `/symmetry`, otworzyć „Kategoria” i sprawdzić kreskę (data urządzenia w oknie).
2. Powtórzyć na nonogramie, dyktandzie i „Skopiuj obrazek”.

## References

- Issue: GitHub 454
- Wzorzec: `src/components/ProfileCorner.tsx:663`, `src/lib/sheet/character.ts:114`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Funkcja separatora kategorii

#### Automated

- [x] 1.1 Testy przechodzą: `npm test` — 0e4a2f09
- [x] 1.2 Lint przechodzi: `npm run lint` — 0e4a2f09

### Phase 2: Kreska w liście kategorii

#### Automated

- [x] 2.1 Lint, format i typy: `npm run lint` oraz `npx astro check`
- [x] 2.2 Testy: `npm test`
- [x] 2.3 Zależności: `npm run depcruise`

#### Manual

- [ ] 2.4 W oknie dat lista kategorii ma kreskę pod ostatnią kategorią sezonową; poza oknem nie ma kategorii ani kreski
- [ ] 2.5 Lista poziomów na pozostałych kartach bez kreski i bez zmian
