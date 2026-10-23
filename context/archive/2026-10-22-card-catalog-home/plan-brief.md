# Katalog kart na stronie głównej; labirynt pod /labirynt — Plan Brief

> Full plan: `context/changes/card-catalog-home/plan.md`

## What & Why

Strona główna staje się katalogiem rodzajów kart z miniaturą, a labirynt przenosi się pod `/labirynt` we wspólną powłokę z linkiem „Wszystkie karty”. To fundament M-2: drugi rodzaj karty (symetria, S-12) dostaje własną stronę i miniaturę bez ruszania generatora labiryntu. Wybrany profil dziecka ma zostawać między stronami (US-05).

## Starting Point

Dziś `/` to jedna strona z generatorem labiryntu; `@page` i reguły druku siedzą w `WorksheetHome.astro`, a testy, e2e i smoke odwołują się do `/`. Aktywny profil nie jest zapisywany: przy 2+ profilach aplikacja pyta przy każdym wejściu.

## Desired End State

`/` pokazuje katalog z jedną kartą „Labirynt” (miniatura z prawdziwego generatora) w siatce 2-kolumnowej. `/labirynt` działa jak dotychczas plus link powrotu. Profil wybrany na urządzeniu zostaje, a w menu profilu jest „Bez profilu”.

## Key Decisions Made

| Decision                | Choice                                                                 | Why (1 sentence)                                                                                            |
| ----------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Pamięć profilu          | `localStorage`, jeden klucz z id lub `"none"`                          | Użytkownik wybrał pamięć na urządzeniu; `"none"` pozwala wrócić do „bez profilu” także przy jednym profilu. |
| Wiersz „Bez profilu”    | Dodany w menu profilu                                                  | Zachowuje FR-006 i „druk nie wymaga profilu” na wspólnym urządzeniu.                                        |
| Miniatura               | Statyczny SVG ze skryptu na prawdziwym generatorze                     | Nie rozjedzie się z kartą i nie kosztuje nic w czasie działania.                                            |
| Powłoka                 | `GeneratorShell.astro` (przeniesiony `WorksheetHome`), React bez zmian | S-12 użyje jej bez ruszania logiki labiryntu.                                                               |
| Katalog                 | Tylko prawdziwe karty, siatka 2 kolumn, bez „wkrótce”                  | Bez martwych kafelków; drugą kartę dokłada S-12.                                                            |
| `/` i `/labirynt`       | `/` katalog, smoke sprawdza oba                                        | Zgodne z rekomendacją roadmapy.                                                                             |
| Testy                   | Jednostkowe + smoke + nowy e2e katalog → labirynt                      | Chronią największe ryzyka: przeniesienie druku i pamięć profilu.                                            |
| Wspólne rysowanie ścian | `collectWalls` do `src/lib/sheet/walls.ts`                             | Skrypt miniatury i komponent rysują to samo.                                                                |

## Scope

**In scope:** pamięć aktywnego profilu i „Bez profilu”; powłoka Astro; `/labirynt`; katalog `/`; miniatura z generatora; poprawione testy, e2e, smoke, AGENTS.md.

**Out of scope:** strona i miniatura symetrii (S-12), poziomy i wiek w profilu (S-13, S-14), podział `WorksheetGenerator.tsx`, przekierowanie starych zakładek, test wyglądu miniatur, zmiany druku i kształtu zapisanych danych.

## Architecture / Approach

Trzy fazy, każda kończy działającą aplikacją: (1) helper `active-profile` i rozszerzone `openingVisit`, (2) `git mv` powłoki, nowa trasa `/labirynt`, testy za przenosinami, (3) katalog i skrypt miniatury. Generator React zostaje cały na stronie labiryntu; wspólna jest tylko powłoka.

## Phases at a Glance

| Phase                    | What it delivers                          | Key risk                                                        |
| ------------------------ | ----------------------------------------- | --------------------------------------------------------------- |
| 1. Aktywny profil        | Zapamiętany wybór profilu, „Bez profilu”  | Dotyka `ProfileCorner.tsx` (615 linii) i opening-flow z testami |
| 2. Powłoka i `/labirynt` | Labirynt pod nowym adresem, link powrotu  | Druk A4 po przeniesieniu `@page` i reguł                        |
| 3. Katalog i miniatura   | `/` jako katalog, skrypt SVG, smoke i e2e | Miniaturę trzeba odświeżać ręcznie po zmianie układu            |

**Prerequisites:** brak (F-03 nie ma zależności).
**Estimated effort:** ~3 sesje, po jednej na fazę.

## Open Risks & Assumptions

- Druk to najdroższy błąd: po fazie 2 obowiązkowy ręczny wydruk A4 i widok telefonu.
- Stare zakładki `/` otworzą katalog zamiast labiryntu.
- Test miniatur jest poza zakresem (zgodnie z `test-plan.md`), więc rozjazd miniatury z kartą wykryje tylko oko.
- Rozszerzenie `openingVisit` o trzeci argument zmienia kontrakt używany też przez `visitAfterDelete`.

## Success Criteria (Summary)

- Rodzic otwiera `/`, widzi kartę Labirynt, klika i trafia na `/labirynt`, a link „Wszystkie karty” wraca do katalogu.
- Wybrany profil zostaje po przejściu między stronami i po odświeżeniu; „Bez profilu” działa.
- Labirynt i jego druk A4 działają jak przed zmianą; lint, testy, build i smoke są zielone.
