# Przycisk X bezpośrednio nad paskiem przewijania — Plan Brief

> Full plan: `context/changes/dialog-close-above-scrollbar/plan.md`
> Frame brief: `context/changes/dialog-close-above-scrollbar/frame.md`

## What & Why

We wspólnym dialogu pasek przewijania stoi na lewo od przypiętego X, bo treść jest wcięta szerzej niż kolumna krzyżyka.

Rodzic ma widzieć X bezpośrednio nad tym paskiem. „Bezpośrednio nad” znaczy wspólne lewe i prawe krawędzie ramki X i rynny paska.

## Starting Point

Na HEAD dialog przy krzyżyku ma `pt-14 pr-14`, X jest `absolute top-4 right-4`, a pasek siedzi na wewnętrznym `overflow-y-auto`. `pr-14` jest szersze niż `right-4`, więc rynna jest na lewo od X. Oba okna podają tylko `max-h`. Wcześniejszy plan przypiął X do rogu i nie ustawiał rynny pod nim.

## Desired End State

Gdy lista się przewija, ramka X i rynna paska mają te same lewe i prawe krawędzie. Cienki suwak w rynnie może być węższy niż ikona. Krótkie okno nie ma paska, X zostaje w rogu, a po przewinięciu nie zasłania pierwszego wiersza, ołówka ani kosza.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Co jest nie tak | Wspólna kolumna dialogu, nie jedno okno | Oba wołające dają tylko `max-h`, a odstęp jest w `DialogContent` | Frame |
| Kierunek | X bezpośrednio nad paskiem | Początkowe ułożenie się potwierdziło | Frame |
| Co znaczy „nad” | Lewe i prawe krawędzie ramki X i rynny | Cienki suwak nie przesuwa X | Plan |
| Jak | `pr-14` schodzi do `pr-4` | To ten sam offset co `right-4`, a rynna 16 px równa się ikonie `size-4` | Plan |
| Czego nie ruszamy | Przypięcie X, `pt-14`, wewnętrzny scroller, napis i usuwanie | Poprzedni kontrakt krzyżyka zostaje | Frame |

## Scope

**In scope:** prawy odstęp `DialogContent` przy włączonym krzyżyku; ręczne sprawdzenie listy profili, wyboru postaci, krótkiego pytania o usunięcie i przewinięcia.

**Out of scope:** centrowanie na suwaku, pomiar szerokości paska, osobne klasy wołających, „Zamknij”, usuwanie, nowy test UI, PRD i roadmapa.

## Architecture / Approach

X zostaje absolutny w rogu, przewijanie zostaje na wewnętrznym divie. Prawy padding dialogu maleje z `pr-14` do `pr-4`, więc krawędź scrollera wpada w kolumnę ikony. `pt-14` nadal trzyma pierwszy wiersz pod X.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Wspólna kolumna | Rynna paska ma te same krawędzie co ramka X | Rynna inna niż 16 px nie złoży obu krawędzi |

**Prerequisites:** kontrakt krzyżyka z `dialog-close-button` jest już w HEAD.
**Estimated effort:** jedna sesja, jeden plik.

## Open Risks & Assumptions

- Kontrakt obu krawędzi zakłada rynnę 16 px, jak zmierzona na Windowsie i jak ikona `size-4`. Inna szerokość rynny zostawia X na `right-4` i nie goni suwaka.
- W drzewie roboczym `pr-4` już jest. Wdrożenie sprawdza, że ta edycja jest całym kontraktem, i nie dokłada drugiej.

## Success Criteria (Summary)

- Na przewijanej liście profili i w wyborze postaci ramka X i rynna paska mają te same lewe i prawe krawędzie.
- Krótkie pytanie o usunięcie nie dostaje paska, a X zostaje w rogu.
- Po przewinięciu X zostaje, a ołówek, kosz i pierwszy wiersz postaci nadal się klikają.
