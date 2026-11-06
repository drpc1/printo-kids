# Kto zależy od `src/lib/sheet`

SVG: `context/map/kto-zalezy-od-sheet.svg`. Silnik to `@hpcc-js/wasm-graphviz` (Graphviz w WebAssembly), zainstalowany w katalogu tymczasowym poza repo. Systemowego `dot` nie ma.

Źródło krawędzi: `dependency-cruiser src` z `--focus "^src/lib/sheet/"`, `--focus-depth 1`, `--include-only "^src/"` i bez plików testowych. Na rysunku zostały tylko strzałki wchodzące do `src/lib/sheet`. Połączenia między sąsiadami (generator → `CardPage`, profil → `child-profiles`) są zdjęte. Moduły, które celują w ten sam zestaw plików arkusza, stoją w jednym prostokącie. Linia przerywana to import samego typu.

Poza rysunkiem katalog sam zależy od `last-used.ts` (`own-image-store.ts`) i typem od `maze/generate.ts` (`walls.ts`). Wewnątrz katalogu `own-image-store.ts` importuje `character.ts`.

```mermaid
flowchart LR
  types["tylko typem\nCardPage\nCharacterChoiceControl"] -.-> character["character.ts"]
  onlyCharacter["catalog-badges\nuseFavoriteCharacter\nuseCardSettings"] --> character
  profile["child-profiles\nuseChildProfileVisit\nuseBarCharacter"] --> character
  profile --> store["own-image-store.ts"]
  ProfileCorner --> character
  ProfileCorner --> own["own-image.ts"]
  ProfileCorner --> store
  SpeechBand --> character
  SpeechBand --> speech["speech.ts"]
  cards["tylko speech.ts\nDictation, Nonogram,\nNonogramSimpleSheet,\nSequence, Sudoku,\nSymmetry,\ndictation/layout"] --> speech
  WorksheetGenerator --> character
  WorksheetGenerator --> store
  WorksheetGenerator --> layout["layout.ts"]
  WorksheetGenerator --> walls["walls.ts"]
```
