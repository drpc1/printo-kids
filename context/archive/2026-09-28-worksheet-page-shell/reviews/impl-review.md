<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Worksheet page shell

- **Plan**: `context/changes/worksheet-page-shell/plan.md`
- **Mode**: Full (phases 1–2)
- **Reviewed phases**: 1, 2
- **Date**: 2026-09-28
- **Verdict**: SOUND
- **Findings**: 0 critical, 0 warnings, 2 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan vs code | PASS |
| Scope boundaries | PASS |
| Auth / smoke unchanged | PASS |
| Success criteria | PASS |

## What landed

Phase 1 (`8409ce7`): `Layout.astro` has optional `lang` (default `"en"`) and `showConfigBanner` (default `true`). `/` passes `title="PrintoKids"`, `lang="pl"`, `showConfigBanner={false}`. Auth callers omit the new props and keep English + the missing-Supabase banner.

Phase 2 (`03a0fc4`): `WorksheetHome.astro` is the only home content. `Welcome.astro` and `Topbar.astro` are gone; no remaining imports. Native disabled `Generuj` button, no React island, no maze, no A4 sheet.

Progress: every row is `[x]` with a SHA.

## Findings

### F1 — Button palette differs from Phase 2 Contract

- **Severity**: observation
- **Location**: `src/components/WorksheetHome.astro`
- **Detail**: Plan Contract asked for sage `#7D8B74`, paper label `#F6F1E8`, reduced opacity. Implementation uses muted sage `#9FAD95` and charcoal `#3F3A34` with no opacity drop. This matches Review Notes F2 (accepted in plan-review) and was confirmed by the user during Phase 2 manual check.
- **Decision**: ACCEPTED

### F2 — Palette still local hexes (plan-review F1)

- **Severity**: observation
- **Location**: `WorksheetHome.astro`
- **Detail**: Paper `#F6F1E8`, charcoal `#3F3A34`, plus paragraph `#5B554C` (not named in the Contract) live in one component. Global shadcn tokens were correctly left alone. `S-01` / `S-02` should reuse one source of truth.
- **Decision**: ACCEPTED (deferred)

## Out of product scope (environment)

Local `astro` needs `@bruits/satteri-wasm32-wasi` because Smart App Control blocks the native `satteri` binary. That package is not in `package.json`. Next `npm install` can break `dev`/`check`/`build` on this machine. Not a defect in F-01.
