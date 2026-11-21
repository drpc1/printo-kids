# Cienie (S-47) — plan implementacji

## Overview

Szesnasta karta: „Cienie” (`/shadows`, id `cienie`). Na A4 stoi zdanie polecenia z postacią w dymku i 4–6 par: kolorowy obrazek w lewej kolumnie, czarne cienie w prawej w innej kolejności, kropki po wewnętrznych stronach; dziecko łączy kreską obrazek z jego cieniem. Obrazki to własny katalog karty: ok. 80 gładkich rysunków wektorowych w prawdziwych, uproszczonych kolorach w 12 rodzinach. Trudność rośnie z podobieństwa obrazków: łatwy 4 pary różnych rzeczy z różnych rodzin, średni 5 par z jednej rodziny różnych rzeczy o podobnym kształcie, trudny 6 par wariantów jednej rzeczy. Bez kategorii, bez przełącznika kolorów, bez „Pokaż rozwiązanie”; profil pamięta poziom. Wejście: PRD US-41, US-42, FR-051, FR-052, Business Logic „Karta „Cienie””, Open Questions 21 i makieta v2 `context/changes/shadows-card/` (PR #440); roadmapa S-47, GitHub #419.

## Current State Analysis

Katalog ma piętnaście kart; najbliższy wzór kodu to „Od najmniejszego” (`context/archive/2026-11-18-size-order-card/plan.md`, `src/lib/size-order/`, `SizeOrderGenerator.tsx`): losowanie bez solvera, jedna kontrolka poziomu, rytm faz. Makieta v2 (`mockup.mts`) ma już format rysunku (kształty `path` / `rect` / `circle` / `ellipse` / gruby łuk ucha, kolor części, `detail` pomijany w cieniu), układ dwóch kolumn i 14 przykładowych rysunków (choinka jednym obrysem).

Decyzje (użytkowniczka 2026-11-20 i 2026-11-21): poziomy 4 / 5 / 6 par z rodzin jak wyżej; ok. 80 obrazków w 12 rodzinach: **6 rodzin wariantów jednej rzeczy** (kubki, domki, ryby, auta, drzewa, klucze) dla trudnego i **6 rodzin różnych rzeczy o podobnym kształcie** (owoce, warzywa, zwierzęta, ptaki, ubrania, zabawki) dla średniego, łatwy bierze z wszystkich; obrazki zawsze w kolorze; bez kategorii; **cały katalog rysowany w fazie 1 z arkuszem podglądu do akceptacji przed logiką karty**. Przyjęte bez pytania (w PRD, można zmienić): domyślny poziom łatwy, brak „Pokaż rozwiązanie”, nazwy techniczne poniżej.

### Key Discoveries:

- Rejestry i kontrakt jak w „Od najmniejszego” (plan :15–16): `src/lib/cards.ts` (`CARD_KINDS`, opis zasila „Jak to działa”), `src/lib/card-settings.ts` (`CardSettingsMap`, `DEFAULTS`, `levelIds()`, `parseStoredCards`), `src/lib/card-engines.ts` (`CardTypeMap`, `CARD_ENGINES`, `INVENTORY`), `src/lib/card-summary.ts`, `src/lib/card-contract.ts` (`CardSpec`: `problems`, `keyOf`, `contentKey`, `knownBad`).
- `applySettings` (`src/lib/sheet-state.ts`) układa nową kartę, gdy zmienia się `contentKey`; tu `contentKey` to sam poziom.
- Kolory: strony i komponenty nie mają hexów (AGENTS.md „UI”); nowy kolor to nowy token w `src/styles/global.css`. Paleta rysunków (ok. 16 barw: zieleń liścia, czerwień jabłka, brąz pnia, żółć cytryny…) to tokeny `--picture-*`; rysunek zapisuje nazwę barwy, strona rysuje `var(--picture-…)`, a miniatura i podgląd biorą wartości z `global.css`, jak kredki w `size-order/preview.mts`.
- Tekst SVG z jawnym przesunięciem linii bazowej, nie `dominant-baseline` (GitHub 371). Druk na telefonie wymiarowany szerokością w % kartki (`lessons.md`).
- Bramki: skrypt `test` w `package.json` wymienia każdy plik testów (`src/lib/test-script.test.ts`); `cards-only-through-engines` w `.dependency-cruiser.cjs`; `print-contract.test.ts`; `how-it-works.spec.ts` (zdanie „Poziomy”: „Cienie” wśród kart łatwy / średni / trudny jest już w PRD).
- Koszt: generowanie to losowanie z rodzin; rozróżnialność cieni gwarantuje test katalogu, więc NFR 5 s nie jest ryzykiem. Ryzykiem jest wielkość katalogu i rysowanie wariantów, których cienie różnią się wyraźnie.

## Desired End State

Rodzic otwiera z katalogu „Cienie”, wybiera poziom (łatwy domyślnie), klika Generuj i dostaje jedną stronę A4: kolorowe obrazki po lewej, czarne cienie po prawej w innej kolejności. Zmiana poziomu przy pokazanej karcie układa nową kartę. Profil i ostatnie parametry pamiętają poziom, katalog pokazuje plakietkę, okno profilu podsumowanie, „Jak to działa” opisuje kartę. Katalog ma ok. 80 rysunków zaakceptowanych przez użytkowniczkę na arkuszu, a test pilnuje, że cienie, które mogą trafić na jedną kartę, różnią się wyraźnie. Weryfikacja: `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`, Playwright na czterech projektach Chromium, smoke, przegląd poziomów i wydruk na A4.

## What We're NOT Doing

- Kategorie na pasku, przełącznik „Kolory”, „Pokaż rozwiązanie”, cienie obrócone, odbite albo w innej wielkości, cienie postaci, sylwetki z katalogu szablonów, ikony z „Który nie pasuje” (PRD Non-Goals).
- Obrazki rastrowe (PNG) w katalogu; tylko wektor z palety tokenów.
- Ocena kresek dziecka; aplikacja zna pary, nie sprawdza odpowiedzi.
- Stryker (S-50), tagi katalogu (S-43), przebudowa „Jak to działa” i okna profilu (S-52, S-53), `test-plan.md` (S-51).

## Implementation Approach

Rytm jak w „Od najmniejszego”: każda faza na osobnej gałęzi z `origin/main` i PR do `main`; **każda faza kończy się `/10x-impl-review` przed PR fazy** (reguła repo). Faza 1 to katalog rysunków bez karty, faza 2 logika karty bez UI i bez rejestracji, faza 3 strona i rejestry, faza 4 wydruk po scaleniu.

Nazwy: id `cienie`, trasa `/shadows`, `src/lib/shadows/`, `ShadowPicture` (rysunek katalogu), `ShadowFamily` (rodzina, `kind: "warianty" | "rozne"`), `ShadowsCard`, `ShadowsSettings { level: ShadowsLevelId }`, `ShadowsGenerator`, `ShadowsSheet`.

Reguły karty (zgodne z PRD):

| Poziom | Par | Obrazki                                           | Pole obrazka (około) | Opis w UI                  |
| ------ | --- | ------------------------------------------------- | -------------------- | -------------------------- |
| łatwy  | 4   | 4 różne rodziny (dowolnego rodzaju), po 1 obrazku | 52 mm                | „4 pary, różne rzeczy”     |
| średni | 5   | 5 obrazków z jednej rodziny `rozne`               | 43 mm                | „5 par, podobne kształty”  |
| trudny | 6   | 6 obrazków z jednej rodziny `warianty`            | 35 mm                | „6 par, prawie takie same” |

Losuje się rodzinę(-y), obrazki bez powtórek i kolejność cieni bez cienia w rzędzie swojego obrazka. Każda rodzina ma 6–8 obrazków, więc średni i trudny mają wybór, a kolejne Generuj się różnią.

## Phase 1: Katalog rysunków

### Overview

Format rysunku, paleta tokenów, ok. 80 rysunków w 12 rodzinach, maska cienia i test rozróżnialności, arkusz podglądu do akceptacji. Bez karty i bez rejestracji.

### Changes Required:

#### 1. Dokumenty

**File**: `context/foundation/roadmap.md` (S-47 `in-progress` przy pierwszym commicie fazy), `context/changes/shadows-card/change.md`

**Intent**: Status pracy; glosariusz (karta, cień, rodzina, para) jest już na `main` — tylko sprawdzić, że nazwy w kodzie się z nim zgadzają.

**Contract**: bez nowych pojęć poza glosariuszem; `ShadowPicture` i `ShadowFamily` dopisać do wierszy „Cień” / „Rodzina”, jeśli nazwa w kodzie się różni od „planowane”.

#### 2. Format rysunku i paleta

**File**: `src/lib/shadows/picture-format.ts`, `src/styles/global.css`

**Intent**: Jeden format rysunku dla strony, miniatury, arkusza podglądu i maski cienia; prawdziwe kolory jako tokeny, nie hexy w kodzie.

**Contract**: `ShadowPicture { id; label (polska nazwa, tylko w testach i arkuszu); shapes: readonly ShadowShape[] }`; `ShadowShape` = `path` (`d` tylko z bezwzględnych `M L H V C Q Z`), `rect`, `circle`, `ellipse` (z obrotem), `stroke` (gruby łuk, np. ucho kubka: `d`, `width`); każdy ma `paint: PictureColor` i opcjonalne `detail` (leży wewnątrz obrysu, cień go pomija). `PICTURE_COLORS` (nazwy barw) i tokeny `--picture-<nazwa>` w `global.css` (wartości z makiety v2: zieleń, ciemna zieleń, liść, brąz, czerwień, ciemna czerwień, żółć, pomarańcz, gruszka, niebo, ściana, szarość, biel, krem, błękit, morski…). Kontur rysunku to stały token (ciemnoszary), cień to `--foreground`. Pole rysunku 100×100.

#### 3. Rysunki i rodziny

**File**: `src/lib/shadows/pictures/warianty.ts` i `src/lib/shadows/pictures/rozne.ts` (po sześć rodzin w pliku; zamiast 12 plików, przegląd fazy 1), `src/lib/shadows/families.ts`

**Intent**: Katalog ok. 80 rysunków: 6 rodzin `warianty` (kubki, domki, ryby, auta, drzewa, klucze) i 6 rodzin `rozne` (owoce, warzywa, zwierzęta, ptaki, ubrania, zabawki), po 6–8 obrazków. Styl z makiety v2: prawdziwe, uproszczone kolory, jednolite barwy, ciemny kontur; części nie nachodzą tak, żeby było widać ich krawędzie w środku kształtu (choinka jednym obrysem); w rodzinach `warianty` obrazki różnią się szczegółem obrysu (ucho, dzióbek, dach, płetwa, ząbki klucza), nie tylko detalem w środku, bo cień detali nie ma. Rysunki z makiety v2 przechodzą do katalogu.

**Contract**: `SHADOW_FAMILIES: readonly ShadowFamily[]` (`id`, `label`, `kind`, `pictures`); id obrazków unikalne w całym katalogu; rodzina ma 6–8 obrazków; obrazek należy do jednej rodziny.

#### 4. Maska cienia

**File**: `src/lib/shadows/raster.ts`

**Intent**: Porównywalny cień bez canvasu: rasteryzacja kształtów bez detali w siatce N×N (wstępnie 64), wspólna dla testu katalogu i reguły karty.

**Contract**: `shadowMask(picture, n = 64): boolean[]` (spłaszczenie łuków `C`/`Q` do odcinków, punkt w wielokącie dla `path`, analitycznie `rect`/`circle`/`ellipse`, odległość od łamanej ≤ `width / 2` dla `stroke`); `shadowDifference(a, b): number` = |a XOR b| / |a ∪ b|; `MIN_SHADOW_DIFFERENCE` (wstępnie 0,08, z komentarzem: ustalony na arkuszu, potwierdza wydruk).

#### 5. Testy katalogu i arkusz podglądu

**File**: `src/lib/shadows/pictures.test.ts`, `src/lib/shadows/raster.test.ts`, `package.json` (skrypt `test`), `context/changes/shadows-card/catalog.mts`

**Intent**: Pilnować katalogu zamiast liczyć cienie przy każdej karcie; dać użytkowniczce arkusz do akceptacji.

**Contract**: testy: 12 rodzin (6 + 6), 6–8 obrazków w rodzinie, ≥ 72 obrazki, unikalne id, `d` tylko z dozwolonych poleceń, barwy z `PICTURE_COLORS`, detal leży wewnątrz maski bez detali (detal nie zmienia cienia), **każda para obrazków w katalogu ma `shadowDifference ≥ MIN_SHADOW_DIFFERENCE`** (różne rodziny też mogą razem trafić na łatwy), maska znanych kształtów (koło, prostokąt, łuk) ma oczekiwane pole. `catalog.mts` pisze `catalog-*.svg` / PNG i `catalog.html`: rodzinami, każdy obrazek obok swojego cienia, z podpisem, oraz listą najbliższych par (najmniejsza różnica) do oceny progu.

### Success Criteria:

#### Automated Verification:

- Formatowanie dokumentów: `npx prettier --check context/changes/shadows-card/*.md context/foundation/roadmap.md`
- Testy przechodzą: `npm test`
- Lint: `npm run lint`
- Zależności: `npm run depcruise`
- Typy: `npx astro check`
- Build: `npm run build`

#### Manual Verification:

- Użytkowniczka akceptuje arkusz katalogu (`catalog.html`): wygląd i kolory rysunków, rodziny, czytelność cieni i próg najbliższych par
- Przegląd diffu względem planu i makiety (`/10x-impl-review` przed PR fazy)

**Implementation Note**: po tej fazie zatrzymać się na akceptację arkusza przed fazą 2; poprawki rysunków wracają do tej fazy.

---

## Phase 2: Logika karty

### Overview

Poziomy, karta, generator, układ A4 i silnik z testami; podgląd kart z kodu. Bez UI i bez rejestracji w `cards.ts`.

### Changes Required:

#### 1. Poziomy i stałe druku

**File**: `src/lib/shadows/levels.ts`, `src/lib/shadows/sheet.ts`

**Intent**: Jedno miejsce na tabelę poziomów i stałe druku.

**Contract**: `ShadowsLevelId = "latwy" | "sredni" | "trudny"`, `DEFAULT_SHADOWS_LEVEL_ID = "latwy"`, `ShadowsLevel` (`id`, `label`, `barLabel`, `description`, `pairCount`, `familyRule: "dowolne" | "rozne" | "warianty"`, `pictureSize`), `SHADOWS_LEVELS`, `shadowsLevelById()`. `SHADOWS_SHEET` (`as const`, komentarz przy każdej stałej): strona 210×297, `inset` 10, pas postaci, szerokość pola obrazka, promień i odstęp kropki, polecenie „Połącz każdy obrazek z jego cieniem.”.

#### 2. Karta, reguły i generator

**File**: `src/lib/shadows/card.ts`, `src/lib/shadows/generate.ts`

**Intent**: Karta z jedną odpowiedzią z konstrukcji i stabilnymi kodami problemów; generator losuje z rodzin.

**Contract**: `ShadowsCard` (`levelId`, `pictures: string[]` — id w kolejności lewej kolumny, `shadowOrder: number[]` — dla każdego rzędu prawej kolumny indeks obrazka). `answerOf(card)` (dla obrazka w rzędzie r rząd jego cienia). `shadowsCardProblems(card, level)` zwraca kody: `settings-mismatch`, `wrong-pair-count`, `unknown-picture`, `duplicate-picture`, `families-not-level` (łatwy: obrazki z różnych rodzin; średni: jedna rodzina `rozne`; trudny: jedna rodzina `warianty`), `shadow-order-invalid` (nie permutacja), `shadow-in-own-row`, `shadows-too-similar` (para cieni z różnicą < `MIN_SHADOW_DIFFERENCE`; z testem katalogu nie powinno wystąpić, ale reguła karty jest niezależna). `generateShadowsCard(rand, level)`.

#### 3. Silnik

**File**: `src/lib/shadows/engine.ts`, `.dependency-cruiser.cjs`

**Intent**: Karta jako rodzaj karty: `shadowsSpec` + `shadowsEngine`, nigdy `null`; wyczerpanie to `CardExhausted`.

**Contract**: `contentKey(settings)` = poziom; `keyOf(card)` z id obrazków i kolejności cieni; `knownBad` ≥ 2 z `expectedCode` (np. cień w swoim rzędzie, obrazki z dwóch rodzin na średnim). Do regexu `cards-only-through-engines` dopisać `shadows`. Silnik bierze id `cienie` rzutowaniem do `CardKindId` do fazy 3, a typ `ShadowsSettings` trafia do `src/lib/card-settings.ts` już w tej fazie (jak w „Od najmniejszego”).

#### 4. Układ A4 i podgląd

**File**: `src/lib/shadows/layout.ts`, `context/changes/shadows-card/preview.mts`

**Intent**: Rozmieszczenie w mm wspólne dla strony, miniatury i testu.

**Contract**: `layoutShadowsSheet(card, instructionBoxHeight)` (wysokość pasa polecenia z `instructionBoxHeight` w `src/lib/sheet/speech.ts`, jak w „Od najmniejszego”): pas postaci, rzędy (`cy`), pole obrazka lewego i prawego (`x`, `y`, `size`), kropki; wszystko w marginesie 10 mm; pole nie większe niż `pictureSize` poziomu i wysokość rzędu. `preview.mts` pisze SVG kart z kodu dla trzech poziomów, z postacią i bez (pliki w `.gitignore` folderu); rysownik obrazków wspólny z `catalog.mts` w `render.mts`.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint: `npm run lint`
- Zależności: `npm run depcruise`
- Typy: `npx astro check`
- Build: `npm run build`

#### Manual Verification:

- Użytkowniczka akceptuje podgląd kart z kodu (`preview.mts`; trzy poziomy, z postacią i bez)
- Przegląd diffu względem planu (`/10x-impl-review` przed PR fazy)

**Implementation Note**: po tej fazie zatrzymać się na potwierdzenie przed fazą 3.

---

## Phase 3: Strona, katalog i profil

### Overview

Rejestracja karty, strona `/shadows`, arkusz SVG, miniatura, „Jak to działa”, testy jednostkowe i e2e.

### Changes Required:

#### 1. Rejestry

**File**: `src/lib/cards.ts`, `src/lib/card-settings.ts`, `src/lib/card-engines.ts`, `src/lib/card-summary.ts` (i ich testy), `package.json` (skrypt `test`), `context/domain/glossary.md` (id `cienie` w wierszu „Rodzaj karty”)

**Intent**: Karta w katalogu, poziom w profilu, podsumowanie okna profilu.

**Contract**: wpis `CARD_KINDS` (`id: "cienie"`, `title: "Cienie"`, `href: "/shadows"`, `thumbnail`, `description` 2–3 zdania: co dziecko robi i co jest na kartce); `CardSettingsMap.cienie?: ShadowsSettings`, `DEFAULTS` (łatwy), `levelIds()`; `CardTypeMap`, `CARD_ENGINES`, `INVENTORY`; `summaryParts` (sam poziom, `badgeOf(level)`).

#### 2. Strona i arkusz

**File**: `src/pages/shadows.astro`, `src/components/ShadowsGenerator.tsx`, `src/components/ShadowsSheet.tsx`

**Intent**: Strona na `CardPage` i `useCardPage` z paskiem Postać · Poziom; arkusz SVG z `layoutShadowsSheet`.

**Contract**: `handleLevelSelect` → `remember` + `applySettings` (nowa karta); bez kolorów, kategorii i „Pokaż rozwiązanie”; błąd generowania jak w `SizeOrderGenerator`; obrazek rysowany z kształtów w `var(--picture-…)` z konturem w dwóch przejściach jak w `catalog.mts` (najpierw obrys wszystkich części w `--picture-line`, pogrubiony o szerokość linii, potem same wypełnienia, na końcu detale z własnym obrysem), żeby zachodzące części jednego koloru nie miały kreski w środku (uwaga użytkowniczki o choince, 2026-11-20), cień z kształtów bez detali w `var(--foreground)`; ucho (`stroke`) w cieniu też czarne.

#### 3. Miniatura i „Jak to działa”

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/cienie.svg`, `src/pages/how-it-works.astro`, `tests/e2e/how-it-works.spec.ts`

**Intent**: Miniatura z prawdziwego generatora (łatwy, stałe ziarno, barwy z `global.css`); zdanie „Poziomy” wymienia „Cienie” wśród kart łatwy / średni / trudny.

**Contract**: komentarz nagłówkowy skryptu wymienia nową kartę.

#### 4. Testy

**File**: `src/lib/shadows/*.test.ts`, `src/lib/sheet/print-contract.test.ts`, `tests/e2e/shadows.spec.ts`, `tests/e2e/shadows-reprint.spec.ts`, `card-settings.spec.ts`, `character-speaks.spec.ts`, `phone-layout.spec.ts`, `phone-settings-rows.spec.ts`, `profile-summary.spec.ts`

**Intent**: Pokryć reguły, rejestry, kontrakt druku i przepływ użytkownika.

**Contract**: jednostkowe na wielu ziarnach dla każdego poziomu (kody `knownBad`; orakl: liczba par, rodziny zgodne z poziomem, brak powtórek, permutacja bez stałego punktu, różnica cieni ≥ progu, marginesy 10 mm); `print-contract` (SVG 210×297, brak `print:hidden`, brak własnego `@page`); e2e: generowanie, zmiana poziomu układa nową kartę, zapamiętanie w profilu, plakietka, podsumowanie, „Brak”, ponowny druk, telefon (Generuj i Drukuj się nie zasłaniają).

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

## Phase 4: Wydruk próbny

### Overview

Po scaleniu, nie blokuje wydania: wydruk trzech poziomów i próba z dzieckiem. Zamyka Open Questions 21.

### Changes Required:

#### 1. Poprawki (tylko jeśli wydruk ich wymaga)

**File**: `src/lib/shadows/levels.ts`, `src/lib/shadows/raster.ts`, `src/lib/shadows/pictures/*.ts`, `context/foundation/prd.md`, `context/foundation/roadmap.md`

**Intent**: Dopasować pole obrazka, próg różnicy cieni albo rysunki wariantów do wydruku; commit mówi, co wymusiło zmianę.

**Contract**: wartości w `SHADOWS_LEVELS` i `MIN_SHADOW_DIFFERENCE`; PRD Business Logic i Open Questions 21 oraz roadmapa S-47 zgodne z kodem.

### Success Criteria:

#### Automated Verification:

- Po ewentualnej poprawce: `npm test` i `npm run build`

#### Manual Verification:

- Wydruk na A4 jest jedną stroną w Safari, Chrome iOS i Brave iOS (lekcja: mierzyć każdą przeglądarkę osobno)
- Warianty jednej rzeczy na trudnym są rozróżnialne na wydruku, także w odcieniach szarości na czarno-białej drukarce
- Dziecko łączy pary na łatwym i średnim
- Open Questions 21 zamknięte w PRD, roadmapa S-47 zgodna

---

## Testing Strategy

### Unit Tests:

- Katalog: struktura rodzin, format kształtów, palety, detal wewnątrz obrysu, różnica cieni każdej pary ≥ progu.
- Maska: pola znanych kształtów, symetria `shadowDifference`, 0 dla tego samego obrazka.
- Reguły karty dla każdego poziomu na wielu ziarnach; `knownBad` dla każdego kodu; `contentKey` = poziom.
- Układ: margines 10 mm, pole obrazka w rzędzie, kropki między kolumnami.
- Rejestry: silnik, ustawienia (`parseStoredCards`), podsumowanie, kontrakt druku.
- Stryker poza zakresem: S-50.

### Integration Tests:

- E2E jak w fazie 3 (punkt 4).

### Manual Testing Steps:

1. Arkusz katalogu: obejrzeć każdą rodzinę i najbliższe pary cieni.
2. Wygenerować trzy poziomy; sprawdzić okiem rodziny i to, że żaden cień nie stoi w rzędzie swojego obrazka.
3. Odświeżyć stronę (poziom zostaje); wydrukować na A4 w trzech przeglądarkach iOS.

## Performance Considerations

Generowanie to losowanie z rodzin; reguła `shadows-too-similar` liczy najwyżej 15 par masek 64×64 (poniżej kilku ms). NFR 5 s bez ryzyka.

## Migration Notes

Brak: pole `cards.cienie` w zapisanych profilach dostaje wartość domyślną przez ogólne `parseStoredCards`.

## References

- Makieta i decyzje: `context/changes/shadows-card/change.md`, `mockup.mts`, `mockups.html`
- PRD: US-41, US-42, FR-051, FR-052, Business Logic „Karta „Cienie””, Open Questions 21; roadmapa S-47
- Wzór planu i kodu: `context/archive/2026-11-18-size-order-card/plan.md`, `src/lib/size-order/`, `src/components/SizeOrderGenerator.tsx`
- Lekcje: `context/foundation/lessons.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Katalog rysunków

#### Automated

- [x] 1.1 Formatowanie dokumentów: `npx prettier --check context/changes/shadows-card/*.md context/foundation/roadmap.md` — c7075ddc
- [x] 1.2 Testy przechodzą: `npm test` — c7075ddc
- [x] 1.3 Lint: `npm run lint` — c7075ddc
- [x] 1.4 Zależności: `npm run depcruise` — c7075ddc
- [x] 1.5 Typy: `npx astro check` — c7075ddc
- [x] 1.6 Build: `npm run build` — c7075ddc

#### Manual

- [x] 1.7 Użytkowniczka akceptuje arkusz katalogu (`catalog.html`): wygląd i kolory rysunków, rodziny, czytelność cieni i próg najbliższych par — c7075ddc
- [x] 1.8 Przegląd diffu względem planu i makiety (`/10x-impl-review` przed PR fazy) — c7075ddc

### Phase 2: Logika karty

#### Automated

- [x] 2.1 Testy przechodzą: `npm test`
- [x] 2.2 Lint: `npm run lint`
- [x] 2.3 Zależności: `npm run depcruise`
- [x] 2.4 Typy: `npx astro check`
- [x] 2.5 Build: `npm run build`

#### Manual

- [ ] 2.6 Użytkowniczka akceptuje podgląd kart z kodu (`preview.mts`; trzy poziomy, z postacią i bez)
- [x] 2.7 Przegląd diffu względem planu (`/10x-impl-review` przed PR fazy)

### Phase 3: Strona, katalog i profil

#### Automated

- [ ] 3.1 Testy jednostkowe: `npm test`
- [ ] 3.2 Lint, zależności, typy, build: `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`
- [ ] 3.3 E2E na czterech projektach Chromium z własnym portem: `E2E_PORT=4399 npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`
- [ ] 3.4 Smoke na zbudowanym podglądzie: `BASE_URL=http://localhost:4399 npm run smoke`

#### Manual

- [ ] 3.5 Użytkowniczka sprawdza każdy poziom i podgląd wydruku (jedna strona A4), z postacią i z „Brak”
- [ ] 3.6 Miniatura w katalogu, plakietka poziomu przy profilu i podsumowanie w oknie profilu są poprawne
- [ ] 3.7 Strona na telefonie: Generuj i Drukuj się nie zasłaniają, karta mieści się na A4
- [ ] 3.8 Przegląd diffu względem planu (`/10x-impl-review` przed PR fazy)

### Phase 4: Wydruk próbny

#### Automated

- [ ] 4.1 Po ewentualnej poprawce: `npm test` i `npm run build`

#### Manual

- [ ] 4.2 Wydruk na A4 jest jedną stroną w Safari, Chrome iOS i Brave iOS (lekcja: mierzyć każdą przeglądarkę osobno)
- [ ] 4.3 Warianty jednej rzeczy na trudnym są rozróżnialne na wydruku, także w odcieniach szarości na czarno-białej drukarce
- [ ] 4.4 Dziecko łączy pary na łatwym i średnim
- [ ] 4.5 Open Questions 21 zamknięte w PRD, roadmapa S-47 zgodna
