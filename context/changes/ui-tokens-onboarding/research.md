---
date: 2026-10-03T21:29:02+02:00
researcher: drpc1
git_commit: 639a8ebeb4c4179b21fa93917aa96efe6a288157
branch: main
repository: printo-kids
topic: "Where UI tokens live, who reads them, and what constrains onboarding a view onto them"
tags: [research, codebase, tailwind, shadcn, tokens, worksheet]
status: complete
last_updated: 2026-10-03
last_updated_by: drpc1
---

# Research: Where UI tokens live, who reads them, and what constrains onboarding a view onto them

**Date**: 2026-10-03T21:29:02+02:00
**Researcher**: drpc1
**Git Commit**: 639a8ebeb4c4179b21fa93917aa96efe6a288157
**Branch**: main
**Repository**: printo-kids

## Research Question

How are UI design tokens defined and consumed in this repo today, which prior decisions constrain them, and what does an agent need in order to onboard a view onto tokens instead of one-off colors?

## Summary

On `main` at `639a8ebeb4c4179b21fa93917aa96efe6a288157`, a workspace glob for `*.css` returned one file: `src/styles/global.css`. In that file, `:root` (lines 6–39) declares 32 custom properties, `.dark` (lines 41–73) redeclares 31 of those names and does not redeclare `--radius`, and `@theme inline` (lines 75–111) publishes 35 names. Those names are the shadcn neutral set (`components.json` sets `baseColor` to `neutral`). The same file does not declare `--pk-paper`, `--pk-ink`, or `--pk-sage`, and it does not contain `#F6F1E8`, `#3F3A34`, `#5B554C`, or `#7D8B74`.

The product page assigns those three `--pk-*` colors as hex literals on `<main>` in `src/components/WorksheetHome.astro:8`. The sentence under the heading uses a fourth color, `text-[#5B554C]`, at `WorksheetHome.astro:13`, which is not one of the three custom properties. The maze sheet uses a fifth literal, `fill="#fff"`, at `src/components/WorksheetGenerator.tsx:87`.

`AGENTS.md:36` tells the next agent that a new color is a new token in `src/styles/global.css`, and that a literal is not allowed. Archived slice S-01 required the three `--pk-*` values to stay on `main`, not in `:root` (`context/archive/2026-09-28-first-printable-maze/plan.md:123`). Slice S-02 listed moving product colors into global tokens as out of scope for that slice (`context/archive/2026-09-29-print-a4-maze/plan.md:35`). `context/changes/style-class-audit/research.md:268` leaves the promotion into `:root` / `@theme inline` as a decision for the next UI change. That decision is still open.

`@page` is in `WorksheetHome.astro:20-23`. A full read of `global.css` (lines 1–125) found no `@page` and no `@media print`. S-02 requires that `@page` stay off `global.css` (`print-a4-maze/plan.md:46`).

## Detailed Findings

### Token file

`src/layouts/Layout.astro:2` imports `src/styles/global.css`. `components.json:6-10` points Tailwind `css` at that path, with `cssVariables: true` and an empty `tailwind.config` string. A workspace glob for `tailwind.config.*` returned no files.

Counted from `:root` in the file that was read: `--radius` (line 7), 18 color roles from `--background` through `--ring` (lines 8–25), five `--chart-*` properties (lines 26–30), and eight `--sidebar*` properties (lines 31–38). That is 32 custom properties. `.dark` repeats the color names and not `--radius`. `@theme inline` maps four radius steps (`--radius-sm` through `--radius-xl`, lines 76–79) and 31 `--color-*` bridges (lines 80–110) onto those variables. This inspected file defines no font-family and no spacing custom properties.

`@utility bg-cosmic` (lines 113–115) is a gradient of `#0a0e1a` and `#0f1529`. It is not a custom property. `@layer base` (lines 117–124) applies `border-border` on `*` and `bg-background text-foreground` on `body`.

A search of `src` for `class="dark"`, `className="dark"`, and `class='dark'` returned no matches. That search does not cover other ways of adding the class.

### Who reads the shadcn color utilities

A search of `src` for `bg-primary`, `text-primary`, `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-secondary`, `bg-destructive`, `bg-accent`, and `border-border` hit two files: `src/styles/global.css:119` and `:122`, and `src/components/ui/button.tsx:12-19`. `button.tsx:14` also uses `text-white` on the destructive variant. `button.tsx:8` uses `ring-[3px]`.

`src/components/ui/` contains two files: `button.tsx` and `LibBadge.astro`. A content search of `src` for the string `LibBadge` returned no matches, so no inspected source file imports it. `LibBadge.astro:10-12` uses `bg-blue-900/50`, `text-blue-200`, `bg-purple-500/30`, and `text-purple-200`.

A search of `src` for `from "@/components/ui/button"` and the single-quote form found one file: `src/components/auth/SubmitButton.tsx:3`. That file passes `bg-purple-600`, `text-white`, and `hover:bg-purple-500` on the `Button` at line 18, which overrides the default variant classes.

`src/pages/auth/signin.astro:9-18` uses `bg-cosmic`, `border-white/10`, `bg-white/10`, `text-white`, `from-blue-200`, `to-purple-200`, `text-blue-100/60`, and `text-purple-300`. The same `bg-cosmic` class is on `src/pages/auth/signup.astro:9`, `src/pages/auth/confirm-email.astro:22`, and `src/pages/dashboard.astro:8`. Those four pages were not re-read line by line beyond the sign-in page and those four `bg-cosmic` hits.

`src/components/Banner.astro:28-40` sets nine hex colors for info, warning, and error. They are not custom properties in `global.css`.

### Product page colors

`src/pages/index.astro:5-7` renders `WorksheetHome` inside `Layout` and sets no color class of its own.

`WorksheetHome.astro:8` sets `--pk-paper: #F6F1E8`, `--pk-ink: #3F3A34`, and `--pk-sage: #7D8B74` on `<main id="worksheet-home">`. Line 7 consumes `--pk-paper` and `--pk-ink`. Line 13 sets the purpose sentence to `text-[#5B554C]`.

`WorksheetGenerator.tsx` does not import `Button`. Lines 52 and 56 are native `<button type="button">` elements with `SAGE_PILL` (line 19), which uses `bg-[var(--pk-sage)]` and `text-[var(--pk-paper)]`. The sheet ring and maze strokes use `var(--pk-ink)` (lines 82, 91, 102, 110). The page rectangle is `fill="#fff"` (line 87), which is not `--pk-paper`.

A content search of `src` for `#9FAD95` returned no matches. The F-01 review describes a muted sage `#9FAD95` on the then-disabled control (`context/archive/2026-09-28-worksheet-page-shell/reviews/impl-review.md:34`). That hex is not in the current `src` tree this search covered.

Print rules for this page are the unscoped `<style>` in `WorksheetHome.astro:19-46`, including `@page { size: A4; margin: 0 }` at lines 20–23.

### Agent rules

`AGENTS.md:35-37` names `src/styles/global.css` (`:root`, `.dark`, `@theme inline`) as the token file and says a new color is a new token, not a literal. It also says to check `src/components/ui` before adding a component, and to add a missing one from the shadcn registry. `CLAUDE.md:37-38` says to merge classes with `cn()` and to install shadcn components into `src/components/ui`. In the files inspected (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/10x-course.mdc`), no rule tells an agent to use arbitrary color values or to skip the token file. `.windsurfrules` and `copilot-instructions.md` are absent. `context/foundation/lessons.md` is absent.

The current product literals at `WorksheetHome.astro:8` and `:13` are the kind of color literal `AGENTS.md:36` tells a later change not to add. The rule does not, by itself, say to restyle `/auth/signin`.

## Code References

- `src/styles/global.css:6-39` — `:root` shadcn custom properties, including `--radius`
- `src/styles/global.css:41-73` — `.dark` overrides, no `--radius`
- `src/styles/global.css:75-111` — `@theme inline` radius and `--color-*` bridges
- `src/styles/global.css:113-115` — `bg-cosmic` hex gradient
- `src/styles/global.css:117-124` — base `border-border`, `bg-background`, `text-foreground`
- `src/layouts/Layout.astro:2` — stylesheet import
- `components.json:6-10` — css path, empty Tailwind config, `baseColor: neutral`
- `src/components/WorksheetHome.astro:7-13` — local `--pk-*` assignment and `text-[#5B554C]`
- `src/components/WorksheetHome.astro:19-46` — `@page` and print chrome hiding
- `src/components/WorksheetGenerator.tsx:19` — sage pill using `--pk-sage` and `--pk-paper`
- `src/components/WorksheetGenerator.tsx:52` — native Generuj button
- `src/components/WorksheetGenerator.tsx:87` — sheet `fill="#fff"`
- `src/components/ui/button.tsx:12-19` — semantic variant classes, plus `text-white` on destructive
- `src/components/auth/SubmitButton.tsx:15-18` — shadcn `Button` overridden with `bg-purple-600`
- `src/pages/auth/signin.astro:9-18` — cosmic panel and palette classes
- `src/components/Banner.astro:28-40` — banner hexes
- `src/components/ui/LibBadge.astro:10-12` — palette classes; no `LibBadge` string elsewhere under `src`
- `AGENTS.md:36` — new color is a token, not a literal

## Architecture Insights

Two color sources are in use on this commit. In the semantic-utility search above, `body` (`global.css:122`) and `button.tsx` are the files that matched. The worksheet reads `--pk-*` properties assigned on `#worksheet-home` (`WorksheetHome.astro:8`); a search of `src` for `--pk-` hit that file and `WorksheetGenerator.tsx`. Two further hexes are not those properties: `#5B554C` on the sentence and `#fff` on the sheet. The sign-in page, and the three other `bg-cosmic` hits named above, use that utility rather than `bg-background`. Generuj (`WorksheetGenerator.tsx:52-53`) and Drukuj (`WorksheetGenerator.tsx:56-57`) are native buttons, not `Button` from `src/components/ui`.

An agent following `AGENTS.md:36` on the worksheet would put a new product color in `global.css`. An agent following the archived S-01 contract would put `--pk-paper`, `--pk-ink`, and `--pk-sage` on `main`. Both documents are still in the tree. Promoting the product colors is the open choice; putting `@page` into `global.css` is not, under the S-02 rule that is still matched by the current home stylesheet.

## Historical Context (from prior changes)

- `context/archive/2026-09-28-worksheet-page-shell/reviews/impl-review.md:37-42` — paper, charcoal, and paragraph `#5B554C` lived in one component; global shadcn tokens were left alone; S-01 / S-02 were asked to reuse one source. **Supported** for the current tree on the three hexes and the paragraph: `WorksheetHome.astro:8` and `:13`, and a full read of `global.css` that does not contain those hexes. **Partial** on “one source”: the three named colors are one `style` attribute, and `#5B554C` is still a separate class.
- `context/archive/2026-09-28-worksheet-page-shell/reviews/impl-review.md:34` — the disabled control used `#9FAD95`. **Not in current `src`:** a content search for `#9FAD95` returned no matches. The enabled sage in the current style attribute is `#7D8B74` (`WorksheetHome.astro:8`).
- `context/archive/2026-09-28-first-printable-maze/plan.md:123` — define `--pk-paper`, `--pk-ink`, and `--pk-sage` on `main`, not in `:root`. **Supported** by `WorksheetHome.astro:8` and the absence of those names from the read of `global.css`. The copy of this plan previously cited at `context/changes/first-printable-maze/plan.md` is not the current path; the change is archived.
- `context/archive/2026-09-29-print-a4-maze/plan.md:35` — for that slice, do not move product colors into global tokens and do not replace Generuj with a shadcn button. **Supported** as a slice constraint that the current code still matches: colors are on `main`, and Generuj is a native button at `WorksheetGenerator.tsx:52`. This line is not a later ban written into `AGENTS.md`.
- `context/archive/2026-09-29-print-a4-maze/plan.md:46` — `@page` stays on the home worksheet; `global.css` must not gain `@page`. **Supported** by `WorksheetHome.astro:20-23` and the full read of `global.css`.
- `context/changes/style-class-audit/research.md:258` — says `print-a4-maze` has no plan, so the “one source” check for S-02 was not done. **Contradicted** for that sentence: `context/archive/2026-09-29-print-a4-maze/plan.md` exists and was read at the lines above. The neighboring claim that `#5B554C` is still a separate class remains supported.
- `context/changes/style-class-audit/research.md:268` — whether the four product colors enter `:root` / `@theme inline` is the next UI change’s decision. **Still open.** This change has not recorded a decision.

## Related Research

- `context/changes/style-class-audit/research.md` — token inventory and the two-source color split, written 2026-10-01 against commit `6d5da6dd28ced195bcdbafed2e5562774916f540`. Its `research.md` frontmatter says `status: complete`. Its `change.md` frontmatter says `status: preparing` (`context/changes/style-class-audit/change.md:4`).

## Open Questions

- Whether `--pk-paper`, `--pk-ink`, `--pk-sage`, and `#5B554C` move into `:root` / `@theme inline`, stay on `#worksheet-home`, or gain names without entering the shadcn palette. `style-class-audit` left this open. `AGENTS.md:36` and the S-01 contract point at different files.
- Whether the sheet `fill="#fff"` (`WorksheetGenerator.tsx:87`) is a token separate from `--pk-paper`. No inspected plan gives it a custom-property name.
- Whether auth palette classes, `Banner.astro` hexes, and `LibBadge.astro` are in scope. Prior product slices left the cosmic auth screens unchanged. This research does not choose that scope.
