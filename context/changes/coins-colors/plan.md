# Kolory na karcie „Kto ma więcej?” Implementation Plan

> Status: po przeglądzie planu (`reviews/plan-review.md`), do zatwierdzenia. Faza 1 jest bramką: użytkowniczka potwierdza obrazki na wydruku w rozmiarze karty. Nic nie jest zaimplementowane.

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
- Wygląd to stylizowane obrazki użytkowniczki: bez zabezpieczeń i dokładnych wzorów NBP, nie uchodzą za prawdziwy pieniądz (PRD Open Questions 14); wszystkie monety tej samej wielkości (jedna średnica), wszystkie banknoty tej samej (wielkość nie zdradza wartości).
- PRD opisuje drugi tryb.

## What We're NOT Doing

- Zmiany generatora, reguł, poziomów i układu (`layout.ts`); kolor jest czystą funkcją nominału i nie wchodzi do `MoneyCard`.
- Losowania kolorów jak w sekwencjach.
- Kolorowej miniatury w katalogu (zostaje czarna, odpowiada domyślnemu ustawieniu).
- Pozostałych slice'ów M-5 (S-34 do S-37).

## Implementation Approach

Wzorzec sekwencji: pole `colors` w ustawieniach, `SettingToggle`, `remember` bez `applySettings`. Wygląd to gotowe PNG w `public/money/`; `src/lib/money/colors.ts` zwraca ścieżkę obrazka dla nominału (null przy wyłączonych kolorach), rysowanie w `Pile` zależne od `colors`. Bez tokenów kolorów: kolory są w pikselach.

## Faza 1: Obrazek użytkowniczki jako wzór (bramka)

### Overview

Użytkowniczka potwierdza obrazki 1, 2, 5, 10 i 20 zł na wydruku, zanim cokolwiek wejdzie do kodu strony.

### Changes Required:

#### 1. Obrazek użytkowniczki zamiast makiety

**File**: `context/changes/coins-colors/wzor-uzytkowniczki.jpg` (bez zmian; skrypt makiety usunięty)
**Intent**: Wygląd to obrazek, który użytkowniczka sama przygotowała innym AI (2026-11-08, zdecydowała: „użyj tych, niczego nie przepisuj”). Nie przerysowujemy go. Z obrazka bierzemy tylko 1, 2 i 5 zł (monety: wieniec, 1 zł srebrna, 2 zł złota ze srebrnym środkiem, 5 zł srebrna ze złotym środkiem) oraz 10 zł (brązowy) i 20 zł (różowy) (banknoty: pionowa liczba, orzeł, profil władcy w kółku, „Zł”); pozostałe nominały i grosze są poza kartą. Obrazek jest stylizowany i nie ma zabezpieczeń; autorstwo i prawa do niego ma użytkowniczka. To zmienia dotychczasowe „bez godeł” w PRD Open Questions 14 (faza 4). Pięć nominałów wycięto z JPG bez zmian rysunku: `public/money/{1,2,5,10,20}zl.png`, obok `public/characters/` (przezroczyste tło, moneta w kole, banknot z zaokrąglonymi rogami; 310–560 px szerokości, na wydruku 11 mm i 18 mm to z zapasem ponad 600 dpi). To rastry, więc faza 3 osadza je w SVG karty jako `<image>` (ścieżki `/money/…png` jak postaci w `SpeechBand.tsx`); w `public/money/` leżą też niewykorzystane 50, 100, 200 zł i grosze, na później, a nie jako wektory. Czarno-biały wygląd (colors wyłączone) zostaje dzisiejszym rysunkiem.

### Success Criteria:

#### Automated Verification:

- Pliki `1zl.png`, `2zl.png`, `5zl.png`, `10zl.png` i `20zl.png` są w `public/money/`

#### Manual Verification:

- Użytkowniczka drukuje obrazki w rozmiarze karty (moneta 11 mm, banknot 18×10 mm), w kolorze i w czerni z bielą, i potwierdza: liczba czytelna na każdym tle, wygląd wyraźnie rysunkowy (nie udaje prawdziwych pieniędzy), kolory do zatwierdzenia albo poprawek.

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

Moduł obrazka, wymiary banknotu, rysowanie i przełącznik „Kolory” na `/money`. Wygląd z obrazków użytkowniczki.

### Changes Required:

#### 1. Moduł obrazka

**File**: `src/lib/money/colors.ts` (nowy) + `colors.test.ts`, dopisany do skryptu `test` w `package.json`
**Intent**: Czysta funkcja nominał → ścieżka obrazka `/money/<nominał>zl.png`; gdy `colors` jest false, zwraca null (dzisiejszy czarny rysunek). Test: każdy nominał poziomów ma plik w `public/money/`; kolory wyłączone dają null; różne nominały dają różne ścieżki.

#### 2. Stałe i układ

**File**: `src/lib/money/sheet.ts`, `src/lib/money/layout.ts` i ich testy
**Changes**: `noteHeight` z 10 na 9 mm (banknot 18×9 = 2,0, jak obrazki; F4 z przeglądu); monety znormalizowane do jednej średnicy przy wstawianiu (źródłowe promienie 155, 165, 178 px różnią się, więc obrazek skaluje się do średnicy `coinDiameter`, a nie do rozmiaru pliku). Testy układu dostają nową wysokość banknotu; sprawdzić, czy wiersz kupki mieści się na A4 z marginesem 10 mm.

#### 3. Rysowanie i przełącznik

**File**: `src/components/MoneyGenerator.tsx`
**Changes**: `colorsControl` jak w `SequenceGenerator.tsx` (`SettingToggle`, `memory.remember({ colors: next })` bez `applySettings`); `handleGenerate` i `handleLevelSelect` przekazują `memory.settings`; `MoneySheet`/`Pile` dostają `colors` i przy włączonych kolorach rysują `<image>` ze ścieżki modułu (jak `SpeechBand.tsx`, `preserveAspectRatio="xMidYMid meet"`), a przy wyłączonych dzisiejszy czarny rysunek.

#### 4. Testy

**Files**: `tests/e2e/money.spec.ts`, `tests/e2e/card-settings.spec.ts`, `tests/e2e/phone-layout.spec.ts`, `src/lib/sheet/print-contract.test.ts`
**Changes**: e2e: przełącznik zostawia ten sam rząd kupek i nie układa nowej karty, kolor przeżywa przełączenie profilu, Kolory nie zasłania Generuj, Drukuj i Profil na telefonie; wpis `pieniadze` w `card-settings.spec.ts` z `colors: true`. Test druku: `MoneySheet` ma `printColorAdjust: "exact"` (już ma; test pilnuje). E2E czeka na załadowanie obrazków (`complete` i `naturalWidth` > 0) przed Drukuj, jak dla postaci.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build` przechodzą
- E2E kart (Chromium, telefon) przechodzi, z `E2E_PORT` na wolnym porcie

#### Manual Verification:

- Rozmiar PNG zważony przed wdrożeniem (np. kwantyzacja); 10 nieużywanych plików w `public/money/` zostaje świadomie, na później
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
- Ręcznie: wydruk obrazków (faza 1) i karty (faza 3), kolor i czerń z bielą.

## Migration Notes

Brak migracji: `colors` brakujące w zapisanym profilu czyta się jako `false`.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Obrazek użytkowniczki jako wzór (bramka)

#### Automated

- [x] 1.1 Pliki 1, 2, 5, 10 i 20 zł są w `public/money/`

#### Manual

- [ ] 1.2 Użytkowniczka potwierdza obrazki na wydruku w rozmiarze karty, w kolorze i w czerni z bielą

### Phase 2: Ustawienie `colors` w profilu, plakietkach i teście kontraktu

#### Automated

- [x] 2.1 `npm test` przechodzi — 03b93f0
- [x] 2.2 `npm run lint` przechodzi — 03b93f0
- [x] 2.3 `npx astro check` przechodzi — 03b93f0

### Phase 3: Kolorowe monety i banknoty, przełącznik na stronie

#### Automated

- [ ] 3.1 `npm test` przechodzi
- [ ] 3.2 `npm run lint` i `npx astro check` przechodzą
- [ ] 3.3 `npm run depcruise` i `npm run build` przechodzą
- [ ] 3.4 E2E kart (Chromium i telefon) przechodzi

#### Manual

- [ ] 3.5 Rozmiar PNG zważony przed wdrożeniem; 10 nieużywanych plików zostaje świadomie
- [ ] 3.6 Wydruk karty w kolorze i w czerni z bielą jest czytelny (Safari, Chrome iOS, Brave iOS)

### Phase 4: PRD

#### Automated

- [ ] 4.1 `npx prettier --check context/foundation/prd.md` przechodzi

#### Manual

- [ ] 4.2 Użytkowniczka przegląda zmiany w PRD
