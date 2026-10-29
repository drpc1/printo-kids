# Replace Bez postaci with Brak — Plan Brief

> Full plan: `context/changes/gh180-no-character/plan.md`

## What & Why

Rodzic czyta „Bez postaci” na przycisku paska i w wierszu listy. GitHub #180 zamienia ten napis na „Brak”. Brak obrazka i napis „Start” na labiryncie zostają.

## Starting Point

Jedyna etykieta to `label: "Bez postaci"` przy id `none` w `src/lib/sheet/character.ts`. Przycisk składa „Postać: ” z tej etykiety. Tę frazę trzymają test katalogu i trzy pliki Playwright, w tym `profile-summary.spec.ts`, którego issue nie wymienia.

## Desired End State

Zamknięty przycisk czyta się „Postać: Brak”, wiersz listy czyta się „Brak”. Id `none` zostaje w zapisie. Labirynt przy tym wyborze dalej ma „Start” i nie ma obrazka. Komentarze i dokumenty produktowe mogą nadal mówić „Bez postaci”.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Widoczna etykieta | „Brak” | Issue #180 i prośba o podmianę napisu, który czyta rodzic. |
| Zakres plików | Katalog plus asercje i tytuły testów | Wybrano sam UI i testy, które trzymają frazę. |
| Id, kartka, zapis | Bez zmian | Issue zostawia `none`, brak obrazka i „Start”; etykieta nie jest w `localStorage`. |
| Komentarze i dokumenty | Bez zmian | Issue zostawia komentarze i archiwum; PRD, plan testów i roadmapa też zostają. |
| Struktura | Jedna faza | Jedna etykieta i testy, które po niej padną. |

## Scope

**In scope:**

- `label` wiersza `none` w `src/lib/sheet/character.ts`
- Asercje i tytuły w `src/lib/sheet/character.test.ts`, `tests/e2e/character-speaks.spec.ts`, `tests/e2e/favorite-character.spec.ts`, `tests/e2e/profile-summary.spec.ts`

**Out of scope:**

- Id `none`, rysunek kartki, migracja zapisu
- Komentarz w `src/hooks/useBarCharacter.ts` i komentarz na górze `character-speaks.spec.ts`
- `context/foundation/prd.md`, `context/foundation/test-plan.md`, `context/foundation/roadmap.md`, `context/archive/`

## Architecture / Approach

Etykieta żyje w katalogu. Ekran jej nie kopiuje. Plan podmienia to jedno pole i oczekiwania testów. Locator z `exact: true` w profilu zostaje dokładny. `pickCharacter` zostaje dopasowaniem podciągu, bo „Brak” siedzi w „Postać: Brak” tak samo jak stara fraza w starej nazwie przycisku.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Etykieta i testy, które ją trzymają | Przycisk „Postać: Brak”, wiersz „Brak”, zielone testy tych fraz | Locator „Brak” trafi w dwa przyciski naraz i Playwright zgłosi strict mode |

**Prerequisites:** Brak. Issue #180 jest otwarte, katalog i testy już są w repo.
**Estimated effort:** Jedna krótka sesja, jedna faza.

## Open Risks & Assumptions

- Dopasowanie nazwy bez `exact` może złapać i wiersz „Brak”, i przycisk „Postać: Brak”. Ten sam stosunek jest dziś przy „Bez postaci”. Jeśli po podmianie locator widzi dwa przyciski, dodać `exact: true`, nie zmieniać etykiety.
- PRD i plan testów dalej mówią „Bez postaci”. Kolejny agent może przywrócić starą frazę, czytając te pliki.

## Success Criteria (Summary)

- Rodzic na `/maze` widzi „Postać: Brak” i wiersz „Brak”, a kartka ma „Start” bez obrazka.
- Na `/symmetry` „Brak” zostawia samo polecenie, bez obrazka.
- Lista przy nowym profilu ma wiersz „Brak”, a `npm test`, wskazane Playwright i `npm run lint` przechodzą.
