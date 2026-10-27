---
date: 2026-10-27T23:06:09+01:00
researcher: Claude (Sonnet 5.5)
git_commit: 4a4b45d
branch: chore/critical-paths-research
repository: printo-kids
topic: "Krytyczne ścieżki projektu, luki w testach i plan celowanego Strykera na nowych kartach"
tags: [research, tests, stryker, sequence, symmetry, sudoku, nonogram, dictation, profile]
status: complete
last_updated: 2026-10-27
last_updated_by: Claude (Sonnet 5.5)
---

# Research: krytyczne ścieżki, luki w testach i rekomendacja dla Strykera

**Data**: 2026-10-27 · **Commit**: 4a4b45d (main po #155) · **Gałąź**: chore/critical-paths-research

## Pytanie badawcze

Które ścieżki projektu są krytyczne (mapa ryzyk w `context/foundation/test-plan.md`, PRD), jak mocno broni ich dziś zestaw testów (czy wyrocznia jest niezależna od kodu produkcyjnego), gdzie są luki i co, w jakiej kolejności, powinien zmutować Stryker na nowych kartach. Tylko raport z rekomendacją: Stryker na nowych kartach nie był uruchamiany w tym badaniu, kod bez zmian.

## Podsumowanie

1. **Stryker dziś nie dotyka żadnej nowej karty.** `stryker.config.json` mutuje 5 plików (`maze/generate.ts`, `sheet/layout.ts`, `last-used.ts`, `child-profiles.ts`, `sheet/character.ts`) i uruchamia tylko ich pięć testów. Symetria, sekwencje, sudoku, nonogram i dyktando, a także `card-settings`, `active-profile`, `own-image-store` i `speech`, nie są mutowane. Jedyny wąski przebieg na nowym kodzie to `favoriteDiffers` (`child-profiles.ts:165-171`, 21 z 21 po jednej asercji).
2. **Zestaw testów jest szeroki (ok. 600 testów, 13 specyfikacji e2e) i w większości ma niezależne wyrocznie** (ręcznie pisane tabele PRD, `followsAnyRule` w sekwencjach, `isCleanOutline` w symetrii, ASCII-kształty w dyktandzie). To dobra baza pod mutacje: ocalałe mutanty będą znaczyły luki w asercjach, nie brak testów.
3. **Najsłabsze miejsca (ryzyko 9 i dane lokalne):**
   - unikalność rozwiązania sudoku i nonogramu opiera się wyłącznie na produkcyjnych solverach (`countSudokuSolutions`, `solveNonogram`), bez drugiego, niezależnego sprawdzenia;
   - `dictationCardProblems` nie ma testu negatywnego na `repeated-vertex` (reguła „obrys nie przecina się i nie dotyka sam siebie”) ani na `no-commands`, a `outside-margin` jest testowany z jednej strony;
   - walidacja sudoku (pula kształtów, liczba pustych pól) jest sprawdzana negatywnie tylko dla 4×4;
   - odczyt profili po cichu odrzuca uszkodzone wpisy, a następny zapis utrwala skróconą listę; żaden test nie przechodzi „uszkodzony sąsiad, edycja jednego profilu, zapis”.
4. **Praktyczna przeszkoda:** `sequence/generate.test.ts` trwa ok. 47 s (brute force 27^k wypełnień luk). Mutowanie sekwencji z pełnym testem jest nieopłacalne bez zawężenia (patrz plan Strykera).
5. **Znaleziony błąd widoczny dla rodzica (nie test):** opis Poziomu 3 sekwencji w `levels.ts:66` to „liczby i wzory, 2 puste pola”, a reguły tego poziomu to samo AB/AAB/ABC z kształtami (`levels.ts:70-74`, po zmianie `sequence-age6-shapes-only` z 2026-10-26). Tekst jest nieaktualny. Reguły `up1` i `up2` nie należą do żadnego poziomu, więc nie są generowane (zostają tylko w liście reguł do oceny jednoznaczności).

## Szczegółowe ustalenia

### Mapa krytycznych ścieżek (test-plan §2) i ich pokrycie

| Ryzyko | Ścieżka                                               | Warstwa testów dziś                                                                                                       | Siła                                | Główna luka                                                                                                                               |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Labirynt ma jedną ścieżkę                             | `maze/generate.test.ts` (391 linii), Stryker                                                                              | silna                               | e2e tylko rysuje labirynt                                                                                                                 |
| 2, 4   | Jedna strona A4, margines 10 mm, przeglądarki         | `sheet/layout.test.ts`, `print-contract.test.ts` (33 testy czytające źródła jako tekst), `phone-layout.spec`              | średnia                             | brak emulacji druku ani liczby stron; test tekstowy przechodzi, gdy klasa jest obecna, a nieskuteczna                                     |
| 3      | Postać przy starcie, „Meta”                           | `character.test.ts`, `layout.test.ts`, `character-speaks.spec`                                                            | dobra                               | —                                                                                                                                         |
| 5      | Profil, ustawienia kart, ulubiona, dane na urządzeniu | `child-profiles.test.ts` (ok. 60), `card-settings.test.ts`, `favorite-character`, `profile-summary`, `card-settings` spec | silna na jednostkach                | uszkodzony sąsiad przy zapisie; brak e2e z uszkodzonym `localStorage` i z przekroczoną kwotą; brak testów hooków                          |
| 7      | Symetria: odpowiedź to odbicie                        | `symmetry/generate.test.ts` (37), `templates.test.ts`, `layout.test.ts`                                                   | silna                               | `category` i gałąź `templates.length === 0` nietestowane; pliki `objects/*` (ok. 2850 linii danych) tylko przez ogólne niezmienniki       |
| 8      | Sekwencje: jedna odpowiedź                            | `sequence/generate.test.ts` (30, 47 s), `levels`, `layout`, `shapes`                                                      | silna (niezależny `followsAnyRule`) | `rules.ts` bez testu bezpośredniego; zabezpieczenie przed złym `gaps` (`generate.ts:176-185`) nieosiągalne; wyczerpanie prób nietestowane |
| 9      | Sudoku, nonogram, dyktando: jedno rozwiązanie         | `sudoku/generate.test.ts` (34), `nonogram/*` (8+9+14+8+2+14), `dictation/*` (13+14+2+16)                                  | średnia                             | zob. niżej                                                                                                                                |

### Sekwencje i symetria

- **sequence/generate.ts (238 l.)**: walidator `sequenceRowProblems` (`:158`) i `sequenceAnswers` (`:137`). Wyrocznia `followsAnyRule` (`generate.test.ts:32-94`) jest pisana niezależnie z PRD i porównywana z walidatorem (`:158`, `:445`, > 20 przypadków jednoznacznych i dwuznacznych). Luki: wczesny powrót przy złych indeksach luk, górna granica `second-gap-outside-second-half` (`:191`), wyczerpanie 20 prób (`:61`), granica liczb 1–20 sprawdzona tylko od strony `unknown-item`.
- **sequence/rules.ts (200 l.)**: `rowFromRule`, `ruleSequences`, `hypotheses`, `followsRule` testowane wyłącznie pośrednio. To najlepszy kandydat na Strykera, bo błąd w `hypotheses` zmienia liczbę odpowiedzi.
- **symmetry/generate.ts (300 l.)**: `mirrorAnswer` (`:285`), reguły osi i podpowiedzi (`:221`, `:266-280`) mają ręcznie pisane oczekiwania i testy negatywne z pojedynczym kodem błędu. Luki: karta z kilkoma błędami naraz, rozłączność wzoru i odbicia na kartach wygenerowanych, `category`, `drawing()` (nieznana litera).
- **symmetry/colors.ts, layout.ts, levels.ts**: tabele PRD ręcznie; część asercji liczy z produkcyjnej stałej (`SYMMETRY_SHEET.inset`), więc zmiana marginesu przesunęłaby wyrocznię razem z kodem.

### Sudoku, nonogram, dyktando

- **sudoku/generate.ts (353 l.)**: zasada jedynego rozwiązania sprawdzana przez `countSudokuSolutions` (`:160`) w generatorze i w teście (`generate.test.ts:96, 123, 143, 332`); niezależny jest tylko `assertValidFullBoard` (`:40-57`) i dwa ręczne przypadki (`:108`, `:278`). Luki: `shape-outside-pool` i `shape-count` tylko dla 4×4 (`:241, :264`), `blank-count` negatywnie tylko 4×4 (`:257`), brak niedopasowania poziomu, tylko jedno naruszenie w `invalid-solution`, brak testu ponowienia w `generateSudokuPuzzle`.
- **nonogram/solve.ts (139 l.)**: tylko solver logiki liniowej; testy (`solve.test.ts`, 8) na ręcznych przykładach 5-komórkowych i 3×3, bez oracle brute-force i bez przypadku wielu rund propagacji. **nonogram/generate.ts (123 l.)**: „jedno rozwiązanie” wynika z `solveNonogram` i test porównuje go z samym sobą (`generate.test.ts:98`); lista martwych obiektów trudnego poziomu jest sztywna (`["kot","tulipan"]`, `:132`). **simple.ts**: reguła tonów dobrze pokryta ręcznymi obrazkami; brak przypadku „sąsiad po przekątnej pusty” i granicy dokładnie 7 znaczków.
- **dictation/generate.ts (248 l.)**: `dictationCardProblems` (`:177`) ma kody `no-commands`, `bad-length`, `same-direction`, `not-closed`, `repeated-vertex`, `outside-margin`, `not-the-outline`. Brak testu negatywnego dla `repeated-vertex` i `no-commands`; `outside-margin` tylko dla `start.col = 0` (`:167`); `not-the-outline` tylko przez usunięcie komórki. **outline.ts (260 l.)**: dobre ręczne ASCII-kształty; dwa `throw` w `traceOutline` (`:225, :240`) nietestowane.

### Dane lokalne i interfejs

- Odczyt profili po cichu odrzuca zły wpis, a kolejny zapis utrwala skróconą listę (`child-profiles.ts:25-41, 64-72`): ryzyko utraty danych bez testu „uszkodzony sąsiad”. `parseCardSettings` (`card-settings.ts:94-107`) zamienia zły wpis na domyślny i utrwala go przy następnym zapisie; nie jest mutowany, a jego test nie wchodzi do komendy Strykera.
- `own-image.ts` (450 l.) ma 13 testów na sfałszowanym `createImageBitmap`/`OffscreenCanvas` w Node; e2e sprawdza tylko PNG i odrzucenie GIF. Ręcznie pisane parsery rozmiarów (JPEG, EXIF, WebP, HEIC) nie mają pokrycia mutacyjnego.
- Hooki (`useCardSettings`, `useChildProfileVisit`, `useFavoriteCharacter`, `useBarCharacter`) i komponenty nie mają testów jednostkowych (brak runnera React); bronią ich e2e. Gałęzie błędów zapisu (`setItem` zwraca false, brak miejsca) nie są pokryte w e2e.
- Dyktando i nonogram nie mają dedykowanych specyfikacji e2e (tylko `character-speaks` i układ).

## Referencje kodu

- `stryker.config.json` — lista `mutate` (5 plików) i `commandRunner` (5 testów); `coverageAnalysis: "off"`, więc każdy mutant uruchamia całą komendę.
- `src/lib/child-profiles.ts:165-171` — `favoriteDiffers`, jedyny wąski przebieg Strykera na nowym kodzie (21/21).
- `src/lib/sequence/generate.ts:137-212`, `src/lib/sequence/rules.ts:36-200` — walidator i lista reguł.
- `src/lib/sudoku/generate.ts:160, 217, 301-350` — solver, carve, walidacja karty.
- `src/lib/nonogram/solve.ts:1-139`, `src/lib/nonogram/generate.ts:89-102` — solver i weryfikacja.
- `src/lib/dictation/generate.ts:177-248`, `src/lib/dictation/outline.ts:120-260` — walidacja i obrys.
- `src/lib/symmetry/generate.ts:75-300` — odbicie, podpowiedzi, szczeliny.
- `src/lib/sequence/levels.ts:66` — nieaktualny opis Poziomu 3.

## Wpływ na rekomendację: co mutować i jak

Szacunek: Stryker wygenerował 21 mutantów na 7 liniach `favoriteDiffers` (ok. 3 mutanty na linię); przy `coverageAnalysis: "off"` i 4 procesach czas ≈ (mutanty × czas komendy) / 4. Czasy testów zmierzone w audycie (z narzutem Node ok. 1 s): sudoku `generate.test.ts` 3,4 s, nonogram `generate.test.ts` 6,9 s, `solve.test.ts` 2,0 s, dyktando `generate.test.ts` 4,0 s i `outline.test.ts` 1,9 s, symetria `generate.test.ts` 1,5 s, sekwencje `generate.test.ts` 47,5 s.

Kolejność (ryzyko × słabość oracle), każda pozycja jako osobny, zawężony przebieg z własną komendą testów (nie jedna wielka lista):

| #   | Zakres `--mutate`                                                                | Testy w komendzie                                                 | Mutanty (szac.) | Czas (szac.)            | Uzasadnienie                                                                                      |
| --- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| 0   | testy pisane wcześniej, bez Strykera (patrz „Faza 0”)                            | —                                                                 | —               | —                       | najtańsza przyczyna ocalałych mutantów to znane luki                                              |
| 1   | `dictation/generate.ts:177-248` (walidator)                                      | `dictation/generate.test.ts`, `outline.test.ts`, `layout.test.ts` | ok. 220         | ok. 4–5 min             | brak negatywnych testów centralnej reguły (ryzyko 9)                                              |
| 2   | `dictation/outline.ts:120-260`                                                   | `outline.test.ts` + `generate.test.ts`                            | ok. 420         | ok. 5 min               | wykrywanie dotknięć w narożniku i zamknięcie obrysu                                               |
| 3   | `sudoku/generate.ts:160-250, 295-353`                                            | `sudoku/generate.test.ts`, `levels.test.ts`                       | ok. 400         | ok. 6–7 min             | wspólny solver generatora i testu; wyrocznia 100% zależna od kodu produkcyjnego                   |
| 4   | `nonogram/solve.ts`                                                              | `solve.test.ts`, `clues.test.ts`, `simple.test.ts`                | ok. 420         | ok. 4 min               | jedyna podstawa „jednego rozwiązania”                                                             |
| 5   | `nonogram/generate.ts:40-123`, `simple.ts`                                       | `nonogram/generate.test.ts`, `simple.test.ts`                     | ok. 350         | ok. 10 min              | weryfikacja karty i reguła tonów                                                                  |
| 6   | `sequence/rules.ts` oraz `sequence/generate.ts:137-238`                          | `sequence/generate.test.ts` z obniżoną liczbą ziaren              | ok. 600         | ok. 10 min po zawężeniu | pełny test (47 s) dałby ok. 1,2 h; ziarna oracle sterowane zmienną środowiska tylko pod Strykerem |
| 7   | `symmetry/generate.ts:75-300`                                                    | `symmetry/generate.test.ts`, `templates.test.ts`                  | ok. 450         | ok. 3 min               | odbicie i podpowiedzi; pliki `objects/*` są danymi, nie mutować                                   |
| 8   | `card-settings.ts`, `active-profile.ts`, `own-image-store.ts`, `sheet/speech.ts` | ich testy (dopisać `card-settings.test.ts` do komendy)            | ok. 350         | ok. 2 min               | dane lokalne i parsowanie; teraz poza zakresem                                                    |

Łącznie ok. 35–45 min zegarowo, wykonywane po jednym zakresie, z przeglądem ocalałych mutantów po każdym. Nie gonić 100% (AGENTS.md): asercję dopisujemy tylko, gdy ocalały mutant to błąd widoczny dla rodzica (zła karta, utrata danych, ucięcie na A4) albo zmienia wynik karty; mutanty równoważne i kosmetyczne (np. teksty błędów wewnętrznych) odnotowujemy w `test-plan.md` §5 i pomijamy.

### Faza 0: znane luki testowe do zamknięcia przed mutacjami (niskie koszty, z audytu)

1. Dyktando: testy negatywne `repeated-vertex`, `no-commands`, `outside-margin` z czterech stron, `not-the-outline` dla obrysu przeciwnego do ruchu wskazówek.
2. Sudoku: negatywne `shape-count`, `shape-outside-pool`, `blank-count` dla 6×6 i 9×9, niedopasowanie poziomu, naruszenia kolumny/bloku.
3. Niezależna kontrola unikalności: prosty brute-force liczący rozwiązania dla małych plansz sudoku 4×4 i nonogramów do 4×4/5×5 (`solveLine` vs wyliczenie wszystkich ułożeń), porównywany z produkcyjnym solverem.
4. Profil: test „uszkodzony wpis obok poprawnego, edycja jednego, zapis” (co przetrwa) po decyzji, czy odczyt ma zachować nieznane wpisy.
5. Sekwencje: test bezpośredni `hypotheses`/`followsRule`; wyczerpanie prób; złe indeksy luk.

## Wnioski dla planu i otwarte decyzje użytkowniczki

- **Decyzja A: zakres.** Czy plan ma objąć Fazę 0 (dopisanie testów z luk) razem ze Strykerem na nowych kartach, czy najpierw sam Stryker (ocalałe mutanty ujawnią te same luki, ale taniej jest je zamknąć z góry). Rekomendacja: Faza 0 tylko dla pozycji 1–3, resztę prowadzi Stryker.
- **Decyzja B: ziarna oracle sekwencji.** Zgoda na zmienną środowiska obniżającą liczbę ziaren tylko pod Strykerem (pełny test w `npm test` bez zmian).
- **Decyzja C: odczyt profili.** Jeśli test uszkodzonego sąsiada pokaże utratę profilu, to jest zmiana zachowania produktu (zachowywanie nieznanych wpisów), więc osobna zmiana, nie część tej.
- **Poza zakresem tej zmiany (follow-up):** poprawka opisu Poziomu 3 sekwencji (`levels.ts:66`), emulacja druku/liczba stron w Playwright, dedykowane e2e dyktanda i nonogramu, test hooków React, test zapisu przy przekroczonej kwocie.
- **Konfiguracja Strykera:** zamiast jednej listy `mutate`, osobne przebiegi z komendą per zakres (np. przez `--mutate` i `--commandRunner.command` w skryptach albo dodatkowe pliki `stryker.<karta>.config.json`), `coverageAnalysis` zostaje „off” (komenda `command` nie wspiera per-test), a `package.json` dostaje skrypt pomocniczy; wynik i wyłączone mutanty zapisujemy w `test-plan.md` §5.

## Pytania otwarte

- Czas pełnych przebiegów jest szacunkiem z 3 mutantów na linię i czasów testów; rzeczywisty czas, a zwłaszcza zawieszenia po mutacjach w pętlach solverów (limit czasu Strykera), trzeba potwierdzić pierwszym zawężonym przebiegiem.
- Obsługa nadpisania `commandRunner.command` z linii poleceń w Stryker 10: do sprawdzenia na początku fazy 1 (alternatywa: osobne pliki konfiguracji).
