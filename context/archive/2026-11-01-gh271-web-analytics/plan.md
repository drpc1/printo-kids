# Licznik Web Analytics na stronie produkcyjnej Implementation Plan

## Overview

Wstawiamy skrypt Cloudflare Web Analytics (GitHub 271) do layoutu, ale tylko na Workerze produkcyjnym `printo-kids`. Staging (`printo-kids-staging`), lokalny dev i testy e2e nie dostają skryptu, więc nie zaśmiecają statystyk.

## Current State Analysis

- Jedyny layout to `src/layouts/Layout.astro`; używają go wszystkie strony (`index`, `maze`, `symmetry`, `sequences`, `sudoku`, `nonogram`, `dictation`, `how-it-works`). Żadna nie jest prerenderowana, więc wszystko idzie przez SSR i ma dostęp do `env` w runtime.
- Środowisko rozpoznaje się po `ENVIRONMENT`: `wrangler.jsonc` ustawia `ENVIRONMENT=staging` tylko w `env.staging.vars`; produkcja nie ma tej zmiennej. `src/middleware.ts` czyta ją przez `env` z `cloudflare:workers` i przekazuje do czystej funkcji `robotsHeader` (`src/lib/robots.ts`), którą testuje `src/lib/robots.test.ts`.
- Panel Cloudflare ma już wpisany hostname `printo-kids.printokids.workers.dev`; brakuje tylko skryptu na stronie.

### Key Discoveries:

- Wzorzec do naśladowania: czysta funkcja plus test w `node --test` (`src/lib/robots.ts`, `src/lib/robots.test.ts`); nowe testy trzeba dopisać ręcznie do skryptu `test` w `package.json`.
- `astro dev`, `astro preview`, lokalny build i e2e (`playwright.config.ts`, port 4321, build w CI bez `CLOUDFLARE_ENV`) czytają główną część `wrangler.jsonc`; tylko `CLOUDFLARE_ENV=staging` (`.github/workflows/ci.yml:56`) przełącza na staging. Zmienna środowiskowa nie odróżni więc lokalnego dev i e2e od produkcji; odróżnia je hostname.
- Token (`7699341d37474a38b7d4585e3fb50ab8`) jest publiczny; może być stałą w repozytorium.
- Fragment z panelu to `<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "…"}'>`.

## What We're NOT Doing

- Nie zmieniamy konfiguracji panelu Cloudflare ani nie dodajemy własnych zdarzeń czy pomiarów.
- Nie zmieniamy `wrangler.jsonc` (żadnej zmiennej `ENVIRONMENT=production`).
- Nie dodajemy banera zgody ani ciasteczek (licznik działa bez nich).
- Nie dodajemy skryptu do stagingu ani do lokalnego dev; nie ma zmiennej na token.
- Nie zmieniamy CSP ani nagłówków (repo ich nie ustawia).

## Implementation Approach

Lista dozwolonych po hostname: skrypt wstawia się tylko, gdy żądanie przyszło na `printo-kids.printokids.workers.dev` i `ENVIRONMENT` nie jest `staging`. Czysta funkcja w `src/lib/analytics.ts` zwraca dane skryptu albo `undefined`; `Layout.astro` przekazuje jej `Astro.url.hostname` i `env.ENVIRONMENT` i renderuje tag warunkowo tuż przed `</body>`.

## Phase 1: Skrypt tylko na produkcji

### Overview

Funkcja z testem i wpięcie w layout.

### Changes Required:

#### 1. Funkcja wyboru skryptu

**File**: `src/lib/analytics.ts`, `src/lib/analytics.test.ts`

**Intent**: Jedno miejsce decyduje, czy dane żądanie dostaje licznik, i trzyma publiczny token. Test jak przy `robots.test.ts`.

**Contract**: `webAnalyticsBeacon(hostname: string, environment: string | undefined): { src: string; data: string } | undefined`. Dla hostname `printo-kids.printokids.workers.dev` i `environment !== "staging"` zwraca `src` `https://static.cloudflareinsights.com/beacon.min.js` i `data` jako JSON `{"token":"7699341d37474a38b7d4585e3fb50ab8"}`; dla każdego innego hostname (`localhost`, `printo-kids-staging.printokids.workers.dev`, pusty) albo `environment === "staging"` zwraca `undefined`. Stała hostname jest jedyną rzeczą do zmiany, gdy pojawi się własna domena.

#### 2. Wpięcie w layout

**File**: `src/layouts/Layout.astro`

**Intent**: Skrypt jest na każdej stronie produkcji, przed `</body>`, a poza produkcją nie ma go w HTML.

**Contract**: w frontmatter `env` z `cloudflare:workers` i `webAnalyticsBeacon(Astro.url.hostname, typeof env.ENVIRONMENT === "string" ? env.ENVIRONMENT : undefined)`; tag `<script is:inline type="module" src={beacon.src} data-cf-beacon={beacon.data}>` renderowany tylko gdy wynik istnieje (`is:inline`, żeby Astro nie przepakowywał zewnętrznego skryptu).

#### 3. Rejestracja testu

**File**: `package.json`

**Intent**: `npm test` uruchamia nowy test.

**Contract**: dopisać `src/lib/analytics.test.ts` do skryptu `test`.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`

#### Manual Verification:

- Lokalnie (`npm run dev`) w źródle strony nie ma `beacon.min.js`
- Po wdrożeniu `printo-kids` jedna wizyta na `printo-kids.printokids.workers.dev` pojawia się w Observability → Web analytics
- Wejście na `printo-kids-staging` nie pojawia się w Web analytics, a w źródle strony nie ma skryptu

**Implementation Note**: Po automatycznych sprawdzeniach zatrzymaj się na potwierdzenie ręczne po wdrożeniu produkcji (merge `main` → `prod`).

---

## Testing Strategy

### Unit Tests:

- produkcyjny hostname bez `ENVIRONMENT` zwraca src i data z tokenem
- `localhost`, hostname stagingu, pusty hostname oraz produkcyjny hostname z `ENVIRONMENT="staging"` zwracają `undefined`

### Manual Testing Steps:

1. Otwórz stronę produkcji, zobacz `beacon.min.js` w źródle i żądanie do `cloudflareinsights.com`
2. Sprawdź to samo na stagingu: brak skryptu
3. Po kilku minutach sprawdź licznik w panelu

## Migration Notes

Wdrożenie na produkcję idzie zwykłym wydaniem `main` → `prod` (zob. AGENTS.md, „Branches and releases”). Cofnięcie: revert zmiany. Własna domena w przyszłości wymaga dopisania jej hostname w `src/lib/analytics.ts` i w panelu Cloudflare.

## References

- Issue: drpc1/printo-kids#271
- Wzorzec: `src/lib/robots.ts`, `src/lib/robots.test.ts`, `src/middleware.ts`
- Przegląd planu: `context/changes/gh271-web-analytics/reviews/plan-review.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Skrypt tylko na produkcji

#### Automated

- [x] 1.1 Testy przechodzą: `npm test` — 236f51c
- [x] 1.2 Lint przechodzi: `npm run lint` — 236f51c
- [x] 1.3 Typy przechodzą: `npx astro check` — 236f51c
- [x] 1.4 Build przechodzi: `npm run build` — 236f51c

#### Manual

- [x] 1.5 Lokalnie (`npm run dev`) w źródle strony nie ma `beacon.min.js`
- [x] 1.6 Po wdrożeniu `printo-kids` jedna wizyta na `printo-kids.printokids.workers.dev` pojawia się w Observability → Web analytics
- [x] 1.7 Wejście na `printo-kids-staging` nie pojawia się w Web analytics, a w źródle strony nie ma skryptu
