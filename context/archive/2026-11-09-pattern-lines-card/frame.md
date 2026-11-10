# Frame Brief: S-36 Karta „Szlaczki”

> Framing step before /10x-plan. Captures what is actually at issue, separated from what was assumed.
> Frame był rozmową nad makietami (v1–v6) z użytkowniczką 2026-11-09, nie śledztwem w kodzie: pytanie brzmiało
> „co budujemy”, a odpowiedzi dał papier, nie kod.

## Reported Observation

Karta „Szlaczki” (roadmap S-36, PRD US-29, US-30, FR-039, FR-040, Business Logic „Karta szlaczków”, Open Questions 15)
nie istnieje. PRD opisuje osiem rzędów, Poziomy 1–2 w trybie kropek, 3–4 w trybie kontynuacji, wzory z listy (linia,
zygzak, fala, schodki, pętle, łuki) przypisane do poziomów i grubość linii zależną od poziomu. Roadmapa każe zacząć od
wydruku próbnego linii.

## Initial Framing (preserved)

- **Stated approach (PRD i roadmapa)**: jedna karta, cztery poziomy, dwa tryby; każdy wzór należy do jednego poziomu;
  osiem rzędów; dziecko w wieku przedszkolnym; profil pamięta tylko poziom.
- **Proposed direction**: makieta i wydruk próbny, potem `/10x-plan`.
- **Pre-dispatch narrowing**: użytkowniczka chciała najpierw rozmawiać o wyglądzie karty i pracować na makietach.
  Pytania od sesji startowej: czy dwa tryby mieszają umiejętności, czy poziomy 1–4 mają sens, co potwierdza wydruk.

## Dimension Map

1. **Dla kogo są poziomy** — PRD zakłada przedszkolaka; poziom 1 z makiety v1 był za trudny. ← największa zmiana
2. **Dwa tryby w jednej karcie** — kropki (precyzja ręki) i kontynuacja (reguła wzoru) to różne umiejętności. ← pytanie sesji startowej
3. **Atrakcyjność** — rzędy samych szlaczków są dla dziecka mało ciekawe.
4. **Różnorodność** — lista sześciu wzorów przypisanych do poziomów szybko się powtarza.
5. **Czytelność na drukarce** — grubość linii i kropek (Open Questions 15).

## Hypothesis Investigation

| Wymiar                          | Dowód (makiety w tym folderze)                                                                              | Werdykt                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Poziomy celują w zły wiek       | v1: poziom 1 „za trudny”; użytkowniczka wyznaczyła wiek: P1 3–4 lata, P2 5–6, P3 6–7, P4 8–10 (klasy 1–3)   | STRONG — przestawić poziomy                |
| Dwa tryby mieszają umiejętności | v6: poziom 3 łączy tryby (dwa powtórzenia po kropkach, dalej samo); przejście P2→P3 przestaje być skokiem   | WEAK — jedna karta zostaje, P3 jest mostem |
| Karta jest mało atrakcyjna      | v3–v4: obrazki startu i celu, kontury i kolory podobały się, ale to osobna zmiana (kategorie, nowe rysunki) | STRONG, ale poza S-36                      |
| Wzory się powtarzają            | v6: pule 5 / 12 / 18 / 18 wzorów + losowana łagodność (wysokość / krok) dają różne karty                    | STRONG — pule i łagodność                  |
| Czytelność druku nieznana       | nic nie drukowano; makiety są w skali 1:1 do wydruku                                                        | otwarte — wydruk próbny                    |

## Narrowing Signals (decyzje użytkowniczki, 2026-11-09)

- **Karta bez obrazków.** Postać, gdy wybrana, mówi polecenie (US-21). Obrazki startu i celu wejdą z kategoriami
  w osobnej zmianie: pole „Brak” (bez obrazków) albo kategoria; kontury przy czarnym druku, kolory przy kolorowym.
  Dlatego S-36 **nie ma przełącznika „Kolory”**.
- **Wiek poziomów**: P1 3–4 lata, P2 5–6, P3 6–7, P4 8–10. Poziom 4 pomaga w nauce pisania.
- **Liczba rzędów**: 4 / 5 / 6 / 7 zamiast ośmiu. Rzędy rozkładają się równo od polecenia do dołu; na P1 dolny zapas
  jest o 15 mm większy (wygodniej trzymać kartkę, ręka, która wyjedzie, zostaje na papierze).
- **Łagodność to druga oś trudności**: ten sam wzór bywa na kilku poziomach, coraz wyższy i gęstszy.
- **Kropki**: małe i gęste, z jasnoszarą ścieżką pod spodem i pustym kółkiem przy starcie. Bez skrzyżowań w trybie
  samych kropek (pętle wypadły z P2: na kropkach nie wiadomo, którędy iść).
- **Poziom 3**: dwa pierwsze powtórzenia wykropkowane (jedno nie wyznacza wzoru: pojedyncza fala i górka wyglądają
  tak samo), dalej dziecko rysuje samo; krok 22–30 mm, żeby P2→P3 zmieniało głównie tryb.
- **Poziom 4**: początek narysowany linią, co najmniej trzy powtórzenia; liniatura jak w zeszycie do kaligrafii
  (górna, przerywana środkowa, dolna, blada pod dolną): e, o, i, m n do środkowej, l do górnej, j g pod dolną.
- **Przełącznik „Linie”** na P3–P4, **domyślnie włączony**: P3 przerywane linie górna i dolna, P4 liniatura;
  wyłączony zostawia bladą linię dolną. Nie układa nowej karty. Profil go pamięta.
- **Odrzucone**: kreski pionowe i skośne (P1), fala po skosie, pierścienie, piramidki, motywy z postaciami
  i znakami towarowymi (Harry Potter, Sonic, LEGO, Marvel, Mario). Błyskawice nie weszły do żadnej puli.

### Pule wzorów (makieta v6, `mockup-v6.mts`)

| Poziom      | Tryb                                                 | Rzędy | Krok     | Wysokość / krok | Wzory                                                                                                                                                                                               |
| ----------- | ---------------------------------------------------- | ----- | -------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 (3–4 l.)  | kropki co 4 mm, r 1,1 mm                             | 4     | 40–52 mm | 0,2–0,42        | linia, fala, zygzak, górki, miseczki                                                                                                                                                                |
| 2 (5–6 l.)  | kropki co 3,5 mm, r 0,9 mm                           | 5     | 30–42 mm | 0,35–0,6        | fala, zygzak, górki, miseczki, schodki, kopce, zęby smoka, górka i kreska, domki (5 w rzędzie), bramy, czubki, fala i kreska                                                                        |
| 3 (6–7 l.)  | 2 powt. po kropkach, dalej samo; linia 1 mm          | 6     | 22–30 mm | 0,5–0,85        | zygzak, fala, górki, miseczki, schodki, kopce, zęby smoka, pętle (e), górka i kreska, ząbek i kreska, klocki, rury, domki, bramy, czubki, duży i mały ząbek, kółeczka (o a), laseczki (i)           |
| 4 (8–10 l.) | kontynuacja linią 0,6 mm, ≥3 powt.; liniatura 6,5 mm | 7     | 12–20 mm | 0,6–1,0         | pętle (e), spirale, l e, m n, pętla i górka, fala i pętla, górka i ząbek, schodek i górka, zęby smoka, kopce, klocki, rury, czary, j g, pętla w górę i w dół, duży i mały ząbek, kółeczka, laseczki |

Rząd losuje wzór z puli bez powtórzeń na karcie, krok i łagodność z zakresu poziomu.

## Cross-System Convention

- Przełącznik widoczny tylko na części poziomów ma precedens: „Kształty / Cyfry” w sudoku (tylko 6×6 i 9×9).
- Przełącznik, który nie układa nowej karty: „Kolory” na symetrii, sekwencjach, sudoku, „Kto ma więcej?”.
- Makieta jako skrypt w folderze zmiany: wzór z `context/archive/2026-11-08-odd-one-out-card/mockup.mts`.
- Ustawienie zapamiętane w profilu: `CardSettingsMap` i tolerancyjny odczyt w `src/lib/card-settings.ts`.

## Reframed Problem Statement

> **The actual problem to plan around is**: karta szlaczków z czterema poziomami dla 3–10 lat, w której trudność
> rośnie pulą wzorów, łagodnością kształtu i ilością wsparcia (kropki → kropki na początku → liniatura), a nie
> sztywnym przypisaniem sześciu wzorów do poziomów.

Pierwotne ramy (jedna karta, cztery poziomy, kropki i kontynuacja, brak oceny rysunku) zostają. Zmienia się, dla kogo
są poziomy, czym się różnią, ile jest rzędów i co pamięta profil (poziom i „Linie”). Obrazki wychodzą do osobnej zmiany.

## Confidence

**MEDIUM.** Decyzje są użytkowniczki i stoją na makietach, ale nic nie wydrukowano. Przed `/10x-plan`:

1. **Wydruk próbny** (`mockup-v6-*.svg`, A4, 100%) na domowej drukarce: grubość kropek (P1 r 1,1, P2 r 0,9), widoczność
   szarej ścieżki pod kropkami, linia 0,6 mm na P4, liniatura 6,5 mm (Open Questions 15).
2. **Próba z dzieckiem**: czy 3–4-latek przechodzi zygzak i górki (zatrzymanie ręki w ostrym punkcie), czy kropki
   klocków i rur na P3 nie są za ciasne, czy spirale i „fala i pętla” na P4 nie są za ciasne przy kroku 12–14 mm.
3. **Dopracować przy implementacji**: kółeczka (o a) mają już pełne koła i łącznik od linii dolnej, ale łącznik
   nachodzi na kółko; laseczki (i) są szkicowe. Wydruk nie jest bramką przed planem (Open Questions 15 „Block: nie”):
   stałe kropek, linii i liniatury w jednym miejscu, wydruk i próba z dzieckiem przed scaleniem.

## What Changes for /10x-plan

- **PRD jest już zmieniony** (2026-11-09): US-29, US-30, FR-040, Business Logic „Karta szlaczków”, tabela „Profil
  i zapamiętane ustawienia” (Szlaczki: poziom, linie), Open Questions 15. Persona: P4 dla 8–10 lat wychodzi poza
  przedszkolaka — świadoma decyzja, jak sudoku 9×9; wiek to cel projektu, nie etykieta (nowe karty M-5 nie mają wieku
  pod opisem).
- **Reguły sprawdzalne generatora**: rzędy na karcie się nie powtarzają; w trybie samych kropek ścieżka nie ma
  skrzyżowań; P3 pokazuje dokładnie dwa powtórzenia po kropkach; P4 co najmniej trzy; wzór mieści się w rzędzie
  i nie wychodzi w margines (pętle cofają się w lewo).
- **Stryker**: nie jest bramką CI. Logika S-36 jest prosta; wąski przebieg (`npm run mutate:local-data -- --mutate`)
  tylko na liniach odczytu ustawień szlaczków w `card-settings.ts`, jeśli plan je zmieni. Pełny przebieg poczeka na
  kategorie (wybór par obrazków, pole „Brak”).
- **Poza S-36 (issue)**: kategorie obrazków startu i celu z polem „Brak”, kontury i kolory, nowe rysunki, sensowne
  pary — szkic w `issue-draft.md`.

## References

- Makiety S-36: `mockup-v6.mts` → `mockup-v6-*.svg`, `mockups.html` (kierunek S-36, bez obrazków).
- Makiety obrazków (materiał do issue): `mockup.mts` → `mockup-v4-*.svg`, `mockup-v5-*.svg`, `mockups-v4.html`.
- PRD: `context/foundation/prd.md` (US-29, US-30, FR-039, FR-040, „Karta szlaczków”, Open Questions 15).
- Roadmapa: `context/foundation/roadmap.md` S-36.
- Wzorzec przełącznika per rozmiar: `src/components/SudokuSymbolsChoice.tsx`; zapis ustawień: `src/lib/card-settings.ts`.
