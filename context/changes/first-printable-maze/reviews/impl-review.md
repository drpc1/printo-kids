<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: First printable maze

- **Plan**: `context/changes/first-printable-maze/plan.md`
- **Mode**: Full (phases 1–2)
- **Reviewed phases**: 1, 2
- **Date**: 2026-09-29
- **Verdict**: SOUND
- **Findings**: 0 critical, 0 warnings, 4 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan vs code | PASS |
| Scope boundaries | PASS |
| Auth / smoke unchanged | PASS |
| Success criteria | PASS |

## What landed

Phase 1 (`19cc6ca`): `src/lib/maze/generate.ts` exports `generateMaze(random)` and `countPaths(maze)`. Randomized Kruskal builds a 13×16 spanning tree using only the injected `random`. Entrance (0,6) opens north; exit (15,6) opens south. `countPaths` DFS-counts simple paths between those cells and stops at 2. Tests import `./generate.ts`, cover three seeds, identical sequences, a `Math.random` spy, an extra wall, and the early stop at 2. `npm test` and `@types/node` are in the repo; the `ci` job runs `npm test`. Smoke stays an auth check.

Phase 2 (`4b5479d`): `WorksheetHome.astro` keeps the heading and purpose sentence, defines `--pk-paper`, `--pk-ink`, `--pk-sage` on `main`, and mounts `WorksheetGenerator` with `client:load`. The island owns an enabled Generuj button (sage fill, paper text) and an SVG sheet (`viewBox="0 0 210 297"`, CSS aspect 210/297, 10-unit inset, square cells from inner width). One `generateMaze(Math.random)` per click; the sheet updates only when `countPaths === 1`. No sheet before the first success. After a maze exists, `main` drops `justify-center` for `justify-start`. `index.astro` is unchanged. No print CSS.

Progress: every row is `[x]` with a SHA. `change.md` is `implemented`. Epilogue: `583367a`.

## Findings

### F1 — Tests do not lock “all 208 cells connected”

- **Severity**: observation
- **Location**: `src/lib/maze/generate.test.ts`
- **Detail**: Seeded cases assert 13×16, the two outer openings, and `countPaths === 1`. That is the PRD check. They do not assert that Kruskal connected every cell. The implementation unions internal edges until a spanning tree exists, so this is a test-gap, not a known product bug.
- **Decision**: ACCEPTED (deferred; generator work is a later conversation)

### F2 — `countPaths` uses module constants, not maze size

- **Severity**: observation
- **Location**: `src/lib/maze/generate.ts` (`countPaths`)
- **Detail**: Entrance and exit are hardcoded as (0,6) and (15,6). Walk bounds use `maze.width` / `maze.height`, but the terminals do not. Fine while `generateMaze` is the only producer.
- **Decision**: ACCEPTED (out of this slice)

### F3 — A4 sheet fill is white, not paper

- **Severity**: observation
- **Location**: `src/components/WorksheetGenerator.tsx`
- **Detail**: The plan’s drawing notes treated the sheet as paper (`--pk-paper`). After manual check, the parent asked for a white printable page to save ink. The page chrome stays paper; the SVG rect is `#fff`. Print CSS remains S-02.
- **Decision**: ACCEPTED

### F4 — Layout switch reaches `main` through `document.getElementById`

- **Severity**: observation
- **Location**: `src/components/WorksheetGenerator.tsx`
- **Detail**: Astro keeps the heading; maze state lives in React. The island toggles `justify-center` / `justify-start` on `#worksheet-home`. That matches the UX spec. It couples the island to an element id. A later print/layout slice should keep that id or replace the toggle with a shared wrapper.
- **Decision**: ACCEPTED
