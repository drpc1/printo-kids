# Archive SHA repoint

- **Date**: 2026-10-28
- **Target**: origin/main @ `956c69b4faca180182bd025d6404ef8f027a2697`
- **PR**: https://github.com/drpc1/printo-kids/pull/168
- **Decision**: Update and archive
- **Rows**: 7

The Progress suffixes were the commits on `sequence-shape-colors` before the change was cherry-picked onto `origin/main`. Those old commits are not ancestors of `origin/main`. Pull request #168 merged the cherry-picks (merge `54504f8`). Each phase's rows now point at that phase's commit on the merged branch.

| Row | Old suffix | New SHA |
| --- | --- | --- |
| 1.1 | e1a1522 (`e1a1522dc773d135eadcb9b391907dff61671439`) | `82067ce4b9e9377b7509a40b28d5260f3b463614` feat(sudoku-shape-list): Geometria rzędu (p1) |
| 1.2 | e1a1522 (`e1a1522dc773d135eadcb9b391907dff61671439`) | `82067ce4b9e9377b7509a40b28d5260f3b463614` |
| 1.3 | e1a1522 (`e1a1522dc773d135eadcb9b391907dff61671439`) | `82067ce4b9e9377b7509a40b28d5260f3b463614` |
| 2.1 | af4f490 (`af4f490e77684dd827705fd05863f30d035a3149`) | `8b85caf23ecc305c50634497c8f3690eafb667ce` feat(sudoku-shape-list): Rysowanie (p2) |
| 2.2 | af4f490 (`af4f490e77684dd827705fd05863f30d035a3149`) | `8b85caf23ecc305c50634497c8f3690eafb667ce` |
| 3.1 | f7461d0 (`f7461d0ddeaecc56b207a2374878ac2646739224`) | `65e53a3b038aded08578262fac3488f6e3ad7002` chore(sudoku-shape-list): Przeglądarka i PRD (p3) |
| 3.2 | f7461d0 (`f7461d0ddeaecc56b207a2374878ac2646739224`) | `65e53a3b038aded08578262fac3488f6e3ad7002` |
