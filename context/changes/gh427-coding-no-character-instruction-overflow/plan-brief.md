# Wspólne polecenie bez postaci (GitHub 427) — Plan Brief

> Full plan: `context/changes/gh427-coding-no-character-instruction-overflow/plan.md`
> Research: `context/changes/gh427-coding-no-character-instruction-overflow/research.md`

## What & Why

Na Kodowaniu bez postaci polecenie wychodzi poza kartkę, w podglądzie i na miniaturze katalogu. Przyczyna jest wspólna: bez postaci żadna karta nie łamie polecenia ani nie sprawdza jego szerokości. Kodowanie ma po prostu najdłuższy tekst. Robimy jeden mechanizm dla wszystkich kart, żeby następne długie polecenie nie powtórzyło błędu.

## Starting Point

Z postacią polecenie łamie się na zdania w dymku (`instructionLines`, `SpeechBand`). Bez postaci każda z 16 kart ma własny jednolinijkowy `<text>`, a skrypt miniatur ma ich kopie. Według estymaty za szerokie są Kodowanie Zapisz (266 i 211 mm), Dyktando (215 mm) i Krzyżówka (197 mm), przy 190 mm dostępnych.

## Desired End State

Bez postaci polecenie każdej karty mieści się w marginesie 10 mm. Krótkie polecenia wyglądają jak dziś, a długie mają jedno zdanie w linii i wyższy pas. Miniatury pokazują to samo. Jeden test łapie każde polecenie, które się nie mieści.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Zakres | Wspólny mechanizm dla wszystkich kart | Kopie per karta to przyczyna błędu. | Research → Plan (użytkowniczka) |
| Dopasowanie | Jedna linia, gdy się mieści; inaczej linia na zdanie, pas rośnie | Krótkie karty bez zmian, bez za małej czcionki. | Plan (użytkowniczka) |
| Migracja | Wszystkie 16 kart i miniatury | Jedno miejsce rysowania, nic się nie rozjedzie. | Plan (użytkowniczka) |
| Test | Jeden test nad poleceniami wszystkich kart, poziomów i trybów | Nowa karta nie ominie testu, jak było przy Kodowaniu. | Plan (użytkowniczka) |
| Pionowe ustawienie | `baselineShift` zamiast `dominant-baseline` | Zasada z GitHub 371 dla telefonów. | Plan |
| Szerokość | Estymata `estimatedTextWidth` (0,52), raz sprawdzona pomiarem w podglądzie | Ta sama, której używa dymek; pomiar decyduje o Krzyżówce i Dyktandzie przed migracją. | Research + plan review |
| Dyktando | Kratka dopasowuje się do wyższego pasa | Inaczej lista poleceń zejdzie pod margines. | Plan |

## Scope

**In scope:** helper `layoutPlainInstruction` i komponent `PlainInstruction`; przepięcie 16 kart; dopasowanie kratki dyktanda; test poleceń wszystkich kart; skrypt i przebudowa miniatur; wydruk na komputerze i telefonie.

**Out of scope:** zmiana treści poleceń, dymek z postacią, zmniejszanie czcionki, pomiar tekstu w przeglądarce, labirynt, przebudowa układów kart.

## Architecture / Approach

`src/lib/sheet/plain-instruction.ts` liczy z tekstu, rozmiaru i szerokości kartki linie i wysokość pasa. Komponent rysuje te linie, a karty przekazują wysokość do swoich istniejących `layout*Sheet`, które już przyjmują ją jako liczbę. Skrypt miniatur woła ten sam helper.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Wspólny układ i test | Helper, komponent, test poleceń wszystkich kart | Zebranie tekstów wszystkich poziomów i trybów ze źródeł kart |
| 2. Migracja kart | 16 kart na wspólnym komponencie, dyktando dopasowuje kratkę | Krótkie karty przesuną się o ułamek mm przez zmianę ustawienia linii bazowej |
| 3. Miniatury i sprawdzenie | Przebudowane miniatury, wydruk A4 i telefon | Wydruk na iOS różni się między przeglądarkami |

**Prerequisites:** brak; zmiana zaczyna się od `main` na osobnej gałęzi.
**Estimated effort:** ok. 2–3 sesje w 3 fazach.

## Open Risks & Assumptions

- Estymata 0,52 może nie zgadzać się z faktycznym fontem; Krzyżówka (197 mm) jest blisko granicy. Faza 1 mierzy cztery długie polecenia w podglądzie i kalibruje próg przed migracją (krok 1.5); wydruk w fazie 3 to potwierdza.
- Test kart sprawdza pokrycie `CARD_KINDS`, więc nowa karta bez wpisu wywraca test.
- Wyższy pas (ok. 15,8 mm zamiast 7 mm) zmniejsza miejsce na zadanie; testy układów sprawdzają margines.

## Success Criteria (Summary)

- Kodowanie, Dyktando i Krzyżówka bez postaci drukują się na jednej stronie A4 z poleceniem w marginesie 10 mm, także z telefonu.
- Pozostałe karty wyglądają jak dziś.
- Nowe zbyt długie polecenie wywraca `npm test`.
