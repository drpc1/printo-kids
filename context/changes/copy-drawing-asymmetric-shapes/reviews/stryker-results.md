# Stryker, faza 2 (S-55): „Skopiuj obrazek” z kształtami dyktanda

Zakres `copy-drawing` (`npm run mutate:copy-drawing -- --mutate "<plik>:<od>-<do>"`), po jednym zakresie naraz (dwa `--mutate` naraz: Stryker uwzględnia tylko ostatni).

| Zakres                                               | Zabite / timeout | Ocalałe | Wynik |
| ---------------------------------------------------- | ---------------- | ------- | ----- |
| `generate.ts:24-71`                                  | 42 + 1           | 8       | 84,3% |
| `card.ts:27-33`                                      | 11               | 0       | 100%  |
| `card.ts:65-128`                                     | 73 + 4           | 14      | 84,6% |
| `card.ts:83-88` (po dodaniu testu rozmiaru kształtu) | 16               | 3       | 84,2% |
| `colors.ts:13-24`                                    | 14               | 0       | 100%  |

## Ocalałe mutanty, po kolei

`generate.ts` (żaden nie jest błędem widocznym dla dziecka ani rodzica, bez nowych asercji):

- `:36` `<` na `<=` w pętli prób: 21 zamiast 20 prób, nieobserwowalne.
- `:47` zamiana `copyDrawingProblems(...) === 0` na `true`: pula zawiera tylko prawidłowe karty, więc sprawdzenie to druga linia obrony; kartę łamiącą reguły pokazują testy `card.test.ts` i `knownBad`.
- `:61` (3 mutanty) wzór zastępczy dla nieistniejącego obrazka: i tak jest odrzucany przez `copyDrawingProblems` (`not-silhouette`), a ścieżka nie jest dostępna z generatora.
- `:64` (2 mutanty) kopia `variants` przy składaniu karty: ochrona przed mutacją wejścia, bez skutku dla karty.
- `:71` `Math.min(count - 1, ...)` na `count + 1`: `random()` jest < 1, więc zacisk jest tylko zabezpieczeniem.

`card.ts`:

- `:85` (10 mutantów) strażnik rozmiaru kształtu: szerokość i wysokość uśmiercił nowy test „a shape that does not fit the grid” (zostały 3 mutanty na wiersze różnej długości; rozjechane wiersze rzuca już `shapeSilhouette` i pilnuje ich `shapes.test.ts`, a dane w katalogu są równe).
- `:97` nieznana litera kredki: katalog ma tylko litery kredek (test w `shapes.test.ts`), gałąź jest obroną przed złym wpisem.
- `:119`, `:124` (dawny kod szablonów): `template === undefined` i `catch` dają ten sam wynik `null`/niezgodność wzoru (`nonogramImage` nie rzuca dla złego wariantu); bez zmian względem stanu sprzed S-55.

`colors.ts`, klucz karty: bez ocalałych.
