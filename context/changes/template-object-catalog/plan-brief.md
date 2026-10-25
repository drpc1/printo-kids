# Katalog obiektów z kategoriami (S-21) — Plan Brief

> Full plan: `context/changes/template-object-catalog/plan.md`

## What & Why

Karta symetrii ma dziś tylko trzy obiekty (rakieta, robot, truskawka), więc kolejne Generuj szybko się powtarzają. S-21 rozbudowuje katalog szablonów do 22 obiektów w pięciu kategoriach, z których korzystają też nonogram (S-22) i dyktando (S-23). PRD: US-19, FR-028.

## Starting Point

Wszystkie szablony, paleta siedmiu kolorów i parser rysunku są w `src/lib/symmetry/templates.ts`, po trzy obiekty na rozmiar połowy (4×12, 6×15, 9×24). Makieta z użytkowniczką z 2026-10-25 (`mockup-drawings.json`, `mockup-*.svg`) ustaliła wygląd wszystkich nowych obiektów w trzech rozmiarach.

## Desired End State

Generuj na każdym poziomie symetrii losuje z 22 obiektów: Zwierzęta (sowa, biedronka, pingwin, kot, królik), Jedzenie (truskawka, babeczka, gruszka, marchewka, ananas), Przyroda (choinka, tulipan, muchomor, kaktus), Kosmos i maszyny (rakieta, robot, balon, UFO), Domy i budowle (domek, wieża zamku, latarnia morska, wieżowiec). Przy kolorach jest brązowy, a niektóre dziury zostają białe. Nonogram i dyktando dostają nowe obiekty bez zmian w swoim kodzie.

## Key Decisions Made

| Decision           | Choice                                                   | Why (1 sentence)                                           | Source  |
| ------------------ | -------------------------------------------------------- | ---------------------------------------------------------- | ------- |
| Lista obiektów     | Lody → marchewka i ananas, namiot → wieżowiec, + królik  | Lody i namiot nieczytelne w 4×12; królik to zapas zwierząt | Makieta |
| Brązowy            | Ósmy kolor `brown`, litera `n`, token `--symmetry-brown` | Sowa, pień, ogonek, kosz i pestki potrzebują brązu         | Makieta |
| Białe dziury       | `holeColor: null` = dziury zostają białe przy kolorach   | Brzuch pingwina, kropki muchomora, paski babeczki są białe | Makieta |
| API dla S-22/S-23  | `templates.ts` zostaje indeksem z tymi samymi eksportami | Obie gałęzie importują z niego równolegle                  | Plan    |
| Pliki              | Jeden plik na kategorię w `src/lib/symmetry/objects/`    | 22 × 3 szablony nie mieszczą się czytelnie w jednym pliku  | Plan    |
| Zgodność nonogramu | Notatka dla S-22, bez kopiowania solvera                 | Solvera nie ma na main; S-22 sprawdzi po scaleniu          | Plan    |
| PRD                | Poprawki w tej zmianie                                   | PRD nie rozjedzie się z katalogiem                         | Plan    |

## Scope

**In scope:**

- Brązowy w palecie, białe dziury, kategorie z etykietami.
- 19 nowych obiektów w trzech rozmiarach, z wariantami części.
- Testy katalogu, poprawki PRD, notatka dla S-22.

**Out of scope:**

- Wybór kategorii na pasku (S-26), zmiany w nonogramie i dyktandzie.
- Odbudowa miniatury katalogu, kolory sudoku (S-20).

## Architecture / Approach

`template-format.ts` trzyma typy, paletę i `drawing()`. Pliki `objects/<kategoria>.ts` eksportują listy szablonów na trzy rozmiary. `templates.ts` składa je w listy poziomów (rakieta, robot, truskawka na początku) i re-eksportuje format. Generator różni się tylko tym, że przy `holeColor: null` nie zwraca detali.

## Phases at a Glance

| Phase                          | What it delivers                                       | Key risk                                          |
| ------------------------------ | ------------------------------------------------------ | ------------------------------------------------- |
| 1. Fundament katalogu          | Brąz, białe dziury, kategorie, podział, testy katalogu | Cykl importów; testy przypięte do trzech obiektów |
| 2. Zwierzęta                   | 5 obiektów × 3 rozmiary                                | Drugi wariant łamie 3 kratki przy osi na 4 lata   |
| 3. Jedzenie                    | 4 nowe obiekty × 3 rozmiary                            | Jak wyżej                                         |
| 4. Przyroda                    | 4 obiekty × 3 rozmiary                                 | Jak wyżej                                         |
| 5. Kosmos, Budowle, domknięcie | 6 obiektów, test kategorii, PRD, notatka               | Konflikt w `prd.md` z innymi sesjami              |

**Prerequisites:** gałąź zsynchronizowana z `main` (PRD v4), makieta zatwierdzona.
**Estimated effort:** ~1 sesja, 5 faz; większość pracy to rysowanie wariantów.

## Open Risks & Assumptions

- Nowy szablon 6×15 może nie mieć wariantu z jednym rozwiązaniem nonogramu; wyjdzie dopiero w S-22 po scaleniu.
- Równoległe gałęzie S-22 i S-23 mogą konfliktować na `package.json` (skrypt `test`) i `roadmap.md`.

## Success Criteria (Summary)

- Kolejne Generuj na symetrii pokazuje obiekty ze wszystkich pięciu kategorii na każdym poziomie.
- Każdy obiekt jest czytelny jako czarna sylwetka i w kolorach, drukuje się na jednej stronie A4.
- lint, test, astro check i build są zielone.
