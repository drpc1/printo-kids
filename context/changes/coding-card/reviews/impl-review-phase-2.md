<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Kodowanie (S-42), faza 2

- **Plan**: context/changes/coding-card/plan.md
- **Scope**: Phase 2 of 4
- **Reviewed phases**: 2
- **Date**: 2026-11-17
- **Verdict**: APPROVED
- **Findings**: 0 critical 0 warnings 2 observations

Przegląd zrobiony w tym samym kontekście, bez osobnych agentów (oszczędność tokenów); dyfu nie czytał nikt inny niż autor.

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Sprawdzone: `npm test` (1847 pass), `npm run lint`, `npm run depcruise`, `npx astro check` (0 błędów), `npm run build`. Deliberate-break: zepsuty BFS (liczba dróg zawsze 1, brak sprawdzenia jedynego poprzednika) robi czerwone oracle.test, card.test, engine.test i search.test. Pomiar Poziomu 4 Zapisz: mediana 67 losowań kratki (cel < 100), p95 290, ok. 6,6 ms na kartę (makieta: 2415 losowań, 196 ms).

## Findings

### F1 — Kod `too-many-answers` i pole `maxAnswers` spoza planu

- **Severity**: OBSERVATION
- **Impact**: LOW
- **Dimension**: Plan Adherence
- **Location**: src/lib/coding/levels.ts, src/lib/coding/card.ts
- **Detail**: Cztery rzędy poleceń „n →” (27×16 mm) nie mieszczą się pod kratką 10×10, więc Poziom 4 z więcej niż 18 poleceniami rzuciłby w układzie. Plan tego nie przewidział; dodano `maxAnswers` na poziomie i kod problemu, żeby generator odrzucał takie karty.
- **Fix**: Zostaje; dopisać do planu przy fazie 3 (kod i test już są).
- **Decision**: ACCEPTED

### F2 — Przeszkody i pola przykładu mają ten sam token szarości

- **Severity**: OBSERVATION
- **Impact**: LOW
- **Dimension**: Plan Adherence
- **Location**: src/lib/coding/sheet.ts (`colors`)
- **Detail**: `obstacle` i `example` to oba `var(--muted-foreground)`. Plan zostawia dobór odcieni wydrukowi (faza 4, 4.3); podgląd z `preview.mts` nie był jeszcze oceniony wzrokowo.
- **Fix**: Rozstrzygnąć po wydruku (faza 4).
- **Decision**: ACCEPTED
