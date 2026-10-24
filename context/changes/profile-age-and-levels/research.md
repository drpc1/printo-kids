---
date: 2026-10-23T22:57:00+02:00
researcher: Claude
git_commit: 37a93dd80c1ab313cefd50e73164d3b45752266f
branch: claude/jovial-fermat-93aa2c
repository: printo-kids
topic: "S-14: wiek w profilu, poziom osobno dla każdego rodzaju karty, ostatnie parametry osobno, kolory symetrii w profilu"
tags: [research, codebase, child-profiles, last-used, ProfileCorner, useChildProfileVisit, SymmetryGenerator]
status: complete
last_updated: 2026-10-23
last_updated_by: Claude
---

# Research: S-14 — wiek i poziomy w profilu

## Research Question

Jak dziś zapisywane są profile dziecka i ostatnie parametry, co trzeba zmienić, by profil niósł wspólny wiek i ulubioną postać, osobny poziom labiryntu i symetrii oraz kolory symetrii, a ostatnie parametry były osobne dla każdego rodzaju — bez zepsucia zapisanych danych (US-08, FR-017)?

## Summary

Model danych jest dziś jednowymiarowy: `{character, level}`, gdzie `level` to `LevelId` labiryntu. Ten kształt jest wpisany w pięć miejsc: `ChildProfile` i funkcje wokół niego (`src/lib/child-profiles.ts`), `LastUsed` (`src/lib/last-used.ts`), `ProfileBar` w hooku `useChildProfileVisit`, propsy i stan `ProfileCorner` oraz oba generatory. Strona symetrii trzyma poziom (`lat4…lat7`) i kolory wyłącznie w `useState` i celowo nie dotyka profilu ani ostatnich parametrów (`SymmetryGenerator.tsx:21-35`). Odczyt jest tolerancyjny (brakujące lub niepoprawne pole → wartość domyślna), więc nowe pola opcjonalne dadzą się dodać bez migracji danych; zapis zapisuje tylko wymienione pola. Największa praca to uogólnienie `ProfileCorner` i hooka z „jednego paska” na pasek per rodzaj karty oraz nowy panel wieku.

## Detailed Findings

### Zapis profili (`src/lib/child-profiles.ts`)

- Klucz `printo-kids:child-profiles`, wartość `{ "profiles": [...] }` (`:4`, `writeChildProfiles`). Profil: `{id, name, character, level}` (`:11-16`).
- Odczyt `acceptEntry` odrzuca wpis bez poprawnego `id`, z duplikatem `id`, z nieznaną postacią albo złym imieniem; niepoprawny `level` zamienia na `DEFAULT_LEVEL_ID` (`lat5`) zamiast odrzucić wpis. To wzorzec zgodności wstecznej do powtórzenia dla nowych pól.
- `withFavorite(profiles,id,character,level,allowed)` zapisuje tylko postać i poziom labiryntu; `barAfterFavoriteSave` przesuwa pasek, jeśli stał na starej ulubionej. `openingVisit` i `visitAfterDelete` zwracają `{activeId, character, level, ask}`, gdzie `level` jest poziomem labiryntu.
- Reguła otwarcia: zapamiętany aktywny profil → ten profil; `"none"` → ostatnie parametry; jeden profil → on; co najmniej dwa profile bez wyboru → pytanie (`ask`).

### Ostatnie parametry (`src/lib/last-used.ts`)

- Jeden klucz `printo-kids:last-used`, `{character, level}` — parametry labiryntu. Odczyt tolerancyjny (zły `level` → `lat5`, zła postać → `"none"`), zapis tylko dwóch pól.
- Zapisuje je wyłącznie `WorksheetGenerator`, i tylko gdy `activeId === null` (`WorksheetGenerator.tsx:77-89`). Z aktywnym profilem pasek nie zmienia ani profilu, ani ostatnich parametrów (FR-009: profil zmienia tylko jawny zapis).
- Strona symetrii nie czyta ani nie zapisuje ostatnich parametrów.

### Hook odwiedzin (`src/hooks/useChildProfileVisit.ts`)

- `ProfileBar = {character, level}`; `onApply(bar)` jest wołane przy utworzeniu, wyborze, zapisie ulubionych, „Bez profilu” (z `readLastUsed`) i po usunięciu. Hook nie zapisuje ostatnich parametrów (komentarz `:33-36`), zapisuje tylko `active-profile`.
- Start strony: `readVisitStart` → `openingVisit(...)` → `visitStart`.

### ProfileCorner (`src/components/ProfileCorner.tsx`, 631 linii)

- Propsy `barCharacter: CharacterChoice`, `barLevel: LevelId` (labiryntu). Panele: `menu|form|delete|edit|favorite-list|draft-list|favorite-level-list|draft-level-list` (`:40-41`). Edycja pokazuje `ProfileCharacterControl` i `ProfileLevelControl` (poziom labiryntu, `LevelChoiceRows`) oraz Anuluj/Zapisz; formularz tworzenia ma imię, postać, poziom.
- Strona symetrii przekazuje temu komponentowi stan labiryntu z `visitStart`, więc na `/symetria` okno profilu już dziś pokazuje poziom labiryntu (`SymmetryGenerator.tsx:31-32,105-116`).
- `SymmetryLevelChoice.tsx` ma własne wiersze poziomów symetrii i importuje z `ProfileCorner` tylko `DIALOG_ROW_CLASS` — gotowy wzorzec dla wierszy poziomu symetrii w profilu.
- Blokady (`createLock`, `favoriteLock`, `deleteLock`) i `SAVE_ERROR_TEXT` obowiązują każdy nowy zapis.

### Strony generatorów

- `WorksheetGenerator`: `applyProfileBar` ustawia postać i woła `applyLevel`, który przy pokazanej karcie od razu generuje nowy labirynt (`:63-75`).
- `SymmetryGenerator`: `levelId` (domyślnie `lat5`, `symmetry/levels.ts:1`) i `colors` w `useState`; `handleLevelSelect` przy pokazanej karcie od razu generuje nową kartę, o ile `!waitingForChild`; kolory tylko przerysowują tę samą kartę. `applyProfileBar` ustawia tylko pasek labiryntu — tu trzeba podpiąć poziom i kolory.
- Poziomy: labirynt `lat3,lat4,lat5,lat6,lat7,nastolatek` (`maze/levels.ts:3`), symetria `lat4,lat5,lat6,lat7` (`symmetry/levels.ts:3`). Identyfikatory `lat4…lat7` pokrywają się nazwami, ale to dwa różne typy.
- Kolory symetrii z S-15 to kredki z tokenów `--symmetry-*` (`symmetry/colors.ts:11-13`), nie litery jak w tekście PRD US-09. Nie wpływa to na S-14, ale PRD jest tu nieaktualne względem kodu.

### Testy

- `npm test` to jawna lista plików w `package.json` (`scripts.test`), m.in. `child-profiles.test.ts`, `last-used.test.ts`, `active-profile.test.ts`, `symmetry/levels.test.ts`. Nowy plik testowy trzeba dopisać do tej listy. W inspekcji nie znaleziono testów komponentów React; logikę da się pokryć tylko w czystych modułach `src/lib`.

## Code References

- `src/lib/child-profiles.ts:11-16,70-135,190-230` - kształt profilu, `withFavorite`, `openingVisit`, `visitAfterDelete`, `acceptEntry`
- `src/lib/last-used.ts:11-35` - `LastUsed`, odczyt/zapis
- `src/hooks/useChildProfileVisit.ts:8-12,38-80,98-112` - `ProfileBar`, handlery, `readVisitStart`
- `src/components/ProfileCorner.tsx:40-340,548-601` - panele, zapisy, kontrolki postaci i poziomu
- `src/components/SymmetryGenerator.tsx:27-81` - lokalny stan poziomu/kolorów, `applyProfileBar`
- `src/components/WorksheetGenerator.tsx:26-98` - zapis ostatnich parametrów, `applyLevel`
- `src/components/SymmetryLevelChoice.tsx` - wiersze poziomów symetrii
- `src/lib/cards.ts` - `CARD_KINDS` (`labirynt`, `symetria`): naturalny klucz „rodzaju karty”

## Architecture Insights

- Wzorzec: czyste funkcje w `src/lib` + cienkie React; walidacja przy odczycie z domyślnymi, zapis jawny, bez wersjonowanej migracji.
- Jedno okno profilu obsługuje wszystkie strony; wspólne pola (wiek, postać) pasują do niego, a poziom i dodatki per rodzaj wymagają struktury per rodzaj.
- Zgodność wsteczna: stary `level` zostaje poziomem labiryntu (PRD US-08). Wpis bez nowych pól ma się wczytać z wartościami domyślnymi.

## Historical Context

- `context/archive/2026-10-23-symmetry-difficulty-levels/plan.md:5,40` - poziom symetrii żyje tylko w stanie strony; profil i ostatnie parametry wprost odłożone do S-14.
- `context/archive/2026-10-23-symmetry-color-codes/plan.md:32,214` - to samo dla kolorów; „brak zmian zapisanych danych”.
- `context/archive/2026-10-17-profile-level-choice`, `2026-10-08-child-profile-save-delete` - poprzedni kształt zapisu poziomu i ulubionych w profilu.

## Related Research

`context/archive/2026-10-23-symmetry-first-printable/research.md`, `context/archive/2026-10-23-symmetry-difficulty-levels/research.md`.

## Open Questions (do rozstrzygnięcia w planie)

1. **Skala wieku.** Rekomendacja: te same sześć etykiet co poziomy labiryntu (3, 4, 5, 6, 7–8, nastolatek), bo PRD mapuje wiek na „najbliższy poziom”; symetria: 3→4 lata, nastolatek→7 lat.
2. **Kiedy wiek ustawia poziomy.** Rekomendacja: przy tworzeniu profilu wybór wieku podstawia oba poziomy w formularzu (rodzic może je zmienić); w edycji zmiana wieku zmienia tylko szkice poziomów do wyraźnego „Zapisz”.
3. **Co pokazuje okno profilu na każdej stronie.** Rekomendacja: zawsze wszystkie pola (wiek, postać, poziom labiryntu, poziom symetrii, kolory symetrii) — jedno okno, jeden zapis.
4. **Ostatnie parametry symetrii.** Rekomendacja: osobny klucz `printo-kids:last-used:symetria` (poziom + kolory); postać zostaje tylko w parametrach labiryntu.
5. **Wiek starych profili:** brak (`null`), nie zgadywany z poziomu.
6. **Kształt zapisu profilu.** Rekomendacja: płasko — `level` zostaje poziomem labiryntu, dochodzą `age`, `symmetryLevel`, `symmetryColors`; odczyt dalej jednym wzorcem `acceptEntry`.
