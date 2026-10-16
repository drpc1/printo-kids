# Poziomy trudności labiryntu — Plan Brief

> Full plan: `context/changes/maze-difficulty-levels/plan.md`
> Research: `context/changes/maze-difficulty-levels/research.md`

## What & Why

Rodzic wybiera jeden z sześciu poziomów nazwanych wiekiem i dostaje labirynt A4 o alejce oraz długości drogi tego poziomu. Dziś Generuj zawsze rysuje 13×16. Szerokość alejki i długość drogi zostają z PRD. Żywe sprawdzenie progów z dziećmi jest poza tym plasterkiem.

## Starting Point

Generator to drzewo 13×16 z wejściem i wyjściem w kolumnie 6. Układ liczy szerokość komórki z szerokości strony, ale etykietę trzyma na kolumnie 6. Ostatnie użycie i profil pamiętają tylko postać. Wybór postaci jest dialogiem na tej samej kartce.

## Desired End State

Pasek „Poziom:” stoi przy „Postać:”. Generuj buduje labirynt wybranego poziomu. Zmiana poziomu chowa kartkę. Wybór dziecka wstawia na pasek jego poziom, tak jak postać. Nastolatek ma start w lewym górnym narożniku, metę w prawym dolnym, napis Start i nie pokazuje postaci. Pusty zapis otwiera się na 5 latach.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Alejki | 9×11, 13×16, 17×21, 27×33 ze wzoru `(210 - 20) / kolumny` | Szerokość jest ważniejsza niż długość drogi i już wychodzi z dzisiejszego układu. | Research |
| 3 lata | droga ≤ 25, odnoga ≤ 6 | Prosta droga środkiem jest 4 kroki od krawędzi, więc próg 6 mieści krótką drogę; próg 3 nie mieści. | Plan |
| 4 lata | droga ≥ 40, odnoga ≤ 9 | Ta sama alejka co 3 lata, dłuższa droga i luźniejsza odnoga. | Plan |
| 5 lat | droga ≤ 40, odnoga ≤ 6 | Krótki poziom przy tej alejce ma płytkie ślepe uliczki. Grzebień w kolumnie 6 ma drogę 16 i odnogę 6. | Plan |
| 6 lat | droga ≥ 70, odnoga bez limitu | Pasmo zostaje z PRD. Generator kładzie drogę tej długości, więc ogon losowania nie obniża progu. | Plan |
| 7–8 lat | droga 80–120, odnoga bez limitu | Pasmo zostaje z PRD. Na 17×21 da się ułożyć drogę w tym przedziale. | Plan |
| Nastolatek | droga 150–300, odnoga ≥ 25, narożniki lewy górny → prawy dolny, napis Start, bez postaci, bez wymaganego kółka | PRD zostawia narożniki i zakaz postaci; kółko jest dozwolone, nie nakazane. Dłuższa odnoga odróżnia ten poziom od młodszych. | Plan |
| Domyślny poziom | `lat5` | Pusty zapis i stary JSON bez pola dostają alejkę, którą kartka ma dziś. | Plan |
| Zapis | od razu przy wyborze, gdy nie ma profilu; profil dopiero po jawnym zapisie | Tak samo jak postać, i tak jak FR-009. | Plan |
| Zmiana poziomu | chowa kartkę | Druk nie może wynieść labiryntu z poprzedniego poziomu. | Plan |
| Pudło | budowa pod regułę, po 5 s komunikat, kartka spoza reguły się nie pokazuje | Powtórka dzisiejszego rzeźbienia nie trafia w odnogę trzylatka. | Plan |

## Scope

**In scope:** tabela sześciu poziomów, generator pod regułę, bramka kartki, układ czterech siatek, kontrolka na istniejącej kartce, pole `level` w ostatnim użyciu i w profilu, komunikat pudła, zdania w `test-plan.md` §5, §6 i §7.

**Out of scope:** nowy ekran, osobna kontrolka długości, kółko nastolatka, poziom dorosłego, zmiana insetu i `@page`, układ telefonu (S-09), losowanie aż do trafienia.

## Architecture / Approach

`LEVELS` w `src/lib/maze/levels.ts` jest źródłem id, siatki i progów. Generator kładzie drogę w paśmie, potem dołącza resztę komórek bez drugiej drogi do mety. `mazeForSheet` odrzuca kandydata spoza reguły. Pasek czyta i zapisuje id poziomu obok postaci.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Generator pod regułę poziomu | Sześć id przechodzi test ziarna: siatka, jedna droga, pasmo, odnoga | Generator ma trafić w pasmo jednym ułożeniem. Grzebień i wężyk te pasma mieszczą |
| 2. Kartka dla czterech siatek | Alejka ze wzoru, narożniki, Start bez postaci | Etykieta zostaje na kolumnie 6, jeśli układ nie weźmie kolumny z poziomu |
| 3. Wybór, zapis i Generuj | Pasek, `lat5` dla starego JSON, chowanie kartki, komunikat | Zapis postaci bez pola `level` kasuje poziom |

**Prerequisites:** S-06 jest done. Research tego plasterka jest complete.
**Estimated effort:** około 2–3 sesje na 3 fazy.

## Open Risks & Assumptions

- Progi z tabeli są kontraktem tego plasterka. Żywe sprawdzenie z dziećmi w wieku 4 lat oraz 6–7 lat i późniejsza korekta progów są osobną zmianą.
- Rachunek insetu mieści cztery siatki w SVG. Wydruk w przeglądarce, także na telefonie, zostaje przy S-09.
- Komunikat pudła w interfejsie trzeba wymusić `null` z bramki. Przy poprawnym generatorze samo kliknięcie go nie pokaże.

## Success Criteria (Summary)

- Rodzic wybiera każdy z sześciu poziomów i dostaje labirynt o alejce oraz paśmie tego poziomu, z jedną drogą.
- Nastolatek ma narożniki, napis Start i nie pokazuje postaci. Zmiana poziomu chowa kartkę.
- Stary zapis bez poziomu otwiera się na 5 latach, a wybór bez profilu zostaje po odświeżeniu.
