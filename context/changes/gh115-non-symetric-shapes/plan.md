# Dyktando graficzne: kształty bez osi symetrii (GitHub 115) Implementation Plan

## Overview

Dyktando graficzne dziś losuje obiekty wyłącznie z katalogu szablonów symetrii (lewa połowa + lustro). Dodajemy do dyktanda własny katalog całych sylwetek, które nie muszą być symetryczne: 11 zatwierdzonych kształtów (ryba, kaczka, dinozaur, lokomotywa, helikopter, ciężarówka, statek, łódka z masztem, parasol, klucz pionowy i klucz poziomy), rysowanych ręcznie na kratce, losowanych razem z dotychczasowymi obiektami i także w odbiciu poziomym. Symetria i nonogram zostają przy swoich szablonach. Nowa kategoria „Kształty” (serce, korona, cukierek, kotwica) jest osobnym zgłoszeniem [#198](https://github.com/drpc1/printo-kids/issues/198).

## Current State Analysis

- `src/lib/dictation/generate.ts:92` `catalogFor` buduje pulę kart tylko z `symmetryTemplatesFor(level.templateLevel, category)`; każda karta to (szablon, warianty części) → `dictationCardFor` (`generate.ts:123`) → `dictationSilhouette` (`outline.ts:45`, odbija połowę w lustrze i wypełnia dziury) → `outlineProblems` / `traceOutline` → `placeOutline`.
- `DictationLevel.templateLevel` (`levels.ts:19`) wskazuje poziom symetrii, z którego dyktando bierze obiekty; siatki dyktanda to 10×14 (łatwy, `lat5`), 14×17 (średni, `lat6`), 20×26 (trudny, `lat7`); sylwetka musi zmieścić się w siatce z wolną komórką wokół (8×12, 12×15, 18×24).
- Wszystko za `DictationSilhouette` (`outlineProblems`, `traceOutline`, `placeOutline`, `dictationCardProblems`, layout, strona `DictationGenerator.tsx`, miniatura) pracuje na `DictationSilhouette` / `DictationCard` i nie zakłada symetrii. Kategorie (`ObjectCategoryId`, `CategoryChoice`) i pasek zostają bez zmian.
- Klucz karty `key` (`generate.ts:139`) to poziom + polecenia; „nie powtarzaj poprzedniej karty” działa na kluczu, więc odbicie z innym obrysem ma inny klucz automatycznie.

### Key Discoveries:

- Brak zależności od symetrii za `dictationSilhouette` → nowe kształty wchodzą jako gotowe `DictationSilhouette` i przechodzą te same reguły (`outlineProblems`, `dictationCardProblems`, `maxCommands`).
- `src/lib/object-categories.test.ts:135` już pilnuje dla dyktanda co najmniej dwóch obrysów na kategorię i poziom oraz że kategoria zawęża pulę; `dictationVariantCount` zlicza total/passing/distinct.
- `scripts/build-thumbnails.mjs:374` rysuje miniaturę z `generateDictationCard(mulberry32(seed), null, LAT6)`; zmiana puli może zmienić kartę z danego seeda.
- Zatwierdzona makieta (`mockup-drawings.json` w folderze zmiany) ma 11 kształtów; wszystkie przechodzą `outlineProblems`, mieszczą się w `maxCommands` (od 18 do 46 poleceń) i nie są symetryczne. Nie każdy kształt ma wszystkie trzy poziomy.

## Zatwierdzony zestaw kształtów

| Kształt                                         | Kategoria        | Poziomy               |
| ----------------------------------------------- | ---------------- | --------------------- |
| ryba, kaczka                                    | Zwierzęta        | średni, trudny        |
| dinozaur                                        | Zwierzęta        | łatwy, średni, trudny |
| lokomotywa, ciężarówka, statek, łódka z masztem | Kosmos i maszyny | łatwy, średni, trudny |
| helikopter                                      | Kosmos i maszyny | średni, trudny        |
| parasol                                         | Przyroda         | łatwy, średni, trudny |
| klucz pionowy, klucz poziomy                    | Domy i budowle   | łatwy, średni, trudny |

Jedzenie nie dostaje nowych kształtów. Zęby klucza są po obu stronach trzonka, główka jest okrągła, a na trudnym poziomie zęby są bardziej złożone.

## Desired End State

Klikając Generuj na dyktandzie (dowolny poziom, „Wszystkie” lub jedna kategoria), rodzic widzi też kształty bez osi symetrii (np. ryba, statek, klucz), czasem odbite w poziomie. Każda karta nadal jest jedną zamkniętą linią strzałek bez rozłączeń i styku rogiem, mieści się w siatce i w `maxCommands`. Symetria i nonogram działają bez zmian. PRD opisuje to zachowanie.

Weryfikacja: `npm test`, `npm run lint`, `npx astro check`, `npm run build` zielone; na wydruku/ekranie nowe kształty są rozpoznawalne.

## What We're NOT Doing

- Nie zmieniamy symetrii, nonogramu ani katalogu szablonów (`src/lib/symmetry/`).
- Nie dodajemy nowej kategorii ani kontrolek na pasku; kształty dostają istniejące kategorie. Kategoria „Kształty” z sercem, koroną, cukierkiem i kotwicą to [#198](https://github.com/drpc1/printo-kids/issues/198).
- Nie dodajemy losowanych części (wariantów części) do nowych kształtów; wariantem jest tylko odbicie poziome.
- Nie zmieniamy zasad obrysu dyktanda (jedna linia, bez dotyku rogiem, dziury niewidoczne).
- Kształt musi zmieścić się w siatce poziomu z wolną komórką wokół; nie rozszerzamy siatek.
- Odrzucone w makiecie i nierysowane: ślimak, banan, jabłko, kwiatek, księżyc, żaglówka z żaglem, dźwig, domek z kominem, kościółek, wieloryb, but, motyl, żyrafa, samolot, pies, czajnik, kubek, flaga, rekin, łabędź, kot, ptak.

## Implementation Approach

Nowy plik `src/lib/dictation/shapes.ts` trzyma katalog całych sylwetek (`DictationShape`: id, kategorie, bitmapa na każdy dostępny poziom). `catalogFor` w `generate.ts` poza kartami z szablonów dodaje karty z kształtów: dla każdego kształtu dostępnego na poziomie i dla każdej orientacji (normalna, odbita) buduje `DictationSilhouette`, puszcza przez te same sprawdzenia i dedupuje po kluczu. Rysunki pochodzą z zatwierdzonej makiety `mockup-drawings.json`. Mechanizm jest testowany osobno od rysunków.

## Faza 1: Makieta kształtów (zrobiona)

### Overview

Zaprojektować kształty na kratce i dostać akceptację rozpoznawalności i obrysu przed pisaniem kodu. Wynik: zatwierdzony zestaw z tabeli wyżej.

### Changes Required:

#### 1. Plik makiety

**File**: `context/changes/gh115-non-symetric-shapes/mockup-drawings.json`

**Intent**: Źródło rysunków dla Fazy 3: 11 zatwierdzonych kształtów z kategoriami i bitmapami na dostępne poziomy.

**Contract**: `shapes.<id>.{name, categories, levels.<lat5|lat6|lat7>.{rows, commands}}`; `#` to komórka sylwetki, `.` pusta; poziom, którego kształt nie ma, jest pominięty.

### Success Criteria:

#### Automated Verification:

- Każda makieta przechodzi `outlineProblems` i mieści się w `maxCommands` poziomu
- Zestaw to 11 kształtów w czterech kategoriach (Zwierzęta, Kosmos i maszyny, Przyroda, Domy i budowle)

#### Manual Verification:

- Użytkownik akceptuje rozpoznawalność każdego kształtu w makiecie
- Kształty nie mają osi symetrii lewo–prawo

---

## Faza 2: Mechanizm kształtów bez symetrii

### Overview

Typ i katalog całych sylwetek, scalenie z pulą dyktanda, odbicie poziome, testy reguł. Na początek w katalogu 1–2 kształty z makiety (np. statek i klucz poziomy), żeby mechanizm dało się sprawdzić.

### Changes Required:

#### 1. Typ i katalog

**File**: `src/lib/dictation/shapes.ts` (nowy)

**Intent**: Trzymać całe sylwetki dyktanda niezależnie od szablonów symetrii i zamieniać bitmapę na `DictationSilhouette` (normalizacja do bounding boxa), opcjonalnie odbitą poziomo.

**Contract**: `DictationShape { id; categories: readonly ObjectCategoryId[]; byLevel: Partial<Record<DictationLevelId, readonly string[]>> }` (kształt może nie mieć łatwego poziomu); eksport listy i funkcji `dictationShapesFor(levelId, category)` filtrującej po dostępności na poziomie i po kategorii jak `symmetryTemplatesFor`; funkcja `shapeSilhouette(shape, levelId, mirrored)`. Dziury w bitmapach: obrys liczy się po wypełnieniu dziur, jak w `dictationSilhouette`.

#### 2. Pula kart

**File**: `src/lib/dictation/generate.ts`

**Intent**: `catalogFor` dodaje do puli karty z kształtów (obie orientacje) obok kart z szablonów; wspólna ścieżka sprawdzeń `outlineProblems` → `traceOutline` → `placeOutline` → `dictationCardProblems`, bez duplikowania logiki.

**Contract**: Wydzielić z `dictationCardFor` część od `DictationSilhouette` w górę (np. `dictationCardFromSilhouette(silhouette, level)`), którą wołają oba źródła. `total`/`passing` w `dictationVariantCount` liczą też kształty. Klucz karty bez zmian (poziom + polecenia).

#### 3. Testy

**File**: `src/lib/dictation/generate.test.ts`, `src/lib/dictation/shapes.test.ts` (nowy), `src/lib/object-categories.test.ts`

**Intent**: Pilnować reguł, nie liczb: każdy kształt na każdym dostępnym poziomie i w obu orientacjach przechodzi `outlineProblems` i `dictationCardProblems`, mieści się w `maxCommands`; odbicie daje inny klucz niż oryginał; kształt jest rzeczywiście niesymetryczny; poziom bez bitmapy nie daje karty z tego kształtu; kategorie zachowują co najmniej dwa obrysy i zawężają pulę.

**Contract**: Istniejące testy kategorii dalej zielone; generator nadal nie powtarza poprzedniego klucza; nieznana kategoria nadal daje `null`.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`

#### Manual Verification:

- Na stronie dyktanda po wielu Generuj pojawia się kształt z nowego katalogu, także odbity, i obrys działa

**Implementation Note**: Pauza na potwierdzenie ręczne przed Fazą 3.

---

## Faza 3: Wszystkie rysunki i kategorie

### Overview

Przenieść zatwierdzone rysunki z makiety do katalogu: 11 kształtów na dostępnych poziomach.

### Changes Required:

#### 1. Katalog rysunków

**File**: `src/lib/dictation/shapes.ts`

**Intent**: Uzupełnić katalog o wszystkie zatwierdzone kształty, rysunki dokładnie jak w `mockup-drawings.json`.

**Contract**: Kategorie i dostępność poziomów jak w tabeli „Zatwierdzony zestaw kształtów”. Bitmapy czytelne w kodzie (jeden string na wiersz) z komentarzem, co przedstawia kształt.

#### 2. Testy kategorii i miniatura

**File**: `src/lib/object-categories.test.ts`, `src/lib/dictation/shapes.test.ts`, `scripts/build-thumbnails.mjs`

**Intent**: Potwierdzić, że każdy kształt trafia do swojej kategorii na każdym swoim poziomie (liczone z katalogu kształtów, bez porównania ze stanem sprzed zmiany i bez pinowania liczb) i że seed miniatury nadal daje poprawną kartę; przebudować miniaturę, jeśli karta z seeda się zmieniła.

**Contract**: `npm run thumbnails` uruchomić tylko, gdy diff miniatury jest zamierzony; inaczej assety bez zmian.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint, typy i build przechodzą: `npm run lint`, `npx astro check`, `npm run build`

#### Manual Verification:

- Dla każdej kategorii i poziomu Generuj kilkanaście razy: pojawiają się nowe, rozpoznawalne kształty
- Karta mieści się na A4, lista poleceń i siatka nie nachodzą na siebie, także na telefonie

---

## Faza 4: PRD i sprawdzenie na wydruku

### Overview

Zsynchronizować PRD z zachowaniem i obejrzeć wydruk.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: Dyktando nie jest już ograniczone do obrysów obiektów symetrii: opisać własny katalog kształtów dyktanda (z listą), orientację odbitą, to, że nie każdy kształt ma wszystkie poziomy, i że kategorie obejmują oba źródła.

**Contract**: Poprawić US-17 (droga to obrys sylwetki obiektu z katalogu, nie tylko z szablonów symetrii), US-19 (symetria wymagana tylko dla symetrii i nonogramu), FR-026 i FR-028, Business Logic „Karta dyktanda graficznego” i „Katalog szablonów obiektów”; Open Questions 11 uzupełnić o wynik nowej puli, jeśli dotyczy.

### Success Criteria:

#### Automated Verification:

- Format dokumentu przechodzi: `npx prettier --check context/foundation/prd.md`

#### Manual Verification:

- Wydruk próbny: nowe kształty czytelne, obrys do narysowania, bez dotykania rogiem
- PRD zgodne z zachowaniem aplikacji

---

## Testing Strategy

### Unit Tests:

- Wszystkie kształty × dostępne poziomy × orientacje przechodzą reguły obrysu i limit poleceń
- Odbicie zmienia klucz; kształt jest niesymetryczny
- Kategorie: nowe kształty trafiają do swoich kategorii, pula zawęża się po kategorii, brak powtórzenia poprzedniej karty

### Integration Tests:

- Istniejące testy generatora i layoutu dyktanda zostają zielone

### Manual Testing Steps:

1. Strona dyktanda, każdy poziom, „Wszystkie”: Generuj ok. 20 razy, wypatrzyć nowe kształty
2. Każda kategoria po kolei: nowe kształty się pojawiają
3. Pokaż rozwiązanie: obrys zgadza się z listą poleceń
4. Wydruk i widok telefonu

## Performance Considerations

Katalog budowany raz na poziom i kategorię (cache `catalogs`); dodatkowo najwyżej 11 sylwetek × 2 orientacje na poziom, bez wpływu na limit 5 s.

## References

- Issue: GitHub 115, „Dyktando graficzne: kształty, które nie muszą być symetryczne”
- Kategoria „Kształty”: [#198](https://github.com/drpc1/printo-kids/issues/198)
- Generator: `src/lib/dictation/generate.ts:92`, `src/lib/dictation/outline.ts:45`, `src/lib/dictation/outline.ts:120`
- Poziomy: `src/lib/dictation/levels.ts:19`
- Testy kategorii: `src/lib/object-categories.test.ts:135`
- Zatwierdzona makieta: `context/changes/gh115-non-symetric-shapes/mockup-drawings.json`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Makieta kształtów (zrobiona)

#### Automated

- [x] 1.1 Każda makieta przechodzi `outlineProblems` i mieści się w `maxCommands` poziomu
- [x] 1.2 Zestaw to 11 kształtów w czterech kategoriach (Zwierzęta, Kosmos i maszyny, Przyroda, Domy i budowle)

#### Manual

- [x] 1.3 Użytkownik akceptuje rozpoznawalność każdego kształtu w makiecie
- [x] 1.4 Kształty nie mają osi symetrii lewo–prawo

### Phase 2: Mechanizm kształtów bez symetrii

#### Automated

- [ ] 2.1 Testy przechodzą: `npm test`
- [ ] 2.2 Lint przechodzi: `npm run lint`
- [ ] 2.3 Typy przechodzą: `npx astro check`

#### Manual

- [ ] 2.4 Na stronie dyktanda po wielu Generuj pojawia się kształt z nowego katalogu, także odbity, i obrys działa

### Phase 3: Wszystkie rysunki i kategorie

#### Automated

- [ ] 3.1 Testy przechodzą: `npm test`
- [ ] 3.2 Lint, typy i build przechodzą: `npm run lint`, `npx astro check`, `npm run build`

#### Manual

- [ ] 3.3 Dla każdej kategorii i poziomu pojawiają się nowe, rozpoznawalne kształty
- [ ] 3.4 Karta mieści się na A4, lista poleceń i siatka nie nachodzą na siebie, także na telefonie

### Phase 4: PRD i sprawdzenie na wydruku

#### Automated

- [ ] 4.1 Format dokumentu przechodzi: `npx prettier --check context/foundation/prd.md`

#### Manual

- [ ] 4.2 Wydruk próbny: nowe kształty czytelne, obrys do narysowania, bez dotykania rogiem
- [ ] 4.3 PRD zgodne z zachowaniem aplikacji
