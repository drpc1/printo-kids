---
change_id: nonogram-sizes
type: research
date: 2026-10-25
---

# Research: nonogram-sizes (S-24)

## Wynik sondy solvera (po S-21, 22 obiekty na każdym poziomie szablonów)

| Rozmiar      | Warianty z jednym rozwiązaniem bez zgadywania | Czas wszystkich wariantów | Najdłuższe Generuj |
| ------------ | --------------------------------------------- | ------------------------- | ------------------ |
| mały 8×12    | 114 z 116                                     | 92 ms                     | 2,2 ms             |
| średni 12×15 | 119 z 124                                     | 161 ms                    | 4,1 ms             |
| duży 18×24   | 184 z 216                                     | 756 ms                    | 7,8 ms             |

W dużym `kot` i `tulipan` nie mają żadnego wariantu, który przechodzi; generator ich tam nie pokaże. Dziś test „każdy szablon ma przechodzący wariant” dotyczy tylko średniego.

## Kod, który S-24 dotyka

- `src/lib/nonogram/sizes.ts` — trzy rozmiary; `DEFAULT_NONOGRAM_SIZE_ID` na sztywno w `NonogramGenerator.tsx` i `scripts/build-thumbnails.mjs`.
- `NonogramGenerator.tsx` — pasek: Pokaż rozwiązanie, kategoria (S-26); wzorzec wyboru: `SudokuGenerator.tsx` / `SudokuChoice.tsx`.
- Makiety: `scripts/nonogram-mockup.mjs` (klasyczne rozmiary), `scripts/nonogram-simple-mockup.mjs` (prosty wariant).

## Decyzja użytkowniczki (2026-10-25, po makiecie)

Klasyczny nonogram jest za trudny dla przedszkolaków. Jedna karta „Nonogram”, poziomy **łatwy, średni, trudny** (nie wiek, nie rozmiar):

- **łatwy:** prosty wariant 8×12, kratka 14 mm; każdy rząd opisany w całości znaczkami (biały, szary, czarny kwadracik z liczbą kratek), bez liczb przy kolumnach; trzy tony (biały zostaje pusty, szary, czarny). Dziecko koloruje według znaczków. Makieta: `mockup-prosty.html`.
- **średni:** klasyczny 12×15 (to, co dziś jest na stronie).
- **trudny:** klasyczny 18×24 („nastolatek”).
- Grubsza linia co 5 kratek (przy 5/10/15) na każdym poziomie.
- Klasyczny 8×12 odpada (jego miejsce zajmuje łatwy).

## Otwarte

- Skąd tony prostego wariantu: kolory kredek szablonu zmapowane na czarny/szary w kodzie (ciemne → czarny, reszta → szary) czy dopisane w szablonach. Mapowanie zostawia niektóre obiekty (rakieta) prawie całe szare; sprawdzić rozkład.
- Czy łatwy ma „Pokaż rozwiązanie” (tak, jak pozostałe).
- Miniatura w katalogu zostaje średnia.
