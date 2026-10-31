---
change_id: gh237-maze-level
title: Poziom labiryntu w profilu przechodzi do cards.labirynt (GitHub 237)
status: archived
created: 2026-10-31
updated: 2026-10-31
archived_at: 2026-10-31T20:42:12Z
---

## Notes

GitHub issue 237: "Poziom labiryntu w profilu leży poza `cards`, więc każda karta przenosi go przez wspólne komponenty".

- Poziom labiryntu ma być w `cards.labirynt` (`CardSettingsMap`, `src/lib/card-settings.ts`), a labirynt ma korzystać z `useCardSettings`.
- `CardPage`, `ProfileCorner` i `useCardPage` nie przenoszą już `barLevel` labiryntu.
- Zapisane profile i ostatnie parametry nadal się wczytują: dawne `level` przechodzi do `cards.labirynt` (US-08). Migracja ma testy przed zmianą kodu (dane rodzica w `localStorage`).
- Ułatwia GitHub 234 (`ProfileCorner` na stronie głównej bez stanu paska labiryntu).
