# Nagłówek strony karty i tytuł zakładki Implementation Plan

## Overview

Poprawka do #199 (GitHub issue 163). Tytuł zakładki na stronie karty ma format „PrintoKids - {nazwa karty}”, a duży nagłówek `h1` nad generatorem ma być samą nazwą karty. Katalog na `/` zostaje „PrintoKids” w obu miejscach.

## Current State Analysis

#199 ustawił tytuł zakładki na samą nazwę karty (`cardTitle`). Nagłówek `h1` jest na sztywno „PrintoKids” w `src/components/GeneratorShell.astro:37`, wspólny dla sześciu stron generatorów. `src/pages/index.astro:10` ma własny `h1` „PrintoKids” i nie używa `GeneratorShell`. Nazwy kart są w `CARD_KINDS` (`src/lib/cards.ts`).

## Desired End State

Strona `/maze`: zakładka „PrintoKids - Labirynt”, `h1` „Labirynt”. Analogicznie `/symmetry`, `/sudoku`, `/sequences`, `/nonogram`, `/dictation`. `/` bez zmian.

### Key Discoveries:

- `h1` jest ukryty przy druku (`GeneratorShell.astro`, reguła `@media print`), więc wydruk się nie zmienia.
- `tests/e2e/phone-layout.spec.ts` używa `getByRole("heading", { level: 1 })` tylko do pomiaru pozycji, nie do tekstu.

## What We're NOT Doing

- Bez zmiany katalogu `/` (tytuł i `h1` zostają „PrintoKids”).
- Bez zmiany `manifest`, `lang` ani wydruku.

## Implementation Approach

Jedna faza. Format tytułu w helperze obok `cardTitle`, nagłówek jako wymagany prop `GeneratorShell`, obie wartości z `CARD_KINDS`.

## Phase 1: Tytuł zakładki i nagłówek

### Overview

Helper, prop, sześć stron, testy.

### Changes Required:

#### 1. Helper tytułu zakładki

**File**: `src/lib/cards.ts`

**Intent**: Jedno miejsce formatu tytułu zakładki karty.

**Contract**: `export function cardPageTitle(id): string` zwraca `PrintoKids - ${cardTitle(id)}`.

#### 2. Nagłówek w powłoce generatora

**File**: `src/components/GeneratorShell.astro`

**Intent**: Zamiast stałego „PrintoKids” pokazać nazwę karty.

**Contract**: wymagany prop `heading: string` renderowany w `h1`.

#### 3. Strony generatorów

**File**: `src/pages/{maze,symmetry,sudoku,sequences,nonogram,dictation}.astro`

**Intent**: Przekazać tytuł zakładki i nagłówek.

**Contract**: `<Layout title={cardPageTitle(id)}>` oraz `<GeneratorShell heading={cardTitle(id)}>`.

#### 4. Testy

**Files**: `src/lib/cards.test.ts`, `tests/e2e/catalog.spec.ts`

**Intent**: Pilnować obu wartości.

**Contract**: unit — `cardPageTitle("labirynt")` to „PrintoKids - Labirynt”. E2E (chromium) — `/` ma tytuł „PrintoKids”; każda z sześciu stron ma tytuł „PrintoKids - {nazwa}” i `h1` równy nazwie.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- E2E tytułów i nagłówków przechodzi: `npx playwright test tests/e2e/catalog.spec.ts --project=chromium`
- E2E układu telefonu przechodzi: `npx playwright test tests/e2e/phone-layout.spec.ts --project=phone-360`

#### Manual Verification:

- Na każdej z sześciu stron nagłówek to sama nazwa karty, a zakładka „PrintoKids - nazwa”; na `/` obie „PrintoKids”. Na telefonie nagłówek nie nachodzi na przycisk profilu ani link „Wszystkie karty”.

**Implementation Note**: Po automatach pauza na ręczne potwierdzenie.

---

## Testing Strategy

### Unit Tests:

- `cardPageTitle` dla dwóch kart.

### Integration Tests:

- Playwright: `toHaveTitle` i `h1` na sześciu stronach, tytuł `/`.

### Manual Testing Steps:

1. Otworzyć sześć stron na komputerze i telefonie, sprawdzić nagłówek i zakładkę.

## References

- Poprzednia zmiana: `context/archive/gh163-page-title/` (po archiwizacji) / PR #199
- `src/components/GeneratorShell.astro:37`, `src/lib/cards.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Tytuł zakładki i nagłówek

#### Automated

- [x] 1.1 Testy jednostkowe przechodzą: `npm test` — 49c9950
- [x] 1.2 Lint przechodzi: `npm run lint` — 49c9950
- [x] 1.3 Typy przechodzą: `npx astro check` — 49c9950
- [x] 1.4 Build przechodzi: `npm run build` — 49c9950
- [x] 1.5 E2E tytułów i nagłówków przechodzi: `npx playwright test tests/e2e/catalog.spec.ts --project=chromium` — 49c9950
- [x] 1.6 E2E układu telefonu przechodzi: `npx playwright test tests/e2e/phone-layout.spec.ts --project=phone-360` — 49c9950

#### Manual

- [x] 1.7 Na każdej z sześciu stron nagłówek to sama nazwa karty, a zakładka „PrintoKids - nazwa”; na `/` obie „PrintoKids”. Na telefonie nagłówek nie nachodzi na przycisk profilu ani link „Wszystkie karty”. — 49c9950
