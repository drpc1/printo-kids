# Repository Guidelines

PrintoKids is an Astro 7 SSR app (React 19 islands, TypeScript, Tailwind 4, Cloudflare adapter) that generates a solvable A4 maze, previews it, and prints it. Product and stack lock: @context/foundation/prd.md and @context/foundation/tech-stack.md. Starter-era agent notes: @CLAUDE.md.

## Hard rules

- MVP has no accounts, payments, AI, or backend jobs. Keep maze and optional child-profile data on-device; do not wire new product flows to the shipped Supabase auth stack (@context/foundation/tech-stack.md).
- Never commit `.env` or `.dev.vars`. Server secrets are `SUPABASE_URL` and `SUPABASE_KEY` via `astro:env` in @astro.config.mjs; copy @.env.example to `.env` (Node) or `.dev.vars` (Cloudflare local).
- Merge Tailwind classes with `cn()` from `@/lib/utils` (@src/lib/utils.ts). Do not concatenate class strings.
- Do not add Next.js `'use client'` (or similar) directives. `astro/no-set-html-directive` is an ESLint error (@eslint.config.js).

## Commands

Run from the repo root on Node 22.14.0 (@.nvmrc). Scripts: @package.json.

- `npm run dev` — Cloudflare workerd local server
- `npm run lint` / `npm run lint:fix` — ESLint with type-checked rules
- `npm run format` — Prettier (Astro + Tailwind plugins, @.prettierrc.json)
- `npm run build` / `npm run preview` — production SSR build and preview
- `npm run smoke` — auth-flow HTTP check against a running server (`BASE_URL`, default `http://localhost:4321`)

Husky lint-staged runs `eslint --fix` on `*.{ts,tsx,astro}` and `prettier --write` on `*.{json,css,md}`.

## Structure and conventions

- `src/pages/` routes and `src/pages/api/` endpoints; `src/layouts/` Astro layouts; `src/components/` Astro + React; `src/components/ui/` shadcn new-york (@components.json); `src/lib/` helpers; `src/middleware.ts` attaches `locals.user` and gates `PROTECTED_ROUTES`.
- Import with `@/*` → `./src/*` (@tsconfig.json). Use Astro for static content and layout; React only when interactivity is required. Add shadcn pieces with `npx shadcn@latest add [name]`.
- API routes export uppercase `GET` / `POST`. Put shared DTOs in `src/types.ts`. Extract React hooks to `src/hooks/` (`@/hooks` in @components.json).
- Full SSR: `output: "server"` in @astro.config.mjs. Deploy with `npx wrangler deploy` (@wrangler.jsonc). If you later add Postgres tables, name migrations `YYYYMMDDHHmmss_short_description.sql` and enable RLS per operation and role.

## Tests and CI

There is no unit-test runner. The only automated check is `scripts/smoke.mjs` (starter auth flow, not a product suite). CI on `main` (@.github/workflows/ci.yml) runs `npm run lint`, `npx astro check`, and `npm run build` (needs `SUPABASE_URL` / `SUPABASE_KEY` repository secrets), plus a smoke job against local Supabase. Commit-message convention is unset (no git history yet).

## UI

- Screen colors are the role utilities from `src/styles/global.css` (`background`, `foreground`, `muted-foreground`, `primary`, `primary-foreground`, `card`, `destructive`, `border`, `ring`). A new color is a new token there; hexes inside the tweakcn block stay legal.
- Pages and components do not add hex colors, `--pk-*`, `bg-cosmic`, or Tailwind palette color classes. Arbitrary layout values such as `print:h-[297mm]` and `ring-[3px]` are not color literals and are not banned by this sentence.
- `@page` stays in `src/components/WorksheetHome.astro`. Inter and Lora stay names in the theme and are not loaded from a view.
- Shared controls live in `src/components/ui`. Check that catalog before writing a new one; add a missing one with `npx shadcn@latest add`.
