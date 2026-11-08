<!-- PLAN-REVIEW-REPORT -->
# Plan Review: Refactor ustawień kart i profilu: jedna ścieżka zapisu, komunikat o porażce, strażnik rejestru

- **Plan**: context/changes/refactor-opportunities/plan.md
- **Mode**: Deep (weryfikacja ryzykownych twierdzeń wykonana bezpośrednio na `origin/main`, bez sub-agenta)
- **Date**: 2026-11-08
- **Verdict**: SOUND (after fixes; było REVISE)
- **Findings**: 0 critical, 3 warnings, 3 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| End-State Alignment | PASS |
| Lean Execution | PASS |
| Architectural Fitness | PASS |
| Blind Spots | WARNING |
| Plan Completeness | WARNING |

## Grounding

Ścieżki 8/8 ✓ (na `origin/main`), symbole 7/8 ✓, brief↔plan ✓, Progress↔Phase ✓ (1.1–1.6, 2.1–2.4, 3.1–3.8, 4.1–4.9). Jedno nieaktualne twierdzenie: sklejony token w `package.json:12` (F1). Gałąź robocza `feat/gh283-verified-card` jest 77 commitów za `origin/main`; sprawdzano `origin/main`.

## Findings

### F1 — Faza 1 naprawia to, co #280 już naprawiło

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Current State Analysis (linia 14), Phase 1 pkt 1, kryteria 1.1 i 1.6
- **Detail**: Plan twierdzi, że `package.json:12` ma sklejony token `analytics.test.tssrc/lib/last-used.test.ts`. Na `origin/main` (PR #280, `790c4c5`) te ścieżki są już rozdzielone, a `src/lib/test-script.test.ts` pilnuje, że skrypt `test` wymienia wszystkie pliki i tylko istniejące. Zostaje jedynie zdublowany `src/lib/last-used.test.ts`. Kryterium ręczne 1.6 (wynik `analytics.test.ts`) jest bezprzedmiotowe, bo test już jest w CI.
- **Fix**: Zawęzić pkt 1 fazy 1 do usunięcia duplikatu `last-used.test.ts`, poprawić linię 14 w Current State, usunąć kryterium 1.6 i odpowiadające mu pole w Progress.
- **Decision**: FIXED (Fix in plan: faza 1 zawężona do usunięcia duplikatu, kryterium 1.6 usunięte)

### F2 — `transform` nie może przenieść wyniku `visitAfterDelete`

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Phase 2 (kontrakt `updateProfiles`), Phase 3 pkt 1 i 2
- **Detail**: `confirmDelete` woła `visitAfterDelete(profiles, id, activeId, bar, lastUsed, activeProfile)` i przekazuje cały wynik (`profiles`, `activeId`, …) do `onDeleted(next)` (`ProfileCorner.tsx:178-198`). Plan każe liczyć to „wewnątrz `transform`”, ale `transform` zwraca tylko `ChildProfile[] | null`, a `UpdateResult` oddaje tylko `profiles`. Implementator musi zgadnąć, jak wynieść `activeId` i resztę. Podobnie `saveFavorite` wychodzi wcześniej, gdy wybór równa się obecnej ulubionej (`:249-252`), co wymaga dostępu do świeżej listy przed `transform`.
- **Fix A ⭐ Recommended**: `updateProfiles` zwraca w wyniku `ok: true` także `before` (świeżą listę sprzed zmiany), a wołający liczy `visitAfterDelete`/wczesne wyjście na `before`.
  - Strength: Mała zmiana kontraktu, `transform` zostaje czystą funkcją profili; odczyt i zapis są synchroniczne, więc nie ma okna wyścigu.
  - Tradeoff: Wołający liczy `visitAfterDelete` dopiero po zapisie, a nie przed.
  - Confidence: MED — wynik zależy od tego, czy `visitAfterDelete` jest czysta względem `before`.
  - Blind spot: Nie sprawdzono, czy `visitAfterDelete` ma efekty uboczne.
- **Fix B**: Uogólnić `updateProfiles<T>` tak, by `transform` zwracało `{ profiles, extra: T }`.
  - Strength: Wynik pochodny wraca razem z listą, w jednym miejscu.
  - Tradeoff: Generyk komplikuje testy i kontrakt dla trzech prostszych wołających.
  - Confidence: MED — działa, ale jest cięższe niż potrzeba.
  - Blind spot: Czy dwa z pięciu wołających kiedykolwiek będą potrzebować `extra`.
- **Decision**: FIXED (Fix A: `before` w wyniku `updateProfiles`)

### F3 — Test chroniący TD-1 powstaje po zmianie, nie przed

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Phase 3 pkt 4 (e2e dwóch zakładek)
- **Detail**: Zasada lekcji i planu to „dodaj test, zanim dotkniesz”. W fazie 3 e2e dwóch zakładek jest czwartym punktem, po przepięciu `ProfileCorner`. Bez uruchomienia na starym kodzie nie wiadomo, czy test faktycznie łapie TD-1 (czerwony przed, zielony po), czy tylko przechodzi.
- **Fix**: Przenieść e2e dwóch zakładek na początek fazy 3, dodać kryterium „test jest czerwony na kodzie sprzed przepięcia” (ręczne), a dopiero potem przepinać wołających.
  - Strength: Dowód, że test wykrywa błąd; zgodne z zasadą guard-first.
  - Tradeoff: Jedno dodatkowe uruchomienie e2e w fazie.
  - Confidence: HIGH — taki układ jest standardem planu i lekcji.
  - Blind spot: Czy scenariusz z `localStorage` z drugiej strony odtwarza błąd tak samo jak prawdziwa druga zakładka.
- **Decision**: FIXED (e2e dwóch zakładek jako pkt 1 fazy 3, kryterium czerwony→zielony 3.7)

### F4 — Strażnik `summaryParts` nie mówi, skąd brać ustawienia

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Phase 1 pkt 2
- **Detail**: Kontrakt wymaga „profilu z zapisanymi ustawieniami tej karty” dla każdego `id` z `CARD_KINDS`, ale nie wskazuje źródła poprawnych ustawień dla każdej karty. Ręczna mapa fixture’ów jest kolejnym rejestrem (choć brak wpisu może łamać test), a `DEFAULTS` z `card-settings.ts` to kolejny rejestr, który plan odkłada na później.
- **Fix**: Doprecyzować: fixture’y z `DEFAULTS`/mapy w teście, a brak fixture’a dla `id` z `CARD_KINDS` łamie test.
- **Decision**: FIXED (fixture'y w teście, brak fixture'a łamie test)

### F5 — Plan powstał na nieaktualnym drzewie

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Completeness
- **Location**: Overview, Phase 4 (CardPage)
- **Detail**: Od commita planu `main` dostał m.in. gh283 (karty pionowo, zmiany w `CardPage.tsx` +62 linie). Numery linii w `ProfileCorner.tsx` i `useCardSettings.ts` nadal się zgadzają, ale Phase 4 modyfikuje `CardPage.tsx` i `RememberedNote.tsx`.
- **Fix**: Implementować z nowej gałęzi od aktualnego `origin/main` i przed fazą 4 sprawdzić `CardPage.tsx`.
- **Decision**: FIXED (notatka o świeżej gałęzi w Implementation Approach)

### F6 — Komunikat błędu z ulubionej może zniknąć pod „Zapamiętane”

- **Severity**: 💡 OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 4 pkt 1–2
- **Detail**: `useCardSettings` i `useFavoriteCharacter` mają osobne instancje `useRememberNote`, a generatory składają `memory.note ?? favorite.note`. Gdy oba mają aktywną notatkę, błąd z `favorite` jest niewidoczny (TD-9, zakres wyłączony z planu).
- **Fix**: Zapisać jako znane ograniczenie w „What We're NOT Doing” (wąskie okno czasowe) i nie rozwiązywać w tym planie.
- **Decision**: FIXED (ograniczenie dopisane do What We're NOT Doing)
