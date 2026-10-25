---
change_id: teen-level-character-choice
title: Teen level character choice has no visible effect
status: archived
created: 2026-10-25
updated: 2026-10-25
archived_at: 2026-10-25T22:10:03Z
---

## Notes

GitHub issue #54: https://github.com/drpc1/printo-kids/issues/54

## Co zrobić
Wybierz poziom „nastolatek”, a potem na pasku „Postać” wybierz dowolną postać i wygeneruj kartę.

## Co jest teraz
Pasek „Postać” zostaje aktywny i pokazuje wybraną postać, ale karta nastolatka postaci nie rysuje (`showCharacter: false` w `src/lib/maze/levels.ts`; start i meta są w narożnikach). Rodzic wybiera coś, co nie ma skutku, i nie wie, co się stało.

## Co ma być później
Wybór postaci zawsze ma widoczny skutek albo jest jasno niedostępny. Dwie drogi do decyzji w nowej zmianie:

1. **Najpierw poziom, potem postać.** Przy nastolatku pasek „Postać” jest zablokowany z wyjaśnieniem, że ten poziom jej nie pokazuje.
2. **Postać także u nastolatka.** Młodsze dzieci też mogą chcieć rozwiązywać labirynt na poziomie nastolatka, a postać przy starcie w narożniku daje im znajomy punkt. Wymaga to miejsca na znak 30×30 przy narożnym wejściu, zmiany PRD (US-01, US-03: „Poziom nastolatka postaci nie pokazuje”) i testów `layout.test.ts`.

Ostatnio użyta postać i ulubiona postać profilu nie mogą zginąć przy przełączaniu na nastolatka i z powrotem.

## Skąd
Uwaga z ręcznego wydruku S-11 (`printed-maze-equal-margins`, #35), 2026-10-22.
