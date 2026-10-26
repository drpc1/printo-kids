---
change_id: sequence-easy-shapes
title: Sequence easy shapes: cross, heart, and arrow
status: planned
created: 2026-10-26
updated: 2026-10-27
archived_at: null
---

## Notes

GitHub #112 — Sekwencje: krzyżyk, serce i ukośna strzałka wśród łatwych kształtów
https://github.com/drpc1/printo-kids/issues/112

## Co zrobić
Rozszerzyć katalog łatwych kształtów sekwencji o krzyżyk, serce i strzałkę na ukos.

## Co jest teraz
Kształty sekwencji to koło, kwadrat, trójkąt i gwiazdka (`SEQUENCE_SHAPES` w `src/lib/sequence/shapes.ts`). Z nich powstają wzory `AB`, `AAB` i `ABC` na poziomach 4–6 lat. Sudoku ma już własne obrysy serca i krzyżyka (`src/lib/sudoku/shapes.ts`); sekwencje z nich nie korzystają.

## Co ma być później
Łatwe wzory z kształtów mogą wylosować także krzyżyk, serce i strzałkę na ukos. Nowe kształty są czytelne w polu ciągu, nie większe od obecnych i odróżnialne od siebie. Trzeba ustalić, czy trudniejsze reguły („7 lat”) też z nich korzystają.

## Skąd
Uwaga z używania kart, 2026-10-25.
