# Nonogram — pierwsza drukowalna karta (S-22) — Plan Brief

> Full plan: `context/changes/nonogram-first-printable/plan.md`
> Research: `context/changes/nonogram-first-printable/research.md`

## What & Why

Rodzic dostaje nowy rodzaj karty: nonogram 12×15, w którym dziecko zamalowuje kratki według liczb i odkrywa obiekt z katalogu szablonów symetrii. Karta jest nowa przy każdym Generuj i ma jedno rozwiązanie, do którego dziecko dochodzi bez zgadywania (US-15, FR-024, S-22).

## Starting Point

Szablony 6×15 (rakieta, robot, truskawka; 20 wariantów) i wzorzec strony karty istnieją w kodzie symetrii. Sonda z research: każdy z 80 wariantów trzech rozmiarów rozwiązuje sama propagacja linii, najdłużej ok. 32 ms.

## Desired End State

Kafelek „Nonogram” w katalogu prowadzi do `/nonogram`. Generuj pokazuje kartę A4 z kratką 12×15 po 12 mm, pogrubionymi liczbami 6 mm i grubszą linią co 5 kratek. Przełącznik „Pokaż rozwiązanie” zamalowuje sylwetkę tylko na ekranie; wydruk jest zawsze pusty, mieści się na jednej stronie z marginesem 10 mm i działa na telefonie.

## Key Decisions Made

| Decision         | Choice                                                | Why (1 sentence)                                                         | Source   |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ | -------- |
| Kratka 12×15     | 12 mm (PRD miał ok. 10 mm)                            | Lepiej wypełnia stronę i daje dziecku większe pola; PRD do poprawki.     | Plan     |
| Cyfry            | 6 mm, pogrubione                                      | Czytelne dla dziecka; najwięcej 5 liczb przy wierszu, więc się mieszczą. | Plan     |
| Linie            | Grubsza co 5 kratek od lewej i od góry, gruba ramka   | Łatwiej liczyć kratki.                                                   | Plan     |
| Reguła karty     | Jedno rozwiązanie i bez zgadywania (propagacja linii) | Dziecko nigdy nie musi próbować i cofać się; dziś nic nie odpada.        | Plan     |
| Pasek            | Generuj, Drukuj i „Pokaż rozwiązanie”                 | Rozmiary dopiero w S-24; rodzic może sprawdzić dziecko na ekranie.       | Plan     |
| Rozwiązanie      | Tylko na ekranie, `print:hidden`, domyślnie wyłączone | Wydruk bez rozwiązania (US-15) nawet przy włączonym przełączniku.        | Plan     |
| Miniatura        | Pusta karta z liczbami z prawdziwego generatora       | Pokazuje to, co rodzic wydrukuje, jak inne miniatury.                    | Plan     |
| Źródło szablonów | Rozmiar → poziom symetrii (`sredni → lat5`)           | Bez zmian w `templates.ts`, który równolegle zmienia S-21.               | Research |

## Scope

**In scope:** `src/lib/nonogram/` (rozmiary, liczby, solver, generator, układ, stałe), testy na 8×12, 12×15 i 18×24, strona `/nonogram`, kafelek i miniatura, kontrakt druku, smoke, PRD.

**Out of scope:** wybór rozmiaru (S-24), kategorie (S-26), nowe obiekty (S-21), kolory, profil i ostatnie parametry, solver ze zgadywaniem.

## Architecture / Approach

Czysta logika w `src/lib/nonogram/` z wstrzykiwanym `random`: obraz = szablon + odbicie, liczby z obrazu, propagacja linii do punktu stałego; karta przechodzi, gdy wszystkie kratki są wyznaczone i równe sylwetce. `NonogramGenerator.tsx` powtarza przepływ `SymmetryGenerator` i rysuje SVG z `layoutNonogramSheet`, który rzuca przy przekroczeniu marginesu.

## Phases at a Glance

| Phase               | What it delivers                                            | Key risk                                                   |
| ------------------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| 1. Logika nonogramu | Rozmiary, liczby, solver, generator, testy trzech rozmiarów | Nowe obiekty z S-21 mogą nie przejść reguły bez zgadywania |
| 2. Układ kartki     | Pozycje liczb i kratki w marginesie 10 mm                   | Rozmiar duży (7 mm) z cyframi 5 mm jest ciasny             |
| 3. Strona i katalog | `/nonogram`, kafelek, miniatura, kontrakt druku, smoke      | Konflikt scalania z S-23 w `cards.ts` i skrypcie miniatur  |
| 4. Dokumentacja     | PRD zgodny z decyzjami, Open Questions 11                   | —                                                          |

**Prerequisites:** gałąź zsynchronizowana z `main` (PRD v4, drpc1/printo-kids#99) — zrobione.
**Estimated effort:** ~1 sesja, 4 fazy.

## Open Risks & Assumptions

- S-21 i S-23 dotykają `templates.ts`, `cards.ts` i `scripts/build-thumbnails.mjs`; drugi PR rozwiązuje konflikt.
- Wartości 12 mm i 6 mm potwierdza wydruk (PRD Open Questions 11).

## Success Criteria (Summary)

- Rodzic generuje, podgląda i drukuje nonogram 12×15 na jednej stronie A4, także z telefonu, bez rozwiązania na kartce.
- Każda pokazana karta ma jedno rozwiązanie bez zgadywania i jest nim sylwetka obiektu.
- `npm run lint`, `npm test`, `npx astro check`, `npm run build` przechodzą.
