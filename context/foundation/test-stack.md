# Test stack

## E2E

<!-- Written by /10x-e2e-setup. Re-run it to change this section; other skills only read it. -->

- runner: Playwright Test, @playwright/test 1.64.0
- config: playwright.config.ts
- single-spec command: npx playwright test tests/e2e/seed.spec.ts
- full-suite command: npx playwright test
- base URL: http://localhost:4321
- port: 4321 (detected from Astro's documented preview default; astro.config.mjs sets no server.port; detected default 4321, override with E2E_PORT)
- web server command: npm run build && npm run preview -- --port $E2E_PORT; reuseExistingServer outside CI
- auth setup project: none
- storageState: none
- seed: tests/e2e/seed.spec.ts — protects worksheet-generate-shows-maze (Generuj reveals the maze on the screen)
- browser CLI: playwright-cli, command skill at .cursor/skills/playwright-cli/SKILL.md
- updated: 2026-10-10
