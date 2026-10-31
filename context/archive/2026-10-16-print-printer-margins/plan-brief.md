# Wydruk z iPhone'a bez podwójnego marginesu — Plan Brief

> Full plan: `context/changes/print-printer-margins/plan.md` (przepisany 2026-10-31 po próbie na iPhonie)

## What & Why

Na iPhonie karta drukuje się dużo mniejsza niż kartka: labirynt ok. 140 mm szerokości na A4, ok. 35 mm białego pasa z boków i ok. 75 mm pod „Meta” (issue #38). Plan powiększa kartę na telefonie, nie zmieniając wydruku z komputera.

## Starting Point

Reguła druku `max-height: 100vh` w `GeneratorShell.astro` trzyma kartę na jednej stronie. Na iOS `100vh` w druku to tylko ok. 82 % obszaru druku, więc karta jest za mocno zmniejszona. Zapytania o szerokość i wysokość w druku iOS nie opisują kartki (≤ 170 mm, ≤ 240 mm przy obszarze ok. 197 × 269 mm), ale odróżniają telefon od komputera.

## Desired End State

Na iPhonie (Safari, Chrome, Brave) karta drukuje się na jednej stronie A4 ok. 16 % większa: labirynt Poziomu 3 ok. 162 mm zamiast 140 mm. Wydruk z komputera jest taki sam jak dziś.

## Key Decisions Made

| Decision                 | Choice                                                  | Why (1 sentence)                                                            |
| ------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| Co zmieniamy             | Limit `max-height` karty w druku na telefonie           | Próba pokazała, że kartę ogranicza `100vh`, a nie wewnętrzny margines 10 mm |
| Wartość                  | `116vh`                                                 | Zmierzone: +16 % i ok. 5 % zapasu; `122vh` mieściło się z ok. 1,5 mm zapasu |
| Wykrywanie               | `@media print and (hover: none) and (max-width: 175mm)` | iOS zgłasza ≤ 170 mm; komputer 210 mm albo ≥ 184 mm i nie jest dotykowy     |
| Przycięcie insetu 9,5 mm | Odpada                                                  | iOS nie podaje danych, żeby je policzyć (pierwsza wersja planu)             |

## Scope

**In scope:** wariant CSS druku dla telefonu, test kontraktowy, test Playwright, pomiary i ręczny druk na iPhonie.

**Out of scope:** geometria kart i `inset`, wrapper `data-sheet`, adres i numer strony Safari, wyśrodkowanie karty w pionie, JS w druku, Android i inne przeglądarki komputerowe.

## Architecture / Approach

Jeden blok `@media print and (hover: none) and (max-width: 175mm)` po bloku `@media print` nadpisuje `max-height` karty (`#worksheet-home svg`) z `100vh` na `116vh`. Blok bazowy się nie zmienia.

## Phases at a Glance

| Phase              | What it delivers                                                  | Key risk                                                 |
| ------------------ | ----------------------------------------------------------------- | -------------------------------------------------------- |
| 1. Wariant CSS     | Blok druku dla telefonu, test kontraktowy, podgląd na iPhonie     | `hover: none` w druku iOS niesprawdzone przed fazą 1     |
| 2. Test Playwright | Komputer bez wariantu, telefon z wariantem; pomiary w `change.md` | Emulacja nie odtwarza iOS                                |
| 3. Druk na iPhonie | Wyniki ręczne, kontrola komputera                                 | Inne iPhone'y lub Letter mogą mieć inny stosunek `100vh` |

**Prerequisites:** iPhone z Safari (faza 1), Chrome i Brave (faza 3); serwer w sieci lokalnej.
**Estimated effort:** ~1 sesja, 3 fazy.

## Open Risks & Assumptions

- Stosunek `100vh` do obszaru druku (ok. 82 %) zmierzono na jednym iPhonie i A4; na Letter i innych urządzeniach może być inny.
- Karta na iOS zostaje u góry kartki.

## Success Criteria (Summary)

- iPhone: jedna strona, labirynt ok. 16 % większy.
- Komputer: wydruk bez zmian.
