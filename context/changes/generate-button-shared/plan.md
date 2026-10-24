# Wspólny GenerateButton w generatorach — Implementation Plan

## Overview

Usunąć trzy lokalne kopie `GenerateButton` i `ACTION_BUTTON_CLASS` z Labiryntu, Symetrii i Sudoku i przepiąć je na wspólny `@/components/GenerateButton` (GitHub issue #81, `Closes #81`). Bez zmiany wyglądu ani zachowania.

## Current State Analysis

`src/components/GenerateButton.tsx` (dodany w S-16, PR #82) eksportuje `GenerateButton({ onClick, tone, disabled, className? })` i `ACTION_BUTTON_CLASS`; używa go tylko `SequenceGenerator.tsx`. Trzy generatory mają lokalne kopie.

Porównanie kopii ze wspólnym plikiem (wykonane przy planowaniu): w `WorksheetGenerator.tsx`, `SymmetryGenerator.tsx` i `SudokuGenerator.tsx` stała `ACTION_BUTTON_CLASS` (ten sam ciąg klas i ten sam komentarz o `has-[>svg]`) oraz komponent `GenerateButton` (te same propsy, `variant` zależny od `tone`, `<Shuffle aria-hidden />`, tekst „Generuj”, `cn(ACTION_BUTTON_CLASS, className)`) są identyczne ze wspólnym plikiem. Nie ma różnic, które wymagałyby przerwania.

## Desired End State

Żaden generator nie definiuje własnego `GenerateButton` ani `ACTION_BUTTON_CLASS`. Cztery generatory (Labirynt, Symetria, Sekwencje, Sudoku) importują oba symbole z `@/components/GenerateButton`. Strony `/labirynt`, `/symetria`, `/sudoku` wyglądają i działają jak przed zmianą.

### Key Discoveries:

- `src/components/SequenceGenerator.tsx:3` — wzorzec importu: `import { ACTION_BUTTON_CLASS, GenerateButton } from "@/components/GenerateButton";`
- `Shuffle` jest w każdej z trzech kopii używany wyłącznie wewnątrz lokalnego `GenerateButton`, więc import z `lucide-react` zostaje tylko dla `Printer` (Labirynt: `ChevronDown, Printer`).
- `Button` zostaje importowany w każdym generatorze (używa go przycisk Drukuj).
- `src/lib/sheet/print-contract.test.ts` czyta pliki generatorów pod kątem zapisów `className={cn("…")}`; te zapisy nie są dotykane.

## What We're NOT Doing

- Żadnych nowych abstrakcji ani zmian we wspólnym `GenerateButton.tsx`.
- Bez zmian w logice generowania, profilu i druku.
- Bez zmian w zapisach `className={cn("…")}` czytanych przez `print-contract.test.ts`.
- Bez przepinania przycisku Drukuj na osobny komponent; zmienia się tylko źródło stałej `ACTION_BUTTON_CLASS`.

## Implementation Approach

Mechaniczna edycja trzech plików w jednej fazie, potem pełna weryfikacja.

## Phase 1: Przepięcie generatorów na wspólny przycisk

### Overview

W `WorksheetGenerator.tsx`, `SymmetryGenerator.tsx` i `SudokuGenerator.tsx` usunąć lokalne kopie i użyć wspólnego pliku.

### Changes Required:

#### 1. Trzy generatory

**File**: `src/components/WorksheetGenerator.tsx`, `src/components/SymmetryGenerator.tsx`, `src/components/SudokuGenerator.tsx`

**Intent**: Usunąć lokalną stałą `ACTION_BUTTON_CLASS` (wraz z komentarzem o `has-[>svg]`, który żyje już we wspólnym pliku) i lokalną funkcję `GenerateButton`, usunąć `Shuffle` z importu `lucide-react`, dodać import wspólnych symboli. Miejsca wywołania `<GenerateButton …/>` i `cn(ACTION_BUTTON_CLASS, "flex-1 sm:ml-auto sm:flex-none")` zostają bez zmian.

**Contract**: `import { ACTION_BUTTON_CLASS, GenerateButton } from "@/components/GenerateButton";` (jak w `SequenceGenerator.tsx:3`). Po zmianie w pliku nie ma `Shuffle`, a `Button`, `Printer` i `cn` nadal są używane.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Testy przechodzą (w tym `print-contract.test.ts`): `npm test`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- E2E przechodzi: `E2E_PORT=4398 npx playwright test tests/e2e/catalog.spec.ts tests/e2e/phone-layout.spec.ts`
- W generatorach nie ma lokalnych kopii: `grep -nE "^function GenerateButton|^const ACTION_BUTTON_CLASS" src/components/*Generator.tsx` nic nie zwraca

#### Manual Verification:

- `/labirynt`, `/symetria`, `/sudoku`: duży przycisk Generuj na starcie wygląda jak dotąd
- Po wygenerowaniu karty pasek Generuj (quiet) / Drukuj jest w jednym rzędzie, na telefonie (wąski viewport) przyciski nie nakładają się

**Implementation Note**: Po automatycznej weryfikacji zatrzymaj się na ręczne potwierdzenie.

---

## Testing Strategy

### Unit Tests:

- Istniejące: `print-contract.test.ts` (zapisy `cn("…")` w generatorach). Nowych testów nie trzeba — zmiana nie ma nowego zachowania.

### Integration Tests:

- Playwright: `catalog.spec.ts`, `phone-layout.spec.ts`.

### Manual Testing Steps:

1. Otworzyć `/labirynt`, `/symetria`, `/sudoku`; sprawdzić duży Generuj na starcie.
2. Kliknąć Generuj; sprawdzić pasek Generuj/Drukuj.
3. Powtórzyć w wąskim viewporcie (telefon).

## Performance Considerations

Brak.

## References

- Issue: drpc1/printo-kids#81
- Wspólny komponent: `src/components/GenerateButton.tsx`
- Wzorzec importu: `src/components/SequenceGenerator.tsx:3`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Przepięcie generatorów na wspólny przycisk

#### Automated

- [x] 1.1 Lint przechodzi: `npm run lint` — 4b7f19c
- [x] 1.2 Testy przechodzą (w tym `print-contract.test.ts`): `npm test` — 4b7f19c
- [x] 1.3 Typy przechodzą: `npx astro check` — 4b7f19c
- [x] 1.4 Build przechodzi: `npm run build` — 4b7f19c
- [x] 1.5 E2E przechodzi: `E2E_PORT=4398 npx playwright test tests/e2e/catalog.spec.ts tests/e2e/phone-layout.spec.ts` — 4b7f19c
- [x] 1.6 W generatorach nie ma lokalnych kopii: `grep -nE "^function GenerateButton|^const ACTION_BUTTON_CLASS" src/components/*Generator.tsx` nic nie zwraca

#### Manual

- [x] 1.7 `/labirynt`, `/symetria`, `/sudoku`: duży przycisk Generuj na starcie wygląda jak dotąd
- [x] 1.8 Po wygenerowaniu karty pasek Generuj/Drukuj jest w jednym rzędzie, na telefonie przyciski nie nakładają się — 4b7f19c
