# Jak to działa po czterech nowych kartach — plan wdrożenia

## Overview

Sekcja „Poziomy” na `/how-it-works` ma być zgodna z dziesięcioma kartami: które karty mają łatwy / średni / trudny, które numery, i że wiek pokazują tylko cztery stare karty. Opisy rodzajów zostają w `CARD_KINDS` bez zmian.

## Current State Analysis

Patrz `research.md`: opisy kart są gotowe, nieaktualny jest tekst sekcji „Poziomy” (`src/pages/how-it-works.astro:8`).

## What We're NOT Doing

- Nie zmieniamy `CARD_KINDS`, strony głównej, stopki, PRD (US-22 już opisuje stan docelowy).
- Nie dodajemy list ani nowych sekcji; jeden akapit.

## Faza 1: Tekst „Poziomy” i test

#### 1. Tekst

**File**: `src/pages/how-it-works.astro`

**Intent**: Przepisać `text` sekcji „Poziomy”: łatwy / średni / trudny mają nonogram, dyktando graficzne, „Kto ma więcej?”, „Który nie pasuje” i „Skopiuj rysunek na kratce” (sudoku też, z osobnym wyborem rozmiaru); numery mają labirynt (1–6), symetria, sekwencje i szlaczki (1–4). Wiek jako wskazówka tylko przy labiryncie, symetrii, sekwencjach i dyktandzie; pozostałe karty wieku nie mają. Zachować zdania o opisie poziomu i o nieporównywalności numerów.

#### 2. Test e2e

**File**: `tests/e2e/how-it-works.spec.ts`

**Intent**: W teście stron „states the rules” dodać asercje na frazę o szlaczkach i „Kto ma więcej?” w sekcji Poziomy oraz brak starego zdania „sudoku i nonogram wieku nie mają”.

### Success Criteria:

#### Automated Verification:

- `npm run lint`, `npm run depcruise`, `npm test`, `npx astro check`, `npm run build` przechodzą.
- `E2E_PORT=4399 npx playwright test tests/e2e/how-it-works.spec.ts --project=chromium` przechodzi.

#### Manual Verification:

- Sekcja „Poziomy” czyta się poprawnie i zgadza z PRD (US-22, Business Logic „Poziomy”).

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Tekst „Poziomy” i test

#### Automated

- [x] 1.1 Bramki przechodzą: lint, depcruise, test, astro check, build
- [x] 1.2 E2E strony przechodzi

#### Manual

- [x] 1.3 Tekst sekcji „Poziomy” zgadza się z PRD
