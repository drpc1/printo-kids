# Walidacja pull requestów w istniejącym CI — Plan Brief

> Full plan: `context/changes/new-pr-ci-cd-workflow/plan.md`

## What & Why

Pull request do `master` ma być sprawdzany przez GitHub Actions, zanim wejdzie na branch. Ten przebieg już jest: `.github/workflows/ci.yml` startuje na push i na pull request. Plan dopina go do wersji Node z `.nvmrc`, wyrównuje opisy i dodaje ręczny wymóg, że czerwony wynik blokuje merge.

## Starting Point

Jest jeden workflow o nazwie `CI`. Job `ci` odpala lint, `npm test`, `astro check` i build z sekretami Supabase. Job `smoke` sprawdza flow kont startera na lokalnym Supabase. Node w Actions to major `22`, a `.nvmrc` trzyma `22.14.0`. README pomija `npm test`, CLAUDE mówi o lincie i buildzie, AGENTS wymienia komendy bez słowa „pull request”. Deployu w Actions nie ma. Publikacja jest opisana jako Cloudflare Workers Builds.

## Desired End State

Autor pull requestu do `master` widzi ten sam przebieg co dziś, na Node `22.14.0`. Czerwony job `ci` albo czerwony job `smoke` psuje wynik. README, CLAUDE i AGENTS mówią o tym samym zestawie kroków. Po włączeniu wymaganych checków taki czerwony pull request nie wchodzi na `master`.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Plik workflow | Zostaje `.github/workflows/ci.yml` | Pull request do `master` już go uruchamia, więc drugi plik dublowałby kroki. |
| Deploy | Zostaje przy Workers Builds | Infrastruktura i plan pierwszego deployu zostawiają `ci.yml` bez `wrangler deploy`. |
| Czerwony smoke | Dalej psuje przebieg pull requestu | Plan testów zostawia smoke bez nowych asercji, a faza 4 i `F-02` mają własne change. |
| Blokada merge | YAML plus ręczne checki `CI / ci` i `CI / smoke` | Sam plik workflow merge’a nie zatrzymuje. |
| Opisy | README, CLAUDE.md i AGENTS.md | Dziś każdy z nich podaje inny zestaw kroków. |
| Node | Pin z `.nvmrc` (`22.14.0`) | Jeden plik wersji dla lokalnej pracy i dla obu jobów. |

## Scope

**In scope:**

- `node-version-file: .nvmrc` w obu jobach, bez zmiany triggerów, komend i sekretów
- Ten sam opis przebiegu w `README.md`, `CLAUDE.md` i `AGENTS.md`
- Ręczne wymagane checki `CI / ci` i `CI / smoke` na `master`

**Out of scope:**

- Drugi workflow, deploy w Actions, Workers Builds, `wrangler.jsonc`
- Zdejmowanie smoke z pull requestu i asercje startera
- Faza 4 planu testów oraz `F-02` / `remove-starter-scaffold`
- Inne reguły brancha: aktualność, konwersacje, zakaz pusha, obejście administratora

## Architecture / Approach

Jeden workflow zostaje bramką pusha i pull requestu do `master`. Job `ci` pilnuje kartki przez `npm test` oraz lint, typy i build. Job `smoke` zostaje równoległym sprawdzianem kont startera i dalej psuje wynik, gdy jest czerwony. Wersja Node jest czytana z `.nvmrc` po checkout. Nazwy wymaganych checków biorą się z `name: CI` i identyfikatorów jobów. Ustawienie tych checków jest w GitHubie, nie w pliku.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Kontrakt w repozytorium | Pin Node i trzy zgodne opisy | Zostawienie `node-version` obok `node-version-file` albo zmiana nazwy workflow, od której zależy faza 2 |
| 2. Wymagane checki | Merge na `master` czeka na zielone `CI / ci` i `CI / smoke` | Bez uprawnień admina krok zostaje opisem; do tego czasu czerwony PR nadal można zmergować |

**Prerequisites:** uprawnienie do reguł brancha `master` w GitHubie. Sekrety `SUPABASE_URL` i `SUPABASE_KEY` już są używane przez job `ci`; plan ich nie dodaje.
**Estimated effort:** jedna sesja na fazę 1. Faza 2 to kilka minut w ustawieniach GitHuba plus jeden celowo czerwony pull request.

## Open Risks & Assumptions

- Do czasu fazy 2 merge czerwonego pull requestu nadal przechodzi.
- Administrator może obejść wymagane checki, dopóki osobna reguła tego nie wyłączy. Ta reguła jest poza planem.
- Pull request z forka nie dostaje sekretów repozytorium. Schemat Astro ma `SUPABASE_URL` i `SUPABASE_KEY` jako opcjonalne, więc build joba `ci` na forku może iść dalej z pustymi wartościami.
- Job `smoke` zostaje długi i dalej leci na każdym pull requeście do `master`.

## Success Criteria (Summary)

- Pull request do `master` uruchamia obecne joby `ci` i `smoke` na Node z `.nvmrc`.
- README, CLAUDE i AGENTS opisują ten przebieg, łącznie z `npm test` i smoke.
- Po ręcznym ustawieniu czerwony `CI / ci` albo czerwony `CI / smoke` blokuje merge na `master`.
