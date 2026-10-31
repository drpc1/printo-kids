<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Pomiń ci, smoke i e2e, gdy pull request zmienia tylko context

- **Plan**: context/changes/context-only-ci-skip/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2
- **Date**: 2026-10-31
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 2 warnings, 0 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | WARNING |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 — Classifier runs from the pull request tree

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: .github/workflows/ci.yml:32
- **Detail**: Job `changes` checks out the pull request and runs `node scripts/context-only-diff.mjs` from that tree. A change to the script can print `false` and skip `ci`, `smoke`, and `e2e` while product files are in the diff. Those skipped required checks count as success, and the tests of the classifier live in the skipped `ci` job. The same pull request can also edit the workflow `if`. A previous review chose to run the script from the base commit; that edit was discarded and is not on this tree.
- **Fix A ⭐ Recommended**: Run the classifier from the base commit (`git show "$base:scripts/context-only-diff.mjs"`). If that copy is missing, the step fails and the three jobs run.
  - Strength: The decider is the copy already on the base branch. A pull request that changes the script is outside `context/`, so the base copy still sets `app=true`.
  - Tradeoff: An edit to the classifier takes effect on later pull requests, after merge.
  - Confidence: HIGH — line 32 invokes the checked-out script, and a failed `git show` fails the step under `pipefail`.
  - Blind spot: The workflow has not been re-run with a base-commit script.
- **Fix B**: Keep the head copy. Review of the script stays the trust boundary, same as review of `ci.yml`.
  - Strength: Leaves the merged workflow as it is.
  - Tradeoff: A script that prints `false` skips the three required jobs, including the tests of that script.
  - Confidence: HIGH — stdout is assigned straight to `app`.
  - Blind spot: None significant.
- **Decision**: FIXED via Fix A

### F2 — Docs disagree on whether a preview is created

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: context/foundation/infrastructure.md:78
- **Detail**: The plan says a context-only diff skips `ci`, `smoke`, and `e2e` and creates no preview, including when a path is outside `context/`, on either side of a rename, or when counting fails. `AGENTS.md:35` and the CI bullet in `context/foundation/test-stack.md:26` say that, including “no preview”. `infrastructure.md:78` and `:86` say the three jobs are skipped and the Workers Builds preview still runs. They do not mention the outside-path, rename, or count-error case. Pull request #222 skipped the three jobs and still received a Workers Builds preview. That split was an explicit adaptation because the plan’s “preview after green ci, smoke, and e2e” sentences were not in the file.
- **Fix A ⭐ Recommended**: Make `AGENTS.md` and the test-stack CI bullet match infrastructure. The three jobs are skipped and count as success, a path outside `context/`, either side of a rename, or a count error runs all three, and the Workers Builds preview still runs.
  - Strength: Matches #222 and the sentence already in infrastructure.md.
  - Tradeoff: The written plan still says no preview is created.
  - Confidence: HIGH — #222’s check list included Workers Builds, and ci.yml has no preview job.
  - Blind spot: None significant.
- **Fix B**: Rewrite the two infrastructure sentences so they say no preview is created, and add the outside-path, rename, and count-error case.
  - Strength: Matches the plan’s success criterion word for word.
  - Tradeoff: The sentence would be false while Workers Builds still publishes branch previews.
  - Confidence: HIGH — #222 published that preview.
  - Blind spot: None significant.
- **Decision**: FIXED via Fix A
