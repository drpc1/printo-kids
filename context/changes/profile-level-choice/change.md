---
change_id: profile-level-choice
title: Wybór poziomu trudności przy tworzeniu i edycji profilu dziecka
status: impl_reviewed
created: 2026-10-17
updated: 2026-10-17
archived_at: null
---

## Notes

Zgłoszenie użytkowniczki po `maze-difficulty-levels`: profil ma pole `level`, ale panele „Dodaj profil” i „Edytuj” pokazują tylko tekst „Poziom: …”, a zapisany poziom to zawsze poziom z paska. Ma być wybór poziomu jak wybór postaci: przycisk, który otwiera listę sześciu poziomów z `LEVELS`.

Równolegle `level-bar-fixes` zmienia pasek kartki w `WorksheetGenerator.tsx`. Ta zmiana dotyka tam tylko `handleFavoriteSaved`, bez układu paska.
