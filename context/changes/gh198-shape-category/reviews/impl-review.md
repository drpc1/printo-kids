<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Kategoria „Kształty” (gh198)

- **Plan**: context/changes/gh198-shape-category/plan.md
- **Scope**: Full plan
- **Reviewed phases**: 1, 2, 3
- **Date**: 2026-10-31
- **Verdict**: APPROVED
- **Findings**: 0 critical, 1 warning, 3 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | WARNING |
| Success Criteria    | PASS    |

## Findings

### F1 — PRD Business Logic nie zna wyjątku od „pionowy” dla Kształtów

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: context/foundation/prd.md:619
- **Detail**: Plan (Faza 3 pkt 3) wymaga wyjątku od „pionowy” w Business Logic. Wyjątek jest tylko w US-19 (AC, wiersz 358). Akapit „Katalog szablonów obiektów” nadal mówi, że wyjątkiem są tylko auto i autobus, a chmurka jest szeroka i niska, koło ma proporcję 1:1.
- **Fix**: Dopisać w tym akapicie, że figury „Kształty” (koło, serce, gwiazda, krzyżyk, księżyc, chmurka) zachowują własne proporcje i zajmują pas siatki.
- **Decision**: FIXED

### F2 — Komentarz nagłówkowy ksztalty.ts jest nieaktualny

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/lib/symmetry/objects/ksztalty.ts:9
- **Detail**: Komentarz mówi o próbkowaniu ze wzoru „per figura”, a chmurka (wszystkie rozmiary) i gwiazda w 4×12 są rysowane ręcznie w `DRAWN`.
- **Fix**: Dopisać jedno zdanie o wyjątkach ręcznych albo odesłać do komentarza przy `DRAWN`.
- **Decision**: FIXED

### F3 — Dyktando w „Kształty” ma tylko po 8 obrysów na poziom

- **Severity**: 💡 OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Plan Adherence
- **Location**: src/lib/symmetry/objects/ksztalty.ts (spoty) / dictation/generate.ts:93
- **Detail**: Ozdoby to dziury albo wypełnione komórki wewnątrz sylwetki, a dyktando deduplikuje karty po obrysie. Każda figura daje więc jeden obrys na poziom (8 kart), a nie ~16–64 jak nonogram. PRD to odnotowuje (Open Questions 11), plan zakładał „różne karty”, co działa, ale powtórki są szybsze niż w innych kategoriach.
- **Fix**: Zaakceptować, albo w osobnym kroku dodać części wpływające na obrys (np. wybrzuszenie na brzegu), z kontrolą styku rogiem.
  - Strength: Dłuższa seria niepowtarzalnych kart dyktanda.
  - Tradeoff: Każda część brzegowa trzeba sprawdzić testami obrysu na trzech rozmiarach.
  - Confidence: MED — nie sprawdzono, ile wariantów brzegowych przejdzie.
  - Blind spot: Czytelność figury po zmianie brzegu.
- **Decision**: PENDING

### F4 — Zapasowy wybór spotów (4 sąsiadów) daje warianty z obrysem niedozwolonym

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/lib/symmetry/objects/ksztalty.ts:227
- **Detail**: Gdy brakuje spotów z ośmioma sąsiadami (gwiazda 4/6, księżyc 4/6), wybór schodzi do czterech sąsiadów. Część zestawów wariantów ma wtedy styk rogiem (np. gwiazda 4×12: 1 z 4 czysty, księżyc 6×15: 2 z 4). Generator pomija je w dyktandzie, a symetria i nonogram przechodzą; spoty na cienkich ramionach księżyca wyglądają nierówno.
- **Fix**: Zostawić (każda figura ma co najmniej jeden czysty zestaw, test to pilnuje), albo ograniczyć fallback do spotów w korpusie figury.
- **Decision**: PENDING
