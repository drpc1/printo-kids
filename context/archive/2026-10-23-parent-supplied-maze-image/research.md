---
date: 2026-10-23T11:32:04+02:00
researcher: Grok 4.7
git_commit: 6d9904d3e41c6590f72fef6c35882d3f6a92d322
branch: parent-supplied-maze-image
repository: printo-kids
topic: "Parent-supplied maze image (US-02): what the product and the current character path already settle"
tags: [research, codebase, maze-character, us-02, local-storage, print]
status: complete
last_updated: 2026-10-23
last_updated_by: Grok 4.7
last_updated_note: User settled the image constraints on 2026-10-23. Open questions 2–7 are decisions in change.md; question 8 stays a print check.
---

# Research: Parent-supplied maze image (US-02)

**Date**: 2026-10-23T11:32:04+02:00
**Researcher**: Grok 4.7
**Git Commit**: 6d9904d3e41c6590f72fef6c35882d3f6a92d322
**Branch**: parent-supplied-maze-image
**Repository**: printo-kids

## Research Question

What does US-02 already require for a parent-supplied maze image, and what does the current character path do with an id that is not one of the supplied catalog characters? Scope from `context/changes/parent-supplied-maze-image/change.md`: the parent points at their own file, the image stands at the maze start, and the file stays in the browser. S-12 stays out of this change.

## Summary

US-02 is still parked outside the MVP. Its written behavior is: the parent points at their own image file before generation, the image stands at the start of the card, and the file stays in the browser, including during generation (`context/foundation/prd.md:71-81`). The roadmap still parks that story under the change id `parent-supplied-maze-image` (`context/foundation/roadmap.md:149`). S-08, the eleven-character catalog, is already in Done (`context/foundation/roadmap.md:189`), which is the “after the supplied catalog” condition in `context/foundation/prd.md:79`. Parking and that condition are both still in the current files.

On commit `6d9904d3e41c6590f72fef6c35882d3f6a92d322`, `MazeSheet` takes a `CharacterChoice` id and sets the SVG `href` from `characterSheetSrc` (`src/components/WorksheetGenerator.tsx:339-370`). `CHARACTER_CHOICES` is `none` (`src: null`) plus 11 ids whose `src` values are `/characters/<id>.png` (`src/lib/sheet/character.ts:1-16`). A directory listing of `public/characters` on this date contains those 11 png names. In that `MazeSheet` return, the `<image>` is rendered when `mark` and `characterSrc` are both non-null, which requires `level.showCharacter` and a non-null `characterSheetSrc` (`src/components/WorksheetGenerator.tsx:350` and `:369-370`). In the `LEVELS` constant, `showCharacter` is true for `lat3`, `lat4`, `lat5`, `lat6`, and `lat7`, and false for `nastolatek` (`src/lib/maze/levels.ts:23-84`).

`handleGenerate` calls `generateMaze(level, Math.random)` in the browser island (`src/components/WorksheetGenerator.tsx:64-76`, `src/pages/labirynt.astro:9`). `generateMaze`’s parameters are a level id and `random` (`src/lib/maze/generate.ts:22`). `handlePrint` is `window.print()` (`src/components/WorksheetGenerator.tsx:106-108`). A search of `src/**/*.{ts,tsx,astro,mjs,js}` for `fetch(`, `FormData`, `FileReader`, `createObjectURL`, and `type="file"` returned no matches. The glob of `src/pages/**/*.{astro,ts}` returned `index.astro` and `labirynt.astro`.

When `readLastUsed` is given the catalog allow-list, a stored character string outside that list comes back as `"none"` (`src/lib/last-used.ts:26-29`). When `readChildProfiles` is given that list, a profile row whose character is outside the list is omitted (`src/lib/child-profiles.ts:203-206`). `writeLastUsed` and `writeChildProfiles` store the string they are given and do not consult an allow-list (`src/lib/last-used.ts:36-42`, `src/lib/child-profiles.ts:58-66`). In the PRD sections cited below, the roadmap Parked bullet, and these `src/` files, nothing settles file types, survival across visits, a profile favorite, the teen sheet, the control, or the mark size for the parent file. This pass did not print a non-catalog `href` and did not measure storage size.

## Detailed Findings

### US-02 text, and what it does not say

- US-02’s scenario: the parent has their own image file, for example a photo of the child, points at it before generating the maze, and the image stands at the start on the card. The file stays in the browser and is not sent to the server (`context/foundation/prd.md:73-75`).
- The acceptance lines in this story say it is outside the MVP, that the file does not reach the server even during generation, and that the service does not keep a copy after the card is composed (`context/foundation/prd.md:79-81`).
- The same exclusion is a non-goal: the MVP does not accept the parent’s own image; the supplied catalog goes first (`context/foundation/prd.md:297`). In the Functional Requirements section (`context/foundation/prd.md:179-226`), FR-002 is the supplied set (`:184-185`) and FR-012 names the eleven catalog characters (`:213`). No FR in that section has the parent file as its text.
- US-03 says last-used and the profile favorite may be any catalog character, and that the parent’s own image stays on US-02 (`context/foundation/prd.md:95-96`). That sentence keeps the file out of the catalog story. It does not say whether a later US-02 build may store the file as a favorite.
- The across-visits line names local child profiles and last parameters (`context/foundation/prd.md:236-237`). It does not name this file. “Stays in the browser” in US-02 (`context/foundation/prd.md:75`) is not that sentence.
- US-01 says the selected character stands at the start except on the teen level (`context/foundation/prd.md:61` and `:68`). US-02 does not mention `nastolatek`.
- US-05 says the character bar is shown only on the maze page, and the symmetry card does not show a character (`context/foundation/prd.md:130`). Roadmap S-12 is `symmetry-first-printable` (`context/foundation/roadmap.md:45` and `:130`). This change’s note says S-12 stays with Claude (`context/changes/parent-supplied-maze-image/change.md:12`). This pass did not open that slice.
- Open Question 3 still blocks publishing the supplied catalog on rights. Its last sentence leaves the parent’s file on US-02, outside the MVP (`context/foundation/prd.md:324`).
- The roadmap Parked bullet still lists US-02, with the reason recorded 2026-10-04 and the unlock id `parent-supplied-maze-image` (`context/foundation/roadmap.md:149`). S-08 is in Done (`context/foundation/roadmap.md:189`). The “return after the catalog” line (`context/foundation/prd.md:79`) and the parked bullet are both present; the roadmap has not dropped the park.

### Catalog id, allow-list, and the two stores

- `CHARACTER_CHOICES` is `none` with `src: null` and label „Bez postaci”, then these ids: `dinozaur`, `jednorozec`, `kot`, `pies`, `rakieta`, `robot`, `samochodzik`, `smok`, `strazak`, `syrenka`, `wrozka`, each with `src` `/characters/<id>.png` (`src/lib/sheet/character.ts:1-16`).
- `characterSheetSrc` returns that row’s `src`, or `null` when no row matches (`src/lib/sheet/character.ts:18-24`). For `none` the row exists and `src` is `null`, so the return is also `null`.
- `characterRow` returns the matching row, or the `none` row when the id is missing (`src/lib/sheet/character.ts:26-38`).
- Both screens build the allow-list with `CHARACTER_CHOICES.map((option) => option.id)` (`src/components/WorksheetGenerator.tsx:27`, `src/components/ProfileCorner.tsx:23`). That list is the argument to `readChildProfiles`, `readLastUsed`, and `withFavorite`. The short `ALLOWED` arrays in tests are not these two constants. This pass did not re-run the tests.
- `CharacterChoice` on each screen is the id union of `CHARACTER_CHOICES` (`src/components/WorksheetGenerator.tsx:29`, `src/components/ProfileCorner.tsx:36`). `CharacterChoiceRows` calls `onSelect(option.id)` for each row of that array (`src/components/ProfileCorner.tsx:600-627`). The bar dialog uses that component (`src/components/WorksheetGenerator.tsx:288-293`).
- Last-used key is `printo-kids:last-used`. When `readLastUsed` parses an object and `character` is a string outside `allowed`, the returned character is `"none"` and `levelField` keeps a stored level that passes `isLevelId` (`src/lib/last-used.ts:26-29`). A thrown `getItem` or `JSON.parse` returns `{ character: "none", level: DEFAULT_LEVEL_ID }` (`src/lib/last-used.ts:31-33`). `DEFAULT_LEVEL_ID` is `"lat5"` (`src/lib/maze/levels.ts:1`).
- `writeLastUsed` stores `{ character, level }` and does not take an allow-list (`src/lib/last-used.ts:36-42`). In `src/**/*.{ts,tsx}`, the production calls are `WorksheetGenerator.tsx:95` and `:102`, each inside `if (activeId === null)` (`src/components/WorksheetGenerator.tsx:92-103`). Tests call it too; those calls are not this screen.
- Profile key is `printo-kids:child-profiles`. `acceptEntry` returns `null` when `character` is not a string in `allowed` (`src/lib/child-profiles.ts:203-206`), and `readChildProfiles` omits that row (`src/lib/child-profiles.ts:19-33`). `"none"` is in the allow-list built above, so a stored favorite `"none"` is kept by this check.
- `writeChildProfiles` writes `{ profiles }` and does not take an allow-list (`src/lib/child-profiles.ts:58-66`). `withFavorite` returns `null` when `character` is not in `allowed` (`src/lib/child-profiles.ts:87-88`). `handleSaveFavorite` returns without writing when that result is `null` (`src/components/ProfileCorner.tsx:266-274`).
- After a visit read, `characterChoice` maps a string that is not a `CHARACTER_CHOICES` id to `"none"` before React state (`src/components/WorksheetGenerator.tsx:404-418`, and the same helper in `src/components/ProfileCorner.tsx:630-635`).
- `printo-kids:active-profile` stores a profile id or the string `"none"` (`src/lib/active-profile.ts:1-4`). That `"none"` is `NO_PROFILE`, not the character id. This file does not store an image.
- A search of `src/**/*.{ts,tsx}` for `data:` and `blob:` returned no matches. A caller that passed such a string to `writeLastUsed` or `writeChildProfiles` would hit the write functions above, which do not check the list. The next `readLastUsed` on the catalog allow-list would return character `"none"` (`src/lib/last-used.ts:26-29`). The next `readChildProfiles` on that allow-list would omit a profile row whose `character` is that string (`src/lib/child-profiles.ts:203-206`).

### Sheet mark and print

- `MazeSheet` calls `layoutSheet` with page 210 by 297, inset 10, mark size `CHARACTER_MARK_SIZE` (30), and label height 7 (`src/components/WorksheetGenerator.tsx:16-20` and `:341-353`).
- `characterSelected` on that call is `level.showCharacter && characterSrc !== null` (`src/components/WorksheetGenerator.tsx:350`). `levelShowsCharacter` is `level.showCharacter` (`src/components/WorksheetGenerator.tsx:351`).
- When both flags are true, `layoutSheet` returns a mark whose box is `markSize` by `markSize`, with `x = labelX - markSize / 2` and `y = originY - markSize`, and `start: null` (`src/lib/sheet/layout.ts:80-91`). `labelX` is the center of the entrance column (`src/lib/sheet/layout.ts:72`).
- When either flag is false, the same function returns `start` with text `"Start"` and no mark (`src/lib/sheet/layout.ts:95-99`).
- The shift that moves the block down runs when `levelShowsCharacter` is true, including when no character is picked (`src/lib/sheet/layout.ts:67-69`). The comment there says the shift assumes a band of at least about 11 above the grid on today’s level grids.
- In `LEVELS`, `showCharacter` is true on `lat3`, `lat4`, `lat5`, `lat6`, and `lat7`, and false on `nastolatek` (`src/lib/maze/levels.ts:23-84`). On `nastolatek`, `characterSelected` is false even when `characterSrc` is a catalog path, because of the `&&` at `WorksheetGenerator.tsx:350`.
- The `<image>` element is rendered when `mark !== null && characterSrc !== null`, with attributes `href`, `x`, `y`, `width`, and `height` (`src/components/WorksheetGenerator.tsx:369-370`). This element has no `preserveAspectRatio` in that JSX. The other branch draws `start.text` when `start !== null` (`src/components/WorksheetGenerator.tsx:371-382`).
- The SVG that contains that image uses `print:h-[297mm] print:max-h-[297mm] print:w-[210mm]` (`src/components/WorksheetGenerator.tsx:360-364`). In `GeneratorShell.astro`, `@page` is A4 with margin 0 (`src/components/GeneratorShell.astro:46-48`). In `@media print`, `#worksheet-home svg` is `display: block; overflow: hidden; max-width: 100%; max-height: 100vh` (`src/components/GeneratorShell.astro:106-112`). The comment at line 109 says iOS print adds printer margins and the sheet scales down. Those rules do not name the character mark. The controls wrapper uses `print:hidden` (`src/components/WorksheetGenerator.tsx:211`); `MazeSheet` is the next sibling (`src/components/WorksheetGenerator.tsx:226`).
- The 30-unit mark is the value passed for a catalog character. US-02 does not state a size. US-04 says the 10 mm margin applies to the maze walls and frame, and the character mark at the start may enter that band (`context/foundation/prd.md:108`). That sentence names the character mark, not a parent file.

### What generation and print send

- `/labirynt` mounts `WorksheetGenerator` with `client:only="react"` (`src/pages/labirynt.astro:9`).
- `handleGenerate` returns immediately when `waitingForChild` is true. Otherwise it sets maze state from `mazeForSheet(generateMaze(level, Math.random), level)` (`src/components/WorksheetGenerator.tsx:64-76`). `generateMaze`’s parameters are `levelId` and `random` (`src/lib/maze/generate.ts:22`). Its return value is `width`, `height`, and `cells` (`src/lib/maze/generate.ts:32`).
- `handlePrint` calls `window.print()` (`src/components/WorksheetGenerator.tsx:106-108`).
- Catalog images in the picker are `<img src={option.src}>` with the `/characters/...` strings (`src/components/ProfileCorner.tsx:620-622`, `src/components/WorksheetGenerator.tsx:279-281`). Those components do not build a request body from the file bytes. The files with those names are in `public/characters`, listed above.
- Negative search, this pass: `src/**/*.{ts,tsx,astro,mjs,js}` had no matches for `fetch(`, `FormData`, `FileReader`, `createObjectURL`, or `type="file"`. The glob `src/pages/**/*.{astro,ts}` returned `src/pages/index.astro` and `src/pages/labirynt.astro`. No `src/pages/api` file was in that glob. This pass did not capture a live network trace of Generuj or Drukuj.

### Test-plan hook

- Risk 5’s failure mode includes a profile, last parameters, or the parent’s own image leaving the device (`context/foundation/test-plan.md:43`).
- The response row says not to write that test before S-05, S-06, or US-02 exists (`context/foundation/test-plan.md:55`). S-05 and S-06 are in Done (`context/foundation/roadmap.md:186-187`). The local-data handbook is still “TBD — patrz §3 Faza 3” (`context/foundation/test-plan.md:121-122`). Phase 3’s status in that table is `change opened` for `testing-local-data` (`context/foundation/test-plan.md:67`).
- The “poza budżetem” line still says not to test the profile, last parameters, and the own image before S-05, S-06, or US-02 exist (`context/foundation/test-plan.md:134`). US-02 has no implementation in the `src/` files opened here.

## Code References

- `src/lib/sheet/character.ts:1-24` — catalog rows and `characterSheetSrc`
- `src/lib/last-used.ts:18-42` — last-used read collapses a non-allow-listed character; the write does not check the list
- `src/lib/child-profiles.ts:58-91` — profile write without an allow-list; `withFavorite` refuses a character outside `allowed`
- `src/lib/child-profiles.ts:203-206` — a profile row with a non-allow-listed character is dropped on read
- `src/components/WorksheetGenerator.tsx:64-108` — generate and print in the island
- `src/components/WorksheetGenerator.tsx:339-382` — mark versus the word Start
- `src/lib/sheet/layout.ts:67-99` — mark box and the character-level shift
- `src/lib/maze/levels.ts:23-84` — `showCharacter` on the six level entries
- `src/lib/maze/generate.ts:22-32` — generator parameters and return value
- `src/components/GeneratorShell.astro:46-48` — `@page` size A4, margin 0
- `src/components/GeneratorShell.astro:106-112` — print rule for `#worksheet-home svg`
- `public/characters/` — 11 png files, names matching the catalog ids, listed 2026-10-23

## Architecture Insights

On the visit path in `readVisitStart`, the character that comes back is a string checked against `CHARACTER_CHOICES`, then mapped to a catalog id (`WorksheetGenerator.tsx:404-418`). The pixels are a separate static URL, resolved at draw time by `characterSheetSrc` (`character.ts:18-24`). `generateMaze` returns width, height, and cells (`generate.ts:32`). `MazeSheet` looks up the image while rendering (`WorksheetGenerator.tsx:339-370`). Putting a non-catalog string into `ChildProfile.character` or last-used `character` collides with those reads: `readLastUsed` returns `"none"` for a character outside `allowed`, and `readChildProfiles` omits that profile row (`last-used.ts:26-29`, `child-profiles.ts:203-206`).

On `/labirynt`, the preview and the print target are the same `MazeSheet` SVG. Print scales that SVG (`WorksheetGenerator.tsx:360-364`, `GeneratorShell.astro:106-112`). US-02 places the image on the card (`prd.md:75`). That story does not describe a second asset used for print.

## Historical Context (from prior changes)

- `context/archive/2026-10-04-maze-character-choice/research.md:89-99` — supported as a product reading, which that section itself labels as not a legal opinion. The conclusion that a browser-only file is not received by the operator matches US-02’s acceptance text now at `prd.md:75-81`. The citation `prd.md:102` for “profile data stays on the device” is contradicted as a line number: line 102 is now a US-04 acceptance line. The profile and last-used rule is `prd.md:236-237`. The claim that this photo is not that profile rule still holds, because `prd.md:236-237` still does not name the photo.
- `context/archive/2026-10-04-maze-character-choice/research.md:99` — partial. It says `handleGenerate` calls `generateMaze` in the browser and `window.print` does not by itself send the image, and that print of an SVG image using a `blob:` URL was not tested. The current handlers are still local (`WorksheetGenerator.tsx:64-76` and `:106-108`). The line numbers in that archive paragraph (`WorksheetGenerator.tsx:37-41` and `:44-46`) do not match this commit. This pass also did not test a `blob:` or `data:` href. A search of `context/**/*.md` for `data URL` and `data:image` matches this research document and no other file. The archive sentence uses `blob:` and does not use `data:`.
- `context/archive/2026-10-04-maze-character-choice/research.md:103` — supported on the parking fact: the parent file is US-02 and was parked outside the MVP. The open question in that paragraph about which supplied files ship was later closed for the catalog (S-08, `roadmap.md:189`), not for a parent file.
- `context/archive/2026-10-07-profile-form-open-list/frame.md` was read by the prior-decision pass, not re-opened line by line here. That pass reported the frame leaves the parent file on `parent-supplied-maze-image` and does not add it to the profile form. Treat that as the other pass’s reading of the frame, not a line-checked quote in this file.
- `context/archive/2026-10-11-full-character-catalog/plan.md` was not re-opened in this write-up. The current catalog in `character.ts:1-16` is the eleven png ids plus `none`, which matches FR-012 (`prd.md:213`).

## Related Research

- `context/archive/2026-10-04-maze-character-choice/research.md` — supplied-character mark, and the follow-up on a parent file that stays in the browser
- `context/archive/2026-10-11-maze-difficulty-levels/research.md` — earlier mark-position notes for the catalog character; not re-measured here

## Open Questions

User decisions on 2026-10-23 are in `change.md` under „Ustalenia”. They close questions 2–7 below. Question 1 and the print check stay open.

1. The roadmap still parks US-02 (`roadmap.md:149`). Unparking is a roadmap edit. This change folder is `preparing`.
2. Settled: JPEG, PNG, and WebP. A file over 8 MB is rejected before decode. The stored copy’s long side is 512 px. This pass did not measure `localStorage` quota.
3. Settled: the resized copy survives a later visit. The original file does not.
4. Settled: the image appears on the sheet immediately. It enters a profile only on explicit save. With no active profile it is stored like last-used. The bytes do not go in `character`.
5. Settled: the teen sheet does not draw it, matching `showCharacter: false` (`levels.ts:74-82`). Issue #54 stays a separate question. The character bar on that level stays active, as it does for the catalog.
6. Settled: the control is a row in the character dialog, in the same places as the catalog.
7. Settled: the sheet box stays 30 by 30 (`WorksheetGenerator.tsx:19`). The whole image fits inside that square.
8. Still open as a check, not a product choice: whether an SVG `<image href>` that is not a `/characters/*.png` path prints on the browsers in US-04. The decision is to embed the resized copy, not a `blob:` URL (`change.md`). This pass did not print one.
