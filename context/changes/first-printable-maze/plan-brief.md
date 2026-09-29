# First printable maze — Plan Brief

> Full plan: `context/changes/first-printable-maze/plan.md`

## What & Why

Roadmap S-01. The home page now tells a parent what PrintoKids is for and shows Generuj, but the button does nothing. This change makes that button draw a solvable maze on an A4 sheet on the same page, so a later slice only has to print it.

## Starting Point

`/` renders [src/components/WorksheetHome.astro](src/components/WorksheetHome.astro): a warm paper page, the heading PrintoKids, one Polish purpose sentence, and a disabled Generuj button. There is no maze code and no unit-test script. CI lints, typechecks, and builds. Auth pages stay on the cosmic starter screen.

## Desired End State

The parent clicks Generuj and sees one A4 sheet on `/`. The maze is 13 by 16, with one path from a top-center gap labeled Start to a bottom-center gap labeled Meta. Another click replaces that sheet. Nothing is printed yet.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Grid | 13 by 16 square cells, about 14.6 mm at true A4 | The chosen corridor is about 15 mm and a 12-column grid has no single center cell. |
| Generator | Randomized Kruskal | The maze should branch like a worksheet and still have exactly one path. A long ribbon was the alternative and was not chosen. |
| Entrance and exit | Top-center gap with the word Start; bottom-center gap with Meta | The roadmap recommended a gap with no word; planning chose the word Start. |
| Where it runs | In the browser, same `countPaths`, paint only when the count is 1 | The page calls the same check the tests call. |
| Repeat click | Replaces the single sheet | A failed check leaves the previous good sheet, or no sheet on the first click, and shows no error text. |
| Tests | Node’s built-in runner on an explicit file | No Vitest and no maze API. |

## Scope

**In scope:** `src/lib/maze/generate.ts` and its test, an `npm test` script, `@types/node`, the `ci` job, a React island for Generuj and the SVG sheet, and color variables on the home `main`.

**Out of scope:** print, a character, removing the word Start, difficulty, saved parameters, profiles, a server generator, and auth-page styling.

## Architecture / Approach

A pure module builds the maze and counts paths. The Astro page keeps the heading and the sentence, and mounts one React island for the button and the SVG. The island passes `Math.random` in once per click. Tests pass a seeded function into the same module. The sheet matches A4 proportions with a 10 mm inset and a 210 by 297 user space so the cells stay square. It does not add print CSS.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Generator and the single path | Kruskal, the two openings, and `npm test` in CI | `node:test` types fail `astro check` unless `@types/node` is added |
| 2. A4 sheet on the page | Enabled Generuj and one SVG sheet | `justify-center` clips the heading once the sheet is taller than the window |

**Prerequisites:** the F-01 shell is already on `/` (disabled Generuj). Roadmap status for F-01 can still say in progress; the page code is what this change needs.
**Estimated effort:** about 2 sessions across 2 phases.

## Open Risks & Assumptions

- 13 by 16 at about 14.6 mm is the on-screen size at true A4. Whether a crayon fits on paper is judged when S-02 prints the same sheet.
- The word Start occupies the place S-03 will use for a character. This slice does not remove it.
- On a narrow window the sheet scales down and keeps its proportions. The PRD target is current desktop Chrome, Edge, Firefox, and Safari.
- A path count other than 1 is treated as a bug: the parent sees no new maze and no error sentence.

## Success Criteria (Summary)

- A parent can click Generuj and see a solvable maze as an A4 sheet on the same page, with square passages.
- Start is the word above the top gap, and Meta is the word below the bottom gap.
- A second click shows a different maze in place of the first, and nothing is sent to a printer.
