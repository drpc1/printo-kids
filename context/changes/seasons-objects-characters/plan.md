# Zima: obiekty i postacie w oknie dat (S-54) — plan

## Overview

Rodzic od 1.12 do końca lutego wybiera na pasku „Kategoria” pozycję „Zima” (symetria, nonogram, dyktando, „Skopiuj obrazek”), a na liście postaci widzi Bałwanka i Pingwina. Wzór: S-38 (obiekty, `context/archive/2026-11-14-christmas-objects/`) i S-39 (postacie, `context/archive/2026-11-15-christmas-characters/`). Research: `research.md`.

## Current State Analysis

- Okno dat jest ogólne: `DateWindow`/`inWindow` (`src/lib/date-window.ts`), kategoria z `window` (`src/lib/symmetry/template-format.ts:15-31`), lista paska `objectCategoryChoicesOn` (`src/lib/symmetry/templates.ts:60-92`), postacie z `window` i jedna kreska (`src/lib/sheet/character.ts:101-117`).
- Dwie kategorie z oknem naraz nie są zablokowane kodem; do sprawdzenia testem.
- Zimowych obiektów poza świętami nie ma; pingwin jest obiektem (Zwierzęta), ale nie postacią; bałwanek jest postacią i obiektem tylko świątecznym.

## Desired End State

- Kategoria „Zima” (id `zima`, okno 1.12–29.02; zapis `{2,29}` działa też w roku nieprzestępnym) na pasku zaraz po „Wszystkie” (po „Boże Narodzenie”, gdy obie w oknie); poza oknem czytana jako „Wszystkie”.
- Obiekty z szablonów w trzech rozmiarach: iglo, płatek śniegu, czapka zimowa, szalik, niedźwiedź polarny; narty tylko jeśli przejdą makietę. Bałwanek (obiekt) przenosi się do „Zima” (decyzja 2026-11-22: „przenieś bałwanka do kategorii zima”); pingwin dostaje „Zima” obok „Zwierzęta”; choinka i gwiazda zostają jak są.
- Dwa kształty dyktanda (propozycja: narty, łyżwa; ostatecznie po makiecie), widoczne też w „Skopiuj obrazek”.
- Postacie: Bałwanek zmienia okno z 15.11–6.01 na 1.12–29.02; nowy Pingwin (rysunek od użytkowniczki) z oknem 1.12–29.02. Lista ma jedną kreskę po ostatnim wierszu sezonowym.

## What We're NOT Doing

- Innych pór roku i świąt; okna ruchomego (Wielkanoc).
- Zmian silników kart (data tylko w warstwie React, jak w S-38).
- Komunikatu o sezonowości; zmiany „Wszystkie” (pełny katalog cały rok).

## Implementation Approach

Treść najpierw (makieta i akceptacja rysunków, jak S-38, bo ryzyko leży w czytelności), potem mechanizm i dane, potem postacie, na końcu dokumenty. Jedna faza = jeden PR do `main`; przed każdym PR `/10x-impl-review`.

## Faza 1: Makieta obiektów zimowych

### Overview

Rysunki 5–6 obiektów (połowy 4×12, 6×15, 9×24) i 2 kształtów dyktanda, PNG podglądu i skrypt reguł (symetria lewo–prawo, czytelność w czerni, brak styku rogiem, jedno rozwiązanie nonogramu średni/trudny, obrys dyktanda). Praca na wysokim wysiłku; obiekt, który nie przejdzie, odpada bez zastępstwa.

### Changes Required:

#### 1. Makieta i pomiar

**File**: `context/changes/seasons-objects-characters/` (skrypt, JSON rysunków, PNG, pomiar)

**Intent**: Wzorować na `check-mockup.mts` i `render-preview.mts` z archiwum christmas-objects; użytkowniczka akceptuje PNG przed Fazą 3.

**Contract**: Wynik: lista obiektów i kształtów, które przechodzą reguły, z liczbą wariantów nonogramu na rozmiar.

### Success Criteria:

#### Automated Verification:

- Skrypt reguł przechodzi dla zatwierdzonych rysunków: `node` na skrypcie makiety z folderu zmiany

#### Manual Verification:

- Użytkowniczka akceptuje PNG podglądu (czytelność w czerni w 4×12)

---

## Faza 2: Kategoria „Zima” z oknem dat

### Overview

Kategoria na pasku, odczyt poza oknem, współistnienie z „Boże Narodzenie”; na start ma pingwina i bałwanka.

### Changes Required:

#### 1. Kategoria i kolejność

**File**: `src/lib/symmetry/template-format.ts`, `src/lib/symmetry/templates.ts`

**Intent**: Dodać `zima` z oknem 1.12–29.02; sprawdzić listę, gdy obie kategorie sezonowe są w oknie, i mapowanie poza oknem.

**Contract**: `objectCategoryChoicesOn(today)`: „Wszystkie”, kategorie z oknem alfabetycznie („Boże Narodzenie”, „Zima”), stałe alfabetycznie.

#### 2. Przeniesienie kategorii obiektów

**File**: pliki obiektów bałwanka (`src/lib/symmetry/objects/boze-narodzenie.ts`) i pingwina

**Intent**: Bałwanek: kategoria `zima` zamiast `boze-narodzenie`; pingwin: `zwierzeta` + `zima`.

**Contract**: Próg „co najmniej cztery obiekty w kategorii” spełnia dopiero Faza 3; testy progu w Fazie 3.

#### 3. Testy

**File**: `src/lib/object-categories.test.ts`, `src/lib/symmetry/templates.test.ts`, e2e z `page.clock` (wzór `christmas-category`)

**Intent**: Granice okna (30.11, 1.12, 6.01, 7.01, 28.02, 29.02 w roku przestępnym, 1.03), pasek w grudniu (obie) i w lutym (tylko Zima).

### Success Criteria:

#### Automated Verification:

- Lint, depcruise, testy, astro check i build: `npm run lint`, `npm run depcruise`, `npm test`, `npx astro check`, `npm run build`
- E2E: pasek w grudniu i lutym (`E2E_PORT` na wolnym porcie)

#### Manual Verification:

- Pasek na telefonie nie zasłania Generuj/Drukuj przy trzech pozycjach sezonowych

---

## Faza 3: Obiekty z szablonów

### Overview

Zatwierdzone obiekty w trzech rozmiarach w nowym pliku katalogu.

### Changes Required:

#### 1. Plik obiektów

**File**: `src/lib/symmetry/objects/zima.ts`, rejestr w `src/lib/symmetry/templates.ts`

**Intent**: Rysunki z makiety jako szablony z częściami losowanymi; kategoria `zima` (niedźwiedź polarny także `zwierzeta`).

**Contract**: Reguły karty symetrii w każdym rozmiarze; nonogram średni/trudny z jednym rozwiązaniem (sprawdzić próg czasu testu trudnego).

### Success Criteria:

#### Automated Verification:

- Testy katalogu i kart (nonogram, dyktando, „Skopiuj obrazek”) dla `zima`: co najmniej dwie różne karty w każdej kombinacji: `npm test`
- Lint, astro check i build: `npm run lint`, `npx astro check`, `npm run build`

#### Manual Verification:

- Wydruk próbny kategorii „Zima” (staging)

---

## Faza 4: Kształty dyktanda

### Overview

Dwa zimowe kształty niesymetryczne (kategoria `zima`) w `DICTATION_SHAPES`, z kolorowym rysunkiem dla „Skopiuj obrazek” (S-55).

### Changes Required:

#### 1. Kształty

**File**: `src/lib/dictation/shapes.ts`, `src/lib/dictation/shapes.test.ts`

**Intent**: Dodać kształty z makiety na poziomach, na których są czytelne.

**Contract**: Reguły obrysu (jedna zamknięta linia, brak styku rogiem), także po odbiciu; kolor w kredkach szablonów.

### Success Criteria:

#### Automated Verification:

- Testy kształtów, lint i astro check: `npm test`, `npm run lint`, `npx astro check`

#### Manual Verification:

- Podgląd dyktanda i „Skopiuj obrazek” z kategorią Zima

---

## Faza 5: Postacie zimowe

### Overview

Bałwanek z nowym oknem, Pingwin jako nowa postać.

### Changes Required:

#### 1. Rysunek i kadr

**File**: `public/characters/pingwin.webp`

**Intent**: Rysunek Pingwina już jest (2026-11-22, niezatwierdzony w git: `public/characters/pingwin.webp` i `context/ideas/postacie/pingwin.png` w głównym katalogu repo; `niedzwiedz-polarny.webp` obok NIE wchodzi: niedźwiedź polarny nie jest postacią, decyzja 2026-11-22). Faza 5 dodaje je do gałęzi, kadr (`contentLeft/Right`) dopasowuje skrypt jak w S-39; makieta listy do akceptacji.

#### 2. Katalog postaci

**File**: `src/lib/sheet/character.ts`, `src/lib/sheet/character.test.ts`

**Intent**: Stała okna zimy 1.12–29.02; Bałwanek na nią; Pingwin w katalogu z oknem.

**Contract**: `characterPickRowsOn`: jedna kreska po ostatnim wierszu sezonowym; zapisana postać spoza okna zostaje na liście; w grudniu cztery wiersze sezonowe, w lutym dwa, 1.03 zero.

### Success Criteria:

#### Automated Verification:

- Testy dat postaci, lint, astro check i build: `npm test`, `npm run lint`, `npx astro check`, `npm run build`
- E2E listy postaci z `page.clock` (grudzień, luty, marzec)

#### Manual Verification:

- Lista postaci na telefonie nie jest ucięta; Pingwin na karcie i na starcie labiryntu wygląda jak reszta

---

## Faza 6: Dokumenty i domknięcie

### Overview

PRD, glosariusz, `how-it-works.astro`, liczby postaci (14 → 15) i obiektów, roadmapa, test-plan.

### Success Criteria:

#### Automated Verification:

- Lint, depcruise, testy, astro check i build: `npm run lint`, `npm run depcruise`, `npm test`, `npx astro check`, `npm run build`

#### Manual Verification:

- Checklista stagingu przed wydaniem

---

## Testing Strategy

### Unit Tests:

- Granice okna z datą w argumencie (29.02, nakładanie z Bożym Narodzeniem); katalog po kategoriach.

### Integration Tests:

- E2E z `page.clock`: pasek kategorii i lista postaci w grudniu, lutym i marcu.

### Manual Testing Steps:

1. Pasek „Kategoria” na telefonie w grudniu i w lutym.
2. Wydruk próbny kart z kategorią Zima.

## Migration Notes

Zapisane ulubione postacie zostają; zapamiętana kategoria „Zima” poza oknem czyta się jako „Wszystkie”. Zmiana okna Bałwanka nie usuwa go z katalogu: zapisany Bałwanek poza oknem zostaje na liście i na karcie.

## References

- Related research: `context/changes/seasons-objects-characters/research.md`
- Wzór: `context/archive/2026-11-14-christmas-objects/plan.md`, `context/archive/2026-11-15-christmas-characters/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Makieta obiektów zimowych

#### Automated

- [ ] 1.1 Skrypt reguł przechodzi dla zatwierdzonych rysunków

#### Manual

- [ ] 1.2 Użytkowniczka akceptuje PNG podglądu (czytelność w czerni w 4×12)

### Phase 2: Kategoria „Zima” z oknem dat

#### Automated

- [ ] 2.1 Lint, depcruise, testy, astro check i build przechodzą
- [ ] 2.2 E2E: pasek w grudniu i lutym

#### Manual

- [ ] 2.3 Pasek na telefonie nie zasłania Generuj/Drukuj

### Phase 3: Obiekty z szablonów

#### Automated

- [ ] 3.1 Testy katalogu i kart dla kategorii zima przechodzą
- [ ] 3.2 Lint, astro check i build przechodzą

#### Manual

- [ ] 3.3 Wydruk próbny kategorii „Zima”

### Phase 4: Kształty dyktanda

#### Automated

- [ ] 4.1 Testy kształtów, lint i astro check przechodzą

#### Manual

- [ ] 4.2 Podgląd dyktanda i „Skopiuj obrazek” z kategorią Zima

### Phase 5: Postacie zimowe

#### Automated

- [ ] 5.1 Testy dat postaci, lint, astro check i build przechodzą
- [ ] 5.2 E2E listy postaci (grudzień, luty, marzec)

#### Manual

- [ ] 5.3 Lista postaci na telefonie nie jest ucięta, Pingwin wygląda jak reszta

### Phase 6: Dokumenty i domknięcie

#### Automated

- [ ] 6.1 Lint, depcruise, testy, astro check i build przechodzą

#### Manual

- [ ] 6.2 Checklista stagingu
