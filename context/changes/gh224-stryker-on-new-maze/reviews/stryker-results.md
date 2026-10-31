# Stryker na starym rdzeniu: wyniki (gh224)

Zakres: `src/lib/maze/generate.ts`, `sheet/layout.ts`, `last-used.ts`, `child-profiles.ts`, `sheet/character.ts`. Konfiguracja: `stryker/maze.config.json`, skrypt `npm run mutate:maze` (wąski przebieg: `-- --mutate "plik:start-end"`).

## Punkt odniesienia czasu

`npm test` na czystym stanie przed zmianą testów (2026-10-31): 782 testy, `duration_ms` 77 568 (łącznie 1 min 20 s).

## Skala przebiegu (Faza 1, dry run)

Instrumentacja: 975 mutantów w pięciu plikach. Początkowy przebieg testów pod Strykerem trwa 85 s (przy 4 procesach), a `node --test` nie przerywa po pierwszej porażce, więc pełny przebieg to rzędu 975 × 85 s / 4 ≈ 5,5 godziny, nie godzina. Faza 2 wymaga decyzji o podziale na węższe przebiegi.
