<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: First printable maze

- **Plan**: `context/changes/first-printable-maze/plan.md`
- **Scope**: Full plan
- **Reviewed phases**: 1, 2
- **Date**: 2026-09-29
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 5 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | PASS |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## What landed

Phase 1 (`19cc6ca`): `src/lib/maze/generate.ts` exports `generateMaze(random)` and `countPaths(maze)`. Randomized Kruskal builds a 13×16 spanning tree using only the injected `random`. Entrance (0,6) opens north; exit (15,6) opens south. `countPaths` DFS-counts simple paths between those cells and stops at 2. Tests import `./generate.ts`, cover three seeds, identical sequences, a `Math.random` spy, an extra wall, and the early stop at 2. `npm test` and `@types/node` are in the repo; the `ci` job runs `npm test`. Smoke stays an auth check.

Phase 2 (`4b5479d`): `WorksheetHome.astro` keeps the heading and purpose sentence, defines `--pk-paper`, `--pk-ink`, `--pk-sage` on `main`, and mounts `WorksheetGenerator` with `client:load`. The island owns an enabled Generuj button (sage fill, paper text) and an SVG sheet (`viewBox="0 0 210 297"`, CSS aspect 210/297, 10-unit inset, square cells from inner width). One `generateMaze(Math.random)` per click; the sheet updates only when `countPaths === 1`. No sheet before the first success. After a maze exists, `main` drops `justify-center` for `justify-start`. `index.astro` is unchanged. No print CSS.

Progress: every row is `[x]` with a SHA. Epilogue: `583367a`. A later pass fixed shared walls drawn twice (F5). `change.md` is `impl_reviewed`.

## Findings

### F1 — Tests do not lock “all 208 cells connected”

- **Severity**: OBSERVATION
- **Location**: `src/lib/maze/generate.test.ts`
- **Detail**: Seeded cases assert 13×16, the two outer openings, and `countPaths === 1`. That is the PRD check. They do not assert that Kruskal connected every cell. The implementation unions internal edges until a spanning tree exists, so this is a test-gap, not a known product bug.
- **Decision**: ACCEPTED (deferred; generator work is a later conversation)

### F2 — `countPaths` uses module constants, not maze size

- **Severity**: OBSERVATION
- **Location**: `src/lib/maze/generate.ts` (`countPaths`)
- **Detail**: Entrance and exit are hardcoded as (0,6) and (15,6). Walk bounds use `maze.width` / `maze.height`, but the terminals do not. Fine while `generateMaze` is the only producer.
- **Decision**: ACCEPTED (out of this slice)

### F3 — A4 sheet fill is white, not paper

- **Severity**: OBSERVATION
- **Location**: `src/components/WorksheetGenerator.tsx`
- **Detail**: The plan’s drawing notes treated the sheet as paper (`--pk-paper`). After manual check, the parent asked for a white printable page to save ink. The page chrome stays paper; the SVG rect is `#fff`. Print CSS remains S-02.
- **Decision**: ACCEPTED

### F4 — Layout switch reaches `main` through `document.getElementById`

- **Severity**: OBSERVATION
- **Location**: `src/components/WorksheetGenerator.tsx`
- **Detail**: Astro keeps the heading; maze state lives in React. The island toggles `justify-center` / `justify-start` on `#worksheet-home`. That matches the UX spec. It couples the island to an element id. A later print/layout slice should keep that id or replace the toggle with a shared wrapper.
- **Decision**: ACCEPTED

### F5 — Shared walls drawn twice

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/WorksheetGenerator.tsx:123
- **Detail**: `collectWalls` dedupes with a string of raw coordinates. `origin + col * cellSize + cellSize` and `origin + (col + 1) * cellSize` differ by about 1e-14 on some edges (columns 2, 3, and 4 for the 190/13 cell size), so the key misses the twin stored on the neighbor. Seeds 1, 42, 99, and 12345 emit 300–313 `<line>` elements against 236 real closed walls (64–77 extras). Openings stay correct: entrance north and exit south are skipped because those flags are false. The stroke is opaque and the offset is far below print resolution, so the sheet still reads as a single wall.
- **Fix**: Emit each grid edge once (east and south of every cell, plus the outer north and west borders) and drop the float key.
- **Decision**: FIXED (Fix now)
