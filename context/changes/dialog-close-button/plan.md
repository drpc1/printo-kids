# Przycisk X zamyka dialog po polsku — Implementation Plan

## Overview

Dialog postaci i okno profilu dostają krzyżyk, który zamyka je tak jak Escape. Czytnik słyszy „Zamknij”. Na pytaniu o usunięcie krzyżyk wraca na listę i nic nie kasuje.

## Current State Analysis

`DialogContent` ma krzyżyk domyślnie włączony (`src/components/ui/dialog.tsx:40`, `:57-66`). Ukryty napis to angielskie „Close” (`:65`). Stopka dialogu ma drugi, domyślnie schowany napis „Close” (`:100`).

Oba okna produktu wyłączają krzyżyk: lista postaci na pasku (`src/components/WorksheetGenerator.tsx:207`) i róg profilu (`src/components/ProfileCorner.tsx:295`). Żaden plan w archiwum nie kazał go chować. Zamknięcie jest opisane jako wybór wiersza, „Anuluj”, Escape i klik obok.

W rogu jeden dialog podmienia panele. `handleProfileOpenChange` przy `panel === "delete"` woła `cancelDelete` i nie ustawia `profileOpen` na `false` (`ProfileCorner.tsx:104-107`). Escape i klik obok na tym panelu robią to samo (`:296-308`). Na pozostałych panelach Escape i klik obok zamykają całe okno i porzucają szkic. „Anuluj” w edycji i w formularzu (gdy profil już jest) wraca na listę.

`npm test` nie montuje tych dialogów. `tests/e2e/seed.spec.ts` klika tylko „Generuj”.

## Desired End State

Rodzic widzi w prawym górnym rogu obu okien samą ikonę X. Czytnik nazywa ją „Zamknij”. Klik zamyka dialog postaci bez zmiany wyboru oraz zamyka okno profilu tak jak Escape. Na „Usunąć profil …?” krzyżyk wraca na listę, profil zostaje, okno zostaje otwarte. Krzyżyk nie zasłania ołówka, kosza ani pierwszego wiersza postaci i zostaje w rogu, gdy lista się przewija.

### Key Discoveries:

- Krzyżyk już jest w `DialogContent`. Wystarczy przestać podawać `showCloseButton={false}` i podmienić napis.
- `DialogPrimitive.Close` woła `onOpenChange(false)`. Osłona usuwania w `handleProfileOpenChange` (`ProfileCorner.tsx:105-107`) już zamienia takie zamknięcie w powrót na listę.
- Krzyżyk jest `absolute top-4 right-4` wewnątrz treści z `p-6` (`dialog.tsx:51`, `:60`). Nachodzi na prawy górny róg pierwszego wiersza.
- Oba okna mają `overflow-y-auto` na tym samym elemencie, który pozycjonuje krzyżyk (`WorksheetGenerator.tsx:207`, `ProfileCorner.tsx:294`). Przewinięcie może zabrać X z widocznego rogu.
- Słowa „Zamknij” nie ma w `src/`. Widoczna rezygnacja to „Anuluj”.

## What We're NOT Doing

- Osobny krzyżyk w każdym panelu (lista, edycja, formularz, potwierdzenie).
- Widoczne słowo „Zamknij” obok ikony i tooltip przy krzyżyku.
- Zmiana tego, co robi „Anuluj”, Escape i klik obok.
- Zamknięcie całego okna z pytania o usunięcie.
- Nowy test UI, test Playwright tego krzyżyka i nowy komponent w `src/components/ui`.
- Włączenie schowanej stopki dialogu. Jej napis staje się polski, przycisk zostaje niewidoczny.

## Implementation Approach

Zostaje krzyżyk z `DialogContent`. Faza 1 włącza go na obu oknach i daje mu polską nazwę. Osłona usuwania zostaje, więc X na potwierdzeniu wpada w `cancelDelete` bez nowego handlera. Faza 2 daje mu miejsce w rogu i pilnuje, żeby przewijanie listy go nie zabierało. Sprawdzenie automatyczne to lint, `npx astro check` i dotychczasowe `npm test`. Wygląd i gesty są sprawdzianem ręcznym.

## Critical Implementation Details

- **State sequencing** — Krzyżyk to `DialogPrimitive.Close`, więc woła `onOpenChange(false)`. Na panelu `delete` wczesny powrót w `handleProfileOpenChange` zostaje: `cancelDelete()`, bez `setProfileOpen(false)`. Krzyżyk nie dostaje własnego `onClick`. Przeniesienie go do wnętrza formularza „Utwórz” wysłałoby formularz; zostaje rodzeństwem treści panelu.
- **User experience spec** — Lista może się przewijać, a X zostaje w widocznym prawym górnym rogu. Jeśli `overflow-y-auto` na `DialogContent` zabiera absolutny krzyżyk razem z listą, przewijanie schodzi na treść panelu. Element, który pozycjonuje X, przestaje być polem przewijania.

## Phase 1: Krzyżyk i polska nazwa

### Overview

Oba okna pokazują krzyżyk. Czytnik słyszy „Zamknij”. Usuwanie zostaje przy powrocie na listę.

### Changes Required:

#### 1. Polska nazwa wspólnego krzyżyka

**File**: `src/components/ui/dialog.tsx`

**Intent**: Jedyny napis zamykania w wspólnym dialogu jest po polsku, bo produkt nie ma angielskiego „Close” na powierzchni, którą rodzic obsługuje czytnikiem.

**Contract**: Ukryty tekst krzyżyka (`sr-only`) to dokładnie „Zamknij”. Napis schowanego przycisku w `DialogFooter` to dokładnie „Zamknij”. `showCloseButton` na `DialogContent` zostaje domyślnie `true`. `DialogFooter` zostaje przy domyślnym `showCloseButton = false`. Ikona `XIcon` zostaje, bez widocznego słowa obok.

#### 2. Krzyżyk na dialogu postaci

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Rodzic zamyka listę postaci bez wybierania wiersza, tak jak Escape.

**Contract**: `CharacterChoiceControl` przestaje podawać `showCloseButton={false}`. Wybór wiersza nadal ustawia postać i zamyka okno. Samo zamknięcie, w tym krzyżykiem, nie woła `onSelect` i nie woła `writeLastUsed`.

#### 3. Krzyżyk na oknie profilu

**File**: `src/components/ProfileCorner.tsx`

**Intent**: Rodzic zamyka róg krzyżykiem tak jak Escape. Na pytaniu o usunięcie wraca na listę.

**Contract**: `DialogContent` rogu przestaje podawać `showCloseButton={false}`. Handlery `onEscapeKeyDown`, `onInteractOutside` i `handleProfileOpenChange` zostają. Na `delete` zamknięcie krzyżykiem kończy się w `cancelDelete`: panel `menu`, profil na miejscu, okno otwarte. Na `menu`, `edit`, `form`, `favorite-list` i `draft-list` krzyżyk zamyka całe okno i porzuca szkic, tak jak dzisiejsze Escape. „Anuluj” w edycji i w formularzu (gdy profil już jest) nadal wraca na listę i nie zamyka okna.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Sprawdzenie typów przechodzi: `npx astro check`
- Dotychczasowe testy przechodzą: `npm test`

#### Manual Verification:

- Dialog postaci: X zamyka okno i nie zmienia wybranej postaci. Nazwa dla czytnika to „Zamknij”.
- Menu profilu: X zamyka całe okno.
- Edycja ze szkicem różnym od zapisanej postaci: X zamyka okno i nie zapisuje szkicu. „Anuluj” wraca na listę.
- Formularz z wpisanym imieniem: X zamyka okno i nie tworzy profilu, także gdy inne profile już są.
- Lista postaci otwarta z edycji albo z formularza: X zamyka całe okno profilu.
- Pytanie o usunięcie: X wraca na listę, profil zostaje, okno zostaje otwarte.
- Escape i klik obok zostają jak dziś: poza usuwaniem zamykają okno, na usuwaniu wracają na listę.

**Implementation Note**: Po zielonym sprawdzeniu automatycznym zatrzymaj się na ręczne potwierdzenie tych gestów, zanim ruszysz fazę 2.

---

## Phase 2: Odstęp w rogu

### Overview

Krzyżyk dostaje miejsce w rogu. Nie zasłania kontrolek pierwszego wiersza i nie odjeżdża przy przewijaniu.

### Changes Required:

#### 1. Miejsce na krzyżyk i przewijanie pod nim

**File**: `src/components/ui/dialog.tsx`, `src/components/WorksheetGenerator.tsx`, `src/components/ProfileCorner.tsx`

**Intent**: Na liście profili ołówek i kosz pierwszego wiersza zostają klikalne, a na liście postaci pierwszy wiersz zostaje klikalny. Długa lista przewija się pod krzyżykiem, który zostaje w rogu.

**Contract**: Prostokąt krzyżyka nie przecina ołówka ani kosza pierwszego wiersza profilu i nie przecina pierwszego wiersza postaci. Cel kliknięcia krzyżyka zostaje co najmniej taki, jak ikona `size-4` w obecnym rogu. Klasy dokładamy przez `cn()` z `@/lib/utils`. Gdy przewijanie zabiera X z rogu, `overflow-y-auto` schodzi z elementu, który go pozycjonuje, na treść panelu. Lista nadal przewija się w oknie o `max-h-[calc(100dvh-2rem)]`. Na wydruku krzyżyk zostaje schowany razem z dialogiem.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Sprawdzenie typów przechodzi: `npx astro check`

#### Manual Verification:

- Lista profili: X nie zasłania ołówka ani kosza pierwszego wiersza, a obie ikony nadal się klikają.
- Dialog postaci: X nie zasłania pierwszego wiersza, a ten wiersz nadal wybiera postać.
- Po przewinięciu długiej listy X zostaje w widocznym prawym górnym rogu okna.
- Na szerokości około 360 px punkty 2.3, 2.4 i 2.5 nadal zachodzą.

**Implementation Note**: Po zielonym lint i `astro check` zatrzymaj się na ręczne potwierdzenie rogu, także na wąskim oknie.

---

## Testing Strategy

### Unit Tests:

- Brak nowego testu. `npm test` nie montuje dialogów i po tej zmianie nadal nie montuje. Istniejące pliki z `package.json` mają zostać zielone.

### Integration Tests:

- Brak nowego testu Playwright. `tests/e2e/seed.spec.ts` zostaje przy „Generuj”.

### Manual Testing Steps:

1. Otwórz dialog postaci, zamknij go krzyżykiem i sprawdź, że pasek został przy poprzedniej postaci.
2. Otwórz róg z co najmniej jednym profilem i zamknij menu krzyżykiem.
3. Wejdź w edycję, zmień szkic postaci, zamknij krzyżykiem i sprawdź, że zapisana postać została. Osobno użyj „Anuluj” i sprawdź powrót na listę.
4. W formularzu wpisz imię i zamknij krzyżykiem. Profil nie powstaje.
5. Z edycji albo z formularza otwórz listę postaci i zamknij ją krzyżykiem. Cały róg znika.
6. Otwórz „Usunąć profil …?” i kliknij X. Wracasz na listę, profil jest, okno jest otwarte.
7. Na liście profili i na liście postaci sprawdź, że X nie leży na pierwszej kontrolce. Przewiń długą listę i powtórz na oknie około 360 px.

## Performance Considerations

Krzyżyk nie dotyka generowania labiryntu ani zapisu profilu. Nie ma budżetu wydajności.

## Migration Notes

Brak migracji. Profile w `localStorage` zostają.

## References

- Krzyżyk: `src/components/ui/dialog.tsx:37-70`
- Dialog postaci: `src/components/WorksheetGenerator.tsx:175-221`
- Osłona usuwania: `src/components/ProfileCorner.tsx:104-125`, `:293-309`
- Wcześniejsze zamknięcie bez krzyżyka: `context/archive/2026-10-12-profile-corner-jobs/plan.md` (Escape i klik obok), `context/archive/2026-10-06-child-profile-create-select/plan.md` („Anuluj” i zamknięcie bez „Utwórz”)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Krzyżyk i polska nazwa

#### Automated

- [x] 1.1 Lint przechodzi: `npm run lint`
- [x] 1.2 Sprawdzenie typów przechodzi: `npx astro check`
- [x] 1.3 Dotychczasowe testy przechodzą: `npm test`

#### Manual

- [ ] 1.4 Dialog postaci: X zamyka okno i nie zmienia wybranej postaci. Nazwa dla czytnika to „Zamknij”.
- [ ] 1.5 Menu profilu: X zamyka całe okno.
- [ ] 1.6 Edycja ze szkicem różnym od zapisanej postaci: X zamyka okno i nie zapisuje szkicu. „Anuluj” wraca na listę.
- [ ] 1.7 Formularz z wpisanym imieniem: X zamyka okno i nie tworzy profilu, także gdy inne profile już są.
- [ ] 1.8 Lista postaci otwarta z edycji albo z formularza: X zamyka całe okno profilu.
- [ ] 1.9 Pytanie o usunięcie: X wraca na listę, profil zostaje, okno zostaje otwarte.
- [ ] 1.10 Escape i klik obok zostają jak dziś: poza usuwaniem zamykają okno, na usuwaniu wracają na listę.

### Phase 2: Odstęp w rogu

#### Automated

- [ ] 2.1 Lint przechodzi: `npm run lint`
- [ ] 2.2 Sprawdzenie typów przechodzi: `npx astro check`

#### Manual

- [ ] 2.3 Lista profili: X nie zasłania ołówka ani kosza pierwszego wiersza, a obie ikony nadal się klikają.
- [ ] 2.4 Dialog postaci: X nie zasłania pierwszego wiersza, a ten wiersz nadal wybiera postać.
- [ ] 2.5 Po przewinięciu długiej listy X zostaje w widocznym prawym górnym rogu okna.
- [ ] 2.6 Na szerokości około 360 px punkty 2.3, 2.4 i 2.5 nadal zachodzą.
