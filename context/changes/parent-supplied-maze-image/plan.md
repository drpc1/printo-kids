# Własny plik rodzica jako postać labiryntu — Implementation Plan

## Overview

Rodzic wskazuje własne zdjęcie w oknie „Postać”. Zmniejszona kopia staje przy starcie labiryntu, zostaje w przeglądarce i nie idzie na serwer. Katalog, „Bez postaci” i poziom nastolatka zostają przy dotychczasowych regułach kartki.

## Current State Analysis

Kartka bierze id postaci z katalogu i rysuje `<image href>` tylko dla ścieżki `/characters/<id>.png` (`src/components/WorksheetGenerator.tsx:339-370`). `characterSheetSrc` zwraca `null` dla nieznanego id i dla „Bez postaci” (`src/lib/sheet/character.ts:18-24`). Znacznik 30×30 jest liczony, gdy poziom pokazuje postać i `characterSrc` nie jest `null` (`WorksheetGenerator.tsx:350`, `src/lib/sheet/layout.ts:80-91`). Na `nastolatek` `showCharacter` jest false (`src/lib/maze/levels.ts:74-82`).

Pasek zapisuje ostatnio użyte parametry tylko bez aktywnego profilu (`WorksheetGenerator.tsx:92-97`). „Zapisz” i „Utwórz” zapisują id w profilu (`src/components/ProfileCorner.tsx:257-323`). `acceptEntry` odrzuca całe pole poza `id`, `name`, `character` i `level` (`src/lib/child-profiles.ts:190-221`). Id spoza listy przy odczycie zamienia ostatnio użyte na `none` albo pomija profil (`src/lib/last-used.ts:26-29`, `child-profiles.ts:203-206`). W `src/` nie ma wyboru pliku, płótna ani drugiego magazynu obok trzech kluczy `localStorage`.

## Desired End State

Rodzic otwiera „Postać” na pasku, przy nowym profilu albo przy zapisie ulubionej i wskazuje plik. Na kartce, na poziomie innym niż nastolatek, cały obrazek mieści się w kwadracie 30 mm. Przezroczyste piksele przepuszczają labirynt. JPEG zostaje nieprzezroczysty.

Kopia w przeglądarce ma dłuższy bok co najwyżej 512 px i jest obrócona tak, jak zdjęcie widać w galerii. Plik 200×100 zostaje 200×100. Plik 1024×512 staje się 512×256. Oryginał nie zostaje. Do SVG wchodzi data URL tej kopii.

Bez aktywnego profilu zdjęcie jest na kartce, a po wybraniu Kota kartka pokazuje Kota. Wiersz „Własne zdjęcie” w oknie nadal pokazuje miniaturę, także po odświeżeniu. Kliknięcie wiersza wraca do zdjęcia.

Profil Ala ma ulubionego Kota. Rodzic wskazuje plik na pasku, kartka od razu pokazuje zdjęcie, „Zapisz” nie jest kliknięte. Po odświeżeniu kartka znowu pokazuje Kota, a miniatura zostaje w wierszu. „Zapisz” po wybraniu tego wiersza zapisuje kopię w profilu. Późniejszy plik wskazany przy „Bez profilu” nie podmienia kopii Ali, dopóki ktoś znowu nie zapisze ulubionej.

GIF, plik większy niż 8 × 1024 × 1024 bajtów i plik, którego przeglądarka nie otworzy, zostawiają dotychczasową postać. Okno zostaje otwarte i pokazuje jedno zdanie. HEIC przechodzi, gdy ta przeglądarka go otworzy. Na Chrome surowy HEIC zostawia Kota i pokazuje „Nie da się otworzyć tego pliku.”

Pole `character` trzyma id, w tym `wlasne`. Bajty żyją obok.

### Key Discoveries:

- Trzy listy postaci to jeden komponent `CharacterChoiceRows` (`ProfileCorner.tsx:600-627`). Wybór z paska zamyka okno (`WorksheetGenerator.tsx:288-293`). Wersja robocza nowego profilu i ulubionej nie rusza kartki aż do „Utwórz” albo „Zapisz”.
- `characterRow` dla nieznanego id zwraca „Bez postaci” (`character.ts:26-38`). Samo dopisanie id `wlasne` do odczytu, bez osobnej etykiety, pokazałoby na pasku „Bez postaci”.
- „Zapisz” wychodzi wcześniej, gdy id i poziom są te same (`ProfileCorner.tsx:263-264`, przycisk `ProfileCorner.tsx:421`). Sama podmiana bajtów przy id `wlasne` dziś nic by nie zapisała.
- `withFavorite` kopiuje resztę pól obiektu (`child-profiles.ts:91`), ale kolejny odczyt je gubi, bo `acceptEntry` buduje profil od zera.
- Druk to `window.print()` tego samego SVG (`WorksheetGenerator.tsx:106-108`). Domyślne `preserveAspectRatio` obrazka SVG to `xMidYMid meet`. Wydruku data URL nikt w tym repo nie sprawdził.

## What We're NOT Doing

- Karta symetrii (S-12) i pasek postaci na tej karcie.
- Issue #54: czy nastolatek ma rysować postać. Pasek zostaje aktywny, kartka na tym poziomie rysuje „Start”.
- Wiersz w „At a glance” M-2 i zmiana kotwicy „Labirynt zostaje bez zmian”.
- Biblioteka dekodująca HEIC, IndexedDB, wysyłka pliku na serwer, adres `blob:`.
- Powiększanie pliku mniejszego niż 512 px, kadrowanie do wypełnienia kwadratu, GIF nawet gdy przeglądarka go otworzy.
- Galeria wielu zdjęć. Jest jedna kopia urządzenia i jedna kopia zapisana w profilu.
- Kasowanie kopii urządzenia przy wyborze Kota albo „Bez postaci”.

## Implementation Approach

Czysta funkcja robi kopię: próg rozmiaru, typ, dekodowanie z obrotem galerii, skala w dół, kodowanie. Ekran woła ją i albo zostawia wybór, albo zapisuje wynik.

Są dwa miejsca na bajty. Klucz `printo-kids:own-image` to wiersz w oknie: jedna kopia na urządzenie, widoczna w trzech listach. Pole `image` profilu to migawka z chwili „Utwórz” albo „Zapisz”. Id `wlasne` wchodzi do listy dozwolonych id obok katalogu i nie wchodzi do `CHARACTER_CHOICES`, więc nie dostaje wiersza z plikiem z `public/characters`.

Kartka przy `wlasne` bierze migawkę profilu, jeśli wizyta właśnie ją odtworzyła. Bierze kopię z wiersza, jeśli w tej wizycie rodzic kliknął wiersz albo wskazał plik na pasku, oraz zawsze gdy nie ma aktywnego profilu. Poziom bez postaci rysuje „Start”.

## Critical Implementation Details

- **Znacznik przy `src: null`.** Dziś znacznik wymaga katalogowego `characterSrc`. Dla `wlasne` ta funkcja zostaje przy `null`. Kartka ma narysować data URL, gdy poziom pokazuje postać i wybrana kopia ma href. Inaczej rodzic zobaczy słowo „Start” przy własnym zdjęciu.
- **Etykieta paska.** `characterRow("wlasne")` dziś spada do „Bez postaci”. Pasek i przycisk w oknie profilu biorą etykietę „Własne zdjęcie” i miniaturę tej kopii, która jest na kartce.
- **Zapis ulubionej przy tym samym id.** Gdy w tym oknie rodzic wybrał wiersz albo wskazał nowy plik, „Zapisz” zapisuje bajty także wtedy, gdy id zostało `wlasne`, a poziom się nie zmienił. Samo otwarcie okna i zapis bez tej czynności zostawia poprzednią migawkę profilu.
- **Kolejność odrzucenia.** Próg 8 × 1024 × 1024 bajtów jest przed dekodowaniem. Potem typ. GIF odpada jako zły typ, zanim liczy się to, że przeglądarka umie go otworzyć. HEIC idzie do dekodowania; porażka to „nie da się otworzyć”, nie zły typ. Nieudana kopia nie zapisuje klucza i nie zmienia id.
- **Okno przy błędzie.** Wybór z katalogu zamyka okno. Komunikat o pliku jest wciąż w otwartym oknie „Postać”. „Zmień” i pusty wiersz czekają na wynik, zanim okno zniknie.

## Phase 1: Kopia pliku

### Overview

Powstaje funkcja, która z pliku robi data URL kopii albo powód odmowy. Ekran w tej fazie się nie zmienia.

### Changes Required:

#### 1. Przyjęcie pliku i kopia

**File**: `src/lib/sheet/own-image.ts`

**Intent**: Jedno miejsce decyduje, czy plik wolno zamienić na kopię, która wejdzie do SVG i do przeglądarki.

**Contract**: Wynik to albo `{ href, width, height }`, albo odmowa `size` | `type` | `decode`. Plik o rozmiarze większym niż 8 × 1024 × 1024 bajtów daje `size` i nie jest dekodowany. Rozmiar równy temu progowi przechodzi dalej. JPEG, PNG i WebP są rozpoznawane po bajtach, nie po samej nazwie. GIF i inny nierozpoznany plik dają `type`. HEIC (znacznik `ftyp` z marką HEIC) jest dekodowany; sukces daje kopię, porażka daje `decode`. JPEG, PNG albo WebP, którego przeglądarka nie otworzy, też daje `decode`.

Dekodowanie używa obrotu „jak w galerii”. Dłuższy bok większy niż 512 px schodzi do 512 px, drugi bok zachowuje proporcję i jest zaokrąglony do całkowitej liczby pikseli, co najmniej 1. Dłuższy bok 512 px albo mniejszy zostaje. Bitmapa z jakimkolwiek pikselem o alfie mniejszej niż 255 daje `data:image/png`; w pełni nieprzezroczysta daje `data:image/jpeg`. Testy sprawdzają wymiary i prefiks data URL, nie konkretne bajty JPEG.

#### 2. Testy kopii

**File**: `src/lib/sheet/own-image.test.ts`

**Intent**: Reguły progu, typu, skali, alfy i obrotu mają czerwony test, zanim powstanie ekran.

**Contract**: Plik testowy 1024×512 JPEG kończy się jako 512×256 i `data:image/jpeg`. Plik 200×100 zostaje 200×100. PNG z jednym przezroczystym pikselem kończy się jako `data:image/png` i zachowuje ten piksel. GIF daje `type`. Plik większy niż próg daje `size` i test nie polega na dekodowaniu. Fixture z etykietą orientacji, który bez obrotu ma boki zamienione, po kopii jest w pionie takim jak w galerii. Nowy plik testowy dopisany do skryptu `test` w `package.json`.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, a testy kopii pilnują progu 8 × 1024 × 1024, odmowy GIF, skali 1024×512 → 512×256, zostawienia 200×100, JPEG dla nieprzezroczystej bitmapy, PNG dla przezroczystego piksela i obrotu z etykiety orientacji.
- `npm run lint` przechodzi.
- `npx astro check` przechodzi.

**Implementation Note**: Ta faza nie ma kroku ręcznego. Po zielonych trzech poleceniach można iść do fazy 2.

---

## Phase 2: Wiersz i kartka

### Overview

Wiersz „Własne zdjęcie” jest w trzech listach. Kartka rysuje kopię. Odmowa zostaje w otwartym oknie. Profil dostaje bajty dopiero przy „Utwórz” albo „Zapisz”.

### Changes Required:

#### 1. Id `wlasne` obok katalogu

**File**: `src/lib/sheet/character.ts`

**Intent**: Odczyt profilu i ostatnio użytych ma przyjąć własne zdjęcie, a lista jedenastu postaci zostaje listą plików z `public/characters`.

**Contract**: Wspólna lista dozwolonych id to id z `CHARACTER_CHOICES` plus `wlasne`. `characterSheetSrc("wlasne")` zostaje `null`. `CHARACTER_CHOICES` nie dostaje wiersza `wlasne`. Oba ekrany biorą tę wspólną listę zamiast składać ją tylko z `CHARACTER_CHOICES`.

#### 2. Kopia urządzenia i migawka profilu

**File**: `src/lib/sheet/own-image-store.ts`

**File**: `src/lib/child-profiles.ts`

**File**: `src/lib/last-used.ts`

**Intent**: Bajty nie wchodzą w pole `character`. Wiersz przeżywa wybór Kota. Profil trzyma własną kopię od chwili zapisu.

**Contract**: Klucz `printo-kids:own-image` trzyma JSON `{ href }` z data URL `image/jpeg` albo `image/png`. Zły JSON czyta się jak brak kopii i nic nie zapisuje. Zapis, który rzuci, zwraca porażkę i nie zmienia id. Wybór Kota albo „Bez postaci” tego klucza nie kasuje.

`ChildProfile` dostaje opcjonalne `image`. `acceptEntry` zostawia `image` tylko gdy jest data URL JPEG albo PNG. Inna wartość pola ginie, a profil zostaje. Gdy `character` to `wlasne`, a kopii nie ma albo jest zła, odczyt oddaje profil z postacią `none` i bez `image`. Odczyt sam nie wywołuje `setItem`. `withFavorite` przy id katalogu czyści `image`. Przy `wlasne` zapisuje przekazany href. `last-used` nie zmienia reguły: przyjmuje id z listy, którą dostał. Wizyta, która widzi `wlasne` bez kopii do narysowania, pokazuje `none` i nie nadpisuje zapisu.

#### 3. Wiersz, pasek i kartka

**File**: `src/components/ProfileCorner.tsx`

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Rodzic wskazuje plik tam, gdzie dziś wybiera Kota, a kartka od razu używa kopii na pasku i dopiero po zapisie w profilu.

**Contract**: Wiersz ma etykietę „Własne zdjęcie”. Pusty wiersz otwiera wybór pliku (`accept` obejmuje JPEG, PNG, WebP i HEIC). Wiersz z kopią wybiera `wlasne`; „Zmień” otwiera plik ponownie. Udane wskazanie na pasku zapisuje klucz urządzenia, ustawia id `wlasne` i rysuje tę kopię na istniejącej kartce. Bez aktywnego profilu id idzie do ostatnio użytych, tak jak Kot. Z aktywnym profilem pasek nie zapisuje profilu ani ostatnio użytych.

W formularzu nowego profilu i przy ulubionej udany plik aktualizuje klucz urządzenia i wersję roboczą. Kartka czeka na „Utwórz” albo „Zapisz”. „Utwórz” z roboczym `wlasne` zapisuje w profilu href z klucza urządzenia. „Zapisz” robi to samo, gdy w tym oknie wybrano wiersz albo wskazano plik. Zapis katalogowy czyści `image`. Nieudany zapis profilu zostaje przy tekście „Nie udało się zapisać profilu”.

Odmowa `type` pokazuje „Wybierz plik JPEG, PNG albo WebP.” Odmowa `size` pokazuje „Plik jest większy niż 8 MB.” Odmowa `decode` pokazuje „Nie da się otworzyć tego pliku.” Porażka zapisu klucza urządzenia pokazuje „Nie udało się zachować zdjęcia.” We wszystkich czterech dotychczasowa postać i dotychczasowy href zostają, a okno zostaje otwarte.

`MazeSheet` dostaje href kopii wybranej na kartkę. Element `<image>` ma ten href, dotychczasowe x, y, width, height oraz `preserveAspectRatio="xMidYMid meet"`. Na nastolatku nadal jest „Start”. Generowanie labiryntu nie dostaje bajtów obrazka. Przycisk paska przy `wlasne` czyta się „Postać: Własne zdjęcie” i pokazuje miniaturę kopii z kartki.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi: `character` bywa `wlasne` i nigdy nie zawiera data URL; wybór Kota zostawia klucz urządzenia; profil dostaje `image` przy „Utwórz” i „Zapisz”, a zapis katalogowy je czyści; zła wartość `image` nie usuwa profilu; `wlasne` bez kopii czyta się jako `none` i nic nie zapisuje; dotychczasowe testy ostatnio użytych i profili przechodzą.
- `npx playwright test tests/e2e/own-image.spec.ts` przechodzi: wskazany PNG jest na kartce jako `href` zaczynający się od `data:image/`; Kot zdejmuje go z kartki; ponowne otwarcie „Postać” pokazuje miniaturę; profil Ala z ulubionym Kotem po odświeżeniu ma Kota na kartce i miniaturę w oknie; GIF zostawia Kota, okno zostaje otwarte i widać zdanie o JPEG, PNG albo WebP; żądanie z tej ścieżki nie niesie bajtów obrazka w treści.
- `npm run lint` i `npx astro check` przechodzą.

#### Manual Verification:

- Wydruk z Safari na iPhonie i z jednej przeglądarki na komputerze mieści całe zdjęcie w kwadracie przy starcie, a przezroczyste piksele przepuszczają labirynt.
- Zdjęcie z rolki iPhone’a, zapisane jako HEIC, staje na kartce w Safari.
- Surowy plik HEIC otwarty w Chrome zostawia Kota i w otwartym oknie pokazuje „Nie da się otworzyć tego pliku.”
- Na poziomie nastolatka pasek pozwala wybrać zdjęcie, a kartka pokazuje „Start”.

**Implementation Note**: Po zielonych testach automatycznych zatrzymaj się na ręczne sprawdzenie wydruku, rolki iPhone’a, HEIC w Chrome i nastolatka, zanim zacznie się faza 3.

---

## Phase 3: PRD i Parked

### Overview

Zdania, które mówiły, że własny plik jest poza MVP, schodzą. Kamień M-2 nie dostaje nowego plasterka.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: Dokument produktu mówi to, co strona już robi.

**Contract**: Tytuł US-02 i kryterium „ta historyjka jest poza MVP” opisują wskazanie własnego obrazka, który zostaje w przeglądarce i staje przy starcie. Zdanie non-goal, że MVP nie przyjmuje własnego obrazka, schodzi. US-03 mówi, że ulubiona postać profilu może być tym obrazkiem po „Zapisz”, a postać z katalogu nadal może być ulubioną. Ostatnie zdanie pytania otwartego 3, że plik rodzica zostaje poza MVP, schodzi. Pytanie o prawa do katalogu zostaje otwarte.

#### 2. Roadmapa

**File**: `context/foundation/roadmap.md`

**Intent**: US-02 nie leży już w Parked, a otwarty kamień symetrii ma ten sam indeks.

**Contract**: Bullet „Własny obrazek rodzica (US-02)” schodzi z sekcji Parked. W „At a glance” nie pojawia się wiersz `parent-supplied-maze-image`. Kotwica „Labirynt zostaje bez zmian” zostaje. Pole `updated` w nagłówku roadmapy dostaje datę tej edycji.

### Success Criteria:

#### Manual Verification:

- US-02, non-goal, US-03 i pytanie otwarte 3 brzmią jak kontrakt tej fazy, bullet US-02 zniknął z Parked, „At a glance” nie ma wiersza `parent-supplied-maze-image`, a kotwica M-2 o niezmienionym labiryncie została.

**Implementation Note**: Po edycji przeczytaj te cztery miejsca w PRD i sekcję Parked. To jest bramka ręczna tej fazy.

---

## Testing Strategy

### Unit Tests:

- Próg bajtów przed dekodowaniem, GIF, HEIC który się nie otwiera, skala, brak powiększania, alfa, obrót.
- Odczyt i zapis: id `wlasne`, klucz urządzenia, migawka profilu, zła wartość `image`, brak zapisu przy samym odczycie.
- Dotychczasowe testy listy postaci, ostatnio użytych, profili i układu kartki zostają zielone. `print-contract` nie trzyma dziś href obrazka; nie dokładaj asercji, która wymaga katalogowej ścieżki, gdy kartka rysuje data URL.

### Integration Tests:

- Playwright: PNG na kartce, Kot zdejmuje z kartki i zostawia miniaturę, odświeżenie przy Ali i Kocie, komunikat GIF, brak bajtów obrazka w treści żądania.
- Plik większy niż próg zostaje w teście jednostkowym. Spec może zbudować go w katalogu tymczasowym na czas przebiegu i nie wstawia go do repo.

### Manual Testing Steps:

1. Na telefonie wskaż zdjęcie z rolki, wygeneruj, wydrukuj, sprawdź kwadrat i przezroczystość.
2. Ten sam wydruk na komputerze.
3. W Chrome wskaż surowy HEIC i przeczytaj komunikat.
4. Ustaw nastolatka i sprawdź słowo „Start”.

Mutacja Stryker na granicach progu i skali w `own-image.ts` jest przeglądem tej zmiany, nie bramką fazy. Przeżyły mutant ma sens tylko wtedy, gdy psuje widoczny wynik albo próg 8 MB.

## Performance Considerations

Dekodowanie jednego pliku poniżej progu idzie na wątku strony. Wynik ma dłuższy bok co najwyżej 512 px. Kilka migawek PNG w `localStorage` mieści się w typowym limicie, dopóki zapis się udaje. Gdy `setItem` rzuci, wybór zostaje, a rodzic widzi komunikat.

## Migration Notes

Istniejące klucze `printo-kids:last-used`, `printo-kids:child-profiles` i `printo-kids:active-profile` zostają. Brak `printo-kids:own-image` to pusty wiersz. Stary profil bez `image` czyta się jak dziś. Nie ma skryptu migracji.

## References

- Ustalenia i research: `context/changes/parent-supplied-maze-image/change.md`, `context/changes/parent-supplied-maze-image/research.md`
- Katalog i href: `src/lib/sheet/character.ts:1-38`, `src/components/WorksheetGenerator.tsx:339-370`
- Odczyt, który gubi obce id i obce pola: `src/lib/last-used.ts:26-29`, `src/lib/child-profiles.ts:80-91`, `src/lib/child-profiles.ts:190-221`
- Trzy listy i wczesny return zapisu: `src/components/ProfileCorner.tsx:257-323`, `src/components/ProfileCorner.tsx:600-627`
- Parked i US-02: `context/foundation/roadmap.md:149`, `context/foundation/prd.md:71-81`, `context/foundation/prd.md:95-96`, `context/foundation/prd.md:297`, `context/foundation/prd.md:324`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Kopia pliku

#### Automated

- [x] 1.1 `npm test` przechodzi, a testy kopii pilnują progu 8 × 1024 × 1024, odmowy GIF, skali 1024×512 → 512×256, zostawienia 200×100, JPEG dla nieprzezroczystej bitmapy, PNG dla przezroczystego piksela i obrotu z etykiety orientacji. — f8fe8b1
- [x] 1.2 `npm run lint` przechodzi. — f8fe8b1
- [x] 1.3 `npx astro check` przechodzi. — f8fe8b1

### Phase 2: Wiersz i kartka

#### Automated

- [x] 2.1 `npm test` przechodzi: `character` bywa `wlasne` i nigdy nie zawiera data URL; wybór Kota zostawia klucz urządzenia; profil dostaje `image` przy „Utwórz” i „Zapisz”, a zapis katalogowy je czyści; zła wartość `image` nie usuwa profilu; `wlasne` bez kopii czyta się jako `none` i nic nie zapisuje; dotychczasowe testy ostatnio użytych i profili przechodzą. — af55fc0
- [x] 2.2 `npx playwright test tests/e2e/own-image.spec.ts` przechodzi: wskazany PNG jest na kartce jako `href` zaczynający się od `data:image/`; Kot zdejmuje go z kartki; ponowne otwarcie „Postać” pokazuje miniaturę; profil Ala z ulubionym Kotem po odświeżeniu ma Kota na kartce i miniaturę w oknie; GIF zostawia Kota, okno zostaje otwarte i widać zdanie o JPEG, PNG albo WebP; żądanie z tej ścieżki nie niesie bajtów obrazka w treści. — af55fc0
- [x] 2.3 `npm run lint` i `npx astro check` przechodzą. — af55fc0

#### Manual

- [x] 2.4 Wydruk z Safari na iPhonie i z jednej przeglądarki na komputerze mieści całe zdjęcie w kwadracie przy starcie, a przezroczyste piksele przepuszczają labirynt. — af55fc0
- [x] 2.5 Zdjęcie z rolki iPhone’a, zapisane jako HEIC, staje na kartce w Safari. — af55fc0
- [x] 2.6 Surowy plik HEIC otwarty w Chrome zostawia Kota i w otwartym oknie pokazuje „Nie da się otworzyć tego pliku.” — af55fc0
- [x] 2.7 Na poziomie nastolatka pasek pozwala wybrać zdjęcie, a kartka pokazuje „Start”. — af55fc0

### Phase 3: PRD i Parked

#### Manual

- [x] 3.1 US-02, non-goal, US-03 i pytanie otwarte 3 brzmią jak kontrakt tej fazy, bullet US-02 zniknął z Parked, „At a glance” nie ma wiersza `parent-supplied-maze-image`, a kotwica M-2 o niezmienionym labiryncie została.
