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

## Projekty telefonu (phone-worksheet, S-09)

- projects: `chromium` (Desktop Chrome), `phone-360` (Chromium 360×780, dotyk), `pixel-7` (Chromium), `iphone-13` (WebKit), `tablet-768` (Chromium 768×1024, dotyk)
- layout spec: `tests/e2e/phone-layout.spec.ts`; `seed.spec.ts` runs on every project
- local run: `E2E_PORT=4398 npx playwright test` (port 4321 is often taken by another dev server and `reuseExistingServer` would test that server)
- WebKit: Playwright 1.64 WebKit crashes at launch on the Windows dev machine (exit 0xC0EA0002), so `iphone-13` is skipped on Windows unless `E2E_WEBKIT=1`
- CI: job `e2e` in `.github/workflows/ci.yml` runs on push and pull request to `main` (Ubuntu, Chromium projects `chromium`, `phone-360`, `pixel-7`, `tablet-768`) and uploads `playwright-report` on failure; the on-demand workflow `.github/workflows/e2e-phone.yml` (`workflow_dispatch`) runs all five projects, including `iphone-13` (WebKit). Gdy każda ścieżka leży w `context/`, joby `ci`, `smoke` i `e2e` są pominięte i liczą się jako sukces, a podgląd nie powstaje. Ścieżka spoza katalogu, któraś strona rename albo błąd liczenia uruchamia wszystkie trzy.
- updated: 2026-10-15
