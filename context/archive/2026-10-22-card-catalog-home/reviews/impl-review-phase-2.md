<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Katalog kart na stronie głównej; labirynt pod /labirynt

- **Plan**: context/changes/card-catalog-home/plan.md
- **Scope**: Phase 2 of 3
- **Reviewed phases**: 2
- **Date**: 2026-10-23
- **Verdict**: APPROVED
- **Findings**: 0 critical, 0 warnings, 2 observations

## Verdicts

| Dimension           | Verdict |
| ------------------- | ------- |
| Plan Adherence      | PASS    |
| Scope Discipline    | PASS    |
| Safety & Quality    | PASS    |
| Architecture        | PASS    |
| Pattern Consistency | PASS    |
| Success Criteria    | PASS    |

Evidence (zmiany w indeksie, jeszcze bez commita): `npm test` 137/137, lint i `astro check` czyste, build ok, smoke ok na `/` i `/labirynt` (port 4399; port 4321 zajmuje obcy proces), e2e 28 zielonych / 16 pominiętych z założenia. Deliberate-break: usunięcie `#worksheet-home a` z reguły druku czerwieni test kontraktu. `@page`, `max-width/max-height` i `background: none` w druku bez zmian (diff pokazuje tylko dopisany selektor `a`). Kroki ręczne 2.6–2.8 jeszcze niepotwierdzone.

## Findings

### F1 — Brak automatycznej asercji, że link „Wszystkie karty” nie zasłania treści na telefonie

- **Severity**: OBSERVATION
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Success Criteria
- **Location**: src/components/GeneratorShell.astro:13
- **Detail**: Link jest `absolute top-4 left-4` (na dotyku przewija się ze stroną, na myszy `fixed`), a profil `absolute top-4 right-4`. Istniejące e2e sprawdzają tylko, że narożnik Profil nie zasłania nagłówka. Zasłanianie przez nowy link (360/375 px, najdłuższe imię) pilnuje wyłącznie krok ręczny 2.7.
- **Fix**: Dodać w `phone-layout.spec.ts` asercję, że prostokąt linku nie przecina się z przyciskiem profilu ani nagłówkiem na 360 i 375 px.
  - Strength: Zamienia ręczny krok w stałą ochronę przed regresją przy kolejnych kartach.
  - Tradeoff: Jeden test więcej poza bramką CI.
  - Confidence: MED — wzorzec jest w istniejących testach narożnika.
  - Blind spot: Nie sprawdzałem układu na prawdziwym iPhonie.
- **Decision**: FIXED (nowy e2e w phone-layout.spec.ts; wykrył realną styczność pól linku i nagłówka na 360 px po wygenerowaniu, naprawione: górny odstęp has-maze na telefonie 3.5rem → 4.5rem, tylko @media screen)

### F2 — index.astro i labirynt.astro są identyczne

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Scope Discipline
- **Location**: src/pages/index.astro
- **Detail**: Zgodnie z planem `/` tymczasowo renderuje ten sam labirynt. Faza 3 zastępuje go katalogiem, więc duplikat zniknie.
- **Fix**: Brak; zamknąć w fazie 3.
- **Decision**: ACCEPTED (planowane tymczasowo, faza 3)
