# Ulubiona postać zmienia się tylko jawnie — Plan Brief

> Full plan: `context/changes/favorite-character-explicit/plan.md`

## What & Why

Przy aktywnym profilu postać wybrana na pasku działa tylko na bieżącą wizytę. Dodajemy jawny sposób zapisania jej jako ulubionej (stopka listy postaci) i upraszczamy okno profilu do zapisu od razu. S-31, PRD US-03, US-08, US-22, FR-009.

## Starting Point

Pasek już nie zmienia ulubionej (zapis „ostatnio użytej” tylko bez profilu). Brakuje tekstu „Tylko na tę kartę” i przycisku „Ustaw jako ulubioną {imię}”; okno profilu ma jeszcze szkic z „Anuluj” i „Zapisz”.

## Desired End State

Lista postaci na każdej z sześciu stron kart ma, gdy wybrana postać różni się od ulubionej, stopkę z tekstem i przyciskiem; klik zapisuje, zamyka listę i pokazuje „Zapamiętane dla {imię}”. Okno profilu zapisuje wybór ulubionej od razu, także własny obrazek.

## Key Decisions Made

| Decision          | Choice                                            | Why                                         | Source             |
| ----------------- | ------------------------------------------------- | ------------------------------------------- | ------------------ |
| Miejsce przycisku | Stopka listy postaci na pasku (też telefon)       | Tam rodzic wybiera postać                   | Makieta 2026-10-27 |
| Kiedy stopka      | Aktywny profil i postać różna od ulubionej        | Bez szumu, gdy nie ma czego zapisywać       | Makieta            |
| Okno profilu      | Wariant A: bez „Zapisz” i „Anuluj”, zapis od razu | Spójne z ustawieniami kart                  | Makieta            |
| Własny obrazek    | „Różni się”, gdy inne zdjęcie niż w profilu       | Można podmienić zdjęcie ulubionej z paska   | Plan               |
| Potwierdzenie     | Istniejąca notka „Zapamiętane dla {imię}”         | Ten sam wzorzec co zmiany ustawień na pasku | Plan               |
| Błąd zapisu       | Lista zostaje z komunikatem                       | Jak w oknie profilu dziś                    | Plan               |
| Dane              | Format `localStorage` bez zmian                   | Zgodność wstecz                             | PRD                |

## Scope

**In scope:** stopka na sześciu stronach, hook oferty, okno profilu bez „Zapisz”, testy.
**Out of scope:** S-32 („Jak to działa”), zmiany formatu danych, formularz tworzenia profilu.

## Architecture / Approach

`favoriteDiffers` w `child-profiles.ts`, hook `useFavoriteCharacter` (oferta i zapis przez `withFavorite`, odczyt profili tuż przed zapisem), nowy prop `favorite` w `CharacterChoiceControl`, notka przez istniejące `RememberedNote`.

## Phases at a Glance

| Phase              | What it delivers                                  | Key risk                                             |
| ------------------ | ------------------------------------------------- | ---------------------------------------------------- |
| 1. Stopka na pasku | Tekst i przycisk w liście postaci, 6 stron, testy | Osiągalność stopki na telefonie; maze ma własny stan |
| 2. Okno profilu    | Zapis od razu, bez „Zapisz” i „Anuluj”            | Przepisanie e2e z S-29, własny obrazek               |

**Prerequisites:** S-29 (jest w gałęzi).
**Estimated effort:** ~2 sesje, 2 PR-y.

## Open Risks & Assumptions

- Merge PR #152 w trakcie wymaga merge `main` do gałęzi.
- Stopka `sticky` w dialogu z przewijaną listą musi działać na 360 px.

## Success Criteria (Summary)

- Zmiana postaci na pasku nie zmienia ulubionej po odświeżeniu; „Ustaw jako ulubioną” ją zmienia.
- Okno profilu nie ma „Zapisz” i „Anuluj”, a własny obrazek można zapisać jako ulubioną.
