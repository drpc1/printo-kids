# Górny odstęp krzyżyka na telefonie — Plan Brief

> Full plan: `context/changes/gh165-x-location-on-phone/plan.md`
> Frame brief: `context/changes/gh165-x-location-on-phone/frame.md`

## What & Why

Na wskaźniku dotykowym widoczny krzyżyk jest 16 px od górnej krawędzi paddingu i 3 px od prawej, z zatwierdzonego kontraktu pól dotyku, i na iPhonie czyta się to jako przyklejenie do prawej krawędzi.

Ta zmiana zrównuje oba odstępy, obniżając górny do 3 px. Prawa krawędź zostaje na rysowanym pasku.

## Starting Point

Wspólny `DialogContent` trzyma pole 44 px (`top-2`, na dotyku `right-[3px]`) i płytkę 36 px wyśrodkowaną na ikonie 16 px. `top-2` jest górą pola, nie ikony, więc ikona zostaje 16 px od góry. Szyna stoi 3–9 px od prawej krawędzi paddingu i test dotykowy spina z nią prawą krawędź pola. Okno profilu nie ma własnego krzyżyka.

## Desired End State

Na telefonie krzyżyk jest 3 px od góry i 3 px od prawej. Pasek przewijania wygląda jak dziś, pole 44 px jedzie w górę razem z ikoną, a pierwszy wiersz zostaje odkryty. Na komputerze róg zostaje: 16 px od góry i 12 px od prawej.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Gdzie jest odstęp | Glif, 16 px od góry i 3 px od prawej | `top-2` mierzy pole kliknięcia, nie ikonę | Frame |
| Zakres | Wspólny `DialogContent` | Okno profilu tylko pokazuje ten sam krzyżyk | Frame |
| Który odstęp się zmienia | Górny maleje do 3 px | Oba mają być równe, a prawa krawędź zostaje na pasku | Plan |
| Pasek i komputer | Bez zmian | Oba wyglądają dobrze i nie są przedmiotem zgłoszenia | Frame |
| Jak podnieść ikonę | Całe pole 44 px jedzie w górę o 13 px | Inaczej cel dotyku zostałby pod krzyżykiem | Plan |

## Scope

**In scope:**

- Wariant `pointer-coarse` podnoszący przycisk zamykania tak, że góra glifu jest 3 px od krawędzi paddingu
- Komentarz trzymający tę górę razem z prawą krawędzią i szyną
- Asercja 3 px w istniejącym teście dotykowym

**Out of scope:**

- Większy prawy margines i zdjęcie glifu z szyny
- Róg na wskaźniku precyzyjnym, wzór szyny, `pt-14` i `pr-4`
- Osobny krzyżyk okna profilu oraz zmiana rozmiaru pola albo płytki

## Architecture / Approach

Jedna klasa na przycisku w `dialog.tsx`. Płytka zostaje wyśrodkowana na glifie, więc prawa krawędź ikony nie odjeżdża od pola ani od szyny. Góra pola na dotyku wypada na −5 px; górne 5 px pola ścina `overflow-hidden`, a widoczny krzyżyk zostaje w oknie. Test na `hasTouch` mierzy odstęp od krawędzi paddingu, z obramowaniem 1 px wliczonym osobno.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Górny odstęp na telefonie | Klasa, komentarz i asercja 3 px | Górne 5 px pola 44 px jest obcięte; iPhone ma potwierdzić, że krzyżyk nadal da się trafić |

**Prerequisites:** Brak. Kontrakt rogu z `context/archive/2026-10-18-touch-targets/` jest już w drzewie.
**Estimated effort:** Jedna sesja, dwa pliki.

## Open Risks & Assumptions

- Obcięte 5 px pola nie zmniejsza trafienia w sam krzyżyk, bo glif leży w nieobciętej części. Sprawdza to krok ręczny na iPhonie, nie test szerokości 44 px.
- `pointer-coarse` obejmuje też rzadki gruby wskaźnik poza telefonem. To ten sam warunek, którego już używa prawy odstęp 3 px.

## Success Criteria (Summary)

- Na telefonie odstęp krzyżyka od góry i od prawej jest ten sam.
- Pasek przewijania i róg na komputerze wyglądają jak przed zmianą.
- Krzyżyk nadal zamyka okno i da się go trafić, a pierwszy wiersz nie jest przykryty.
