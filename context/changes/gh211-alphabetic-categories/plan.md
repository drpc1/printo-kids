# Lista kategorii alfabetycznie (GitHub 211) Implementation Plan

## Overview

Lista „Kategoria” na pasku i w oknie wyboru (symetria, nonogram, dyktando) pokazuje kategorie w kolejności dopisanej według PRD. Ma iść alfabetycznie po polskich etykietach, a „Wszystkie” ma zostać pierwsze.

## Current State Analysis

`OBJECT_CATEGORY_CHOICES` w `src/lib/symmetry/templates.ts` to „Wszystkie” plus rozsypane `OBJECT_CATEGORIES` z `src/lib/symmetry/template-format.ts` (kolejność PRD: Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny, Domy i budowle, Kształty). Test „the bar lists Wszystkie first…” w `src/lib/object-categories.test.ts` trzyma tę kolejność etykiet.

## Desired End State

Pasek pokazuje: Wszystkie, Domy i budowle, Jedzenie, Kosmos i maszyny, Kształty, Przyroda, Zwierzęta. Nowa kategoria sama wpada w swoje miejsce alfabetu. Losowanie obiektów, identyfikatory kategorii i zapisane ustawienia bez zmian.

### Key Discoveries:

- Kolejność listy wynika z jednego miejsca: `src/lib/symmetry/templates.ts` (`OBJECT_CATEGORY_CHOICES`).
- `OBJECT_CATEGORIES` jest używane też w testach jako lista id; jego kolejność nie ma znaczenia dla losowania.

## What We're NOT Doing

- Nie zmieniamy `OBJECT_CATEGORIES` ani identyfikatorów kategorii.
- Nie ruszamy losowania obiektów ani zapisu kategorii w profilu i ostatnich parametrach.
- Nie robimy ręcznej tablicy kolejności.

## Implementation Approach

Posortować wpisy kategorii w `OBJECT_CATEGORY_CHOICES` po etykiecie porównaniem dla języka polskiego (`localeCompare` z `"pl"`), a „Wszystkie” dostawić na początek. Test pilnuje jawnej listy etykiet, więc różnice ICU w środowisku wyjdą w teście.

## Phase 1: Sortowanie listy i test

### Overview

Zmiana kolejności w jednym miejscu, aktualizacja testu i opisu w PRD.

### Changes Required:

#### 1. Lista wyborów kategorii

**File**: `src/lib/symmetry/templates.ts`

**Intent**: Kategorie po „Wszystkie” idą alfabetycznie po polskich etykietach, nie według PRD. Zaktualizować komentarz nad stałą.

**Contract**: `OBJECT_CATEGORY_CHOICES` zachowuje typ `readonly { id: ObjectCategoryChoiceId; label: string }[]`; pierwszy wpis to `wszystkie`; reszta posortowana po `label` z `localeCompare(…, "pl")`, bez mutowania `OBJECT_CATEGORIES`.

#### 2. Test kolejności

**File**: `src/lib/object-categories.test.ts`

**Intent**: Zmienić oczekiwaną listę etykiet i nazwę testu; porównanie z `CATEGORIES` zrobić niezależne od kolejności (zbiór id), bo `CATEGORIES` idzie w kolejności PRD.

**Contract**: Oczekiwane etykiety: `["Wszystkie", "Domy i budowle", "Jedzenie", "Kosmos i maszyny", "Kształty", "Przyroda", "Zwierzęta"]`; każda kategoria dokładnie raz.

#### 3. PRD

**File**: `context/foundation/prd.md`

**Intent**: US-20 wymienia kategorie w starej kolejności; dopisać, że pasek układa je alfabetycznie po „Wszystkie”.

**Contract**: Zdanie w US-20 („Na pasku strony jest wybór „Kategoria”…”).

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`

#### Manual Verification:

- Na stronach symetrii, nonogramu i dyktanda lista „Kategoria” (pasek i okno) pokazuje kolejność alfabetyczną z „Wszystkie” na górze
- Wybór kategorii i jej zapamiętanie w profilu działają jak przedtem

**Implementation Note**: Po automatycznych testach zatrzymać się na ręczne potwierdzenie.

---

## Testing Strategy

### Unit Tests:

- Kolejność etykiet na pasku (jawna lista), „Wszystkie” pierwsze, każda kategoria raz.

### Manual Testing Steps:

1. Otworzyć `/symmetry`, `/nonogram`, dyktando i sprawdzić listę kategorii.
2. Wybrać „Kształty”, wygenerować kartę, odświeżyć i sprawdzić, że wybór został.

## References

- Issue: GitHub 211
- `src/lib/symmetry/templates.ts`, `src/lib/symmetry/template-format.ts:6`, `src/lib/object-categories.test.ts:49`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Sortowanie listy i test

#### Automated

- [x] 1.1 Testy przechodzą: `npm test` — e8e4ff2
- [x] 1.2 Lint przechodzi: `npm run lint` — e8e4ff2
- [x] 1.3 Typy przechodzą: `npx astro check` — e8e4ff2

#### Manual

- [x] 1.4 Na stronach symetrii, nonogramu i dyktanda lista „Kategoria” (pasek i okno) pokazuje kolejność alfabetyczną z „Wszystkie” na górze — e8e4ff2
- [x] 1.5 Wybór kategorii i jej zapamiętanie w profilu działają jak przedtem — e8e4ff2
