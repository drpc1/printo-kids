---
change_id: maze-difficulty-levels
title: Maze difficulty levels
status: impl_reviewed
created: 2026-10-11
updated: 2026-10-16
archived_at: null
---

## Notes

<!-- Free-form notes for this change: links, ad-hoc context, decisions that don't belong in research/frame/plan. -->

Generator i bramkę `mazeForSheet` z fazy 1 (pasmo długości, limit odnogi) zastąpił 2026-10-16 `random-maze-generator`: poziom to siatka i algorytm losowania, a bramka sprawdza tylko siatkę i jedną drogę. Fazy 2 i 3 tego planu zostają.

Kolejność mergowania do `main` (review 2026-10-16, F4): najpierw `dialog-close-button`, potem `feat/maze-winding` z rozwiązaniem konfliktów w `WorksheetGenerator.tsx`, `ProfileCorner.tsx` i `print-contract.test.ts` (krzyżyk także w dialogu „Poziom:”), na końcu phone-worksheet z ręcznym sprawdzeniem paska z czterema kontrolkami na telefonie.
