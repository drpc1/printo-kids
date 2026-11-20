# Labirynt liczbowy (S-49) — plan implementacji

## Overview

Piętnasta karta: „Labirynt liczbowy” (`/number-maze`, id `liczby`). Na A4 stoi zdanie polecenia z postacią w dymku i kratka cała wypełniona liczbami; start w lewym górnym rogu, meta w prawym dolnym, obie z grubą ramką i napisem. Dziecko rysuje drogę po sąsiednich kratkach (bez skosów) z kolejnymi liczbami poziomu, omijając pułapki. Poziom 1–6, bez kolorów, kategorii i „Pokaż rozwiązanie”; profil pamięta tylko poziom. Wejście: PRD US-39, US-40, FR-049, FR-050, Business Logic „Karta „Labirynt liczbowy””, Open Questions 20, glosariusz (`liczby`, droga, pułapka, krok liczenia) i makieta `context/changes/number-maze-card/` (PR #433); roadmapa S-49, GitHub #421.

## Current State Analysis

Katalog ma czternaście kart. Najbliższy wzór to krzyżówka matematyczna (`src/lib/math-crossword/`: kratka z liczbami, ustawienia tylko `{ level }`, generator z przeszukiwaniem, osobny `oracle.test.ts`, `MathCrosswordGenerator.tsx`, `MathCrosswordSheet.tsx`); rejestracja i rytm faz jak w świeżo zamkniętym S-48 (`context/archive/2026-11-18-size-order-card/plan.md`). Glosariusz i zamknięte niewiadome roadmapy są już na `main`.

Decyzje (użytkowniczka 2026-11-20, PRD): sześć poziomów z tabeli niżej; pułapki kuszące na każdym poziomie (do 3 kroków od liczb sąsiednich kratek drogi na Poziomach 1–2, do 2 na 3–6), nigdy następna liczba sąsiedniej kratki drogi ani pierwsza czy ostatnia liczba; bez „Pokaż rozwiązanie”, kolorów i kategorii; id `liczby`, strona `/number-maze`. Przyjęte bez pytania (z PRD i wzoru krzyżówki): domyślny Poziom 1; nazwy techniczne poniżej.

### Key Discoveries:

- Rejestry: `src/lib/cards.ts` (`CARD_KINDS`; opis rodzaju zasila „Jak to działa”), `src/lib/card-settings.ts` (`CardSettingsMap` :139–142, `CARD_SETTINGS_IDS` :158–161, `DEFAULTS` :180–183, `levelIds()` :313), `src/lib/card-engines.ts` (`CardTypeMap`, `CARD_ENGINES`; `card-engines.test.ts` `INVENTORY` typowane po `CardKindId`), `src/lib/card-summary.ts` (`summaryParts`, `badgeOf`).
- Kontrakt: `src/lib/card-contract.ts` (`CardSpec`: `problems`, `keyOf`, `contentKey`, `knownBad` ≥ 2 z `expectedCode`; `CardExhausted`). Wzór silnika: `src/lib/math-crossword/engine.ts`. `applySettings` (`src/lib/sheet-state.ts`) układa nową kartę, gdy zmienia się `contentKey`, tu = poziom.
- Generator z makiety (`mockup.mts`): DFS drogi bez samoprzecięć z przycinaniem (odległość i parzystość do mety, osiągalność mety i liczba wolnych kratek), limit węzłów i ponowienie; pułapki z puli liczb bliskich liczbom sąsiednich kratek drogi minus zakazane; `checkOnePath` jako niezależne sprawdzenie. Najdłużej ok. 0,6 s na Poziomie 4 w 200 kartach (`stats.md`).
- Bramki: skrypt `test` w `package.json` wymienia każdy plik testów (`src/lib/test-script.test.ts`); regex `cards-only-through-engines` w `.dependency-cruiser.cjs` :139; `print-contract.test.ts`; `how-it-works.spec.ts` sprawdza zdanie „Poziomy” z `src/pages/how-it-works.astro` :9 (dopisać „Labirynt liczbowy (Poziom 1–6)” do kart z numerami).
- Miniatura: `scripts/build-thumbnails.mjs` (sekcja size-order ok. :957 jako wzór, wyjście `public/thumbnails/<id>.svg`) z prawdziwego generatora. Wzory e2e: `tests/e2e/size-order*.spec.ts`, `math-crossword*.spec.ts`, `card-settings.spec.ts`, `character-speaks.spec.ts`, `phone-layout.spec.ts`, `phone-settings-rows.spec.ts`, `profile-summary.spec.ts`.
- Tekst SVG z jawnym przesunięciem linii bazowej, nie `dominant-baseline` (lekcja GitHub 371). Kolory tylko z tokenów `global.css`.

## Desired End State

Rodzic otwiera z katalogu „Labirynt liczbowy”, wybiera poziom (Poziom 1 domyślnie), klika Generuj i dostaje jedną stronę A4 z kratką liczb, startem i metą. Zmiana poziomu przy pokazanej karcie układa nową kartę. Profil i ostatnie parametry pamiętają poziom, katalog pokazuje plakietkę, okno profilu podsumowanie. „Jak to działa” opisuje kartę. Weryfikacja: `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`, Playwright na czterech projektach Chromium, smoke, przegląd każdego poziomu i wydruk na A4.

## What We're NOT Doing

- Skosy, start i meta poza rogami, liczenie wstecz, liczby ujemne, działania w kratkach, kolory, kategorie, obrazki w kratkach, „Pokaż rozwiązanie” (PRD Non-Goals).
- Ocena drogi narysowanej przez dziecko.
- Stryker na module (S-50), tagi katalogu (S-43), przebudowa „Jak to działa” i podsumowania profilu (S-52, S-53), `test-plan.md` (S-51).

## Implementation Approach

Rytm S-48: każda faza na osobnej gałęzi z `origin/main` i PR do `main`; **każda faza kończy się `/10x-impl-review` przed PR fazy** (reguła repo). Faza 1 to logika bez UI i bez rejestracji, faza 2 strona i rejestry, faza 3 wydruk po scaleniu.

Nazwy: id `liczby`, trasa `/number-maze`, `src/lib/number-maze/`, `NumberMazeCard`, `NumberMazeSettings { level: NumberMazeLevelId }`, `NumberMazeGenerator` i `NumberMazeSheet`.

Reguły karty (zgodne z PRD):

| Poziom | Pierwsza / krok / liczb | Kratka (kol × rz) | Pułapki | Bliskość pułapek | Kratka (około) | Polecenie                                     | Opis w UI                       |
| ------ | ----------------------- | ----------------- | ------- | ---------------- | -------------- | --------------------------------------------- | ------------------------------- |
| 1      | 1 / 1 / 15              | 5×5               | 10      | 3 kroki          | 30 mm          | „Idź po liczbach 1, 2, 3… od startu do mety.” | „liczby do 15, duża kratka”     |
| 2      | 1 / 1 / 20              | 5×6               | 10      | 3 kroki          | 30 mm          | jak wyżej                                     | „liczby do 20”                  |
| 3      | 1 / 1 / 30              | 6×7               | 12      | 2 kroki          | 30 mm          | jak wyżej                                     | „liczby do 30”                  |
| 4      | 1 / 1 / 50              | 8×9               | 22      | 2 kroki          | 24 mm          | jak wyżej                                     | „liczby do 50, mniejsza kratka” |
| 5      | 2 / 2 / 30              | 6×7               | 12      | 2 kroki          | 30 mm          | „Licz co 2: 2, 4, 6… od startu do mety.”      | „liczenie co 2 do 60”           |
| 6      | 5 / 5 / 40              | 7×8               | 16      | 2 kroki          | 27 mm          | „Licz co 5: 5, 10, 15… od startu do mety.”    | „liczenie co 5 do 200”          |

Losuje się droga i liczby pułapek; tabela to stałe poziomu.

## Phase 1: Logika karty

### Overview

Moduł `src/lib/number-maze/` bez UI i bez rejestracji w `cards.ts`: poziomy, stałe druku, karta, generator, silnik, układ w mm, testy i podgląd z kodu. Status `planned` w `change.md` i `planning` w roadmapie ustawia `/10x-plan`; faza 1 przesuwa roadmapę na `in-progress`.

### Changes Required:

#### 1. Poziomy i stałe druku

**File**: `src/lib/number-maze/levels.ts`, `src/lib/number-maze/sheet.ts`

**Intent**: Jedno miejsce na tabelę poziomów i stałe druku, wspólne dla generatora, arkusza, miniatury i testów.

**Contract**: `NumberMazeLevelId = "poziom1" … "poziom6"` (format krzyżówki, `src/lib/math-crossword/levels.ts:1`), `DEFAULT_NUMBER_MAZE_LEVEL_ID = "poziom1"`, `NumberMazeLevel` (`id`, `label`, `barLabel`, `description`, `cols`, `rows`, `first`, `step`, `count`, `near`, `instruction`), `NUMBER_MAZE_LEVELS`, `numberMazeLevelById()`, `lastNumber(level)`. `NUMBER_MAZE_SHEET` (`as const`, komentarz przy każdej stałej): strona 210×297, `inset` 10, pas postaci i odstęp, pas napisów „Start”/„Meta”, `maxCell` 30 mm, grubość ramki startu i mety, udział wysokości cyfry w kratce (dwie cyfry / trzy cyfry).

#### 2. Karta i reguły

**File**: `src/lib/number-maze/card.ts`

**Intent**: Karta z jedną drogą i stabilnymi kodami problemów; sprawdzenie jednej drogi niezależne od budowy karty.

**Contract**: `NumberMazeCard` (`levelId`, `values: number[]` wiersz po wierszu, `path: number[]` indeksy kratek od startu do mety). `numberMazeCardProblems(card, level)` zwraca kody: `settings-mismatch`, `wrong-grid-size`, `start-not-first`, `goal-not-last`, `path-wrong-length`, `path-not-adjacent`, `path-revisits`, `path-values-wrong` (liczby drogi nie są kolejnymi liczbami poziomu), `ambiguous-next` (idąc od startu, kratka drogi ma zero albo więcej niż jedną sąsiednią kratkę z następną liczbą), `trap-out-of-range` (poza zakresem albo nie w kroku poziomu), `trap-repeats-endpoint` (pułapka z pierwszą albo ostatnią liczbą). `ambiguous-next` liczy się po samych `values`, bez `path`.

#### 3. Generator

**File**: `src/lib/number-maze/generate.ts`

**Intent**: Droga i pułapki jak w makiecie, z ograniczonym czasem.

**Contract**: `generateNumberMazeCard(rand, level)`: DFS drogi z przycinaniem z makiety (odległość i parzystość do mety, meta tylko jako ostatnia kratka, osiągalność mety i wystarczająca liczba wolnych kratek), limit węzłów na próbę i ponowienie; potem pułapki: pula liczb w kroku poziomu w odległości do `near` kroków od liczb sąsiednich kratek drogi, bez zakazanych (następna liczba każdej sąsiedniej kratki drogi, pierwsza i ostatnia liczba); kratka bez sąsiada na drodze bierze dowolną liczbę z zakresu poza zakazanymi. Zwraca `null` po wyczerpaniu prób (silnik zamienia to na `CardExhausted`).

#### 4. Silnik

**File**: `src/lib/number-maze/engine.ts`, `.dependency-cruiser.cjs`

**Intent**: Karta jako rodzaj karty: `numberMazeSpec` + `numberMazeEngine`.

**Contract**: `contentKey(settings)` = poziom; `keyOf(card)` z `values` (inne liczby = inna karta); `knownBad` ≥ 2 kody z `expectedCode` (np. pułapka z następną liczbą przy drodze → `ambiguous-next`, droga wracająca na kratkę → `path-revisits`). Do regexu `cards-only-through-engines` (:139) dopisać `number-maze`.

#### 5. Układ A4 i podgląd

**File**: `src/lib/number-maze/layout.ts`, `context/changes/number-maze-card/preview.mts`

**Intent**: Rozmieszczenie w mm wspólne dla strony, miniatury i testu.

**Contract**: `layoutNumberMazeSheet(card)` zwraca pas postaci, wielkość kratki (`min(maxCell, szerokość / cols, wysokość / rows)`), pozycję kratki wyśrodkowanej w poziomie, dla każdej kratki `x`, `y`, tekst i wysokość cyfry, ramki i napisy startu i mety; wszystko w marginesie 10 mm. `preview.mts` zapisuje SVG z układu dla sześciu poziomów do oceny przez użytkowniczkę.

#### 6. Testy

**File**: `src/lib/number-maze/{levels,card,generate,engine,layout,oracle}.test.ts`, `package.json` (skrypt `test`)

**Intent**: Pokryć reguły i czas.

**Contract**: wiele ziaren na każdy poziom: `numberMazeCardProblems` puste; `oracle.test.ts` z własnym, osobno napisanym przejściem od startu (bez importu `card.ts`) potwierdza jedną drogę; `knownBad` daje swoje kody; układ w marginesie 10 mm i kratka ≤ 30 mm; czas: najdłuższe generowanie na 200 ziarnach każdego poziomu poniżej 2 s (próg z zapasem do NFR 5 s; makieta 0,6 s). Nowe pliki dopisane do skryptu `test`.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint: `npm run lint`
- Zależności: `npm run depcruise`
- Typy: `npx astro check`
- Build: `npm run build`

#### Manual Verification:

- Użytkowniczka akceptuje podgląd karty z kodu (`preview.mts`, sześć poziomów)
- Przegląd diffu względem planu i makiety (`/10x-impl-review` przed PR fazy)

**Implementation Note**: po tej fazie zatrzymać się na potwierdzenie przed fazą 2.

---

## Phase 2: Strona, katalog i profil

### Overview

Rejestracja karty, strona `/number-maze`, arkusz SVG, miniatura, „Jak to działa”, testy jednostkowe rejestrów i e2e.

### Changes Required:

#### 1. Rejestry

**File**: `src/lib/cards.ts`, `src/lib/card-settings.ts`, `src/lib/card-engines.ts`, `src/lib/card-summary.ts` (i ich testy), `package.json`

**Intent**: Karta w katalogu, poziom w profilu i podsumowanie okna profilu.

**Contract**: wpis `CARD_KINDS` (`id: "liczby"`, `title: "Labirynt liczbowy"`, `href: "/number-maze"`, `thumbnail`, `description` 2–3 zdania: co dziecko robi i co jest na kartce, US-05); `CardSettingsMap.liczby?: NumberMazeSettings`, `CARD_SETTINGS_IDS`, `DEFAULTS` (Poziom 1), `levelIds()`; `CardTypeMap`, `CARD_ENGINES`, `INVENTORY`; `summaryParts` (poziom z `badgeOf(level)`).

#### 2. Strona i arkusz

**File**: `src/pages/number-maze.astro`, `src/components/NumberMazeGenerator.tsx`, `src/components/NumberMazeSheet.tsx`

**Intent**: Strona na `CardPage` i `useCardPage` z paskiem Postać · Poziom; arkusz SVG z `layoutNumberMazeSheet`.

**Contract**: wzór `MathCrosswordGenerator.tsx` bez „Pokaż rozwiązanie”; `handleLevelSelect` → `remember` + `applySettings` (nowa karta); błąd generowania jak w krzyżówce; SVG A4 z `print:h-[297mm] print:w-[210mm]`; liczby z jawnym przesunięciem linii bazowej; bez hexów i palet Tailwind.

#### 3. Miniatura i „Jak to działa”

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/liczby.svg`, `src/pages/how-it-works.astro`, `tests/e2e/how-it-works.spec.ts`

**Intent**: Miniatura z prawdziwego generatora na Poziomie 1 ze stałym ziarnem; opis karty z `CARD_KINDS`; zdanie „Poziomy” dostaje „Labirynt liczbowy (Poziom 1–6)” wśród kart z numerami.

**Contract**: komentarz nagłówkowy skryptu wymienia nową kartę.

#### 4. Testy

**File**: `src/lib/sheet/print-contract.test.ts`, `tests/e2e/number-maze.spec.ts`, `tests/e2e/number-maze-reprint.spec.ts`, `card-settings.spec.ts`, `character-speaks.spec.ts`, `phone-layout.spec.ts`, `phone-settings-rows.spec.ts`, `profile-summary.spec.ts`

**Intent**: Pokryć rejestry, kontrakt druku i przepływ użytkownika.

**Contract**: `print-contract` (SVG 210×297, brak `print:hidden` na arkuszu, brak własnego `@page`); e2e: generowanie (kratka ma `cols × rows` liczb, start i meta), zmiana poziomu układa nową kartę, zapamiętanie w profilu, plakietka, podsumowanie, „Brak”, ponowny druk, telefon (Generuj i Drukuj się nie zasłaniają).

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe: `npm test`
- Lint, zależności, typy, build: `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`
- E2E na czterech projektach Chromium z własnym portem: `E2E_PORT=4399 npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`
- Smoke na zbudowanym podglądzie: `BASE_URL=http://localhost:4399 npm run smoke`

#### Manual Verification:

- Użytkowniczka sprawdza każdy poziom i podgląd wydruku (jedna strona A4), z postacią i z „Brak”
- Miniatura w katalogu, plakietka poziomu przy profilu i podsumowanie w oknie profilu są poprawne
- Strona na telefonie: Generuj i Drukuj się nie zasłaniają, karta mieści się na A4
- Przegląd diffu względem planu (`/10x-impl-review` przed PR fazy)

---

## Phase 3: Wydruk próbny

### Overview

Po scaleniu, nie blokuje wydania: wydruk sześciu poziomów i próba z dzieckiem. Zamyka Open Questions 20.

### Changes Required:

#### 1. Poprawki stałych (tylko jeśli wydruk ich wymaga)

**File**: `src/lib/number-maze/levels.ts`, `src/lib/number-maze/sheet.ts`, `context/foundation/prd.md`, `context/foundation/roadmap.md`

**Intent**: Dopasować kratkę, zakresy albo bliskość pułapek do wydruku; commit mówi, co wymusiło zmianę.

**Contract**: wartości w tabeli poziomów i `NUMBER_MAZE_SHEET`; PRD Business Logic i Open Questions 20 oraz roadmapa S-49 zgodne z kodem.

### Success Criteria:

#### Automated Verification:

- Po ewentualnej poprawce: `npm test` i `npm run build`

#### Manual Verification:

- Wydruk na A4 jest jedną stroną w Safari, Chrome iOS i Brave iOS (lekcja: mierzyć każdą przeglądarkę osobno)
- Liczby trzycyfrowe Poziomu 6 są czytelne w kratce ok. 27 mm, a kratka 24 mm Poziomu 4 wystarcza na rysowanie drogi
- Dziecko przechodzi drogę na Poziomach 1–2, a pułapki kuszą, ale nie mylą drogi
- Open Questions 20 zamknięte w PRD, roadmapa S-49 zgodna

---

## Testing Strategy

### Unit Tests:

- Reguły karty dla każdego poziomu na wielu ziarnach; `knownBad` dla kodów problemów; niezależna wyrocznia jednej drogi; `contentKey` zmienia się z poziomem.
- Układ: margines 10 mm, kratka ≤ 30 mm, start i meta w rogach.
- Czas generowania: najdłużej poniżej 2 s na 200 ziarnach każdego poziomu.
- Rejestry: silnik, ustawienia (`parseStoredCards`), podsumowanie, kontrakt druku.

### Integration Tests:

- E2E jak w fazie 2 (punkt 4).

### Manual Testing Steps:

1. Wygenerować sześć poziomów; sprawdzić okiem drogę od startu do mety i to, że pułapki leżą blisko liczb drogi.
2. Zmienić poziom przy pokazanej karcie: nowa karta; odświeżyć stronę: poziom zostaje.
3. Wydrukować na A4 w trzech przeglądarkach iOS.

## Performance Considerations

Jedyne przeszukiwanie to DFS drogi; Poziom 4 (50 z 72 kratek) jest najwolniejszy (makieta: do ok. 0,6 s). Limit węzłów na próbę z ponowieniem ogranicza najgorszy przypadek, a test pilnuje progu 2 s.

## Migration Notes

Brak: pole `cards.liczby` w zapisanych profilach dostaje wartość domyślną przez ogólne `parseStoredCards`.

## References

- Makieta i decyzje: `context/changes/number-maze-card/change.md`, `mockup.mts`, `mockups.html`, `stats.md`
- PRD: US-39, US-40, FR-049, FR-050, Business Logic „Karta „Labirynt liczbowy””, Open Questions 20; roadmapa S-49; glosariusz
- Wzór planu i kodu: `context/archive/2026-11-18-size-order-card/plan.md`, `src/lib/math-crossword/`, `src/components/MathCrosswordGenerator.tsx`, `src/components/MathCrosswordSheet.tsx`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Logika karty

#### Automated

- [x] 1.1 Testy przechodzą: `npm test` — cb340991
- [x] 1.2 Lint: `npm run lint` — cb340991
- [x] 1.3 Zależności: `npm run depcruise` — cb340991
- [x] 1.4 Typy: `npx astro check` — cb340991
- [x] 1.5 Build: `npm run build` — cb340991

#### Manual

- [x] 1.6 Użytkowniczka akceptuje podgląd karty z kodu (`preview.mts`, sześć poziomów) — cb340991
- [x] 1.7 Przegląd diffu względem planu i makiety (`/10x-impl-review` przed PR fazy) — cb340991

### Phase 2: Strona, katalog i profil

#### Automated

- [x] 2.1 Testy jednostkowe: `npm test` — 913d83aa
- [x] 2.2 Lint, zależności, typy, build: `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build` — 913d83aa
- [x] 2.3 E2E na czterech projektach Chromium z własnym portem: `E2E_PORT=4399 npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768` — 913d83aa
- [x] 2.4 Smoke na zbudowanym podglądzie: `BASE_URL=http://localhost:4399 npm run smoke` — 913d83aa

#### Manual

- [x] 2.5 Użytkowniczka sprawdza każdy poziom i podgląd wydruku (jedna strona A4), z postacią i z „Brak” — 913d83aa
- [x] 2.6 Miniatura w katalogu, plakietka poziomu przy profilu i podsumowanie w oknie profilu są poprawne
- [x] 2.7 Strona na telefonie: Generuj i Drukuj się nie zasłaniają, karta mieści się na A4
- [x] 2.8 Przegląd diffu względem planu (`/10x-impl-review` przed PR fazy) — 913d83aa

### Phase 3: Wydruk próbny

#### Automated

- [x] 3.1 Po ewentualnej poprawce: `npm test` i `npm run build`

#### Manual

- [ ] 3.2 Wydruk na A4 jest jedną stroną w Safari, Chrome iOS i Brave iOS (lekcja: mierzyć każdą przeglądarkę osobno)
- [x] 3.3 Liczby trzycyfrowe Poziomu 6 są czytelne w kratce ok. 27 mm, a kratka 24 mm Poziomu 4 wystarcza na rysowanie drogi
- [ ] 3.4 Dziecko przechodzi drogę na Poziomach 1–2, a pułapki kuszą, ale nie mylą drogi
- [x] 3.5 Open Questions 20 zamknięte w PRD, roadmapa S-49 zgodna
