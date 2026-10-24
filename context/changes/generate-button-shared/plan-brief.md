# Wspólny GenerateButton w generatorach — Plan Brief

> Full plan: `context/changes/generate-button-shared/plan.md`

## What & Why

Trzy generatory (Labirynt, Symetria, Sudoku) mają lokalne kopie przycisku `GenerateButton` i stałej `ACTION_BUTTON_CLASS`, choć wspólny `@/components/GenerateButton` już istnieje i używa go Sekwencje. Kopie grożą rozjechaniem się wyglądu przycisku między stronami (issue #81).

## Starting Point

Wspólny plik z S-16 (PR #82) i trzy lokalne kopie. Porównanie wykazało, że kopie są identyczne ze wspólnym plikiem (klasy, propsy, ikona Shuffle, tekst „Generuj”, warianty hero/quiet).

## Desired End State

Wszystkie cztery generatory importują `GenerateButton` i `ACTION_BUTTON_CLASS` ze wspólnego pliku. Strony wyglądają i działają dokładnie jak przedtem.

## Key Decisions Made

| Decision               | Choice                                   | Why                                                        |
| ---------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| Różnice między kopiami | Brak, kontynuujemy                       | Kopie identyczne ze wspólnym plikiem, nic do ujednolicenia |
| Liczba faz             | Jedna                                    | Zmiana mechaniczna, jedna weryfikacja                      |
| Przycisk Drukuj        | Zostaje, bierze stałą ze wspólnego pliku | Bez nowych abstrakcji                                      |
| Zapisy `cn("…")` druku | Nietknięte                               | Czyta je `print-contract.test.ts`                          |

## Scope

**In scope:** usunięcie lokalnych kopii w trzech generatorach, import ze wspólnego pliku, usunięcie nieużywanego `Shuffle`.

**Out of scope:** nowe abstrakcje, zmiany wspólnego pliku, logika generowania/profilu/druku.

## Architecture / Approach

Czysta edycja importów i usunięcie duplikatów w `WorksheetGenerator.tsx`, `SymmetryGenerator.tsx`, `SudokuGenerator.tsx`; miejsca wywołania bez zmian.

## Phases at a Glance

| Phase                             | What it delivers                    | Key risk                                   |
| --------------------------------- | ----------------------------------- | ------------------------------------------ |
| 1. Przepięcie na wspólny przycisk | Trzy generatory bez lokalnych kopii | Pozostały nieużywany import (wyłapie lint) |

**Prerequisites:** brak.
**Estimated effort:** ~1 krótka sesja.

## Open Risks & Assumptions

- Port 4321 może zajmować serwer z innego worktree, dlatego E2E idzie na `E2E_PORT=4398`.

## Success Criteria (Summary)

- lint, test, astro check, build i E2E zielone.
- Na `/labirynt`, `/symetria`, `/sudoku` duży Generuj i pasek Generuj/Drukuj bez zmian, bez nakładania się na telefonie.
