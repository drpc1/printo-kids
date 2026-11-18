<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Od najmniejszego (S-48)

- **Plan**: context/changes/size-order-card/plan.md
- **Scope**: Phase 1 of 3
- **Reviewed phases**: 1
- **Date**: 2026-11-18
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 3 observations

Przegląd własny, bez sub-agentów (oszczędność tokenów): diff fazy 1 (commit fb2729a5) porównany z planem i z `src/lib/odd-one-out/`, `src/lib/coding/`.

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

## Findings

### F1 — `minStepMm` = 2 mm zamiast 2,5 mm z planu

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/size-order/sheet.ts
- **Detail**: Najmniejsza różnica wysokości na trudnym to 0,10 najwyższego obrazka (ok. 24 mm), czyli 2,4 mm już bez zmniejszania rzędu; próg 2,5 mm odrzucałby każdy rząd. Przyjęto 2 mm (najwyższy obrazek rzędu co najmniej 20 mm). Plan zostawia wartość do potwierdzenia wydrukiem (faza 3).
- **Fix**: Zostaje; faza 3 potwierdza lub zmienia.
- **Decision**: ACCEPTED

### F2 — Tymczasowe rzutowanie id rodzaju w silniku

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architecture
- **Location**: src/lib/size-order/engine.ts
- **Detail**: `odnajmniejszego` nie należy do `CardKindId`, bo rejestracja w `cards.ts` jest w fazie 2; silnik używa `as unknown as CardKindId` z komentarzem. Typ `SizeOrderSettings` leży już w `card-settings.ts` (tylko interfejs, bez wpisu w `CardSettingsMap`).
- **Fix**: Faza 2 dopisuje id do `CARD_KINDS` i usuwa rzutowanie.
- **Decision**: ACCEPTED

### F3 — Dodatki ponad plan

- **Severity**: OBSERVATION
- **Impact**: LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: src/lib/size-order/types.ts, card.ts, glossary
- **Detail**: `types.ts` (rozcina cykl `card.ts` ↔ `layout.ts`, który widział depcruise), kody `unknown-picture` i `unknown-crayon`, parametr `previousKey` generatora (wymaga go kontrakt silnika), w glosariuszu „Krok wielkości” zamiast „Krok” (termin „Krok” zajmuje kodowanie).
- **Fix**: Bez zmian.
- **Decision**: ACCEPTED
