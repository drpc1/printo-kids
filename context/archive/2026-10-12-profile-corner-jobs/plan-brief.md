# Okno profili rozdziela listę i edycję — Plan Brief

> Full plan: `context/changes/profile-corner-jobs/plan.md`
> Frame brief: `context/changes/profile-corner-jobs/frame.md`

## What & Why

Menu rogu pokazuje naraz zadania, które produkt już rozdziela — wybór dziecka, zmianę jego ulubionej postaci, usunięcie i dodanie.

Od pierwszego profilu róg ma pokazywać listę. Edycja ulubionej postaci jest następnym widokiem tego samego okna i dotyczy tylko jednego dziecka.

## Starting Point

Dziś panel `menu` przy dwóch i więcej dzieciach kładzie listę imion nad edycją aktywnego, a przy jednym dziecku tytuł z imienia, postać, „Zapisz”, słowo „Usuń” i „Dodaj profil”. Potwierdzenie usunięcia, formularz i lista postaci są już kolejnymi widokami tego samego dialogu. Osobna strona profili została wcześniej odrzucona.

## Desired End State

Rodzic otwiera róg i widzi wiersze dzieci: imię wybiera i zamyka okno, ołówek wchodzi w edycję, kosz pyta o usunięcie, „Dodaj profil” jest na dole. Edycja pokazuje imię, postać, „Zapisz” i „Anuluj”. Udany zapis wraca na listę. Przy jednym dziecku układ wiersza jest ten sam.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Lista | Od jednego dziecka w górę ten sam wiersz | Zrzut jednego dziecka też miesza edycję, usunięcie i dodanie | Frame |
| Ołówek | Przed koszem, tooltip „Edytuj” | Edycja ma być osobnym wejściem, kosz zostaje na wierszu | Frame |
| Ołówek innego dziecka | Wybiera je i zostawia edycję otwartą | Edycja i kartka mają dotyczyć tego samego dziecka | Plan |
| Ołówek aktywnego dziecka | Nie rusza paska karty | Jednorazowa postać karty zostaje do jawnego zapisu | Plan |
| „Anuluj” | Wraca na listę i porzuca szkic | Tak samo jak dzisiejsze zamknięcie okna i „Dodaj profil” | Plan |
| Udany „Zapisz” | Wraca na listę | Po zapisie rodzic od razu widzi wiersze | Plan |
| Treść edycji | Imię, postać, „Zapisz”, „Anuluj” | Bez usuwania, dodawania i zmiany imienia | Plan |
| Zero profili | Od razu formularz imienia | Pierwsze dziecko nadal powstaje tak jak dziś | Plan |
| „Dodaj profil” | Dół listy, nie edycja | Dodawanie w oknie edycji wygląda źle | Frame |
| Sprawdzenie | Ręcznie, bez nowych asercji UI | Plan testów zostawia zrozumienie ekranu przy ręcznym sprawdzeniu | Plan |

## Scope

**In scope:** lista od pierwszego profilu, ikona „Edytuj”, widok jednego profilu, wybór przy ołówku innego dziecka, „Anuluj”, powrót na listę po udanym „Zapisz”, zejście „Zapisz i przełącz”.

**Out of scope:** osobna strona profili, lista dzieci na labiryncie, zmiana imienia, „Usuń” na edycji, osobne okno potwierdzenia, ostrzeżenie przy porzuceniu szkicu, nowe testy UI, zmiana magazynu profili.

## Architecture / Approach

Zostaje jeden dialog `ProfileCorner` w `WorksheetGenerator.tsx`. Lista to dotychczasowy panel `menu`, edycja to nowy panel `edit`, panel `switch` schodzi. Zapis ulubionej nadal idzie przez `withFavorite` i `barAfterFavoriteSave`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Dwa widoki rogu | Lista, edycja, ołówek i zejście ostrzeżenia przełączenia | Ołówek aktywnego dziecka może przez pomyłkę zetrzeć jednorazową postać paska |

**Prerequisites:** róg z tworzeniem, zapisem, koszem i tooltipem jest już na `/`. `Pencil` jest w zainstalowanym `lucide-react`. Nowa zależność nie jest potrzebna.
**Estimated effort:** jedna sesja, jeden plik.

## Open Risks & Assumptions

- FR-008 nie każe pytać o wybór przy jednym dziecku. `openingVisit` tego nie zmienia; wiersz widać dopiero po otwarciu rogu, bo brief chce tej samej listy.
- Ołówek innego dziecka ustawia pasek na jego zapisaną postać, więc jednorazowa postać poprzedniego dziecka schodzi, tak jak przy kliknięciu imienia.
- Regresja układu nie wywali CI. `npm test` nie montuje rogu.
- Ta faza zastępuje wyjątek „przy jednym dziecku słowo Usuń” z `profile-row-trash-icon`.

## Success Criteria (Summary)

- Od jednego profilu lista ma imię, „Edytuj”, kosz i „Dodaj profil”, bez postaci i bez „Zapisz”.
- Ołówek Zosi przy aktywnym Antku wybiera Zosię i zostawia edycję; ołówek Antka przy jednorazowej Rakiecie zostawia Rakietę na pasku.
- „Anuluj” i zamknięcie okna nie zapisują Psa. Udany „Zapisz” wraca na listę. „Zapisz i przełącz” nie występuje.
