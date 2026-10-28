# Wyniki Strykera i jak powtórzyć przebieg

## Jak uruchomić

Każdy zakres ma własny plik konfiguracji w `stryker/` (Stryker 10 nie przyjmuje nadpisania komendy z linii poleceń, ale przyjmuje `--mutate`):

```bash
npm run mutate:dictation
npm run mutate:sudoku
npm run mutate:nonogram
npm run mutate:sequence
npm run mutate:symmetry
npm run mutate:local-data
```

Wąski przebieg: dopisz zakres po `--`, np. `npm run mutate:dictation -- --mutate "src/lib/dictation/generate.ts:177-190"`. Raport HTML trafia do `reports/mutation/` (ignorowany przez git). Stary rdzeń (`maze/generate`, `sheet/layout`, `last-used`, `child-profiles`, `sheet/character`) nadal obsługuje `stryker.config.json` (`npx stryker run`).

Zmienne ustawiane przez konfiguracje przez `scripts/with-env.mjs` (to samo na Windows i Linuksie):

- `MUTATION_RUN=1` — wyłącza asercje wall-clock (`< 5000 ms` w nonogramie, sekwencjach i sudoku). Kod instrumentowany jest kilka razy wolniejszy, więc budżet czasu zabijałby mutanty z niewłaściwego powodu (przykład: trudny nonogram 12,4 s zamiast 5 s zatrzymał pierwszy przebieg). `npm test` zachowuje wszystkie budżety czasu.
- `SEQUENCE_ORACLE_SEEDS=5` (tylko sekwencje) — mniej ziaren oracle (domyślnie 120), mniej ziaren generacji (30 zamiast 300) i co siódmy zestaw trzech luk w teście dwuznaczności; pełny `npm test` bez zmian (ok. 47 s).

## Dowód działania faz 1 (wąskie zakresy, 2026-10-27)

To są próby potoku, nie wyniki faz: zakresy są małe, a ocalałe mutanty z nich zostają do przeglądu w fazach 2–6.

| Zakres     | plik:linie                      | Mutanty | Czas przebiegu | Uwagi                                                                                                 |
| ---------- | ------------------------------- | ------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| dictation  | `dictation/generate.ts:177-190` | 29      | 45 s           | część mutantów ocalała (do przeglądu w fazie 2)                                                       |
| sudoku     | `sudoku/generate.ts:160-175`    | 13      | 41 s           | część mutantów ocalała (faza 3)                                                                       |
| nonogram   | `nonogram/solve.ts:1-30`        | 32      | 3 min 20 s     | po `MUTATION_RUN=1`; 15 timeoutów, 4 ocalałe (faza 4)                                                 |
| sequence   | `sequence/generate.ts:137-150`  | 24      | 3 min 23 s     | 100%: 10 zabitych, 14 timeoutów; pierwszy przebieg z 10 ziarnami i 300 ziarnami generacji trwał 8 min |
| symmetry   | `symmetry/generate.ts:285-300`  | 15      | 27 s           | 1 ocalały (faza 5)                                                                                    |
| local-data | `card-settings.ts:94-107`       | 9       | 23 s           | 9 z 9 zabitych                                                                                        |

## Czasy testów i szacunki

- Kod instrumentowany jest ok. 8 razy wolniejszy od zwykłego uruchomienia testów (sekwencje: 2,4 s zwykle, 20 s w pierwszym przebiegu Strykera; nonogram: 2,8 s zwykle, 17 s). Czas przebiegu ≈ mutanty × czas komendy / 4 procesy, a mutant, który powoduje długą pętlę, kończy się dopiero po limicie czasu (timeout liczy się jako zabity).
- Szacunki z `research.md` (kilka minut na zakres) były zaniżone dla nonogramu i sekwencji: pełny zakres może zająć kilkanaście do kilkudziesięciu minut. Przebiegi robimy po jednym zakresie, w tle.
- Gęstość: 9 mutantów na 14 linii (`card-settings.ts`), 21 na 7 (`favoriteDiffers`), 24 na 14 (generator sekwencji).

## Przegląd ocalałych mutantów

Wypełniany w fazach 2–6: dla każdego ocalałego mutanta jedna decyzja (asercja dopisana albo „równoważny/kosmetyczny” z uzasadnieniem).

## Faza 2: dyktando (`dictation/generate.ts:177-248`, `dictation/outline.ts:120-260`)

Przebieg 1 (przed dopisaniem testów z ocalałych): 327 mutantów, 296 zabitych, 11 timeoutów, 20 ocalałych (93,9%), 6 min 2 s.
Przebieg 2 (po testach): 327 mutantów, 303 zabite, 11 timeoutów, 13 ocalałych (96,0%), 5 min 6 s. `generate.ts` 97,9% (3 ocalałe), `outline.ts` 94,6% (10 ocalałych).

Testy dopisane dla ocalałych mutantów, które były błędem widocznym dla rodzica albo zmieniały wynik karty:

| Mutant (przebieg 1)                                                         | Decyzja           | Test                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generate.ts:194` zamknięcie obrysu sprawdzało tylko wiersz                 | asercja           | ścieżka kończąca się w tym samym wierszu, ale innej kolumnie, jest `not-closed`                                                                                                                                                                                                                                                     |
| `generate.ts:247` `pick` (3 mutanty: `max`, `/`, `+1`)                      | asercja dla 2 z 3 | `max` i `/` zawsze wybierały ten sam obiekt (karty bez losowości): test „200 losowań daje co najmniej 5 różnych obrysów na każdym poziomie”; `+1` (wyjście poza zakres tylko dla `random() === 1`): test z losowaniem tuż poniżej 1, ocalały mutant `count + 1` jest równoważny (`Math.floor(random() * count)` nie osiąga `count`) |
| `outline.ts:123` pusta sylwetka nie była „disconnected”                     | asercja           | pusta sylwetka daje `["disconnected"]`                                                                                                                                                                                                                                                                                              |
| `outline.ts:134` brak wykrycia dotknięcia w narożniku po drugiej przekątnej | asercja           | dwa kształty z dotknięciem na obu przekątnych                                                                                                                                                                                                                                                                                       |
| `outline.ts:145` pojedyncza komórka uznawana za rozłączną                   | asercja           | pojedyncza komórka przechodzi                                                                                                                                                                                                                                                                                                       |
| `outline.ts:211` limit kroków `+4` → `-4` zrywał obrys pojedynczej komórki  | asercja           | obrys pojedynczej komórki: R1 D1 L1 U1                                                                                                                                                                                                                                                                                              |

Ocalałe po przebiegu 2 (13), każdy z decyzją „nie dopisujemy asercji”:

| Mutant                                                                | Powód                                                                                                            |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `generate.ts:199:63` (`end.y === start.y` → `true` w `slice`)         | wpływa tylko na kartę już oznaczoną `not-closed`; wynik walidacji ten sam (równoważny)                           |
| `generate.ts:214:7` (`walked.length !== boundary.size` → `false`)     | pozostałe kontrole (`repeated-vertex`, `not-closed`) odrzucają obrys przechodzony dwa razy; zbędna obrona w głąb |
| `generate.ts:247:19` (`count - 1` → `count + 1`)                      | równoważny: `random()` < 1, więc `floor(random() * count)` nigdy nie przekracza `count - 1`                      |
| `outline.ts:127`, `outline.ts:128` (`<=` → `<` w pętli narożników)    | równoważne: na ostatnim wierszu i kolumnie wierzchołków nie ma dwóch przeciwległych komórek                      |
| `outline.ts:214:37` (`heading = "right"` → `""`)                      | równoważny: pierwszy krok ustawia kierunek bez użycia `heading`                                                  |
| `outline.ts:215:22`, `215:36` (granica i krok pętli zabezpieczającej) | strażnik przed nieskończoną pętlą; w normalnym przebiegu pętla kończy się przez `return`                         |
| `outline.ts:217:9` (`step === 0` → `false`)                           | równoważny: z `heading = "right"` pierwszym kandydatem w prawo i tak jest krawędź górna                          |
| `outline.ts:224:9`, `224:29` (gałąź `next === undefined`)             | strażnik błędu; po usunięciu kod i tak się wywraca; dyktando zwraca wtedy `null`                                 |
| `outline.ts:225:23`, `240:19` (teksty błędów)                         | kosmetyczne                                                                                                      |
