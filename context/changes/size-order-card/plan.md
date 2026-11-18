# Od najmniejszego (S-48) — plan implementacji

## Overview

Czternasta karta: „Od najmniejszego” (`/size-order`, id `odnajmniejszego`). Na A4 stoi zdanie polecenia z postacią w dymku i 4–5 rzędów; w rzędzie jedna sylwetka (ikona z „Który nie pasuje” albo kształt sudoku) w 3 / 4 / 5 wielkościach w pomieszanej kolejności, na wspólnej linii dolnej, a pod każdą szerokie puste pole na cyfrę albo kropki. Dziecko wpisuje miejsce od najmniejszego (1, 2, 3…). Poziomy łatwy / średni / trudny, przełącznik „Kolory” (jedna kredka na rząd, nie układa nowej karty). Profil pamięta poziom i kolory. Wejście: PRD US-37, US-38, FR-047, FR-048, Business Logic „Karta „Od najmniejszego””, Open Questions 19 i makieta `context/changes/size-order-card/` (PR #423); roadmapa S-48, GitHub #420.

## Current State Analysis

Katalog ma trzynaście kart; najbliższy wzór to „Który nie pasuje” (`src/lib/odd-one-out/`, `OddOneOutGenerator.tsx`, `OddOneOutPicture.tsx`) i świeżo zamknięte kodowanie (`context/changes/coding-card/plan.md`). PRD i makieta (`mockup.mts`: wysokości, układ rzędu, linia dolna, ograniczenie szerokości szerokich ikon, jedna kredka na rząd, pula obrazków) są na `main`, więc dokumenty są małe i łączą się z logiką w fazie 1.

Decyzje (użytkowniczka 2026-11-18, PRD): 3 / 4 / 5 obrazków i 4 / 4 / 5 rzędów, najmniejszy krok ×1,35 / ×1,25 / ×1,14; zawsze „od najmniejszego”; ikony i kształty mieszane na jednej karcie (≥1 każdego, bez powtórek), bez kategorii; polecenie „Od najmniejszego: wpisz 1, 2, 3… albo narysuj kropki.”; bez klucza i bez „Pokaż rozwiązanie”. Przyjęte bez pytania (można zmienić): domyślny poziom łatwy; nazwy techniczne poniżej.

### Key Discoveries:

- Rejestry: `src/lib/cards.ts` (`CARD_KINDS`, wpis „kodowanie” :108 jako wzór; opis rodzaju żyje tu i zasila „Jak to działa”), `src/lib/card-settings.ts` (`CardSettingsMap`, `CARD_SETTINGS_IDS`, `DEFAULTS`, `levelIds()`, `parseStoredCards`), `src/lib/card-engines.ts` (`CardTypeMap`, `CARD_ENGINES`; `card-engines.test.ts` `INVENTORY` typowane po `CardKindId`, brak wpisu = błąd kompilacji), `src/lib/card-summary.ts` (`summaryParts`, `badgeOf`).
- Kontrakt: `src/lib/card-contract.ts` (`CardSpec`: `problems`, `keyOf`, `contentKey`, `knownBad` ≥ 2 z `expectedCode`; `VerifiedCard`, `CardExhausted`). Wzór: `src/lib/odd-one-out/engine.ts`.
- Zmiana ustawienia przy pokazanej karcie: `applySettings` (`src/lib/sheet-state.ts`) układa nową kartę tylko, gdy `spec.contentKey(settings)` się zmienia. **Kolory nie mogą wchodzić do `contentKey`** (PRD: nie układają nowej karty; odwrotnie niż w „Który nie pasuje”), poziom tak. Karta nosi więc kredkę rzędu zawsze (wylosowaną), a rysunek używa jej tylko przy `colors`.
- Obrazki: `ICONS`, `Icon`, `IconFigure`, `ICON_BOX` (`src/lib/odd-one-out/icons.ts`); `SUDOKU_SHAPES`, `sudokuShapePath(id, cx, cy, size)` (`src/lib/sudoku/shapes.ts`). Makieta liczy obrys ikony (`iconBounds`, tylko figury „ink”) i stawia ikonę na linii dolnej; ten kod idzie do `src/lib/size-order/` (najpierw sprawdzić, czy `odd-one-out/layout.ts` albo `OddOneOutPicture.tsx` nie ma gotowego obrysu do reuse).
- Strona: `OddOneOutGenerator.tsx` jako wzór (`useCardPage`, `useCardSettings`, `LevelChoice`, `SettingToggle`, `CharacterInstruction`, `CardPage`); SVG A4 z `print:h-[297mm] print:w-[210mm]`; tekst SVG z jawnym przesunięciem linii bazowej, nie `dominant-baseline` (lekcja GitHub 371).
- Bramki: skrypt `test` w `package.json` wymienia każdy plik testów (pilnuje `src/lib/test-script.test.ts`); `cards-only-through-engines` w `.dependency-cruiser.cjs`; `print-contract.test.ts` (stała ścieżki strony, SVG 210×297, brak `print:hidden` na arkuszu, brak własnego `@page`); `how-it-works.spec.ts` sprawdza brzmienie zdania „Poziomy” z `how-it-works.astro` (dopisać „Od najmniejszego” do kart łatwy / średni / trudny).
- Miniatura: `scripts/build-thumbnails.mjs` (sekcja odd-one-out ok. :537, wyjście `public/thumbnails/<id>.svg`) z prawdziwego generatora. Wzory e2e: `tests/e2e/odd-one-out*.spec.ts`, `card-settings.spec.ts`, `character-speaks.spec.ts`, `phone-layout.spec.ts`, `phone-settings-rows.spec.ts`, `profile-summary.spec.ts`.
- Koszt: generowanie to losowanie bez solvera (odpowiedź z konstrukcji), więc NFR 5 s nie jest ryzykiem.

## Desired End State

Rodzic otwiera z katalogu „Od najmniejszego”, wybiera poziom (łatwy domyślnie) i „Kolory”, klika Generuj i dostaje jedną stronę A4. Zmiana poziomu przy pokazanej karcie układa nową kartę; zmiana kolorów zostawia tę samą. Profil i ostatnie parametry pamiętają poziom i kolory, katalog pokazuje plakietkę poziomu, okno profilu podsumowanie. „Jak to działa” opisuje kartę. Weryfikacja: `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`, Playwright na czterech projektach Chromium, smoke, przegląd każdego poziomu i wydruk na A4.

## What We're NOT Doing

- „Od największego”, klucz, przełącznik „cyfry / kropki”, kategorie, „Pokaż rozwiązanie”, kolor wskazujący wielkość (PRD Non-Goals).
- Inne miary niż wysokość (szerokość, długość, ciężar), sylwetki z katalogu szablonów.
- Stryker na module (S-50), tagi katalogu (S-43), przebudowa „Jak to działa” i podsumowania profilu (S-52, S-53), `test-plan.md` (S-51).
- Ocena wpisu dziecka; aplikacja zna kolejność, nie sprawdza odpowiedzi.

## Implementation Approach

Rytm kodowania: każda faza na osobnej gałęzi z `origin/main` i PR do `main`; **każda faza kończy się `/10x-impl-review` przed PR fazy** (reguła repo). Faza 1 to dokumenty i logika bez UI i bez rejestracji w katalogu, faza 2 strona i rejestry, faza 3 wydruk po scaleniu.

Nazwy: id `odnajmniejszego`, trasa `/size-order`, `src/lib/size-order/`, `SizeOrderCard`, `SizeOrderSettings { level: SizeOrderLevelId; colors: boolean }`, `SizeOrderGenerator` i `SizeOrderSheet`.

Reguły karty (zgodne z PRD):

| Poziom | Obrazków | Rzędów | Wysokości (ułamek najwyższego) | Najmniejszy krok | Najwyższy obrazek (około) | Opis w UI                     |
| ------ | -------- | ------ | ------------------------------ | ---------------- | ------------------------- | ----------------------------- |
| łatwy  | 3        | 4      | 0,48 / 0,74 / 1                | ×1,35            | 36 mm                     | „3 obrazki, wyraźne różnice”  |
| średni | 4        | 4      | 0,5 / 0,63 / 0,79 / 1          | ×1,25            | 36 mm                     | „4 obrazki, mniejsze różnice” |
| trudny | 5        | 5      | 0,55 / 0,65 / 0,76 / 0,87 / 1  | ×1,14            | 24 mm                     | „5 obrazków, małe różnice”    |

Wysokości to stałe poziomu (nie losowane); losuje się obrazek rzędu, kolejność wielkości (nie rosnąca i nie malejąca), kredkę rzędu (siedem kredek z „Który nie pasuje”, różne w kolejnych rzędach) i skład puli (≥1 ikona, ≥1 kształt, bez powtórek na karcie).

## Phase 1: Dokumenty i logika karty

### Overview

Glosariusz, status roadmapy i moduł `src/lib/size-order/` bez UI i bez rejestracji w `cards.ts`: poziomy, karta, generator, układ w mm, silnik, testy.

### Changes Required:

#### 1. Dokumenty

**File**: `context/domain/glossary.md`, `context/foundation/roadmap.md` (S-48 `planning`), `context/changes/size-order-card/change.md` (`planned`)

**Intent**: Nazwać pojęcia przed kodem.

**Contract**: glosariusz: Od najmniejszego (karta; `odnajmniejszego`, `SizeOrderCard`, `src/lib/size-order/`, `/size-order`; nie „porządkowanie”, nie „size worksheet”); Rząd wielkości (jeden obrazek w n wielkościach, `SizeRow`); Wielkość (wysokość obrysu, `height`; nie „rozmiar kratki”); Krok (stosunek dwóch najbliższych wysokości, `minStep`); do wiersza „Rodzaj karty” dopisać id `odnajmniejszego`.

#### 2. Poziomy i stałe druku

**File**: `src/lib/size-order/levels.ts`, `src/lib/size-order/sheet.ts`

**Intent**: Jedno miejsce na tabelę poziomów i stałe druku, wspólne dla generatora, arkusza, miniatury i testów.

**Contract**: `SizeOrderLevelId = "latwy" | "sredni" | "trudny"`, `DEFAULT_SIZE_ORDER_LEVEL_ID = "latwy"`, `SizeOrderLevel` (`id`, `label`, `barLabel`, `description`, `itemCount`, `rowCount`, `heights`, `minStep`), `SIZE_ORDER_LEVELS`, `sizeOrderLevelById()`. `SIZE_ORDER_SHEET` (`as const`, komentarz przy każdej stałej): strona 210×297, `inset` 10, pas postaci, pole odpowiedzi 13 × do 30 mm, odstęp pola od linii dolnej 4 mm, `rowPad` 4 mm, udział szerokości slotu 0,85 dla szerokiego obrazka, stała grubość konturu kształtu ok. 1 mm, instrukcja.

#### 3. Karta, reguły i generator

**File**: `src/lib/size-order/card.ts`, `src/lib/size-order/generate.ts`

**Intent**: Karta z jedną odpowiedzią z konstrukcji i stabilnymi kodami problemów; generator losuje bez solvera.

**Contract**: `SizeOrderPicture = { kind: "icon"; id } | { kind: "shape"; id }`, `SizeRow` (`picture`, `heights` w kolejności na kartce, `crayon`), `SizeOrderCard` (`levelId`, `rows`). `answerOf(row)` (miejsce od najmniejszego dla każdego slotu). `sizeOrderCardProblems(card, level)` zwraca kody: `settings-mismatch`, `wrong-row-count`, `wrong-item-count`, `heights-not-level`, `step-too-small`, `row-already-ordered` (rosnąco albo malejąco), `duplicate-picture`, `missing-icon`, `missing-shape`, `crayon-repeated` (ta sama kredka w sąsiednich rzędach). `generateSizeOrderCard(rand, level)`: obrazki z puli `ICONS` + `SUDOKU_SHAPES` z warunkiem ≥1/≥1, kolejność i kredki.

#### 4. Silnik

**File**: `src/lib/size-order/engine.ts`

**Intent**: Karta jako rodzaj karty: `sizeOrderSpec` + `sizeOrderEngine`, nigdy `null`; wyczerpanie to `CardExhausted`.

**Contract**: `contentKey(settings)` zależy tylko od `level` (nie od `colors`); `keyOf(card)` z obrazków i kolejności; `knownBad` ≥ 2 kody z `expectedCode` (np. rząd rosnący, powtórzony obrazek, za mały krok).

#### 5. Układ A4

**File**: `src/lib/size-order/layout.ts`

**Intent**: Rozmieszczenie w mm wspólne dla strony, miniatury i testu; obrys ikony i stawianie na linii dolnej (z makiety), rząd mniejszy dla szerokiej ikony.

**Contract**: `layoutSizeOrderSheet(card)` zwraca pas postaci, rzędy (`top`, `baseline`, `boxY`) i dla każdego slotu `cx`, `height`, pole odpowiedzi; wszystko w marginesie 10 mm; najszerszy obrazek mieści się w slocie.

### Success Criteria:

#### Automated Verification:

- Formatowanie dokumentów: `npx prettier --check context/changes/size-order-card/*.md context/domain/glossary.md context/foundation/roadmap.md`
- Testy przechodzą: `npm test`
- Lint: `npm run lint`
- Zależności: `npm run depcruise`
- Typy: `npx astro check`
- Build: `npm run build`

#### Manual Verification:

- Użytkowniczka akceptuje podgląd karty z kodu (skrypt jak `preview.mts` z kodowania; trzy poziomy, z kolorami i bez)
- Przegląd diffu względem planu i makiety (`/10x-impl-review` przed PR fazy)

**Implementation Note**: po tej fazie zatrzymać się na potwierdzenie przed fazą 2.

---

## Phase 2: Strona, katalog i profil

### Overview

Rejestracja karty, strona `/size-order`, arkusz SVG, miniatura, „Jak to działa”, testy jednostkowe i e2e.

### Changes Required:

#### 1. Rejestry

**File**: `src/lib/cards.ts`, `src/lib/card-settings.ts`, `src/lib/card-engines.ts`, `src/lib/card-summary.ts` (i ich testy), `package.json` (skrypt `test`)

**Intent**: Karta w katalogu, ustawienia w profilu i podsumowanie okna profilu.

**Contract**: wpis `CARD_KINDS` (`id: "odnajmniejszego"`, `title: "Od najmniejszego"`, `href: "/size-order"`, `thumbnail`, `description` 2–3 zdania: co dziecko robi i co jest na kartce, zgodnie z PRD US-05); `CardSettingsMap.odnajmniejszego?: SizeOrderSettings`, `DEFAULTS` (łatwy, kolory wyłączone), `levelIds()`; `CardTypeMap`, `CARD_ENGINES`, `INVENTORY`; `summaryParts` (poziom, z `badgeOf(level)`; kolory tylko gdy włączone, jak w „Który nie pasuje”); nowe pliki testów dopisane do skryptu `test`.

#### 2. Strona i arkusz

**File**: `src/pages/size-order.astro`, `src/components/SizeOrderGenerator.tsx`, `src/components/SizeOrderSheet.tsx`

**Intent**: Strona na `CardPage` i `useCardPage` z paskiem Postać · Poziom · Kolory; arkusz SVG z układu `layoutSizeOrderSheet`.

**Contract**: `handleLevelSelect` → `remember` + `applySettings` (nowa karta); `handleColorsChange` → tylko `remember` (ta sama karta, bo `contentKey` bez kolorów); brak „Pokaż rozwiązanie”; błąd generowania jak w `OddOneOutGenerator`; ikona w wysokości rzędu na linii dolnej, kształt z `sudokuShapePath` ze stałym konturem; kolory tylko z tokenów `global.css` (kredki `--symmetry-*`), bez hexów.

#### 3. Miniatura i „Jak to działa”

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/odnajmniejszego.svg`, `src/pages/how-it-works.astro`, `tests/e2e/how-it-works.spec.ts`

**Intent**: Miniatura z prawdziwego generatora na poziomie łatwym bez kolorów; opis karty wynika z `CARD_KINDS`, a zdanie „Poziomy” dostaje „Od najmniejszego” wśród kart łatwy / średni / trudny.

**Contract**: komentarz nagłówkowy skryptu wymienia nową kartę; stałe ziarno, jak przy innych miniaturach.

#### 4. Testy

**File**: `src/lib/size-order/*.test.ts`, `src/lib/sheet/print-contract.test.ts`, `tests/e2e/size-order.spec.ts`, `tests/e2e/size-order-reprint.spec.ts`, `card-settings.spec.ts`, `character-speaks.spec.ts`, `phone-layout.spec.ts`, `phone-settings-rows.spec.ts`, `profile-summary.spec.ts`

**Intent**: Pokryć reguły, rejestry, kontrakt druku i przepływ użytkownika.

**Contract**: jednostkowe na wielu ziarnach dla każdego poziomu (kody `knownBad`; orakl: ta sama sylwetka w rzędzie, wysokości z tabeli, kroki, kolejność, brak powtórek, ≥1/≥1, marginesy 10 mm w układzie, szeroka ikona w slocie); `print-contract` (SVG 210×297, brak `print:hidden`, brak własnego `@page`); e2e: generowanie, zmiana poziomu układa nową kartę, zmiana kolorów zostawia tę samą (te same obrazki i kolejność), zapamiętanie w profilu, plakietka, podsumowanie, „Brak”, ponowny druk, telefon (Generuj i Drukuj się nie zasłaniają).

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe: `npm test`
- Lint, zależności, typy, build: `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`
- E2E na czterech projektach Chromium z własnym portem: `E2E_PORT=4399 npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`
- Smoke na zbudowanym podglądzie: `BASE_URL=http://localhost:4399 npm run smoke`

#### Manual Verification:

- Użytkowniczka sprawdza każdy poziom, kolory (ta sama karta po przełączeniu) i podgląd wydruku (jedna strona A4), z postacią i z „Brak”
- Miniatura w katalogu, plakietka poziomu przy profilu i podsumowanie w oknie profilu są poprawne
- Strona na telefonie: Generuj i Drukuj się nie zasłaniają, karta mieści się na A4
- Przegląd diffu względem planu (`/10x-impl-review` przed PR fazy)

---

## Phase 3: Wydruk próbny

### Overview

Po scaleniu, nie blokuje wydania: wydruk trzech poziomów, z kolorami i bez, i próba z dzieckiem. Zamyka Open Questions 19.

### Changes Required:

#### 1. Poprawki stałych (tylko jeśli wydruk ich wymaga)

**File**: `src/lib/size-order/levels.ts`, `src/lib/size-order/sheet.ts`, `context/foundation/prd.md`, `context/foundation/roadmap.md`

**Intent**: Dopasować kroki wielkości, wysokość najwyższego obrazka albo pole odpowiedzi do wydruku; commit mówi, co wymusiło zmianę.

**Contract**: wartości w tabelach poziomów i `SIZE_ORDER_SHEET`; PRD Business Logic i Open Questions 19 oraz roadmapa S-48 zgodne z kodem.

### Success Criteria:

#### Automated Verification:

- Po ewentualnej poprawce: `npm test` i `npm run build`

#### Manual Verification:

- Wydruk na A4 jest jedną stroną w Safari, Chrome iOS i Brave iOS (lekcja: mierzyć każdą przeglądarkę osobno)
- Krok ×1,14 na trudnym (najwyższy ok. 24 mm) jest widoczny bez linijki; pole 13 mm mieści cyfrę i do pięciu kropek
- Dziecko porządkuje rzędy na łatwym i średnim
- Open Questions 19 zamknięte w PRD, roadmapa S-48 zgodna

---

## Testing Strategy

### Unit Tests:

- Reguły karty dla każdego poziomu na wielu ziarnach; `knownBad` dla każdego kodu problemu; `contentKey` bez kolorów (zmiana kolorów nie zmienia klucza, zmiana poziomu zmienia).
- Układ: margines 10 mm, szeroka ikona w slocie, wspólna linia dolna, wysokości zgodne z tabelą.
- Rejestry: silnik, ustawienia (`parseStoredCards`), podsumowanie, kontrakt druku.
- Stryker poza zakresem: S-50.

### Integration Tests:

- E2E jak w fazie 2 (punkt 4).

### Manual Testing Steps:

1. Wygenerować trzy poziomy; sprawdzić okiem, że w każdym rzędzie to ta sama sylwetka, a kolejność nie jest posortowana.
2. Włączyć „Kolory” przy pokazanej karcie: ta sama karta w kolorach, jedna kredka na rząd; zmienić poziom: nowa karta.
3. Odświeżyć stronę (poziom i kolory zostają); wydrukować na A4 w trzech przeglądarkach iOS.

## Performance Considerations

Generowanie to losowanie bez przeszukiwania (poniżej 1 ms); NFR 5 s bez ryzyka.

## Migration Notes

Brak: pole `cards.odnajmniejszego` w zapisanych profilach dostaje wartość domyślną przez ogólne `parseStoredCards`.

## References

- Makieta i decyzje: `context/changes/size-order-card/change.md`, `mockup.mts`, `mockups.html`
- PRD: US-37, US-38, FR-047, FR-048, Business Logic „Karta „Od najmniejszego””, Open Questions 19; roadmapa S-48
- Wzór planu i kodu: `context/changes/coding-card/plan.md`, `context/archive/2026-11-08-odd-one-out-card/plan.md`, `src/lib/odd-one-out/`, `src/components/OddOneOutGenerator.tsx`
- Obrazki: `src/lib/odd-one-out/icons.ts`, `src/lib/sudoku/shapes.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Dokumenty i logika karty

#### Automated

- [ ] 1.1 Formatowanie dokumentów: `npx prettier --check context/changes/size-order-card/*.md context/domain/glossary.md context/foundation/roadmap.md`
- [ ] 1.2 Testy przechodzą: `npm test`
- [ ] 1.3 Lint: `npm run lint`
- [ ] 1.4 Zależności: `npm run depcruise`
- [ ] 1.5 Typy: `npx astro check`
- [ ] 1.6 Build: `npm run build`

#### Manual

- [ ] 1.7 Użytkowniczka akceptuje podgląd karty z kodu (skrypt jak `preview.mts` z kodowania; trzy poziomy, z kolorami i bez)
- [ ] 1.8 Przegląd diffu względem planu i makiety (`/10x-impl-review` przed PR fazy)

### Phase 2: Strona, katalog i profil

#### Automated

- [ ] 2.1 Testy jednostkowe: `npm test`
- [ ] 2.2 Lint, zależności, typy, build: `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`
- [ ] 2.3 E2E na czterech projektach Chromium z własnym portem: `E2E_PORT=4399 npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`
- [ ] 2.4 Smoke na zbudowanym podglądzie: `BASE_URL=http://localhost:4399 npm run smoke`

#### Manual

- [ ] 2.5 Użytkowniczka sprawdza każdy poziom, kolory i podgląd wydruku (jedna strona A4), z postacią i z „Brak”
- [ ] 2.6 Miniatura w katalogu, plakietka poziomu przy profilu i podsumowanie w oknie profilu są poprawne
- [ ] 2.7 Strona na telefonie: Generuj i Drukuj się nie zasłaniają, karta mieści się na A4
- [ ] 2.8 Przegląd diffu względem planu (`/10x-impl-review` przed PR fazy)

### Phase 3: Wydruk próbny

#### Automated

- [ ] 3.1 Po ewentualnej poprawce: `npm test` i `npm run build`

#### Manual

- [ ] 3.2 Wydruk na A4 jest jedną stroną w Safari, Chrome iOS i Brave iOS
- [ ] 3.3 Krok ×1,14 na trudnym jest widoczny bez linijki; pole 13 mm mieści cyfrę i do pięciu kropek
- [ ] 3.4 Dziecko porządkuje rzędy na łatwym i średnim
- [ ] 3.5 Open Questions 19 zamknięte w PRD, roadmapa S-48 zgodna
