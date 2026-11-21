# Nazwy kart przy zapamiętanych ustawieniach profilu alfabetycznie — plan implementacji

## Overview

Okno profilu ma listować nazwy kart alfabetycznie po polskich tytułach. `CARD_KINDS` jest w tej samej kolejności: nowa karta jest wstawiana w swoje miejsce, a nie dopisywana na końcu. Issue [#429](https://github.com/agapios-eu/printo-kids/issues/429) odwraca decyzję z 2026-10-28, która zostawiała rejestr przy kolejności dopisania.

## Current State Analysis

`cardSummaries()` w `src/lib/card-summary.ts` zwraca każdy rodzaj z `CARD_KINDS`, także kartę, której profil nie używał (szczegół „domyślne”). Labirynt jest zawsze „użyty”, bo ustawienia labiryntu mają wartość domyślną. Funkcja niczego nie sortuje. `ProfileSummary` w `src/components/ProfileCorner.tsx` rysuje tę tablicę wprost: tytuł po lewej, szczegół po prawej.

`cardsInCatalogOrder()` w `src/lib/cards.ts` zwraca kopię `CARD_KINDS` posortowaną przez `title.localeCompare(right.title, "pl")`, bez opcji i bez osobnego tie-breaka. Równe tytuły zostałyby w kolejności dopisania, bo `Array.prototype.sort` jest stabilne; dziś żaden tytuł się nie powtarza. Katalog, plakietki (klucz `id`) i „Jak to działa” już używają tej kopii.

Pierwsze trzy nazwy dziś: Labirynt, Symetria, Sudoku. Po zmianie: Dyktando graficzne, Kodowanie, Krzyżówka matematyczna.

Test `lists every card in the order of CARD_KINDS with their pages` porównuje wynik z `CARD_KINDS`. E2E `the edit window shows the rule and a read-only summary of every card` sprawdza widoczność linków, nie pozycję, i nie ma asercji „Który nie pasuje”. US-08 opisuje okno i podaje przykład treści wiersza, bez kolejności listy.

## Desired End State

W oknie edycji profilu nazwy w podsumowaniu stoją alfabetycznie. Wiersze „domyślne” zostają. `CARD_KINDS` jest w tej samej kolejności, więc nowa karta wchodzi w swoje miejsce w rejestrze. Test oblewa dopisanie jej na końcu, poza tym miejscem.

PRD przy oknie profilu mówi, że te nazwy idą alfabetycznie, bo rejestr kart jest ułożony alfabetycznie po polskich tytułach i nowa karta wchodzi w swoje miejsce. Przykład „Labirynt: Poziom 4 · Nonogram: średni, Zwierzęta” zostaje wzorem treści wiersza.

Sprawdzenie: `npm test` oraz `npx playwright test tests/e2e/profile-summary.spec.ts --project=chromium`.

### Key Discoveries:

- Kolejność podsumowania to `CARD_KINDS.map` w `src/lib/card-summary.ts:40-41`. Komentarz nad funkcją mówi wprost „in the order of CARD_KINDS”.
- Komparator katalogu jest w `src/lib/cards.ts:128-130`. Test w `src/lib/cards.test.ts` wymaga polskich tytułów w `CARD_KINDS` i tego, żeby `cardsInCatalogOrder()` nadal zwracało kopię.
- Jedyny widoczny konsument kolejności `cardSummaries()` to `ProfileSummary` (`src/components/ProfileCorner.tsx:582`). `catalogBadges` składa rekord po `id`, więc kolejność tablicy go nie zmienia.
- Plan `context/archive/2026-10-28-catalog-alpha-order/plan.md` zostawił podsumowanie przy dopisaniu celowo (nowa karta na końcu listy). Issue 429 odwraca to i dla podsumowania, i dla rejestru: nowa karta wchodzi w swoje miejsce alfabetu.
- E2E katalogu (`tests/e2e/catalog.spec.ts:10-26`) porównuje DOM z `localeCompare(..., "pl")` w procesie testu, nie z zahardkodowaną listą.

## What We're NOT Doing

- Zostawianie `CARD_KINDS` w kolejności dopisania. Rejestr jest alfabetyczny; katalog i „Jak to działa” czytają tę samą kolejność.
- Ukrywanie wierszy „domyślne” albo zmiana treści szczegółu.
- Drugi komparator (inne opcje `localeCompare`, ręczna lista tytułów).
- Przestawianie przykładu w US-08 i tabeli ustawień w Business Logic „Profil i zapamiętane ustawienia”.
- Uzupełnianie glosariusza.

## Implementation Approach

`cardSummaries()` idzie po `cardsInCatalogOrder()` zamiast po `CARD_KINDS`. Jedna funkcja zostaje źródłem alfabetu. Test jednostkowy porównuje id i adres z tą kopią, nie z zahardkodowaną listą. E2E dopisuje kolejność tytułów w istniejącej liście podsumowania, tym samym `localeCompare(..., "pl")` co katalog. Zdanie w PRD jest osobną fazą, żeby dało się je sprawdzić bez mieszania z sortowaniem.

## Faza 1: Kolejność w cardSummaries

### Overview

Podsumowanie profilu zwraca karty w kolejności katalogu. Test jednostkowy i E2E okna edycji pilnują tej kolejności. Widoczne asercje treści linków zostają.

### Changes Required:

#### 1. Źródło kolejności podsumowania

**File**: `src/lib/card-summary.ts`

**Intent**: `cardSummaries()` ma oddawać każdy rodzaj w kolejności katalogu, bo okno profilu rysuje tę tablicę bez własnego sortowania.

**Contract**: Wynik nadal ma po jednym wierszu na każdy `CardKind`, z tymi samymi polami (`id`, `title`, `href`, `used`, `badge`, `detail`). Podsumowanie idzie po `cardsInCatalogOrder()`. Komentarz nad funkcją przestaje mówić o kolejności dopisania. `CARD_KINDS` jest w kolejności polskich tytułów: nowa karta jest wstawiana w swoje miejsce, a nie dopisywana na końcu. `cardsInCatalogOrder()` nadal zwraca kopię. `catalogBadges` bez zmian.

#### 2. Test kolejności

**File**: `src/lib/card-summary.test.ts`

**Intent**: Test, który dziś utrwala kolejność dopisania, ma utrwalać kolejność katalogu, żeby następna karta nie wróciła na koniec podsumowania.

**Contract**: Asercja id i `href` porównuje wynik z `cardsInCatalogOrder()`, nie z `CARD_KINDS`. Nazwa testu nie może dalej mówić „order of CARD_KINDS”. Pozostałe testy pliku, które szukają wiersza po id, zostają.

#### 3. Kolejność w oknie edycji

**File**: `tests/e2e/profile-summary.spec.ts`

**Intent**: Test okna edycji ma złapać przestawienie listy na stronie, nie tylko w funkcji.

**Contract**: W teście `the edit window shows the rule and a read-only summary of every card` tytuły linków listy podsumowania, w kolejności DOM, równają się tym tytułom posortowanym przez `localeCompare(..., "pl")`. Porównanie dotyczy samych tytułów, nie całych nazw dostępnych (te zawierają szczegół, np. „Labirynt Poziom 4”). Istniejące asercje widoczności zostają. Osobnej asercji widoczności „Który nie pasuje” nie dopisujemy: pełna sekwencja tytułów już go obejmuje. Test zostaje na projekcie `chromium`.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi; test kolejności w `src/lib/card-summary.test.ts` porównuje wynik z `cardsInCatalogOrder()`, a `src/lib/cards.test.ts` wymaga, żeby tytuły `CARD_KINDS` były alfabetyczne po polsku
- `npx playwright test tests/e2e/profile-summary.spec.ts --project=chromium` przechodzi, w tym asercja kolejności tytułów; gdy port 4321 zajmuje inny checkout, ustaw `E2E_PORT`

#### Manual Verification:

- W oknie edycji profilu pierwsza nazwa podsumowania to Dyktando graficzne, a dalsza kolejność jest taka jak katalog na stronie głównej

**Implementation Note**: Po zielonych testach automatycznych zatrzymaj się na ręczne potwierdzenie okna, zanim przejdziesz do fazy 2.

---

## Faza 2: Zdanie w PRD

### Overview

US-08 mówi, że nazwy w podsumowaniu ustawień idą alfabetycznie, bo rejestr kart jest ułożony alfabetycznie po polskich tytułach i nowa karta wchodzi w swoje miejsce. Przykład treści wiersza i tabela ustawień zostają tam, gdzie są.

### Changes Required:

#### 1. Zdanie przy oknie profilu

**File**: `context/foundation/prd.md`

**Intent**: Rodzic i następny autor mają w PRD tę samą regułę, którą realizuje `cardSummaries()`.

**Contract**: Jedno zdanie w punkcie US-08, który zaczyna się od „Okno profilu pokazuje imię…”. Mówi, że nazwy w podsumowaniu ustawień idą alfabetycznie, bo rejestr kart jest ułożony alfabetycznie po polskich tytułach i nowa karta wchodzi w swoje miejsce. Przykład „Labirynt: Poziom 4 · Nonogram: średni, Zwierzęta” zostaje. Tabela w Business Logic „Profil i zapamiętane ustawienia” zostaje w dotychczasowej kolejności.

### Success Criteria:

#### Manual Verification:

- Punkt US-08 o oknie profilu mówi, że nazwy podsumowania idą alfabetycznie, bo rejestr kart jest ułożony alfabetycznie po polskich tytułach i nowa karta wchodzi w swoje miejsce, a przykład „Labirynt: Poziom 4 · Nonogram…” i tabela ustawień w Business Logic są w dotychczasowej kolejności

**Implementation Note**: Faza nie ma sprawdzenia automatycznego. Po dopisaniu zdania pokaż diff tego punktu.

---

## Testing Strategy

### Unit Tests:

- Kolejność `cardSummaries()` jest kolejnością `cardsInCatalogOrder()` (id i adres).
- Tytuły `CARD_KINDS` są równe tej tablicy po `localeCompare(..., "pl")`. Test w `src/lib/cards.test.ts` to sprawdza. `cardsInCatalogOrder()` nadal zwraca kopię, nie tę samą tablicę.

### Integration Tests:

- E2E okna edycji: tytuły listy podsumowania w DOM są posortowane przez `localeCompare(..., "pl")`. Asercje treści poszczególnych linków zostają.

### Manual Testing Steps:

1. Uruchom aplikację, otwórz edycję istniejącego profilu.
2. Porównaj nazwy podsumowania z katalogiem na `/`. Pierwsza nazwa to Dyktando graficzne, Labirynt nie jest pierwszy.
3. Przeczytaj punkt US-08 i sprawdź, że przykład wiersza oraz tabela ustawień nie zostały przestawione.

## Performance Considerations

Lista ma czternaście tytułów i jest sortowana raz na render okna, wewnątrz już istniejącej funkcji. Osobnego budżetu nie ma.

## Migration Notes

Kolejność nie jest zapisana w profilu. Zapisane profile i ostatnie parametry czyta się tak jak dziś.

## References

- Issue [#429](https://github.com/agapios-eu/printo-kids/issues/429)
- Decyzja odwracana dla podsumowania i rejestru: `context/archive/2026-10-28-catalog-alpha-order/plan.md`
- Komparator: `src/lib/cards.ts:128`
- Wzorzec asercji E2E: `tests/e2e/catalog.spec.ts:10`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Kolejność w cardSummaries

#### Automated

- [x] 1.1 `npm test` przechodzi; test kolejności w `src/lib/card-summary.test.ts` porównuje wynik z `cardsInCatalogOrder()`, a `src/lib/cards.test.ts` wymaga, żeby tytuły `CARD_KINDS` były alfabetyczne po polsku — 42178bc7
- [x] 1.2 `npx playwright test tests/e2e/profile-summary.spec.ts --project=chromium` przechodzi, w tym asercja kolejności tytułów; gdy port 4321 zajmuje inny checkout, ustaw `E2E_PORT` — 42178bc7

#### Manual

- [x] 1.3 W oknie edycji profilu pierwsza nazwa podsumowania to Dyktando graficzne, a dalsza kolejność jest taka jak katalog na stronie głównej — 42178bc7

### Phase 2: Zdanie w PRD

#### Manual

- [x] 2.1 Punkt US-08 o oknie profilu mówi, że nazwy podsumowania idą alfabetycznie, bo rejestr kart jest ułożony alfabetycznie po polskich tytułach i nowa karta wchodzi w swoje miejsce, a przykład „Labirynt: Poziom 4 · Nonogram…” i tabela ustawień w Business Logic są w dotychczasowej kolejności — 7b0a75bd
