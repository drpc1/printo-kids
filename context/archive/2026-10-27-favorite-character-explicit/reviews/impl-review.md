<!-- IMPL-REVIEW-REPORT -->

# Implementation Review: Ulubiona postać zmienia się tylko jawnie

- **Plan**: context/changes/favorite-character-explicit/plan.md
- **Scope**: Full plan (obie fazy)
- **Reviewed phases**: 1, 2
- **Date**: 2026-10-27
- **Verdict**: NEEDS ATTENTION
- **Findings**: 0 critical, 3 warnings, 1 observation

## Verdicts

| Dimension           | Verdict                               |
| ------------------- | ------------------------------------- |
| Plan Adherence      | PASS                                  |
| Scope Discipline    | PASS                                  |
| Safety & Quality    | WARNING                               |
| Architecture        | PASS                                  |
| Pattern Consistency | PASS                                  |
| Success Criteria    | WARNING (słaby test własnego zdjęcia) |

Faza 1 była wcześniej przejrzana osobno (reviews/impl-review-phase-1.md, APPROVED, F1 naprawione).

## Findings

### F1 — `saveFavorite` w oknie profilu zapisuje z propsa `profiles`, nie ze świeżego odczytu

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: src/components/ProfileCorner.tsx (saveFavorite)
- **Detail**: Hook z fazy 1 czyta profile z `localStorage` tuż przed zapisem; okno profilu nie. Zmiana ustawień karty, utworzenie lub usunięcie profilu na innej otwartej karcie mogłaby zostać cofnięta jednym wyborem ulubionej. Zapis jest teraz jednym kliknięciem, więc łatwiej to wywołać. Dodatkowo `level` brany jest z nieświeżego profilu.
- **Fix**: Przed zapisem odczytać `readChildProfiles`, znaleźć aktywny profil w świeżej liście i na niej zrobić `withFavorite`, potem `onFavoriteSaved`.
  - Strength: Ten sam wzorzec co faza 1 i `useMazeLevelMemory`.
  - Tradeoff: Kilka linii więcej.
  - Confidence: HIGH — identyczna ścieżka działa w `useFavoriteCharacter`.
  - Blind spot: Brak.
- **Decision**: FIXED

### F2 — `favoriteError` nie jest czyszczony przy otwarciu listy i na początku `saveFavorite`

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Safety & Quality
- **Location**: src/components/ProfileCorner.tsx
- **Detail**: Po nieudanym zapisie ponowny wybór tej samej postaci (no-op) zostawia stary komunikat na ekranie.
- **Fix**: `setFavoriteError(null)` w `openFavoriteList` i na początku `saveFavorite`; `setPanel("edit")` po sprawdzeniu `activeProfile`.
- **Decision**: FIXED

### F3 — Test własnego zdjęcia po przeładowaniu może przejść na zepsutym kodzie

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: tests/e2e/profile-summary.spec.ts (own image picked in the favorite list)
- **Detail**: Po przeładowaniu sprawdza tylko przycisk „Postać: Własne zdjęcie”, który może pochodzić z kopii na urządzeniu, nie z profilu.
- **Fix**: Asercja, że zapisany profil ma `character: "wlasne"` i `image` zaczynające się od `data:image`.
- **Decision**: FIXED

### F4 — Niepasujące podświetlenie przy uszkodzonym `wlasne` w liście ulubionej

- **Severity**: OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Pattern Consistency
- **Location**: src/components/ProfileCorner.tsx (selected w favorite-list)
- **Detail**: Zapisane `wlasne` bez obrazka podświetla „Własne zdjęcie” przy pustej miniaturze. Kosmetyka.
- **Fix**: Bez zmiany.
- **Decision**: ACCEPTED
