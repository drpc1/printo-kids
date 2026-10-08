<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Prove the sheet shows the chosen character file

- **Plan**: context/changes/testing-character-on-sheet/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2
- **Date**: 2026-10-08
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 2 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | WARNING |
| Safety & Quality | PASS |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 — Stryker wszedł do package.json poza planem

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Scope Discipline
- **Location**: package.json:42
- **Detail**: Commit 6454705 dopisał `@stryker-mutator/core` `^10.0.0` do devDependencies. Plan fazy 1 zmienia w tym pliku tylko skrypt `test`. Wpis był już w drzewie roboczym przed fazą; `package-lock.json` się nie zmienił.
- **Fix A ⭐ Recommended**: Usuń linię `@stryker-mutator/core` z package.json.
  - Strength: Plik wraca do zakresu planu: sam skrypt test z character.test.ts.
  - Tradeoff: Jeśli dopisek był świadomą pracą sprzed tej zmiany, znika sama deklaracja. Lockfile jej nie zawiera.
  - Confidence: HIGH — diff commita pokazuje jedną obcą linię obok planowanego skryptu.
  - Blind spot: Nie sprawdzono, czy jakiś lokalny skrypt już woła Strykera.
- **Fix B**: Zostaw zależność w package.json.
  - Strength: Nie kasuje wpisu, który był w drzewie przed fazą 1.
  - Tradeoff: Plan tej zmiany jej nie przewiduje, a lockfile jej nie pinuje.
  - Confidence: MEDIUM — nie wiadomo, czy wpis miał trafić do tego commita.
  - Blind spot: Nie sprawdzono intencji autora sprzed startu implementacji.
- **Decision**: FIXED via Fix A

### F2 — Podręcznik wniósł wcześniejsze poprawki, w tym komórkę Status

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: context/foundation/test-plan.md:64
- **Detail**: Commit ea67c57 ma wymagane zdania §6, §4, §5 i klauzulę adresu pliku w §3. Razem z nimi weszły poprawki, które były już brudne: data checked, faza 1 `complete`, folder fazy 2 `testing-character-on-sheet`, Status `implementing` → `change opened`, wypełniona „Prawidłowa kartka” i zdanie o jednej ścieżce w §5. Plan kazał zostawić komórkę Status. Użytkownik zatwierdził commit całego pliku.
- **Fix**: Zostaw podręcznik jak w ea67c57.
- **Decision**: FIXED via leave

### F3 — characterRow obok characterSheetSrc

- **Severity**: ℹ️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/sheet/character.ts:18
- **Detail**: Plan nazywa eksport czterech wierszy i `characterSheetSrc`. Doszedł `characterRow`, który przy braku wiersza zwraca `id === "none"`, nie indeks 0. `MazeSheet` i tak woła `characterSheetSrc` dla `href`.
- **Fix**: Zostaw `characterRow`. To jest lookup wiersza `none`, którego kontrakt kartki wymaga.
- **Decision**: FIXED via leave
