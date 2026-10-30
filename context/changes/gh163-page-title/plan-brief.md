# Tytuł kartki przeglądarki to nazwa karty pracy — Plan Brief

> Full plan: `context/changes/gh163-page-title/plan.md`

## What & Why

Każda strona ma dziś w zakładce „PrintoKids”, więc zakładki i historia wyglądają tak samo. Strona karty ma pokazywać jej nazwę z katalogu (GitHub issue 163).

## Starting Point

Siedem stron przekazuje literał `title="PrintoKids"` do `Layout`. Nazwy kart są w `CARD_KINDS` (`src/lib/cards.ts`).

## Desired End State

`/maze` → „Labirynt”, `/symmetry` → „Symetria”, `/sudoku` → „Sudoku”, `/sequences` → „Sekwencje”, `/nonogram` → „Nonogram”, `/dictation` → „Dyktando graficzne”; `/` zostaje „PrintoKids”.

## Key Decisions Made

| Decision      | Choice                                  | Why                              | Source |
| ------------- | --------------------------------------- | -------------------------------- | ------ |
| Format tytułu | Sama nazwa karty, bez sufiksu marki     | Dosłownie jak w issue            | Plan   |
| Źródło nazw   | Helper `cardTitle(id)` nad `CARD_KINDS` | Jedno miejsce prawdy             | Plan   |
| Nieznane id   | Helper rzuca błędem                     | Literówka psuje build, nie tytuł | Plan   |

## Scope

**In scope:** helper, sześć stron generatorów, test jednostkowy i e2e.

**Out of scope:** tytuł katalogu, manifest, tytuły dynamiczne po stronie klienta.

## Architecture / Approach

`cardTitle` czyta `CARD_KINDS`; strony Astro wołają go w frontmatterze i przekazują do `Layout`.

## Phases at a Glance

| Phase                | What it delivers         | Key risk |
| -------------------- | ------------------------ | -------- |
| 1. Tytuły stron kart | helper + 6 stron + testy | brak     |

**Prerequisites:** brak.
**Estimated effort:** ~1 krótka sesja, 1 faza.

## Open Risks & Assumptions

- Zakładamy, że istniejące e2e nie asertują tytułu „PrintoKids” na stronach kart (grep nic nie znalazł).

## Success Criteria (Summary)

- Zakładki sześciu stron pokazują nazwy kart, katalog „PrintoKids”.
- `npm test`, lint, astro check, build i e2e zielone.
