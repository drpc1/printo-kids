# e2e-in-ci-gate — Plan

## Overview

Playwright e2e (projekty Chromium) wchodzą do bramki CI przy push i PR do `main`. Odwraca to decyzję z S-09 (`context/archive/2026-10-13-phone-worksheet/plan.md:286`), uzasadnioną tym, że WebKit nie startował na Windowsie; Chromium działa wszędzie, a zmiany nazw przycisków (np. S-27) psuły e2e bez sygnału w CI.

## Current State

- `.github/workflows/ci.yml`: joby `ci` i `smoke`.
- `playwright.config.ts`: w CI `workers: 1`, `retries: 2`, `webServer` buduje i uruchamia preview; projekty `chromium`, `phone-360`, `pixel-7`, `tablet-768`, `iphone-13` (WebKit poza Windowsem).
- `.github/workflows/e2e-phone.yml`: ręczny, wszystkie projekty.

## What We're NOT Doing

- WebKit (`iphone-13`) w bramce: zostaje w ręcznym `e2e-phone.yml`.
- Ustawianie wymaganego checka w ochronie gałęzi (robi użytkowniczka w GitHub).
- Zmiany w specyfikacjach e2e.

## Phase 1: Job `e2e` w ci.yml

### Changes Required

- `.github/workflows/ci.yml`
  - **Intent**: trzeci job `e2e` obok `ci` i `smoke`, niezależny od nich.
  - **Contract**: ubuntu-latest, node z `.nvmrc`, `npm ci`, `npx playwright install --with-deps chromium`, `npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`, upload `playwright-report/` przy `failure()`.

### Success Criteria

#### Automated Verification:

- Job `e2e` na PR jest zielony.
- Czas joba zmierzony i zgłoszony użytkowniczce.

#### Manual Verification:

- Użytkowniczka decyduje o doborze projektów i o wymaganym checku.

## Phase 2: Dokumenty

### Changes Required

- `AGENTS.md` (Tests and CI), `context/foundation/test-stack.md` (linia CI), `context/foundation/test-plan.md` (dwa zdania), komentarz w `.github/workflows/e2e-phone.yml`.
  - **Intent**: opisać e2e jako część bramki, WebKit jako ręczny.
  - **Contract**: brak zdań „Playwright poza bramką CI”.

### Success Criteria

#### Automated Verification:

- `grep -rn "nie ma go w bramce\|CI: none" AGENTS.md context/foundation` bez trafień.

#### Manual Verification:

- Treść dokumentów zgodna z ci.yml.

## Progress

### Phase 1: Job `e2e` w ci.yml

#### Automated

- [x] 1.1 Job `e2e` na PR jest zielony (2m37s)
- [x] 1.2 Czas joba zmierzony i zgłoszony

#### Manual

- [ ] 1.3 Decyzja o doborze projektów i wymaganym checku

### Phase 2: Dokumenty

#### Automated

- [x] 2.1 Brak zdań „Playwright poza bramką CI”

#### Manual

- [ ] 2.2 Treść dokumentów zgodna z ci.yml
