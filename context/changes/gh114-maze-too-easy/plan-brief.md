# Labirynty trudniejsze na każdym poziomie — Plan Brief

> Full plan: `context/changes/gh114-maze-too-easy/plan.md`
> Frame brief: `context/changes/gh114-maze-too-easy/frame.md`

## What & Why

GitHub 114 i testy z 2026-10-30: 4-latek bez trudu robi Poziomy 1–3, a 6-latek wszystkie sześć. Frame: **problemem jest kształt wygenerowanej karty (droga, odnogi, rozrzut), a nie sam rozmiar siatki.** Plan daje każdemu poziomowi własną, odrobinę węższą alejkę i poprawia losowanie tak, żeby droga nie biegła prosto w dół przy środku, a przy drodze było więcej głębokich ślepych uliczek.

## Starting Point

Poziomy 1–2 i 3–4 dzielą siatkę i alejkę i różnią się tylko algorytmem (Kruskal albo backtracker). Start i meta Poziomów 1–5 leżą w tej samej środkowej kolumnie. Backtracker rośnie od wejścia, więc początek drogi to długi korytarz. Generator bierze pierwszy labirynt z jedną drogą i niczego nie ocenia.

## Desired End State

Każdy poziom ma inną szerokość alejki: ok. 21 / 17 / 15 / 13 / 10 / 6,6 mm. Na Poziomach 1–5 postać stoi na środku górnej krawędzi, a „Meta” w losowej kolumnie dołu. Każda karta jest najlepszą z 20 losowań, więc karty z prawie prostą drogą znikają, a karty dalej się od siebie różnią. Zapisane profile działają bez migracji.

## Key Decisions Made

| Decision                   | Choice                                                                 | Why (1 sentence)                                                                                  | Source |
| -------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| Co jest problemem          | Kształt karty, nie sam rozmiar siatki                                  | Pomiar: start i meta w jednej kolumnie, asymetria backtrackera, brak oceny karty                  | Frame  |
| Siatki                     | 9×11, 11×13, 13×16, 15×18, 19×23, 29×35                                | Każdy poziom inna alejka; nieparzyste kolumny trzymają wejście na środku                          | Plan   |
| Start i meta (Poziomy 1–5) | Start na środku, meta w losowej kolumnie dołu, ≥ 2 kolumny od środka   | Usuwa „prosto w dół przy środku”, postać zostaje tam, gdzie dziś                                  | Plan   |
| Algorytmy                  | Kruskal tylko Poziom 1, Poziomy 2–6 backtracker z losowej komórki      | Para o wspólnej alejce nie jest już potrzebna; losowy start wyrównuje odnogi przy starcie i mecie | Plan   |
| Rozrzut                    | Najlepsza z 20 kart według oceny (głębokie odnogi, odejście od środka) | Podnosi dolną granicę bez progów i bez długości jako celu                                         | Plan   |
| Poziom 6                   | Rogi zostają, siatka 29×35                                             | Rogi już nie mają objawu środka                                                                   | Plan   |

## Scope

**In scope:**

- Nowa tabela poziomów, meta w labiryncie, losowanie i wybór najlepszego z 20
- Kartka i miniatura czytające metę z labiryntu, testy unit i e2e
- PRD: tabela poziomów labiryntu i US-01
- Wydruk próbny i próba z dziećmi

**Out of scope:**

- Ręczne układanie drogi, pasma długości, progi odnóg (wycofane 2026-10-16)
- Losowy start, zmiana rogów Poziomu 6, pętle w odnogach
- Zmiana identyfikatorów poziomów, `@page`, marginesu i znaku postaci

## Architecture / Approach

`generateMaze(levelId, random)` losuje 20 kandydatów. Każdy ma własną metę z `level.exitColumns` i drzewo z Kruskala (Poziom 1) albo backtrackera z losowej komórki. Zwraca kandydata z najwyższą oceną: 3 · głębokie odnogi przy drodze − 10 · udział drogi w środkowej trzeciej. `Maze` niesie `entrance` i `exit`, a `mazeForSheet`, kartka i miniatura je czytają. `mazeForSheet` zostaje zabezpieczeniem (siatka, wejście, meta, jedna droga).

## Phases at a Glance

| Phase                          | What it delivers                                                                                                                            | Key risk                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1. Generator i tabela poziomów | Nowe siatki, meta losowa, wybór z 20, odbiorcy labiryntu (kartka, skrypt miniatury, testy układu i ścian), testy rozkładu, zawężony Stryker | Testy rozkładu za ciasne albo za luźne                       |
| 2. Kartka, miniatura i e2e     | Test napisu „Meta” w skrajnej kolumnie, przegenerowana miniatura, zielone e2e                                                               | „Meta” w skrajnej kolumnie przy krawędzi kartki              |
| 3. PRD i wydruk próbny         | PRD zgodny z kodem, potwierdzenie z dziećmi                                                                                                 | Poziom 3 za trudny po skoku z ok. 34 do ok. 74 komórek drogi |

**Prerequisites:** brak; zmiana tylko w labiryncie.
**Estimated effort:** ok. 2 sesje w 3 fazach, plus czas na wydruk i próbę z dziećmi.

## Open Risks & Assumptions

- Poziom 3 rośnie najbardziej: droga ok. 34 → 74 komórek przy tej samej alejce, bo przestaje być Kruskalem. To też poziom domyślny (`lat5`) dla pierwszej wizyty i nowego profilu; zostaje domyślny, a wydruk próbny sprawdza pierwszą kartę. Jeśli dzieci uznają go za za trudny, korekta to inny algorytm albo mniejsze N tylko na tym poziomie.
- Prototyp i liczby oczekiwane pochodzą z innego generatora liczb losowych niż testy; testy sprawdzają kierunek zmian, nie dokładne wartości.
- Testy z 2026-10-30 to dwoje dzieci; wartości potwierdza wydruk.

## Success Criteria (Summary)

- Na żadnym poziomie nie trafia się karta z prawie prostą drogą w dół przy środku.
- Każdy poziom ma inną szerokość alejki, a karta jest jedną stroną A4 z marginesem 10 mm i jedną drogą.
- 4-latek i 6-latek zauważają, że karty są odrobinę trudniejsze na każdym poziomie.
