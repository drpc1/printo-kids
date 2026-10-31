---
change_id: gh234-profile-on-homepage
title: Profil klikalny na stronie głównej (GitHub 234)
status: implemented
created: 2026-10-31
updated: 2026-10-31
archived_at: null
---

## Notes

GitHub issue 234: "Z profilu na stronie głównej nie można wejść w profil".

Strona główna pokazuje informacje o profilu, ale nie da się w niego wejść (zmiana, edycja, utworzenie). `ProfileCorner` jest używany tylko w `WorksheetGenerator.tsx`. Ma być klikalny także na głównej i działać tak samo jak w generatorach (wybór, dodanie, edycja, usunięcie, „Bez profilu"). Wybrany profil zostaje po przejściu katalog ↔ generatory (US-05). Wymaga wydzielenia `ProfileCorner` tak, by działał bez `WorksheetGenerator`: dziś dostaje stan paska (postać, poziom) jako propsy, więc na głównej trzeba go uprościć. Wybrana opcja: ten sam `ProfileCorner` w tym samym rogu.
