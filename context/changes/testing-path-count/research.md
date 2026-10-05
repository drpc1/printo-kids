---

## date: 2026-10-05T08:35:48+02:00
researcher: drpc1
git_commit: af86323faf2d384c87ff8d3de5d560f1ff5ec084
branch: main
repository: printo-kids
topic: "How path count becomes a finished sheet, and what a Node unit test can prove for zero paths and two paths"
tags: [research, codebase, maze, path-count, node-test]
status: complete
last_updated: 2026-10-05
last_updated_by: drpc1

# Research: How path count becomes a finished sheet, and what a Node unit test can prove for zero paths and two or more paths

**Date**: 2026-10-05T08:35:48+02:00
**Researcher**: drpc1
**Git Commit**: af86323faf2d384c87ff8d3de5d560f1ff5ec084
**Branch**: main
**Repository**: printo-kids

## Research Question

Phase 1 of `context/foundation/test-plan.md` ("Ochrona liczby ścieżek", risk 1) needs a unit test on the existing Node runner that proves a maze with zero paths and a maze with two paths are not treated as a finished sheet. Where is path count decided today, what becomes a sheet, and which of those facts can the current runner already see?

## Summary

On the inspected click handler, a generated maze is stored — and therefore drawn — only when `countPaths` returns 1 (`src/components/WorksheetGenerator.tsx:49-53`, `:60`, `:97`). `generateMaze` itself does not consult that count: the function body returns a `Maze` at its single return (`src/lib/maze/generate.ts:27-44`).

The Node runner invoked by `npm test` loads one file, `src/lib/maze/generate.test.ts` (`package.json:12`). In that file, seeds 1, 99, and 12345 assert `countPaths === 1` on generator output (`generate.test.ts:6-9`, `:74`). In that file there is no assertion that a count is 0. The two multi-path tests mutate a generated maze and call `countPaths`; neither test passes a maze through the sheet handler. One of them selects the maze by calling `countPaths` and then asserts `countPaths` again (`generate.test.ts:33-36`, `:103-110`), which is the oracle anti-pattern named for risk 1 in `context/foundation/test-plan.md:49`.

A search of `src/**/*.{ts,tsx,astro}` for `generateMaze`, `countPaths`, and `setMaze` matched three files: `generate.ts`, `generate.test.ts`, and `WorksheetGenerator.tsx`. `generate.test.ts` does not import `WorksheetGenerator`.

## Detailed Findings



### Path count is a separate walk, capped at 2

`generateMaze` builds a grid of 13 by 16 (`generate.ts:14-15`), shuffles internal east/south edges with the injected `random`, and opens a passage only when `union` returns true (`generate.ts:33-38`). `union` returns false when the two cells already share a root (`generate.ts:129-134`). After that loop the function opens the north wall of cell (0, 6) and the south wall of cell (15, 6) (`generate.ts:17-19`, `:41-42`) and returns the maze (`generate.ts:44`). This body does not call `countPaths`.

`countPaths` starts a DFS at the module constants (0, 6) and increments `found` when the walk reaches (15, 6) (`generate.ts:47-57`, `:79`). Those coordinates are not read from the maze's open outer walls. When `found >= 2`, `walk` returns immediately (`generate.ts:52-54`), so a later discovery on that call does not increment `found`. The function then returns `found` (`generate.ts:80`). This research did not execute `countPaths` on a new fixture.

Whether `countPaths(generateMaze(...))` can return a value other than 1 for some `random` was not executed in this session. The same gap is already recorded in `context/archive/2026-10-04-worksheet-ui/research.md:174`. The union condition above is the Kruskal step in this file; it is not an enumeration of seeds.

### A finished sheet is React state after the count is 1

`WorksheetGenerator` starts with `maze === null` (`WorksheetGenerator.tsx:33`). `handleGenerate` calls `generateMaze(Math.random)` once and calls `setMaze` only inside `if (countPaths(next) === 1)` (`WorksheetGenerator.tsx:49-53`). That `setMaze(next)` is the only `setMaze` call in this file. `hasMaze` is `maze !== null` (`WorksheetGenerator.tsx:60`). `MazeSheet` is rendered in the branch `hasMaze ? <MazeSheet ...> : null` (`WorksheetGenerator.tsx:97`). `handlePrint` calls `window.print()` and does not call `countPaths` (`WorksheetGenerator.tsx:56-58`).

On this component, a maze object reaches the SVG only after that comparison succeeds. A return of 0 or of 2 from `countPaths` does not call `setMaze` on this handler. This session did not click Generuj, so the silent no-op (previous sheet kept, or no sheet on the first click) is the control flow of the handler, not a browser observation.

`MazeSheet` draws whatever `Maze` it receives (`WorksheetGenerator.tsx:172-234`). It does not call `countPaths`.

### The Node runner does not see the sheet gate

`package.json:12` is `node --experimental-strip-types --test src/lib/maze/generate.test.ts`. The `ci` job runs `npm test` (`ci.yml:21`). A search of `package.json` for `vitest`, `jest`, `playwright`, and `testing-library` matched nothing.

In `generate.test.ts`, the cases that mention path count are:

- Seeds 1, 99, and 12345: `assertSolvableMaze` ends in `assert.equal(countPaths(maze), 1)` (`generate.test.ts:6-9`, `:65-75`).
- "an extra knocked-down wall yields more than one path": `withExtraOpenWall` returns the first clone whose `countPaths` is already `> 1`, and the test asserts `countPaths(mutated) > 1` (`generate.test.ts:33-36`, `:96-116`). The selector and the assertion are the same function on this test.
- "stops counting once a second path exists": every internal east and south wall of a clone of `generateMaze(mulberry32(1))` is opened, then `countPaths` is asserted equal to 2 (`generate.test.ts:39-51`). That asserts the cap on a fully opened grid, not a maze built as two routes.

`knockDown` only sets a wall boolean to false (`generate.test.ts:85-94`). This file has no helper that closes a passage and no `Maze` literal built without `generateMaze`. `countPaths` is exported and the test already imports it (`generate.test.ts:3`, `generate.ts:47`), so a hand-built `Maze` can be passed to the same function. The walk still starts at (0, 6) and treats (15, 6) as the exit (`generate.ts:17-19`, `:55`, `:79`), so a fixture that omits those cells is a different question from the sheet's entrance and exit.

The test file does not import `WorksheetGenerator`. Proving "this maze is not stored as the sheet" on the current runner means asserting a rule the test can import. Today that rule is the comparison inside the React handler, not a function in `generate.ts`.

## Code References

- `src/lib/maze/generate.ts:27-44` — `generateMaze` returns a maze without reading path count
- `src/lib/maze/generate.ts:47-81` — `countPaths` DFS from (0, 6) to (15, 6), returns when `found >= 2`
- `src/lib/maze/generate.ts:129-134` — `union` refuses an edge whose cells already share a root
- `src/components/WorksheetGenerator.tsx:49-53` — `setMaze` only when `countPaths(next) === 1`
- `src/components/WorksheetGenerator.tsx:56-58` — print does not recheck path count
- `src/components/WorksheetGenerator.tsx:97` — the SVG mounts only when `maze` is non-null
- `src/lib/maze/generate.test.ts:6-9` — seeds 1, 99, 12345 assert one path on generator output
- `src/lib/maze/generate.test.ts:33-51` — multi-path cases mutate a generated maze and call `countPaths`
- `src/lib/maze/generate.test.ts:96-116` — `withExtraOpenWall` keeps a candidate only after `countPaths > 1`
- `package.json:12` — `npm test` runs Node's built-in runner on that one file
- `.github/workflows/ci.yml:21` — the `ci` job runs `npm test`



## Architecture Insights

The archived S-01 contract split the work the same way the code still does: a pure module exports `generateMaze` and `countPaths`, and the page paints only when the count is 1 (`context/archive/2026-09-28-first-printable-maze/plan.md:65`, `:115`). The test plan's risk 1 names the failure as treating a zero-path or multi-path maze as a finished sheet (`context/foundation/test-plan.md:39`, `:49`). On the inspected path, that decision is the handler comparison, not the generator return.

Risk 1's anti-pattern is an assertion copied from the happy path, or an oracle taken from the current generator result (`test-plan.md:49`). The existing `> 1` test matches the second clause: the maze is chosen because `countPaths` already returned `> 1`. A later test that repeats `assert.equal(countPaths(generated), 1)` does not show that a count of 0 or 2 fails the sheet rule.

`countPaths` returning 2 means "at least two paths were discovered before the cap," on this function, not "the maze contains two paths and no third." The fully opened grid test hits that cap (`generate.test.ts:39-51`).

## Historical Context (from prior changes)

- Supported: the PRD acceptance line for US-01 requires exactly one correct path from start to finish (`context/foundation/prd.md:59`). FR-003 keeps uniqueness as a checkable rule (`prd.md:83-84`). Business logic says the application creates a maze with exactly one solution (`prd.md:119`). That sentence is a product rule. It does not record a measurement that `generateMaze` returns that count for every `random`.
- Supported: the S-01 plan requires `countPaths` to count simple paths between (0, 6) and (15, 6) and to return once a second path exists (`context/archive/2026-09-28-first-printable-maze/plan.md:65`). The current `countPaths` matches that stop (`generate.ts:52-57`).
- Supported: the same plan's sheet contract is one `generateMaze(Math.random)` call, paint only when the count is 1, and on any other count leave the previous sheet or leave no sheet, with no retry and no error (`plan.md:115`). The current handler matches the paint branch and the single call (`WorksheetGenerator.tsx:49-53`). This session did not execute the non-1 branch in a browser.
- Supported: the S-01 brief says a path count other than 1 is treated as a bug: no new maze and no error sentence (`context/archive/2026-09-28-first-printable-maze/plan-brief.md:53`). The brief also says the page and the tests share `countPaths`, and paint happens only when the count is 1 (`plan-brief.md:24-25`).
- Supported: the S-01 test contract covers seeded mazes with `countPaths === 1` and one extra knocked-down wall with `countPaths > 1` (`plan.md:78`, `:149-151`). It does not name a zero-path fixture.
- Supported, with a stale line anchor: worksheet-ui research says reachability of a non-1 count was not executed, and quotes the gate at `WorksheetGenerator.tsx:37-41` (`context/archive/2026-10-04-worksheet-ui/research.md:66`, `:174`). The behavior description matches the current handler; the line numbers do not — the comparison is now at `WorksheetGenerator.tsx:49-53`.
- Not found in the S-01 plan or brief: an explicit note that a zero-path maze was left untested. The absence is this reading of those two files, not a scan of every archive paragraph.



## Related Research

- `context/archive/2026-10-04-worksheet-ui/research.md` — records that a non-1 `countPaths` result was not executed, and treats the missing error message as N/A for that reason.
- `context/archive/2026-10-04-maze-character-choice/research.md` — character marks on the sheet. Not applicable to path count; not re-read for this question.
- `context/archive/2026-10-03-ui-tokens-onboarding/research.md` and `context/archive/2026-10-01-style-class-audit/research.md` — token and class inventories. Not applicable to path count.



## Open Questions

- The sheet rule is in the React handler, and `npm test` loads only `generate.test.ts`. Whether Phase 1 extracts a pure accept/reject function into the maze module, or treats `countPaths` returning 0 and 2 as enough proof that those mazes fail the existing comparison, is a plan decision. This research does not pick it.
- A two-path fixture that does not use `countPaths` (or `generateMaze`'s output) as the oracle is still unspecified. The test-plan anti-pattern forbids that oracle (`test-plan.md:49`). The shape of the fixture is a plan decision.
- No `facts.json` was requested. The prose/JSON checker does not apply.

