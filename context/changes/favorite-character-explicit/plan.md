# Ulubiona postać zmienia się tylko jawnie Implementation Plan

## Overview

Przy aktywnym profilu postać wybrana na pasku obowiązuje tylko do końca wizyty na stronie karty (tak jest już dziś). Ta zmiana dodaje jawny sposób zapisu: w stopce listy postaci na pasku (każda z sześciu stron kart, także telefon) pojawia się „Tylko na tę kartę” i przycisk „Ustaw jako ulubioną {imię}”, gdy wybrana postać różni się od ulubionej. W oknie profilu znika „Zapisz” i „Anuluj”: wybór ulubionej z listy zapisuje od razu, także własny obrazek. To S-31 z roadmapy M-4 (PRD US-03, US-08, US-22, FR-009). Makieta zaakceptowana 2026-10-27 (opis w `change.md`).

## Current State Analysis

- Wybór postaci na pasku nie rusza ulubionej: `recordBarCharacter` zapisuje „ostatnio użytą” tylko bez profilu (`src/lib/sheet/own-image-store.ts:87`). Bez profilu postać jest wspólna dla kart i to zostaje.
- `CharacterChoiceControl` (`src/components/CharacterChoiceControl.tsx`) to dialog z `CharacterChoiceRows`; wybór zamyka listę. Używają go wszystkie sześć stron (`WorksheetGenerator` dwa razy: przed i po pokazaniu karty). Brak stopki.
- Okno edycji profilu (`src/components/ProfileCorner.tsx`, panel `edit`) trzyma szkic ulubionej (`favoriteDraft`, `favoriteImageHref`, `favoriteImageTouched`, `favoriteError`, `favoriteLock`), przyciski „Anuluj”/„Zapisz” i `handleSaveFavorite` (`withFavorite` + `hrefForFavoriteSave` + `barAfterFavoriteSave` + `onFavoriteSaved`).
- Notka „Zapamiętane dla {imię}” istnieje (`useRememberNote` w `src/hooks/useCardSettings.ts:20`, render `RememberedNote`) i pokazuje się po zmianie ustawienia na pasku.
- Format `localStorage` (profil: `character`, `image` dla `wlasne`, `level`, `cards`) zostaje bez zmian; `withFavorite` zachowuje `cards`.

## Desired End State

- Przy aktywnym profilu lista postaci na pasku ma stopkę, gdy wybrana postać różni się od ulubionej: tekst „Tylko na tę kartę” i przycisk „Ustaw jako ulubioną {imię}”. Klik zapisuje wybraną postać (z obrazkiem, gdy `wlasne`) w profilu, zamyka listę i pokazuje na chwilę „Zapamiętane dla {imię}”. Gdy zapis się nie uda, lista zostaje z komunikatem „Nie udało się zapisać profilu”. Gdy wybrana postać jest ulubioną (także ten sam obrazek), stopki nie ma. Bez profilu stopki nie ma.
- „Różni się” znaczy: inne id postaci, albo oba `wlasne`, ale z innym zdjęciem niż zapisane w profilu.
- Okno profilu (edycja): imię, wiersz ulubionej postaci otwierający listę, zdanie o zasadzie, podsumowanie kart. Bez „Zapisz” i „Anuluj”. Wybór z listy (także skopiowanie własnego obrazka) zapisuje ulubioną od razu i wraca do widoku edycji; błąd zapisu pokazuje komunikat. Formularz tworzenia profilu bez zmian.
- Przy następnym wejściu wraca ulubiona; dawne dane wczytują się jak dotąd.

### Key Discoveries:

- `src/components/WorksheetGenerator.tsx:88-111`: maze trzyma `character`/`ownImageHref` we własnym stanie (nie przez `useBarCharacter`), więc hook oferty musi brać postać i href jako argumenty.
- `src/hooks/useChildProfileVisit.ts:85`: `handleFavoriteSaved` ustawia profile i woła `onApply`; zapis z paska nie powinien zmieniać paska (postać już wybrana), tylko listę profili (`replaceProfiles`).
- `src/lib/child-profiles.ts:86`: `withFavorite` wymaga `level` (zostaje `profile.level`) i dla `wlasne` poprawnego data URL.
- Zapisy czytają profile tuż przed zapisem (`readChildProfiles`), żeby nie nadpisać zmiany z innej otwartej karty; ten sam wzorzec co `useMazeLevelMemory`.

## What We're NOT Doing

- Strona „Jak to działa” (S-32) i wszystko z S-29, co już jest.
- Zmiany formatu danych w `localStorage`; zmiana ustawień kart.
- Przyciski „Anuluj”/„Zapisz” w oknie profilu (znikają) i dodatkowe potwierdzenia poza istniejącą notką „Zapamiętane dla”.
- Zmiana tworzenia profilu (wybór postaci w formularzu zostaje).

## Implementation Approach

Dwie fazy, każda z własnym PR-em. Faza 1: czysta logika (czy postać różni się od ulubionej), hook zapisu, stopka w `CharacterChoiceControl` i podpięcie na sześciu stronach z notką; nowe testy jednostkowe i e2e. Faza 2: uproszczenie okna profilu do zapisu od razu i przepisanie e2e z S-29, które pilnowało „Zapisz”. Faza 1 jest samodzielnie wartościowa (okno profilu działa jak dotąd).

## Phase 1: Stopka „Ustaw jako ulubioną” na pasku

### Overview

Rodzic z aktywnym profilem widzi w liście postaci, że wybór jest tylko na tę kartę, i może go zapisać jako ulubioną jednym kliknięciem.

### Changes Required:

#### 1. Logika w bibliotece

**File**: `src/lib/child-profiles.ts`

**Intent**: Jedno miejsce, które mówi, czy postać paska różni się od ulubionej profilu, żeby pasek i testy miały to samo źródło.

**Contract**: `favoriteDiffers(profile: ChildProfile, character: string, ownImageHref: string | null): boolean`: porównuje z ulubioną w tej postaci, w jakiej pasek ją pokazuje na starcie: zapisane `wlasne` bez poprawnego `image` liczy się jako `none` (jak `drawnVisitCharacter`), więc profil z uszkodzonym obrazkiem nie dostaje stopki od razu po wejściu. Prawda, gdy efektywna ulubiona różni się od `character`, albo oba to `wlasne`, a `ownImageHref !== profile.image`. Zapis wykonuje istniejące `withFavorite(profiles, id, character, profile.level, ALLOWED_CHARACTER_IDS, href)`; bez nowego formatu.

#### 2. Hook oferty ulubionej

**File**: `src/hooks/useFavoriteCharacter.ts` (nowy), `src/hooks/useCardSettings.ts`

**Intent**: Z postaci paska i profilu wylicza ofertę dla stopki i obsługuje zapis, w tym notkę „Zapamiętane dla {imię}”.

**Contract**: `useFavoriteCharacter(visit, bar: { character: SheetCharacterId; ownImageHref: string | null }): { offer: FavoriteOffer | null; note: string | null }`, `FavoriteOffer = { name: string; save: () => boolean }`. `offer` jest `null` bez aktywnego profilu albo gdy `!favoriteDiffers`. `save` czyta profile z `localStorage`, buduje `withFavorite`, zapisuje `writeChildProfiles`, woła `visit.replaceProfiles(next)` (pasek się nie zmienia), pokazuje notkę i zwraca `true`; przy nieudanym zapisie zwraca `false`. `useRememberNote` w `useCardSettings.ts` zostaje wyeksportowane, żeby hook użył tej samej notki i tych samych 2 s.

#### 3. Stopka listy postaci

**File**: `src/components/CharacterChoiceControl.tsx`

**Intent**: Pokazać pod `CharacterChoiceRows` „Tylko na tę kartę” i przycisk „Ustaw jako ulubioną {imię}”, gdy jest oferta; klik woła `save`, zamyka listę, a przy `false` zostawia ją z komunikatem błędu.

**Contract**: nowy opcjonalny prop `favorite?: FavoriteOffer | null`. Stopka jest oddzielona linią od listy, przycisk ma wysokość jak inne wiersze okna (`DIALOG_ROW_CLASS`), kolory tylko z tokenów, `cn()`. Na telefonie stopka zostaje widoczna przy długiej liście: `sticky bottom-0` z tłem `bg-background`, renderowana jako bezpośrednie dziecko `DialogContent` obok `CharacterChoiceRows` (nie w opakowaniu listy, bo sticky działa tylko w obrębie rodzica; przewija wewnętrzny kontener `data-slot=dialog-body`, `dialog.tsx:~58`). `print-contract.test.ts` sprawdza tylko obecność `<CharacterChoiceControl`, więc nowy prop go nie łamie.

#### 4. Podpięcie na stronach

**File**: `src/components/WorksheetGenerator.tsx`, `SymmetryGenerator.tsx`, `SequenceGenerator.tsx`, `SudokuGenerator.tsx`, `NonogramGenerator.tsx`, `DictationGenerator.tsx`

**Intent**: Każda strona woła `useFavoriteCharacter`, przekazuje `offer` do `CharacterChoiceControl` (oba miejsca w labiryncie) i pokazuje jego notkę w istniejącym `RememberedNote` (notka ustawień lub notka ulubionej, jedna naraz).

**Contract**: bez zmiany sygnatur innych komponentów.

#### 5. Testy

**File**: `src/lib/child-profiles.test.ts`, `tests/e2e/favorite-character.spec.ts` (nowy), `package.json` (nowe pliki testów w skrypcie `test`, jeśli dojdą)

**Intent**: Jednostkowo `favoriteDiffers` (zapisane `wlasne` bez obrazka vs pasek `none` = nie różni się; to samo id, inne id, `wlasne` z tym samym i innym zdjęciem, profil bez `image`). E2E: wybór innej postaci pokazuje stopkę i nie zmienia ulubionej po przeładowaniu; klik „Ustaw jako ulubioną” zapisuje (po przeładowaniu wraca nowa), zamyka listę i pokazuje notkę; wybór ulubionej nie pokazuje stopki; bez profilu stopki nie ma; własny obrazek jako ulubiona z paska; na telefonie stopka jest osiągalna przy długiej liście; labirynt i jedna karta z `useBarCharacter`.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy: `npx astro check`
- Build przechodzi: `npm run build`
- E2E (z `E2E_PORT=4399`): `favorite-character`, `phone-layout`, `card-settings`, `catalog`, `profile-summary`, `own-image`, `character-speaks`
- Break-check: zepsucie `favoriteDiffers` albo `save` czerwieni nowe testy

#### Manual Verification:

- Na telefonie (360 px) stopka listy jest widoczna i klikalna, nie zasłania wierszy ani przycisków Generuj i Drukuj
- Teksty po polsku, długie imię w przycisku zawija się

**Implementation Note**: Po fazie i zielonych kontrolach zatrzymaj się na potwierdzenie ręczne przed fazą 2.

---

## Phase 2: Okno profilu bez „Zapisz”

### Overview

Wybór ulubionej w oknie profilu zapisuje od razu; przyciski „Zapisz” i „Anuluj” znikają.

### Changes Required:

#### 1. Okno edycji

**File**: `src/components/ProfileCorner.tsx`

**Intent**: Usunąć szkic i przyciski; z listy `favorite-list` zapisać od razu (także skopiowanie własnego obrazka) i wrócić do panelu edycji z nową postacią.

**Contract**: znikają `favoriteDraft`, `favoriteImageTouched`, `favoriteLock` w obecnej roli, `abandonFavoriteDraft`, `cancelEdit`, `handleSaveFavorite` jako osobny krok; w to miejsce `saveFavorite(id, href)` używające tej samej drogi zapisu co hook (`withFavorite` + `writeChildProfiles` + `onFavoriteSaved`, z `barAfterFavoriteSave`, żeby pasek podążał za zmianą tylko gdy był na starej ulubionej). Błąd zapisu: `role="alert"` „Nie udało się zapisać profilu”. Wiersz postaci pokazuje zawsze zapisaną ulubioną. Wybór tej samej postaci nic nie zapisuje. Funkcje i testy, które przestają być używane (np. `hrefForFavoriteSave`), znikają.

#### 2. Testy

**File**: `tests/e2e/profile-summary.spec.ts`, `src/lib/child-profiles.test.ts`, ewentualnie `tests/e2e/own-image.spec.ts`

**Intent**: Zastąpić asercje o „Zapisz” (wyłączony, osiągalny na telefonie) nowymi: okno nie ma „Zapisz” ani „Anuluj”, wybór postaci w oknie zapisuje od razu (po przeładowaniu), własny obrazek zapisuje się jako ulubiony, na telefonie lista i podsumowanie są osiągalne.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npx astro check`, `npm run build`
- E2E (z `E2E_PORT=4399`): `profile-summary`, `own-image`, `favorite-character`, `phone-layout`, `card-settings`, `catalog`, `character-speaks`
- Break-check: przywrócenie wymogu „Zapisz” albo brak zapisu w `saveFavorite` czerwieni testy

#### Manual Verification:

- Okno profilu na telefonie mieści listę postaci i podsumowanie bez przycisków zapisu
- Własne zdjęcie wybrane w oknie jest ulubioną po odświeżeniu strony

---

## Testing Strategy

### Unit Tests:

- `favoriteDiffers`: id, `wlasne` ze zdjęciem tym samym i innym, brak `image`
- Dawne dane (`character`, `level`, `cards`) wczytują się; zapis ulubionej zachowuje `cards`

### Integration Tests:

- E2E jak w fazach 1–2 na desktopowym Chromium oraz kontrola osiągalności na telefonie

### Manual Testing Steps:

1. Profil z ulubioną Kot, na `/symetria` wybierz Smoka: lista ma „Tylko na tę kartę”; odśwież: wraca Kot
2. „Ustaw jako ulubioną”: notka; odśwież: Smok; w oknie profilu ulubiona Smok
3. Własne zdjęcie z paska jako ulubiona i podmiana zdjęcia

## Performance Considerations

Brak (zapis jednego klucza `localStorage`).

## Migration Notes

Format danych bez zmian; nic do migracji.

## References

- Roadmap: `context/foundation/roadmap.md` (S-31)
- Wzór zapisu z odczytem przed zapisem: `src/hooks/useCardSettings.ts` (`useMazeLevelMemory`)
- Poprzednia zmiana: `context/archive/2026-10-27-profile-window-summary/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Stopka „Ustaw jako ulubioną” na pasku

#### Automated

- [x] 1.1 Testy jednostkowe przechodzą: `npm test` — 2a75fb3
- [x] 1.2 Lint przechodzi: `npm run lint` — 2a75fb3
- [x] 1.3 Typy: `npx astro check` — 2a75fb3
- [x] 1.4 Build przechodzi: `npm run build` — 2a75fb3
- [x] 1.5 E2E (z `E2E_PORT=4399`): `favorite-character`, `phone-layout`, `card-settings`, `catalog`, `profile-summary`, `own-image`, `character-speaks` — 2a75fb3
- [x] 1.6 Break-check: zepsucie `favoriteDiffers` albo `save` czerwieni nowe testy — 2a75fb3

#### Manual

- [x] 1.7 Na telefonie (360 px) stopka listy jest widoczna i klikalna, nie zasłania wierszy ani przycisków Generuj i Drukuj — 2a75fb3
- [x] 1.8 Teksty po polsku, długie imię w przycisku zawija się — 2a75fb3

### Phase 2: Okno profilu bez „Zapisz”

#### Automated

- [ ] 2.1 `npm test`, `npm run lint`, `npx astro check`, `npm run build`
- [ ] 2.2 E2E (z `E2E_PORT=4399`): `profile-summary`, `own-image`, `favorite-character`, `phone-layout`, `card-settings`, `catalog`, `character-speaks`
- [ ] 2.3 Break-check: przywrócenie wymogu „Zapisz” albo brak zapisu w `saveFavorite` czerwieni testy

#### Manual

- [ ] 2.4 Okno profilu na telefonie mieści listę postaci i podsumowanie bez przycisków zapisu
- [ ] 2.5 Własne zdjęcie wybrane w oknie jest ulubioną po odświeżeniu strony
