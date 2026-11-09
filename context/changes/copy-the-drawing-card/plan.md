# S-35 Karta „Skopiuj rysunek na kratce” Implementation Plan

## Overview

Dokładamy dziewiąty rodzaj karty „Skopiuj rysunek na kratce” (roadmap S-35, PRD US-27, US-28, FR-037, FR-038). Karta ma dwie kratki tej samej siatki obok siebie: w lewej czarna sylwetka obiektu z katalogu szablonów, prawa jest pusta, a dziecko przerysowuje sylwetkę. Są trzy poziomy (łatwy 8×12, średni 12×15, trudny 18×24) i wybór kategorii obiektów. Profil pamięta poziom i kategorię, karta ma miniaturę w katalogu i opis w „Jak to działa”, a postać stoi przy poleceniu.

Plan wynika z makiety zatwierdzonej przez użytkowniczkę 2026-11-09 (`mockup.mts`, `mockup-*.svg`, `mockups.html` w tym folderze). Makieta rozstrzyga PRD Open Questions 13: kratki stoją obok siebie, nie mają numerów wierszy i kolumn, a trudny zostaje przy kratce 5 mm.

## Current State Analysis

Wzorcem karty jest „Który nie pasuje” (S-34, `context/archive/2026-11-08-odd-one-out-card/`), a wzorcem sylwetki nonogram (`research.md`).

- Sylwetka: `nonogramImage(template, variants, size)` (`src/lib/nonogram/clues.ts:16-44`) zwraca `boolean[][]` całej sylwetki, a obiekty daje `symmetryTemplatesFor(templateLevel, category)` (`src/lib/symmetry/templates.ts:53`). Rozmiary i `templateLevel` są w `NONOGRAM_SIZES` (`src/lib/nonogram/sizes.ts:32-68`).
- Losowanie z kluczem karty: `generateNonogramCard` (`src/lib/nonogram/generate.ts:38-64`), z `MAX_ATTEMPTS = 20`, `previousKey` i `nonogramVariants` (`:108`).
- Kontrakt i silnik: `src/lib/card-contract.ts`, `src/lib/card-engines.ts:34-46`, wzorzec `src/lib/nonogram/engine.ts:85-115`.
- Strona: `NonogramGenerator.tsx` na `CardPage` / `useCardPage` / `useCardSettings` / `sheet-state` (`src/lib/sheet-state.ts:61-74`), polecenie z postacią `instructionBoxHeight` (`src/lib/sheet/speech.ts:62`, pas 26 mm).
- Nie ma układu dwóch siatek. Trzeba dopisać własny `layout.ts` i `sheet.ts`.
- Po S-33 liczby i adresy kart w testach (`catalog.spec.ts`, `how-it-works.spec.ts`, `smoke.mjs`, `cards.test.ts`) biorą się z katalogu, a `last-used.ts`, `child-profiles.ts`, `catalog-badges.ts` są sterowane danymi. Lista miejsc do wpisania nowej karty jest w `research.md`, „Lista wpisów dla nowej karty”.

## Desired End State

Na `/copy-drawing` rodzic wybiera poziom i kategorię, klika Generuj i dostaje kartę A4: polecenie „Przerysuj obrazek na pustą kratkę.” z postacią w dymku, a pod nim dwie kratki tej samej siatki obok siebie, lewa z czarną sylwetką, prawa pusta. Karta jest jedną stroną A4 z marginesem 10 mm i nie zdradza nazwy obiektu. Zmiana poziomu albo kategorii przy pokazanej karcie układa nową kartę. Profil pamięta poziom i kategorię, katalog pokazuje miniaturę i plakietkę poziomu, a „Jak to działa” opisuje kartę. `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`, smoke i e2e są zielone.

### Key Discoveries:

- Układ jest ciasny tylko na trudnym: 2 × 18 kratek × 5 mm + odstęp 10 mm = 190 mm, czyli dokładnie szerokość między marginesami (`mockup.mts`, wynik: kratka 5,0 mm). Układ musi tolerować błąd zmiennoprzecinkowy przy tej granicy.
- `nonogramImage` zaczyna sylwetkę od górnego wiersza, dolne wiersze siatki zostają puste (`clues.ts:37`). Szerokie obiekty (autobus, auto, chmurka) zajmują wtedy na trudnym czasem tylko górne 9 z 24 wierszy (38%, pomiar po wszystkich wariantach), więc karta wyśrodkowuje sylwetkę w pionie sama (decyzja z przeglądu planu 2026-11-09), bez zmiany `nonogramImage`.
- Karta nie ma „Pokaż rozwiązanie”, więc nie ma stanu `solutionFor`.
- Reguła depcruise `cards-only-through-engines` (`.dependency-cruiser.cjs:139`) wymaga wpisania nowego `generate.ts` na listę modułów.
- Wysokość druku mierzy się osobno w Safari, Chrome iOS i Brave iOS (`context/foundation/lessons.md`).

## What We're NOT Doing

- Numery wierszy i kolumn na kratkach (decyzja 2026-11-09).
- Układ jedna kratka nad drugą oraz układ zależny od poziomu.
- Ocena rysunku dziecka (US-27: aplikacja zna odpowiedź, ale jej nie sprawdza), przełącznik „Pokaż rozwiązanie” i przełącznik kolorów.
- Zmiany w katalogu szablonów, w `nonogramImage` i w kartach symetrii, nonogramu i dyktanda (roadmap: nie wolno przestawić ich obiektów).- Opis poziomów w akapicie „Poziomy” strony „Jak to działa” i jego test zgodności (S-37); ta zmiana dokłada tylko `description` karty w `CARD_KINDS`.
- Testy mutacyjne Stryker dla tej karty.

## Implementation Approach

Trzy fazy, każda w osobnej gałęzi i osobnym PR-ze do `main`. Przed każdym PR-em uruchamiamy `/10x-impl-review`, a niczego nie scalamy samodzielnie. Faza 1 aktualizuje PRD, żeby kod nie wyprzedzał zapisanych decyzji. Faza 2 to czysta logika z testami. Faza 3 podpina kartę do produktu.

Decyzje z PRD, makiety i planowania (2026-11-09):

- Id `kopiuj`, strona `/copy-drawing`, tytuł „Skopiuj rysunek na kratce”, polecenie „Przerysuj obrazek na pustą kratkę.”. Poziomy `latwy` / `sredni` / `trudny` (te same id co `NonogramSizeId`), domyślnie `sredni`. Ustawienia: `level`, `category` (`ObjectCategoryChoiceId`, domyślnie `wszystkie`).
- Poziomy własne (`levels.ts`), bo opisy i kratki różnią się od nonogramu:

| Poziom | Siatka (cała) | Obiekty                       | Kratka (mm) |
| ------ | ------------- | ----------------------------- | ----------- |
| łatwy  | 8×12          | proste warianty z połowy 4×12 | 10          |
| średni | 12×15         | warianty z połowy 6×15        | 7           |
| trudny | 18×24         | bogate warianty z połowy 9×24 | 5           |

- Układ: dwie siatki obok siebie z odstępem 10 mm, blok wyśrodkowany w poziomie i w pionie w obszarze pod pasem polecenia (pas 26 mm z postacią albo 7 mm bez, odstęp 6 mm, margines 10 mm). Kratka to wartość nominalna, zmniejszana, gdyby blok się nie mieścił (w praktyce nominały mieszczą się na każdym poziomie).
- Sylwetka jest wyśrodkowana w pionie w siatce: karta przesuwa wiersze wzoru o `floor((rows − wysokość sylwetki) / 2)`, gdzie wysokość liczy się od pierwszego do ostatniego zamalowanego wiersza (puste wiersze w środku sylwetki wchodzą do wysokości) (funkcja `centerSilhouette` w `card.ts`, używana przez generator i przez `problems`, żeby oba liczyły to samo); `nonogramImage` zostaje bez zmian.
- Lewa siatka ma czarne kratki sylwetki i drukuje się zawsze; prawa jest pusta. Obie mają cienką linię kratki i grubszą co 5 kratek (jak nonogram) oraz ramkę. Bez numerów.
- Karta niesie `levelId`, `templateId`, `variants`, `pattern` (to samo `boolean[][]` dla obu siatek) i `key` (`${level}:${template}:${variants}`). Kategoria jest tylko w `contentKey` (`${level}|${category}`), jak w nonogramie.
- Reguły sprawdzane przez `problems`: obie siatki mają rozmiar poziomu, wzór ma co najmniej jedną zamalowaną i jedną pustą kratkę, wzór jest dokładnie wyśrodkowaną sylwetką `nonogramImage` dla zapisanych szablonu i wariantów, `levelId` zgadza się z ustawieniem poziomu, a układ mieści się w marginesie 10 mm.
- Wyczerpanie: generator zwraca `null` po `MAX_ATTEMPTS` (poddaje się szybko, daleko poniżej 5 s), a silnik zamienia to na `CardExhausted`. Klucz powtórzenia liczy ten sam kod w generatorze i w `problems` (lekcja z S-34: generator i sprawdzenie liczą powtórzenie tak samo).
- Test pilnuje co najmniej dwóch kart w każdej kombinacji poziom × kategoria, tak jak dla nonogramu.

## Faza 1: PRD zgodne z makietą

### Overview

Zapisujemy w PRD decyzje z makiety. Zmiana dotyczy tylko `context/`, więc CI pomija joby `ci`, `smoke` i `e2e`.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: US-27 mówi dziś „układ (obok siebie albo jedna nad drugą)”, a Business Logic „Karta „Skopiuj rysunek na kratce”” zostawia otwarte, czy trudny zmieści 5 mm. Po makiecie układ to dwie kratki obok siebie, trudny ma kratkę 5 mm, a kratki nie mają numerów. Open Questions 13 jest zamknięte (przekreślone z datą i decyzją, jak pytania 2, 4, 8, 10, 12), a wartości nadal potwierdza wydruk.

**Contract**: Sekcje US-27 (drugi punkt kryteriów), FR-037 (Socrates: rozstrzygnięcie), Business Logic „Karta „Skopiuj rysunek na kratce”” (tabela, zdanie o układzie, zdanie o 5 mm), Open Questions 13. Każda zmiana z datą 2026-11-09 i odnośnikiem „S-35”, jak przy innych decyzjach. Opis karty „Jak to działa” żyje w kodzie, nie w PRD.

#### 2. Roadmapa

**File**: `context/foundation/roadmap.md`

**Intent**: S-35 ma status `planning` (ustawiony przy planowaniu); faza 1 commituje go razem z PRD, a `/10x-implement` przestawi go na `in-progress`. W bloku S-35 niewiadome o układzie i numerach dostają odpowiedź.

**Contract**: Wiersz S-35 w „At a glance”, linia `- **Status:**` i dwie pozycje „Unknowns” w bloku S-35. Prettier może przeformatować tabelę przy zmianie statusu; zmieniamy tylko komórkę statusu.

### Success Criteria:

#### Automated Verification:

- Prettier akceptuje pliki: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md`
- PRD nie zostawia otwartego układu: `rg -n "obok siebie albo jedna nad drugą" context/foundation/prd.md` nie zwraca nic w US-27 ani w Business Logic

#### Manual Verification:

- Użytkowniczka czyta zmienione zdania PRD i potwierdza, że oddają makietę (obok siebie, bez numerów, 5 mm na trudnym)

**Implementation Note**: Po fazie 1 zatrzymaj się na potwierdzenie przed fazą 2.

---

## Faza 2: Logika karty

### Overview

Moduł `src/lib/copy-drawing/` bez UI i bez rejestracji w katalogu: poziomy, generator, silnik, układ A4. Wszystko pokryte testami.

### Changes Required:

#### 1. Poziomy

**File**: `src/lib/copy-drawing/levels.ts`, `levels.test.ts`

**Intent**: `COPY_DRAWING_LEVELS` z `id`, `label`, `barLabel`, `description` (pół zdania o tym, co zmienia poziom, bez wieku), `size` (wskazanie na `NonogramSize` o tym samym id, skąd biorą się siatka i `templateLevel`) i `cellSize` (10 / 7 / 5 mm). Do tego `DEFAULT_COPY_DRAWING_LEVEL_ID = "sredni"` i `copyDrawingLevelById`.

**Contract**: Kształt jak `ODD_ONE_OUT_LEVELS` (`src/lib/odd-one-out/levels.ts`); `CopyDrawingLevelId = NonogramSizeId`. Test: siatki 8×12, 12×15, 18×24 i kratki 10 / 7 / 5 mm.

#### 2. Karta i sprawdzenie

**File**: `src/lib/copy-drawing/card.ts`, `card.test.ts`

**Intent**: Typ `CopyDrawingCard` i `copyDrawingProblems(card, level)` ze stabilnymi kodami: `grid-size`, `no-filled-cell`, `no-empty-cell`, `not-silhouette`, `level-mismatch`. Klucz karty liczy jedna funkcja `copyDrawingKey`, a wyśrodkowanie jedna funkcja `centerSilhouette`; obie używają generator i sprawdzenie. Test: sylwetka niższa niż siatka ma tyle samo pustych wierszy nad i pod nią (z dokładnością do jednego wiersza), a sylwetka na całą wysokość się nie przesuwa. Testy mają ręcznie wpisane karty dobre i złe (kratka obrócona, pusty wzór, pełny wzór, zły rozmiar).

**Contract**:

```ts
interface CopyDrawingCard {
  levelId: CopyDrawingLevelId;
  templateId: string;
  variants: readonly number[];
  pattern: readonly (readonly boolean[])[]; // wiersze × kolumny, ta sama siatka w obu kratkach
  key: string; // `${level}:${template}:${variants}`
}
```

#### 3. Generator i silnik

**File**: `src/lib/copy-drawing/generate.ts`, `generate.test.ts`, `engine.ts`, `engine.test.ts`

**Intent**: `generateCopyDrawingCard(random, previousKey, level, category)` bierze `symmetryTemplatesFor(level.size.templateLevel, category)`, losuje szablon i warianty części, składa `pattern` przez `nonogramImage` i `centerSilhouette`, odrzuca kartę z kluczem `previousKey` lub z problemami; po `MAX_ATTEMPTS` zwraca `null` (pusta kategoria też). Silnik ma kształt `nonogramEngine`: `null` → `CardExhausted`, wynik przez `VerifiedCard.require`. `contentKey` = `${level}|${category}`. `knownBad`: wzór z obróconą kratką (`not-silhouette`), pusty wzór (`no-filled-cell`), zła siatka (`grid-size`) i poziom niezgodny z ustawieniem (`level-mismatch`).

**Contract**: `copyDrawingEngine: CardEngine<CopyDrawingSettings, CopyDrawingCard>`. `CopyDrawingSettings { level; category }` żyje w `card-settings.ts` (bez wpisu w `CardSettingsMap` do fazy 3), a `kind` w fazie 2 rzutujemy jak `TOY` w `card-contract.test.ts`; faza 3 usuwa rzutowanie. Test generatora: dla każdego poziomu i każdej kategorii (włącznie z „wszystkie”) co najmniej dwie różne karty, kolejna karta ma inny `key`, a 200 kart powstaje poniżej 2 s.

#### 4. Układ A4

**File**: `src/lib/copy-drawing/sheet.ts`, `layout.ts`, `layout.test.ts`

**Intent**: Stałe rysunku w mm (strona, margines 10 mm, odstęp między siatkami 10 mm, odstęp pasa 6 mm, grubości linii, grubsza linia co 5 kratek) wspólne dla strony, testu druku i skryptu miniatur. `layoutCopyDrawingSheet(level, instructionBoxHeight)` zwraca pozycje pasa polecenia, lewej i prawej siatki i kratkę. Rzuca błąd, gdy blok wychodzi poza margines 10 mm (z tolerancją 1e-6 mm na granicy trudnego).

**Contract**: Test: każdy poziom mieści się w marginesie 10 mm i z postacią (pas 26 mm), i bez; kratka równa nominałowi (10 / 7 / 5 mm); trudny zajmuje dokładnie 190 mm szerokości; blok jest wyśrodkowany w pionie pod pasem; błąd przy sztucznie za dużej kratce.

#### 5. Testy i granice

**File**: `package.json` (lista `test`), `.dependency-cruiser.cjs:139`

**Intent**: Nowe pliki testów w skrypcie `test` (pilnuje tego `src/lib/test-script.test.ts`); `copy-drawing` w regule `cards-only-through-engines`.

**Contract**: `npm test` uruchamia wszystkie nowe testy; `npm run depcruise` zielone.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Zależności przechodzą: `npm run depcruise`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`

#### Manual Verification:

- Przegląd diffu: reguły sprawdzenia i układ odpowiadają opisowi w „Implementation Approach” i makiecie

**Implementation Note**: Po fazie 2 zatrzymaj się na potwierdzenie przed fazą 3.

---

## Faza 3: Strona, katalog i profil

### Overview

Karta wchodzi do produktu: rejestracja, strona, island, miniatura, podsumowanie w profilu, testy druku i e2e. Ręczna część obejmuje sprawdzenie strony i wydruk na papierze, także na iOS.

### Changes Required:

#### 1. Rejestracja i ustawienia

**File**: `src/lib/cards.ts`, `src/lib/card-settings.ts`, `src/lib/card-engines.ts`, `src/lib/card-summary.ts`, `src/lib/copy-drawing/engine.ts`

**Intent**: Wpis `kopiuj` w `CARD_KINDS` (tytuł „Skopiuj rysunek na kratce”, `/copy-drawing`, miniatura, `description` w 2–3 zdaniach: co dziecko robi i co jest na kartce, bez zdradzania obiektu). `kopiuj` w `CardSettingsMap`, `CARD_SETTINGS_IDS`, `DEFAULTS` (`{ level: "sredni", category: "wszystkie" }`) i `levelIds`, silnik w `CardTypeMap` i `CARD_ENGINES`, case w `summaryParts` (poziom, kategoria w extras, jak nonogram), usunięcie rzutowania `kind` z fazy 2.

**Contract**: Kształt jak `nonogram` w każdym z tych plików, w tym tolerancyjne parsowanie kategorii i poziomu z magazynu. Katalog i „Jak to działa” czytają `CARD_KINDS`, więc karta trafia tam sama.

#### 2. Strona i island

**File**: `src/pages/copy-drawing.astro`, `src/components/CopyDrawingGenerator.tsx`, `src/components/CopyDrawingSheet.tsx`

**Intent**: Strona jak `nonogram.astro`. Island jak `NonogramGenerator.tsx` bez „Pokaż rozwiązanie”: postać, poziom (ten sam wybór poziomu co nonogram) i kategoria na pasku, `CardPage`, `sheet-state`; zmiana poziomu i kategorii wołają `applySettings`. Arkusz SVG w osobnym pliku: pas z postacią i dymkiem albo samym poleceniem, lewa siatka z czarnymi kratkami, prawa pusta, linie siatki z `blockLines`.

**Contract**: SVG ma `viewBox="0 0 210 297"`, `print:h-[297mm] print:w-[210mm] print:overflow-hidden` jak nonogram, klasy przez `cn()`, bez hexów i palet Tailwind (kolory `var(--foreground)` i `var(--card)`), `aria-label="Skopiuj rysunek na kratce"`, `data-card-key`. Czarne kratki lewej siatki nie mają `print:hidden`.

#### 3. Miniatura

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/kopiuj.svg`

**Intent**: Miniatura z prawdziwego generatora (stałe ziarno, średni poziom, kategoria „wszystkie”, samo polecenie bez postaci) i stałych `sheet.ts`, jak blok nonogramu. Do commitu idzie tylko nowa miniatura; zmienione bajty innych miniatur przywracamy.

**Contract**: `node --experimental-strip-types scripts/build-thumbnails.mjs` tworzy `public/thumbnails/kopiuj.svg`; komentarz nagłówkowy skryptu wymienia nową kartę.

#### 4. Testy

**File**: `src/lib/sheet/print-contract.test.ts`, `src/lib/card-engines.test.ts`, `src/lib/card-settings.test.ts`, `src/lib/card-summary.test.ts`, `tests/e2e/copy-drawing.spec.ts`, `tests/e2e/copy-drawing-reprint.spec.ts`, tabele kart w `tests/e2e/card-settings.spec.ts`, `profile-summary.spec.ts`, `phone-layout.spec.ts` (osobny test rozmieszczenia przycisków; `SEEDED_CARDS` w nim to profil najszerszych plakietek, nie lista kart), `phone-settings-rows.spec.ts`, `phone-toggle-align.spec.ts`, `character-speaks.spec.ts`

**Intent**:

- Test druku: SVG 210×297 mm z `overflow-hidden`, ukryte kontrolki w druku, strona na wspólnym shellu, nowy generator na trzech listach generatorów.
- Inwentarz silników: wszystkie poziomy × kategorie, `mayExhaust` zgodnie z generatorem, `content` = poziom i kategoria, `decoration` puste.
- Ustawienia i podsumowanie: odczyt zapisanych ustawień, odrzucenie nieznanego poziomu i kategorii, kategoria w podsumowaniu.
- E2E strony i test arkusza: Generuj daje dwie siatki tego samego rozmiaru, lewa z czarnymi kratkami, prawa bez żadnej zamalowanej kratki; zmiana poziomu i kategorii układają nową kartę; siatki trzymają margines 10 mm; plakietka w katalogu pokazuje poziom profilu; Generuj, Drukuj i Profil nie nachodzą na siebie na telefonie.
- Reprint: ostrzeżenie przed ponownym drukiem, wzorowane na reprint nonogramu i dyktanda (zmiana postaci zostawia tę samą kartę, zmiana poziomu i kategorii układa nową).
- Tabele kart: wpis `kopiuj` tam, gdzie jest wpis `niepasuje`.

**Contract**: Plik e2e zaczyna się linią `// Provenance: copy-the-drawing-card (S-35, US-27, US-28, FR-037, FR-038)`. E2E uruchamiane z `E2E_PORT`, żeby nie trafić w serwer innego checkoutu.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Zależności przechodzą: `npm run depcruise`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- E2E nowej karty i tabel kart przechodzą na wolnym porcie: `E2E_PORT=4399 npx playwright test tests/e2e/copy-drawing.spec.ts tests/e2e/copy-drawing-reprint.spec.ts tests/e2e/card-settings.spec.ts tests/e2e/profile-summary.spec.ts tests/e2e/phone-layout.spec.ts tests/e2e/phone-settings-rows.spec.ts tests/e2e/phone-toggle-align.spec.ts tests/e2e/character-speaks.spec.ts tests/e2e/catalog.spec.ts tests/e2e/how-it-works.spec.ts --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`
- Sprawdzian HTTP przechodzi na zbudowanej stronie, jak w CI: po `npm run build` uruchom w tle `npm run preview -- --port 4399`, poczekaj, aż `curl -sf http://localhost:4399/` odpowie, potem `BASE_URL=http://localhost:4399 npm run smoke`

#### Manual Verification:

- Użytkowniczka otwiera `/copy-drawing`, generuje karty na każdym poziomie i w kilku kategoriach i potwierdza, że obie kratki mają tę samą siatkę, a sylwetka jest czytelna
- Użytkowniczka drukuje kartę łatwą, średnią i trudną na A4 i potwierdza, że kratka 5 mm na trudnym jest dość duża, a dwie kratki mieszczą się na jednej stronie
- Druk jest jedną stroną w Safari, Chrome iOS i Brave iOS (pomiar w każdej osobno, `lessons.md`; na stagingu po scaleniu)
- Katalog pokazuje miniaturę i plakietkę poziomu przy profilu, a okno profilu pokazuje podsumowanie

**Implementation Note**: Po fazie 3 i potwierdzeniu wydruku plan jest zakończony; poprawki wartości po wydruku (kratka trudnego, układ) wchodzą w tę fazę. Jeśli 5 mm okaże się za małe, trudny wraca do planu jako siatka 12×15 (PRD Open Questions 13, wariant zapasowy).

---

## Testing Strategy

### Unit Tests:

- Sprawdzenie karty na ręcznie wpisanych kartach dobrych i złych (obrócona kratka, pusty wzór, pełny wzór, zły rozmiar siatki, zły poziom).
- Generator: każda kombinacja poziom × kategoria daje co najmniej dwie różne karty, kolejna karta ma inny `key`, wzór to dokładnie wyśrodkowana sylwetka z `nonogramImage`, 200 kart poniżej 2 s.
- Silnik: `knownBad` odrzucony z oczekiwanym kodem (test żywotności w `card-engines.test.ts`).
- Układ: margines 10 mm na każdym poziomie, z postacią i bez, dokładna szerokość trudnego.

### Integration Tests:

- E2E strony, reprintu i tabel kart (faza 3).

### Manual Testing Steps:

1. `/copy-drawing`: Generuj na każdym poziomie i w kilku kategoriach; porównać obie kratki.
2. Zmienić poziom i kategorię przy pokazanej karcie: pojawia się nowa karta.
3. Wydruk A4 trzech kart (łatwa, średnia, trudna); iOS: Safari, Chrome, Brave.

## Performance Considerations

Generator losuje do 20 razy i składa bitmapę z gotowych komórek, więc jest tani; test pilnuje 200 kart poniżej 2 s, daleko pod limitem 5 s z PRD. Przy kategorii bez obiektów generator poddaje się od razu.

## Migration Notes

Nowe pole `kopiuj` w `cards` profilu i ostatnich parametrów. Starsze zapisy go nie mają, więc karta startuje z ustawieniami domyślnymi (odczyt jest tolerancyjny).

## References

- Badanie: `context/changes/copy-the-drawing-card/research.md`
- Makieta: `context/changes/copy-the-drawing-card/mockup.mts`, `mockup-*.svg`, `mockups.html`
- Wzorce: `src/lib/nonogram/engine.ts`, `src/lib/nonogram/generate.ts`, `src/components/NonogramGenerator.tsx`, `context/archive/2026-11-08-odd-one-out-card/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: PRD zgodne z makietą

#### Automated

- [x] 1.1 Prettier akceptuje pliki: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md` — 546802e
- [x] 1.2 PRD nie zostawia otwartego układu: `rg -n "obok siebie albo jedna nad drugą" context/foundation/prd.md` nie zwraca nic w US-27 ani w Business Logic — 546802e

#### Manual

- [x] 1.3 Użytkowniczka potwierdza, że zmienione zdania PRD oddają makietę — 546802e

### Phase 2: Logika karty

#### Automated

- [ ] 2.1 Testy jednostkowe przechodzą: `npm test`
- [ ] 2.2 Lint przechodzi: `npm run lint`
- [ ] 2.3 Zależności przechodzą: `npm run depcruise`
- [ ] 2.4 Typy przechodzą: `npx astro check`
- [ ] 2.5 Build przechodzi: `npm run build`

#### Manual

- [ ] 2.6 Przegląd diffu: reguły sprawdzenia i układ zgodne z planem i makietą

### Phase 3: Strona, katalog i profil

#### Automated

- [ ] 3.1 Testy jednostkowe przechodzą: `npm test`
- [ ] 3.2 Lint przechodzi: `npm run lint`
- [ ] 3.3 Zależności przechodzą: `npm run depcruise`
- [ ] 3.4 Typy przechodzą: `npx astro check`
- [ ] 3.5 Build przechodzi: `npm run build`
- [ ] 3.6 E2E nowej karty i tabel kart przechodzą na wolnym porcie
- [ ] 3.7 Sprawdzian HTTP przechodzi na zbudowanej stronie

#### Manual

- [ ] 3.8 Użytkowniczka sprawdza karty na każdym poziomie i w kilku kategoriach
- [ ] 3.9 Wydruk A4 trzech kart: kratka 5 mm na trudnym i dwie kratki na jednej stronie
- [ ] 3.10 Druk jest jedną stroną w Safari, Chrome iOS i Brave iOS
- [ ] 3.11 Katalog pokazuje miniaturę i plakietkę, a okno profilu podsumowanie
