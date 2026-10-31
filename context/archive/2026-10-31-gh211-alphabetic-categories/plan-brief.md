# Lista kategorii alfabetycznie — Plan Brief

> Full plan: `context/changes/gh211-alphabetic-categories/plan.md`

## What & Why

Kategorie obiektów na liście „Kategoria” (symetria, nonogram, dyktando) mają iść alfabetycznie po polsku, z „Wszystkie” na górze. Dziś idą w kolejności z PRD, więc rodzic szuka kategorii bez wzorca, a nowa trafia na koniec.

## Starting Point

`OBJECT_CATEGORY_CHOICES` w `src/lib/symmetry/templates.ts` dokłada „Wszystkie” do `OBJECT_CATEGORIES`; test trzyma starą kolejność etykiet.

## Desired End State

Pasek i okno pokazują: Wszystkie, Domy i budowle, Jedzenie, Kosmos i maszyny, Kształty, Przyroda, Zwierzęta. Nowa kategoria sama wchodzi na swoje miejsce.

## Key Decisions Made

| Decision               | Choice                                                        | Why                                     | Source |
| ---------------------- | ------------------------------------------------------------- | --------------------------------------- | ------ |
| Gdzie ułożyć kolejność | Sortowanie w `OBJECT_CATEGORY_CHOICES` (`localeCompare` „pl”) | Nowa kategoria sama wpada w alfabet     | Plan   |
| `OBJECT_CATEGORIES`    | Bez zmian                                                     | Id i losowanie nie zależą od kolejności | Plan   |

## Scope

**In scope:** kolejność listy, test, zdanie w PRD (US-20).

**Out of scope:** losowanie obiektów, identyfikatory, zapis kategorii w profilu.

## Architecture / Approach

Jedna zmiana w `templates.ts`: posortować kategorie po etykiecie, „Wszystkie” dostawić na początek. Test sprawdza jawną listę etykiet.

## Phases at a Glance

| Phase                | What it delivers              | Key risk                                    |
| -------------------- | ----------------------------- | ------------------------------------------- |
| 1. Sortowanie i test | Alfabetyczna lista, test, PRD | Różnice locale w środowisku (test je łapie) |

**Prerequisites:** brak.
**Estimated effort:** ~1 krótka sesja, 1 faza.

## Open Risks & Assumptions

- Kolejność `localeCompare("pl")` zależy od ICU; test na jawnej liście to pilnuje.

## Success Criteria (Summary)

- Lista kategorii jest alfabetyczna z „Wszystkie” pierwszym na trzech stronach.
- Losowanie i zapamiętana kategoria działają jak dotąd.
