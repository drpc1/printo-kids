---
date: 2026-10-30
researcher: Claude (Sonnet 5.5)
git_commit: 26aa129
branch: claude/gh192-pages-skeleton-37ce07
repository: printo-kids
topic: "Co powtarza się w sześciu wyspach generatorów i co szkielet strony karty musi objąć (GH 192)"
tags: [research, codebase, generators, useChildProfileVisit, useCardSettings, useBarCharacter, GeneratorShell]
status: complete
last_updated: 2026-10-30
last_updated_by: Claude (Sonnet 5.5)
---

# Research: Wspólny szkielet strony karty (GH 192)

## Research Question

Które fragmenty `WorksheetGenerator`, `SymmetryGenerator`, `SequenceGenerator`, `SudokuGenerator`, `NonogramGenerator`, `DictationGenerator` są powłoką strony i powtarzają się, czym się różnią i co ogranicza ich wyciągnięcie (labirynt poza `CardSettingsMap`)?

## Summary

Przeczytano w całości `WorksheetGenerator.tsx` i `SymmetryGenerator.tsx` oraz trzy hooki. Cztery pozostałe wyspy sprawdzono grepem i odcinkami (Sudoku 56-110 i 160-235, Nonogram 55-100 i 160-235, Sequence 136-200, Dictation 150-215). W tych sześciu plikach powłoka jest zapisana prawie identycznie, a różnice dają się opisać slotami.

Powtarza się w każdym z sześciu plików:

1. Efekt `has-sheet` / `justify-start` / `justify-center` na `#worksheet-home` zależny od `sheetShown` (`SymmetryGenerator.tsx:49-57`, `WorksheetGenerator.tsx:51-59`; ten sam wzorzec wg grep: Sequence 48-56, Sudoku 58-66, Nonogram 51-59, Dictation 49-57).
2. Stała `GENERATE_FAILED_TEXT` i akapit `role="alert"` z `text-destructive`. Tekst „Nie udało się ułożyć karty." jest w pięciu kartach, „Nie udało się ułożyć tego poziomu." w labiryncie (`WorksheetGenerator.tsx:32`).
3. `<ProfileCorner>` z tym samym zestawem handlerów `onCreated/onChoose/onFavoriteSaved/onDeleted/onClearProfile` (z `memory.corner` w pięciu kartach, z `visit.corner` w labiryncie) (`SymmetryGenerator.tsx:155-167`, `WorksheetGenerator.tsx:142-153`). Labirynt nie przekazuje `newProfileCards`.
4. Dwa układy przycisków: z kartą (`print:hidden`: wiersz kontrolek, `RememberedNote`, wiersz Generuj + Drukuj) i bez karty (kontrolki, `RememberedNote`, hero `GenerateButton`, `failedNote`) (`SymmetryGenerator.tsx:168-208`).
5. Guard `if (waitingForChild) return;` w `handleGenerate`, `disabled={waitingForChild}` na obu `GenerateButton` i `handlePrint = window.print()`.
6. `RememberedNote note={memory.note ?? favorite.note} profileActive={activeId !== null}` (w labiryncie `mazeLevelMemory.note`).

Powtarza się w pięciu kartach, nie w labiryncie: łańcuch `useChildProfileVisit` → `useBarCharacter(visit, barLevel)` → `useFavoriteCharacter(visit, bar)`, stan `barLevel` z `visitStart.level` i `applyProfileBar` (`bar.applyBar(next); setBarLevel(next.level)`) (`SymmetryGenerator.tsx:36-40, 98-101`).

## Różnice, które szkielet musi przyjąć

- **Labirynt** (`WorksheetGenerator.tsx`): sam trzyma `character`, `ownImageHref`, `level` w `useState` (39-40, 120-128) i powiela logikę `useBarCharacter` (`handleCharacterSelect`/`handleOwnImage` 89-107 vs `useBarCharacter.ts:44-71`). Poziom pamięta przez `useMazeLevelMemory` (`useCardSettings.ts:135-158`), bez profilu zapisuje `recordBarCharacter(localStorage, null, character, id)` (`WorksheetGenerator.tsx:109-114`). Ma `sheetShown` jako osobny stan obok `maze` (44); pięć kart wyprowadza `sheetShown = card !== null`. Drukuj ma `disabled={maze === null}` (182), czego pięć kart nie ma. Wybór poziomu to lokalny `LevelChoiceControl` z `LevelChoiceRows` (217-254), a karty używają `LevelChoice`.
- **Wiersz kontrolek bez karty** różni się: Symetria, Sekwencje, Sudoku mają `flex flex-wrap items-center justify-center gap-3 max-sm:justify-start`; Dyktando `gap-3` bez `max-sm:justify-start`; labirynt `gap-2`; Nonogram ma układ dwupoziomowy (postać + rozmiar w jednym wierszu, kategoria osobno, `max-sm:gap-2`) (`NonogramGenerator.tsx` ok. 195-205). Wiersz z kartą jest `flex w-full min-w-0 flex-wrap items-center gap-3` we wszystkich sześciu.
- **Zawartość wiersza kontrolek**: Symetria - postać, poziom, kategoria, kolory; Sekwencje - postać, poziom, kolory; Sudoku - `settingsControls` (rozmiar, poziom, symbole, kolory tylko przy kształtach); Nonogram - postać, rozmiar, kategoria, rozwiązanie; Dyktando - postać, poziom, kategoria, rozwiązanie; labirynt - postać, poziom.
- **„Pokaż rozwiązanie”** (`showSolution`) jest tylko w Nonogramie i Dyktandzie i jest zerowane w `generateFor`.
- **Odświeżenie karty przy zmianie ustawienia** (`handleLevelSelect`, `handleSettingChange`, `handleSizeSelect`, `handleProfileSwitch` z własnym porównaniem pól) to reguły karty i zostają w niej.
- **Arkusz** (`<XSheet>`) jest renderowany pod panelem; Nonogram wybiera jeden z dwóch arkuszy wg `card.kind`.

## Ograniczenia

- `src/lib/sheet/print-contract.test.ts:9-24` czyta źródła wszystkich sześciu generatorów, `GeneratorShell.astro`, `CharacterChoiceControl.tsx` i `SpeechBand.tsx`, a dla stron `.astro` sprawdza `<GeneratorShell\b` oraz `<XGenerator client:only="react" />` (linie 91-276). Przeniesienie zapisów `cn("... print:hidden")` do nowego pliku wymaga zmiany listy plików w teście; asercji między liniami 24-90 i 276+ nie czytano. Poprzednia zmiana (`context/archive/2026-10-24-generate-button-shared/plan-brief.md`, „Key Decisions”) zostawiła zapisy `cn(...)` druku w generatorach właśnie z tego powodu.
- Wyspy zostają osobnymi komponentami React ładowanymi w `.astro` z `client:only="react"`.
- `npm test` obejmuje tylko pliki z `src/lib` i `scripts` (`package.json:12`); komponenty React nie mają testów jednostkowych. Są testy e2e w `tests/e2e/` (m.in. `card-settings`, `level-bar`, `phone-layout`, `phone-settings-rows`, `phone-toggle-align`); ich treści nie czytano.
- `CardSettingsMap` nie zawiera labiryntu; poziom labiryntu żyje w polu profilu `level` (`useChildProfileVisit.ts:10-15`, `useCardSettings.ts:135-158`). Issue zabrania wciągania go do mapy.

## Code References

- `src/components/SymmetryGenerator.tsx:35-214` - wzorcowa wyspa karty.
- `src/components/WorksheetGenerator.tsx:34-215` - wyspa labiryntu z własnym stanem postaci i poziomu.
- `src/hooks/useChildProfileVisit.ts:45-144` - profil, `waitingForChild`, `corner`, `visitStart`, `visitCards`.
- `src/hooks/useBarCharacter.ts:19-85` - pasek postaci kart innych niż labirynt.
- `src/hooks/useCardSettings.ts:57-129` - pamięć ustawień karty; `:135-158` - pamięć poziomu labiryntu.
- `src/components/GeneratorShell.astro` - `#worksheet-home` i reguły CSS `.has-sheet`.
- `src/components/GenerateButton.tsx` - wspólny Generuj i `ACTION_BUTTON_CLASS`.
- `src/lib/sheet/print-contract.test.ts:9-24` - pliki czytane przez test druku.

## Architecture Insights

- Powłoka (efekt `has-sheet`, failed-note, dwa układy przycisków, `ProfileCorner`, `RememberedNote`, blokada `waitingForChild`) nie zawiera reguł karty; kandydat na komponent ze slotami (kontrolki, arkusz, `onGenerate`, `failed`, `sheetShown`) i/lub hook łączący `useChildProfileVisit` + `useBarCharacter` + `useFavoriteCharacter` + `barLevel`.
- Labirynt różni się źródłem postaci i poziomu, nie powłoką. Szkielet może przyjmować od strony wywołującej `note`, handlery `ProfileCorner` i opcjonalne `newProfileCards`, bez wiedzy o `CardSettingsMap`.
- Labirynt mógłby użyć `useBarCharacter` (ta sama logika), ale `recordBarCharacter(..., level)` zależy od bieżącego poziomu; to decyzja planu, nie ustalony fakt.

## Historical Context (from prior changes)

- `context/archive/2026-10-24-generate-button-shared/plan-brief.md` - wspólny `GenerateButton`; zapisy `cn(...)` druku zostały w generatorach z powodu `print-contract.test.ts`.
- `context/archive/2026-10-26-card-settings-memory/` - powstanie `useCardSettings` (treści planu nie czytano).

## Related Research

Nie czytano innych `research.md`.

## Open Questions

1. Szkielet jako komponent ze slotami, hook, czy oba (decyzja planu).
2. Czy ujednolicić różnice układu wiersza kontrolek bez karty (zmiana wyglądu poza celem „bez zmian”; e2e `phone-settings-rows` i `phone-layout` mogą je pilnować - niesprawdzone).
3. Czy `print:hidden` paska ma żyć w szkielecie (zmiana `print-contract.test.ts`), czy zostać w wyspach.
4. Czy labirynt ma przejść na `useBarCharacter`, czy zostać przy własnym stanie.
5. Niezbadane: pełne asercje `print-contract.test.ts`, treść e2e, `ProfileCorner.tsx`, `index.astro`.
