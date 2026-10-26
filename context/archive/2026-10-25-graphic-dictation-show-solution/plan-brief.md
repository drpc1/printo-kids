# Dyktando graficzne — „Pokaż rozwiązanie” — Plan Brief

> Full plan: `context/changes/graphic-dictation-show-solution/plan.md`

## What & Why

Na dyktandzie rodzic nie ma jak sprawdzić, czy kreska dziecka zgadza się ze strzałkami. Nonogram ma już „Pokaż rozwiązanie” na podglądzie. Ta zmiana dokłada taki sam przełącznik do dyktanda (issue #119), bez ruszania poleceń, kratki i poziomów.

## Starting Point

`/dyktando` rysuje polecenia, pustą kratkę i kropkę startu. Droga obrysu jest na karcie (`start` + `commands`) i rozwija ją `walkCommands`; arkusz jej nie rysuje. Nonogram trzyma przełącznik w stanie strony, gasi go po udanym Generuj i chowa sylwetkę na druku klasą `print:hidden`.

## Desired End State

Po Generuj rodzic widzi „Pokaż rozwiązanie”, domyślnie wyłączone. Włączenie dorysowuje na podglądzie zamkniętą kreskę po liniach kratki i zostawia tę samą kartę. Wydruk jest bez tej kreski. Udane Generuj i zmiana poziomu gaszą przełącznik. Sama zmiana kategorii go nie gasi, a nieudane Generuj zostawia włącznik razem z poprzednią kartą.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Gdzie widać obrys | Tylko na ekranie; wydruk zawsze bez kreski | Zostawiony włącznik nie może oddać dziecku kartki z odpowiedzią, tak jak na nonogramie |
| Kiedy gaśnie | Udane Generuj i zmiana poziomu, która układa nową kartę | Oba wejścia podmieniają kartę przez `generateFor`; następny obrazek ma być taki, jaki zobaczy dziecko |
| Kiedy zostaje | Sama zmiana kategorii oraz nieudane Generuj | Kategoria nie losuje karty, a porażka zostawia poprzednią |
| Co jest narysowane | Zamknięta kreska z `walkCommands`, 1,2 mm, nad kratką, kropka na wierzchu | To droga strzałek, nie wypełnione kratki; 1,2 mm jest grubsze niż ramka 0,65 mm |
| Gdzie żyje stan | Lokalnie na stronie, bez profilu i bez ostatnich parametrów | Nonogram też nie zapisuje tego włącznika |

## Scope

**In scope:**

- Przełącznik w `DictationGenerator`, kreska w arkuszu, stała `solutionStroke` w `DICTATION_SHEET`
- Aktualizacja testu `print:hidden` dla dyktanda
- Jedno kryterium w US-17 i to samo zdanie w „Karta dyktanda graficznego”

**Out of scope:**

- Obrys na papierze, zamalowane kratki, dziury, osobna kartka-klucz
- Miniatura katalogu, wspólny komponent z nonogramem, zmiana poziomów i poleceń
- Zapis włącznika między wizytami

## Architecture / Approach

`showSolution` siedzi obok `card`. Kontrolka jest w pasku, który i tak znika na druku. Po udanym losowaniu `generateFor` gasi włącznik, więc przycisk Generuj i wybór poziomu dzielą jedną regułę. Kreska jest polilinią w grupie `print:hidden` z `data-solution`. Współrzędne biorą `card.start.col` i `card.start.row` jako `x` i `y` dla `walkCommands`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Przełącznik i kreska na podglądzie | Włącznik, kreska, test druku | Reset dopisany tylko przy przycisku Generuj zostawia obrys po zmianie poziomu |
| 2. Zdanie w PRD | US-17 i akapit karty mówią to samo co ekran | Przepisanie zdania o pustym druku |

**Prerequisites:** Strona `/dyktando` już generuje kartę z poleceniami, kratką i kropką. `walkCommands` jest przetestowane.
**Estimated effort:** Jedna sesja, dwie krótkie fazy.

## Open Risks & Assumptions

- 1,2 mm na kratce 8 mm (7 lat) i 14 mm (5 lat) trzeba obejrzeć na podglądzie. Za gruba kreska zasłania sąsiednie linie.
- Miniatura jest narysowana osobno i nie dostaje grupy rozwiązania. Zostawienie jej przy kropce jest zamierzone.
- Nieudane Generuj rzadko da się wywołać z katalogu, który ma zapas obrysów. Reguła porażki jest w kolejności w `generateFor`, nie w osobnym teście.

## Success Criteria (Summary)

- Rodzic włącza obrys na podglądzie i widzi zamkniętą kreskę po strzałkach, bez nowej karty.
- Druk przy włączonym przełączniku jest pustą kratką z poleceniami i kropką.
- Nowa karta z Generuj albo ze zmiany poziomu startuje z wyłączonym przełącznikiem, a PRD mówi to samo.
