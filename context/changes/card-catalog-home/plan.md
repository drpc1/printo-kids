# Katalog kart na stronie głównej; labirynt pod /labirynt — Implementation Plan

## Overview

F-03 z roadmapy M-2 (US-05, FR-014). Strona główna `/` staje się katalogiem rodzajów kart z miniaturą labiryntu. Labirynt działa bez zmian pod własnym adresem `/labirynt`, we wspólnej powłoce Astro (nagłówek, link „Wszystkie karty”, reguły ekranu i druku). Wybrany profil dziecka zostaje na urządzeniu między stronami. To fundament pod S-12 (karta symetrii), która dołoży drugą miniaturę i własną stronę w tej samej powłoce.

## Current State Analysis

- `src/pages/index.astro` renderuje `WorksheetHome.astro`, a ten: `<main id="worksheet-home">`, `<h1>`, zdanie „Wygeneruj labirynt i wydrukuj go na kartce A4.” i `WorksheetGenerator` (`client:only="react"`). Ten sam plik niesie `@page` (A4, margines 0) i cały blok `@media screen`/`@media print` na `#worksheet-home` (`src/components/WorksheetHome.astro`).
- `WorksheetGenerator.tsx` przełącza klasy `has-maze`, `justify-start`, `justify-center` na `#worksheet-home` po id (`WorksheetGenerator.tsx:70-78`). Zawiera też `collectWalls` (rysowanie ścian) schowane w komponencie React.
- Aktywny profil **nie jest zapisywany**. `openingVisit` (`src/lib/child-profiles.ts:97`) wybiera go tylko przy dokładnie jednym profilu; przy 2+ ustawia `ask: true` i pyta przy każdym wejściu. Nie ma też drogi z powrotem do „bez profilu”, gdy jest jeden profil (wybrany sam).
- `ProfileCorner` jest `absolute top-4 right-4` (`ProfileCorner.tsx:334`), więc lewy górny róg strony jest wolny na link powrotu.
- Zależności od `/` i od nazw plików: `print-contract.test.ts` czyta `WorksheetHome.astro` i `WorksheetGenerator.tsx`; 9 wywołań `page.goto("/")` w `tests/e2e/*`; `scripts/smoke.mjs` sprawdza `/` po zdaniu o labiryncie; CI (`ci.yml`) czeka na `/` przez `curl`. AGENTS.md mówi „`@page` stays in `src/components/WorksheetHome.astro`”.
- `generateMaze(levelId, random)` przyjmuje funkcję losową, więc da się go wywołać z ustalonym ziarnem (`src/lib/maze/generate.ts:22`).

## Desired End State

- `/` to katalog: nagłówek, jedno zdanie, siatka 2-kolumnowa z jedną kartą „Labirynt” (miniatura + nazwa), link do `/labirynt`. Siatka jest gotowa na 10+ kart.
- `/labirynt` wygląda i działa jak dotychczasowa strona główna (przepływ, poziomy, postać, druk, margines bez zmian), plus link „Wszystkie karty” w lewym górnym rogu (ukryty w druku).
- Profil wybrany na jednej stronie zostaje na drugiej i po ponownym otwarciu aplikacji, dopóki rodzic go nie zmieni; w menu profilu jest wiersz „Bez profilu”.
- Weryfikacja: `npm run lint`, `npm test`, `npx astro check`, `npm run build`, `npm run smoke` zielone; ręczny druk A4 labiryntu i widok telefonu bez regresji.

### Key Discoveries:

- Profil trzeba zapamiętać jawnie, bo przy 2+ profilach nic go dziś nie trzyma (`child-profiles.ts:97-109`).
- Nazwa `worksheet-home` jest związana z klasami przełączanymi z Reacta i z regułami druku; zostaje jako id, żeby nie ruszać generatora i S-12 mogło użyć tej samej powłoki.
- Druk jest chroniony testem kontraktu (`print-contract.test.ts`), który czyta pliki po ścieżkach; przeniesienie `@page` wymaga zmiany stałej ścieżki, nie asercji.
- `generateMaze` jest deterministyczny przy ustalonym generatorze liczb, więc miniatura może pochodzić z prawdziwego generatora.

## What We're NOT Doing

- Nie dzielimy `WorksheetGenerator.tsx` ani nie wynosimy profilu do powłoki; profil zostaje w komponencie generatora (drugi rodzaj dostanie własny).
- Nie dodajemy atrap „wkrótce”, strony symetrii ani żadnej miniatury poza labiryntem (S-12).
- Nie zmieniamy druku, marginesu, poziomów ani kształtu zapisanych profili i ostatnich parametrów (to S-14). Dochodzi tylko jeden nowy klucz w `localStorage` z id aktywnego profilu.
- Nie dodajemy testu miniatur ani wyglądu katalogu poza tym, że `/` i `/labirynt` odpowiadają (zgodnie z `test-plan.md`, sekcja poza zakresem).
- Nie przekierowujemy starych zakładek `/` na `/labirynt` (`/` jest teraz katalogiem z jednym kliknięciem do labiryntu).
- Nie ruszamy pasków „Postać” ani „Poziom” (poziom nastolatka i postać: osobne pytanie PRD).

## Implementation Approach

Trzy fazy, każda kończy się działającą aplikacją. Najpierw pamięć profilu (niezależna od przenosin, małe ryzyko), potem przenosiny labiryntu do powłoki Astro pod `/labirynt` (największe ryzyko: druk), na końcu katalog i miniatura. Przenosiny robimy przez `git mv WorksheetHome.astro GeneratorShell.astro`, żeby historia i testy kontraktu szły za plikiem.

## Phase 1: Aktywny profil zapamiętany na urządzeniu

### Overview

Wybór profilu przeżywa przejście między stronami i ponowne otwarcie. Rodzic może wrócić do „bez profilu”.

### Changes Required:

#### 1. Helper zapisu aktywnego profilu

**File**: `src/lib/active-profile.ts` (nowy), `src/lib/active-profile.test.ts` (nowy)

**Intent**: Odczyt, zapis i czyszczenie id aktywnego profilu w `localStorage`, odporne na zablokowaną pamięć, jak `last-used.ts`.

**Contract**: Klucz `printo-kids:active-profile`. Wartość to id profilu albo stała `"none"` (rodzic jawnie wybrał „bez profilu”). Brak wartości oznacza „nie wybierano”. `readActiveProfile(storage)` zwraca `string | "none" | null`; `writeActiveProfile(storage, idOrNone)` i `clearActiveProfile(storage)` nie rzucają przy błędzie pamięci. Testy: brak wartości, id, `"none"`, zepsuty zapis, zablokowana pamięć.

#### 2. Otwarcie wizyty uwzględnia zapamiętany wybór

**File**: `src/lib/child-profiles.ts`, `src/lib/child-profiles.test.ts`

**Intent**: `openingVisit` dostaje zapamiętany wybór i ma go przed regułą „jeden profil wybiera się sam”.

**Contract**: Nowy trzeci argument `stored: string | null`. Kolejność: (1) `stored` jest id istniejącego profilu → ten profil aktywny, `ask: false`; (2) `stored === "none"` → `activeId: null`, parametry z ostatnio użytych, `ask: false`; (3) w pozostałych przypadkach (brak, id nieistniejącego profilu) zachowanie dzisiejsze. `visitAfterDelete` wywołuje to samo z `stored = null` po usunięciu, a wynik jest potem zapisywany przez wywołującego. Testy: pokrywają każdą gałąź i usunięty profil.

#### 3. Zapis przy zmianach profilu i wiersz „Bez profilu”

**File**: `src/components/WorksheetGenerator.tsx`, `src/components/ProfileCorner.tsx`

**Intent**: Generator zapisuje wybór przy utworzeniu, wybraniu i usunięciu profilu; menu profilu ma wiersz „Bez profilu” (widoczny, gdy jakiś profil jest aktywny), który czyści wybór i wraca do ostatnio użytych parametrów.

**Contract**: `readVisitStart` czyta `readActiveProfile` i przekazuje do `openingVisit`. `handleProfileCreated`/`handleProfileChosen` wołają `writeActiveProfile(id)`; `handleDeleted` zapisuje wynik (`id` albo `"none"`/czyści, gdy nie ma aktywnego). Nowy prop `onClearProfile: () => void` w `ProfileCorner`; handler ustawia `activeId = null`, `character`/`level` z `readLastUsed`, `ask = false`, zapisuje `"none"`. Wiersz używa `DIALOG_ROW_CLASS` (44 px dotyku).

### Success Criteria:

#### Automated Verification:

- Nowe i zmienione testy przechodzą (plik dopisany do skryptu `test` w `package.json`): `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Istniejący e2e profilu przechodzi lokalnie: `npx playwright test profile-level`

#### Manual Verification:

- Utwórz dwa profile, wybierz drugi, odśwież stronę: drugi profil jest aktywny, okno wyboru się nie otwiera.
- „Bez profilu” przy jednym profilu: po odświeżeniu nie wraca sam do profilu.
- Usunięcie aktywnego profilu przy dwóch: pytanie o profil wraca albo wybiera się jedyny pozostały (jak dziś).
- Druk nadal nie wymaga profilu.

**Implementation Note**: Po tej fazie i zielonych testach zatrzymaj się na ręczne potwierdzenie.

---

## Phase 2: Powłoka Astro i labirynt pod /labirynt

### Overview

Labirynt przenosi się pod `/labirynt` do wspólnej powłoki z linkiem „Wszystkie karty”. Druk, `@page` i reguły ekranu przechodzą razem z nim. `/` tymczasowo zostaje bez zmian, żeby ta faza dała się zweryfikować osobno.

### Changes Required:

#### 1. Powłoka zamiast WorksheetHome

**File**: `src/components/WorksheetHome.astro` → `src/components/GeneratorShell.astro` (`git mv`)

**Intent**: Powłoka trzyma `<main id="worksheet-home">`, nagłówek, zdanie, link „Wszystkie karty” i slot na generator; `@page` i reguły ekranu/druku przechodzą bez zmian poza dopisaniem linku do ukrytych w druku.

**Contract**: Props: `description: string`. Slot: generator. Link `<a href="/">Wszystkie karty</a>` w lewym górnym rogu (`absolute top-4 left-4`, obszar dotyku co najmniej 44 px, kolory z tokenów, nie koliduje z rogiem profilu po prawej). Reguła druku `#worksheet-home h1, #worksheet-home p, #worksheet-home button` dostaje `#worksheet-home a`. `@page` pozostaje w tym jednym pliku (reguła z AGENTS.md zmienia się na nową ścieżkę).

#### 2. Strona labiryntu

**File**: `src/pages/labirynt.astro` (nowy)

**Intent**: Layout + `GeneratorShell` ze zdaniem „Wygeneruj labirynt i wydrukuj go na kartce A4.” + `WorksheetGenerator client:only="react"`.

**Contract**: Trasa `/labirynt`, `lang="pl"`, tytuł „PrintoKids”. Zdanie bez zmian względem dziś (smoke sprawdza je na `/labirynt`).

#### 3. Tymczasowa strona główna

**File**: `src/pages/index.astro`

**Intent**: W tej fazie `/` zwraca ten sam labirynt przez powłokę, aby nic nie zostało bez strony; faza 3 zastępuje go katalogiem.

**Contract**: Jak `labirynt.astro`.

#### 4. Testy i narzędzia idą za przenosinami

**File**: `src/lib/sheet/print-contract.test.ts`, `tests/e2e/*.spec.ts`, `scripts/smoke.mjs`, `AGENTS.md`, `context/foundation/test-plan.md`

**Intent**: Stała `WORKSHEET_HOME` wskazuje `GeneratorShell.astro`, asercja ukrywania w druku obejmuje `a`; wszystkie `page.goto("/")` w e2e idą na `/labirynt`; smoke dostaje krok `/labirynt` ze zdaniem o labiryncie; AGENTS.md i `test-plan.md` wskazują nową ścieżkę `@page`.

**Contract**: Asercje kontraktu druku (A4, margines 0, `max-width: 100%`, `max-height: 100vh`, ukrywanie w druku) pozostają, zmienia się tylko ścieżka i lista ukrywanych selektorów.

### Success Criteria:

#### Automated Verification:

- Kontrakt druku i reszta testów przechodzą: `npm test`
- Lint i typy: `npm run lint` i `npx astro check`
- Build przechodzi: `npm run build`
- Smoke przechodzi na `/` i `/labirynt`: `npm run smoke` (przy działającym serwerze)
- E2E telefonu, poziomu i okien przechodzą lokalnie: `npx playwright test`

#### Manual Verification:

- `/labirynt`: generuj, zmień poziom i postać, drukuj; podgląd wydruku to jedna strona A4 z marginesem 10 mm, bez linku „Wszystkie karty”.
- Telefon 375 px: link w lewym górnym rogu nie zasłania profilu ani przycisków Generuj i Drukuj.
- Link „Wszystkie karty” prowadzi do `/`.

**Implementation Note**: Po tej fazie zatrzymaj się na ręczne potwierdzenie druku.

---

## Phase 3: Katalog na / z miniaturą z generatora

### Overview

`/` zostaje katalogiem; miniatura labiryntu powstaje ze skryptu na prawdziwym generatorze.

### Changes Required:

#### 1. Wspólne rysowanie ścian

**File**: `src/lib/sheet/walls.ts` (nowy), `src/components/WorksheetGenerator.tsx`

**Intent**: Przenieś `collectWalls`, `WallSegment` i `mazeCell` do modułu bez Reacta, żeby skrypt i komponent rysowały te same ściany.

**Contract**: `collectWalls(maze, originX, originY, cellSize): WallSegment[]` bez zmiany zachowania; komponent importuje go z `@/lib/sheet/walls`. Testy `generate`/`layout` bez zmian.

#### 2. Skrypt miniatur

**File**: `scripts/build-thumbnails.mjs` (nowy), `package.json`, `public/thumbnails/labirynt.svg` (generowany, zatwierdzony)

**Intent**: Skrypt uruchamia `generateMaze` na poziomie 5 lat ze stałym ziarnem, układa kartkę przez `layoutSheet` i zapisuje statyczny SVG czarnymi liniami na białym tle (bez postaci).

**Contract**: Skrypt `npm run thumbnails` (Node z `--experimental-strip-types`, importy względne z `.ts`). Ziarno stałe w pliku skryptu, więc wynik jest powtarzalny. Plik w `public/` to zasób, nie widok, więc literały kolorów w SVG nie łamią reguł UI. Miniaturę trzeba odświeżyć ręcznie po zmianie układu karty (zapisane jako ryzyko).

#### 3. Strona katalogu

**File**: `src/components/CardCatalog.astro` (nowy), `src/lib/cards.ts` (nowy), `src/pages/index.astro`

**Intent**: Katalog z listy rodzajów kart (dziś jedna pozycja) w siatce 2-kolumnowej od telefonu, z miniaturą, nazwą i linkiem; `index.astro` renderuje go w `Layout`.

**Contract**: `CARD_KINDS: { id, title, href, thumbnail }[]` w `src/lib/cards.ts`; pozycja `labirynt` → `/labirynt`, `/thumbnails/labirynt.svg`. Siatka `grid-cols-2`, każda karta to cały link z minimalnym obszarem dotyku 44 px, `alt` z nazwą. Kolory z tokenów (`card`, `border`, `foreground`), `cn()` do klas. Nagłówek „PrintoKids” i zdanie „Wybierz rodzaj karty i wydrukuj ją na kartce A4.” (smoke sprawdza to zdanie na `/`). Strona nie wczytuje Reacta i nie zawiera profilu.

#### 4. Testy

**File**: `scripts/smoke.mjs`, `tests/e2e/catalog.spec.ts` (nowy), `context/foundation/roadmap.md`

**Intent**: Smoke sprawdza zdanie katalogu na `/` (zamiast starego) i zdanie labiryntu na `/labirynt`. Nowy test e2e: z katalogu klik w kartę Labirynt otwiera `/labirynt`, link „Wszystkie karty” wraca na `/`, a profil wybrany wcześniej zostaje.

**Contract**: Test e2e działa lokalnie (poza bramką CI, jak reszta Playwrighta). Roadmapa: F-03 → `in-progress`/`done` robi `/10x-implement` i `/10x-archive`, nie ten plan.

### Success Criteria:

#### Automated Verification:

- Wszystkie testy: `npm test`
- Lint, typy, build: `npm run lint`, `npx astro check`, `npm run build`
- Smoke na `/` i `/labirynt`: `npm run smoke`
- Nowy e2e: `npx playwright test catalog`
- Miniatura odtwarza się skryptem bez zmian w pliku po drugim uruchomieniu: `npm run thumbnails` i brak diffu

#### Manual Verification:

- `/` na telefonie 375 px: miniatura w 2-kolumnowej siatce, czytelna, bez poziomego przewijania.
- `/` na komputerze: karta nie jest rozciągnięta na całą szerokość.
- Kliknięcie karty otwiera labirynt; profil wybrany na `/labirynt` jest aktywny po powrocie i po ponownym wejściu.
- Labirynt: pełny przepływ i druk A4 bez zmian względem stanu przed F-03.

---

## Testing Strategy

### Unit Tests:

- `active-profile.test.ts`: brak wartości, id, `"none"`, zepsuty zapis, zablokowana pamięć.
- `child-profiles.test.ts`: każda gałąź `openingVisit` ze zapamiętanym wyborem, w tym id nieistniejącego profilu i `"none"` przy jednym profilu.
- `print-contract.test.ts`: te same asercje druku na nowej ścieżce powłoki, plus ukrywanie `a`.

### Integration Tests:

- Smoke: `/` ze zdaniem katalogu, `/labirynt` ze zdaniem labiryntu, trasy kont nadal 404.
- E2E `catalog.spec.ts`: katalog → labirynt → „Wszystkie karty” → katalog z zachowanym profilem.

### Manual Testing Steps:

1. Druk A4 z `/labirynt` na komputerze (Chrome) i na telefonie, jedna strona, margines 10 mm.
2. Dwa profile, wybór, nawigacja katalog ↔ labirynt, odświeżenie.
3. Widok telefonu 375 px na `/` i `/labirynt`.

## Performance Considerations

Katalog jest statyczny i bez Reacta; miniatura to jeden mały SVG. Generowanie labiryntu nie zmienia się (budżet 5 s z PRD).

## Migration Notes

Zapisane profile i ostatnie parametry nie zmieniają kształtu. Nowy klucz `printo-kids:active-profile` jest opcjonalny: jego brak oznacza dzisiejsze zachowanie. Stare zakładki `/` otworzą katalog zamiast labiryntu (jedno dodatkowe kliknięcie).

## References

- Roadmapa: `context/foundation/roadmap.md` (F-03), PRD: US-05, FR-014
- `src/components/WorksheetHome.astro`, `src/components/WorksheetGenerator.tsx:70-78`
- `src/lib/child-profiles.ts:97`, `src/components/ProfileCorner.tsx:334`
- `src/lib/sheet/print-contract.test.ts`, `scripts/smoke.mjs`, `.github/workflows/ci.yml`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Aktywny profil zapamiętany na urządzeniu

#### Automated

- [x] 1.1 Nowe i zmienione testy przechodzą (plik dopisany do skryptu `test` w `package.json`): `npm test` — 5f1adf1
- [x] 1.2 Lint przechodzi: `npm run lint` — 5f1adf1
- [x] 1.3 Typy przechodzą: `npx astro check` — 5f1adf1
- [x] 1.4 Istniejący e2e profilu przechodzi lokalnie: `npx playwright test profile-level` — 5f1adf1

#### Manual

- [x] 1.5 Utwórz dwa profile, wybierz drugi, odśwież stronę: drugi profil jest aktywny, okno wyboru się nie otwiera. — 5f1adf1
- [x] 1.6 „Bez profilu” przy jednym profilu: po odświeżeniu nie wraca sam do profilu. — 5f1adf1
- [x] 1.7 Usunięcie aktywnego profilu przy dwóch: pytanie o profil wraca albo wybiera się jedyny pozostały (jak dziś). — 5f1adf1
- [x] 1.8 Druk nadal nie wymaga profilu. — 5f1adf1

### Phase 2: Powłoka Astro i labirynt pod /labirynt

#### Automated

- [x] 2.1 Kontrakt druku i reszta testów przechodzą: `npm test` — 354799d
- [x] 2.2 Lint i typy: `npm run lint` i `npx astro check` — 354799d
- [x] 2.3 Build przechodzi: `npm run build` — 354799d
- [x] 2.4 Smoke przechodzi na `/` i `/labirynt`: `npm run smoke` (przy działającym serwerze) — 354799d
- [x] 2.5 E2E telefonu, poziomu i okien przechodzą lokalnie: `npx playwright test` — 354799d

#### Manual

- [x] 2.6 `/labirynt`: generuj, zmień poziom i postać, drukuj; podgląd wydruku to jedna strona A4 z marginesem 10 mm, bez linku „Wszystkie karty”. — 354799d
- [x] 2.7 Telefon 375 px: link w lewym górnym rogu nie zasłania profilu ani przycisków Generuj i Drukuj. — 354799d
- [x] 2.8 Link „Wszystkie karty” prowadzi do `/`. — 354799d

### Phase 3: Katalog na / z miniaturą z generatora

#### Automated

- [x] 3.1 Wszystkie testy: `npm test`
- [x] 3.2 Lint, typy, build: `npm run lint`, `npx astro check`, `npm run build`
- [x] 3.3 Smoke na `/` i `/labirynt`: `npm run smoke`
- [x] 3.4 Nowy e2e: `npx playwright test catalog`
- [x] 3.5 Miniatura odtwarza się skryptem bez zmian w pliku po drugim uruchomieniu: `npm run thumbnails` i brak diffu

#### Manual

- [x] 3.6 `/` na telefonie 375 px: miniatura w 2-kolumnowej siatce, czytelna, bez poziomego przewijania.
- [x] 3.7 `/` na komputerze: karta nie jest rozciągnięta na całą szerokość.
- [x] 3.8 Kliknięcie karty otwiera labirynt; profil wybrany na `/labirynt` jest aktywny po powrocie i po ponownym wejściu.
- [x] 3.9 Labirynt: pełny przepływ i druk A4 bez zmian względem stanu przed F-03.
