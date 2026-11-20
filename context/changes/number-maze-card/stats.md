# Makieta S-49 — wykonalność generatora

Wygenerowane przez `mockup.mts`. Każda karta przeszła niezależne sprawdzenie jednej drogi.

| Poziom                                  | Kratka | Droga   | Pułapki (kuszące) | Próby | Węzły DFS | ms  | Sprawdzenie 200 kart                    |
| --------------------------------------- | ------ | ------- | ----------------- | ----- | --------- | --- | --------------------------------------- |
| Poziom 1: 1–15, kratka 5×5              | 5×5    | 15 z 25 | 10 (8)            | 1     | 15        | 0.9 | 200/200 jedna droga, najdłużej 1.2 ms   |
| Poziom 2: 1–20, kratka 5×6              | 5×6    | 20 z 30 | 10 (10)           | 1     | 20        | 0.2 | 200/200 jedna droga, najdłużej 0.4 ms   |
| Poziom 3: 1–30, kratka 6×7              | 6×7    | 30 z 42 | 12 (10)           | 1     | 32        | 0.3 | 200/200 jedna droga, najdłużej 2.2 ms   |
| Poziom 4: 1–50, kratka 8×9              | 8×9    | 50 z 72 | 22 (21)           | 1     | 50        | 0.2 | 200/200 jedna droga, najdłużej 614.3 ms |
| Poziom 5: co 2, od 2 do 60, kratka 6×7  | 6×7    | 30 z 42 | 12 (11)           | 1     | 33        | 0.1 | 200/200 jedna droga, najdłużej 3.0 ms   |
| Poziom 6: co 5, od 5 do 200, kratka 7×8 | 7×8    | 40 z 56 | 16 (14)           | 1     | 48        | 0.1 | 200/200 jedna droga, najdłużej 69.4 ms  |
