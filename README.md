# PrintoKids

PrintoKids generates a solvable A4 worksheet, previews it, and prints it. The home page is a catalog of card kinds. A parent picks a kind, a level, and an optional character, then generates a new sheet in the browser. Child profiles and card settings stay on the device and are never sent to the server.

## Cards

| Card                   | Path              |
| ---------------------- | ----------------- |
| Labirynt               | `/maze`           |
| Symetria               | `/symmetry`       |
| Sudoku                 | `/sudoku`         |
| Sekwencje              | `/sequences`      |
| Nonogram               | `/nonogram`       |
| Dyktando graficzne     | `/dictation`      |
| Kto ma więcej          | `/money`          |
| Który nie pasuje       | `/odd-one-out`    |
| Skopiuj obrazek        | `/copy-drawing`   |
| Szlaczki               | `/patterns`       |
| Krzyżówka matematyczna | `/math-crossword` |

On the site the catalog sorts these by Polish title. `/how-it-works` explains each kind. Older Polish paths (`/labirynt`, `/symetria`, `/sekwencje`, `/dyktando`) redirect to the paths above.

## Tech Stack

- [Astro](https://astro.build/) v7 — server-rendered pages, React islands where the page is interactive
- [React](https://react.dev/) v19
- [TypeScript](https://www.typescriptlang.org/) v6
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Cloudflare Workers](https://workers.cloudflare.com/) — `main` deploys the staging Worker `printo-kids-staging`; `prod` deploys the production Worker `printo-kids`

## Prerequisites

- Node.js v22.14.0 (`.nvmrc`)
- npm

## Getting Started

```bash
npm install
npm run dev
```

The dev server listens on `http://localhost:4321`.

## Available Scripts

- `npm run dev` — development server (Cloudflare workerd)
- `npm run build` — production SSR build
- `npm run preview` — serve the production build
- `npm run lint` / `npm run lint:fix` — ESLint with type-checked rules
- `npm run format` — Prettier
- `npm test` — product tests (Node's built-in runner, files listed in the `test` script)
- `npm run smoke` — HTTP check against a running server (`BASE_URL`, default `http://localhost:4321`). `GET /` must return the catalog sentence, each card page its worksheet sentence, the old Polish paths a redirect, and the removed account routes 404
- `npm run depcruise` — dependency rules for `src` and `tests`

Playwright: `npx playwright test`. Locally the config reuses whatever already listens on port 4321; set `E2E_PORT` to a free port to build and serve this checkout. Contributor conventions are in `AGENTS.md`.

## Project Structure

```text
src/
  pages/          routes (catalog at /, one page per card)
  layouts/        Astro layouts
  components/     Astro and React; ui/ is the shadcn catalog
  hooks/          card page and settings
  lib/            one folder per card kind, plus shared sheet and profile code
public/           characters, thumbnails, other static files
context/          product notes (PRD, roadmap, glossary)
wrangler.jsonc    Cloudflare Workers config
```

## Deployment

Workers Builds deploys from `main` (staging, `X-Robots-Tag: noindex`) and from `prod` (production). The environment is chosen at build time with `CLOUDFLARE_ENV`. A manual deploy is `npm run build`, then `npx wrangler deploy`.

## CI

Push and pull request to `main` and `prod` run `.github/workflows/ci.yml`. When every changed path is under `context/`, the three jobs below are skipped and count as success. Otherwise each one fails the run when red.

- **ci** — `npm run lint`, `npm run depcruise`, `npm test`, `npx astro check`, and `npm run build`
- **smoke** — production preview, then `npm run smoke`
- **e2e** — Playwright on Chromium (`chromium`, `phone-360`, `pixel-7`, `tablet-768`). WebKit `iphone-13` stays in the on-demand `e2e-phone.yml`
