# Wyrównanie przełączników na telefonie — Plan Brief

> Full plan: `context/changes/phone-toggle-margin/plan.md`

## What & Why

Na telefonie przełączniki „Kolory” i „Pokaż rozwiązanie” zaczynają się bliżej lewej krawędzi niż napis w wierszach ustawień nad nimi. Przyciski z chevronem deklarują `px-2`, a renderują inset 12 px (`has-[>svg]:px-3`). Etykieta przełącznika nie ma poziomego wcięcia. Issue #166 prosi, żeby te lewe krawędzie się pokrywały.

## Starting Point

Pięć etykiet (`SudokuGenerator`, `SequenceGenerator`, `SymmetryGenerator`, `NonogramGenerator`, `DictationGenerator`) to `flex items-center gap-2` bez paddingu. Stoją w wierszu `flex-wrap` z `gap-3`, obok przycisków-duchów z chevronem. Pasek widać po wygenerowaniu karty i znika w druku. Testy telefonu sprawdzają, że kontrolki się nie zakrywają.

## Desired End State

Poniżej 640 px lewa krawędź toru pokrywa się z lewą krawędzią napisu w przycisku ustawień z linii powyżej, z tolerancją 1 px. Od 640 px etykieta nie dokłada własnego wcięcia. Przełącznik nadal tylko zmienia kolory albo rozwiązanie.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Zakres | Pięć etykiet: „Kolory” w sudoku, sekwencjach i symetrii oraz „Pokaż rozwiązanie” w nonogramie i dyktandzie | Ta sama etykieta bez wcięcia jest też poza trzema miejscami z issue |
| Kiedy wcięcie | Tylko poniżej `sm`: `max-sm:basis-full` i `max-sm:px-3` | Issue mówi o telefonie. Od 640 px etykieta nie bierze całego wiersza, a odstęp zostaje `gap-3` |
| Która krawędź | Tor z napisem przycisku, nie z pudełkiem przycisku | Chevron zostawia `has-[>svg]:px-3` (12 px); etykieta bez ikony dostaje ten sam inset |
| Weryfikacja | Asercja Playwright na projekcie `phone-360` | Istniejące testy sprawdzają tylko brak nachodzenia |
| Fazy | Najpierw klasa, potem spec | Wcięcie i test, który je utrwala, są osobnymi krokami |

## Scope

**In scope:**

- `max-sm:basis-full` i `max-sm:px-3` na pięciu istniejących etykietach
- Spec `tests/e2e/phone-toggle-align.spec.ts` dla pięciu kart na `phone-360`
- Pominięcie tej asercji na `chromium` i `tablet-768`

**Out of scope:**

- Zdejmowanie `px-2` z przycisków
- Wcięcie od 640 px, w tym tablet i desktop
- Wykrywanie złamania linii w CSS. Poniżej 640 px etykieta i tak bierze cały wiersz
- Nowy komponent, labirynt, druk, asercje na `pixel-7` i `iphone-13`

## Architecture / Approach

Etykiety zostają w generatorach. Poniżej 640 px `max-sm:basis-full` stawia przełącznik na własnej linii, a `max-sm:px-3` daje ten sam inset 12 px co napis przycisku z chevronem. Test mierzy bounding box przełącznika i pierwszego `span` w przycisku z linii powyżej. Poza `phone-360` asercja jest pominięta, bo tam wcięcia nie ma.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Wcięcie poniżej sm | `max-sm:basis-full` i `max-sm:px-3` na pięciu etykietach | Samo `px-3` albo `basis-full` bez progu zmieniłoby też układ od 640 px |
| 2. Asercja na phone-360 | Spec równości krawędzi z tolerancją 1 px | Jeśli `basis-full` nie przeniesie etykiety, spec ma się zatrzymać |

**Prerequisites:** Issue #166, dev server albo preview pod Playwright. Żadna inna zmiana nie jest wymagana.
**Estimated effort:** Jedna krótka sesja, dwie fazy.

## Open Risks & Assumptions

- `max-sm:basis-full` ma postawić każdy z pięciu przełączników na własnej linii poniżej 640 px. Jeśli na `phone-360` któryś zostaje obok przycisku, plan każe się zatrzymać zamiast porównywać sąsiada z boku.
- Poniżej 640 px wcięcie jest zawsze, bo etykieta i tak zajmuje własną linię. To koszt progu zamiast wykrywania zawinięcia.
- `pixel-7` jest węższy niż 640 px, więc klasa tam działa, ale test tego nie sprawdza.

## Success Criteria (Summary)

- Na telefonie tor „Kolory” i „Pokaż rozwiązanie” zaczyna się tam, gdzie napis w wierszu ustawień nad nim.
- Od 640 px przełącznik nie dostaje dodatkowego lewego wcięcia.
- `phone-360` wywraca test, gdy te krawędzie rozjadą się o więcej niż 1 px.
