# Worksheet page shell Implementation Plan

## Overview

Replace the starter first paint of `/` with a calm, readable page that tells a parent what PrintoKids is for and shows a generate control that does not run yet. `S-01` will enable that same control and add the A4 maze on this page.

## Current State Analysis

`/` renders the starter marketing screen. [`src/pages/index.astro`](../../../src/pages/index.astro) mounts [`src/components/Welcome.astro`](../../../src/components/Welcome.astro), which draws the cosmic background, the “10x Astro Starter” hero, Sign In / Sign Up, three feature cards, and [`src/components/Topbar.astro`](../../../src/components/Topbar.astro). Nothing else imports those two components.

[`src/layouts/Layout.astro`](../../../src/layouts/Layout.astro) wraps every page. It defaults the document title to “10x Astro Starter”, sets `lang="en"`, and always renders the missing-Supabase banner from [`src/lib/config-status.ts`](../../../src/lib/config-status.ts). Auth pages (`/auth/signin`, `/auth/signup`, `/auth/confirm-email`, `/dashboard`) share that layout and their own `bg-cosmic` wrappers. [`scripts/smoke.mjs`](../../../scripts/smoke.mjs) checks the auth flow, not the home copy. [`src/middleware.ts`](../../../src/middleware.ts) only gates `/dashboard`.

The React button in [`src/components/ui/button.tsx`](../../../src/components/ui/button.tsx) is used by auth submit buttons, which override it with purple classes. The home control has no behavior, so it does not need a React island. Global shadcn tokens in [`src/styles/global.css`](../../../src/styles/global.css) stay as they are; the cosmic look is the `bg-cosmic` utility, not the body tokens.

## Desired End State

Opening `/` shows a warm off-white page with charcoal text and generous space. The heading is **PrintoKids**. The sentence is **Wygeneruj labirynt i wydrukuj go na kartce A4.** A disabled button named **Generuj** is visible and cannot be activated. The document title is **PrintoKids** and `html lang` is `pl`. There is no missing-Supabase banner, no sign-in chrome, no illustration, no maze, and no A4 sheet.

`/auth/signin` still uses `lang="en"`, the cosmic starter screen, and the missing-Supabase banner when Supabase is not configured.

### Key Discoveries:

- [`src/pages/index.astro`](../../../src/pages/index.astro) is only a layout plus `Welcome`.
- [`src/layouts/Layout.astro`](../../../src/layouts/Layout.astro) owns `lang`, the default title, and the banner loop. A prop can skip the banner without changing auth callers, because the default stays “show the banner”.
- `Welcome` and `Topbar` are unused once `/` stops rendering them.
- Auth submit buttons already pass their own purple classes, so home colors must stay on the home component and must not rewrite `:root` tokens.
- [`scripts/smoke.mjs`](../../../scripts/smoke.mjs) asserts only that `/` returns `200` and that signin/signout redirect to `/`; it makes no assertion about home copy, so the rewrite keeps smoke green.

## What We're NOT Doing

- Maze generation, an A4 sheet, print, a character, difficulty, last-used parameters, or child profiles.
- Removing auth routes, middleware, the Supabase client, or the auth smoke check.
- Hiding the missing-Supabase banner on auth pages.
- Restyling auth pages into the Montessori palette.
- Changing global shadcn color tokens.
- An enabled button, a click handler, or a “not yet” message.
- An illustration, a font package, or an i18n framework.

## Implementation Approach

Keep the product shell in Astro. Teach the shared layout two optional props so `/` can be Polish and banner-free while every existing auth page stays on the defaults. Then replace the cosmic hero with one static home component whose colors are local, and delete `Welcome` and `Topbar`.

The disabled control is a native `<button type="button" disabled>` whose visible text is `Generuj`. `S-01` enables this control on the same page.

## Phase 1: Document shell

### Overview

`/` speaks Polish and no longer shows the missing-Supabase banner. The cosmic hero is still the slot content until Phase 2. Auth pages keep today’s language, title behavior, and banner.

### Changes Required:

#### 1. Layout props

**File**: `src/layouts/Layout.astro`

**Intent**: Let the product page set language and suppress the starter configuration banner without changing auth pages that omit the new props.

**Contract**: Add optional `lang` defaulting to `"en"` and optional `showConfigBanner` defaulting to `true`. Set `<html lang>` from `lang`. Render the existing `missingConfigs` banner loop only when `showConfigBanner` is true. Leave the existing `title` prop and its default `"10x Astro Starter"` unchanged.

#### 2. Home document settings

**File**: `src/pages/index.astro`

**Intent**: Apply the product document identity on `/` only.

**Contract**: Pass `title="PrintoKids"`, `lang="pl"`, and `showConfigBanner={false}`. Keep rendering `Welcome` in this phase.

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes
- `npx astro check` passes
- `src/pages/index.astro` sets `title="PrintoKids"`, `lang="pl"`, and `showConfigBanner={false}`

#### Manual Verification:

- Loading `/` shows document title PrintoKids, `html lang="pl"`, and no missing-Supabase banner
- Loading `/auth/signin` still uses `lang="en"` and still shows the missing-Supabase banner when Supabase is not configured

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Product first paint

### Overview

Replace the cosmic hero with the calm purpose page and the disabled generate control, then remove the starter home components that only that hero used.

### Changes Required:

#### 1. Home shell

**File**: `src/components/WorksheetHome.astro` (new)

**Intent**: Give `/` a single calm first paint: product name, one purpose sentence, and a generate control that cannot run.

**Contract**: Static Astro markup, no React and no client script. Full-viewport warm paper background `#F6F1E8`, charcoal text `#3F3A34`, centered column with generous space. An `h1` whose text is `PrintoKids`. One paragraph whose text is `Wygeneruj labirynt i wydrukuj go na kartce A4.` A native `<button type="button" disabled>` whose visible text is `Generuj`, using sage `#7D8B74`, paper-colored label `#F6F1E8`, and reduced opacity so it reads as unavailable. No illustration, no auth link, no sheet frame, and no maze.

#### 2. Mount the shell

**File**: `src/pages/index.astro`

**Intent**: Make the new shell the only content of `/`.

**Contract**: Replace the `Welcome` import and usage with `WorksheetHome`. Keep the Phase 1 layout props.

#### 3. Remove the starter hero

**Files**: `src/components/Welcome.astro`, `src/components/Topbar.astro`

**Intent**: Remove the cosmic marketing screen so `/` cannot fall back to it.

**Contract**: Delete both files. No remaining import of either component.

### Success Criteria:

#### Automated Verification:

- `npm run lint` passes
- `npx astro check` passes
- `src/components/Welcome.astro` and `src/components/Topbar.astro` are gone, and no file imports them
- The home page renders the heading `PrintoKids`, the sentence `Wygeneruj labirynt i wydrukuj go na kartce A4.`, and a `disabled` button whose accessible name is `Generuj`

#### Manual Verification:

- `/` shows a warm off-white page with charcoal text, generous space, and no illustration, cosmic background, sign-in links, or feature cards
- The Generuj control is visible and cannot be activated; no maze and no A4 sheet appear
- `/auth/signin` still shows the cosmic starter screen

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Unit Tests:

There is no unit-test runner in this repo. This change does not add one.

### Integration Tests:

`npx astro check` is the type-level check. `scripts/smoke.mjs` stays an auth-flow check and is not extended to home copy.

### Manual Testing Steps:

1. Open `/` and confirm the title, Polish purpose line, disabled **Generuj** button, warm paper page, and the absence of the config banner, sign-in links, illustration, maze, and A4 sheet.
2. Try to activate **Generuj** with pointer and keyboard and confirm the page does not change.
3. Open `/auth/signin` and confirm the cosmic English screen is still there, including the missing-Supabase banner when Supabase is not configured.

## Performance Considerations

The page is static HTML and CSS. No new font download, client island, or request.

## Migration Notes

No data migration. Auth routes and stored sessions are left in place.

## Review Notes

`/10x-plan-review` (2026-09-28) returned **SOUND** with two accepted observations, both deferred to implementation rather than changing the plan:

- **F1 — Montessori palette hardcoded outside the token system.** The three colors live in one component; `S-01` and `S-02` will need the same palette. Reuse one source of truth when those slices arrive.
- **F2 — Disabled button readability.** Prefer a muted fill with a still-legible label over a blanket opacity drop, so the control stays readable.

## References

- Roadmap F-01: `context/foundation/roadmap.md`
- PRD US-01 (shell only; generation is later): `context/foundation/prd.md`
- Home route: `src/pages/index.astro`
- Document shell: `src/layouts/Layout.astro`
- No frame brief and no research doc for this change

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Document shell

#### Automated

- [x] 1.1 `npm run lint` passes
- [x] 1.2 `npx astro check` passes
- [x] 1.3 `src/pages/index.astro` sets `title="PrintoKids"`, `lang="pl"`, and `showConfigBanner={false}`

#### Manual

- [ ] 1.4 Loading `/` shows document title PrintoKids, `html lang="pl"`, and no missing-Supabase banner
- [ ] 1.5 Loading `/auth/signin` still uses `lang="en"` and still shows the missing-Supabase banner when Supabase is not configured

### Phase 2: Product first paint

#### Automated

- [ ] 2.1 `npm run lint` passes
- [ ] 2.2 `npx astro check` passes
- [ ] 2.3 `src/components/Welcome.astro` and `src/components/Topbar.astro` are gone, and no file imports them
- [ ] 2.4 The home page renders the heading `PrintoKids`, the sentence `Wygeneruj labirynt i wydrukuj go na kartce A4.`, and a `disabled` button whose accessible name is `Generuj`

#### Manual

- [ ] 2.5 `/` shows a warm off-white page with charcoal text, generous space, and no illustration, cosmic background, sign-in links, or feature cards
- [ ] 2.6 The Generuj control is visible and cannot be activated; no maze and no A4 sheet appear
- [ ] 2.7 `/auth/signin` still shows the cosmic starter screen
