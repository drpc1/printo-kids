# Test plan po M-7 (S-51) — Plan Brief

> Full plan: `context/changes/test-plan-m7/plan.md`

## What & Why

Zaktualizować `context/foundation/test-plan.md` do stanu po M-7, żeby zespół widział, co chroni każda nowa karta i filtr katalogu, i nie czytał nieaktualnych liczb. To ostatni slice kamienia M-7 (S-51) i druga taka aktualizacja po S-46.

## Starting Point

Dokument ma `checked: 2026-11-17` i opisuje 12 kart, 1780 testów, ryzyka 1–16 i fazy 1–11. Kod ma 16 rodzajów kart, 2094 testy, 51 plików e2e, pięć zakresów Strykera dla kart M-7 i „Zimę” obok „Bożego Narodzenia”.

## Desired End State

`test-plan.md` opisuje stan po M-7: ryzyka 17–21 (kodowanie, cienie, „Od najmniejszego”, labirynt liczbowy, filtr umiejętności), fazy 12–16, aktualne liczby, wiersze Strykera z S-50, wzorce w podręczniku i uaktualnione granice w §7. Roadmapa ma S-51 `done`.

## Key Decisions Made

| Decision          | Choice                                           | Why (1 sentence)                                                       |
| ----------------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| Droga             | Edycja dokumentu bez `/10x-test-plan`            | Struktura §1–§7 jest aktualna, zmienia się zawartość (jak w S-46).     |
| Pytania           | 0 merytorycznych                                 | Zakres wynika z roadmapy, PRD i archiwum; zatwierdzono tylko strukturę. |
| Numeracja ryzyk   | Dalej od 17, ten sam układ kolumn                | Zachowuje spójność z ryzykami 10–16.                                   |
| Liczby            | Z kodu i `npm test` z 2026-11-28                 | Żadna liczba bez źródła w kodzie, teście albo archiwum.               |
| Stryker           | Tylko wyniki z S-50, bez nowych przebiegów       | S-50 jest zamknięte, a przebiegi trwają godzinami.                     |

## Scope

**In scope:** nowe ryzyka i fazy (§2, §3), liczby i fakty (§4, §5), tabela i akapit Strykera (§5a), wzorce (§6), granice (§7), frontmatter, roadmapa S-51.

**Out of scope:** zmiany w kodzie, PRD i skryptach; nowe testy; nowe przebiegi Strykera; wygląd rysunków i kart na wydruku; zamknięcie milestone'a M-7.

## Architecture / Approach

Edycja `context/foundation/test-plan.md` w trzech fazach, każda z weryfikacją Prettierem i zgodnością liczb z `CARD_KINDS` i `npm test`. Nowe karty odwołują się do istniejących wzorców (strażnik kontraktu, niezależna wyrocznia) zamiast je powtarzać.

## Phases at a Glance

| Phase                    | What it delivers                                        | Key risk                                       |
| ------------------------ | ------------------------------------------------------- | ---------------------------------------------- |
| 1. §2 i §3               | Ryzyka 17–21, rozszerzone 5, 12, 16, fazy 12–16         | Ryzyko opisane jako lokalizacja kodu zamiast scenariusza |
| 2. §4–§7, frontmatter    | Liczby, §5 M-7, wiersze Strykera, wzorce, granice       | Liczba albo twierdzenie o teście bez źródła    |
| 3. Roadmapa i weryfikacja | S-51 `done`, przegląd impl-review                      | Dryf względem PRD i roadmapy                   |

**Prerequisites:** S-50 i S-52 zrobione (obie są na `main`).
**Estimated effort:** ~1 sesja, 3 małe fazy.

## Open Risks & Assumptions

- Liczba testów zmienia się z każdym merge'em; wpisana liczba (2094) jest stanem z 2026-11-28.
- Zakres filtra umiejętności w Strykerze nie istnieje (S-50 go wyłączył), więc ryzyko 21 opiera się na testach jednostkowych i Playwright.

## Success Criteria (Summary)

- `test-plan.md` zgadza się z kodem: 16 rodzajów, aktualna liczba testów, ryzyka i fazy M-7.
- Prettier przechodzi, a przegląd `/10x-impl-review` ma werdykt APPROVED.
