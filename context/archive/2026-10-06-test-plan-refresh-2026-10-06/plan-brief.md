# Refresh the whole-product test-plan guide — Plan Brief

> Full plan: `context/changes/test-plan-refresh-2026-10-06/plan.md`
> Research: `context/changes/test-plan-refresh-2026-10-06/research.md`

## What & Why

Guide z 2026-10-05 opisuje jeden plik testu i fazę druku jako nieruszoną. `npm test` uruchamia cztery pliki, a `print-sheet-contract` jest w trakcie. Ta zmiana przepisuje `context/foundation/test-plan.md` dla całego produktu, łącznie z backlogiem i rzeczami zaparkowanymi.

## Starting Point

Pięć ryzyk i trzy fazy. Faza 1 wskazuje nieistniejący `testing-path-count`. Archiwum ma 34 ziarna z jedną ścieżką i świadomie nie dowodzi odmowy złej kartki. Folder `path-count-test` prosi o tę odmowę i ma tylko `change.md`. Chrome i Edge są odhaczone w planie druku; Firefox i Safari nie.

## Desired End State

Czytelnik guide widzi sześć scenariuszy, cztery fazy i uczciwy opis 59 testów. Faza 1 wskazuje `path-count-test`. Faza 2 wskazuje `print-sheet-contract` jako `implementing` i zostawia otwarte, czy na kartkę wszedł plik wybranej postaci. Profil dziecka, biblioteka kart i progi poziomów zostają poza budżetem, dopóki nie istnieją. Podręcznik zostaje TBD.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Folder fazy 1 | `path-count-test`, status `change opened` | Folder już prosi o odmowę kartki; 34 ziarna zostają w §5, a test rysunku ścian tam nie wchodzi | Plan |
| Numery ryzyk | Sześć z briefu, nowa kolejność | Użytkownik zaakceptował brief; §3 przepisuje się w tym samym pliku | change.md |
| Kształt pliku | Polskie §1–§7, angielskie statusy | Taki guide już żyje; bez §8 i bez zmiany nazw sekcji | Plan |
| §6 | TBD do zamknięcia fazy | 34 ziarna nie są wzorcem odmowy złej kartki | Research |
| Faza 2 | `implementing`, `print-sheet-contract` | Plan druku ma odhaczone Chrome i Edge oraz otwarte Firefox i Safari | Research |
| Fazy 3 i 4 | `not started`, pusty folder | Testu profilu i bramki nie pisze się przed plasterkiem i przed tą strategią | change.md |
| Zakres tej zmiany | Sam guide | Odświeżenie nie implementuje testów ani podglądu przeglądarek | change.md |
| Hot-spoty | 19 commitów; katalogi to wystąpienia ścieżek | Ponowne liczenie od 2026-09-06 zgodziło się z briefem | Plan |
| Właściwa postać | Luka w ryzyku 3 i w §5, nadal faza 2 | Testy pilnują rozmiaru znacznika i identyfikatora w magazynie, nie pliku na kartce | Plan |
| Ostatnia postać w schowku | Kontrakt pokryty; bez nowych asercji pod mutanty | Brak klucza, pusty zapis, zły JSON, postać spoza listy, wyjątek, zapis i odczyt już są; przeżyte mutanty i tak zwracają „none” | Plan |

## Scope

**In scope:**

- Przepisanie §1–§7 i daty `checked` na 2026-10-06
- Sześć ryzyk, cztery fazy, opis tego, co dowodzą obecne testy
- Backlog i rzeczy zaparkowane w mapie albo w §7

**Out of scope:**

- Kod testów, `src/`, `package.json`, `AGENTS.md`
- Edycja `path-count-test`, `print-sheet-contract` i archiwum
- Podgląd Chrome, Edge, Firefox i Safari
- Oznaczenie fazy 1 jako `complete`

## Architecture / Approach

Jeden plik strategii. §1–§4 ustawiają stan, który czyta orkiestrator. §5–§7 mówią, co jest już sprawdzone, co zostaje TBD i czego budżet nie pokrywa. Kolumna źródeł w §2 zostaje przy wywiadzie, PRD, roadmapie i katalogach. Kotwice `plik:linia` zostają w `research.md`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Strategia, mapa i rollout | §1–§4: sześć ryzyk i cztery wiersze §3 | Zła numeracja albo zły folder fazy 1 wysyła orkiestrator w zły change |
| 2. Sprawdzone, podręcznik i budżet | §5–§7: 59 testów, TBD, lista wyłączeń | §5 uzna próbkę jednej ścieżki za odmowę złej kartki albo znacznik za właściwą postać |

**Prerequisites:** zaakceptowany brief w `change.md` i `research.md` na commicie `c0cc80c`.
**Estimated effort:** jedna sesja, dwa przejścia jednego pliku.

## Open Risks & Assumptions

- Notatka `path-count-test` jest węższa niż tytuł fazy. To odświeżenie jej nie rozszerza. Badanie tamtej zmiany może wrócić z prośbą o szerszy cel.
- Liczby katalogów są wystąpieniami ścieżek w 19 commitach. Inna komenda gita da inne liczby.
- `print-sheet-contract/plan.md` nadal mówi o ryzykach 2, 3 i 5 w starej numeracji. Zostaje tak do zamknięcia tamtej zmiany.

## Success Criteria (Summary)

- §3 wskazuje `path-count-test` jako `change opened` i `print-sheet-contract` jako `implementing`.
- §2 ma sześć ryzyk z briefu, bez progów poziomów jako osobnego wiersza i bez `plik:linia`.
- §5 nie nazywa 59 testów dowodem strony Chrome, dowodem profilu na urządzeniu ani dowodem, że na kartce jest plik wybranej postaci.
- §5 nazywa kontrakt ostatniej postaci w schowku pokrytym. §7 nie każe dopisywać asercji pod mutanty, które i tak zwracają „none”.
