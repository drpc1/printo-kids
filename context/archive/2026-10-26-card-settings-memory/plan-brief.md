# Profil i ostatnie parametry pamiętają ustawienia każdej karty — Plan Brief

> Full plan: `context/changes/card-settings-memory/plan.md`

## What & Why

Rodzic wraca na stronę karty i ma na pasku to, co ostatnio wybrał dla tej karty: poziom, kolory, kategorię, rozmiar. Przy aktywnym profilu zapisuje się to w profilu od razu („Zapamiętane dla {imię}”), bez profilu na urządzeniu. Dziś pamiętany jest tylko poziom labiryntu i postać, więc rodzic za każdym razem ustawia pasek od nowa (PRD US-08, FR-017, FR-006).

## Starting Point

Zapisują się tylko `{character, level}` (profil i `last-used`); `level` to poziom labiryntu. Pięć pozostałych stron trzyma ustawienia w `useState` z domyślnymi i nie zna profilu. Stan startowy strony czyta się synchronicznie, ryzyko wyścigu jest przy zmianie profilu i w stanie „czekam na wybór dziecka”.

## Desired End State

Sześć kart startuje z zapamiętanymi ustawieniami; karta, której profil nie używał, ma domyślne. Zmiana profilu przy pokazanej karcie przestawia pasek i generuje nową kartę. Stare profile wczytują się bez migracji.

## Key Decisions Made

| Decision                   | Choice                                                                                          | Why (1 sentence)                                                                | Source |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------ |
| Kształt zapisu             | Opcjonalne pole `cards` w profilu i w `last-used`, jeden moduł `card-settings.ts`               | Jeden kształt i kod dla profilu i urządzenia, stare wpisy bez `cards` działają. | Plan   |
| Poziom labiryntu           | Zostaje w polu `level`                                                                          | Okno profilu (do S-29) dalej go czyta, więc jedno źródło prawdy.                | Plan   |
| Wpięcie w strony           | Nowy hook `useCardSettings`, `ProfileBar` nietknięty                                            | Małe, addytywne zmiany; S-30 robi się dopiero po scaleniu tego PR.              | Plan   |
| Komunikat                  | Tekst `role="status"` w wierszu paska, ok. 2 s, tylko po udanym zapisie                         | W miejscu wyboru, nie zasłania przycisków na telefonie.                         | Plan   |
| Nowy profil                | Dziedziczy pasek bieżącej karty (jeden zapis, prop w ProfileCorner), pozostałe karty domyślne   | Nic nie zmienia się na ekranie po utworzeniu.                                   | Plan   |
| Zmiana profilu przy karcie | Pasek i nowa karta, gdy zmieniło się pole wpływające na generowanie (kolory tylko przerysowują) | Tak działa labirynt; karta zgadza się z paskiem.                                | Plan   |
| Testy                      | Jednostkowe + jeden sparametryzowany e2e na sześć kart                                          | Łapie zepsucie wczytania i wyścig na każdej karcie.                             | Plan   |
| Stare badanie              | `profile-age-and-levels` archiwizowane jako zastąpione (osobny commit)                          | Koniec ze sprzecznymi źródłami (wiek vs bez wieku).                             | Plan   |

## Scope

**In scope:** zapis i odczyt ustawień pięciu kart + poziomu labiryntu przy profilu, komunikat, zgodność wstecz, e2e, archiwizacja starego badania.

**Out of scope:** pasek „Postać” na pięciu kartach i dymek (S-30), przebudowa okna profilu i plakietki katalogu (S-29), „Zacznij od nowa”, zapamiętywanie „Pokaż rozwiązanie”, migracja danych.

## Architecture / Approach

`card-settings.ts` definiuje typy, domyślne i tolerancyjne parsery dla pięciu kart oraz normalizację kombinacji sudoku. `child-profiles.ts` i `last-used.ts` dostają pole `cards` i przestają je gubić przy zapisie postaci/ulubionej. Hook `useCardSettings` leży na `useChildProfileVisit`, zwraca ustawienia startowe, `remember(patch)` i komunikat, i opakowuje handlery zmiany profilu. Symetria jest pierwszą kartą i wzorcem dla pozostałych.

## Phases at a Glance

| Phase                                  | What it delivers                                           | Key risk                                                 |
| -------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| 1. Rdzeń zapisu                        | `card-settings.ts`, `cards` w profilu i `last-used`, testy | Zapis, który kasuje `cards` albo psuje stary profil      |
| 2. Hook, komunikat, labirynt, symetria | `useCardSettings`, wiersz komunikatu, wzorcowa karta       | Wyścig przy zmianie profilu, układ paska na telefonie    |
| 3. Cztery pozostałe karty              | Sekwencje, sudoku, nonogram, dyktando                      | Niepoprawne kombinacje sudoku, regresja przycisku Poziom |
| 4. E2E i porządki                      | Spec e2e na sześć kart, archiwizacja starego badania       | Wolniejsze e2e w CI                                      |

**Prerequisites:** S-27 scalony (jest, PR #131). S-30 zaczyna się dopiero po scaleniu tego PR.
**Estimated effort:** ok. 3–4 sesje w czterech fazach.

## Open Risks & Assumptions

- Zakładamy, że okno profilu (z poziomem labiryntu) działa bez zmian do S-29; nie dotykamy go poza zachowaniem `cards`.
- Komunikat rezerwuje miejsce w pasku: trzeba sprawdzić układ na telefonie (guardrail US-04).
- Wydruk próbny potwierdza, że zapis ustawień nie zmienia kart A4.

## Success Criteria (Summary)

- Rodzic wraca na dowolną z sześciu kart i widzi swój poprzedni wybór, z profilem i bez.
- Nowy profil, zmiana profilu i stare dane zachowują się zgodnie z PRD, bez migracji.
- Testy jednostkowe i e2e w CI chronią zapis i wczytanie na wszystkich sześciu kartach.
