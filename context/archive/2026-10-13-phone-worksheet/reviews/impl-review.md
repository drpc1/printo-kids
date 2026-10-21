<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Strona karty na telefonie (S-09)

- **Plan**: context/changes/phone-worksheet/plan.md
- **Scope**: Full plan (fazy 1–5; faza 6 jeszcze nie rozpoczęta)
- **Reviewed phases**: 1, 2, 3, 4, 5
- **Date**: 2026-10-16
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 3 warnings, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | WARNING |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Automated criteria re-run on HEAD 4b14020: npm test 103/103, lint 0 problems, astro check 0/0, build OK, `E2E_PORT=4398 npx playwright test` 15 passed / 1 skipped (iphone-13 skipped on Windows), seed 4/4. Manual: 2.8 pending (no touch emulation ≥768 px in the session browser); all other manual rows have measurements or user confirmation in the session.

## Findings

### F1 — settle() może zawisnąć na nieskończonej animacji

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: tests/e2e/phone-layout.spec.ts:31-33, :101
- **Detail**: `settle()` czeka na `finished` każdej animacji strony. Animacja z `iterations: Infinity` (np. przyszły spinner z tw-animate-css) nigdy się nie kończy, więc każdy test telefonu padnie po 30 s z mylącym błędem. Dodatkowo `page.viewportSize()?.width ?? 0` po cichu ustawiłoby szerokość 0.
- **Fix**: Filtrować animacje z `iterations === Infinity` w `settle()` i rzucać błąd zamiast `?? 0` przy braku viewportu.
- **Decision**: FIXED

### F2 — Workflow e2e-phone bez bloku permissions

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: .github/workflows/e2e-phone.yml:8
- **Detail**: Brak `permissions:`, więc job dostaje domyślny zakres tokenu repozytorium. Ryzyko małe (tylko ręczne uruchomienie, bez wejść), ale zasada najmniejszych uprawnień mówi `contents: read`. `ci.yml` też go nie ma; to poza zakresem S-09.
- **Fix**: Dodać `permissions: { contents: read }` na górze `e2e-phone.yml`.
- **Decision**: FIXED

### F3 — Adaptacje z faz 2 i 4 bez noty w planie

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/changes/phone-worksheet/plan.md (Faza 2 zmiana 1, Faza 4)
- **Detail**: Po refaktorze z main (#31) zmiana przycisku Profil i `DIALOG_ROW_CLASS` są w `src/components/ProfileCorner.tsx`, a plan mówi `WorksheetGenerator.tsx`. Nieopisane są też: czwarty wiersz (imię dziecka) objęty stałą, `DialogTitle` zostawiony na `text-lg`, wartość `padding-top: 3.5rem`, nadpisania `has-[>svg]` w `ACTION_BUTTON_CLASS`.
- **Fix**: Dopisać noty z implementacji w blokach faz 1, 2 i 4.
- **Decision**: FIXED

### F4 — test-plan mówi „nie ma go w CI”, a jest ręczny workflow

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/foundation/test-plan.md (zdanie o stosie testów)
- **Detail**: Zdanie z fazy 3 („Playwright … nie ma go w CI”) powstało przed decyzją o `e2e-phone.yml` w fazie 5. `test-stack.md` opisuje to już poprawnie.
- **Fix**: Zmienić na „nie ma go w bramce CI; ręczny workflow `e2e-phone.yml` uruchamia wszystkie projekty”.
- **Decision**: FIXED

### F5 — Dwa zdania PRD o marginesie bez doprecyzowania

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/foundation/prd.md (NFR „Na telefonie labirynt mieści się…”, Business Logic „Wynikiem jest karta A4…”)
- **Detail**: Oba mówią o „labiryncie” z marginesem 10 mm bez dopisku o znaku postaci. Czytane razem z doprecyzowaniem w US-04 nie przeczą mu, ale czytelnik jednego zdania może je zrozumieć szerzej. Plan nie kazał ich zmieniać.
- **Fix**: Dopisać to samo zdanie o marginesie w NFR telefonu (Business Logic zostaje, mówi o labiryncie).
- **Decision**: FIXED

### F6 — Bramka WebKit obejmuje każdy Windows, komentarz mówi „ten host”

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: playwright.config.ts:13-15
- **Detail**: `process.platform !== "win32"` wyłącza WebKit na każdym Windowsie, a komentarz mówi o „this Windows host”. `E2E_WEBKIT=1` i komunikat na stderr łagodzą skutek; `--project=iphone-13` na Windowsie kończy się „project not found”, nie pominięciem.
- **Fix**: Przeredagować komentarz („on Windows, where it crashed on the dev machine”) i zostawić bramkę.
- **Decision**: FIXED
