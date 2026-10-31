# Górny odstęp krzyżyka na telefonie — plan implementacji

## Overview

Na wskaźniku dotykowym widoczny krzyżyk okna jest 16 px od góry i 3 px od prawej, więc wygląda, jakby przykleił się do prawej krawędzi. Ta zmiana podnosi cały przycisk zamykania tylko na `pointer-coarse`, aż góra ikony też jest 3 px od krawędzi paddingu. Prawa krawędź zostaje na rysowanym pasku. Róg na komputerze zostaje.

## Current State Analysis

Krzyżyk jest we wspólnym `DialogContent` (`src/components/ui/dialog.tsx:79-99`). Okno profilu nie ma własnego (`src/components/ProfileCorner.tsx:338-339`). Przy włączonym krzyżyku treść ma `pt-14 pr-4` (`dialog.tsx:54`): pierwszy wiersz zaczyna się 56 px od krawędzi paddingu.

Pole ma `top-2 right-3 size-11` i na dotyku `pointer-coarse:right-[3px]` (`dialog.tsx:88`). Płytka 36 px jest `absolute -top-0.5 -right-2.5` i wyśrodkowuje ikonę 16 px (`dialog.tsx:93`). Stąd glif jest 16 px od góry na obu wskaźnikach. Od prawej jest 12 px na myszce i 3 px na dotyku. Komentarz przy klasach (`dialog.tsx:83-87`) wiąże prawą krawędź glifu z `+ 3` w `src/hooks/useScrollIndicator.ts:35`: na dotyku spotyka się z prawą krawędzią szyny (3–9 px), na myszce z prawą krawędzią natywnego paska.

`tests/e2e/phone-layout.spec.ts:459-467` na `hasTouch` wymaga pola 44 px, co najmniej 4 px nad pierwszym wierszem, zejścia prawej krawędzi pola ze szyną i tego, że szyna nie zaczyna się na lewo od glifu. `tests/e2e/dialog-close.spec.ts:37-46` mierzy ten róg tylko na `chromium`.

## Desired End State

Na `pointer-coarse` góra glifu i jego prawa krawędź są po 3 px od krawędzi paddingu okna. Prawa krawędź nadal spotyka się z prawą krawędzią szyny. Pole zostaje 44×44 px i jedzie w górę razem z glifem: jego góra jest 5 px nad krawędzią paddingu, dół na 39 px, czyli dalej nad pierwszym wierszem. Płytka zostaje wyśrodkowana na glifie, więc na dotyku wychodzi 7 px za górną krawędź paddingu, tak jak już wychodzi 7 px za prawą; `overflow-hidden` ścina ten brzeg, a glif zostaje w oknie. Wzór szyny się nie zmienia.

Na wskaźniku precyzyjnym nic w tym rogu się nie rusza: glif y 16–32, prawa krawędź 12 px od paddingu, pole od y 8 do 52.

### Key Discoveries:

- `top-2` to góra pola (8 px), nie góra glifu. Glif jest 8 px niżej niż góra pola, bo płytka jest przesunięta o −2 px, a ikona jest 10 px w jej środku (`dialog.tsx:88`, `dialog.tsx:93`).
- Żeby góra glifu zeszła z 16 px na 3 px i pole zostało 8 px nad glifem, góra pola na dotyku musi być −5 px. To ten sam schemat co `right-3` i `pointer-coarse:right-[3px]`.
- Dosunięcie samej ikony do góry, przy polu zostawionym na y 8–52, stawiałoby cel 44 px pod krzyżykiem. Dlatego jedzie całe sterowanie.
- Szyna i testy prawej krawędzi nie zależą od góry. Podniesienie pola powiększa zapas nad pierwszym wierszem, więc dotychczasowa asercja „co najmniej 4 px” zostaje zielona bez zmiany progu.

## What We're NOT Doing

- Powiększanie prawego odstępu i zdejmowanie glifu z szyny.
- Ruszanie rogu na wskaźniku precyzyjnym.
- Zmiana `+ 3` w `useScrollIndicator.ts`, `pr-4`, `pt-14` i natywnego paska.
- Osobny krzyżyk dla okna profilu.
- Traktowanie `top-2` jako widocznego górnego marginesu.
- Zmiana rozmiaru pola (zostaje 44 px) ani płytki (zostaje 36 px, wyśrodkowana na glifie).

## Implementation Approach

Jedna klasa wariantu na wspólnym przycisku zamykania i jedna nowa asercja w teście, który już mierzy ten róg na dotyku. Wewnętrzne przesunięcie płytki zostaje, więc prawa krawędź glifu nie odjeżdża od prawej krawędzi pola. Komentarz przy klasach dopisuje górę, żeby następna zmiana nie ściągnęła przycisku z powrotem na `top-2`.

## Critical Implementation Details

- **User experience spec.** Przy korzeniu 16 px góra glifu na dotyku jest 3 px od krawędzi paddingu, nie od obrysu obramowania. Okno ma `border` 1 px, więc pomiar od pudełka obramowania jest o ten piksel za duży. Góra pola −5 px oznacza, że górne 5 px pola 44 px leży poza paddingiem i `overflow-hidden` je ścina. Widoczny glif (y 3–19) leży w tej części pola, która zostaje w oknie, więc trafienie w krzyżyk dalej trafia w przycisk.

## Phase 1: Górny odstęp na telefonie

### Overview

Podnieść przycisk zamykania na `pointer-coarse` tak, żeby góra ikony zrównała się z jej prawą krawędzią, i zapisać ten odstęp w teście dotykowym.

### Changes Required:

#### 1. Krzyżyk

**File**: `src/components/ui/dialog.tsx`

**Intent**: Na dotyku cały przycisk jedzie w górę o 13 px, żeby góra glifu zeszła z 16 px na 3 px. Prawa krawędź, płytka i pole 44 px zostają w tym samym układzie względem glifu. Na myszce klasy rogu się nie zmieniają.

**Contract**: Zostają `top-2`, `right-3`, `size-11` i `pointer-coarse:right-[3px]`. Dochodzi górne przesunięcie tylko na `pointer-coarse`, o wartości −5 px, tym samym rodzajem wariantu co `pointer-coarse:right-[3px]`. Płytka zostaje przy `-top-0.5 -right-2.5` i `size-9`. Komentarz przy klasach mówi dodatkowo, że na `pointer-coarse` całe sterowanie jest podniesione tak, aby góra ikony miała ten sam odstęp co jej prawa krawędź (3 px od krawędzi paddingu), a na wskaźniku precyzyjnym góra zostaje 16 px. Wzór szyny się nie zmienia.

#### 2. Asercja górnego odstępu

**File**: `tests/e2e/phone-layout.spec.ts`

**Intent**: Dotyk pilnuje nowego odstępu obok dotychczasowej kolumny ze szyną. Test komputera zostaje pomiarem starego rogu.

**Contract**: W gałęzi `hasTouch` testu z widoczną szyną dochodzi pomiar glifu `svg` w przycisku „Zamknij”: jego odstęp od górnej krawędzi paddingu okna i od prawej krawędzi paddingu wynosi po 3 px, z tolerancją 1 px. Krawędź paddingu liczy się z szerokością obramowania, nie z zewnętrznego pudełka. Dotychczasowe asercje tego pliku zostają, w tym pole 44 px, zapas co najmniej 4 px nad pierwszym wierszem i zejście prawej krawędzi pola ze szyną. `tests/e2e/dialog-close.spec.ts` nie dostaje nowej asercji.

### Success Criteria:

#### Automated Verification:

- `npx playwright test tests/e2e/phone-layout.spec.ts`: na `hasTouch` góra glifu i jego prawa krawędź są po 3 px od krawędzi paddingu okna (tolerancja 1 px), a dotychczasowe asercje tego pliku przechodzą
- `npx playwright test tests/e2e/dialog-close.spec.ts`: na `chromium` pole „Zamknij” zostaje 44×44 px, jego prawa krawędź schodzi się z prawą krawędzią ciała, i oba scenariusze zamknięcia przechodzą
- `npm test` i `npm run lint` przechodzą

#### Manual Verification:

- Na iPhonie, w oknie profilu, odstęp krzyżyka od góry i od prawej wygląda tak samo, pasek przewijania wygląda jak dziś, krzyżyk da się trafić, a pierwszy wiersz nie jest przykryty
- Na komputerze róg okna wygląda jak dziś

**Implementation Note**: Po zielonych sprawdzeniach automatycznych zatrzymaj się na ręczne potwierdzenie na iPhonie i na komputerze, zanim zmiana zostanie uznana za skończoną.

---

## Testing Strategy

### Unit Tests:

- Brak nowej logiki w `src/lib`. `npm test` ma zostać zielony, bo klasa i komentarz go nie ruszają.

### Integration Tests:

- `tests/e2e/phone-layout.spec.ts` na projektach `hasTouch` (`phone-360`, `pixel-7`, `tablet-768`, oraz `iphone-13` tam, gdzie WebKit jest włączony).
- `tests/e2e/dialog-close.spec.ts` zostaje na `chromium` i pilnuje, że myszka się nie ruszyła.

### Manual Testing Steps:

1. iPhone, Chrome albo Brave: otworzyć okno profilu i porównać odstęp krzyżyka od góry i od prawej.
2. W tym samym oknie, przy liście dłuższej niż okno: pasek wygląda jak przed zmianą, krzyżyk da się trafić, pierwszy wiersz nie wchodzi pod pole.
3. Komputer: okno profilu i okno postaci, róg jak przed zmianą, zamknięcie krzyżykiem dalej działa.

## Performance Considerations

Zmiana jednej klasy. Brak nowego renderu, obserwatora i pracy na ścieżce przewijania. Wzór szyny zostaje.

## Migration Notes

Brak danych do przeniesienia. Wszystkie okna dziedziczą krzyżyk z `DialogContent` i nie dostają własnych klas.

## References

- Frame: `context/changes/gh165-x-location-on-phone/frame.md`
- Issue: https://github.com/drpc1/printo-kids/issues/165
- Poprzedni kontrakt rogu: `context/archive/2026-10-18-touch-targets/plan.md` (Desired End State, Phase 2)
- Krzyżyk: `src/components/ui/dialog.tsx:52-99`
- Szyna: `src/hooks/useScrollIndicator.ts:33-35`
- Testy: `tests/e2e/phone-layout.spec.ts:459-467`, `tests/e2e/dialog-close.spec.ts:37-46`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Górny odstęp na telefonie

#### Automated

- [x] 1.1 `npx playwright test tests/e2e/phone-layout.spec.ts`: na `hasTouch` góra glifu i jego prawa krawędź są po 3 px od krawędzi paddingu okna (tolerancja 1 px), a dotychczasowe asercje tego pliku przechodzą — 963460a
- [x] 1.2 `npx playwright test tests/e2e/dialog-close.spec.ts`: na `chromium` pole „Zamknij” zostaje 44×44 px, jego prawa krawędź schodzi się z prawą krawędzią ciała, i oba scenariusze zamknięcia przechodzą — 963460a
- [x] 1.3 `npm test` i `npm run lint` przechodzą — 963460a

#### Manual

- [x] 1.4 Na iPhonie, w oknie profilu, odstęp krzyżyka od góry i od prawej wygląda tak samo, pasek przewijania wygląda jak dziś, krzyżyk da się trafić, a pierwszy wiersz nie jest przykryty — 963460a
- [x] 1.5 Na komputerze róg okna wygląda jak dziś — 963460a
