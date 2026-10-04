---
date: 2026-10-04T16:23:14+02:00
researcher: unknown
git_commit: 557d9b2f2215
branch: main
repository: printo-kids
topic: "What exists for maze-character-choice: a parent picks a character from a supplied set and that character stands at the maze start"
tags: [research, codebase, maze-character-choice, WorksheetGenerator, generate]
status: complete
last_updated: 2026-10-04
last_updated_by: unknown
last_updated_note: "Follow-up: custom image is US-02 outside MVP; first catalog is car, rocket, dinosaur."
---

# Research: What exists for maze-character-choice

**Date**: 2026-10-04T16:23:14+02:00
**Researcher**: unknown
**Git Commit**: 557d9b2f2215 (`git rev-parse HEAD` on `main` at write time; full hash `557d9b2f22155a9da31e5f4c4078a3c136cbe753`)
**Branch**: main
**Repository**: printo-kids

## Research Question

What already exists in this repo, and which decisions are still open, for roadmap slice S-03 (`maze-character-choice`): the parent chooses a character from a supplied set and that character stands at the maze start. This pass was requested with starter removal (`remove-starter-scaffold`, F-02) left for later.

## Summary

On commit `557d9b2f2215`, `generateMaze` opens the north wall of cell `(0, 6)` and `MazeSheet` draws the word Start in the top label band, centered on that column (`src/lib/maze/generate.ts:14-18`, `src/lib/maze/generate.ts:41-42`, `src/components/WorksheetGenerator.tsx:10`, `src/components/WorksheetGenerator.tsx:97-107`). Meta is the matching label under the grid (`src/components/WorksheetGenerator.tsx:108-118`). A filename listing of `src` for `svg`, `png`, `webp`, `jpg`, `jpeg`, `gif`, and `ico` returned no files. `public/` at that listing contained `favicon.png` and `template.png`. The shared UI directory `src/components/ui/` contains `button.tsx` and the worksheet Generuj and Drukuj controls use that `Button` (`src/components/WorksheetGenerator.tsx:51-67`).

The parent-facing requirement is settled in the PRD and the roadmap: one character from a supplied set, standing at the start, with „Meta” at the end, without a child profile (`context/foundation/prd.md:49-60`, `context/foundation/prd.md:69-70`, `context/foundation/roadmap.md:133-136`). The set’s source was unnamed in the foundation files. A later note in this document records the user’s 2026-10-04 statement that the set is to be drawn with AI. Publishing rights are an unresolved contradiction: PRD Open Question 3 says `Block: yes` before publishing character selection (`context/foundation/prd.md:135`); the roadmap says rights do not block S-03 (`Block: no`) and still asks for the set source at planning time (`context/foundation/roadmap.md:142`, `context/foundation/roadmap.md:200`). The S-01 brief says the word Start occupies the place S-03 will use and that S-01 does not remove it (`context/archive/2026-09-28-first-printable-maze/plan-brief.md:51`). No later archived plan inspected here replaces that sentence. The roadmap still lists F-02 as the prerequisite of S-03 (`context/foundation/roadmap.md:48`, `context/foundation/roadmap.md:138`).

## Detailed Findings

### Entrance and the Start label

`generateMaze` builds a maze of width 13 and height 16, then sets `cells[0][6].north` to false and `cells[15][6].south` to false (`src/lib/maze/generate.ts:14-19`, `src/lib/maze/generate.ts:41-44`). `collectWalls` emits a north segment on row 0 when `cell.north` is true (`src/components/WorksheetGenerator.tsx:139-141`), so column 6 has no top outer segment for a maze from this function. A south segment is emitted when `cell.south` is true (`src/components/WorksheetGenerator.tsx:151-158`), so the exit gap is the missing south wall of row 15, column 6.

`MazeSheet` uses a viewBox of `0 0 210 297`, insets of 10, and `LABEL_COLUMN` 6 (`src/components/WorksheetGenerator.tsx:6-10`, `src/components/WorksheetGenerator.tsx:88-89`). For a maze whose `width` is 13 and `height` is 16, `cellSize` is `(210 - 20) / 13` and `labelX` is `10 + 6.5 * cellSize`, which equals 105. The top label band height is `((297 - 20) - 16 * cellSize) / 2`, which evaluates to 21.5769… SVG user units. Start is drawn at `(labelX, 10 + labelBand / 2)` with the literal text `Start` (`src/components/WorksheetGenerator.tsx:82-107`). Meta uses the same `labelX` below the grid (`src/components/WorksheetGenerator.tsx:84`, `src/components/WorksheetGenerator.tsx:108-118`). This file’s sheet contains those two `<text>` nodes and wall `<line>` nodes. It does not contain an image element.

### Print rules that touch that slot

`WorksheetHome.astro` sets `@page { size: A4; margin: 0 }` (`src/components/WorksheetHome.astro:21-24`). The SVG print classes set height `297mm` and width `210mm` (`src/components/WorksheetGenerator.tsx:91`). The 10-unit inset is the in-sheet margin described by the S-02 plan as the 10 mm already drawn on the sheet (`context/archive/2026-09-29-print-a4-maze/plan.md:23`).

In `@media print`, `#worksheet-home h1`, `p`, and `button` are `display: none` (`src/components/WorksheetHome.astro:41-45`). The Generuj/Drukuj wrapper has `print:hidden` (`src/components/WorksheetGenerator.tsx:50`). Start and Meta are SVG text, so those two selectors do not match them. An HTML control that is not an `h1`, `p`, or `button`, and that sits outside the `print:hidden` wrapper, is not hidden by the rules in those two places. No print preview was run in this pass.

### Choice control and image files

Generuj calls `generateMaze(Math.random)` and `setMaze` when `countPaths` is 1 (`src/components/WorksheetGenerator.tsx:37-41`). Drukuj calls `window.print()` (`src/components/WorksheetGenerator.tsx:44-46`). Both use `Button` from `@/components/ui/button`. Component state in this file is `maze` (`src/components/WorksheetGenerator.tsx:21`). There is no selected-character state in this file.

A glob of `src/components/ui/` returned one file: `src/components/ui/button.tsx`. A search of `src` for `RadioGroup`, `ToggleGroup`, and `role="radio"` in `*.{tsx,astro,ts}` returned no matches. A recursive listing of `src` for the image extensions above returned no files. A listing of `public/` returned `.assetsignore`, `favicon.png`, and `template.png`. `favicon.png` is the icon link in `src/layouts/Layout.astro`. This pass did not open `template.png`.

### Settled product text and the rights contradiction

US-01 requires the chosen character at the start and the word „Meta” at the end (`context/foundation/prd.md:60-61`). FR-002 is must-have and its note leaves source and rights open (`context/foundation/prd.md:69-70`). Access control says the generator works without a child profile; a favorite character on a profile is described there as profile data (`context/foundation/prd.md:117-119`). The roadmap parks difficulty off the active `F-01`–`S-06` path (`context/foundation/roadmap.md:204`) and says that until levels return, the parameter S-04 remembers is the character (`context/foundation/roadmap.md:155`).

PRD Open Question 3: source and rights, owner user, `Block: yes` before publishing the character-selection feature (`context/foundation/prd.md:135`). Roadmap S-03 unknown: source is a set to draw or a license, rights do not block this story, `Block: no` (`context/foundation/roadmap.md:142`). Roadmap Open Question 2 repeats `Block: no` and says the set source is still to be named when planning S-03 (`context/foundation/roadmap.md:200`). This pass does not pick a winner. The interview the roadmap cites is not in the files read here.

The roadmap table and the S-03 body list prerequisite F-02 (`context/foundation/roadmap.md:48`, `context/foundation/roadmap.md:138`). The backlog row says S-03 is not ready for `/10x-plan` and is waiting on F-02 (`context/foundation/roadmap.md:192`). This research was requested after that starter cleanup was deferred; the roadmap file was not edited in this pass.

## Code References

- `src/lib/maze/generate.ts:14-44` — 13 by 16 grid; entrance `(0, 6)` north opened; exit `(15, 6)` south opened.
- `src/components/WorksheetGenerator.tsx:37-70` — Generuj, Drukuj, and the sheet mount; no character state.
- `src/components/WorksheetGenerator.tsx:75-125` — A4 viewBox, Start, Meta, wall lines.
- `src/components/WorksheetGenerator.tsx:139-141` — top wall omitted when `cell.north` is false.
- `src/components/WorksheetHome.astro:21-45` — `@page` A4 margin 0; print hides `h1`, `p`, and `button`.
- `src/components/ui/button.tsx` — the one file under `src/components/ui/` in this glob.

## Architecture Insights

The sheet is one SVG in user units that match millimetres at the print size `210mm` by `297mm`. The top label band is the vertical span that currently holds Start, above the entrance gap of column 6. A mark added as another SVG child in that band prints with the sheet. A choice control added as HTML is subject to the print hide rules above: the button row is `print:hidden`, and the home print CSS hides `h1`, `p`, and `button` only.

`@page` for this worksheet lives in `WorksheetHome.astro`, which is the placement the S-02 plan required so the rule stays with the home sheet (`context/archive/2026-09-29-print-a4-maze/plan.md:24`).

## Historical Context (from prior changes)

- `context/archive/2026-09-28-first-printable-maze/plan-brief.md:23` — supported as the decision that shipped: planning chose the word Start after the roadmap had recommended a gap with no word. Current `MazeSheet` still renders `Start` (`src/components/WorksheetGenerator.tsx:106`).
- `context/archive/2026-09-28-first-printable-maze/plan-brief.md:51` — supported as the latest slot sentence in the plans read here: “The word Start occupies the place S-03 will use for a character. This slice does not remove it.” The S-01 plan says S-03 deals with the word then (`context/archive/2026-09-28-first-printable-maze/plan.md:31`) and does not say remove, keep, or place beside.
- `context/foundation/roadmap.md:103` — partial. The done S-01 unknown still recommends a gap without the word „Start” and says the S-03 character goes in that same place. The S-01 brief records that planning chose the word instead (`plan-brief.md:23`). The unknown line was not rewritten when the slice was marked done.
- `context/archive/2026-09-29-print-a4-maze/plan.md:11-19` — the “current state” paragraph that says nothing in `src/` prints is contradicted by the present `window.print` and `@page`. The desired end state that print includes Start and Meta, and the exclusion of a character (`plan.md:33`), match the sheet and the absence of a character mark in `WorksheetGenerator.tsx`.
- `context/archive/2026-10-03-ui-tokens-onboarding/plan.md:43` — supported against current code: the not-doing list forbids changing Start/Meta `fontFamily` away from `ui-sans-serif`. The sheet still sets `fontFamily="ui-sans-serif, system-ui, sans-serif"` (`src/components/WorksheetGenerator.tsx:101`, `src/components/WorksheetGenerator.tsx:112`).
- `context/foundation/shape-notes.md:60` — the 100× note about a broader character catalog is scale context. It is not an MVP set for S-03. The PRD character rules cited above do not restate it.

## Related Research

- `context/archive/2026-10-04-worksheet-ui/research.md` — records the same Start/Meta `fontFamily` string and the ui-tokens lock against changing it. That audit did not add a character.

## Follow-up: AI-drawn set and a parent-supplied image

On 2026-10-04 the user stated that the supplied set has to be drawn with AI, and asked what copyright position follows if a parent later adds their own character and the app places that image on the maze. This is a product reading of public rules, not a legal opinion.

Polish copyright protects a work that is a manifestation of creative activity of an individual character (ustawa o prawie autorskim i prawach pokrewnych, art. 1 ust. 1, tekst jednolity Dz.U. 2025 poz. 24). Commentary treated here (PARP, „Wytwory powstałe przy udziale AI”) says a result produced from a prompt, with no further human creative contribution, generally is not such a work. The same sources say protection can arise when a person shapes the final expression and the model is a tool. An image that copies a recognizable third-party character can still infringe that character even when the new file itself is unprotected. The tool vendor’s terms are a separate contract from the statute.

A parent-supplied image is a different file. Placing it on the sheet does not move copyright in that file to the app. If the bytes stay on the device, matching the PRD rule that profile data does not leave the device (`context/foundation/prd.md:102`), the app does not become a host of that image. A parent who uploads a character they do not have rights to is the person making that copy. A photo of a child is also an image-right and personal-data question.

On 2026-10-04 the user asked whether a child’s photo that is deleted after maze generation, and not kept by the operator, raises no personal-data issue. Deletion is not an exemption. A photo of an identifiable child is personal data. GDPR processing includes collection and use, not only storage (art. 4 pkt 2 RODO). If the file reaches the operator’s server, even for the generation and is then deleted, that pass is still processing: it needs a legal basis, a short notice, and deletion that also covers logs and any onward send (for example an AI API). If the photo is handled only in the browser and never sent, the operator does not receive it; the parent’s home print sits closer to the household exception (art. 2 ust. 2 lit. c RODO) for the parent. The PRD line that child-profile data stays on the device (`context/foundation/prd.md:102`) describes profiles and last-used parameters, not this photo. Generated cards are not stored after printing (`context/foundation/prd.md:103`). This remains a product reading, not a legal opinion.

On the same day the user asked whether the maze-plus-photo file can be produced without the photo reaching the server even briefly. In the current island, `handleGenerate` calls `generateMaze` in the browser and keeps the result in component state (`src/components/WorksheetGenerator.tsx:37-41`). That function does not send the maze. A file chosen with a browser file input is also local until some later code posts it. Drawing that file into the existing SVG, or into a canvas, and then calling `window.print()` (`src/components/WorksheetGenerator.tsx:44-46`) does not require a request that carries the image. A download built from a client-side blob is the browser saving to the user’s disk. This holds only while no fetch, form post, analytics capture, or AI API call includes the bytes. Print reliability of an SVG image that uses a `blob:` URL was not tested in this pass.

## Open Questions

1. On 2026-10-04 the user named the first supplied set as a toy car, a rocket, and a dinosaur (`samochodzik`, `rakieta`, `dinozaur`), to be drawn with AI. A parent-supplied file is US-02, written into the PRD and parked on the roadmap outside MVP (`context/foundation/prd.md` US-02; `context/foundation/roadmap.md` Parked). Still open: which image files this slice ships, and how much human editing they contain.
2. Which block flag applies to this slice: PRD `Block: yes` before publishing character selection (`context/foundation/prd.md:135`), or roadmap `Block: no` for S-03 (`context/foundation/roadmap.md:142`)?
3. When the character is in the top band, does the word Start go away, stay, or sit beside the character? The S-01 texts assign the place to S-03 and do not choose (`context/archive/2026-09-28-first-printable-maze/plan-brief.md:51`, `context/archive/2026-09-28-first-printable-maze/plan.md:31`).
4. Roadmap prerequisite F-02 is still written (`context/foundation/roadmap.md:138`). This research did not change that line. Planning has to record that starter removal stays deferred.
