# PrintoKids

PrintoKids generates a solvable A4 maze, previews it, and prints it.

## Tech Stack

- [Astro](https://astro.build/) v7 - Modern web framework with server-first rendering
- [React](https://react.dev/) v19 - UI library for interactive components
- [TypeScript](https://www.typescriptlang.org/) v6 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4 - Utility-first CSS framework
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge deployment runtime

## Prerequisites

- Node.js v22.14.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server (Cloudflare workerd runtime)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with type-checked rules
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Run Prettier
- `npm test` - Run the product test suite
- `npm run smoke` - HTTP check of the product page against a running server (`BASE_URL`, defaults to `http://localhost:4321`). `GET /` must return 200 and the A4 maze sentence; the removed account routes must return 404.

## Project Structure

```md
.
├── src/
│ ├── layouts/ # Astro layouts
│ ├── pages/ # Astro pages
│ │ └── api/ # API endpoints
│ ├── components/ # UI components (Astro & React)
│ └── assets/ # Static assets
├── public/ # Public assets
├── wrangler.jsonc # Cloudflare Workers config
```

## Deployment

This project deploys to [Cloudflare Workers](https://workers.cloudflare.com/).

1. Build the project:

```bash
npm run build
```

2. Deploy with Wrangler:

```bash
npx wrangler deploy
```

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs two jobs on every push and pull request to `main`. Both jobs fail the run when red.

- **ci** — `npm run lint`, `npm test`, `npx astro check`, and `npm run build`.
- **smoke** — a separate job that builds the app, serves the production preview, and runs `npm run smoke` (the product-page HTTP check) against it.

## License

MIT
