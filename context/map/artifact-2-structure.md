# Struktura zależności, 2 listopada 2026

Odczyt grafu importów wobec obszarów z [artifact-1-territory.md](artifact-1-territory.md). Nie jest to lista całego repozytorium. Rysunek jednego wycinka, „kto zależy od `src/lib/sheet`”, leży obok: [kto-zalezy-od-sheet.svg](kto-zalezy-od-sheet.svg).

Konfiguracja: `.dependency-cruiser.cjs`, `tsPreCompilationDeps: true`, reguła `no-circular` jako ostrzeżenie. Zakres skryptów npm `depcruise` / `depcruise:text` / `depcruise:focus` to `src` i `tests`.

## Komendy

| Bieg | Wynik |
| --- | --- |
| `npx dependency-cruiser src tests --output-type err` | `no dependency violations found (188 modules, 612 dependencies cruised)` |
| ten sam zakres, JSON, przejście grafu lokalnych krawędzi | 0 cykli; 54 krawędzie `type-only`; 387 lokalnych importów runtime |
| `npx dependency-cruiser scripts --output-type json` | 67 modułów, 140 zależności, 0 cykli; jedno ostrzeżenie `no-orphans` na `scripts/smoke.mjs` |
| `npx dependency-cruiser src --focus "^src/lib/sheet/" --focus-depth 1 --include-only "^src/" --exclude "\.test\." --output-type dot` | sąsiedztwo arkusza; SVG przez `@hpcc-js/wasm-graphviz` w katalogu tymczasowym poza repo |

W rozwiązanych ścieżkach `src` + `tests` jest 0 plików `.astro` i 0 modułów `src/pages`. Czternaście trafień `dist` to wejścia paczek w `node_modules` (`lucide-react`, `radix-ui`, `class-variance-authority`, `tailwind-merge`), nie katalog builda projektu.

## Cykle

W `src` i `tests` nie ma pętli. Reguła `no-circular` milczy, a na każdej krawędzi `circular` jest fałszem. To samo dla samych importów typów i dla samych importów runtime: graf z oboma rodzajami krawędzi ma 0 cykli, więc żaden podzbiór też jej nie domyka. Najmniejszej pętli nie ma.

Osobny bieg `scripts/` też ma 0 cykli. `smoke.mjs` jest sierotą, bo nikt go nie importuje: to wejście skryptu, nie pętla.

Pliki z góry mapy terytorium są w grafie `src`/`tests` i też się nie zapętlają: `WorksheetGenerator.tsx`, `ProfileCorner.tsx`, `child-profiles.ts`, `src/lib/sheet/layout.ts`, `cards.ts`, `SymmetryGenerator.tsx`, `SudokuGenerator.tsx`, `CardPage.tsx`, `character.ts`. Strzałki par współzmian idą w jedną stronę. Generator labiryntu importuje `layout.ts`, `walls.ts` i `useChildProfileVisit.ts`. Te moduły nie importują generatora z powrotem.

## Granice

| Granica | Wynik | Dowód |
| --- | --- | --- |
| Reguły karty zostają w `src/lib/{maze,sudoku,dictation,sequence,nonogram,symmetry,money}` | Sześć kart tak. Labirynt trzyma generowanie i poziomy w `src/lib/maze`, a milimetry i ściany w arkuszu. | 40 krawędzi `components` → moduł karty, zero krawędzi z modułu karty do `components` / `hooks` / `pages`. `src/lib/maze` w grafie: `generate.ts`, `levels.ts`, `generate.test.ts`. `WorksheetGenerator.tsx` → `maze/generate.ts`, `maze/levels.ts`, `sheet/layout.ts`, `sheet/walls.ts`. W komponentach `layout.ts` i `walls.ts` mają jednego klienta. |
| Powłoka nie importuje reguł konkretnej karty | Trzyma się. | Zero krawędzi z `CardPage.tsx`, `useCardPage.ts`, `GenerateButton.tsx`, `ProfileCorner.tsx`, `CatalogProfileCorner.tsx` i hooków paska do katalogów kart. `CardPage.tsx` importuje siedem generatorów w drugą stronę. `GenerateButton.tsx` → `ui/button.tsx`, `utils.ts`. |
| `src/lib/sheet` jest używany przez karty, karty nie wchodzą do arkusza z powrotem | W kodzie produkcyjnym tak. W testach arkusza jest krawędź runtime w drugą stronę. | Do `sheet` wchodzi 15 importów runtime z komponentów i 6 z modułów kart, głównie `speech.ts`. `speech.ts` i `layout.ts` nie mają lokalnych importów. Odwrotnie, runtime, same testy: `layout.test.ts` → `maze/levels.ts`, `walls.test.ts` → `maze/generate.ts`, `speech.test.ts` → `sheet.ts` dyktanda, nonogramu, sekwencji, sudoku i symetrii. |
| `src/pages` to cienkie wejścia | Z grafu TS tego nie widać. Z importów stron wynika, że tak. | W cruiserze `src/pages` ma 0 modułów. Szczegóły w sekcji „Czego graf nie widzi”. |

Zaskoczenie wobec tabeli współzmian w terytorium (tam najsilniejsze pary to druk + labirynt i labirynt + profil):

- `dictation/generate.ts` i `nonogram/generate.ts` w runtime importują `symmetry/templates.ts`. Ten plik ma 20 importerów, w tym `CategoryChoice.tsx`, `card-settings.ts` i `card-summary.ts`.
- `sequence/shapes.ts` w runtime importuje `sudoku/shapes.ts`.
- `money/generate.ts` w runtime importuje `sequence/random.ts`.

`NonogramGenerator.tsx` importuje `SudokuChoice.tsx`, a ta kontrolka nie importuje `src/lib/sudoku`.

Rejestr jako dane, zamierzone, nie złamanie granicy: `card-settings.ts` i `card-summary.ts` w runtime zbierają `levels.ts` każdej karty, `nonogram/sizes.ts` oraz `symmetry/levels.ts` i `symmetry/templates.ts`. `cards.ts` nie ma lokalnych importów. W grafie TS importują go `card-summary.ts` i testy.

## Metryki

Zamknięcie to liczba modułów `src` osiągalnych importem runtime (importy typów pominięte). Żaden test Node nie importuje generatora, `CardPage`, `ProfileCorner` ani `dialog`.

| Moduł | Importy runtime wprost | Zamknięcie runtime | Test, który go importuje |
| --- | ---: | ---: | --- |
| `WorksheetGenerator.tsx` | 15 | 44 | brak |
| `SudokuGenerator.tsx` | 17 | 54 | brak |
| `SymmetryGenerator.tsx` | 15 | 52 | brak |
| `SequenceGenerator.tsx` | 15 | 55 | brak |
| `NonogramGenerator.tsx` | 15 | 56 | brak |
| `DictationGenerator.tsx` | 15 | 53 | brak |
| `MoneyGenerator.tsx` | 11 | 49 | brak |
| `ProfileCorner.tsx` | 12 | 31 | brak |
| `CardPage.tsx` | 5 | 34 | brak |
| `useCardPage.ts` | 3 | 26 | brak |
| `useCardSettings.ts` | 4 | 22 | brak |
| `useChildProfileVisit.ts` | 5 | 22 | brak |
| `child-profiles.ts` | 4 | 21 | `child-profiles.test.ts` |
| `card-settings.ts` | 8 | 16 | `card-settings.test.ts` |
| `catalog-badges.ts` | 5 | 24 | `catalog-badges.test.ts` |
| `own-image-store.ts` | 2 | 19 | `own-image-store.test.ts` |
| `symmetry/generate.ts` | 2 | 9 | `symmetry/generate.test.ts` i inne |
| `dictation/generate.ts` | 3 | 10 | `dictation/generate.test.ts` |
| `nonogram/generate.ts` | 4 | 11 | `nonogram/generate.test.ts` |
| `maze/generate.ts` | 1 | 1 | `maze/generate.test.ts`, `walls.test.ts` |
| `sudoku/generate.ts` | 2 | 2 | `sudoku/generate.test.ts`, `bruteforce.test.ts` |
| `money/generate.ts` | 2 | 2 | `money/generate.test.ts` |
| `sheet/layout.ts`, `speech.ts`, `character.ts`, `cards.ts`, `active-profile.ts` | 0 | 0 | test obok pliku, poza `cards.ts` też przez rejestr |
| `ui/dialog.tsx` | 3 | 3 | brak |
| `utils.ts` | 0 | 0 | brak |

Szesnaście modułów w zamknięciu `card-settings.ts` to pliki poziomów i szablonów kart. Przez ten hub do profilu, `last-used.ts`, `own-image-store.ts` i `catalog-badges.ts` wchodzą reguły kart, choć sam profil ich nie rysuje. `last-used.ts` ma jednego sąsiada: `card-settings.ts`.

`symmetry/templates.ts` ma 20 importerów. `sheet/speech.ts` ma 14 (generatory poza labiryntem i pieniędzmi, `SpeechBand`, `dictation/layout.ts`, testy układów). `sheet/layout.ts` i `sheet/walls.ts` mają po dwóch: `WorksheetGenerator.tsx` i własny test.

Dla zmiany w aktywnym obszarze: reguła karty zostaje przy `node:test` obok `generate.ts`. Montowanie generatora albo rogu profilu ciągnie React, arkusz i rejestr. To jest warstwa Playwrighta (`level-bar.spec.ts`, `card-settings.spec.ts`, `phone-layout.spec.ts`, `profile-summary.spec.ts`, `print-margins.spec.ts`).

## Graf: kto zależy od arkusza

Pełnego `src` nie ma na rysunku. [kto-zalezy-od-sheet.svg](kto-zalezy-od-sheet.svg) bierze sąsiedztwo z komendy `--focus` powyżej i zostawia 14 strzałek wchodzących do `src/lib/sheet`. Moduły o tym samym celu stoją w jednym prostokącie.

- `layout.ts` i `walls.ts`: tylko `WorksheetGenerator`.
- `speech.ts`: jeden prostokąt dla `DictationGenerator`, `NonogramGenerator`, `NonogramSimpleSheet`, `SequenceGenerator`, `SudokuGenerator`, `SymmetryGenerator` i `dictation/layout.ts`. Osobno `SpeechBand` (także `character.ts`).
- `own-image.ts`: tylko `ProfileCorner`.
- `character.ts` i `own-image-store.ts`: profil, hooki paska, `catalog-badges`, `WorksheetGenerator`. `CardPage` i `CharacterChoiceControl` wchodzą do `character.ts` tylko typem.

## Importy samych typów

Nie liczą się jako złamanie granicy ani jako moduł w zamknięciu runtime. W biegu `src` + `tests` jest ich 54.

Przez granicę karty albo arkusza:

- `src/lib/sheet/walls.ts` → `src/lib/maze/generate.ts`
- `src/lib/dictation/levels.ts` → `src/lib/symmetry/levels.ts`
- `src/lib/nonogram/sizes.ts` → `src/lib/symmetry/levels.ts`
- `src/lib/dictation/outline.ts` → `src/lib/symmetry/templates.ts`
- `src/lib/nonogram/clues.ts` i `simple.ts` → `src/lib/symmetry/templates.ts`
- `CardPage.tsx` → `useChildProfileVisit.ts`, `card-settings.ts`, `child-profiles.ts`, `sheet/character.ts`
- `ProfileCorner.tsx` i `useChildProfileVisit.ts` → `card-settings.ts`
- każdy generator → `card-settings.ts`
- `CharacterChoiceControl.tsx` → `sheet/character.ts`
- `SudokuSymbolsChoice.tsx` → `sudoku/levels.ts`
- `NonogramGenerator.tsx` i `NonogramSimpleSheet.tsx` → `nonogram/simple.ts`

## Czego graf statyczny nie widzi

- `localStorage` nie jest importem. Wołają go wprost `ProfileCorner.tsx`, `WorksheetGenerator.tsx`, `useCardSettings.ts`, `useChildProfileVisit.ts`, `useFavoriteCharacter.ts` i `useBarCharacter.ts`. Funkcje biblioteki biorą magazyn jako argument (`readChildProfiles(localStorage, …)`), więc sam graf tego nie pokazuje.
- Pliki `.astro` wypadają z rozwiązywania (rozszerzenia cruiser to `.ts`, `.tsx`, `.d.ts`). `GeneratorShell.astro` importuje tylko `SiteFooter.astro`. Strona karty ma 11–14 linii: `GeneratorShell`, jeden generator, `Layout` i tytuł z `cards.ts`. `index.astro` składa katalog. `how-it-works.astro` woła `cardsInCatalogOrder()`. Żadna strona nie importuje `generate`, `layout` ani `sheet`. `CardCatalog.astro` importuje `cards.ts` i w skrypcie `catalog-badges.ts`.
- `print-contract.test.ts` (31 commitów, 14 obszarów w terytorium) importuje tylko `node:assert`, `node:fs`, `node:path` i `node:url`. Czyta źródła z dysku. Zmiana ścieżki nie jest krawędzią w grafie.
- `global.css` (wygląd, 17 commitów) nie jest modułem tego biegu. `scripts/build-thumbnails.mjs` i `scripts/smoke.mjs` wchodzą dopiero do osobnego biegu `scripts`.
- Specy Playwright są w cruiserze jako pliki, a nie importują komponentów. Pokrycie UI labiryntu siedzi w specach o innych nazwach (`seed`, `level-bar`, `card-settings`, `phone-layout`, `print-margins`, `catalog`), nie w krawędzi do `WorksheetGenerator.tsx`.
- Brak `maze/sheet.ts` i `maze/layout.ts` widać jako lukę w liście modułów. Treści SVG w `WorksheetGenerator.tsx` cruiser nie czyta.
