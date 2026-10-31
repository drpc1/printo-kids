# Bramka „tylko context/” liczy zmiany PR od merge-base — Implementation Plan

## Overview

Job `changes` w `.github/workflows/ci.yml` dla PR porównuje czubek `main` (`pull_request.base.sha`) z głową PR dwoma końcami (`git diff base head`). Gdy gałąź jest w tyle za `main`, commity z `src/` i `tests/`, które weszły na `main` po rozgałęzieniu, wyglądają jak zmiany PR i bramka `ci`/`smoke`/`e2e` rusza mimo PR tylko z `context/` (GitHub 249, PR 247). Zmieniamy zakres na `base...head` (od merge-base), jak pokazuje go GitHub, i dodajemy test, który to pilnuje.

## Current State Analysis

- `.github/workflows/ci.yml:21-34`: dla PR `base`/`head` z eventu, dla pusha `before`/`sha`; `git diff -z -M --name-status "$base" "$head"` idzie do `scripts/context-only-diff.mjs`.
- Skrypt bramki jest czytany z `$base` (`git show "$base:scripts/context-only-diff.mjs"`, linia 32), czyli z zaufanego czubka `main`, nie z PR. To zostaje.
- `scripts/context-only-diff.mjs` parsuje wyjście `git diff -z -M --name-status`; `requiresAppGate` zwraca `true`, gdy jakakolwiek ścieżka nie zaczyna się od `context/`.
- `scripts/context-only-diff.test.mjs` testuje tylko parser na syntetycznych buforach; żaden test nie dotyka zakresu diffa ani `ci.yml`. Test jest już w skrypcie `npm test` (`package.json`).
- Job `changes` ma `fetch-depth: 0`, więc merge-base jest dostępny.

## Desired End State

PR, który zmienia tylko `context/`, pomija `ci`, `smoke` i `e2e` niezależnie od tego, jak daleko gałąź jest w tyle za `main`. Push na `main` zostaje przy `before..sha`. `npm test` zawiera test, który odtwarza scenariusz PR 247 w tymczasowym repo git i zawodzi, jeśli `ci.yml` wróci do dwóch końców. Reguła w AGENTS.md („Tests and CI”) zostaje bez zmian w treści.

### Key Discoveries:

- Przyczyna jest w jednej linii: `ci.yml:33` (`"$base" "$head"`); `...` daje merge-base bez zmiany parsera.
- Skrypt bramki pochodzi z `$base` (`ci.yml:32`), więc zmiana skryptu w tym samym PR zadziała dopiero po wejściu na `main`; ta zmiana go nie rusza.
- Brak istniejącego testu na zakres diffa — luka, którą issue każe zamknąć.

## What We're NOT Doing

- Nie zmieniamy `scripts/context-only-diff.mjs` ani jego parsera.
- Nie zmieniamy warunków `if:` jobów `ci`, `smoke`, `e2e` ani zachowania przy błędzie liczenia (nadal uruchamiają wszystko).
- Nie zmieniamy treści reguły w AGENTS.md ani `e2e-phone.yml`.
- Nie dodajemy testu uruchamiającego prawdziwy workflow na GitHubie.

## Implementation Approach

W `ci.yml` wprowadzić zmienną `range`: dla PR `"$base...$head"`, dla pusha `"$base..$head"`, i użyć jej w jednym `git diff`. Test w `scripts/context-only-diff.test.mjs` (a) buduje tymczasowe repo: wspólny przodek, `main` idzie naprzód o zmianę w `src/`, gałąź zmienia tylko `context/`; sprawdza, że dwa końce dają `requiresAppGate === true` (błąd z issue), a `base...head` daje `false`; (b) czyta `ci.yml` i potwierdza, że gałąź `pull_request` ustawia `range="$base...$head"`, więc test zawodzi przy regresji workflow, nie tylko git.

## Phase 1: Zakres od merge-base i test

### Overview

Jedna zmiana w workflow plus test w istniejącym pliku testowym (już w `npm test`).

### Changes Required:

#### 1. Krok diff w jobie `changes`

**File**: `.github/workflows/ci.yml`

**Intent**: Liczyć zmiany PR od merge-base, a nie od czubka `main`; dla pusha zostawić `before..sha`.

**Contract**: Po ustaleniu `base`/`head` ustawić `range` (`"$base...$head"` dla `pull_request`, `"$base..$head"` w przeciwnym razie) i wywołać `git diff -z -M --name-status "$range"`. Sentinel zerowego `base` i `git show "$base:scripts/context-only-diff.mjs"` zostają bez zmian.

#### 2. Test zakresu

**File**: `scripts/context-only-diff.test.mjs`

**Intent**: Pilnować, że PR w tyle za `main`, który zmienia tylko `context/`, nie uruchamia bramki, oraz że `ci.yml` używa zakresu od merge-base.

**Contract**: Nowe `test(...)`: tymczasowe repo przez `git` w `os.tmpdir()` (sprzątane w `finally`), scenariusz jak PR 247 (zmiana `src/` na `main` po rozgałęzieniu, zmiana tylko `context/` na gałęzi); asercje na `requiresAppGate` dla `base head` (true) i `base...head` (false); osobna asercja tekstowa na `ci.yml`. Test ustawia `user.name`/`user.email` lokalnie w repo tymczasowym.

### Success Criteria:

#### Automated Verification:

- Testy bramki przechodzą: `node --test scripts/context-only-diff.test.mjs`
- Cały zestaw przechodzi: `npm test`
- Test zawodzi na dawnym `ci.yml` (cofnięcie zmiany `range` w kroku diff daje czerwony test)
- Lint przechodzi: `npm run lint`
- Format przechodzi: `npx prettier --check .github/workflows/ci.yml scripts/context-only-diff.test.mjs`

#### Manual Verification:

- Po wejściu na `main` PR tylko z `context/` z gałęzi w tyle pokazuje `ci`, `smoke`, `e2e` jako pominięte w zakładce Checks.
- PR zmieniający `src/` nadal uruchamia wszystkie trzy joby.

**Implementation Note**: Weryfikację ręczną na GitHubie da się zrobić dopiero po scaleniu (skrypt i workflow z PR działają dopiero z `main`).

---

## Testing Strategy

### Unit Tests:

- Temp repo: dwa końce → bramka rusza (odtworzony błąd), `base...head` → nie rusza.
- Tekstowa asercja na `ci.yml`.

### Integration Tests:

- Brak osobnych; prawdziwy workflow sprawdza krok ręczny po scaleniu.

### Manual Testing Steps:

1. Po scaleniu otworzyć PR tylko z `context/` z gałęzi w tyle za `main` o zmiany w `src/`.
2. Sprawdzić w Checks, że `ci`, `smoke`, `e2e` są pominięte.

## Performance Considerations

Brak; `fetch-depth: 0` już jest, `...` nie dodaje kosztu.

## References

- GitHub issue 249
- Poprzednia zmiana: `context/archive/2026-10-31-context-only-ci-skip/plan.md`
- Workflow: `.github/workflows/ci.yml:18-34`
- Parser: `scripts/context-only-diff.mjs`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Zakres od merge-base i test

#### Automated

- [x] 1.1 Testy bramki przechodzą: `node --test scripts/context-only-diff.test.mjs`
- [x] 1.2 Cały zestaw przechodzi: `npm test`
- [x] 1.3 Test zawodzi na dawnym `ci.yml` (cofnięcie zmiany `range` w kroku diff daje czerwony test)
- [x] 1.4 Lint przechodzi: `npm run lint`
- [x] 1.5 Format przechodzi: `npx prettier --check .github/workflows/ci.yml scripts/context-only-diff.test.mjs`

#### Manual

- [ ] 1.6 Po wejściu na `main` PR tylko z `context/` z gałęzi w tyle pokazuje `ci`, `smoke`, `e2e` jako pominięte w zakładce Checks
- [ ] 1.7 PR zmieniający `src/` nadal uruchamia wszystkie trzy joby
