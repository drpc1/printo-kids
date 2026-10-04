---
date: 2026-10-04T12:01:07+02:00
researcher: unknown
git_commit: 3ffee0f47440
branch: main
repository: printo-kids
topic: "Audit the worksheet at / (WorksheetHome and WorksheetGenerator) against src/styles/global.css"
tags: [research, codebase, worksheet-ui, design-tokens, WorksheetHome, WorksheetGenerator]
status: complete
last_updated: 2026-10-04
last_updated_by: unknown
---

# Research: Audit the worksheet at / against design tokens

**Date**: 2026-10-04T12:01:07+02:00
**Researcher**: unknown
**Git Commit**: 3ffee0f47440 (`git rev-parse --short=12 HEAD` on `main`)
**Branch**: main
**Repository**: printo-kids

## Research Question

Audit the worksheet at `/` (`WorksheetHome` and `WorksheetGenerator`). Token source: `src/styles/global.css`.

## Summary

On commit `3ffee0f47440`, the worksheet at `/` already reads the existing tweakcn role tokens in `src/styles/global.css`. The contract variant for this change is an existing design system: values live in `:root` / `.dark` and are published by `@theme inline` (`global.css:6-172`), and the shared catalog is the single shadcn `Button` in `src/components/ui/button.tsx`.

The hardcoded-value scan from the UI audit, run on `src/components/WorksheetHome.astro` and `src/components/WorksheetGenerator.tsx` only, returned 0 matches. Those two files contain no hex, `rgb`/`hsl`/`oklch`, Tailwind palette color class, or `-[number]px` / `-[number]rem` arbitrary value. Layout arbitrary values that the scan does not match remain on the sheet: `aspect-[210/297]`, `print:h-[297mm]`, `print:w-[210mm]`, and `ring-[var(--foreground)]` (`WorksheetGenerator.tsx:91`).

Five charges are below. Three of them (pill geometry, Start/Meta font stack, unused tweakcn roles) conflict with decisions the completed `ui-tokens-onboarding` plan locked. The open charge is the island rewriting `#worksheet-home` alignment classes. The state-matrix charge is a silent `countPaths` miss that this research did not execute.

## Charges

### 1. Missing tokens — pill geometry ignores `--radius` and the Button size scale

`WorksheetGenerator.tsx:55` and `WorksheetGenerator.tsx:64` pass `h-auto rounded-full px-12 py-3.5 text-lg` into `Button`. The shared control's base is `rounded-md text-sm` and its default size is `h-9 px-4 py-2` (`button.tsx:8`, `button.tsx:22`). `cn()` lets the worksheet classes win (`button.tsx:47`).

Effect on the user: Generuj and Drukuj stay fully round and larger than the Button scale. Changing `--radius` (`global.css:42`) does not change those two controls.

Historical lock, supported: the completed ui-tokens plan requires that `className` to stay (`context/changes/ui-tokens-onboarding/plan.md:45`, `plan.md:134`). A plan that removes it reverses that contract.

### 2. Missing tokens — Start and Meta use a literal font stack

`WorksheetGenerator.tsx:101` and `WorksheetGenerator.tsx:112` set `fontFamily="ui-sans-serif, system-ui, sans-serif"`. The theme names the sans stack as `Inter, system-ui, sans-serif` (`global.css:39`). In `src/**/*.{astro,tsx,css}`, the string `font-sans` appears only on those `global.css` lines (39, 94, 148), not as a utility on a view. `Layout.astro:17-21` has no font stylesheet link.

Effect on the user: Start and Meta do not follow `--font-sans`. This research did not measure the computed heading font in a browser. A visible mismatch needs a local Inter face, because this layout does not load one.

Historical lock, supported: ui-tokens forbids loading Inter or Lora and forbids changing that `fontFamily` (`plan.md:41`). `AGENTS.md:39` repeats the font rule.

### 3. Accidental architecture — generate rewrites the shell alignment

When `maze` is non-null, `WorksheetGenerator.tsx:29-30` removes `justify-center` and adds `justify-start` on the element `#worksheet-home`. The null branch does the reverse (`WorksheetGenerator.tsx:32-33`). The classes start on `WorksheetHome.astro:7`.

Effect on the user: after Generuj, the page leaves vertical centering only while those two class names remain on that `main`. A shell edit that drops them leaves the A4 sheet vertically centered in the viewport.

This mechanism is not in the ui-tokens "not doing" list (`plan.md:35-47`). Open for the plan.

### 4. States — a failed single-path check has no error, and the buttons have no disabled or loading presentation

`handleGenerate` calls `generateMaze` and calls `setMaze` only when `countPaths(next) === 1` (`WorksheetGenerator.tsx:37-41`). Any other count leaves the previous `maze` value and renders no message. `Button` already has `disabled:opacity-50` and `focus-visible:ring-ring/50` (`button.tsx:8`), and the default variant has `hover:bg-primary/90` (`button.tsx:12`). The worksheet buttons do not pass `disabled` (`WorksheetGenerator.tsx:51-67`). The handler is synchronous: this file has no pending flag.

Effect on the user: if that check fails, Generuj changes nothing and explains nothing. There is no disabled or waiting appearance on the click that this handler implements.

Reachability was not executed. `generateMaze` opens a passage only when `union` connects two different cells (`generate.ts:33-38`), which is the Kruskal step in this file, then opens the entrance and exit (`generate.ts:41-42`). The ui-tokens plan declined a new error message for this reason (`plan.md:43`, `plan.md:134`). Treat the error cell as N/A unless a run shows `countPaths` returning a value other than 1.

### 5. Source → views — popover, sidebar, and chart roles have no view consumer in `src`

`@theme inline` publishes `popover`, `popover-foreground`, `sidebar*`, and `chart-1` through `chart-5` (`global.css:119-146`). A grep of `src` for utility prefixes `bg|text|border|ring|fill|stroke|from|via|to` joined to `popover`, `sidebar`, `chart-1`…`chart-5`, or `secondary` matched one line: the unused `secondary` variant string in `button.tsx:17`. A separate grep of `src` for `variant="secondary"`, `variant="destructive"`, `variant="ghost"`, and `variant="link"` matched nothing. `secondary` still has that one source string; this research did not search for a non-literal `variant={...}` expression.

Effect on the user at `/`: none from these roles. The risk is a later view inventing a color because the names look unused, or a cleanup that edits the tweakcn block.

Historical lock, supported: ui-tokens forbids hand-editing `:root`, `.dark`, and `@theme inline` (`plan.md:37`). Defer unless this change explicitly reverses that rule.

## Detailed Findings

### Route `/`

`src/pages/index.astro:5-7` renders `WorksheetHome` inside `Layout` with `showConfigBanner={false}` and `lang="pl"`. In `src/middleware.ts:4`, `PROTECTED_ROUTES` is the array `["/dashboard"]`. The redirect at `middleware.ts:18-21` runs when the pathname starts with one of those entries and `locals.user` is missing. `/` is not an entry in that array, so this middleware does not redirect an anonymous visit away from the worksheet.

Before a maze exists, `maze` is `null` (`WorksheetGenerator.tsx:21`). The sheet is not rendered (`WorksheetGenerator.tsx:70`). Drukuj is not rendered (`WorksheetGenerator.tsx:59`). The visible empty screen is the heading, the sentence, and Generuj (`WorksheetHome.astro:10-16`).

### Tokens the worksheet reads

On these two files, the role utilities and variables in use are:

- `bg-background`, `text-foreground` (`WorksheetHome.astro:7`)
- `text-muted-foreground` (`WorksheetHome.astro:12`)
- `fill="var(--card)"` (`WorksheetGenerator.tsx:96`)
- `fill="var(--foreground)"` (`WorksheetGenerator.tsx:100`, `WorksheetGenerator.tsx:111`)
- `stroke="var(--foreground)"` (`WorksheetGenerator.tsx:119`)
- `ring-[var(--foreground)]` (`WorksheetGenerator.tsx:91`)
- primary, primary-foreground, and the hover/focus ring, via `Button` `variant="default"` (`WorksheetGenerator.tsx:53`, `button.tsx:12`, `button.tsx:8`)

`@page { size: A4; margin: 0 }` is in `WorksheetHome.astro:21-24`, not in `global.css`. Print CSS in that same style block hides `h1`, `p`, and `button` (`WorksheetHome.astro:41-44`).

### Shared components

`src/components/ui/` contains `button.tsx` only. `components.json` sets style `new-york` and `cssVariables: true`. `WorksheetGenerator.tsx:2` imports `Button`. This view does not build a second button, card, or field from raw elements. Auth fields live under `src/components/auth/`, outside the catalog; they are not part of `/`.

Other `Button` imports found in `src`: `src/components/auth/SubmitButton.tsx` and `src/pages/dashboard.astro`. `SubmitButton` adds `w-full rounded-lg`, which is outside this view.

### Hardcoded-value scan

Command pattern, on the two worksheet files only:

`#[0-9a-fA-F]{3,8}`, `rgb(`, `hsl(`, `oklch(`, `-[[0-9.]+(px|rem)]`, and Tailwind palette color utilities (`bg-blue-900` and the rest of that palette list).

Result: 0 matches. `global.css` was not scanned; its tweakcn hexes and `oklch` values are the token source (`global.css:48` is one hex, inside the shadow block).

### 7-state matrix for Generuj, Drukuj, and the maze SVG

| State | Generuj | Drukuj | Maze SVG |
| --- | --- | --- | --- |
| default | Shown. `Button` default variant plus the pill classes (`WorksheetGenerator.tsx:51-57`). | Shown only when `maze !== null` (`WorksheetGenerator.tsx:59-68`). | Shown only when `maze !== null` (`WorksheetGenerator.tsx:70`). |
| hover | Shown via `hover:bg-primary/90` (`button.tsx:12`). | Same shared class when the button is mounted. | No hover rule on the SVG (`WorksheetGenerator.tsx:88-124`). |
| focus-visible | Shown via `focus-visible:ring-ring/50` and `ring-[3px]` (`button.tsx:8`). | Same when mounted. | `role="img"` (`WorksheetGenerator.tsx:93`). Not a focusable control in this markup. |
| disabled | Styles exist on `Button` (`button.tsx:8`). This view does not pass `disabled`. | Same. | Not applicable to this SVG. |
| error | No message in `handleGenerate` (`WorksheetGenerator.tsx:37-41`). | Not rendered for a failed first generate, because `maze` stays null. | Same. |
| empty | The control is rendered when the island mounts. | Not rendered when `maze === null` (`WorksheetGenerator.tsx:59`). | Not rendered when `maze === null` (`WorksheetGenerator.tsx:70`). The page still shows the heading and sentence. |
| loading | No pending state in this handler. | None. | None. |

### Agent rules

`AGENTS.md:35-40` tells pages to use the role utilities, forbids hex, `--pk-*`, `bg-cosmic`, and palette color classes on pages and components, allows non-color arbitrary layout values such as `print:h-[297mm]` and `ring-[3px]`, keeps `@page` in `WorksheetHome.astro`, and points new controls at `src/components/ui` via `npx shadcn@latest add`. That file does not invite one-off colors.

`.cursor/rules/` contains `10x-course.mdc` only. It routes UI work through the UI change flow. It does not add a color rule.

`CLAUDE.md` still describes the starter (`cn()`, shadcn new-york). It does not carry the hex ban. `AGENTS.md` is the rule the completed token change extended.

## Code References

- `src/pages/index.astro:5-7` — `/` renders `WorksheetHome` with the config banner off.
- `src/components/WorksheetHome.astro:7-16` — shell colors, heading, sentence, island.
- `src/components/WorksheetHome.astro:20-46` — `@page` and print hiding.
- `src/components/WorksheetGenerator.tsx:23-35` — classList toggle on `#worksheet-home`.
- `src/components/WorksheetGenerator.tsx:37-41` — generate guard with no error UI.
- `src/components/WorksheetGenerator.tsx:51-70` — Generuj, conditional Drukuj, conditional sheet.
- `src/components/WorksheetGenerator.tsx:88-124` — SVG sheet, labels, walls.
- `src/components/ui/button.tsx:7-32` — variants, sizes, focus, disabled.
- `src/styles/global.css:6-59` — `:root` role values.
- `src/styles/global.css:114-172` — `@theme inline` publishing.
- `src/styles/global.css:174-185` — `color-scheme: light` and body role utilities.
- `src/middleware.ts:4` — `PROTECTED_ROUTES` is `["/dashboard"]`.
- `src/lib/maze/generate.ts:27-44` — spanning-tree generator.
- `AGENTS.md:35-40` — UI contract for later agents.

## Architecture Insights

The screen is an Astro shell plus one React island (`client:load`). Color for the page and the sentence is Tailwind role classes. Color for the SVG is the same CSS variables, because presentation attributes cannot use `bg-card`. Interactive color, hover, and focus come from `Button`, then the island overrides size and radius.

`html` sets `color-scheme: light` (`global.css:175-177`). This research found no `class="dark"` in the worksheet files. The `.dark` block (`global.css:61-112`) still redefines `--card` to a dark brown. The ui-tokens plan treats "do not add `dark`" as the way the printed sheet stays the light `--card`.

Logged-out arrival is the product path: the PRD and `AGENTS.md:7` say the MVP has no accounts, and this middleware does not protect `/`.

## Historical Context (from prior changes)

Each claim is scored on its own.

- Supported now: `@page` stays on the worksheet component, not in `global.css`. Archive plan `context/archive/2026-09-29-print-a4-maze/plan.md` set that placement; `AGENTS.md:39` still says it. Current code matches (`WorksheetHome.astro:21-24`).
- Supported as a completed migration, stale as a description of today's source: ui-tokens `plan.md:15` says the worksheet still uses `--pk-*` and native buttons. That sentence is the plan's "before" snapshot. `plan.md:134` is the "after" contract, and the current worksheet files match that later contract (role variables, `Button`, pill classes, `ui-sans-serif`).
- Supported and still binding unless this change reverses it: do not hand-edit the tweakcn block (`plan.md:37`); do not load Inter/Lora or change Start/Meta `fontFamily` (`plan.md:41`); do not add a Generuj error (`plan.md:43`); do not change pill classes (`plan.md:45`, `plan.md:134`).
- Superseded: archive instructions to keep `--pk-*` on `main` and to keep a native Generuj button. The later ui-tokens plan removed those. Current worksheet files have no `--pk-*`.
- Not a worksheet contract: `context/changes/remove-starter-scaffold/change.md` has empty Notes and status `new`. `context/changes/style-class-audit/research.md` describes the pre-token inventory; ui-tokens `plan.md:13` already calls that picture stale for `global.css`.

## Related Research

- `context/changes/ui-tokens-onboarding/research.md` — token inventory before the worksheet was moved onto role utilities.
- `context/changes/style-class-audit/research.md` — earlier class-literal inventory. Stale for colors on `/` after ui-tokens.

## Open Questions

- Whether `countPaths(generateMaze(...))` can return a value other than 1 was not executed. Charge 4's error cell stays N/A until a run shows another count.
- The computed font of the `h1` versus the SVG `fontFamily` was not measured in a browser.
- Contrast of `--primary` on `--primary-foreground` was not measured.
- No `facts.json` was requested. The prose/JSON checker does not apply.
