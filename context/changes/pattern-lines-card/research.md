---
date: 2026-11-09T23:10:00+01:00
researcher: Claude (sesja S-36)
git_commit: 2cc8520
branch: claude/s36-szlaczki-plan-0b17c2
repository: drpc1/printo-kids
topic: "Jak dołożyć kartę „Szlaczki” (S-36) na wzorcu istniejących kart i przenieść geometrię z makiety v6"
tags: [research, card-kinds, pattern-lines, card-settings, mockup-port, card-contract]
status: complete
last_updated: 2026-11-09
last_updated_by: Claude (sesja S-36)
---

# Research: karta „Szlaczki” (S-36)

Krótki research: wzorzec karty jest utarty (S-33, S-34, S-35), więc ogólników nie powtarzam. Odpowiada na cztery pytania z briefu. Zakres, poziomy i pule wzorów są w `frame.md` i PRD (Business Logic „Karta szlaczków”).

## Summary

- **Stan bazowy**: gałąź jest przesunięta na `origin/main` (2cc8520), więc S-35 „Skopiuj rysunek” jest już w kodzie (`src/lib/copy-drawing/`, `CopyDrawingGenerator.tsx`) i jest najświeższym wzorcem. Nowa karta to dziesiąty rodzaj (`CARD_KINDS` ma dziewięć).
- **Lista miejsc** jest znana dokładnie (grep po `kopiuj` / `copy-drawing`, niżej), a testy zbiorcze są już sterowane katalogiem (S-33), więc dochodzą tylko tabele „po jednym wpisie na kartę”.
- **Szlaczki nie mają katalogu szablonów ani siatki**: karta jest czystą geometrią w mm (ścieżki, kropki, liniatura). Cały kod, który w S-35 brał `nonogramImage`, tu nie istnieje; zostaje tylko szkielet (levels / generate / engine / layout / sheet / komponent).
- **Przełącznik „Linie” widoczny na części poziomów** ma gotowy wzorzec: `sudokuHasSymbolChoice(size) ? <SudokuSymbolsChoice/> : null` plus `normalizeSudoku`, który zostawia ukrytą wartość nietkniętą. „Linie” jest dekoracją (nie wchodzi do `contentKey`), więc przełączenie nie układa nowej karty.
- **Trzy rzeczy, których makieta nie rozstrzyga i które wyszły z pomiaru** (skrypt analizy na 400 ziarnach × 4 poziomy, `mockup-v6.mts` jako źródło; wyniki w sekcji „Pomiar makiety”):
  1. `dotsOn` stawia dwie kropki prawie w tym samym miejscu na końcach gładkich odcinków (odległość 0,5–1,0 mm przy rozstawie 3,5–4 mm i promieniu 0,9–1,1 mm: kropki się zlewają).
  2. Na Poziomie 2 i 3 ostre wzory (`pointed`, `bricks`) mają kropki z różnych ramion w odległości 1,9–2,4 mm (przy r = 0,9 mm zostaje 0,1–0,6 mm przerwy).
  3. Na Poziomie 3 pętle (e) i kółeczka (o a) są w części wykropkowanej i **się krzyżują** (298 i 496 skrzyżowań na 400 ziarnach), co jest sprzeczne z zasadą „w trybie kropek ścieżka się nie krzyżuje”. Frame zakazuje skrzyżowań tylko dla trybu samych kropek (P1–P2); P3 to „kropki na początku”. Wymaga decyzji (plan, „Decyzje do potwierdzenia”).
- **Rozjazd tabeli i makiety na Poziomie 4**: kolumna „Wysokość / krok 0,6–1,0” nie opisuje tego, co rysuje makieta. Na P4 wysokość wzoru wyznacza liniatura (X = 6,5 mm: mały element ma 6,5 mm, wysoki 13 mm), a „krok” 12–20 mm jest jedyną losowaną wielkością; faktyczny stosunek to 0,33–0,54 dla elementów małych. Wartości „0,6–1,0” działają tylko na P1–P3.

## (a) Pełna lista miejsc, które dotyka nowa karta

Wzorzec: S-35 (`context/changes/copy-the-drawing-card/research.md`, „Lista wpisów dla nowej karty”) i S-34 (`context/archive/2026-11-08-odd-one-out-card/`). Id karty: `szlaczki`, strona `/patterns`, tytuł „Szlaczki” (PRD: „Szlaczki”). Moduł: `src/lib/pattern-lines/`.

**Rejestr i ustawienia**

- `src/lib/cards.ts` — wpis w `CARD_KINDS` (id, tytuł, `href`, miniatura `/thumbnails/szlaczki.svg`, `description` 2–3 zdania: co dziecko robi i co jest na kartce; opis poziomów trafia do S-37, nie tu).
- `src/lib/card-settings.ts` — interfejs `PatternLinesSettings { level; lines: boolean }`, `CardSettingsMap.szlaczki?`, `CARD_SETTINGS_IDS`, `DEFAULTS` (`{ level: "poziom3"?, lines: true }`, domyślny poziom do decyzji), `levelIds` (nowy `case`), brak zmian w `fieldValue` (pole `lines` jest `boolean`; dziś `fieldValue` rozpoznaje boolean tylko po nazwie `colors`, więc trzeba dopisać `lines` obok `colors`), `normalizeCard` bez zmian (nic do normalizowania; ukryta wartość `lines` zostaje, jak `colors` przy cyfrach sudoku).
- `src/lib/card-engines.ts` — `CardTypeMap` i `CARD_ENGINES` (brak wpisu to błąd kompilacji, `satisfies`).
- `src/lib/card-summary.ts` — `case "szlaczki"` w `summaryParts`: `badgeOf(level)` daje „poz. N” (bo `barLabel` jest cyfrą), `extras` = `lines ? [] : ["bez linii"]` tylko dla poziomów 3–4 (na 1–2 przełącznika nie ma, więc nie podawać go w podsumowaniu; ta sama reguła co `sudokuParts` dla ukrytego poziomu 4×4).
- Sterowane danymi, bez wpisów: `last-used.ts`, `child-profiles.ts`, `catalog-badges.ts`, `CardCatalog.astro`, `scripts/smoke.mjs`, `catalog.spec.ts`, `how-it-works.spec.ts`, strona „Jak to działa” (opis z `CARD_KINDS`).

**Moduł karty `src/lib/pattern-lines/`** (nowy; nazwy plików jak w `copy-drawing/`): `levels.ts`, `sheet.ts` (stałe), `patterns.ts` (jednostki wzorów), `paths.ts` (ścieżka, kropki, liniatura), `card.ts` (typ + `patternLinesProblems`), `generate.ts`, `engine.ts`, `layout.ts` i testy obok.

**Strona i island**

- `src/pages/patterns.astro` (kopia `copy-drawing.astro`: `GeneratorShell` + `client:only="react"`).
- `src/components/PatternLinesGenerator.tsx` — na `CardPage` / `useCardPage` / `useCardSettings("szlaczki", …)`; `LevelChoice` (wzór: `MoneyGenerator`), `SettingToggle` „Linie” warunkowo, `CharacterInstruction`, `generateSheet` / `applySettings` / `markPrinted` z `sheet-state`.
- `src/components/PatternLinesSheet.tsx` — SVG `viewBox="0 0 210 297"`, `print:h-[297mm] print:w-[210mm] print:overflow-hidden`, `cn()`, kolory przez `var(--foreground)` i tokeny; **uwaga**: makieta używa szarości `#999 / #ccc / #aaa` dla linii pomocniczych, ścieżki pod kropkami i liniatury. AGENTS.md zakazuje nowych hexów w komponentach, więc trzeba użyć istniejącego tokenu (`muted-foreground`, `border`) albo dopisać token do `src/styles/global.css` (decyzja w planie, faza 3).

**Miniatura**: `scripts/build-thumbnails.mjs` (blok po `kopiuj`, ok. linii 660–700; nagłówek skryptu wymienia karty) + `public/thumbnails/szlaczki.svg`; do commitu tylko nowa miniatura, zmienione bajty innych przywrócić (lekcja z S-35).

**Granice i testy jednostkowe**

- `.dependency-cruiser.cjs:139` — dopisać `pattern-lines` do regexu `cards-only-through-engines`.
- `package.json` — nowe pliki `*.test.ts` w skrypcie `test` (pilnuje `src/lib/test-script.test.ts`).
- `src/lib/card-engines.test.ts` — wpis `szlaczki` w `INVENTORY` (po `kopiuj`, ok. linii 258): `settingsList` poziom × `lines`, `mayExhaust: () => false` (pule są dłuższe niż liczba rzędów), `usesPreviousKey: true`, `content: [inny poziom]`, **`decoration: [{ lines: false }]`** (pierwsza karta z niepustą dekoracją poza kolorami, więc test żywotności sprawdzi, że przełączenie „Linie” zostawia tę samą kartę).
- `src/lib/card-settings.test.ts`, `src/lib/card-summary.test.ts` (`SAVED_SETTINGS`), `src/lib/sheet/print-contract.test.ts` (stałe `*_PAGE`, `*_GENERATOR`, `*_SHEET` jak `COPY_DRAWING_*` w liniach 29–31 oraz trzy testy: rozmiar SVG, brak ukrytych części, strona pod `/patterns`).

**E2E (`tests/e2e/`)**: własne `patterns.spec.ts` i `patterns-reprint.spec.ts` (nagłówek `// Provenance: pattern-lines-card (S-36, US-29, US-30, FR-039, FR-040)`) oraz wpisy w tabelach: `card-settings.spec.ts` (obok `kopiuj`, linia ok. 81), `profile-summary.spec.ts` (ok. 28 i 100), `character-speaks.spec.ts` (ok. 22: zdanie polecenia musi zgadzać się z jednym z trzech), `phone-layout.spec.ts` (test „Generuj, Drukuj i Profil nie nachodzą na siebie”, ok. 625; tu z przełącznikiem „Linie” jak test `money`), `phone-settings-rows.spec.ts` (`CARD_PAGES`, ok. 136: kontrolki `Postać`, `Poziom`; **`prepare` ustawiające Poziom 3**, bo na domyślnym poziomie bez przełącznika wiersz jest inny), `phone-toggle-align.spec.ts` (`CARDS`, ok. 27: `switchName: "Linie"`; wymaga wejścia na poziom z przełącznikiem).

**Dokumenty**: `context/domain/glossary.md:103` (wiersz „zaplanowane… nie twórz ich nazw w kodzie” przestaje być prawdą dla „Szlaczki”; po S-34/S-35 ten wiersz też jest nieaktualny, sprawdzić całość), `context/foundation/roadmap.md` (blok S-36: „ośmioma rzędami” → 4–7, „Poziom 1–4” zostaje, status, dwie „Unknowns”), opis w PRD patrz niżej (rozjazd P4).

## (b) Przełącznik widoczny tylko na części poziomów, zapamiętany w profilu

Wzorzec 1:1 z sudoku:

- Ustawienie: `lines: boolean` w `PatternLinesSettings`, `DEFAULTS.szlaczki.lines = true`. `parseCard` bierze pola z `Object.entries(defaults)`, więc nowe pole czyta się tolerancyjnie (zła wartość → domyślna `true`) po dopisaniu `field === "lines"` obok `"colors"` w `fieldValue` (`card-settings.ts` ~linia 188). Stary zapis profilu bez `szlaczki` zostaje bez wpisu i strona startuje z domyślnymi (bez migracji).
- Widoczność: predykat w `levels.ts`, np. `patternLinesHasGuides(levelId)` (poziomy 3–4), jak `sudokuHasSymbolChoice(size)` (`sudoku/levels.ts`). W islandzie `{patternLinesHasGuides(level) ? <SettingToggle label="Linie" .../> : null}` (sudoku: `SudokuGenerator.tsx` ~linie 116–134).
- `normalizeCard`: **nic nie ma do zrobienia.** Ukryta wartość `lines` na P1–P2 zostaje nietknięta, więc powrót na P3 przywraca ją (to samo robi `normalizeSudoku` dla `colors` przy cyfrach). Nie dopisywać gałęzi `szlaczki` w `normalizeCard`.
- Zapis: `memory.remember({ lines: next })` (`useCardSettings`) zapisuje do profilu albo do ostatnich parametrów i pokazuje „Zapamiętane dla {imię}”.
- Dekoracja: `contentKey(settings) = level` (bez `lines`). `applySettings` porównuje `contentKey`, więc przełącznik zostawia tę samą kartę, a zmiana poziomu układa nową. Zmiana poziomu ma też zmieniać, czy przełącznik jest widoczny, ale nie zmienia `lines`.
- Nazwa w podsumowaniu profilu i na plakietce: plakietka to tylko poziom („poz. 3”). W oknie profilu `extras` pokazuje „bez linii”, gdy `lines === false` i poziom ma przełącznik.
- Rozmieszczenie na telefonie: `SettingToggle` ma `max-sm:basis-full` (własny wiersz). Test `phone-toggle-align.spec.ts` wejdzie na Poziom 3 (domyślnie 2 → przełącznika nie ma); `phone-settings-rows.spec.ts` ma `prepare`.

## (c) Przeniesienie geometrii z makiety do modułu karty (SVG w mm)

Inne karty trzymają stałe rysunku w `sheet.ts` (współdzielone przez stronę, test druku i skrypt miniatur), układ w `layout.ts` (rzuca błąd przy wyjściu poza margines), a komponent SVG jest głupi. Dla szlaczków to samo, z geometrią jako czystą funkcją.

**Co przenosimy 1:1 z `mockup-v6.mts`** (zmieniając tylko typy i brak `writeFileSync`):

- Jednostki `U` (`line`, `flat`, `wave`, `zigzag`, `arcs`, `cups`, `stairs`, `trapez`, `saw`, `bricks`, `pipes`, `house`, `tunnel`, `pointed`, `oChain`, `sticks`, `loops`, `loopsBelow`) i `compose` → `patterns.ts`. Jednostki **nieużywane w żadnej puli** (`bolt`, `pyramid`, `snails` jest w P4; `bolt` i `pyramid` nie) nie przechodzą: frame odrzucił błyskawice i piramidki. `snails` zostaje (pula P4).
- Rekordy `P` (`id`, nazwa, `sharp`, `span`, `fixedRatio`, `ling`, `count`) → `patterns.ts` jako `PATTERNS` z id i polską nazwą do testów.
- `LEVELS` → `levels.ts` z podziałem na to, co opisuje poziom dla rodzica (`id`, `label` „Poziom N”, `barLabel` „N”, `description` mówiąca wprost o trybie) i parametry rysunku (`mode`, `pool`, `rows`, `period`, `ratio`, `maxHeight`, `bottomPad`, `ruled`, `guides`, `repeats`). Bez wieku pod opisem (PRD: nowe karty M-5 go nie mają).
- `makeRows` → `generate.ts` (losowanie z `random()` zamiast `mulberry32`); `rowPath`, `dotsOn`, `pathD` → `paths.ts`.
- Rozkład rzędów (`firstCenter`, `lastCenter`, `rowStep`, `bottomPad`) → `layout.ts`; polecenie: pas 26 mm z postacią albo `plainInstructionSize`, jak `copy-drawing/layout.ts`.

**Co trzeba dopisać albo naprawić**

- **Wejście do SVG to ścieżki w mm względem środka rzędu** (`Pt[]`), bez DOM. Komponent tylko je rysuje: `<path d=…>`, `<circle>`, `<line>`. Karta niesie _specyfikację rzędu_ (id wzoru, krok, wysokość, liczba powtórzeń, liczba powtórzeń widocznych), a ścieżki liczy czysta funkcja `rowGeometry(row, level, lines)`, więc test sprawdza dokładnie to, co się drukuje.
- **Stałe druku w jednym miejscu** (`sheet.ts`): promień i rozstaw kropek (P1 r 1,1 / 4 mm; P2 r 0,9 / 3,5 mm; P3 r 0,9 / 3,5 mm), promień kółka startu (`r + 1,2`), grubość linii wzoru (P3 1,0 mm; P4 0,6 mm), jasnoszara ścieżka pod kropkami (0,8 mm), linie pomocnicze (P3: 0,3 mm przerywane 1,2/1,2; blada linia dolna 0,25 mm), liniatura (X = 6,5 mm; grubości 0,25 / 0,2; wzory przerywania), `bottomPad` P1 = 15 mm, margines 10 mm, odstęp pasa 6 mm, miejsce na podpis 4 mm (do decyzji, czy zostaje bez podpisu), `length = szerokość − 6`. To są wartości, które zmieni wydruk próbny.
- **Kolory**: makieta używa `#000` i szarości `#999 / #ccc / #aaa`. Komponent używa `var(--foreground)` dla czerni; szarości są zadaniem planu (token). Nie dodawać hexów.
- **Odległość kropek (naprawa `dotsOn`)**: dodać warunek minimalnego odstępu (np. nie stawiać kropki, jeśli leży bliżej niż `0,7 × rozstaw` od poprzedniej, poza narożnikiem i końcem ścieżki, które mają kropkę zawsze), i test odległości kolejnych kropek.
- **Rysunek ścieżki P3**: część wykropkowana używa `dotsOn(..., 3.5)` (stałe z P2), reszta rzędu jest pusta, a linie pomocnicze górna i dolna idą przez całą szerokość.
- **P4**: liczba powtórzeń widocznych `max(3, round(total·0.35))`; liniatura `ruled`; wzór w mm zależy od X, nie od `row.height` (patrz Summary).
- **Kółeczka i laseczki**: dopracować w `patterns.ts` (frame, „Dopracować przy implementacji”). Łącznik kółeczek wchodzi w kółko; zrobić łącznik styczny (wejście od lewej-dołu w punkt dolny/lewy koła zamiast od szczytu) i obejrzeć w osobnym podglądzie SVG przed zatwierdzeniem kształtu (zob. plan, faza 2, krok o podglądzie).
- **Seed**: `makeRows` używa `[...pool].sort(() => random() - 0.5)`, czyli sortowania z niespójnym komparatorem; w kodzie produktu użyć Fisher–Yates na kopii puli (stabilne i bez obciążenia dla pierwszych elementów).

## (d) Reguły generatora sprawdzalne testem jednostkowym

Wszystkie bez DOM, na `rowGeometry` i `generate`:

1. **Rzędy się nie powtarzają**: `rows.length` różnych `patternId`, dopóki pula starcza (P1 pula 5 ≥ 4 rzędy; P2 12 ≥ 5; P3 18 ≥ 6; P4 18 ≥ 7). Dwie następne karty mają różny `key`.
2. **P1–P2: ścieżka bez skrzyżowań**: brak właściwego przecięcia niesąsiednich odcinków (funkcja z mojej analizy, 0 skrzyżowań na 400 ziarnach dla wszystkich wzorów obu pul).
3. **Kropki**: kolejne kropki nie bliżej niż `0,7 × rozstaw` (po naprawie `dotsOn`), kropki z różnych ramion (`i+3 ≤ j`) nie bliżej niż `2 × r + 0,6 mm` (wymaga korekty ostrych wzorów `pointed`/`bricks`; patrz Pomiar). Każdy narożnik ma kropkę (ołówek zatrzymuje się w ostrym punkcie).
4. **P3: dokładnie dwa powtórzenia po kropkach**, reszta rzędu bez kropek; **P4: co najmniej trzy powtórzenia linią**.
5. **Wzór mieści się w rzędzie i w marginesie**: wszystkie punkty `x ∈ [0, length]`, `|y| ≤ wysokość/2` (P1–P3) lub w pasie liniatury (P4: od górnej linii do blado narysowanej linii pod dolną); po przeniesieniu na kartkę `x ≥ 10`, `x ≤ 200`. Pętle cofają się w lewo, ale nigdy za początek jednostki: pomiar `minX = 0,0` dla wszystkich wzorów na 400 ziarnach, test to zamraża.
6. **Rozkład rzędów**: pierwszy wzór pod poleceniem, ostatni nad dolnym marginesem, odstępy równe, kolejne rzędy nie zachodzą na siebie (wolna przerwa 25–49 mm między skrajami), P1 ma o 15 mm większy dolny zapas.
7. **Pula poziomu**: każdy wzór rzędu pochodzi z puli poziomu; wzór `count` (domki: 5 w rzędzie) ma dokładnie 5 powtórzeń; `line` ma wysokość 0.
8. **`contentKey` / dekoracja**: `lines` nie zmienia `key` karty ani listy rzędów (test inwentarza silników).
9. **`knownBad`** (test żywotności sprawdzania, wymaga `CardSpec`): karta ze skrzyżowaniem na P2, karta P3 z trzema powtórzeniami po kropkach, karta P4 z dwoma powtórzeniami, rząd z powtórzonym wzorem, wzór poza rzędem.

**Nie do sprawdzenia testem** (jak w PRD: wyjątek od „jednej sprawdzalnej odpowiedzi”): czy dziecko odczyta regułę z początku wzoru. Czytelność kropek i linii to wydruk próbny i próba z dzieckiem (faza ręczna).

## Pomiar makiety (skrypt analizy w katalogu tymczasowym, `mockup-v6.mts` obcięty przed zapisem plików, 400 ziarn × 4 poziomy)

| Co                                            | Wynik                                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------------------- |
| Powtórzony wzór w jednej karcie               | 0 na wszystkich poziomach                                                              |
| Skrzyżowania ścieżki P1, P2 (wszystkie wzory) | 0                                                                                      |
| Skrzyżowania w części wykropkowanej P3        | `loops` 298, `oChain` 496; reszta 0                                                    |
| Skrajne `x` wzoru                             | 0,0 … 184 mm (nigdzie nie wychodzi w lewo za początek)                                 |
| Skrajne `                                     | y                                                                                      | `   | równe `wysokość / 2`; `maxHeight` 20 / 18 / 15 / 13 mm |
| Najbliższe kolejne kropki                     | `waveFlat` 0,52, `tunnel` 0,75, `wave` 0,77–0,96, `pointed` 1,07 mm (rozstaw 3,5–4 mm) |
| Najbliższe kropki z różnych ramion            | `pointed` P2 1,93, P3 2,37; `bricks` P3 2,10; `pipes` P3 3,38 mm                       |
| Wolna przerwa między skrajami rzędów          | P1 48,7 · P2 37,8 · P3 30,2 · P4 25,0 mm (liniatura P4 ma 19,5 mm wysokości)           |
| Zakres `y` wzorów P4 w liniaturze (X = 6,5)   | małe −3,25…3,25; `tallShort`, `spell` −9,75…3,25; `loopsDown`, `upDown` −3,25…9,75     |

## Code References

- `src/lib/card-settings.ts:37-92`, `fieldValue` (~188), `normalizeCard` (~254) — ustawienia, boolean po nazwie, normalizacja (sudoku jako wzór).
- `src/components/SudokuGenerator.tsx:100-135` — przełączniki widoczne warunkowo; `src/components/SettingToggle.tsx` — przełącznik z własnym wierszem na telefonie.
- `src/lib/copy-drawing/engine.ts`, `layout.ts`, `sheet.ts`, `levels.ts` — najświeższy wzorzec kształtu modułu; `src/lib/odd-one-out/engine.ts` — `knownBad` ze `seeded`.
- `src/lib/sheet-state.ts:61-74` — `applySettings` i `contentKey`; `src/lib/sheet/speech.ts` — pas 26 mm i `instructionBoxHeight`.
- `src/lib/card-engines.test.ts:245-270` — inwentarz silników; `src/lib/sheet/print-contract.test.ts:29-31,350-374`.
- `context/changes/pattern-lines-card/mockup-v6.mts:14-182` (jednostki i wzory), `:205-210` (poziomy), `:231-282` (rzędy, ścieżka, kropki), `:288-365` (rysunek karty).

## Historical Context

- `context/changes/copy-the-drawing-card/{research,plan}.md` — kolejność faz, lista wpisów; wzorzec planu z trzema fazami (PRD, logika, strona).
- `context/archive/2026-11-08-odd-one-out-card/` — makieta `.mts` jako skrypt w folderze zmiany, `knownBad`, `seeded`.
- `context/foundation/lessons.md` — wysokość druku mierzy się osobno w Safari, Chrome iOS i Brave iOS.

## Open Questions

1. **P3: pętle (e) i kółeczka (o a) w części wykropkowanej się krzyżują.** Zostawić (dziecko prowadzi ołówek po pętli, szara ścieżka pokazuje kierunek), usunąć je z puli P3 (zostają w P4) czy pokazać w części wykropkowanej tylko linię bez kropek? — decyzja użytkowniczki, domyślnie w planie: zostawić, sprawdzić na dziecku.
2. **Domyślny poziom karty** (profil bez wpisu): PRD nie mówi. Plan zakłada Poziom 2 (5–6 lat, tryb kropek, bez przełącznika „Linie”); do potwierdzenia.
3. **P4: kolumna „Wysokość / krok” w PRD** (0,6–1,0) nie odpowiada rysunkowi (wysokość wyznacza liniatura). Poprawić kolumnę w PRD (faza 1) zamiast zmieniać makietę.
4. **Kolory szarości** (ścieżka pod kropkami, linie pomocnicze, liniatura): istniejący token czy nowy (AGENTS.md zakazuje nowych hexów w komponentach).
5. **Miejsce na podpis 4 mm nad pierwszym rzędem** (`firstCenter = top + 4 + …`) istnieje w makiecie dla szarych podpisów rzędów, których karta nie ma; sprawdzić na wydruku, czy odstęp bez podpisu jest dobry.
