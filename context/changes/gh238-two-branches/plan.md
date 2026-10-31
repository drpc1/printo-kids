# Dwa środowiska: staging z `main` i produkcja z `prod` — plan

## Overview

Dziś `main` jest jedyną gałęzią i (według odpowiedzi właściciela) Workers Builds wdraża z niej produkcję `printo-kids`. Po zmianie `main` wdraża tylko staging (`printo-kids-staging`), a produkcja `printo-kids` wdraża się z nowej gałęzi `prod`, do której trafiają wyłącznie PR-y `main → prod`. Źródło: [GitHub #238](https://github.com/drpc1/printo-kids/issues/238).

## Current State Analysis

- `wrangler.jsonc` ma jeden Worker `printo-kids` i nie ma sekcji `env`.
- `.github/workflows/ci.yml` uruchamia `push` i `pull_request` tylko dla `main`; job `changes` czyta `scripts/context-only-diff.mjs` z commita bazowego.
- Ruleset „main: checki, pominięcie tylko przy pull request” (id 25797959) obejmuje tylko `refs/heads/main`: wymagane checki `ci` i `smoke`, `non_fast_forward`, `code_coverage` ≥ 50%, bypass dla roli repozytorium przy PR.
- `src/layouts/Layout.astro` nie ma `noindex`; nie ma `public/robots.txt` ani `src/middleware.ts`. `sitemap()` działa bez `site`.
- Nie ma `.github/PULL_REQUEST_TEMPLATE/`.
- Skrypt `test` w `package.json` wymienia pliki testów jawnie, więc nowy test trzeba dopisać.

## Desired End State

- Merge do `main` aktualizuje tylko Worker `printo-kids-staging`; produkcja się nie zmienia.
- Merge PR `main → prod` aktualizuje Worker `printo-kids`.
- Bezpośredni push do `prod` jest zablokowany, a PR wymaga zielonych `ci` i `smoke` oraz merge commita.
- Staging odpowiada nagłówkiem `X-Robots-Tag: noindex`; produkcja go nie ma.
- Proces jest opisany w `AGENTS.md`, a PR wydania ma szablon z listą testów ręcznych.

### Key Discoveries:

- `@astrojs/cloudflare` 14.3.1 czyta środowisko z `CLOUDFLARE_ENV` przy buildzie i wstawia `vars` danego env do `process.env` (`node_modules/@astrojs/cloudflare/dist/utils/wrangler-config.js:20-26`). Jeden build na środowisko, bez `wrangler deploy --env` (`context/foundation/infrastructure.md`, „Unknown Unknowns” i Risk Register).
- Workers Builds: pierwsze wdrożenie nowego Workera musi być `wrangler deploy`, a nie `versions upload` (`infrastructure.md`).
- Wygenerowany `dist/server/wrangler.json` ma dziś `definedEnvironments: []`; po dodaniu `env.staging` trzeba sprawdzić, czy build z `CLOUDFLARE_ENV=staging` emituje właściwą nazwę Workera i assets (ryzyko „root config kontra wygenerowany config” z `infrastructure.md`).
- Statyczne zasoby są serwowane z ASSETS bez uruchamiania Workera, więc nagłówek z middleware obejmie strony SSR (HTML), a nie pliki w `dist/client`. Dla indeksowania HTML wystarcza.

## What We're NOT Doing

- Cloudflare Access (decyzja: staging publiczny z `noindex`).
- Automatyzacji tagu, GitHub Release i merge'a wstecznego `prod → main` (ręcznie wg `AGENTS.md`).
- GitHub Environments, własnej domeny produkcji, zmiany `compatibility_date`.
- Zatwierdzeń drugiej osoby w ruleset `prod` i reguły `code_coverage` na `prod`.
- Zmian w kodzie produktu (karty, profile, druk).

## Implementation Approach

Kolejność chroni produkcję: najpierw tworzymy `prod` i przepinamy na nią Worker `printo-kids` (Faza 1), dopiero potem na `main` trafia kod stagingu. Kod (Fazy 2–3) idzie dwoma małymi PR-ami do `main`. Ustawienia GitHuba zakładam przez `gh` po osobnym potwierdzeniu właściciela, a kroki w panelu Cloudflare wykonuje właściciel według checklisty.

## Faza 1: Przepięcie produkcji na `prod`

### Overview

Produkcja przestaje zależeć od `main`, zanim cokolwiek zmieni się na `main`.

### Changes Required:

#### 1. Ustalenie wdrożonego commita i gałąź `prod`

**Intent**: Znaleźć commit, który dziś serwuje produkcja, i utworzyć z niego gałąź `prod`.

**Contract**: Commit z panelu Cloudflare (Workers & Pages → `printo-kids` → Deployments / Builds). Jeśli nie da się go ustalić, `prod` powstaje z aktualnego `main` (`3916fe1`), pod warunkiem że właściciel potwierdzi, że produkcja jest na tym stanie. `git push origin <sha>:refs/heads/prod`; wymaga zgody właściciela.

#### 2. Przepięcie Workers Builds (panel Cloudflare, właściciel)

**Intent**: Worker `printo-kids` buduje i wdraża z gałęzi `prod`.

**Contract**: Settings → Builds: branch `prod`; build `npx astro build`, deploy `npx wrangler deploy` (jak w `infrastructure.md`, „Operational Story”). Brak zmiany zmiennych środowiskowych (produkcja nie ustawia `CLOUDFLARE_ENV`). Wyłączyć buildy gałęzi nieprodukcyjnych (Settings → Builds → branch control), bo właściciel nie korzysta z podglądów PR i testuje na stagingu po kilku PR-ach naraz; inaczej każdy push do `main` i każdy PR zużywałby minuty buildów tego Workera.

### Success Criteria:

#### Automated Verification:

- Gałąź istnieje na GitHubie: `gh api repos/drpc1/printo-kids/branches/prod --jq .name`
- `prod` wskazuje wdrożony commit: `git rev-parse origin/prod`

#### Manual Verification:

- W panelu Cloudflare Worker `printo-kids` ma branch `prod` jako produkcyjny.
- Próbny build z `prod` (utworzenie gałęzi na tym samym SHA go nie uruchamia, więc użyć „Retry build” w panelu) kończy się sukcesem i produkcja nadal otwiera `/` i `/maze`.

**Implementation Note**: Po tej fazie zatrzymaj się na potwierdzenie właściciela, że przepięcie jest widoczne w panelu, zanim jakikolwiek PR trafi do `main`.

---

## Faza 2: Środowisko staging w kodzie

### Overview

`wrangler.jsonc` zna środowisko `staging`, a staging odpowiada `noindex`.

### Changes Required:

#### 1. Konfiguracja Workera

**File**: `wrangler.jsonc`

**Intent**: Dodać `env.staging` z Workerem `printo-kids-staging` i zmienną rozpoznającą staging; nie zmieniać konfiguracji najwyższego poziomu (produkcja).

**Contract**: `env.staging.name = "printo-kids-staging"`, `env.staging.vars.ENVIRONMENT = "staging"`; top-level bez zmian. Zachowane `assets`, `observability`, `compatibility_*`; to, co Wrangler dziedziczy z najwyższego poziomu, nie musi być powtarzane w `env.staging`, ale `vars` trzeba podać wprost (zmienne się nie dziedziczą).

#### 2. Nagłówek `X-Robots-Tag` na stagingu

**File**: `src/middleware.ts` (nowy), `src/lib/robots.ts` (nowy, czysta funkcja)

**Intent**: Middleware dodaje `X-Robots-Tag: noindex, nofollow` do odpowiedzi, gdy `ENVIRONMENT === "staging"`; na produkcji niczego nie zmienia.

**Contract**: Funkcja `robotsHeader(environment: string | undefined): string | undefined` w `src/lib/robots.ts` zwraca wartość nagłówka tylko dla `"staging"`. Middleware odczytuje `ENVIRONMENT` z konfiguracji Workera (sposób zgodny z adapterem 14, np. `cloudflare:workers`) i nie psuje `astro dev`/`astro preview`, gdzie zmiennej może nie być.

#### 3. Test

**File**: `src/lib/robots.test.ts` (nowy), `package.json` (dopisać plik do skryptu `test`)

**Intent**: Pilnuje, że staging dostaje `noindex`, a produkcja i brak zmiennej nie.

**Contract**: `robotsHeader("staging")` zwraca niepustą wartość z `noindex`; `robotsHeader("production")` i `robotsHeader(undefined)` zwracają `undefined`.

### Success Criteria:

#### Automated Verification:

- Lint: `npm run lint`
- Testy: `npm test`
- Typy: `npx astro check`
- Build produkcyjny: `npm run build` i `dist/server/wrangler.json` ma `"name":"printo-kids"`
- Build stagingu: `CLOUDFLARE_ENV=staging npm run build` i `dist/server/wrangler.json` ma `"name":"printo-kids-staging"` oraz `assets.directory` wskazujące na `../client`

#### Manual Verification:

- `CLOUDFLARE_ENV=staging npm run build && npm run preview`: `curl -I http://localhost:4321/maze` pokazuje `x-robots-tag: noindex`.
- Ten sam test bez `CLOUDFLARE_ENV` nie pokazuje nagłówka.

---

## Faza 3: CI, szablon PR wydania i dokumentacja

### Overview

CI działa dla `prod` i pilnuje, że oba środowiska się budują; proces wydania jest zapisany.

### Changes Required:

#### 1. Wyzwalacze i build stagingu w CI

**File**: `.github/workflows/ci.yml`

**Intent**: `push` i `pull_request` także dla `prod`; job `ci` buduje dodatkowo ze `CLOUDFLARE_ENV=staging` i sprawdza nazwę Workera w wygenerowanym configu.

**Contract**: `branches: [main, prod]` w obu wyzwalaczach. Dodatkowy krok po `npm run build`: build stagingu i asercja, że `dist/server/wrangler.json` zawiera `printo-kids-staging` (bez nowego jobu; nazwy jobów `ci` i `smoke` bez zmian, bo ruleset wymaga tych nazw). Sprawdzić, że job `changes` poprawnie wyznacza zakres diffu dla bazy `prod` (skrypt czytany z commita bazowego musi tam istnieć — `prod` powstaje z `main` po jego dodaniu).

#### 2. Szablon PR wydania

**File**: `.github/PULL_REQUEST_TEMPLATE/release.md` (nowy)

**Intent**: Lista zmian od ostatniego wydania i lista testów ręcznych z issue.

**Contract**: Sekcje: tytuł „Wydanie RRRR-MM-DD”, „Zmiany od ostatniego wydania”, „Testy na stagingu” (druk jednej strony A4 z marginesem 10 mm w Chrome, Edge, Brave, Firefox, Safari; telefon: Generuj i Drukuj nie nachodzą na siebie, karta mieści się na A4; każdy rodzaj karty), „Po merge” (tag `vRRRR.MM.DD`; drugie wydanie tego samego dnia dostaje sufiks `.2`, np. `vRRRR.MM.DD.2`). Użycie przez `?template=release.md`.

#### 3. Opis procesu

**File**: `AGENTS.md`

**Intent**: Krótko opisać gałęzie, środowiska i proces wydania, w tym merge commit bez squash, tag i merge wsteczny po pilnej poprawce.

**Contract**: Nowa sekcja „Branches and releases” (kilka linii) + poprawka zdania w „Tests and CI” o tym, że push i PR do `main` oraz `prod` uruchamiają CI. Zdanie „Deploy with `npx wrangler deploy`” doprecyzować (produkcja z `prod`, staging budowany z `CLOUDFLARE_ENV=staging`).

### Success Criteria:

#### Automated Verification:

- Lint/format plików md i yml: `npm run lint` oraz `npx prettier --check .github AGENTS.md`
- Testy: `npm test`
- PR do `main` ma zielone `ci`, `smoke`, `e2e`

#### Manual Verification:

- Szablon otwiera się pod `https://github.com/drpc1/printo-kids/compare/prod...main?template=release.md`.
- Opis w `AGENTS.md` zgadza się z tym, co faktycznie ustawiono.

---

## Faza 4: Ochrona `prod` i Worker stagingu

### Overview

`prod` jest chroniona, a `main` wdraża na staging.

### Changes Required:

#### 1. Ruleset `prod`

**Intent**: Wymusić PR, zielone checki i merge commit.

**Contract**: Nowy ruleset (cel: `refs/heads/prod`, enforcement active): `pull_request` z 0 wymaganych zatwierdzeń i `allowed_merge_methods: ["merge"]`; `required_status_checks`: `ci`, `smoke` i `e2e` (integration_id 15368, jak w rulesecie `main`; przed nałożeniem sprawdzić, że nazwa jobu `e2e` jest taka sama); `non_fast_forward`; `deletion`. Bez `code_coverage`. Zakładany przez `gh api` po potwierdzeniu właściciela, ewentualnie w UI.

#### 2. Worker `printo-kids-staging` (Cloudflare, właściciel)

**Intent**: `main` wdraża na osobny Worker stagingu.

**Contract**: Pierwszy deploy ręcznie: `CLOUDFLARE_ENV=staging npm run build` i `npx wrangler deploy` (nowy Worker nie przyjmie `versions upload`). Potem Workers Builds dla `printo-kids-staging`: branch `main`, zmienna buildu `CLOUDFLARE_ENV=staging`, build `npx astro build`, deploy `npx wrangler deploy`. Wyłączyć buildy gałęzi nieprodukcyjnych także na `printo-kids-staging` (bez podglądów PR). Sprawdzić aktualny darmowy limit minut buildów dla dwóch Workerów.

### Success Criteria:

#### Automated Verification:

- Ruleset istnieje i jest aktywny: `gh api repos/drpc1/printo-kids/rulesets --jq '.[].name'`

#### Manual Verification:

- Staging odpowiada: `curl -sI https://printo-kids-staging.<konto>.workers.dev/maze | grep -i x-robots-tag` (adres znany po pierwszym deployu).
- Bezpośredni `git push origin HEAD:prod` jest odrzucony.
- Panel Cloudflare: `printo-kids` ← `prod`, `printo-kids-staging` ← `main`.

---

## Faza 5: Weryfikacja końcowa

### Overview

Sprawdzenie warunków „gotowe, gdy” z issue na żywym układzie.

### Changes Required:

#### 1. Próbne wydanie

**Intent**: Przejść cały proces raz: zmiana na `main` → staging → PR `main → prod` → produkcja.

**Contract**: Drobna zmiana na `main` (np. wpis w `context/`), obserwacja, że zmienił się tylko staging; PR „Wydanie RRRR-MM-DD” z szablonem, merge commitem, tagiem; obserwacja produkcji; test hotfixu: gałąź z `prod` → PR → merge wsteczny `prod → main`.

### Success Criteria:

#### Manual Verification:

- Merge do `main` zmienia tylko staging.
- Merge `main → prod` zmienia produkcję i tworzy się tag `vRRRR.MM.DD` (`.2` przy drugim wydaniu dnia).
- Push do `prod` jest zablokowany, PR bez zielonego CI nie da się zmergować.
- Produkcja nie ma nagłówka `x-robots-tag`, staging ma.
- `localStorage` stagingu i produkcji są rozdzielone (profil ze stagingu nie jest widoczny na produkcji).

---

## Testing Strategy

### Unit Tests:

- `robotsHeader` dla `staging`, `prod`, `undefined`.

### Integration Tests:

- Dwa buildy w CI (`prod` i `staging`) i asercja nazwy Workera w `dist/server/wrangler.json`.

### Manual Testing Steps:

1. Fazy 1, 2 i 4: kroki z list ręcznych powyżej.
2. Faza 5: pełny cykl wydania.

## Migration Notes

- Okno ryzyka: między utworzeniem `prod` a przepięciem Workera `main` nie powinien dostawać zmian. Kolejność faz to zapewnia.
- Rollback: `npx wrangler versions list` i `npx wrangler rollback <version-id>` (`infrastructure.md`); gałąź `prod` cofa się tylko PR-em z revertem.
- Jeśli build ze `CLOUDFLARE_ENV=staging` nie emituje poprawnego configu, awaryjnie wdrożyć staging z `--config dist/server/wrangler.json` (opisane w `infrastructure.md`) i dopasować komendy Workers Builds.

## References

- Issue: https://github.com/drpc1/printo-kids/issues/238
- `context/foundation/infrastructure.md` (Operational Story, Risk Register)
- `node_modules/@astrojs/cloudflare/dist/utils/wrangler-config.js:20-26`
- `.github/workflows/ci.yml`, `wrangler.jsonc`, `scripts/context-only-diff.mjs`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Przepięcie produkcji na prod

#### Automated

- [x] 1.1 Gałąź prod istnieje na GitHubie
- [x] 1.2 prod wskazuje wdrożony commit

#### Manual

- [x] 1.3 Worker printo-kids ma w panelu Cloudflare branch prod jako produkcyjny
- [x] 1.4 Próbny build z prod kończy się sukcesem i produkcja otwiera / i /maze

### Phase 2: Środowisko staging w kodzie

#### Automated

- [ ] 2.1 Lint przechodzi
- [ ] 2.2 Testy przechodzą
- [ ] 2.3 Kontrola typów przechodzi
- [ ] 2.4 Build produkcyjny daje nazwę Workera printo-kids
- [ ] 2.5 Build stagingu daje nazwę printo-kids-staging i poprawne assets

#### Manual

- [ ] 2.6 Staging w preview zwraca x-robots-tag noindex
- [ ] 2.7 Build bez CLOUDFLARE_ENV nie zwraca nagłówka

### Phase 3: CI, szablon PR wydania i dokumentacja

#### Automated

- [ ] 3.1 Lint i prettier przechodzą
- [ ] 3.2 Testy przechodzą
- [ ] 3.3 PR do main ma zielone ci, smoke i e2e

#### Manual

- [ ] 3.4 Szablon wydania otwiera się przez template=release.md
- [ ] 3.5 Opis w AGENTS.md zgadza się z faktycznymi ustawieniami

### Phase 4: Ochrona prod i Worker stagingu

#### Automated

- [ ] 4.1 Ruleset prod istnieje i jest aktywny

#### Manual

- [ ] 4.2 Staging odpowiada z nagłówkiem x-robots-tag
- [ ] 4.3 Bezpośredni push do prod jest odrzucony
- [ ] 4.4 Panel Cloudflare: printo-kids z prod, printo-kids-staging z main

### Phase 5: Weryfikacja końcowa

#### Manual

- [ ] 5.1 Merge do main zmienia tylko staging
- [ ] 5.2 Merge main do prod zmienia produkcję i powstaje tag
- [ ] 5.3 Push do prod jest zablokowany, a PR bez zielonego CI nie da się zmergować
- [ ] 5.4 Produkcja nie ma nagłówka x-robots-tag, staging ma
- [ ] 5.5 localStorage stagingu i produkcji są rozdzielone
