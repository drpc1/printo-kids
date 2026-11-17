# Stryker: nowe karty z M-6 (S-45, GitHub #376)

Stan: 2026-11-17. Stryker nie jest bramką CI. Każdy zakres ma `stryker/<zakres>.config.json` i `npm run mutate:<zakres>`; wąski przebieg: `npm run mutate:<zakres> -- --mutate "plik:start-koniec"`. Zasady powtarzania jak w `context/archive/2026-11-10-m5-stryker-new-cards/reviews/stryker-results.md` (zakresy po jednym, komputer nie śpi).

## Zakres

- **Krzyżówka matematyczna** (`math-crossword`, S-40): solver i reguły jednoznaczności (`card.ts`: `chainDepth`, `mathCrosswordProblems`, geometria siatki, klucz karty) oraz losowanie i wypełnianie (`generate.ts:169-356`).
- **Zegar** (`clock`, S-41): bez zakresu. Nie ma solvera ani reguł dwuznaczności: jedna godzina na tarczy ma jedną odpowiedź z samej konstrukcji (kąty wskazówek), a reguły karty (godziny się nie powtarzają, minuty nowe dla poziomu, kolejność w trybie Połącz) to proste sprawdzenia pokryte w `clock/card.test.ts` i `generate.test.ts`.
- Filtr katalogu i karty kodowania: poza zakresem (M-7).

## Jak powtórzyć

- Pełny zestaw testów krzyżówki trwa ok. 2 min na mutant (`generate.test.ts` 61 s, `layout.test.ts` 26 s, `oracle.test.ts` 22 s), więc pierwszy przebieg na obu plikach z `timeoutMS: 15000` dał same przeterminowane mutanty i szacunek ponad 8 h. Zakres jest podzielony na dwa i ma własne zestawy testów:
  - `math-crossword`: `card.ts`, testy `card`, `oracle`, `levels`, `engine`, `timeoutMS: 60000`; ok. 30 min.
  - `math-crossword-generate`: `generate.ts:169-356`, testy `generate`, `oracle`, `timeoutMS: 180000`; ok. 70 min.

## Wyniki

| Zakres                    | Plik                  | Mutanty | Wynik przed                                             | Ocalałe przed | Testy dopisane | Wynik po              |
| ------------------------- | --------------------- | ------- | ------------------------------------------------------- | ------------- | -------------- | --------------------- |
| `math-crossword`          | `card.ts`             | 371     | 78,44%                                                  | 80            | 6              | 87,60% (46 ocalałych) |
| `math-crossword-generate` | `generate.ts:169-356` | 328     | 69,82% (205 zabitych, 24 przeterminowane, 99 ocalałych) | 99            | 0              | nie powtarzany        |

## Dopisane testy (z luk widocznych dla rodzica)

W `math-crossword/card.test.ts`: karta z nachodzącymi albo stykającymi się równaniami (obok siebie w rzędzie i w kolumnie, trzy w jednym miejscu, skrzyżowanie na znaku), z cudzym numerem albo znakiem w kratce i z kratką tuż przed albo za działaniem jest odrzucana jako `cells-touch`; granica `too-few-equations` (dokładnie cel minus tolerancja przechodzi); tabliczka mnożenia i dzielenia na obu końcach (2 i 10, czynnik 1, iloraz 11); klucz karty odróżnia kierunek, znak, miejsce, liczbę działań i granice liczb; `chainDepth` znajduje liczbę równą największej poziomu.

## Ocalałe bez testu

- **`card.ts` (46):** obrona przed kartą z błędnymi numerami (id poza zakresem, ułamkowe, `wired`, strażnik `blanks` przed `chainDepth`): wynik jest ten sam, bo `false-equation` i tak się pojawia, a generator takich kart nie tworzy. Równoważne: `b !== 0` przed `a % b` (dla 0 reszta to NaN), `c >= 2` i `a !== b` w dzieleniu (każde wyklucza drugie), wiersz `fits.length === 1` i `unknown.length !== 1` w `chainDepth` (przy jednej niewiadomej wynik jest jedyny, a błędne wnioski i tak wychwytuje końcowe porównanie z `values`).
- **`generate.ts` (99):** wszystkie leżą w przestrzeni poszukiwań (`operandRange`, `otherOperand`, `candidates`, `pushIfLegal`, losowanie dzielnej, budżet wypełniania). Gotowa karta przechodzi i tak przez `mathCrosswordProblems` i niezależną wyrocznię (`oracle.test.ts`, jedno rozwiązanie), więc mutant tam zmienia tylko to, jak często generator trafia, a nie poprawność pokazanej karty. Nie ma błędu widocznego dla rodzica, więc bez testu (zasada „nie gonić za 100%”). Kilka z nich (zły znak w `otherOperand`) tylko spowalnia poszukiwanie, a `FILL_BUDGET` je ucina.
