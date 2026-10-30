# Wspólny szkielet strony karty (GH 192) — Plan Brief

> Full plan: `context/changes/gh192-pages-sceleton/plan.md`
> Research: `context/changes/gh192-pages-sceleton/research.md`

## What & Why

Sześć wysp generatorów powtarza tę samą powłokę strony: profil, pasek, Generuj, Drukuj, komunikat błędu, blokadę przy wyborze dziecka. Wyciągamy ją do jednego hooka i jednego komponentu, żeby następna karta nie kopiowała `SudokuGenerator`. Reguły karty, układ w mm i SVG zostają w jej module.

## Starting Point

Pięć kart (bez labiryntu) składa te same trzy hooki i `barLevel`, a markup powłoki jest zapisany sześć razy z drobnymi różnicami. Labirynt trzyma postać i poziom we własnym stanie. `print-contract.test.ts` wymaga list klas `print:hidden` w źródle każdego generatora.

## Desired End State

Nowa karta to kontrolki, reguły generowania i arkusz, plus `useCardPage()`, `useCardSettings()` i `<CardPage>`. Wszystkie sześć stron ma ten sam wiersz kontrolek ustawień, który zachowuje reguły z #173 niezależnie od liczby kontrolek, na telefonie i komputerze.

## Key Decisions Made

| Decision          | Choice                                                               | Why (1 sentence)                                                  | Source          |
| ----------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------- |
| Kształt szkieletu | Hook `useCardPage` + komponent `CardPage`                            | Usuwa i powtarzany stan, i powtarzany markup.                     | Plan            |
| Wiersz kontrolek  | Ujednolicić wszystkie sześć stron, także Nonogram                    | Jedna reguła zamiast wyjątków, lepiej przenośna na kolejne karty. | Plan            |
| Reguły z #173     | Zostają jako kryterium, e2e uogólnione na wszystkie karty            | To reguły (start tekstu, jednakowy odstęp), nie piksele.          | Plan            |
| Labirynt          | Wchodzi na `CardPage`, zostaje przy własnym stanie postaci i poziomu | Issue zabrania wciągania do `CardSettingsMap`.                    | Research / Plan |
| Test druku        | Asercje `print:hidden` przeniesione na `CardPage.tsx`                | Kontrakt druku ma jedno miejsce.                                  | Plan            |
| Fazy              | Hook → komponent z wierszem → labirynt → e2e i zasada                | Wygląd zmienia się tylko w fazie 2.                               | Plan            |

## Scope

**In scope:** `useCardPage`, `CardPage`, wspólny wiersz kontrolek, przepięcie sześciu wysp, przepisanie `print-contract.test.ts`, uogólnienie `phone-settings-rows.spec.ts`, zdanie w `AGENTS.md`.

**Out of scope:** generatory i SVG kart, `CardSettingsMap` i pamięć poziomu labiryntu, `useBarCharacter` w labiryncie, `GeneratorShell.astro`, nowy rodzaj karty, roadmapa.

## Architecture / Approach

`useCardPage` składa `useChildProfileVisit`, `useBarCharacter`, `useFavoriteCharacter` i `barLevel`. `CardPage` dostaje jego wynik, uchwyty `useCardSettings` (rogu profilu, notatka), kontrolki i arkusz jako `ReactNode` oraz `onGenerate`, i rysuje powłokę. `useCardSettings` zostaje w karcie, bo zależy od jej reguł.

## Phases at a Glance

| Phase                            | What it delivers                                              | Key risk                                                    |
| -------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| 1. Hook strony karty             | `useCardPage`, pięć kart przepiętych                          | Test druku szuka `useBarCharacter(` w kartach.              |
| 2. `CardPage` i wiersz kontrolek | Powłoka w jednym miejscu, jeden wiersz, przepisany test druku | Zmiana wyglądu odstępów; e2e telefonu.                      |
| 3. Labirynt                      | Labirynt na `CardPage` z własnym stanem                       | Dane labiryntu różnią się od kart (brak `newProfileCards`). |
| 4. E2E i zasada                  | Uogólniony `phone-settings-rows`, zdanie w `AGENTS.md`        | Test na wszystkich stronach może wykryć dalsze różnice.     |

**Prerequisites:** zielony `main` (sprawdzone przy `db977e5`).
**Estimated effort:** ok. 3-4 sesje, cztery fazy.

## Open Risks & Assumptions

- Zmiana wyglądu w fazie 2 może wymagać kilku iteracji odstępów na telefonie; kryterium to dwie reguły z #173, nie dokładne piksele.
- Źródła generatorów czytają `print-contract.test.ts` i `character.test.ts:73-86` (grep po `src`, `tests`, `scripts`, `stryker`); drugi test dotyczy `characterSheetSrc(` i `generateMaze`, które zostają w `WorksheetGenerator.tsx`, więc zostaje bez zmian.
- Treść e2e innych niż `phone-settings-rows` nie była czytana; mogą wykryć regresje układu.

## Success Criteria (Summary)

- Następna karta powstaje bez kopiowania paska, profilu i druku.
- Wszystkie sześć stron wygląda spójnie na telefonie i komputerze, a druk jest bez zmian.
- Lint, testy, typy, build i e2e na czterech projektach Chromium są zielone.
