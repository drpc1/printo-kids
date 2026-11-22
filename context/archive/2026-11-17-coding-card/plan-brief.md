# Kodowanie (S-42) — Plan Brief

> Full plan: `context/changes/coding-card/plan.md`
> Frame brief: `context/changes/coding-card/frame.md`

## What & Why

Trzynasta karta: „Kodowanie” (`/coding`). Na kratce z szarymi przeszkodami stoi postać; w trybie „Zapisz” dziecko zapisuje strzałkami drogę do mety, w „Wykonaj” idzie za podanymi strzałkami i zakreśla obrazek, na którym skończyło. Pierwsza karta M-7, żeby kolejna karta na właściwym poziomie była na żądanie.

## Starting Point

Katalog ma dwanaście kart, a zegar (S-41) wytyczył drogę: moduł `src/lib/<karta>/`, rejestry, strona, arkusz SVG, miniatura, testy. PRD, ramka i makieta z BFS są już na `main` (PR #410).

## Desired End State

Rodzic wybiera z katalogu „Kodowanie”, ustawia Poziom 1–4 i tryb, generuje i drukuje jedną stronę A4 (także z telefonu). Profil pamięta poziom i tryb, katalog pokazuje „poz. N”, „Jak to działa” opisuje kartę.

## Key Decisions Made

| Decision               | Choice                                                | Why                                                                              | Source |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- | ------ |
| Warianty               | Przełącznik „Tryb” (Zapisz / Wykonaj), jak w zegarze  | Dwie różne umiejętności, każdy tryb ma wszystkie poziomy                         | Frame  |
| Domyślny tryb          | Zapisz                                                | Pokazuje główny pomysł karty (jedna najkrótsza droga)                            | Plan   |
| „Pokaż rozwiązanie”    | Brak                                                  | Odpowiedź da się sprawdzić okiem, mniej kodu                                     | Plan   |
| Postać „Brak”          | Kółko „Start” na kratce                               | Start widoczny bez postaci, zgodne z PRD                                         | Plan   |
| Poziomy                | 4: kratka 5×5 … 10×10, droga 6–8 … 18–24, „3 →” na P4 | Decyzje użytkowniczki po makiecie                                                | Frame  |
| Jedna najkrótsza droga | Własny BFS po polach, meta wybierana po jednym BFS    | `countPaths` labiryntu liczy drogi między ścianami; szybciej niż ślepe losowanie | Plan   |
| Orakl w testach        | Niezależny DFS po wszystkich drogach prostych         | Inny kod niż BFS generatora, więc łapie wspólny błąd                             | Plan   |
| Pułapka w ustawieniach | Gałąź `mode` w `fieldValue` zależna od karty          | Inaczej zapisany tryb kodowania wracałby do domyślnego                           | Plan   |
| Stryker                | Poza slice'em (S-50)                                  | Zakres zadania                                                                   | Plan   |

## Scope

**In scope:** logika i generator, strona, pasek, arkusz SVG, miniatura, profil, „Jak to działa”, testy jednostkowe i e2e, wydruk próbny.

**Out of scope:** „Pokaż rozwiązanie”, kolory, kategorie, strzałki względne, Stryker (S-50), tagi katalogu (S-43), przebudowa „Jak to działa” i podsumowania profilu (S-53, S-52).

## Architecture / Approach

Moduł `src/lib/coding/` (`levels`, `sheet`, `card`, `search`, `generate`, `layout`, `engine`) podłączony do kontraktu kart. Strona `/coding` z `CodingGenerator` na `CardPage`, `CodingModeChoice` jak `ClockModeChoice`, arkusz SVG z kreskowanymi strzałkami. Każda zmiana poziomu albo trybu układa nową kartę (`applySettings`).

## Phases at a Glance

| Phase                       | What it delivers                                          | Key risk                                               |
| --------------------------- | --------------------------------------------------------- | ------------------------------------------------------ |
| 1. Dokumenty                | PRD, roadmapa i glosariusz zgodne z planem                | Brak                                                   |
| 2. Logika karty             | Generator, BFS, układ, silnik, testy z oraklem            | Czas Zapisz na Poziomie 4 (cel: mniej niż 500 losowań) |
| 3. Strona, katalog i profil | `/coding`, rejestry, arkusz, miniatura, e2e               | Duża faza; `mode` w `fieldValue` i rejestry            |
| 4. Wydruk próbny            | Poprawki stałych po wydruku, zamknięcie Open Questions 18 | Strzałka w polu 16 mm, szarości przykładu i przeszkód  |

Prerequisites: PR #410 na `main` (jest). Estimated effort: porównywalny z zegarem; fazy 1–3 w osobnych PR-ach, faza 4 po scaleniu.
