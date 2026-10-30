# Tytuł kartki przeglądarki to nazwa karty pracy Implementation Plan

## Overview

Strona każdego generatora ma w tytule zakładki samą nazwę karty z katalogu (np. „Labirynt”). Katalog na `/` zostaje „PrintoKids”. Źródło: GitHub issue 163.

## Current State Analysis

Wszystkie siedem stron przekazuje `title="PrintoKids"` do `Layout` (`src/pages/index.astro:6`, `maze.astro:7`, `symmetry.astro:7`, `sudoku.astro:7`, `sequences.astro:7`, `nonogram.astro:7`, `dictation.astro:7`). Nazwy kart już istnieją w jednym miejscu: `CARD_KINDS` w `src/lib/cards.ts` (id, title, href). `Layout.astro` ma domyślny `title = "PrintoKids"`.

## Desired End State

Zakładka `/maze` pokazuje „Labirynt”, `/symmetry` „Symetria”, `/sudoku` „Sudoku”, `/sequences` „Sekwencje”, `/nonogram` „Nonogram”, `/dictation` „Dyktando graficzne”; `/` pokazuje „PrintoKids”. Tytuł pochodzi z `CARD_KINDS`, więc zmiana nazwy w katalogu zmienia też zakładkę.

### Key Discoveries:

- `CARD_KINDS` jest jedynym źródłem nazw (`src/lib/cards.ts:8`); nie dublujemy literałów w stronach.
- `src/lib/cards.test.ts` jest już w skrypcie `npm test`.
- `tests/e2e/catalog.spec.ts` przechodzi katalog → generator; pasuje do asercji `toHaveTitle`.

## What We're NOT Doing

- Bez sufiksu marki („Labirynt – PrintoKids”): decyzja, tytuł to sama nazwa karty.
- Bez zmiany `<title>` katalogu, manifestu ani `lang`.
- Bez dynamicznej zmiany tytułu po stronie klienta.

## Implementation Approach

Dodać w `cards.ts` helper zwracający nazwę karty po id, a każdą stronę generatora zmusić do użycia go w `<Layout title=...>`. Jedna faza.

## Phase 1: Tytuły stron kart

### Overview

Helper, sześć stron, testy.

### Changes Required:

#### 1. Helper nazwy karty

**File**: `src/lib/cards.ts`

**Intent**: Dać stronom jedno miejsce, z którego biorą nazwę karty.

**Contract**: `export function cardTitle(id: CardKind["id"]): string` zwraca `title` z `CARD_KINDS`; rzuca błędem dla nieznanego id (literówka ma wywalić build, nie dać pusty tytuł).

#### 2. Strony generatorów

**File**: `src/pages/{maze,symmetry,sudoku,sequences,nonogram,dictation}.astro`

**Intent**: Zamienić `title="PrintoKids"` na nazwę karty.

**Contract**: `<Layout title={cardTitle("<id>")} lang="pl">`, id: labirynt, symetria, sudoku, sekwencje, nonogram, dyktando. `index.astro` bez zmian.

#### 3. Testy

**Files**: `src/lib/cards.test.ts`, `tests/e2e/catalog.spec.ts`

**Intent**: Pilnować nazw w tytułach.

**Contract**: unit — `cardTitle` zwraca tytuł dla każdego id z `CARD_KINDS` i rzuca dla nieznanego. E2E (chromium) — `/` ma tytuł „PrintoKids”, a każda z sześciu ścieżek z `CARD_KINDS` ma tytuł równy nazwie karty.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- E2E tytułów przechodzi: `npx playwright test tests/e2e/catalog.spec.ts --project=chromium`

#### Manual Verification:

- W zakładce każdej z sześciu stron widać samą nazwę karty, na `/` „PrintoKids”.

**Implementation Note**: Po automatach zatrzymaj się na ręczne potwierdzenie.

---

## Testing Strategy

### Unit Tests:

- `cardTitle` dla wszystkich id; nieznane id rzuca.

### Integration Tests:

- Playwright: `toHaveTitle` na `/` i sześciu stronach kart.

### Manual Testing Steps:

1. `npm run dev`, otworzyć każdą stronę, sprawdzić zakładkę.

## References

- GitHub issue 163
- `src/lib/cards.ts:8`, `src/layouts/Layout.astro:9`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Tytuły stron kart

#### Automated

- [x] 1.1 Testy jednostkowe przechodzą: `npm test` — 45b7a7d
- [x] 1.2 Lint przechodzi: `npm run lint` — 45b7a7d
- [x] 1.3 Typy przechodzą: `npx astro check` — 45b7a7d
- [x] 1.4 Build przechodzi: `npm run build` — 45b7a7d
- [x] 1.5 E2E tytułów przechodzi: `npx playwright test tests/e2e/catalog.spec.ts --project=chromium` — 45b7a7d

#### Manual

- [x] 1.6 W zakładce każdej z sześciu stron widać samą nazwę karty, na `/` „PrintoKids”. — 45b7a7d
