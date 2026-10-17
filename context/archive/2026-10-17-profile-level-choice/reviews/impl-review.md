<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Wybór poziomu w profilu dziecka

- **Plan**: context/changes/profile-level-choice/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1
- **Date**: 2026-10-17
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Zakres: `28c06f1` (faza 1) i `ea62f44` (SHA w Progress) na `feat/profile-level-choice`. Pliki w diffie to dokładnie pliki z Changes Required plus artefakty zmiany.

Przegląd prowadzili dwaj agenci równolegle (wykrywanie dryfu oraz bezpieczeństwo i wzorce), zgodnie z krokiem 2 skilla.

Dryf: `child-profiles.ts` i testy, `ProfileCorner.tsx` (szkice `draftLevel` i `favoriteLevelDraft`, panele `draft-level-list` i `favorite-level-list`, `ProfileLevelControl`, `LevelChoiceRows`, zapis ze szkicu, `onFavoriteSaved` z poziomem, „Zapisz” aktywny po zmianie postaci albo poziomu) oraz `WorksheetGenerator.handleFavoriteSaved` → `applyLevel` — wszystko MATCH. Każda ścieżka resetu (`openCreateForm`, `abandonFavoriteDraft`, `openEdit`, `confirmDelete`) resetuje oba szkice razem. `LevelChoiceControl`, format zapisu i `last-used` bez zmian.

Bezpieczeństwo i jakość: sprawdzone przepływy — formularz tworzenia zamknięty i otwarty ponownie, pierwsza wizyta z `ask=true`, edycja nieaktywnego profilu (`onChoose` ustawia pasek przed zapisem), pasek na innym poziomie niż profil, zapis samej postaci (`applyLevel` bez zmiany poziomu nie czyści kartki), usunięcie aktywnego profilu, błąd zapisu (blokady zwalniane przed wywołaniem rodzica). Brak ścieżki XSS; klasy przez `cn()`, kolory z tokenów.

Zamierzona zmiana zachowania: wcześniej „Utwórz” zapisywał poziom z paska, więc `handleProfileCreated` nigdy nie przestawiał paska. Teraz, gdy rodzic wybierze w formularzu inny poziom, pasek go przejmuje, a bieżący labirynt znika — tak jak przy wyborze profilu.

Kryteria automatyczne (uruchomione ponownie): `npm test` 113/113, `npm run lint` bez uwag, `npx astro check` 0 błędów i 0 ostrzeżeń, `npm run build` OK, `npx playwright test` 19 passed, 1 skipped (WebKit na Windows). Stryker `--mutate src/lib/child-profiles.ts:79-95`: 24/24 zabitych.

Ręczne 1.6–1.8: sprawdzone w podglądzie `npm run preview` (Chromium w panelu przeglądarki) — tworzenie z „7–8 lat” zapisuje `lat7`, zmiana samego poziomu włącza „Zapisz”, „Anuluj” porzuca szkic, zapis „4 lata” daje `lat4` i pasek „4 lata”.

Po triage (F1–F3 poprawione): `npm test` 113/113, `npm run lint` bez uwag, `npx astro check` 0 błędów, `npm run build` OK, `npx playwright test` 20 passed, 4 skipped (WebKit na Windows i nowy spec poza `chromium`). Lista „Poziom:” na pasku po F1 sprawdzona w podglądzie: bieżący poziom zaznaczony, wybór „6 lat” ustawia pasek i zamyka dialog.

## Triage

| Decyzja | Uwagi      |
| ------- | ---------- |
| Fixed   | F1, F2, F3 |

## Findings

### F1 — Dwie kopie listy poziomów: pasek i profil

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/ProfileCorner.tsx:558 (`LevelChoiceRows`), src/components/WorksheetGenerator.tsx:306-322 (`LevelChoiceControl`)
- **Detail**: `LevelChoiceRows` powiela niemal linia w linię wiersze z `LevelChoiceControl` na pasku. Przy postaci pasek używa wspólnego `CharacterChoiceRows`. Plan świadomie wyłączył pasek z zakresu, bo `WorksheetGenerator.tsx` zmienia równolegle `level-bar-fixes`.
- **Fix**: po zmergowaniu `level-bar-fixes` wyeksportować `LevelChoiceRows` i użyć go w `LevelChoiceControl` (`onSelect` = wybór + zamknięcie dialogu).
- **Decision**: FIXED — od razu, nie po `level-bar-fixes` (decyzja użytkowniczki): `LevelChoiceRows` wyeksportowane, `LevelChoiceControl` go używa. Możliwy konflikt z `level-bar-fixes` w `LevelChoiceControl` przy merge'u.

### F2 — Okno profilu bez testu automatycznego

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/components/ProfileCorner.tsx
- **Detail**: Logika zapisu ma testy jednostkowe, ale przepływ okna (lista poziomów, powrót do formularza, „Zapisz” aktywny po zmianie samego poziomu) sprawdzono tylko ręcznie. E2E obejmują dialog profilu tylko pod kątem układu na telefonie.
- **Fix**: scenariusz Playwright „profil z poziomem” (utworzenie z poziomem, edycja samego poziomu, pasek po zapisie).
- **Decision**: FIXED — `tests/e2e/profile-level.spec.ts` (tylko projekt `chromium`, bo przepływ nie zależy od rozmiaru ekranu): tworzenie z „7–8 lat” → `lat7` i pasek; „Zapisz” wyłączony bez zmian, włączony po zmianie samego poziomu; zapis „4 lata” → `lat4` i pasek.

### F3 — Nowe przypadki `barAfterFavoriteSave` przed starymi

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/lib/child-profiles.test.ts:278-284
- **Detail**: Dwa nowe przypadki poziomu stoją na początku `describe("barAfterFavoriteSave")`, przed przypadkami postaci. W `withFavorite` nowe przypadki są dopisane na końcu. Kosmetyka.
- **Fix**: przenieść oba przypadki poziomu za przypadki postaci.
- **Decision**: FIXED — przypadki poziomu przeniesione za przypadki postaci, treść bez zmian.
