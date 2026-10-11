# Remove starter scaffold Implementation Plan

## Overview

Aplikacja przestaje serwować logowanie i dashboard ze startera. Sprawdzian HTTP, pod tą samą nazwą joba `smoke`, pilnuje strony produktu. Pliki dodane po starterze zostają.

## Current State Analysis

Wejście `/` to kartka: `src/pages/index.astro` renderuje `WorksheetHome`, a zdanie „Wygeneruj labirynt i wydrukuj go na kartce A4.” jest w HTML z serwera. `WorksheetGenerator` jest wyspą `client:only="react"`, więc przycisk Generuj i rysunek labiryntu pojawiają się dopiero w przeglądarce.

Obok tego żyje zamknięty graf kont ze startera. Strony `src/pages/auth/*` i `src/pages/dashboard.astro`, API `src/pages/api/auth/*` oraz `src/components/auth/*` wołają siebie nawzajem i `src/lib/supabase.ts`. `src/middleware.ts` przy każdym żądaniu ustawia `locals.user` i chroni tylko `/dashboard`. Jedyny odczyt `locals.user` jest w `dashboard.astro`. `Layout.astro` importuje `Banner.astro` i `src/lib/config-status.ts`, a strona główna i tak podaje `showConfigBanner={false}`. `src/env.d.ts` opisuje wyłącznie typ użytkownika Supabase. `.env.example` ma tylko `SUPABASE_URL` i `SUPABASE_KEY`. `public/template.png` występuje w README startera. Katalog `supabase/` służy lokalnemu stosowi kont.

Job `ci` wstrzykuje sekrety Supabase do buildu. Job `smoke` stawia lokalne Supabase i odpala `scripts/smoke.mjs` po flow kont. Identyfikatory jobów `ci` i `smoke` są kontekstami wymaganymi przy merge. Labirynt, kartka, postacie, ostatnie parametry i profile dzieci nie importują tego grafu. Profile i ostatnie parametry siedzą w `localStorage`. `Button`, `dialog`, `input`, `lucide-react` i `tw-animate-css` są używane przez kartkę i profile.

`CLAUDE.md` nadal opisuje logowanie, middleware i smoke kont. Notatka tej zmiany każe ten plik usunąć i nie pisać następcy. `AGENTS.md` ma zdanie kierujące do `CLAUDE.md` oraz zdania o sekretach, middleware i smoke kont. `README.md` nadal jest podręcznikiem „10x Astro Starter”. `context/deployment/deploy-plan.md` mówi, że `src/lib/supabase.ts` zwraca `null`, gdy brakuje sekretów.

## Desired End State

Wejście do aplikacji to kartka do druku. Adresy `/auth/signin`, `/auth/signup`, `/auth/confirm-email` i `/dashboard` nie serwują ekranów konta. `GET /` zwraca 200 i zawiera zdanie „Wygeneruj labirynt i wydrukuj go na kartce A4.”. Build i job `smoke` nie potrzebują Supabase. `CLAUDE.md` nie istnieje. `AGENTS.md` i `README.md` nie każą odtwarzać logowania.

### Key Discoveries:

- Graf kont nie ma importu z `src/lib/maze`, `src/lib/sheet`, `src/lib/child-profiles`, `src/lib/last-used`, `WorksheetHome`, `WorksheetGenerator`, `dialog`, `input` ani z `tests/e2e`.
- `src/components/WorksheetHome.astro` trzyma zdanie produktu w HTML serwera. Generuj nie jest w tym HTML, bo wyspa ma `client:only="react"`.
- `src/middleware.ts` puszcza `/` dalej. Nie przekierowuje kartki.
- Joby w `.github/workflows/ci.yml` nazywają się `ci` i `smoke`. Tych identyfikatorów nie wolno zmienić.
- `package.json` nadal ma `"name": "10x-astro-starter"`. Ta nazwa zostaje.
- `Welcome.astro`, `Topbar.astro`, `LibBadge.astro` i `bg-cosmic` już zniknęły.

## What We're NOT Doing

- Kasowanie albo przerabianie plików dodanych po starterze: kartka, generator, labirynt, arkusz, postacie, profile, ostatnie parametry, ich testy, `tests/e2e/seed.spec.ts`, `public/characters/`, Playwright, Stryker, hooki.
- Kasowanie `src/components/ui/button.tsx`, `dialog.tsx`, `input.tsx` oraz paczek `lucide-react`, `tw-animate-css`, `class-variance-authority`, `@radix-ui/react-slot`, `radix-ui`.
- Zmiana nazwy paczki `10x-astro-starter`.
- Zmiana nazwy workflow `CI` albo identyfikatorów jobów `ci` i `smoke`.
- Asercja przycisku Generuj albo rysunku labiryntu w `scripts/smoke.mjs`. To zostaje przy istniejącym teście Playwright.
- Nowy podręcznik w miejsce `CLAUDE.md`.
- Edycja `context/foundation/test-plan.md`, `context/foundation/infrastructure.md`, `context/foundation/tech-stack.md` i `context/foundation/prd.md`.
- Edycja reszty `context/deployment/deploy-plan.md` poza zdaniem, które wskazuje na `src/lib/supabase.ts`.

## Implementation Approach

Jedna faza zdejmuje graf kont i w tym samym kroku przepisuje sprawdzian oraz dokumenty, które by ten graf odtworzyły. Najpierw odpiąć importy w `Layout.astro`, `astro.config.mjs` i workflow, potem kasować pliki, których już nic nie czyta. Pliki produktu zostają nietknięte.

## Critical Implementation Details

- `Layout.astro` musi przestać importować `Banner.astro` i `src/lib/config-status.ts` w tym samym kroku, w którym te pliki znikają. `astro.config.mjs` musi stracić schemat `SUPABASE_*` w tym samym kroku, w którym znikają `src/lib/supabase.ts` i `src/lib/config-status.ts`, bo to jedyni czytelnicy `astro:env/server`.
- Identyfikatory jobów zostają `ci` i `smoke`, a nazwa workflow zostaje `CI`. Reguła brancha porównuje te identyfikatory.
- Sprawdzian HTTP nie szuka słowa Generuj. Wyspa `client:only="react"` dopisuje ten przycisk dopiero w przeglądarce. W HTML z serwera jest zdanie z `WorksheetHome.astro`.

## Faza 1: Stos auth, sprawdzian i dokumenty startera

### Overview

Aplikacja nie serwuje ekranów konta, CI nie startuje Supabase, a dokumenty nie opisują logowania startera. Kartka, profile i zestaw UI zostają.

### Changes Required:

#### 1. Ekrany, API i komponenty konta

**File**: `src/pages/auth/`, `src/pages/dashboard.astro`, `src/pages/api/auth/`, `src/components/auth/`

**Intent**: Usunąć ekrany logowania, rejestracji, potwierdzenia maila i dashboard oraz API, które je obsługuje. Produkt ich nie woła.

**Contract**: Znikają `signin.astro`, `signup.astro`, `confirm-email.astro`, `dashboard.astro`, `src/pages/api/auth/signin.ts`, `signup.ts`, `signout.ts` oraz cały katalog `src/components/auth/`. Żaden plik pod `src/` nie importuje `@/components/auth`.

#### 2. Klient Supabase, middleware, baner i typ użytkownika

**File**: `src/middleware.ts`, `src/lib/supabase.ts`, `src/lib/config-status.ts`, `src/components/Banner.astro`, `src/env.d.ts`, `src/layouts/Layout.astro`, `src/pages/index.astro`

**Intent**: Zdjąć z każdego żądania klienta konta i baner o braku Supabase. Layout zostaje, bo owija kartkę.

**Contract**: Cztery pliki klienta, middleware, banera i `src/env.d.ts` są usunięte. `Layout.astro` nie importuje `Banner` ani `missingConfigs`, nie ma propa `showConfigBanner`, a domyślny tytuł to `PrintoKids`. `index.astro` nie przekazuje `showConfigBanner`. Zostawia `title="PrintoKids"`, `lang="pl"` i `WorksheetHome`. `src/styles/global.css` zostaje, łącznie z importem `tw-animate-css`.

#### 3. Konfiguracja Supabase i paczki

**File**: `astro.config.mjs`, `supabase/`, `.env.example`, `public/template.png`, `package.json`, `package-lock.json`

**Intent**: Build nie deklaruje sekretów, których aplikacja nie czyta. Obrazek hero startera i lokalny projekt Supabase znikają.

**Contract**: Z `astro.config.mjs` znika blok `env.schema` z `SUPABASE_URL` i `SUPABASE_KEY` oraz import `envField`, jeśli nic innego go nie używa. Zostają `output: "server"`, integracje React i sitemap, Tailwind, `session: false` i adapter Cloudflare. Znikają katalog `supabase/`, `.env.example` i `public/template.png`. Z zależności znikają `@supabase/ssr`, `@supabase/supabase-js` i devDependency `supabase`. Pole `"name"` zostaje `10x-astro-starter`. Lockfile jest zgodny z tym zestawem.

#### 4. Sprawdzian HTTP i workflow

**File**: `scripts/smoke.mjs`, `.github/workflows/ci.yml`

**Intent**: Jedyny sprawdzian HTTP ma pilnować strony produktu i tego, że trasy konta zniknęły. CI nie stawia lokalnego Supabase i nie wstrzykuje sekretów.

**Contract**: `GET /` oczekuje statusu 200 i ciała zawierającego dokładnie `Wygeneruj labirynt i wydrukuj go na kartce A4.` `GET /auth/signin`, `GET /auth/signup`, `GET /auth/confirm-email` i `GET /dashboard` oczekują statusu 404. Skrypt nie zakłada ciastek, konta ani przekierowania na `/auth/signin`. W workflow nazwa zostaje `CI`, identyfikatory jobów zostają `ci` i `smoke`, a Node dalej pochodzi z `node-version-file: .nvmrc`. Job `ci` nie ustawia `SUPABASE_URL` ani `SUPABASE_KEY`. Job `smoke` nie używa `supabase/setup-cli`, nie uruchamia `supabase start` ani `supabase stop` i nie zapisuje `.env` z kluczami. Nadal buduje aplikację, podnosi preview i odpala `npm run smoke`.

#### 5. Dokumenty, które odtwarzają starter

**File**: `CLAUDE.md`, `AGENTS.md`, `README.md`, `context/deployment/deploy-plan.md`

**Intent**: Agent i osoba czytająca README nie dostają instrukcji stawiania logowania. Notatka zmiany zabrania nowego podręcznika w miejsce `CLAUDE.md`.

**Contract**: `CLAUDE.md` jest usunięty i żaden nowy plik go nie zastępuje. Z `AGENTS.md` znika zdanie `Starter-era agent notes: @CLAUDE.md.` Zdania o `SUPABASE_URL`, `SUPABASE_KEY`, `.env.example`, `src/middleware.ts`, `locals.user`, `PROTECTED_ROUTES` i o smoke jako flow kont są usunięte albo przepisane tak, że smoke jest sprawdzianem HTTP strony produktu, a build nie wymaga sekretów Supabase. Zdanie twarde o braku kont zostaje przepisane tak, że MVP nie ma kont, a dane kartki i profili zostają na urządzeniu, bez nazwy dostarczonego stosu auth Supabase i bez odesłania do tego stosu w `tech-stack.md`. Znika zdanie o migracjach Postgresa (`YYYYMMDDHHmmss_short_description.sql`) i o RLS. Te reguły napisze plasterek bazy, gdy powstanie. Reszta `AGENTS.md` zostaje, w tym `cn()`, `npm test` jako bramka produktu, tokeny i mutacje. `README.md` nie ma tytułu „10x Astro Starter”, obrazka `template.png` ani adresu klonowania `przeprogramowani/10x-astro-starter`. Znika sekcja konfiguracji Supabase oraz instrukcje Supabase z tych miejsc: punkt Supabase w Tech Stack, kroki 3–4 w Getting Started (w tym kopiowanie `.env.example`), opis `smoke` w Available Scripts, zdanie o sekretach w Deployment, sekcja Smoke test oraz opis joba `smoke` i sekretów w CI. Deploy na Cloudflare zostaje, bez `SUPABASE_URL` i `SUPABASE_KEY`. README opisuje lokalne `dev`, `build`, `preview`, `lint`, `test` i `smoke` strony produktu. W `deploy-plan.md` zdanie, które wskazuje na `src/lib/supabase.ts` i mówi, że klient zwraca `null`, zostaje zastąpione zakazem ustawiania `SUPABASE_URL` i `SUPABASE_KEY`, bo aplikacja nie ma klienta Supabase. Reszta planu deployu zostaje.

### Success Criteria:

#### Automated Verification:

- Usunięte są katalogi i pliki auth, `src/middleware.ts`, `src/lib/supabase.ts`, `src/lib/config-status.ts`, `src/components/Banner.astro`, `src/env.d.ts`, `supabase/`, `.env.example`, `public/template.png` i `CLAUDE.md`; pod `src/` nie ma importu `@/lib/supabase`, `@/components/auth`, `@/components/Banner` ani `@/lib/config-status`
- `Layout.astro` nie importuje banera, domyślny tytuł to `PrintoKids`, a `index.astro` nie przekazuje `showConfigBanner`
- `package.json` nie zawiera `@supabase/ssr`, `@supabase/supabase-js` ani `supabase`, a `"name"` zostaje `10x-astro-starter`
- `npm test`, `npm run lint` i `npx astro check` przechodzą
- `npm run build` przechodzi bez `SUPABASE_URL` i `SUPABASE_KEY`
- `scripts/smoke.mjs` wymaga 200 i zdania `Wygeneruj labirynt i wydrukuj go na kartce A4.` na `GET /` oraz 404 na `/auth/signin`, `/auth/signup`, `/auth/confirm-email` i `/dashboard`
- `.github/workflows/ci.yml` zostawia joby `ci` i `smoke`, nie startuje Supabase i nie wstrzykuje `SUPABASE_URL` ani `SUPABASE_KEY`
- `AGENTS.md` nie wskazuje na `CLAUDE.md`, nie opisuje sekretów Supabase, middleware, smoke kont, dostarczonego stosu auth Supabase ani migracji Postgresa i RLS; `README.md` nie każe klonować `10x-astro-starter` ani konfigurować Supabase; `deploy-plan.md` nie wskazuje na `src/lib/supabase.ts`

#### Manual Verification:

- Wejście na `/` pokazuje kartkę ze zdaniem o labiryncie A4 i przyciskiem Generuj, a `/auth/signin` oraz `/dashboard` nie są ekranami logowania

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets — the corresponding `- [ ]` checkboxes for these items live in the `## Progress` section at the bottom of the plan.

## Testing Strategy

### Unit Tests:

- Istniejące `npm test` zostaje bez nowych asercji labiryntu i bez testów konta. Ma przejść na nietkniętym generatorze, arkuszu, profilach i ostatnich parametrach.

### Integration Tests:

- `scripts/smoke.mjs` przeciw podglądowi produkcji: status i zdanie na `/`, 404 na czterech trasach startera.
- `npm run build` bez zmiennych `SUPABASE_*`.

### Manual Testing Steps:

1. Otworzyć `/` i sprawdzić zdanie „Wygeneruj labirynt i wydrukuj go na kartce A4.” oraz przycisk Generuj po zamontowaniu wyspy.
2. Otworzyć `/auth/signin` i `/dashboard` i sprawdzić, że nie ma formularza logowania ani dashboardu.
3. Kliknąć Generuj i potwierdzić, że kartka z labiryntem nadal się pojawia.

## Performance Considerations

Job `smoke` przestaje stawiać lokalne Supabase, więc ten przebieg jest krótszy. Ścieżka kartki nie dostaje nowego żądania sieciowego.

## Migration Notes

Danych do przeniesienia nie ma. Profile i ostatnie parametry zostają w przeglądarce. Zignorowane `.env` i `.dev.vars` mogą nadal zawierać stare klucze; aplikacja ich nie czyta.

## References

- Notatka zmiany: `context/changes/remove-starter-scaffold/change.md`
- Outcome F-02: `context/foundation/roadmap.md`
- Bramka produktu bez asercji kont: `context/foundation/test-plan.md` (ten plan tego pliku nie edytuje)
- Zdanie strony: `src/components/WorksheetHome.astro`
- Joby CI: `.github/workflows/ci.yml`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Stos auth, sprawdzian i dokumenty startera

#### Automated

- [x] 1.1 Usunięte są katalogi i pliki auth, `src/middleware.ts`, `src/lib/supabase.ts`, `src/lib/config-status.ts`, `src/components/Banner.astro`, `src/env.d.ts`, `supabase/`, `.env.example`, `public/template.png` i `CLAUDE.md`; pod `src/` nie ma importu `@/lib/supabase`, `@/components/auth`, `@/components/Banner` ani `@/lib/config-status`
- [x] 1.2 `Layout.astro` nie importuje banera, domyślny tytuł to `PrintoKids`, a `index.astro` nie przekazuje `showConfigBanner`
- [x] 1.3 `package.json` nie zawiera `@supabase/ssr`, `@supabase/supabase-js` ani `supabase`, a `"name"` zostaje `10x-astro-starter`
- [x] 1.4 `npm test`, `npm run lint` i `npx astro check` przechodzą
- [x] 1.5 `npm run build` przechodzi bez `SUPABASE_URL` i `SUPABASE_KEY`
- [x] 1.6 `scripts/smoke.mjs` wymaga 200 i zdania `Wygeneruj labirynt i wydrukuj go na kartce A4.` na `GET /` oraz 404 na `/auth/signin`, `/auth/signup`, `/auth/confirm-email` i `/dashboard`
- [x] 1.7 `.github/workflows/ci.yml` zostawia joby `ci` i `smoke`, nie startuje Supabase i nie wstrzykuje `SUPABASE_URL` ani `SUPABASE_KEY`
- [x] 1.8 `AGENTS.md` nie wskazuje na `CLAUDE.md`, nie opisuje sekretów Supabase, middleware, smoke kont, dostarczonego stosu auth Supabase ani migracji Postgresa i RLS; `README.md` nie każe klonować `10x-astro-starter` ani konfigurować Supabase; `deploy-plan.md` nie wskazuje na `src/lib/supabase.ts`

#### Manual

- [x] 1.9 Wejście na `/` pokazuje kartkę ze zdaniem o labiryncie A4 i przyciskiem Generuj, a `/auth/signin` oraz `/dashboard` nie są ekranami logowania
