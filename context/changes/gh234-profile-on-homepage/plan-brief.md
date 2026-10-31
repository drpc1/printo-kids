# Profil klikalny na stronie głównej — Plan Brief

> Full plan: `context/changes/gh234-profile-on-homepage/plan.md`

## What & Why

Na stronie głównej widać „Profil: imię”, ale nie da się w profil wejść. Rodzic ma móc wybrać, dodać, edytować i usunąć profil z katalogu tak samo jak w generatorach (GitHub 234, US-05).

## Starting Point

`ProfileCorner` działa już bez `WorksheetGenerator`; potrzebuje tylko stanu z `useChildProfileVisit`. Katalog to Astro ze skryptem, który rysuje podpis i plakietki z `localStorage`.

## Desired End State

Na `/` w prawym górnym rogu stoi ten sam przycisk profilu co w generatorach. Każda zmiana profilu odświeża plakietki od razu; profil zostaje po przejściu katalog ↔ generator. Podpis „Profil: …” znika.

## Key Decisions Made

| Decision               | Choice                     | Why (1 sentence)                             |
| ---------------------- | -------------------------- | -------------------------------------------- |
| Podpis „Profil: …”     | Usunięty, zastępuje go róg | Jedno miejsce z profilem, zgodnie z issue.   |
| Auto-otwarcie okna     | Nie, `ask=false`           | Na głównej nic nie zależy od wyboru dziecka. |
| Zmiana `ProfileCorner` | Brak                       | Komponent już działa bez generatora.         |
| Odświeżenie plakietek  | Zdarzenie okna z wyspy     | `storage` nie odpala się w tej samej karcie. |
| Testy                  | Jednostkowe + E2E          | Pilnują US-05 i przejść plakietek.           |

## Scope

**In scope:** wyspa rogu na `/`, odświeżanie plakietek, usunięcie podpisu, testy, linia w PRD.

**Out of scope:** zmiany `ProfileCorner`/hooka, katalog w React, auto-okno, zmiany danych.

## Architecture / Approach

`CatalogProfileCorner` (`client:only="react"`) → `useChildProfileVisit` (`ask=false`) → `ProfileCorner`. Efekt na `[profiles, activeId]` wysyła zdarzenie; skrypt w `CardCatalog.astro` odświeża plakietki.

## Phases at a Glance

| Phase              | What it delivers                      | Key risk                           |
| ------------------ | ------------------------------------- | ---------------------------------- |
| 1. Róg na katalogu | Klikalny profil, odświeżane plakietki | Róg zasłania nagłówek na telefonie |
| 2. Testy i PRD     | E2E, jednostkowe, US-05               | Przepisanie asercji o podpisie     |

**Prerequisites:** brak. **Estimated effort:** ok. pół dnia.

## References

- Issue GitHub 234; `src/components/ProfileCorner.tsx`, `src/hooks/useChildProfileVisit.ts`, `src/components/CardCatalog.astro`
