# Stryker: cztery karty z M-5 (GitHub #263)

Stan: 2026-11-12. Stryker nie jest bramką CI. Każdy zakres ma `stryker/<zakres>.config.json` i `npm run mutate:<zakres>`; wąski przebieg: `npm run mutate:<zakres> -- --mutate "plik:start-koniec"`. Pod `MUTATION_RUN=1` testy pomijają budżety czasu (`pattern-lines/generate.test.ts` dostał to w tej zmianie).

## Jak powtórzyć

- Uruchamiaj zakresy **po jednym**. Cztery naraz zamulają maszynę i wstępny przebieg testów przekracza limit czasu.
- Nie usypiaj komputera w trakcie: limity czasu mutantów liczą czas ścienny, uśpienie robi z mutantów „przeterminowane” (pierwszy przebieg `money` po 18 h zegara był przez to nieważny i został powtórzony).
- `money` i `pattern-lines` mają `timeoutMS: 15000`, `timeoutFactor: 1.5`.
- `pattern-lines` ma 614 mutantów w pełnym zakresie (szacunek ponad 10 h), więc zakres to `paths.ts:149-183` (przecięcia), `paths.ts:258-283` (kropki) i `card.ts` (reguły karty); losowanie geometrii (`patterns.ts`) poza zakresem.

## Wyniki

| Zakres | Pliki | Mutanty | Wynik przed | Ocalałe przed | Testy dopisane | Wynik po |
| --- | --- | --- | --- | --- | --- | --- |
| `odd-one-out` („Który nie pasuje”) | `rules.ts`, `generate.ts` | 515 | 79,22% (rules 88,13%, generate 68,78%) | 107 | 5 | 98,09% w `rules.ts:80-195` (4 ocalałe); `generate.ts` nie powtarzany |
| `money` („Kto ma więcej?”) | `rules.ts`, `generate.ts` | 276 | 86,59% (rules 96,67%, generate 74,60%) | 37 | 1 test, 2 asercje | nie powtarzany (godziny) |
| `pattern-lines` (szlaczki) | `paths.ts` (zawężony), `card.ts` | 299 | 83,55% (card 85,26%, paths 80,70%) | 50 | 4 | nie powtarzany |
| `copy-drawing` („Skopiuj rysunek”) | `generate.ts`, `layout.ts` | 95 | 72,63%, wcześniej 89,47% | 26, wcześniej 10 | 2 | patrz uwaga |
| `local-data` (nowe wpisy `card-settings.ts:190-276`) | `card-settings.ts` | 121 | 95,04% | 6 | 0 | — |
| `card-layouts` (`layout.ts` trzech kart) | `money/layout.ts`, `odd-one-out/layout.ts`, `pattern-lines/layout.ts` | 308 | 75,97% (money 82,05%, odd-one-out 86,32%, pattern-lines 50,00%) | 74 | 4 testy (A4, komunikaty, granice) | 83,77% (money 88,89%, odd-one-out 94,87%, pattern-lines 58,11%) |
| `card-contract` (`card-contract.ts`) | `card-contract.ts` | 41 | 82,93% | 7 | 2 testy (komunikaty błędów, zamrożenie z `null`) | 87,80% (5 ocalałych) |

Uwaga do `copy-drawing`: pierwszy przebieg (89,47%) liczył 18 mutantów jako przeterminowane i był przekłamany przez obciążenie maszyny; drugi, spokojny przebieg po dopisaniu testów (72,63%) jest wiarygodny. Spadek to jedna grupa: `layout.ts:61` jest drugą kontrolą marginesu po zbudowaniu układu i dubluje kontrolę z linii 43 (obie rzucają przy tych samych poziomach), więc mutanty w jednej maskuje druga.

## Dopisane testy (z luk widocznych dla rodzica)

- `copy-drawing/layout.test.ts`: strona to A4; poziom, który się nie mieści, jest odrzucany z komunikatem o siatkach; granica 12 kolumn (7,5 mm) i 20 wierszy (13,2 mm).
- `odd-one-out/generate.test.ts`: poziom z rozpraszaczami faktycznie je dokłada (część rzędów ma dokładnie tyle zmiennych cech, ile rozpraszaczy, i większość rzędów ma co najmniej jedną).
- `odd-one-out/rules.test.ts`: grupa 6 sztuk jest jeszcze w zakresie, 7 i ułamek nie; ikona to jeden obrazek (grupa ikon, nieznana ikona, ikona z kredką → `item-kind`); wiersz kategorii z kształtem i wiersz kształtu z ikoną są odrzucane; karta bez jednej z reguł poziomu → `missing-rule`.
- `money/rules.test.ts`: jeden zły nominał w mieszanej kupce (banknot 10 zł wśród monet) jest błędem.
- `pattern-lines/card.test.ts`: wiersz z ujemną wysokością albo wyższy niż poziom, zerowa i ułamkowa liczba powtórzeń, zbyt mało lub zbyt dużo narysowanych powtórzeń śladu, ślad w trybie kropek.

## Ocalałe bez testu: układy i kontrakt

- **`pattern-lines/layout.ts` (31 ocalałych):** druga kontrola marginesu po zbudowaniu układu (`left < inset`, prawa i dolna krawędź) dubluje pierwszą kontrolę rozmiaru rzędów; mutant w jednej jest maskowany przez drugą, a przy poziomach z `levels.ts` marginesu nie da się przekroczyć.
- **`money/layout.ts`, `odd-one-out/layout.ts`:** zdegenerowane wejścia (`rowCount <= 1` przy jednym rzędzie, `<` zamiast `<=` na granicy bez luzu, `pilePadding` o dokładnie połowie szerokości). Karta z tych poziomów ich nie osiąga.
- **`card-contract.ts` (5):** gałąź zamrażania dla wartości nie będących obiektami (`typeof value === "object" && value !== null`); wartość prosta zamrożona lub nie nie zmienia karty.

## Ocalałe bez testu: decyzje

- **`generate.ts` (wszystkie karty): pętle losowania z końcową walidacją.** Zmutowany krok losowania (zakres rozmiarów, sąsiednie liczby w regule liczby, kolejność cech, liczba prób) daje wiersz, który walidator odrzuca, a pętla losuje ponownie; karta pokazana rodzicowi jest taka sama. To siatka bezpieczeństwa: gwarancję „jedna odpowiedź” daje walidator, i ten jest pokryty testami reguł.
- **`money/rules.ts:43`** (`>= 0`): remis jest obsłużony wcześniej, mutant równoważny. **`:53/:62`** (separator w kluczu kupki): kolizja wymagałaby kupki z nominałem spoza listy. **`:91`** (`true &&`): identyczne kupki z odpowiedzią inną niż „=” są i tak błędem sumy.
- **`copy-drawing/generate.ts:25, :29`:** o jedną próbę więcej, druga walidacja po poprawnej konstrukcji. **`:52`** (`count + 1` w `Math.min`): nigdy nie wiąże.
- **`copy-drawing/layout.ts:40-45, :61`:** patrz uwaga wyżej (maskowanie przez drugą kontrolę).
- **`local-data` `card-settings.ts:233, :237, :243, :245`:** wypadnięty `case` przechodzi do sąsiedniej karty z tym samym zestawem identyfikatorów (łatwy/średni/trudny), równoważne. **`:195`, `:222`:** wartość nie-tekstowa albo `shapes` i tak wraca do domyślnej przez drugą ścieżkę.
- **`pattern-lines`:** część ocalałych w `card.ts:82` (kontrola `outOfRow` po współrzędnych ścieżki) i w `paths.ts:259-277` (granice odległości kropek o 1e-9) to równoważne granice zmiennoprzecinkowe; nie dopisywano asercji, które pinują `EPSILON`.
