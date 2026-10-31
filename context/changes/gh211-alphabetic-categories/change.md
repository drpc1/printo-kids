---
change_id: gh211-alphabetic-categories
title: Lista kategorii obiektów alfabetycznie (GitHub 211)
status: implementing
created: 2026-10-31
updated: 2026-10-31
archived_at: null
---

## Notes

GitHub issue 211 „Lista kategorii alfabetycznie”: zaczynamy pracę nad github issue 211.

Kategorie na liście „Kategoria” (symetria, nonogram, dyktando) idą alfabetycznie po polskich nazwach, „Wszystkie” zostaje pierwsze. Nowa kategoria (np. „Kształty”) wpada w swoje miejsce alfabetu, nie na koniec. Losowanie obiektów i zapisana kategoria bez zmian. Kolejność dziś: `OBJECT_CATEGORIES` w `src/lib/symmetry/template-format.ts`; test w `src/lib/object-categories.test.ts`.
