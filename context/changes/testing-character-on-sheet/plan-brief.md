# Prove the sheet shows the chosen character file — Plan Brief

> Full plan: `context/changes/testing-character-on-sheet/plan.md`
> Research: `context/changes/testing-character-on-sheet/research.md`

## What & Why

Kartka ma nieść plik postaci, która już na nią weszła: samochodzik, rakietę albo dinozaura. Sam prostokąt 30 na 30 tego nie rozstrzyga. „Bez postaci” zostawia napis „Start” i brak obrazka. Napis „Meta” zostaje tam, gdzie sprawdza go test układu.

## Starting Point

Katalog czterech postaci siedzi w `WorksheetGenerator.tsx`. `layoutSheet` dostaje tylko informację, czy plik jest. `npm test` sprawdza prostokąt, słowo „Start” i identyfikator ostatniego zapisu, a nie ścieżkę PNG na kartce. Jeden profil z rakietą przy ostatnim zapisie samochodzik zwraca rakietę w `openingVisit`, bez `href`.

## Desired End State

Test Node dostaje identyfikator i wymaga jego pliku: trzy ścieżki `/characters/*.png` albo `null` dla `none`. Obrazek SVG bierze tę samą wartość. Przewodnik testów nazywa ten wzorzec i przestaje mówić, że plik postaci jest niesprawdzony.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Wyrocznia | Adres pliku identyfikatora na kartce | Prostokąt 30 na 30 nie nazywa postaci | Research |
| Para profil / ostatni zapis | Zostaje w `openingVisit`: profil `rakieta` i ostatni zapis `samochodzik` nie wchodzą do nowego testu | Użytkownik wybrał plik identyfikatora, który już wszedł na kartkę | Plan |
| Powierzchnia | `characterSheetSrc(id): string \| null` w `src/lib/sheet/character.ts`; SVG woła tę funkcję | `node:test` nie importuje wyspy React, a skan źródeł jest wzorcem dla CSS | Plan |
| Granica | `smok` → `null` | String spoza czterech identyfikatorów nie staje się piątą postacią | Plan |
| Druk | Ten sam `href` SVG; bez nowej przeglądarki | Macierz przeglądarek i plan `print-sheet-contract` są zamknięte | Research |
| „Meta” i prostokąt | Zostają w `layoutSheet` | Ta zmiana nie powtarza geometrii | Research |

## Scope

**In scope:**

- Cztery wiersze katalogu: `none` / Bez postaci / `null`, `samochodzik`, `rakieta`, `dinozaur` i ich ścieżki `/characters/*.png`
- `href` kartki równy wynikowi `characterSheetSrc`
- Dopisanie `src/lib/sheet/character.test.ts` do skryptu `test`
- §6, zdanie o czterech plikach w §4, zdanie §5 o niesprawdzonym pliku i klauzula fazy 2 w §3

**Out of scope:**

- Para jednego profilu i ostatniego zapisu na kartce
- `@page`, klasy `print:hidden`, margines 10 mm, prostokąt 30 na 30
- Podgląd Chrome, Edge, Firefox i Safari
- Migawka pikseli, bajty PNG, render Reacta
- Komórka Status w §3

## Architecture / Approach

Moduł przy `layout.ts` trzyma katalog. Komponent rysuje `image` tylko wtedy, gdy `characterSheetSrc` zwróci ścieżkę, i wstawia tę ścieżkę w `href`. Brak wpisu rozwiązuje się do wiersza `none`, nie do pierwszego elementu tablicy. `layoutSheet` dalej dostaje boolean.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Adres pliku na kartce | Funkcja, podpięty SVG i test czterech identyfikatorów plus `smok` | Generator zostawia własną kopię ścieżek |
| 2. Podręcznik fazy | §6 oraz poprawione zdania §4, §5 i klauzula §3 | Przewodnik dalej mówi, że plik jest niesprawdzony |

**Prerequisites:** badanie w tym folderze, runner `npm test`, trzy pliki w `public/characters/`.
**Estimated effort:** jedna sesja, dwie fazy.

## Open Risks & Assumptions

- Plan dowodzi wyniku funkcji i wyrażenia JSX. Nazwa atrybutu `href` w DOM po renderze Reacta nie była obserwowana.
- `WorksheetGenerator.tsx` ma już zmiany w drzewie roboczym. Implementacja edytuje ten plik.
- Komórka Status w §3 zostaje przy orkiestratorze planu testów.

## Success Criteria (Summary)

- `npm test` wymaga trzech ścieżek PNG, `null` dla `none` i `null` dla `smok`.
- Generator nie trzyma własnych literałów tych trzech ścieżek i woła `characterSheetSrc`.
- Przewodnik opisuje ten wzorzec i nie zostawia „TBD” w sekcji druku i znaczników.
