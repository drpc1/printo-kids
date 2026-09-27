---
starter_id: 10x-astro-starter
package_manager: npm
project_name: printo-kids
hints:
  language_family: js
  team_size: solo
  deployment_target: cloudflare-workers
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: first-class
  path_taken: standard
  quality_override: false
  self_check_answers: null
  has_auth: false
  has_payments: false
  has_realtime: false
  has_ai: false
  has_background_jobs: false
---

## Why this stack

PrintoKids is a small-scale, 6-week after-hours web app: generate a solvable A4 maze, preview it, and print it, with optional local child profiles and no accounts, payments, AI, or backend jobs. JavaScript/TypeScript plus the recommended web starter lands on Astro + React islands + TypeScript + Tailwind, which is enough UI and print surface for that flow, plus Cloudflare Workers as the deploy default. The standard path was taken, so the pick is the vetted `(web, js)` default rather than a custom walk. Scaffolding support is first-class (valid CLI, not end-to-end battle-tested). CI is GitHub Actions with auto-deploy on merge to main. Supabase ships in the starter even though MVP data stays on-device; leave it unused unless a later version adds accounts or sync.
