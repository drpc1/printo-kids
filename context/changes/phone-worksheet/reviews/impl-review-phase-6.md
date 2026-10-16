<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Strona karty na telefonie (S-09), faza 6

- **Plan**: context/changes/phone-worksheet/plan.md
- **Scope**: Phase 6 of 6 (poprawki z testów na iPhonie, scalone w drpc1/printo-kids#36)
- **Reviewed phases**: 6
- **Date**: 2026-10-16
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 3 warnings, 2 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | WARNING |
| Scope Discipline    | PASS    |
| Safety & Quality    | WARNING |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Range `2605e3d..09a92ed` (contains drpc1/printo-kids#34 dialog-close-button, reviewed only for integration). Print clamp stays inside `@media print`, `@page` and geometry unchanged. Rows 6.1–6.5 still open; no `[x]` without evidence.

## Findings

### F1 — Obwódka fokusu ucięta przy krawędziach przewijanego środka okna

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/ui/dialog.tsx:59
- **Detail**: Środek okna (`data-slot="dialog-body"`, z #34) ma `overflow-y-auto` bez odstępu, więc przycina też w poziomie. Wiersze `w-full` mają `focus-visible:ring-[3px]` rysowany na zewnątrz i jest on ucinany po bokach oraz u góry pierwszego i u dołu ostatniego wiersza. Wcześniej miejsce dawał `p-6` przewijanego okna.
- **Fix**: Dać środkowi mały wewnętrzny odstęp kompensowany ujemnym marginesem (`-m-1 p-1`).
- **Decision**: FIXED

### F2 — Cień może nie zareagować na wzrost treści bez nowych węzłów

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/hooks/useScrollEdges.ts:23-26
- **Detail**: `ResizeObserver` patrzy na sam środek okna, który po osiągnięciu `max-h` nie zmienia rozmiaru, a `MutationObserver` widzi tylko `childList`. Dłuższy tekst albo przełączona klasa zmienia `scrollHeight` bez wywołania `update`. Dziś panele wymieniają węzły, więc to luka utajona.
- **Fix**: Obserwować też rozmiar dzieci środka (ResizeObserver na każdym dziecku, odświeżane przy mutacji).
- **Decision**: FIXED

### F3 — Noty w planie i tabeli opisują wcześniejsze podejścia do cienia

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: context/changes/phone-worksheet/plan.md (nota fazy 6 o wskazówce przewijania), manual-checks.md („Poprawki w trakcie fazy 6”)
- **Detail**: Nota mówi o klasie na obu `DialogContent`, `--tw-inset-shadow`, `--primary` 70% i tokenach `--background`/`--foreground`. Ostatecznie cień jest w `ui/dialog.tsx` na środku okna (po scaleniu #34), jako `box-shadow` z `--scroll-edge: var(--primary)` bez `color-mix()`.
- **Fix**: Zaktualizować notę w planie i wpisy w tabeli do stanu końcowego.
- **Decision**: FIXED

### F4 — Cień chowa się pod nieprzezroczystym wierszem przy krawędzi

- **Severity**: 💡 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/styles/global.css:187-203
- **Detail**: Wewnętrzny `box-shadow` rodzica maluje się pod tłem dzieci. Zaznaczony wiersz (`bg-muted`) albo podświetlony przy krawędzi zasłania cień na całej szerokości.
- **Fix A ⭐ Recommended**: Zostawić `box-shadow`, sprawdzić na iPhonie po wdrożeniu #36
  - Strength: Zero zmian; problem dotyczy tylko chwili, gdy zaznaczony wiersz stoi przy krawędzi.
  - Tradeoff: Wskazówka czasem znika.
  - Confidence: MED — zależy od tego, co pokaże iPhone.
  - Blind spot: Nie wiemy jeszcze, czemu cienia nie było widać na telefonie użytkownika.
- **Fix B**: Nakładki `::before`/`::after` z `position: sticky` nad treścią
  - Strength: Cień zawsze nad wierszami.
  - Tradeoff: Więcej CSS, nakładki muszą przepuszczać dotyk (`pointer-events: none`).
  - Confidence: MED — wzorzec znany, nietestowany tu na iOS.
  - Blind spot: Zachowanie sticky w przewijanym flex-col na starszym iOS.
- **Decision**: PENDING (decyzja po teście na iPhonie po wdrożeniu #36)

### F5 — Test długiej listy nie sprawdza, że lista naprawdę się przewija

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: tests/e2e/phone-layout.spec.ts:133-171
- **Detail**: Test zakłada, że 12 profili przewija się przy wysokości 600 px. Jeśli wiersze się zmniejszą, test padnie mylącym komunikatem o atrybucie.
- **Fix**: Dodać warunek wstępny `scrollHeight > clientHeight` z czytelnym opisem.
- **Decision**: FIXED
