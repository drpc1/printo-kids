# Maze character choice — Plan Brief

> Full plan: `context/changes/maze-character-choice/plan.md`
> Research: `context/changes/maze-character-choice/research.md`

## What & Why

The parent can choose a character from a supplied set and see it at the maze start. The first set is a toy car, a rocket, and a dinosaur. The drawings already exist. This slice adds the choice and places the figure on the sheet. A sheet with no character is allowed and is the default.

## Starting Point

`/` already generates one solvable maze and prints it as a single A4 page. The start mark is the word Start in the top band, centered on the entrance gap of column 6. `public/characters/` holds three JPGs with white fields. The only shared control is `Button`.

## Desired End State

The page offers „Bez postaci” until the parent opens a window and picks a named character. The window shows a small icon with the name beside it. On the sheet, no character leaves Start centered. A character is a 20mm figure centered on the entrance, wider than the gap, with Start immediately on its right, both in the top band. Changing the choice updates that figure and keeps the maze. The choice UI does not print.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Set | Samochodzik, Rakieta, Dinozaur | The parent named these three and left the files in `public/characters/`. | Plan |
| Custom image | Out of this slice | US-02 stays parked outside MVP. | Research |
| Starter removal | Deferred | F-02 stays later; this plan does not delete auth. | Plan |
| Word Start | Stays beside the figure | The parent wants the word to remain next to the character. | Plan |
| Chooser | Separate window | The parent asked for a window rather than tiles on the page. | Plan |
| After Generuj | Swap the figure only | The maze stays; the picture updates immediately. | Plan |
| Default | Bez postaci | Generating with no character is allowed and starts selected. | Plan |
| Files in the product | Ship the three images | The roadmap line that rights do not block S-03 is accepted as a risk, not a legal clearance. | Plan |
| Size | About 20mm in the top band | Wider than the entrance, still above the corridors, with room for Start beside it. | Plan |
| White field | Remove it | The JPG square must not sit on the sheet; the drawing itself is not restyled. | Plan |
| Row contents | Small icon, name beside it | The chooser icon is smaller than the sheet figure. | Plan |
| Start side | To the right of the figure | The figure keeps the entrance center; the word moves beside it. | Plan |

## Scope

**In scope:** Transparent PNGs beside the JPGs, a catalog dialog, selection state defaulting to none, the sheet mark, live swap, print hiding of the chooser.

**Out of scope:** US-02, starter removal, difficulty, saved parameters, profiles, redrawing the art, generator changes, a legal sign-off.

## Architecture / Approach

Selection lives in the worksheet island and does not call `generateMaze`. A button opens a shadcn dialog. The sheet reads the selection: none keeps today’s centered Start; a character draws a 20-unit PNG on the entrance center and Start to its right. PNGs are local files. Dialog content is `print:hidden` because a portal renders outside `#worksheet-home`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Transparent character files | Three PNGs, JPGs kept | A white cut removes cream fills inside the drawing |
| 2. Choice dialog | Window, default „Bez postaci”, no sheet figure yet | A portaled window prints unless it is explicitly hidden |
| 3. Character beside Start | 20mm figure, Start on its right, live swap | The pair overflows the 21.6-unit band or covers a corridor |

**Prerequisites:** The three JPGs are already in `public/characters/`. F-02 is not a prerequisite for this plan.
**Estimated effort:** About 2 sessions across 3 phases.

## Open Risks & Assumptions

- PRD Open Question 3 still says publishing character selection is blocked. This plan ships the files anyway, because the roadmap says rights do not block S-03. That is an accepted product risk, not a clearance.
- 20 user units inside a band of about 21.6 is tight. The figure and Start have to stay in the band without covering the first corridor.
- Print of an SVG image was not measured in research. Phase 3 checks it on a real print preview.

## Success Criteria (Summary)

- The parent can generate a maze with no character, and Start stays centered.
- The parent can pick one of the three characters in a window and see it at the entrance, wider than the gap, with Start beside it.
- Changing or clearing the choice updates the sheet in place, and the printed page matches that sheet without the choice UI.
