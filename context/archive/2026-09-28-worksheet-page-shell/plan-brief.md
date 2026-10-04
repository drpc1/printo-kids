# Worksheet page shell — Plan Brief

> Full plan: `context/changes/worksheet-page-shell/plan.md`

## What & Why

Roadmap F-01. A parent opening PrintoKids today sees the starter's "10x Astro Starter" marketing screen with sign-in buttons — not a product. This change makes the first paint say what the tool is for and show the control the parent will click, so `S-01` only has to make that control produce an A4 maze on the same page.

## Starting Point

`/` renders `src/components/Welcome.astro` inside the shared `src/layouts/Layout.astro`: a cosmic hero, Sign In / Sign Up links, a topbar, and three starter feature cards. The layout is English, titles every page "10x Astro Starter" by default, and always shows the missing-Supabase banner. Auth routes use the same layout and stay untouched.

## Desired End State

Opening `/` shows a warm off-white page with charcoal text and generous space: the heading **PrintoKids**, the sentence **Wygeneruj labirynt i wydrukuj go na kartce A4.**, and a disabled **Generuj** button. The document is Polish and titled PrintoKids, with no config banner and no sign-in chrome. `/auth/signin` still looks exactly as it does today.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Generate control before S-01 | Disabled `Generuj` button, no handler, no message | Visible so the parent knows what to click, but it can never look like a failed generation. | Plan |
| Visual direction | Calm natural paper: warm off-white, charcoal text, one muted sage accent, no illustration | Matches an ordered Montessori room and stays readable for a parent. | Plan |
| Copy and language | Heading PrintoKids + one Polish purpose line; button `Generuj`; `lang="pl"` | The persona and the rest of the product copy (including „Meta") are Polish. | Plan |
| Config banner on `/` | Hidden on home, kept on auth pages | The banner is about auth configuration, which the product flow does not use. | Plan |
| Auth stack | Routes, middleware and the smoke check stay; they just leave the home page | MVP has no accounts, but removing the starter auth is out of scope here. | Plan |

## Scope

**In scope:** the `/` route, a new home component, and two optional props on the shared layout (`lang`, `showConfigBanner`); deleting `Welcome.astro` and `Topbar.astro`.

**Out of scope:** maze generation, the A4 sheet, print, characters, difficulty, last-used parameters, child profiles, restyling auth pages, and changing global design tokens.

## Architecture / Approach

Static Astro only — no React island, because the control has no behavior. The shared layout gains two optional props whose defaults preserve today's behavior for every auth caller, so `/` can be Polish and banner-free without touching them. The Montessori colors live in the new home component rather than in the global `:root` tokens, keeping the cosmic auth screens intact.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Document shell | `/` is Polish, titled PrintoKids, no config banner; auth pages unchanged | A layout prop default that accidentally changes auth pages |
| 2. Product first paint | The calm paper page with the purpose line and disabled `Generuj`; starter hero deleted | Deleting components something else still imports |

**Prerequisites:** none — F-01 is the first item in milestone M-1.
**Estimated effort:** ~1 session across 2 phases.

## Open Risks & Assumptions

- The disabled button is deliberately inert. If it reads as broken rather than "not yet", `S-01` is the fix, not new copy here.
- Accepted from plan review: the palette is hardcoded in one component for now (revisit as a shared source of truth in `S-01`/`S-02`), and the disabled button should use a muted fill rather than a blanket opacity drop so the label stays legible.
- Home keeps returning `200`, which is all `scripts/smoke.mjs` asserts about `/`.

## Success Criteria (Summary)

- A parent landing on `/` can tell what the tool does and see the button they will press.
- Nothing about the page suggests an account is needed.
- Sign-in still works for the starter auth flow that CI smoke-tests.
