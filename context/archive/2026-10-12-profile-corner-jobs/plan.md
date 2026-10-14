# Okno profili rozdziela listę i edycję — Implementation Plan

## Overview

Menu rogu pokazuje naraz zadania, które produkt już rozdziela — wybór dziecka, zmianę jego ulubionej postaci, usunięcie i dodanie. Od pierwszego profilu róg otwiera listę. Ołówek „Edytuj” przy innym dziecku wybiera je i zostawia otwartą edycję tylko tego profilu. „Anuluj” wraca na listę i porzuca szkic. Udany „Zapisz” wraca na listę.

## Current State Analysis

Na `/` jeden `Dialog` w `ProfileCorner` (`src/components/WorksheetGenerator.tsx:480-684`) podmienia treść: `menu`, `form`, `delete`, `switch`, `favorite-list`, `draft-list`. Przy dwóch i więcej imionach `menu` (`:568-607`) to wiersz imienia i kosz z tooltipem „Usuń”. Pod listą, także przy jednym dziecku, siedzą postać, „Zapisz” (`:614-629`), a przy jednym dziecku jeszcze pełny wiersz „Usuń” (`:632-640`). „Dodaj profil” jest na dole (`:642-649`).

Klik innego imienia przy szkicu różnym od zapisanej ulubionej otwiera „Zapisz i przełącz” / „Przełącz bez zapisu” (`:294-304`, `:533-556`). Zamknięcie okna i „Dodaj profil” porzucają szkic bez pytania (`:248-255`, `:280-284`). Kosz woła `openDelete` i nie wybiera dziecka (`:309-313`). Potwierdzenie jest kolejnym widokiem tego samego dialogu (`:512-531`). Okno nie ma krzyżyka (`:496`).

Zero profili otwiera formularz imienia (`:271-272`). „Utwórz” zamyka okno i ustawia nowy profil jako aktywny (`:474-477`). `openingVisit` przy jednym profilu nie pyta, przy dwóch i więcej otwiera róg bez aktywnego dziecka (`src/lib/child-profiles.ts:87-97`). Pasek po udanym zapisie bierze `barAfterFavoriteSave` (`:83-85`): nowa ulubiona wchodzi na pasek tylko wtedy, gdy pasek pokazywał poprzednią ulubioną.

`npm test` nie montuje tego menu. Tooltip kosza jest już w wierszu (`WorksheetGenerator.tsx:588-604`). Plan `profile-row-trash-icon` zostawiał przy jednym dziecku słowo „Usuń”; ten plan to zastępuje wierszem z koszem.

## Desired End State

Od jednego profilu w górę otwarcie rogu pokazuje listę: imię, ikona „Edytuj”, kosz, na dole „Dodaj profil”. Nie ma widoku, na którym widać naraz kilka profili i edycję jednego z nich.

Ołówek przy Zosi, gdy dzieckiem karty jest Antek, zostawia okno otwarte na edycji Zosi i ustawia Zosię oraz jej zapisaną postać na pasku. Ołówek przy już aktywnym dziecku nie rusza paska. „Anuluj” wraca na listę i nie zapisuje szkicu. Udany „Zapisz” wraca na listę. Napisów „Zapisz i przełącz” oraz „Przełącz bez zapisu” nie ma.

### Key Discoveries:

- Cztery zadania siedzą w jednym `menu` (`WorksheetGenerator.tsx:566-649`). Formularz, potwierdzenie, przełączenie i lista postaci są już osobnymi panelami tego samego `DialogContent`.
- Wiersz kosza ma wzorzec do skopiowania: `Button` `ghost` `size="icon"`, `aria-label`, ikona `aria-hidden`, `TooltipContent` (`:588-604`). `Pencil` jest w zainstalowanym `lucide-react`.
- `handleChoose` wybiera dziecko, ustawia pasek na zapisaną postać i zamyka okno (`:288-291`). Ołówek innego dziecka ma wziąć wybór i pasek, a okno zostawić otwarte.
- `barAfterFavoriteSave` (`child-profiles.ts:83-85`) zostawia jednorazową postać paska, gdy pasek nie był poprzednią ulubioną. Ołówek już aktywnego dziecka nie może wołać `onChoose`, bo to starłoby tę postać.
- Brak testu UI tego dialogu. `tests/e2e/seed.spec.ts` klika tylko „Generuj”. Plan testów zostawia „czy rodzic rozumie ekran” przy ręcznym sprawdzeniu.

## What We're NOT Doing

- Osobna strona profili i lista dzieci na stronie labiryntu.
- Zmiana imienia po utworzeniu. Edycja zapisuje tylko ulubioną postać.
- „Usuń” i „Dodaj profil” na widoku edycji. Kosz zostaje na wierszu listy. Przycisk potwierdzenia zostaje słowem „Usuń”, a pytanie zostaje „Usunąć profil {imię}?”.
- Osobne okno potwierdzenia. Potwierdzenie zostaje widokiem tego samego dialogu.
- Ostrzeżenie przy „Anuluj”, przy Escape i przy kliknięciu obok. Szkic wtedy przepada. „Anuluj” nie cofa dziecka wybranego ołówkiem.
- Nowe asercje UI, test Playwright tego menu i zmiany w `src/lib/child-profiles.ts` oraz `src/lib/child-profiles.test.ts`.
- Zmiana `openingVisit`: przy jednym profilu róg sam się nie otwiera, przy dwóch i więcej pytanie na starcie zostaje.
- Nowa zależność i nowy komponent w `src/components/ui`.

## Implementation Approach

Jedna zmiana w `ProfileCorner`. Widok listy zostaje panelem `menu` i obejmuje też jedno dziecko. Dochodzi panel `edit`. Panel `switch` schodzi, bo szkic żyje tylko na edycji, a wyjście z niej szkic porzuca. Magazyn, `withFavorite`, `barAfterFavoriteSave`, `visitAfterDelete` i formularz „Utwórz” zostają. Sprawdzenie automatyczne to lint i dotychczasowe `npm test`. Wygląd jest sprawdzianem ręcznym.

## Critical Implementation Details

- **State sequencing** — Ołówek innego dziecka w jednym przebiegu ustawia szkic na zapisaną postać tego dziecka, woła `onChoose` i panel `edit`, i nie zamyka dialogu. Ołówek dziecka, którego `id` jest już `activeId`, nie woła `onChoose`. Po udanym „Zapisz” nie porzucaj szkicu w tym samym przebiegu: porzucenie czyta jeszcze starą postać profilu i nadpisałoby właśnie zapisany wybór, zanim rodzic wróci na listę.

## Phase 1: Dwa widoki rogu

### Overview

Lista od pierwszego profilu, edycja jednego profilu i zejście ostrzeżenia przełączenia. Pusty róg nadal otwiera formularz imienia.

### Changes Required:

#### 1. Lista od pierwszego profilu

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Rodzic od jednego dziecka w górę widzi same profile: wybór, edycję i usunięcie jako osobne kontrole wiersza oraz dodanie na dole. Postać i „Zapisz” schodzą z tej powierzchni.

**Contract**: Przy co najmniej jednym profilu panel `menu` pokazuje `sortProfiles` tak jak dziś przy dwóch i więcej. Tytuł listy to dostępne „Profil” (`sr-only`), także przy jednym dziecku. Wiersz: przycisk imienia (`aria-pressed`, gdy to aktywne dziecko), potem ikona edycji, potem dotychczasowy kosz. Ikona edycji kopiuje kosz: `ghost`, `size="icon"`, `shrink-0`, `Pencil` z `cn("size-4")` i `aria-hidden`, `aria-label` `Edytuj ${profile.name}` (Zosia → „Edytuj Zosia”), `TooltipContent` dokładnie „Edytuj”. `TooltipProvider` obejmuje listę także przy jednym dziecku. Na liście nie ma `ProfileCharacterControl`, „Zapisz” ani pełnego wiersza „Usuń”. „Dodaj profil” zostaje na dole i otwiera dotychczasowy formularz. Klik wiersza zawsze woła `handleChoose`: wybiera dziecko, ustawia pasek na jego zapisaną postać i zamyka okno, także gdy to dziecko już jest aktywne. `openActiveDelete` i pełny wiersz „Usuń” schodzą. Kosz nadal woła tylko `openDelete`.

#### 2. Edycja jednego profilu

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Ołówek otwiera tylko ten profil, a udany zapis albo „Anuluj” wracają na listę. Jednorazowa postać karty zostaje, gdy ołówek dotyczy dziecka, które już jest aktywne.

**Contract**: Nowy panel `edit`. Widoczny tytuł to imię tego profilu. Dalej `ProfileCharacterControl`, ewentualny błąd zapisu i przyciski „Zapisz” oraz „Anuluj”. Nie ma listy, „Dodaj profil” ani „Usuń”. „Zapisz” jest wyłączony, gdy szkic równa się zapisanej postaci. Ołówek profilu o innym `id` niż `activeId` (także gdy `activeId` jest `null`) ustawia szkic na `profile.character`, woła `onChoose(profile)` i panel `edit`, i nie woła `setProfileOpen(false)`. Ołówek profilu o tym samym `id` ustawia szkic na `activeProfile.character`, czyści błąd zapisu i otwiera `edit` bez `onChoose`. „Anuluj” porzuca szkic (`abandonFavoriteDraft`) i ustawia panel `menu`; nie zmienia `activeId`. Escape i klik obok spoza panelu `delete` dalej zamykają całe okno i porzucają szkic. Udany „Zapisz” zostaje przy `withFavorite`, `writeChildProfiles` i `onFavoriteSaved` z `barAfterFavoriteSave`, potem ustawia panel `menu` i zostawia okno otwarte. Przy `writeChildProfiles` równym `false` panel zostaje `edit`, szkic zostaje, tekst zostaje „Nie udało się zapisać profilu”. Wskazanie postaci z `favorite-list` wraca do `edit`, nie do `menu`. Wskazanie z `draft-list` nadal wraca do `form`.

#### 3. Zejście ostrzeżenia przełączenia

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Szkic nie siedzi już na liście, więc pytanie o zapis przy kliknięciu innego imienia nie ma kiedy wystąpić.

**Contract**: Z typu `ProfilePanel` i z drzewa dialogu schodzi `switch`. Schodzą `pendingSwitch`, `switchError`, `handleSaveAndSwitch` i `handleSwitchWithoutSave`. `handleNameClick` nie porównuje szkicu z zapisaną postacią. W rogu nie ma napisów „Zapisz i przełącz” ani „Przełącz bez zapisu”. `cancelDelete` nadal wraca do `menu` i nie usuwa profilu. `confirmDelete` oraz zamknięcie okna po usunięciu ostatniego profilu zostają.

### Success Criteria:

#### Automated Verification:

- `npm run lint` przechodzi po rozdzieleniu listy i edycji w rogu
- `npm test` przechodzi bez zmian w `src/lib/child-profiles.ts` i `src/lib/child-profiles.test.ts`

#### Manual Verification:

- Przy samej Zosi oraz przy Antku i Zosi lista układa imiona po polsku, przy każdym jest „Edytuj” przed koszem, na dole jest „Dodaj profil”, a nie ma wiersza postaci, „Zapisz” ani pełnego wiersza „Usuń”. Klik wiersza Antka wybiera Antka, ustawia pasek na jego zapisaną postać i zamyka okno, także gdy Antek już był aktywny.
- Antek jest dzieckiem karty. Ołówek przy Zosi zostawia okno otwarte: tytuł Zosia, jej zapisana postać, „Zapisz” i „Anuluj”. Zosia staje się dzieckiem karty, a pasek pokazuje jej zapisaną postać. Gdy nikt nie jest wybrany, ten sam ołówek też wybiera Zosię i włącza Generuj.
- Ołówek przy już aktywnym Antku, gdy pasek pokazuje jednorazową Rakietę, a zapisana ulubiona to Kot, zostawia Rakietę na pasku i w edycji pokazuje Kota.
- Szkic Pies przy zapisanej Kocie: „Anuluj” wraca na listę i nie zapisuje Psa. Dziecko ustawione ołówkiem zostaje aktywne. Jeśli ołówek dotyczył już aktywnego dziecka i pasek miał Rakietę, Rakieta zostaje. Escape oraz klik obok zamykają całe okno i też nie zapisują Psa. Napisów „Zapisz i przełącz” oraz „Przełącz bez zapisu” nie ma.
- Udany „Zapisz” Psa wraca na listę, a profil ma Psa. Pasek bierze Psa tylko wtedy, gdy przed zapisem pokazywał Kota; jednorazowa Rakieta zostaje Rakietą. Lista postaci otwarta z edycji wraca do edycji, nie na listę profili. Gdy zapis się nie uda, edycja zostaje z tekstem „Nie udało się zapisać profilu”.
- Kosz przy Basi nie wybiera Basi i otwiera „Usunąć profil Basia?” z „Anuluj” i słowem „Usuń”. Zero profili otwiera formularz imienia. „Utwórz” zamyka okno i ustawia to dziecko jako aktywne.
- Druk jednej strony A4 nie pokazuje rogu, listy ani edycji.

**Implementation Note**: Po zielonym lint i `npm test` zatrzymaj się na ręcznym sprawdzeniu tych siedmiu punktów, zanim faza zostanie uznana za domkniętą.

---

## Testing Strategy

### Unit Tests:

- Nie dodawaj testu renderującego wyspę. `npm test` nie montuje `WorksheetGenerator`.
- Nie zmieniaj `src/lib/child-profiles.test.ts`. `openingVisit`, `withFavorite`, `barAfterFavoriteSave` i `visitAfterDelete` zostają.

### Integration Tests:

- Brak nowego scenariusza HTTP i brak nowego testu Playwright. `tests/e2e/seed.spec.ts` zostaje przy „Generuj”.

### Manual Testing Steps:

1. Zostań przy samej Zosi. Otwórz róg. Widać wiersz Zosi, „Edytuj” przed koszem i „Dodaj profil”. Nie ma postaci, „Zapisz” ani pełnego „Usuń”.
2. Dodaj Antka. Lista ma Antka przed Zosią, z tymi samymi ikonami. Klik wiersza Antka zamyka okno, a pasek pokazuje zapisaną postać Antka.
3. Ustaw kartę na Antka. Otwórz róg i kliknij ołówek przy Zosi. Okno zostaje. Widać samą Zosię: imię, jej zapisaną postać, „Zapisz”, „Anuluj”. Pasek jest na zapisanej postaci Zosi. Generuj jest włączone.
4. Przy dwóch profilach odśwież stronę, żeby róg zapytał bez aktywnego dziecka i Generuj był wyłączony. Ołówek przy Zosi wybiera Zosię, włącza Generuj i zostawia edycję otwartą.
5. Ustaw Antka jako aktywnego, zapisaną ulubioną na Kota, a pasek karty na Rakietę bez „Zapisz”. Ołówek przy Antku zostawia Rakietę na pasku i pokazuje Kota w edycji.
6. W tej edycji zmień szkic na Psa i kliknij „Anuluj”. Wraca lista, profil Antka zostaje przy Kocie, pasek przy Rakiecie, Antek zostaje aktywny.
7. Wejdź w edycję jeszcze raz, ustaw Psa i zamknij okno Escape oraz, osobno, kliknięciem obok. Pies nie zapisuje się. W całym rogu nie ma „Zapisz i przełącz” ani „Przełącz bez zapisu”.
8. Wejdź w edycję, otwórz listę postaci i wskaż Psa. Wraca edycja, nie lista profili. „Zapisz”. Lista profili wraca, profil ma Psa. Gdy pasek przed zapisem pokazywał Kota, po zapisie pokazuje Psa. Gdy pokazywał Rakietę, zostaje Rakieta.
9. Zablokuj zapis w schowku przeglądarki i kliknij „Zapisz” przy zmienionym szkicu. Edycja zostaje, tekst to „Nie udało się zapisać profilu”.
10. Kosz przy Basi nie zmienia aktywnego dziecka i otwiera „Usunąć profil Basia?” z „Anuluj” i słowem „Usuń”. Anuluj wraca na listę.
11. Usuń profile, aż zostanie zero. Klik „Profil” otwiera formularz imienia. „Utwórz” zamyka okno i ustawia to dziecko. Ponowne otwarcie rogu pokazuje listę z jednym wierszem.
12. Wygeneruj kartę i otwórz podgląd druku jednej strony A4. Rogu, listy i edycji nie ma na stronie.

## Performance Considerations

Lista profili to jedno gospodarstwo na jednym urządzeniu. Dwie ikony SVG na wiersz nie zmieniają czasu otwarcia rogu.

## Migration Notes

Brak migracji. Klucz `printo-kids:child-profiles` i kształt wpisu zostają. Istniejące profile nie wymagają przepisania.

## References

- Brief ramujący: `context/changes/profile-corner-jobs/frame.md`
- Menu rogu: `src/components/WorksheetGenerator.tsx:566-649`
- Wybór i ostrzeżenie przełączenia: `src/components/WorksheetGenerator.tsx:288-307`, `:533-556`
- Kosz i tooltip: `src/components/WorksheetGenerator.tsx:588-604`
- Pasek po zapisie: `src/lib/child-profiles.ts:83-85`
- Pytanie na starcie wizyty: `src/lib/child-profiles.ts:87-97`
- Wymagania: `context/foundation/prd.md` (FR-007–FR-010)
- Poprzedni układ kosza przy jednym dziecku: `context/changes/profile-row-trash-icon/plan.md`
- Issue: #28

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Dwa widoki rogu

#### Automated

- [x] 1.1 `npm run lint` przechodzi po rozdzieleniu listy i edycji w rogu — 0fa2744
- [x] 1.2 `npm test` przechodzi bez zmian w `src/lib/child-profiles.ts` i `src/lib/child-profiles.test.ts` — 0fa2744

#### Manual

- [x] 1.3 Przy samej Zosi oraz przy Antku i Zosi lista układa imiona po polsku, przy każdym jest „Edytuj” przed koszem, na dole jest „Dodaj profil”, a nie ma wiersza postaci, „Zapisz” ani pełnego wiersza „Usuń”. Klik wiersza Antka wybiera Antka, ustawia pasek na jego zapisaną postać i zamyka okno, także gdy Antek już był aktywny. — 0fa2744
- [x] 1.4 Antek jest dzieckiem karty. Ołówek przy Zosi zostawia okno otwarte: tytuł Zosia, jej zapisana postać, „Zapisz” i „Anuluj”. Zosia staje się dzieckiem karty, a pasek pokazuje jej zapisaną postać. Gdy nikt nie jest wybrany, ten sam ołówek też wybiera Zosię i włącza Generuj. — 0fa2744
- [x] 1.5 Ołówek przy już aktywnym Antku, gdy pasek pokazuje jednorazową Rakietę, a zapisana ulubiona to Kot, zostawia Rakietę na pasku i w edycji pokazuje Kota. — 0fa2744
- [x] 1.6 Szkic Pies przy zapisanej Kocie: „Anuluj” wraca na listę i nie zapisuje Psa. Dziecko ustawione ołówkiem zostaje aktywne. Jeśli ołówek dotyczył już aktywnego dziecka i pasek miał Rakietę, Rakieta zostaje. Escape oraz klik obok zamykają całe okno i też nie zapisują Psa. Napisów „Zapisz i przełącz” oraz „Przełącz bez zapisu” nie ma. — 0fa2744
- [x] 1.7 Udany „Zapisz” Psa wraca na listę, a profil ma Psa. Pasek bierze Psa tylko wtedy, gdy przed zapisem pokazywał Kota; jednorazowa Rakieta zostaje Rakietą. Lista postaci otwarta z edycji wraca do edycji, nie na listę profili. Gdy zapis się nie uda, edycja zostaje z tekstem „Nie udało się zapisać profilu”. — 0fa2744
- [x] 1.8 Kosz przy Basi nie wybiera Basi i otwiera „Usunąć profil Basia?” z „Anuluj” i słowem „Usuń”. Zero profili otwiera formularz imienia. „Utwórz” zamyka okno i ustawia to dziecko jako aktywne. — 0fa2744
- [x] 1.9 Druk jednej strony A4 nie pokazuje rogu, listy ani edycji. — 0fa2744
