<!-- Tytuł: Wydanie RRRR-MM-DD. Merge commitem, bez squash. -->

## Zmiany od ostatniego wydania

<!-- Lista PR-ów i krótki opis, np. z `git log --merges prod..main`. -->

-

## Testy na stagingu

Strona: printo-kids-staging (adres Workera na workers.dev).

- [ ] Druk jednej strony A4 z marginesem 10 mm: Chrome, Edge, Brave, Firefox, Safari
- [ ] Telefon: Generuj i Drukuj nie nachodzą na siebie, karta mieści się na A4
- [ ] Każdy rodzaj karty: labirynt, symetria, sekwencje, sudoku, nonogram, dyktando graficzne
- [ ] Profil dziecka i zapamiętane ustawienia działają
- [ ] Staging zwraca `X-Robots-Tag: noindex`, produkcja go nie ma

## Po merge

- [ ] Tag `vRRRR.MM.DD` (`.2` przy drugim wydaniu tego dnia)
- [ ] Produkcja otwiera `/` i `/maze`
- [ ] Po pilnej poprawce: merge `prod` → `main`
