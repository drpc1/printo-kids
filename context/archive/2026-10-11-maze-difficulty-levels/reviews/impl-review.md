<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Poziomy trudności labiryntu

- **Plan**: context/changes/maze-difficulty-levels/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-10-16
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 2 warnings, 2 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | WARNING |
| Scope Discipline | WARNING |
| Safety & Quality | PASS |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | WARNING |

Zakres: `e1b42f4` (p1), `5d7aa6e` (p2), `435fae8` (p3) na `feat/maze-winding`. Generator i bramka z fazy 1 są zastąpione przez `random-maze-generator` (`27779c6`, `a3b11be`); Desired End State tego planu odsyła do tamtego planu, więc to zamierzona zmiana, nie dryf.

Faza 2: `src/lib/sheet/layout.ts` nie zmienił się w `5d7aa6e`, bo już przyjmował `entranceColumn` i `characterSelected` (`9860679`). Kontrakt spełniają `WorksheetGenerator.tsx` (kolumna i `showCharacter` z poziomu) i `layout.test.ts` — MATCH.

Faza 3: `last-used.ts`, `child-profiles.ts`, `WorksheetGenerator.tsx`, `ProfileCorner.tsx`, `print-contract.test.ts` i testy zapisu odpowiadają Changes Required. Zapis postaci bez poziomu nie jest już możliwy w sygnaturze (`writeLastUsed(storage, { character, level })`). Zmiana poziomu, wybór profilu i usunięcie profilu przechodzą przez `applyLevel`, który czyści kartkę w tym samym zdarzeniu.

Kryteria automatyczne: `npm test` 108/108, `layout.test.ts` 7/7, `npm run lint` bez uwag, `npx astro check` 0 błędów. Ręczne: 1.3 i 3.3–3.7 odhaczone przez użytkownika.

Stryker (`--mutate src/lib/last-used.ts,src/lib/child-profiles.ts`): `child-profiles.ts` 189/211 (89,6%), `last-used.ts` 38/53 (71,7%). Mutanty na nowych liniach poziomu zabite. Przeżyłe: strażniki przed `JSON.parse` i dostępem do pól (`raw === ""`, `isRecord`, `typeof`) — równoważne przez `try/catch` albo ten sam wynik domyślny; starsze linie (`typeof id`, granica `0xffff`) sprzed tej zmiany. Bez nowej asercji.

## Findings

### F1 — Ręczne 3.7 odhaczone bez obserwowalnego dowodu

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/components/WorksheetGenerator.tsx:65-76
- **Detail**: Kryterium 3.7 („Gdy ułożenie się nie uda, widać komunikat i kartka spoza reguły się nie pojawia”) jest `[x]`, ale po `random-maze-generator` `mazeForSheet` zwraca `null` tylko dla obcej siatki albo nie-jednej drogi, czego generator nie robi. Krok 5 Manual Testing Steps każe wymusić `null` z bramki; w tej sesji tego nie zrobiono, a gałąź komunikatu nie ma testu.
- **Fix**: Tymczasowo wymusić `null` w `handleGenerate` tylko w worktree (bez stage), obejrzeć komunikat na kartce bez labiryntu i przy gotowej kartce, przywrócić plik `git checkout --`.
- **Decision**: FIXED — sprawdzone w przeglądarce z wymuszonym `null`: bez kartki widać alert „Nie udało się ułożyć tego poziomu.” i nie ma labiryntu; przy gotowej kartce alert się pojawia, ściany są te same co przed kliknięciem, Drukuj zostaje. Udane Generuj chowa alert. Plik przywrócony `git checkout --`, kod bez zmian.

### F2 — SHA faz 1 i 2 w Progress spoza historii gałęzi

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/changes/maze-difficulty-levels/plan.md (Progress 1.1–1.3, 2.1–2.3)
- **Detail**: Wiersze kończą się `3caf4db` i `044a296`. Te obiekty istnieją w repo, ale nie są przodkami `feat/maze-winding`; te same commity po rebase to `e1b42f4` („Generator pod regułę poziomu (p1)”) i `5d7aa6e` („Kartka dla czterech siatek (p2)”). `/10x-archive` zgłosi je w kontroli historii SHA.
- **Fix**: Podmienić sufiksy: `3caf4db` → `e1b42f4` w 1.1–1.3, `044a296` → `5d7aa6e` w 2.1–2.3.
- **Decision**: FIXED — 6 sufiksów podmienionych w Progress; tytuły i checkboxy bez zmian.

### F3 — Blok i Progress fazy 1 opisują zastąpioną bramkę pasma

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/changes/maze-difficulty-levels/plan.md (Phase 1, Progress 1.1)
- **Detail**: Phase 1 i wiersz 1.1 mówią o długości w paśmie i regule odnogi; kod i testy tego już nie sprawdzają (`random-maze-generator`). Desired End State i Critical Implementation Details odsyłają do nowego planu, a bloki faz są z zasady nietykalne, więc czytelnik archiwum musi to złożyć z dwóch plików.
- **Fix**: Dopisać w Notes `change.md` jedno zdanie, że generator i bramka fazy 1 zostały zastąpione przez `random-maze-generator`.
- **Decision**: FIXED — zdanie dopisane w Notes `change.md`.

### F4 — Faza 3 rusza pliki zmienione równolegle na innych gałęziach

- **Severity**: 💡 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Scope Discipline
- **Location**: src/components/WorksheetGenerator.tsx, src/components/ProfileCorner.tsx, src/lib/sheet/print-contract.test.ts
- **Detail**: Te same pliki zmienia gałąź `dialog-close-button` (krzyżyk w dialogach, w tym w `ProfileCorner` i dialogu postaci) oraz worktree `pierwsze-zadanie` (phone-worksheet, układ paska na telefonie). Faza 3 dokłada drugi dialog i `flex-wrap` w pasku. Merge do `main` da konflikty, a lista klas w `print-contract.test.ts` musi uwzględnić oba dialogi.
- **Fix**: Ustalić kolejność mergowania: najpierw `dialog-close-button`, potem `feat/maze-winding` z rozwiązaniem konfliktów (krzyżyk także w dialogu „Poziom:”), a phone-worksheet na końcu, z ręcznym sprawdzeniem paska z czterema kontrolkami na telefonie.
  - Strength: Mniejsze zmiany wchodzą pierwsze; dialog „Poziom:” dostaje krzyżyk w jednym kroku.
  - Tradeoff: `feat/maze-winding` czeka na merge `dialog-close-button`.
  - Confidence: MED — zakres zmian innych gałęzi znany z `git status`, nie z pełnego diffu.
  - Blind spot: Nie czytałem diffu phone-worksheet.
- **Decision**: FIXED — kolejność mergowania zapisana w Notes `change.md` i w notatce sesji; kod bez zmian.

## Triage

| Finding | Decision |
|---------|----------|
| F1 | FIXED (sprawdzone w przeglądarce z wymuszonym `null`, kod bez zmian) |
| F2 | FIXED |
| F3 | FIXED |
| F4 | FIXED (kolejność mergowania zapisana) |
