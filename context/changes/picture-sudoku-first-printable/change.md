---
change_id: picture-sudoku-first-printable
title: Pierwsza karta sudoku obrazkowego do druku
status: implementing
created: 2026-10-23
updated: 2026-10-24
archived_at: null
---

## Notes

będziemy tworzyli nową karte pracy z sudoku. Nie wiem jeszcze do końca jak to bedzie wygladało. Chciałabym z Tobą o tym najpier porozmwaic

### Zmiana koncepcji (2026-10-24, od użytkowniczki)

Odchodzi od PRD (US-12, US-13, FR-021, FR-022, Business Logic „Karta sudoku obrazkowego”), które opisuje 4×4 z postaciami z katalogu i legendą numerów.

- Trzy rozmiary: 4×4, 6×6 i 9×9. Dziecko rysuje / wpisuje w pustych polach.
- 7-latek robi już 9×9.
- **4×4:** jeden poziom; w każdej linii brakuje jednego obiektu. Proste kształty do narysowania, z opcją kolorową.
- **6×6:** 2 albo 3 poziomy różniące się liczbą pustych pól. Proste kształty z opcją kolorową albo cyfry.
- **9×9:** 3 poziomy różniące się liczbą pustych pól; cyfry (zwykłe sudoku) albo kształty — zmiana 2026-10-24: 9×9 też ma opcję kształtów.
- Postacie z katalogu nie są już symbolami sudoku.

### Decyzje po rozmowie (2026-10-24)

1. Dwa paski: „Rozmiar” (4×4 / 6×6 / 9×9) i „Poziom” (łatwy / średni / trudny). Sudoku odchodzi od poziomów nazwanych wiekiem.
2. 4×4: w każdym wierszu brakuje jednego pola, pozycja losowa (bez wymogu „jedno na kolumnę / kwadrat”).
3. Kształty: koło, kwadrat, trójkąt, serce, gwiazdka, krzyżyk, romb, księżyc, kropla. 4×4 bierze cztery, 6×6 sześć, 9×9 wszystkie dziewięć.
4. Kolory jak w symetrii: osobny przełącznik, domyślnie wyłączony (czarne kontury); włączony daje każdemu kształtowi stały kolor kredki.
5. Przy 6×6 i 9×9 osobny przełącznik „Kształty / Cyfry” (9×9 dostało kształty 2026-10-24).
6. Puste pola na start: 6×6 — 12 / 18 / 22 z 36; 9×9 — 35 / 45 / 52 z 81. Użytkowniczka ma wątpliwość, czy to nie za trudne; potwierdza wydruk.
7. S-18 = pierwsza drukowalna wersja: tylko 4×4 z czarnymi kształtami, ale generator i sprawdzenie jednego rozwiązania od razu dla 4×4, 6×6 i 9×9. Rozmiary, poziomy i cyfry → S-19; kolory → osobny plasterek (S-20).
