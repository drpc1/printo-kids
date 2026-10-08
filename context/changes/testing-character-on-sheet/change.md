---
change_id: testing-character-on-sheet
title: Prove the sheet shows the chosen or restored character
status: implemented
created: 2026-10-08
updated: 2026-10-08
archived_at: null
---

## Notes

Open a change folder for the remaining proof of rollout Phase 2 of context/foundation/test-plan.md: "Kontrakt druku i faktów kartki".

Risks covered: 3. Risks 2 and 4 of this phase stay outside this change: the Chrome and Edge sheet contract is archived in print-sheet-contract, and the full manual pass on Chrome, Edge, Firefox, and Safari stays in the test plan section "Koniec projektu".

Test types planned: the same sheet contract as risk 2. The oracle is the file address of the character on the sheet, not a pixel snapshot and not a 30 by 30 rectangle.

Risk response intent:
- Risk 3: prove the sheet shows the character just chosen or restored as last-used, "Bez postaci" leaves the word Start and no character image, "Meta" stays at the end, and the print agrees with those facts. Challenge the assumption that a correctly sized mark means the right character, and that the screen view means the same print. Avoid a pixel snapshot of the drawing and a test of whether the parent understands the screen.

Do not reopen the archived print-sheet-contract plan. Do not add a browser matrix.

After creating the folder, follow the downstream continuation rule.
