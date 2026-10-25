# Sudoku: kolory kształtów — Plan Brief

> Full plan: `context/changes/picture-sudoku-colors/plan.md`

## What & Why

Rodzic ma móc włączyć na stronie `/sudoku` kolory kształtów: każdy kształt ma stały kolor kredki na całej planszy, bez liter i legendy, a dziecko dorysowuje brakujący kształt i koloruje go według wzoru. To plasterek S-20 roadmapy M-3 (US-14, FR-023). Domyślnie kształty zostają czarnymi konturami.

## Starting Point

Po S-19 strona ma rozmiary, poziomy i przełącznik Kształty/Cyfry; kształty są rysowane jednym kolorem w jednej grupie SVG. Symetria ma gotowy wzorzec: przełącznik „Kolory”, moduł `colors.ts`, tokeny `--symmetry-*` i test e2e.

## Desired End State

Przełącznik „Kolory” na pasku, tylko przy kształtach (4×4 zawsze, 6×6 i 9×9 w trybie Kształty). Włączenie przemalowuje tę samą planszę, nie generuje nowej. Kolor jest stanem strony, nie zapisuje się w profilu. Karta nadal mieści się na A4 z marginesem 10 mm.

## Key Decisions Made

| Decision    | Choice                                                                                                                                                | Why (1 sentence)                                                                     | Source  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------- |
| Paleta      | Siedem kolorów kredek z symetrii plus fioletowy i brązowy                                                                                             | 9×9 z kształtami potrzebuje dziewięciu kolorów                                       | Roadmap |
| Przypisanie | Serce czerwone, koło niebieskie, trójkąt zielony, kwadrat pomarańczowy, krzyżyk fioletowy, gwiazdka żółta, romb brązowy, księżyc szary, kropla czarna | Proste kształty z 4×4 dostają kolory najłatwiejsze do odróżnienia; zatwierdza wydruk | Plan    |
| Rysowanie   | Wariant wypełniony albo sam kolorowy kontur — wybór użytkowniczki po makiecie w fazie 1                                                               | Blade kolory (żółty, szary) są czytelniejsze jako wypełnienie                        | Plan    |
| Stan koloru | Osobny stan strony `colors`, poza `SudokuSettings`                                                                                                    | Przełączenie nie może generować nowej karty                                          | PRD     |
| Cyfry       | Przełącznik niewidoczny, arkusz rysuje czarne cyfry                                                                                                   | US-14                                                                                | PRD     |
| Zapis       | Brak; stan strony                                                                                                                                     | US-08 odłożone                                                                       | PRD     |
| Tokeny      | `--symmetry-purple` i `--symmetry-brown` obok istniejących                                                                                            | Reguła UI: nowy kolor to nowy token; przemianowanie na neutralne nazwy osobno        | Plan    |

## Scope

**In scope:**

- Przełącznik „Kolory” i rysowanie kolorów w arkuszu
- Moduł `src/lib/sudoku/colors.ts`, dwa tokeny, testy jednostkowe i e2e
- Makiety do wydruku (bramka) i druk w przeglądarkach

**Out of scope:**

- Zapis w profilu, legenda, litery, kolory cyfr
- Zmiana kształtów, poziomów, miniatury katalogu
- Wybór przypisania przez rodzica, przemianowanie tokenów na `--crayon-*`

## Architecture / Approach

Czysty moduł `colors.ts` mapuje kształt na `var(--symmetry-<kolor>)` albo `var(--foreground)`. `SudokuGenerator.tsx` trzyma `colors` jako osobny stan i rysuje każdą ścieżkę własnym kolorem. Makieta w fazie 1 mapuje te same nazwy na literały w statycznym SVG.

## Phases at a Glance

| Phase                    | What it delivers                                              | Key risk                                                    |
| ------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------- |
| 1. Makiety kolorów       | Cztery makiety A4 (9×9 i 4×4, dwa warianty rysowania), bramka | Żółty/szary/brąz nieczytelne albo nieodróżnialne w szarości |
| 2. Logika i tokeny       | `colors.ts`, dwa tokeny, testy                                | Brak                                                        |
| 3. Przełącznik i arkusz  | Przełącznik na pasku, kolorowe kształty                       | Zawijanie paska na telefonie, klasy `print:hidden`          |
| 4. e2e, druk, domknięcie | `sudoku-colors.spec.ts`, druk w przeglądarkach, roadmapa      | Kolory w druku Safari i Brave                               |

**Prerequisites:** S-18 (jest); S-19 jest w PR #90, a ta zmiana startuje z jego gałęzi.
**Estimated effort:** ~2–3 sesje w 4 fazach.

## Open Risks & Assumptions

- Dziewięć kolorów może się mylić (czerwony/pomarańczowy/brąz, szary/czarny); kształty różnią się jednak formą, a faza 1 sprawdza to na papierze.
- Tokeny `--symmetry-*` używane przez sudoku to myląca nazwa; przemianowanie na neutralne `--crayon-*` odłożone.
- Równoległe zmiany w `package.json` i `src/lib/cards.ts`: przy konfliktach zostają oba wpisy.
- Zmiana startuje z gałęzi niescalonego PR #90; po jego scaleniu trzeba zsynchronizować z `main`.

## Success Criteria (Summary)

- Przełącznik „Kolory” działa tylko przy kształtach, jest domyślnie wyłączony i nie zmienia planszy.
- Każdy kształt ma stały kolor; na czarno-białej drukarce kształty dają się odróżnić.
- Druk w kolorze i bez koloru mieści się na jednej stronie A4 z marginesem 10 mm, także z telefonu.
