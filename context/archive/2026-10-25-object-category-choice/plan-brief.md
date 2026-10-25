# Wybór kategorii obiektów — Plan Brief

> Full plan: `context/changes/object-category-choice/plan.md`
> Research: `context/changes/object-category-choice/research.md`

## What & Why

Rodzic wybiera na pasku symetrii, nonogramu i dyktanda jedną kategorię obiektów albo „Wszystkie”; Generuj losuje tylko z niej (US-20, FR-029). Katalog S-21 ma już kategorie, brakuje filtra i kontrolki.

## Starting Point

Trzy generatory czytają obiekty przez `symmetryTemplatesFor(level)`; dyktando trzyma katalog kart per poziom.

## Desired End State

Przycisk „Kategoria: …” obok „Poziom: …”; obowiązuje przy następnym Generuj; stan strony.

## Key Decisions Made

| Decision         | Choice                                       | Why                                            | Source   |
| ---------------- | -------------------------------------------- | ---------------------------------------------- | -------- |
| Gdzie filtr      | parametr `category` w `symmetryTemplatesFor` | jedyny punkt odczytu katalogu                  | Research |
| Cache dyktanda   | klucz poziom + kategoria                     | katalog zależy od zbioru szablonów             | Plan     |
| Pusta kategoria  | generator zwraca `null`                      | bez wyjątku i pętli                            | Plan     |
| Zmiana kategorii | nie generuje sama                            | US-20: „przy następnym Generuj”                | PRD      |
| Kontrolka        | uogólniony `LevelChoice` z etykietą          | wzorzec istnieje                               | Research |
| Za mało obiektów | brak decyzji do podjęcia                     | min. 3 obiekty i 8 obrysów w każdej kombinacji | Research |

## Scope

**In scope:** filtr, kontrolka na trzech stronach, testy, PRD Q11, roadmapa.
**Out of scope:** profil i ostatnie parametry, nowe obiekty, rozmiar nonogramu (S-24).

## Architecture / Approach

Filtr w `templates.ts`, opcjonalny `category` w generatorach, stan `categoryId` w komponentach stron.

## Phases at a Glance

| Phase         | What it delivers         | Key risk                                                     |
| ------------- | ------------------------ | ------------------------------------------------------------ |
| 1. Biblioteka | filtr, generatory, testy | cache dyktanda                                               |
| 2. UI         | kontrolka na 3 stronach  | pasek na telefonie; kolizja z S-24 w `NonogramGenerator.tsx` |
| 3. Dokumenty  | PRD Q11, roadmapa        | —                                                            |

**Prerequisites:** S-21, S-22, S-23 w main (są).
**Estimated effort:** ~1 sesja, 3 fazy.

## Open Risks & Assumptions

- S-24 zmieni `NonogramGenerator.tsx`; sync z main przed PR.

## Success Criteria (Summary)

- Każda kategoria × poziom/rozmiar daje karty tylko z kategorii, bez powtórzeń i bez pustej karty.
- Pasek mieści się na 375 px.
