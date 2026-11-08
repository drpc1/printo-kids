# S-34 Karta „Który nie pasuje” — Plan Brief

> Full plan: `context/changes/odd-one-out-card/plan.md`
> Research: `context/changes/odd-one-out-card/research.md`

## What & Why

Ósmy rodzaj karty (GitHub 265, US-25, US-26, FR-035, FR-036). W każdym rzędzie obrazków jeden łamie jawną regułę (kształt, rozmiar, liczba, kolor, kategoria obiektu), a dziecko go zakreśla. Karta ćwiczy wykrywanie odstępstwa od reguły na trzech poziomach trudności.

## Starting Point

Karta „Kto ma więcej?” (S-33) wyznacza wzorzec: moduł w `src/lib/<karta>/`, wpis w `CARD_KINDS`, ustawienia w `CardSettingsMap`, silnik w `CARD_ENGINES`, island na `CardPage`, miniatura ze skryptu. Kształty i kredki bierzemy z sudoku. Pikselowe sylwetki z katalogu szablonów okazały się nieczytelne w makiecie.

## Desired End State

Rodzic otwiera „Który nie pasuje” z katalogu (`/odd-one-out`), wybiera poziom i kolory, generuje i drukuje kartę A4 z 5–6 rzędami po 4–6 obrazków. W każdym rzędzie jest dokładnie jedna odpowiedź. Profil pamięta poziom i kolory, katalog pokazuje miniaturę i plakietkę, a postać mówi polecenie.

## Key Decisions Made

| Decision              | Choice                                                                          | Why (1 sentence)                                                               | Source   |
| --------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------- |
| Obrazki kategorii     | 25 ikon wektorowych, 5 kategorii po 5                                           | Pikselowe sylwetki były nieczytelne; 5 ikon mieści większość rzędu trudnego    | Makieta  |
| Trudność poziomów     | łatwy bez rozpraszaczy, średni 1, trudny 2 rozpraszacze i subtelniejsze różnice | Pierwsza makieta miała łatwy i średni tak samo trudne                          | Makieta  |
| Grupy w regule liczby | średni 2–3 (±1), trudny 4–5 (±1)                                                | Trudny wymaga liczenia, nie rzutu oka                                          | Plan     |
| Kolory                | przełącznik układa nową kartę; `contentKey` = poziom + kolory                   | Kolor jest treścią zadania, więc bez kolorów stara karta traci jedną odpowiedź | Plan     |
| Rozkład reguł         | każda reguła poziomu ≥1 raz, sąsiednie rzędy różne                              | Karta ćwiczy wszystkie reguły poziomu i nie jest przewidywalna                 | Plan     |
| „Pokaż rozwiązanie”   | brak                                                                            | Jak „Kto ma więcej?”; PRD go nie wymaga                                        | Plan     |
| Wydruk na papierze    | na gotowej stronie, w fazie 3                                                   | Decyzja użytkowniczki; mniej przerw                                            | Plan     |
| Ikony w kodzie        | dane (figury z tonem), rysowane przez React i skrypt miniatury                  | ESLint zakazuje wklejania tekstu SVG; brak hexów w komponentach                | Research |
| Id i adres            | `niepasuje`, `/odd-one-out`                                                     | Konwencja jak `pieniadze` / `/money`                                           | Plan     |

## Scope

**In scope:** PRD zgodne z makietą; moduł logiki z testami; strona, katalog, profil, miniatura, testy druku i e2e; wydruk próbny.

**Out of scope:** „Pokaż rozwiązanie”; sylwetki z katalogu szablonów i kategoria „Kształty”; reguła sekwencji; Stryker (#263); akapit „Poziomy” w „Jak to działa” (S-37).

## Architecture / Approach

Obrazek to wektor cech (kształt albo ikona, rozmiar, liczba, kredka). Rząd jest jednoznaczny, gdy cecha reguły ma dokładnie jeden obrazek z wartością występującą raz, a każda inna cecha żadnego. Generator losuje rząd i odrzuca dwuznaczny, silnik zamyka kartę w `VerifiedCard`. Strona rysuje kształty przez `sudokuShapePath`, ikony z danych, a kolory przez tokeny `--symmetry-*`.

## Phases at a Glance

| Phase                       | What it delivers                                                                                  | Key risk                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1. PRD zgodne z makietą     | US-25/26, FR-035/036, Business Logic z ikonami, rozpraszaczami i kolorami                         | Pominięte zdanie PRD o „kolory nie układają nowej karty”             |
| 2. Logika karty             | `src/lib/odd-one-out/` z poziomami, ikonami, jednoznacznością, generatorem, silnikiem, układem A4 | Rozpraszacze tworzą przypadkową drugą odpowiedź (pilnuje `problems`) |
| 3. Strona, katalog i profil | `/odd-one-out`, miniatura, profil, testy druku i e2e, wydruk                                      | Ikony albo małe grupy nieczytelne na papierze                        |

**Prerequisites:** S-33 scalone (liczba kart w testach z katalogu) — spełnione.
**Estimated effort:** ~3 sesje, 3 PR-y.

## Open Risks & Assumptions

- Czytelność „4 wśród piątek” i małego obrazka 0,72 na trudnym potwierdza dopiero wydruk; wartości są w `levels.ts` i łatwo je zmienić.
- Banan i żółw najsłabiej wyglądały w makiecie; nieczytelną ikonę wymieniamy na inny obiekt tej samej kategorii.

## Success Criteria (Summary)

- Każdy rząd każdej karty ma jedną odpowiedź (test `problems` i `knownBad`).
- Karta drukuje się na jednej stronie A4 z marginesem 10 mm, także na iOS.
- Profil pamięta poziom i kolory; katalog pokazuje miniaturę i plakietkę.
