---
change_id: graphic-dictation-show-solution
title: Show solution on the graphic dictation sheet
status: archived
created: 2026-10-25
updated: 2026-10-26
archived_at: 2026-10-26T08:02:36Z
---

## Notes

GitHub issue #119: https://github.com/drpc1/printo-kids/issues/119

## Co zrobić
Na stronie dyktanda graficznego dodać przełącznik „Pokaż rozwiązanie”, tak jak na nonogramie.

## Co jest teraz
Nonogram (`NonogramGenerator.tsx`) ma przełącznik, który dorysowuje gotowy obrazek na karcie. Nowa karta wyłącza go z powrotem, żeby dziecko widziało pustą planszę. Dyktando pokazuje tylko strzałki i pustą kratkę; rozwiązania nie da się włączyć na stronie.

## Co ma być później
Rodzic włącza „Pokaż rozwiązanie” i na podglądzie widać obrys, który dziecko ma narysować. Wydruk zostaje pustą kratką. Nowe Generuj zaczyna od wyłączonego rozwiązania. Samo dyktando (strzałki, kratka, poziomy) zostaje bez zmian.

## Skąd
Uwaga z używania kart, 2026-10-25.
