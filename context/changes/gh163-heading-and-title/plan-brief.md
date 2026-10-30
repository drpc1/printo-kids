# Nagłówek strony karty i tytuł zakładki — Plan Brief

> Full plan: `context/changes/gh163-heading-and-title/plan.md`

## What & Why

#199 zmienił tylko tytuł zakładki, a użytkowniczka chciała też zmienić duży nagłówek na stronie, który nadal mówi „PrintoKids”. Zakładka ma mieć format „PrintoKids - {nazwa karty}”, a nagłówek samą nazwę karty.

## Starting Point

Tytuł zakładki to dziś sama nazwa (`cardTitle`). `h1` „PrintoKids” jest na sztywno w `GeneratorShell.astro:37`.

## Desired End State

`/maze`: zakładka „PrintoKids - Labirynt”, nagłówek „Labirynt”; tak samo pozostałe pięć kart. `/` bez zmian.

## Key Decisions Made

| Decision        | Choice                                  | Why                             | Source |
| --------------- | --------------------------------------- | ------------------------------- | ------ |
| Tytuł zakładki  | „PrintoKids - {nazwa}”                  | Decyzja użytkowniczki           | Plan   |
| Nagłówek strony | Sama nazwa karty                        | Decyzja użytkowniczki           | Plan   |
| Mechanizm       | Helper `cardPageTitle` + prop `heading` | Jedno źródło nazw: `CARD_KINDS` | Plan   |

## Scope

**In scope:** helper, `GeneratorShell`, sześć stron, testy unit i e2e.

**Out of scope:** katalog `/`, manifest, wydruk.

## Architecture / Approach

Obie wartości liczone z `CARD_KINDS`; strona przekazuje je do `Layout` i `GeneratorShell`.

## Phases at a Glance

| Phase                        | What it delivers             | Key risk                    |
| ---------------------------- | ---------------------------- | --------------------------- |
| 1. Tytuł zakładki i nagłówek | helper, prop, 6 stron, testy | układ nagłówka na telefonie |

**Prerequisites:** brak.
**Estimated effort:** 1 krótka faza.

## Open Risks & Assumptions

- Dłuższy „Dyktando graficzne” w `h1` musi się mieścić na telefonie obok narożnych przycisków.

## Success Criteria (Summary)

- Zakładki i nagłówki sześciu stron zgodne z opisem, katalog bez zmian.
- Testy, lint, build i e2e zielone.
