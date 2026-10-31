# Lista poziomów labiryntu mieści się na iPhone 13 — Plan Brief

> Full plan: `context/changes/gh209-maze-level-list-iphone-overflow/plan.md`

## What & Why

`e2e-phone` (WebKit, iPhone 13) pada, bo dialog listy poziomów labiryntu ma 18 px przepełnienia. Wiersze mają od US-22 trzy linie i sześć wierszy już się nie mieści. Zmniejszamy pionowy padding wierszy trzyliniowych na telefonie.

## Starting Point

`levelRowClass` (`LevelRow.tsx`) układa wiersz z opisem w kolumnie; padding `py-2.5` pochodzi z `DIALOG_ROW_CLASS`. Wiersz ma ≈ 88 px, lista ≈ 568 px, dialog na iPhone 13 daje ≈ 550 px.

## Desired End State

Sześć wierszy bez przewijania na iPhone 13, każdy ≥ 44 px, nadal trzy linie. `e2e-phone` zielony.

## Key Decisions Made

| Decision        | Choice                                         | Why                                   | Source |
| --------------- | ---------------------------------------------- | ------------------------------------- | ------ |
| Sposób poprawki | Ciaśniejszy padding wierszy trzyliniowych      | Zachowuje US-22 i test                | Plan   |
| Miejsce zmiany  | `levelRowClass`, nie `DIALOG_ROW_CLASS`        | Nie rusza wierszy bez opisu           | Plan   |
| Test            | Bez zmian                                      | Wymóg „bez przewijania" jest właściwy | Plan   |
| Weryfikacja     | Pomiar przed, WebKit lokalnie albo `e2e-phone` | Przyczyna jest dotąd hipotezą z dat   | Plan   |

## Scope

**In scope:** padding w `levelRowClass`, weryfikacja na WebKit.

**Out of scope:** łączenie linii opisu i wieku, zmiana testu, PRD, `DIALOG_ROW_CLASS`.

## Architecture / Approach

Jedna klasa Tailwind w `levelRowClass` (`py-1.5` dla wierszy z opisem), oszczędność ≈ 48 px na liście. Dotyczy też symetrii, sekwencji, dyktanda i sudoku, które dzielą ten helper.

## Phases at a Glance

| Phase                   | What it delivers              | Key risk                                                     |
| ----------------------- | ----------------------------- | ------------------------------------------------------------ |
| 1. Zagęszczenie wierszy | Lista mieści się na iPhone 13 | WebKit może nie startować lokalnie na Windows; weryfikuje CI |

**Prerequisites:** brak.
**Estimated effort:** ~1 sesja, 1 faza.

## Open Risks & Assumptions

- Przyczyna (trzecia linia) to hipoteza z dat; pomiar w fazie 1 ją potwierdza.
- Zapas ≈ 30 px zależy od dokładnej wysokości viewportu WebKit.

## Success Criteria (Summary)

- Test `phone-layout.spec.ts:499` zielony na iPhone 13.
- Inne listy poziomów bez regresji.
