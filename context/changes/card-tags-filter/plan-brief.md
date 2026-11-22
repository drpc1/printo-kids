# Umiejętności i filtr kart w katalogu (S-43) — Plan Brief

> Full plan: `context/changes/card-tags-filter/plan.md`

## What & Why

Katalog ma 16 rodzajów kart i rodzic coraz dłużej szuka właściwej. Każdy rodzaj dostaje jedną albo dwie umiejętności („Co ćwiczy?”), widoczne pod nazwą na miniaturze, a nad katalogiem rząd chipów zawęża listę jednym wyborem. Roadmapa M-7 S-43, GitHub drpc1/printo-kids#374.

## Starting Point

Katalog to statyczny komponent Astro z miniaturami z rejestru `CARD_KINDS` (16 kart, także „Cienie”); plakietki poziomu z profilu dochodzą małym skryptem w przeglądarce. Karty nie mają żadnej klasyfikacji, a PRD (US-05, FR-014) opisuje katalog bez filtra.

## Desired End State

Nad miniaturami stoi „Co ćwiczy?” i chipy: Wszystkie, Czas i pieniądze, Liczby, Logika, Rysowanie, Spostrzegawczość. Chip zostawia karty z tą umiejętnością (karta z dwiema widać pod obiema), „Wszystkie” przywraca 16. Pod nazwą każdej miniatury jest szara linijka z jej umiejętnościami. Każde wejście i powrót na stronę zaczyna od „Wszystkie”; na telefonie chipy zawijają się w dwa rzędy.

## Key Decisions Made

| Decision                   | Choice                                                                                                                                                                 | Why (1 sentence)                                                             | Source          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------- |
| Umiejętności i przypisanie | Czas i pieniądze: Kto ma więcej, Zegar; Liczby: Krzyżówka, Kto ma więcej, Labirynt liczbowy; Logika: 6 kart; Rysowanie: 5; Spostrzegawczość: 5 (pełna tabela w planie) | Umiejętność pasuje, gdy rodzic się nie zdziwi.                               | Roadmapa (#457) |
| Filtr                      | Chipy, jeden wybór, „Wszystkie” domyślne, karta z dwiema pod obiema                                                                                                    | Makieta; sekcje zmuszały do jednego tagu na kartę.                           | Roadmapa (#457) |
| Pamięć wyboru              | Brak: nowe wejście i powrót Wstecz (także z pamięci przeglądarki) to zawsze „Wszystkie”                                                                                | Decyzja użytkowniczki; adres strony się nie zmienia.                         | Plan            |
| Nazwa                      | „umiejętność”, w kodzie `CARD_SKILLS`, `CardKind.skills`                                                                                                               | „Tag” i „kategoria” są już zajęte w glosariuszu.                             | Roadmapa (#457) |
| Kolejność chipów           | „Wszystkie”, potem alfabetycznie                                                                                                                                       | Ta sama zasada co karty i kategorie; nowa umiejętność wpada w swoje miejsce. | Plan            |
| Telefon                    | Chipy zawijają się w dwa rzędy                                                                                                                                         | Wszystkie widać naraz, bez ukrytych chipów.                                  | Plan            |
| Pod nazwą miniatury        | Szary tekst „Logika · Rysowanie”, `aria-hidden`                                                                                                                        | Nie myli się z chipami ani z plakietką; nazwy linków i obecne testy zostają. | Plan            |
| Technika                   | Astro + krótki skrypt jak przy plakietkach, chipy z `buttonVariants`, bez Reacta                                                                                       | Wzór katalogu; bez JS katalog pokazuje wszystko, a chipy są ukryte.          | Plan            |

## Scope

**In scope:** `CARD_SKILLS` i `skills` przy 16 kartach z testem przypisania; szary tekst pod nazwą; chipy i filtr w `CardCatalog.astro`; e2e w `catalog.spec.ts` (komputer i `phone-360`); glosariusz („Umiejętność”, „Katalog”) i PRD (US-05, FR-014, nowy podrozdział Business Logic).

**Out of scope:** zapamiętywanie wyboru (profil, urządzenie, adres); wielokrotny wybór, wyszukiwarka, liczniki na chipach, sekcje; umiejętności w „Jak to działa” (S-53), w oknie profilu (S-52) i na stronach generatorów; `test-plan.md` (S-51).

## Architecture / Approach

Dane w rejestrze kart: lista `CARD_SKILLS` (id + etykieta, kolejność chipów) i pole `skills` typowane po niej, więc nowa karta bez umiejętności nie skompiluje się, a test przypina decyzję. Serwer renderuje wszystkie karty z atrybutem `data-skills` i ukryty rząd chipów; skrypt obok `showBadges` odsłania chipy, przełącza `hidden` na kartach i `aria-pressed` na chipach, a przy `pageshow` wraca do „Wszystkie”.

## Phases at a Glance

| Phase                                        | What it delivers                                                       | Key risk                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1. Umiejętności w rejestrze i na miniaturach | Dane z testem, szara linijka pod nazwą, glosariusz i PRD               | Tekst pod nazwą wpada do nazwy linku i psuje testy plakietek              |
| 2. Chipy i filtr w katalogu                  | Chipy z jednym wyborem, ukrywanie kart, „Wszystkie” przy powrocie, e2e | Druga „lista” w drzewie dostępności łamie test kolejności; układ telefonu |

**Prerequisites:** decyzje S-43 w `main` (PR #457); S-47 („Cienie”) prawie gotowe — karta jest już w rejestrze, możliwy konflikt w `src/lib/cards.ts`, jeśli S-47 jeszcze go zmieni.
**Estimated effort:** ~1–2 sesje, dwie fazy, dwa PR-y.

## Open Risks & Assumptions

- Rząd chipów pojawia się po uruchomieniu skryptu, więc na wolnym telefonie może lekko przesunąć miniatury przy ładowaniu.
- Nowa karta w przyszłości musi dostać umiejętność; pilnuje tego typ i test, ale wybór umiejętności to decyzja produktowa przy każdej nowej karcie.

## Success Criteria (Summary)

- Rodzic jednym kliknięciem widzi tylko karty z wybraną umiejętnością i jednym kliknięciem wraca do wszystkich, także na telefonie.
- Pod każdą miniaturą widać, co karta ćwiczy, a plakietki poziomu działają jak dotąd.
- Nowe wejście i powrót na stronę główną zawsze pokazują wszystkie karty.
