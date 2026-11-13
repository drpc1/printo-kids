# Dwa środowiska: staging z `main` i produkcja z `prod` — Plan Brief

> Full plan: `context/changes/gh238-two-branches/plan.md`
> Issue: https://github.com/drpc1/printo-kids/issues/238

## What & Why

Jedna stabilna produkcja i jedna wersja do rozwoju i testów, na darmowych planach GitHuba i Cloudflare. Gdy staging jest w pełni przetestowany (nie tylko przez właściciela), PR `main → prod` wypuszcza go do rodziców.

## Starting Point

Jedna gałąź `main` z rulesetem (checki `ci`, `smoke`), jeden Worker `printo-kids` bez `env`. Właściciel potwierdził, że Workers Builds wdraża dziś produkcję z `main`.

## Desired End State

Merge do `main` aktualizuje tylko `printo-kids-staging`; merge PR `main → prod` aktualizuje `printo-kids`. Push do `prod` jest zablokowany, staging odpowiada `X-Robots-Tag: noindex`, a proces wydania jest w `AGENTS.md`.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Obecna produkcja | Workers Builds z `main` | Najpierw przepiąć Worker na `prod`, potem zmieniać `main` | Plan |
| Noindex | Nagłówek `X-Robots-Tag` z middleware, tylko staging | Nie dotyka layoutu, produkcja bez zmian | Plan |
| Weryfikacja env | Dodatkowy build stagingu w jobie `ci` | Zła konfiguracja env wychodzi przed merge; nazwy jobów bez zmian | Plan |
| Kroki poza kodem | `gh` dla GitHuba po zgodzie, Cloudflare w panelu przez właściciela | Ruleset odtwarzalny, panel tylko u właściciela | Plan |
| Ruleset `prod` | PR bez zatwierdzeń, `ci` + `smoke` + `e2e`, tylko merge commit, bez force push i usuwania | Jeden właściciel; wymusza „bez squash” | Plan |
| Wydanie | Tag i merge wsteczny ręcznie wg `AGENTS.md` | Wydania są rzadkie, zero nowego CI | Plan |
| Staging | Publiczny z `noindex`, bez Cloudflare Access | Testerzy z telefonami bez logowania | Issue / Plan |

## Scope

**In scope:** `env.staging`, middleware `noindex`, CI dla `prod` + build stagingu, szablon PR wydania, `AGENTS.md`, gałąź i ruleset `prod`, checklista Cloudflare.

**Out of scope:** Cloudflare Access, automatyczne tagi/Release, GitHub Environments, własna domena, zmiany produktu.

## Architecture / Approach

`CLOUDFLARE_ENV=staging` przy buildzie wybiera `env.staging` z `wrangler.jsonc` (jeden build na środowisko). Zmienna `ENVIRONMENT` w tym env włącza nagłówek. Dwa Workery, dwie gałęzie w Workers Builds.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Przepięcie produkcji | `prod` + Worker `printo-kids` z tej gałęzi | Zła kolejność przerwałaby produkcję |
| 2. Staging w kodzie | `env.staging`, `noindex`, test | Config env nie emituje poprawnych assets |
| 3. CI, szablon, docs | `ci.yml` dla `prod`, szablon PR, `AGENTS.md` | Skrypt `context-only-diff` dla bazy `prod` |
| 4. Ochrona i staging | Ruleset, Worker `printo-kids-staging` | Pierwszy deploy musi być `wrangler deploy` |
| 5. Weryfikacja | Próbne wydanie i hotfix | Limity minut buildów |

**Prerequisites:** dostęp do panelu Cloudflare, zgoda na zmiany ustawień repo.
**Estimated effort:** ~2 sesje; Fazy 1 i 4 wymagają działań właściciela.

## Open Risks & Assumptions

- Zakładamy, że wdrożony commit produkcji da się ustalić z panelu; w przeciwnym razie `prod` z aktualnego `main` po potwierdzeniu.
- Adapter może inaczej wyemitować `dist/server/wrangler.json` dla env; wtedy deploy z `--config` (patrz `infrastructure.md`).

## Success Criteria (Summary)

- Merge do `main` zmienia tylko staging, merge do `prod` tylko produkcję.
- Nie da się wypchnąć na `prod` bez PR i zielonego CI.
- Staging nie jest indeksowany.
