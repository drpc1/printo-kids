# Stryker na starym rdzeniu: wyniki (gh224)

Zakres: `src/lib/maze/generate.ts`, `sheet/layout.ts`, `last-used.ts`, `child-profiles.ts`, `sheet/character.ts`. Konfiguracja: `stryker/maze.config.json`, skrypt `npm run mutate:maze` (wąski przebieg: `-- --mutate "plik:start-end"`).

## Punkt odniesienia czasu

`npm test` na czystym stanie przed zmianą testów (2026-10-31): 782 testy, `duration_ms` 77 568 (łącznie 1 min 20 s).

## Skala przebiegu (Faza 1, dry run)

Instrumentacja: 975 mutantów w pięciu plikach. Początkowy przebieg testów pod Strykerem trwa 85 s (przy 4 procesach), a `node --test` nie przerywa po pierwszej porażce, więc pełny przebieg to rzędu 975 × 85 s / 4 ≈ 5,5 godziny, nie godzina. Faza 2 wymaga decyzji o podziale na węższe przebiegi.

## Wynik „przed” (Faza 2, 2026-10-31)

Stan kodu: commit `6dda780`, bez zmian w testach. Pięć osobnych przebiegów `npm run mutate:maze -- --mutate <plik>`, kolejno, w tle. Wynik = (zabite + timeout) / wszystkie mutanty.

| Moduł                | Mutanty | Zabite | Timeout | Ocalałe | Wynik  | Czas przebiegu |
| -------------------- | ------- | ------ | ------- | ------- | ------ | -------------- |
| `maze/generate.ts`   | 435     | 264    | 135     | 36      | 91,72% | 157 min        |
| `child-profiles.ts`  | 345     | 318    | 4       | 23      | 93,33% | 21 min         |
| `sheet/layout.ts`    | 49      | 49     | 0       | 0       | 100%   | 3 min          |
| `sheet/character.ts` | 70      | 55     | 0       | 15      | 78,57% | 4 min          |
| `last-used.ts`       | 76      | 57     | 0       | 19      | 75,00% | 5 min          |
| Razem                | 975     | 743    | 139     | 93      | 90,46% | 190 min        |

Początkowy przebieg testów: 80 s dla `generate.ts` (testy rozkładu labiryntu), ok. 7 s dla pozostałych czterech modułów, bo Stryker uruchamia tylko to, co kompiluje się do danego pliku. Czas całości wyszedł więc ok. 3 godzin, nie 5,5 (szacunek z Fazy 1 liczył 85 s dla wszystkich).

Wąski przebieg do powtórzenia: `npm run mutate:maze -- --mutate "src/lib/maze/generate.ts:30-130"`.

## Ocalałe mutanty do triage (linia:kolumna, mutator)

Surowe pliki `reports/mutation/baseline-<moduł>.json` i `survivors-<moduł>.txt` są poza gitem.

### generate (35)

```
48:7 ConditionalExpression Survived -> false
48:27 StringLiteral Survived -> ""
51:77 ArithmeticOperator Survived -> random() / level.columns
51:37 ArithmeticOperator Survived -> random() / level.rows
80:72 ObjectLiteral Survived -> {}
80:96 ArrowFunction Survived -> () => undefined
97:23 ConditionalExpression Survived -> true
97:23 EqualityOperator Survived -> col <= maze.width - 1
97:29 ArithmeticOperator Survived -> maze.width + 1
100:24 ConditionalExpression Survived -> true
100:24 EqualityOperator Survived -> row <= maze.height - 1
100:30 ArithmeticOperator Survived -> maze.height + 1
103:23 ConditionalExpression Survived -> true
103:23 EqualityOperator Survived -> col >= 0
107:25 BooleanLiteral Survived -> true
116:7 ConditionalExpression Survived -> false
116:7 LogicalOperator Survived -> candidate.width !== level.columns && candidate.hei
116:7 ConditionalExpression Survived -> false
148:21 ConditionalExpression Survived -> true
148:21 EqualityOperator Survived -> point.col >= 0
169:10 MethodExpression Survived -> route
180:40 ConditionalExpression Survived -> false
271:43 StringLiteral Survived -> ""
279:34 EqualityOperator Survived -> i >= 0
280:38 ArithmeticOperator Survived -> i - 1
289:27 ObjectLiteral Survived -> {}
289:45 ArrowFunction Survived -> () => undefined
304:9 ConditionalExpression Survived -> true
304:9 ConditionalExpression Survived -> false
304:9 EqualityOperator Survived -> rank[rootA] <= rank[rootB]
304:9 EqualityOperator Survived -> rank[rootA] >= rank[rootB]
306:16 ConditionalExpression Survived -> true
306:16 ConditionalExpression Survived -> false
306:16 EqualityOperator Survived -> rank[rootA] >= rank[rootB]
306:16 EqualityOperator Survived -> rank[rootA] <= rank[rootB]
310:7 AssignmentOperator Survived -> rank[rootA] -= 1
```

### child-profiles (22)

```
28:9 LogicalOperator Survived -> raw === null && raw === ""
28:9 ConditionalExpression Survived -> false
28:9 ConditionalExpression Survived -> false
28:25 ConditionalExpression Survived -> false
28:33 StringLiteral Survived -> "Stryker was here!"
28:37 BlockStatement Survived -> {}
33:9 ConditionalExpression Survived -> false
33:28 BlockStatement Survived -> {}
182:22 ConditionalExpression Survived -> false
249:7 ConditionalExpression Survived -> false
249:25 BlockStatement Survived -> {}
270:7 ConditionalExpression Survived -> false
270:25 BlockStatement Survived -> {}
275:7 ConditionalExpression Survived -> false
283:7 ConditionalExpression Survived -> false
289:5 ConditionalExpression Survived -> false
315:14 EqualityOperator Survived -> (value.codePointAt(index) ?? 0) >= 0xffff
323:10 ConditionalExpression Survived -> true
323:10 LogicalOperator Survived -> typeof value === "object" && value !== null || !Ar
323:10 ConditionalExpression Survived -> true
323:10 LogicalOperator Survived -> typeof value === "object" || value !== null
323:10 ConditionalExpression Survived -> true
323:39 ConditionalExpression Survived -> true
```

### character (14)

```
81:40 ArrowFunction Survived -> () => undefined
81:52 ConditionalExpression Survived -> true
81:52 ConditionalExpression Survived -> false
81:52 EqualityOperator Survived -> option.id !== id
82:7 ConditionalExpression Survived -> false
82:28 BlockStatement Survived -> {}
86:39 ArrowFunction Survived -> () => undefined
86:51 ConditionalExpression Survived -> true
86:51 ConditionalExpression Survived -> false
86:65 StringLiteral Survived -> ""
87:7 ConditionalExpression Survived -> true
87:7 ConditionalExpression Survived -> false
87:7 EqualityOperator Survived -> none === undefined
87:27 BlockStatement Survived -> {}
99:32 StringLiteral Survived -> ""
```

### last-used (18)

```
24:9 ConditionalExpression Survived -> false
24:9 LogicalOperator Survived -> raw === null && raw === ""
24:9 ConditionalExpression Survived -> false
24:25 ConditionalExpression Survived -> false
24:33 StringLiteral Survived -> "Stryker was here!"
24:37 BlockStatement Survived -> {}
31:18 ConditionalExpression Survived -> true
66:20 ConditionalExpression Survived -> false
66:20 LogicalOperator Survived -> raw === null && raw === ""
66:20 ConditionalExpression Survived -> false
66:36 ConditionalExpression Survived -> false
66:44 StringLiteral Survived -> "Stryker was here!"
68:11 BlockStatement Survived -> {}
86:7 ConditionalExpression Survived -> false
91:10 ConditionalExpression Survived -> true
86:25 BlockStatement Survived -> {}
95:7 ConditionalExpression Survived -> false
95:25 BlockStatement Survived -> {}
103:10 ConditionalExpression Survived -> true
```

`layout.ts`: brak ocalałych.
