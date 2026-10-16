<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Losowy generator labiryntu

- **Plan**: context/changes/random-maze-generator/plan.md
- **Scope**: Phase 1 of 2
- **Reviewed phases**: 1
- **Date**: 2026-10-16
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 3 warnings, 1 observation

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | WARNING |
| Scope Discipline | PASS |
| Safety & Quality | PASS |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | WARNING |

Zakres: commit `27779c6` (`levels.ts`, `generate.ts`, `generate.test.ts`, pliki planu). Plik spoza planu: brak. `WorksheetGenerator.tsx` bez zmian, zgodnie z planem.

Kryteria automatyczne: `npm test` 100/100, `npm run lint` bez uwag, `npx astro check` 0 błędów. Ręczne 1.3 (kolejne Generuj na 5 latach) nieodhaczone, czeka.

Stryker (`--mutate src/lib/maze/generate.ts`): 85,96% (217 zabitych, 34 timeout, 41 przeżyło). Przeżyłe mutanty przejrzane po kolei. Równoważne albo bez skutku dla kartki: union-by-rank (l. 178–199), granice siatki w `countPaths` (l. 37–60, zamknięte ściany brzegowe), off-by-one tasowania (l. 168–169), pusty kierunek krawędzi (l. 137, 160), `random()/rows` przy starcie DFS (l. 98). Trzy grupy z realnym skutkiem są poniżej jako F2–F4.

## Findings

### F1 — Mediana drogi nastolatka odbiega od tabeli planu

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: src/lib/maze/generate.ts:98
- **Detail**: DFS zaczyna od losowej komórki. Na 1000 ziarnach nastolatek ma p5/mediana/p95 131/219/381, a tabela planu (którą faza 2 przenosi do PRD jako wartość typową) mówi 163/309/477. Ten sam pomiar ze startem DFS w (0,0) daje 157/303/467 — plan mierzył start w narożniku wejścia nastolatka. Poziomy ze środkowym wejściem prawie się nie zmieniają (lat6 60 → 64, lat7 97 → 99).
- **Fix**: Startować DFS w komórce wejścia poziomu (`level.entrance`) zamiast losowej; dla nastolatka to narożnik, więc liczby wracają do tabeli planu, a jedna liczba losowa mniej.
- **Decision**: FIXED — DFS startuje w `level.entrance`. Pomiar po poprawce (1000 ziaren, p5/mediana/p95): lat4 23/41/65, lat6 42/80/130, lat7 65/129/205, nastolatek 157/303/467; Kruskal bez zmian. Środkowe wejście wydłuża drogę 4, 6 i 7–8 lat względem tabeli planu (33/62/97) — użytkownik wybrał ten start; faza 2 bierze do PRD liczby z tego pomiaru.

### F2 — Testy nie łapią DFS bez losowości

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/maze/generate.ts:109, src/lib/maze/generate.test.ts
- **Detail**: Mutant `options[Math.floor(random() / options.length)]` (zawsze pierwszy sąsiad) przechodzi wszystkie testy. Na kartce to prawie ten sam labirynt przy każdym Generuj na 4, 6, 7–8 latach i nastolatku. „two seeds do not print the same walls” i „no fixed route” sprawdzają tylko `lat5`/`lat3` (Kruskal).
- **Fix**: Rozszerzyć test „3 years and 5 years do not repeat one fixed route” na wszystkie sześć poziomów (co najmniej dwie różne drogi na 8 ziarnach).
- **Decision**: FIXED — test „no level repeats one fixed route” obejmuje sześć poziomów; mutant z l. 109 sprawdzony ręcznie: ginie.

### F3 — Test siatki w mazeForSheet nie izoluje sprawdzenia siatki

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/maze/generate.ts:73, src/lib/maze/generate.test.ts („returns null when the maze grid is not the level grid”)
- **Detail**: Usunięcie warunku siatki przechodzi testy. Labirynt `lat3` (9×11) sprawdzany jako `lat5` i tak dostaje `null`, bo meta (15,6) leży poza siatką i `countPaths` zwraca 0. Labirynt `lat5` (13×16) sprawdzany jako `lat3` ma dokładnie jedną drogę między (0,4) i (10,4), więc bez warunku siatki trafiłby na kartkę 9×11.
- **Fix**: W teście wziąć labirynt `lat5` i sprawdzić go jako `lat3`, z asercją `countPaths === 1` przed `mazeForSheet(...) === null`.
- **Decision**: FIXED — test bierze labirynt `lat5` i sprawdza go jako `lat3`; mutant z l. 73 sprawdzony ręcznie: ginie.

### F4 — Kruskal może zdegenerować się do „binary tree” bez czerwonego testu

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: src/lib/maze/generate.ts:89
- **Detail**: Mutant `const to = true ? from + 1 : ...` łączy w union-find zawsze komórkę z następną po indeksie. Wynik to nadal drzewo rozpinające (algorytm binary tree: każda komórka otwiera wschód albo południe), więc jedna droga i osiągalność przechodzą, a mediany 3/4 i 5/6 też. Kartka 3 i 5 lat dostałaby przekątną strukturę z długimi korytarzami przy prawej i dolnej krawędzi.
- **Fix**: Dodać asercję dla `lat3` i `lat5`: istnieje komórka (poza metą) z zamkniętym wschodem i południem — w Kruskalu takich jest dużo, w binary tree nie ma żadnej. Albo pominąć, jeśli kontrakt algorytmu wystarczy pilnować przeglądem.
- **Decision**: FIXED — test „Kruskal levels close both east and south somewhere above the last corner” (wyklucza prawy dolny narożnik, który w binary tree też ma obie ściany); mutant z l. 89 sprawdzony ręcznie: ginie.

## Triage

| Finding | Decision |
|---------|----------|
| F1 | FIXED (start DFS w wejściu poziomu, wybór użytkownika) |
| F2 | FIXED |
| F3 | FIXED |
| F4 | FIXED |
