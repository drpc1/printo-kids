# Bramka „tylko context/” od merge-base — Plan Brief

> Full plan: `context/changes/gh249-fix-ci-gates/plan.md`

## What & Why

Job `changes` w CI porównuje czubek `main` z głową PR dwoma końcami, więc przy gałęzi w tyle za `main` cudze zmiany w `src/` liczą się jak zmiany PR i bramka `ci`/`smoke`/`e2e` rusza mimo PR tylko z `context/` (GitHub 249, PR 247). Liczymy zmiany od merge-base, tak jak pokazuje je GitHub.

## Starting Point

`.github/workflows/ci.yml:33` robi `git diff -z -M --name-status "$base" "$head"`; parser `scripts/context-only-diff.mjs` jest poprawny, ale testy nie dotykają zakresu diffa.

## Desired End State

PR tylko z `context/` pomija trzy joby bez względu na to, jak daleko gałąź jest w tyle. Push na `main` zostaje przy `before..sha`. Test w `npm test` odtwarza scenariusz PR 247.

## Key Decisions Made

| Decision        | Choice                                                 | Why (1 sentence)                                        | Source |
| --------------- | ------------------------------------------------------ | ------------------------------------------------------- | ------ |
| Zakres dla PR   | `"$base...$head"` przez zmienną `range`                | Merge-base daje dokładnie zmiany PR bez zmiany parsera. | Issue  |
| Zakres dla push | bez zmian (`before..sha`)                              | Issue wprost zostawia obecne porównanie.                | Issue  |
| Test            | Temp repo w `node:test` + asercja tekstowa na `ci.yml` | Odtwarza PR 247 i pilnuje workflow, nie tylko gita.     | Plan   |
| Skrypt bramki   | dalej z `$base`                                        | Zaufana wersja z `main`, poza zakresem tej zmiany.      | Plan   |

## Scope

**In scope:** krok diff w `ci.yml`; nowy test w `scripts/context-only-diff.test.mjs`.

**Out of scope:** parser, warunki `if:` jobów, treść AGENTS.md, `e2e-phone.yml`.

## Architecture / Approach

Zmienna `range` zależna od zdarzenia, jeden `git diff`. Test buduje tymczasowe repo (main idzie naprzód o `src/`, gałąź zmienia `context/`) i porównuje wynik bramki dla obu zakresów.

## Phases at a Glance

| Phase                          | What it delivers                  | Key risk                                            |
| ------------------------------ | --------------------------------- | --------------------------------------------------- |
| 1. Zakres od merge-base i test | Poprawka `ci.yml` + test regresji | Prawdziwy efekt widać dopiero po scaleniu na `main` |

**Prerequisites:** brak.
**Estimated effort:** ~1 sesja, 1 faza.

## Open Risks & Assumptions

- Workflow i skrypt z PR działają dopiero z `main`; ręczna weryfikacja po scaleniu.
- Test używa `git` w środowisku testowym (CI je ma).

## Success Criteria (Summary)

- PR tylko z `context/` z gałęzi w tyle pomija `ci`, `smoke`, `e2e`.
- Cofnięcie poprawki w `ci.yml` zapala test.
