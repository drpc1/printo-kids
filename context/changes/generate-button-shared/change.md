---
change_id: generate-button-shared
title: Wspólny GenerateButton zamiast kopii w generatorach
status: implemented
created: 2026-10-24
updated: 2026-10-24
archived_at: null
---

## Notes

GitHub issue #81 (drpc1/printo-kids), "Wspólny GenerateButton zamiast kopii w generatorach".

Usunąć trzy lokalne kopie `GenerateButton` i `ACTION_BUTTON_CLASS` (WorksheetGenerator, SymmetryGenerator, SudokuGenerator) i przepiąć je na wspólny `@/components/GenerateButton` (dodany w S-16, PR #82; dziś używa go tylko SequenceGenerator). Przycisk Drukuj ma brać stałą `ACTION_BUTTON_CLASS` ze wspólnego pliku. Bez zmiany wyglądu ani zachowania.

Zasady: najpierw porównać kopie ze wspólnym plikiem; przy jakiejkolwiek różnicy (klasa, prop) przerwać i zapytać. Nie ruszać zapisów `className={cn("…")}` czytanych przez `src/lib/sheet/print-contract.test.ts`. PR: `Closes #81`.
