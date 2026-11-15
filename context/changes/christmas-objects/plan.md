# Świąteczne obiekty (S-38) Implementation Plan

## Overview

Dodajemy kategorię obiektów „Boże Narodzenie”. Pasek symetrii, nonogramu, dyktanda graficznego i „Skopiuj obrazek” pokazuje ją od 15 listopada do 6 stycznia. Kategoria zbiera 6 nowych obiektów z szablonów (bombka, dzwonek, prezent, piernik, bałwanek, aniołek), 5 nowych kształtów dyktanda (skarpeta, laska cukrowa, czapka Mikołaja, sanki, renifer) oraz istniejące choinkę i gwiazdę. To pierwszy zegar w aplikacji: data steruje wyłącznie listą na pasku i tym, jak pasek czyta zapamiętaną kategorię. Całość idzie jednym wydaniem przed grudniem 2026 (roadmapa S-38, issue drpc1/printo-kids#369).

## Current State Analysis

Frame (`context/changes/christmas-objects/frame.md`) ustalił:

- Kategoria, a nie tag. S-43 taguje rodzaje kart na stronie głównej. Glosariusz zabrania nazywać kategorię „tag” (`context/domain/glossary.md:41`). PRD przewiduje „sezonową kategorię” (Katalog szablonów obiektów).
- Obiekt może mieć kilka kategorii (`src/lib/symmetry/template-format.ts:42`). Dziś każdy z 34 obiektów ma jedną.
- Pasek czyta statyczne `OBJECT_CATEGORY_CHOICES` (`src/lib/symmetry/templates.ts:45-48`): „Wszystkie”, potem alfabetycznie po polsku. Czytają je `CategoryChoice.tsx:22,28`, cztery generatory (etykieta przyczyny) i `card-summary.ts:166`.
- Odczyt ustawień jest tolerancyjny tylko wobec nieznanych wartości (`src/lib/card-settings.ts:212-213`).
- „Który nie pasuje” ma własne kategorie ikon (`src/lib/odd-one-out/icons.ts:7-9`), więc zmiana jej nie dotyczy.
- Strony generatorów to `client:only="react"`, więc datę daje urządzenie i nie ma rozjazdu SSR. Nic w `src` nie czyta dziś zegara.

Dodatkowe ustalenia z planowania:

- „Skopiuj obrazek” sprawdza kartę i koloruje ją przez `symmetryTemplatesFor(…, "wszystkie")` (`src/lib/copy-drawing/card.ts:59`, `colors.ts:14`). „Wszystkie” musi więc zostać pełnym katalogiem, a data nie może wejść do `symmetryTemplatesFor`.
- Silniki kart mają sygnaturę `generate(settings, random, previousKey)` (`src/lib/card-contract.ts:107`), a stan karty przechodzi przez `generateSheet` i `applySettings` (`src/lib/sheet-state.ts:44,61`). Data zostaje poza nimi.
- Stan paska startuje w `useCardSettings` z `cardSettingsOf(visit.visitCards, cardId)` (`src/hooks/useCardSettings.ts:87`) i przy przełączeniu profilu (`switchTo`, `:120`). `remember` buduje zapis z bieżącego stanu (`:113-114`).
- Katalog składa się w kolejności `CATALOG = [ZWIERZETA, …, KSZTALTY]` (`templates.ts:32`). Nowy plik dochodzi na końcu, więc istniejące obiekty się nie przestawiają.
- Kształty dyktanda to `DICTATION_SHAPES` (`src/lib/dictation/shapes.ts:389`): bitmapa na poziom, a brak bitmapy oznacza, że poziom kształt pomija.
- Reguły, które nowe rysunki muszą przejść:
  - jeden kawałek bez styku rogiem (`src/lib/symmetry/templates.test.ts:104`);
  - te same kategorie w każdym rozmiarze (`templates.test.ts:21`);
  - działający wariant nonogramu średniego i trudnego dla każdego obiektu (`src/lib/nonogram/generate.test.ts:122,137`);
  - ≥2 karty nonogramu i ≥2 obrysy dyktanda w każdej kategorii na każdym rozmiarze (`src/lib/object-categories.test.ts:117,143`);
  - test kolejności etykiet paska (`object-categories.test.ts:52-63`).
- Makiety mają gotowy wzór: `context/archive/2026-10-30-gh124-more-symetric-shapes/` (`mockup-drawings.json`, `check-mockup.mts`, `render-preview.mts`, PNG) i `context/archive/2026-10-30-gh115-non-symetric-shapes/mockup-drawings.json` (kształty dyktanda).
- `npm test` wylicza pliki testów jawnie (`package.json:12`). Nowe testy dopisujemy do istniejących plików. Playwright 1.64 ma `page.clock`.

## Desired End State

Między 15.11 a 6.01 (włącznie, według daty urządzenia) lista „Kategoria” na symetrii, nonogramie, dyktandzie i „Skopiuj obrazek” ma kolejność: Wszystkie, Boże Narodzenie, Domy i budowle, Jedzenie, Kosmos i maszyny, Kształty, Przyroda, Zwierzęta. Wybór „Boże Narodzenie” losuje tylko obiekty tej kategorii, na każdym poziomie i bez powtórzeń.

Poza oknem listy „Boże Narodzenie” nie ma. Profil albo ostatnie parametry z zapamiętanym „Bożym Narodzeniem” pokazują na pasku i w podsumowaniu profilu „Wszystkie”. Pierwsza zmiana na pasku tej karty zapisuje „Wszystkie”. „Wszystkie” przez cały rok losuje z pełnego katalogu, także obiekty świąteczne.

Kategorie obiektów:

- choinka: Przyroda + Boże Narodzenie;
- gwiazda: Kształty + Boże Narodzenie;
- renifer: Boże Narodzenie + Zwierzęta;
- pozostałe nowe: tylko Boże Narodzenie.

Bałwanek w kolorach ma szary korpus.

Weryfikacja: `npm test`, `npm run lint`, `npx astro check`, `npm run build` i e2e (Chromium) przechodzą. Wydruk na stagingu potwierdza czytelność.

### Key Discoveries:

- „Wszystkie” jako pełny katalog to kontrakt karty „Skopiuj obrazek” (`copy-drawing/card.ts:59`, `colors.ts:14`), więc okno dat działa tylko na liście paska.
- `useCardSettings.ts:87,113-120` to jedyne miejsce, przez które pasek dostaje i zapisuje ustawienia kart z kategorią. Tam mapowanie kategorii spoza okna na „Wszystkie” daje dokładnie decyzję „zapomnij przy zmianie”.
- `object-categories.test.ts` iteruje `OBJECT_CATEGORIES`, więc nowa kategoria dostaje testy liczności automatycznie.

## What We're NOT Doing

- Pory roku (Wiosna, Lato, Jesień, Zima) idą osobnym kawałkiem po świętach, na tym samym mechanizmie okna dat.
- Inne święta (Wielkanoc, Mikołajki).
- Kształty niesymetryczne na „Skopiuj obrazek”: osobne issue drpc1/printo-kids#379.
- Kształty asymetryczne na nonogramie.
- Data w silnikach kart, w `sheet-state` i w `symmetryTemplatesFor`; „Wszystkie” poza oknem nie pomija obiektów świątecznych.
- Zapis „Wszystkie” przy samym wejściu na stronę i pamiętanie kategorii sezonowej na przyszły rok.
- Druga stała kategoria dla piernika, bombki, prezentu, aniołka i bałwanka; laska cukrowa i sanki nie trafiają do stałych kategorii.
- Mikołaj w całości (postać, S-39) i gwiazda betlejemska jako kwiat.
- Opis na stronie „Jak to działa” (S-44), test-plan (S-46).
- Przestawianie istniejących obiektów i ich wariantów.

## Implementation Approach

Kategoria dostaje opcjonalne okno dat w `OBJECT_CATEGORIES`. Dwie czyste funkcje z datą w argumencie dają listę paska i kategorię widoczną dziś. Tylko warstwa React (jeden mały hook z datą zamrożoną przy montowaniu strony) woła je z `new Date()`. Testy jednostkowe podają datę wprost, a e2e ustawia zegar przez `page.clock`.

Rysunki powstają najpierw w makiecie i przechodzą skrypt reguł czterech kart. Podglądy PNG idą do akceptacji użytkowniczki razem z kategoriami każdego obiektu, a do kodu trafiają dopiero rysunki zatwierdzone. Faza 2 (mechanizm) idzie równolegle z akceptacją makiety, bo nie zależy od rysunków: choinka i gwiazda wystarczą, żeby nowa kategoria przeszła testy liczności.

Proces: przed PR każdej fazy uruchamiamy `/10x-impl-review`.

## Critical Implementation Details

- **Data lokalna, okno przez koniec roku.** Okno porównuje miesiąc i dzień daty lokalnej urządzenia (`getMonth`, `getDate`, nie UTC), z obiema granicami włącznie. 15.11–6.01 przechodzi przez Nowy Rok, więc warunek to „od ≤ dzień” **lub** „dzień ≤ do”, a nie oba naraz.
- **Data zamrożona na wizytę.** Hook czyta `new Date()` raz przy montowaniu strony. Strona otwarta przez północ 6/7 stycznia zostaje przy dacie z wejścia. To świadome: lista na pasku nie zmienia się w trakcie wizyty.

## Phase 1: Makieta i pomiar

### Overview

Rysunki 7 obiektów z szablonów (po akceptacji: 6) w trzech rozmiarach (połowa 4×12, 6×15, 9×24) i 6 kształtów (po akceptacji: 5) dyktanda na zatwierdzanych poziomach, sprawdzone skryptem reguł i pokazane jako PNG do akceptacji użytkowniczki.

### Changes Required:

#### 1. Makieta rysunków

**File**: `context/changes/christmas-objects/mockup-drawings.json`

**Intent**: Jeden plik z rysunkami do akceptacji. Ma format makiety gh124 (sekcja `objects`: baza i części z wariantami, litery kredek jak w `drawing()`) i gh115 (sekcja `shapes`: bitmapa `#`/`.` na poziom `lat5`/`lat6`/`lat7`). Każdy obiekt i kształt ma też pole `categories`.

**Contract**:

- Obiekty: bombka, dzwonek, prezent, piernik, bałwanek, aniołek, świeca; każdy w `half4`, `half6` i `half9`, z ≥2 wariantami części tam, gdzie sylwetka na to pozwala. Kolory z ośmiu kredek, bez białej. Bałwanek ma szary korpus, czarny kapelusz, pomarańczowy nos, a oczy i guziki są dziurami w czerni. Piernik ma lukier jako białe dziury (`holeColor: null`).
- Kształty i poziomy:
  - skarpeta i rękawiczka: `lat5`, `lat6`, `lat7`;
  - laska cukrowa, czapka Mikołaja, sanki: `lat6`, `lat7`;
  - renifer: `lat7`.
- Kategorie jak w Desired End State; id kategorii `boze-narodzenie`.

#### 2. Skrypt sprawdzenia i podgląd

**File**: `context/changes/christmas-objects/check-mockup.mts`, `context/changes/christmas-objects/render-preview.mts`

**Intent**: Skrypty z gh124 przeniesione do tego folderu i rozszerzone o kształty dyktanda.

- Dla obiektów sprawdzają symetrię (karta symetrii bez problemów), jeden kawałek bez styku rogiem, przechodzące kombinacje nonogramu łatwego, średniego i trudnego oraz liczbę różnych obrysów dyktanda.
- Dla kształtów sprawdzają obrys dyktanda na każdym narysowanym poziomie, z odbiciem.
- Podgląd rysuje PNG każdego rozmiaru w kolorach i w czerni.

**Contract**: uruchomienie z katalogu repo: `node --experimental-strip-types context/changes/christmas-objects/check-mockup.mts`. Wynik do `mockup-measure.txt`, podglądy `preview-4x12.png`, `preview-6x15.png`, `preview-9x24.png`, `preview-shapes.png`. Skrypty nie wchodzą do builda.

### Success Criteria:

#### Automated Verification:

- `check-mockup.mts` kończy się bez błędów, a każdy obiekt ma co najmniej jedną przechodzącą kombinację nonogramu średniego i trudnego.
- `check-mockup.mts` pokazuje dla każdego kształtu poprawny obrys na każdym narysowanym poziomie.
- Pomiar zapisany w `mockup-measure.txt`: przechodzące kombinacje i różne obrysy na obiekt i rozmiar.

#### Manual Verification:

- Użytkowniczka akceptuje podglądy PNG: obiekty są czytelne w połowie 4×12, a kategorie każdego obiektu się zgadzają. Data akceptacji trafia do pola `approved` w makiecie.

**Implementation Note**: Faza 3 i 4 czekają na akceptację makiety. Faza 2 może iść w tym czasie. Obiekt, który nie przejdzie reguł albo jest nieczytelny, odpada bez zastępstwa (kolejność cięcia w frame).

### Wynik fazy 1 (makieta zaakceptowana 2026-11-14, pole `approved` w `mockup-drawings.json`)

Źródłem rysunków do faz 3–4 jest `mockup-drawings.json`. Odstępstwa od kontraktu fazy 1:

- Odpadły bez zastępstwa: świeca i rękawiczka (nieczytelne; rękawiczka wyglądała jak kaktus).
- Obiekty z szablonów (6), wszystkie tylko `["boze-narodzenie"]`: bombka, dzwonek, prezent, piernik, bałwanek, aniołek. Dzwonek nie jest w Domach i budowlach.
- Kształty dyktanda (5): skarpeta (`lat5`, `lat6`, `lat7`), laska cukrowa, czapka Mikołaja i sanki (`lat6`, `lat7`), renifer (`lat7`, kategorie `["boze-narodzenie", "zwierzeta"]`).
- Kolor bombki i prezentu jest częścią z wariantami (baza prezentu pusta), bo `pickHints` bierze kratki osi z bazy i części. Kolory prezentu (czerwony, zielony, niebieski) i wstążki to kolorowe kratki, w czerni niewidoczne (wybór użytkowniczki).
- `holeColor`: bombka i prezent `yellow`, dzwonek `red`, piernik, bałwanek i aniołek `black`. Wzory bombek są z dziur. Piernik ma czarne oczy, czerwony uśmiech z kratek i nie ma lukru na rękach (zamiast „lukru jako białych dziur”, `holeColor: null`).
- Styk rogiem: skrypt wymaga ≥1 kombinacji bez styku (jak `templates.test.ts`) oraz obrysu zewnętrznego bez styku w każdej kombinacji; styk rogiem wokół dziur wewnątrz obiektu jest dozwolony.
- Znany kompromis: w czerni prezent ma 2–3 różne sylwetki, a bombki z gładką kulą zlewają się (świadomie zostawione; ocena na wydruku w fazie 5).

---

## Phase 2: Kategoria z oknem dat

### Overview

Kategoria „Boże Narodzenie” z oknem 15.11–6.01, lista paska zależna od daty, odczyt kategorii spoza okna jako „Wszystkie” i choinka z gwiazdą w nowej kategorii.

### Changes Required:

#### 1. Kategoria z oknem

**File**: `src/lib/symmetry/template-format.ts`

**Intent**: Dopisać „Boże Narodzenie” do `OBJECT_CATEGORIES` z oknem dat. Kategorie stałe nie mają okna.

**Contract**: pozycja `{ id: "boze-narodzenie", label: "Boże Narodzenie", window: { from: { month: 11, day: 15 }, to: { month: 1, day: 6 } } }`; `ObjectCategoryId` zawiera `"boze-narodzenie"`. Miesiące są liczone od 1.

#### 2. Lista paska i kategoria widoczna dziś

**File**: `src/lib/symmetry/templates.ts`

**Intent**:

- `OBJECT_CATEGORY_CHOICES` zostaje pełną, statyczną listą wszystkich kategorii w kolejności paska: Wszystkie, kategorie z oknem, stałe alfabetycznie. Czytają ją odczyt ustawień i etykiety.
- Dwie nowe czyste funkcje dają listę i kategorię widoczne w danym dniu.
- `symmetryTemplatesFor` się nie zmienia.

**Contract**:

- `objectCategoryChoicesOn(today: Date)` zwraca `OBJECT_CATEGORY_CHOICES` bez kategorii, których okno nie obejmuje `today`.
- `visibleCategoryOn(category: ObjectCategoryChoiceId, today: Date): ObjectCategoryChoiceId` zwraca `category` albo `"wszystkie"`, gdy kategoria ma okno, które nie obejmuje `today`.
- Okno: patrz Critical Implementation Details.

#### 3. Data na stronie

**File**: `src/hooks/useToday.ts` (nowy), `src/hooks/useCardSettings.ts`, `src/components/CategoryChoice.tsx`

**Intent**:

- `useToday` zwraca datę zamrożoną przy montowaniu.
- `useCardSettings` mapuje `category` przez `visibleCategoryOn` w stanie początkowym i w `switchTo`, dla kart, których ustawienia mają pole `category`. Zapis rusza dopiero przy zmianie na pasku, bo `remember` startuje z już zmapowanego stanu.
- `CategoryChoice` pokazuje `objectCategoryChoicesOn(today)`.

**Contract**: `useToday(): Date`. `parseCardSettings` i `cardSettingsOf` zostają bez daty.

#### 4. Podsumowanie profilu

**File**: `src/lib/card-summary.ts`, `src/components/ProfileCorner.tsx`

**Intent**: Podsumowanie w oknie profilu pokazuje tę kategorię, którą pokaże pasek. Poza oknem zamiast „Boże Narodzenie” jest „Wszystkie”.

**Contract**: `cardSummaries(profile, today?: Date)`. Z datą mapuje kategorię przez `visibleCategoryOn`; bez daty pokazuje zapamiętaną, więc `catalogBadges` i istniejące testy zostają. `ProfileCorner` podaje datę z `useToday`.

#### 5. Choinka i gwiazda w nowej kategorii

**File**: `src/lib/symmetry/objects/przyroda.ts`, `src/lib/symmetry/objects/ksztalty.ts`

**Intent**: Choinka dostaje `["przyroda", "boze-narodzenie"]` we wszystkich trzech rozmiarach, gwiazda `["ksztalty", "boze-narodzenie"]`. Rysunki i kolejność się nie zmieniają.

**Contract**: w `ksztalty.ts` kategorie są wspólną stałą `CATEGORIES` (`:27`), więc gwiazda potrzebuje własnej listy.

#### 6. Testy

**File**: `src/lib/object-categories.test.ts`, `src/lib/card-summary.test.ts`, `tests/e2e/christmas-category.spec.ts` (nowy)

**Intent**:

- Test kolejności etykiet (`object-categories.test.ts:52-63`) dostaje nową kolejność pełnej listy.
- Nowe testy okna na dniach granicznych:
  - 14.11 poza oknem;
  - 15.11, 10.12, 31.12, 1.01 i 6.01 w oknie;
  - 7.01 i 10.07 poza oknem.
- Testy `visibleCategoryOn` dla kategorii stałej, „Wszystkie” i „Bożego Narodzenia” w oknie i poza nim.
- Test podsumowania z datą poza oknem.
- E2E z `page.clock` sprawdza:
  - 10.12: lista na `/symmetry` ma „Boże Narodzenie” zaraz po „Wszystkie”, wybór i Generuj dają kartę;
  - 10.02: listy bez tej pozycji, a ostatnie parametry z `boze-narodzenie` pokazują „Kategoria: Wszystkie”.

**Contract**: nowy plik e2e wchodzi do istniejących projektów Playwright bez zmian w konfiguracji. Testy jednostkowe zostają w plikach już wymienionych w `npm test`.

#### 7. Glosariusz

**File**: `context/domain/glossary.md`

**Intent**: Wiersz „Kategoria obiektów” dostaje „Boże Narodzenie” i id `boze-narodzenie`. Dochodzi pojęcie „okno kategorii”: kategoria widoczna na pasku tylko w swoich dniach, nazwy w kodzie `window`, `objectCategoryChoicesOn`, `visibleCategoryOn`; jak nie nazywać: „sezonowy tag”, „filtr”.

**Contract**: tabela glosariusza, sekcja kategorii (`glossary.md:41-46`).

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, w tym nowe testy okna dat i kolejności paska.
- `npm run lint` i `npx astro check` przechodzą.
- `npx playwright test tests/e2e/christmas-category.spec.ts` przechodzi na projektach Chromium.
- `npm run build` przechodzi.

#### Manual Verification:

- Na telefonie lista „Kategoria” z ośmioma pozycjami mieści się w całości, a Generuj i Drukuj nie nachodzą na siebie.

**Implementation Note**: Po fazie `/10x-impl-review`, potem PR do `main`.

---

## Phase 3: Obiekty z szablonów

### Overview

Sześć zatwierdzonych obiektów w katalogu szablonów, dostępnych na symetrii, nonogramie, dyktandzie i „Skopiuj obrazek”.

### Changes Required:

#### 1. Plik obiektów

**File**: `src/lib/symmetry/objects/boze-narodzenie.ts` (nowy), `src/lib/symmetry/templates.ts`

**Intent**: Szablony z makiety przepisane do kodu w formacie istniejących plików obiektów (`drawing()`, części z wariantami, `holeColor`). Renifer (kształt) ma `["boze-narodzenie", "zwierzeta"]`, wszystkie nowe obiekty z szablonów `["boze-narodzenie"]`. Eksport dochodzi na końcu `CATALOG` (`templates.ts:32`).

**Contract**: `BOZE_NARODZENIE: SymmetryObjectSizes` z `half4`, `half6` i `half9`; id obiektów: `bombka`, `dzwonek`, `prezent`, `piernik`, `balwanek`, `aniolek` (świeca odpadła w fazie 1).

#### 2. Test obecności

**File**: `src/lib/symmetry/templates.test.ts`

**Intent**: Test, że „Boże Narodzenie” na każdym poziomie zawiera choinkę, gwiazdę i zatwierdzone nowe obiekty.

**Contract**: bez pinowania liczby kombinacji.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, w tym `templates.test.ts` (kawałek, styk rogiem, kategorie w każdym rozmiarze), testy nonogramu średniego i trudnego (każdy obiekt ma działający wariant) i `object-categories.test.ts` (≥2 karty i obrysy w każdej kategorii).
- `npm run lint`, `npx astro check` i `npm run build` przechodzą.

#### Manual Verification:

- W przeglądarce (z datą w oknie) „Boże Narodzenie” na symetrii, nonogramie, dyktandzie i „Skopiuj obrazek” daje kolejne różne obiekty, a kolory bałwanka i piernika wyglądają jak na makiecie.

**Implementation Note**: Po fazie `/10x-impl-review`, potem PR do `main`.

---

## Phase 4: Kształty dyktanda

### Overview

Pięć zatwierdzonych kształtów dyktanda w kategorii „Boże Narodzenie”, a renifer także w Zwierzętach.

### Changes Required:

#### 1. Kształty

**File**: `src/lib/dictation/shapes.ts`

**Intent**: Bitmapy z makiety jako nowe `DictationShape` dopisane na końcu `DICTATION_SHAPES` (`:389`). Każdy kształt ma tylko zatwierdzone poziomy.

**Contract**: id `skarpeta`, `laska-cukrowa`, `czapka-mikolaja`, `sanki`, `renifer` (rękawiczka odpadła w fazie 1). Renifer ma `["boze-narodzenie", "zwierzeta"]`, pozostałe `["boze-narodzenie"]`.

#### 2. Testy

**File**: `src/lib/dictation/shapes.test.ts`

**Intent**: Istniejące testy kształtów obejmą nowe bitmapy. Dochodzi test, że „Boże Narodzenie” w dyktandzie ma nowe kształty na zatwierdzonych poziomach.

**Contract**: bez pinowania liczby obrysów.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, w tym testy kształtów i obrysów dyktanda.
- `npm run lint`, `npx astro check` i `npm run build` przechodzą.

#### Manual Verification:

- W przeglądarce (z datą w oknie) dyktando w „Bożym Narodzeniu” pokazuje skarpetę i pozostałe kształty, także odbite, a polecenia prowadzą po obrysie.

**Implementation Note**: Po fazie `/10x-impl-review`, potem PR do `main`.

---

## Phase 5: Domknięcie

### Overview

PRD i dokumenty z nowymi liczbami, pełna weryfikacja i wydruk na stagingu przed wydaniem.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: Opisać kategorię z oknem dat i nowe obiekty.

**Contract**:

- **US-19:** siedem kategorii, w tym „Boże Narodzenie” widoczne 15.11–6.01.
- **US-20:** kolejność na pasku: Wszystkie, kategorie z oknem, stałe alfabetycznie; poza oknem kategorii nie ma, a zapamiętana pokazuje się jako „Wszystkie”.
- **FR-028 i FR-029:** Socrates „Revised (2026-11-14)”.
- **Katalog szablonów obiektów:** wiersz tabeli „Boże Narodzenie”, liczba obiektów, obiekty w dwóch kategoriach.
- **Karta dyktanda graficznego:** tabela kształtów z nowymi wierszami.
- **Open Questions 11:** liczby z pomiaru.

#### 2. Pozostałe dokumenty

**File**: `context/foundation/shape-notes.md`, `context/foundation/roadmap.md`

**Intent**: Liczba obiektów katalogu w `shape-notes.md:82,140`. W roadmapie S-38 jako rozstrzygnięte Unknowns, z odnośnikiem do frame.

**Contract**: tylko liczby i statusy; bez nowych kawałków roadmapy (pory roku dopisze `/10x-roadmap`).

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check` i `npm run build` przechodzą.
- E2E Chromium (`npx playwright test` z wolnym `E2E_PORT`) przechodzi.

#### Manual Verification:

- Na stagingu w oknie dat użytkowniczka drukuje po jednej karcie „Bożego Narodzenia” z każdej z czterech kart, w czerni i w kolorach tam, gdzie karta je ma; obiekty są czytelne na papierze.
- Wydanie `main` → `prod` przed 1.12.2026 według `.github/PULL_REQUEST_TEMPLATE/release.md`.

**Implementation Note**: Po fazie `/10x-impl-review`, potem PR do `main` i wydanie.

---

## Testing Strategy

### Unit Tests:

- Okno dat na dniach granicznych i przez Nowy Rok; `visibleCategoryOn` dla kategorii stałej, „Wszystkie” i z oknem.
- Kolejność pełnej listy paska i listy na datę w oknie i poza nim.
- Podsumowanie profilu z datą poza oknem.
- Istniejące testy katalogu, nonogramu, dyktanda i kategorii obejmują nowe obiekty automatycznie; dochodzą testy obecności.

### Integration Tests:

- E2E z `page.clock`: lista w oknie i poza nim, wybór „Bożego Narodzenia” i Generuj, zapamiętana kategoria poza oknem jako „Wszystkie”.

### Manual Testing Steps:

1. Akceptacja makiety PNG (faza 1).
2. Lista „Kategoria” na telefonie z ośmioma pozycjami (faza 2).
3. Kolejne karty „Bożego Narodzenia” na czterech kartach (fazy 3–4).
4. Wydruk na stagingu przed wydaniem (faza 5).

## Performance Considerations

Więcej obiektów wydłuża enumerację w teście trudnego nonogramu (próg 15 s, `nonogram/generate.test.ts:118`). Pomiar z fazy 1 pokaże zapas. Generuj w przeglądarce losuje próbami, więc liczba obiektów go nie spowalnia.

## Migration Notes

Bez migracji. Stare ustawienia nie zawierają `boze-narodzenie`. Zapamiętana kategoria poza oknem czyta się na pasku jako „Wszystkie” i nadpisuje przy pierwszej zmianie. Gdyby kategoria kiedyś zniknęła z kodu, odczyt spadnie na „Wszystkie” (`card-settings.ts:212-213`).

## References

- Frame: `context/changes/christmas-objects/frame.md`
- Wzór makiety: `context/archive/2026-10-30-gh124-more-symetric-shapes/` (`check-mockup.mts`, `render-preview.mts`), `context/archive/2026-10-30-gh115-non-symetric-shapes/mockup-drawings.json`
- Kod: `src/lib/symmetry/template-format.ts:6-15,42`; `src/lib/symmetry/templates.ts:32-62`; `src/hooks/useCardSettings.ts:87,113-123`; `src/components/CategoryChoice.tsx:22,28`; `src/lib/card-summary.ts:33,166`; `src/lib/card-settings.ts:212-213`; `src/lib/copy-drawing/card.ts:59`; `src/lib/dictation/shapes.ts:389`
- Testy: `src/lib/object-categories.test.ts:52-143`; `src/lib/symmetry/templates.test.ts:21,104`; `src/lib/nonogram/generate.test.ts:118-147`
- Issue: drpc1/printo-kids#369 (S-38), drpc1/printo-kids#379 (poza zakresem)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Makieta i pomiar

#### Automated

- [x] 1.1 `check-mockup.mts` kończy się bez błędów, a każdy obiekt ma co najmniej jedną przechodzącą kombinację nonogramu średniego i trudnego. — 0c7f3de
- [x] 1.2 `check-mockup.mts` pokazuje dla każdego kształtu poprawny obrys na każdym narysowanym poziomie. — 0c7f3de
- [x] 1.3 Pomiar zapisany w `mockup-measure.txt`: przechodzące kombinacje i różne obrysy na obiekt i rozmiar. — 0c7f3de

#### Manual

- [x] 1.4 Użytkowniczka akceptuje podglądy PNG: obiekty są czytelne w połowie 4×12, a kategorie każdego obiektu się zgadzają. Data akceptacji trafia do pola `approved` w makiecie. — 0c7f3de

### Phase 2: Kategoria z oknem dat

#### Automated

- [x] 2.1 `npm test` przechodzi, w tym nowe testy okna dat i kolejności paska. — 16b6819
- [x] 2.2 `npm run lint` i `npx astro check` przechodzą. — 16b6819
- [x] 2.3 `npx playwright test tests/e2e/christmas-category.spec.ts` przechodzi na projektach Chromium. — 16b6819
- [x] 2.4 `npm run build` przechodzi. — 16b6819

#### Manual

- [x] 2.5 Na telefonie lista „Kategoria” z ośmioma pozycjami mieści się w całości, a Generuj i Drukuj nie nachodzą na siebie.

### Phase 3: Obiekty z szablonów

#### Automated

- [x] 3.1 `npm test` przechodzi, w tym `templates.test.ts` (kawałek, styk rogiem, kategorie w każdym rozmiarze), testy nonogramu średniego i trudnego (każdy obiekt ma działający wariant) i `object-categories.test.ts` (≥2 karty i obrysy w każdej kategorii). — a0a6702
- [x] 3.2 `npm run lint`, `npx astro check` i `npm run build` przechodzą. — a0a6702

#### Manual

- [x] 3.3 W przeglądarce (z datą w oknie) „Boże Narodzenie” na symetrii, nonogramie, dyktandzie i „Skopiuj obrazek” daje kolejne różne obiekty, a kolory bałwanka i piernika wyglądają jak na makiecie. — a0a6702

### Phase 4: Kształty dyktanda

#### Automated

- [ ] 4.1 `npm test` przechodzi, w tym testy kształtów i obrysów dyktanda.
- [ ] 4.2 `npm run lint`, `npx astro check` i `npm run build` przechodzą.

#### Manual

- [ ] 4.3 W przeglądarce (z datą w oknie) dyktando w „Bożym Narodzeniu” pokazuje skarpetę i pozostałe kształty, także odbite, a polecenia prowadzą po obrysie.

### Phase 5: Domknięcie

#### Automated

- [ ] 5.1 `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check` i `npm run build` przechodzą.
- [ ] 5.2 E2E Chromium (`npx playwright test` z wolnym `E2E_PORT`) przechodzi.

#### Manual

- [ ] 5.3 Na stagingu w oknie dat użytkowniczka drukuje po jednej karcie „Bożego Narodzenia” z każdej z czterech kart, w czerni i w kolorach tam, gdzie karta je ma; obiekty są czytelne na papierze.
- [ ] 5.4 Wydanie `main` → `prod` przed 1.12.2026 według `.github/PULL_REQUEST_TEMPLATE/release.md`.
