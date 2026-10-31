# Sprawdzenia ręczne: wydruk z marginesem drukarki

Wartość końcowa limitu wysokości w druku na telefonie: `108vh`. `116vh` (faza 1) mieściło się na jednej stronie w Safari i Chrome iOS, ale Brave iOS dokłada nagłówek strony i drukował 2 strony (druga pusta). Diagnostyka (`print-probe`, 2026-10-31) pokazała, że w Brave i Safari zapytania `hover: none` i `max-width: 175mm` są spełnione identycznie, więc różnica to miejsce na stronie, nie warunek. Test w Brave: 104vh → 1 strona (ok. 160 mm), 108vh → 1 strona (ok. 166 mm), 112vh → 2 strony (kolejność zrzutów wyprowadzona z godzin).

| Urządzenie             | Przeglądarka                  | Papier | Karta                       | Limit | Liczba stron | Szerokość labiryntu              | Data       |
| ---------------------- | ----------------------------- | ------ | --------------------------- | ----- | ------------ | -------------------------------- | ---------- |
| iPhone (użytkowniczki) | Safari                        | A4     | labirynt Poziom 3           | 116vh | 1            | ok. 162 mm                       | 2026-10-31 |
| iPhone                 | Safari                        | A4     | labirynt Poziom 3           | 116vh | 1            | ok. 155 mm (ze zrzutu)           | 2026-10-31 |
| iPhone                 | Chrome iOS                    | A4     | labirynt Poziom 3           | 116vh | 1            | ok. 162 mm                       | 2026-10-31 |
| iPhone                 | Brave iOS                     | A4     | labirynt Poziom 3           | 116vh | **2**        | druga strona pusta               | 2026-10-31 |
| iPhone                 | Brave iOS                     | A4     | labirynt Poziom 3           | 112vh | **2**        | ok. 172 mm (ze zrzutu)           | 2026-10-31 |
| iPhone                 | Brave iOS                     | A4     | labirynt Poziom 3           | 108vh | 1            | ok. 166 mm (ze zrzutu)           | 2026-10-31 |
| iPhone                 | Brave iOS                     | A4     | labirynt Poziom 3           | 104vh | 1            | ok. 160 mm (ze zrzutu)           | 2026-10-31 |
| iPhone                 | Safari, Chrome iOS, Brave iOS | A4     | labirynt Poziom 3           | 108vh | 1            | potwierdzone słownie po zmianie  | 2026-10-31 |
| iPhone                 | Safari                        | A4     | labirynt Poziom 6, symetria | 108vh | 1            | potwierdzone słownie, bez zrzutu | 2026-10-31 |
| Komputer               | Chrome                        | A4     | labirynt                    | 100vh | 1            | bez zmian (190 mm)               | 2026-10-31 |

Nie sprawdzono ręcznie: sekwencje, sudoku, nonogram i dyktando na iPhonie (karty rysują ten sam SVG całej strony A4, limit jest wspólny, ale nie zmierzono). Poziom 6 i symetria w Chrome iOS i Brave iOS nie zostały sprawdzone osobno.
