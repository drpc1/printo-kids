<!-- PLAN-REVIEW-REPORT -->

# Plan Review: Profil i ostatnie parametry pamiętają ustawienia każdej karty

- **Plan**: context/changes/card-settings-memory/plan.md
- **Mode**: Deep (weryfikacja wywołań w kodzie)
- **Date**: 2026-10-26
- **Verdict**: REVISE → SOUND po poprawkach
- **Findings**: 0 critical, 3 warnings, 3 observations

Grounding: ścieżki, symbole i nazwy specy e2e potwierdzone; brief↔plan zgodne po poprawkach.

## Findings

### F1 — Dwa zapisy przy tworzeniu profilu (WARNING, MEDIUM)

ProfileCorner zapisuje profil sam, a plan dopisywał `cards` w hooku. **Decision**: FIXED — prop z ustawieniami karty w ProfileCorner → `profileToCreate`, jeden zapis.

### F2 — Brak funkcji zapisu samego poziomu labiryntu (WARNING, MEDIUM)

**Decision**: FIXED — `withProfileLevel` w Fazie 1 z testem.

### F3 — `LastUsed.cards` łamie `recordBarCharacter` (WARNING, LOW)

**Decision**: FIXED — `writeLastUsed` zachowuje argument i dopina `cards`; `writeLastUsedCards` osobno.

### F4 — Zapis ze stanu Reacta nadpisuje zmiany z drugiej karty przeglądarki (OBSERVATION, MEDIUM)

**Decision**: FIXED — `remember` czyta świeży stan z `localStorage`.

### F5 — `hrefForFavoriteSave` błędnie na liście funkcji gubiących `cards` (OBSERVATION, LOW)

**Decision**: FIXED — usunięta z listy.

### F6 — Reguła „nowa karta po zmianie profilu” tylko dla symetrii; guardrail telefonu bez automatu (OBSERVATION, MEDIUM)

**Decision**: FIXED — reguła wspólna w Implementation Approach, asercja na `phone-360` w specu e2e.
