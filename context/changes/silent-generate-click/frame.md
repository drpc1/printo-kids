# Frame Brief: Generuj click that shows no change

> Framing step before /10x-plan. This document captures what is *actually*
> at issue, separated from what was initially assumed.

## Reported Observation

Nie może być tak, że użytkownik coś klika i nic się nie dzieje.

The described effect, for both the first Generuj and a later one: if a generated maze is not a one-path maze, the first click leaves the empty screen and a later click leaves the previous sheet, with no visible response to that click. This came from a description of that rule, not from a click the user saw fail.

## Initial Framing (preserved)

- **User's stated cause or approach**: The silent no-op is a bad product response when a maze is generated badly.
- **User's proposed direction**: Either regenerate the maze in the background, or show an error and ask the parent to try again.
- **Pre-dispatch narrowing**: The leading concern is the click that looks like nothing happened, for both the empty first screen and a later click that keeps the old sheet. The user has not seen that click fail; they are reacting to the described rule. "Nie może być tak, że użytkownik coś klika i nic się nie dzieje."

## Dimension Map

The observation could originate at any of these dimensions:

1. **Paint gate** — `handleGenerate` skips `setMaze` when the path count is not 1, so that click changes no pixels.
2. **Written contract** — an earlier plan required exactly this silence: one generate call, no retry, no error, leave the previous sheet or no sheet. ← initial framing treats this as an accident to fix
3. **Carver reachability** — the current generator cannot return a count other than 1, so Generuj never takes the silent branch.

## Hypothesis Investigation

| Hypothesis | Evidence | Verdict |
| --- | --- | --- |
| Paint gate: a non-1 count makes the click invisible | `WorksheetGenerator.tsx:49-54` calls `generateMaze` once and calls `setMaze` only when `countPaths === 1`. No else, message, pending state, or second call. First failure keeps `maze === null` (`:33`, `:97`); a later failure keeps the previous maze. | STRONG |
| Written contract: the silence was specified | `context/archive/2026-09-28-first-printable-maze/plan.md` Phase 2: one `generateMaze(Math.random)` call, paint only when the count is 1, otherwise leave the previous sheet or no sheet, do not retry, do not add an error message. The plan-brief says a count other than 1 shows no new maze and no error sentence. The PRD requires exactly one solution and does not specify this UX. | STRONG |
| Carver reachability: Generuj cannot hit that branch | `generate.ts:27-44` and `:129-134` build a spanning tree of the 13×16 grid. Entrance and exit are two cells in that tree, so `countPaths` finds one simple path. Outer notches are not extra routes (`generate.ts:41-42`, `:63-74`). A count other than 1 appears only after tests knock walls down (`generate.test.ts:36-54`), not on a `generateMaze` return. The 34 seed tests sample the result; they are not the guarantee. | STRONG |

## Narrowing Signals

Step 3 found strong evidence on all three dimensions and they agree, so the questioning step was skipped.

- The user named the silent click, for both moments, as the thing that must not happen.
- The user has not seen a failed click. The scenario is the described rule.
- A non-1 maze that Generuj could display was not found. Non-1 counts in this repo are mutated fixtures in tests.

## Cross-System Convention

S-01 wrote the silent branch on purpose and shipped it. Later maze work (`testing-path-count`) left the click unchanged. The PRD's convention is "exactly one solution," which this carver satisfies by construction. The silent UX is the archived plan's convention for a failed check, not the PRD's.

Inverse check: if the carver always returns one path, every Generuj click that uses `Math.random` calls `setMaze`. The only mazes with another count are ones the tests build by knocking walls down, and those never pass through the click.

## Reframed (or Confirmed) Problem Statement

> **The actual problem to plan around is**: there is no Generuj click that does nothing. The silent branch is real and was required, and the current carver cannot enter it.

A bad maze from Generuj is the premise of both proposed responses. That premise does not hold for this carver: union-find carving returns one simple path for every shuffle `Math.random` can produce. The parent who clicks Generuj gets a new sheet. The empty screen and the stuck previous sheet are what the code would do if the count were not 1, which this generator does not produce.

The initial framing was not a live defect. Background regeneration and an error message would both be a new rule for a case the click cannot hit.

## Confidence

- **HIGH** — the handler, the S-01 sentences, and the spanning-tree structure were all read. The user confirmed they have not seen the failed click.

## What Changes for /10x-plan

Do not plan a retry loop or an error message as the repair for a maze Generuj can return today. A later plan that replaces the carver so a count other than 1 becomes possible would be changing the S-01 silence rule, and that is a different problem from this click.

## References

- Source files: `src/components/WorksheetGenerator.tsx:49-54`, `src/lib/maze/generate.ts:27-44`, `src/lib/maze/generate.ts:129-134`
- Prior contract: `context/archive/2026-09-28-first-printable-maze/plan.md` Phase 2; `context/archive/2026-09-28-first-printable-maze/plan-brief.md`
- Investigation tasks: 70a1f0e2-31d3-4da1-8fde-ddd840ded669, 9966044a-9f99-4134-9130-e5773854003b, 7954bad7-325e-4b1d-9efb-4a36e47afa3b
