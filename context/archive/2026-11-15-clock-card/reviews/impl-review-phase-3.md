<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Zegar (S-41)

- **Plan**: context/changes/clock-card/plan.md
- **Scope**: Phase 3 of 4
- **Reviewed phases**: 3
- **Date**: 2026-11-16
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 2 observations

Commit 8c5b18c. Dwa przeglądy równoległe (zgodność z planem; bezpieczeństwo, druk i wzorce względem krzyżówki, „Kto ma więcej” i szlaczków). Bramki 3.1–3.4 przed commitem: `npm test` 1773 (1 pominięty jak dotąd), lint, depcruise, astro check (0 błędów), build, e2e na czterech projektach Chromium 789 passed (327 skipped z warunków projektów), smoke na podglądzie (port 4398, bo 4399 zajmowało e2e). Kontrole z celowo zepsutym kodem: gałąź `mode` w `fieldValue` i „24 h” w podsumowaniu — testy czerwone, pliki przywrócone. Kontrole ręczne 3.5–3.7 potwierdziła użytkowniczka. Dopisek z fazy 2 spełniony (rzutowanie `kind` i obejście `kindOf` usunięte). Jedyny dodatek poza listą plików: opcjonalne `disabled` w `SettingToggle`, wymagane przez kontrakt planu („wszystkie `disabled={waitingForChild}`”), domyślnie `false`, pozostali wywołujący bez zmian.

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

### F1 — Wyłączony przełącznik „24 h” nie przyciemnia podpisu

- **Severity**: 💬 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/SettingToggle.tsx:23
- **Detail**: Przy `disabled` tylko `Switch` dostaje `disabled:opacity-50`; podpis „24 h” zostaje w pełnym kolorze, a wyłączony przycisk `LevelChoice` przyciemnia się cały. Stan występuje tylko chwilę, gdy strona czeka na wybór profilu.
- **Fix**: Przyciemnić podpis przy `disabled` (`cn(..., disabled && "opacity-50")`).
- **Decision**: FIXED — podpis przyciemniony przy disabled (cn, opacity-50); e2e przełączników i zegara przechodzą

### F2 — Gałąź `mode` w `fieldValue` działa dla każdej karty

- **Severity**: 💬 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Architecture
- **Location**: src/lib/card-settings.ts:254-256
- **Detail**: Pole jest rozpoznawane po nazwie, jak `currency`, `size` i `symbols`; przyszła karta z własnym polem `mode` byłaby sprawdzana listą trybów zegara. Dziś żadna inna karta nie ma `mode`.
- **Fix**: Zostawić (zgodne z istniejącym wzorem); gdy inna karta dostanie `mode`, sprawdzać też `cardId`.
- **Decision**: ACCEPTED — zgodne z istniejącym wzorem (currency, size, symbols); wrócić, gdy inna karta dostanie mode

Pomniejsze, bez osobnej pozycji: `change()` w `ClockGenerator.tsx:45-51` wraca przed `remember` przy `waitingForChild` (jak krzyżówka; „Kto ma więcej” zapamiętuje mimo to), nieosiągalne, bo kontrolki są wtedy wyłączone.
