# Strona karty na telefonie (S-09) — Plan Brief

> Full plan: `context/changes/phone-worksheet/plan.md`
> Research: `context/changes/phone-worksheet/research.md`
> Review: `context/changes/phone-worksheet/reviews/plan-review.md`

## What & Why

Na telefonie po wygenerowaniu labiryntu Drukuj zakrywa Generuj, a strona przewija się w bok o 9 px. US-04 i FR-013 wymagają, żeby rodzic na telefonie wygenerował kartę, zobaczył ją i wydrukował jako jedną stronę A4. Plan naprawia układ wokół karty i dowodzi druku w każdej przeglądarce z zakresu.

## Starting Point

Pasek po wygenerowaniu to jeden rząd bez zawijania, z dwoma przyciskami `px-12 text-lg`. Na każdym ekranie leży w kontenerze `max-w-xl` (576 px). Profil jest przyklejony w prawym górnym rogu i przy przewijaniu leży nad kartą. Karta (SVG z `viewBox`) mieści się w szerokości. Playwright ma tylko Desktop Chrome. Generuj na `lat5` nie działa do czasu poprawki generatora z Cursora.

## Desired End State

Od 360 px w górę strona nie przewija się w bok. Poniżej 640 px pasek ma dwa rzędy: parametry („Postać:”, potem „Poziom:” z S-07) oraz Generuj i Drukuj po połowie szerokości, z ikonami `Shuffle` i `Printer`, co najmniej 44 px wysokości. Od 640 px jest jeden rząd jak dziś, z ikonami, a gdy brak miejsca, Drukuj przechodzi do następnej linii. Na telefonie (w obu orientacjach) i tablecie Profil przewija się ze stroną i nie zasłania nagłówka ani karty. Wiersze dialogów nie są większe od Generuj i Drukuj. Testy Playwright przechodzą na Chromium i WebKit, a tabela ręcznego druku jest wypełniona.

## Key Decisions Made

| Decision                    | Choice                                                                                                             | Why (1 sentence)                                                                                             | Source            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ----------------- |
| Przeglądarki                | Chrome, Edge, Brave, Firefox, Safari na komputerze i telefonie; na iOS układ w Safari, druk także w Chrome i Brave | Na iOS wszystkie przeglądarki używają WebKit, ale druk może się różnić                                       | Plan (użytkownik) |
| Tablet                      | Ta sama zmiana, sprawdzenie 768 px                                                                                 | Ten sam układ, bez osobnego projektu                                                                         | Plan (użytkownik) |
| Minimalna szerokość         | 360 px; 320 px poza zakresem                                                                                       | Typowe Androidy mają 360 px                                                                                  | Review F3         |
| Margines 10 mm              | Dotyczy ścian i ramki labiryntu; znak postaci może wejść w pas                                                     | Zgodne z `test-plan.md:135`, bez zmiany geometrii                                                            | Plan              |
| Pasek poniżej 640 px        | Dwa rzędy, przyciski `text-base`, 44 px                                                                            | Oba przyciski osobno klikalne, cel dotyku zgodny z WCAG                                                      | Plan              |
| Pasek od 640 px             | Jeden rząd z zawijaniem; Drukuj schodzi niżej, gdy brak miejsca                                                    | Kontener ma 576 px, a z ikonami i „Poziom:” rząd się nie mieści; desktop zostaje jak dziś, dopóki się mieści | Review F1 (Fix B) |
| Ikony                       | `Shuffle` dla Generuj, `Printer` dla Drukuj, przed słowem                                                          | Spójny pasek; `Sparkles` odrzucone, bo sugeruje AI                                                           | Plan              |
| Sama ikona zamiast „Drukuj” | Odrzucone                                                                                                          | Nie daje jednego rzędu, główna akcja traci czytelność                                                        | Plan              |
| Profil                      | `absolute` poniżej 640 px i na dotyku (`pointer: coarse`); `fixed` tylko od 640 px z myszą                         | Telefon poziomo ma ponad 640 px, a też nie może mieć Profilu nad kartą                                       | Plan + Review F2  |
| Dialogi                     | Tylko ręczne sprawdzenie i spójny rozmiar wierszy                                                                  | Treść okna profili zmienia `profile-corner-jobs`                                                             | Plan              |
| Playwright                  | Telefon 360 px, Pixel 7, iPhone 13, tablet 768 px, lokalnie                                                        | Oba silniki mobilne bez nowej infrastruktury CI                                                              | Plan + Review F3  |
| Druk                        | Podgląd lub PDF, bez papieru                                                                                       | Powtarzalne bez drukarki                                                                                     | Plan              |
| Kolejność                   | Fazy 1–2 teraz, bramka, potem 3–6                                                                                  | Kod i dokumenty zmieniane też na `main` ruszamy po scaleniu                                                  | Plan + Review F4  |

## Scope

**In scope:** pasek akcji i ikony, brak przewijania w bok od 360 px, pozycja Profil i odstęp nagłówka, viewport i `min-h-dvh`, rozmiar wierszy dialogów na telefonie, PRD z Brave i doprecyzowanym marginesem, plan testów, projekty Playwright i test układu, tabela ręcznego druku.

**Out of scope:** geometria karty i `@page`, położenie znaku postaci, poprawka generatora, kontrolka „Poziom:” (S-07), treść okna profili i tooltipy na dotyku, Playwright w CI, emulacja mobilnego Firefoxa, wydruk na papierze, okna węższe niż 360 px.

## Architecture / Approach

Wszystko to klasy Tailwind z wariantami `sm:` i `pointer-fine:` łączone przez `cn()` oraz jeden osobny blok CSS dla telefonu w `WorksheetHome.astro`. `@page` zostaje tam bez zmian. Kod i dokumenty, które zmienia też praca na `main` (wiersze okna profili, roadmapa, plan testów), ruszamy dopiero po scaleniu. Test tekstowy kontraktu druku zmienia się razem z klasami paska.

## Phases at a Glance

| Phase                            | What it delivers                                                           | Key risk                                                |
| -------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1. Pasek akcji, ikony i overflow | Dwa rzędy na telefonie, zawijanie od 640 px, ikony, brak przewijania w bok | `print-contract.test.ts` porównuje dokładne klasy paska |
| 2. Przycisk Profil i viewport    | Profil przewija się ze stroną na telefonie i dotyku, nagłówek wolny        | Blok `padding-top: 2rem` sprawdzany przez test          |
| Bramka                           | Scalenie zmian z Cursora z `main`                                          | Konflikty w `WorksheetGenerator.tsx`                    |
| 3. Dokumenty                     | Brave w PRD, doprecyzowany margines, aktualny plan testów                  | lint-staged przeformatuje całe pliki                    |
| 4. Spójność wierszy w dialogach  | Wiersze 16 px / 44 px na telefonie                                         | Zależy od wyniku scalenia `profile-corner-jobs`         |
| 5. Testy telefonu w Playwright   | Pięć projektów i test układu                                               | WebKit na Windows, czas buildu                          |
| 6. Ręczny druk i dialogi         | Wypełniona tabela druku w 5 przeglądarkach na 3 platformach                | Mobilna przeglądarka daje drugą stronę                  |

**Prerequisites:** do faz 1–2 tymczasowo `lat6` w `levels.ts` (cofnięte po sprawdzeniu). Przed fazą 3 zmiany z Cursora na `main` i scalone do tej gałęzi na Twoją prośbę. Do fazy 6 dostęp do Androida, iPhone'a i Safari na macOS.
**Estimated effort:** ok. 3–4 sesje: fazy 1–2 w jednej, 3–5 w jednej, faza 6 ręcznie w czasie użytkownika.

## Open Risks & Assumptions

- S-07 może wejść przed S-09 albo po nim. Poniżej 640 px „Poziom:” wchodzi do zawijanego rzędu parametrów. Od 640 px rząd się zawija i Drukuj schodzi niżej. Ten, kto scala drugi, rozwiązuje konflikt w `WorksheetGenerator.tsx` i `print-contract.test.ts` i sprawdza pasek przy 360 i 1280 px.
- Od 640 px wygląd paska zależy od długości nazwy postaci (zawinięcie albo nie). Przyjęte w review (F1, Fix B).
- Wariant `pointer-fine:` nie był jeszcze użyty w projekcie. Laptop dotykowy, który zgłasza mysz, dostanie przyklejony Profil.
- Tooltipy z `profile-corner-jobs` nie pokazują się na ekranie dotykowym. Poza zakresem, zapisane do tamtej zmiany.
- Druk na niektórych drukarkach bez druku do krawędzi może uciąć górę znaku postaci (ok. 1,6 mm od krawędzi). Przyjęte świadomie.
- Mobilny Firefox jest sprawdzany tylko ręcznie.

## Success Criteria (Summary)

- Na telefonie od 360 px Generuj i Drukuj są osobno klikalne, strona nie przewija się w bok, a Profil nie zasłania nagłówka ani karty, także poziomo.
- Druk z każdej przeglądarki z zakresu daje jedną stronę A4 z co najmniej 10 mm wokół labiryntu.
- `npx playwright test` przechodzi na Chromium i WebKit dla telefonu, tabletu i desktopu.
