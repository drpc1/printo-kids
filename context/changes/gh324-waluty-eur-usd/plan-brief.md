# Waluty EUR i USD na karcie „Kto ma więcej?” — Plan Brief

> Full plan: `context/changes/gh324-waluty-eur-usd/plan.md`
> Research: `context/changes/gh324-waluty-eur-usd/research.md`

## What & Why

Karta „Kto ma więcej?” ma dziś tylko złotówki. Użytkowniczka przygotowała makiety obrazków EUR i USD; karta dostaje ustawienie paska „Waluta” (zł / € / $), pamiętane w profilu, a poziom trudny dostaje nominały 50 i 100.

## Starting Point

Silnik i generator liczą na liczbach całkowitych i są od waluty niezależne; złotówki siedzą w nominałach poziomów, w podziale moneta/banknot po wartości `>= 10`, w nazwie pliku `…zl.png` i w opisach.

## Desired End State

Na `/money` jest wybór waluty obok poziomu i kolorów. Każda waluta ma własne nominały, obrazki w kolorze i znak w czarnym druku (€, $). Zmiana waluty układa nową kartę; profil pamięta walutę, stary profil dostaje `pln`.

## Key Decisions Made

| Decision      | Choice                                                    | Why (1 sentence)                                             | Source               |
| ------------- | --------------------------------------------------------- | ------------------------------------------------------------ | -------------------- |
| Waluta        | pole `currency` w `MoneySettings`, nie osobna karta       | Jeden silnik, jedna miniatura, brak konfliktu z #265         | Plan (użytkowniczka) |
| Centy/grosze  | poza zakresem                                             | Wymagałyby liczenia w jednostkach mniejszych w całym silniku | Plan (użytkowniczka) |
| USD łatwy     | moneta 1 $ + banknot 5 $                                  | Sama moneta 1 $ dałaby kartę „policz sztuki”                 | Plan (użytkowniczka) |
| Banknot 1 $   | nie używany                                               | Wartość 1 $ ma jedną postać, bo kupka to lista wartości      | Research             |
| Trudny        | nominały do 100, suma do 200, najwyżej 4 banknoty w kupce | Pole kupki mieści dwa rzędy banknotów                        | Plan                 |
| Zmiana waluty | układa nową kartę (`contentKey`)                          | Waluty mają różne nominały                                   | Research             |
| Obrazki USD   | wdrożone z makiet z portretami                            | Prawo sprawdzi użytkowniczka przed merge                     | Plan (użytkowniczka) |

## Scope

**In scope:** model waluty, poziomy per waluta, limit banknotów, obrazki EUR/USD, wybór waluty na pasku, znak w czarnym druku, e2e, PRD i opis rodzaju karty.

**Out of scope:** centy, banknot 1 $ i 200 €, osobne karty na walutę, zmiana miniatury, ocena prawna obrazków.

## Architecture / Approach

`currencies.ts` wyznacza rodzaj kawałka per waluta; `moneyLevels(currency)` daje poziomy; karta niesie `currency`, a `contentKey` to waluta plus poziom. Obrazki mapuje `moneyImage(value, currency, colors)`. UI używa istniejącego `SudokuChoice`.

## Phases at a Glance

| Phase             | What it delivers                                | Key risk                                         |
| ----------------- | ----------------------------------------------- | ------------------------------------------------ |
| 1. Model i silnik | waluta, poziomy, `MAX_NOTES`, ustawienia, testy | przepełnienie ramki kupki przy dużych nominałach |
| 2. Obrazki        | 13 PNG wyciętych z makiet, mapowanie ścieżek    | czyste wycięcie z JPG, moneta 1 $ bez cyfry      |
| 3. UI i dokumenty | wybór waluty, znak w druku, e2e, PRD            | pasek na telefonie, konflikt PRD z #265          |

**Prerequisites:** rebase na `origin/main` przed pushem; brak `node_modules` w worktree (`npm ci`).
**Estimated effort:** ~3 sesje, 3 fazy, 3 PR-y.

## Open Risks & Assumptions

- Obrazki USD z portretami mogą wymagać usunięcia po decyzji prawnej użytkowniczki.
- Druk na iOS Safari/Brave zostaje do sprawdzenia przez użytkowniczkę (lessons.md).
- Trudny z siedmioma nominałami musi generować się poniżej 5 s i bez wyczerpania prób.

## Success Criteria (Summary)

- Rodzic wybiera złote, euro albo dolary i dostaje kartę z nominałami tej waluty, w czerni lub w kolorze.
- Profil pamięta walutę; karta mieści się na jednej stronie A4.
