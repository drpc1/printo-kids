---
change_id: print-printer-margins
title: Wydruk z iPhone'a bez podwójnego marginesu
status: implemented
created: 2026-10-16
updated: 2026-10-31
archived_at: null
---

## Notes

Znalezione w fazie 6 S-09 (`phone-worksheet`), 2026-10-16. Druk z iPhone'a (Chrome) mieści się już na jednej stronie, ale biały pas jest bardzo szeroki.

Przyczyna: iOS ignoruje `@page { margin: 0 }` i dokłada margines drukarki (ok. 12–13 mm), a karta i tak ma własny margines 10 mm wokół labiryntu. W S-09 karta w druku zmniejsza się do obszaru druku (`max-width: 100%`, `max-height: 100vh` w `@media print`, `src/components/WorksheetHome.astro`), więc oba marginesy się sumują. Do tego proporcje A4 na kartce Letter dają ok. 5 mm z boków. Szacunek dla Letter: ok. 26 mm z boków, 35–40 mm u góry i u dołu (z pasem na start, postać i „Meta”).

Do rozstrzygnięcia w planie: czy w druku z marginesem drukarki karta ma mniejszy margines wewnętrzny (zmiana geometrii, `layoutSheet` / inset), osobny wariant karty do druku, czy coś innego. Koordynacja z S-07 (`maze-difficulty-levels`), który zmienia siatkę. PRD wymaga co najmniej 10 mm marginesu wokół ścian labiryntu, liczonego od krawędzi kartki.

Pomiary i metoda (Chromium z emulowanym obszarem druku): `context/changes/phone-worksheet/plan.md`, nota w fazie 6.

Issue: https://github.com/drpc1/printo-kids/issues/38

2026-10-20, iOS (Safari): Safari dokłada w marginesie drukarki adres strony i numer strony. CSS ich nie wyłącza, a okno druku iOS nie ma takiej opcji. Do uwzględnienia przy wyborze geometrii druku (zabierają część marginesu drukarki).

2026-10-31, faza 1 (iPhone użytkowniczki, Safari, A4): próba w druku pokazała, że iOS spełnia `max-width: 170mm` i `max-height: 240mm`, choć obszar druku ma ok. 197 × 269 mm, a `100vh` to ok. 219 mm na kartce (ok. 82 % wysokości obszaru druku). Kartę ograniczało `max-height: 100vh`: labirynt Poziomu 3 ok. 140 mm szerokości. Warianty: `116vh` → ok. 162 mm, jedna strona; `122vh` → ok. 171 mm, jedna strona, ok. 1,5 mm zapasu; szerokość 100 % bez limitu → dwie strony. Plan przepisany na `116vh` w `@media print and (hover: none) and (max-width: 175mm)`. Po wdrożeniu: iPhone (Safari) jedna strona, labirynt jak w wariancie `116vh`; komputer (Chrome) bez zmian.

2026-10-31, faza 2: `tests/e2e/print-margins.spec.ts` (Chromium, `emulateMedia` print) pilnuje, że komputer (też z viewportem 170×240 mm) zostaje przy `max-height: 100vh`, a ekran dotykowy z viewportem 170×240 mm dostaje `116vh`. Przeszło 3 z 3; po cofnięciu wariantu do `100vh` przypadek dotykowy się czerwieni.

2026-10-31, faza 3: Brave iOS dokłada nagłówek strony i przy `116vh` drukował 2 strony (druga pusta); zapytania `hover: none` i `max-width: 175mm` były spełnione tak samo jak w Safari (strona diagnostyczna). W Brave: `104vh` i `108vh` dają 1 stronę, `112vh` 2. Wartość końcowa to `108vh` (Safari, Chrome iOS i Brave iOS: Poziom 3, 1 strona). Tekst planu i `plan-brief.md` wciąż mówią `116vh`; obowiązuje `108vh`. Reguła jest wspólna dla wszystkich kart (`#worksheet-home svg`), ręcznie sprawdzono labirynt i symetrię. Szczegóły: `manual-checks.md`.
