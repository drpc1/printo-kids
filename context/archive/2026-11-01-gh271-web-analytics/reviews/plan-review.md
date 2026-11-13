<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Licznik Web Analytics na stronie produkcyjnej

- **Plan**: context/changes/gh271-web-analytics/plan.md
- **Mode**: Deep (weryfikacja ryzykownych twierdzeń lokalnie, bez sub-agenta)
- **Date**: 2026-11-01
- **Verdict**: REVISE → SOUND po poprawce F1
- **Findings**: 1 critical, 0 warnings, 0 observations

## Verdicts

| Dimension             | Verdict               |
| --------------------- | --------------------- |
| End-State Alignment   | PASS                  |
| Lean Execution        | PASS                  |
| Architectural Fitness | PASS                  |
| Blind Spots           | FAIL (F1, naprawione) |
| Plan Completeness     | PASS                  |

## Grounding

Ścieżki: Layout.astro, robots.ts, robots.test.ts, middleware.ts, wrangler.jsonc, playwright.config.ts, ci.yml ✓; brief↔plan ✓; Progress↔Phase ✓

## Findings

### F1 — Zmienna `ENVIRONMENT=production` uznaje lokalny dev i e2e za produkcję

- **Severity**: ❌ CRITICAL
- **Impact**: 🔎 MEDIUM
- **Dimension**: Blind Spots
- **Location**: Faza 1, zmiany 2–3 (wrangler.jsonc, Layout.astro)
- **Detail**: `astro dev`, `astro preview`, lokalny build i e2e w CI czytają główną część `wrangler.jsonc`; tylko `CLOUDFLARE_ENV=staging` (ci.yml:56) przełącza na staging. `vars.ENVIRONMENT="production"` na górze załadowałoby skrypt lokalnie i w e2e, co łamie kryterium 1.5 i cel planu.
- **Fix ⭐ Recommended**: Allowlista hostname `printo-kids.printokids.workers.dev` plus `ENVIRONMENT` ≠ `staging`, bez zmian w wrangler.
  - Strength: Wyklucza localhost, e2e i staging niezależnie od konfiguracji budowy.
  - Tradeoff: Własna domena wymaga zmiany stałej.
- **Decision**: FIXED (allowlista hostname; plan i brief zaktualizowane)
