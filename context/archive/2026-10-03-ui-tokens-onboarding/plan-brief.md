# UI tokens onboarding — Plan Brief

> Full plan: `context/changes/ui-tokens-onboarding/plan.md`
> Research: `context/changes/ui-tokens-onboarding/research.md`

## What & Why

The tweakcn theme is already in `src/styles/global.css`, and the screens still paint themselves. The worksheet uses local hexes (`--pk-paper`, `--pk-ink`, `--pk-sage`, and `#5B554C`). Auth and the dashboard still use the starter cosmic gradient and purple/blue glass. This change makes those screens read the pasted theme and removes the starter palette.

## Starting Point

`:root`, `.dark`, and `@theme inline` hold the OKLCH export, including a white light `--card` and a dark-brown `.dark` `--card`. Nothing adds the class `dark`, and browser dark mode does not switch the tokens. `research.md` describes the older neutral theme from commit `639a8eb` and must not be used as CSS values. `@page` lives on `WorksheetHome.astro`. Inter and Lora are named and not loaded.

## Desired End State

`/` shows the warm theme background, a quieter sentence, the same large sage pills, and — after Generuj — a white sheet with dark walls. Print is still one A4 page. Sign-in, sign-up, confirm-email, and the dashboard use the same theme and keep their routes. No cosmic, purple, or blue palette classes remain on a screen.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Theme values | Keep the pasted tweakcn block; do not regenerate it | The export is already in `global.css` and is the source of truth | Plan |
| Worksheet colors | Role utilities; delete `--pk-*` and `#F6F1E8`, `#3F3A34`, `#7D8B74`, `#5B554C` | The page reads `background`, `foreground`, `muted-foreground`, and `primary` instead of a second palette | Plan |
| Scope | Restyle the whole visible app and remove starter styles | Cosmic, purple, and blue glass leave with the local worksheet hexes | Plan |
| Auth routes | Restyle; do not delete | `remove-starter-scaffold` owns deletion, and the auth smoke test still needs the routes | Plan |
| Sheet | Light `--card`, plus `color-scheme: light` on `html` | `--card` is white in `:root`; browser dark mode does not apply `.dark` | Plan |
| Dark theme | Keep `.dark` in the file; no toggle and no `class="dark"` | The export stays whole, and screens render the light tokens | Plan |
| Generuj / Drukuj | shadcn `Button` default variant, className only `h-auto rounded-full px-12 py-3.5 text-lg` | `h-auto` drops the default `h-9`; hover, focus, and disabled stay on the shared control. `shadow-xs` stays | Plan |
| Fonts | Leave Inter and Lora as names; do not load files; Start/Meta stay `ui-sans-serif` | Print does not gain a font download | Plan |
| Guard | Extend `AGENTS.md` only | No new ESLint rule or script | Plan |
| `@page` | Stays in `WorksheetHome.astro` | S-02 forbids moving it into `global.css` | Research |

## Scope

**In scope:**

- `color-scheme: light` on the document, without editing tweakcn values
- Worksheet shell, pills, and sheet rectangle onto role tokens
- Auth pages, dashboard, form fields, submit, server error, banner, and the destructive button label
- Deleting `bg-cosmic` and unused `LibBadge.astro`
- UI bullets in `AGENTS.md`
- State matrix on the real `/` and sign-in screens, with N/A where the product has no such state

**Out of scope:**

- Deleting auth or dashboard routes
- A dark-mode switch, or a token whose only job is to stay white under `.dark`
- Loading Inter or Lora
- A new lint rule, npm script, or public kitchen-sink page
- An error message after Generuj
- Converting auth submit to a client action so the pending label stays visible
- Maze generation, `@page`, or pill dimensions

## Architecture / Approach

One token file, already filled. Screens use the published role utilities (`bg-background`, `text-foreground`, `bg-primary`, `bg-card`, `text-destructive`, `ring-ring`). `bg-cosmic` is removed in the same phase as its last call sites, so an early pause does not blank sign-in. The sheet fill is `--card` from `:root`. `color-scheme: light` tells the browser the document is light; it does not select `.dark`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Motyw zostaje źródłem | `color-scheme: light`; tweakcn values and `@page` untouched | An edit that overwrites the pasted theme with the old neutral set from research |
| 2. Kartka czyta tokeny | Worksheet on roles; pills are `Button`; sheet is `--card` | A `bg-*` className on `Button` overrides `bg-primary` |
| 3. Reszta aplikacji schodzi ze startera | Auth and dashboard on the theme; `bg-cosmic` and `LibBadge` gone; routes remain | Restyling pages that F-02 may later delete |
| 4. Stany i reguła | State matrix checked on real pages; `AGENTS.md` updated | Treating N/A cells as missing UI and inventing an error or spinner on Generuj |

**Prerequisites:** The tweakcn export is already in `src/styles/global.css`. Node 22.14.0. A running dev server for the manual checks.
**Estimated effort:** About 2 sessions across 4 phases.

## Open Risks & Assumptions

- OKLCH roles can shift the worksheet slightly off `#F6F1E8`, `#3F3A34`, `#7D8B74`, and `#5B554C`. That shift is accepted.
- `--card` stops being white if a later change adds `class="dark"`. This plan does not add that class.
- There is no screenshot test. The manual matrix is the visual gate.

## Success Criteria (Summary)

- `/` is warm paper, large sage pills, and a white sheet after Generuj, and print is still one A4 page.
- Auth and the dashboard no longer show the cosmic starter, and their routes still open.
- The next agent, reading `AGENTS.md`, uses the tweakcn roles instead of hexes or palette classes.
