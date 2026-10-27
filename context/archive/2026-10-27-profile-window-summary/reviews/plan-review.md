<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Okno profilu z podsumowaniem i plakietki w katalogu

- **Plan**: context/changes/profile-window-summary/plan.md
- **Mode**: Deep (lokalna weryfikacja)
- **Date**: 2026-10-27
- **Verdict**: REVISE
- **Findings**: 0 critical, 2 warnings, 1 observation

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| End-State Alignment   | PASS    |
| Lean Execution        | WARNING |
| Architectural Fitness | WARNING |
| Blind Spots           | WARNING |
| Plan Completeness     | PASS    |

## Grounding

5/5 paths ✓, 4/4 symbols ✓ (ProfileCorner stany poziomu, withFavorite, openingVisit, LevelChoiceRows), brief↔plan ✓, Progress↔fazy ✓

## Findings

### F1 — Wyspa React `client:load` w katalogu SSR na Cloudflare

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Architectural Fitness
- **Location**: Phase 3, pkt 1
- **Detail**: Żadna strona nie renderuje dziś wyspy React po stronie serwera (wszystkie generatory to `client:only`), a `astro.config.mjs` nie ma aliasu `react-dom/server.edge`, którego React 19 wymaga na workerd. Plakietki nie są interaktywne, a AGENTS.md mówi „React only when interactivity is required”.
- **Fix A ⭐ Recommended**: Skrypt Astro (`<script>` w `CardCatalog.astro`) wypełnia sloty plakietek renderowane przez Astro; czyta profil tymi samymi funkcjami z `src/lib`.
  - Strength: bez React SSR i hydratacji, kafelki i sloty są w HTML od razu, mniej kodu.
  - Tradeoff: logika DOM w skrypcie zamiast komponentu; testy tylko e2e (reguły i teksty już w `card-summary`).
  - Confidence: HIGH — pasuje do zasady repo i do tego, że wszystko, co zależy od profilu, i tak ładuje się po wczytaniu.
  - Blind spot: import `@/lib/*` w skrypcie Astro musi przejść przez bundler (do sprawdzenia w buildzie).
- **Fix B**: Zostawić React, dodać alias `react-dom/server.edge` w `vite` i sprawdzić build.
  - Strength: komponent testowalny jak reszta React.
  - Tradeoff: zmiana konfiguracji budowania dla jednej plakietki, ryzyko dla wszystkich stron.
  - Confidence: MEDIUM — alias jest udokumentowany, ale nie wypróbowany w tym repo.
  - Blind spot: wpływ aliasu na dev (workerd) nie sprawdzony.
- **Decision**: FIXED

### F2 — Wysokość okna edycji na telefonie

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 2
- **Detail**: Okno z imieniem, postacią, zdaniem, sześcioma wierszami po 44 px i dwoma przyciskami jest wyższe niż dzisiejsze. Treść okna się przewija (`dialog-body`), ale plan sprawdza to tylko ręcznie.
- **Fix**: Dopisać do e2e (phone-360, pixel-7) sprawdzenie, że „Zapisz” i „Anuluj” są osiągalne (po przewinięciu) i że lista nie wychodzi poza okno.
- **Decision**: FIXED

### F3 — Zmiana poziomu paska po utworzeniu profilu na /labirynt

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Migration Notes
- **Detail**: `handleCreated` stosuje `profile.level` na pasku, więc po decyzji „zawsze domyślny” nowy profil na labiryncie przestawia pasek na Poziom 3. Plan to opisuje i brief też; test e2e (a) powinien to utrwalić.
- **Fix**: Dodać do przypadku (a) w `profile-summary.spec.ts` asercję, że pasek pokazuje „Poziom: 3” po utworzeniu.
- **Decision**: FIXED
