# Walidacja pull requestów w istniejącym CI — plan implementacji

## Overview

Pull request do `master` ma dalej przechodzić przez jeden workflow, `.github/workflows/ci.yml`. Ten plan dopina wersję Node do `.nvmrc`, wyrównuje opisy tego przebiegu i wskazuje wymagane checki, które człowiek włącza w GitHubie. Drugi plik workflow i deploy w Actions zostają poza zakresem.

## Current State Analysis

Workflow już startuje na `push` i `pull_request` do `master` (`.github/workflows/ci.yml:3-7`). Job `ci` robi `npm ci`, `npx astro sync`, `npm run lint`, `npm test`, `npx astro check` i `npm run build` z sekretami `SUPABASE_URL` oraz `SUPABASE_KEY` (`ci.yml:10-26`). Job `smoke` stawia lokalne Supabase, buduje podgląd i odpala `npm run smoke` po flow kont startera (`ci.yml:28-56`, `scripts/smoke.mjs:39-58`). W Actions nie ma `wrangler deploy`.

Node w obu jobach to major `22` (`ci.yml:16`, `ci.yml:34`). `.nvmrc` trzyma `22.14.0`.

Opisy się rozjeżdżają. `README.md:185-188` pomija `npm test` w jobie `ci`. `CLAUDE.md:55` sprowadza przebieg do lintu i buildu. `AGENTS.md:34` wymienia właściwe komendy i nazywa `npm test` bramką produktu, a `scripts/smoke.mjs` sprawdzianem kont startera, ale nie mówi wprost, że ten sam przebieg leci na pull request.

Plan testów zostawia `npm test` jako bramkę produktu i zabrania dokładania asercji startera do smoke (`context/foundation/test-plan.md:55`, faza 4 jeszcze `not started`). `F-02` (`remove-starter-scaffold`) jest `proposed` i ma osobno podmienić sprawdzian HTTP. Infrastruktura kieruje publikację do Cloudflare Workers Builds (`context/foundation/infrastructure.md:113-114`) i wyłącza pipeline deployu z researchu (`infrastructure.md:122`). Plan pierwszego deployu zostawia `ci.yml` bez kroku deployu (`context/deployment/deploy-plan.md:37`). `tech-stack.md` deklaruje auto-deploy przy merge, a roadmapa zapisuje, że tego deployu nie ma (`context/foundation/roadmap.md:72`).

## Desired End State

Pull request do `master` uruchamia ten sam plik co dziś. Oba joby biorą Node `22.14.0` z `.nvmrc`. Job `ci` i job `smoke` dalej muszą być zielone, żeby przebieg był zielony. `README.md`, `CLAUDE.md` i `AGENTS.md` opisują ten sam zestaw zdarzeń i kroków. Po ręcznym ustawieniu na `master` czerwony `CI / ci` albo czerwony `CI / smoke` zatrzymuje merge pull requestu.

### Key Discoveries:

- Jedyny workflow to `.github/workflows/ci.yml`. Nazwa workflow to `CI`, identyfikatory jobów to `ci` i `smoke`, więc checki w GitHubie nazywają się `CI / ci` i `CI / smoke`.
- `actions/setup-node@v4` czyta wersję z pliku przez `node-version-file`. Klucz `node-version` ma zniknąć z obu kroków, żeby w jobie został jeden sposób wyboru Node.
- YAML raportuje wynik. Sam plik nie blokuje merge’a. W repozytorium nie ma reguły branch protection.
- Smoke zostaje sprawdzianem kont startera. Bramka produktu zostaje przy `npm test`.

## What We're NOT Doing

- Drugi plik workflow tylko dla pull requestów.
- `npx wrangler deploy` albo inny deploy w GitHub Actions.
- Podłączanie Workers Builds i zmiany w `wrangler.jsonc`.
- Zdejmowanie joba `smoke` z `pull_request`, oznaczanie go jako niewymagany albo dodawanie asercji startera.
- Fazę 4 planu testów i plasterek `F-02` / `remove-starter-scaffold`.
- Wymaganie aktualności brancha, rozwiązywania konwersacji, zakazu bezpośredniego pusha na `master` i wyłączenia obejścia dla administratorów.
- Pin akcji do pełnego SHA i zmiany sekretów Supabase.

## Implementation Approach

Zostaje jeden plik i obecna lista kroków. W obu krokach `actions/setup-node@v4` wersja Node pochodzi z `.nvmrc`, czyli z tego samego pinu, którego używa reszta repozytorium. Trzy opisy dostają ten sam kontrakt: push i pull request do `master`, job `ci` (lint, `npm test`, `astro check`, build z sekretami), job `smoke` (konta startera na lokalnym Supabase), oba joby psują przebieg, gdy są czerwone. Publikacja zostaje przy Workers Builds. Blokadę merge’a włącza człowiek w ustawieniach `master`, po nazwach checków wynikających z `name: CI` i identyfikatorów jobów.

## Critical Implementation Details

Nazwa wymaganego checka to `CI / ci` i `CI / smoke`, a nie sam identyfikator joba. Zmiana `name:` workflow albo klucza joba zmienia nazwę, którą faza 2 wpisuje w GitHubie, więc faza 1 tych dwóch napisów nie rusza.

`node-version` i `node-version-file` nie stoją obok siebie w tym samym kroku. Zostaje `node-version-file: .nvmrc`. Ścieżka jest względem katalogu repozytorium po `actions/checkout`.

## Faza 1: Kontrakt w repozytorium

### Overview

Workflow bierze Node z `.nvmrc`, a README, CLAUDE i AGENTS opisują przebieg, który naprawdę leci na pull request do `master`.

### Changes Required:

#### 1. Pin Node w obu jobach

**File**: `.github/workflows/ci.yml`

**Intent**: CI ma używać `22.14.0` z `.nvmrc`, tak jak lokalna praca, zamiast dowolnego aktualnego Node 22.

**Contract**: W obu krokach `actions/setup-node@v4` jest `node-version-file: .nvmrc` i nie ma `node-version`. Zostają `name: CI`, identyfikatory `ci` i `smoke`, zdarzenia `push` oraz `pull_request` na `master`, cache `npm`, sekrety buildu i cała lista komend, łącznie z `npm run smoke`.

#### 2. Ten sam opis przebiegu

**File**: `README.md` (sekcja `## CI`), `CLAUDE.md` (akapit o GitHub Actions), `AGENTS.md` (akapit o CI w sekcji testów)

**Intent**: Kolejny agent czyta w trzech miejscach ten sam przebieg, który jest w workflow.

**Contract**: Każdy z trzech tekstów mówi, że push i pull request do `master` uruchamiają `.github/workflows/ci.yml`, że job `ci` obejmuje `npm run lint`, `npm test`, `npx astro check` i `npm run build` z sekretami `SUPABASE_URL` oraz `SUPABASE_KEY`, i że osobny job `smoke` odpala sprawdzian kont startera na lokalnym Supabase. Oba joby psują przebieg, gdy są czerwone. `AGENTS.md` zostawia zdanie, że `npm test` jest bramką produktu, a `scripts/smoke.mjs` nie jest tą suitą. Styl odwołań `@ścieżka` w `AGENTS.md` zostaje.

### Success Criteria:

#### Automated Verification:

- W `ci.yml` są dwa `node-version-file: .nvmrc` i nie ma klucza `node-version`
- Zdarzenia `push` i `pull_request` na `master` oraz joby `ci` i `smoke` zostają, razem z komendami `npm run lint`, `npm test`, `npx astro check`, `npm run build` i `npm run smoke`
- `README.md`, `CLAUDE.md` i `AGENTS.md` opisują push, pull request, `npm test` w jobie `ci` i job `smoke`

#### Manual Verification:

- Trzy opisy nie obiecują deployu z Actions ani drugiego pliku workflow

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie kryterium manualnego, zanim ruszy faza 2. W blokach faz są zwykłe listy. Odpowiadające im pola `- [ ]` są w sekcji `## Progress`.

---

## Faza 2: Wymagane checki

### Overview

Czerwony pull request do `master` nie wchodzi, gdy człowiek włączy w GitHubie wymagane checki obu jobów.

### Changes Required:

#### 1. Reguła brancha `master`

**File**: ustawienia repozytorium GitHub dla brancha `master` (poza drzewem plików)

**Intent**: Wynik workflow ma zatrzymywać merge pull requestu. Sam YAML tego nie robi.

**Contract**: Na `master` włączone jest wymaganie status checków przed merge’em. Wymagane nazwy to dokładnie `CI / ci` i `CI / smoke`. Innych reguł ta faza nie dodaje. Nazwa workflow zostaje `CI`, identyfikatory jobów zostają `ci` i `smoke`.

### Success Criteria:

#### Manual Verification:

- Na `master` wymagane checki to `CI / ci` i `CI / smoke`
- Pull request z czerwonym jobem `ci` albo `smoke` nie wchodzi na `master`

**Implementation Note**: Ta faza jest ręczna. Agent jej nie włączy. Po fazie 1 człowiek z uprawnieniem do ustawień repozytorium potwierdza oba kryteria, zanim change uznamy za domknięty.

---

## Testing Strategy

### Unit Tests:

- Brak nowych testów. Pin Node i opisy nie zmieniają suity `npm test`.

### Integration Tests:

- Brak nowego sprawdzianu HTTP. Job `smoke` zostaje przy obecnym `scripts/smoke.mjs`.

### Manual Testing Steps:

1. Po fazie 1 przeczytać sekcję CI w `README.md`, akapit w `CLAUDE.md` i akapit w `AGENTS.md` obok `.github/workflows/ci.yml` i potwierdzić ten sam zestaw zdarzeń i kroków.
2. W ustawieniach brancha `master` wyszukać checki `CI / ci` i `CI / smoke` i oznaczyć oba jako wymagane przed merge’em.
3. Otworzyć pull request, w którym jeden z tych jobów jest czerwony, i potwierdzić, że merge na `master` jest zablokowany. Zielony przebieg obu jobów merge’a nie blokuje.

## Performance Considerations

Job `smoke` zostaje najdłuższym kawałkiem przebiegu, bo startuje lokalne Supabase. Ten plan nie dokłada kroków, drugiego workflow ani kolejnego buildu.

## Migration Notes

Danych do przeniesienia nie ma. Otwarty pull request dostaje pin Node przy następnym commicie na tym branchu. Wymagane checki zaczynają obowiązywać dopiero po fazie 2. Oba joby już raportują się na `master`, więc nazwy `CI / ci` i `CI / smoke` powinny być na liście wyboru bez czekania na nowy, specjalny przebieg.

## References

- Workflow: `.github/workflows/ci.yml`
- Wersja Node: `.nvmrc`
- Bramka produktu i smoke: `context/foundation/test-plan.md`
- Publikacja: `context/foundation/infrastructure.md`, `context/deployment/deploy-plan.md`
- Deklaracja auto-deploy: `context/foundation/tech-stack.md`
- `F-02` i brak auto-deploy: `context/foundation/roadmap.md`
- Opisy do wyrównania: `README.md`, `CLAUDE.md`, `AGENTS.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Kontrakt w repozytorium

#### Automated

- [x] 1.1 W `ci.yml` są dwa `node-version-file: .nvmrc` i nie ma klucza `node-version`
- [x] 1.2 Zdarzenia `push` i `pull_request` na `master` oraz joby `ci` i `smoke` zostają, razem z komendami `npm run lint`, `npm test`, `npx astro check`, `npm run build` i `npm run smoke`
- [x] 1.3 `README.md`, `CLAUDE.md` i `AGENTS.md` opisują push, pull request, `npm test` w jobie `ci` i job `smoke`

#### Manual

- [x] 1.4 Trzy opisy nie obiecują deployu z Actions ani drugiego pliku workflow

### Phase 2: Wymagane checki

#### Manual

- [ ] 2.1 Na `master` wymagane checki to `CI / ci` i `CI / smoke`
- [ ] 2.2 Pull request z czerwonym jobem `ci` albo `smoke` nie wchodzi na `master`
