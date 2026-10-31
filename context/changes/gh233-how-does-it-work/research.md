---
date: 2026-10-31
researcher: Claude
git_commit: c9d097a
branch: claude/gh233-investigation-5917b1
repository: printo-kids
topic: "GH 233: where do per-card descriptions live and where should „Jak to działa” show them"
tags: [research, codebase, cards, how-it-works, catalog]
status: complete
last_updated: 2026-10-31
last_updated_by: Claude
---

# Research: GH 233 — opisy generatorów w „Jak to działa”

## Research Question

Issue 233 wants two–three sentences per card kind (what the child does, what is on the sheet) in „Jak to działa”, plus one sentence on age-named levels, with descriptions kept in `CARD_KINDS`. What exists today, and what does the change touch?

## Summary

- Issue wording differs from the code: „Jak to działa” is not a section of the home page. It is a separate page `/how-it-works` (`src/pages/how-it-works.astro:28`), reached from the footer link on the catalog and generator pages (`src/components/SiteFooter.astro:2-8`). The home page has only the h1, one sentence and the catalog (`src/pages/index.astro:10-17`).
- `CARD_KINDS` is `src/lib/cards.ts:8-15`, a single file, not a `src/lib/cards` directory. It holds six entries (`labirynt`, `symetria`, `sudoku`, `sekwencje`, `nonogram`, `dyktando`), each with only `id`, `title`, `href`, `thumbnail` (`cards.ts:1-6`). No description field exists.
- `how-it-works.astro` has five hard-coded sections (Poziomy, Profil dziecka, Ulubiona postać, Postać na karcie, Twoje dane) in a `sections` array (`how-it-works.astro:4-25`) and no per-card text. The Poziomy section (line 7) already says levels do not judge the child and age is only a hint on some cards, so the "one sentence about age-named levels" is largely covered; it does not say which cards show an age.
- Consumers of `CARD_KINDS` in non-test code (inspected `src`): `cardsInCatalogOrder` / `cardTitle` in `cards.ts`, and `card-summary.ts:2,29` (maps over it for the profile summary). Adding an optional-or-required field is additive for `card-summary.ts`; `CardKind` type is not imported elsewhere in `src` (grep, `.ts/.tsx/.astro`).

## Detailed Findings

### Catalog and home page

- `CardCatalog.astro` renders thumbnail + title per `cardsInCatalogOrder()` (alphabetical, Polish collation, `cards.ts:17-19`), and thumbnails have `alt=""` (`CardCatalog.astro:16`). Nothing says what the child does; this is the gap in the issue.
- The home page is intentionally minimal; PRD US-05 says generator pages have nothing below the card except the footer link, and the catalog is thumbnails + name.

### „Jak to działa” page

- Static Astro page, no React, uses role tokens (`text-muted-foreground`), `max-w-2xl`. Adding a section per card means looping over `cardsInCatalogOrder()` or `CARD_KINDS` and rendering `description`.
- Order choice: catalog order (alphabetical) vs. `CARD_KINDS` insertion order (labirynt first). The profile summary uses insertion order (`card-summary.ts:27`); catalog uses alphabetical.

### Tests that bind the page

- `tests/e2e/how-it-works.spec.ts:46-51` asserts four h2 headings and several phrases; adding sections does not break it. The test file's header says it protects the page contents against UI wording drift, so a per-card test belongs there.
- `src/lib/cards.test.ts` iterates `CARD_KINDS` (e.g. lines 18-23), so a unit test "every kind has a non-empty description" fits there, and fulfils the issue's goal that every new kind gets a description where it is defined.
- `npm test` lists files explicitly in the `test` script (`package.json:12`); `cards.test.ts` is already listed.
- `scripts/smoke.mjs:72-74` only checks `/how-it-works` returns 200 with „Jak to działa”.

### PRD

- US-22 (footer link, short page with the whole rule of profile, levels, character) and FR-031 define the page; neither mentions per-card descriptions. The issue says to extend US-05 with a criterion. Precedent: the archived s32 change edited one sentence of US-05 (`context/archive/2026-10-31-s32-how-does-it-work/plan.md:163`).

## Code References

- `src/lib/cards.ts:1-15` - `CardKind` shape and the six entries
- `src/lib/card-summary.ts:2,27-29` - only other non-test consumer of `CARD_KINDS`
- `src/pages/how-it-works.astro:4-25` - sections array; `:38-43` render loop
- `src/components/SiteFooter.astro` - link to `/how-it-works`
- `src/components/CardCatalog.astro:16` - thumbnails with empty alt
- `tests/e2e/how-it-works.spec.ts` - page content tests
- `src/lib/cards.test.ts` - card-kind unit tests

## Architecture Insights

- Content that must stay in sync with behaviour is already pinned by tests (s32 pattern); a description field on `CardKind` plus a "non-empty" unit test extends that pattern cheaply.
- Descriptions must match the PRD per card: maze (one path start→finish, level = path width), symmetry (draw the mirrored half), sequences (fill missing shapes/numbers), sudoku (fill missing shapes/digits), nonogram (colour cells by numbers, reveal object), dictation (draw along arrows). All six facts are in the PRD user stories US-01, 06, 10, 12, 15, 17.

## Historical Context (from prior changes)

- `context/archive/2026-10-31-s32-how-does-it-work/` - created the page and footer; plan states the page is "4 sekcje" and contents tied to UI texts. The page now has five sections (adds „Twoje dane"), so that count in the plan is superseded.
- `context/archive/2026-10-22-card-catalog-home/` and `2026-10-28-catalog-alpha-order/` - catalog structure and alphabetical order.

## Related Research

None specific; not applicable.

## Open Questions

1. Where to show descriptions: only on `/how-it-works` (issue title and text say „Jak to działa”, but the issue's "Co jest teraz" frames it as the home page) or also on the home page (e.g. a one-line `summary` under each thumbnail)? Product decision for planning.
2. Order of per-card sections: alphabetical (as catalog) or insertion order.
3. Issue says „dwa–trzy zdania”; confirm whether one `description` string suffices or separate fields (what the child does / what is on the sheet) are wanted.
4. Age sentence: the existing Poziomy paragraph already covers it; decide whether to add a sentence naming which cards show age (maze, symmetry, sequences, dictation per PRD US-22).
5. PRD update: new criterion in US-05 (or US-22) and possibly FR-031; wording needs the user's approval.
