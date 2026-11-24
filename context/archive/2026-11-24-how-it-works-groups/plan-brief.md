# Jak to działa: trzy zwinięte grupy i opis własnego obrazka — Plan Brief

> Full plan: `context/changes/how-it-works-groups/plan.md`

## What & Why

Strona „Jak to działa” ma zasady jako długi rozwinięty tekst nad 16 zwijanymi kartami, a funkcja „Własny obrazek” jest schowana na liście postaci. Użytkowniczka chce wszystko zwinięte, pogrupowane i z opisem własnego obrazka.

## Starting Point

Po S-53 (PR #486) `how-it-works.astro` renderuje 6 sekcji zasad i 16 `<details>` kart. E2E przypina nagłówki zasad i kolejność kart.

## Desired End State

Trzy grupy z `h2` (Ustawienia i zasady, Karty, Dobrze wiedzieć), wszystkie wiersze zamknięte i alfabetyczne w grupach. Wiersz „Postać i własny obrazek” opisuje własny obrazek, a PRD US-05 i US-22 to odzwierciedla.

## Key Decisions Made

| Decision              | Choice                                                       | Why                             | Source        |
| --------------------- | ------------------------------------------------------------ | ------------------------------- | ------------- |
| Układ                 | Jedna strona, trzy grupy `h2`, wiersze `<details>` zamknięte | Decyzja użytkowniczki           | Brief zadania |
| Kolejność             | Grupy stałe, wiersze alfabetycznie po polsku                 | Łatwo znaleźć wiersz            | Brief zadania |
| Profil i ulubiona     | Scalone w jeden wiersz                                       | Jedna zasada, mniej wierszy     | Brief zadania |
| Komponent wiersza     | `HowItWorksRow.astro`                                        | Trzy użycia tego samego wiersza | Plan          |
| Opis własnego obrazka | Zweryfikowany w kodzie (formaty, 8 MB, w przeglądarce)       | Prawdziwość treści              | Plan          |

## Scope

**In scope:** strona, komponent wiersza, e2e, PRD US-05 i US-22.

**Out of scope:** `CARD_KINDS`, poziomy, lista postaci, pasek, podpowiedź przy liście postaci (follow-up), nowy slice roadmapy.

## Architecture / Approach

Mały komponent `.astro` bez JS, dane w frontmatterze, kolejność alfabetyczna zapisana w tablicach i pilnowana testem.

## Phases at a Glance

| Phase                | What it delivers                        | Key risk                     |
| -------------------- | --------------------------------------- | ---------------------------- |
| 1. Układ strony      | Grupy, komponent, treści                | Układ przy 375 px            |
| 2. Testy e2e         | Spec na nową strukturę + próba zepsucia | Osłabienie pilnowania treści |
| 3. PRD i weryfikacja | PRD + wszystkie bramki                  | Brak                         |

**Prerequisites:** brak.
**Estimated effort:** ~1 sesja, 3 fazy.

## Open Risks & Assumptions

- `h3` w `<summary>` (zaakceptowany kompromis dostępności).
- E2E tylko Chromium; telefon ręcznie przy 375 px.

## Success Criteria (Summary)

- Wszystkie wiersze zamknięte po wejściu, trzy grupy w kolejności.
- Opis własnego obrazka w wierszu postaci.
- Wszystkie bramki zielone.
