---
date: 2026-10-25T08:52:50+01:00
researcher: Claude (Opus 5.5) for drpc1
git_commit: ac17473
branch: claude/blissful-mestorf-50b27a
repository: drpc1/printo-kids
topic: "S-22 nonogram-first-printable: co z kodu symetrii nonogram może wziąć i ile dzisiejszych wariantów ma jedno rozwiązanie"
tags: [research, nonogram, symmetry, templates, solver, print]
status: complete
last_updated: 2026-10-25
last_updated_by: Claude (Opus 5.5)
---

# Research: nonogram — pierwsza drukowalna karta (S-22)

**Date**: 2026-10-25T08:52:50+01:00
**Git Commit**: ac17473 (po scaleniu `origin/main` z PRD v4, drpc1/printo-kids#99)
**Branch**: claude/blissful-mestorf-50b27a
**Repository**: drpc1/printo-kids

## Research Question

Jak zbudować stronę „Nonogram” (US-15, FR-024, roadmapa S-22) na wzorcu strony symetrii: skąd wziąć sylwetkę obiektu, jak policzyć liczby i sprawdzić jedno rozwiązanie, które pliki dotyka nowy rodzaj karty, i ile dzisiejszych wariantów 12×15 daje nonogram z dokładnie jednym rozwiązaniem (PRD Open Questions 11).

## Summary

- Sylwetka 12×15 to dokładnie szablon 6×15 z jego odbiciem: `TEMPLATES_6_BY_15` (`src/lib/symmetry/templates.ts:493`) ma trzy szablony o wymiarach 6×15, więc na siatce 12×15 obiekt wypełnia ramkę bez przesunięcia w pionie.
- Dzisiejszy katalog 6×15 daje 20 wariantów: rakieta 2×2×2 = 8, robot 2×2×2 = 8, truskawka 2×2 = 4 (części w `templates.ts:66-183`).
- Sonda solvera (propagacja linii + rozgałęzianie z limitem 2 rozwiązań, uruchomiona poza repo) dała dla każdego z trzech rozmiarów: 8×12 — 20/20 wariantów z jednym rozwiązaniem, 12×15 — 20/20, 18×24 — 40/40 (rakieta 16, robot 16, truskawka 8). Każdy z tych 80 wariantów rozwiązała sama propagacja linii, bez rozgałęzienia; najdłuższy czas na jeden wariant wyniósł 31,6 ms (8×12), czyli dużo poniżej limitu 5 s. Ten sam solver dla 2×2 z liczbami [1],[1] / [1],[1] zwrócił 2 rozwiązania, więc wykrywa niejednoznaczność.
- Dziury w sylwetce zostają puste same z siebie: w szablonie są kratkami „.”, a kolor dziur (`holeColor`, `findHoles` w `src/lib/symmetry/generate.ts:122`) dotyczy tylko kolorowej karty symetrii. Nonogram nie potrzebuje `findHoles`.
- Nowy rodzaj karty dotyka pięciu wspólnych miejsc poza własnym katalogiem `src/lib/nonogram/`: `src/lib/cards.ts`, `scripts/build-thumbnails.mjs` + `public/thumbnails/`, `src/lib/sheet/print-contract.test.ts`, `scripts/smoke.mjs`, skrypt `test` w `package.json`.

## Detailed Findings

### Szablony obiektów

- `SymmetryTemplate` (`templates.ts:19-29`): `width`, `height`, `base`, `parts[].variants[]`, `holeColor`; komórki mają `col`, `row`, `color`. Kolumna `width - 1` dotyka osi.
- Dostęp tylko przez `symmetryTemplatesFor(levelId)` (`templates.ts:502`), kluczowany poziomem symetrii (`lat4` → 4×12, `lat5`/`lat6` → 6×15, `lat7` → 9×24). Nonogram nie ma poziomów wiekiem, więc potrzebuje odwzorowania rozmiaru na poziom symetrii (średni → `lat5`) albo nowego eksportu z `templates.ts`.
- `ROBOT_7` ma `height: 23` (`templates.ts:352-356`), więc na 18×24 jeden wiersz zostaje pusty — liczba 0 przy tym wierszu (PRD: „Pusty wiersz albo kolumna ma liczbę 0”). Dotyczy S-24, nie S-22.
- S-21 (`template-object-catalog`, równoległa sesja) dokłada obiekty do tego samego pliku. Nonogram, który czyta szablony przez `symmetryTemplatesFor`, dostanie nowe obiekty bez zmian, o ile S-21 nie zmieni sygnatury.

### Składanie obrazu

- `composeSymmetryCard` (`generate.ts:77-105`) łączy `base` z wybranymi wariantami części i przesuwa je o `half - template.width` w poziomie i o `rowOffset` w pionie. Dla nonogramu potrzeba tego samego połączenia bez podpowiedzi i przesunięcia, plus odbicia `col → columns - 1 - col` (jak `mirrorAnswer`, `generate.ts:261`).
- Klucz karty (`generate.ts:101`) to `poziom:szablon:warianty:offset`; „inny niż poprzednia karta” sprawdza `card.key !== previousKey` w pętli do `MAX_ATTEMPTS = 20` (`generate.ts:37-58`). Ten sam wzorzec pasuje do nonogramu.

### Strona i druk (wzorzec symetrii)

- `src/pages/symetria.astro`: `Layout` + `GeneratorShell` + wyspa `client:only="react"`. Test kontraktu druku sprawdza ten kształt dla każdej strony (`print-contract.test.ts:110-115`, `136-141`, `174`).
- `SymmetryGenerator.tsx`: `useChildProfileVisit` + `ProfileCorner`, przełączanie klas `#worksheet-home`, dwa układy (przed kartą: przycisk „hero”; po karcie: pasek + Generuj „quiet” + Drukuj), oba kontenery z `print:hidden`, SVG z klasami `print:w-[210mm] print:h-[297mm] ... print:overflow-hidden print:ring-0` i `printColorAdjust: "exact"`.
- `@page` jest tylko w `src/components/GeneratorShell.astro:46` (AGENTS.md i test `print-contract`).
- Układ kartki symetrii: `layoutSymmetrySheet` (`src/lib/symmetry/layout.ts:29`) liczy blok polecenie + siatka, centruje i rzuca błąd, gdy coś przekracza margines 10 mm; stałe rysunku w `src/lib/symmetry/sheet.ts` (czytane też przez skrypt miniatur).
- Kolory: strona używa tokenów `var(--foreground)` / `var(--card)`; hex dozwolony tylko w miniaturach (`scripts/build-thumbnails.mjs:3`).

### Katalog i miniatury

- `CARD_KINDS` w `src/lib/cards.ts` (cztery rodzaje), renderowane przez `src/components/CardCatalog.astro`.
- `scripts/build-thumbnails.mjs` buduje SVG każdej karty z prawdziwego generatora i layoutu ze stałym ziarnem (`mulberry32`), zapis do `public/thumbnails/<id>.svg`. S-23 (dyktando, równoległa sesja) dotknie tych samych dwóch plików — konflikt scalania do rozwiązania przy drugim PR.

### Wymiary kartki 12×15

- Przy kratce ok. 10 mm (PRD Business Logic „Karta nonogramu”) siatka ma 120×150 mm. Najdłuższe liczby w 20 wariantach nie były mierzone w sondzie; teoretyczny górny limit to 6 liczb w wierszu 12 kratek i 8 liczb w kolumnie 15 kratek. Przy ok. 5 mm na liczbę: 30 mm z lewej + 120 mm = 150 mm ≤ 190 mm; 40 mm nad + 150 mm + polecenie ≈ 205 mm ≤ 277 mm. Mieści się z zapasem; dokładny rozmiar cyfr rozstrzyga makieta.

## Code References

- `src/lib/symmetry/templates.ts:19-29` — typ szablonu
- `src/lib/symmetry/templates.ts:66-183` — rakieta, robot, truskawka 6×15 (warianty części)
- `src/lib/symmetry/templates.ts:493-504` — katalogi wg poziomu, `symmetryTemplatesFor`
- `src/lib/symmetry/generate.ts:37-58` — pętla losowania z `previousKey`
- `src/lib/symmetry/generate.ts:77-105` — składanie szablonu i klucz
- `src/lib/symmetry/layout.ts:29-55` — układ kartki z rzucaniem przy przekroczeniu marginesu
- `src/components/SymmetryGenerator.tsx` — wzorzec strony
- `src/lib/sheet/print-contract.test.ts` — kontrakt druku każdej strony
- `scripts/build-thumbnails.mjs`, `scripts/smoke.mjs`, `src/lib/cards.ts` — miejsca rejestracji nowego rodzaju

## Architecture Insights

- Każdy rodzaj karty ma katalog `src/lib/<rodzaj>/` z `generate.ts`, `layout.ts`, `sheet.ts` (stałe dla strony i miniatury) i testami obok, plus komponent `<Rodzaj>Generator.tsx` i stronę `src/pages/<slug>.astro`.
- Poprawność karty to jawna funkcja reguł (`symmetryCardProblems`) zwracająca listę problemów; generator pokazuje tylko kartę z pustą listą. Nonogram: reguła „dokładnie jedno rozwiązanie i jest nim sylwetka”.
- Generowanie działa w przeglądarce, losowość wstrzykiwana (`random: () => number`), co pozwala na deterministyczne testy i miniatury.

## Historical Context (from prior changes)

- Wzorzec strony karty i katalog miniatur ustaliły zmiany symetrii i sekwencji/sudoku (roadmapa, Baseline `context/foundation/roadmap.md:68-77`): poziom/rozmiar żyje w stanie strony, nie w profilu; `npm test` wylicza pliki jawnie.

## Related Research

Nie dotyczy (pierwsza zmiana nonogramu).

## Open Questions

- Makieta: rozmiar cyfr, grubość linii co 5 kratek, ułożenie liczb (prawa krawędź przy wierszach, dół przy kolumnach), polecenie — do uzgodnienia z użytkowniczką przed planem (roadmapa S-22 Unknowns).
- Jak nonogram wybiera katalog szablonów bez poziomu wiekiem: mapowanie rozmiar → poziom symetrii czy nowy eksport z `templates.ts`. Decyzja planu; drugi wariant dotyka pliku, który zmienia S-21.
- Sonda działała na dzisiejszych szablonach; nowe obiekty z S-21 trzeba przepuścić przez solver w testach, a nie zakładać jednoznaczności.
