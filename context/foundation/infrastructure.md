---
project: PrintoKids
researched_at: 2026-09-25
recommended_platform: Cloudflare Workers
runner_up: Netlify
context_type: mvp
tech_stack:
  language: TypeScript
  framework: Astro 7 + React islands
  runtime: Cloudflare Workers (workerd) via @astrojs/cloudflare 14
---

## Recommendation

**Deploy on Cloudflare Workers.**

PrintoKids is a small, on-device maze printer: Astro 7 server output, React islands, no accounts, no realtime, and no background jobs. Cost is the priority, one region is enough for the MVP, and a later global audience is only a possibility. Cloudflare Workers is already the adapter in this repo (`@astrojs/cloudflare` 14.3.1, Wrangler 4.131.1), scored Pass on every platform criterion, and stays at $0 for this traffic unless a real page exceeds the free 10 ms CPU cap. The paid escape hatch is $5 per month. Netlify tied the raw criterion score and lost on production-deploy credits plus an adapter swap. AWS, GCP, and Azure experience did not change the shortlist: those clouds are a heavier operating surface than this MVP needs.

Checked against current docs on 2026-09-25.

## Platform Comparison

Scores are Pass / Partial / Fail. A Pass counts as 2, a Partial as 1, a Fail as 0. Cost, geography, and the adapter already in the repo then break ties. No platform was dropped: the app does not need a process that stays alive between requests, and every candidate runs JavaScript.

| Platform | CLI-first | Managed/Serverless | Agent-readable docs | Stable deploy API | MCP / Integration | Total |
|---|---|---|---|---|---|---|
| Cloudflare Workers | Pass | Pass | Pass | Pass | Pass | 10 |
| Netlify | Pass | Pass | Pass | Pass | Pass | 10 |
| Vercel | Pass | Pass | Pass | Pass | Partial | 9 |
| Fly.io | Pass | Pass | Pass | Partial | Partial | 8 |
| Railway | Partial | Pass | Pass | Partial | Pass | 8 |
| Render | Pass | Pass | Partial | Pass | Fail | 7 |

**Cloudflare Workers.** `wrangler deploy`, `wrangler rollback`, and `wrangler tail` cover the loop. Docs publish `llms.txt`. Official remote MCP servers exist for docs, bindings, builds, and observability (observability tools are still expanding; status checked 2026-09-25). Workers Free is $0: 100,000 requests per day, unlimited unbilled static assets, 10 ms CPU per request. Workers Paid starts at $5 per month with 10 million included requests and a default 30-second CPU limit. The network is global at no extra region fee. Astro 7 with `@astrojs/cloudflare` 14 deploys here, not to Pages.

**Netlify.** Same criterion total. Free is $0 with a hard 300 credits per month. A production deploy costs 15 credits, so about 20 production deploys consume the month before traffic does. Preview deploys are not metered. Astro SSR runs as a Function in one region (default US East, Ohio) with a 60-second synchronous limit and 1024 MB. Edge middleware is capped at 50 ms CPU. Personal is $9 per month for 1,000 credits. Official MCP is at `https://netlify-mcp.netlify.app/mcp`. Using it means replacing the Cloudflare adapter.

**Vercel.** Strong Astro adapter, preview URL per push, `vercel rollback`, and global delivery. Hobby is $0 with about 1 million edge requests, 1 million function invocations, and a 300-second function limit, which is the most room for a later server-side generator. Hobby is non-commercial only. A product that charges requires Pro at $20 per deploying seat per month, plus usage past a $20 credit. Exceeding Hobby limits pauses the resource until the 30-day window rolls off. Vercel MCP at `https://mcp.vercel.com` is Public Beta (changelog 2025-08-04; still presented as beta in current docs on 2026-09-25).

**Fly.io.** `fly deploy` and `fly logs` are solid, and docs publish `llms.txt`. Rollback is redeploying a previous image, not a first-class rollback of config and secrets. `fly mcp` hosts MCP servers; it is not an operations API for Fly itself. There is no lasting free tier: the trial is 2 VM-hours or 7 days, Machines stop after 5 minutes, and a card is required to continue. A small always-on Machine is on the order of a few dollars per month. That fights the cost priority for an app with no always-on process.

**Railway.** Docs publish `llms.txt`, and `railway mcp` / `https://mcp.railway.com` can deploy and read logs. Arbitrary rollback is a dashboard action; the CLI can redeploy or restart the latest deployment. After the trial, Free is $1 of credit per month, which does not cover an always-on Node service. Hobby is $5 per month. Co-located Postgres is real and unused by this MVP, because profiles stay on the device.

**Render.** CLI, deploy API, and rollback exist. Free static sites do not fit `output: "server"`. A free web service sleeps after 15 minutes without traffic and wakes in about a minute, with 750 instance hours per month. Docs are markdown; no `llms.txt` or official platform MCP was found on 2026-09-25. The cold start fights a parent who opens the app to print.

### Shortlisted Platforms

#### 1. Cloudflare Workers (Recommended)

It won because the criterion score is full, the monthly cost at this scale is $0 with a $5 ceiling if CPU is tight, the edge is included, and the repo already builds for this runtime. Pages is the wrong product name for this adapter version. The deploy target is a Worker.

#### 2. Netlify

Same raw score, a real Astro adapter, and a 60-second function limit that is kinder to server-side rendering than the free Worker CPU cap. The gap is the 15-credit production deploy, the single-region Function, and the work to leave `@astrojs/cloudflare`.

#### 3. Vercel

Best function-duration headroom and the smoothest Git preview loop after Cloudflare. The gap is commercial use: Hobby cannot host a paid product, and Pro starts at $20 per deploying seat. That misses the cost priority once PrintoKids is more than a personal project.

## Anti-Bias Cross-Check: Cloudflare Workers

### Devil's Advocate — Weaknesses

1. Workers Free allows 10 ms of CPU per request. Cloudflare's limits page (updated 2026-09-05) says server-side rendering often uses 10–20 ms. An ordinary Astro response can return error 1102 (`exceededCpu`) and force Workers Paid at $5 per month on day one.
2. `context/foundation/tech-stack.md` still says Cloudflare Pages. `@astrojs/cloudflare` 14 on Astro 7 does not deploy to Pages. A Git integration aimed at Pages can show a green build while the domain keeps serving a different Worker.
3. Maze generation is specified as on-device and under 5 seconds. Moving harder worksheets onto the Worker later hits the free CPU cap immediately, and the 128 MB isolate memory limit on both Free and Paid.
4. The adapter provisions a `SESSION` KV namespace on deploy unless sessions are turned off, and the default image service is a Cloudflare Images binding. Unused bindings are easy to leave in place.
5. `wrangler rollback` restores Worker code only, and only among the latest 100 versions. It does not restore KV, R2, or D1.

### Pre-Mortem — How This Could Fail

The team trusts the starter label "Cloudflare Pages" and connects GitHub to a Pages project. Merges look successful. Parents still see the old site, because the domain points at a Worker that Pages never updates. After the switch to Workers, the first real Astro render exceeds 10 ms of CPU and Cloudflare returns error 1102. The $5 paid plan fixes the errors and ends the zero-cost plan. A later experiment saves child profiles on the server, writes past the free KV daily cap, and a rollback brings the previous script back while the deleted namespace stays gone. Harder worksheets are then generated on the Worker to spare weak laptops. CPU time and the 128 MB memory cap make large grids fail, and the print flow is no longer reliable. The free-tier choice was never measured against a real page before it was treated as the production plan.

### Unknown Unknowns

- Local development is `npm run dev`. On `@astrojs/cloudflare` 13 and later, `astro dev` and `astro preview` already run `workerd`. A separate `wrangler dev` loop is not the workflow this version expects. The Astro deploy guide still shows `wrangler dev` after a build; prefer `npm run preview` for the production bundle.
- Environments are chosen at build time with `CLOUDFLARE_ENV`. `wrangler deploy --env` is the Astro 5 pattern and does not apply. One build per environment.
- Workers Builds uses `npx wrangler deploy` on the production branch and defaults to `npx wrangler versions upload` on other branches. The upload does not promote production. The first upload of a new Worker must be `wrangler deploy`; `versions upload` fails on a Worker that does not exist yet. Fork pull requests are not built unless that is configured.
- Official Astro docs and this repo's `wrangler.jsonc` deploy from the root config with `assets.directory` set to `./dist`. Some Astro 7 migrations instead deploy `dist/server/wrangler.json`. If the first deploy misses assets, that generated file is the config to try, and Workers Builds must call the same one.
- `compatibility_date` is pinned to `2026-05-08`. Changing it changes which Workers runtime behavior applies. Leave it until a feature actually requires a newer date.
- Static asset requests are free and unlimited. Only requests that invoke the Worker count toward 100,000 per day. Wall-clock time on an HTTP request is not capped while the client stays connected. CPU time is capped. A CPU-bound maze on the server spends the whole cap; waiting on the network does not.
- The Workers observability MCP is published at `https://observability.mcp.cloudflare.com/mcp`. Its own README still calls the tool list a work in progress (checked 2026-09-25). Logs on the Free plan: 200,000 events per day, kept for 3 days.

## Operational Story

- **Preview deploys**: Connect the Git repo under Workers Builds on the Worker, not a Pages project. Production branch build command `npx astro build`, deploy command `npx wrangler deploy`. Other branches default to `npx wrangler versions upload`, which stores a version and a preview URL and does not send production traffic there. Fork pull requests do not get that preview unless branch builds are configured for them. Preview URLs are version URLs on the Worker.
- **Secrets**: Production secrets live on the Worker. Set one with `npx wrangler secret put NAME`. Local dev reads gitignored `.dev.vars`. Account members who can edit the Worker can change secrets; Wrangler does not print the current value back. Putting a new value is the rotation. MVP data stays in the browser, so `SUPABASE_URL` and `SUPABASE_KEY` stay unset. Do not invent them for deploy.
- **Rollback**: `npx wrangler versions list`, then `npx wrangler rollback <version-id>`. That immediately creates a new deployment at 100% traffic. Only the 100 most recently published versions qualify. Typical time is the API call, not a rebuild. KV, R2, and D1 are not reverted. This MVP has no server data, so a code rollback does not owe a data rollback.
- **Approval**: A human publishes production (`wrangler deploy` or merging to the production branch), rotates a secret, deletes a KV/R2/D1 binding, and upgrades Free to Paid. An agent may build, run `npm run preview`, upload a non-production version, list versions, and read logs without promoting traffic.
- **Logs**: Live tail is `npx wrangler tail`. Retained logs are Workers Logs (observability is already `enabled` in `wrangler.jsonc`) and the observability MCP tool `query_worker_observability` after Cloudflare OAuth at `https://observability.mcp.cloudflare.com/mcp`. Free retention is 3 days.

## Risk Register

| Risk | Source | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| Astro SSR exceeds the free 10 ms CPU limit and returns error 1102 | Devil's advocate | M | H | On the first deploy, open a real page and check invocation status for `exceededCpu`. If it trips, move that Worker to Workers Paid ($5/month) before treating the URL as done. Keep maze generation in the browser. |
| A Pages project or a Pages-scoped API token deploys the wrong target | Devil's advocate | M | H | Deploy only with `npx wrangler deploy` to the Worker. Workers Builds deploy command is `npx wrangler deploy`. The API token needs Workers Scripts edit. Do not attach the production domain to a Pages project. |
| Later worksheets get generated on the Worker and blow CPU or the 128 MB isolate | Pre-mortem | M | H | MVP generation stays on-device and under 5 seconds. Revisit the platform only if a measured server-side generator cannot fit Workers Paid CPU and 128 MB. |
| Deploy provisions unused `SESSION` KV and an Images binding | Unknown unknowns | M | M | If no route uses `Astro.session`, set `session: false` on the Cloudflare adapter before the first deploy. If the app does not use `astro:assets` image optimization, set `imageService: "compile"`. Child profiles stay in the browser. |
| Rollback restores code and leaves deleted KV, R2, or D1 behind | Devil's advocate | L | M | Do not store MVP state in Workers data products. If a binding is added later, treat it as forward-only and back it up before a destructive change. |
| `wrangler deploy --env` or a single build ships the wrong environment | Unknown unknowns | M | M | Set `CLOUDFLARE_ENV` for the build that produces the deploy. Build once per environment. Do not pass `--env` to `wrangler deploy` for this adapter. |
| Root `wrangler.jsonc` and `dist/server/wrangler.json` disagree, so assets 404 | Unknown unknowns | L | M | First deploy uses the root `wrangler.jsonc` already in the repo (`main` is the Astro Cloudflare entrypoint, assets directory `./dist`). If assets 404, redeploy with `npx wrangler deploy --config dist/server/wrangler.json` and point Workers Builds at the command that worked. |
| Observability MCP cannot answer a log query the CLI can | Research finding | L | L | Use `npx wrangler tail` as the source of truth. Treat the observability MCP as a convenience; its tool list was still marked in progress on 2026-09-25. |

## Getting Started

Versions in this repo: Astro `^7.3.2`, `@astrojs/cloudflare` `^14.3.1`, Wrangler `^4.131.1`. Wrangler is already a dev dependency. Use `npx wrangler` so the CLI matches the adapter. Do not add a global Wrangler.

1. Authenticate the project CLI: `npx wrangler login`.
2. In `wrangler.jsonc`, change `name` from `10x-astro-starter` to `printo-kids` before the first deploy, so the `workers.dev` hostname is the product name. Leave `compatibility_date` at `2026-05-08` and keep `nodejs_compat`.
3. Develop with `npm run dev`. Check the production bundle with `npm run build`, then `npm run preview`. Both use `workerd`. Do not use `wrangler dev` as the day-to-day server.
4. First deploy, from the repo root: `npm run build`, then `npx wrangler deploy`. The first publish has to be `wrangler deploy`. `wrangler versions upload` fails until the Worker exists. Wrangler prints the `workers.dev` URL.
5. For merge-to-production deploys, connect the Git repository on that Worker under Workers Builds. Build command: `npx astro build`. Deploy command: `npx wrangler deploy`. Leave non-production branches on `npx wrangler versions upload`. Do not create a Cloudflare Pages project for this app.

If a production page returns error 1102, upgrade the Worker to Workers Paid ($5/month) and redeploy. Do not raise `limits.cpu_ms` on the Free plan; that setting applies on Paid.

## Out of Scope

The following were not evaluated in this research:

- Docker image configuration
- CI/CD pipeline setup
- Production-scale architecture (multi-region, HA, DR)
