---
date: 2026-11-22
researcher: Claude
topic: "Zima (1.12–koniec lutego): obiekty i postacie w oknie dat"
status: complete
---

# Research: zimowe obiekty i postacie w oknie dat (S-54)

## Pytanie

Jak działa okno dat dla „Boże Narodzenie” i postaci świątecznych (GitHub 369/370) i co trzeba dodać dla zimy grudzień–luty, która nakłada się na 15.11–6.01?

## Odpowiedź w skrócie

Mechanizm jest ogólny i nie wymaga przebudowy dla kolejnej pory roku: wystarczy nowy wpis z oknem w dwóch miejscach (kategoria obiektów, wiersze postaci) plus nowa treść (obiekty, rysunki postaci). Dwie rzeczy w kodzie zakładają jedną grupę sezonową naraz i trzeba je rozstrzygnąć, bo zima i Boże Narodzenie się pokrywają.

## Ustalenia (z kodu)

- Okno: `DateWindow` i `inWindow(window, today)` w `src/lib/date-window.ts:1-20`; `to` przed `from` oznacza przejście przez Nowy Rok; końce włącznie; porównanie po `miesiąc*100+dzień`.
- Kategoria obiektów: `OBJECT_CATEGORIES` w `src/lib/symmetry/template-format.ts:15-31`, pole `window?`; Boże Narodzenie = 15.11–6.01. Pasek: `objectCategoryChoicesOn(today)` i `visibleCategoryOn` w `src/lib/symmetry/templates.ts:60-92`. Kolejność: „Wszystkie”, kategorie z oknem (alfabetycznie), stałe alfabetycznie. Nic nie ogranicza liczby kategorii z oknem, więc dwie naraz działają bez zmian kodu (nie sprawdzone testem).
- Poza oknem zapamiętana kategoria czyta się jako „Wszystkie”; „Wszystkie” losuje z pełnego katalogu przez cały rok (decyzja S-38, `context/archive/2026-11-14-christmas-objects/plan-brief.md`).
- Postacie: `CHARACTER_CHOICES` w `src/lib/sheet/character.ts:6-80`, wspólna stała `CHRISTMAS_WINDOW`; `characterPickRowsOn(today, selected)` (`character.ts:101-117`) pokazuje postać z oknem tylko w oknie albo gdy jest wybrana, i zwraca JEDNĄ kreskę (`separatorAfter` = ostatni wiersz sezonowy). Każda postać ma `src` (webp), `contentLeft/Right` (kadr).
- Katalog postaci i dozwolone id nie zależą od daty (zapisana postać spoza okna zostaje).
- Obiekty szablonów: `src/lib/symmetry/objects/*.ts`, każdy w trzech rozmiarach (`half4`, `half6`, `half9`); kształty dyktanda ręcznie w `src/lib/dictation/shapes.ts` (m.in. skarpeta, laska cukrowa, czapka Mikołaja, sanki, renifer, parasol); okno nie dotyczy silników kart (data tylko w warstwie React, `useToday`).
- Istniejące obiekty zimowe: bałwanek, choinka, gwiazda, bombka, dzwonek, prezent, piernik, aniołek (Boże Narodzenie), pingwin (Zwierzęta). Poza świętami zimowych nie ma.
- Reguły sylwetek: symetria lewo–prawo, pionowe, czytelne w czerni w połowie 4×12, brak styku rogiem, jedno rozwiązanie nonogramu (średni i trudny), `AGENTS`/PRD „Katalog szablonów obiektów”; kandydat odpada, gdy nie przejdzie makiety (wzór: `context/archive/2026-11-14-christmas-objects/`, makieta + skrypt reguł przed kodem).
- Postacie sezonowe rysuje użytkowniczka (AI), kadr dopasowuje skrypt (`context/archive/2026-11-15-christmas-characters/`).

## Konflikty i pytania dla planu

1. **Nakładanie okien.** Zima 1.12–29.02 (zapis `{2,29}` działa też w roku nieprzestępnym) pokrywa się z 15.11–6.01. Decyzja S-38 „jedna pora roku naraz” nie jest wymuszona kodem; pasek obiektów udźwignie dwie kategorie, lista postaci nie (jedna kreska).
2. **Czy zima to osobna kategoria, czy Boże Narodzenie się rozszerza?** Osobna: „Zima” (np. igloo, płatek śniegu, sopel, czapka zimowa, szalik) + bałwanek/choinka… dzielone z Bożym Narodzeniem (obiekt może mieć kilka kategorii).
3. **Postacie zimowe**: które (np. niedźwiedź polarny, pingwin, foka), czy dostarcza je użytkowniczka; jeśli tak — okno i kreska dla dwóch grup.
4. **Rysowanie obiektów**: kto (agent proponuje, makieta + akceptacja).

## Zakres kodu do dotknięcia (szacunek)

`template-format.ts` (kategoria), nowy plik obiektów + `templates.ts` (rejestr), `dictation/shapes.ts` (opcjonalnie), `character.ts` + `public/characters/*.webp`, testy `object-categories.test.ts`, `templates.test.ts`, e2e z `page.clock` (wzór christmas-category), PRD/glosariusz/`how-it-works.astro`/liczby postaci.
