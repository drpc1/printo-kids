# e2e-in-ci-gate — Brief

Pełny plan: [plan.md](plan.md)

## Cel

Playwright e2e (Chromium) w bramce CI na push i PR do `main`, żeby zmiany nazw w UI nie psuły e2e po cichu.

## Starting Point

CI ma `ci` i `smoke`; e2e działały lokalnie i ręcznie (`e2e-phone.yml`).

## Key Decisions

| Decyzja           | Wybór                                    | Powód                                                         |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------- |
| Projekty w bramce | chromium, phone-360, pixel-7, tablet-768 | pokrywają desktop, telefon i tablet; Chromium działa wszędzie |
| WebKit            | zostaje w ręcznym workflow               | wolniejszy, dawny powód S-09                                  |
| Raport            | artefakt tylko przy błędzie              | oszczędza miejsce                                             |
| Wymagany check    | decyzja użytkowniczki                    | ustawienie ochrony gałęzi jest jej                            |

## Phases

| Faza | Zakres                                                             |
| ---- | ------------------------------------------------------------------ |
| 1    | job `e2e` w ci.yml                                                 |
| 2    | aktualizacja AGENTS.md, test-stack.md, test-plan.md, e2e-phone.yml |

Prerequisites: brak. Effort: mały; job ok. 2m37s.
