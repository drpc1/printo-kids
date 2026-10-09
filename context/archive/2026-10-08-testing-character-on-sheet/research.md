---
date: 2026-10-08T21:14:42+02:00
researcher: drpc1
git_commit: b11e6aab6647da31b8557374c3bfe3dc9c6d901d
branch: print-sheet-contract
repository: printo-kids
topic: "Kiedy wybrana albo przywrócona postać i Meta wchodzą na kartkę, i której części tego nie sprawdza adres pliku"
tags: [research, codebase, sheet, character, last-used, print]
status: complete
last_updated: 2026-10-08
last_updated_by: drpc1
---

# Research: Kiedy wybrana albo przywrócona postać i Meta wchodzą na kartkę, i której części tego nie sprawdza adres pliku

**Date**: 2026-10-08T21:14:42+02:00
**Researcher**: drpc1
**Git Commit**: b11e6aab6647da31b8557374c3bfe3dc9c6d901d
**Branch**: print-sheet-contract
**Repository**: printo-kids

Kotwice `plik:linia` pochodzą z drzewa roboczego. Względem tego commita `src/components/WorksheetGenerator.tsx`, `src/lib/child-profiles.ts` i `src/lib/child-profiles.test.ts` są zmienione w indeksie, a `package.json` i `context/foundation/test-plan.md` mają zmiany poza indeksem. Permalinki nie są użyte.

## Research Question

Kiedy na kartkę wchodzi postać właśnie wybrana albo przywrócona, co zostaje przy „Bez postaci” i przy napisie „Meta”, oraz która część tych faktów jest już sprawdzona, a której nie da się dowieść prostokątem 30 na 30. Wyrocznią tej zmiany jest adres pliku postaci. Zarchiwizowany plan `print-sheet-contract` i macierz przeglądarek zostają zamknięte.

## Summary

W odczytanym `WorksheetGenerator.tsx` adres pliku nie wchodzi do `layoutSheet`. Ta funkcja dostaje boolean `characterSelected`. Adres jest polem `src` w stałej `CHARACTER_CHOICES`. Gdy stan `maze` nie jest `null`, ten sam `src` trafia do jednego SVG jako `href` elementu `image`. Dla `src === null` (`id` `"none"`, etykieta „Bez postaci”) ta gałąź JSX nie rysuje `image` i rysuje tekst ze `start.text`, który w `layoutSheet` jest napisem „Start”. Napis „Meta” jest liczony przed rozgałęzieniem postaci i jest w tym SVG, gdy `MazeSheet` jest zamontowany.

`handlePrint` woła `window.print()` i nie buduje drugiej kartki. W odczytanym CSS druku w `WorksheetHome.astro` nie ma reguły, która podmienia `href` albo osobno chowa `image` i `text` wewnątrz SVG. To jest fakt źródeł, nie ponowiony podgląd Chrome ani Edge.

Testy w `src/lib/sheet/` nie zawierają nazw `samochodzik`, `rakieta`, `dinozaur` ani ścieżki `/characters/`. `layout.test.ts` przy `characterSelected: true` sprawdza prostokąt 30 na 30, a przy `false` słowo „Start” i brak `mark`. `last-used.test.ts` i `openingVisit` sprawdzają identyfikator, nie `href`.

Przywrócenie identyfikatora ma w `openingVisit` dwa tory. Przy `profiles.length === 1` wynikiem jest `character` tego profilu, także gdy argument `lastUsed` jest inny. Przy liście pustej albo przy co najmniej dwóch profilach wynikiem jest argument `lastUsed`. Zapis `printo-kids:last-used` przy kliknięciu wiersza jest włączony, gdy `activeId === null`.

## Detailed Findings

### Adres pliku jest w katalogu komponentu, nie w układzie

Stała `CHARACTER_CHOICES` w `src/components/WorksheetGenerator.tsx:25-30` ma cztery wpisy:

| id | etykieta | src |
| --- | --- | --- |
| `none` | Bez postaci | `null` |
| `samochodzik` | Samochodzik | `/characters/samochodzik.png` |
| `rakieta` | Rakieta | `/characters/rakieta.png` |
| `dinozaur` | Dinozaur | `/characters/dinozaur.png` |

Listing katalogu `public/` z 2026-10-08 pokazuje trzy pliki: `public/characters/samochodzik.png`, `public/characters/rakieta.png`, `public/characters/dinozaur.png`. Bajty PNG nie były otwierane.

`layoutSheet` przyjmuje `characterSelected: boolean` (`src/lib/sheet/layout.ts:27`) i nie ma pola ścieżki. `generateMaze` przyjmuje generator liczb (`src/lib/maze/generate.ts:27`). Wywołanie przy Generuj to `mazeForSheet(generateMaze(Math.random))` (`src/components/WorksheetGenerator.tsx:85`). Identyfikator postaci do tego wywołania nie wchodzi.

Wyszukanie `characterSrc` i `CHARACTER_CHOICES` w `src/` trafia w ten jeden plik komponentu. Jedyny `href` obrazka postaci na kartce w tym wyszukaniu jest w `MazeSheet` (`src/components/WorksheetGenerator.tsx:475`).

### Kiedy adres wchodzi na kartkę

Stan `character` startuje z `readVisitStart` (`src/components/WorksheetGenerator.tsx:61-64`, `:554-561`). `selectedChoice` szuka wpisu o tym `id`; przy braku wpisu bierze pierwszy element stałej, czyli `none` (`:68`). `characterChoice` mapuje string spoza stałej na `"none"` (`:565-570`).

`MazeSheet` jest w drzewie, gdy `maze !== null` (`:153`). Dostaje `selectedChoice.src` (`:153`, `:448`). `characterSelected` w układzie jest wtedy `characterSrc !== null` (`:457`).

Gdy `mark !== null` i `characterSrc !== null`, JSX wstawia `<image href={characterSrc}>` w prostokącie `mark` (`:474-475`). W przeciwnym razie, gdy `start !== null`, wstawia `{start.text}` (`:476-487`). Ta trzecia gałąź, oba `null`, rysuje `null` (`:487`). W odczytanej funkcji `layoutSheet` gałąź `characterSelected` zwraca `start: null` i `mark`, a druga gałąź zwraca `start` ze tekstem `"Start"` i `mark: null` (`src/lib/sheet/layout.ts:53-74`). Dla wyników tej funkcji pierwsza albo druga gałąź JSX jest tą, która się wykonuje.

Klik wiersza woła `onSelect(id)` (`src/components/WorksheetGenerator.tsx:405-406`). `onSelect` w obu miejscach kontrolki to `setCharacter` (`:126`, `:147`). Po powstaniu labiryntu kolejny render czyta ten sam stan i podaje nowe `src` do `MazeSheet` (`:68`, `:153`). Tego przejścia nie uruchamiano w przeglądarce.

### „Bez postaci” i „Meta”

Dla `id` `"none"` pole `src` jest `null` (`src/components/WorksheetGenerator.tsx:26`). Układ dostaje `characterSelected: false`, więc `mark` jest `null`, a `start.text` jest `"Start"` (`src/lib/sheet/layout.ts:68-74`). Gałąź `image` w `MazeSheet` wtedy się nie wykonuje (`src/components/WorksheetGenerator.tsx:474`).

`meta` jest liczone przed `if (characterSelected)` i w obu zwrotach ma `text: "Meta"` (`src/lib/sheet/layout.ts:51-74`). `MazeSheet`, gdy jest zamontowany, wstawia `sheet.meta.text` do elementu `text` (`src/components/WorksheetGenerator.tsx:489-498`). Test układu sprawdza ten napis dla wywołania z `true` (`src/lib/sheet/layout.test.ts:25-29`) i dla wywołania z `false` (`:51-61`).

Pozycja „Meta” w tej funkcji leży na `labelX` kolumny wejścia, w paśmie pod kratką (`src/lib/sheet/layout.ts:46-51`). Kolumna w `MazeSheet` to stała `LABEL_COLUMN = 6` (`src/components/WorksheetGenerator.tsx:22`, `:455`). Generator labiryntu ma osobne `ENTRANCE_COL` i `EXIT_COL` równe 6 (`src/lib/maze/generate.ts:16-19`). Wspólnej stałej między tymi plikami nie ma.

### Druk czyta tę samą kartkę w źródle

`handlePrint` to `window.print()` (`src/components/WorksheetGenerator.tsx:91-93`). Drugiego wywołania `layoutSheet` i drugiej gałęzi postaci pod druk w tym pliku nie ma.

CSS druku w `WorksheetHome.astro:46-74` chowa `h1`, `p` i `button` wewnątrz `#worksheet-home` oraz ustawia `#worksheet-home svg` na `display: block` i `overflow: hidden`. Okno wyboru ma klasę `print:hidden` (`src/components/WorksheetGenerator.tsx:401`). Miniatura w przycisku „Postać:” używa tego samego `src` (`:394-395`), a ten przycisk wpada w regułę `button { display: none }`. Wyszukanie `@page`, `print`, `Start`, `Meta` i `character` w `src/styles/global.css` nie dało trafień.

`src/lib/sheet/print-contract.test.ts` nie zawiera `href` ani `characters/`. Te testy nie są dowodem, że przeglądarka wydrukowała dany plik. Podgląd Chrome i Edge zostaje w zarchiwizowanym planie; ta zmiana go nie wznawia.

### Dwa tory przywrócenia, jeden adres na kartce

`openingVisit` (`src/lib/child-profiles.ts:70-80`):

- Gdy `profiles.length === 1`, zwraca `character` tego profilu i `activeId` tego profilu. Test z jednym profilem o `character: "rakieta"` i argumentem `lastUsed` `"samochodzik"` oczekuje `"rakieta"` (`src/lib/child-profiles.test.ts:158-163`).
- W przeciwnym razie zwraca argument `lastUsed` i `activeId: null`. Pusta lista z `"samochodzik"` oczekuje `"samochodzik"` (`:150-155`). Dwa profile i `lastUsed` `"samochodzik"` też oczekują `"samochodzik"` (`:166-179`).

`readVisitStart` podaje ten wynik do stanu po `characterChoice` (`src/components/WorksheetGenerator.tsx:554-561`).

Zapis ostatniej postaci przy kliknięciu wiersza jest pod `if (rememberLastUsed)` (`:407-409`). Oba wywołania kontrolki ustawiają `rememberLastUsed={activeId === null}` (`:127`, `:148`). Utworzenie profilu i wybór profilu ustawiają `character` z `profile.character` (`:95-103`) i w tych dwóch funkcjach nie wołają `writeLastUsed`.

Skutek dla kartki: `MazeSheet` dostaje `src` bieżącego stanu `character`, niezależnie od tego, czy ten stan przyszedł z ostatniego zapisu, z jedynego profilu, czy z kliknięcia przy aktywnym profilu. Testy `openingVisit` i `last-used` kończą się na identyfikatorze.

### Czego obecne testy Node nie czytają

Dla siatki 13 na 16, strony 210 na 297, wcięcia 10 i znacznika 30 (`src/lib/sheet/layout.test.ts:5-11`):

- `characterSelected: true` wymaga `mark` 30 na 30, `start === null`, środka na kolumnie wejścia, spodu na górze labiryntu i `mark.y >= 0` (`:38-48`).
- `characterSelected: false` wymaga `mark === null`, tekstu `"Start"` i nadal tekstu `"Meta"` (`:51-61`).

W `src/lib/sheet/` nie ma `samochodzik`, `rakieta`, `dinozaur` ani `/characters/`. W `src/lib/last-used.test.ts` nie ma `href`, `MazeSheet`, `characters/`, `layoutSheet` ani `Start`. W `src/lib/child-profiles.test.ts` nie ma `href`, `samochodzik.png`, `characterSrc` ani `Start`.

Skrypt `test` w `package.json:12` uruchamia Node `node:test` na pięciu plikach: `generate.test.ts`, `layout.test.ts`, `print-contract.test.ts`, `last-used.test.ts`, `child-profiles.test.ts`. Tych pięciu plików nie uruchamiano w tym badaniu.

## Code References

- `src/components/WorksheetGenerator.tsx:25-30` — cztery wpisy katalogu, w tym `src` plików PNG i `null` dla „Bez postaci”
- `src/components/WorksheetGenerator.tsx:85` — generowanie labiryntu bez identyfikatora postaci
- `src/components/WorksheetGenerator.tsx:91-93` — druk jako `window.print()`
- `src/components/WorksheetGenerator.tsx:153` — kartka dostaje `selectedChoice.src`, gdy labirynt istnieje
- `src/components/WorksheetGenerator.tsx:405-409` — klik wiersza ustawia stan i, przy `activeId === null`, zapisuje ostatnią postać
- `src/components/WorksheetGenerator.tsx:448-498` — jeden SVG: `href`, tekst Start albo brak, oraz „Meta”
- `src/lib/sheet/layout.ts:51-74` — „Meta” przed rozgałęzieniem; znacznik albo „Start”
- `src/lib/sheet/layout.test.ts:38-61` — prostokąt 30 na 30 albo słowo „Start”
- `src/lib/child-profiles.ts:70-80` — jeden profil bierze swoją postać; zero albo co najmniej dwa biorą `lastUsed`
- `src/lib/last-used.ts:8-32` — odczyt i zapis identyfikatora pod `printo-kids:last-used`
- `src/components/WorksheetHome.astro:46-74` — druk chowa nagłówek, akapit i przyciski; SVG zostaje blokiem
- `package.json:12` — pięć plików w `npm test`
- `public/characters/samochodzik.png`, `public/characters/rakieta.png`, `public/characters/dinozaur.png` — pliki z listingu katalogu; piksele nieotwarte

## Architecture Insights

Czysta funkcja, którą już odpala `npm test`, rozstrzyga geometrię i słowa „Start” oraz „Meta”. Adres pliku zostaje prywatną stałą wyspy React i atrybutem `href` jednego SVG. Kontrakt druku w teście czyta tekst źródeł CSS i klas, nie ten `href`.

Dlatego wyrocznia adresu pliku nie jest kolejną asercją `mark.width === 30`. Powierzchnia, którą plan może nazwać, to albo wartość `src` powiązana z `id`, albo `href` tego SVG. Import wyspy React do testu Node nie występuje w odczytanych plikach `src/lib/*.test.ts`.

Ekran i druk w tym komponencie nie mają dwóch modeli postaci. Rozjazd, który ta zmiana ma kwestionować, jest gdzie indziej: podgląd przeglądarki i prostokąt 30 na 30 nie nazywają pliku. Źródłowy CSS druku nie podmienia `href`. Czy silnik wydruku zostawia ten atrybut, nie było obserwowane i nie jest przedmiotem nowego podglądu.

## Historical Context (from prior changes)

Każde zdanie osobno.

- **Wsparte.** US-01 wymaga wybranej postaci przy starcie i napisu „Meta” przy końcu (`context/foundation/prd.md:60-61`). Zdanie wyniku w logice biznesowej mówi to samo (`context/foundation/prd.md:137`).
- **Wsparte.** Plan `print-sheet-contract` ustala, że `layoutSheet` nie ładuje obrazków i dostaje boolean „czy postać jest wybrana” (`context/archive/2026-10-05-print-sheet-contract/plan.md:69`). Ta sygnatura jest w `src/lib/sheet/layout.ts:19-27`.
- **Wsparte.** Ten sam plan zostawia rysowanie wybranego PNG w prostokącie 30 na 30 po stronie `MazeSheet`, a „Bez postaci” jako słowo Start bez obrazka (`context/archive/2026-10-05-print-sheet-contract/plan.md:77`). Bieżący JSX tak się rozgałęzia (`src/components/WorksheetGenerator.tsx:474-487`).
- **Wsparte co do luki, nie co do numerów linii.** Follow-up z 2026-10-06 mówi, że `generateMaze` nie dostaje postaci, układ dostaje boolean, a testy nie nazywają pliku samochodzik, rakieta albo dinozaur (`context/archive/2026-10-06-test-plan-refresh-2026-10-06/research.md:133-135`). To zachowanie jest w bieżących plikach cytowanych wyżej. Numery linii `WorksheetGenerator.tsx` z tamtego akapitu (`:17`, `:35-40`, `:104`, `:164`, `:189`, `:206-207`) nie wskazują już tych miejsc. Plik urósł o profile.
- **Sprzeczne co do liczby plików.** `context/foundation/test-plan.md:73` mówi, że `npm test` uruchamia cztery pliki i wymienia je bez `child-profiles.test.ts`. Bieżący `package.json:12` wymienia pięć plików, łącznie z `src/lib/child-profiles.test.ts`. Zdania w `test-plan.md:91-99` o prostokącie, słowie Start, braku nazwy pliku i o tym, że kontrakt ostatniej postaci nie wstawia identyfikatora na kartkę, zgadzają się z odczytanymi testami układu i z brakiem `href` w `last-used.test.ts`.
- **Częściowe.** Zdanie z follow-upu, że żaden z czterech plików `npm test` nie sprawdza pliku postaci (`research.md:135`), milczy o piątym pliku. Wyszukanie w `child-profiles.test.ts` nie znalazło `href` ani `characterSrc`. Luka adresu pliku na kartce obejmuje też ten piąty plik. Liczba „cztery” jest nieaktualna.
- **Poza tym badaniem.** Wiersze ręcznego podglądu Chrome i Edge w planie `print-sheet-contract` nie były ponownie czytane. Notatka tej zmiany i `test-plan.md:95` oraz sekcja „Koniec projektu” zostawiają Firefox, Safari i całą czwórkę poza tym folderem. Tych podglądów nie powtarzano.

## Related Research

- `context/archive/2026-10-06-test-plan-refresh-2026-10-06/research.md` — luka adresu pliku; numery linii komponentu są nieaktualne
- `context/archive/2026-10-04-maze-character-choice/research.md` — wcześniejsze ustalenie zestawu postaci; los napisu Start domknął dopiero plan tego plasterka
- `context/archive/2026-10-05-print-sheet-contract/` — jest `plan.md`, nie ma `research.md`
- `context/archive/2026-10-05-last-used-print-params/` — jest `plan.md`, nie ma `research.md`

## Open Questions

- Czy wyrocznia tej zmiany ma nazwać także tor jednego profilu, w którym na kartkę wchodzi `profile.character`, a nie ostatni zapis? Kod i test `openingVisit` to rozróżniają. Notatka zmiany mówi o postaci wybranej albo przywróconej jako ostatnia. To jest wybór zakresu na plan, nie brak odczytu.
- Gdzie ma żyć asercja adresu: przy eksporcie mapy `id` → `src`, czy przy `href` SVG. W odczytanych testach `src/lib/` nie ma importu wyspy React, a `layoutSheet` ścieżki nie przyjmuje.
- Jak React zapisuje `href` w DOM po renderze, nie było sprawdzane. Źródło JSX ustawia `href={characterSrc}` (`src/components/WorksheetGenerator.tsx:475`).
