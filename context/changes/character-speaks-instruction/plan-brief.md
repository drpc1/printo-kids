# Postać mówi polecenie na każdej karcie — skrót planu

> Pełny plan: `context/changes/character-speaks-instruction/plan.md`

## What & Why

Pięć kart poza labiryntem (symetria, sekwencje, sudoku, nonogram, dyktando) dostaje pasek „Postać”, a wybrana postać w kolorze stoi na kartce przy poleceniu i „mówi” je w dymku (US-21, FR-030). Dzięki temu ulubiona postać dziecka ma sens na każdej karcie, a nie tylko na labiryncie.

## Starting Point

Postać istnieje tylko na labiryncie (`WorksheetGenerator.tsx`); pięć pozostałych stron zna ją tylko dla rogu profilu. Ich układy A4 liczą polecenie jako pole tekstu 7 mm i środkują blok zadania; dyktando wypełnia dziś całą stronę do 277 mm.

## Desired End State

Na każdej z pięciu kart przycisk „Postać” jak na labiryncie. Z wybraną postacią: u góry pas 26 mm, postać z lewej od marginesu, dymek z ogonkiem i poleceniem obok, zadanie pod spodem. Bez postaci karta wygląda jak dziś. Jedna strona A4, margines 10 mm, postać zawsze w kolorze, labirynt bez zmian.

## Key Decisions Made

| Decision             | Choice                                                                                                                                                  | Why                                                          | Source           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------- |
| Wygląd               | Postać 26 mm z lewej, dymek obok, ogonek do postaci, 1 linia 7,5 albo 2 linie 6,2                                                                       | Makieta zaakceptowana na prawdziwej stronie                  | Plan             |
| Pas bez postaci      | Układ jak dziś, bez pasa                                                                                                                                | PRD: „Bez postaci” = samo polecenie                          | PRD              |
| Ciasne dyktando      | Zmniejsz kratkę tylko gdy lista poleceń jest długa, liczoną z faktycznej liczby poleceń karty (trudne ok. 7,2–7,8 mm; łatwe i średnie zwykle bez zmian) | Zostają wszystkie polecenia i obiekty; jedna reguła dla kart | Plan (review F1) |
| Szerokość dymka      | Nowe `contentRight` w katalogu postaci                                                                                                                  | Dymek nie zasłania szerokiej postaci                         | Plan             |
| Zapis wyboru postaci | Jak dziś na labiryncie, zmiany tylko S-31                                                                                                               | Zakres S-30                                                  | Roadmap          |
| Testy                | Jednostkowe układów i kontrakt druku plus e2e (5 kart, „Bez postaci”, telefon)                                                                          | Przepełnienie strony łapią testy, wygląd wydruk próbny       | Plan             |

## Scope

**In scope:** pasek „Postać” na pięciu stronach; pas z dymkiem na pięciu kartach; dopasowanie kratki, gdy zadanie się nie mieści (dyktando); `contentRight`; testy i e2e.

**Out of scope:** labirynt; ulubiona postać i „Ustaw jako ulubioną” (S-31); okno profilu i katalog (S-29); „Jak to działa” (S-32); zmiany generatorów, poziomów, `maxCommands`; postać jako treść zadania.

## Architecture / Approach

Czysta geometria pasa (`speech.ts`) i jeden komponent SVG (`SpeechBand`) dla pięciu kart; wspólny przycisk „Postać” i hook stanu paska. Każdy układ przyjmuje wysokość pasa jako wysokość pola polecenia (26 z postacią, dzisiejsza wartość bez niej), więc środkowanie bloku zostaje. Jedna funkcja `fitCellSize` zmniejsza kratkę, gdy blok się nie mieści.

## Phases at a Glance

| Phase                    | What it delivers                                                          | Key risk                                   |
| ------------------------ | ------------------------------------------------------------------------- | ------------------------------------------ |
| 1. Wspólny pas           | `speech.ts`, `fitCellSize`, `SpeechBand`, przycisk i hook, `contentRight` | Zmiana labiryntu przy wyciąganiu przycisku |
| 2. Symetria i sekwencje  | Dwie karty z postacią                                                     | Symetria mieści się o 1 mm                 |
| 3. Sudoku i nonogram     | Trzy rozmiary sudoku, trzy poziomy nonogramu (klasyczny i znaczki)        | Dwa układy nonogramu i sudoku z liniami    |
| 4. Dyktando              | Karta z mniejszą kratką                                                   | Czytelność kratki 7,2 mm                   |
| 5. Kontrakt, e2e, wydruk | Testy i ręczny wydruk                                                     | Kolor postaci w druku                      |

**Prerequisites:** S-28 scalone (jest na main); S-27 scalone.
**Estimated effort:** ok. 4–5 sesji, 5 faz.

## Open Risks & Assumptions

- Kratka dyktanda trudnego 7,2 mm z postacią może być za drobna; wydruk próbny w fazie 4 rozstrzyga i ewentualnie wraca do mniejszej postaci na tej karcie.
- Zakładamy, że `contentRight` zmierzony jednorazowo wystarcza do dymka dla każdej postaci; własny obrazek nie musi być kwadratowy, dymek zaczyna się za polem 26 mm.
- Nowy przycisk „Postać” na telefonie (360 px) może przestawić zawijanie paska, najciaśniej na sudoku; faza 2 i 3 uruchamiają `phone-layout.spec.ts`.
- S-31 zmieni zapis postaci z paska na tych samych plikach; konflikty scalania są możliwe, ale zmiany są małe.

## Success Criteria (Summary)

- Rodzic widzi pasek „Postać” na każdej karcie, a wybrana postać w kolorze mówi polecenie w dymku na pięciu kartach.
- Karta zostaje jedną stroną A4 z marginesem 10 mm na każdym poziomie; „Bez postaci” bez zmian.
- Testy, lint, astro check, build i e2e zielone; wydruk próbny potwierdzony.
