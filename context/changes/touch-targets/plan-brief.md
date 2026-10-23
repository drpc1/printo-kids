# Większe pola dotyku Profilu i krzyżyka — Plan Brief

> Full plan: `context/changes/touch-targets/plan.md`
> Research: `context/changes/touch-targets/research.md`

## What & Why

Profil na dotyku ma około 32 px wysokości, a krzyżyk w oknie jest samą ikoną 16 px. Generuj, Drukuj i wiersze okien mają 44 px. Rysowana szyna stoi 7 px na prawo od ikony, więc issue #37 (X bezpośrednio nad paskiem) rozjeżdża się z większym polem, jeśli ruszyć je osobno.

## Starting Point

Trigger Profilu to `h-auto px-2 py-1 text-base` (`src/components/ProfileCorner.tsx:333-337`). Krzyżyk to `top-4 right-4` i `size-4` bez paddingu (`src/components/ui/dialog.tsx:80-88`). Szyna jest w prawym paddingu 16 px: 3 px, 6 px szyny, 3 px (`src/hooks/useScrollIndicator.ts:35`). Testy pilnują 44 px tylko u Generuj i Drukuj.

## Desired End State

Na dotyku Profil ma co najmniej 44 px wysokości, z tym samym napisem. Krzyżyk na myszce i na dotyku ma pole 44×44 px, glif 16 px zaczynający się 16 px od góry i dół pola 4 px nad pierwszym wierszem. Na dotyku prawa krawędź ikony spotyka się z prawą krawędzią szyny, a pasek leży pod ikoną. Na myszce prawa krawędź ikony spotyka się z prawą krawędzią natywnego paska (12 px od prawej krawędzi paddingu). Przy najechaniu pod ikoną jest kwadrat 36 px w kolorze `accent`, jak przy ołówku i koszu. Fokus klawiaturą otacza ten kwadrat.

## Key Decisions Made

| Decision          | Choice                                      | Why (1 sentence)                                                                                                 | Source   |
| ----------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- |
| Zakres            | Tylko Profil i krzyżyk                      | Tytuł i odłożone przeglądy nie obejmują Postaci ani Poziomu na pasku                                             | Plan     |
| Kolumna na dotyku | Cała szyna pod ikoną, ikona w oknie         | Wspólne obie krawędzie ramki 16 px i szyny 6 px są niemożliwe, a wyśrodkowanie na dzisiejszej szynie obcina glif | Plan     |
| Pole krzyżyka     | 44×44 px, dół na 52 px                      | Ten sam cel co Generuj na telefonie, 4 px nad wierszem, który zaczyna się na 56 px                               | Plan     |
| Myszka            | Ikona nad natywnym paskiem, `right-3`       | Pomiar 2026-10-22: pasek ma 16 px i jest 4 px na prawo od dzisiejszego glifu                                     | Plan     |
| Profil            | Co najmniej 44 px tylko na `pointer-coarse` | Tak jest zapisane w notatce zmiany; na myszce wysokość treści zostaje                                            | Research |
| Szyna             | Wzór `+ 3` bez zmian                        | Wybrany układ dosuwa ikonę do szyny, nie szynę do ikony                                                          | Plan     |
| Hover krzyżyka    | Płytka 36 px jak u ołówka i kosza           | Pole 44 px pomalowane w całości zasłaniałoby róg; płytka siedzi pod glifem                                       | Plan     |

## Scope

**In scope:** wysokość Profilu na dotyku, pole i pozycja krzyżyka, fokus `focus-visible`, usunięcie martwych `data-[state=open]:`, komentarz przy `pr-4`, asercje w Playwrightu, sprawdzenie na iPhonie.

**Out of scope:** triggery Postać i Poziom, zmiana ołówka i kosza, wiersze dialogów, przesuwanie szyny i natywnego paska, PRD i roadmapa.

## Architecture / Approach

Oba ruchy są klasami. Profil dostaje minimalną wysokość 44 px tylko na `pointer-coarse`. Krzyżyk we wspólnym `DialogContent` dostaje pole 44 px; trzy okna dziedziczą je same. Glif zostaje 16 px na y 16–32. Na dotyku prawa krawędź glifu i pola jest 3 px od prawej krawędzi paddingu, czyli na prawej krawędzi szyny. Na myszce jest 12 px (`right-3`), czyli na prawej krawędzi natywnego paska. Płytka hovera 36 px jest wewnątrz pola i jest wyśrodkowana na glifie.

## Phases at a Glance

| Phase               | What it delivers                                                                                                        | Key risk                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1. Profil na dotyku | Wysokość ≥ 44 px na `pointer-coarse`, napis bez zmian                                                                   | Dodatkowe 12 px w dół może spotkać nagłówek; wtedy wolno ruszyć tylko `padding-top` telefonu |
| 2. Róg okna         | Pole 44 px, kolumna ze szyną na dotyku, ikona nad natywnym paskiem na myszce, płytka hovera 36 px, fokus jak u `Button` | Zły `right` obcina glif albo zostawia przerwę obok paska                                     |

**Prerequisites:** research w tym folderze; issue #37 zostaje otwarte do czasu wdrożenia.
**Estimated effort:** jedna sesja, dwie fazy.

## Open Risks & Assumptions

- Wysokości 32 px i 44 px są liczone przy korzeniu 16 px. Tej sesji planowania nikt ich nie mierzył w przeglądarce.
- iPhone nie jest w Playwrightu na Windowsie bez `E2E_WEBKIT=1`. Kolumnę pilnują projekty `hasTouch` na Chromium; iPhone zostaje ręczny.
- Wyższy Profil nachodził na nagłówek, więc `padding-top` poniżej 640 px przy `.has-maze` jest 3.75rem zamiast 3.5rem. Pole zostaje co najmniej 44 px.

## Success Criteria (Summary)

- Na dotyku Profil ma co najmniej 44 px wysokości i nie zasłania nagłówka ani karty. Na myszce zostaje niższy niż 44 px.
- Krzyżyk ma pole 44×44 px, nie wchodzi w pierwszy wiersz, na dotyku szyna leży pod ikoną, a na myszce ikona leży nad natywnym paskiem. Najechanie pokazuje płytkę 36 px w kolorze `accent`.
- Zamknięcie okna dalej cofa usuwanie i nie zmienia postaci. Fokus klawiaturą zgadza się z innymi przyciskami.
