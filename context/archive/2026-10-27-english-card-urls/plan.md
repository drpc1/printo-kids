# Adresy podstron kart po angielsku — plan implementacji

## Overview

Cztery polskie adresy kart dostają angielskie odpowiedniki, a katalog na `/` linkuje już do nich. Stary adres odpowiada przekierowaniem 301, więc zapisana zakładka otwiera tę samą kartę, a pasek adresu pokazuje nowy URL. Napisy kart, identyfikatory i miniatury zostają po polsku. Źródło: [issue #123](https://github.com/drpc1/printo-kids/issues/123).

## Current State Analysis

- Adres strony jest nazwą pliku w `src/pages/`. Dziś są to `labirynt.astro`, `symetria.astro`, `sekwencje.astro` i `dyktando.astro`. `sudoku.astro` i `nonogram.astro` są już po angielsku.
- Katalog trzyma adres osobno od identyfikatora i miniatury (`src/lib/cards.ts:9-14`). `CardCatalog.astro` używa tylko `href`.
- Identyfikatory `symetria`, `sekwencje` i `dyktando` są kluczami zapisu ustawień (`src/lib/card-settings.ts`). Labirynt nie używa klucza `labirynt`: poziom siedzi w polu `level` profilu i ostatnich parametrów. Zmiana samego `href` nie rusza zapisanych ustawień.
- Miniatury to `public/thumbnails/labirynt.svg` i odpowiedniki; `scripts/build-thumbnails.mjs` pisze te same nazwy.
- Nie ma przekierowań. `astro.config.mjs` ustawia `output: "server"`, adapter Cloudflare i sitemapę, bez klucza `redirects`. `trailingSlash` zostaje przy domyślnym `"ignore"`.
- W Astro 7.3.2 wpis `redirects` jako string daje dla GET status 301, a `Location` jest samą ścieżką docelową, bez query stringa (`node_modules/astro/dist/core/redirects/render.js`, `computeRedirectStatus`). Wzorzec trasy przy `trailingSlash: "ignore"` dopuszcza jeden końcowy slash (`pattern.js`, `/?$`).
- `scripts/smoke.mjs` woła `fetch` z `redirect: "manual"` i wymaga 200 oraz polskiego zdania na starym adresie. Testy e2e i `print-contract.test.ts` wklejają stare ścieżki albo nazwy plików.
- US-05 podaje przykłady `` `/labirynt` `` i `` `/symetria` `` (`context/foundation/prd.md:138`). `AGENTS.md:40` mówi, że labirynt jest pod `/labirynt`.

## Desired End State

- Wejście z katalogu na labirynt, symetrię, sekwencje i dyktando otwiera `/maze`, `/symmetry`, `/sequences` i `/dictation`. Napisy zostają: Labirynt, Symetria, Sekwencje, Dyktando graficzne.
- `/sudoku`, `/nonogram` i katalog na `/` działają jak dziś.
- Wejście na `/labirynt`, `/symetria`, `/sekwencje` albo `/dyktando` (także z jednym slashem na końcu) kończy się tą samą kartą pod angielskim adresem. Odpowiedź GET to 301, a `Location` wskazuje nową ścieżkę.
- Zapisane profile i ostatnie ustawienia wczytują się jak przed zmianą.
- US-05 i `AGENTS.md` podają nowe przykłady. Zamknięte plastry roadmapy i `context/archive/` zostają przy ścieżkach z chwili wdrożenia.

### Key Discoveries:

- Jeden plik strony to jeden adres. Stary plik zostawiony obok przekierowania zderzy się z nową trasą.
- String w `redirects` jest 301 dla GET. Obiekt ze statusem zmieniłby ten kontrakt.
- `redirect: "manual"` w smoke sprawia, że 301 widać jako status, a nie jako 200 po podążeniu.
- Sitemapa idzie z integracji `@astrojs/sitemap`. Stary adres nie może w niej zostać jako strona karty.

## What We're NOT Doing

- Nie zmieniamy `id`, `title` ani `thumbnail` w `CARD_KINDS`, plików SVG ani kluczy w `card-settings`.
- Nie ruszamy `/sudoku`, `/nonogram` ani katalogu na `/`.
- Nie tłumaczymy zdań na kartach ani interfejsu.
- Nie dokładamy do US-05 przykładów sekwencji i dyktanda. To zdanie zostaje przy dwóch przykładach, tylko z nowymi ścieżkami.
- Nie przepisujemy zamkniętych plastrów w `context/foundation/roadmap.md` ani niczego w `context/archive/`.
- Nie zachowujemy query stringa na starym adresie. Strony go nie czytają.
- Nie zmieniamy `trailingSlash` i nie dodajemy osobnej polityki slashy.
- Nie ruszamy S-31 (`favorite-character-explicit`).

## Implementation Approach

Najpierw kanoniczny adres: zmiana nazwy czterech plików stron i `href` w katalogu, razem z testami, które by pękły. Potem cztery wpisy `redirects` i sprawdzenie 301 w smoke, które celowo nie podąża za przekierowaniem. Na końcu dwa żywe dokumenty, które inaczej kazałyby kolejnemu agentowi wrócić do starych ścieżek.

## Critical Implementation Details

- Przekierowanie dodajemy dopiero, gdy nie ma już `labirynt.astro`, `symetria.astro`, `sekwencje.astro` i `dyktando.astro`. Inaczej stary adres jest nadal stroną, a nie 301.
- Wartości w `redirects` zostają stringami. Dla GET Astro odpowiada wtedy 301 i nie dokleja query stringa.
- Przy `trailingSlash: "ignore"` wzorzec `/?$` obejmuje ścieżkę ze slashem i bez. Drugi klucz na wariant ze slashem nie jest potrzebny, dopóki ręczne sprawdzenie `/dyktando/` tego nie obali.

## Phase 1: Angielskie adresy kanoniczne

### Overview

Cztery karty mają angielski adres, katalog do nich linkuje, a testy ścieżek i nazw plików mówią to samo. Stare adresy w tej fazie jeszcze nie przekierowują.

### Changes Required:

#### 1. Strony generatorów

**File**: `src/pages/labirynt.astro`, `src/pages/symetria.astro`, `src/pages/sekwencje.astro`, `src/pages/dyktando.astro`

**Intent**: Adres ma być angielski, bo tak nazywa się plik strony. Treść stron, w tym polskie zdania, zostaje.

**Contract**: Pliki nazywają się `src/pages/maze.astro`, `symmetry.astro`, `sequences.astro` i `dictation.astro`. Starych nazw plików nie ma. `sudoku.astro` i `nonogram.astro` bez zmian.

#### 2. Linki katalogu

**File**: `src/lib/cards.ts`

**Intent**: Kliknięcie miniatury otwiera angielski adres. Identyfikator zostaje kluczem zapisu, a miniatura zostaje przy obecnym pliku.

**Contract**: `href` czterech kart to `/maze`, `/symmetry`, `/sequences`, `/dictation`. `id`, `title` i `thumbnail` bez zmian. `href` sudoku i nonogramu bez zmian.

#### 3. Kontrakt nazw plików

**File**: `src/lib/sheet/print-contract.test.ts`

**Intent**: Test czyta treść strony z dysku. Po zmianie nazwy musi czytać nowy plik i nazywać nowy adres.

**Contract**: Stałe wskazują `src/pages/maze.astro`, `symmetry.astro`, `sequences.astro` i `dictation.astro`. Tytuły testów mówią o `/maze`, `/symmetry`, `/sequences` i `/dictation`. Asercje o `GeneratorShell` zostają.

#### 4. Smoke na nowych adresach

**File**: `scripts/smoke.mjs`

**Intent**: Smoke ma sprawdzać adres, którym wchodzi się z katalogu.

**Contract**: Cztery kroki 200 idą na `/maze`, `/symmetry`, `/sequences` i `/dictation` i nadal wymagają tych samych polskich zdań. Kroki `/`, `/sudoku`, `/nonogram` i 404 dla starych tras konta bez zmian. Sprawdzenia 301 dochodzą w fazie 2.

#### 5. Ścieżki e2e

**File**: `tests/e2e/catalog.spec.ts`, `phone-layout.spec.ts`, `card-settings.spec.ts`, `character-speaks.spec.ts`, `level-bar.spec.ts`, `own-image.spec.ts`, `symmetry-colors.spec.ts`, `dialog-close.spec.ts`, `seed.spec.ts`, `profile-level.spec.ts`

**Intent**: Testy przeglądarki wchodzą tam, gdzie wchodzi katalog.

**Contract**: Wystąpienia `/labirynt`, `/symetria`, `/sekwencje` i `/dyktando` w tych specach to odpowiednio `/maze`, `/symmetry`, `/sequences` i `/dictation`. Identyfikatory kart w asercjach ustawień (`symetria`, `sekwencje`, `dyktando`) zostają. Specy, które tych czterech ścieżek nie zawierają, bez zmian.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, a stałe stron w `src/lib/sheet/print-contract.test.ts` wskazują `src/pages/maze.astro`, `symmetry.astro`, `sequences.astro` i `dictation.astro`
- `npx playwright test --project=chromium` przechodzi na zaktualizowanych ścieżkach e2e

#### Manual Verification:

- Z katalogu `/` cztery karty otwierają `/maze`, `/symmetry`, `/sequences` i `/dictation`, a napisy zostają: Labirynt, Symetria, Sekwencje, Dyktando graficzne
- Z katalogu `/sudoku` i `/nonogram` otwierają się tak jak przed zmianą

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Stare adresy przekierowują

### Overview

Zakładka ze starym adresem otwiera tę samą kartę, a pasek pokazuje angielski URL. Smoke widzi 301, bo nie podąża za przekierowaniem.

### Changes Required:

#### 1. Mapa przekierowań

**File**: `astro.config.mjs`

**Intent**: Stary adres ma jeden kanoniczny cel. String daje 301 dla GET, zgodnie z decyzją z planowania.

**Contract**: `redirects` mapuje dokładnie te cztery pary. Innych wpisów nie dodajemy.

```js
redirects: {
  "/labirynt": "/maze",
  "/symetria": "/symmetry",
  "/sekwencje": "/sequences",
  "/dyktando": "/dictation",
},
```

#### 2. Smoke widzi 301

**File**: `scripts/smoke.mjs`

**Intent**: Regresja, która znowu poda 200 na starym adresie, ma paść w smoke.

**Contract**: Przy `redirect: "manual"` każdy ze starych adresów zwraca status 301, a ścieżka w `Location` to odpowiednio `/maze`, `/symmetry`, `/sequences`, `/dictation`. Nagłówek może być ścieżką albo pełnym URL o tej ścieżce. Cztery nowe adresy nadal zwracają 200 z polskim zdaniem.

#### 3. Sitemapa

**File**: `astro.config.mjs` tylko wtedy, gdy wygenerowana sitemapa zawiera stary adres

**Intent**: Wyszukiwarka nie ma dostawać polskiego adresu jako strony karty.

**Contract**: Po `npm run build` sitemapa nie zawiera `/labirynt`, `/symetria`, `/sekwencje` ani `/dyktando`. Jeśli domyślna integracja ich nie wypisuje, konfiguracji sitemapy nie ruszamy.

### Success Criteria:

#### Automated Verification:

- `npm run smoke` przy działającym serwerze: `/maze`, `/symmetry`, `/sequences` i `/dictation` zwracają 200 z dotychczasowymi polskimi zdaniami, a `/labirynt` → `/maze`, `/symetria` → `/symmetry`, `/sekwencje` → `/sequences` i `/dyktando` → `/dictation` zwracają 301 z tą ścieżką w `Location`

#### Manual Verification:

- Wpisanie `/labirynt` w pasek adresu kończy się kartą labiryntu pod `/maze`
- Wpisanie `/dyktando/` ze slashem na końcu kończy się kartą dyktanda pod `/dictation`
- Wygenerowana sitemapa nie zawiera `/labirynt`, `/symetria`, `/sekwencje` ani `/dyktando`

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Żywe dokumenty

### Overview

Aktualny kontrakt dla agentów podaje angielskie przykłady. Historia wdrożenia zostaje przy starych ścieżkach.

### Changes Required:

#### 1. Przykłady w US-05

**File**: `context/foundation/prd.md`

**Intent**: Kryterium akceptacji nie może wymagać adresów, których katalog już nie używa.

**Contract**: W kryterium US-05 przy linii z własnym adresem rodzaju przykłady to labirynt: `` `/maze` `` i symetria: `` `/symmetry` ``. Reszta tego kryterium i pozostałe historyjki bez zmian.

#### 2. Zdanie o adresie labiryntu

**File**: `AGENTS.md`

**Intent**: Reguła, którą czyta agent, ma wskazywać adres po tej zmianie.

**Contract**: Zdanie o powłoce generatora podaje labirynt pod `` `/maze` ``. Katalog na `/` zostaje w tym zdaniu.

### Success Criteria:

#### Manual Verification:

- Kryterium US-05 wymienia labirynt jako `/maze` i symetrię jako `/symmetry`
- `AGENTS.md` podaje adres labiryntu jako `/maze`
- Zamknięte plastry w `context/foundation/roadmap.md` i foldery w `context/archive/` nadal zapisują stare ścieżki

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- `npm test` obejmuje `print-contract.test.ts`, który po fazie 1 czyta nowe pliki stron.
- Nie dodajemy testu jednostkowego samej mapy `redirects`. Kontrakt HTTP jest w smoke.

### Integration Tests:

- `npx playwright test --project=chromium` łapie ścieżki w specach z fazy 1. Playwright podąża za przekierowaniem, więc 301 sprawdza smoke, nie e2e.
- `npm run smoke` przy `redirect: "manual"` sprawdza 200 na nowych adresach i 301 na starych.

### Manual Testing Steps:

1. Z `/` otworzyć cztery zmienione karty i sprawdzić pasek adresu oraz polski napis.
2. Otworzyć z katalogu sudoku i nonogram.
3. Wpisać `/labirynt` i `/dyktando/` i sprawdzić, że karta jest właściwa, a pasek jest angielski.
4. Po buildzie sprawdzić, że sitemapa nie wymienia czterech starych ścieżek.

## Performance Considerations

Wejście z katalogu nie dostaje dodatkowego hopu. Stara zakładka dostaje jedno przekierowanie 301. Generowanie karty i druk się nie zmieniają.

## Migration Notes

Zapis w przeglądarce zostaje. Nie ma migracji `localStorage` ani profili, bo `id` karty i pole `level` labiryntu się nie zmieniają. Stare zakładki przechodzą przez 301. Query string na starym adresie jest porzucany.

## References

- Issue: https://github.com/drpc1/printo-kids/issues/123
- Katalog: `src/lib/cards.ts:9-14`
- Klucze ustawień: `src/lib/card-settings.ts`
- Status 301 dla stringa w `redirects`: `node_modules/astro/dist/core/redirects/render.js` (`computeRedirectStatus`)
- US-05: `context/foundation/prd.md:138`
- Reguła adresu: `AGENTS.md:40`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Angielskie adresy kanoniczne

#### Automated

- [x] 1.1 `npm test` przechodzi, a stałe stron w `src/lib/sheet/print-contract.test.ts` wskazują `src/pages/maze.astro`, `symmetry.astro`, `sequences.astro` i `dictation.astro` — 8fd3d2b
- [x] 1.2 `npx playwright test --project=chromium` przechodzi na zaktualizowanych ścieżkach e2e — 8fd3d2b

#### Manual

- [x] 1.3 Z katalogu `/` cztery karty otwierają `/maze`, `/symmetry`, `/sequences` i `/dictation`, a napisy zostają: Labirynt, Symetria, Sekwencje, Dyktando graficzne — 8fd3d2b
- [x] 1.4 Z katalogu `/sudoku` i `/nonogram` otwierają się tak jak przed zmianą — 8fd3d2b

### Phase 2: Stare adresy przekierowują

#### Automated

- [x] 2.1 `npm run smoke` przy działającym serwerze: `/maze`, `/symmetry`, `/sequences` i `/dictation` zwracają 200 z dotychczasowymi polskimi zdaniami, a `/labirynt` → `/maze`, `/symetria` → `/symmetry`, `/sekwencje` → `/sequences` i `/dyktando` → `/dictation` zwracają 301 z tą ścieżką w `Location` — 3dcd226

#### Manual

- [x] 2.2 Wpisanie `/labirynt` w pasek adresu kończy się kartą labiryntu pod `/maze` — 3dcd226
- [x] 2.3 Wpisanie `/dyktando/` ze slashem na końcu kończy się kartą dyktanda pod `/dictation` — 3dcd226
- [x] 2.4 Wygenerowana sitemapa nie zawiera `/labirynt`, `/symetria`, `/sekwencje` ani `/dyktando` — 3dcd226

### Phase 3: Żywe dokumenty

#### Manual

- [x] 3.1 Kryterium US-05 wymienia labirynt jako `/maze` i symetrię jako `/symmetry` — 14afdf0
- [x] 3.2 `AGENTS.md` podaje adres labiryntu jako `/maze` — 14afdf0
- [x] 3.3 Zamknięte plastry w `context/foundation/roadmap.md` i foldery w `context/archive/` nadal zapisują stare ścieżki — 14afdf0
