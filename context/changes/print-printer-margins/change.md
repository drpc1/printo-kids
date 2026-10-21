---
change_id: print-printer-margins
title: Wydruk z iPhone'a bez podwójnego marginesu
status: new
created: 2026-10-16
updated: 2026-10-20
archived_at: null
---

## Notes

Znalezione w fazie 6 S-09 (`phone-worksheet`), 2026-10-16. Druk z iPhone'a (Chrome) mieści się już na jednej stronie, ale biały pas jest bardzo szeroki.

Przyczyna: iOS ignoruje `@page { margin: 0 }` i dokłada margines drukarki (ok. 12–13 mm), a karta i tak ma własny margines 10 mm wokół labiryntu. W S-09 karta w druku zmniejsza się do obszaru druku (`max-width: 100%`, `max-height: 100vh` w `@media print`, `src/components/WorksheetHome.astro`), więc oba marginesy się sumują. Do tego proporcje A4 na kartce Letter dają ok. 5 mm z boków. Szacunek dla Letter: ok. 26 mm z boków, 35–40 mm u góry i u dołu (z pasem na start, postać i „Meta”).

Do rozstrzygnięcia w planie: czy w druku z marginesem drukarki karta ma mniejszy margines wewnętrzny (zmiana geometrii, `layoutSheet` / inset), osobny wariant karty do druku, czy coś innego. Koordynacja z S-07 (`maze-difficulty-levels`), który zmienia siatkę. PRD wymaga co najmniej 10 mm marginesu wokół ścian labiryntu, liczonego od krawędzi kartki.

Pomiary i metoda (Chromium z emulowanym obszarem druku): `context/changes/phone-worksheet/plan.md`, nota w fazie 6.

Issue: https://github.com/drpc1/printo-kids/issues/38

2026-10-20, iOS (Safari): Safari dokłada w marginesie drukarki adres strony i numer strony. CSS ich nie wyłącza, a okno druku iOS nie ma takiej opcji. Do uwzględnienia przy wyborze geometrii druku (zabierają część marginesu drukarki).
