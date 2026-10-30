---
change_id: gh163-heading-and-title
title: Nagłówek strony karty to nazwa karty, tytuł zakładki to „PrintoKids - nazwa”
status: implemented
created: 2026-10-30
updated: 2026-10-30
archived_at: null
---

## Notes

Poprawka do #199 (GitHub issue 163). Tytuł zakładki na stronie karty ma format „PrintoKids - {nazwa karty}” (np. „PrintoKids - Labirynt”), a nie samą nazwę. Duży nagłówek h1 nad generatorem (`GeneratorShell.astro`), dziś „PrintoKids”, ma być samą nazwą karty. Katalog na `/` zostaje „PrintoKids” w obu miejscach. Nagłówek jest ukryty przy druku.
