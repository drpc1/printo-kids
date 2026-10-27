# Okno profilu z podsumowaniem i plakietki w katalogu — Plan Brief

> Full plan: `context/changes/profile-window-summary/plan.md`

## What & Why

Po S-28 profil sam pamięta ustawienia każdej karty, ale okno profilu nadal pyta o poziom labiryntu i niczego nie pokazuje o pozostałych kartach, a katalog nie mówi, co profil zapamiętał. S-29 robi okno tylko do odczytu z podsumowaniem i dodaje plakietki z poziomem na miniaturach.

## Starting Point

`ProfileCorner` ma dwa wybory poziomu (formularz i edycja), które zapisują `profile.level`. Katalog `/` to statyczna siatka bez wiedzy o profilu. Ustawienia pięciu kart leżą w `profile.cards`, poziom labiryntu w `profile.level`.

## Desired End State

Formularz pyta o imię i postać. Okno edycji ma zdanie o zasadzie i listę sześciu kart z ustawieniami, każda linkuje do swojej strony. W katalogu przy wybranym profilu używane karty mają zieloną plakietkę w prawym dolnym rogu miniatury („poz. 4”, „średni”, „6×6 · średni”), a nad siatką stoi „Profil: {imię}”.

## Key Decisions Made

| Decision                      | Choice                                              | Why (1 sentence)                                                                       |
| ----------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Kształt plakietki             | Zielona, w prawym dolnym rogu, wystaje poza krawędź | Użytkowniczka wybrała zieloną na miniaturze; w rogu nie zasłania treści karty          |
| Karta nieużywana przez profil | Bez plakietki, w oknie „domyślne” kursywą           | Decyzja użytkowniczki; PRD US-05 doprecyzowane                                         |
| Poziom nowego profilu         | Zawsze domyślny (Poziom 3)                          | Decyzja użytkowniczki; formularz nie pyta o poziom                                     |
| Katalog bez wybranego profilu | Bez plakietek i podpisu                             | PRD: plakietki tylko przy wybranym profilu                                             |
| Szczegół w oknie              | Wszystkie ustawienia z paska                        | Rodzic widzi cały zapamiętany pasek (FR-017)                                           |
| Podpis nad katalogiem         | „Profil: {imię}”                                    | Odmiana imienia („Ustawienia Ani”) psuje się dla innych imion                          |
| Źródło tekstów                | Jedna funkcja `card-summary`                        | Okno i katalog nie rozjeżdżają się                                                     |
| Technika                      | Skrypt Astro, bez React SSR                         | Plakietki nie są interaktywne, a React SSR na Cloudflare nie jest w repo (przegląd F1) |
| Układ po wczytaniu            | Plakietka absolutna, linia podpisu zarezerwowana    | Plakietki dochodzą po wczytaniu, bez skoku strony                                      |

## Scope

**In scope:** okno profilu bez poziomu, podsumowanie z linkami, plakietki i podpis w katalogu, przepisane i nowe e2e, drobna poprawka PRD.

**Out of scope:** S-31 (ulubiona postać tylko jawnie), S-32 („Jak to działa”), zmiany formatu danych, plakietki bez profilu, „Zacznij od nowa”.

## Architecture / Approach

Czysta funkcja `cardSummaries(profile)` w `src/lib/card-summary.ts` daje sześć pozycji (tytuł, href, plakietka, szczegół, flaga używana). Okno profilu renderuje ją jako listę linków. Katalog zostaje w całości Astro; skrypt czyta profil po wczytaniu, wybiera aktywny profil przez `openingVisit` i wypełnia sloty plakietek (logika w `src/lib/catalog-badges.ts`).

## Phases at a Glance

| Phase           | What it delivers                                                     | Key risk                                                       |
| --------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| 1. Biblioteka   | `card-summary` + testy jednostkowe                                   | Teksty sudoku (4×4 bez poziomu)                                |
| 2. Okno profilu | Bez poziomu, zdanie i lista linków, nowe e2e                         | Usunięcie poziomu zmienia znany przepływ tworzenia profilu     |
| 3. Katalog      | Plakietki i podpis po wczytaniu, e2e telefon i desktop, poprawka PRD | Plakietka na 2 kolumnach, skrypt po wczytaniu bez skoku układu |

**Prerequisites:** S-27, S-28 i S-30 scalone (są w `main`).
**Estimated effort:** ~3 sesje, 3 fazy.

## Open Risks & Assumptions

- Na `/labirynt` utworzenie profilu ustawia pasek na Poziom 3, zamiast zachować bieżący poziom (skutek decyzji o domyślnym poziomie).
- PRD (US-05) mówi o plakietce „każdej karty”; decyzja użytkowniczki ją zawęża, więc PRD jest poprawiane w fazie 3.
- S-31 dotyka tych samych plików okna; trzymamy się zakresu S-29.

## Success Criteria (Summary)

- Rodzic tworzy profil bez wyboru poziomu i widzi w oknie, co profil zapamiętał, z linkami do kart.
- Katalog przy wybranym profilu pokazuje poziomy na miniaturach, bez plakietek bez profilu i dla kart nieużywanych.
- CI zielone na chromium, phone-360, pixel-7, tablet-768.
