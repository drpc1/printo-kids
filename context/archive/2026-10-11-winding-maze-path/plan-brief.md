# Zawijana droga labiryntu — Plan Brief

> Full plan: `context/changes/winding-maze-path/plan.md`

## What & Why

Budżet 40 komórek na poziomie 5 lat jest w całości wydawany na pionową prostą z krótkimi uskokami, a reszta kartki dokleja się jako proste korytarze do krawędzi. Szerokość alejki zostaje. Długość może być luźniejsza. Droga ma skręcać w każdą stronę, prosty odcinek ma być wyjątkiem, a właściwa ścieżka nie ma trzymać się środka kartki.

## Starting Point

`layPath` dla 3 i 5 lat stawia prostą w kolumnie wejścia i dobija do `pathMax` uskokami. Na 20 ziarnach 5 lat droga ma zawsze 40 komórek, prawie nie idzie w górę i mieści się w kilku kolumnach przy środku. `attachRemainder` dokleja resztę prosto w bok. `spurMax` 6 równa się odległości od środka do krawędzi. Pozostałe poziomy to wężyk albo serpentyna, też bez kroku w górę.

## Desired End State

Generuj na 5 latach daje labirynt, którego droga skręca w górę i w boki, jest i po lewej, i po prawej stronie kartki, a żaden korytarz nie idzie prosto przez całą szerokość. Młodsze krótkie poziomy mają płytszą odnogę niż nastolatek. Alejka wygląda jak dziś.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Szerokość alejki | Siatki 9×11, 13×16, 17×21, 27×33 zostają | Alejka jest osobną osią od kształtu drogi | Frame |
| Długość | Luźna kolejność: 24–44, 50–80, 56–96, 110–170, 150–240, 280–500 | 3 lata kończą się na 44, nastolatek zaczyna od 280, a dawne 40 nie mieści obu tercji | Plan |
| Prosty bieg | 5 lub więcej komórek zakazane; 4 jest wyjątkiem, rzadszym niż biegi o 1–3 | Bieg o 6 na 5 latach to korytarz ze zdjęć | Plan |
| Środek | Droga może przeciąć środek, ale ma komórkę w lewej i w prawej tercji | Sam zakaz kolumny wejścia zostawia wężyk tuż obok środka | Plan |
| Odnogi | Skręcają; 3 i 5 lat ≤ 4; nastolatek ≥ 25 | Płytkie kontra głębokie zostaje, ramię do krawędzi nie | Plan |
| Dokumenty | PRD i plan `maze-difficulty-levels` dostają te same liczby | Inaczej następny agent wróci do prostej i do sufitu 40 | Plan |
| Algorytm | Jedno ułożenie, bez pętli losowań przez 5 sekund | Stary Kruskal skręcał, ale długości nie wybierał | Plan |

## Scope

**In scope:**

- Pasma i progi odnogi w `LEVELS`
- Droga i odnogi w `generate.ts` oraz testy w `generate.test.ts`
- Tabela w PRD oraz, w planie `maze-difficulty-levels`, tabela Desired End State i sekcje Key Discoveries oraz Critical Implementation Details. Bloki Phase 1–3 i Progress tamtego planu zostają

**Out of scope:**

- Siatka, inset, wejście, wyjście, pasek poziomu, zapis i profile
- `test-plan.md`, słownik łatwy/średni/trudny, test Playwright
- Pętla losowań jako sposób na pasmo

## Architecture / Approach

`generateMaze` najpierw kładzie drogę od wejścia do wyjścia w paśmie, z obiegiem obu tercji i z regułą biegu. Potem dokleja resztę komórek jako odnogi z tą samą regułą biegu i z progiem głębokości poziomu. Zostaje jedna droga. Kartka i Generuj nie zmieniają sygnatury: dalej wołają `lat5`, tylko labirynt jest inny.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Zawijana droga | Sześć dróg w nowym paśmie, z tercjami i bez biegu o 5 komórkach | Konstrukcja nie trafi w pasmo i tercje bez powtórki |
| 2. Odnogi ze skrętem | Płytkie 3 i 5 lat, głęboki nastolatek, skręt w całym labiryncie | Odnoga o głębokości 25 na nastolatku zepsuje regułę biegu |
| 3. Dokumenty | PRD i plan poziomów mówią tymi samymi liczbami | Edycja planu w trakcie wdrożenia ruszy jego Progress |

**Prerequisites:** Faza 1 `maze-difficulty-levels` jest w `main` (generator przyjmuje poziom). Pasek poziomu nie jest potrzebny.
**Estimated effort:** około 2 sesje, 3 fazy.

## Open Risks & Assumptions

- Jeśli jedno ułożenie nie umie naraz utrzymać pasma, obu tercji i reguły biegu, plan się nie zgadza na pętlę przez 5 sekund. Trzeba wrócić do planu, nie dokładać powtórek.
- Na 5 latach droga ma 56–96 komórek z 208. Reszta to krótkie odnogi. Kartka będzie gęstsza od grzebienia. To jest zamierzone.
- Plan `maze-difficulty-levels` jest w trakcie wdrożenia. Faza 3 rusza jego tabelę Desired End State oraz Key Discoveries i Critical Implementation Details, nie bloki faz ani checkboxy.

## Success Criteria (Summary)

- Po Generuj na 5 latach droga skręca w górę i w boki, jest po obu stronach kartki, a żaden korytarz nie idzie prosto przez całą szerokość. Test każdego z sześciu poziomów wymaga co najmniej jednego kroku w górę.
- 3 lata kończą drogę najpóźniej na 44 komórkach, nastolatek zaczyna od 280. Odnoga 3 i 5 lat ma co najwyżej 4 komórki, nastolatka co najmniej 25.
- PRD i plan poziomów podają te same pasma. Alejka i miejsce startu oraz mety zostają.
