# Kotwica, lizak i kolejne warianty obiektów symetrii — Plan Brief

> Full plan: `context/changes/gh124-more-symetric-shapes/plan.md`
> Research: `context/changes/gh124-more-symetric-shapes/research.md`

## What & Why

Dodajemy do katalogu obiektów kotwicę (Kosmos i maszyny) i lizak (Jedzenie) oraz kolejne warianty siedmiu istniejących obiektów, żeby kolejne karty symetrii, nonogramu i dyktanda się nie powtarzały (GH #124). Dziś każda część każdego obiektu ma dokładnie 2 warianty, więc obiekt daje 4–16 kombinacji.

## Starting Point

Katalog ma 24 obiekty w trzech rozmiarach połowy (4×12, 6×15, 9×24). Generatory nie zależą od liczby wariantów. Nonogram trudny nie ma dziś przechodzącego wariantu `kot` i `tulipan`, a dyktando ma najmniej kart dla `choinka`, `latarnia`, `truskawka`.

## Desired End State

Generuj losuje kotwicę i lizak w odpowiednich kategoriach, a siedem obiektów (`tulipan`, `kot`, `pingwin`, `ananas`, `choinka`, `latarnia`, `truskawka`) daje wyraźnie więcej różnych kart. `kot` i `tulipan` mają co najmniej jeden działający wariant w trudnym nonogramie, jeśli się to uda.

## Key Decisions Made

| Decision         | Choice                                   | Why (1 sentence)                                                           | Source   |
| ---------------- | ---------------------------------------- | -------------------------------------------------------------------------- | -------- |
| Kotwica          | Kosmos i maszyny                         | Statek i łódka dyktanda już tam są.                                        | User     |
| Cukierek         | Lizak w Jedzeniu                         | Pionowy, symetryczny, zgodny z regułą; papierek jest szeroki i niski.      | User     |
| Korona           | Poza zakresem, czeka na GH #198          | Nie pasuje do żadnej z pięciu kategorii.                                   | User     |
| Zakres wariantów | 7 słabych obiektów                       | Celuje tam, gdzie nonogram i dyktando odrzucają najwięcej.                 | Plan     |
| Rodzaj wariantu  | Zmieniający sylwetkę                     | Dyktando liczy karty po obrysie, wariant tylko w dziurach nic mu nie daje. | Plan     |
| Cel nonogramu    | `kot` i `tulipan` ≥ 1 wariant na trudnym | Mierzalne kryterium; wyjątek w teście usuwamy, jeśli się uda.              | Plan     |
| Proces           | Makieta zatwierdzana przed kodem         | Jak w #118; rysunki w 4×12 łatwo zepsuć.                                   | Research |

## Scope

**In scope:** kotwica i lizak w 3 rozmiarach, trzeci wariant części siedmiu obiektów, test obecności, zawężenie wyjątku w teście trudnego nonogramu, PRD (✓, liczby).

**Out of scope:** korona, serce i kategoria „Kształty” (GH #198), cukierek w papierku, zmiany w generatorach i profilach, pozostałe 17 obiektów.

## Architecture / Approach

Dane w `src/lib/symmetry/objects/*.ts`; generatory zostają. Rysunki najpierw na makiecie (`mockup-drawings.json` plus podgląd), potem do kodu. Pomiar przed i po (przechodzące kombinacje nonogramu, różne obrysy dyktanda), żeby ocenić zysk liczbą.

## Phases at a Glance

| Phase                        | What it delivers                                    | Key risk                                                       |
| ---------------------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| 1. Makieta i pomiar bazowy   | Zatwierdzone rysunki i liczby wyjściowe             | Czytelność kotwicy w 4×12                                      |
| 2. Kotwica i lizak           | Dwa obiekty w 3 rozmiarach, test, PRD ✓             | Styk rogiem cienkich elementów                                 |
| 3. Warianty siedmiu obiektów | Nowe warianty, pomiar po, zawężony wyjątek w teście | `kot` i `tulipan` mogą dalej odpadać w nonogramie              |
| 4. Domknięcie                | PRD z liczbami, pełna weryfikacja, oględziny        | Czas testu trudnego nonogramu przy większej liczbie kombinacji |

**Prerequisites:** zatwierdzenie makiety po fazie 1.
**Estimated effort:** ~3–4 sesje, 4 fazy; główny koszt to rysowanie około 27 szablonów.

## Open Risks & Assumptions

- Cel dla `kot` i `tulipan` może się nie udać; wtedy zostaje wyjątek w teście i notatka z powodem.
- Trzeci wariant mnoży kombinacje (obiekt z 4 częściami: 81 zamiast 16), co wydłuża enumerację w teście nonogramu.
- Założenie: zapisane profile nie przechowują indeksów wariantów (brak migracji).

## Success Criteria (Summary)

- Kotwica i lizak pojawiają się na symetrii, nonogramie i dyktandzie w swoich kategoriach.
- Siedem obiektów daje więcej różnych kart, a `kot` i `tulipan` działają na trudnym nonogramie, jeśli cel się uda.
- `npm test`, `npm run lint`, `npx astro check` i `npm run build` przechodzą.
