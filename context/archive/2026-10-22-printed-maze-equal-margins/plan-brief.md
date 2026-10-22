# Na wydruku labirynt z postacią niżej, równy margines góra i dół — Plan Brief

> Full plan: `context/changes/printed-maze-equal-margins/plan.md`

## What & Why

Na kartce z postacią znak postaci prawie dotyka górnej krawędzi (1–2,4 mm), a pod napisem „Meta” zostaje ok. 17 mm bieli. Cały blok karty — postać albo „Start”, labirynt i „Meta” — schodzi w dół, żeby przy postaci biały pas u góry i u dołu był równy. Roadmapa S-11, issue #35; ostatni plasterek kamienia `first-printable-a4-maze`.

## Starting Point

`layoutSheet` (`src/lib/sheet/layout.ts`) dzieli wolną wysokość na dwa równe pasy nad i pod siatką; znak postaci 30×30 stoi na górze siatki, „Meta” na środku dolnego pasa. Ten sam SVG jest na ekranie i w druku.

## Desired End State

Na poziomach 3 lata do 7–8 lat blok schodzi o ok. 7,7–8,0 mm (zależnie od siatki): przy postaci ok. 9–10 mm bieli nad postacią i tyle samo pod „Meta”. Wersja ze „Start” schodzi o tyle samo (ok. 25 mm u góry, 9–10 mm na dole). Ściany zostają ponad 20 mm od dołu i co najmniej 10 mm od każdej krawędzi. Nastolatek bez zmian.

## Key Decisions Made

| Decision          | Choice                                                                   | Why (1 sentence)                                                                                          |
| ----------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Co się przesuwa   | Cały blok: postać albo „Start”, labirynt, „Meta”                         | Odstępy wewnątrz bloku i rozmiar postaci zostają, zmienia się tylko jego położenie (słowa użytkowniczki). |
| Wersja ze „Start” | Schodzi o tyle samo co z postacią                                        | Decyzja „wszystko o tyle samo w dół”: labirynt stoi w tym samym miejscu niezależnie od wyboru postaci.    |
| Ile w dół         | `s` dające równy pas nad znakiem i pod dolną krawędzią „Meta”            | Tak S-11 definiuje margines: dolny liczy się pod treścią karty.                                           |
| Nastolatek        | Bez zmian                                                                | Wprost w poleceniu i w roadmapie.                                                                         |
| Druk z iPhone'a   | Osobno, w `print-printer-margins` po S-11                                | Mała zmiana zamyka kamień; iOS planuje się na nowym układzie.                                             |
| Sprawdzenie       | Testy układu, zawężony Stryker, ręczny druk w Chrome i Safari na iPhonie | Testy pilnują liczb, druk pokazuje to, co widzi rodzic.                                                   |

## Scope

**In scope:**

- Przesunięcie bloku w `layoutSheet` dla poziomów z postacią.
- Przekazanie poziomu i wysokości napisu z `MazeSheet`.
- Testy w `layout.test.ts`, zawężony Stryker na `layout.ts`.
- Ręczny druk i akapit „Układ kartki” w `test-plan.md`.

**Out of scope:**

- Poziom nastolatka.
- Podwójny margines z iPhone'a (#38).
- Rozmiar postaci, odstęp „Meta” od siatki, inset z boków.
- `@page` i `@media print`.

## Architecture / Approach

`SheetLayoutInput` dostaje `levelShowsCharacter` i `labelHeight`. Gdy poziom pokazuje postać, układ liczy `s = (pageHeight − metaY − labelHeight/2 − originY + markSize) / 2` z dzisiejszych pozycji i dodaje je do wszystkich współrzędnych pionowych bloku, także dla „Start”. `MazeSheet` przekazuje `level.showCharacter` i rozmiar napisu z jednej stałej.

## Phases at a Glance

| Phase                                 | What it delivers                                     | Key risk                                                                     |
| ------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1. Przesunięcie bloku w `layoutSheet` | Nowy układ z testami i Strykerem                     | Pomylenie „wybrano postać” z „poziom pokazuje postać” — „Start” nie zszedłby |
| 2. Ręczny druk i dokumenty            | Wydruk w Chrome i na iPhonie, akapit w planie testów | iOS dalej drukuje mniejszą kartę (znane, #38)                                |

**Prerequisites:** brak; S-02 i S-03 są zrobione.
**Estimated effort:** ~1 sesja kodu + ręczny druk.

## Open Risks & Assumptions

- Dolna krawędź „Meta” liczona jako środek napisu + 3,5 mm (połowa czcionki 7 mm); widoczne litery kończą się trochę wyżej, więc równość jest na oko, z dokładnością do ok. 1 mm.
- Przy 13×16 i 17×21 góra postaci zostaje w pasie 10 mm (ok. 9,1–9,4 mm), co PRD dopuszcza.

## Success Criteria (Summary)

- Na wydruku z postacią biały pas nad postacią i pod „Meta” wygląda na równy.
- Labirynt i postać nie są ucięte, kartka mieści się na jednej stronie.
- Poziom nastolatka wygląda jak przed zmianą.
