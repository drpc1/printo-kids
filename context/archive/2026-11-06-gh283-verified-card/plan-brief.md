# VerifiedCard: wspólny strażnik niezmiennika kart — Plan Brief

> Full plan: `context/changes/gh283-verified-card/plan.md`
> Research: `context/domain/02-invariant-aggregate-refactor.md` (D02) i `context/domain/01-domain-distillation.md` (D01)

## What & Why

Każda karta obiecuje jedną sprawdzalną odpowiedź (PRD, „Po MVP”), ale siedem generatorów pilnuje tego osobno, z różnymi sygnaturami, a labirynt robi to w komponencie i przepuszcza 5 znanych wadliwych stanów (sonda D02). Wprowadzamy jeden kontrakt: karta w UI to `VerifiedCard`, której nie da się zbudować bez sprawdzenia rodzaju, a rejestr `CARD_ENGINES` nie kompiluje się bez silnika każdego rodzaju. S-34..S-36 urodzą się w tym kontrakcie. Ten sam stan strony pilnuje drugiego niezmiennika, I-9 (decyzja właścicielki 2026-11-06): zadanie na ekranie odpowiada ustawieniom treści na pasku, więc zmiana kategorii układa nową kartę jak zmiana poziomu. Drukuj na już drukowanej karcie ostrzega, bo wydruk tej samej karty z inną postacią dał dziecku dwa takie same zadania.

## Starting Point

Generatory zwracają `Karta | null`. Siedem komponentów trzyma własne flagi `generateFailed` i pokazuje jeden tekst bez przyczyny. `CARD_KINDS` ma `id: string`, a ustawienia rodzajów są już typowane w `CardSettingsMap` (`card-settings.ts:57`). Nieudane Generuj zostawia dziś starą kartę drukowalną, zmiana kategorii zostawia starą kartę z nowym napisem na pasku (I-9 łamane), a ponowny druk tej samej karty nie ostrzega.

## Desired End State

Każda strona karty dostaje karty wyłącznie z `CARD_ENGINES` i trzyma stan w `SheetState` (`idle` / `showing` / `unavailable`). Nieudane Generuj albo zmiana poziomu przy pokazanej karcie wyłącza druk i pokazuje rodzicowi krótką przyczynę. Poziom, rozmiar sudoku i kategoria przy pokazanej karcie od razu układają nową kartę; postać, kolory i „Pokaż rozwiązanie” zostawiają tę samą. Drukuj na karcie, która już była drukowana, pyta: „Nowa karta” albo „Drukuj tę samą”. Labirynt sprawdza 10 kodów, w tym osiągalność wszystkich komórek. Dopisanie rodzaju bez silnika łamie `astro check`, a import surowego generatora z UI łamie `depcruise`.

## Key Decisions Made

| Decision                                | Choice                                                                                                                            | Why (1 sentence)                                                                               | Source             |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------ |
| Zakres                                  | Fazy D02 0–3 i 3b; D02 4–6 osobno, poza dwoma zdaniami PRD o dyktandzie                                                           | Zdania PRD:341 i :815 przeczą decyzji 7.2, więc nie mogą czekać                                | Research / Plan    |
| Nieudane Generuj                        | Wyłącza kartę (`unavailable`) i pokazuje przyczynę                                                                                | Decyzje właścicielki 7.2 i 7.5                                                                 | Research           |
| Osiągalność komórek labiryntu           | Reguła produktu, kod `unreachable-cells`                                                                                          | Decyzja właścicielki 7.4                                                                       | Research           |
| Szlaczki, R-9, A5                       | Kontrakt neutralny; R-9 i A5 rozstrzyga właścicielka po fazie 1                                                                   | Decyzje 7.1 i 7.3                                                                              | Research           |
| Faza 3b (`SheetState`)                  | Włączona, przed migracją komponentów                                                                                              | Zmianę zachowania pisze się raz i testuje bez Reacta, zamiast w 7 komponentach (delegowane)    | Plan               |
| Podział na PR-y                         | Pionowo: kontrakt → stan → labirynt → 6 rodzajów → rejestr; jeden PR na fazę                                                      | Każdy PR zostawia działający produkt, bez martwego kodu (delegowane)                           | Plan               |
| Czerwone testy fazy 0                   | `todo` + `phase0-findings.md`; test „brak `todo`” w fazie 11                                                                      | CI na `main` zielone, a znaleziska nie giną (delegowane)                                       | Plan               |
| Typowanie rejestru                      | Typ mapowany `CardEngine<CardSettingsOf<K>, CardTypeMap[K]>`, bez `any`                                                           | `CardSettingsOf` już istnieje                                                                  | Plan               |
| Kopia i zamrożenie                      | `structuredClone` + głębokie zamrożenie, bramka < 20 ms na największej karcie; inaczej zamrożenie bez kopii                       | Koszt nie był mierzony (D02 §9)                                                                | Plan               |
| Druga kontrola w silnikach próbkujących | `require` na wyniku; gdy wyjdzie poza budżet czasu, pętla na `check`                                                              | Zachowuje generatory bez zmian, chyba że koszt zabroni (sudoku 9×9)                            | Plan               |
| Strict mode                             | Silnik w handlerze, `setSheet(gotowa wartość)`                                                                                    | Updater wołany dwa razy zużywałby losowość                                                     | Plan               |
| I-9: zadanie odpowiada paskowi          | `CardSpec.contentKey` + `applySettings`: inny klucz treści → nowa karta od razu; tabela „ustawienie → skutek” dla 7 kart w planie | Jedna reguła dla rodzica: co zmienia zadanie, daje nową kartę; reszta zostawia tę samą         | Owner (2026-11-06) |
| Kategoria                               | Nowa karta od razu, jak poziom (zamiast „nieaktualna do Generuj”)                                                                 | Spójne z poziomem; wygodne przeglądanie kategorii                                              | Owner (2026-11-06) |
| Postać                                  | Ozdoba, zmienia się na pokazanej karcie jak dziś                                                                                  | Rodzic przegląda postacie przed drukiem; znikająca karta przeszkadzała                         | Owner (2026-11-06) |
| Ponowny druk                            | `printed` z `beforeprint`; Drukuj na drukowanej karcie → okno „Nowa karta” / „Drukuj tę samą”; Ctrl+P bez okna                    | Łapie pomyłkę „zapomniałam przegenerować” tam, gdzie się zdarza, bez blokowania celowego druku | Owner (2026-11-06) |
| PRD                                     | US-20, US-22 w PR fazy 3; zdania dyktanda PRD:341/815 w fazie 10; US-08, US-21 bez zmian                                          | Reguła wchodzi razem ze stanem, który ją definiuje                                             | Plan               |
| Tekst przyczyny                         | `CardExhausted`: tekst per rodzaj z poziomem i kategorią; `CardInvariantError`: jeden tekst „błąd aplikacji” z kodem              | Wystarcza do decyzji 7.5 bez tabeli tekstów dla każdego kodu                                   | Plan               |

## Scope

**In scope:**

- `card-contract.ts`, `sheet-state.ts`, `card-engines.ts`
- siedem `engine.ts`
- migracja siedmiu `*Generator.tsx`
- `cards.ts` jako `as const`
- reguła `cards-only-through-engines`
- skrypt miniatur
- test zbiorczy `card-engines.test.ts`
- dwa zdania PRD o dyktandzie
- I-9: `contentKey` w każdym spec, `applySettings`, kategoria generuje od razu, zmiany PRD US-20 i US-22
- ostrzeżenie przy ponownym druku: `printed` w `SheetState`, okno w `CardPage` (faza 4)

**Out of scope:**

- definicja gotowości S-34..S-36 w roadmapie
- Stryker
- słownik i TP
- doprecyzowanie PRD:670
- gwarancja I-2 dla labiryntu
- wspólne stałe A4
- przeniesienie katalogu szablonów

## Architecture / Approach

Autor rodzaju pisze `CardSpec` (`problems`, `keyOf`, `knownBad`) i `CardEngine`, który owija dzisiejszy generator: tłumaczy ustawienia na poziom, `null` zamienia na `CardExhausted`, a wynik przepuszcza przez `VerifiedCard.require`. Komponent woła `generateSheet(state, CARD_ENGINES[k], settings, Math.random)` w handlerze. `SheetState` łapie tylko dwa błędy domenowe, a `failureReason` robi z nich tekst dla `CardPage`.

## Phases at a Glance

| Phase                                                            | What it delivers                                                          | Key risk                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1. Inwentaryzacja                                                | Test zbiorczy + `knownBad` 7 kart, `todo` i plik znalezisk                | Znalezisk może być więcej niż R-9/A5                          |
| 2. Kontrakt                                                      | `card-contract.ts`, C1–C9, bramka kosztu                                  | Strip-types nie przyjmuje właściwości parametrów konstruktora |
| 3. SheetState                                                    | Przejścia N16, przyczyna N15, I-9 i `printed` (N17), PRD US-20/22         | Brzmienie tekstów dla rodzica                                 |
| 4. Labirynt                                                      | `mazeSpec` (10 kodów), silnik, komponent, miniatury, okno ponownego druku | Miniatura bajt w bajt; druk dopiero po renderze nowej karty   |
| 5–10. Pieniądze, symetria, sekwencje, sudoku, nonogram, dyktando | Silnik + komponent na `SheetState` per rodzaj                             | Koszt drugiej kontroli (sudoku 9×9); tryb katalogowy dyktanda |
| 11. Rejestr i domknięcie                                         | `CARD_KINDS as const`, `CARD_ENGINES`, depcruise, pełne e2e               | Zgodność `CardKindId` i `CardSettingsId`                      |

**Prerequisites:**

- Node 22.14.0;
- gałąź `feat/gh283-verified-card` od `main` (D01 i D02 są już na `main`);
- e2e z `E2E_PORT` na wolnym porcie.

**Estimated effort:** ~11 PR-ów. Fazy 1–4 to po jednej sesji. Fazy 5–10 są małe, po ok. pół sesji każda.

## Open Risks & Assumptions

- Faza 1 może znaleźć luki poza R-9 i A5. Każda dostaje wiersz w `phase0-findings.md` i fazę, która ją zamyka.
- R-9 (start dyktanda) i A5 (łatwy nonogram) zależą od decyzji właścicielki po fazie 1. Plan ma oba warianty w fazach 9 i 10.
- Zmiany zachowania po nieudanym Generuj nie pilnuje dziś żadne e2e. Pilnują jej testy N16 i ręczne sprawdzenie.
- Między fazą 3 a 10 PRD opisuje I-9 i ostrzeżenie, a strony jeszcze nie przeniesione działają po staremu.
- `printed` znaczy „okno druku było otwarte”; po anulowaniu druku rodzic dostanie zbędne ostrzeżenie (jedno kliknięcie).
- Do fazy 11 nic nie wymusza, że nowa karta dostanie silnik. S-34..S-36 powinny wejść po fazie 11 albo same dopisać silnik.

## Success Criteria (Summary)

- Każda karta pokazana rodzicowi przeszła sprawdzenie swojego rodzaju. Wadliwa karta albo wyczerpane próby dają przyczynę zamiast starej karty do druku.
- Nowy rodzaj karty nie wejdzie do katalogu bez silnika i `knownBad` (kompilator i depcruise).
- Zadanie na ekranie zawsze odpowiada poziomowi i kategorii na pasku; ponowny druk tej samej karty przyciskiem Drukuj zawsze pyta.
- Zachowanie i wygląd kart poza niepowodzeniem, zmianą kategorii i ostrzeżeniem są bez zmian (e2e, miniatury, ręczny przegląd).
