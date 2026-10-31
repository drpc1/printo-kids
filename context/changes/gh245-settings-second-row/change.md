---
change_id: gh245-settings-second-row
title: Druga linia ustawień karty na komputerze zaczyna się tam, gdzie pierwsza (GH 245)
status: implementing
created: 2026-10-31
updated: 2026-10-31
archived_at: null
---

## Notes

GitHub issue 245 (bug): na komputerze (od `sm`, 640 px) druga linia paska ustawień karty zaczyna się bardziej w lewo niż pierwsza. Przyciski („Postać”, „Poziom”, „Kategoria”) mają `px-2`, a `SettingToggle` (Kolory, Pokaż rozwiązanie) od `sm` nie ma poziomego paddingu. Ma być: każda linia zaczyna się tam, gdzie tekst „Postać”, jak na telefonie (#173). Układ telefonu bez zmian. Dotyczy stanu po Generuj (`CardPage`, `flex-wrap`).
