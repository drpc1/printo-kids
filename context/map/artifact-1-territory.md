# Terytorium zmian, 27 września – 2 listopada 2026

Historia gita jest krótsza niż 12 miesięcy. Pierwszy commit na `main` to 27 września 2026, ostatni dzień z ruchem to 2 listopada 2026. Wzięta jest cała historia tej linii.

Liczone są commity z `main` bez commitów scalających: 658 takich commitów. Miara to liczba commitów, które ruszyły ścieżkę, nie liczba linii. Commit wchodzi do obszaru raz, nawet gdy zmienił w nim kilka plików. Ten sam commit może wejść do dwóch obszarów.

Z rankingu wypadają lockfile, snapshoty, pliki generowane, dotenv, configi, grafiki, Markdown i całe `context/`. Pominięte są 23 commity `chore(archive): close …` (masowe przenosiny folderów w `context/`). Commitów botów od zależności i automatycznych podbić wersji nie ma. Duże commity funkcji zostają. Czysta zmiana nazwy (podobieństwo 100%) nie podbija licznika, a starsze commity liczą się przy nowej ścieżce.

Po tych filtrach zostaje 635 commitów. Kod produktu ruszyło 257 z nich.

## Udział agentów

Autor w gicie jest zawsze drpc1. Współautor-agent jest w stopce `Co-authored-by`.

613 z 635 commitów (96%) ma współautora-agenta: Claude Sonnet 5.5 — 289, Cursor — 231, Claude Opus 5.5 — 93. Przy 257 commitach, które ruszyły kod produktu, współautor-agent jest przy wszystkich. 22 commity bez agenta zamykają notatki w `context/` i do rankingu nie wchodzą.

## Obszary

Surowe katalogi na górze, zanim zejść niżej: `src/components` 122, `tests/e2e` 74, `src/lib/sheet` 55, luźne pliki w `src/lib` 50. Poniżej te same obszary produktu. Udział agentów przy każdym: 100%.

| Obszar | Commity |
| --- | ---: |
| Labirynt | 62 |
| Profil dziecka | 58 |
| Druk A4 | 54 |
| Katalog | 45 |
| Symetria | 42 |
| Sudoku | 40 |
| Układ na telefonie | 30 |
| Sekwencje | 28 |
| Nonogram | 25 |
| Postać na karcie | 24 |
| Skrypty sprawdzające | 24 |
| Dyktando | 22 |
| Dialog | 19 |
| Wygląd (tokeny, szablon) | 17 |
| CardPage / sterowanie | 8 |
| Pieniądze | 4 |

Labirynt: 48 z 62 commitów to `src/components/WorksheetGenerator.tsx`. Większość tych 48 jest sprzed 30 października 2026, kiedy wspólne Generuj, Drukuj i wiersz ustawień przeszły do `CardPage` (kampania `gh192-pages-sceleton`). Samo `CardPage` / `useCardPage` / Generuj / przełączniki to 8 commitów.

## Pliki

Udział agentów przy każdym: 100%.

| Commity | Plik |
| ---: | --- |
| 48 | `src/components/WorksheetGenerator.tsx` |
| 31 | `src/lib/sheet/print-contract.test.ts` |
| 27 | `src/components/ProfileCorner.tsx` |
| 23 | `tests/e2e/phone-layout.spec.ts` |
| 21 | `src/components/SudokuGenerator.tsx` |
| 19 | `scripts/build-thumbnails.mjs` |
| 19 | `src/components/GeneratorShell.astro` |
| 19 | `tests/e2e/catalog.spec.ts` |
| 17 | `src/components/SymmetryGenerator.tsx` |
| 16 | `src/lib/child-profiles.test.ts` |

## Tygodnie

Tydzień liczy się od poniedziałku. 27 września to niedziela startu (tydzień od 21 września, jeden commit produktu). Tydzień z 26 października trwa do 1 listopada. W poniedziałek 2 listopada kod produktu na `main` nie ruszył.

Commity produktu w tygodniu: 1, 12, 19, 29, 77, 117.

| Obszar | 27.09 | 28.09–4.10 | 5–11.10 | 12–18.10 | 19–25.10 | 26.10–1.11 | Rytm |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Labirynt | 0 | 8 | 11 | 17 | 12 | 14 | stały |
| Profil dziecka | 0 | 0 | 5 | 10 | 7 | 36 | rosnący |
| Druk A4 | 0 | 6 | 5 | 8 | 19 | 16 | rosnący |
| Katalog | 1 | 2 | 1 | 0 | 19 | 22 | rosnący |
| Symetria | 0 | 0 | 0 | 0 | 21 | 21 | rosnący |
| Sudoku | 0 | 0 | 0 | 0 | 14 | 26 | rosnący |
| Układ na telefonie | 0 | 0 | 0 | 6 | 10 | 14 | rosnący |
| Sekwencje | 0 | 0 | 0 | 0 | 7 | 21 | rosnący |
| Nonogram | 0 | 0 | 0 | 0 | 8 | 17 | rosnący |
| Dyktando | 0 | 0 | 0 | 0 | 8 | 14 | rosnący |
| Postać na karcie | 0 | 0 | 3 | 0 | 5 | 16 | sezonowy |
| Skrypty sprawdzające | 1 | 0 | 3 | 0 | 10 | 10 | sezonowy |
| Pieniądze | 0 | 0 | 0 | 0 | 0 | 4 | sezonowy |
| CardPage / sterowanie | 0 | 0 | 0 | 0 | 1 | 7 | sezonowy |
| Dialog | 1 | 2 | 1 | 8 | 3 | 4 | wygasający |
| Wygląd | 1 | 3 | 1 | 6 | 5 | 1 | wygasający |

Labirynt bezwzględnie zostaje przy 8–17 commitach tygodniowo. Jego udział w tygodniu spada, bo tydzień urósł z 12 do 117 commitów.

Kampanie widoczne w opisach commitów:

- 28 września – 11 października: `first-printable-maze`, `print-a4-maze`, `worksheet-page-shell`, potem `child-profile-create-select` i `child-profile-save-delete`.
- 12–18 października, szczyt labiryntu (17): `phone-worksheet`, `winding-maze-path`, `maze-difficulty-levels`. W tym samym tygodniu sezon dialogu (`dialog-close-button`) i szczyt wyglądu (6 z 6 commitów to `phone-worksheet`).
- 19–25 października: `card-catalog-home`; symetria (`symmetry-first-printable`, `template-object-catalog`, `symmetry-difficulty-levels`, `symmetry-color-codes`); sudoku (`picture-sudoku-first-printable`, `picture-sudoku-levels`, `picture-sudoku-colors`); dyktando (`graphic-dictation-first-printable`); nonogram (`nonogram-first-printable`); sekwencje (`sequences-first-printable`, `sequence-difficulty-levels`). Skok katalogu do 19 obejmuje miniatury dokładane przy tych kartach.
- 26 października – 1 listopada: profil do 36 przez `card-settings-memory`, `gh237-maze-level` i `favorite-character-explicit`. Postać: `character-speaks-instruction`. Pieniądze w całości `coins-who-has-more`. CardPage w całości `gh192-pages-sceleton`. Ta przeprowadzka wchodzi po kilka commitów do symetrii, sudoku, sekwencji, nonogramu i dyktanda. Obok niej własna robota: `sudoku-shape-list`, `gh174-sudoku-shapes-placement`, `sequence-shape-colors`, `nonogram-sizes`, `gh198-shape-category`, `gh124-more-symetric-shapes`, `gh115-non-symetric-shapes`, `print-printer-margins`, `s32-how-does-it-work`.

## Poprawki w pięciu najaktywniejszych

Poprawka to temat od `fix` lub `hotfix`. Revert byłby osobno. Hotfixów nie ma. Revertów nie ma na `main` ani na pozostałych gałęziach, więc nie ma dużego reverta do przypisania jednemu obszarowi.

| Obszar | Commity | `fix` | Udział | Reverty |
| --- | ---: | ---: | ---: | ---: |
| Labirynt | 62 | 10 | 16% | 0 |
| Profil dziecka | 58 | 12 | 21% | 0 |
| Druk A4 | 54 | 9 | 17% | 0 |
| Katalog | 45 | 7 | 16% | 0 |
| Symetria | 42 | 5 | 12% | 0 |

Tematy `fix` przy labiryncie, które dotyczą labiryntu: wspólna ściana rysowana dwa razy, brak przegenerowania po zmianie poziomu, rysunek postaci od krawędzi na poziomie nastolatka. Reszta to przegląd w trakcie funkcji albo `phone-worksheet`.

Przy profilu: poziom sudoku zostawał przy 4×4, zapis ulubionej czytał nieświeży stan, róg profilu na katalogu nie odświeżał się przy powrocie (`gh234`). Reszta to `phone-worksheet`, przeglądy, angielskie ścieżki w testach i etykiety listy.

Przy druku cztery z dziewięciu `fix` to druk z telefonu (`phone-worksheet`, beżowe tło Safari, `print-printer-margins` z limitem 108vh). Reszta to przeglądy.

Przy katalogu większość `fix` to przeglądy innych kart, które ruszyły miniatury albo `cards.ts`, plus opis w „Jak to działa” i ten sam `gh234`.

Przy symetrii cztery z pięciu to przegląd premiery, piąty to wcięcie przełącznika na wąskim ekranie.

Zamknięty PR bez merge'a w całym repozytorium jest jeden: #15, „test: red CI / ci to verify required checks” (zamknięty 9 października 2026). Opis prosi, żeby go nie scalać: celowo psuje test labiryntu, żeby czerwone `CI / ci` blokowało merge. Profil, druk, katalog i symetria takiego PR nie mają.

Otwartych zgłoszeń z etykietą `bug` nie ma. Etykieta ma jedenaście zgłoszeń, wszystkie zamknięte. Sześć otwartych issues to plasterki roadmapy i propozycje, nie błędy tych pięciu obszarów.

## Współzmiany

Jednostką są te same obszary. Pominięte jest 16 commitów, które naraz ruszyły 5 lub więcej obszarów (start repozytorium, angielskie adresy, szkielet `CardPage` na kolejnych kartach, wspólne tytuły stron, stopka „Ustaw jako ulubioną”, wejście karty pieniędzy). Zostaje 239 commitów. Procent jest od mniej aktywnego obszaru pary już po tym cięciu, dlatego mianowniki są niższe niż w tabeli obszarów.

| Para | Commity razem | Udział mniej aktywnego |
| --- | ---: | --- |
| Druk A4 + Labirynt | 24 | 51% druku (47) |
| Labirynt + Profil | 18 | 35% profilu (51) |
| Katalog + Skrypty | 9 | 43% skryptów (21) |
| Postać + Profil | 8 | 40% postaci (20) |
| Druk A4 + Katalog | 8 | 21% katalogu (38) |
| Katalog + Telefon | 7 | 29% telefonu (24) |
| Druk A4 + Profil | 7 | 15% druku (47) |
| Labirynt + Postać | 6 | 30% postaci (20) |

Trójka Druk + Labirynt + Profil: 5 commitów, 11% druku. Druk + Katalog + Skrypty: 4, 19% skryptów.

Pliki, które najczęściej stoją w tych parach (wszystkie nadal są w drzewie):

- Druk + labirynt: `WorksheetGenerator.tsx` (22), `print-contract.test.ts` (10), `GeneratorShell.astro` (9), `src/lib/sheet/layout.test.ts` (7), `src/lib/sheet/layout.ts` (4).
- Labirynt + profil: `WorksheetGenerator.tsx` (16), `ProfileCorner.tsx` (14), `src/lib/child-profiles.test.ts` (9), `src/lib/child-profiles.ts` (6), `src/hooks/useChildProfileVisit.ts` (4).
- Katalog + skrypty: `scripts/smoke.mjs` (8), `scripts/build-thumbnails.mjs` (6), `src/lib/cards.ts` (5).
- Postać + profil: `src/lib/child-profiles.test.ts` (4), `src/lib/sheet/own-image-store.test.ts` (4), `src/lib/sheet/character.test.ts` (3), `src/lib/sheet/character.ts`.

## Wspólny plik obok podziału na obszary

Pliku tłumaczeń nie ma. Config i listy dopisywane ręcznie schodzą się z wieloma obszarami. Liczba commitów poniżej jest z odczytu, który dolicza `package.json` (w rankingu obszarów był odfiltrowany jako config) i pomija commity o pięciu i więcej obszarach.

| Plik | Commity obok kodu produktu | Obszary | Zmiana |
| --- | ---: | ---: | --- |
| `package.json` | 47 | 16 | ręcznie, lista plików w `scripts.test` |
| `src/lib/sheet/print-contract.test.ts` | 23 | 14 | ręcznie, stałe ze ścieżkami stron i generatorów |
| `scripts/build-thumbnails.mjs` | 17 | 11 | ręcznie; SVG, które zapisuje, są generowane |
| `scripts/smoke.mjs` | 9 | 12 | ręcznie, zdania sprawdzane na stronach |
| `src/lib/cards.ts` | 8 | 10 | ręcznie, lista `CARD_KINDS` |

Lockfile schodzi się z kodem w 3 commitach, `wrangler.jsonc` w jednym. Każdy plik w `public/thumbnails/` ma 1–3 commity i wraca ze swoją kartą. `src/styles/global.css` schodzi się z 7 obszarami.

`WorksheetGenerator.tsx` (44 commity, 13 obszarów) i `ProfileCorner.tsx` (24, 11) są domami labiryntu i profilu, nie rejestrem wspólnym dla repo.

## Ścieżki, których już nie ma

Stare ścieżki po zmianie nazwy. Plik pod nową ścieżką jest w drzewie. Czysty rename nie podbijał licznika.

- `src/pages/labirynt.astro` → `src/pages/maze.astro`
- `src/pages/dyktando.astro` → `src/pages/dictation.astro`
- `src/pages/sekwencje.astro` → `src/pages/sequences.astro`
- `src/pages/symetria.astro` → `src/pages/symmetry.astro`
- `src/components/WorksheetHome.astro` → `src/components/GeneratorShell.astro`
- `src/components/SequenceLevelChoice.tsx` → `src/components/LevelChoice.tsx`

Usunięty, bez spięcia jako rename: `src/hooks/useScrollEdges.ts` (3 commity, układ telefonu). Commit `425e6a7` (`feat(phone-worksheet): widoczny pasek przewijania w oknach zamiast cienia`) kasuje go i dodaje `src/hooks/useScrollIndicator.ts`. Nowy plik jest w repo. Git nie uznał tego za zmianę nazwy.

Pliki z mocnych par współzmian są w drzewie pod ścieżkami z tabeli powyżej.
