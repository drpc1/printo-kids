# Sheet Path-Count Refusal — Plan Brief

> Full plan: `context/changes/path-count-test/plan.md`
> Research: `context/changes/path-count-test/research.md`

## What & Why

Klik Generuj zapisuje kartkę tylko wtedy, gdy `countPaths` zwraca 1. Suite tego nie dowodzi: 34 ziarna sprawdzają generator o jednej ścieżce, a siatka o zwrocie 2 nie przechodzi przez zapis. Ten plan daje test Node na tej samej decyzji, której używa klik, dla liczby 0 i dla zwrotu 2.

## Starting Point

`handleGenerate` woła `setMaze` wewnątrz `if (countPaths(next) === 1)` i nie ma `else` (`src/components/WorksheetGenerator.tsx:72-77`). `countPaths` zwraca 0, 1 albo 2 i staje po drugiej ścieżce (`src/lib/maze/generate.ts:47-80`). `npm test` ładuje `src/lib/maze/generate.test.ts` przez `node --test` (`package.json:12`). Asercji liczby 0 tam nie ma.

## Desired End State

Funkcja `mazeForSheet` zwraca ten sam labirynt przy liczbie 1 i `null` przy każdej innej. Klik ustawia stan tylko dla wyniku niepustego, więc poprzednia kartka zostaje, a przy starcie kartki dalej nie ma. `npm test` pada, gdy decyzja przyjmie siatkę o liczbie 0 albo o zwrocie 2.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Dwie ścieżki | Zwrot `countPaths` równy 2 | Pięć tras i dwie trasy tak samo dają 2; test sprawdza odmowę zapisu przy tym zwrocie | Plan |
| Miejsce decyzji | `mazeForSheet` w `generate.ts`, klik ją woła | `npm test` importuje moduł TypeScript i nie montuje Reacta | Plan |
| Zero ścieżek | Siatka 13×16, wszystkie ściany zamknięte | Zamknięte nacięcia na spójnym labiryncie nadal dają jedną ścieżkę | Research |
| Poprzednia kartka | Zostaje; brak `else`, komunikatu i ponowienia | Kontrakt S-01 maluje kartkę tylko przy liczbie 1 | Research |
| Runner | Nowe przypadki w `generate.test.ts` | Skrypt `npm test` już ładuje ten plik | Research |

## Scope

**In scope:**

- Eksport `mazeForSheet(candidate: Maze): Maze | null`
- Podpięcie tej funkcji pod `handleGenerate`
- Testy: `countPaths` 0 → `null`, `countPaths` 2 → `null`, `countPaths` 1 → ta sama referencja

**Out of scope:**

- Siatka o dokładnie dwóch korytarzach
- Zmiana kapsla licznika, generatora, 34 ziaren, testu zbicia ściany i testu zatrzymania na 2
- Montowanie komponentu, nowy runner, zmiana `package.json`
- Komunikat, ponowienie, czyszczenie poprzedniej kartki
- Poziomy, druk, profile

## Architecture / Approach

`generateMaze` dalej zwraca labirynt i nie liczy ścieżek. `mazeForSheet` woła `countPaths` i zwraca kandydata albo `null`. Klik przekazuje tam wynik `generateMaze(Math.random)` i woła `setMaze` tylko dla obiektu. Test buduje siatkę o zerze i siatkę o zwrocie 2 obok generatora, bo sam generator tych liczb nie daje.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Decyzja kartki | Funkcja, klik i trzy asercje w `npm test` | Fixture „zero” ze samych zamkniętych nacięć nadal ma jedną ścieżkę |

**Prerequisites:** Node 22.14.0, działające `npm test`, research `path-count-test` zakończony. Nowych zależności nie ma.
**Estimated effort:** Jedna sesja, jedna faza.

## Open Risks & Assumptions

- Klik w przeglądarce nie podaje siatki o liczbie 0 ani 2, bo `generateMaze` takich nie zwraca. Dowód jest w teście funkcji, którą klik woła.
- Zwrot 2 dalej znaczy „znaleziono drugą ścieżkę i spacer stanął”, także gdy tras jest pięć.
- Przyjmujemy, że `setMaze` ma dostać tę samą referencję, którą zwrócił generator przy liczbie 1.

## Success Criteria (Summary)

- `npm test` przechodzi z odmową przy `countPaths` 0, odmową przy `countPaths` 2 i zwrotem tego samego labiryntu przy `countPaths` 1.
- `npm run lint` przechodzi.
- W kliku `setMaze` stoi tylko za wynikiem niepustym, a test kapsla i pętla 34 ziaren zostają nieprzepisane.
