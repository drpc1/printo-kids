---
date: 2026-11-23
researcher: Claude (Sonnet 5.5)
git_commit: a472acda832f37a22671aaa528530345db26d8da
branch: chore/special-event-characters
repository: printo-kids
topic: "Czemu polecenie na karcie Kodowanie bez postaci wychodzi poza kartkę i nie używa mechanizmów innych kart (GitHub 427)"
tags: [research, codebase, coding, speech-band, thumbnails, plain-instruction]
status: complete
last_updated: 2026-11-23
last_updated_by: Claude (Sonnet 5.5)
---

# Research: Kodowanie bez postaci, polecenie poza kartką (GitHub 427)

**Date**: 2026-11-23
**Git Commit**: a472acda832f37a22671aaa528530345db26d8da
**Branch**: chore/special-event-characters

## Research Question

Czemu polecenie na karcie „Kodowanie” przy postaci „Brak” rysuje się jedną linią poza szerokością kartki, i czemu nie korzysta z tych samych mechanizmów co inne karty? Dotyczy też miniatury katalogu.

## Summary

Przyczyna nie jest błędem tylko Kodowania. W tym kodzie **żadna karta nie łamie polecenia bez postaci**: każda rysuje je jako jedną linię `<text>` o rozmiarze `plainInstructionSize` (6,5–7 mm), wyśrodkowaną. Łamanie na zdania (`instructionLines`) i dopasowanie do szerokości istnieje tylko w ścieżce z postacią (`SpeechBand`/`CharacterInstruction`, dymek ma `maxWidth`). Inne karty mają po prostu krótkie polecenia; Kodowanie ma najdłuższe w całej aplikacji i dlatego jako pierwsze się nie mieści.

Szacunek szerokości (`estimatedTextWidth`: znaki × rozmiar × 0,52, `src/lib/sheet/speech.ts:67`), przy 7 mm i dostępnych 190 mm (210 − 2 × 10 mm):

- Kodowanie, Zapisz, Poziomy 1–3: „Zapisz strzałkami najkrótszą drogę do mety. Jedna strzałka to jeden krok.” ≈ 266 mm (przekracza).
- Kodowanie, Zapisz, Poziom 4 („Zapisz najkrótszą drogę do mety. Liczba kratek i strzałka.”): ≈ 211 mm (przekracza; issue o tym nie wspomina).
- Kodowanie, Wykonaj: ≈ 160 mm (mieści się).
- Krzyżówka matematyczna (`MATH_CROSSWORD_SHEET.instruction`, 7 mm): ≈ 197 mm, więc według szacunku też o ok. 7 mm za szeroko; to estymata, nie pomiar, i nie jest zgłoszone w issue.

Miniatura `public/thumbnails/kodowanie.svg` jest budowana ze skryptu, który kopiuje ten sam jednolinijkowy tekst (`scripts/build-thumbnails.mjs:908-913`, Poziom 2, Zapisz), więc dziedziczy błąd i naprawi się dopiero po zmianie wspólnej logiki i przebudowie miniatury.

## Detailed Findings

### Ścieżka z postacią (poprawna)

- `instructionLines(text)` dzieli polecenie na zdania (`src/lib/sheet/speech.ts:57-59`); `layoutSpeechBand` daje dymkowi `maxWidth = bubbleWidth − 2 × textPadding` i mniejszy rozmiar przy wielu liniach (`speech.ts:79`, `:103`).
- `SpeechBand.tsx:87` woła `instructionLines`; test `src/lib/sheet/speech.test.ts:90` pilnuje, że każda linia mieści się w dymku.

### Ścieżka bez postaci (źródło błędu)

- `CodingSheet.tsx:174-191`: bez postaci rysuje `CentredText` z całym `instruction` w jednej linii, rozmiar `CODING_SHEET.plainInstructionSize` = 7 (`src/lib/coding/sheet.ts:19`).
- Wysokość pasa to `instructionBoxHeight(false, 7)` = 7 mm (`speech.ts:62-64`, `CodingSheet.tsx:157`), więc układ nie ma miejsca na drugą linię.
- Polecenia trybów: `src/lib/coding/levels.ts:135-143`; wybór wariantu `codingInstruction` (`levels.ts:159`).
- Ten sam wzorzec, osobno skopiowany, jest w `MathCrosswordSheet.tsx:78-88`, `CopyDrawingSheet`, `PatternLinesSheet`, `ClockSheet.tsx:142`, `NumberMazeSheet`, `ShadowsSheet`, `SizeOrderSheet` oraz w generatorach (Money, OddOneOut). Nie ma wspólnego komponentu „polecenie bez postaci”; każda karta ma własne `<text>`.

### Testy

- Jedyny test, który pilnuje, że polecenie bez postaci mieści się w szerokości, jest w `src/lib/size-order/layout.test.ts:117-120`. W testach układu Kodowania (`src/lib/coding/layout.test.ts:12-13`) bez postaci sprawdza się tylko wysokość pasa, nie szerokość tekstu. Przeszukałem `src/lib/**/*.test.ts` po „plain|fits the width|one line”; innych takich testów nie znalazłem (nie wykluczam, że szerokość jest sprawdzana pod inną nazwą).

### Miniatura katalogu

- `scripts/build-thumbnails.mjs:883-913`: Poziom 2, tryb Zapisz, bez postaci, `codingInstruction(...)` w jednym `<text>` o rozmiarze 7; zapis do `public/thumbnails/kodowanie.svg` (`:961`). Skrypt celowo powiela rysowanie komponentu (nagłówek `:1`), więc poprawka musi dotknąć obu miejsc albo wspólnego helpera.

## Code References

- `src/components/CodingSheet.tsx:157,174-191` - gałąź bez postaci, jedna linia
- `src/lib/coding/levels.ts:135-143,159` - teksty poleceń i wybór
- `src/lib/coding/sheet.ts:19` - `plainInstructionSize: 7`
- `src/lib/sheet/speech.ts:57-72` - `instructionLines`, `instructionBoxHeight`, `estimatedTextWidth`
- `src/lib/size-order/layout.test.ts:117-120` - jedyny znaleziony test szerokości polecenia bez postaci
- `scripts/build-thumbnails.mjs:883-913` - miniatura Kodowania

## Architecture Insights

- Postać zmienia, **kto** mówi polecenie, ale układ ma dwa różne tryby (pas 26 mm z dymkiem albo pas = rozmiar czcionki). Tylko pierwszy ma reguły łamania i test szerokości.
- Pas bez postaci to jedna linia o wysokości czcionki; dwie linie wymagają zmiany `instructionBoxHeight` i układów wszystkich kart, bo `areaTop` liczy się z tej wartości (np. `coding/layout.ts:72`).
- Miniatury to ręczne kopie rysunku, więc zmiana komponentu bez zmiany skryptu rozjedzie je (reguła z nagłówka skryptu).

## Historical Context (from prior changes)

- `context/archive/2026-10-27-character-speaks-instruction/reviews/impl-review-phase-3-4.md:52` wspomina `estimatedTextWidth` w `speech.ts` i `SpeechBand.tsx` jako miejsce uwagi przeglądu; nie czytałem pełnej treści, więc nie opieram na niej wniosków.
- PRD (US-35) nie stawia wymagań o łamaniu polecenia bez postaci; mówi tylko, że „polecenie stoi bez dymka”.

## Related Research

Brak (nie przeszukiwałem `context/changes/**/research.md` poza wskazaną zmianą).

## Open Questions

1. Zakres naprawy: tylko Kodowanie (skrócić albo złamać polecenia) czy wspólny mechanizm „polecenie bez postaci” dla wszystkich kart (m.in. krzyżówka matematyczna ≈ 197 mm wg estymaty)? To decyzja do planu.
2. Czy łamać na dwie linie (pas 2 × 7 mm, zmiana układu i miniatur wszystkich kart), czy zmniejszać czcionkę do szerokości, czy skrócić teksty? Wymaga decyzji i makiety/wydruku.
3. Czy estymata 0,52 jest dość dokładna dla 6,5–7 mm w przeglądarce i na wydruku? Nie mierzyłem renderu; liczby powyżej to estymata kodu, nie pomiar.

## Follow-up: pomiar w przeglądarce (2026-11-23, krok 1.5 planu)

Szerokość poleceń zmierzona w podglądzie (`getComputedTextLength` na `<text>` w SVG o viewBox 210 mm, czcionka `ui-sans-serif, system-ui, sans-serif` jak na kartach, rozmiar jak `plainInstructionSize`), na komputerze z Windows; to jedna przeglądarka i jedna czcionka systemowa, nie iOS.

| Polecenie | Rozmiar | Zmierzone | Estymata 0,52 |
| --- | --- | --- | --- |
| Kodowanie, Zapisz, Poziomy 1–3 | 7 mm | 242 mm | 266 mm |
| Kodowanie, Zapisz, Poziom 4 | 7 mm | 188 mm | 211 mm |
| Kodowanie, Wykonaj | 7 mm | 142 mm | 160 mm |
| Krzyżówka matematyczna | 7 mm | 179 mm | 197 mm |
| Dyktando graficzne | 7 mm | 189 mm | 215 mm |

Wnioski: estymata 0,52 jest zawyżona o ok. 10% (zmierzone ok. 0,45–0,50 szerokości litery na wielkość czcionki). Potwierdza się, że Kodowanie Zapisz Poziomy 1–3 wychodzi poza kartkę (242 mm przy 190 mm). Kodowanie Zapisz Poziom 4 (188 mm) i Dyktando (189 mm) mieszczą się na tym komputerze o 1–2 mm, więc przy szerszej czcionce (np. na telefonie) wyjdą poza margines; krzyżówka (179 mm) ma 11 mm zapasu. Poprzednia wzmianka w tym dokumencie, że krzyżówka (197 mm) jest za szeroka, opierała się na estymacie i nie potwierdza się pomiarem.

Decyzja do planu: osobny współczynnik 0,50 dla poleceń bez postaci (`PLAIN_INSTRUCTION.widthRatio`), dający około 6% zapasu na szersze czcionki. Przy nim Kodowanie Zapisz (wszystkie poziomy) i Dyktando dostają dwie linie, a krzyżówka zostaje w jednej (189 mm w estymacie, 179 mm zmierzone). Dymek z postacią zostaje przy 0,52.
