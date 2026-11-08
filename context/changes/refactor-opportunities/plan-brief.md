# Refactor ustawień kart i profilu — Plan Brief

> Full plan: `context/changes/refactor-opportunities/plan.md`
> Research: `context/changes/refactor-opportunities/research.md`

## What & Why

Zapisy listy profili dziecka w `localStorage` składa dziś ręcznie pięć miejsc, a dwa z nich (usuwanie i tworzenie profilu w `ProfileCorner.tsx`) zapisują listę ze stanu Reacta, więc stara zakładka może cofnąć zmianę zrobioną w innej (TD-1). Porażka zapisu ustawień karty jest dla rodzica niewidoczna. Plan wprowadza jedną funkcję zapisu w `src/lib`, przepina na nią wszystkich wołających i pokazuje komunikat o porażce.

## Starting Point

Czyste transformacje (`withFavorite`, `withProfileCards`, `visitAfterDelete`) i wstrzykiwany `Storage` już istnieją; brakuje funkcji, która składa „świeży odczyt → transformacja → zapis → wynik”. Ulubiona postać ma dwie niezależne implementacje. `package.json:12` wymienia `last-used.test.ts` dwa razy (sklejony token naprawiło już #280). W repo nie ma testów hooków i komponentów, więc logika ma zostać w `lib`.

## Desired End State

Każda zmiana listy profili przechodzi przez `updateProfiles` i nie cofa zmian z innej strony. Przy aktywnym profilu nieudany zapis ustawień karty pokazuje krótki komunikat w wierszu „Zapamiętane dla”, bez przesunięcia układu. `npm test` uruchamia wszystkie testy, a dodanie karty bez wpisu w `summaryParts` łamie test.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Zakres | K1 + pierwszy krok K2 | K1 to jedyny kandydat z realną usterką, K2 ma tani strażnik na M-5. | Plan |
| K3 (labirynt) | Pominięte teraz | Decyzja użytkownika; różnice labiryntu zostają nietknięte. | Plan |
| Porażka zapisu | Widoczny komunikat w wierszu notatki | Rodzic ma wiedzieć, że zmiana się nie zapisała; wiersz ma stałą wysokość, więc układ stoi. | Plan |
| Komunikat bez profilu | Cicho | Wiersz notatki nie istnieje bez profilu, a nowy przesunąłby układ. | Plan |
| Writery `last-used` | Tylko guard i wynik `boolean`, bez scalania | Brak commitu `fix` w historii, jeden wołający i brak nieznanych pól dziś. | Plan |
| Duplikat w `package.json` | Usunięcie w fazie 1, `npm test` lokalnie | Skrypt `test` uruchamia `last-used.test.ts` raz; #280 naprawiło resztę. | Plan |
| Lokalizacja funkcji | `updateProfiles` w `child-profiles.ts` z wynikiem `{ok, reason}` | Wystarcza istniejąca abstrakcja, a wynik z `reason` rozróżnia „zniknął” od „nie zapisano”. | Research |
| Typ notatki | `{text, tone}`, generatory bez zmian | Siedem generatorów podaje `memory.note ?? favorite.note`, więc typ przechodzi dalej. | Research |

## Scope

**In scope:** skrypt `test`, strażnik `summaryParts`, test writerów `last-used`, `updateProfiles`, przepięcie 5 zapisów, komunikat błędu, zdanie w PRD (US-22), dwa nowe e2e.

**Out of scope:** K3 labirynt, scalenie writerów, wywodzenie rejestrów z jednej definicji, K4 migracja `level`, nasłuch `storage`, rozbicie `ProfileCorner`, reguła ESLint dla `localStorage`, komunikat bez profilu.

## Architecture / Approach

Funkcja `updateProfiles(storage, allowed, transform)` czyta świeżą listę, wywołuje czystą `transform` i zapisuje, zwracając `{ok: true, profiles}` albo `{ok: false, reason}`. Hooki i `ProfileCorner` stają się cienkie. Wynik `ok: false` przy aktywnym profilu zasila nowy wariant błędu w `useRememberNote`, który `RememberedNote` renderuje w istniejącym wierszu. Format danych na dysku się nie zmienia.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Skrypt testów i strażniki | Naprawiony `scripts.test`, strażnik rejestru, test writerów | Mała zmiana skryptu `test`; strażnik `summaryParts` potrzebuje fixture’ów dla każdej karty |
| 2. `updateProfiles` w `lib` | Funkcja z testami na `memoryStorage` | Kształt wyniku musi obsłużyć pięciu wołających |
| 3. Przepięcie wołających | Naprawa TD-1, jedna implementacja ulubionej, e2e dwóch zakładek | Osłona UI to głównie e2e |
| 4. Komunikat o porażce | Widoczny błąd w wierszu notatki, PRD, e2e | Nowe zachowanie UI, układ na telefonie |

**Prerequisites:** Node 22.14.0, wolny port dla `E2E_PORT`, brak innych zmian w `src/`.
**Estimated effort:** ~4 sesje, po jednej na fazę; fazy 2→3→4 po kolei, faza 1 niezależna.

## Open Risks & Assumptions

- Założenie: bez aktywnego profilu porażka zapisu `last-used` zostaje cicha (do zmiany tylko wraz z układem paska).
- Nazwa zajęta w świeżej liście podczas tworzenia profilu jest mapowana na istniejący `SAVE_ERROR_TEXT`; osobny komunikat o duplikacie nie jest planowany.

## Success Criteria (Summary)

- Usunięcie albo dodanie profilu w jednej zakładce nie cofa zmiany zrobionej w drugiej.
- Rodzic widzi krótki komunikat, gdy ustawienie karty nie zapisało się w profilu.
- `npm test`, lint, depcruise, astro check, build i pełne e2e są zielone.
