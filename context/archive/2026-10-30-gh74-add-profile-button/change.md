---
change_id: gh74-add-profile-button
title: Przycisk „Dodaj profil” odróżnia się od wierszy profili
status: archived
created: 2026-10-30
updated: 2026-10-30
archived_at: 2026-10-30T14:13:21Z
---

## Notes

zaczynamy pracę nad github issue 74

GitHub #74: „Przycisk Dodaj profil ma odróżniać się od wierszy profili”. W oknie profilu (prawy górny róg) „Dodaj profil” używa tego samego wariantu `ghost` i tej samej klasy wiersza co przyciski z imionami i „Bez profilu” (`ProfileCorner.tsx`). Ma być od razu widać, że to akcja dodawania. Sposób odróżnienia otwarty (ikona dodawania, obramowanie, pogrubienie, inny kolor; można łączyć), ustalany przy implementacji.
