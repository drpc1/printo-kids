# S-32 Strona „Jak to działa" — Plan Brief

> Full plan: `context/changes/s32-how-does-it-work/plan.md`
> Frame brief: `context/changes/s32-how-does-it-work/frame.md`

## What & Why

Dodajemy jedną statyczną stronę `/how-it-works` ze stopki, która tłumaczy poziomy, profil i postać. Problem do zaplanowania (z frame): stopka z linkiem do jednej strony, bez asystenta i bez nowych tooltipów, bo podpowiedzi w miejscu wyboru już istnieją.

## Starting Point

Podpowiedzi „Zapamiętane dla", „Tylko na tę kartę", „Ustaw jako ulubioną" i zdanie w oknie profilu są w kodzie (S-27–S-31). Brakuje stopki i strony. `GeneratorShell.astro` ukrywa w druku wszystko poza SVG karty.

## Desired End State

Z `/` i z każdej strony generatora rodzic klika „Jak to działa" w stopce i czyta krótką stronę. Stopka nie wchodzi na wydruk A4 ani nie zasłania „Generuj"/„Drukuj" na telefonie.

## Key Decisions Made

| Decision             | Choice                                             | Why                                                   | Source      |
| -------------------- | -------------------------------------------------- | ----------------------------------------------------- | ----------- |
| Strona vs asystent   | Jedna strona, bez asystenta                        | PRD wyklucza samouczek i okno pomocy; tooltipy już są | Frame       |
| Adres                | `/how-it-works`                                    | Pozostałe trasy mają angielskie adresy                | Plan        |
| Miejsce stopki       | Katalog + wszystkie generatory                     | US-22 mówi „w stopce"; wybór użytkownika              | Plan        |
| Pilnowanie zgodności | Test e2e na zdania strony i UI                     | Roadmapa wskazuje rozjazd jako główne ryzyko          | Plan        |
| Technologia          | Astro, bez Reacta                                  | AGENTS.md: React tylko dla interakcji                 | Plan        |
| PRD US-05            | „Pod kartą nic nie ma” zmienione na „poza stopką”  | Inaczej PRD sprzeczny z US-22                         | Plan review |
| Roadmapa             | Change ID S-32 zmieniony na `s32-how-does-it-work` | Inaczej status S-32 nie jest śledzony                 | Plan review |

## Scope

**In scope:** strona, stopka (katalog + generatory), wpis w smoke, test e2e, asercja druku w `print-contract.test.ts`, poprawka US-05 w PRD i Change ID w roadmapie.

**Out of scope:** asystent, tour, nowe tooltipy, zmiana zachowania profilu, inne języki.

## Architecture / Approach

Nowa strona Astro w `Layout`; komponent `SiteFooter.astro` użyty w `index.astro` i `GeneratorShell.astro` (wewnątrz `#worksheet-home`, `print:hidden`). Test e2e wiąże treść strony z tekstami UI.

## Phases at a Glance

| Phase                 | What it delivers                        | Key risk                         |
| --------------------- | --------------------------------------- | -------------------------------- |
| 1. Strona             | `/how-it-works` + smoke                 | Treść rozjeżdża się z UI         |
| 2. Stopka             | Link na katalogu i sześciu generatorach | Układ na telefonie i druk A4     |
| 3. Test i uzgodnienie | e2e treści i druku, PRD i roadmapa      | Kruchość testu na brzmienie zdań |

**Prerequisites:** S-27, S-29, S-31 (zrobione).
**Estimated effort:** ~1–2 sesje, 3 fazy.

## Open Risks & Assumptions

- Stopka w `GeneratorShell.astro` może zmienić wysokość strony na telefonie; sprawdza to faza 2.
- Brzmienie zdań w UI jest pilnowane testem; zmiana wymusza przegląd strony.

## Success Criteria (Summary)

- Rodzic z `/` i z generatora dociera do strony jednym kliknięciem.
- Wydruk A4 bez zmian.
- CI (lint, testy, astro check, build, smoke, e2e) zielone.
