---
change_id: gh316-stryker-contract-maze
title: Stryker: mutacja wąska na card-contract.ts i specu labiryntu (D02 faza 5)
status: new
created: 2026-11-12
updated: 2026-11-12
archived_at: null
---

## Notes

GitHub #316. `card-contract.ts` i `maze/engine.ts` dopisane do `stryker/maze.config.json`; wąski przebieg `npm run mutate:maze -- --mutate "src/lib/card-contract.ts" --mutate "src/lib/maze/engine.ts"`. Wcześniejszy przebieg `card-contract.ts` w osobnym zakresie (m5-stryker-new-cards): 82,93% → 87,80%.
