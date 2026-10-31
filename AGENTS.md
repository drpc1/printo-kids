# Repository Guidelines

PrintoKids is an Astro 7 SSR app (React 19 islands, TypeScript, Tailwind 4, Cloudflare adapter) that generates a solvable A4 maze, previews it, and prints it. Product and stack lock: @context/foundation/prd.md and @context/foundation/tech-stack.md.

## Hard rules

- MVP has no accounts, payments, AI, or backend jobs. Keep maze and optional child-profile data on-device.
- Never commit `.env` or `.dev.vars`.
- Merge Tailwind classes with `cn()` from `@/lib/utils` (@src/lib/utils.ts). Do not concatenate class strings.
- Do not add Next.js `'use client'` (or similar) directives. `astro/no-set-html-directive` is an ESLint error (@eslint.config.js).

## Commands

Run from the repo root on Node 22.14.0 (@.nvmrc). Scripts: @package.json.

- `npm run dev` — Cloudflare workerd local server
- `npm run lint` / `npm run lint:fix` — ESLint with type-checked rules
- `npm run format` — Prettier (Astro + Tailwind plugins, @.prettierrc.json)
- `npm run build` / `npm run preview` — production SSR build and preview
- `npm test` — Node's built-in test runner (`node --test`) on the files named in the `test` script (@package.json)
- `npm run smoke` — HTTP check of the product page against a running server (`BASE_URL`, default `http://localhost:4321`)

Husky lint-staged runs `eslint --fix` on `*.{ts,tsx,astro}` and `prettier --write` on `*.{json,css,md}`.

## Structure and conventions

- `src/pages/` routes and `src/pages/api/` endpoints; `src/layouts/` Astro layouts; `src/components/` Astro + React; `src/components/ui/` shadcn new-york (@components.json); `src/lib/` helpers.
- Import with `@/*` → `./src/*` (@tsconfig.json). Use Astro for static content and layout; React only when interactivity is required. Add shadcn pieces with `npx shadcn@latest add [name]`.
- API routes export uppercase `GET` / `POST`. Put shared DTOs in `src/types.ts`. Extract React hooks to `src/hooks/` (`@/hooks` in @components.json).
- A card generator page is a React island on `CardPage` (@src/components/CardPage.tsx) and `useCardPage` (@src/hooks/useCardPage.ts): it passes its settings controls, its sheet and what Generuj does, and does not copy the profile corner, the bar, Generuj or Drukuj. Its rules, layout in millimetres and SVG stay in its own module. The maze keeps its level memory outside `CardSettingsMap`.
- Full SSR: `output: "server"` in @astro.config.mjs. Deploy with `npx wrangler deploy` (@wrangler.jsonc).

## Tests and CI

`npm test` is the product check (Node's built-in runner). `scripts/smoke.mjs` is the HTTP check of the product page, not that suite. Push and pull request to `main` run @.github/workflows/ci.yml: job `ci` runs `npm run lint`, `npm test`, `npx astro check`, and `npm run build` (the build does not need Supabase secrets), a separate job `smoke` runs that HTTP check, and a job `e2e` runs Playwright on the Chromium projects (`chromium`, `phone-360`, `pixel-7`, `tablet-768`; WebKit `iphone-13` stays in the on-demand `e2e-phone.yml`). All three jobs fail the run when red. When every changed path is under `context/`, jobs `ci`, `smoke`, and `e2e` are skipped and count as success. The Workers Builds preview still runs. A path outside `context/`, either side of a rename, or a failure while counting paths runs all three. Locally, `playwright.config.ts` reuses whatever already listens on port 4321 (`reuseExistingServer`), so a dev server from another checkout is tested instead of this code; set `E2E_PORT` to a free port to build and serve the current tree. Commit-message convention is unset.

## UI

- Screen colors are the role utilities from `src/styles/global.css` (`background`, `foreground`, `muted-foreground`, `primary`, `primary-foreground`, `card`, `destructive`, `border`, `ring`). A new color is a new token there; hexes inside the tweakcn block stay legal.
- Pages and components do not add hex colors, `--pk-*`, `bg-cosmic`, or Tailwind palette color classes. Arbitrary layout values such as `print:h-[297mm]` and `ring-[3px]` are not color literals and are not banned by this sentence.
- `@page` stays in `src/components/GeneratorShell.astro` (shell of the generator pages; the maze is at `/maze`, `/` becomes the card catalog). Inter and Lora stay names in the theme and are not loaded from a view.
- Base controls (button, dialog, switch, input) live in `src/components/ui`, the shadcn catalog. Check that catalog before writing a new one; add a missing one with `npx shadcn@latest add`. Controls of the card pages built from those pieces (`LevelChoice`, `CategoryChoice`, `SudokuChoice`, `SettingToggle`) live next to the cards in `src/components`.

## Mutation testing

Repo uses Stryker for selective mutation testing on risk-critical modules.
Run it only for code covered by the current change or a risk from test-plan.md,
prefer narrowed scope with --mutate "path/to/file.ts:start-end", and do not chase
100% mutation score. Survived mutants should be reviewed one by one: add an
assertion only when the mutant represents a user-visible or business-relevant bug.
Each scope has its own config in `stryker/` and a script `npm run mutate:<scope>` (add `-- --mutate "file:start-end"` to narrow it); how to repeat a run and the results are in `context/changes/critical-paths-mutation-testing/reviews/stryker-results.md` and `context/foundation/test-plan.md` §5a.
