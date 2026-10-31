# Pomiń ci, smoke i e2e, gdy pull request zmienia tylko context — Plan Brief

> Full plan: `context/changes/context-only-ci-skip/plan.md`

## What & Why

Pull request złożony tylko z plików w `context/` dziś czeka na lint, testy, build, smoke i Playwright, choć żaden z tych kroków tego katalogu nie czyta. Bramka ma dla takiego diffa zamilknąć, bez zdejmowania nazw checków, których ochrona `main` wymaga do merge.

## Starting Point

`.github/workflows/ci.yml` na każdy push i pull request do `main` uruchamia `ci`, `smoke` i `e2e`. Podgląd Cloudflare wstaje dopiero po nich. Ochrona gałęzi wymaga tych trzech nazw (`ci` i `smoke` powtarza ruleset). Issue [#210](https://github.com/drpc1/printo-kids/issues/210).

## Desired End State

Gdy każda zmieniona ścieżka leży w `context/`, trzy joby są pominięte, GitHub liczy je jako sukces i merge przechodzi. Podgląd nie powstaje. Ścieżka spoza katalogu, któraś strona rename albo błąd liczenia uruchamiają bramkę jak dziś. To samo dotyczy pusha na `main`.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Kiedy bramka milczy | Każda ścieżka ma prefiks `context/` | Aplikacja, lint, testy i smoke tego katalogu nie czytają |
| Jak milczy | Job pominięty warunkiem `if`, nie filtr `paths` na triggerze | Nieuruchomiony workflow zostawia wymagany check w „Pending”; pominięty job jest sukcesem |
| Błąd klasyfikacji | `ci`, `smoke` i `e2e` lecą | Awaria filtra nie może otworzyć merge |
| Ochrona gałęzi | Listy checków bez zmian | Wystarczy, że check o tej samej nazwie wróci jako pominięty |
| Podgląd | Nie powstaje | `preview` zależy od trzech jobów i nie dostaje `always()` |
| Klasyfikacja | Skrypt z `node:test` i `git diff -z` | Prefiks i obie ścieżki rename da się sprawdzić bez GitHuba |
| Push na `main` | Ten sam warunek | Commit tylko z `context/` też nie daje sygnału o aplikacji |

## Scope

**In scope:**

- `scripts/context-only-diff.mjs`, jego test i dopisanie testu do skryptu `test` w `package.json`
- Job `changes` oraz warunek `ci`, `smoke` i `e2e` w `.github/workflows/ci.yml`
- Opis w `AGENTS.md`, `context/foundation/infrastructure.md` i punkcie CI w `context/foundation/test-stack.md`

**Out of scope:**

- Ochrona `main`, ruleset i próg pokrycia
- Filtr `paths` na triggerze, linter dokumentów, `e2e-phone.yml`
- Podgląd przy samym `context/` i ponowne uruchomienie `/10x-e2e-setup`

## Architecture / Approach

Job `changes` liczy diff od bazy do głowy i zapisuje `app=true` albo `app=false`. Trzy joby bramki mają `needs: changes` i lecą, gdy `app` jest `true` albo `changes` nie skończył się sukcesem. Padnięty `git diff` nie może wyglądać jak pusty diff: krok ma `pipefail`. Pusty udany diff bramki nie włącza.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Bramka | Skrypt, test i warunek w `ci.yml` | `pipefail` albo brak `always()` przy błędzie `changes` puści merge bez bramki |
| 2. Opis | Trzy pliki mówią to samo co workflow | Pull request z `ci.yml` sam nie pokazuje pominięcia; opis łatwo zostawić przy starej bramce |

**Prerequisites:** Issue #210. Ochrony gałęzi nie zmieniamy.
**Estimated effort:** Jedna sesja, dwie fazy. Sprawdzian pominięcia to drugi, późniejszy pull request złożony tylko z `context/`.

## Open Risks & Assumptions

- GitHub nadal traktuje job pominięty warunkiem `if` jako sukces wymaganego checka. Gdy to się zmieni, pull requesty z samego `context/` znów staną na „Pending”.
- Reguła pokrycia 50% nie czeka na upload, a ten workflow pokrycia nie wysyła. Gdyby później upload z joba `ci` stał się osobnym wymaganym checkiem, samo pominięcie `ci` go nie zastąpi.
- Pull request wnoszący `ci.yml` przechodzi pełną bramkę. Pominięcia nie widać, dopóki nie ma diffa wyłącznie z `context/`.

## Success Criteria (Summary)

- Test skryptu łapie sam `context/`, ścieżkę spoza niego, rename i obcięty zapis.
- Na pull requeście z samego `context/` joby `ci`, `smoke` i `e2e` są pominięte, podgląd nie powstaje, a merge nie czeka na te checki.
- `AGENTS.md`, `infrastructure.md` i punkt CI w `test-stack.md` opisują tę samą regułę.
