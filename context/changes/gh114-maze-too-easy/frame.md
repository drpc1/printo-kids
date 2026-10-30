# Frame Brief: Labirynty za łatwe (GitHub 114)

> Framing step before /10x-plan. Ten dokument oddziela to, co faktycznie obserwujemy, od tego, co zakładano na starcie.

## Reported Observation

Testy na 4-latku i 6-latku (2026-10-30): 4-latek bez problemu robił Poziomy 1–3, 6-latek wszystkie poziomy, z Poziomem 6 włącznie. Trudność mocno zależy od wylosowanej karty (raz prawie prosta droga w dół, raz droga przez cały labirynt). Na niższych poziomach droga często biegnie prawie cały czas w dół, z przesunięciami o 2 pola, i trzyma się środka. Mało dłuższych ślepych uliczek i sensownych rozgałęzień na wszystkich poziomach. Droga od mety do startu wydaje się ciekawsza i trudniejsza.

## Initial Framing (preserved)

- **User's stated cause or approach**: issue 114: karty są za łatwe, bo siatki są za małe. Po testach: alejki od Poziomu 2 do zmniejszenia, każdy poziom z inną szerokością. Reszta objawów bez diagnozy.
- **User's proposed direction**: podnieść wymiary siatki o mały krok na każdym poziomie (issue); zmniejszyć alejki; „nie wiem dokładnie, co się ma zmienić".
- **Pre-dispatch narrowing**: najbardziej psuje wrażenie to, że droga i odnogi są mdłe. Brakuje trudności na wszystkich poziomach. Czy rozrzut trudności ma zostać, czy się zmniejszyć: „nie wiem".

## Dimension Map

1. **Wymiary siatki i szerokość alejki** — issue zakłada, że tu leży problem. ← initial framing
2. **Algorytm losowania** (`generate.ts:82-119`) — Kruskal (Poziomy 1, 3) i backtracker (2, 4, 5, 6) mają znane cechy kształtu.
3. **Położenie wejścia i wyjścia** (`levels.ts`) — Poziomy 1–5 mają start i metę w tej samej, środkowej kolumnie.
4. **Brak bramki jakości** (`mazeForSheet`, `generate.ts:71-80`) — sprawdzana jest tylko jedna droga i wymiary, nie kształt ani trudność karty.
5. **Dobór poziomów do dzieci** — czy sama skala jest za łatwa, niezależnie od generatora.

## Hypothesis Investigation

Pomiar: 300 labiryntów na poziom, skrypt poza repo (`%TEMP%/frame114/measure.ts`), generator bez zmian.

| Poziom | Algorytm    | Długość drogi (śr., p10–p90) | Droga w środkowej trzeciej kolumn | Odnogi przy drodze (1. poł. / 2. poł.) | Odnogi głębokości ≥6 |
| ------ | ----------- | ---------------------------- | --------------------------------- | -------------------------------------- | -------------------- |
| 1      | Kruskal     | 21 (15–25)                   | 60%                               | 6,7 / 6,0                              | 3,0                  |
| 2      | backtracker | 42 (27–61)                   | 41%                               | 1,3 / 3,5                              | 2,0                  |
| 3      | Kruskal     | 34 (26–44)                   | 66%                               | 10,5 / 10,5                            | 5,2                  |
| 4      | backtracker | 82 (48–120)                  | 45%                               | 2,4 / 5,4                              | 3,1                  |
| 5      | backtracker | 134 (77–195)                 | 36%                               | 4,4 / 7,4                              | 4,0                  |
| 6      | backtracker | 307 (183–439)                | 33%                               | 9,6 / 14,0                             | 7,0                  |

| Hypothesis                        | Evidence                                                                                                                                                                                                                                                                       | Verdict                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| 1. Siatka za mała                 | Droga zajmuje stałe 34–42% komórek na backtrackerze, więc większa siatka wydłuża drogę, ale nie zmienia jej kształtu (środek, mało odnóg). Nie tłumaczy rozrzutu ani asymetrii start–meta. Dla szerokości alejek: szerokość wynika z kolumn, a Poziomy 1–2 i 3–4 dzielą siatkę | WEAK (jako jedyna przyczyna)     |
| 2. Algorytm                       | Backtracker zaczyna od wejścia i w pierwszej połowie drogi ma 1,3 odnogi (Poz. 2) wobec 3,5 w drugiej; start wygląda na prosty korytarz, meta na gęstszy. To zgadza się z „od mety ciekawiej". Kruskal: droga ma 60–66% w środkowej trzeciej                                   | STRONG                           |
| 3. Start i meta w jednej kolumnie | Poziomy 1–5 mają start i metę na środku, najkrótsza droga to prosta w dół. Kruskal 60–66% w środku; Poziom 6 (rogi) tylko 33% i symptomu nie ma                                                                                                                                | STRONG (dla „w dół przy środku") |
| 4. Brak bramki jakości            | `mazeForSheet` odrzuca tylko karty z inną niż jedną drogą. Rozrzut długości p10–p90 to 15–25, 27–61, 48–120                                                                                                                                                                    | STRONG (dla rozrzutu)            |
| 5. Skala za łatwa                 | 6-latek przeszedł Poziom 6; to potwierdza tylko, że góra skali nie jest wyzwaniem dla starszego dziecka                                                                                                                                                                        | WEAK (testowane dwoje dzieci)    |

## Narrowing Signals

- Poziom 6 (rogi, 27×33) nie ma objawu „droga przy środku", a Poziomy 1–5 mają. Wskazuje na położenie wejścia i wyjścia oraz algorytm, a nie sam rozmiar.
- Asymetria odnóg start–meta (np. 1,3 / 3,5 na Poziomie 2) tłumaczy spostrzeżenie o ciekawszej drodze od mety.
- Odpowiedzi użytkowniczki: objaw główny to mdła droga i odnogi; trudności brakuje na wszystkich poziomach.

## Cross-System Convention

Plan `2026-10-11-winding-maze-path` (zarchiwizowany) rozwiązywał ten sam objaw: droga przy środku, proste uskoki, brak lewej i prawej tercji, wymagane skręty, bez biegów ≥5 komórek. Zmiana `2026-10-16-random-maze-generator` zastąpiła ręczne układanie drogi czystym Kruskalem i backtrackerem i uznała, że „długość drogi nie jest progiem". Te reguły jakości wypadły wtedy z generatora. Obecne objawy to częściowo powrót problemu rozwiązanego wcześniej, a nie nowe zjawisko.

## Reframed (or Confirmed) Problem Statement

> **The actual problem to plan around is**: kształt wygenerowanej karty (droga, odnogi, rozrzut), a nie sam rozmiar siatki.

Czyste algorytmy z `random-maze-generator` dają drogę przy środku na Poziomach 1–5, mało odnóg i asymetrię start–meta. Nic nie pilnuje kształtu ani trudności pojedynczej karty. Siatka i szerokość alejki zostają osobną, mniejszą decyzją, bo rozmiar nie naprawia kształtu. Dochodzi też decyzja o produkcie (osobna szerokość alejki dla każdego poziomu zmienia PRD).

## Confidence

**MEDIUM** — Pomiar mocno wspiera hipotezy 2, 3 i 4. Dowód na skalę (5) to tylko dwoje dzieci, a „czy rozrzut ma zostać" nie jest rozstrzygnięte.

## What Changes for /10x-plan

Plan dotyczy jakości kształtu labiryntu (położenie startu i mety, losowanie, ewentualna bramka jakości) oraz osobnej decyzji o wymiarach siatki i szerokości alejek. Nie sprowadza się do podniesienia `columns` i `rows`. Przed planem warto zdecydować, czy rozrzut trudności ma się zmniejszyć, i sprawdzić to na wydruku.

## References

- Source files: `src/lib/maze/levels.ts:28-107`, `src/lib/maze/generate.ts:22-33, 71-119`
- Prior changes: `context/archive/2026-10-11-winding-maze-path/plan.md`, `context/archive/2026-10-16-random-maze-generator/plan.md`
- Pomiar: `%TEMP%/frame114/measure.ts` (poza repo)
