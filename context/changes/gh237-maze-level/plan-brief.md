# Poziom labiryntu w `cards.labirynt` — Plan Brief

> Full plan: `context/changes/gh237-maze-level/plan.md`

## What & Why

Poziom labiryntu przechodzi z osobnego pola `level` profilu i ostatnich parametrów do `cards.labirynt`, tak jak ustawienia pozostałych pięciu kart. Dziś każda strona karty niesie `barLevel` labiryntu przez wspólne komponenty tylko po to, żeby go nie zgubić. Po zmianie wspólne komponenty nie znają typu poziomu labiryntu, a `ProfileCorner` na stronie głównej (GitHub 234) nie potrzebuje stanu paska labiryntu.

## Starting Point

`ChildProfile.level` i `LastUsed.level` trzymają poziom labiryntu, `ProfileBar.level` niesie go przez `useChildProfileVisit`, a `barLevel` przechodzi przez `useCardPage`, `CardPage` i `ProfileCorner`. Labirynt zapisuje poziom własną ścieżką (`useMazeLevelMemory`, `recordBarCharacter`), pozostałe karty przez `useCardSettings`.

## Desired End State

Labirynt czyta i zapisuje poziom przez `useCardSettings("labirynt")`. Rodzic nie widzi różnicy w działaniu, a zapisane profile i ostatnie parametry w dawnym kształcie wczytują się, z poziomem w `cards.labirynt`.

## Key Decisions Made

| Decision                          | Choice                                                         | Why (1 sentence)                                                           | Source |
| --------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- | ------ |
| Nowy profil utworzony na `/maze`  | Zaczyna od domyślnego poziomu (Poziom 3)                       | Zgodne z PRD US-08 (2026-10-27), zero zmiany zachowania                    | Plan   |
| Dawne pole `level` po migracji    | Odczyt akceptuje, zapis usuwa                                  | Jedno źródło prawdy, bez rozjazdu dwóch pól                                | Plan   |
| Pierwszeństwo przy odczycie       | Poprawne `cards.labirynt`, potem dawne `level`, potem domyślny | Nowszy kształt jest świeższy; po rollbacku stary kod gubi `cards.labirynt` | Plan   |
| Moment migracji                   | Przy odczycie, bez przepisywania przy starcie                  | Prosty kod; nowy kształt trafia do storage przy następnym zapisie          | Plan   |
| Plakietka labiryntu               | Labirynt nadal zawsze „użyty”                                  | Zachowanie jak dziś; profil bez `cards.labirynt` pokazuje domyślny poziom  | Plan   |
| Reset paska po utworzeniu profilu | `useCardSettings.corner.onCreated` robi `switchTo`             | Dziś robi to `onApply` z poziomem profilu, który znika                     | Plan   |

## Scope

**In scope:** model danych (`card-settings`, `child-profiles`, `last-used`, `own-image-store`, `card-summary`), hooki profilu i postaci, `useCardSettings`, `CardPage`, `ProfileCorner`, `CatalogProfileCorner`, `WorksheetGenerator`, pięć stron kart, `AGENTS.md`.

**Out of scope:** zmiana zachowania dla rodzica, zapis podwójny `level`, migracja przy starcie, `LevelId`/`LEVELS`, wygląd paska i okna profilu, PRD, pełny Stryker (tylko wąski przebieg na plikach migracji w fazie 3). Istniejące asercje e2e na zapisany kształt `level` są aktualizowane w fazie 2.

## Architecture / Approach

Labirynt staje się zwykłą kartą w `CardSettingsMap` (`labirynt: { level }`). Wspólna funkcja `parseStoredCards` czyta rekord z `cards` i dawnym `level` (profil i last-used), a zapis zapisuje tylko nowy kształt. `ProfileBar`, `BarChoice` i `OpeningVisit` niosą już tylko postać; poziom przełącza `useCardSettings` przy zmianie profilu, tak jak na pozostałych kartach.

## Phases at a Glance

| Phase                           | What it delivers                                                    | Key risk                                                            |
| ------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1. Dane i migracja (test-first) | `labirynt` w `cards`, migracja przy odczycie, `level` znika z `lib` | Zgubienie poziomu rodzica; typy UI niezgodne do końca fazy 2        |
| 2. Hooki i komponenty           | Brak `barLevel`, labirynt na `useCardSettings`                      | Reset paska po utworzeniu profilu i przerysowanie przy przełączeniu |
| 3. Dokumenty i weryfikacja      | `AGENTS.md` zgodny z kodem, pełny lint/typy/build/e2e               | Długie e2e, kolizja portu 4321 z innym checkoutem                   |

**Prerequisites:** Node 22.14.0, zależności zainstalowane; wolny port dla e2e (`E2E_PORT`).
**Estimated effort:** ~2 sesje, 3 fazy, ok. 20 plików.

## Open Risks & Assumptions

- Cofnięcie wdrożenia po zapisie nowego kształtu przywróci domyślny poziom labiryntu (akceptowane).
- Zakładam, że istniejące specyfikacje e2e z dawnym `localStorage` wystarczają jako test zgodności; jeśli żadna nie zasila dawnego `level` profilu, dokładam jeden przypadek.
- `switchTo` po `onCreated` na pozostałych kartach nie może wywołać zbędnego przerysowania; strony reagują tylko na różnicę ustawień.

## Success Criteria (Summary)

- Dawne profile i ostatnie parametry wczytują się z tym samym poziomem labiryntu, a po zapisie mają tylko `cards.labirynt`.
- `grep barLevel src` jest puste, a `CardPage` i `ProfileCorner` nie importują `LevelId`.
- Lint, `astro check`, testy, build i e2e na Chromium przechodzą.
