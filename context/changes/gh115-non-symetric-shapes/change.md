---
change_id: gh115-non-symetric-shapes
title: Dyktando graficzne: kształty bez osi symetrii (GitHub 115)
status: implemented
created: 2026-10-30
updated: 2026-10-30
archived_at: null
---

## Notes

zaczynamy pracę nad github issue 115

GitHub issue 115: "Dyktando graficzne: kształty, które nie muszą być symetryczne". Dyktando ma dostać kolejne kształty bez osi symetrii (dziś bierze lustrzane szablony symetrii przez `templateLevel` w `src/lib/dictation/levels.ts`). Obrys nadal musi być jednym ciągiem strzałek, bez rozłączenia i bez styku samym rogiem (`outlineProblems` w `src/lib/dictation/outline.ts`). Symetria zostaje przy swoich szablonach.
