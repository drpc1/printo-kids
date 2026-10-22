# Większe pola dotyku Profilu i krzyżyka — plan implementacji

## Overview

Na wskaźniku dotykowym przycisk Profilu jest za niski, a krzyżyk w oknie ma pole równe ikonie 16 px. Ta zmiana podnosi Profil do co najmniej 44 px wysokości tylko na `pointer-coarse` i daje krzyżykowi pole 44×44 px. Na dotyku prawa krawędź ikony spotyka się z prawą krawędzią rysowanej szyny. Na myszce pole też ma 44 px, a prawa krawędź ikony spotyka się z prawą krawędzią natywnego paska.

## Current State Analysis

Trigger Profilu w `src/components/ProfileCorner.tsx:333-337` ma `h-auto px-2 py-1 text-base`. Przy korzeniu 16 px wychodzi około 32 px wysokości. Szerokość jest szerokością napisu. Jedyny wołający to `WorksheetGenerator` (`src/components/WorksheetGenerator.tsx:155-165`).

Krzyżyk w `src/components/ui/dialog.tsx:80-88` nie ma paddingu. `XIcon` bez klasy `size-*` dostaje `size-4`. Ramka to 16×16 px przy `top-4 right-4` (y 16–32, 16 px od prawej krawędzi paddingu). Te same okno dostają profil, „Wybierz postać” i „Wybierz poziom”.

Przy włączonym krzyżyku treść ma `pt-14 pr-4` (`src/components/ui/dialog.tsx:54`): góra 56 px, prawo 16 px. Pierwszy wiersz zaczyna się na 56 px. Szyna (`src/hooks/useScrollIndicator.ts:33-36`) stoi w prawym paddingu: po `-m-1` ciała zostaje 12 px, a `+ 3` i `w-1.5` dzielą je na 3 + 6 + 3. Prawa krawędź szyny jest 3 px od prawej krawędzi paddingu, lewa 9 px. Między ikoną a szyną jest 7 px. Dialog ma `overflow-hidden`, więc glif wysunięty za obrys zostałby obcięty.

Fokus krzyżyka to `focus:`, nie `focus-visible:` z `src/components/ui/button.tsx:8`. Klasy `data-[state=open]:` na krzyżyku nie mają stanu: w `@radix-ui/react-dialog` 1.1.23 `DialogClose` nie ustawia `data-state`.

Testy: Generuj i Drukuj mają wysokość co najmniej 44 px (`tests/e2e/phone-layout.spec.ts:88-89`). Profil i Zamknij nie mają asercji rozmiaru. Szynę widać tylko na projektach `hasTouch`, selektorem `[data-slot="dialog-scroll-track"]`. `tests/e2e/dialog-close.spec.ts` klika „Zamknij” na samym `chromium` i nie mierzy pikseli.

## Desired End State

Na `pointer-coarse` Profil ma co najmniej 44 px wysokości, ten sam napis i te same `top-4 right-4`. Na myszce zostaje przy dotychczasowej wysokości treści (poniżej 44 px).

Krzyżyk na obu wskaźnikach ma pole 44×44 px. Góra pola jest 8 px od krawędzi paddingu, dół na 52 px, czyli 4 px nad pierwszym wierszem. Glif zostaje 16×16 px i zaczyna się 16 px od góry. Na myszce prawa krawędź glifu i pola jest 12 px od prawej krawędzi paddingu (`right-3`). To prawa krawędź ciała przewijania: `pr-4` minus `-m-1` (16 − 4). Natywny pasek stoi przy tej krawędzi. Pomiar na tym Windowsie (Chromium, wskaźnik precyzyjny, lista profili): pasek ma 16 px, więc zajmuje 12–28 px od prawej krawędzi paddingu, tyle co glif po przesunięciu. Lewa krawędź też się schodzi. Cieńszy pasek nadal leży pod glifem, ze wspólną prawą krawędzią. Na dotyku obie prawe krawędzie schodzą się z prawą krawędzią szyny (3 px od prawej krawędzi paddingu), a całe 6 px szyny leży pod glifem. Fokus klawiaturą jest taki jak u `Button` i rysuje się na widocznej płytce, nie na polu 44 px. Zachowanie „Zamknij” się nie zmienia.

Przy najechaniu pod glifem widać ten sam kwadrat co przy ołówku i koszu: 36 px (`size-9`), `rounded-md`, tło `accent` i kolor `accent-foreground`. Glif jest na środku kwadratu. Kwadrat wychodzi 10 px poza glif z każdej strony, więc prawa krawędź glifu zostaje na prawej krawędzi pola 44 px. Na myszce prawa krawędź kwadratu jest 2 px od prawej krawędzi paddingu i mieści się w oknie. Na dotyku kwadrat wychodzi za padding i `overflow-hidden` ścina jego prawy brzeg; glif zostaje w oknie. Pole 44 px zostaje przezroczyste. Ikona ma pełne krycie, bez `opacity-70`.

### Key Discoveries:

- Pole kontrolek w tym repo rośnie przez `h-auto` i padding albo `min-h`, a glif zostaje `size-4`. W `src/` nie ma osobnego pola przez `::before`.
- Wyśrodkowanie ikony 16 px na dzisiejszej szynie wysuwa glif około 2 px poza padding i około 1 px poza obrys. Dlatego szyna zostaje, a ikona dosuwa się do jej prawej krawędzi.
- 2026-10-22, po fazie 1: na komputerze krzyżyk ma stać nad natywnym paskiem, nie w dzisiejszym `right-4`. Dzisiejszy glif jest 16–32 px od prawej krawędzi paddingu, pasek 12–28 px. Różnica to 4 px w lewo.
- `tests/e2e/dialog-close.spec.ts` nie pilnuje geometrii i pomija projekty dotykowe. Kolumna ze szyną musi wejść do `phone-layout.spec.ts`.

## What We're NOT Doing

- Triggery Postać i Poziom na pasku. Zostają przy `px-2 py-1 text-base`.
- Ołówek, kosz i wiersze dialogów (`DIALOG_ROW_CLASS`). Krzyżyk pożycza ich płytkę hovera, ale tych przycisków nie zmienia.
- Wysokość Profilu na wskaźniku precyzyjnym.
- Przesuwanie szyny i zmiana `+ 3` w `useScrollIndicator.ts`. Natywnego paska też nie ruszamy: na myszce dosuwa się do niego ikona.
- Pole 36 px jako cel dotyku oraz pole 44 px przypięte do `top-4`, które weszłoby w pierwszy wiersz. Kwadrat 36 px jest tylko płytką hovera.
- Zmiana PRD, roadmapy i otwieranie osobnego issue. Kolumna zostaje przy otwartym #37.

## Implementation Approach

Jedna klasa na triggerze Profilu i jedna zmiana klas krzyżyka we wspólnym `DialogContent`. Szyna nie zmienia wzoru. Na dotyku pole i glif dosuwają się w prawo tak, żeby prawa krawędź glifu spotkała się z prawą krawędzią szyny. Na myszce dosuwają się tak, żeby prawa krawędź glifu spotkała się z prawą krawędzią natywnego paska (`right-3`, 12 px). Glif zostaje przy górze jak dziś (y 16–32). Pole jest wyższe od glifu: 8 px nad nim i 20 px pod nim, więc dół wypada na 52 px. Płytka 36 px jest osobnym elementem wewnątrz pola, wyśrodkowanym na glifie.

## Critical Implementation Details

- **User experience spec.** Przy korzeniu 16 px i `--spacing: 0.25rem` liczby są takie: pole krzyżyka y 8–52 i 44 px szerokości; glif y 16–32 i 16 px szerokości; pierwszy wiersz od y 56; szyna od y 52, w poziomie 3–9 px od prawej krawędzi paddingu. Prawa krawędź pola pokrywa się z prawą krawędzią glifu. Na myszce ta krawędź jest 12 px od prawej krawędzi paddingu, czyli na prawej krawędzi natywnego paska. Przy pasku 16 px glif zajmuje 12–28 px i pokrywa pasek. Na `pointer-coarse` krawędź jest 3 px od paddingu. Glif wtedy zajmuje 3–19 px, więc szyna 3–9 px leży pod nim w całości. Dół pola styka się z górą szyny i nie wchodzi w wiersz. Płytka hovera ma 36 px i jest wyśrodkowana na glifie, więc na myszce zajmuje y 6–42 i w poziomie 2–38 px od prawej krawędzi paddingu.

## Phase 1: Profil na dotyku

### Overview

Podnieść cel dotyku Profilu do co najmniej 44 px wysokości bez zmiany napisu i bez ruszania rogu na myszce.

### Changes Required:

#### 1. Trigger Profilu

**File**: `src/components/ProfileCorner.tsx`

**Intent**: Na `pointer-coarse` pole jest co najmniej tak wysokie jak Generuj na telefonie. Napis, `text-base`, `top-4`, `right-4` i `max-w-48` zostają.

**Contract**: Do klas triggera dochodzi minimalna wysokość 44 px tylko na `pointer-coarse` (`min-h-11` przy `--spacing: 0.25rem`). Na wskaźniku precyzyjnym wysokość zostaje wysokością treści, poniżej 44 px. Szerokość dalej wynika z napisu. `top-4` i `right-4` bez zmian.

Jeśli dotychczasowy test „the Profil corner does not cover the heading” padnie przez te 12 px w dół, wolno ruszyć tylko `padding-top: 3.5rem` w `src/components/WorksheetHome.astro` (ekran, `max-width: 639px`, `.has-maze`), i tylko tyle, ile trzeba, żeby nagłówek zszedł spod przycisku. Nie wolno skrócić pola poniżej 44 px ani zmienić `top-4`.

#### 2. Asercja wysokości

**File**: `tests/e2e/phone-layout.spec.ts`

**Intent**: Test pilnuje nowej wysokości na dotyku i tego, że myszka jej nie dostaje. Dotychczasowe asercje pliku zostają.

**Contract**: Przycisk o nazwie „Profil” (bez wybranego profilu), przy korzeniu 16 px: na projektach z `hasTouch` wysokość od 44 px włącznie do poniżej 48 px; na projekcie `chromium` wysokość poniżej 44 px. Asercje Generuj/Drukuj, braku nachodzenia na nagłówek i schodzenia rogu z karty na dotyku zostają zielone.

### Success Criteria:

#### Automated Verification:

- `npx playwright test tests/e2e/phone-layout.spec.ts`: na `hasTouch` Profil ma wysokość od 44 px włącznie do poniżej 48 px, na `chromium` poniżej 44 px, a dotychczasowe asercje tego pliku przechodzą
- `npm test` i `npm run lint` przechodzą

#### Manual Verification:

- Na szerokości telefonu z emulacją dotyku napis „Profil” i krótkie imię wyglądają jak dziś, pole jest wyższe i nie zasłania nagłówka

**Implementation Note**: Po zielonych sprawdzeniach automatycznych zatrzymaj się na ręczne potwierdzenie, zanim zacznie się faza 2.

---

## Phase 2: Róg okna

### Overview

Powiększyć pole krzyżyka, dosunąć ikonę do szyny na dotyku i do natywnego paska na myszce, dać jej płytkę hovera jak u ołówka i kosza, wyrównać fokus do pozostałych przycisków i zostawić komentarz, który trzyma ten róg razem.

### Changes Required:

#### 1. Krzyżyk

**File**: `src/components/ui/dialog.tsx`

**Intent**: Ikona zostaje 16 px. Rośnie pole wokół niej. Na dotyku ikona staje nad szyną. Na myszce staje nad natywnym paskiem. Fokus po Tab jest taki jak u `Button` i nie zostaje po samym kliknięciu. Najechanie pokazuje tę samą płytkę co ołówek i kosz.

**Contract**: Glif bez własnej klasy `size-*`, więc dalej łapie `size-4`. Góra glifu zostaje 16 px od górnej krawędzi paddingu na obu wskaźnikach. Pole ma 44×44 px, górę 8 px od krawędzi paddingu i dół na 52 px. Prawa krawędź pola pokrywa się z prawą krawędzią glifu. Na wskaźniku precyzyjnym ta krawędź jest 12 px od prawej krawędzi paddingu (`right-3`), czyli na prawej krawędzi natywnego paska. Na `pointer-coarse` jest 3 px od niej, czyli na prawej krawędzi szyny. Wewnątrz pola jest płytka 36 px (`size-9`), `rounded-md`, wyśrodkowana na glifie (`-top-0.5 -right-2.5`). Przy `:hover` przycisku ma `bg-accent` i `text-accent-foreground`. Nie ma `opacity-70` ani `hover:opacity-100`. Klasy fokusu to `outline-none` na polu oraz `group-focus-visible:border-ring group-focus-visible:ring-ring/50 group-focus-visible:ring-[3px]` na płytce, czyli pierścień z `src/components/ui/button.tsx:8` otacza widoczny kwadrat. Znikają `focus:ring-2`, `focus:ring-offset-2`, `focus:outline-hidden`, `ring-offset-background` oraz `data-[state=open]:bg-accent` i `data-[state=open]:text-muted-foreground`. Nazwa dostępna zostaje „Zamknij”.

Komentarz przy `pr-4` albo przy klasach krzyżyka mówi, że prawy padding, prawa krawędź krzyżyka i `+ 3` w `useScrollIndicator.ts` to jeden róg: na `pointer-coarse` prawa krawędź ikony spotyka się z prawą krawędzią szyny, a na wskaźniku precyzyjnym z prawą krawędzią natywnego paska (`pr-4` minus `-m-1`). Wzór szyny się nie zmienia.

#### 2. Asercje geometrii

**File**: `tests/e2e/phone-layout.spec.ts`

**Intent**: Dotyk pilnuje pola, zapasu nad pierwszym wierszem i kolumny ze szyną. Test zachowania zamknięcia zostaje na desktopie i dorzuca pomiar rogu myszki.

**Contract**: W gałęzi `hasTouch` testu z widoczną szyną: pole przycisku „Zamknij” ma szerokość i wysokość 44 px z tolerancją 1 px; jego dół jest co najmniej 4 px nad górą pierwszego wiersza; prawa krawędź pola i prawa krawędź `[data-slot="dialog-scroll-track"]` schodzą się w tolerancji 1 px; lewa krawędź szyny jest nie dalej w lewo niż lewa krawędź glifu `svg` w tym przycisku. Na `chromium`, w `tests/e2e/dialog-close.spec.ts`: pole „Zamknij” ma 44×44 px z tolerancją 1 px, a jego prawa krawędź schodzi się z prawą krawędzią natywnego paska (prawa krawędź `[data-slot="dialog-body"]`) w tolerancji 1 px. To 12 px od prawej krawędzi paddingu okna. Oba dotychczasowe scenariusze tego pliku (powrót z pytania o usunięcie bez kasowania, zamknięcie listy postaci bez zmiany postaci) przechodzą.

Tytuł kroku Progress 2.2 zostaje. Zdanie o „16 px od prawej krawędzi paddingu” w tym tytule jest nieaktualne: obowiązuje kontrakt powyżej.

### Success Criteria:

#### Automated Verification:

- `npx playwright test tests/e2e/phone-layout.spec.ts`: na `hasTouch` pole „Zamknij” ma 44×44 px (tolerancja 1 px), jego dół jest co najmniej 4 px nad pierwszym wierszem, prawa krawędź schodzi się z prawą krawędzią szyny (tolerancja 1 px), a szyna w całości leży w poziomie pod glifem
- `npx playwright test tests/e2e/dialog-close.spec.ts`: na `chromium` pole „Zamknij” ma 44×44 px (tolerancja 1 px), prawa krawędź schodzi się z prawą krawędzią natywnego paska (tolerancja 1 px), a oba dotychczasowe scenariusze zamknięcia przechodzą
- `npm test` i `npm run lint` przechodzą

#### Manual Verification:

- Na iPhonie, na liście postaci, krzyżyk da się trafić, rysowany pasek jest pod ikoną i pierwszy wiersz nie jest przykryty
- Na komputerze Tab pokazuje na krzyżyku ten sam pierścień `focus-visible` co na innych przyciskach, a samo kliknięcie myszą go nie zostawia

**Implementation Note**: Po zielonych sprawdzeniach automatycznych zatrzymaj się na iPhone’a i fokus klawiaturą, zanim zmiana zostanie uznana za skończoną.

---

## Testing Strategy

### Unit Tests:

- Brak nowej logiki w `src/lib`. `npm test` ma zostać zielony, bo klasy i komentarz go nie ruszają.

### Integration Tests:

- `tests/e2e/phone-layout.spec.ts` na projektach `hasTouch` (`phone-360`, `pixel-7`, `tablet-768`, oraz `iphone-13` tam, gdzie WebKit jest włączony) i na `chromium`.
- `tests/e2e/dialog-close.spec.ts` zostaje na `chromium`.

### Manual Testing Steps:

1. Telefon albo emulacja dotyku: Profil przy imieniu i bez imienia, wysokość pola, brak zasłonięcia nagłówka.
2. iPhone: lista postaci, trafienie w krzyżyk, pasek pod ikoną, pierwszy wiersz wolny.
3. Komputer: Tab na krzyżyk i kliknięcie myszą, żeby pierścień został tylko po klawiaturze.

## Performance Considerations

Zmiana klas. Brak nowego renderu, obserwatora i pracy na ścieżce przewijania. Wzór szyny zostaje.

## Migration Notes

Brak danych do przeniesienia. Trzy okna dziedziczą krzyżyk z `DialogContent` i nie dostają własnych klas.

## References

- Research: `context/changes/touch-targets/research.md`
- Issue: https://github.com/drpc1/printo-kids/issues/37
- Wzorzec wysokości: `src/components/WorksheetGenerator.tsx:22-23`, `src/components/ProfileCorner.tsx:24-25`
- Fokus: `src/components/ui/button.tsx:8`
- Szyna: `src/hooks/useScrollIndicator.ts:33-36`
- Odłożone przeglądy: `context/archive/2026-10-13-phone-worksheet/reviews/impl-review-final.md`, `context/archive/2026-10-16-dialog-close-button/reviews/impl-review.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Profil na dotyku

#### Automated

- [x] 1.1 `npx playwright test tests/e2e/phone-layout.spec.ts`: na `hasTouch` Profil ma wysokość od 44 px włącznie do poniżej 48 px, na `chromium` poniżej 44 px, a dotychczasowe asercje tego pliku przechodzą
- [x] 1.2 `npm test` i `npm run lint` przechodzą

#### Manual

- [ ] 1.3 Na szerokości telefonu z emulacją dotyku napis „Profil” i krótkie imię wyglądają jak dziś, pole jest wyższe i nie zasłania nagłówka

### Phase 2: Róg okna

#### Automated

- [x] 2.1 `npx playwright test tests/e2e/phone-layout.spec.ts`: na `hasTouch` pole „Zamknij” ma 44×44 px (tolerancja 1 px), jego dół jest co najmniej 4 px nad pierwszym wierszem, prawa krawędź schodzi się z prawą krawędzią szyny (tolerancja 1 px), a szyna w całości leży w poziomie pod glifem
- [x] 2.2 `npx playwright test tests/e2e/dialog-close.spec.ts`: na `chromium` pole „Zamknij” ma 44×44 px (tolerancja 1 px), prawa krawędź jest 16 px od prawej krawędzi paddingu (tolerancja 1 px), a oba dotychczasowe scenariusze zamknięcia przechodzą
- [x] 2.3 `npm test` i `npm run lint` przechodzą

#### Manual

- [ ] 2.4 Na iPhonie, na liście postaci, krzyżyk da się trafić, rysowany pasek jest pod ikoną i pierwszy wiersz nie jest przykryty
- [ ] 2.5 Na komputerze Tab pokazuje na krzyżyku ten sam pierścień `focus-visible` co na innych przyciskach, a samo kliknięcie myszą go nie zostawia
