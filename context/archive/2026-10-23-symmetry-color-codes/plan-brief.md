# Kolory na karcie symetrii (S-15) — Plan Brief

> Full plan: `context/changes/symmetry-color-codes/plan.md`
> Research: `context/changes/symmetry-color-codes/research.md`

## What & Why

Rodzic włącza na `/symetria` przełącznik „Kolory” i dostaje kartę z kratkami w prawdziwych kolorach kredek; dziecko dorysowuje odbicie i koloruje je według wzoru. Po makiecie użytkownik odrzucił litery i legendę z PRD (US-09, FR-018) na rzecz prawdziwych kolorów, więc plan poprawia też PRD.

## Starting Point

Kolor każdej kratki jest już w szablonach, w podpowiedziach i w odpowiedzi, ale strona rysuje wszystko na czarno. Detale (okno, oczy, pestki) to puste kratki, których dane nie znają. Nie ma tokenów kolorów ani Switcha.

## Desired End State

Obok „Poziom” stoi przełącznik „Kolory” (domyślnie wyłączony). Włączony koloruje wzór i detale, nie zmieniając wylosowanej karty. Podpowiedzi 4 lat są blade (ok. 35%) w obu trybach. Każdy poziom to jedna strona A4 z marginesem 10 mm, także na telefonie.

## Key Decisions Made

| Decision          | Choice                                                   | Why (1 sentence)                                  | Source   |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------- | -------- |
| Oznaczenie koloru | Prawdziwy kolor kratki, bez liter i legendy              | Użytkownik wprost po makiecie; znika pytanie Z/Ż  | Plan     |
| Detale            | Wykrywanie dziur + `holeColor` szablonu                  | Mało danych, nie psuje się przy zmianie wariantów | Plan     |
| Kolory obiektów   | Przemalowanie wszystkich katalogów, kształty bez zmian   | Kolorowanka zamiast szarego robota                | Plan     |
| Paleta            | Obecne 6 + pomarańczowy                                  | Płomień rakiety wygląda jak płomień               | Plan     |
| Przełącznik       | Switch „Kolory” obok Poziomu, stan tylko na stronie      | Zgodnie z roadmapą; profil to S-14                | Plan     |
| Zmiana kolorów    | Ta sama karta, inne rysowanie                            | Rodzic porównuje tryby na jednej karcie           | Plan     |
| Podpowiedź        | Kolor kratki odbicia, krycie 35%; bez kolorów jasnoszara | Odróżnia się od wzoru także w czerni              | Plan     |
| Odpowiedź         | `mirrorAnswerWithDetails` (odbicie z kolorem i detalami) | PRD: jedna odpowiedź, odbicie razem z kolorem     | Research |
| Układ strony      | `layout.ts` bez zmian                                    | Bez legendy nic nie przybywa                      | Research |
| Druk              | `print-color-adjust: exact`, tokeny tylko w `:root`      | Kolory nie znikają z wydruku                      | Research |

## Scope

**In scope:** paleta i szablony, pole `details` i odpowiedź, tokeny, `symmetryDrawnCells`, Switch i stan strony, druk, testy i e2e, poprawka PRD i roadmapy, przegląd wydruku.

**Out of scope:** litery i legenda, profil i ostatnie parametry (S-14), nowe obiekty i ornamenty, tryb szarości na drukarkach czarno-białych, miniatura katalogu.

## Architecture / Approach

Reguły w `src/lib/symmetry` (dziury, odpowiedź, wybór wypełnienia) z ręcznymi orakułami; komponent tylko rysuje. `details` to osobne pole karty (jak `hints` w S-13), więc walidacja sylwetki się nie zmienia.

## Phases at a Glance

| Phase                 | What it delivers                                           | Key risk                                   |
| --------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| 1. Model              | Pomarańczowy, dziury z kolorem, odpowiedź, kolory obiektów | Niechciane „kieszenie” wykryte jako dziury |
| 2. Strona             | Tokeny, Switch, rysowanie, blada podpowiedź, druk, testy   | Pasek na telefonie; kolory na wydruku      |
| 3. Dokumenty i wydruk | PRD i roadmapa zgodne, przegląd wydruku                    | Żółty i bladość podpowiedzi na papierze    |

**Prerequisites:** S-12 i S-13 w `main` (są).
**Estimated effort:** ~2–3 sesje, trzy fazy.

## Open Risks & Assumptions

- Czarno-biała drukarka zamienia kolory w szarości; użytkownik to zaakceptował.
- Krycie 35% i ton żółtego potwierdza wydruk.
- Liczba dziur zależy od wariantu części (np. robot 7 lat 6–9); zakresy zmierzone na `main` są w teście.

## Success Criteria (Summary)

- Przełącznik „Kolory” koloruje tę samą kartę na każdym poziomie, także na telefonie.
- Każdy poziom drukuje się jedną stroną A4 z marginesem 10 mm, w kolorze i w czerni.
- PRD i roadmapa mówią to samo co aplikacja.
