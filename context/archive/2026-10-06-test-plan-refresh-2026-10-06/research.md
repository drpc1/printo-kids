---
date: 2026-10-06T22:45:20+02:00
researcher: drpc1
git_commit: c0cc80c9383e7644f71f412be5649a8bef69d970
branch: print-sheet-contract
repository: printo-kids
topic: "What the four npm test files already prove, and what stays open for the whole-product test-plan guide"
tags: [research, codebase, test-plan, maze, print, last-used]
status: complete
last_updated: 2026-10-06
last_updated_by: drpc1
last_updated_note: "Plan follow-up: chosen character file on the sheet is untested. The localStorage sentence in Architecture Insights is superseded for the sheet image."
---

# Research: What the four npm test files already prove, and what stays open for the whole-product test-plan guide

**Date**: 2026-10-06T22:45:20+02:00
**Researcher**: drpc1
**Git Commit**: c0cc80c9383e7644f71f412be5649a8bef69d970
**Branch**: print-sheet-contract
**Repository**: printo-kids

## Research Question

`context/changes/test-plan-refresh-2026-10-06/change.md` asks what the four files named by `npm test` already prove, and what stays open, so a later plan can rewrite `context/foundation/test-plan.md` for the whole product, including unfinished backlog and parked items. This pass does not edit that guide.

## Summary

On commit `c0cc80c9383e7644f71f412be5649a8bef69d970`, the `test` script in `package.json:12` is `node --experimental-strip-types --test` followed by four paths and no glob: `src/lib/maze/generate.test.ts`, `src/lib/sheet/layout.test.ts`, `src/lib/sheet/print-contract.test.ts`, and `src/lib/last-used.test.ts`. Loading those files registers 59 tests: the seed loop at `generate.test.ts:6-13` lists 34 seeds (integers 0 through 31, plus 99 and 12345) and the same file has 4 further `test()` calls (`:16`, `:22`, `:36`, `:42`); `layout.test.ts` has 4 (`:14`, `:25`, `:38`, `:51`); `print-contract.test.ts` has 5 (`:14`, `:23`, `:28`, `:37`, `:56`); `last-used.test.ts` has 12 (`:14` through `:50` and `:68`, `:83`).

Those 59 tests prove a sampled one-path maze, a layout rectangle for Meta and the start mark, a source-text print-CSS contract, and an in-memory last-used character. They do not prove that a zero-path maze is refused as a sheet, that Chrome or Edge produced one printed page, or that a child profile stays on the device. The guide dated 2026-10-05 still describes one test file and a phase 2 that has not started (`context/foundation/test-plan.md:71`, `:62`).

## Detailed Findings

### What `npm test` runs, and what CI runs beside it

The script string at `package.json:12` names the four files above. Two other `*.test.*` files sit under `.cursor/skills/` and are not on that line. The `ci` job runs `npm test` at `.github/workflows/ci.yml:21`. The `smoke` job does not run `npm test`; it runs `npm run smoke` at `ci.yml:54`. `scripts/smoke.mjs:1-2` describes a Supabase auth flow. The eight steps at `smoke.mjs:39-58` expect HTTP status and location for `/`, `/dashboard`, signup, signin, and signout. None of those steps names a maze, a sheet, or last-used.

### Maze file: sampled one path, plus two mutated counts

For each seed in the array at `generate.test.ts:6-8`, `assertSolvableMaze` (`:68-77`) requires width 13, height 16, 16 rows of length 13, `cells[0][6].north === false`, `cells[15][6].south === false`, and `countPaths(maze) === 1`. Seed 42 compared with itself must deep-equal (`:16-19`). `generateMaze(mulberry32(7))` must leave a `Math.random` mock at call count 0 (`:22-28`).

`generateMaze` at `generate.ts:27-44` returns the maze after union-find carving and the two outer notches. That body does not call `countPaths`. `countPaths` (`generate.ts:47-80`) walks from cell (0, 6) to cell (15, 6) and returns once `found >= 2`. The test at `generate.test.ts:36-39` knocks one extra wall on the seed-1 maze and asserts `countPaths > 1`. The test at `:42-54` opens the internal east and south walls of a clone of that maze and asserts `countPaths === 2`. Neither test calls `setMaze`. A full read of `generate.test.ts` shows no assertion that `countPaths` equals 0.

`handleGenerate` (`WorksheetGenerator.tsx:56-60`) calls `generateMaze(Math.random)` once and calls `setMaze` when `countPaths(next) === 1`. There is no else branch in that function. `generate.test.ts` does not import `WorksheetGenerator`.

The archived plan for `testing-path-count` states that a green run covers those 34 seeds and that a seed outside the set can still be wrong (`context/archive/2026-10-05-testing-path-count/plan.md:15-19`). The same plan lists hand-built zero-path and two-corridor grids, and a sheet-acceptance function, under what that change would not do (`plan.md:28-36`). Its progress boxes are checked (`plan.md:124-131`). The active folder `context/changes/path-count-test/change.md` is still `status: new` and its note still asks to prove a zero-path maze and a two-path maze are not stored as the finished sheet (`change.md:4`, `:12`). There is no `plan.md` in that folder.

`context/changes/silent-generate-click/frame.md` reads the same union-find and concludes that a `generateMaze` return from this carver is one simple path, so the silent `setMaze` skip is not a click the current carver can take. That conclusion is the frame's, from the spanning-tree structure; this file's tests observe `countPaths === 1` for the 34 listed seeds, not for every value `Math.random` can feed the shuffler. The frame cites `WorksheetGenerator.tsx:49-54`; on this commit the handler is at `:56-60`.

`collectWalls` (`WorksheetGenerator.tsx:241-279`) draws a north segment on row 0, an east segment when `cell.east` is true, a south segment when `cell.south` is true, and a west segment on column 0. None of the four test files asserts those segments.

A search of `src/**/*.{ts,tsx,astro}` for `bibliotek`, `library`, `trudno`, `łatw`, `difficulty`, `child-profile`, and `profil` returned no matches. Difficulty levels, the card library, and a child profile are not in that inspected set. Roadmap parked items include FR-001 difficulty, FR-011, and US-02 (`context/foundation/roadmap.md:204-210`). S-05 and S-06 are `proposed` on the milestone table (`roadmap.md:50-51`), not under `## Parked`.

### Sheet layout file: coordinates, not a printed page

`layout.test.ts:5-11` fixes the call at page 210 by 297, inset 10, 13 columns, 16 rows, entrance column 6, and mark size 30. With `characterSelected: true`, the test at `:14-22` requires page width 210, page height 297, maze `x` equal to 10, the right gap equal to 10, and the top and bottom maze gaps greater than or equal to 10. The test at `:25-35` requires `meta.text === "Meta"`, `meta.x` on the entrance-column center, `meta.y` below the grid, and Meta at least 10 from each page edge. The test at `:38-48` requires a 30 by 30 mark, no Start label, the mark centered on that column, the mark bottom equal to `maze.y`, and `mark.y >= 0`. It does not require the mark top to clear 10. With `characterSelected: false`, the test at `:51-61` requires no mark, the text `Start` above the maze and at least 10 from the top, and Meta still equal to `"Meta"`.

`layoutSheet` (`layout.ts:38-74`) is the function those tests call. `MazeSheet` calls it with the same 210, 297, inset 10, column 6, and mark 30 (`WorksheetGenerator.tsx:10-14`, `:181-189`).

### Print-contract file: source text of the print rules

`print-contract.test.ts` reads three files (`:9-11`) and does not launch a browser. On `WorksheetHome.astro` it requires one `@page` match, `size: A4`, and `margin: 0` (`:14-20`); the print block must hide `#worksheet-home h1`, `p`, and `button` (`:37-46`); the 2rem padding rule must sit inside `@media screen` and must be absent once that block is removed (`:56-62`). `global.css` must not contain the substring `@page` (`:23-25`). The worksheet SVG class string must include `print:w-[210mm]`, `print:h-[297mm]`, and `print:overflow-hidden` (`:28-34`). The class at `WorksheetGenerator.tsx:200` also contains `print:max-h-[297mm]`; the test does not assert that token. The test does not assert the word Meta or the character mark; those sit in `layout.test.ts`.

`context/changes/print-sheet-contract/plan.md` records manual preview checks as done for Chrome (`:256-259`) and Edge (`:269`), and still open for Firefox (`:270`) and Safari (`:271`). The change note says Firefox and Safari were deferred on 2026-10-05 (`change.md:12`). This pass did not open a browser. The plan states that the Node runner cannot prove the browser page count (`plan.md:29`). Change status is `implementing` (`change.md:4`).

### Last-used file: one character id in an injected store

`last-used.ts:1-2` uses the key `printo-kids:last-used`. `readLastUsed` (`:9-24`) returns `"none"` for a missing key, an empty string, a parse failure, a non-record, or a character not in the caller-supplied allow-list, and the `catch` returns `"none"` when `getItem` throws. `writeLastUsed` (`:27-32`) writes `JSON.stringify({ character })` and swallows a throwing `setItem`. The tests pass the allow-list `none`, `samochodzik`, `rakieta`, `dinozaur` (`last-used.test.ts:6`) and a memory double (`:105-121`). The round-trip at `:83-94` writes `none` and `rakieta` only. `WorksheetGenerator.tsx:36-40` and `:164` pass `localStorage`. The tests do not. A search of those two production functions shows a single `character` field; they do not read or write a profile name, a difficulty, or a delete confirmation.

### Historical claims in the 2026-10-05 guide

| Claim in `context/foundation/test-plan.md` | Verdict on this commit |
| --- | --- |
| `npm test` runs one Node file under `src/lib/maze/` (`:71`) | Contradicted. `package.json:12` names four files. |
| Phase 1 is `change opened` in folder `testing-path-count` (`:61`) | Contradicted as a live folder. `context/changes/` has no `testing-path-count`. The archive copy is `status: archived` (`context/archive/2026-10-05-testing-path-count/change.md:2-8`) and its plan progress is checked. |
| Phase 2 is `not started` (`:62`) | Contradicted as a description of `print-sheet-contract`. That change is `implementing`, with plan phases 1 and 2 checked and Edge checked. Firefox and Safari checkboxes are still open (`plan.md:270-271`). |
| Zero-path and two-path cases are not checked (`:82`) | Partial. This commit's `generate.test.ts` still has no zero-path assertion. It does assert `countPaths > 1` and `countPaths === 2` on mutated mazes (`:36-54`). It still does not pass those mazes through the sheet handler. |
| Print, Meta, the start character, and screen-versus-print have no product test (`:82`) | Partial. `layout.test.ts` and `print-contract.test.ts` now assert coordinates and print-rule source text. Browser page count remains the manual record in `print-sheet-contract/plan.md`, not an assertion in the four files. |
| Smoke checks the starter account flow (`:82`) | Supported. `smoke.mjs:39-58` still expects that flow. |
| Difficulty-level agreement and a parent image stay out of the budget until those features exist (`:104-105`) | Supported for the inspected `src` set: the string search above found neither, and the roadmap still parks FR-001 and US-02. |

The guide's hotspot sentence (`test-plan.md:21`, 14 commits from 2026-09-04, maze catalog 2 changes / 30 days) was not re-counted in this pass. The counts in `test-plan-refresh-2026-10-06/change.md` (19 commits from 2026-09-06; `src/components/` 39, `src/pages/` 15, `src/lib/` 11) were not re-counted either.

## Code References

- `package.json:12` — `npm test` names the four files
- `src/lib/maze/generate.test.ts:6-77` — 34-seed one-path contract and `assertSolvableMaze`
- `src/lib/maze/generate.test.ts:36-54` — mutated mazes with `countPaths` greater than 1 and equal to 2
- `src/lib/maze/generate.ts:27-80` — carver returns without `countPaths`; counter stops at 2
- `src/components/WorksheetGenerator.tsx:56-60` — `setMaze` only when the count is 1
- `src/components/WorksheetGenerator.tsx:241-279` — shared-wall drawing rules, untested by the four files
- `src/lib/sheet/layout.test.ts:14-61` — page, inset, Meta, mark, Start
- `src/lib/sheet/print-contract.test.ts:14-62` — `@page`, SVG print classes, hidden chrome
- `src/lib/last-used.test.ts:14-94` — character read/write against an injected store
- `.github/workflows/ci.yml:21` and `:54` — `npm test` in `ci`; smoke in `smoke`
- `scripts/smoke.mjs:39-58` — eight auth HTTP steps

## Architecture Insights

The product gate and the starter gate are different jobs. `npm test` loads the four library files. Smoke loads the auth HTTP script. A green `ci` job can pass while smoke still requires `/auth/signin` and `/dashboard`.

Path uniqueness is split across three places: the union-find carver, `countPaths`, and the click that stores a maze. The tests lock the first two for the 34 seeds and for two mutated grids. They do not lock the click.

Print proof is split the same way. Node tests lock layout numbers and the print CSS source. The plan's page-count bar is a manual preview, and on this commit that record is complete for Chrome and Edge and open for Firefox and Safari.

Last-used is a tested character id against an injected store (`last-used.test.ts:83-94`). It is not the child-profile save and delete in FR-009 and FR-010, which remain `proposed` slices S-05 and S-06. Superseded for the sheet image: see the follow-up below. The id test does not pass `localStorage`, and it does not draw a character on the maze sheet.

## Historical Context (from prior changes)

- `context/archive/2026-10-05-testing-path-count/research.md` — earlier finding that `npm test` loaded one file and that seeds 1, 99, and 12345 asserted one path. The one-file claim is contradicted by `package.json:12` on this commit. The seed claim is partial: those three seeds remain inside the 34-seed loop.
- `context/archive/2026-10-05-testing-path-count/plan.md` — shipped the 34-seed contract and refused a zero-path sheet test.
- `context/changes/path-count-test/change.md` — still `new`; notes still ask for the sheet refusal the archived plan excluded.
- `context/changes/print-sheet-contract/plan.md` — layout tests, print-rule tests, Chrome, and Edge checked; Firefox and Safari open.
- `context/changes/silent-generate-click/frame.md` — silent non-1 click is specified and, on this carver, unreachable. Line anchors in that frame predate `:56-60`.
- `context/changes/remove-starter-scaffold/change.md` — `status: new`, notes empty. Roadmap F-02 is `proposed` (`roadmap.md:47`).

## Related Research

- `context/archive/2026-10-05-testing-path-count/research.md`
- `context/changes/silent-generate-click/frame.md` (frame, not a `research.md`)

No `research.md` is present under `context/changes/print-sheet-contract/`.

## Open Questions

- The guide rewrite still has to decide how to record phase 1: the archived 34-seed contract is checked off, and `path-count-test` is a separate `new` change whose note still asks for zero-path and two-path sheet refusal.
- The 30-day commit counts in the 2026-10-05 guide and in this change's notes were not re-measured here. A plan that keeps hotspot probability in the guide needs a fresh count.
- Firefox and Safari preview checks remain open on `print-sheet-contract`. This research did not repeat the Chrome or Edge previews.

## Follow-up: chosen character on the sheet

`generateMaze` does not take a character. `WorksheetGenerator` reads the last-used id into state (`WorksheetGenerator.tsx:35-40`), writes that id when a choice is clicked (`:164`), and passes `selectedChoice.src` into the sheet (`:104`). The image `href` is that src (`:206-207`). An unknown stored id becomes `"none"` (`:40`). The first catalog row is also `"none"`, with `src: null` (`:17`).

`layoutSheet` receives only `characterSelected: characterSrc !== null` (`:189`). `layout.test.ts:38-61` asserts a 30 by 30 mark or the word Start. It does not name `samochodzik`, `rakieta`, or `dinozaur`. `last-used.test.ts` does not import the generator. None of the four `npm test` files assert that the sheet image is the file of the chosen or restored character. The checked Chrome and Edge rows in `print-sheet-contract/plan.md:256-269` do not assert which character file was drawn.

The last-used store contract is a separate, covered surface. `last-used.test.ts` already asserts a missing key, an empty string, invalid JSON, a bare JSON string, a character outside the allow-list, a stored `"none"`, the three allowed ids, a throwing `getItem`, a throwing `setItem`, and a write/read round-trip. A mutation run on this file reported about 67% killed. Removing `raw === null || raw === ""` at `last-used.ts:12` still returns `"none"`: an empty string throws inside `JSON.parse` and hits `catch`; a missing key passes `null` into `JSON.parse`, which does not throw, and `characterField` then fails closed to `"none"`. Removing `isRecord` (`:40`) or `typeof character === "string"` (`:45`) still returns `"none"` through the allow-list check or that same `catch`. An assertion aimed only at those survivors would not change the value the caller sees.
