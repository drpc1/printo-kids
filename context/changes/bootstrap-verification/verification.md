---
bootstrapped_at: 2026-09-21T19:07:55Z
starter_id: 10x-astro-starter
starter_name: "10x Astro Starter (Astro + Supabase + Cloudflare)"
project_name: printo-kids
language_family: js
package_manager: npm
cwd_strategy: git-clone
bootstrapper_confidence: first-class
phase_3_status: ok
audit_command: npm audit --json
---

## Hand-off

```yaml
starter_id: 10x-astro-starter
package_manager: npm
project_name: printo-kids
hints:
  language_family: js
  team_size: solo
  deployment_target: cloudflare-pages
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
```

## Why this stack

PrintoKids is a small-scale, 6-week after-hours web app: generate a solvable A4 maze, preview it, and print it, with optional local child profiles and no accounts, payments, AI, or backend jobs. JavaScript/TypeScript plus the recommended web starter lands on Astro + React islands + TypeScript + Tailwind, which is enough UI and print surface for that flow, plus Cloudflare Pages as the deploy default. The standard path was taken, so the pick is the vetted `(web, js)` default rather than a custom walk. Scaffolding support is first-class (valid CLI, not end-to-end battle-tested). CI is GitHub Actions with auto-deploy on merge to main. Supabase ships in the starter even though MVP data stays on-device; leave it unused unless a later version adds accounts or sync.

## Pre-scaffold verification

| Signal             | Value                                                      | Severity | Notes                                                                 |
| ------------------ | ---------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| npm package        | not run                                                    | —        | `cmd_template` starts with `git clone`; npm recency skipped           |
| GitHub repo        | przeprogramowani/10x-astro-starter last pushed 2026-09-12T21:16:08Z | fresh    | `gh` CLI unavailable; fetched via GitHub API from card `docs_url`     |

## Scaffold log

**Resolved invocation**: `git clone https://github.com/przeprogramowani/10x-astro-starter .bootstrap-scaffold && cd .bootstrap-scaffold && npm install`
**Strategy**: git-clone
**Exit code**: 0
**Files moved**: 30731 (51 project files + 30680 under `node_modules`)
**Conflicts (.scaffold siblings)**: none
**.gitignore handling**: moved silently
**.bootstrap-scaffold cleanup**: deleted

**Move log**:
- MOVE-DIR `.github` (1 files)
- MOVE-DIR `.husky` (1 files)
- MOVE-DIR `.vscode` (3 files)
- MOVE-DIR `node_modules` (30680 files)
- MOVE-DIR `public` (3 files)
- MOVE-DIR `scripts` (1 files)
- MOVE-DIR `src` (26 files)
- MOVE-DIR `supabase` (2 files)
- MOVE `.env.example`
- MOVE `.gitignore`
- MOVE `.nvmrc`
- MOVE `.prettierrc.json`
- MOVE `AGENTS.md`
- MOVE `astro.config.mjs`
- MOVE `CLAUDE.md`
- MOVE `components.json`
- MOVE `eslint.config.js`
- MOVE `package-lock.json`
- MOVE `package.json`
- MOVE `README.md`
- MOVE `tsconfig.json`
- MOVE `wrangler.jsonc`
- DELETED `.bootstrap-scaffold/.git/` before move-up (cwd `.git/` kept)
- cwd `context/` preserved (starter had no `context/` to drop)
- cwd `.cursor/` preserved (starter `.cursor/` had no files to merge)

**Install notes**: `npm install` completed; 3 packages had install scripts blocked (`esbuild@0.28.2`, `esbuild@0.28.1`, `workerd@1.20260911.1`). `npm run dev` / `astro build` may need `npm install-scripts approve` for those packages if binaries are missing.

## Post-scaffold audit

**Tool**: npm audit --json
**Summary**: 0 CRITICAL, 0 HIGH, 0 MODERATE, 0 LOW
**Direct vs transitive**: 0/0/0/0 direct of total 0/0/0/0 (no advisories; npm audit v2 `metadata.dependencies` did not include a `direct` count)

#### CRITICAL findings

none

#### HIGH findings

none

#### MODERATE findings

none

#### LOW / INFO findings

none

Audit exit code: 0. `metadata.vulnerabilities.total`: 0. Dependency graph: 804 packages (377 prod, 269 dev).

## Hints recorded but not acted on

| Hint                       | Value                              |
| -------------------------- | ---------------------------------- |
| bootstrapper_confidence    | first-class                        |
| quality_override           | false                              |
| path_taken                 | standard                           |
| self_check_answers         | null                               |
| team_size                  | solo                               |
| deployment_target          | cloudflare-pages                   |
| ci_provider                | github-actions                     |
| ci_default_flow            | auto-deploy-on-merge               |
| has_auth                   | false                              |
| has_payments               | false                              |
| has_realtime               | false                              |
| has_ai                     | false                              |
| has_background_jobs        | false                              |

## Next steps

Next: a future skill will set up agent context (CLAUDE.md, AGENTS.md). For now, your project is scaffolded and verified — happy hacking.

Useful manual steps in the meantime:
- `git init` (if you have not already) to start your own repo history.
- Review any `.scaffold` siblings the conflict policy created and decide which version of each file to keep.
- Address audit findings per your project's risk tolerance — the full breakdown is in this log.
