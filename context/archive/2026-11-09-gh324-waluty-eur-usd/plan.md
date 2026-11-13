# Waluty EUR i USD na karcie „Kto ma więcej?” Implementation Plan

## Overview

Karta „Kto ma więcej?” (`pieniadze`) dostaje ustawienie paska `currency` (`pln` | `eur` | `usd`), pamiętane w profilu jak poziom i kolory. Waluta wybiera zestaw nominałów każdego poziomu, rodzaj kawałka (moneta albo banknot) i kolorowe obrazki. Poziom trudny dostaje nominały większe niż 20 (50 i 100) we wszystkich walutach. Centów i groszy nie ma.

Decyzje użytkowniczki (2026-11-09, `change.md`): ustawienie paska, nie osobna karta; bez centów; USD łatwy to moneta 1 $ plus banknot 5 $; obrazki USD z makiety wdrażane w całości (prawo sprawdzi użytkowniczka przed merge); PR po każdej fazie, bez merge; zestawy trudnego dobiera Claude.

## Current State Analysis

Opis kodu i anchory w `research.md`. Najważniejsze: silnik, reguły i generator liczą na liczbach całkowitych i dostają `MoneyLevel` (`src/lib/money/generate.ts:25-39`, `rules.ts:64-110`), a założenie „złotówki” siedzi w czterech miejscach: nominały i opisy poziomów (`levels.ts:25-60`), `pieceKind` po wartości `>= 10` (`layout.ts:3-6`), nazwa pliku `/money/${value}zl.png` (`colors.ts:7-9`) i teksty „zł”. `contentKey` to `settings.level` (`engine.ts:60`).

## Desired End State

Na pasku strony `/money` jest wybór „Waluta: zł / € / $” obok poziomu i kolorów. Zmiana waluty z pokazaną kartą układa nową kartę (jak poziom); kolory dalej tylko przełączają wygląd. Każda waluta ma własne nominały na każdym poziomie, własne obrazki w kolorze i, w czarnym druku, mały znak waluty (€ albo $; złote bez znaku jak dziś). Profil pamięta walutę; stare profile bez pola dostają `pln`. Weryfikacja: `npm test`, `npm run lint`, `npx astro check`, `npm run depcruise`, `npm run build`, e2e `money.spec.ts`.

### Key Discoveries:

- Sumy kupek to `number[]`; `pileKey` zlewa równe wartości (`rules.ts:42`), więc w jednej walucie wartość nie może mieć dwóch rodzajów kawałka. Stąd w USD tylko moneta 1 $ (bez banknotu 1 $).
- Kupka z dużą liczbą banknotów przekracza ramkę: pole kupki ma wysokość 39 mm, a cztery rzędy banknotów to 40,5 mm. Przy większych nominałach potrzebny jest limit banknotów w kupce (`MAX_NOTES = 4`: dwa rzędy po trzy), tak jak dzisiejszy najgorszy przypadek 4 banknoty + 6 monet (`layout.test.ts` `WORST_PILES`).
- `SudokuChoice` (`src/components/SudokuChoice.tsx`) to generyczny przycisk z oknem wyboru; nadaje się na „Waluta” bez nowego komponentu.
- `parseCard` czyta pola z wartości domyślnych, a `fieldValue` traktuje nieznane pole jak id poziomu (`card-settings.ts` ok. 165-190): `currency` wymaga własnej gałęzi.
- W `public/money/` leżą już `50zl.png` i `100zl.png` (nieużywane dziś); makiety `context/ideas/waluty/*.jpg` mają beżowe tło i białą obwódkę z przerywaną linią cięcia.
- Miniatura katalogu (`scripts/build-thumbnails.mjs`) losuje kartę PLN średniego poziomu; zmiana ma zostawić ją bez różnicy (nominały PLN średni bez zmian, `maxNotes` nie zmienia losowania bez banknotów).

## What We're NOT Doing

- Centów i groszy, monet 25¢/10¢/5¢ i monet groszowych EUR. Nie liczymy w jednostkach mniejszych.
- Banknotu 1 $ i banknotu 200 € (nie wchodzą do żadnego zestawu; 200 € nie jest wycinany).
- Osobnych kart na walutę ani zmiany `CARD_KINDS` / `CardSettingsMap` poza polem w `MoneySettings` (równolegle pracuje #265).
- Zmiany miniatury katalogu, polecenia na karcie ani ceny/reszty.
- Oceny prawnej obrazków USD: obrazki wchodzą z makiety, decyzję prawną ma użytkowniczka (wpis w PR).
- Utwardzeń spójności profili między zakładkami (odłożone).

## Implementation Approach

Trzy fazy, każda osobny PR (kolejny PR oparty na gałęzi poprzedniego). Faza 1 to czysta logika w `src/lib/money` i ustawieniach, z testami; strona nadal działa w PLN. Faza 2 dokłada obrazki EUR/USD i mapowanie ścieżek. Faza 3 to UI (wybór waluty, znak w czarnym druku, preload), e2e i dokumenty (PRD, opis rodzaju karty, glossary).

Nominały i sumy (jednostka główna waluty; łatwy tylko monety poza USD):

| Poziom                   | PLN                                          | EUR                                          | USD                                       |
| ------------------------ | -------------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| łatwy, do 10, 5 sztuk    | 1, 2, 5 (monety)                             | 1, 2 (monety)                                | 1 (moneta), 5 (banknot)                   |
| średni, do 20, 8 sztuk   | 1, 2, 5 (monety)                             | 1, 2 (monety), 5 (banknot)                   | 1 (moneta), 5, 10 (banknoty)              |
| trudny, do 200, 10 sztuk | 1, 2, 5 (monety), 10, 20, 50, 100 (banknoty) | 1, 2 (monety), 5, 10, 20, 50, 100 (banknoty) | 1 (moneta), 5, 10, 20, 50, 100 (banknoty) |

Rzędy, mylenie liczbą sztuk (0 / 2 / 3–5), pięć rzędów i remis najwyżej w jednym rzędzie zostają. Przy wartościach powyżej 20 limit sum trudnego rośnie z 50 do 200; `MAX_NOTES = 4` w kupce.

## Faza 1: Model waluty, poziomy i silnik

### Overview

Wprowadza walutę do logiki karty: lista walut z rodzajem kawałka, poziomy per waluta, limit banknotów, waluta w karcie i w kluczu treści, pole w ustawieniach i profilu. UI nadal pracuje w PLN.

### Changes Required:

#### 1. Waluty

**File**: `src/lib/money/currencies.ts` (nowy)

**Intent**: Jedno miejsce prawdy o walutach: id, etykiety (lista, pasek), znak, oraz które nominały są monetą, a które banknotem.

**Contract**: `MoneyCurrencyId = "pln" | "eur" | "usd"`, `DEFAULT_MONEY_CURRENCY_ID = "pln"`, `MONEY_CURRENCIES` (`id`, `label`, `barLabel`, `symbol`, `description`), `pieceKind(value, currency): "coin" | "note"` (PLN: monety 1, 2, 5; EUR: monety 1, 2; USD: moneta 1; reszta banknoty; rzuca dla nominału spoza waluty), `moneyCurrencyById`.

#### 2. Poziomy per waluta

**File**: `src/lib/money/levels.ts`

**Intent**: Zastąpić jedną listę `MONEY_LEVELS` poziomami zależnymi od waluty według tabeli z Implementation Approach; opisy poziomów składane z nominałów i znaku waluty.

**Contract**: `moneyLevels(currency)`, `moneyLevelById(id, currency)` (waluta wymagana), `MoneyLevel` dostaje `currency` i `maxNotes`; `MONEY_LEVEL_IDS` na potrzeby parsera; `DEFAULT_MONEY_LEVEL_ID` bez zmian. Opis bez „lat” i bez „zł” zaszytego na stałe (np. „monety 1 i 2 €, banknot 5 €, liczba sztuk czasem myli”).

#### 3. Arkusz, układ i reguły

**Files**: `src/lib/money/sheet.ts`, `src/lib/money/layout.ts`, `src/lib/money/rules.ts`, `src/lib/money/generate.ts`

**Intent**: `MAX_NOTES` w arkuszu; `layoutPile(values, width, currency)` i usunięcie starego `pieceKind` z layoutu; `MoneyCard` ma `currency` (klucz karty zaczyna się od waluty); reguła `note-count` (kupka ma najwyżej `maxNotes` banknotów) w `moneyRowProblems`; `drawPile` nie dobiera banknotu ponad limit.

**Contract**: nowy kod problemu `"note-count"` w `MoneyRowProblem`; `generateMoneyCard(random, previousKey, level)` bez zmiany podpisu (waluta z `level.currency`).

#### 4. Silnik, ustawienia, profil

**Files**: `src/lib/money/engine.ts`, `src/lib/card-settings.ts`, `src/lib/card-summary.ts`, `src/lib/money/colors.ts` (tylko sygnatura), `src/components/MoneyGenerator.tsx` (minimalnie: waluta z `memory.settings`, poziomy z `moneyLevels(currency)`), `scripts/build-thumbnails.mjs`, `scripts/money-mockup.mjs`

**Intent**: `MoneySettings.currency` (domyślnie `pln`), parser z gałęzią `currency` (nieznana wartość → domyślna), `contentKey` = waluta + poziom (zmiana waluty układa nową kartę), `knownBad` w `engine.ts` z nową regułą, podsumowanie profilu dodaje walutę, gdy nie jest `pln`.

**Contract**: `MoneySettings = { level; currency; colors }`; `contentKey(settings) = "${currency}:${level}"`; w `card-summary` `extras` dostaje symbol waluty przed „kolory”, tylko dla `eur`/`usd`.

#### 5. Preload i e2e w PLN

**Files**: `src/lib/money/colors.ts`, `tests/e2e/money.spec.ts`

**Intent**: Poziom trudny PLN losuje teraz też 50 i 100 zł (pliki `50zl.png`, `100zl.png` już są), więc `moneyImagePaths` ma je obejmować, a asercja e2e z listą nominałów (`money.spec.ts:63`) musi je dopuszczać; inaczej CI PR-a fazy 1 jest czerwone.

**Contract**: `moneyImagePaths` z `[1,2,5,10,20,50,100]` dla PLN (pełna wersja per waluta w fazie 2).

#### 6. Testy

**Files**: `src/lib/money/*.test.ts`, `src/lib/card-settings.test.ts`, `src/lib/card-engines.test.ts`, `src/lib/card-summary.test.ts`

**Intent**: Dostosować istniejące testy (poziomy per waluta, `WORST_PILES` per waluta: 4 banknoty + 6 monet, `pieceKind` per waluta, domyślne ustawienia z `currency`) i dodać: parser (stary profil bez `currency` → `pln`, śmieć → `pln`), `contentKey` zmienia się z walutą, a nie z kolorami (test I-9 w `card-engines.test.ts`), generator dla każdej pary waluta × poziom (nominały, sumy, `maxNotes`, mieszczenie w ramce, brak `null`), reguła `note-count` w `knownBad`.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint: `npm run lint`
- Typy: `npx astro check`
- Zależności: `npm run depcruise`
- E2E karty: `E2E_PORT=4399 npx playwright test tests/e2e/money.spec.ts --project=chromium`

#### Manual Verification:

- Strona `/money` działa jak dotąd w PLN; poziom trudny pokazuje też banknoty 50 i 100 zł
- Miniatura katalogu karty nie zmieniła się (`git diff` na `public/thumbnails/pieniadze.svg` po `node scripts/build-thumbnails.mjs` jest pusty)

**Implementation Note**: Po fazie i `/10x-impl-review` push i PR do `main`; nie scalam. Kolejna faza dopiero po otwarciu PR.

---

## Faza 2: Obrazki EUR i USD

### Overview

Wycina z makiet pojedyncze, przezroczyste, odchudzone PNG i podłącza je do mapowania ścieżek per waluta.

### Changes Required:

#### 1. Skrypt wycinania

**File**: `scripts/money-cut-images.mjs` (nowy)

**Intent**: Powtarzalne wycięcie obrazków z `context/ideas/waluty/makieta-eur.jpg` i `makieta-usd.jpg`: wypełnienie tła (beż, biała obwódka i przerywana linia cięcia) od narożników przez piksele jasne, największa pozostała składowa to korpus monety albo banknotu, przycięcie do ramki korpusu, przezroczystość poza korpusem, skalowanie (monety ok. 256 px, banknoty ok. 480 px szerokości) i kwantyzacja do 256 kolorów. Rozpoznanie elementów po położeniu składowych na makiecie; skrypt nie jest zależnością projektu (`sharp` instalowany poza `package.json`, komentarz w nagłówku).

**Contract**: wyjście w `public/money/`: `1eur.png`, `2eur.png`, `5eur.png`, `10eur.png`, `20eur.png`, `50eur.png`, `100eur.png`, `1usd.png`, `5usd.png`, `10usd.png`, `20usd.png`, `50usd.png`, `100usd.png`.

#### 2. Mapowanie ścieżek

**File**: `src/lib/money/colors.ts`

**Intent**: `moneyImage(value, currency, colors)` i `moneyImagePaths(currency)` z nazwami `<nominał>zl.png`, `<nominał>eur.png`, `<nominał>usd.png`; PLN o nominałach 50 i 100 używa istniejących `50zl.png` i `100zl.png`.

**Contract**: ścieżki zawsze pochodzą z listy nominałów waluty (`currencies.ts`); `moneyImagePaths(currency)` zwraca obrazki wszystkich nominałów, które występują na jakimkolwiek poziomie tej waluty.

#### 3. Test spójności

**File**: `src/lib/money/colors.test.ts`

**Intent**: Dla każdej pary waluta × nominał użyty na którymkolwiek poziomie plik istnieje w `public/money/`; PNG ma nagłówek i przezroczysty narożnik; wymiary zgodne z proporcją monety (kwadrat) albo banknotu (ok. 2:1).

**Contract**: test czyta pliki z dysku (`node:fs`), bez przeglądarki.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint i typy: `npm run lint`, `npx astro check`

#### Manual Verification:

- Obejrzane wszystkie 13 nowych PNG: równe krawędzie, bez beżowego tła i przerywanych linii, nominał czytelny, rozmiar plików rozsądny (pojedynczo poniżej ok. 80 kB)
- Moneta 1 $ ma cyfrę albo „1 DOLLAR” czytelne na kartce (makieta nie ma cyfry na monecie 1 $; do oceny użytkowniczki)

**Implementation Note**: PR fazy opisuje, że obrazki USD z portretami wchodzą bez oceny prawnej (decyzja użytkowniczki: usunie przed merge, jeśli będzie wątpliwa).

---

## Faza 3: UI, czarny druk, dokumenty

### Overview

Wybór waluty na pasku, ładowanie obrazków wybranej waluty, znak waluty w czarnym druku, testy e2e i aktualizacja PRD oraz opisów.

### Changes Required:

#### 1. Pasek i rysowanie

**File**: `src/components/MoneyGenerator.tsx`

**Intent**: Dodać `SudokuChoice` „Waluta” (opcje z `MONEY_CURRENCIES`) między poziomem a kolorami; zmiana waluty woła `memory.remember` i `applySettings` jak zmiana poziomu; lista poziomów z `moneyLevels(currency)`; preload obrazków wybranej waluty; w czarnym rysunku `Pile` mały znak waluty (€, $) dla `eur`/`usd` (moneta: pod liczbą; banknot: w rogu), PLN bez znaku jak dziś.

**Contract**: znak jest tekstem SVG w `var(--foreground)`; nowe wartości w `MONEY_SHEET` (`currencySymbolFontSize`); klasy przez `cn()`; bez nowych kolorów.

#### 2. Testy e2e

**Files**: `tests/e2e/money.spec.ts`, `tests/e2e/card-settings.spec.ts`, `tests/e2e/phone-layout.spec.ts`

**Intent**: Dostosować regex ścieżki obrazka (`/money/(\d+)(zl|eur|usd).png`), dodać: zmiana waluty układa nową kartę z nominałami waluty, profil pamięta walutę po przeładowaniu, na telefonie pasek z walutą nie zasłania Generuj/Drukuj/Profil.

**Contract**: selektory po roli i nazwie („Waluta”), jak „Kolory”.

#### 3. Dokumenty i opisy

**Files**: `context/foundation/prd.md`, `src/lib/cards.ts` (opis rodzaju), `context/domain/glossary.md`

**Intent**: PRD: US-23/US-24 (waluta, nominały trudnego, USD łatwy z banknotem 5 $), FR-033/FR-034, Business Logic „Karta „Kto ma więcej?”” (tabela nominałów per waluta, `MAX_NOTES`), tabela „Profil i zapamiętane ustawienia” (poziom, waluta, kolory), Open Questions 14 (obrazki EUR/USD, ocena prawna po stronie użytkowniczki). Opis w `CARD_KINDS` wspomina walutę. Glossary: „waluta” jako pojęcie karty.

**Contract**: zmiany wąskie (sekcje karty pieniędzy), bo #265 edytuje inne części PRD.

### Success Criteria:

#### Automated Verification:

- Testy, lint, typy, zależności: `npm test`, `npm run lint`, `npx astro check`, `npm run depcruise`
- Build: `npm run build`
- E2E: `E2E_PORT=4399 npx playwright test tests/e2e/money.spec.ts tests/e2e/card-settings.spec.ts --project=chromium`

#### Manual Verification:

- W przeglądarce: wybór EUR i USD, kolory włączone i wyłączone, kupki mieszczą się w ramkach także na trudnym
- Druk (podgląd) pokazuje jedną stronę A4, bez nachodzenia kawałków
- Pasek na telefonie (360 px) nie zasłania przycisków

**Implementation Note**: Test układu i druku na iOS Safari/Brave (lessons.md) zostaje użytkowniczce; PR to odnotowuje.

---

## Testing Strategy

### Unit Tests:

- Generator dla każdej pary waluta × poziom: nominały, sumy, liczba sztuk, `maxNotes`, mieszczenie w ramce, brak powtórzeń, czas poniżej 5 s
- Parser ustawień (stary profil, wartość nieznana), `contentKey`, podsumowanie profilu, istnienie plików obrazków

### Integration Tests:

- E2E `/money`: zmiana waluty i poziomu, obrazki z właściwej waluty, pamięć profilu

### Manual Testing Steps:

1. Wygeneruj kartę w trzech walutach na trzech poziomach i obejrzyj podgląd druku
2. Włącz kolory i sprawdź, że karta jest ta sama
3. Wybierz profil, zmień walutę, przeładuj stronę

## Performance Considerations

Preload obrazków tylko wybranej waluty. Pliki PNG po kwantyzacji do 256 kolorów, pojedynczo rzędu kilkudziesięciu kB. Generowanie trudnego z siedmioma nominałami musi zostać poniżej 5 s (test).

## Migration Notes

Zapisane profile i ostatnie parametry bez `currency` wczytują się jako `pln` (parser, bez migracji). Poziom trudny PLN zmienia zestaw (dochodzą 50 i 100 zł); wcześniej zapisany poziom zostaje ważny.

## References

- Related research: `context/changes/gh324-waluty-eur-usd/research.md`
- Poprzednia zmiana: `context/archive/2026-11-08-coins-colors/`
- Wzorzec ustawienia na pasku: `src/components/MoneyGenerator.tsx:94-101`, `src/components/SudokuChoice.tsx`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Model waluty, poziomy i silnik

#### Automated

- [x] 1.1 Testy przechodzą: `npm test` — a6778cb
- [x] 1.2 Lint: `npm run lint` — a6778cb
- [x] 1.3 Typy: `npx astro check` — a6778cb
- [x] 1.4 Zależności: `npm run depcruise` — a6778cb
- [x] 1.7 E2E karty: `E2E_PORT=4399 npx playwright test tests/e2e/money.spec.ts --project=chromium` — a6778cb

#### Manual

- [ ] 1.5 Strona `/money` działa jak dotąd w PLN; poziom trudny pokazuje też banknoty 50 i 100 zł
- [ ] 1.6 Miniatura katalogu karty nie zmieniła się

### Phase 2: Obrazki EUR i USD

#### Automated

- [x] 2.1 Testy przechodzą: `npm test` — 9ef3f81
- [x] 2.2 Lint i typy: `npm run lint`, `npx astro check` — 9ef3f81

#### Manual

- [ ] 2.3 Obejrzane wszystkie 13 nowych PNG: równe krawędzie, bez tła i przerywanych linii, nominał czytelny, rozmiar plików rozsądny
- [ ] 2.4 Moneta 1 $ czytelna na kartce (do oceny użytkowniczki)

### Phase 3: UI, czarny druk, dokumenty

#### Automated

- [x] 3.1 Testy, lint, typy, zależności: `npm test`, `npm run lint`, `npx astro check`, `npm run depcruise` — d1ddcce
- [x] 3.2 Build: `npm run build` — d1ddcce
- [x] 3.3 E2E: `E2E_PORT=4399 npx playwright test tests/e2e/money.spec.ts tests/e2e/card-settings.spec.ts --project=chromium` — d1ddcce

#### Manual

- [ ] 3.4 W przeglądarce: wybór EUR i USD, kolory włączone i wyłączone, kupki mieszczą się w ramkach także na trudnym
- [ ] 3.5 Druk (podgląd) pokazuje jedną stronę A4, bez nachodzenia kawałków
- [ ] 3.6 Pasek na telefonie (360 px) nie zasłania przycisków
