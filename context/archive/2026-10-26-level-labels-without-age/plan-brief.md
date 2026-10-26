# Poziomy bez wieku — plan brief

> Full plan: `context/changes/level-labels-without-age/plan.md`

## What & Why

Poziomy nazwane wiekiem („3 lata”, „7 lat”) oceniały dziecko i nie pasowały do kart, w których umiejętności rosną w różnym tempie (decyzja 2026-10-26, PRD v5). S-27 zamienia je na Poziom 1…N (labirynt, symetria, sekwencje) i łatwy / średni / trudny (dyktando), a każdy wiersz listy poziomów dostaje opis tego, co widać na kartce, plus — przy kartach z dawną nazwą — typowy wiek jako podpowiedź.

## Starting Point

Etykiety wiekowe są danymi w `src/lib/{maze,symmetry,sequence,dictation}/levels.ts`; sudoku i nonogram mają już łatwy / średni / trudny. Listy rysują trzy komponenty (`LevelChoice`, `SudokuChoice`, `LevelChoiceRows` w `ProfileCorner`) z jednolinijkowym wierszem. Zapis trzyma identyfikatory (`lat5`, `nastolatek`…), nie etykiety.

## Desired End State

Pasek: „Poziom: 3” albo „Poziom: średni”. Okno listy: trzy linie w wierszu — „Poziom 3”, „węższe alejki, krótka droga”, „zwykle ok. 5 lat” (wiek tylko w labiryncie, symetrii, sekwencjach, dyktandzie; sudoku pokazuje „12 pustych pól z 36” dla wybranego rozmiaru). Okno profilu pokazuje to samo. Zapisane profile wczytują się bez migracji, a PRD mówi to samo co kod.

## Key Decisions Made

| Decision       | Choice                                                      | Why (1 sentence)                                                                                       |
| -------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Treść opisu    | Co widać na kartce (kratka, alejki, podpowiedź, puste pola) | Rodzic sprawdzi to na podglądzie i łatwo porówna sąsiednie poziomy.                                    |
| Przycisk paska | „Poziom: 3”                                                 | Bez powtórzonego słowa, pasek na telefonie się nie wydłuża.                                            |
| Typowy wiek    | Tak, „zwykle ok. 5 lat” (OQ12 zamknięte)                    | Ułatwia pierwszy wybór; wybór użytkowniczki wbrew wcześniejszemu „nie” w PRD.                          |
| Zakres wieku   | Tylko karty z dawną nazwą wiekową; sudoku i nonogram bez    | Wiek pochodzi z kolumny „Dawna nazwa”, nic nie zgadujemy.                                              |
| Układ wiersza  | C · trzy linie: nazwa, opis, wiek                           | Na podglądzie w telefonie równe i bez przewijania; B łamało wiek w połowie.                            |
| Sudoku         | Liczba pustych pól dla wybranego rozmiaru                   | To jedyne, co odróżnia poziomy sudoku.                                                                 |
| Brzmienie      | Tabela „Brzmienie” w planie, zatwierdzona dosłownie         | Testy przypinają dokładne teksty.                                                                      |
| PRD            | Poprawia ten kawałek (faza 1)                               | Użytkowniczka bez preferencji; kod i PRD zmieniają się razem.                                          |
| Fazy           | Dwie: dane + PRD, potem UI + e2e                            | Faza 1 sprawdzalna samym `npm test`; chwilowe „Poziom: Poziom 3” zaakceptowane; obie fazy w jednym PR. |

## Scope

**In scope:**

- Nowe nazwy, etykiety paska, opisy i wiek w danych poziomów sześciu kart
- Opis sudoku liczony z liczby pustych pól, z polską odmianą
- Wspólny trzyliniowy wiersz w trzech listach, w tym w oknie profilu
- Testy jednostkowe brzmienia, e2e na nowe nazwy, sprawdzenie listy labiryntu na telefonie
- PRD: OQ12, US-22, FR-001, Business Logic „Poziomy”

**Out of scope:**

- Zmiana identyfikatorów i zapisu (S-28), okno profilu bez poziomu i plakietki (S-29), postać przy poleceniu (S-30)
- Wiek przy sudoku i nonogramie; opisy przy „Rozmiar” i „Kategoria”
- Logika pasków poza tekstem

## Architecture / Approach

Brzmienie żyje w danych poziomów (`label`, `barLabel`, `description`, `typicalAge`), a widok tylko je rysuje. Jeden komponent wiersza obsługuje wszystkie trzy listy; opis i wiek są opcjonalne, więc „Kategoria” i „Rozmiar” zostają jednolinijkowe.

## Phases at a Glance

| Phase                              | What it delivers                                          | Key risk                                                               |
| ---------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1. Brzmienie w danych i PRD        | Teksty w `levels.ts`, opis sudoku, testy jednostkowe, PRD | Rozjazd PRD z PR #128, który też edytuje PRD                           |
| 2. Wiersz w trzech liniach i pasek | Wspólny wiersz, pasek „Poziom: 3”, e2e na nowe nazwy      | Lokatory e2e po nazwie wiersza trafiają w wiek („5 lat”) zamiast nazwy |

**Prerequisites:** PRD v5 i roadmapa M-4 z gałęzi `claude/profile-difficulty-levels-27c751` (PR drpc1/printo-kids#128), z której ta gałąź jest odcięta.
**Estimated effort:** ~1–2 sesje w 2 fazach.

## Open Risks & Assumptions

- S-28 i S-30 edytują te same strony kart; kolejność scalania trzeba uzgodnić (ten kawałek rusza tylko tekst przycisku i wiersze listy).
- Wiek przy opisie odwraca dotychczasowe „nie” w OQ12 — świadoma decyzja użytkowniczki 2026-10-26.

## Success Criteria (Summary)

- Rodzic nigdzie na pasku ani w nazwie poziomu nie widzi wieku; wiek jest tylko dopiskiem pod opisem.
- Na każdej karcie z wyborem poziomu wie z listy, co zmienia poziom, także na telefonie.
- Zapisane profile i ostatnie parametry otwierają się na tym samym poziomie co przed zmianą.
