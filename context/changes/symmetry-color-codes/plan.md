# Kolory na karcie symetrii (S-15) Implementation Plan

## Overview

Rodzic włącza na pasku strony `/symetria` przełącznik „Kolory”. Wtedy lewa połowa karty drukuje się w prawdziwych kolorach (kredek), detale będące dziś pustymi kratkami (okno rakiety, oczy robota, pestki truskawki) też dostają kolor, a dziecko dorysowuje odbicie i koloruje je według wzoru. Przełącznik jest niezależny od poziomu, domyślnie wyłączony (czarna sylwetka jak dziś) i nie zmienia wylosowanej karty. PRD: US-09, FR-018. Id zmiany `symmetry-color-codes` zostaje z roadmapy, choć kodów (liter) już nie ma.

**To zmienia dawną decyzję PRD** („druk czarny, kolor literą w kratce, legenda pod kratką”): użytkownik po makiecie z 2026-10-23 wybrał prawdziwe kolory, bez liter i bez legendy. Faza 3 poprawia PRD i roadmapę.

## Current State Analysis

- Każda wypełniona kratka szablonu ma już kolor (`SymmetryCell.color`, `src/lib/symmetry/templates.ts:7-11`), `composeSymmetryCard` i `pickHints` go zachowują (`generate.ts:90,111`), `mirrorAnswer` go odbija (`generate.ts:186-188`), a walidator sprawdza paletę (`generate.ts:131`).
- Paleta ma 6 kolorów (`templates.ts:3`); niebieskiego nie używa żaden szablon. Robot i rakieta są dziś głównie szare/czarne.
- Dziury w sylwetce („.” wewnątrz obrysu) nie istnieją w danych (`templates.ts:60-61`), a wariant potrafi zamienić dziurę w kratkę (okno rakiety 4 lat, `templates.ts:202-205`).
- Strona rysuje wszystkie kratki wzoru i podpowiedzi jednym `fill="var(--foreground)"` (`SymmetryGenerator.tsx:205-216`); podpowiedź 4 lat jest dziś tak samo czarna jak wzór.
- `src/components/ui` nie ma Switch; pakiet `radix-ui` jest w zależnościach (`package.json:31`).
- Nowy kolor ekranu to nowy token w `src/styles/global.css` (AGENTS.md); żadnych hexów ani klas palety na stronach.
- `layout.ts` mieści wszystkie poziomy bez legendy (blok 7 lat 257 z 277 mm), więc układ strony zostaje.

## Desired End State

Na `/symetria` obok przycisku „Poziom” jest przełącznik „Kolory” (domyślnie wyłączony). Wyłączony: karta wygląda jak dziś, z jedną różnicą: kratki podpowiedzi 4 lat są blade (jasnoszare, ok. 35% czerni), nie czarne. Włączony: kratki wzoru mają kolory kredek (rakieta: czerwony nos i statecznik, szary korpus, niebieska szyba, płomień pomarańczowo-żółty; robot: niebieski, żółte oczy, szare ręce i szyja, czarne stopy; truskawka: czerwona z zielonymi liśćmi i żółtymi pestkami), a podpowiedzi 4 lat mają kolor kratki odbicia w ok. 35%. Przełączenie nie losuje nowej karty. Wszystkie cztery poziomy drukują się jedną stroną A4 z marginesem 10 mm, także na telefonie. Odpowiedź (`mirrorAnswer` z detalami) to odbicie wraz z kolorem każdej kratki. Weryfikują to `npm test`, e2e i ręczny przegląd wydruku (kolor i czarno-biały).

### Key Discoveries:

- Kolor kratek już jest w danych i w odpowiedzi; brakuje koloru detali, tokenów, rysowania i przełącznika (research.md, „Summary”).
- Wykrycie dziur na pełnej, odbitej sylwetce (zalanie od zewnątrz siatki) obejmuje okno, oczy, usta i pestki; wariant „okno zamalowane” nie daje dziury, więc nie psuje się przy zmianie wariantów.
- Przełączenie kolorów musi zostawić kartę bez zmian (inaczej niż zmiana poziomu, która generuje od razu, `SymmetryGenerator.tsx:63-68`).

## What We're NOT Doing

- Liter w kratkach i legendy (decyzja z makiety). Układ `layout.ts`, `sheet.ts` poza nową stałą bladości i miniatura katalogu zostają.
- Zapisu przełącznika w profilu i w ostatnich parametrach (S-14).
- Nowych obiektów, ornamentów i nowych kształtów; zmieniają się tylko kolory istniejących kratek (kształt sylwetki ma zostać identyczny).
- Trybu wydruku „odcienie szarości” ani wzorów zastępujących kolor na drukarce czarno-białej; kolor schodzi tam do szarości, co użytkownik zaakceptował.

## Implementation Approach

Reguły (które kratki mają kolor, co jest odpowiedzią) idą do `src/lib/symmetry` i są testowane na ręcznych oraklach; strona tylko rysuje. Karta dostaje osobne pole `details` (kratki-dziury z kolorem szablonu), tak jak S-13 dodało `hints`: `cells` i cała dotychczasowa walidacja sylwetki zostają bez zmian, a kolory są nadbudową. Czysta funkcja `symmetryDrawnCells(card, colors)` mówi komponentowi, co narysować i jakim kolorem/bladością, więc cała logika wyboru jest testowalna bez przeglądarki.

## Phase 1: Model — dziury, paleta i kolory obiektów

### Overview

Karta zna kolor detali, paleta ma pomarańczowy, a cztery katalogi (4, 5/6, 7 lat) mają kolory kredek przy niezmienionym kształcie.

### Changes Required:

#### 1. Paleta i szablon

**File**: `src/lib/symmetry/templates.ts`

**Intent**: Dodać kolor `orange` (litera rysunku `o`) do `SYMMETRY_COLORS` i `COLOR_LETTERS`, a szablonowi pole `holeColor` mówiące, jakim kolorem malować jego dziury.

**Contract**: `SymmetryColor` rozszerzone o `"orange"`; `SymmetryTemplate.holeColor: SymmetryColor` (wymagane, aby żaden szablon nie zostawił białej dziury). Rakieta `blue`, robot `yellow`, truskawka `yellow` we wszystkich czterech katalogach.

#### 2. Przemalowanie katalogów

**File**: `src/lib/symmetry/templates.ts`

**Intent**: Zmienić tylko litery kolorów w rysunkach (nie kształty), żeby obiekty wyglądały jak kolorowanka. Tabela ról:

| Obiekt    | Kolory (części)                                                                                                               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Rakieta   | nos czerwony, korpus szary, statecznik czerwony, szyba niebieska (dziura albo kratka), płomień pomarańczowy z żółtym środkiem |
| Robot     | głowa i korpus niebieskie, szyja/ręce/nogi szare, stopy czarne, czubek anteny czerwony, oczy/usta/panel żółte (dziury)        |
| Truskawka | miąższ czerwony, liście i czapka zielone, pestki żółte (dziury)                                                               |

**Contract**: Ten sam zbiór pozycji `(col,row)` w każdym wariancie każdej części przed i po zmianie; w 4 latach wariant „okno zamalowane” używa `b`, nie `s`. Czerń zostaje tylko na stopach robota.

#### 3. Dziury i odpowiedź z detalami

**File**: `src/lib/symmetry/generate.ts`

**Intent**: Policzyć dla karty kratki-dziury (puste kratki lewej połowy, do których nie dociera zalanie od zewnątrz siatki na odbitej pełnej sylwetce) i zapisać je z kolorem szablonu; odpowiedź z kolorami ma obejmować też odbicie detali.

**Contract**: `SymmetryCard.details: readonly SymmetryCell[]` (tylko lewa połowa, nie nakłada się na `cells`; podpowiedzi leżą po drugiej stronie osi, więc z detalami nie kolidują); `composeSymmetryCard` je wypełnia; `mirrorAnswer(card)` zostaje odbiciem `cells`; nowe `mirrorAnswerWithDetails(card)` to odbicie `cells` + `details`. `symmetryCardProblems` dostaje reguły dla `details`: kolor w palecie, w lewej połowie siatki, bez powtórzeń i bez nakładania na `cells` (nowy problem `detail-on-filled-cell`). Klucz karty bez zmian (kolor nie jest losowany).

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Dziury rakiety 5 lat (wariant 0 okna) to dokładnie 4 kratki `(4,4)(5,4)(4,5)(5,5)` przesunięte o offset karty, kolor niebieski (ręczny oracle)
- Każdy szablon, zestaw wariantów i offset daje poprawną kartę, a każda jej dziura ma kolor z palety i leży poza `cells` (test pętlowy jak dotychczasowy „every template…”)
- Pozycje kratek wszystkich szablonów i wariantów zgadzają się z `main` (skrypt porównujący `git show main:src/lib/symmetry/templates.ts` z nową wersją, tylko pozycje)
- `mirrorAnswerWithDetails` odbija kolor i wiersz detalu, a `mirrorAnswer` go pomija (ręczny oracle)
- Lint i typy: `npm run lint` i `npx astro check`

#### Manual Verification:

- Lista wykrytych dziur dla każdego szablonu i wariantu (wydruk z skryptu) zgadza się z zakresami powyżej i nie zawiera niechcianych kieszeni (np. szczelina między ręką a korpusem robota; zęby ust robota 7 lat dostają kolor ust, czyli żółty)

**Implementation Note**: Po fazie i testach zatrzymać się na potwierdzenie ręczne.

---

## Phase 2: Strona — tokeny, rysowanie, przełącznik, druk

### Overview

Przełącznik „Kolory” na pasku, rysowanie w kolorze z tokenów, blada podpowiedź w obu trybach i druk, który nie gubi kolorów.

### Changes Required:

#### 1. Tokeny kolorów

**File**: `src/styles/global.css`

**Intent**: Siedem tokenów kredek (czerwony, zielony, żółty, niebieski, pomarańczowy, szary, czarny) tylko w `:root` (klasa `.dark` nie jest nigdzie ustawiana, więc osobnych wartości ciemnych nie ma).

**Contract**: `--symmetry-red`, `-green`, `-yellow`, `-blue`, `-orange`, `-gray`, `-black` w `oklch`; żółty dobrany ciemniej niż „czysty”, żeby widać go na białym papierze. Strony i komponenty używają ich przez `var(--symmetry-…)`, bez hexów.

#### 2. Wybór wypełnienia

**File**: `src/lib/symmetry/colors.ts` (nowy), `src/lib/symmetry/sheet.ts`

**Intent**: Czysta funkcja zwracająca listę kratek do narysowania z wypełnieniem i krycia, oraz stała bladości podpowiedzi współdzielona ze skryptem miniatur.

**Contract**: `symmetryDrawnCells(card, colors): { cell, fill, opacity }[]`; `colors=false`: `cells` w `var(--foreground)` krycie 1, `hints` w `var(--foreground)` krycie `SYMMETRY_SHEET.hintOpacity` (0.35); `colors=true`: `cells` + `details` w `var(--symmetry-<kolor>)` krycie 1, `hints` w kolorze kratki krycie 0.35. `SYMMETRY_SHEET.hintOpacity = 0.35`. Import względny z `.ts` w `src/lib/symmetry`.

#### 3. Przełącznik i rysowanie

**File**: `src/components/ui/switch.tsx` (przez `npx shadcn@latest add switch`), `src/components/SymmetryGenerator.tsx`

**Intent**: Stan `colors` (domyślnie `false`) tylko na stronie; Switch „Kolory” stoi w tym samym wierszu co przycisk Poziom, w obu układach strony (przed i po wygenerowaniu karty). Zmiana nie wywołuje generowania. `SymmetrySheet` rysuje kratki z `symmetryDrawnCells`, a SVG dostaje `print-color-adjust: exact`, żeby kolory nie znikały z wydruku.

**Contract**: `<SymmetrySheet card colors />`; komentarz „Colors arrive in S-15” znika; `style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}` na `<svg>`; Switch podpisany widocznym „Kolory”, dostępny z klawiatury (`role="switch"`), wiersz paska zawija się na telefonie bez nachodzenia na Generuj/Drukuj.

#### 4. Testy

**File**: `src/lib/symmetry/colors.test.ts` (nowy, dopisany do skryptu `test` w `package.json`), `src/lib/sheet/print-contract.test.ts`, `tests/e2e/phone-layout.spec.ts`, `tests/e2e/` (nowy plik dla kolorów)

**Intent**: Pokryć wybór wypełnienia, kontrakt druku i zachowanie przełącznika.

**Contract**: `colors.test.ts`: bez kolorów same wypełnienia `--foreground`, podpowiedź blada; z kolorami szyba rakiety niebieska, podpowiedź w kolorze kratki z kryciem 0.35, liczba narysowanych kratek = `cells + details (+ hints)`. `print-contract.test.ts`: SVG karty ma `print-color-adjust: exact`. e2e: na `/symetria` przełącznik jest domyślnie wyłączony; po włączeniu pozycje i liczba kratek karty ta sama, a wypełnienia odwołują się do `--symmetry-`; na telefonie 375 px Poziom, Kolory, Generuj, Drukuj i Profil się nie nakładają, a karta mieści się na A4.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint, typy i build: `npm run lint`, `npx astro check`, `npm run build`
- E2E przechodzi: `npx playwright test tests/e2e/phone-layout.spec.ts tests/e2e/symmetry-colors.spec.ts`

#### Manual Verification:

- Przełącznik „Kolory” włącza i wyłącza kolory na tej samej karcie na komputerze i na telefonie
- Blada podpowiedź 4 lat jest czytelna i odróżnia się od wzoru w obu trybach

**Implementation Note**: Po fazie zatrzymać się na potwierdzenie ręczne.

---

## Phase 3: Dokumenty i przegląd wydruku

### Overview

PRD i roadmapa zgodne z decyzją o prawdziwych kolorach, a wydruk obu trybów obejrzany na papierze.

### Changes Required:

#### 1. PRD i roadmapa

**File**: `context/foundation/prd.md`, `context/foundation/roadmap.md`

**Intent**: Zastąpić zapis „druk czarny, litery, legenda” zapisem „prawdziwe kolory kratek, bez liter i bez legendy, domyślnie czarna sylwetka”, dopisać bladą podpowiedź w obu trybach.

**Contract**: Poprawić: Success Criteria (secondary), US-06 (ostatni punkt „Druk jest czarny…”), US-07 (podpowiedź: kratki odbicia bledsze niż wzór także bez kolorów), US-09 i jego kryteria, FR-018, NFR karty symetrii („czarny druk także przy włączonych kolorach”), Business Logic („Karta symetrii” — Kolory oraz wiersz podpowiedzi w tabeli poziomów: „3 kratki odbicia przy osi, blade”), Po MVP/Non-Goals bez zmian; roadmapa: wynik, Unknowns (litery, legenda, 10 mm) jako rozstrzygnięte z datą 2026-10-23, Risk bez legendy.

#### 2. Przegląd wydruku

**File**: —

**Intent**: Obejrzeć wydruk czterech poziomów w kolorze i w czerni, w tym żółty, pomarańczowy, bladość podpowiedzi i kratkę 10 mm.

### Success Criteria:

#### Automated Verification:

- Testy i lint przechodzą: `npm test`, `npm run lint`
- Format dokumentów: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md`

#### Manual Verification:

- Wydruk 4, 5, 6 i 7 lat z kolorami: kolory rozróżnialne, żółty widoczny na papierze, jedna strona A4 z marginesem 10 mm
- Wydruk w czerni (drukarka czarno-biała lub tryb szarości): sylwetka i bladą podpowiedź da się odróżnić od wzoru
- Wydruk z telefonu (iOS Safari i Chrome) zachowuje kolory

---

## Testing Strategy

### Unit Tests:

- Wykrywanie dziur: oracle ręczny dla rakiety 5 lat i 4 lat (wariant z oknem pustym i zamalowanym), niezmienność `cells`, kolor z `holeColor`
- `mirrorAnswerWithDetails` i `symmetryDrawnCells` w obu trybach, w tym podpowiedzi 4 lat

### Integration Tests:

- Przełącznik na `/symetria`, ta sama karta po przełączeniu, układ paska na telefonie, kontrakt druku

### Manual Testing Steps:

1. Wygenerować kartę na każdym poziomie, włączyć i wyłączyć kolory, porównać pozycje kratek
2. Wydrukować każdy poziom w kolorze i w czerni
3. Sprawdzić żółty i pomarańczowy na papierze oraz bladość podpowiedzi

## Performance Considerations

Wykrywanie dziur to jedno zalanie siatki do 18×24 na kartę, bez wpływu na limit 5 s generowania.

## Migration Notes

Brak zmian zapisanych danych. Stan przełącznika nie jest zapisywany (S-14).

## References

- Related research: `context/changes/symmetry-color-codes/research.md`
- Wzór planu: `context/archive/2026-10-23-symmetry-difficulty-levels/plan.md`
- Pole kart i podpowiedzi: `src/lib/symmetry/generate.ts:6-19,104-112`
- Rysowanie do podmiany: `src/components/SymmetryGenerator.tsx:205-216`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Model — dziury, paleta i kolory obiektów

#### Automated

- [x] 1.1 Testy przechodzą: `npm test` — 1fa187e
- [x] 1.2 Dziury rakiety 5 lat (wariant 0 okna) to dokładnie 4 kratki, kolor niebieski (ręczny oracle) — 1fa187e
- [x] 1.3 Każdy szablon, zestaw wariantów i offset daje poprawną kartę, a każda dziura ma kolor z palety i leży poza `cells`; liczba dziur mieści się w zakresie zmierzonym na `main` (po wszystkich wariantach części, 5 i 6 lat dzielą katalog): 4 lata rakieta 0–1, robot 1, truskawka 3–4; 5/6 lat rakieta 2–4, robot 3–4, truskawka 6–8; 7 lat rakieta 4–6, robot 6–9, truskawka 13 — 1fa187e
- [x] 1.4 Pozycje kratek wszystkich szablonów i wariantów zgadzają się z `main` — 1fa187e
- [x] 1.5 `mirrorAnswerWithDetails` odbija kolor i wiersz detalu, `mirrorAnswer` go pomija — 1fa187e
- [x] 1.6 Lint i typy: `npm run lint` i `npx astro check` — 1fa187e

#### Manual

- [ ] 1.7 Lista wykrytych dziur zgadza się z zakresami i nie zawiera niechcianych kieszeni

### Phase 2: Strona — tokeny, rysowanie, przełącznik, druk

#### Automated

- [ ] 2.1 Testy przechodzą: `npm test`
- [ ] 2.2 Lint, typy i build: `npm run lint`, `npx astro check`, `npm run build`
- [ ] 2.3 E2E przechodzi: `npx playwright test tests/e2e/phone-layout.spec.ts tests/e2e/symmetry-colors.spec.ts`

#### Manual

- [ ] 2.4 Przełącznik „Kolory” włącza i wyłącza kolory na tej samej karcie na komputerze i na telefonie
- [ ] 2.5 Blada podpowiedź 4 lat jest czytelna i odróżnia się od wzoru w obu trybach

### Phase 3: Dokumenty i przegląd wydruku

#### Automated

- [ ] 3.1 Testy i lint przechodzą: `npm test`, `npm run lint`
- [ ] 3.2 Format dokumentów: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md`

#### Manual

- [ ] 3.3 Wydruk 4, 5, 6 i 7 lat z kolorami: kolory rozróżnialne, żółty widoczny, jedna strona A4 z marginesem 10 mm
- [ ] 3.4 Wydruk w czerni: sylwetka i blada podpowiedź odróżnialne od wzoru
- [ ] 3.5 Wydruk z telefonu (iOS Safari i Chrome) zachowuje kolory
