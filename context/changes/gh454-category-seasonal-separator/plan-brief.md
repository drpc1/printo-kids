# Kreska pod kategoriami sezonowymi — Plan Brief

> Full plan: `context/changes/gh454-category-seasonal-separator/plan.md`

## What & Why

Na liście kategorii kategorie sezonowe stoją w jednym ciągu z całorocznymi, a na liście postaci sezonowe oddziela kreska. Ujednolicamy to (GitHub 454).

## Starting Point

Lista postaci liczy `separatorAfter` i rysuje `Separator`. Lista kategorii (`CategoryChoice` na `LevelChoice`) ma już dobrą kolejność, ale bez kreski.

## Desired End State

W oknie dat pod ostatnią sezonową kategorią („Boże Narodzenie” albo „Zima”) jest taka sama kreska jak na liście postaci. Poza oknem nie ma ani kategorii, ani kreski.

## Key Decisions Made

| Decision | Choice | Why |
| --- | --- | --- |
| Zakres kreski | po ostatniej sezonowej, także „Zima” | spójne z postaciami; Zima doszła w S-54 |
| Po „Wszystkie” | bez kreski | issue mówi tylko o kreski pod sezonową |
| Miejsce logiki | czysta funkcja w `templates.ts` | testowalna jak `separatorAfter` postaci |
| `LevelChoice` | opcjonalny prop `separatorAfter` | inne listy bez zmian |

## Scope

**In scope:** funkcja separatora, prop w `LevelChoice`, podłączenie w `CategoryChoice`, test.

**Out of scope:** kolejność, okna dat, lista postaci, style kreski.

## Architecture / Approach

Funkcja wylicza id ostatniej sezonowej widocznej kategorii z daty urządzenia; `LevelChoice` rysuje po nim `Separator`.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Funkcja separatora | `objectCategorySeparatorAfterOn` + test | granice dat okien |
| 2. Kreska w liście | prop w `LevelChoice`, podłączenie | wpływ na inne listy poziomów |

Prerequisites: brak. Estimated effort: ok. godziny.
