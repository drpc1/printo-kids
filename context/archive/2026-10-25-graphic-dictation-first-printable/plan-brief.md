# Graphic dictation first printable (S-23) — Plan Brief

> Full plan: `context/changes/graphic-dictation-first-printable/plan.md`
> Research: `context/changes/graphic-dictation-first-printable/research.md`

## What & Why

A new card, "Dyktando graficzne" (US-17, FR-026): the child follows commands like "3 →" along grid lines from a dot and discovers the outline of an object. It gives the parent a new card at the right level on demand, from the same object catalog as symmetry.

## Starting Point

Four card kinds with a shared page pattern (symmetry). Objects are 6×15 half templates (rocket, robot, strawberry) in `src/lib/symmetry/templates.ts`; of 20 variant combinations 18 pass the outline rule and give 9 distinct outlines, 24–44 commands each.

## Desired End State

`/dyktando` from the catalog: Generuj shows an A4 card with the instruction sentence, numbered command boxes (11 per row) and an empty 14×17 grid (11 mm) with a start dot; print is one page, black, ≥10 mm margin, no answer; works on a phone.

## Key Decisions Made

| Decision          | Choice                                        | Why                                                        | Source   |
| ----------------- | --------------------------------------------- | ---------------------------------------------------------- | -------- |
| Command layout    | B: thin boxes with small number, 11 per row   | Child can tick steps and not lose the place in 44 commands | Plan     |
| Grid              | Fixed 14×17, object centered                  | Largest cells; object + 1 cell each side                   | Plan     |
| New card          | Different outline (commands) than previous    | Hole-only variants look identical                          | Plan     |
| Level bar         | No level button in S-23                       | One level only; S-25 adds the choice                       | Plan     |
| Direction / start | Clockwise from top-left corner of top row     | First command →, matches PRD start rule                    | Plan/PRD |
| Start mark        | Dot only                                      | Matches "Zacznij od kropki."                               | Plan     |
| Outline rule      | 4-connected, holes filled, no corner contacts | PRD: no crossing, no self-touch                            | Research |

## Scope

**In scope:** generator + rule + tests, sheet layout + tests, page `/dyktando`, catalog entry, thumbnail, print contract, smoke.

**Out of scope:** levels 5/7 lat (S-25), categories (S-26), new objects (S-21), profile memory, colors.

## Architecture / Approach

`src/lib/dictation/{levels,outline,generate,sheet,layout}.ts` are pure; `DictationGenerator.tsx` copies the symmetry page without level and colors; the thumbnail script reuses generator and layout.

## Phases at a Glance

| Phase                  | What it delivers                                | Key risk                                          |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------- |
| 1. Dictation generator | Valid cards with commands, rule, tests          | Trace edge cases (corner contacts)                |
| 2. Sheet layout        | Instruction, boxes and grid inside 10 mm margin | 44+ commands from S-21 objects could overflow     |
| 3. Page and catalog    | `/dyktando`, thumbnail, contracts               | Merge conflict with S-22 in `cards.ts`/thumbnails |

**Prerequisites:** none (branch synced with `origin/main`).
**Estimated effort:** one session, 3 phases.

## Open Risks & Assumptions

- S-21 objects may give longer outlines; layout throws instead of crossing the margin, and tests cover 44 commands (5 rows would still fit: 60 mm + 187 mm grid).
- Only 9 distinct outlines until S-21 lands.

## Success Criteria (Summary)

- Parent prints a dictation card from the catalog on desktop and phone.
- Every shown card's commands return to the dot without crossing or touching.
- lint, test, astro check, build pass; PR notes how many variants pass the rule.
