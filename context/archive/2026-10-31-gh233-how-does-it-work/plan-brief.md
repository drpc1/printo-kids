# Opisy generatorów w „Jak to działa” — Plan Brief

> Full plan: `context/changes/gh233-how-does-it-work/plan.md`
> Research: `context/changes/gh233-how-does-it-work/research.md`

## What & Why

Miniatura w katalogu pokazuje wygląd karty, ale nie mówi, co dziecko ma na niej zrobić (GitHub 233). Dodajemy dwa–trzy zdania o każdym rodzaju karty do strony „Jak to działa” i trzymamy je przy definicji rodzaju w kodzie, żeby nowy rodzaj dostawał opis tam, gdzie powstaje.

## Starting Point

„Jak to działa” to osobna strona `/how-it-works` z pięcioma sekcjami o poziomach, profilu i postaci. `CARD_KINDS` (`src/lib/cards.ts`) ma sześć rodzajów bez żadnego opisu.

## Desired End State

Strona ma sekcję „Rodzaje kart” z sześcioma opisami w kolejności alfabetycznej, a sekcja „Poziomy” wymienia karty z typowym wiekiem. PRD (US-05) ma kryterium o opisach.

## Key Decisions Made

| Decision       | Choice                                  | Why (1 sentence)                                                                                | Source     |
| -------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------- |
| Gdzie opisy    | Tylko `/how-it-works`                   | Katalog w dwóch kolumnach na telefonie nie zniesie podpisów, a strona jest do wyjaśnień (US-22) | Plan       |
| Kolejność      | Alfabetyczna                            | Jak w katalogu                                                                                  | Użytkownik |
| Kształt danych | Jedno pole `description`                | Prostota, wystarcza na 2–3 zdania                                                               | Plan       |
| Zdanie o wieku | Dopisane do „Poziomy”, z listą kart     | Sekcja już mówi o wieku, brakuje tylko listy                                                    | Research   |
| Pilnowanie     | Test jednostkowy niepustego opisu + e2e | Wzór z s32                                                                                      | Research   |

## Scope

**In scope:** pole `description`, sekcja „Rodzaje kart”, zdanie o wieku, testy, kryterium w US-05.

**Out of scope:** opisy na stronie głównej, zmiany katalogu i stopki, US-22 i FR-031.

## Architecture / Approach

`CardKind.description` jest wymagane, więc nowy rodzaj nie skompiluje się bez opisu. Strona Astro iteruje po `cardsInCatalogOrder()` i renderuje tytuł-link oraz opis.

## Phases at a Glance

| Phase                  | What it delivers                                    | Key risk                                          |
| ---------------------- | --------------------------------------------------- | ------------------------------------------------- |
| 1. Opis przy definicji | Pole `description`, sześć tekstów, test jednostkowy | Opis niezgodny z PRD albo zdradzający rozwiązanie |
| 2. Sekcja na stronie   | „Rodzaje kart”, zdanie o wieku, test e2e            | Długość strony na telefonie                       |
| 3. PRD                 | Kryterium w US-05                                   | Brzmienie wymaga zgody użytkownika                |

**Prerequisites:** brak.
**Estimated effort:** ~1 sesja, 3 małe fazy.

## Open Risks & Assumptions

- Teksty opisów są propozycją i potwierdza je użytkownik w fazie 1.
- Test e2e uruchamia się tylko na desktopowym Chromium, jak reszta pliku.

## Success Criteria (Summary)

- Rodzic widzi, co dziecko robi na każdej karcie, bez zgadywania po nazwie.
- Nowy rodzaj karty nie przejdzie testów bez opisu.
- `npm run lint`, `npm test`, `npx astro check`, `npm run build` i e2e strony są zielone.
