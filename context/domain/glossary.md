---
title: Słownik domeny PrintoKids dla agentów
created: 2026-11-03
type: glossary
---

# Słownik domeny (dla agentów)

Krótko: termin, znaczenie, nazwa w kodzie, jak tego NIE nazywać. Uzasadnienia i dowody są w `01-domain-distillation.md`.

## Karty

| Termin | Znaczy | W kodzie | Nie nazywaj |
|---|---|---|---|
| Rodzaj karty | typ generatora ze stroną i adresem | `CardKind`, `CARD_KINDS` (`src/lib/cards.ts`); id: `labirynt`, `symetria`, `sudoku`, `sekwencje`, `nonogram`, `dyktando`, `pieniadze` | „typ", „moduł", „worksheet" |
| Karta (wygenerowana) | jedna kartka A4 z jedną sprawdzalną odpowiedzią | `SymmetryCard`, `SequenceCard`, `NonogramCard`, `DictationCard`, `MoneyCard`, `SudokuCard`; dla labiryntu `Maze` | „arkusz" (to jest układ druku), „strona" (to jest `CardPage`) |
| Labirynt | karta z jedną drogą od startu do mety | `Maze`, `generateMaze`, `mazeForSheet`; komponent historycznie `WorksheetGenerator` | „worksheet" jako nazwa karty |
| Strona karty | strona generatora z paskiem, Generuj, Drukuj | `CardPage`, `useCardPage` | „karta" |
| Arkusz / druk | układ A4 w mm, margines 10 mm | `*_SHEET` w `src/lib/<karta>/sheet.ts`, `src/lib/sheet/` | „karta" |
| Jedna sprawdzalna odpowiedź | aplikacja zna i sprawdza odpowiedź; karta łamiąca regułę nie jest pokazana | funkcje `*Problems` (`symmetryCardProblems`, `sequenceRowProblems`, `sudokuCardProblems`, `nonogramCardProblems`, `dictationCardProblems`, `moneyCardProblems`); labirynt: `mazeForSheet` | „walidacja UI", „ocena rysunku dziecka" (aplikacja nie ocenia rysunku) |
| Dwuznaczność | do luki pasują dwie reguły z różnymi odpowiedziami | `"ambiguous"`, `sequenceAnswers`, `hypotheses` | „konflikt" |

## Poziomy

| Termin | Znaczy | W kodzie | Nie nazywaj |
|---|---|---|---|
| Poziom | trudność w obrębie jednej karty; poziomy kart nie są porównywalne | `Level` (labirynt), `SymmetryLevel`, `SequenceLevel`, `DictationLevel`, `MoneyLevel`, `NonogramSize`, `SudokuLevelId` | „wiek", „klasa" |
| Id poziomu `latN` | stary identyfikator z wiekiem; zostaje w danych. `lat5` = Poziom 3 labiryntu, Poziom 2 symetrii i sekwencji, „łatwy" dyktanda | `maze/levels.ts`, `symmetry/levels.ts`, `sequence/levels.ts`, `dictation/levels.ts` | nie tłumacz `latN` na wiek ani nie porównuj `lat5` między kartami |
| Rozmiar sudoku | wymiar planszy 4×4, 6×6, 9×9 | `SudokuSize` | „poziom" |
| Rozmiar nonogramu | **to jest poziom** (łatwy, średni, trudny) | `NonogramSize`, `NonogramSizeId` | „rozmiar planszy" |
| Dawna nazwa / typowy wiek | dopisek pod opisem poziomu; nie etykieta | `typicalAge` | „nazwa poziomu" |

## Obiekty i symbole

| Termin | Znaczy | W kodzie | Nie nazywaj |
|---|---|---|---|
| Szablon obiektu | połowa symetrycznego obiektu, części losowane, 3 rozmiary | `SymmetryTemplate`, `SymmetryPart`, `SymmetryObjectSizes`, `symmetry/templates.ts`, `symmetry/objects/*` | „obrazek", „bitmapa" |
| Kategoria obiektów | Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny, Domy i budowle, Kształty; „Wszystkie" jest osobną kategorią | `OBJECT_CATEGORIES`, `ObjectCategoryChoiceId`, id `wszystkie`, `zwierzeta`, `jedzenie`, `przyroda`, `kosmos`, `budowle`, `ksztalty` | „tag", „filtr", „wiele kategorii naraz" |
| Dziura / detal | pusta kratka w sylwetce (okno, oko) | `details`, `holeColor` | „wzór", „wnętrze" |
| Kształt (sekwencje) | element ciągu (7 wartości) | `SequenceShape`, `SEQUENCE_SHAPES` | „symbol sudoku" |
| Kształt (sudoku) | symbol planszy (9 wartości) | `SudokuShapeId`, `SUDOKU_SHAPES` | „kształt sekwencji" |
| Kształt dyktanda | ręcznie rysowana sylwetka bez symetrii | `DictationShape`, `DICTATION_SHAPES` | „obiekt" z katalogu szablonów |
| Kategoria „Kształty" | figury geometryczne w katalogu szablonów | id `ksztalty`, `symmetry/objects/ksztalty.ts` | „kształty dyktanda" |
| Kredka / kolory | prawdziwy kolor kratki lub kształtu, osobny przełącznik, bez liter | `SYMMETRY_COLORS` (8), `SEQUENCE_CRAYONS` (9), `SUDOKU_SHAPE_COLORS` (9), tokeny `--symmetry-*` | „paleta motywu" |
| Znaczek | biały/szary/czarny kwadracik z liczbą kratek w łatwym nonogramie | `Tone`, `ToneRun`, `kind: "znaczki"` | „liczba" |
| Pokaż rozwiązanie | podgląd odpowiedzi na ekranie, nigdy w druku, nie zapamiętywany | komponenty nonogramu i dyktanda; poza `CardSettingsMap` | „ustawienie karty" |
| Kupka, nominał, remis, mylenie liczbą sztuk | pojęcia karty „Kto ma więcej?" | `pileValue`, `isMisleading`, `MAX_TIE_ROWS`, `MoneyAnswer` (`left`/`right`/`equal`) | „cena", „reszta" |

## Postać i profil

| Termin | Znaczy | W kodzie | Nie nazywaj |
|---|---|---|---|
| Postać | kolorowy obrazek z katalogu 11 lub własny; stoi przy starcie (labirynt) albo przy poleceniu | `CHARACTER_CHOICES`, `SheetCharacterId` | „avatar", „maskotka" |
| Bez postaci | brak postaci; etykieta UI „Brak" zostaje (decyzja 2026-11-03), PRD mówi „Bez postaci" | `id: "none"` w `sheet/character.ts` | `NO_PROFILE` (to jest brak profilu) |
| Własny obrazek | obrazek rodzica (np. zdjęcie), zostaje w przeglądarce; docelowa etykieta UI „Własny obrazek" (decyzja 2026-11-03) | `OWN_IMAGE_ID = "wlasne"`; `OWN_IMAGE_LABEL` w kodzie nadal „Własne zdjęcie" do zmiany | „upload" (nic nie jest wysyłane), „Własne zdjęcie" jako etykieta |
| Dymek / pas | postać mówi polecenie | `SPEECH_BAND`, `layoutSpeechBand` | „tooltip" |
| Profil dziecka | imię, ulubiona postać, ustawienia kart; opcjonalny, lokalny | `ChildProfile` | „konto", „użytkownik" |
| Bez profilu | jawny wybór braku profilu | `NO_PROFILE = "none"` w `active-profile.ts` | „brak postaci" |
| Ulubiona postać | postać profilu; zmiana tylko jawna | `ChildProfile.character`, `withFavorite` | „ostatnia postać" |
| Ostatnie parametry | pamięć urządzenia bez profilu: ustawienia osobno per karta, jedna postać wspólna | `LastUsed`, `readLastUsed`, `writeLastUsedCards` | „domyślne" (domyślne to `DEFAULTS` w `card-settings.ts`) |
| Ustawienia karty | część paska, którą pamięta profil: poziom, kolory, kategoria, rozmiar i symbole sudoku | `CardSettingsMap`, `CardSettingsId`, `withCardSettings` | „preferencje" |
| Pasek | wiersz kontrolek strony karty | brak jednego typu; `ProfileBar`, `BarChoice` dotyczą postaci | „toolbar" |
| Wizyta | otwarcie strony ze stanem profilu (termin tylko w kodzie) | `openingVisit`, `useChildProfileVisit` | „sesja" |
| Plakietka / podsumowanie | zapamiętany poziom na miniaturze i w oknie profilu | `CardSummary`, `cardSummaries`, `catalogBadges` | „tag" |
| Katalog | strona główna z miniaturami rodzajów | `CardCatalog.astro`, `cardsInCatalogOrder` | „lista kart" |

## Czego jeszcze nie ma w kodzie

| Termin | Stan |
|---|---|
| „Który nie pasuje", „Skopiuj rysunek na kratce", „Szlaczki" | zaplanowane (M-5, `roadmap.md` S-34..S-36, status `ready`); nie twórz ich nazw w kodzie bez otwartego kamienia |
| „Zacznij od nowa" (FR-032) | brak, priorytet nice-to-have |
