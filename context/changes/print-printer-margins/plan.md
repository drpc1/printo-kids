# Wydruk z iPhone'a bez podwójnego marginesu — Implementation Plan

> Przepisany 2026-10-31 po próbie na iPhonie (faza 1, pierwszy krok). Pierwsza wersja zakładała, że iOS w druku zgłasza obszar druku przez `max-width` / `100vw` / `100vh`, i przycinała wewnętrzny margines karty o 9,5 mm. Próba to obaliła (pomiary niżej), więc plan opiera się teraz na zmierzonym zachowaniu iOS.

## Overview

Na iPhonie karta drukuje się dużo mniejsza niż kartka (labirynt ok. 140 mm szerokości na A4, ok. 35 mm białego pasa z boków, ok. 75 mm pod „Meta”). Przyczyną nie jest suma marginesów, tylko reguła druku `max-height: 100vh`: w druku iOS `100vh` to ok. 82 % obszaru druku. Dodajemy wariant dla druku na telefonie, który podnosi ten limit do `116vh`. Wydruk z komputera go nie dostaje i zostaje bez zmian. Issue: drpc1/printo-kids#38.

## Current State Analysis

- Reguły druku są w jednym miejscu: `@media print` w `src/components/GeneratorShell.astro`. `#worksheet-home svg` ma `max-width: 100%; max-height: 100vh` (poprawka S-09, żeby karta mieściła się na jednej stronie, gdy iOS dokłada marginesy). Reguła dotyczy wszystkich 6 kart.
- Pomiary z iPhone'a użytkowniczki, Safari, A4, 2026-10-31 (PDF i zrzuty podglądu druku, labirynt Poziom 3):
  - Obszar druku iOS: ok. 197 × 269 mm (marginesy ok. 6 mm z boków, ok. 14 mm u góry i u dołu na adres i numer strony).
  - `100vh` w druku: ok. 219 mm na kartce, czyli ok. 82 % wysokości obszaru druku. Karta jest ograniczona wysokością i przyklejona do góry.
  - Zapytania w druku: iOS spełnia `max-width: 170mm` i `max-height: 240mm`, choć faktyczny obszar jest większy. Liczby z zapytań nie opisują kartki, ale odróżniają iPhone'a od komputera (komputer: 210 mm, `@page margin: 0`).
  - Warianty limitu: `100vh` → labirynt 140 mm; `116vh` → 162 mm, jedna strona; `122vh` → 171 mm, jedna strona, ok. 1,5 mm zapasu; szerokość 100 % bez limitu wysokości → dwie strony.
- `print-contract.test.ts` czyta `GeneratorShell.astro` i pilnuje bloku bazowego (`@page` 0, `max-width`, `max-height`, `background: none`).
- Safari na iOS dokłada w marginesie adres i numer strony; CSS tego nie wyłącza (poza zakresem).

## Desired End State

Na iPhonie (Safari, Chrome, Brave) karta drukuje się na jednej stronie A4 ok. 16 % większa niż dziś: labirynt Poziomu 3 ok. 162 mm zamiast 140 mm szerokości, ok. 24 mm od ścian do boku kartki zamiast 35 mm. Wydruk z komputera jest identyczny jak dziś.

### Key Discoveries:

- Kartę na iOS ogranicza `max-height: 100vh`, nie wewnętrzny margines 10 mm. Podniesienie limitu daje +16 % przy ok. 5 % zapasu do drugiej strony; `122vh` daje +22 %, ale bez zapasu.
- `@media print and (max-width: 175mm)` spełnia iOS (≤ 170 mm), a nie spełnia komputer (210 mm przy `@page margin: 0`, ≥ 184 mm przy typowych ręcznych marginesach). `(hover: none)` dodatkowo zawęża wariant do urządzeń dotykowych, żeby komputer z nietypowym marginesem nie dostał karty o 16 % wyższej niż jego prawdziwe `100vh`.

## What We're NOT Doing

- Przycinania wewnętrznego marginesu karty ani zmian geometrii kart, `layoutSheet` i `inset` (pierwsza wersja planu; iOS nie daje danych, żeby to policzyć).
- Wrappera `data-sheet` w `CardPage` (wariant zmienia tylko `max-height` tego samego selektora co blok bazowy).
- Adresu i numeru strony dokładanych przez Safari.
- Wyśrodkowania karty w pionie na iOS (karta zostaje u góry; z `116vh` pusty pas pod nią jest mały).
- Wykrywania iOS po user-agencie ani JS w druku.
- Druku na Androidzie i w desktopowym Firefoksie / Safari macOS (osobna zmiana `print-browser-coverage`).

## Implementation Approach

Jeden blok `@media print and (hover: none) and (max-width: 175mm)` w `GeneratorShell.astro` po bloku `@media print`, nadpisujący tylko `max-height` karty na `116vh`. Selektor jak w bloku bazowym (`#worksheet-home svg`), więc kolejność i specyficzność są przewidywalne. Tymczasowy eksperyment (`?v=` i `html[data-pkv]`) jest usuwany przed commitem.

## Critical Implementation Details

- Wartość `116vh` jest zmierzona na jednym iPhonie i A4, nie wyliczona. Nie zmieniaj jej bez nowego podglądu druku na iPhonie; przy `122vh` zapas wynosił ok. 1,5 mm, a bez limitu karta szła na dwie strony.

## Phase 1: Wariant druku dla telefonu i test kontraktowy

### Overview

Zastąpić eksperyment właściwym wariantem i przypiąć go testem kontraktowym.

### Changes Required:

#### 1. Wariant druku

**File**: `src/components/GeneratorShell.astro`

**Intent**: Usunąć tymczasowy eksperyment (`<script>` z `?v=` i reguły `html[data-pkv]`) i dodać wariant, który na telefonie podnosi limit wysokości karty w druku do `116vh`. Blok bazowy zostaje.

**Contract**: Blok `@media print and (hover: none) and (max-width: 175mm)` z `#worksheet-home svg { max-height: 116vh; }` i krótkim komentarzem z pomiarem (iOS `100vh` ≈ 82 % obszaru druku); `@page` bez zmian.

#### 2. Test kontraktowy

**File**: `src/lib/sheet/print-contract.test.ts`

**Intent**: Pilnuje, że wariant ma oba warunki (`hover: none` i `max-width: 175mm`), ustawia `max-height: 116vh`, a blok bazowy (`max-width: 100%`, `max-height: 100vh`, `background: none`, `@page { margin: 0 }`) się nie zmienił.

**Contract**: Nowe `test(...)` obok istniejących; istniejące asercje bez zmian.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`

#### Manual Verification:

- Próba na iPhonie (Safari): podgląd druku labiryntu pokazuje jedną stronę i labirynt ok. 162 mm szerokości (jak wariant `116vh` z eksperymentu); wynik zapisany w `change.md`.
- Na komputerze podgląd druku wygląda jak przed zmianą (karta 210×297 mm, bez przycięć).

---

## Phase 2: Test Playwright dla druku na komputerze i telefonie

### Overview

Przypiąć w Chromium, że komputer nie dostaje wariantu, a telefon dostaje.

### Changes Required:

#### 1. Spec Playwright

**File**: `tests/e2e/print-margins.spec.ts`

**Intent**: `emulateMedia({ media: "print" })`, generuje labirynt i czyta wyliczone `max-height` karty.

**Contract**: Przypadki: kontekst komputerowy 210×297 mm → `max-height` równe `100vh` (karta 210×297 mm, bez zmian); kontekst dotykowy (`hasTouch`, `isMobile`) z viewportem 170×240 mm → `max-height` równe `116vh`; kontekst komputerowy z viewportem 170×240 mm → `100vh` (bez `hover: none` wariant się nie włącza). Spec biegnie tylko w projekcie `chromium` (pomija inne projekty), bo sam ustawia viewport. Uruchamiać z `E2E_PORT`, żeby nie testować cudzego serwera.

#### 2. Dokumentacja

**File**: `context/changes/print-printer-margins/change.md`, `context/changes/print-printer-margins/manual-checks.md`

**Intent**: Zapisać pomiary z iPhone'a i wynik Chromium w `change.md`; założyć `manual-checks.md` tej zmiany na wyniki ręczne fazy 3.

**Contract**: Notka z datą; `manual-checks.md` z tabelą: urządzenie, przeglądarka, papier, karta, liczba stron, szerokość labiryntu, data.

### Success Criteria:

#### Automated Verification:

- Spec przechodzi na Chromium: `E2E_PORT=4399 npx playwright test tests/e2e/print-margins.spec.ts --project=chromium`
- Test kontraktowy dalej przechodzi: `npm test`

#### Manual Verification:

- Notka w `change.md` zawiera pomiary z iPhone'a (obszar druku, `100vh`, warianty `100vh` / `116vh` / `122vh` / bez limitu).

---

## Phase 3: Ręczny druk na iPhonie i kontrola komputera

### Overview

Potwierdzić efekt na urządzeniach, bo emulacja Chromium nie odtwarza iOS.

### Changes Required:

#### 1. Wyniki ręczne

**File**: `context/changes/print-printer-margins/manual-checks.md`

**Intent**: Dopisać wyniki druku na iOS (Safari, Chrome, Brave) i kontrolnego druku z komputera.

**Contract**: Wiersze w tabeli z fazy 2, z datą i uwagą.

### Success Criteria:

#### Automated Verification:

- Pełny zestaw: `npm run lint && npm test && npx astro check`

#### Manual Verification:

- iPhone Safari, Chrome i Brave: labirynt Poziom 3 i Poziom 6 drukują się na jednej stronie, ok. 16 % większe niż przed zmianą, znak postaci widoczny.
- Co najmniej jedna karta inna niż labirynt (np. symetria) drukuje się na iPhonie na jednej stronie.
- Komputer (Chrome): wydruk identyczny z dzisiejszym, jedna strona A4, margines 10 mm.

---

## Testing Strategy

### Unit Tests:

- `print-contract.test.ts`: wariant z `hover: none` i `max-width: 175mm`, `max-height: 116vh`, niezmieniony blok bazowy.

### Integration Tests:

- `print-margins.spec.ts` (tylko projekt `chromium`): komputer bez wariantu, telefon z wariantem, komputer z wąskim obszarem bez wariantu.

### Manual Testing Steps:

1. iPhone: wygeneruj labirynt (Poziom 3 i Poziom 6) i symetrię, otwórz podgląd druku albo zapisz PDF.
2. Sprawdź liczbę stron w podglądzie i zmierz szerokość labiryntu.
3. Komputer: wydrukuj tę samą kartę i porównaj z wydrukiem sprzed zmiany.

## Performance Considerations

Brak: zmiana jest tylko w CSS druku.

## Migration Notes

Brak danych do migracji.

## References

- Issue: drpc1/printo-kids#38 i komentarz z wynikami S-09
- Pomiary S-09: `context/archive/2026-10-13-phone-worksheet/plan.md:347`, `manual-checks.md`
- Reguły druku: `src/components/GeneratorShell.astro`, `src/lib/sheet/print-contract.test.ts`
- Recenzja pierwszej wersji planu: `context/changes/print-printer-margins/reviews/plan-review.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Wariant druku dla telefonu i test kontraktowy

#### Automated

- [x] 1.1 Testy przechodzą: `npm test` — 258b413
- [x] 1.2 Lint przechodzi: `npm run lint` — 258b413
- [x] 1.3 Typy przechodzą: `npx astro check` — 258b413
- [x] 1.4 Build przechodzi: `npm run build` — 258b413

#### Manual

- [x] 1.5 Próba na iPhonie (Safari): podgląd druku labiryntu pokazuje jedną stronę i labirynt ok. 162 mm szerokości (jak wariant `116vh` z eksperymentu); wynik zapisany w `change.md`. — 258b413
- [x] 1.6 Na komputerze podgląd druku wygląda jak przed zmianą (karta 210×297 mm, bez przycięć). — 258b413

### Phase 2: Test Playwright dla druku na komputerze i telefonie

#### Automated

- [x] 2.1 Spec przechodzi na Chromium: `E2E_PORT=4399 npx playwright test tests/e2e/print-margins.spec.ts --project=chromium`
- [x] 2.2 Test kontraktowy dalej przechodzi: `npm test`

#### Manual

- [x] 2.3 Notka w `change.md` zawiera pomiary z iPhone'a (obszar druku, `100vh`, warianty `100vh` / `116vh` / `122vh` / bez limitu).

### Phase 3: Ręczny druk na iPhonie i kontrola komputera

#### Automated

- [ ] 3.1 Pełny zestaw: `npm run lint && npm test && npx astro check`

#### Manual

- [ ] 3.2 iPhone Safari, Chrome i Brave: labirynt Poziom 3 i Poziom 6 drukują się na jednej stronie, ok. 16 % większe niż przed zmianą, znak postaci widoczny.
- [ ] 3.3 Co najmniej jedna karta inna niż labirynt (np. symetria) drukuje się na iPhonie na jednej stronie.
- [ ] 3.4 Komputer (Chrome): wydruk identyczny z dzisiejszym, jedna strona A4, margines 10 mm.
