# Plan: postacie WebP 512 px (GitHub 343)

Zakres minimalny: konwersja i aktualizacja odwołań, bez refaktorów.

- Postacie rysuje SVG `<image href>` (30 mm labirynt, 26 mm przy poleceniu); 512 px = ok. 435 dpi przy 30 mm, więc wystarcza do druku 300 dpi. Marginesy `contentLeft/Right` to ułamki boku, więc zostają.
- Oryginały PNG 1024 px przeniesione do `context/ideas/postacie/` (poza `public` i bundlem).
- `scripts/characters-webp.mjs` (sharp, jak `money-cut-images.mjs`) robi WebP 512 (q85, alpha q90) z tego folderu.
- `src` w `CHARACTER_CHOICES`, testy jednostkowe i e2e: `.png` → `.webp`.

## Progress

- [x] Konwersja i skrypt
- [x] Odwołania w kodzie i testach
- [x] lint, depcruise, test, astro check, build
- [x] impl-review, PR do main
