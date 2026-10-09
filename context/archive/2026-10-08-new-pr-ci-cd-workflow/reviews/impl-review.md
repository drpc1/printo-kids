<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Walidacja pull requestów w istniejącym CI

- **Plan**: context/changes/new-pr-ci-cd-workflow/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2
- **Date**: 2026-10-09
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical 2 warnings 0 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | WARNING |
| Scope Discipline | PASS |
| Safety & Quality | PASS |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | WARNING |

## Findings

### F1 — Wymagane checki to `ci` i `smoke`, nie `CI / ci` i `CI / smoke`

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: context/changes/new-pr-ci-cd-workflow/plan.md:169
- **Detail**: Progress 2.1 is checked off for required names `CI / ci` and `CI / smoke` on `master`. Branch protection on `main` stores contexts `ci` and `smoke` (GitHub Actions app 15368, `strict: false`). Those job names are what GitHub matches. The plan's strings stayed "Expected" and never received a status. `CI / ci (pull_request)` is only the label in the pull request UI. Pull request 15 was blocked while `ci` was red and was closed without merge. Pull request 14, with both jobs green, was mergeable.
- **Fix A ⭐ Recommended**: Leave the GitHub contexts as `ci` and `smoke`. Add a note in the plan that those are the strings the API stores.
  - Strength: This is the setting that blocked the red pull request and allowed the green one.
  - Tradeoff: The checked step title still says `CI / ci` and `CI / smoke`.
  - Confidence: HIGH — both name variants were tried against the same pull requests.
  - Blind spot: None significant.
- **Fix B**: Put `CI / ci` and `CI / smoke` back as the required contexts.
  - Strength: The checkbox text would match the settings page.
  - Tradeoff: Those names never got a status, so a green pull request stayed blocked.
  - Confidence: HIGH — that was the state before the contexts were changed to the job names.
  - Blind spot: None significant.
- **Decision**: FIXED via Fix A

### F2 — Workflow i opisy słuchają `main`, plan mówi `master`

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: .github/workflows/ci.yml:5
- **Detail**: The plan keeps `push` and `pull_request` on `master`. The workflow and README, CLAUDE, and AGENTS all say `main`. `master` does not exist on the remote. Commits ac39485 and 66162f6 made that swap. Progress 1.2 is checked off with the original `master` wording.
- **Fix**: Leave the trigger on `main`. Note in the plan that the default branch is `main`.
- **Decision**: FIXED
