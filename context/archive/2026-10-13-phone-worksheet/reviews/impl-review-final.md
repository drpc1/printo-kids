<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Strona karty na telefonie (S-09), przegląd zamykający

- **Plan**: context/changes/phone-worksheet/plan.md
- **Scope**: Full plan (kod faz 1–6 na `main`, przed archiwizacją)
- **Reviewed phases**: 1, 2, 3, 4, 5, 6
- **Date**: 2026-10-18
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 3 warnings, 2 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | WARNING |

HEAD `a4042c8` (`origin/main`). Gates: `npm test` 113/113, `npm run lint` 0, `npx astro check` 0 errors, `npm run build` ok, `npx playwright test` (see triage note). Plan drift: every planned change MATCH; deviations (scrollbar in dialogs, on-demand WebKit workflow, `px-8`, `ProfileCorner.tsx`) are covered by implementation notes. `@page { size: A4; margin: 0 }` unchanged; no hex or palette colors; `useScrollEdges` and `scroll-shadow` fully removed. Earlier reports: `impl-review.md` (fazy 1–5), `impl-review-phase-6.md`, `impl-review-phase-6-scrollbar.md`, all findings decided.

## Findings

### F1 — Tabela ręcznego druku i telefonu jest pusta

- **Severity**: ⚠️ WARNING
- **Impact**: 🔬 HIGH — architectural stakes; think carefully before deciding
- **Dimension**: Success Criteria
- **Location**: context/changes/phone-worksheet/manual-checks.md (tabele „Druk”, „Układ na telefonie”, „Dialogi na telefonie”); plan.md Progress 2.8, 6.1–6.5
- **Detail**: Wszystkie komórki trzech tabel są puste, a Progress ma otwarte 2.8 (844×390 z dotykiem) i 6.1–6.5. Faza 6 to jedyny dowód FR-005/FR-013 w przeglądarkach z zakresu. Zapisane są tylko: automatyczny przebieg iPhone (WebKit, 2026-10-16), znane ograniczenie druku na iOS (`print-printer-margins`) i potwierdzenie paska przewijania na iPhonie (2026-10-18). Zamknięcie S-09 bez tabeli oznacza `done` bez sprawdzenia druku na Firefox, Safari, Edge, Brave i Androidzie.
- **Fix A ⭐ Recommended**: Użytkowniczka wypełnia tabele na swoich urządzeniach (choćby `nie sprawdzono: <powód>` dla przeglądarek, których nie ma), potem zaznaczamy 6.x i archiwizujemy.
  - Strength: Plan sam to stawia jako warunek `/10x-impl-review` (Implementation Note fazy 6); S-09 kończy się dowodem, nie deklaracją.
  - Tradeoff: Wymaga czasu przy kilku urządzeniach; archiwizacja czeka.
  - Confidence: HIGH — kontrakt komórki („ok” / „błąd” / „nie sprawdzono”) już jest w pliku.
  - Blind spot: Nie wiemy, które przeglądarki użytkowniczka ma pod ręką.
- **Fix B**: Archiwizować teraz; brakujące wiersze wpisać jako `nie sprawdzono: poza archiwizacją 2026-10-18`, a ręczny druk przenieść do nowej zmiany przez `/10x-new`.
  - Strength: S-09 zamyka się dziś, a dług jest nazwany i ma właściciela.
  - Tradeoff: Roadmapa pokaże `done`, choć FR-005 na telefonie nie ma dowodu poza iOS Chrome.
  - Confidence: MED — zależy od tego, czy użytkowniczka uzna automatyczne testy za wystarczające.
  - Blind spot: Błąd druku w Firefoksie lub Safari wyszedłby dopiero u rodzica.
- **Decision**: Fix A wybrany 2026-10-18: użytkowniczka wypełnia tabele na swoich urządzeniach; archiwizacja czeka na wyniki

### F2 — Przycisk Profil ma ok. 32 px wysokości na ekranie dotykowym

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/ProfileCorner.tsx:334
- **Detail**: Trigger ma `h-auto px-2 py-1 text-base`, czyli ok. 32 px. Plan wymaga 44 px dla Generuj, Drukuj i wierszy dialogów, ale nie dla Profilu, więc to nie dryf, tylko luka w celu dotykowym na tej samej stronie telefonu.
- **Fix**: Dodać `pointer-coarse:min-h-11` do klas triggera (i ewentualnie asercję wysokości w `phone-layout.spec.ts`).
- **Decision**: DEFERRED (przeniesione do nowej zmiany `context/changes/touch-targets/`, decyzja użytkowniczki 2026-10-18)

### F3 — `settle()` w testach może odrzucić się przy przerwanej animacji

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: tests/e2e/phone-layout.spec.ts:32-41 (ta sama funkcja w tests/e2e/level-bar.spec.ts)
- **Detail**: `Promise.all(... animation.finished)` odrzuca się z `AbortError`, gdy animacja zostanie anulowana (np. Radix zmienia `data-state` w trakcie). Test padłby wtedy bez związku z układem.
- **Fix**: Zamienić na `Promise.allSettled` w obu plikach.
- **Decision**: FIXED (`Promise.allSettled` w `phone-layout.spec.ts` i `level-bar.spec.ts`)

### F4 — Plan opisuje jeden rząd paska od `sm`, kod ma zawsze dwa rzędy

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/changes/phone-worksheet/plan.md:21, :76; src/components/WorksheetGenerator.tsx:166
- **Detail**: Pasek to dziś `flex-col` (parametry, potem akcje) na każdej szerokości. Zmieniła to później `level-bar-fixes` (1d4cea6), świadomie. Plan S-09 nie ma noty, więc czytany po archiwizacji wprowadza w błąd.
- **Fix**: Dopisać notę z implementacji w fazie 1 z odwołaniem do `level-bar-fixes`.
- **Decision**: FIXED (nota z przeglądu zamykającego w fazie 1 planu)

### F5 — Pierwsze narysowanie suwaka zależy od pierwszego powiadomienia ResizeObserver

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/hooks/useScrollIndicator.ts:18-41
- **Detail**: Ref środka okna jest podpinany przed refami szyny i suwaka, więc pierwsze `update()` wychodzi wcześnie. Suwak rysuje się dopiero przy pierwszym powiadomieniu `ResizeObserver`, które specyfikacja gwarantuje po `observe()`. Działa, ale zależność jest ukryta.
- **Fix**: Zostawić albo dopisać jednozdaniowy komentarz w hooku.
- **Decision**: FIXED (komentarz w `useScrollIndicator.ts`)
