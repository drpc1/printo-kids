# UI tokens onboarding Implementation Plan

## Overview

Point every visible screen at the tweakcn theme already pasted in `src/styles/global.css`, and remove the starter palette (cosmic gradient, purple, blue, white-glass, and the worksheet's local hexes). The theme values stay as pasted. Login and dashboard routes stay; deleting them belongs to `remove-starter-scaffold`.

## Current State Analysis

`src/styles/global.css` is the token file. `:root` (lines 6–59), `.dark` (lines 61–112), and `@theme inline` (lines 114–172) are a tweakcn OKLCH export: warm `--background`, brown `--foreground`, sage `--primary`, muted foreground, white `--card` (`oklch(1 0 0)` at line 9), plus font names, shadows, and tracking. `.dark` redefines `--card` to a dark brown (line 64). The file also has `@utility bg-cosmic` (lines 174–176), a navy gradient. It has no `@page` and no `color-scheme`. `--font-sans` and `--font-serif` name Inter and Lora (lines 39–40 and 94–95). Nothing loads those font files.

`@custom-variant dark (&:is(.dark *))` ties dark utilities to the class `dark`. A search of `src` found no `prefers-color-scheme`, no `color-scheme`, and no element with that class. Browser dark mode does not switch these tokens.

`research.md` was written at commit `639a8eb` against the previous neutral shadcn set. It is stale on this file. Do not restore that neutral set.

The worksheet does not read the theme. `WorksheetHome.astro:8` sets `--pk-paper: #F6F1E8`, `--pk-ink: #3F3A34`, and `--pk-sage: #7D8B74` on `<main>`. The sentence is `text-[#5B554C]` (line 13). `@page` is in that file (lines 20–23) and must stay there. `WorksheetGenerator.tsx` paints pills with `--pk-sage` / `--pk-paper` (line 19), the sheet ring and maze stroke with `--pk-ink`, and the page rectangle with `fill="#fff"` (line 87). Generuj and Drukuj are native `<button>` elements (lines 52–57). Start and Meta use `ui-sans-serif` (lines 92 and 103). Drukuj renders only after a maze exists. `generateMaze` builds a spanning tree, so `countPaths` on its result is 1; the click guard does not show an error.

`/` sets `showConfigBanner={false}` (`src/pages/index.astro:5`). Auth and dashboard still use `bg-cosmic`, glass panels, and blue/purple text: `signin.astro`, `signup.astro`, `confirm-email.astro`, `dashboard.astro`. Form controls override the shared button and use palette classes: `SubmitButton.tsx:18`, `FormField.tsx`, `PasswordToggle.tsx`, `SignUpForm.tsx:59`, `ServerError.tsx`. `Banner.astro:28-40` uses nine hexes; only the error variant is rendered, from `Layout.astro` when the config banner is on. `button.tsx:14` uses `text-white` on the destructive variant. `LibBadge.astro` uses blue/purple classes and has no imports under `src`. Sign out on the dashboard is a native button (lines 18–23).

`AGENTS.md` (UI, lines 35–37) already says a new color is a token in `global.css`, not a literal. It does not yet forbid the starter palette classes.

## Desired End State

A parent opening `/` sees the warm tweakcn background, foreground text, a quieter sentence, and the same large sage pills. After Generuj, the maze sits on a white sheet (`--card`) with dark walls, and the page around the sheet stays warm. Print is still one A4 page with the buttons hidden. Browser dark mode does not turn the sheet brown.

Sign-in, sign-up, confirm-email, and the dashboard use the same theme: paper page, card panel, primary actions, destructive errors. No cosmic gradient and no purple or blue palette classes remain on a screen. The routes still exist.

### Key Discoveries:

- Light `--card` is pure white (`global.css:9`). `--background` is the warm paper, not white. There is no tweakcn token that stays white in both `:root` and `.dark`.
- `className` on shadcn `Button` is merged with `cn()`, so a `bg-*` or `text-*` override replaces the default variant. `SubmitButton.tsx:18` does that today with `bg-purple-600`.
- `@page` must stay in `WorksheetHome.astro`. S-02 forbids moving it into `global.css` (`context/archive/2026-09-29-print-a4-maze/plan.md`).
- `F-02` / `remove-starter-scaffold` is still `new` and is the change that deletes auth and the dashboard. This change only restyles them. `scripts/smoke.mjs` still walks the auth flow.
- Inter and Lora are names only. Loading them would change printed type and add a font dependency this change rejected.

## What We're NOT Doing

- Replacing, regenerating, or hand-editing the tweakcn values in `:root`, `.dark`, or `@theme inline`. Shadow hexes inside that export stay.
- Deleting `/auth/signin`, `/auth/signup`, `/auth/confirm-email`, `/dashboard`, or the auth API. That is `remove-starter-scaffold`.
- Adding a dark-mode toggle, putting `class="dark"` on any element, or deleting the `.dark` block.
- Adding a token that exists only to keep the sheet white under `.dark`.
- Loading Inter, Lora, or any other font file or Google Fonts link. Changing the Start/Meta `fontFamily` away from `ui-sans-serif`.
- A new ESLint rule, a new npm script, or a committed kitchen-sink route. The state matrix is checked on the real pages.
- A new error message when Generuj runs. The generator already returns one path.
- Converting sign-in or sign-up to a client action so the pending label stays on screen. Invalid fields already block submit; a valid submit is a full-page POST.
- Changing maze generation, grid size, `@page`, print hiding, or the pill dimensions (`h-auto`, `rounded-full`, `px-12`, `py-3.5`, `text-lg`).
- Restyling auth submit buttons into the worksheet pill. Sign out does not become that pill either.
- Adding info/warning/error colors that tweakcn did not export.

## Implementation Approach

Keep the pasted theme as the only color source. Add `color-scheme: light` on the document so a browser force-dark pass treats the app as light; that property does not turn on `.dark`. Move the worksheet off `--pk-*` and hex onto role utilities, and render Generuj and Drukuj with shadcn `Button` without color overrides. Then restyle the starter screens and shared chrome onto the same roles, and delete `bg-cosmic` and `LibBadge` only once nothing references them. Finish by extending the existing UI bullets in `AGENTS.md` and checking the state matrix on the real screens.

Screen role map, from the colors on the worksheet and the starter chrome:

- Page surface → `bg-background` and `text-foreground` (replaces `--pk-paper` and `--pk-ink`).
- Purpose sentence and secondary copy → `text-muted-foreground` (replaces `#5B554C` and the blue-glass hints).
- Primary actions → `Button` default variant (`bg-primary`, `text-primary-foreground`). Worksheet pills add only the size classes above.
- Maze rectangle → `--card` (replaces `fill="#fff"`). Maze stroke, labels, and the screen ring → `--foreground` (replaces `--pk-ink`).
- Form errors, server error, and the banner error variant → `destructive`.
- Banner info → `muted`. Banner warning → `accent`. Neither variant is rendered today; both still lose their hexes.
- Auth and dashboard panels → `bg-card`, `text-card-foreground`, `border-border`.
- Sign out → `Button` `outline`, default size, no palette classes.

## Critical Implementation Details

**Utility lifetime.** `@utility bg-cosmic` is still used by the four starter pages. Leave it in place through phases 1 and 2. Phase 3 deletes the utility in the same edit that removes the last `bg-cosmic` class, so a pause after phase 1 does not strip the sign-in background.

**White sheet.** The rectangle reads `--card` from `:root` (`oklch(1 0 0)`, `global.css:9`). `.dark` sets that same variable to a dark brown (`global.css:64`). This change must not add the class `dark`. `color-scheme: light` is the signal that stops browser force-darkening; it does not select the `.dark` block. Pill labels must not force `text-white`: `text-primary-foreground` is the theme's paper tone, which is the old pill text.

## Phase 1: Motyw zostaje źródłem

### Overview

Lock the pasted tweakcn block as the source of truth, tell the browser the document is light, and prove print CSS and the worksheet colors have not moved yet. `bg-cosmic` stays until phase 3.

### Changes Required:

#### 1. Document color scheme

**File**: `src/styles/global.css`

**Intent**: Tell browsers this document is light, without switching on the `.dark` token block and without changing any tweakcn value.

**Contract**: In `@layer base`, `html` sets `color-scheme: light`. `:root`, `.dark`, and `@theme inline` keep the pasted values, including light `--card: oklch(1 0 0)`, the dark `--card`, Inter/Lora names, and the shadow hexes. The file still has no `@page`. `@utility bg-cosmic` stays until phase 3.

#### 2. Print rule stays put

**File**: `src/components/WorksheetHome.astro`

**Intent**: Leave the A4 page rule on the worksheet while phase 1 touches global CSS.

**Contract**: The unscoped `@page { size: A4; margin: 0 }` block remains in this file. Phase 1 does not change the `--pk-*` style attribute or the sentence hex.

### Success Criteria:

#### Automated Verification:

- `npx astro check` passes
- `npm run lint` passes
- `src/styles/global.css` sets `color-scheme: light`, still contains light `--card: oklch(1 0 0)`, and still contains the `.dark` block
- `src/styles/global.css` contains no `@page`, and `src/components/WorksheetHome.astro` still contains `@page`

#### Manual Verification:

- `/` still shows the current worksheet, because this phase does not restyle it
- Loading `/` does not request a web font

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Kartka czyta tokeny

### Overview

The worksheet reads the theme. Local product hexes and `--pk-*` disappear. Generuj and Drukuj become the shared button at the current pill size. The sheet rectangle becomes white via `--card`.

### Changes Required:

#### 1. Page shell

**File**: `src/components/WorksheetHome.astro`

**Intent**: Drop the local palette so the page, heading, and sentence use the tweakcn roles.

**Contract**: Remove the `style` attribute that sets `--pk-paper`, `--pk-ink`, and `--pk-sage`. `<main>` uses `bg-background` and `text-foreground` instead of `bg-[var(--pk-paper)]` and `text-[var(--pk-ink)]`. The sentence uses `text-muted-foreground` instead of `text-[#5B554C]`. `@page` and the print-hiding rules stay. The heading does not gain `font-serif`.

#### 2. Pills and sheet

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Use the shared button for Generuj and Drukuj, and paint the sheet from tokens, keeping the current size and the white-on-warm layout.

**Contract**: Import `Button` from `@/components/ui/button`. Both controls use the default variant. Their `className` is only `h-auto rounded-full px-12 py-3.5 text-lg` — no `bg-*`, `text-*`, or `hover:*` color class, so `bg-primary`, `text-primary-foreground`, `hover:bg-primary/90`, and `focus-visible:ring-ring` come from `button.tsx`. `h-auto` is required so tailwind-merge drops the default size `h-9` (`button.tsx` size default). `shadow-xs` from the default variant stays. Delete `SAGE_PILL`. Drukuj still renders only when `maze !== null`, inside the existing `print:hidden` wrapper. The rect fill is the `--card` property, not `#fff`. The screen ring, maze stroke, and Start/Meta fill use `--foreground`, not `--pk-ink`. Start/Meta keep `fontFamily="ui-sans-serif, system-ui, sans-serif"`. The `countPaths` guard and `window.print()` stay; no error message is added.

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes
- `npx astro check` passes
- `WorksheetHome.astro` and `WorksheetGenerator.tsx` contain no `--pk-`, `#F6F1E8`, `#3F3A34`, `#7D8B74`, `#5B554C`, or `fill="#fff"`

#### Manual Verification:

- `/` uses the warm background, a quieter sentence, and the same large pills
- After Generuj, the sheet is white, the walls are dark, and the page around the sheet stays warm
- Print preview is one A4 page, with the buttons hidden and the sheet white
- Tabbing to Generuj shows the theme focus ring

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Reszta aplikacji schodzi ze startera

### Overview

Auth, the dashboard, form chrome, and the banner use the same roles. Starter palette classes and the cosmic utility leave the tree. The routes stay.

### Changes Required:

#### 1. Auth and dashboard pages

**File**: `src/pages/auth/signin.astro`, `src/pages/auth/signup.astro`, `src/pages/auth/confirm-email.astro`, `src/pages/dashboard.astro`

**Intent**: Replace the cosmic glass panels with the theme page and card, without removing the routes.

**Contract**: Each page uses `bg-background` on the screen and `bg-card text-card-foreground border-border` on the panel. Headings use foreground, not a blue-to-purple gradient. Links use `text-primary`. No `bg-cosmic`, `border-white/*`, `bg-white/*`, `text-white`, `text-blue-*`, or `text-purple-*`. Copy and form actions stay. Dashboard Sign out uses `Button` variant `outline` at the default size, not the worksheet pill and not a native button with palette classes.

#### 2. Form chrome

**File**: `src/components/auth/SubmitButton.tsx`, `src/components/auth/FormField.tsx`, `src/components/auth/PasswordToggle.tsx`, `src/components/auth/SignUpForm.tsx`, `src/components/auth/ServerError.tsx`

**Intent**: Stop overriding the shared button with purple, and draw fields, hints, and errors from theme roles.

**Contract**: `SubmitButton` keeps `type="submit"`, `disabled={pending}`, the pending label, and the spinner, but its `className` drops `bg-purple-600`, `text-white`, and `hover:bg-purple-500`. Width and radius may stay (`w-full rounded-lg`); color comes from the default variant. The spinner uses `primary-foreground` at partial opacity, not `border-white`. `FormField` uses `bg-background` or `bg-card`, `border-input`, `text-foreground`, `placeholder:text-muted-foreground`, and a visible `ring-ring` focus. It must not keep `focus:outline-none` as the only focus style. The error string stays next to the field and uses `text-destructive` and `border-destructive`, not `red-400` or `red-300`. Labels, icons, the password toggle, and the sign-up hint use `muted-foreground`. `ServerError` uses the destructive role for border, background, and text.

#### 3. Banner, destructive button, cosmic utility, unused badge

**File**: `src/components/Banner.astro`, `src/components/ui/button.tsx`, `src/styles/global.css`, `src/components/ui/LibBadge.astro`

**Intent**: Remove the remaining starter colors, including on components that are easy to miss because they are unused or only show when config is missing.

**Contract**: `Banner` drops every hex. Error uses `destructive`, info uses `muted`, warning uses `accent`. No new token names. `button.tsx` destructive text uses `text-destructive-foreground` instead of `text-white`. Existing `dark:` token utilities on `Button` stay. Delete `@utility bg-cosmic` only in this phase, together with the last call sites. Delete `LibBadge.astro`. Do not delete auth routes.

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes
- `npx astro check` passes
- `src/pages` and `src/components` contain no `bg-cosmic`, `purple-`, `blue-`, `red-`, or `white/`
- `src/styles/global.css` has no `@utility bg-cosmic`, and `src/components/ui/LibBadge.astro` is gone
- These routes still exist: `src/pages/auth/signin.astro`, `src/pages/auth/signup.astro`, `src/pages/auth/confirm-email.astro`, `src/pages/dashboard.astro`

#### Manual Verification:

- Sign-in, sign-up, and confirm-email use the warm theme. Dashboard does too, but only after a session; an anonymous visit redirects to sign-in
- A sign-in field error sits beside the field in the destructive role
- A pending submit is N/A to observe: invalid fields never submit, and a valid submit is a full-page POST. Keep the pending label and spinner, restyle them, and do not convert the form to a client action
- `/` still matches the phase 2 worksheet

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 4: Stany i reguła

### Overview

Record the state matrix on the real screens, including the cells this product does not have, and tell the next agent that screens use the tweakcn roles.

### Changes Required:

#### 1. Agent rule

**File**: `AGENTS.md`

**Intent**: Extend the existing UI bullets so the next change does not bring back hexes, `--pk-*`, or the starter palette.

**Contract**: Edit the `## UI` section in place. Do not add a second rules file and do not add an ESLint rule or npm script. The section states that screen colors are the role utilities from `src/styles/global.css` (`background`, `foreground`, `muted-foreground`, `primary`, `primary-foreground`, `card`, `destructive`, `border`, `ring`); that pages and components do not add hex colors, `--pk-*`, `bg-cosmic`, or Tailwind palette color classes; that `@page` stays in `WorksheetHome.astro`; that shared controls live in `src/components/ui` and missing ones come from `npx shadcn@latest add`; and that Inter and Lora stay names in the theme and are not loaded from a view. Arbitrary layout values such as `print:h-[297mm]` and `ring-[3px]` are not color literals and are not banned by this sentence. Hexes inside the tweakcn block in `global.css` stay legal.

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes
- The `AGENTS.md` UI section names the tweakcn roles and forbids hex and palette color classes on screens

#### Manual Verification:

- Worksheet default: `/` uses theme roles and shadcn `Button`, with no leftover product hex
- Worksheet hover: the pill visibly changes on hover via the primary token
- Worksheet focus-visible: Tab to Generuj and Drukuj shows the ring token, not the browser default
- Worksheet disabled: N/A, because Drukuj is omitted until a maze exists and Generuj is always enabled
- Worksheet error: N/A, because the generator returns one path and this change adds no error message
- Worksheet empty: before Generuj the page shows the heading, the sentence, and Generuj, and no sheet
- Worksheet loading: N/A, because generation is synchronous and the layout does not jump
- Auth focus-visible: Tab through sign-in fields shows the ring token
- Auth error: invalid submit shows the message beside the field in the destructive role
- Auth loading: N/A, because sign-in pending is not held on a native POST. The spinner and pending label stay and are restyled; do not add a client action to make loading visible

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

- No new unit tests. This change does not modify `src/lib/maze/generate.ts`. Existing generator tests stay the proof that a generated maze has one path.

### Integration Tests:

- `npx astro check` and `npm run lint` after each phase.
- `scripts/smoke.mjs` is the auth-flow check and should keep passing because the auth routes stay. Run it only when a server is already up. Do not add a visual regression tool.

### Manual Testing Steps:

1. Open `/`. Confirm the warm page, the quieter sentence, and a large Generuj pill. Tab to it and confirm the ring.
2. Click Generuj. Confirm a white sheet, dark walls, and Drukuj as a matching pill. Hover a pill. Print-preview one A4 page with the buttons hidden.
3. Open `/auth/signin`, `/auth/signup`, and `/auth/confirm-email` signed out. Confirm the warm theme. Open `/dashboard` only after a session (the smoke signup is enough); signed out, it redirects to `/auth/signin`.
4. Submit sign-in with an empty field and confirm the destructive message sits by the field. Do not treat a visible pending label as a pass; that state is N/A.

## Performance Considerations

No font download and no new network request. Maze generation stays synchronous on the click. `color-scheme: light` does not add a runtime theme switch.

## Migration Notes

No data migration. The tweakcn block is already in the working tree; phase 1 must not paste a second copy over it. `research.md` describes an older neutral theme and is not a source of CSS values.

## References

- Research (stale on the token values, still the map of who used to own which color): `context/changes/ui-tokens-onboarding/research.md`
- `@page` stays off `global.css`: `context/archive/2026-09-29-print-a4-maze/plan.md`
- Route deletion stays in F-02: `context/foundation/roadmap.md` (`remove-starter-scaffold`), `context/changes/remove-starter-scaffold/change.md`
- Token file: `src/styles/global.css`
- Worksheet: `src/components/WorksheetHome.astro`, `src/components/WorksheetGenerator.tsx`
- Shared button: `src/components/ui/button.tsx`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Motyw zostaje źródłem

#### Automated

- [x] 1.1 `npx astro check` passes — ddf1942
- [x] 1.2 `npm run lint` passes — ddf1942
- [x] 1.3 `src/styles/global.css` sets `color-scheme: light`, still contains light `--card: oklch(1 0 0)`, and still contains the `.dark` block — ddf1942
- [x] 1.4 `src/styles/global.css` contains no `@page`, and `src/components/WorksheetHome.astro` still contains `@page` — ddf1942

#### Manual

- [x] 1.5 `/` still shows the current worksheet, because this phase does not restyle it — ddf1942
- [x] 1.6 Loading `/` does not request a web font — ddf1942

### Phase 2: Kartka czyta tokeny

#### Automated

- [x] 2.1 `npm run lint` passes — 9606513
- [x] 2.2 `npx astro check` passes — 9606513
- [x] 2.3 `WorksheetHome.astro` and `WorksheetGenerator.tsx` contain no `--pk-`, `#F6F1E8`, `#3F3A34`, `#7D8B74`, `#5B554C`, or `fill="#fff"` — 9606513

#### Manual

- [x] 2.4 `/` uses the warm background, a quieter sentence, and the same large pills — 9606513
- [x] 2.5 After Generuj, the sheet is white, the walls are dark, and the page around the sheet stays warm — 9606513
- [x] 2.6 Print preview is one A4 page, with the buttons hidden and the sheet white — 9606513
- [x] 2.7 Tabbing to Generuj shows the theme focus ring — 9606513

### Phase 3: Reszta aplikacji schodzi ze startera

#### Automated

- [x] 3.1 `npm run lint` passes — aa91e83
- [x] 3.2 `npx astro check` passes — aa91e83
- [x] 3.3 `src/pages` and `src/components` contain no `bg-cosmic`, `purple-`, `blue-`, `red-`, or `white/` — aa91e83
- [x] 3.4 `src/styles/global.css` has no `@utility bg-cosmic`, and `src/components/ui/LibBadge.astro` is gone — aa91e83
- [x] 3.5 These routes still exist: `src/pages/auth/signin.astro`, `src/pages/auth/signup.astro`, `src/pages/auth/confirm-email.astro`, `src/pages/dashboard.astro` — aa91e83

#### Manual

- [x] 3.6 Sign-in, sign-up, and confirm-email use the warm theme. Dashboard does too, but only after a session; an anonymous visit redirects to sign-in — aa91e83
- [x] 3.7 A sign-in field error sits beside the field in the destructive role — aa91e83
- [x] 3.8 A pending submit is N/A to observe: invalid fields never submit, and a valid submit is a full-page POST. Keep the pending label and spinner, restyle them, and do not convert the form to a client action — aa91e83
- [x] 3.9 `/` still matches the phase 2 worksheet — aa91e83

### Phase 4: Stany i reguła

#### Automated

- [x] 4.1 `npm run lint` passes
- [x] 4.2 The `AGENTS.md` UI section names the tweakcn roles and forbids hex and palette color classes on screens

#### Manual

- [x] 4.3 Worksheet default: `/` uses theme roles and shadcn `Button`, with no leftover product hex
- [x] 4.4 Worksheet hover: the pill visibly changes on hover via the primary token
- [x] 4.5 Worksheet focus-visible: Tab to Generuj and Drukuj shows the ring token, not the browser default
- [x] 4.6 Worksheet disabled: N/A, because Drukuj is omitted until a maze exists and Generuj is always enabled
- [x] 4.7 Worksheet error: N/A, because the generator returns one path and this change adds no error message
- [x] 4.8 Worksheet empty: before Generuj the page shows the heading, the sentence, and Generuj, and no sheet
- [x] 4.9 Worksheet loading: N/A, because generation is synchronous and the layout does not jump
- [x] 4.10 Auth focus-visible: Tab through sign-in fields shows the ring token
- [x] 4.11 Auth error: invalid submit shows the message beside the field in the destructive role
- [x] 4.12 Auth loading: N/A, because sign-in pending is not held on a native POST. The spinner and pending label stay and are restyled; do not add a client action to make loading visible
