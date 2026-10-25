---
date: 2026-10-25
researcher: Claude
git_commit: 4e57c1a87cda76c32d57e1ce96460c29b34a0bc6
branch: claude/object-category-choice-90d3b2
repository: printo-kids
topic: "Wybór kategorii obiektów (S-26, US-20, FR-029): gdzie wchodzi filtr i czy każda kategoria zostawia dość obiektów"
tags: [research, symmetry, nonogram, dictation, categories]
status: complete
last_updated: 2026-10-25
last_updated_by: Claude
---

# Research: kategoria obiektów na trzech stronach

## Summary

- Każdy szablon ma `categories` (`src/lib/symmetry/template-format.ts:41`); katalog jest składany w `templates.ts` z pięciu plików `objects/*.ts`, a `symmetryTemplatesFor(levelId)` zwraca listę per poziom symetrii. To jedyny punkt, przez który symetria, nonogram (`nonogram/generate.ts:~37`) i dyktando (`dictation/generate.ts` `catalogFor`) czytają obiekty. Filtr po kategorii jest więc jedną funkcją w `templates.ts`.
- Symetria i nonogram losują z listy na każde Generuj (pętla do `MAX_ATTEMPTS = 20`, potem `null` i komunikat „Nie udało się ułożyć karty.”). Dyktando buduje katalog kart raz na poziom w `Map<DictationLevelId, …>` (`catalogs`); kategoria musi wejść do klucza cache.
- Liczby (zmierzone skryptem jednorazowym na tym commicie; testy nie mają ich pinować): w każdej z 5 kategorii × 4 poziomy symetrii × 3 rozmiary nonogramu × 3 poziomy dyktanda zostaje co najmniej 3 obiekty i co najmniej 8 różnych obrysów dyktanda. Żadna kombinacja nie zostaje z jednym obrysem ani z zerem; **nie ma decyzji dla użytkowniczki**.

## Liczby per kategoria

Symetria: obiekty / warianty (poziomy lat4, lat5=lat6, lat7). Nonogram: obiekty z ≥1 wariantem przechodzącym / warianty przechodzące z wszystkich (mały 8×12, średni 12×15, duży 18×24). Dyktando: obiekty / różne obrysy z wszystkich wariantów (5, 6, 7 lat).

| Kategoria        | Symetria 4 / 5–6 / 7 | Nonogram mały / średni / duży   | Dyktando 5 / 6 / 7 lat          |
| ---------------- | -------------------- | ------------------------------- | ------------------------------- |
| Zwierzęta        | 5/28, 5/36, 5/64     | 5/26 z 28, 5/34 z 36, 4/44 z 64 | 5/14 z 28, 5/16 z 36, 5/16 z 64 |
| Jedzenie         | 5/20, 5/28, 5/40     | 5/20, 5/28, 5/36 z 40           | 5/13 z 20, 5/15 z 28, 5/22 z 40 |
| Przyroda         | 4/20, 4/20, 4/32     | 4/20, 4/17 z 20, 3/24 z 32      | 4/12 z 20, 4/11 z 20, 4/14 z 32 |
| Kosmos i maszyny | 4/28, 4/24, 4/48     | 4/28, 4/24, 4/48                | 4/14 z 28, 4/16 z 24, 4/16 z 48 |
| Domy i budowle   | 4/20, 4/16, 4/32     | 4/20, 4/16, 4/32                | 4/9 z 20, 4/8 z 16, 4/12 z 32   |

Najcieńsze miejsca: Przyroda w dużym nonogramie (3 obiekty, 24 warianty) i Domy i budowle w dyktandzie 6 lat (8 obrysów). Dyktando 6 lat używa szablonów lat6 (te same co lat5 w katalogu), stąd różnica w zbiorze.

## Detailed Findings

### Katalog

- `OBJECT_CATEGORIES` (5 wpisów, id: zwierzeta, jedzenie, przyroda, kosmos, budowle) i `ObjectCategoryId` w `template-format.ts:5-14`. Szablon ma `categories: readonly ObjectCategoryId[]` (≥1), więc szablon może należeć do kilku kategorii.
- `templates.ts`: `symmetryTemplatesFor(levelId)` zwraca stałą tablicę per poziom; kolejność ma rakieta, robot, truskawka na początku.

### Generatory

- Symetria: `generateSymmetryCard(random, previousKey, level)` wybiera szablon z `symmetryTemplatesFor(level.id)`; klucz zawiera przesunięcie wiersza, więc nawet jeden obiekt w kategorii daje wiele kart.
- Nonogram: `generateNonogramCard(random, previousKey, size)` analogicznie z `size.templateLevel`; `nonogramVariants(size)` także czyta `symmetryTemplatesFor`.
- Dyktando: `generateDictationCard(random, previousKey, level)` filtruje `catalogFor(level).cards` po kluczu; `dictationVariantCount(level)` czyta ten sam cache. Zwraca `null`, gdy nie ma innego obrysu (bez pętli).
- Pusty zbiór: filtr dający 0 szablonów w symetrii/nonogramie dałby `pick(random, 0)` = indeks −1 → `undefined` i wyjątek; trzeba pilnować pustej listy (zwrócić `null`).

### UI

- Pasek: `LevelChoice` (generyczny `{id,label}`, przycisk „Poziom: …” + Dialog z wierszami `DIALOG_ROW_CLASS`), użyty w `SymmetryGenerator.tsx:85` i `DictationGenerator.tsx:81`; kontrolki w `flex flex-wrap` w dwóch miejscach (przed i po pierwszym Generuj). Nonogram nie ma jeszcze przycisku rozmiaru (S-24 w osobnej sesji); jego pasek ma tylko przełącznik „Pokaż rozwiązanie”.
- Zmiana poziomu symetrii przy widocznej karcie od razu generuje nową (`handleLevelSelect`); US-20 mówi, że kategoria obowiązuje „przy następnym Generuj”, więc zmiana kategorii nie generuje.
- Przycisk ma etykietę „Poziom:”, `LevelChoice` ma na sztywno „Poziom”/„Wybierz poziom”; do ponownego użycia dla „Kategoria” potrzebny parametr etykiety.
- Szerokość na telefonie: pasek zawija się (`flex-wrap`), więc dodatkowy przycisk (symetria: Poziom, Kategoria, Kolory) zwiększa liczbę wierszy, ale Generuj/Drukuj są w osobnym wierszu poniżej.

## Historical Context

- `context/archive/…template-object-catalog` (S-21) i PRD Open Questions 11 opisują katalog i reguły pomijania wariantów; PRD ma uzupełnić pytanie 11 o liczby per kategoria.
- S-24 (rozmiar nonogramu) i S-25 (poziomy dyktanda) dotykają tych samych plików stron; S-25 jest już w main (zmergowane tutaj), S-24 nie.

## Open Questions

- Brak blokujących. Do planu: nazwa/etykieta kontrolki i kolizja z S-24 w `NonogramGenerator.tsx` (rozwiązać przez sync z main przed PR).
