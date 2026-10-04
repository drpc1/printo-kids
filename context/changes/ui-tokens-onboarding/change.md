---
change_id: ui-tokens-onboarding
title: Ui tokens onboarding
status: impl_reviewed
created: 2026-10-03
updated: 2026-10-04
archived_at: null
---

## Notes

Motyw shadcn ma pochodzić z tweakcn (https://tweakcn.com): eksport Tailwind v4 + OKLCH, wklejony w `src/styles/global.css` (`:root`, `.dark`, ewentualne nowe klucze w `@theme inline`). `@page` zostaje w `WorksheetHome.astro`. Widok kartki i ekrany auth dziś nie czytają tokenów shadcn, więc sam eksport ich nie przemaluje.
