# Auto i autobus w katalogu symetrii — Plan Brief

> Full plan: `context/changes/gh118-car-bus/plan.md`

## What & Why

Dodajemy auto i autobus do katalogu obiektów symetrii (GH #118). Rodzic dostaje więcej różnych obiektów, w tym pojazdy, a nonogram i dyktando biorą je z tego samego katalogu.

## Starting Point

Kategoria „Kosmos i maszyny” ma rakietę, robota, balon i UFO, każdy w trzech rozmiarach połowy (4×12, 6×15, 9×24) w `kosmos.ts`. Pojazdu drogowego nie ma.

## Desired End State

Generuj na karcie symetrii, nonogramie i dyktandzie potrafi wylosować auto i autobus, w każdym poziomie, z losowanymi częściami (okna, dach). Testy katalogu przechodzą, a pojazdy są czytelne na podglądzie.

## Key Decisions Made

| Decision  | Choice                                           | Why (1 sentence)                                                                             |
| --------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Kategoria | „Kosmos i maszyny”                               | Zmiana tylko w danych; nowa kategoria wymagałaby jeszcze dwóch pojazdów i zmian w profilach. |
| Widok     | Z boku, stylizowany symetrycznie (kabina na osi) | Użytkownik chce widok z boku; jednakowe końce dają symetrię lewo–prawo.                      |
| Zakres    | Tylko auto i autobus                             | Tyle wskazuje issue.                                                                         |

## Scope

**In scope:** szablony `auto` i `autobus` w trzech rozmiarach, test obecności, uzupełnienie PRD.

**Out of scope:** nowa kategoria „Pojazdy”, widok z przodu i z góry, zmiany w generatorze i profilach, inne pojazdy.

## Architecture / Approach

Nowe szablony w `kosmos.ts` w formacie `SymmetryTemplate`, dopisane do `half4/half6/half9`. Rysunek: kabina na osi, nadwozie na szerokość połowy, koło w połowie. Istniejące testy katalogu, nonogramu i dyktanda obejmują je automatycznie.

## Phases at a Glance

| Phase                       | What it delivers                      | Key risk                                          |
| --------------------------- | ------------------------------------- | ------------------------------------------------- |
| 1. Szablony auta i autobusu | Dwa obiekty w trzech rozmiarach       | Czytelność w połowie 4×12                         |
| 2. Testy, nonogram, PRD     | Test obecności, weryfikacja kart, PRD | Nonogram i dyktando mogą odrzucić część wariantów |

**Prerequisites:** brak.
**Estimated effort:** ~1–2 sesje, 2 fazy.

## Open Risks & Assumptions

- Widok z boku jest niski i szeroki, a PRD wymaga obiektów „pionowych”; to wyjątek, zapisany w PRD w fazie 2.
- Jednakowe końce oznaczają brak wyraźnego przodu; ocena wyglądu na podglądzie po fazie 1.

## Success Criteria (Summary)

- Auto i autobus pojawiają się na karcie symetrii, nonogramie i dyktandzie.
- `npm test`, `npm run lint` i `npm run build` przechodzą.
