# Stryker dla kart M-7 (S-50): wyniki

Data: 2026-11-23. Zakres: reguły i generatory kart M-7 z `main` (kodowanie, cienie, „Od najmniejszego”, „Labirynt liczbowy”) oraz kod „Skopiuj obrazek” zmieniony w S-55. Filtr umiejętności (S-43) poza zakresem. Układ, SVG i arkusz nie są mutowane.

## Wyniki

Wynik liczy zabite i timeouty jako wykryte. „Przed” to pierwszy przebieg, „po” przebieg zawężony do pliku, w którym dopisano testy.

| Zakres (skrypt)              | Plik        | Wynik przed | Ocalałe przed | Testy dopisane | Wynik po       |
| ---------------------------- | ----------- | ----------- | ------------- | -------------- | -------------- |
| `mutate:coding`              | card.ts     | 79,12%      | 38            | 7              | 89,01% (20)    |
|                              | generate.ts | 65,64%      | —             | 0              | bez zmian      |
|                              | search.ts   | 94,00%      | —             | 0              | bez zmian      |
|                              | razem       | 77,53%      | 100           |                |                |
| `mutate:shadows` (521)       | card.ts     | 66,91%      | 45            | 5 grup         | 82,35% (24)    |
|                              | generate.ts | 72,58%      | 17            | 0              | bez zmian      |
|                              | raster.ts   | 47,68%      | 169           | 0              | bez zmian      |
|                              | razem       | 55,66%      | 231           |                |                |
| `mutate:size-order`          | card.ts     | 90,96%      | 17            | 1 asercja      | nie powtarzano |
|                              | generate.ts | 90,57%      | 5             | 0              | bez zmian      |
|                              | razem       | 90,87%      | 22            |                |                |
| `mutate:number-maze` (375)   | card.ts     | 100,00%     | 0             | 0              | —              |
|                              | generate.ts | 99,53%      | 1             | 0              | —              |
|                              | razem       | 99,73%      | 1             |                | 98 min         |
| `mutate:copy-drawing` (S-55) | card.ts     | 91,86%      | 14            | 0              | bez zmian      |
|                              | colors.ts   | 66,39%      | 41            | 1 test         | 92,62% (9)     |
|                              | generate.ts | 84,62%      | 8             | 0              | bez zmian      |
|                              | razem       | 81,79%      | 63            |                |                |

## Dopisane testy

- **Kodowanie** (`src/lib/coding/card.test.ts`): niezgodność poziomu i trybu, wiersz o złej szerokości, za mało zakrętów, druga najkrótsza droga, liczba i rodzaje obrazków w trybie Wykonaj, obrazek na drodze albo za daleko od mety, klucz rozróżnia przeszkody i obrazki.
- **Cienie** (`src/lib/shadows/card.test.ts`): zła liczba par, powtórzony obrazek, rodzina obrazków niezgodna z poziomem, próg różnicy cieni (karta odrzucona dopiero poniżej progu), dokładny kształt klucza. Pod `MUTATION_RUN=1` pętla oracle liczy 15 kart zamiast 100, bo cały plik trwał ok. minutę, a mutant kosztowałby godziny.
- **Od najmniejszego** (`src/lib/size-order/card.test.ts`): nieznana kredka (`unknown-crayon`).
- **Skopiuj obrazek** (`src/lib/copy-drawing/colors.test.ts`): niezależne wypełnianie od brzegu sprawdza, że dziura w sylwetce dostaje kolor szablonu albo zostaje biała, a reszta siatki jest pusta.

## Ocalałe bez testu

- **Kodowanie, generate.ts:** losowanie i przestrzeń wyszukiwania (jak w M-6); niekontrolowane, wynik karty waliduje `codingProblems`.
- **Kodowanie, card.ts:** `too-few-turns` na Poziomie 1 (kratka 5×5 nie zmieści prostej drogi o 6 krokach), `too-many-answers` na poziomach bez grupowania (pathMax równa się maxAnswers) i `path-not-shortest` (poprawna droga do mety nie może być dłuższa od najkrótszej): nieosiągalne albo równoważne.
- **Cienie, raster.ts (169):** rasteryzacja rysunku. Test sprawdza tylko progi różnicy cieni; mutant w jednym pikselu maski nie zmienia widocznej karty. Reguła „cienie się wyraźnie różnią” ma własne testy w card.ts.
- **Cienie, generate.ts i reszta card.ts:** losowanie, granice pętli, warunki wyboru rodziny przy 15 kartach w przebiegu; sprawdzane niezależnie przez oracle.
- **Od najmniejszego (22):** granice progów (`EPSILON`, `<` zamiast `<=`) i pętla prób.
- **Labirynt liczbowy:** jeden mutant, `reachable(...)` w `generate.ts:82`, to samo przycinanie wyszukiwania; wynik się nie zmienia (równoważny). 150 mutantów skończyło timeoutem (liczone jako wykryte, bo przepisana pętla nie kończy się).
- **Skopiuj obrazek:** granica prób, kopiowanie obiektu obrazka, ścieżki `null` przy nieznanym szablonie, które i tak wychwytuje wywołujący.

## Jak powtórzyć

Przed uruchomieniem: komputer nie usypia (przebieg shadows 3 h 20 min, number-maze 99 min, size-order i copy-drawing kilkanaście minut). Jeden zakres naraz, wynik w tle do pliku:

```
npm run mutate:coding
npm run mutate:shadows -- --mutate "src/lib/shadows/card.ts"
npm run mutate:size-order
npm run mutate:number-maze
npm run mutate:copy-drawing -- --mutate "src/lib/copy-drawing/card.ts,src/lib/copy-drawing/colors.ts,src/lib/copy-drawing/generate.ts"
```

Czytaj tylko tabelę na końcu logu. Zakres filtra umiejętności dochodzi razem z S-43.
