# Poziomy karty symetrii (S-13) — Plan Brief

> Full plan: `context/changes/symmetry-difficulty-levels/plan.md`
> Research: `context/changes/symmetry-difficulty-levels/research.md`

## What & Why

Rodzic wybiera na `/symetria` poziom karty nazwany wiekiem (4, 5, 6, 7 lat), żeby dostać nową kartę na właściwym poziomie, tak jak w labiryncie. Poziom zmienia siatkę, kratkę, katalog obiektów i podpowiedź (PRD US-07, FR-016).

## Starting Point

Po S-12 jest jedno stałe ustawienie 5 lat (12×16, 15 mm) i trzy szablony 6×15 (rakieta, robot, truskawka). Walidator zna tylko jedną siatkę i nie ma gdzie trzymać podpowiedzi. Strona nie ma paska poziomu.

## Desired End State

Przycisk „Poziom: 5 lat” na stronie symetrii; wybór poziomu od razu daje nową kartę. 4 lata: kratka 20 mm, siatka 8×12, proste obiekty i trzy zamalowane kratki odbicia przy osi. 5 lat: 15 mm, 12×16. 6 lat: 12 mm, 14×20. 7 lat: 10 mm, 18×24 i bogatsze obiekty. Każdy poziom to jedna strona A4 z marginesem 10 mm, także na telefonie.

## Key Decisions Made

| Decision          | Choice                                         | Why (1 sentence)                                             | Source   |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------ | -------- |
| Oś                | Zawsze pionowa                                 | Obiekty są symetryczne lewo–prawo, obrócone leżałyby na boku | Plan     |
| Położenie obiektu | Zawsze przy osi (odsunięcie odpadło)           | Odsunięta połowa nie tworzy jednego obiektu                  | Plan     |
| Poziom 4 lat      | Własne proste szablony na połowie 4×12         | Szablon 6×15 nie mieści się w 4 kolumnach                    | Plan     |
| Poziom 7 lat      | Bogatsze szablony na połowie 9×24              | Trudność z większej liczby szczegółów, nie z położenia       | Plan     |
| Obiekty           | Te same trzy (6 nowych rysunków)               | Spójne z miniaturą, policzalny zakres                        | Plan     |
| Ornamenty         | Poza S-13                                      | PRD Open Questions 7 zostaje otwarte                         | Plan     |
| Podpowiedź 4 lat  | 3 kratki odbicia przy osi, w różnych wierszach | Pokazuje, jak zacząć, nie zdradza całości                    | Plan     |
| Zmiana poziomu    | Od razu nowa karta                             | Podgląd zawsze zgodny z paskiem                              | Plan     |
| Poziom domyślny   | 5 lat, tylko w stanie strony                   | Profil i ostatnie parametry to S-14                          | Research |
| Miniatura         | Zostaje karta 5 lat                            | Katalog bez zmiany                                           | Plan     |
| `layout.ts`       | Bez zmian                                      | Wszystkie cztery siatki mieszczą się z zapasem 20 mm         | Research |

## Scope

**In scope:** `levels.ts`, generator i walidator z poziomem, pole `hints`, katalogi 4 i 7 lat, pasek poziomu, rysowanie podpowiedzi, testy i e2e, poprawka PRD.

**Out of scope:** oś pozioma, odsunięcie, ornamenty, nowe obiekty, profil i ostatnie parametry (S-14), kolory (S-15), zmiana miniatury.

## Architecture / Approach

Poziom to dane (`SYMMETRY_LEVELS`), a generator, walidator i strona czytają je zamiast stałej. Szablon deklaruje szerokość i jest ustawiany przy osi na połowie siatki poziomu. Podpowiedzi to osobne pole karty, będące podzbiorem odbicia.

## Phases at a Glance

| Phase                            | What it delivers                                               | Key risk                                                   |
| -------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| 1. Model poziomów i generator    | Poziom w generatorze, walidatorze i kluczu; podpowiedzi; testy | Walidator musi dopuścić podpowiedzi i nie zdradzić całości |
| 2. Katalogi 4 i 7 lat            | 6 nowych szablonów z testami zmieszczenia                      | Rozpoznawalność obiektów w 4 kolumnach                     |
| 3. Pasek, podpowiedzi, miniatura | Wybór poziomu, rysowanie, e2e telefon                          | Pasek nie może zasłonić Generuj/Drukuj                     |
| 4. PRD i wydruk                  | PRD zgodne z decyzjami, przegląd druku czterech poziomów       | Kratka 10 mm i 20 mm na papierze                           |

**Prerequisites:** S-12 zrobione i w `main`.
**Estimated effort:** ~3–4 sesje, cztery fazy; najwięcej czasu zajmie rysowanie szablonów.

## Open Risks & Assumptions

- Wartości kratek i siatek są startowe; potwierdza je wydruk (PRD Open Questions 5).
- 5 lat i 6 lat dzielą szablony, więc różnią się tylko siatką i kratką; jeśli to za mało, kolejny slice.

## Success Criteria (Summary)

- Rodzic wybiera jeden z czterech poziomów i dostaje kartę zgodną z jego regułami.
- Każdy poziom drukuje się jako jedna strona A4 z marginesem 10 mm, także z telefonu.
- Odpowiedź każdej karty to dokładne odbicie, a podpowiedź 4 lat jest jego częścią, nie całością.
