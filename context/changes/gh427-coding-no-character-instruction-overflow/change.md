---
change_id: gh427-coding-no-character-instruction-overflow
title: Kodowanie bez postaci: polecenie wychodzi poza szerokość kartki
status: impl_reviewed
created: 2026-11-23
updated: 2026-11-23
archived_at: null
---

## Notes

GitHub issue 427 (drpc1/printo-kids): Kodowanie bez postaci: polecenie wychodzi poza szerokość kartki. Bez postaci (wybór „Brak”) `CodingSheet` rysuje całe polecenie jedną linijką `CentredText` (7 mm), zamiast łamać je jak inne karty (`instructionLines` w `src/lib/sheet/speech.ts`). Dotyczy też miniatury katalogu (`scripts/build-thumbnails.mjs` → `public/thumbnails/kodowanie.svg`). Pytanie użytkowniczki: czemu ta karta nie korzysta z tych samych mechanizmów co inne karty.
