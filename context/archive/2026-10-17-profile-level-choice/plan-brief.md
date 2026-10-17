# Wybór poziomu w profilu — brief

Pełny plan: [plan.md](plan.md)

## Co i po co

Profil dziecka zapisuje poziom, ale rodzic nie może go wybrać: panele „Dodaj profil” i „Edytuj” pokazują tylko tekst „Poziom: …” i biorą poziom z paska. Zmiana dodaje tam przycisk, który otwiera listę sześciu poziomów — tak jak przy postaci.

## Punkt wyjścia

- `ChildProfile.level` i `withFavorite(…, level, …)` już są.
- `ProfileCorner.tsx` ma wzorzec postaci: szkic, panel listy, kontrolka z `ChevronDown`.

## Kluczowe decyzje

| Decyzja                        | Wybór                                                         | Dlaczego                                                   |
| ------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------- |
| Poziom startowy przy tworzeniu | poziom z paska                                                | Zachowuje dzisiejsze zachowanie, gdy rodzic nic nie zmieni |
| Poziom startowy przy edycji    | poziom profilu                                                | Jak `favoriteDraft` dla postaci                            |
| Pasek po zapisie edycji        | przejmuje nowy poziom, gdy pokazywał poprzedni poziom profilu | Analogicznie do postaci (`barAfterFavoriteSave`)           |
| Lista poziomów                 | nowa `LevelChoiceRows` w `ProfileCorner.tsx`                  | Nie ruszamy paska, który zmienia równoległa sesja          |

## Fazy

| Faza | Zakres                                                                  | Bramki                                                                     |
| ---- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1    | `child-profiles.ts` + testy, `ProfileCorner.tsx`, `handleFavoriteSaved` | `npm test`, lint, `astro check`, build, Playwright, ręcznie w przeglądarce |

Wymagania: brak. Szacunek: mała zmiana, jedna faza.

## References

- `context/archive/2026-10-11-maze-difficulty-levels/plan.md`
