# Podpięcie glossary.md do AGENTS.md i CLAUDE.md Implementation Plan

## Overview

Każda sesja agenta ma widzieć słownik domeny (`context/domain/glossary.md`) w instrukcjach, zanim cokolwiek nazwie. Issue drpc1/printo-kids#286.

## Current State Analysis

`CLAUDE.md` importuje `@AGENTS.md`, `@.cursor/rules/commit-pr-moments.mdc` i `@.cursor/rules/10x-course.mdc`. `AGENTS.md` wskazuje pliki przez `@ścieżka`. Glossary istnieje (`context/domain/glossary.md`), ale żaden z plików instrukcji go nie wskazuje.

## Desired End State

`AGENTS.md` ma odwołanie `@context/domain/glossary.md`; `CLAUDE.md` dziedziczy je przez `@AGENTS.md` bez zmian.

## What We're NOT Doing

- Nie edytujemy `CLAUDE.md` (import przez `@AGENTS.md` wystarcza; duplikat ładowałby plik dwa razy).
- Nie dopisujemy nazw z D02 §8: to krok „po zmianie `VerifiedCard`”, osobny i późniejszy.
- Nie zmieniamy treści glossary.

## Implementation Approach

Jedna linia w `AGENTS.md`, w sekcji „Structure and conventions”, w stylu istniejących odwołań.

## Phase 1: Odwołanie w AGENTS.md

### Overview

Dodać zasadę nazewnictwa z importem glossary.

### Changes Required:

#### 1. AGENTS.md

**File**: `AGENTS.md`

**Intent**: Agent ma nazywać rzeczy językiem domeny z glossary przed pisaniem kodu i tekstów.

**Contract**: Nowy punkt w „Structure and conventions” z odwołaniem `@context/domain/glossary.md`.

### Success Criteria:

#### Automated Verification:

- Odwołanie istnieje i plik się rozwiązuje: `grep -n "@context/domain/glossary.md" AGENTS.md` oraz `test -f context/domain/glossary.md`
- Linting passes: `npm run lint`
- Tests pass: `npm test`

#### Manual Verification:

- `CLAUDE.md` dziedziczy odwołanie przez `@AGENTS.md` (bez duplikatu)

---

## Testing Strategy

Brak nowego kodu; sprawdzamy odwołanie i lokalnie lint + test (zmiana poza `context/` uruchamia pełne CI).

## References

- Issue: drpc1/printo-kids#286
- Glossary: `context/domain/glossary.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Odwołanie w AGENTS.md

#### Automated

- [x] 1.1 Odwołanie istnieje i plik się rozwiązuje
- [x] 1.2 Linting passes
- [x] 1.3 Tests pass

#### Manual

- [x] 1.4 CLAUDE.md dziedziczy odwołanie przez @AGENTS.md (bez duplikatu)
