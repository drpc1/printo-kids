<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Poprawki paska poziomu

- **Plan**: context/changes/level-bar-fixes/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2
- **Date**: 2026-10-17
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 2 warnings, 1 observation

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | WARNING |
| Success Criteria | WARNING |

Zakres: `1917389` (p1), `1d4cea6` (p2), `4ab894c` (epilog) od `ccfb414`. Zmienione pliki: `src/components/WorksheetGenerator.tsx`, `src/lib/sheet/print-contract.test.ts`, `tests/e2e/level-bar.spec.ts` i dokumenty zmiany — wszystkie w planie, nic spoza planu. Przegląd zgodności z planem (agent 1): każdy punkt Changes Required MATCH; test desktopu ma dodatkowy przypadek „default names”, uzasadniony break-checkiem (najdłuższe nazwy nie odtwarzały błędu).

Kryteria automatyczne: `npx playwright test` 25 zielonych (7 pominiętych celowo: desktop na projektach telefonów, WebKit na Windows), `npm test` 109/109, `npm run lint`, `npx astro check` 0 błędów, `npm run build`.

Ręczne: 1.3, 2.3, 2.4 potwierdzone przez użytkowniczkę. 1.4 było potwierdzone na podstawie tekstu w DOM — patrz F1.

## Findings

### F1 — Komunikat o nieudanym ułożeniu jest niewidoczny w widoku kartki

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/components/WorksheetGenerator.tsx:145-149, src/components/WorksheetHome.astro:41
- **Detail**: Komunikat to `<p role="alert">`, a `#worksheet-home.has-maze p { display: none; }` (reguła ekranowa chowająca linię celu) obejmuje każdy `<p>` w kolumnie. Sprawdzone w przeglądarce z wymuszonym `null`: tekst jest w DOM, ale `display: none`, wysokość 0 — rodzic widzi pasek bez kartki i wyszarzone Drukuj bez wyjaśnienia, a czytnik ekranu nie dostaje alertu. Punkt 1.4 został odhaczony na podstawie samego tekstu w DOM, bez sprawdzenia widoczności. To samo dotyczy nieudanego Generuj przy widocznej kartce sprzed tej zmiany.
- **Fix A ⭐ Recommended**: Zawęzić regułę ekranową do linii celu (np. `#worksheet-home.has-maze .max-w-xl > p`)
  - Strength: Usuwa przyczynę — reguła trafia tylko w to, co ma chować; kolejne `<p>` w generatorze nie znikną.
  - Tradeoff: Zmiana w globalnym arkuszu `WorksheetHome.astro` (pliku z phone-worksheet); trzeba sprawdzić, że linia celu nadal znika przy kartce.
  - Confidence: HIGH — linia celu jest bezpośrednim dzieckiem `.max-w-xl`, komunikat leży głębiej.
  - Blind spot: Nie sprawdzone na WebKit (iPhone).
- **Fix B**: Renderować komunikat jako `div` z `role="alert"`
  - Strength: Zmiana w jednym miejscu komponentu, bez ruszania arkusza.
  - Tradeoff: Reguła nadal łapie każdy przyszły `<p>` w generatorze.
  - Confidence: HIGH — `div` nie pasuje do selektora `p`.
  - Blind spot: None significant.
- **Decision**: FIXED via Fix A — reguła ekranowa w `WorksheetHome.astro` to `#worksheet-home.has-maze .max-w-xl > p`. Sprawdzone w przeglądarce z wymuszonym `null`: komunikat widoczny (`display: block`), linia celu przy kartce schowana, Drukuj wyszarzony; plik z wymuszeniem przywrócony.

### F2 — Test paska na desktopie mierzy przed zakończeniem animacji

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: tests/e2e/level-bar.spec.ts:62-71
- **Detail**: `phone-layout.spec.ts:31-41,62` woła `settle()` po Generuj, bo pasek i dialogi animują (`transition-all`). Test desktopu czyta `boundingBox` od razu po pojawieniu się labiryntu; tolerancja 2 px i porównania `<=` mogą się przestawić przy przesunięciu w trakcie animacji.
- **Fix**: Dodać `settle()` (jak w `phone-layout.spec.ts`) przed pomiarem pudełek.
- **Decision**: FIXED — `settle()` skopiowany z `phone-layout.spec.ts` i wołany przed pomiarem; `level-bar.spec.ts` 6/6 zielone.

### F3 — Zmiana poziomu przegenerowuje kartkę także w trakcie wyboru dziecka

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/WorksheetGenerator.tsx:83-95
- **Detail**: `handleGenerate` wychodzi wcześnie przy `waitingForChild` (:70), `applyLevel` nie. Gdy przy kartce są ≥2 profile bez aktywnego (np. po usunięciu aktywnego) i poziom się zmienia, kartka dostaje nowy labirynt, choć Generuj jest wyszarzony. Drukuj nie zależało od `waitingForChild` także przed zmianą, więc nic nowego nie da się wydrukować bez wyboru dziecka poza labiryntem wybranego poziomu.
- **Fix**: Zostawić (kartka zawsze pasuje do poziomu na pasku) i dopisać to w Notes `change.md`.
- **Decision**: FIXED — zachowanie zostaje, zapisane w Notes `change.md`.

## Triage

| Finding | Decision |
|---------|----------|
| F1 | FIXED via Fix A (reguła `has-maze` tylko dla linii celu) |
| F2 | FIXED (`settle()` przed pomiarem) |
| F3 | FIXED (zachowanie zapisane w Notes) |
