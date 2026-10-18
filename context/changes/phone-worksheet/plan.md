# Strona karty na telefonie (S-09) — plan wdrożenia

## Overview

Rodzic na telefonie (375–430 px) i tablecie (768 px) generuje labirynt, widzi kartę i drukuje ją jako jedną stronę A4. Po wygenerowaniu Generuj i Drukuj nie nachodzą na siebie, strona nie przewija się w bok, a przycisk Profil nie zasłania nagłówka ani karty. Geometria karty, `layoutSheet` i `@page` zostają bez zmian. Dowodem są testy Playwright na silnikach Chromium i WebKit oraz ręczny protokół druku w Chrome, Edge, Brave, Firefox i Safari.

## Current State Analysis

- Po wygenerowaniu pasek to jeden rząd bez zawijania: `flex w-full items-center justify-between gap-4` (`src/components/WorksheetGenerator.tsx:134`). Postać i Generuj są w lewej grupie (`:135-145`), Drukuj osobno (`:146-153`). Oba przyciski mają `h-auto rounded-full px-12 py-3.5 text-lg` (`:150`, `:188`), a bazowy `Button` ma `whitespace-nowrap shrink-0` (`src/components/ui/button.tsx:8`).
- Pomiar w oknie 375×812 (research, sekcja „Pomiar na żywo”): Drukuj (x 199–351) zakrywa Generuj (x 221–384), a pasek postaci (x 24–209) nachodzi na Drukuj. `scrollWidth` 384 przy `innerWidth` 375, czyli 9 px poziomego przewijania. Przed generowaniem (kolumna, `:156`) nic nie nachodzi.
- Profil to `fixed top-4 right-4 z-40 max-w-48` (`:487`). Przy przewijaniu leży nad kartą. Po wygenerowaniu `h1` stoi na y 32–64 (`.has-maze` ma `padding-top: 2rem`, `src/components/WorksheetHome.astro:27-39`), a przycisk na y 16–48. Imię profilu może mieć do 40 znaków (`src/lib/child-profiles.ts:2`), więc obcięty do 192 px przycisk może wejść na środkowany nagłówek.
- Viewport: `width=device-width` bez `initial-scale=1` (`src/layouts/Layout.astro:16`). Strona używa `min-h-screen`, czyli 100vh (`WorksheetHome.astro:7`).
- Wiersze w dialogach (profile, lista postaci) mają `h-auto w-full justify-start px-4 py-2 text-lg` (`:542`, `:551`, `:628`, `:637`, `:736`, `:761`), czyli tekst 18 px.
- Playwright ma jeden projekt, `Desktop Chrome` (`playwright.config.ts:26-31`), i jeden test, `tests/e2e/seed.spec.ts`. CI go nie uruchamia (`.github/workflows/ci.yml`).
- Na 791d20e Generuj nic nie robi na domyślnym poziomie `lat5` (`src/lib/maze/levels.ts:1`, research). Poprawka jest w niezacommitowanej pracy w głównym folderze.

## Desired End State

- Minimalna obsługiwana szerokość to 360 px. Węższe okna (np. 320 px) są poza zakresem.
- Poniżej 640 px pasek po wygenerowaniu ma dwa rzędy. Rząd 1 to grupa parametrów: dziś „Postać:”, po S-07 także „Poziom:”. Rząd 2 to Generuj (ikona `Shuffle`) i Drukuj (ikona `Printer`), obok siebie po połowie szerokości, każdy co najmniej 44 px wysokości, tekst 16 px.
- Od 640 px pasek to jeden rząd z dzisiejszymi rozmiarami i tymi samymi ikonami, z zawijaniem. Pasek jest ograniczony kontenerem `max-w-xl` (576 px) na każdym ekranie, więc gdy elementy się nie mieszczą (dłuższa nazwa postaci, „Poziom:” z S-07), Drukuj przechodzi do następnej linii zamiast nachodzić albo wychodzić poza kontener.
- Przy 360, 375, 390 i 768 px `document.documentElement.scrollWidth` jest równe `innerWidth` przed generowaniem i po nim.
- Poniżej 640 px i na każdym urządzeniu dotykowym (`pointer: coarse`, w tym telefon poziomo i tablet) Profil przewija się ze stroną i nie zasłania nagłówka, także przy 40-znakowym imieniu. Na ekranie od 640 px z myszą zostaje przyklejony jak dziś.
- Na telefonie wiersze dialogów mają ten sam rozmiar tekstu co Generuj i Drukuj (16 px, wysokość 44 px). Od 640 px zostają jak dziś.
- PRD obejmuje Brave i doprecyzowuje, że 10 mm dotyczy ścian i ramki labiryntu.
- `npx playwright test` przechodzi na projektach Desktop Chrome, telefon 360 px, Pixel 7, iPhone 13 i tablet 768 px.
- Tabela ręcznego druku w `context/changes/phone-worksheet/manual-checks.md` jest wypełniona dla każdej przeglądarki z zakresu.

### Key Discoveries:

- `src/lib/sheet/print-contract.test.ts:49-53` porównuje dokładne ciągi klas z `print:hidden`, w tym `"flex w-full items-center justify-between gap-4 print:hidden"` dla paska. `:58` sprawdza blok `#worksheet-home.has-maze { padding-top: 2rem; padding-bottom: 2rem; }` w `@media screen`.
- `@media print` ukrywa każdy `#worksheet-home button` (`WorksheetHome.astro:65-70`), więc ikony w przyciskach nie trafiają na wydruk.
- S-07 (`context/changes/maze-difficulty-levels/plan.md:17`, `:200`) dokłada do paska kontrolkę „Poziom:” w stylu „Postać:”, przed Generuj i przy gotowej kartce. Plan S-07 sam odkłada układ telefonu do S-09 (`:44`).
- Niezacommitowany diff w `WorksheetGenerator.tsx` w głównym folderze to `profile-corner-jobs` (status `implementing`). Obejmuje linie ok. 229–610 i nie dotyka paska (`:134-154`), `GenerateButton` (`:178-193`) ani klas triggera Profil (`:487`). Przepisuje jednak wiersze dialogu profili (`:542`, `:551` znikają) i dokłada ikony z tooltipem.
- `test-plan.md:135` już przyjmuje, że góra postaci ok. 1,6 mm od krawędzi kartki przechodzi.
- `lucide-react` 1.45 ma `Shuffle` i `Printer`. `Button` ma wbudowane `gap-2` i rozmiar ikony `size-4`.
- Generator leży w `div.max-w-xl` (`WorksheetHome.astro:9`), więc pasek ma najwyżej 576 px na każdym ekranie od ok. 624 px. Dziś rząd zajmuje ok. 528 px (Postać 185 + Generuj 163 + Drukuj 152 + odstępy 28, pomiar z research), a z ikonami ok. 576 px, czyli bez zapasu.
- `prettier --check` już dziś nie przechodzi na `prd.md`, `test-plan.md` i `roadmap.md` (16, 44 i 64 linie różnicy). lint-staged przeformatuje je przy commicie.

## What We're NOT Doing

- Geometria karty: `layoutSheet`, inset 10 mm, rozmiar i położenie znaku postaci, `@page { size: A4; margin: 0 }`.
- Poprawka generatora na `lat5` i `nastolatek` (`silent-generate-click`, `winding-maze-path`, praca w Cursorze).
- Kontrolka „Poziom:” (S-07). S-09 zostawia tylko dla niej miejsce w rzędzie parametrów.
- Treść i przepływ okna profili (`profile-corner-jobs`), w tym tooltipy „Edytuj”/„Usuń”, których nie widać na ekranie dotykowym.
- Wskazówka przewijania listy postaci i obsługa klawiatury ekranowej w kodzie. Sprawdzamy je tylko ręcznie i naprawiamy wyłącznie realne zasłanianie.
- Playwright w CI. Testy telefonu działają lokalnie.
- Emulacja mobilnego Firefoxa (Playwright jej nie ma). Firefox na Androidzie sprawdzamy tylko ręcznie.
- Wydruk na papierze. Protokół opiera się na podglądzie druku i zapisie do PDF.
- Zmiana wyglądu desktopu poza dodaniem ikon do Generuj i Drukuj oraz zawijaniem paska, gdy brak miejsca.
- Okna węższe niż 360 px.

## Implementation Approach

Zmiany ekranu idą przez klasy Tailwind z prefiksem `sm:` (640 px) i `cn()`, bez nowych kolorów i bez ruszania `@page`. Fazy 1–2 robimy teraz w worktree. Dotykają tylko kodu, którego diff z Cursora nie zmienia. Potem jest bramka: Twoje zmiany są na `main`, a ta gałąź je scala. Dopiero po bramce przychodzą dokumenty (`roadmap.md` i `test-plan.md` zmienia też S-07), wiersze dialogów (kod zmieniony przez `profile-corner-jobs`), testy Playwright (wymagają działającego Generuj na `lat5`) i ręczny druk na wersji, która trafi do użytkowników.

## Critical Implementation Details

- **Kontrakt druku jest testem tekstowym.** Zmiana klas kontenera paska wymaga w tym samym kroku zmiany oczekiwanej listy w `print-contract.test.ts:49-53`. Dodatkowe reguły dla telefonu idą do osobnego bloku w `WorksheetHome.astro`, nie do bloku `#worksheet-home.has-maze` sprawdzanego w `:58`, albo test dostaje nową asercję.
- **Sprawdzenie na żywo przed bramką.** Na 791d20e Generuj nie działa na `lat5`. Do ręcznego sprawdzenia faz 1–2 tymczasowo ustaw `DEFAULT_LEVEL_ID` na `"lat6"` w `src/lib/maze/levels.ts:1`, a po sprawdzeniu cofnij. Przed zamknięciem fazy `git diff --stat` nie może pokazywać `levels.ts`.
- **Numery linii po bramce.** Odwołania do `WorksheetGenerator.tsx` pochodzą z 791d20e. Po scaleniu ProfileCorner przesuwa się o kilkadziesiąt linii. Wiersze dialogów szukaj po klasie `h-auto w-full justify-start px-4 py-2 text-lg`, nie po numerze linii.
- **Commity i scalenie.** Ta gałąź nie dostaje commita ani scalenia bez wyraźnej prośby użytkownika. Nie zmieniamy plików w głównym folderze `printo-kids`.

## Faza 1: Pasek akcji, ikony i overflow

### Overview

Pasek po wygenerowaniu przestaje nachodzić na siebie i nie przewija strony w bok. Generuj i Drukuj dostają ikony.

### Changes Required:

#### 1. Pasek po wygenerowaniu

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Poniżej `sm` pasek składa się z dwóch rzędów: zawijanej grupy parametrów (dziś „Postać:”, po S-07 także „Poziom:”) i rzędu akcji z Generuj i Drukuj po połowie szerokości. Od `sm` zostaje dzisiejszy jeden rząd (parametry i Generuj po lewej, Drukuj po prawej), ale z `flex-wrap`. Pasek ma najwyżej 576 px (`max-w-xl`) na każdym ekranie, więc gdy elementy się nie mieszczą, Drukuj przechodzi do następnej linii, a grupa parametrów zawija się w sobie.

**Contract**: Kontener paska nadal ma `print:hidden` i `w-full`. Grupa parametrów ma `flex-wrap` i `min-w-0`, żeby kolejna kontrolka weszła bez nachodzenia. Na telefonie rząd akcji ma dwa przyciski `flex-1`. Żaden element paska nie ma stałej szerokości większej niż 312 px (360 px minus `px-6`). Na żadnej szerokości od 360 px elementy paska się nie nakładają i nie wychodzą poza kontener.

#### 2. Rozmiar i ikony przycisków

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: `GenerateButton` (w obu tonach, `hero` i `quiet`) i Drukuj mają ikonę przed słowem: `Shuffle` dla Generuj i `Printer` dla Drukuj, z `lucide-react`. Poniżej `sm` przycisk ma `text-base px-6 py-2.5` (wysokość 44 px). Od `sm` zostaje `px-12 py-3.5 text-lg`.

**Contract**: Ikona ma `aria-hidden`, a nazwa dostępna przycisku to słowo „Generuj” albo „Drukuj”, bez zmian, bo `seed.spec.ts` szuka po `getByRole("button", { name })`. Klasy łączy `cn()`.

> Nota z implementacji (2026-10-16, z przeglądu): `ACTION_BUTTON_CLASS` zawiera też `has-[>svg]:px-6` i `sm:has-[>svg]:px-8`, bo bazowy `Button` ma `has-[>svg]:px-3`, które po dodaniu ikony nadpisałoby padding.

> Nota z implementacji (2026-10-14): od `sm` padding to `px-8`, nie `px-12`. Z ikonami i `px-12` rząd potrzebował 396 px + szerokość „Postać:” (157–229 px), więc w 576 px Drukuj zawijał się przy 8 z 12 wyborów. Z `px-8` mieści się każda postać, a przyciski mają prawie dzisiejszą szerokość. Decyzja użytkownika.

> Nota z przeglądu zamykającego (2026-10-18): pasek nie jest już jednym rzędem od `sm`. Zmiana `level-bar-fixes` (1d4cea6, drpc1/printo-kids#45) ustawiła go na każdej szerokości w dwóch rzędach: parametry (`Postać:`, `Poziom:`), pod nimi Generuj i Drukuj. Opis „od `sm` jeden rząd” w Desired End State i w punkcie 1 tej fazy dotyczy stanu przed tą zmianą.

#### 3. Kontrakt druku

**File**: `src/lib/sheet/print-contract.test.ts`

**Intent**: Oczekiwana lista klas z `print:hidden` odpowiada nowemu kontenerowi paska. Pozostałe dwa wpisy zostają.

**Contract**: `classNamesContaining(generator, "print:hidden")` zwraca nowy ciąg klas paska, `"flex flex-col items-center gap-6 print:hidden"` i `"max-h-[calc(100dvh-2rem)] overflow-y-auto print:hidden"`, w kolejności z pliku.

### Success Criteria:

#### Automated Verification:

- Testy produktu przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Sprawdzenie typów przechodzi: `npx astro check`
- Build przechodzi: `npm run build`

#### Manual Verification:

- Przy 360×780, 375×812 i 390×844 po wygenerowaniu (tymczasowo `lat6`) Generuj, Drukuj i „Postać:” nie nachodzą na siebie, a każdy przycisk ma co najmniej 44 px wysokości
- Przy 360, 375, 390 i 768 px `document.documentElement.scrollWidth` jest równe `innerWidth` przed generowaniem i po nim
- Przy 640 i 1280 px z najdłuższą nazwą postaci pasek ma ikony `Shuffle` i `Printer` przed słowami, a jego elementy nie nachodzą na siebie i nie wychodzą poza kontener; gdy brak miejsca, Drukuj jest w następnej linii
- Podgląd druku w Chrome na desktopie nie pokazuje paska ani ikon
- `levels.ts` jest z powrotem na `lat5` i nie występuje w `git diff --stat`

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie użytkownika przed fazą 2.

---

## Faza 2: Przycisk Profil i viewport

### Overview

Profil nie leży nad kartą i nagłówkiem na telefonie. Strona ma jawną skalę początkową i wysokość liczoną od widocznego obszaru.

### Changes Required:

#### 1. Pozycja przycisku Profil

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Trigger Profil ma pozycję `absolute` (przewija się ze stroną) poniżej `sm` i na każdym urządzeniu dotykowym, także na telefonie poziomo (np. 844×390) i tablecie. `fixed` zostaje tylko od `sm` przy wskaźniku precyzyjnym (mysz). Reszta klas (`top-4 right-4 z-40 max-w-48`, obcinanie imienia) bez zmian.

**Contract**: Zmienia się tylko lista klas triggera w `ProfileCorner`: bazowo `absolute`, `fixed` tylko przy złożeniu wariantów `sm:` i `pointer-fine:` z Tailwind 4. Kod dialogu zostaje nietknięty, żeby nie wchodzić w diff `profile-corner-jobs`.

> Nota z implementacji (2026-10-16, z przeglądu): po refaktorze na `main` (drpc1/printo-kids#31) `ProfileCorner` jest w `src/components/ProfileCorner.tsx`, więc zmiana klas triggera trafiła tam (rebase gałęzi na `origin/main` 2026-10-15). Odstęp nagłówka na telefonie to `padding-top: 3.5rem` (nagłówek ok. 8 px pod przyciskiem Profil).

#### 2. Odstęp nagłówka na telefonie

**File**: `src/components/WorksheetHome.astro`

**Intent**: Po wygenerowaniu (`.has-maze`) poniżej 640 px górny odstęp strony jest taki, że `h1` zaczyna się poniżej dolnej krawędzi przycisku Profil (ok. 48 px od góry). Przed generowaniem `py-20` już to zapewnia.

**Contract**: Nowa reguła w osobnym bloku `@media screen and (max-width: 639px)`, umieszczonym po istniejącym `@media screen`, żeby `print-contract.test.ts:58` nadal znajdował blok `padding-top: 2rem`. Druk bez zmian.

#### 3. Viewport i wysokość strony

**File**: `src/layouts/Layout.astro`, `src/components/WorksheetHome.astro`

**Intent**: Meta viewport to `width=device-width, initial-scale=1`. `<main>` używa `min-h-dvh` zamiast `min-h-screen`, żeby układ przed generowaniem nie był wyższy niż widoczny obszar z paskiem adresu.

**Contract**: `@media print` dalej zeruje `min-height` (`WorksheetHome.astro:55-59`).

### Success Criteria:

#### Automated Verification:

- Testy produktu przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Sprawdzenie typów przechodzi: `npx astro check`
- Build przechodzi: `npm run build`

#### Manual Verification:

- Przy 375×812 z profilem o 40-znakowym imieniu przycisk Profil i `h1` nie nachodzą na siebie przed generowaniem i po nim
- Po przewinięciu do dołu karty na 375 px Profil nie leży nad kartą
- Przy 1280 px z myszą Profil zostaje przyklejony w prawym górnym rogu przy przewijaniu
- Przy 844×390 z emulacją dotyku Profil po przewinięciu do dołu karty nie leży nad kartą
- `levels.ts` jest z powrotem na `lat5` i nie występuje w `git diff --stat`

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie użytkownika. Następny krok to bramka, nie faza 3.

---

## Bramka: scalenie pracy z Cursora

Przed fazą 3 muszą być spełnione warunki:

- Zmiany z głównego folderu (generator, `profile-corner-jobs`, a jeśli zdąży, także S-07) są zacommitowane na `main` przez użytkownika.
- Na wyraźną prośbę użytkownika `main` jest scalony do `claude/pierwsze-zadanie`. Konflikty w `WorksheetGenerator.tsx` rozwiązujemy tak, żeby zostały klasy paska i Profil z faz 1–2 oraz treść dialogu z `profile-corner-jobs`. Jeśli S-07 jest już na `main`, sprawdzamy pasek z kontrolką „Poziom:” przy 360 i 1280 px.
- Po scaleniu `npm test` przechodzi, a Generuj na domyślnym poziomie pokazuje labirynt.

---

## Faza 3: Dokumenty (PRD, plan testów, roadmapa)

### Overview

Zakres przeglądarek obejmuje Brave, a wymaganie marginesu jest jednoznaczne.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: Wpisać Brave obok Chrome, Edge, Firefox i Safari w US-04 (ostatnie kryterium akceptacji) oraz w obu wymaganiach niefunkcjonalnych o przeglądarkach (desktop i telefon). Dopisać, że na iOS Chrome i Brave używają silnika WebKit, więc ich układ odpowiada Safari, a druk sprawdzamy w każdej z nich osobno. Doprecyzować w US-04 i w wymaganiu niefunkcjonalnym „Karta mieści się na jednej stronie A4…”, że margines 10 mm dotyczy ścian i ramki labiryntu, a znak postaci może wejść w ten pas.

**Contract**: Zmieniają się tylko te zdania. Reszta PRD bez zmian.

#### 2. Plan testów i stos testów

**File**: `context/foundation/test-plan.md`, `context/foundation/test-stack.md`

**Intent**: Dopisać Brave do ryzyka 4 (`test-plan.md:42`, `:53`) i do sprawdzianu na koniec projektu (`:135-137`). Dopisać wiersz telefonu: Chrome, Edge, Brave i Firefox na Androidzie oraz Safari, Chrome i Brave na iOS. Zastąpić nieaktualne zdanie „Nie ma Vitest, Jest ani Playwright” (`:74`) stanem faktycznym: Playwright jest, działa lokalnie i nie ma go w CI. W `test-stack.md` zapisać projekty Playwright z fazy 5, gdy powstaną. Ten wpis robi faza 5.

**Contract**: Zasada „1,6 mm przechodzi” (`test-plan.md:135`) zostaje i dostaje odwołanie do doprecyzowanego PRD.

#### 3. Roadmapa

**File**: `context/foundation/roadmap.md`

**Intent**: W S-09 zamknąć niewiadomą o przeglądarkach mobilnych: Chrome, Edge, Brave, Firefox i Safari, plus druk w Chrome i Brave na iOS.

**Contract**: Pole `Status` roadmapy zmieniają tylko skille cyklu (`/10x-plan`, `/10x-implement`, `/10x-archive`).

### Success Criteria:

#### Automated Verification:

- Commit dokumentów przechodzi przez lint-staged (Prettier), a `git diff --word-diff` poza formatowaniem pokazuje tylko zamierzone zdania

#### Manual Verification:

- US-04 i oba wymagania niefunkcjonalne o przeglądarkach wymieniają Brave
- Zdanie o marginesie 10 mm mówi wprost, że dotyczy ścian i ramki labiryntu, a nie znaku postaci

**Implementation Note**: Po fazie 3 zatrzymaj się na ręczne potwierdzenie użytkownika przed fazą 4.

---

## Faza 4: Spójność wierszy w dialogach

### Overview

Na telefonie nic w oknie profili ani na liście postaci nie jest większe od Generuj i Drukuj.

### Changes Required:

#### 1. Wspólna klasa wiersza dialogu

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Wszystkie wiersze dialogów o klasie `h-auto w-full justify-start px-4 py-2 text-lg` (profile, lista postaci, „Dodaj profil”, potwierdzenia) korzystają z jednej stałej w module. Poniżej `sm` stała daje `text-base py-2.5` (44 px), od `sm` `text-lg py-2` (też 44 px).

**Contract**: Wiersze z dodatkowymi klasami (`bg-muted` dla zaznaczenia, `break-words whitespace-normal`, jeśli zostaną po scaleniu) łączą stałą z dodatkami przez `cn()`. Przyciski ikon z `profile-corner-jobs` (`size="icon"`) zostają bez zmian.

> Nota z implementacji (2026-10-16, z przeglądu): stała `DIALOG_ROW_CLASS` jest w `src/components/ProfileCorner.tsx` (po refaktorze z `main`). Obejmuje też czwarty wiersz, imię dziecka na liście profili, nowy z `profile-corner-jobs`. `DialogTitle` zostaje na `text-lg`, bo to nagłówek okna, nie wiersz ani przycisk. Na telefonie wiersze listy postaci (z obrazkiem 40 px) mają 60 px zamiast 56 px.

### Success Criteria:

#### Automated Verification:

- Testy produktu przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Sprawdzenie typów przechodzi: `npx astro check`

#### Manual Verification:

- Przy 375 px tekst wierszy w oknie profili i na liście postaci ma 16 px, a wiersze mają co najmniej 44 px wysokości
- Przy 1280 px dialogi wyglądają jak przed fazą

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie użytkownika przed fazą 5.

---

## Faza 5: Testy telefonu w Playwright

### Overview

Automatyczny dowód, że układ telefonu i tabletu nie nachodzi na siebie i nie przewija się w bok, na silnikach Chromium (Chrome, Edge, Brave, Android) i WebKit (Safari i każda przeglądarka na iOS).

### Changes Required:

#### 1. Projekty Playwright

**File**: `playwright.config.ts`

**Intent**: Obok `chromium` (Desktop Chrome) dodać projekty: wąski telefon (Chromium, okno 360×780, `isMobile` i `hasTouch`), telefon z Androidem (`devices["Pixel 7"]`), iPhone (`devices["iPhone 13"]`, WebKit) i tablet (Chromium, okno 768×1024, `isMobile` i `hasTouch`, żeby przeglądarka zgłaszała `pointer: coarse`).

**Contract**: `webServer`, `baseURL` i reszta konfiguracji bez zmian. `npx playwright test` uruchamia wszystkie projekty, a `--project=<nazwa>` jeden.

> Nota z implementacji (2026-10-15): WebKit z Playwright 1.64 pada przy starcie na Windowsie dewelopera (exit 0xC0EA0002). `iphone-13` jest pomijany na Windowsie (chyba że `E2E_WEBKIT=1`), a wszystkie pięć projektów uruchamia ręczny workflow `.github/workflows/e2e-phone.yml` (`workflow_dispatch`, Ubuntu). To wyjątek od „Playwright w CI” z What We're NOT Doing: tylko na żądanie, nie przy pushu ani PR. Decyzja użytkownika. Lokalnie testy biegną z `E2E_PORT=4398`, bo port 4321 bywa zajęty przez inny serwer.

#### 2. Test układu

**File**: `tests/e2e/phone-layout.spec.ts`

**Intent**: Jeden plik dla wszystkich projektów. Przed generowaniem i po nim: `document.documentElement.scrollWidth <= window.innerWidth`. Po wygenerowaniu prostokąty Generuj, Drukuj i „Postać:” się nie przecinają i mieszczą w szerokości okna. Z profilem o 40-znakowym imieniu, wstawionym przed wejściem przez `addInitScript` do `localStorage` pod `printo-kids:child-profiles`, prostokąty Profil i `h1` się nie przecinają. Na projektach dotykowych (telefony i tablet) po przewinięciu do dołu karty Profil nie przecina SVG „Labirynt”.

**Contract**: Porównanie Profil–SVG odbywa się po przewinięciu do dołu SVG, na prostokątach względem okna (`locator.boundingBox()`), bo we współrzędnych dokumentu te elementy nie przecinają się ani przy `fixed`, ani przy `absolute`. Elementy szukane po roli i nazwie (`getByRole("button", { name: "Generuj" })`, `"Drukuj"`, `"Labirynt"`). Test nie zakłada liczby kontrolek w rzędzie parametrów, więc „Poziom:” z S-07 go nie psuje. Zapisany profil ma format `{ profiles: [{ id, name, character }] }` z `src/lib/child-profiles.ts`.

#### 3. Stos testów

**File**: `context/foundation/test-stack.md`

**Intent**: Zapisać pięć projektów, komendę i to, że Playwright działa lokalnie, bez CI.

**Contract**: Sekcja runnera w `test-stack.md`.

### Success Criteria:

#### Automated Verification:

- Przeglądarki są zainstalowane: `npx playwright install chromium webkit`
- Wszystkie projekty przechodzą: `npx playwright test`
- `seed.spec.ts` przechodzi na projektach z telefonem i tabletem: `npx playwright test seed.spec.ts`
- Testy produktu i lint przechodzą: `npm test` i `npm run lint`

#### Manual Verification:

- Test celowo czerwienieje, gdy na chwilę przywrócić `px-12` bez `sm:` na Generuj albo `fixed` bez wariantów na Profil, a potem zielenieje po cofnięciu

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie użytkownika przed fazą 6.

> Nota z implementacji (2026-10-15): `px-12` bez `sm:` nie jest już widoczną usterką, bo pasek ma `flex-wrap` i za szerokie przyciski schodzą do kolejnego rzędu bez nachodzenia; test słusznie zostaje zielony. Zepsucie paska sprawdzono przywróceniem starego układu bez `flex-wrap` (czerwone na `phone-360` i `pixel-7`). `fixed` na Profilu jest czerwone na `phone-360`, `pixel-7` i `tablet-768` po zmniejszeniu okna testu przewijania do 400 px.

---

## Faza 6: Ręczny druk i dialogi

### Overview

Ręczny dowód FR-005 i FR-013 w każdej przeglądarce z zakresu oraz sprawdzenie dialogów na prawdziwym telefonie.

### Changes Required:

#### 1. Tabela ręcznych sprawdzeń

**File**: `context/changes/phone-worksheet/manual-checks.md`

**Intent**: Tabela z wierszem na przeglądarkę i kolumną na każde kryterium. Komputer: Chrome, Edge, Brave, Firefox (Windows) oraz Safari (macOS). Android: Chrome, Edge, Brave, Firefox. iOS: Safari (układ i druk) oraz Chrome i Brave (tylko druk). Kryteria druku: podgląd druku albo zapis do PDF, marginesy domyślne, nagłówki i stopki wyłączone, dokładnie jedna strona A4, labirynt nieobcięty, co najmniej 10 mm białego pasa wokół ścian labiryntu, „Meta” przy wyjściu, wybrana postać przy starcie. Na telefonie dochodzą kryteria układu: Generuj i Drukuj osobno klikalne, brak przewijania w bok, Profil nie zasłania nagłówka ani karty (także poziomo), strona przed generowaniem nie przewija się przy widocznym pasku adresu (sprawdzenie `min-h-dvh`, którego emulacja nie odtwarza). Do tego wiersz dialogów: dodanie profilu z klawiaturą ekranową (pole imienia widoczne nad klawiaturą), lista postaci przewijana do wszystkich 11 postaci i „Bez postaci”.

**Contract**: Każda komórka to „ok”, „błąd: <opis>” albo „nie sprawdzono: <powód>”. Wpisuje ją osoba, która sprawdzała.

#### 2. Poprawka po błędzie druku

**File**: `src/components/WorksheetHome.astro` (tylko `@media print`)

**Intent**: Jeśli któraś przeglądarka daje drugą stronę albo obcina kartę, poprawka idzie w ramach S-09 tylko wtedy, gdy mieści się w `@media print` i nie zmienia `@page` ani geometrii karty. Inny błąd zapisujemy w tabeli jako znane ograniczenie i przenosimy do nowej zmiany przez `/10x-new`.

**Contract**: `@page { size: A4; margin: 0 }` zostaje bez zmian.

> Nota z implementacji (2026-10-16): Chrome na iOS drukował kartę na dwie strony, ucinając ją na szerokość. iOS ignoruje `@page { margin: 0 }` i dokłada marginesy drukarki, a karta miała sztywne 210 × 297 mm. Poprawka w `@media print`: `#worksheet-home svg { max-width: 100%; max-height: 100vh }`, karta zmniejsza się proporcjonalnie do obszaru druku. Pomiar w Chromium z emulowanym obszarem druku: A4 bez marginesów 210×297 (bez zmian), Letter z marginesami 12,7 mm 190×254, A4 z marginesami 10 mm 190×277. Nowa asercja w `print-contract.test.ts`.

> Nota z implementacji (2026-10-16, decyzja użytkownika; stan końcowy po drpc1/printo-kids#36): zakres fazy 6 rozszerzony o wskazówkę przewijania w oknach (wbrew pozycji „Wskazówka przewijania listy postaci” w What We're NOT Doing). Na telefonie pasek przewijania jest niewidoczny, więc przy wielu profilach lista wyglądała na kompletną. Hook `src/hooks/useScrollEdges.ts` ustawia `data-more-above` / `data-more-below` na przewijanym środku okna w `src/components/ui/dialog.tsx` (`data-slot="dialog-body"`; przewijany środek wprowadził drpc1/printo-kids#34), a klasa `scroll-shadow` w `src/styles/global.css` rysuje wewnętrzny `box-shadow` w kolorze `--scroll-edge: var(--primary)`. Bez `color-mix()` (starszy iOS odrzuca całą regułę) i bez `background-attachment: local` (iOS go nie obsługuje w przewijanym oknie). Działa w każdym oknie aplikacji. Test: „a long profile list marks the edge it can still scroll towards” w `tests/e2e/phone-layout.spec.ts`.

> Nota z implementacji (2026-10-18, decyzja użytkownika): cień przy krawędzi zastąpiony widocznym paskiem przewijania. Na ekranach dotykowych `src/components/ui/dialog.tsx` rysuje własną szynę (`--muted`) z suwakiem (`--muted-foreground`, 6 px) przy prawej krawędzi przewijanego środka okna; hook `src/hooks/useScrollIndicator.ts` (zastępuje `useScrollEdges`) ustawia położenie i wysokość suwaka bezpośrednio w stylu. Natywny pasek na ekranach dotykowych jest ukryty (`scrollbar-width: none`), a na ekranie z myszą ma kolor `--muted-foreground` (`scrollbar-color`). iOS nie pozwala ostylować ani pokazać na stałe natywnego paska, stąd własny. Klasa `scroll-shadow` usunięta. Test: „a long profile list shows a scrollbar the eye can find”.

### Success Criteria:

#### Automated Verification:

- Po ewentualnej poprawce druku testy produktu przechodzą: `npm test`

#### Manual Verification:

- Tabela w `manual-checks.md` ma wynik dla każdej przeglądarki z zakresu
- Każdy wiersz druku ma jedną stronę A4 z labiryntem nieobciętym i co najmniej 10 mm wokół ścian, albo wpis znanego ograniczenia ze wskazaną nową zmianą
- Dialogi na telefonie: pole imienia widoczne przy otwartej klawiaturze, lista postaci pokazuje wszystkie pozycje po przewinięciu
- W Safari na iOS i Chrome na Androidzie strona przed generowaniem nie przewija się w pionie przy widocznym pasku adresu

**Implementation Note**: Po wypełnieniu tabeli i potwierdzeniu użytkownika zmiana jest gotowa do `/10x-impl-review`.

---

## Testing Strategy

### Unit Tests:

- `print-contract.test.ts`: nowy ciąg klas paska i nienaruszony blok `padding-top: 2rem` w `@media screen` (fazy 1–2).
- `layout.test.ts` bez zmian, bo geometria karty się nie zmienia.

### Integration Tests:

- `tests/e2e/phone-layout.spec.ts` na Desktop Chrome, telefonie 360 px, Pixel 7, iPhone 13 i tablecie 768 px: brak przewijania w bok, brak nakładania Generuj, Drukuj, „Postać:”, Profil i `h1`, Profil nad kartą tylko na desktopie z myszą.
- `tests/e2e/seed.spec.ts` na wszystkich projektach.

### Manual Testing Steps:

1. Przed bramką ustaw tymczasowo `lat6`, otwórz stronę w oknach 360×780, 375×812, 844×390 (dotyk) i 1280 px, wygeneruj labirynt i sprawdź pasek, Profil oraz `scrollWidth`. Cofnij `lat6`.
2. Utwórz profil o 40-znakowym imieniu i powtórz krok 1.
3. Po bramce przejdź tabelę `manual-checks.md` na komputerze, Androidzie i iPhonie.

## Performance Considerations

Brak. Zmiany to klasy CSS i dwie ikony SVG z biblioteki, która już jest w paczce.

## Migration Notes

Brak danych do migracji. Zapis profili i ostatnio użytych parametrów bez zmian.

## References

- Research: `context/changes/phone-worksheet/research.md`
- Roadmapa: `context/foundation/roadmap.md` (S-09)
- PRD: `context/foundation/prd.md` (US-04, FR-004, FR-005, FR-013, wymagania niefunkcjonalne)
- Plan S-07 (kontrolka „Poziom:” w pasku): `context/changes/maze-difficulty-levels/plan.md:17`, `:200`
- Kontrakt druku: `src/lib/sheet/print-contract.test.ts:49-53`, `:58`
- Plan testów: `context/foundation/test-plan.md:42`, `:53`, `:74`, `:135-137`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Pasek akcji, ikony i overflow

#### Automated

- [x] 1.1 Testy produktu przechodzą: `npm test` — 0d0dcf2
- [x] 1.2 Lint przechodzi: `npm run lint` — 0d0dcf2
- [x] 1.3 Sprawdzenie typów przechodzi: `npx astro check` — 0d0dcf2
- [x] 1.4 Build przechodzi: `npm run build` — 0d0dcf2

#### Manual

- [x] 1.5 Przy 360×780, 375×812 i 390×844 po wygenerowaniu (tymczasowo `lat6`) Generuj, Drukuj i „Postać:” nie nachodzą na siebie, a każdy przycisk ma co najmniej 44 px wysokości — 0d0dcf2
- [x] 1.6 Przy 360, 375, 390 i 768 px `document.documentElement.scrollWidth` jest równe `innerWidth` przed generowaniem i po nim — 0d0dcf2
- [x] 1.7 Przy 640 i 1280 px z najdłuższą nazwą postaci pasek ma ikony `Shuffle` i `Printer` przed słowami, a jego elementy nie nachodzą na siebie i nie wychodzą poza kontener; gdy brak miejsca, Drukuj jest w następnej linii — 0d0dcf2
- [x] 1.8 Podgląd druku w Chrome na desktopie nie pokazuje paska ani ikon — 0d0dcf2
- [x] 1.9 `levels.ts` jest z powrotem na `lat5` i nie występuje w `git diff --stat` — 0d0dcf2

### Phase 2: Przycisk Profil i viewport

#### Automated

- [x] 2.1 Testy produktu przechodzą: `npm test` — a294998
- [x] 2.2 Lint przechodzi: `npm run lint` — a294998
- [x] 2.3 Sprawdzenie typów przechodzi: `npx astro check` — a294998
- [x] 2.4 Build przechodzi: `npm run build` — a294998

#### Manual

- [x] 2.5 Przy 375×812 z profilem o 40-znakowym imieniu przycisk Profil i `h1` nie nachodzą na siebie przed generowaniem i po nim — a294998
- [x] 2.6 Po przewinięciu do dołu karty na 375 px Profil nie leży nad kartą — a294998
- [x] 2.7 Przy 1280 px z myszą Profil zostaje przyklejony w prawym górnym rogu przy przewijaniu — a294998
- [ ] 2.8 Przy 844×390 z emulacją dotyku Profil po przewinięciu do dołu karty nie leży nad kartą
- [x] 2.9 `levels.ts` jest z powrotem na `lat5` i nie występuje w `git diff --stat` — a294998

### Phase 3: Dokumenty (PRD, plan testów, roadmapa)

#### Automated

- [x] 3.1 Commit dokumentów przechodzi przez lint-staged (Prettier), a `git diff --word-diff` poza formatowaniem pokazuje tylko zamierzone zdania — 0c6901d

#### Manual

- [x] 3.2 US-04 i oba wymagania niefunkcjonalne o przeglądarkach wymieniają Brave — 0c6901d
- [x] 3.3 Zdanie o marginesie 10 mm mówi wprost, że dotyczy ścian i ramki labiryntu, a nie znaku postaci — 0c6901d

### Phase 4: Spójność wierszy w dialogach

#### Automated

- [x] 4.1 Testy produktu przechodzą: `npm test` — 1b93006
- [x] 4.2 Lint przechodzi: `npm run lint` — 1b93006
- [x] 4.3 Sprawdzenie typów przechodzi: `npx astro check` — 1b93006

#### Manual

- [x] 4.4 Przy 375 px tekst wierszy w oknie profili i na liście postaci ma 16 px, a wiersze mają co najmniej 44 px wysokości — 1b93006
- [x] 4.5 Przy 1280 px dialogi wyglądają jak przed fazą — 1b93006

### Phase 5: Testy telefonu w Playwright

#### Automated

- [x] 5.1 Przeglądarki są zainstalowane: `npx playwright install chromium webkit` — 4b14020
- [x] 5.2 Wszystkie projekty przechodzą: `npx playwright test` — 4b14020
- [x] 5.3 `seed.spec.ts` przechodzi na projektach z telefonem i tabletem: `npx playwright test seed.spec.ts` — 4b14020
- [x] 5.4 Testy produktu i lint przechodzą: `npm test` i `npm run lint` — 4b14020

#### Manual

- [x] 5.5 Test celowo czerwienieje, gdy na chwilę przywrócić `px-12` bez `sm:` na Generuj albo `fixed` bez wariantów na Profil, a potem zielenieje po cofnięciu — 4b14020

### Phase 6: Ręczny druk i dialogi

#### Automated

- [ ] 6.1 Po ewentualnej poprawce druku testy produktu przechodzą: `npm test`

#### Manual

- [ ] 6.2 Tabela w `manual-checks.md` ma wynik dla każdej przeglądarki z zakresu
- [ ] 6.3 Każdy wiersz druku ma jedną stronę A4 z labiryntem nieobciętym i co najmniej 10 mm wokół ścian, albo wpis znanego ograniczenia ze wskazaną nową zmianą
- [ ] 6.4 Dialogi na telefonie: pole imienia widoczne przy otwartej klawiaturze, lista postaci pokazuje wszystkie pozycje po przewinięciu
- [ ] 6.5 W Safari na iOS i Chrome na Androidzie strona przed generowaniem nie przewija się w pionie przy widocznym pasku adresu
