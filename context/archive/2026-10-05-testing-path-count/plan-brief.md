# One-path seed contract — Plan Brief

> Full plan: `context/changes/testing-path-count/plan.md`
> Research: `context/changes/testing-path-count/research.md`

## What & Why

The generator tests should keep requiring exactly one path after a future carving algorithm replaces the current one. This change widens the seed list those tests already use. It leaves the algorithm and the Generuj click alone.

## Starting Point

`generateMaze` returns a 13 by 16 maze and does not read a path count. `npm test` runs `src/lib/maze/generate.test.ts`. Seeds 1, 99, and 12345 already require one path, the open notches at (0, 6) and (15, 6), and that grid size. Two other tests poke `countPaths` on a mutated maze.

## Desired End State

`npm test` runs the same assertion on 34 seeds: 0 through 31, plus 99 and 12345. A green run means each of those seeds has exactly one path from cell (0, 6) to cell (15, 6). The worksheet page behaves as it does today. A seed that is not on the list can still be wrong.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Product code | No edits to `generate.ts` or `WorksheetGenerator.tsx` | The carving algorithm and Generuj stay as they are. | Plan |
| Proof | Fixed seeds must have exactly one path | The check has to keep working after a later algorithm swap. | Plan |
| Seed list | 0–31, plus 99 and 12345 | Today's seeds stay, and a contiguous block replaces a three-seed sample. | Plan |
| Assertion | Existing `assertSolvableMaze` | The approved check is 13×16, open notches, and `countPaths === 1`. | Plan |
| Path meaning | Reach cell (15, 6) from cell (0, 6) | A closed paper-edge notch on a connected maze is still one path, which is what `countPaths` already does. | Plan |
| Old count tests | Leave both | The extra-wall search and the stop-at-2 test stay beside the new seeds. | Plan |
| Hand-built bad mazes | Not in this change | The chosen proof is generator output for listed seeds, and an unlisted seed can still fail quietly. | Plan |
| Runner | Existing `generate.test.ts` | `npm test` and CI already load that one file. | Research |

## Scope

**In scope:** the seed array in `src/lib/maze/generate.test.ts`, reusing `mulberry32` and `assertSolvableMaze`.

**Out of scope:** the carving algorithm, the Generuj click, hand-built zero-path and two-path grids, a golden wall bitmap, print, `AGENTS.md`, and any new test runner.

## Architecture / Approach

One loop calls `generateMaze(mulberry32(seed))` for each listed seed and passes the maze to `assertSolvableMaze`. Nothing else in the test file is reworked. If a listed seed fails, the work stops and reports that seed; the generator is not edited to make the suite green.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. One-path seed contract | 34 seeds asserted through the existing helper, with product files untouched | A seed outside the list can be wrong while `npm test` stays green |

**Prerequisites:** `context/changes/testing-path-count/research.md` and the current `generate.test.ts` loop.
**Estimated effort:** one short session, one file.

## Open Risks & Assumptions

- The suite samples 34 seeds. It does not prove every `random` sequence.
- `countPaths` is the definition of "one path" in these tests. A change that breaks the counter and the generator together can stay green.
- The click that stores a sheet is outside this diff, so a later edit there is invisible to these tests.
- Research did not execute `countPaths(generateMaze(...))` on this seed list. A red seed is a stop-and-report, not a reason to change `generate.ts`.

## Success Criteria (Summary)

- `npm test` passes for every seed in 0–31, 99, and 12345.
- `generate.ts` and `WorksheetGenerator.tsx` have an empty diff.
- The extra-wall test and the stop-at-2 test are still present and unreworked.
