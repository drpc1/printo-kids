# Kolory na karcie „Kto ma więcej?” Implementation Plan

> Status: szkic do zatwierdzenia. Faza 1 (makieta) jest bramką: wygląd pieniędzy w fazie 3 zależy od oceny użytkowniczki. Nic nie jest zaimplementowane.

## Overview

Karta „Kto ma więcej?” (S-33, PRD US-23) dostaje ustawienie `colors` (GitHub drpc1/printo-kids#270). Wyłączone (domyślnie) to dzisiejszy prosty czarny kontur, czytelny na czarno-białej drukarce. Włączone to kolorowe, bardziej realistyczne monety i banknoty: kolor zależy od nominału (srebrna 1 zł, złota 2 zł, dwukolorowa 5 zł, banknoty 10 zł i 20 zł w różnych barwach), a nominał zostaje liczbą na każdym kawałku. Użytkowniczka uznała (2026-11-08) kolor i „realistyczniejszy” wygląd za jeden zakres. Przełączenie nie układa nowej karty.

## Current State Analysis

Szczegóły i anchory: `research.md` w tym folderze.

- Rysowanie: `MoneySheet` i `Pile` w `src/components/MoneyGenerator.tsx`; wszystko `var(--card)` / `var(--foreground)`. Stałe w `src/lib/money/sheet.ts`; `layout.ts` nie zna koloru.
- `MoneySettings` ma tylko `level` (`src/lib/card-settings.ts:39`); parser ma już gałąź `colors` (`card-settings.ts:174`).
- `contentKey` pieniędzy to poziom (`src/lib/money/engine.ts:62`), więc `colors` jako dekoracja nie wchodzi do klucza (`src/lib/card-contract.ts:23`).
- `card-summary.ts:97-103` dla `pieniadze` ma `extras: []`.
- Tokeny kredek `--symmetry-*` w `src/styles/global.css:60-68`; AGENTS.md zabrania hexów i palet Tailwind w komponentach, nowy kolor to nowy token.

## Desired End State

- Pasek „Kolory” na `/money`, domyślnie wyłączony, zapamiętywany w profilu i w ostatnich parametrach, pokazywany w podsumowaniu profilu („kolory”).
- Przełączenie przy pokazanej karcie zostawia tę samą kartę (ten sam `key`).
- Włączone: kolorowe monety i banknoty; liczba nominału zawsze widoczna i czytelna także w odcieniach szarości; wyłączone: identycznie jak dziś.
- Stylizacja nie uchodzi za prawdziwy pieniądz: bez zabezpieczeń, godeł, portretów i dokładnych wzorów NBP (PRD Open Questions 14); wszystkie monety tej samej wielkości, wszystkie banknoty tej samej (wielkość nie zdradza wartości).
- PRD opisuje drugi tryb.

## What We're NOT Doing

- Zmiany generatora, reguł, poziomów i układu (`layout.ts`); kolor jest czystą funkcją nominału i nie wchodzi do `MoneyCard`.
- Losowania kolorów jak w sekwencjach.
- Kolorowej miniatury w katalogu (zostaje czarna, odpowiada domyślnemu ustawieniu).
- Pozostałych slice'ów M-5 (S-34 do S-37).

## Implementation Approach

Wzorzec sekwencji: pole `colors` w ustawieniach, `SettingToggle`, `remember` bez `applySettings`. Kolor to czysty moduł `src/lib/money/colors.ts` (nominał → nazwy tokenów), tokeny `--money-*` w `global.css`, rysowanie w `Pile` zależne od `colors`. Wygląd rozstrzyga makieta przed fazą 3.

## Faza 1: Makieta kolorowych monet i banknotów (bramka)

### Overview

Użytkowniczka ocenia wygląd 1, 2, 5, 10 i 20 zł, zanim cokolwiek wejdzie do kodu strony.

### Changes Required:

#### 1. Skrypt makiety

**File**: `scripts/money-colors-mockup.mjs` (gotowy), wynik `context/changes/coins-colors/mockup-kolory.svg`
**Intent**: Pięć nominałów powiększonych 4×, w rozmiarze wydruku i próbny rząd z dwiema kupkami i polem na znak, z tych samych stałych co strona. Propozycja (wersja 2, bardziej realistyczna): monety z gradientem, ryflowanym brzegiem i wypukłym środkiem (1 zł srebrna, 2 zł złota, 5 zł pierścień złoty i środek srebrny); banknoty z gradientem, falistymi liniami, małymi liczbami w rogach i pustym owalem zamiast portretu (10 zł czerwonawy, 20 zł zielony), bez zabezpieczeń; v3: na monetach mały uproszczony orzełek w koronie (własny rysunek, bez tarczy; uproszczone godło i wzór są dopuszczone przez użytkowniczkę 2026-11-08, bez zabezpieczeń), na banknotach kreskówkowy król w owalu zamiast pustego owalu. To zmienia dotychczasową granicę „bez godeł” (PRD Open Questions 14), więc wymaga potwierdzenia użytkowniczki i zmiany sformułowania w PRD (faza 4).

### Success Criteria:

#### Automated Verification:

- Skrypt działa: `node --experimental-strip-types scripts/money-colors-mockup.mjs`

#### Manual Verification:

- Użytkowniczka drukuje makietę na A4 w 100%, w kolorze i w czerni z bielą, i potwierdza: liczba czytelna na każdym tle, wygląd wyraźnie rysunkowy (nie udaje prawdziwych pieniędzy), kolory do zatwierdzenia albo poprawek.

## Faza 2: Ustawienie `colors` w profilu, plakietkach i teście kontraktu

### Overview

Pole `colors` w `MoneySettings` z pamięcią w profilu i ostatnich parametrach; bez rysowania.

### Changes Required:

#### 1. Ustawienia

**File**: `src/lib/card-settings.ts`
**Changes**: `MoneySettings` dostaje `colors: boolean`; domyślne `{ level: DEFAULT_MONEY_LEVEL_ID, colors: false }`. Parser już czyta `colors`; zapisane wcześniej profile bez pola dostają `false`.

#### 2. Podsumowanie profilu

**File**: `src/lib/card-summary.ts`
**Changes**: dla `pieniadze` `extras: settings.colors ? ["kolory"] : []`, jak sekwencje.

#### 3. Silnik

**File**: `src/lib/money/engine.ts`
**Changes**: `knownBad` i inne literały `MoneySettings` dostają `colors: false`; `contentKey` bez zmian.

#### 4. Testy

**Files**: `src/lib/card-settings.test.ts`, `src/lib/card-summary.test.ts`, `src/lib/card-engines.test.ts`
**Changes**: domyślne i parsowanie `colors` (stary zapis bez pola, zła wartość), „kolory” w podsumowaniu, wpis `decoration: [{ level, colors: true }]` dla `pieniadze` w teście I-9 (zmiana `colors` nie zmienia `contentKey`).

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check` przechodzą

## Faza 3: Kolorowe monety i banknoty, przełącznik na stronie

### Overview

Tokeny, moduł koloru, rysowanie i przełącznik „Kolory” na `/money`. Wygląd z zatwierdzonej makiety.

### Changes Required:

#### 1. Tokeny

**File**: `src/styles/global.css`
**Changes**: tokeny `--money-*` (srebro, złoto, odcienie banknotów: pole, obramowanie, pasek) w tym samym stylu co `--symmetry-*`; bez hexów w komponentach.

#### 2. Moduł koloru

**File**: `src/lib/money/colors.ts` (nowy) + `colors.test.ts`, dopisany do skryptu `test` w `package.json`
**Intent**: Czysta funkcja nominał → opis wyglądu (nazwy tokenów dla pierścienia i środka monety albo pola, obramowania i paska banknotu); gdy `colors` jest false, zwraca dzisiejszy czarny wygląd. Test: każdy nominał poziomów ma wygląd; kolory wyłączone dają czerń; różne nominały dają różne wyglądy.

#### 2b. Stałe

**File**: `src/lib/money/sheet.ts`
**Changes**: proporcje pierścienia monety i paska banknotu; wymiary kawałków bez zmian, więc `layout.ts` i jego test stoją.

#### 3. Rysowanie i przełącznik

**File**: `src/components/MoneyGenerator.tsx`
**Changes**: `colorsControl` jak w `SequenceGenerator.tsx` (`SettingToggle`, `memory.remember({ colors: next })` bez `applySettings`); `handleGenerate` i `handleLevelSelect` przekazują `memory.settings`; `MoneySheet`/`Pile` dostają `colors` i rysują według modułu koloru; domyślnie wygląd identyczny z dzisiejszym.

#### 4. Testy

**Files**: `tests/e2e/money.spec.ts`, `tests/e2e/card-settings.spec.ts`, `tests/e2e/phone-layout.spec.ts`, `src/lib/sheet/print-contract.test.ts`
**Changes**: e2e: przełącznik zostawia ten sam rząd kupek i nie układa nowej karty, kolor przeżywa przełączenie profilu, Kolory nie zasłania Generuj, Drukuj i Profil na telefonie; wpis `pieniadze` w `card-settings.spec.ts` z `colors: true`. Test druku: `MoneySheet` ma `printColorAdjust: "exact"` (już ma; test pilnuje).

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` przechodzą
- E2E kart (Chromium, telefon) przechodzi, z `E2E_PORT` na wolnym porcie

#### Manual Verification:

- Wydruk wygenerowanej karty w kolorze i w czerni z bielą (Safari, Chrome iOS, Brave iOS): nominał czytelny, nic nie nachodzi

## Faza 4: PRD

### Overview

PRD przestaje mówić, że druk karty jest tylko czarny.

### Changes Required:

**File**: `context/foundation/prd.md`
**Changes**: US-23 (kryterium „Druk jest czarny…”: czarny jest domyślnie, kolory po włączeniu), US-24 lub nowy punkt o przełączniku Kolory, FR-033/FR-034 bez zmian numeracji, Business Logic „Karta „Kto ma więcej?””: akapit o kolorach (kolor zależy od nominału, nominał zawsze liczbą, bez zabezpieczeń i godeł), Non-Functional Requirements (zdanie o czarnym druku „Kto ma więcej?”), tabela „Profil i zapamiętane ustawienia” (Kto ma więcej?: poziom, kolory), Open Questions 14 (czytelność na wydruku).

### Success Criteria:

#### Automated Verification:

- `npx prettier --check context/foundation/prd.md`
- `rg -n "Druk jest czarny" context/foundation/prd.md` w zdaniach o tej karcie nie zostaje bezwarunkowe

#### Manual Verification:

- Użytkowniczka przegląda zmiany w PRD

---

## Testing Strategy

- Jednostkowe: moduł koloru, ustawienia, podsumowanie, I-9.
- E2E: przełącznik bez nowej karty, pamięć w profilu, układ telefonu.
- Ręcznie: wydruk makiety (faza 1) i karty (faza 3), kolor i czerń z bielą.

## Migration Notes

Brak migracji: `colors` brakujące w zapisanym profilu czyta się jako `false`.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Makieta kolorowych monet i banknotów (bramka)

#### Automated

- [x] 1.1 Skrypt makiety działa: `node --experimental-strip-types scripts/money-colors-mockup.mjs`

#### Manual

- [ ] 1.2 Użytkowniczka ocenia makietę w kolorze i w czerni z bielą i zatwierdza wygląd

### Phase 2: Ustawienie `colors` w profilu, plakietkach i teście kontraktu

#### Automated

- [ ] 2.1 `npm test` przechodzi
- [ ] 2.2 `npm run lint` przechodzi
- [ ] 2.3 `npx astro check` przechodzi

### Phase 3: Kolorowe monety i banknoty, przełącznik na stronie

#### Automated

- [ ] 3.1 `npm test` przechodzi
- [ ] 3.2 `npm run lint` i `npx astro check` przechodzą
- [ ] 3.3 `npm run depcruise` i `npm run build` przechodzą
- [ ] 3.4 E2E kart (Chromium i telefon) przechodzi

#### Manual

- [ ] 3.5 Wydruk karty w kolorze i w czerni z bielą jest czytelny (Safari, Chrome iOS, Brave iOS)

### Phase 4: PRD

#### Automated

- [ ] 4.1 `npx prettier --check context/foundation/prd.md` przechodzi

#### Manual

- [ ] 4.2 Użytkowniczka przegląda zmiany w PRD
