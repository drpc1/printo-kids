# Frame Brief: Kształt labiryntu na kartce 5 lat

> Framing step before /10x-plan. This document captures what is *actually*
> at issue, separated from what was initially assumed.

## Reported Observation

Generator się popsuł. Prawidłowa ścieżka idzie tylko w dół. Jest masa długich ślepych uliczek bez żadnego skrętu od lewej do prawej. Wygląda to fatalnie. Prawidłowa ścieżka nigdy nie skręca do góry, a jak skręca w bok, to minimalnie. Dwa przykładowe zdjęcia kartki z wróżką na środku góry pokazują ten sam grzebień: pionowa droga przy środku i korytarze na całą szerokość.

## Initial Framing (preserved)

- **User's stated cause or approach**: Najpierw „generator się popsuł”. Potem: „zakładam, że problemem jest parametr długości ścieżki”.
- **User's proposed direction**: Brak osobnej poprawki. Labirynt ma przestać tak wyglądać.
- **Pre-dispatch narrowing**: Jedno i drugie (ścieżka i ślepe uliczki) tak samo. Za każdym Generuj. Czy chodzi tylko o kartkę na stronie, czy o wszystkie sześć poziomów — na tym etapie nierozdzielone. Zdjęcia są kartką ze startem na środku, czyli tym, co Generuj składa dziś (`lat5`).

## Dimension Map

The observation could originate at any of these dimensions:

1. **Sposób wydania budżetu 40 komórek** — prosta w kolumnie wejścia plus jednokomórkowe uskoki, aż licznik dojdzie do sufitu.
2. **Sama liczba 40** — za krótki sufit, więc droga nie ma jak zawinąć. ← późniejsza teza użytkownika
3. **Doklejanie reszty siatki** — odnogi idą prosto w bok, aż trafią w limit głębokości, a ten limit jest równy odległości od środka do krawędzi.
4. **Kontrakt PRD** — „do około 40 komórek” i „płytkie” uliczki są celem produktu, nie awarią licznika.

## Hypothesis Investigation

| Hypothesis | Evidence | Verdict |
| --- | --- | --- |
| Budżet 40 jest wydawany na pionową prostą i krótkie uskoki | `layPath` dla `lat5` woła `spine` i `extendWithJogs` (`src/lib/maze/generate.ts:217-219`, `222-227`, `277-285`). `pathMax` to 40 (`src/lib/maze/levels.ts:58-59`). Na 20 ziarnach długość jest zawsze 40. Kroki w górę: 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 0, 2, 0, 0, 1, 1, 0, 2, 0, 0. Najdłuższy bok w jednym ciągu: 2–5. Rozpiętość kolumn drogi: 3–6 z 13. | STRONG |
| Sama liczba 40 jest przyczyną kształtu | Sufit jest dotknięty zawsze, więc liczba ogranicza, ile uskoków się zmieści. Ten sam uskok jest jednokomórkowy i dokleja się do prostej w dół (`applyJog`, `generate.ts:318-321`). Podniesienie liczby zmieniłoby liczbę uskoków, nie zamieniłoby prostej w zawijaną drogę. | PARTIAL |
| Odnogi są prostymi korytarzami do krawędzi | `attachRemainder` dokleja każdą komórkę poza drogą do rodzica o głębokości +1 (`generate.ts:385-387`). `spurMax` dla `lat5` to 6 (`levels.ts:61`). Od kolumny 6 do krawędzi jest 6 komórek. Na 20 ziarnach najdłuższy prosty poziomy ciąg poza drogą ma zawsze 6. Poza drogą zostaje 168 z 208 komórek. | STRONG |
| PRD chciał krótkiej drogi i płytkich uliczek | `context/foundation/prd.md:170` — 5 lat, „do około 40 komórek”, ślepe uliczki „płytkie”. `prd.md:177` — krótka droga nie ma być zagadką wśród pułapek. Plan w „Critical Implementation Details” bierze prostą w kolumnie 6 jako sposób na odnogę ≤ 6. | STRONG |

Agenci równolegli zostali przerwani. Pomiary są z lokalnego odczytu `generate.ts`, `levels.ts` i 20 ziaren `generateMaze("lat5")`.

## Narrowing Signals

- Oba widoki (droga i uliczki), przy każdym Generuj.
- Zdjęcia mają postać na środku górnej krawędzi, więc to kartka 5 lat, jedyna, którą Generuj dziś składa.
- Długość na tych kartkach nie waha się: jest równa sufitowi 40, nie jest losowo za krótka.

## Cross-System Convention

PRD mierzy poziom alejką i długością drogi, nie liczbą zakrętów. Krótki poziom przy danej szerokości ma mieć płytkie uliczki. Konwencja nie wymaga drogi w górę. Wymaga drogi do około 40 komórek i płytkich odnóg. Obecny generator spełnia liczniki i przy tym rysuje grzebień.

## Reframed (or Confirmed) Problem Statement

> **The actual problem to plan around is**: budżet 40 komórek na poziomie 5 lat jest w całości wydawany na pionową prostą z krótkimi uskokami, a reszta kartki (168 komórek) dokleja się jako proste korytarze o głębokości 6, czyli dokładnie do krawędzi.

Sama liczba 40 jest sufitem z PRD i jest dotykana przy każdym ziarnie, więc teza o parametrze długości jest w połowie trafna: przez nią droga zajmuje mały pasek przy środku. Nie jest trafna jako jedyna przyczyna kształtu. Kroki w górę są rzadkie albo ich nie ma, a bok jest krótki, bo uskok dokleja się do prostej w dół, a nie dlatego, że 40 komórek nie da się zawinąć. Długie proste uliczki są skutkiem tego, że limit odnogi równa się odległości od kolumny wejścia do krawędzi.

Po sprawdzeniu na żywej kartce (długość 40, 0 kroków w górę, rozpiętość 4 kolumn, prosta uliczka 6) użytkownik ustalił kierunek poprawki: szerokość alejki zostaje, długość drogi może być wyraźnie luźniejsza, droga ma skręcać w każdą stronę, prosty odcinek ma być wyjątkiem, a właściwa ścieżka nie ma trzymać się środka kartki.

## Confidence

- **HIGH** — pomiary na 20 ziarnach są jednorodne, a zdjęcia zgadzają się z grzebieniem przy środku.

## What Changes for /10x-plan

Plan ma zmienić sposób kładzenia drogi i odnóg, nie szerokość alejki. Długość może wyjść z luźniejszego pasma. Samo podniesienie `pathMax` przy prostej i uskokach zostawia drogę przy środku.

## References

- Source files: `src/lib/maze/generate.ts:204-321`, `src/lib/maze/generate.ts:342-387`, `src/lib/maze/levels.ts:52-66`
- Product table: `context/foundation/prd.md:166-177`
- Related research: `context/changes/maze-difficulty-levels/research.md`
- Investigation tasks: przerwane przed zwrotem; pomiary lokalne, 20 ziaren `lat5`
