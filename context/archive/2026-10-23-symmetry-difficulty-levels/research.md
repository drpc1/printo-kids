---
date: 2026-10-23T00:00:00+02:00
researcher: Claude
git_commit: 6ca8031d69061b1e34daf8752788faa35ecffa41
branch: claude/symmetry-difficulty-levels-749f93
repository: printo-kids
topic: "Co S-13 (poziomy symetrii) zmienia w kodzie po S-12"
tags: [research, codebase, symmetry, levels]
status: complete
last_updated: 2026-10-23
last_updated_by: Claude
---

# Research: poziomy karty symetrii (S-13)

## Research Question

Co w kodzie po S-12 jest zaszyte na jedno ustawienie "5 lat" i co trzeba zmienić, żeby cztery poziomy (4, 5, 6, 7 lat) różniły się kratką, siatką, położeniem obiektu i podpowiedzią (PRD US-07, FR-016)?

## Summary

Stałe ustawienie siedzi w jednym miejscu (`SYMMETRY_SETTING`, `src/lib/symmetry/generate.ts:6`) i czytają je cztery miejsca: generator, układ strony, komponent strony i skrypt miniatur. Szablony (6×15, lewa połowa siatki 12×16) mieszczą się w połowie siatki 5, 6 i 7 lat, ale nie w 4 lat (połowa 4×12). Walidator zakłada obiekt dotykający osi i brak komórek po drugiej stronie, więc poziom 7 lat (odsunięcie) i podpowiedź 4 lat łamią dwie istniejące reguły. Układ A4 mieści wszystkie cztery siatki z marginesem 10 mm. Pasek poziomu na stronie symetrii nie istnieje; labirynt ma gotowy wzór (`LevelChoiceControl`).

## Detailed Findings

### Ustawienie i generator

- `SYMMETRY_SETTING = { columns: 12, rows: 16, cellSize: 15, axis: "vertical" }` (`generate.ts:6`); `SymmetryAxis` ma jedyną wartość `"vertical"` (`generate.ts:3`).
- `generateSymmetryCard(random, previousKey)` losuje szablon, warianty części i przesunięcie pionowe; do 20 prób (`generate.ts:34-47`). `symmetryRowOffsets` liczy położenia z `SYMMETRY_SETTING.rows` i rzuca dla szablonu wyższego niż siatka (`generate.ts:51-57`).
- `composeSymmetryCard` wpisuje kolumny/wiersze z `SYMMETRY_SETTING` na sztywno i buduje klucz `szablon:warianty:przesunięcie` (`generate.ts:59-78`). Klucz nie zawiera poziomu: ten sam obraz na dwóch poziomach miałby ten sam klucz.
- `SymmetryCard` ma tylko `cells` (lewa połowa); brak pola na podpowiedzi (`generate.ts:8-16`).

### Walidator i odpowiedź

- `symmetryCardProblems` (`generate.ts:82-129`): komórka poza lewą połową to `outside-pattern-half`; brak komórki w ostatniej kolumnie połowy to `not-touching-axis`; pełna połowa to `no-empty-cell` (liczone z `columns/2 * rows`). Konsekwencje dla S-13: poziom 7 lat ("odsunięty", co najmniej jedna pusta kolumna przy osi) łamie `not-touching-axis`; podpowiedź 4 lat (komórki po prawej) łamie `outside-pattern-half`. Obie reguły muszą znać poziom albo podpowiedzi muszą być osobnym polem.
- `mirrorAnswer` odbija wszystkie `cells` względem osi pionowej (`generate.ts:133-135`); odpowiedź to cała prawa połowa, więc podpowiedzi muszą być podzbiorem tej odpowiedzi i nie całością.

### Szablony

- Trzy szablony (rakieta, robot, truskawka), każdy rysowany jako lewa połowa 6 kolumn × 15 wierszy, kolumna 5 dotyka osi (`templates.ts:166-170`, komentarz przy eksporcie). Poziom 4 lat ma połowę 4×12, więc żaden z nich się nie mieści; decyzja z makiety: osobne, prostsze warianty na 4×12.
- Poziom 6 lat (14×20, połowa 7×20) i 7 lat (18×24, połowa 9×24) mieszczą 6×15 bez skalowania; przy 7 latach 6 kolumn + 1 pusta = 7 ≤ 9.
- Kolor każdej kratki jest już w szablonach (`SymmetryCell.color`); S-15 z tego korzysta, S-13 go nie rusza.

### Układ strony A4

- `layoutSymmetrySheet` przyjmuje `columns`, `rows`, `cellSize` i rzuca, gdy szerokość > 190 mm albo blok (instrukcja 7 + odstęp 6 + wysokość + wysięg osi 4) > 277 mm (`layout.ts:29-45`). Rozmiary czterech poziomów z PRD: 8×12×20 = 160×240 mm, 12×16×15 = 180×240, 14×20×12 = 168×240, 18×24×10 = 180×240; blok = 257 mm, mieści się w 277. Wszystkie cztery przechodzą układ bez zmiany kodu układu; dotyczy to zadanych w PRD wartości.
- `SymmetrySheet` w komponencie i skrypt miniatur liczą `cellSize` z `SYMMETRY_SETTING.cellSize` (`SymmetryGenerator.tsx:~132`, `scripts/build-thumbnails.mjs:~111-114`); oba muszą dostać rozmiar kratki z karty/poziomu.

### Strona i pasek

- Strona symetrii nie ma paska poziomu; `barLevel` to poziom labiryntu, tylko dla okna profilu (`SymmetryGenerator.tsx:25-26`). Labirynt ma `LevelChoiceControl` (przycisk "Poziom: …" w oknie dialogowym z `LevelChoiceRows`, `WorksheetGenerator.tsx:246-283`) — wzór do powtórzenia dla symetrii. Poziom ma żyć tylko w stanie strony (profil w S-14).

### Testy

- `generate.test.ts`: test "is the 5 lat row" (linia 15) przypina ustawienie; testy walidatora budują ręczne karty 12×16; "every template, variant set, and row offset gives a valid card" (linia 159) i "a template as tall as the grid" (linia 187) zakładają jedną siatkę. `print-contract.test.ts:80-103` pilnuje SVG 210×297 mm i braku kontrolek w druku; e2e `phone-layout.spec.ts:95` sprawdza przyciski na telefonie. Nowe pliki testów trzeba dopisać do skryptu `npm test` w `package.json:12`.

## Code References

- `src/lib/symmetry/generate.ts:6` - stałe ustawienie 5 lat
- `src/lib/symmetry/generate.ts:82-129` - reguły walidatora (axis-touching, outside-half)
- `src/lib/symmetry/layout.ts:29-45` - warunek zmieszczenia się w marginesie 10 mm
- `src/lib/symmetry/templates.ts:166-170` - katalog szablonów 6×15
- `src/components/SymmetryGenerator.tsx` - strona, bez paska poziomu
- `src/components/WorksheetGenerator.tsx:246-283` - wzór paska poziomu
- `scripts/build-thumbnails.mjs:11,111-114` - miniatura używa ustawienia stałego

## Architecture Insights

Labirynt trzyma poziomy jako tablicę `LEVELS` z `levelById` (`src/lib/maze/levels.ts`); symetria może powtórzyć wzór (tablica poziomów z siatką, kratką, odsunięciem, liczbą podpowiedzi), zamiast osobnych stałych. Importy w `src/lib/symmetry` są względne z `.ts` (Node strip-types).

## Historical Context (from prior changes)

- `context/archive/2026-10-23-symmetry-first-printable/research.md`, `plan.md`, `reviews/` - geometria A4, druk, testy S-12; walidator i układ z tego slice'a.
- `context/archive/2026-10-11-maze-difficulty-levels/` - wzór poziomów labiryntu.
- Decyzje z makiety 2026-10-23 (zapisane w PRD i roadmapie, commit 6ca8031): oś zawsze pionowa (pozioma wycofana, bo obrócone obiekty leżałyby na boku), poziom 4 lat ma własne prostsze warianty na połowie 4×12, brak ornamentów w S-13 (PRD Open Questions 7 zostaje otwarte).

## Related Research

`context/archive/2026-10-23-symmetry-first-printable/research.md`.

## Open Questions

1. Podpowiedzi: ile kratek na 4 lata i które (najbliższe osi? losowe z odbicia?) oraz gdzie je trzymać (`hints` obok `cells`). Do ustalenia w planie.
2. Skąd miniatura w katalogu bierze poziom (dziś ustawienie stałe)? Rekomendacja: domyślny poziom 5 lat, bez zmiany wyglądu miniatury.
3. Domyślny poziom przy wejściu na stronę (bez profilu): 5 lat, jak w S-12.
