# Karta symetrii na A4 (S-12) — Plan Brief

> Full plan: `context/changes/symmetry-first-printable/plan.md`
> Research: `context/changes/symmetry-first-printable/research.md`

## What & Why

Drugi rodzaj karty w katalogu: rodzic wchodzi na `/symetria`, klika Generuj i drukuje kartę A4. Na karcie jest połowa obiektu (rakieta, robot albo truskawka), a dziecko dorysowuje drugą połowę jak w lustrze. To gwiazda przewodnia kamienia M-2: dowodzi, że druga karta przechodzi cały łańcuch od katalogu przez generowanie i podgląd do druku, na własnej stronie.

## Starting Point

Jest wspólna powłoka `GeneratorShell` z drukiem A4 i katalog z jedną miniaturą (F-03). Labirynt ma cały stan profili w swoim komponencie i przełącza klasę `has-maze` w powłoce. Logiki symetrii, strony i miniatury nie ma.

## Desired End State

Katalog ma miniaturę „Symetria”. Na `/symetria` duży Generuj daje kartę z poleceniem „Dorysuj drugą połowę tak, jak w lustrze.”, kratką 12×16 po 15 mm, grubą przerywaną osią pionową i czarną sylwetką połowy obiektu. Każde kolejne Generuj daje inną kartę. Karta drukuje się jako jedna strona A4 z marginesem 10 mm, także z telefonu. W rogu jest ten sam profil co na labiryncie.

## Key Decisions Made

| Decision             | Choice                                                              | Why (1 sentence)                                                                     | Source   |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------- |
| Wygląd karty         | Czarne kratki, gruba przerywana oś, cienka siatka, polecenie u góry | Ustalone na makiecie; czytelne w czerni                                              | Research |
| Wzór                 | Połowa obiektu z szablonu, przy osi                                 | Dziecko ma cel („dokończ rakietę”), a nie przypadkową plamę                          | Research |
| Ustawienie           | Jedno stałe „5 lat”: 12×16, 15 mm, oś pionowa, sylwetka             | Poziomy to S-13, kolory S-15                                                         | Research |
| Obiekty              | Rakieta, robot, truskawka                                           | Wybrane przez użytkownika; dobrze czytelne w 6×16                                    | Plan     |
| Warianty             | 2–3 wymienne części na obiekt + przesunięcie w pionie               | Trzy obiekty dają wiele różnych kart, zgodnie z „nowy wzór”                          | Plan     |
| Powtórki             | Nowa karta inna niż ta na ekranie                                   | Dokładnie reguła PRD, łatwa do testu                                                 | Plan     |
| Kolor w szablonach   | Każda kratka ma kolor już teraz, rysowana na czarno                 | S-15 nie przerabia katalogu                                                          | Research |
| Profil               | Ten sam `ProfileCorner`, z tworzeniem, edycją, usuwaniem i pytaniem | Profil ma być jeden dla wszystkich kart; pola jednego rodzaju karty ustalimy później | Plan     |
| Wpięcie profilu      | Wspólny hook w `src/hooks/`                                         | Jedno źródło logiki profilu, gotowe pod S-14                                         | Plan     |
| Klasa powłoki        | `has-maze` → `has-sheet`                                            | Powłoka nie mówi „maze” do każdej karty                                              | Plan     |
| Start strony         | Duży Generuj, potem pasek Generuj/Drukuj                            | Ten sam przepływ co labirynt                                                         | Plan     |
| Testy przeglądarkowe | Lokalne e2e: katalog → Symetria oraz układ telefonu                 | Te same wzorce co labirynt, kryteria US-04 i US-05                                   | Plan     |

## Scope

**In scope:**

- Logika w `src/lib/symmetry/`: szablony, generator, walidator, odbicie, układ A4
- Hook profilu i zmiana nazwy klasy powłoki
- `SymmetryGenerator.tsx` i `src/pages/symetria.astro`
- Kontrakt druku, smoke, wpis w katalogu, miniatura, e2e

**Out of scope:**

- Poziomy, oś pozioma, podpowiedzi (S-13); kody kolorów (S-15); ostatnie parametry i pola profilu symetrii (S-14)
- Inne obiekty, ornamenty, postacie labiryntu; zmiana `<title>`; marginesy drukarki iOS
- Podgląd odpowiedzi na ekranie

## Architecture / Approach

Czysta logika (`generateSymmetryCard`, `symmetryCardProblems`, `mirrorAnswer`, `layoutSymmetrySheet`) dostaje źródło losowości, więc ta sama funkcja zasila stronę, testy i miniaturę ze stałym ziarnem. Wyspa `SymmetryGenerator` rysuje kartę jako SVG 210×297 w `GeneratorShell`, która już drukuje każdy `svg` na A4. Profil idzie z `useChildProfileVisit`, którego używa też labirynt.

## Phases at a Glance

| Phase                       | What it delivers                                                  | Key risk                                                  |
| --------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| 1. Logika karty symetrii    | Szablony, generator, walidator, odbicie i układ z testami         | Warianty części psują czytelność obiektu                  |
| 2. Powłoka i hook profilu   | `has-sheet` i wspólny stan profili; labirynt bez zmian zachowania | Regresja profilu labiryntu (pytanie, usuwanie, last-used) |
| 3. Strona `/symetria`       | Przepływ Generuj → karta → Drukuj, kontrakt druku, smoke          | Druga strona przy druku albo margines poniżej 10 mm       |
| 4. Katalog, miniatura i e2e | Miniatura z generatora, e2e, ręczny druk w przeglądarkach         | Różnice przeglądarek, w tym Brave i Safari na iOS         |

**Prerequisites:** F-03 zrobione (`card-catalog-home`, zarchiwizowane); PRD i roadmapa zaktualizowane 2026-10-23.
**Estimated effort:** około 3–4 sesji w 4 fazach.

## Open Risks & Assumptions

- Zakładam, że rakieta, robot i truskawka dadzą się narysować czytelnie w połowie siatki 6×16. Sprawdza to ręczny przegląd w fazie 1 i wydruk w fazie 4.
- Okno profilu na `/symetria` pokazuje postać i poziom labiryntu. To świadomie odłożone, ale może mylić rodzica do S-14.
- Kratka 15 mm i gęstość szablonów potwierdza dopiero wydruk dla dziecka (PRD Open Questions 5).

## Success Criteria (Summary)

- Rodzic przechodzi z katalogu na `/symetria`, generuje kolejne różne karty i drukuje każdą jako jedną stronę A4 z marginesem 10 mm, także z telefonu.
- Każda pokazana karta przechodzi walidator, a jej odpowiedź jest dokładnym odbiciem, sprawdzanym niezależną wyrocznią w testach.
- Labirynt i profil działają na `/labirynt` tak jak przed zmianą.
