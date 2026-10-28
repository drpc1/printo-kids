# Sekwencje: kolory kształtów — Plan Brief

> Full plan: `context/changes/sequence-shape-colors/plan.md`

## What & Why

Na `/sequences` rodzic włącza kolory, w tym samym duchu co na sudoku: domyślnie czarne kontury, po włączeniu kredka, bez legendy. Issue #116 chce, żeby ten sam kształt miał tę samą kredkę na całej karcie, a liczby zostały czarne. W tej zmianie kredka nie jest na stałe przypisana do kształtu. Generuj losuje ją razem z kształtami.

## Starting Point

Kształty sekwencji są czarnymi konturami. Ustawienia paska pamiętają tylko poziom. Sudoku i symetria mają już przełącznik „Kolory”: boolean w profilu albo w ostatnich ustawieniach, domyślnie wyłączony, a przełączenie nie układa nowej karty. Dziewięć tokenów `--symmetry-*` jest w motywie. Serce i krzyżyk dzielą ścieżki z sudoku; strzałka jest tylko na sekwencjach.

## Desired End State

Rodzic włącza „Kolory” na pasku sekwencji. Koło w pierwszym wierszu i koło w drugim mają jedną kredkę, kwadrat inną, a puste pole zostaje puste. Następne Generuj może dać kołu inną kredkę. Wyłączenie wraca do czarnych konturów przy tych samych ciągach. Na Poziomie 4 cyfry zostają czarne. Okno profilu dopisuje „kolory”, gdy przełącznik jest włączony.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Kiedy losować | Przy udanym Generuj, jedna kredka na identyfikator kształtu na całej karcie | Tak wybierane są kształty: jeden identyfikator, jeden wygląd, a nowe losowanie robi dopiero Generuj |
| Pula | Dziewięć istniejących `--symmetry-*`, bez powtórzeń, łącznie z czernią | Nowy token nie jest potrzebny, a strzałka nie dostaje osobnej stałej kredki |
| Rysowanie | Włączone: wypełnienie i kontur tą kredką. Wyłączone: czarny kontur bez wypełnienia | To wariant zatwierdzony na wydruku sudoku 2026-10-25 |
| Co zostaje czarne | Liczby, „?”, ramki pól i polecenie | Issue #116 zostawia je bez zmian, także na Poziomie 4 |
| Pamięć | Boolean w profilu albo w ostatnich ustawieniach. Przydział zostaje na karcie i poza kluczem | Przełącznik ma wracać po wizycie, a kredki są treścią tej karty, jak wylosowane kształty |
| Podsumowanie | Okno profilu dopisuje „kolory”. Plakietka katalogu zostaje przy poziomie, miniatura czarna | Tak sudoku i symetria pokazują ten przełącznik |

## Scope

**In scope:**

- Przydział kredek przy przyjęciu karty i testy ziarna
- Przełącznik „Kolory” na obu paskach, rysowanie trzech prymitywów kształtu, boolean w ustawieniach
- „kolory” w podsumowaniu profilu
- Test przeglądarkowy, pamięć paska, nachodzenie na telefonie
- Dwa zdania w PRD: karta sekwencji i wiersz tabeli zapamiętanych ustawień

**Out of scope:**

- Stałe kolory sudoku na sekwencjach, legenda, wybór kredki przez rodzica
- Nowe tokeny i zmiana geometrii, reguł, luk albo układu A4
- Kolor liczb, „?”, ramek i postaci
- Zapis przydziału w profilu albo w kluczu karty
- Nowa miniatura i poprawka zdania o czterech kształtach

## Architecture / Approach

`generateSequenceCard` po przyjęciu karty woła `assignSequenceColors` tym samym `random` i zapisuje `shapeColors`. Boolean `colors` idzie przez `useCardSettings` i nie woła Generuj. Arkusz przy `colors === true` maluje `fill` i `stroke` z `sequenceShapeInk`. Klucz karty nadal nazywa tylko ciągi.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Przydział kredek | `shapeColors` na przyjętej karcie i testy ziarna | Losowanie w trakcie dobierania wiersza zmieniłoby ciągi dla tego samego ziarna |
| 2. Pasek i rysowanie | Przełącznik, malowanie, „kolory” w profilu | Przełącznik podpięty pod Generuj ułożyłby nową kartę |
| 3. Przeglądarka i PRD | E2E, telefon, zdania w PRD | „Kolory” na wąskim pasku może nachodzić na Generuj albo Drukuj |

**Prerequisites:** Tokeny `--symmetry-*` i przełącznik sudoku są już w repozytorium. Issue #116.
**Estimated effort:** około 1–2 sesji na trzy fazy.

## Open Risks & Assumptions

- Czerń jest w puli, więc przy włączonych kolorach któryś kształt może być wypełniony na czarno. Na papierze odróżnia go wypełnienie, nie sama kreska.
- Test przeglądarkowy nie wymaga innej kredki przy drugim Generuj. Różnicę dwóch ziaren pokrywa test jednostkowy.
- Drukarka czarno-biała zamienia kredki w szarości. Kształt dalej rozróżnia forma. Automat tego nie drukuje.

## Success Criteria (Summary)

- Włączone kolory dają jedną kredkę na kształt na całej karcie, a następne Generuj może ją zmienić.
- Wyłączenie, liczby, „?” i puste pola zostają czarne, a ciągi się nie zmieniają.
- Boolean wraca z profilu albo z ostatnich ustawień. Karta z kolorami mieści się na jednej stronie A4.
