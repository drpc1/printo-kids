# Adresy podstron kart po angielsku — skrót planu

> Pełny plan: `context/changes/english-card-urls/plan.md`

## What & Why

Katalog zostaje na `/`, a cztery karty o polskich adresach dostają angielskie: `/maze`, `/symmetry`, `/sequences`, `/dictation`. Wejście z katalogu otwiera już nowy adres. Stara zakładka nadal otwiera tę samą kartę, przez 301. Napisy na kartach zostają po polsku. Źródło: issue #123.

## Starting Point

Adres jest nazwą pliku: `labirynt.astro`, `symetria.astro`, `sekwencje.astro`, `dyktando.astro`. `href` w `src/lib/cards.ts` jest osobny od `id` i miniatury. `/sudoku` i `/nonogram` są już po angielsku. Przekierowań nie ma. US-05 i `AGENTS.md` podają `/labirynt` i `/symetria` jako aktualny kontrakt.

## Desired End State

Z katalogu te cztery karty otwierają się pod angielskim adresem, z polskim napisem. Wpisanie starego adresu, także z jednym slashem na końcu, kończy się tą samą kartą pod nowym adresem (GET 301). Zapisane ustawienia profilu wczytują się jak dziś. US-05 i `AGENTS.md` podają nowe przykłady.

## Key Decisions Made

| Decision | Choice | Why |
| --- | --- | --- |
| Stary adres | 301 na angielską ścieżkę, pasek się zmienia | Jeden kanoniczny adres, a zakładka nadal otwiera kartę |
| Kształt wpisu | String w `redirects`, nie obiekt ze statusem | W Astro 7.3.2 string dla GET to 301 |
| Id, napis, miniatura | Zostają po polsku | `id` jest kluczem zapisu ustawień, miniatura to osobny plik |
| Sudoku i nonogram | Bez zmian | Już mają angielskie adresy |
| Dokumenty | US-05 i `AGENTS.md` w tej zmianie | Żywy kontrakt nie może wymagać starych adresów |
| Historia | Roadmapa zamkniętych plastrów i `context/archive/` bez zmian | Zapisują to, co weszło wtedy |
| S-31 | Poza zakresem | Ulubiona postać nie zależy od adresu strony |

## Scope

**In scope:** zmiana nazw czterech plików stron; `href` w katalogu; 301 ze starych ścieżek; smoke, kontrakt druku i e2e, które te ścieżki wklejają; przykłady w US-05; zdanie o adresie labiryntu w `AGENTS.md`; wyrzucenie starych ścieżek z sitemapy, jeśli build je wypisze.

**Out of scope:** identyfikatory, napisy, pliki miniatur i klucze `card-settings`; `/sudoku`, `/nonogram`, katalog na `/`; tłumaczenie zdań; dopisywanie sekwencji i dyktanda do zdania US-05; przepisywanie archiwum i zamkniętych plastrów; zachowanie query stringa; zmiana `trailingSlash`; S-31.

## Architecture / Approach

Plik strony jest adresem kanonicznym. Katalog zmienia tylko `href`. Stary adres nie jest drugą stroną: po usunięciu polskiego pliku `astro.config.mjs` przekierowuje na nowy. Smoke z `redirect: "manual"` widzi 301. E2E wchodzi od razu na nowy adres.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Angielskie adresy kanoniczne | Nowe pliki stron, `href`, testy ścieżek | E2e i kontrakt druku zostaną przy starej nazwie pliku |
| 2. Stare adresy przekierowują | 301 i smoke, sitemapa bez starych ścieżek | Polski plik zostawiony obok wpisu `redirects` zderzy się z trasą |
| 3. Żywe dokumenty | US-05 i `AGENTS.md` | Historia roadmapy przepisana przez pomyłkę |

**Prerequisites:** brak zależności od S-31. Gałąź od aktualnego `main`.
**Estimated effort:** jedna sesja, trzy fazy. Większość to zmiany nazw i ścieżek w testach.

## Open Risks & Assumptions

- Sitemapa z `@astrojs/sitemap` może wypisać źródło przekierowania. Faza 2 usuwa te cztery ścieżki tylko wtedy, gdy build je zawiera.
- Query string na starym adresie jest porzucany. Strony go nie czytają.
- S-31, robione równolegle, może edytować te same specy e2e. Scalenie jednego PR przed drugim ogranicza konflikt do ścieżek.

## Success Criteria (Summary)

- Z katalogu cztery karty otwierają `/maze`, `/symmetry`, `/sequences` i `/dictation`, a napisy zostają polskie.
- Stary adres, także `/dyktando/`, kończy się tą samą kartą pod angielskim adresem.
- US-05 i `AGENTS.md` podają nowe przykłady, a zamknięta historia roadmapy zostaje przy starych.
