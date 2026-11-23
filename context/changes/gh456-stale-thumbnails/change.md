---
change_id: gh456-stale-thumbnails
title: Odśwież nieaktualne miniatury katalogu (6 plików)
status: new
created: 2026-11-23
updated: 2026-11-23
archived_at: null
---

## Notes

GitHub issue 456: `npm run thumbnails` (`scripts/build-thumbnails.mjs`, stałe ziarno) przepisuje na czystym `main` 6 zacommitowanych miniatur w `public/thumbnails/` (dyktando, nonogram, odnajmniejszego, sekwencje, symetria, szlaczki). Wynik jest deterministyczny, więc zacommitowane SVG nie odpowiadają obecnemu kodowi. Przyczyna nie zbadana (zmiany generatorów/układu/katalogu obiektów bez przebudowy miniatur albo zmiana rysowania w skrypcie). Skutek kosmetyczny. Do zrobienia: przebudować i przejrzeć różnice (także na telefonie), ustalić źródło różnic, zacommitować tylko te miniatury.
