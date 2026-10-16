# Ręczne sprawdzenia: strona karty na telefonie (S-09, faza 6)

> Plan: `context/changes/phone-worksheet/plan.md` (Faza 6). Wersja: `main` po scaleniu drpc1/printo-kids#33 (`2605e3d`), strona produkcyjna albo `npm run preview`.
>
> Wpis w komórce: `ok`, `błąd: <opis>` albo `nie sprawdzono: <powód>`. `—` znaczy, że kryterium nie dotyczy tej przeglądarki.

## Jak drukować

- **Komputer:** Generuj → Drukuj (albo Ctrl+P / Cmd+P). Marginesy: domyślne. Nagłówki i stopki: wyłączone. Rozmiar papieru: A4. Zapis do PDF wystarczy.
- **Android (Chrome, Edge, Brave):** Drukuj na stronie → systemowe okno druku → drukarka „Zapisz jako PDF”, papier A4.
- **Android (Firefox):** Drukuj na stronie albo menu ⋮ → Drukuj → „Zapisz jako PDF”, papier A4.
- **iOS (Safari, Chrome, Brave):** Drukuj na stronie → okno druku iOS. Podgląd: rozsuń palcami miniaturę strony, potem Udostępnij → Zapisz w Plikach, żeby mieć PDF.

## Kryteria druku

1. **Jedna strona:** podgląd lub PDF ma dokładnie jedną stronę A4.
2. **Nieobcięty:** cały labirynt jest na stronie, łącznie z „Meta” i startem.
3. **10 mm:** co najmniej 10 mm białego pasa między krawędzią kartki a ścianami i ramką labiryntu. Znak postaci może wejść w ten pas (PRD, US-04).
4. **Fakty kartki:** „Meta” przy wyjściu, wybrana postać przy starcie. Na kartce nie ma paska, przycisków ani nagłówka.

## Kryteria układu (tylko telefon)

5. **Przyciski:** Generuj i Drukuj są osobno klikalne i nie nachodzą na siebie.
6. **Bez przewijania w bok:** strony nie da się przesunąć w poziomie, przed generowaniem i po nim.
7. **Profil:** przycisk Profil (także z długim imieniem) nie zasłania nagłówka, a po przewinięciu nie leży nad kartą, pionowo i poziomo.
8. **Pasek adresu:** strona przed generowaniem nie przewija się w pionie przy widocznym pasku adresu (`min-h-dvh`).

## Druk

| Platforma        | Przeglądarka | 1. Jedna strona | 2. Nieobcięty | 3. 10 mm | 4. Fakty kartki | Uwagi |
| ---------------- | ------------ | --------------- | ------------- | -------- | --------------- | ----- |
| Komputer         | Chrome       |                 |               |          |                 |       |
| Komputer         | Edge         |                 |               |          |                 |       |
| Komputer         | Brave        |                 |               |          |                 |       |
| Komputer         | Firefox      |                 |               |          |                 |       |
| Komputer (macOS) | Safari       |                 |               |          |                 |       |
| Android          | Chrome       |                 |               |          |                 |       |
| Android          | Edge         |                 |               |          |                 |       |
| Android          | Brave        |                 |               |          |                 |       |
| Android          | Firefox      |                 |               |          |                 |       |
| iOS              | Safari       |                 |               |          |                 |       |
| iOS              | Chrome       |                 |               |          |                 |       |
| iOS              | Brave        |                 |               |          |                 |       |

## Układ na telefonie

Na iOS Chrome i Brave używają silnika Safari, więc układ sprawdzamy tylko w Safari.

| Platforma | Przeglądarka | 5. Przyciski | 6. Bez przewijania w bok | 7. Profil (pion / poziom) | 8. Pasek adresu | Uwagi |
| --------- | ------------ | ------------ | ------------------------ | ------------------------- | --------------- | ----- |
| Android   | Chrome       |              |                          |                           |                 |       |
| Android   | Edge         |              |                          |                           |                 |       |
| Android   | Brave        |              |                          |                           |                 |       |
| Android   | Firefox      |              |                          |                           |                 |       |
| iOS       | Safari       |              |                          |                           |                 |       |

## Dialogi na telefonie

| Platforma | Przeglądarka | Pole imienia widoczne nad klawiaturą | Lista postaci przewija się do wszystkich 11 i „Bez postaci” | Cień przy krawędzi listy profili (≥ 10 profili) i listy postaci | Uwagi |
| --------- | ------------ | ------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------- | ----- |
| Android   | Chrome       |                                      |                                                             |                                                                 |       |
| iOS       | Safari       |                                      |                                                             |                                                                 |       |

## Automatyczny przebieg iPhone (WebKit)

| Data       | Przebieg                                                      | Wynik                                                               |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| 2026-10-16 | https://github.com/drpc1/printo-kids/actions/runs/38886623006 | ok: 19 passed, 1 skipped (desktop z myszą), w tym 4 testy iphone-13 |

## Znane ograniczenia

Błąd druku, którego nie da się naprawić w `@media print` w `src/components/WorksheetHome.astro` bez zmiany `@page` ani geometrii karty, wpisujemy tutaj z nazwą nowej zmiany (`/10x-new`).

- 2026-10-16, iOS (Chrome): wydruk na jednej stronie, ale z szerokim białym pasem (szacunek dla Letter: ok. 26 mm z boków, 35–40 mm u góry i u dołu). Przyczyna: margines drukarki iOS nakłada się na własny margines karty 10 mm. Usunięcie wymaga zmiany geometrii karty, poza S-09 → nowa zmiana `context/changes/print-printer-margins/`.

## Poprawki w trakcie fazy 6

- 2026-10-16: druk na iOS (Chrome) na dwie strony → karta zmniejsza się do obszaru druku. **Powtórzyć druk na iOS w Safari, Chrome i Brave.**
- 2026-10-16: niewidoczne przewijanie listy profili → cień przy krawędzi w oknie profili i na liście postaci.
- 2026-10-16: cień był za słaby na beżowym tle → kolor `--primary` (zielony) z kryciem 55%, wysokość 20 px.
