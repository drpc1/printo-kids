# Stryker: card-contract.ts i spec labiryntu (GitHub #316, D02 faza 5)

Stan: 2026-11-12. Zakres: `stryker/maze.config.json` ma teraz w `mutate` także `src/lib/maze/engine.ts` i `src/lib/card-contract.ts`, a w `commandRunner` `maze/engine.test.ts` i `card-contract.test.ts`. Limity czasu mutanta: `timeoutMS` 15000, `timeoutFactor` 1,5. Stryker nie jest bramką CI.

## Jak powtórzyć

Każdy plik osobnym wywołaniem (dwa `--mutate` w jednym wywołaniu nie sumują się, zostaje ostatni):

- `npm run mutate:maze -- --mutate "src/lib/maze/engine.ts"`
- `npm run mutate:maze -- --mutate "src/lib/card-contract.ts"`

Nie usypiaj komputera w trakcie (limity czasu są ścienne). `card-contract.ts` przebiegł też w zakresie `card-contract` zmiany `m5-stryker-new-cards`: 82,93% → 87,80%.

## Wyniki

| Plik | Mutanty | Wynik przed | Ocalałe przed | Testy dopisane | Wynik po | Ocalałe po |
| --- | --- | --- | --- | --- | --- | --- |
| `maze/engine.ts` | 285 | 86,67% | 38 | 4 testy | 95,79% | 12 (potem +1 test na teksty tras, nie liczony ponownie) |
| `card-contract.ts` | 41 | 82,93% (w m5-stryker-new-cards) | 7 | 2 testy (m5) | 87,80% | 5 |

## Dopisane testy (z luk widocznych dla rodzica albo dla wyniku karty)

- `maze/engine.test.ts`: wejście albo wyjście poza każdą krawędzią planszy (cztery strony) jest nazwane kodem pozycji i nie uruchamia sprawdzania tras (inaczej błąd krył się za wyjątkiem); cztery narożniki są na planszy (zamknięty labirynt z wejściem albo wyjściem w rogu ma `no-route`); teksty problemów (rozmiar siatki, pozycje, zamknięte ściany, otwarta ściana zewnętrzna, niezgodność ścian, brak trasy, nieosiągalne komórki, kilka tras); pierwszy z kilku błędów ścian jest tym zgłoszonym.

## Ocalałe bez testu: decyzje

- **`card-contract.ts:57` (5):** gałąź zamrażania wartości nie będących obiektami. `Object.isFrozen` zwraca `true` dla `null` i liczb, więc mutanty tego warunku nie zmieniają wyniku; równoważne.
- **`maze/engine.ts:10:32`:** wejście wstępnie wstawione do zbioru odwiedzonych; liczenie tras dalej i tak nie wraca na wejście; równoważne.
- **`:62`, `:63`:** `isEntrance` i `isExit` używane tylko w warunkach, w których wiersz jest już sprawdzony; równoważne.
- **`:105:100`:** domyślny tekst szczegółu; każdy kod w `found` ma tekst, gałąź nieosiągalna.
- **`:109` (klucz labiryntu: znak `-` i separatory):** zmieniają zapis klucza, nie to, czy dwa labirynty mają ten sam klucz (cztery znaki na komórkę, stała szerokość); równoważne.
