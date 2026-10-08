---
date: 2026-10-07T00:51:21+02:00
researcher: drpc1
git_commit: b4e07f06e4ad6bab0f005195e362ababafcba624
branch: print-sheet-contract
repository: printo-kids
topic: "Prove zero-path and two-path mazes are not stored as the finished sheet"
tags: [research, codebase, maze, path-count, worksheet]
status: complete
last_updated: 2026-10-07
last_updated_by: drpc1
---

# Research: Prove zero-path and two-path mazes are not stored as the finished sheet

**Date**: 2026-10-07T00:51:21+02:00
**Researcher**: drpc1
**Git Commit**: b4e07f06e4ad6bab0f005195e362ababafcba624
**Branch**: print-sheet-contract
**Repository**: printo-kids

## Research Question

Prove a zero-path maze and a two-path maze are not stored as the finished sheet (`context/changes/path-count-test/change.md`).

## Summary

On the Generuj handler in `src/components/WorksheetGenerator.tsx:56-60`, the finished sheet is the React `maze` state. `MazeSheet` renders when that state is non-null (`src/components/WorksheetGenerator.tsx:104`). The handler calls `setMaze(next)` inside `if (countPaths(next) === 1)`. A `next` for which this `countPaths` returns 0 or 2 does not enter that `if`, so that call does not store it.

That refusal is not what `npm test` proves. A full read of `src/lib/maze/generate.test.ts` shows no assertion that `countPaths` equals 0. The test at `generate.test.ts:36-39` asserts `countPaths > 1` on a mutated grid, and the test at `generate.test.ts:42-54` asserts `countPaths === 2` on another mutated grid. That file's import line does not import `WorksheetGenerator` (`generate.test.ts:3`). The body of `generateMaze` (`generate.ts:27-44`) does not call `countPaths`. For each seed in `{0, 1, …, 31, 99, 12345}` — 32 integers from 0 through 31, plus 99 and 12345 — `assertSolvableMaze` asserts `countPaths === 1` (`generate.test.ts:6-13`, `generate.test.ts:77`). Those seeds are generator output with a count of 1, not a stored zero-path or two-path sheet.

`found` starts at 0, and `found += 1` sits after the `found >= 2` return (`generate.ts:48`, `generate.ts:52-57`), so a return from this function is 0, 1, or 2. The value 2 means a second path was found and later `walk` calls return (`generate.ts:52-54`). It does not mean this function counted routes past that second find.

## Detailed Findings

### The finished sheet is React state, written on one branch

`WorksheetGenerator` starts `maze` at `null` (`src/components/WorksheetGenerator.tsx:34`). `handleGenerate` calls `generateMaze(Math.random)` once and calls `setMaze(next)` when `countPaths(next) === 1` (`src/components/WorksheetGenerator.tsx:56-60`). That function has no `else` branch. A search of `src` for `setMaze` matched this file at the state declaration (`:34`) and at that call (`:59`).

When `maze !== null`, the component renders `MazeSheet` (`src/components/WorksheetGenerator.tsx:104`). `handlePrint` calls `window.print()` and does not call `countPaths` or `setMaze` (`src/components/WorksheetGenerator.tsx:63-65`).

If this handler does not enter the `if`, it does not replace `maze`. From the initial `null`, the sheet stays unmounted. After a prior call that did enter the `if`, the previous maze stays mounted.

`writeLastUsed` stores JSON `{ character }` under `printo-kids:last-used` (`src/lib/last-used.ts:1`, `src/lib/last-used.ts:27-29`). In `WorksheetGenerator`, that write is on the character-row click (`src/components/WorksheetGenerator.tsx:162-165`), not in `handleGenerate`. `acceptEntry` in `src/lib/child-profiles.ts` returns `{ id, name, character }` (`src/lib/child-profiles.ts:118`). `WorksheetGenerator.tsx` does not import `child-profiles`.

### What 0 and 2 mean in `countPaths`

`countPaths` starts `found` at 0, walks from cell `(0, 6)` to cell `(15, 6)`, and adds 1 when that exit cell is reached (`src/lib/maze/generate.ts:16-19`, `src/lib/maze/generate.ts:47-57`, `src/lib/maze/generate.ts:79-80`). At the start of `walk`, `found >= 2` returns immediately (`src/lib/maze/generate.ts:52-54`). The increment is reached when that guard has not returned, and it adds 1, so a return from this function is 0, 1, or 2.

A step requires an open wall (`false`) and an in-bounds unvisited neighbor (`src/lib/maze/generate.ts:63-74`). Opening the entrance north wall and the exit south wall (`src/lib/maze/generate.ts:41-42`) does not add a neighbor step: north requires `row > 0`, and south requires `row < maze.height - 1`.

The test that opens each east wall where `col < width - 1` and each south wall where `row < height - 1` expects `countPaths` to equal 2 (`src/lib/maze/generate.test.ts:42-54`). That expectation matches the cap. It does not measure how many routes that opened grid has beyond the second one.

No assertion in `generate.test.ts` expects `countPaths` to equal 0. A search of `src` for `countPaths` matched `generate.ts`, `generate.test.ts`, and `WorksheetGenerator.tsx`. In those matches the comparisons are `=== 1`, `> 1`, and `=== 2`.

### `generateMaze` is a separate carver, sampled as one path

`generateMaze` builds a 13 by 16 grid, shuffles internal edges, opens a passage when `union` returns true, opens the two outer notches, and returns (`src/lib/maze/generate.ts:14-15`, `src/lib/maze/generate.ts:27-44`). That body does not call `countPaths`. `union` returns false when the two cells already share a root (`src/lib/maze/generate.ts:132-134`). `listInternalEdges` pushes an east edge when `col < WIDTH - 1` and a south edge when `row < HEIGHT - 1` (`src/lib/maze/generate.ts:94-105`).

Inference from that structure, not from a run of `generateMaze` in this session: those edges are the grid graph, an internal passage is opened when `union` returns true (`generate.ts:36-38`), and `countPaths` counts simple in-grid routes. A spanning tree of this grid has one simple path between `(0, 6)` and `(15, 6)`. The outer notches are not extra routes under the bounds checks above.

Observed sample, not that inference: for each seed in `{0, 1, …, 31, 99, 12345}` (32 integers from 0 through 31, plus 99 and 12345), `assertSolvableMaze` requires width 13, height 16, the two open notches, and `countPaths(maze) === 1` (`src/lib/maze/generate.test.ts:6-13`, `src/lib/maze/generate.test.ts:68-77`). Seed 42 compared with itself must deep-equal (`src/lib/maze/generate.test.ts:16-19`). `generateMaze(mulberry32(7))` must leave a `Math.random` mock at call count 0 (`src/lib/maze/generate.test.ts:22-28`).

The extra-wall test clones the seed-1 maze, knocks one closed wall, and returns the candidate for which that loop sees `countPaths(candidate) > 1`, then asserts `countPaths(mutated) > 1` (`src/lib/maze/generate.test.ts:36-39`, `src/lib/maze/generate.test.ts:99-116`). The same counter both selects the grid and checks it. That test does not call `setMaze`.

### What a Node test can see today

`package.json` script `test` runs `node --test` on five files: `src/lib/maze/generate.test.ts`, `src/lib/sheet/layout.test.ts`, `src/lib/sheet/print-contract.test.ts`, `src/lib/last-used.test.ts`, and `src/lib/child-profiles.test.ts` (`package.json:12`). That line matches commit `b4e07f06e4ad6bab0f005195e362ababafcba624`. A search for `WorksheetGenerator` under the repo matched the component, `WorksheetHome.astro` (the mount), and `print-contract.test.ts` (a path string). `print-contract.test.ts` does not mention `setMaze`, `countPaths`, or `handleGenerate`.

`generate.test.ts` calls `countPaths` on grids that file builds. `handleGenerate` is nested in the component and is not itself exported. On that handler, `next` is the return of `generateMaze(Math.random)` before the `=== 1` check (`src/components/WorksheetGenerator.tsx:56-60`). `generate.test.ts` does not assert that a `generateMaze` return has count 0 or count 2.

## Code References

- `src/components/WorksheetGenerator.tsx:56-60` — Generuj stores `next` when `countPaths(next) === 1`
- `src/components/WorksheetGenerator.tsx:34` — `maze` starts `null`
- `src/components/WorksheetGenerator.tsx:63-65` — print does not recheck the path count
- `src/components/WorksheetGenerator.tsx:104` — `MazeSheet` renders when `maze` is non-null
- `src/lib/maze/generate.ts:47-80` — `countPaths`, cap when `found >= 2`
- `src/lib/maze/generate.ts:27-44` — `generateMaze` returns without calling `countPaths`
- `src/lib/maze/generate.test.ts:6-13` — 34 seeds assert one path on generator output
- `src/lib/maze/generate.test.ts:42-54` — opened internal walls expect count 2
- `src/lib/last-used.ts:27-29` — stored JSON is `{ character }`
- `src/lib/child-profiles.ts:118` — a kept profile is `{ id, name, character }`

## Architecture Insights

The sheet decision and the carver are separate. `generateMaze` returns a maze. `countPaths` returns the capped count. That count gates `setMaze` inside the click, and the predicate is not a separate export. The `npm test` script names five files under `src/lib/` (`package.json:12`). The `WorksheetGenerator` search above did not show those files importing the component, except `print-contract.test.ts` holding the path string.

The change note asks for a zero-path maze and a two-path maze. On `countPaths`, 2 means the walk found a second path and stopped. The existing cap fixture opens internal east and south walls and expects 2 (`generate.test.ts:42-54`). It is not a hand-built two-corridor grid.

## Historical Context (from prior changes)

Each claim below is scored against the sources read for this note.

- **Supported.** US-01 requires exactly one correct path from start to finish (`context/foundation/prd.md:59`). FR-003's resolution says start–meta connection and uniqueness of the solution must be checkable by explicit rules (`context/foundation/prd.md:83-84`). Business logic states the app creates a maze with exactly one solution (`context/foundation/prd.md:119`). Those sentences are the product rule. They do not name the React state or the Node tests.
- **Supported.** S-01's generator contract says: one `generateMaze(Math.random)` call, paint or replace only when the count is 1, otherwise leave the previous sheet or leave no sheet, do not retry, do not add an error message (`context/archive/2026-09-28-first-printable-maze/plan.md:115`). The current handler matches that contract (`WorksheetGenerator.tsx:56-60`).
- **Supported, different label.** The same slice's brief says a path count other than 1 is treated as a bug: no new maze and no error sentence (`context/archive/2026-09-28-first-printable-maze/plan-brief.md:53`). The plan text specifies that silence. The brief calls the non-1 count a bug. Both sentences are in that archived change. The current handler has the silence and has no error sentence.
- **Partial.** The archived `testing-path-count` note says the intent is to prove a zero-path maze and a maze with two or more paths are not treated as a finished sheet (`context/archive/2026-10-05-testing-path-count/change.md:12`). The plan for that change says it will not hand-build a zero-path grid or a two-corridor grid, and will not add a sheet-acceptance function (`context/archive/2026-10-05-testing-path-count/plan.md:32-34`). The note states the intent. The plan excludes the fixtures that would show it. The seed loop that plan did specify is present: `{0…31, 99, 12345}` (`generate.test.ts:6-8`).
- **Partial.** That archived plan cites the click gate at `WorksheetGenerator.tsx:49-53` (`context/archive/2026-10-05-testing-path-count/plan.md:13`). On commit `b4e07f06e4ad6bab0f005195e362ababafcba624` the handler is at `WorksheetGenerator.tsx:56-60`. The described branch matches. The line numbers do not.
- **Supported as the frame's conclusion, with a stale line.** `context/changes/silent-generate-click/frame.md:32` says this carver's return is one simple path, so Generuj does not take the silent branch, and that non-1 counts in the repo are mutated fixtures. The one-simple-path sentence matches the inference in this note, not an execution of every shuffle. The mutated-fixture sentence matches `generate.test.ts:36-54`. This note's `countPaths` search was limited to `src`. The frame cites `WorksheetGenerator.tsx:49-54` (`frame.md:30`, `frame.md:66`). The handler is now at `:56-60`. The frame also says not to plan a retry or an error as the repair for a maze this carver returns (`frame.md:62`). That sentence is about the silent click. This change's note does not ask for a retry or an error.
- **Supported.** Test-plan risk 1's response says a sheet without a fair solution is not ready: zero paths, or more than one path (`context/foundation/test-plan.md:50`). Phase 1 names folder `path-count-test` (`context/foundation/test-plan.md:63`). Section 5 says the 34 seeds do not prove refusal at zero paths, the multi-path cases do not go through the click that stores the sheet, and there is no assertion of sheet refusal at zero paths (`context/foundation/test-plan.md:87-89`). Those three sentences match this read of `generate.test.ts` and `WorksheetGenerator.tsx`.
- **Partial on the file count.** The same test plan says `npm test` runs four files (`context/foundation/test-plan.md:74`). `package.json:12` on this commit names five files, the four listed there plus `src/lib/child-profiles.test.ts`. The path-count claims in section 5 are not that file count.
- **Stale lines, same gate.** Archived research for `testing-path-count` says the handler stores a maze when `countPaths` returns 1, cites `WorksheetGenerator.tsx:49-53`, and says `npm test` loads one file (`context/archive/2026-10-05-testing-path-count/research.md:28-30`). The gate behavior matches `:56-60`. The line numbers and the one-file script do not match this commit. Its statement that `generate.test.ts` has no assertion that a count is 0 still matches this file.

`print-sheet-contract` leaves generator changes out of its brief (`context/changes/print-sheet-contract/plan-brief.md:42`). Roadmap S-01 says the same path-count function is used in tests and before the sheet is shown (`context/foundation/roadmap.md:105`). `countPaths` is that function in `generate.test.ts` and in `handleGenerate`.

## Related Research

- `context/archive/2026-10-05-testing-path-count/research.md` — earlier pass on this question, before the 34-seed loop and before the handler moved to lines 56–60
- `context/archive/2026-10-06-test-plan-refresh-2026-10-06/research.md` — re-read of the seed contract, the cap test, and the stale frame line numbers
- `context/changes/silent-generate-click/frame.md` — framing of the silent `setMaze` skip, not a research file

## Open Questions

- The store check is inline in `handleGenerate` and is not an exported function. `generate.test.ts` does not contain a zero-path grid. A grid whose `countPaths` returns 2 is the opened-wall fixture at `generate.test.ts:42-54`, and that fixture is not passed to `setMaze`. Asserting that a zero-path grid and a count-of-2 grid are not stored requires a callable decision the click currently keeps to itself. Whether that decision is extracted, or the component is mounted, is a plan choice. The archived `testing-path-count` plan refused a sheet-acceptance function for that change (`plan.md:34`). This change's note asks for the storage proof that plan left out.
- The note says "two-path". `countPaths` stops at 2. A fixture that expects 2, including the opened-wall test at `generate.test.ts:42-54`, does not by itself show the maze has exactly two routes.
- Risk 1 in the test plan also names a result that becomes invalid after a drawing, shape, or level change (`context/foundation/test-plan.md:39`, `context/foundation/test-plan.md:50`). This change's title and note name zero-path and two-path storage (`change.md`). Difficulty thresholds stay out of scope until levels exist (`context/foundation/test-plan.md:50`, `context/foundation/test-plan.md:127`).
