# Świąteczne postacie (S-39) — skrót planu

> Pełny plan: `context/changes/christmas-characters/plan.md`
> Rama: `context/changes/christmas-characters/frame.md`

## Co i po co

Rodzic wybiera Mikołaja, renifera albo bałwanka tak jak każdą inną postać: przy poleceniu na każdej karcie, jako ulubioną w profilu i przy starcie labiryntu. Rama ujmuje to tak: „trzy nowe rysunki postaci w stylu istniejących, generowane przez użytkowniczkę, plus postać z oknem dat. Okno 15.11–6.01 ukrywa ją na liście wyboru poza sezonem, ale zostawia ją w katalogu, więc zapisana ulubiona albo ostatnia postać nie znika”.

## Punkt wyjścia

Jedna lista `CHARACTER_CHOICES` (`src/lib/sheet/character.ts`) zasila pasek, okno profilu, labirynt i dymek. Okno dat istnieje w S-38, ale jego funkcja jest prywatna w module symetrii. Rysunki od użytkowniczki mają już dopasowany kadr (zaakceptowany 2026-11-15).

## Stan docelowy

W sezonie lista wygląda tak: „Brak”, Bałwanek, Mikołaj, Renifer, kreska, jedenaście postaci, „Własny obrazek”. Poza sezonem lista ma jedenaście postaci bez kreski. Zapisana świąteczna postać zostaje na górze z kreską i nadal stoi na karcie.

## Kluczowe decyzje

| Decyzja           | Wybór                                                  | Dlaczego                                               | Źródło                                                   |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------- |
| Postacie          | Mikołaj, renifer, bałwanek                             | wybór użytkowniczki                                    | Rama                                                     |
| Rysunki           | generuje użytkowniczka (AI), kadr dopasowany skryptem  | ten sam styl i kadr co jedenaście postaci              | Rama                                                     |
| Okno              | 15.11–6.01, zegar z S-38                               | jedna reguła sezonu                                    | Rama                                                     |
| Postać poza oknem | zostaje w katalogu, okno filtruje tylko listę          | ulubiona nie znika bez wiedzy rodzica                  | Rama                                                     |
| Powtórki z S-38   | osobne rysunki, bez łączenia w kodzie                  | postać to ilustracja, obiekt to sylwetka na kratce     | Rama                                                     |
| Kolejność         | świąteczne zaraz po „Brak”                             | jak kategoria z oknem w S-38, widoczne bez przewijania | Plan (rekomendacja; wiadomość z odpowiedzią nie dotarła) |
| Oznaczenie        | kreska (shadcn `Separator`) pod świątecznymi wierszami | prośba użytkowniczki 2026-11-15                        | Plan                                                     |
| Testy             | unit + e2e z `page.clock` (grudzień, luty)             | wzór `christmas-category.spec.ts`                      | Plan                                                     |

## Zakres

**W zakresie:**

- trzy pliki postaci z dopasowanym kadrem;
- makieta aplikacji do akceptacji;
- wspólna funkcja okna dat;
- lista z oknem i kreską;
- testy;
- PRD, glosariusz, distillation i roadmapa.

**Poza zakresem:**

- zmiany w S-38 (poza wyjęciem `inWindow`) i w S-40;
- nowe kategorie i rodzaje kart;
- „Jak to działa” (S-44);
- komunikat o sezonowości.

## Podejście

Neutralny moduł okna dat w `src/lib` daje `inWindow`. Wiersz postaci ma opcjonalne `window`. Czysta funkcja z datą i wybraną postacią w argumencie zwraca wiersze do pokazania i miejsce kreski. `CharacterChoiceRows` wywołuje ją z `useToday()`. Katalog i dozwolone id zostają pełne niezależnie od daty.

## Fazy w skrócie

| Faza                 | Co daje                                                   | Główne ryzyko                                   |
| -------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| 1. Rysunki i makieta | webp z dopasowanym kadrem, `mockup-app.png` do akceptacji | rysunek odstaje od zestawu w prawdziwym miejscu |
| 2. Katalog i lista   | postacie w aplikacji, okno, kreska, testy                 | wybrana postać spoza okna bez wiersza na liście |
| 3. Dokumenty         | PRD i glosariusz z 14 postaciami i regułą okna            | przeoczone miejsce z liczbą 11                  |

**Wymagania wstępne:** lokalny `main` zsynchronizowany z `origin/main` (dziś 29 commitów za nim). Faza zaczyna się w gałęzi.
**Szacowany nakład:** 2–3 sesje, PR na fazę z `/10x-impl-review`.

## Otwarte ryzyka i założenia

- Kolejność „po Brak” to rekomendacja przyjęta bez odpowiedzi użytkowniczki. Łatwo ją zmienić w Phase 2.
- Faza 3 zmienia PRD pod US-03 i FR-012, które dotyczą też S-44.

## Kryteria sukcesu (skrót)

- W sezonie rodzic widzi trzy świąteczne postacie na górze listy, oddzielone kreską, i może je wybrać we wszystkich trzech miejscach.
- Po 6.01 lista wraca do jedenastu postaci, a zapisana ulubiona świąteczna postać zostaje.
- Lista mieści się na telefonie bez ucięcia.
