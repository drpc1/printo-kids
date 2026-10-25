# Poziomy nonogramu (łatwy, średni, trudny) — Plan Brief

> Full plan: `context/changes/nonogram-sizes/plan.md`
> Research: `context/changes/nonogram-sizes/research.md`

## What & Why

Rodzic wybiera na `/nonogram` poziom łatwy, średni albo trudny. Klasyczny nonogram okazał się za trudny dla przedszkolaków, więc łatwy to prosty wariant: każdy rząd opisany znaczkami biały/szary/czarny z liczbą kratek, bez liczb przy kolumnach. Średni i trudny to klasyczny 12×15 i 18×24.

## Starting Point

S-22 dał klasyczny nonogram 12×15 z solverem; `sizes.ts` ma już trzy rozmiary (8×12, 12×15, 18×24), a strona używa na sztywno średniego. S-26 dołożył wybór kategorii na pasku.

## Desired End State

Pasek ma „Poziom”, kategorię i „Pokaż rozwiązanie”. Zmiana poziomu generuje nową kartę. Łatwy: 8×12, kratka 14 mm, znaczki 10 mm. Każdy poziom na jednej stronie A4 z marginesem 10 mm i grubszą linią co 5 kratek, na telefonie bez nachodzenia przycisków.

## Key Decisions Made

| Decision            | Choice                                          | Why (1 sentence)                                                   | Source   |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------------ | -------- |
| Nazwy poziomów      | łatwy, średni, trudny (nie wiek, nie rozmiar)   | Użytkowniczka nie zna nonogramów dla dzieci i woli neutralne nazwy | Plan     |
| Mały klasyczny 8×12 | Odpada, zajmuje go łatwy                        | Klasyczny nonogram za trudny dla przedszkolaków                    | Plan     |
| Tony łatwego        | Czarny obrys, szare wnętrze, białe dziury       | Każdy obiekt ma trzy tony, bez zmian w szablonach                  | Plan     |
| Znaczki             | Rząd w całości, sumują się do 8; do 6 w rzędzie | Mieści się w 190 mm i nie wymaga solvera                           | Plan     |
| Linia               | Grubsza co 5 kratek, każdy poziom               | Łatwiej liczyć kratki                                              | Plan     |
| Miniatura           | Zostaje średni                                  | Bez zmian w katalogu                                               | Plan     |
| Solver              | Tylko średni i trudny                           | Łatwy ma jedno rozwiązanie z samej konstrukcji                     | Research |

## Scope

**In scope:** poziomy i prosta karta w `src/lib/nonogram/`, pasek „Poziom”, rysowanie znaczków, testy trzech poziomów, kontrakt druku, PRD, roadmapa.

**Out of scope:** kolory kredek, tony w szablonach, poziom w profilu, nowa miniatura, zmiany w szablonach symetrii.

## Architecture / Approach

Poziom rozszerza dzisiejszy rozmiar o `kind` (`znaczki` albo `liczby`). Generator zwraca kartę z dyskryminatorem; strona rysuje jedną z dwóch kartek. Prosta karta powstaje z tego samego obrazu sylwetki co klasyczna, tylko tony wylicza reguła obrysu.

## Phases at a Glance

| Phase           | What it delivers                             | Key risk                          |
| --------------- | -------------------------------------------- | --------------------------------- |
| 1. Logika       | Poziomy, prosta karta, testy trzech poziomów | Warianty z więcej niż 6 znaczkami |
| 2. Strona       | „Poziom”, karta ze znaczkami, kontrakt druku | Test czyta źródło komponentu      |
| 3. Dokumentacja | PRD i roadmapa z poziomami                   | —                                 |

**Prerequisites:** gałąź zsynchronizowana z `main` — zrobione.
**Estimated effort:** ~1 sesja, 3 fazy.

## Open Risks & Assumptions

- Czytelność wydruku: znaczki 10 mm (łatwy), kratka 7 mm (trudny) potwierdza wydruk.
- W trudnym `kot` i `tulipan` nie mają przechodzącego wariantu; generator ich tam nie pokazuje.

## Success Criteria (Summary)

- Rodzic wybiera poziom, generuje, podgląda i drukuje każdy na jednej stronie A4, także z telefonu.
- Średni i trudny mają jedno rozwiązanie bez zgadywania; łatwy jest opisany znaczkami w całości.
- `npm run lint`, `npm test`, `npx astro check`, `npm run build` przechodzą.
