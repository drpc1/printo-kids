# One-path seed contract Implementation Plan

## Overview

Extend the existing generator tests so a fixed list of seeds must come back from `generateMaze` with exactly one path. The carving algorithm and the Generuj click stay as they are, so the same checks still apply if the algorithm is replaced later.

## Current State Analysis

`generateMaze` builds a 13 by 16 grid, opens passages with union-find, then opens the north wall of cell (0, 6) and the south wall of cell (15, 6). That function never reads a path count (`src/lib/maze/generate.ts:27-44`). `countPaths` walks from cell (0, 6) to cell (15, 6) and stops once it has found 2 (`src/lib/maze/generate.ts:47-80`). Reaching the exit cell counts as a path; a closed outer notch on an otherwise connected maze still counts as one path.

`npm test` runs Node's built-in runner on one file (`package.json:12`). The `ci` job runs `npm test` (`.github/workflows/ci.yml:21`). In `src/lib/maze/generate.test.ts`, seeds 1, 99, and 12345 go through `assertSolvableMaze`, which requires a 13 by 16 grid, those two open notches, and `countPaths === 1` (`generate.test.ts:6-9`, `generate.test.ts:65-75`). Two other tests mutate a generated maze and call `countPaths` directly (`generate.test.ts:33-51`).

The click in `WorksheetGenerator` stores a maze only when `countPaths` returns 1 (`src/components/WorksheetGenerator.tsx:49-53`). This plan does not change that click.

## Desired End State

`npm test` passes with one test per seed in this set: the integers 0 through 31 inclusive, plus 99 and 12345 (34 seeds, each once). Every one of those tests calls `generateMaze(mulberry32(seed))` and then the existing `assertSolvableMaze`. `src/lib/maze/generate.ts` and `src/components/WorksheetGenerator.tsx` are unchanged.

A green run means those 34 seeds each produce a 13 by 16 maze with the open notches and exactly one path from cell (0, 6) to cell (15, 6). A seed outside that set can still be wrong while the suite stays green.

### Key Discoveries:

- The three current seed tests already check generator output, not a snapshot of Kruskal walls (`generate.test.ts:6-9`, `generate.test.ts:65-75`).
- `assertSolvableMaze` is the contract to reuse: 13 by 16, north of (0, 6) open, south of (15, 6) open, `countPaths === 1` (`generate.test.ts:65-75`).
- The extra-wall test chooses its maze by calling `countPaths`, then asserts `countPaths` again (`generate.test.ts:96-116`). That test stays.
- `npm test` loads only `generate.test.ts` (`package.json:12`), so new cases belong in that file.

## What We're NOT Doing

- Editing `generateMaze`, `countPaths`, or the Generuj click.
- Rewriting the extra-wall test or the test that the counter stops at 2.
- Hand-building a zero-path grid or a two-corridor grid.
- Saving a golden wall bitmap for any seed.
- Adding a sheet-acceptance function, an error message, or a retry.
- Changing print, `AGENTS.md`, the test runner, or `package.json`.
- Treating a seed outside 0–31, 99, and 12345 as proven.

## Implementation Approach

Keep the current `for` loop, `mulberry32`, and `assertSolvableMaze`. Replace the seed array so its members are exactly the integers 0, 1, …, 31, plus 99 and 12345, with no duplicates. Seed 1 is only in the 0–31 block. The test title can stay `seed ${seed} is a 13 by 16 maze with one path`, so the runner names every seed.

No new helper, no new test file, and no new script. The `ci` job already runs this file.

## Critical Implementation Details

- **A listed seed that fails:** If `npm test` fails because one of these seeds is not a solvable one-path maze, stop. Report the seed and the count `countPaths` returned. This change does not edit `generate.ts` to force that seed green.

## Phase 1: One-path seed contract

### Overview

Widen the existing seed loop to the 34-seed set and leave every other test and every product file alone.

### Changes Required:

#### 1. Seed loop

**File**: `src/lib/maze/generate.test.ts`

**Intent**: A future carving algorithm, dropped into `generateMaze` with the same `random` argument, still has to yield exactly one path for every seed in the fixed list. The list keeps today's seeds and adds a contiguous block so the check is a sample, not three lucky values.

**Contract**: The loop set is exactly `{0, 1, …, 31, 99, 12345}` (34 values, each once). Each value is passed to `generateMaze(mulberry32(seed))` and then to the existing `assertSolvableMaze`. No second assertion helper. No expected wall bitmap. The tests at `generate.test.ts:13-51` and the helpers `withExtraOpenWall` and `knockDown` stay as they are.

### Success Criteria:

#### Automated Verification:

- `npm test` passes and reports a passing test for each of the 34 seeds 0–31, 99, and 12345
- `npm run lint` passes
- `git diff -- src/lib/maze/generate.ts src/components/WorksheetGenerator.tsx` is empty

#### Manual Verification:

- The extra-wall test and the stop-at-2 test are still in `generate.test.ts` and were not rewritten
- A seed outside that list is not described as proven

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

---

## Testing Strategy

### Unit Tests:

- The phase is the unit test: 34 seeds through `generateMaze` and `assertSolvableMaze`.
- Seeds already covered today (1, 99, 12345) remain in the set.
- The extra-wall test and the stop-at-2 test keep running as they do now.

### Integration Tests:

- None. The Node runner does not render the sheet, and this change does not touch the click.

### Manual Testing Steps:

1. Read the diff and confirm `generate.ts` and `WorksheetGenerator.tsx` are untouched.
2. Read `generate.test.ts` and confirm the extra-wall test and the stop-at-2 test are still there, unreworked.
3. Treat a green `npm test` as proof for the 34 listed seeds only.

## Performance Considerations

Thirty-four depth-first walks of a 13 by 16 maze are a small addition to `npm test`. Do not grow the list into an unbounded random sample in this change.

## Migration Notes

No data migration and no product-code migration. The page keeps its current Generuj behavior.

## References

- Related research: `context/changes/testing-path-count/research.md`
- Test-plan phase 1: `context/foundation/test-plan.md`
- Seed loop and `assertSolvableMaze`: `src/lib/maze/generate.test.ts:6-9`, `src/lib/maze/generate.test.ts:65-75`
- Generator return without a path count: `src/lib/maze/generate.ts:27-44`
- Path walk and the stop at 2: `src/lib/maze/generate.ts:47-80`
- Runner script: `package.json:12`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: One-path seed contract

#### Automated

- [x] 1.1 `npm test` passes and reports a passing test for each of the 34 seeds 0–31, 99, and 12345
- [x] 1.2 `npm run lint` passes
- [x] 1.3 `git diff -- src/lib/maze/generate.ts src/components/WorksheetGenerator.tsx` is empty

#### Manual

- [x] 1.4 The extra-wall test and the stop-at-2 test are still in `generate.test.ts` and were not rewritten
- [x] 1.5 A seed outside that list is not described as proven
