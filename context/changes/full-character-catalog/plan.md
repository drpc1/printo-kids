# Pełny katalog postaci — plan implementacji

## Overview

Rodzic wybiera dowolną z jedenastu postaci dostarczonego katalogu, na pasku karty i przy profilu. Na wejściu w profilu widać jedną zapisaną postać albo „Bez postaci”. Pełna lista pojawia się po otwarciu tej kontrolki i na krótkim oknie przewija się w środku, więc okno profilu nie rośnie o cały katalog.

## Current State Analysis

Katalog w `src/lib/sheet/character.ts` ma cztery wiersze: „Bez postaci”, Samochodzik, Rakieta, Dinozaur. Osiem plików PNG (Jednorożec, Kot, Pies, Robot, Smok, Strażak, Syrenka, Wróżka) leży w `public/characters/` i nie wchodzi do `CHARACTER_CHOICES`.

Pasek karty jest już jedną kontrolką. Jej dialog nie ma limitu wysokości, więc kolumna dwunastu wysokich wierszy wypadnie za ekran. Profil wkleja tę samą kolumnę w środek okna: przy zapisie ulubionej i przy tworzeniu profilu. Nowy profil startuje od postaci z paska karty (`draftCharacter` w `useState` i w `openCreateForm`).

Zapis ostatniej postaci i profilu przyjmuje dowolne id z listy przekazanej przez wołającego. Aplikacja buduje tę listę z `CHARACTER_CHOICES`. Moduły zapisu nie mają własnej czwórki id.

`src/lib/sheet/character.test.ts` zamyka cztery wiersze i traktuje `smok` jako id spoza katalogu. Testy `last-used` i `child-profiles` mają lokalną listę czterech id i też odrzucają zapisany `smok`, bo nie ma go na tej liście. To jest kontrakt listy przekazanej do funkcji, nie kontrakt katalogu.

### Key Discoveries:

- `CHARACTER_CHOICES` w `src/lib/sheet/character.ts` jest jedyną listą id, etykiet i ścieżek. `WorksheetGenerator` bierze z niej dozwolone id.
- `CharacterChoiceRows` w `src/components/WorksheetGenerator.tsx` rysuje pionową kolumnę przycisków. Ten sam komponent jest na pasku, przy ulubionej i przy tworzeniu profilu.
- Dialog paska (`CharacterChoiceControl`) nie ma `max-h` ani `overflow`. Dialog profilu ma `max-h-[calc(100dvh-2rem)] overflow-y-auto`.
- `CharacterChoiceControl` jest dialogiem i przy `rememberLastUsed` zapisuje ostatnią postać od razu po wyborze. Wybór ulubionej dziś tylko ustawia szkic i czeka na „Zapisz”.
- `handleProfileCreated` ustawia pasek karty na postać utworzonego profilu.
- Plan testów: wyrocznią postaci jest adres pliku, nie migawka pikseli. Playwright nie wchodzi do `npm test` ani do CI.

## Desired End State

Rodzic otwiera „Postać” na pasku i widzi „Bez postaci” oraz jedenaście postaci alfabetycznie po polsku. Na oknie o wysokości telefonu dochodzi do Wróżki przewinięciem tej listy. Wybrana postać stoi przy starcie labiryntu, tak jak dzisiejsze trzy.

W oknie profilu na wejściu jest jedna kontrolka. Przy istniejącym profilu pokazuje zapisaną ulubioną. Przy tworzeniu profilu pokazuje „Bez postaci”. Otwarcie prowadzi do tej samej listy, przewijanej w tym samym oknie. „Zapisz” utrwala ulubioną. „Utwórz” zapisuje postać ze szkicu. Utworzenie bez zmiany kontrolki zapisuje brak postaci i pasek karty przechodzi na „Bez postaci”.

Ostatnio użyta postać i ulubiona postać profilu mogą być dowolnym id z katalogu. Id spoza katalogu dalej wraca do „Bez postaci”.

### Key Discoveries:

- Kolejność katalogu, alfabetycznie po polsku: `none`, `dinozaur`, `jednorozec`, `kot`, `pies`, `rakieta`, `robot`, `samochodzik`, `smok`, `strazak`, `syrenka`, `wrozka`. Etykiety: Bez postaci, Dinozaur, Jednorożec, Kot, Pies, Rakieta, Robot, Samochodzik, Smok, Strażak, Syrenka, Wróżka. Plik: `/characters/{id}.png`, a dla `none` brak pliku.
- Znacznik na karcie zostaje 30 na 30. „Bez postaci” zostawia napis „Start” i nie rysuje obrazka.
- Faza 1 sama dodaje dwanaście wierszy do paska. Profil nadal pokazuje kolumnę, a dialog paska może ucinać listę, dopóki nie wejdzie faza 2.

## What We're NOT Doing

- Poziom trudności zostaje w S-07. Ten plasterek tylko zostawia okno profilu krótkie, z jedną kontrolką na ustawienie.
- Własny obrazek rodzica zostaje przy US-02.
- Układ strony na telefonie (nachodzące się Generuj i Drukuj, labirynt większy niż jedna strona A4) zostaje w S-09.
- Playwright, migawka pikseli i test „czy rodzic rozumie ekran” zostają poza budżetem planu testów.
- Testy `src/lib/last-used.test.ts` i `src/lib/child-profiles.test.ts` zostają przy lokalnej liście czterech id. Zapisany `smok` przy tej liście dalej czyta się jako brak postaci. To nie jest kontrakt katalogu.
- Rozmiar znacznika, geometria karty i druk zostają bez zmian.
- Prawa do publikacji szerszego katalogu zostają otwartym pytaniem PRD. Planowanie ich nie czeka.

## Implementation Approach

Jedna lista `CHARACTER_CHOICES` zasila pasek, profil i dozwolone id zapisu. Faza 1 jest test-first: czerwony kontrakt dwunastu wierszy, potem wiersze i istniejące PNG. Faza 2 jest układem: profil na wejściu ma jedną kontrolkę, otwarta lista przewija się w istniejącym oknie, dialog paska dostaje ten sam limit wysokości co dialog profilu.

Lista w profilu wchodzi w panel tego samego okna. `CharacterChoiceControl` zostaje dialogiem paska. Drugi dialog w środku okna profilu rozjeżdża fokus i przewijanie.

Faza 1: `/10x-tdd full-character-catalog phase 1`. Faza 2: `/10x-implement full-character-catalog phase 2`.

## Critical Implementation Details

### Kolejność testu

W `character.test.ts` `smok` jest dziś przykładem id spoza katalogu. Czerwony test od razu oczekuje smoka w katalogu i przenosi przypadek „spoza katalogu” na `poza-katalogiem`. Inaczej czerwony przebieg myli brak wiersza z regresją nieznanego id.

### Stan formularza

`draftCharacter` startuje z postaci paska w `useState` i drugi raz w `openCreateForm`. Oba miejsca dają `none`. Wybór postaci w profilu nie woła `writeLastUsed`. Utworzenie profilu i tak ustawia pasek na postać profilu przez `handleProfileCreated`, więc profil utworzony bez zmiany kontrolki przełącza kartę na „Bez postaci”.

### Dialog w dialogu

Lista w profilu wchodzi w istniejący panel okna profilu i po wskazaniu wraca do poprzedniego panelu. Szkic imienia zostaje. Przewijanie dialogu paska bierze klasy `max-h-[calc(100dvh-2rem)] overflow-y-auto`, które okno profilu już ma.

## Phase 1: Katalog jedenastu, test-first

### Overview

Kontrakt katalogu obejmuje jedenaście postaci i „Bez postaci”, z etykietą i ścieżką pliku. Kolejność wierszy jest alfabetyczna po polsku. Czerwony test prowadzi dopisanie wierszy. Pliki PNG już leżą na dysku.

### Changes Required:

#### 1. Kontrakt katalogu

**File**: `src/lib/sheet/character.test.ts`

**Intent**: Test ma paść, zanim w katalogu pojawią się nowe wiersze, i przejść, gdy wiersze i pliki się zgadzają.

**Contract**: Oczekiwana lista to dwanaście wierszy w kolejności z Desired End State. `characterSheetSrc("smok")` zwraca `/characters/smok.png`. `characterSheetSrc("poza-katalogiem")` zwraca `null`. `characterRow("poza-katalogiem")` zwraca wiersz `none` z etykietą „Bez postaci”. Dla każdego niepustego `src` plik istnieje pod `public/` plus ta ścieżka. Generator karty woła `characterSheetSrc(` i nie zawiera żadnej ścieżki `/characters/` z katalogu. Asercja ścieżek bierze się z `CHARACTER_CHOICES`, żeby nowy id nie wymagał dopisanej linii.

#### 2. Wiersze katalogu i pliki

**File**: `src/lib/sheet/character.ts`

**Intent**: Katalog publikuje jedenaście postaci, których pliki już są w `public/characters/`.

**Contract**: `CHARACTER_CHOICES` ma dwanaście wierszy w kolejności z Desired End State. Id, etykieta i `src` jak wyżej. `none` zostaje pierwszy, ze `src: null`. `characterSheetSrc` i `characterRow` zostają przy tym samym zachowaniu: znane id zwraca swój wiersz, nieznane id zwraca brak obrazka albo wiersz „Bez postaci”. Pliki `jednorozec.png`, `kot.png`, `pies.png`, `robot.png`, `smok.png`, `strazak.png`, `syrenka.png`, `wrozka.png` wchodzą do zmiany razem z wierszami. Nowych rysunków nie tworzymy.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi: katalog ma „Bez postaci” i jedenaście postaci alfabetycznie po polsku, `smok` wskazuje `/characters/smok.png`, id spoza katalogu wraca do „Bez postaci”, a generator nie powtarza ścieżek plików
- `npm run lint` przechodzi

#### Manual Verification:

- Na pasku karty etykiety Jednorożec, Kot, Pies, Robot, Smok, Strażak, Syrenka i Wróżka pokazują własne obrazki

**Implementation Note**: Po zielonym `npm test` zatrzymaj się na ręczne potwierdzenie obrazków. Faza 1 nie jest końcem plasterka: profil nadal pokazuje kolumnę wierszy, a dialog paska może ucinać listę do fazy 2.

---

## Phase 2: Jedna kontrolka i przewijana lista

### Overview

Profil na wejściu pokazuje jedną postać. Pełna lista otwiera się w tym samym oknie i przewija się na krótkim oknie. Dialog paska dostaje ten sam limit wysokości. Nowy profil startuje od „Bez postaci”.

### Changes Required:

#### 1. Wejście profilu

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Okno profilu ma zostać krótkie, gdy dojdzie poziom trudności i kolejne ustawienia. Na wejściu rodzic widzi zapisaną opcję, a katalog dopiero po otwarciu.

**Contract**: Menu istniejącego profilu pokazuje jedną kontrolkę z etykietą i obrazkiem `favoriteDraft`, zainicjowanego z zapisanej postaci profilu. Nie renderuje `CharacterChoiceRows` na wejściu. „Zapisz” zostaje wyłączony, dopóki szkic równa się zapisanej postaci. Aktywacja kontrolki otwiera listę w panelu tego samego dialogu. Wskazanie wiersza ustawia `favoriteDraft` i wraca do menu. Nie woła `writeLastUsed`, `withFavorite` ani `writeChildProfiles`. Utrwalenie zostaje przy „Zapisz”, a pasek karty zmienia się tylko przez dotychczasowe `barAfterFavoriteSave`: gdy pasek pokazywał poprzednią ulubioną.

#### 2. Tworzenie profilu

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Nowy profil nie dziedziczy postaci z paska, bo nic nie jest jeszcze zapisane.

**Contract**: `draftCharacter` w stanie początkowym i w `openCreateForm` wynosi `none`. Formularz pokazuje jedną kontrolkę „Bez postaci”, nie kolumnę wierszy. Otwarcie listy wraca do formularza z zachowanym szkicem imienia. „Utwórz” zapisuje `draftCharacter`. `handleProfileCreated` zostaje: pasek karty przyjmuje postać utworzonego profilu.

#### 3. Przewijanie otwartej listy

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Na oknie o wysokości telefonu Wróżka jest osiągalna przewinięciem listy, na pasku i w profilu.

**Contract**: `DialogContent` w `CharacterChoiceControl` dostaje `max-h-[calc(100dvh-2rem)] overflow-y-auto` przez `cn()`, obok dotychczasowych klas. Lista zostaje kolumną `CharacterChoiceRows` o dotychczasowym rozmiarze wiersza. Panel listy w oknie profilu korzysta z przewijania, które ten dialog już ma. Klasy łączymy przez `cn()` z `@/lib/utils`.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, a testy ostatniej postaci i profili nadal odrzucają `smok`, gdy nie ma go na przekazanej liście dozwolonych id
- `npm run lint` przechodzi

#### Manual Verification:

- Na oknie o wysokości telefonu lista na pasku i lista w profilu przewijają się do Wróżki, a Wróżka nie zostaje poza ekranem bez przewijania
- Wejście w istniejący profil pokazuje jedną zapisaną postać, nie dwanaście wierszy, a Zapisz jest wyłączony, dopóki postać się nie zmieni
- Nowy profil startuje od „Bez postaci”, a utworzenie bez zmiany przełącza pasek karty na „Bez postaci”
- Zapis ulubionej z katalogu widać po ponownym wejściu, a pasek karty zmienia się tylko wtedy, gdy pokazywał poprzednią ulubioną

**Implementation Note**: Po zielonym `npm test` i `npm run lint` zatrzymaj się na ręczne przejście tych czterech kroków w przeglądarce, na wąskim i krótkim oknie oraz na szerokim. Dopiero one domykają plasterek.

---

## Testing Strategy

### Unit Tests:

- Faza 1 prowadzi `src/lib/sheet/character.test.ts`: pełna lista, ścieżka smoka, `poza-katalogiem` wraca do „Bez postaci”, plik PNG istnieje, generator nie powtarza ścieżek.
- Testy `last-used` i `child-profiles` zostają. Ich lokalna lista czterech id nadal odrzuca `smok`. Aplikacja i tak wpuści smoka, bo przekazuje id z `CHARACTER_CHOICES`.

### Integration Tests:

- Brak nowego testu przeglądarkowego. Playwright zostaje przy istniejącym seedzie i poza CI.

### Manual Testing Steps:

1. Po fazie 1 otwórz pasek „Postać” i porównaj osiem nowych etykiet z obrazkami.
2. Po fazie 2 zwęź okno do wysokości telefonu. Na pasku przewiń do Wróżki, wybierz ją, wygeneruj kartę i sprawdź, że stoi przy starcie.
3. Wejdź w istniejący profil. Na wejściu jest jedna zapisana postać. Otwórz listę, wybierz Smoka, zapisz, wejdź ponownie.
4. Gdy pasek pokazywał poprzednią ulubioną, po zapisie pokazuje Smoka. Gdy pokazywał inną postać, zostaje przy niej.
5. Dodaj profil przy pasku ustawionym na Rakietę. Kontrolka pokazuje „Bez postaci”. Utwórz bez zmiany i sprawdź, że pasek przeszedł na „Bez postaci”.
6. Dodaj drugi profil, w liście wybierz Kota i utwórz. Pasek i ponowne wejście pokazują Kota.
7. Bez profilu wybierz Syrenkę, odśwież stronę. Pasek wraca do Syrenki.

## Performance Considerations

Dwanaście małych PNG w przewijanym dialogu nie zmienia generowania labiryntu ani limitu pięciu sekund. Osobnej pamięci podręcznej nie dokładamy.

## Migration Notes

Zapisane id Samochodzika, Rakiety, Dinozaura i „Bez postaci” zostają poprawne. Aplikacja nie zapisywała smoka jako dozwolonej postaci, więc istniejące dane nie wymagają przepisu. Po rozszerzeniu katalogu id z `CHARACTER_CHOICES` przechodzi odczyt ostatniej postaci i odczyt profilu bez zmiany tych modułów.

## References

- PRD: US-03, FR-012, Business Logic (jedenaście postaci) w `context/foundation/prd.md`
- Roadmapa: S-08 w `context/foundation/roadmap.md`
- Plan testów: ryzyko 3 i anty-wzorzec migawki pikseli w `context/foundation/test-plan.md`
- Katalog: `src/lib/sheet/character.ts`, test `src/lib/sheet/character.test.ts`
- Pasek, profil i szkic: `src/components/WorksheetGenerator.tsx`
- Zapis: `src/lib/last-used.ts`, `src/lib/child-profiles.ts`
- Research i frame dla tego change-id nie powstały

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Katalog jedenastu, test-first

#### Automated

- [x] 1.1 `npm test` przechodzi: katalog ma „Bez postaci” i jedenaście postaci w kolejności z PRD, `smok` wskazuje `/characters/smok.png`, id spoza katalogu wraca do „Bez postaci”, a generator nie powtarza ścieżek plików — ce594eb
- [x] 1.2 `npm run lint` przechodzi — ce594eb

#### Manual

- [x] 1.3 Na pasku karty etykiety Jednorożec, Kot, Pies, Robot, Smok, Strażak, Syrenka i Wróżka pokazują własne obrazki — ce594eb

### Phase 2: Jedna kontrolka i przewijana lista

#### Automated

- [x] 2.1 `npm test` przechodzi, a testy ostatniej postaci i profili nadal odrzucają `smok`, gdy nie ma go na przekazanej liście dozwolonych id
- [x] 2.2 `npm run lint` przechodzi

#### Manual

- [x] 2.3 Na oknie o wysokości telefonu lista na pasku i lista w profilu przewijają się do Wróżki, a Wróżka nie zostaje poza ekranem bez przewijania
- [x] 2.4 Wejście w istniejący profil pokazuje jedną zapisaną postać, nie dwanaście wierszy, a Zapisz jest wyłączony, dopóki postać się nie zmieni
- [x] 2.5 Nowy profil startuje od „Bez postaci”, a utworzenie bez zmiany przełącza pasek karty na „Bez postaci”
- [x] 2.6 Zapis ulubionej z katalogu widać po ponownym wejściu, a pasek karty zmienia się tylko wtedy, gdy pokazywał poprzednią ulubioną
