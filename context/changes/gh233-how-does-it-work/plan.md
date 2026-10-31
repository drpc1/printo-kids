# Opisy generatorów w „Jak to działa” — plan wdrożenia

## Overview

Strona `/how-it-works` dostaje sekcję „Rodzaje kart”: dwa–trzy zdania o każdym z sześciu rodzajów kart (co dziecko robi i co jest na kartce) w kolejności alfabetycznej jak w katalogu, oraz jedno zdanie wymieniające karty, przy których lista poziomów pokazuje typowy wiek. Opis każdego rodzaju żyje w `CARD_KINDS`, więc nowy rodzaj dostaje go tam, gdzie powstaje. PRD dostaje nowe kryterium w US-05.

## Current State Analysis

- „Jak to działa” to osobna strona `/how-it-works`, a nie część strony głównej (`src/pages/how-it-works.astro:28`). Prowadzi do niej link w stopce katalogu i stron generatorów (`src/components/SiteFooter.astro`).
- `CardKind` ma tylko `id`, `title`, `href`, `thumbnail` (`src/lib/cards.ts:1-6`); `CARD_KINDS` ma sześć wpisów (`cards.ts:8-15`). Poza testami czyta go jeszcze `src/lib/card-summary.ts:29`.
- Strona ma pięć sekcji w tablicy `sections` (`how-it-works.astro:4-25`), żadna nie opisuje kart. Sekcja „Poziomy” mówi już, że wiek to tylko wskazówka przy niektórych kartach, ale nie wymienia których.
- Test e2e `tests/e2e/how-it-works.spec.ts` sprawdza cztery nagłówki h2 i kilka fraz; nowa sekcja go nie psuje.

## Desired End State

Rodzic wchodzi z katalogu w „Jak to działa” i widzi sekcję „Rodzaje kart” z sześcioma opisami w kolejności: Dyktando graficzne, Labirynt, Nonogram, Sekwencje, Sudoku, Symetria. Sekcja „Poziomy” wymienia karty z typowym wiekiem. Test jednostkowy pilnuje, żeby każdy rodzaj karty miał niepusty opis; test e2e pilnuje, że strona pokazuje opis każdego rodzaju. PRD (US-05) ma kryterium o opisach.

### Key Discoveries:

- Opis przy definicji rodzaju karty spełnia wymóg z issue: `src/lib/cards.ts:8`.
- Strona i stopka są poza wydrukiem (`print:hidden` w stopce), więc zmiana nie dotyka karty A4.
- Fakty do opisów pochodzą z PRD: US-01, US-06, US-10, US-12, US-15, US-17.

## What We're NOT Doing

- Nie dodajemy opisów na stronie głównej ani pod miniaturami (decyzja: zostają tylko na `/how-it-works`).
- Nie zmieniamy katalogu, miniatur ani stopki.
- Nie dzielimy opisu na pola „co robi dziecko” / „co jest na kartce”; jedno pole tekstowe.
- Nie ruszamy US-22 ani FR-031.

## Implementation Approach

Najpierw dane (pole `description` i test), potem widok i test e2e, na końcu PRD. Teksty opisów pisane po PRD, w tonie istniejącej strony (drugą osobą, bez nazw wieku jako nazw poziomów, bez ujawniania rozwiązania nonogramu i dyktanda).

## Faza 1: Opis przy definicji rodzaju karty

### Overview

Każdy rodzaj karty niesie własny opis.

### Changes Required:

#### 1. Model i dane

**File**: `src/lib/cards.ts`

**Intent**: Dodać do `CardKind` wymagane pole `description` i wpisać dwa–trzy zdania dla każdego z sześciu rodzajów, tak by nowy rodzaj nie kompilował się bez opisu.

**Contract**: `CardKind.description: string` (wymagane). Opisy: labirynt — dziecko prowadzi palcem lub kredką od startu do mety jedyną drogą, na kartce jest labirynt ze startem u góry; symetria — dziecko dorysowuje drugą połowę obiektu na kratce, odbicie względem osi; sekwencje — dziecko uzupełnia brakujące kształty i liczby w ciągach; sudoku — dziecko dorysowuje brakujące kształty lub wpisuje cyfry tak, by żaden się nie powtórzył w wierszu, kolumnie i bloku; nonogram — dziecko zamalowuje kratki według liczb (na łatwym według znaczków) i odkrywa obrazek; dyktando graficzne — dziecko rysuje po liniach kratki według strzałek i odkrywa obrys obiektu.

#### 2. Test jednostkowy

**File**: `src/lib/cards.test.ts`

**Intent**: Dopisać test, że każdy rodzaj z `CARD_KINDS` ma niepusty opis (po `trim`), obok testów z `cardTitle`.

**Contract**: Ten sam styl `void describe` / `void test`; plik jest już w skrypcie `npm test`.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Typy przechodzą: `npx astro check`
- Lint przechodzi: `npm run lint`

#### Manual Verification:

- Sześć opisów jest zgodnych z PRD i nie zdradza rozwiązań nonogramu ani dyktanda

**Implementation Note**: Po fazie i zielonej weryfikacji automatycznej poczekaj na potwierdzenie ręczne.

---

## Faza 2: Sekcja „Rodzaje kart” na stronie „Jak to działa”

### Overview

Strona pokazuje opisy w kolejności alfabetycznej i wymienia karty z typowym wiekiem.

### Changes Required:

#### 1. Widok

**File**: `src/pages/how-it-works.astro`

**Intent**: Dodać sekcję „Rodzaje kart” (h2) z podsekcjami h3 po jednej na rodzaj, w kolejności `cardsInCatalogOrder()`, z tytułem jako linkiem do strony generatora i opisem pod nim. Dopisać do sekcji „Poziomy” jedno zdanie, że typowy wiek widać przy labiryncie, symetrii, sekwencjach i dyktandzie, a przy sudoku i nonogramie nie.

**Contract**: Sekcja stoi przed „Profil dziecka” (przed albo po „Poziomy”, decyzja implementera); tylko tokeny kolorów roli, bez Reacta, link z `min-h-11` jak w innych linkach strony.

#### 2. Test e2e

**File**: `tests/e2e/how-it-works.spec.ts`

**Intent**: Dopisać asercje: nagłówek „Rodzaje kart” jest widoczny, a każdy tytuł z katalogu występuje na stronie jako h3 z opisem; kolejność h3 jest alfabetyczna.

**Contract**: Tylko projekt `chromium`, jak pozostałe testy pliku; istniejące asercje bez zmian.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Build przechodzi: `npm run build`
- Typy przechodzą: `npx astro check`
- Lint przechodzi: `npm run lint`
- E2E strony przechodzi: `npx playwright test tests/e2e/how-it-works.spec.ts --project=chromium`

#### Manual Verification:

- Strona czyta się w minutę na telefonie 360 px i na komputerze
- Linki w opisach prowadzą do właściwych generatorów, a „Wszystkie karty” wraca do katalogu

**Implementation Note**: Przed fazą 3 poczekaj na potwierdzenie ręczne.

---

## Faza 3: Kryterium w PRD

### Overview

PRD opisuje nową zawartość strony.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: Dodać do kryteriów US-05 punkt, że strona „Jak to działa” opisuje każdy rodzaj karty w dwóch–trzech zdaniach (co dziecko robi i co jest na kartce), w kolejności katalogu, oraz że opis rodzaju żyje przy jego definicji w kodzie.

**Contract**: Zmienia się wyłącznie lista kryteriów US-05; US-22 i FR-031 bez zmian. Wpis z datą decyzji 2026-10-31 (GitHub 233), jak inne wpisy PRD.

### Success Criteria:

#### Automated Verification:

- Wpis jest w PRD: `grep -c "GitHub 233" context/foundation/prd.md` zwraca co najmniej 1
- Formatowanie przechodzi: `npx prettier --check context/foundation/prd.md`

#### Manual Verification:

- Brzmienie kryterium zatwierdza użytkownik

---

## Testing Strategy

### Unit Tests:

- Każdy rodzaj z `CARD_KINDS` ma niepusty opis

### Integration Tests:

- E2E: sekcja „Rodzaje kart” z sześcioma opisami w kolejności alfabetycznej

### Manual Testing Steps:

1. Otwórz `/` i kliknij „Jak to działa”.
2. Sprawdź sześć opisów i kolejność na telefonie 360 px oraz na komputerze.
3. Kliknij link jednego rodzaju i wróć.

## References

- Related research: `context/changes/gh233-how-does-it-work/research.md`
- Poprzednia zmiana strony: `context/archive/2026-10-31-s32-how-does-it-work/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Opis przy definicji rodzaju karty

#### Automated

- [x] 1.1 Testy przechodzą: `npm test` — bef363d
- [x] 1.2 Typy przechodzą: `npx astro check` — bef363d
- [x] 1.3 Lint przechodzi: `npm run lint` — bef363d

#### Manual

- [x] 1.4 Sześć opisów jest zgodnych z PRD i nie zdradza rozwiązań nonogramu ani dyktanda — bef363d

### Phase 2: Sekcja „Rodzaje kart” na stronie „Jak to działa”

#### Automated

- [x] 2.1 Testy przechodzą: `npm test`
- [x] 2.2 Build przechodzi: `npm run build`
- [x] 2.3 Typy przechodzą: `npx astro check`
- [x] 2.4 Lint przechodzi: `npm run lint`
- [x] 2.5 E2E strony przechodzi: `npx playwright test tests/e2e/how-it-works.spec.ts --project=chromium`

#### Manual

- [x] 2.6 Strona czyta się w minutę na telefonie 360 px i na komputerze
- [x] 2.7 Linki w opisach prowadzą do właściwych generatorów, a „Wszystkie karty” wraca do katalogu

### Phase 3: Kryterium w PRD

#### Automated

- [ ] 3.1 Wpis jest w PRD: `grep -c "GitHub 233" context/foundation/prd.md` zwraca co najmniej 1
- [ ] 3.2 Formatowanie przechodzi: `npx prettier --check context/foundation/prd.md`

#### Manual

- [ ] 3.3 Brzmienie kryterium zatwierdza użytkownik
