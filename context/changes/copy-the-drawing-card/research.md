---
date: 2026-11-09T13:07:05+01:00
researcher: Claude (sesja S-35)
git_commit: 5cfc7b6
branch: claude/s35-skopiuj-rysunek-4141aa
repository: drpc1/printo-kids
topic: "Jak dołożyć kartę „Skopiuj rysunek na kratce” (S-35) na wzorcu istniejących kart"
tags: [research, card-kinds, copy-the-drawing, nonogram, symmetry-templates, card-contract]
status: complete
last_updated: 2026-11-09
last_updated_by: Claude (sesja S-35)
---

# Research: karta „Skopiuj rysunek na kratce” (S-35)

## Research Question

Co trzeba dotknąć, żeby dodać kolejny rodzaj karty „Skopiuj rysunek na kratce” (US-27, US-28, FR-037, FR-038), co można wziąć z nonogramu i katalogu szablonów oraz co zostaje do rozstrzygnięcia makietą (PRD Open Questions 13).

## Summary

- **Sylwetka jest gotowa do użycia.** `nonogramImage(template, variants, size)` (`src/lib/nonogram/clues.ts:16-44`) zwraca `boolean[][]` całej sylwetki (połowa + odbicie, dziury zostają `false`, kolory pomijane). Wystarczy to do lewej kratki. Dobór obiektu i wariantów: `symmetryTemplatesFor(templateLevel, category)` (`src/lib/symmetry/templates.ts:53`) i wzorzec losowania `generateNonogramCard` (`src/lib/nonogram/generate.ts:38-64`).
- **Rozmiary** łatwy 8×12, średni 12×15, trudny 18×24 są w `NONOGRAM_SIZES` (`src/lib/nonogram/sizes.ts:32-68`) i mapują się na `templateLevel` `lat4`/`lat5`/`lat7`. Nonogramowe `cellSize` (14/12/7 mm) nie pasują do tej karty: potrzebna jest osobna kratka na poziom (PRD: ok. 10/7/5 mm).
- **Brak układu dwóch siatek.** Żaden layout w repo nie rozmieszcza dwóch siatek; trzeba dopisać `layoutCopyDrawingSheet` w stylu `layoutSimpleNonogramSheet` (`src/lib/nonogram/layout.ts:133-150`), rzucający błąd przy przekroczeniu marginesu 10 mm. Pomocnik `fitCellSize` (`src/lib/sheet/speech.ts:120`) liczy największą kratkę mieszczącą się pionowo, a polecenie z postacią zajmuje 26 mm (`speech.ts:8`).
- **Rysunek przyklejony do góry.** `nonogramImage` zaczyna od górnego wiersza, bez centrowania pionowego (`clues.ts:37`), więc dolne wiersze siatki zostają puste. Dla kopiowania to nie przeszkadza, ale makieta powinna to pokazać.
- **Rejestracja karty** wymaga wpisów w tych samych miejscach co przy „Który nie pasuje” (id `niepasuje`; commity 2b567ad, b2b6cc9, 2ecdfe2). Lista niżej.

## Detailed Findings

### Katalog szablonów i bitmapa (reużycie)

- Typy i kategorie: `src/lib/symmetry/template-format.ts:6-46` (6 kategorii, `SymmetryTemplate`, trzy rozmiary połowy 4×12, 6×15, 9×24).
- Wybór: `OBJECT_CATEGORY_CHOICES` (`templates.ts:45`), domyślna „wszystkie” (`:50`); pusta kategoria daje `[]`.
- Klucz karty nonogramu: `${size.id}:${template.id}:${variants.join("-")}` (`generate.ts:81`). Kategoria nie jest w karcie, jest w `contentKey` (`nonogram/engine.ts:101`: `level|category`).
- Gotowy wzorzec bez klasycznych wskazówek: `src/lib/nonogram/simple.ts` (karta łatwa), z `problems` w `:86`.
- Uwaga: następna karta może różnić się tylko wariantem tego samego szablonu (klucz zawiera warianty). Zgodne z PRD US-27 „inny obiekt albo inny wariant”.

### Kontrakt i silniki

- `CardSpec` (`problems`, `keyOf`, `contentKey`, `knownBad`), `CardExhausted`, `CardInvariantError`, `VerifiedCard.require/check`: `src/lib/card-contract.ts:9-100`.
- `CARD_ENGINES ... satisfies` i `kindsAndSettingsAgree`: `src/lib/card-engines.ts:34-46` – brak wpisu to błąd kompilacji.
- `nonogramEngine.generate` zamienia `null` z generatora na `CardExhausted` (`nonogram/engine.ts:111-115`); `symmetry/engine.ts:81-90` robi to wcześniej przy pustej kategorii.
- Zmiana poziomu/kategorii układa nową kartę przez `applySettings` gdy zmienia się `contentKey` (`src/lib/sheet-state.ts:61-74`), a komunikat wyczerpania daje `failureReason` (`:101-111`).

### Strona i komponent

- Wzór: `NonogramGenerator.tsx` na `useCardPage` + `useCardSettings("nonogram", …)` (`:40-46`), `CardPage` (`CardPage.tsx:24`), `SudokuChoice` jako wybór poziomu, `CategoryChoice`, `CharacterInstruction`. Strona `src/pages/<href>.astro` = `GeneratorShell` + `client:only="react"`.
- Arkusz SVG viewBox 210×297 z klasami druku (`NonogramSimpleSheet.tsx:54-63`). Dla nowej karty lewa siatka z sylwetką ma się drukować (nie jest „rozwiązaniem” `print:hidden`), prawa pusta. Karta nie ma „Pokaż rozwiązanie” (US-27: odpowiedź to te same kratki, aplikacja nie ocenia).

### Lista wpisów dla nowej karty (z footprintu „Który nie pasuje”)

- `src/lib/cards.ts` (`CARD_KINDS`, miniatura, opis), `src/lib/card-settings.ts` (interfejs, `CardSettingsMap`, `CARD_SETTINGS_IDS`, `DEFAULTS`, `levelIds`), `src/lib/card-engines.ts` (`CardTypeMap`, `CARD_ENGINES`), `src/lib/card-summary.ts` (`summaryParts`).
- Testy unit: `card-engines.test.ts` (INVENTORY), `card-settings.test.ts`, `card-summary.test.ts` (+ `SAVED_SETTINGS`), `sheet/print-contract.test.ts` (stałe, 3 testy, 3 listy generatorów), nowe pliki w skrypcie `test` w `package.json` (pilnuje `test-script.test.ts`).
- `.dependency-cruiser.cjs:139` (regex `…/generate[.]ts`), `scripts/build-thumbnails.mjs` + `public/thumbnails/<id>.svg`.
- E2E: `card-settings.spec.ts`, `character-speaks.spec.ts`, `phone-layout.spec.ts`, `phone-settings-rows.spec.ts`, `phone-toggle-align.spec.ts`, `profile-summary.spec.ts` oraz własne `*.spec.ts` i `*-reprint.spec.ts`.
- Sterowane danymi (bez wpisów): `last-used.ts`, `child-profiles.ts`, `catalog-badges.ts`, `CardCatalog.astro`, `scripts/smoke.mjs`, `catalog.spec.ts`, `how-it-works.spec.ts`, strona „Jak to działa” (opis z `CARD_KINDS`). Regex href w `how-it-works.spec.ts` już dopuszcza myślniki.
- Docs: `prd.md` (jeśli makieta zmieni US-27/28, Business Logic, Open Questions 13), `roadmap.md` (status).

## Architecture Insights

- Karta = `levels.ts` + `generate.ts` (zwraca `null` przy wyczerpaniu, ≤ 20 prób) + `engine.ts` (spec) + `layout.ts` + `sheet.ts` (stałe mm wspólne ze skryptem miniatur) + komponent SVG + strona.
- Ustawienia karty: poziom i kategoria; nie ma kolorów ani „Pokaż rozwiązanie”. `contentKey` = `level|category`.
- Miniatura budowana z prawdziwego generatora i stałych `sheet.ts`.

## Historical Context (from prior changes)

- `context/archive/2026-11-08-odd-one-out-card/` – plan, przeglądy, makiety `.mts`/SVG; wzorzec procesu (makieta przed planem).
- `lessons.md`: wysokość druku mierzyć osobno w Safari, Chrome iOS i Brave iOS.
- Roadmapa S-35 ryzyko: nie przestawiać obiektów katalogu współdzielonego z symetrią, nonogramem i dyktandem.

## Related Research

- `context/archive/2026-11-08-odd-one-out-card/research.md`.

## Open Questions

1. (PRD OQ 13) Układ: obok siebie czy jedna nad drugą, oraz czy trudny mieści się z kratką 5 mm. Szkic arytmetyczny (do potwierdzenia makietą, nie pomiarem): obok siebie przy szerokości użytecznej 190 mm trudny 2×18×5 mm = 180 mm + odstęp 10 mm mieści się dokładnie; jedna nad drugą trudny 2×24×5 mm = 240 mm + polecenie 26 mm = 266 mm z 277 mm, czyli zostaje ok. 11 mm na wszystkie odstępy; oba układy mieszczą 5 mm ledwo.
2. Numery wierszy i kolumn na kratkach (OQ 13).
3. Pionowe wyrównanie sylwetki w siatce (przyklejona do góry vs wyśrodkowana) – obecnie góra.
