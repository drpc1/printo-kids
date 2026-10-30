# Dyktando graficzne: kształty bez osi symetrii — Plan Brief

> Full plan: `context/changes/gh115-non-symetric-shapes/plan.md`

## What & Why

Dyktando graficzne bierze dziś obiekty tylko z katalogu symetrii (lewa połowa + lustro), więc obrys na karcie jest zawsze symetryczny (GitHub 115). Dodajemy do dyktanda własne kształty bez osi symetrii, nadal rysowane jedną listą strzałek.

## Starting Point

`catalogFor` w `src/lib/dictation/generate.ts` buduje pulę kart z `symmetryTemplatesFor`; wszystko od `DictationSilhouette` w dół (sprawdzenie obrysu, trasowanie, układ, strona) nie zakłada symetrii.

## Desired End State

Generuj na dyktandzie losuje też rozpoznawalne kształty (ryba, statek, klucz…), czasem odbite w poziomie, w kategoriach i na poziomach, dla których zostały zatwierdzone. Symetria i nonogram bez zmian; PRD opisuje nowe zachowanie.

## Key Decisions Made

| Decision                                               | Choice                                                                                          | Why (1 sentence)                                                                               |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Pula                                                   | Jedna pula z istniejącymi kategoriami                                                           | Zero zmian na pasku, rodzic dostaje więcej różnych kart                                        |
| Zestaw                                                 | 11 zatwierdzonych kształtów rysowanych ręcznie                                                  | Wybrane z makiety jako czytelne na kratce                                                      |
| Poziomy                                                | Kształt ma tylko poziomy, na których wygląda dobrze (ryba, kaczka, helikopter: średni i trudny) | Na łatwej kratce 8 kolumn nie wszystko jest czytelne                                           |
| Format                                                 | Całe sylwetki, bez lustra, własny plik `shapes.ts`                                              | Uczciwe dla kształtów bez osi, reużywa `outlineProblems` i `traceOutline`; symetria nietknięta |
| Odbicie                                                | Losowe odbicie poziome jako wariant                                                             | Podwaja różnorodność bez rysowania                                                             |
| Kategoria „Kształty”, serce, korona, cukierek, kotwica | Osobne zgłoszenie [#198](https://github.com/drpc1/printo-kids/issues/198)                       | Dotyka listy kategorii, paska, profilu i szablonów symetrii                                    |
| Testy                                                  | Reguły bez przypinania liczb                                                                    | Zgodne z `object-categories.test.ts`                                                           |
| PRD                                                    | Aktualizacja w tym samym PR                                                                     | PRD mówi dziś „obiekt z katalogu szablonów symetrii”                                           |

## Scope

**In scope:** nowy katalog sylwetek dyktanda, scalenie z pulą, odbicie, testy, PRD.

**Out of scope:** symetria, nonogram, nowa kategoria lub kontrolki, losowane części kształtów, zmiana zasad obrysu, serce i inne symetryczne figury (#198).

## Architecture / Approach

`shapes.ts` trzyma bitmapy kształtów na dostępne poziomy; `catalogFor` buduje z nich `DictationSilhouette` (normalna i odbita) i puszcza przez tę samą ścieżkę sprawdzeń co szablony, deduplikując po kluczu karty.

## Phases at a Glance

| Phase                 | What it delivers                                     | Key risk                                         |
| --------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| 1. Makieta (zrobiona) | 11 zatwierdzonych kształtów w `mockup-drawings.json` | —                                                |
| 2. Mechanizm          | `shapes.ts`, scalenie z pulą, odbicie, testy         | Wydzielenie wspólnej ścieżki bez regresji        |
| 3. Rysunki            | Pełny katalog w kodzie, kategorie, miniatura         | Zmiana puli może zmienić kartę z seeda miniatury |
| 4. PRD i wydruk       | PRD zsynchronizowane, wydruk próbny                  | Rozjazd PRD z zachowaniem                        |

**Prerequisites:** brak.
**Estimated effort:** ok. 2–3 sesje w 3 fazach do zrobienia.

## Open Risks & Assumptions

- Siatka 8×12 jest ciasna; dlatego część kształtów nie ma poziomu łatwego.
- Jedzenie nie dostaje nowych kształtów; kategoria zachowuje obiekty z szablonów symetrii.
- Poziomy ryby i kaczki (średni, trudny) wynikają z jednej odpowiedzi użytkownika; łatwy poziom można dodać, bo rysunek jest w makiecie.

## Success Criteria (Summary)

- Rodzic widzi w dyktandzie rozpoznawalne, niesymetryczne kształty.
- Każda karta nadal jest jedną zamkniętą linią strzałek i mieści się na A4.
- `npm test`, lint, `astro check` i build zielone.
