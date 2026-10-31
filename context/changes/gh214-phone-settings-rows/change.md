---
change_id: gh214-phone-settings-rows
title: Czerwone testy phone-settings-rows na phone-360 (GitHub 214)
status: preparing
created: 2026-10-31
updated: 2026-10-31
archived_at: null
---

## Notes

GitHub 214: dwa testy Playwrighta w `tests/e2e/phone-settings-rows.spec.ts` są czerwone na projekcie `phone-360` (także na `main`, commit 27cd590): `sudoku symbol text lines up with Postać before Generuj` (linia 53) i `nonogram category gap matches the row above before Generuj` (linia 91). Odtworzenie: `npx playwright test tests/e2e/phone-settings-rows.spec.ts --project=phone-360`. Do ustalenia: czy zmienił się układ paska sudoku i nonogramu na telefonie (poprawić układ albo oczekiwania), czy test jest zbyt wrażliwy.
