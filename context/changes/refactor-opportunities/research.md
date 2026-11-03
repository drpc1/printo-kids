---
date: 2026-11-03T10:55:00+01:00
researcher: Claude (Sonnet 5.5), na zlecenie drpc1
git_commit: 9baea319bff9b1828df01e2ddab101212316fe70
branch: docs/refactor-opportunities
repository: printo-kids
topic: "Które długi techniczne ustawień kart warto naprawić i w jakiej kolejności (refactor opportunities)"
tags: [research, refactor-opportunities, card-settings, child-profiles, localStorage, card-registry, WorksheetGenerator, verified]
status: complete
last_updated: 2026-11-03
last_updated_by: Claude (Sonnet 5.5), weryfikacja ast-grep
verified_at_commit: 9baea319bff9b1828df01e2ddab101212316fe70
verification_tool: ast-grep 0.51.1
---

# Research: refactor opportunities w obszarze ustawień kart i profilu dziecka

**Date**: 2026-11-03
**Git Commit**: 9baea31 (gałąź `docs/refactor-opportunities`; w drzewie tylko nieśledzone pliki `context/`, `arena-cover.png`)
**Repository**: printo-kids

## Research Question

Które problemy zapisane w `context/changes/profile-settings-flow/research.md` zmieniłyby strukturę kodu po naprawie (kandydaci), jaki kształt mają dziś, DLACZEGO go mają, jak wykonalna jest inkrementalna migracja, i które 2–3 są najmocniejsze. Eksploracja: bez zmian w kodzie, bez decyzji (ta zapada w osobnej sesji planowania).

## Metoda

- Raport `profile-settings-flow` i `context/map/repo-mapv2.md` potraktowane jako priory. `lessons.md` ma jeden wpis (druk iOS), nieistotny tu.
- Trzy sub-agenty tylko do odczytu, każdy dla wszystkich czterech kandydatów: (1) obecny kształt, (2) historia i intencjonalność (archiwum `context/archive`, gh, `git log`), (3) wykonalność migracji i osłony (CI, `package.json`, depcruise, Playwright).
- Sam sprawdziłem grepem: pięć wywołań `writeChildProfiles` (`ProfileCorner.tsx:187, 255, 300`, `useCardSettings.ts:85`, `useFavoriteCharacter.ts:38`), długości plików (`ProfileCorner.tsx` 698 linii, `WorksheetGenerator.tsx` 277) i sklejony token w `package.json:12`. Reszta twierdzeń pochodzi z raportów sub-agentów i jest oznaczona jako [E] (evidence, dowód w kodzie lub dokumencie), [I] (inference) albo [U] (unknown).
- Nie uruchamiano `npm test`, Playwrighta ani przeglądarki. Dane zdalne (urządzenia użytkowniczki) są poza zasięgiem.

---

# 1. Lista problemów i klasyfikacja (do audytu)

KANDYDAT = naprawa zmienia strukturę kodu. Reszta zostaje wejściem do kosztu i osłon.

| ID z raportu | Problem | Klasyfikacja |
|---|---|---|
| TD-1 | Usunięcie i utworzenie profilu zapisują ze stanu Reacta, nie ze świeżego odczytu | **K1** (źródło: brak jednej ścieżki zapisu). Lokalna łatka dwóch linii byłaby niestrukturalna. |
| TD-2 | `remember` łączy patch ze stanem lokalnym | **K1** |
| TD-3 | Cicha porażka zapisu | **K1** (przepływ wyniku); sama widoczność błędu na pasku to decyzja produktowa |
| TD-4 | Dwóch piszących do `last-used` z różną semantyką pól | **K1** |
| TD-8a | Strony kart nie nasłuchują `storage` | **K1** (opcjonalne rozszerzenie) |
| TD-11 (część) | `ProfileCorner` ~698 linii, UI zmieszany z zapisem | **K1** (wyciągnięcie persystencji) |
| TD-5 | Trzy rejestry kart i rzutowanie `as CardSettingsId` | **K2** |
| TD-12 | Ręczne listy przy dodaniu karty | **K2** (część wywodliwa z rejestru); reszta to wejście do kosztu |
| §1.5 | Hub `card-settings.ts` (zamknięcie 31 modułów) | **K2** |
| TD-6 | Labirynt duplikuje logikę paska postaci | **K3** |
| TD-9 | Dwa timery notatki, `memory.note ?? favorite.note` w 7 z 7 generatorów | **K3** (dodatek, nie osobny kandydat) |
| TD-7 | Migracja starego `level` rozproszona | **K4** |
| TD-8b | Katalog nie filtruje `event.key` | Nie kandydat: lokalna poprawka |
| TD-10 | Literówka w `package.json` `scripts.test` | Nie kandydat: konfiguracja; wejście do osłon K2 |
| TD-11 (reszta) | Brak testów hooków i komponentów, seedy surowym JSON-em | Nie kandydat: wejście do osłon |
| Niska waga | Brak jednego opisu „bezpiecznych” ścieżek zapisu | Nie kandydat: dokumentacja (znika po K1) |
| Open Q 1–3 | Świeży odczyt w `ProfileCorner`, widoczność błędu zapisu, wygaszenie migracji | Nie kandydaci: decyzje do planowania |

---

# 2. Kandydaci

## K1. Rozproszone zapisy do `localStorage` (read-modify-write w UI i hookach)

### Obecny kształt
- [E] Dostęp do API `Storage` mają tylko 4 moduły `lib` (`active-profile.ts`, `child-profiles.ts`, `last-used.ts`, `sheet/own-image-store.ts`), na wstrzykniętym obiekcie. Globalny `localStorage` przekazują 6 plików TS/TSX (`ProfileCorner.tsx`, `useChildProfileVisit.ts`, `useCardSettings.ts`, `useBarCharacter.ts`, `WorksheetGenerator.tsx`, `useFavoriteCharacter.ts`) i `CardCatalog.astro:43`.
- [E] Lista profili jest zapisywana w 5 miejscach nietestowego kodu; 3 z nich poprzedza świeży odczyt (`useCardSettings.ts:79→85`, `useFavoriteCharacter.ts:31→38`, `ProfileCorner.tsx:244→255`), 2 nie (`ProfileCorner.tsx:187`, `:300`; lista ze stanu `profiles`). W usuwaniu odczytywane świeżo są tylko `last-used` i `active-profile` (`:183-184`), a do `visitAfterDelete` idzie postać z paska, nie z odczytu (`:182`).
- [E] Czyste transformacje już istnieją (`withFavorite`, `withProfileCards`, `profileToCreate`, `visitAfterDelete`, `openingVisit`, `child-profiles.ts`). Brakuje funkcji składającej „świeży odczyt → transformacja → zapis → wynik”; każdy wołający robi to sam. Ulubiona ma dwie niezależne implementacje (`ProfileCorner.saveFavorite` `:237-262` i `useFavoriteCharacter.save` `:26-44`).
- [E] Wynik `false` z zapisu: `useCardSettings.persist` pomija `replaceProfiles` i notatkę bez błędu, a wynik `writeLastUsedCards` jest ignorowany (`useCardSettings.ts:75`). Błędy widoczne dla użytkownika ma tylko `ProfileCorner` (`favoriteError`, `deleteError`, `formError`, `fileError`).
- [E] `ProfileCorner.tsx` łączy: maszynę paneli i render, persystencję (`confirmDelete` `:174-203`, `saveFavorite`, `handleCreate`), walidację i reguły domenowe, obsługę pliku obrazu (`CharacterChoiceRows`, `writeOwnImage` `:619`), `ProfileSummary` oraz eksport `DIALOG_ROW_CLASS`, importowany przez 3 pliki: `LevelChoice.tsx:5`, `LevelChoiceRows.tsx:2`, `CharacterChoiceControl.tsx:5` (raport: tylko `LevelChoice.tsx:5`).
- [E] Zależności warstwowe w `lib` nieobecne w raporcie źródłowym: `child-profiles.ts:4` → `own-image-store.ts` → `last-used.ts` → `card-settings.ts`; `recordBarCharacter` (zapis `last-used`) leży w module `own-image-store`. Depcruise: 0 cykli.
- [E] Dwa writery `last-used`: `writeLastUsed` zapisuje wyłącznie `{character}` lub `{character, cards}` (gubi inne pola), `writeLastUsedCards` zachowuje pola i kasuje `level` (`last-used.ts:55-56`). Cztery strukturalnie podobne interfejsy `Storage` (po jednym w każdym z 4 modułów).

### Werdykt intencjonalności: częściowo świadome, częściowo przypadkowe
- [E] Świeży odczyt przed zapisem to decyzja nośna: `context/archive/2026-10-26-card-settings-memory/plan.md:120` (zapis z jednej karty przeglądarki nie ma nadpisać zmian z drugiej), wprowadzone w `beece63`. `test-plan.md:43` (ryzyko 5) uznaje „zapis z jednej otwartej strony cofa zmianę zrobioną na drugiej” za ryzyko wysokie.
- [E] Wzorzec rozszerzano punktowo przez review, nie z jednej zasady: okno profilu dostało świeży odczyt dopiero po ostrzeżeniu review (`2026-10-27-favorite-character-explicit/reviews/impl-review.md`, poprawka `c4ed851`).
- [E] Dwa writery `last-used` to decyzja planu (`card-settings-memory/plan.md:80`, `plan-review.md:25`), żeby nie ruszać `recordBarCharacter`. Różnica w obsłudze nieznanych pól nie ma uzasadnienia w dokumentach [I: skutek uboczny].
- [E] Cichy upadek zapisu, gdy profil zniknął w innej karcie: `card-settings-memory/reviews/impl-review.md` F3, „Rzadkie i nieszkodliwe”, decyzja PENDING. Porażka quoty nie była rozważana [U].
- [E] Brak nasłuchu `storage` na stronach kart: gh234 impl-review stwierdza fakt i naprawia tylko katalog (`follow-ups/review-fixes.md` F1).
- [I] `ProfileCorner.tsx:187, :300` (zapis ze stanu): w archiwum nie ma decyzji za takim kształtem [U]; wygląda na lukę, bo review objęło tylko `saveFavorite`.
- [U] Wspólna warstwa lub store nie była rozważana ani odrzucona (grep archiwum: brak).
- PRD: lokalność danych i wczytywanie starych profili (US-08, NFR) nie dyktują sposobu zapisu. Świeży odczyt w `:187/:300` domyka znane ryzyko, nie zmienia wymogu. Nowy komunikat o porażce zapisu na pasku byłby nowym zachowaniem UI (US-22), czyli decyzją produktową.

### Wykonalność
- Istniejąca abstrakcja wystarcza w połowie: czyste transformacje i wstrzykiwany `Storage` są. Nowa abstrakcja jest mała: np. `updateProfiles(storage, fn) → {ok, profiles}` i analogiczne `updateLastUsed`, w `src/lib` ([I], nazwa kształtu: lokalny store z wynikiem).
- Blast radius [E]: 4 pliki `lib` + 3 hooki + `ProfileCorner.tsx` ≈ 8 plików nietestowych. Krok naprawiający TD-1 dotyka 1 pliku. Format danych na dysku się nie zmienia, więc seedy e2e (≥10 plików z `setItem`) nie wymagają zmian.
- Osłony [E]: `lib` dobrze (`child-profiles.test.ts` z quotą i wyjątkami, `last-used.test.ts`, `active-profile`, `catalog-badges`). Hooki i komponenty tylko e2e (`card-settings.spec.ts`, `profile-summary.spec.ts:115, 212, 241`, `favorite-character.spec.ts:51-133`, `catalog.spec.ts:346, 413`). W repo nie ma jsdom/happy-dom/testing-library ani żadnego `*.test.tsx` (grep po `package.json`, `src`, `tests`); runner to `node --test` na plikach `src/lib/**` i 3 `scripts/*.test.mjs`. Nic nie pokrywa: porażki zapisu w UI, TD-1 (dwie zakładki).
- Depcruise ma tylko reguły generyczne (`no-circular` jako warn, `not-to-test` itd.); nowa granica „storage tylko w `lib`” nie jest pilnowana. Globalny identyfikator `localStorage` nie jest importem, więc wymagałby reguły ESLint `no-restricted-globals` [I].
- Ryzyko: scalenie dwóch writerów zmienia semantykę (testy `last-used.test.ts:143, :158, :209` kodują obecne zachowanie).
- Pierwszy krok: test w `lib` z `memoryStorage` dla nowej funkcji (profil znika między odczytem a zapisem; storage rzuca wyjątek → `ok=false`; dwóch piszących nie gubi pól), potem przepięcie jednego wywołania (`:187` lub `:300`), co jednocześnie naprawia TD-1. Rozmiar: S (funkcja + test), M (5 miejsc + scalenie writerów). Odwracalność wysoka.

## K2. Rejestry kart (CARD_KINDS, CARD_SETTINGS_IDS, `card-summary`) i ręczne listy

### Obecny kształt
- [E] `CARD_KINDS` (`cards.ts:10-67`, 7 wpisów, plik bez żadnych importów, `id: string`); `CardSettingsMap`/`CARD_SETTINGS_IDS` (`card-settings.ts:57-77`); `DEFAULTS` (mapped type, brak klucza = błąd kompilacji); `levelIds` (`:191-208`, switch bez `default`); `summaryParts` w `card-summary.ts:52-108` ze switchem na `cardId as CardSettingsId` (`:54`) i `default: return null` (`:105`). Łączy je wyłącznie string `id`.
- [E] Wymuszenie: `DEFAULTS` typem; `CARD_SETTINGS_IDS` tylko testem `card-settings.test.ts:32-37` (zgodność z `CARD_KINDS`); `summaryParts` nie jest wymuszony (`default` łapie wszystko; `card-summary.test.ts` jest w dużej mierze tautologiczny, bo `cardSummaries` mapuje `CARD_KINDS`).
- [E] Ręczne listy bez powiązania z `CARD_KINDS`: `print-contract.test.ts` (stałe ścieżek `:9-25`, listy `:326-360`, czyta źródła z dysku, 0 odwołań do `cards.ts`); `scripts/build-thumbnails.mjs` (osobny blok na kartę, ścieżki wyjściowe zahardkodowane; nie czyta `cards.ts`); `package.json` `scripts.test`; tabele e2e (`card-settings.spec.ts:~67-71`, `phone-settings-rows.spec.ts:~135`, `profile-summary.spec.ts:25-26, 96-97`). `phone-layout.spec.ts` (`SEEDED_CARDS`) nie wymaga wiersza dla nowej karty (komentarz w pliku). Brak testu istnienia pliku miniatury. Cztery różne kolejności kart w użyciu.
- [E] Automatyzacja już jest częściowa: katalog, „Jak to działa” i smoke czytają `CARD_KINDS` lub HTML katalogu.

### Werdykt intencjonalności: przypadkowa złożoność przyjęta jako konwencja
- [E] Rejestry powstały osobno: `53d44fa` (katalog), `c4bb6c4` (ustawienia), `156d203` (podsumowanie, stąd rzutowanie).
- [E] Scalenie rozważono i uznano za zbędne: `2026-11-01-coins-who-has-more/frame.md` — hipoteza „wspólny kod jest ryzykiem” oceniona WEAK, lista miejsc opisana jako konwencja („karta wchodzi jednym wzorcem”). `bb77f5a` pokazuje realny koszt dodania karty (16 plików).
- [E] Roadmapa M-5 zapowiada kolejne karty na tym samym wzorcu (`roadmap.md:23-36`), więc koszt będzie ponoszony dalej. Dlaczego `card-settings.ts` nie czerpie id z `cards.ts`: [U] (cyklu nie ma, `cards.ts` nie importuje nic).
- PRD dotyka rejestru wąsko (US-05: opis rodzaju żyje w `CARD_KINDS`).

### Wykonalność
- [E] Ograniczenie: gdyby jedną definicję z `levels` i `defaults` umieścić w `cards.ts` (liściu), 7 stron `.astro` i `how-it-works.astro` ciągnęłyby zamknięcie 31 modułów. [I] Dlatego kształt docelowy to dwie warstwy: czysty `cards.ts` (prezentacja) + `Record<CardSettingsId, CardConfig>` w osobnym module, z którego wywodzą się `CARD_SETTINGS_IDS`, `DEFAULTS`, `levelIds`, `summaryParts` (kompilator wymusza brakujący wpis).
- [E] `.mjs` może importować `.ts` (build-thumbnails już robi to z jawnym rozszerzeniem przez `--experimental-strip-types`), ale generatory miniatur są ręczne per karta, więc wywodzenie dotyczyłoby tylko ścieżek.
- Blast radius [E]: wywodzenie z jednej definicji obejmuje 4 miejsca w 2 plikach `lib` + ich testy. `print-contract.test.ts` i tabele e2e to hardkodowane stałe; ich objęcie to osobny, większy krok (L, niska–średnia odwracalność).
- Pierwszy krok (S): test w `lib`, że dla każdego id z `CARD_KINDS` karta zapisana w profilu daje `used: true` (łapie cichy `default`), oraz poprawa literówki z `package.json:12`. Uwaga: po naprawie literówki `analytics.test.ts` uruchomi się w CI po raz pierwszy i może być czerwony [U]; zmiana `package.json` uruchamia wszystkie 3 joby CI.

## K3. Labirynt nie używa `useCardPage` i powiela logikę paska postaci

### Obecny kształt
- [E] `WorksheetGenerator.tsx` (277 linii) używa już `CardPage`, `useChildProfileVisit` (`:35`), `useCardSettings("labirynt")` (`:37`), `useFavoriteCharacter` (`:41` (raport: `:39`)). Powiela stan i handlery z `useBarCharacter.ts` linia w linię: `useState` postaci i obrazka (`:39-40` vs `:31-32` (raport: `:35-36`)), etykieta i miniatura (`:47-49`), `select` (`:79-91` vs `:39-51` (raport: `:45-62`)), `setOwnImage` (`:93-97` vs `:53-57` (raport: `:64-68`)), `applyBar` (`:104-111` vs `:59-66` (raport: `:70-77`)), wyrażenie `characterSrc`. `useCardPage` robi to samo dla 6 generatorów.
- [E] Różnice, których raport nie notował: labirynt nie przekazuje `newProfileCards` do `CardPage` (komentarz `CardPage.tsx:45`: nowy profil z labiryntu startuje z domyślnym poziomem); ma lokalną kontrolkę poziomu `LevelChoiceControl` (`:155-192`) zamiast `LevelChoice` i nie ma `disabled={waitingForChild}` ani strażnika `waitingForChild` przy zmianie poziomu (`:99-102`); `printDisabled={maze === null}`. Czy brak `disabled` powoduje realny błąd: [U].
- [E] Plik łączy też orkiestrację hooków, generowanie z przerysowaniem i render SVG labiryntu (`MazeSheet` `:194-277`).
- Powiązanie: co-change `ProfileCorner.tsx`+`WorksheetGenerator.tsx` 16 / 27 / 38 wspólnych/A/B commitów (raport źródłowy §1.6).

### Werdykt intencjonalności: świadome w momencie decyzji, uzasadnienie wygasło
- [E] gh192 (`2026-10-30-gh192-pages-sceleton/plan.md:35`): „Labirynt zostaje przy własnym stanie postaci i nie przechodzi na useBarCharacter”; `research.md:66`: powód to `recordBarCharacter(..., level)` zależne od poziomu, który żył poza mapą kart; issue zabraniało wciągania labiryntu do `CardSettingsMap`.
- [E] gh237 (`ad46d2f`, `10a7d2a`, 2026-10-31) usunął tę przyczynę (poziom do `cards.labirynt`, `recordBarCharacter` bez poziomu). Plan, brief ani review gh237 nie wracają do pytania o `useBarCharacter` (grep). Zapisu „zostaje na później” brak [U].
- PRD nie dotyka (US-01/US-03 opisują zachowanie). Zmiana jest strukturalna, o ile zachowa postać nad startem na Poziomie 6 i US-08.

### Wykonalność
- Istniejąca abstrakcja wystarcza [E]: kształt `{character, ownImageHref}` przyjmowany przez `useFavoriteCharacter` jest już zgodny; `onApply` w `useCardPage` i lokalny `applyProfileBar` mają identyczny kod. Cel: `useCardPage()` w labiryncie, usunięcie ok. 35–40 linii.
- Blast radius [E]: 1 plik produkcyjny. `print-contract.test.ts` czyta `WorksheetGenerator.tsx` jako tekst (`:49`, `:91`); klasy `print:*` nie zmieniają się. Test „każda strona poza labiryntem ma pasek Postać” celowo pomija labirynt.
- Osłony [E]: tylko e2e labiryntu (`level-bar`, `card-settings`, `phone-layout`, `own-image`, `favorite-character`, `profile-summary`, `catalog`); `print-margins.spec.ts` sprawdza `max-height` w stylu `print` w jednym projekcie, nie drukuje strony. Brak testów jednostkowych hooków.
- Pierwszy krok: sprawdzić, czy e2e dla `/maze` pokrywa „zmiana postaci przy aktywnym profilu nie zmienia ulubionej, bez profilu zapisuje `last-used`” (`own-image.spec.ts`; zawartość [U]), i dopiero potem podmienić. Rozmiar S–M, odwracalność wysoka (jeden commit).
- Nie obejmuje różnic z `newProfileCards` i `LevelChoice`: to osobne decyzje (zachowanie nowego profilu, UI poziomów), nie czyste przeniesienie.

## K4. Migracja starego top-level `level` rozproszona

### Obecny kształt
- [E] Raport mówił o „czterech miejscach”; w kodzie to jedna definicja czytająca (`card-settings.ts:139-157`, `parseStoredCards`) + 2 wywołania (`child-profiles.ts:282`, `last-used.ts:79`) + 1 `delete stored.level` (`last-used.ts:55`). `catalog-badges.ts` nie ma kodu migracji (tylko test).
- [E] Migracja jest leniwa: odczyt nie zapisuje; format na dysku zmienia dopiero kolejny zapis. Brak wersji schematu w danych.
- [E] Testy: `card-settings.test.ts:203-245`, `child-profiles.test.ts:622-710`, `last-used.test.ts:84-123, 157-168, 208-219`, `catalog-badges.test.ts:41-43` (4 pliki, ok. 12–14 testów); seedy e2e z `level` na wierzchu w 9 plikach (ok. 21 linii; `catalog.spec.ts`, `card-settings.spec.ts`, `level-bar.spec.ts`, `own-image.spec.ts`, `phone-layout.spec.ts:541`, `profile-summary.spec.ts:21` i inne), często jako skrót „profil z poziomem labiryntu”, nie test migracji. Cztery kopie `isRecord` w `lib`.

### Werdykt: świadome ograniczenie (decyzja nośna), zgodne z PRD
- [E] `2026-10-31-gh237-maze-level/plan.md:20, 37-40`: brak jednorazowej migracji przy starcie, brak zapisu podwójnego, `cards.labirynt.level` wygrywa (rollback). PRD US-08 i Business Logic „Zgodność wstecz” wymagają wczytywania starych danych; `AGENTS.md` to powtarza.
- [U] Brak daty ani kryterium wygaszenia w dokumentach.

### Wykonalność i granica
- Centralizacja (zebranie `delete`/przepisywania w jednym module) to S, odwracalna, bez zmiany zachowania; istniejące testy ją charakteryzują [E]. Zysk niski [I].
- Wygaszenie to zmiana wymogu US-08 i Business Logic, czyli **decyzja produktowa, nie strukturalna**. Zatrzymuję analizę tutaj: zależy od danych na urządzeniach rodziców, których z repo nie da się zweryfikować [U]. Bezpieczny zarys: najpierw przepisać seedy e2e na `cards.labirynt.level`, dopiero potem usunąć kod.

---

# 3. Refactor opportunities

Ranking jest propozycją dla osobnej sesji planowania. Ocena z dowodów; koszt i zysk opisowe [I].

## 1. K1 — jedna ścieżka zapisu profili i `last-used` w `src/lib`

- **Obecny → docelowy**: 5 miejsc składających ręcznie „odczyt → transformacja → zapis” w hookach i `ProfileCorner` (3 świeże, 2 ze stanu), dwóch writerów `last-used`, wyniki `false` gubione → funkcje `updateProfiles`/`updateLastUsed` w `lib` (świeży odczyt, transformacja, zapis, `{ok}`), wołane z cienkich hooków; `ProfileCorner` traci kod zapisu.
- **Dlaczego tu**: jedyny kandydat z realną usterką użytkownika (TD-1: stara zakładka nadpisuje usunięcie lub dodanie profilu), którą `test-plan.md:43` uznaje za wysokie ryzyko, a historia pokazuje lukę po fakcie, nie decyzję. Koszt zmiany mały i inkrementalny (format danych bez zmian), a obszar jest najgęstszy w poprawkach (repo-map: 12 z 58 commitów profilu to `fix`).
- **Blast radius**: ≈8 plików nietestowych; krok TD-1 to 1 plik; seedy e2e bez zmian.
- **Ścieżka**: (1) test charakteryzujący w `lib` + nowa funkcja obok starych; (2) przepięcie `ProfileCorner.tsx:187`/`:300` (naprawa TD-1); (3) przepięcie `useCardSettings`, `useFavoriteCharacter`, `saveFavorite` (usuwa podwójną implementację ulubionej); (4) scalenie writerów `last-used` ze świadomą decyzją o gubieniu nieznanych pól; (5) opcjonalnie reguła ESLint `no-restricted-globals` dla `src/components` i `src/hooks`.
- **Pierwszy krok**: test w `lib` dla funkcji RMW na `memoryStorage` (znikający profil, wyjątek storage, dwóch piszących). Do rozstrzygnięcia w planowaniu (nie tu): czy porażka zapisu ma być widoczna na pasku (to decyzja produktowa).
- **Luka osłon**: brak e2e na scenariusz dwóch zakładek; hooków nie da się testować bez nowej zależności, więc logika ma zostać w czystych funkcjach `lib`.

## 2. K2 — jedna definicja ustawień karty zamiast trzech rejestrów (zaczynając od strażnika)

- **Obecny → docelowy**: `CARD_SETTINGS_IDS` + `DEFAULTS` + `levelIds` + `summaryParts` spięte stringiem i testem → `Record<CardSettingsId, CardConfig>` w osobnym module (bez dotykania `cards.ts`, żeby strony `.astro` nie ciągnęły zamknięcia 31 modułów); `print-contract`, miniatury i tabele e2e na razie bez zmian.
- **Dlaczego tu**: dodanie karty kosztuje dziś 12 kroków (16 plików przy `bb77f5a`), a M-5 zapowiada kolejne karty; jedyny cichy defekt (brak case'a w `summaryParts` → karta bez odznaki) łapie dopiero człowiek. Pierwszy krok jest bardzo tani.
- **Blast radius**: lib: 2 pliki + testy; część L (`print-contract.test.ts`, e2e) wykluczona z pierwszego etapu.
- **Ścieżka**: (1) test „każda karta z `CARD_KINDS` ma wpis w `summaryParts`” + naprawa literówki `package.json:12`; (2) `Record<..>` obok istniejących rejestrów; (3) wywodzenie `CARD_SETTINGS_IDS`, `DEFAULTS`, `levelIds`, `summaryParts` i usunięcie rzutowania; (4) osobno, opcjonalnie: iteracja po rejestrze w `print-contract.test.ts`.
- **Pierwszy krok**: test + literówka (S). Uwaga: `analytics.test.ts` może być czerwony po pierwszym uruchomieniu [U]; zmiana `package.json` uruchamia pełne CI.
- **Zastrzeżenie**: historia traktuje obecny wzorzec jako zaakceptowaną konwencję (frame coins), więc wartość jest przyszła (M-5), nie bieżąca usterka.

## 3. K3 — labirynt na `useCardPage`

- **Obecny → docelowy**: ręczne składanie hooków i ok. 35–40 linii zduplikowanych z `useBarCharacter` w `WorksheetGenerator.tsx` → `useCardPage()` + `useCardSettings("labirynt")`.
- **Dlaczego tu**: uzasadnienie odroczenia (poziom poza mapą kart) wygasło w gh237, a para `ProfileCorner`+`WorksheetGenerator` ma najwyższy co-change. Koszt: 1 plik, jeden odwracalny commit. Zysk średni: jedna edycja zamiast dwóch przy zmianach postaci i ulubionej.
- **Blast radius**: 1 plik produkcyjny; osłona wyłącznie e2e, a druk labiryntu bez testu drukowanej strony (tylko `print-margins.spec.ts` na `max-height`).
- **Ścieżka**: (1) potwierdzić pokrycie e2e `/maze` dla zmiany postaci; (2) podmienić stan postaci na `useBarCharacter` przez `useCardPage`; (3) osobno i świadomie rozstrzygnąć różnice: `newProfileCards`, `LevelChoiceControl` kontra `LevelChoice`, brak strażnika `waitingForChild`.
- **Pierwszy krok**: sprawdzenie asercji w `own-image.spec.ts`/`favorite-character.spec.ts` dla `/maze` (treść [U]).

## Rozważeni i odrzuceni

| Kandydat | Powód |
|---|---|
| K4 centralizacja migracji `level` | Zachowuje się poprawnie, ma najsilniejsze osłony, a zysk mały [I]; wygaszenie jest decyzją produktową (US-08), do osobnej analizy po danych o urządzeniach. |
| TD-8a nasłuch `storage` na stronach kart | Zależy od K1 (store z subskrypcją); bez K1 to doklejanie listenerów do czterech hooków. Nie ma testu ani dowodu w przeglądarce [U]. |
| TD-9 wspólny licznik notatki | Drobny dodatek do K3/K1; jeden hook właściciela notatki w `useCardPage` można dodać przy okazji, nie jest osobnym kandydatem. |
| Rozbicie `ProfileCorner.tsx` (UI, plik, podsumowanie) | Poza persystencją (K1) to czysta zmiana organizacji UI; brak testów komponentów, brak sygnału usterki w dowodach. Do rozważenia po K1. |
| Wspólny rejestr w `cards.ts` | Odrzucony w K2: wciągnąłby zamknięcie 31 modułów do stron `.astro`. |

## Nie kandydaci, ale wejście do planowania
- Literówka `package.json:12` (`analytics.test.tssrc/lib/last-used.test.ts`): `src/lib/analytics.test.ts` istnieje i nie jest wpisany osobno. Co robi `node --test` z nieistniejącą ścieżką: [U].
- Luki testów: brak testów jednostkowych hooków i komponentów; brak e2e na quotę, zepsuty JSON, dwie zakładki; `CatalogProfileCorner.tsx` nie był czytany w tej sesji (źródło: raport).
- Stryker `local-data` mutuje `card-settings.ts`, `active-profile.ts`, `own-image-store.ts`, `speech.ts`, ale nie `child-profiles.ts` ani `last-used.ts` [E]; to opcjonalne narzędzie ręczne, nie bramka CI.
- CI (`.github/workflows/ci.yml`): `lint`, `depcruise`, `npm test`, `astro check`, `build`, plus `smoke` i `e2e` (4 projekty Chromium); zmiany tylko w `context/` pomijają wszystkie trzy joby. ESLint `strictTypeChecked`, tsconfig `strict`.

## Historical Context (from prior changes)

- `context/archive/2026-10-26-card-settings-memory/plan.md:80, :120` i `reviews/impl-review.md` F3 — świeży odczyt, dwóch writerów, cichy upadek (PENDING).
- `context/archive/2026-10-27-favorite-character-explicit/reviews/impl-review.md` — lukę „okno profilu bez świeżego odczytu” naprawiono w `c4ed851`.
- `context/archive/2026-10-31-gh234-profile-on-homepage/reviews/impl-review.md`, `follow-ups/review-fixes.md` — nasłuch tylko w katalogu.
- `context/archive/2026-10-30-gh192-pages-sceleton/plan.md:35`, `research.md:66, 82` — labirynt zostaje przy własnym stanie postaci.
- `context/archive/2026-10-31-gh237-maze-level/plan.md:20, 37-40` — leniwa migracja `level`.
- `context/archive/2026-11-01-coins-who-has-more/frame.md`, `plan.md` Faza 1 — checklista dodawania karty jako konwencja.

## Related Research
- `context/changes/profile-settings-flow/research.md` — źródło długu (TD-1…TD-12).
- `context/map/repo-mapv2.md` — strefy ryzyka (profil, rejestr kart).

## Open Questions
- Czy brak świeżego odczytu w `ProfileCorner.tsx:187/:300` był kiedykolwiek świadomy (archiwum: brak zapisu) [U].
- Czy porażka zapisu ma być widoczna na pasku (decyzja produktowa, US-22).
- Czy `analytics.test.ts` przechodzi po dopisaniu do `scripts.test` [U].
- Czy brak `disabled`/`waitingForChild` w labiryncie to usterka, czy celowa różnica [U].
- Wiek danych w starym formacie na urządzeniach rodziców [U], decyduje o ewentualnym wygaszeniu K4.

---

## Weryfikacja twierdzeń (ast-grep)

Data: 2026-11-03, commit `9baea31` (drzewo bez zmian w `src/` i `tests/`). Narzędzie: ast-grep 0.51.1 (`ast-grep run -l ts|tsx -p '<wzorzec>' <ścieżka>`), każde zero potwierdzone klasycznym `grep`. Poprawki liczb i linii wniesiono do tekstu raportu w formacie „X (raport: Y)”. Sekcji „Refactor opportunities (ranked)” i werdyktów intencjonalności nie zmieniono. Twierdzenia historyczne (commity, archiwum) oraz [I]/[U] nie są strukturalne i nie wchodzą w zakres.

| # | Twierdzenie | Werdykt | Dowód (plik:linia) | Metoda |
|---|---|---|---|---|
| 1 | `writeChildProfiles` wołane w 5 miejscach nietestowego kodu | potwierdzone | `ProfileCorner.tsx:187, 255, 300`; `useCardSettings.ts:85`; `useFavoriteCharacter.ts:38` (definicja `child-profiles.ts:62`; 3 wywołania w testach) | `writeChildProfiles($$$)`; grep `writeChildProfiles(` |
| 2 | 3 z 5 zapisów poprzedza świeży `readChildProfiles` | potwierdzone | `useCardSettings.ts:79→85`, `useFavoriteCharacter.ts:31→38`, `ProfileCorner.tsx:244→255` | `localStorage` w `-l ts`/`-l tsx` + odczyt |
| 3 | `:187` i `:300` zapisują ze stanu; w usuwaniu świeżo czytane są tylko `last-used` i `active-profile` | potwierdzone | `ProfileCorner.tsx:187` (`next.profiles` z `visitAfterDelete(profiles, …)`, odczyty `:183-184`), `:300` (`[...profiles, profile]`) | odczyt `:174-203`, `:296-302` |
| 4 | Ulubiona ma dwie niezależne implementacje | potwierdzone | `ProfileCorner.tsx:237-262` (`saveFavorite`), `useFavoriteCharacter.ts:26-44` (`save`): odczyt → `withFavorite` → zapis | wzorzec z #1 + odczyt |
| 5 | Globalny `localStorage` w 6 plikach TS/TSX + `CardCatalog.astro:43` | potwierdzone | `ProfileCorner.tsx` (11 trafień), `WorksheetGenerator.tsx` (3), `useChildProfileVisit.ts`, `useCardSettings.ts`, `useBarCharacter.ts`, `useFavoriteCharacter.ts`; `CardCatalog.astro:43` | `localStorage` (`-l tsx` dla `.tsx`, `-l ts` dla `.ts`). ast-grep nie parsuje `.astro` (zero), potwierdzone grepem `localStorage` |
| 6 | Dostęp do `Storage` (`getItem`/`setItem`) mają tylko 4 moduły `lib` | doprecyzowane | `active-profile.ts`, `child-profiles.ts`, `last-used.ts` (5× `setItem`, 2× `getItem`), `sheet/own-image-store.ts`; dodatkowo `useChildProfileVisit.ts:141` ma parametr `Pick<Storage, "getItem" \| "setItem">` (tylko typ, wywołań w hooku brak) | `$S.setItem($$$)`, `$S.getItem($$$)`; grep `getItem\|setItem` w `src` |
| 7 | Cztery strukturalnie podobne interfejsy `Storage` | doprecyzowane | `ActiveProfileStorage` (`active-profile.ts:6-10`, z `removeItem`), `ChildProfileStorage` (`child-profiles.ts:9-12`), `LastUsedStorage` (`last-used.ts:6-9`), `OwnImageStorage` (`sheet/own-image-store.ts:8-11`): trzy identyczne (`getItem`+`setItem`), jeden z dodatkowym `removeItem` | `interface $N { $$$ }`; grep `interface .*Storage` |
| 8 | `writeLastUsed` zapisuje wyłącznie `{character}` lub `{character, cards}`; `writeLastUsedCards` zachowuje pola i kasuje `level` | potwierdzone | `last-used.ts:38-49` (`writeLastUsed`, zwraca `void`), `:52-63` (`writeLastUsedCards`, zwraca `boolean`, `delete stored.level` w `:55`) | `delete $X.level` (jedyne trafienie `last-used.ts:55`); odczyt |
| 9 | Wynik `writeLastUsedCards` ignorowany w `useCardSettings.persist` | potwierdzone | `useCardSettings.ts:75` (wywołanie jako instrukcja) | odczyt `:70-90` |
| 10 | Brak nasłuchu `storage` na stronach kart (jest tylko w katalogu) | potwierdzone | tylko `CardCatalog.astro:68`, `CatalogProfileCorner.tsx:58, 61` | `window.addEventListener("storage", $$$)` (`-l tsx`). Wzorzec bez `window.` dał zero (fałszywy brak), poprawiony; grep `"storage"` w `src` zgodny |
| 11 | `ProfileCorner.tsx` 698 linii, `WorksheetGenerator.tsx` 277 linii | potwierdzone | `wc -l`: 698, 277; `MazeSheet` `WorksheetGenerator.tsx:194-277`, `LevelChoiceControl` `:155-192` | `wc -l`; `function $N($$$) { $$$ }` |
| 12 | `DIALOG_ROW_CLASS` importowany przez `LevelChoice.tsx:5` | doprecyzowane | import także w `LevelChoiceRows.tsx:2` i `CharacterChoiceControl.tsx:5`; definicja `ProfileCorner.tsx:37` | grep `DIALOG_ROW_CLASS`. Zależność UI od `ProfileCorner` szersza niż w raporcie (dotyczy kosztu „Rozbicia `ProfileCorner`”, nie rankingu) |
| 13 | Łańcuch `child-profiles.ts:4` → `own-image-store` → `last-used` → `card-settings`; `recordBarCharacter` w `own-image-store`; 0 cykli | potwierdzone | `child-profiles.ts:4`, `own-image-store.ts:1`, `last-used.ts:1`; `recordBarCharacter` `own-image-store.ts:86`; `npm run depcruise`: „no dependency violations found (188 modules, 612 dependencies)” | grep `^import`; depcruise |
| 14 | `CARD_KINDS` ma 7 wpisów, `cards.ts` bez importów | potwierdzone | id: `labirynt, symetria, sudoku, sekwencje, nonogram, dyktando, pieniadze` (`cards.ts:12-60`, `id: string` w `:2`); brak linii `import` | `{ id: $A, $$$ }`; grep `^import` (zero) |
| 15 | `CardSettingsMap` 7 kluczy, `CARD_SETTINGS_IDS`, `DEFAULTS` mapped type, `levelIds` 191-208 bez `default` | potwierdzone | `card-settings.ts:57-65`, `:69-77`, `:82-84` (`Defaults` mapped type), `:191-208` (switch `:192-207` bez `default`) | `switch ($X) { $$$ }`, `default: $$$` (zero w `card-settings.ts`; grep `default:` potwierdza) |
| 16 | `summaryParts`: switch na `cardId as CardSettingsId` (`:54`), `default: return null` (`:105`) | potwierdzone | `card-summary.ts:52-108`, `:54`, `:105-106`; jedyne takie rzutowanie w `src` | `$X as CardSettingsId`; `default: $$$` |
| 17 | `card-settings.test.ts:32-37` pilnuje zgodności `CARD_SETTINGS_IDS` z `CARD_KINDS` | potwierdzone | `card-settings.test.ts:32-37` | odczyt |
| 18 | `print-contract.test.ts` i `build-thumbnails.mjs` nie odwołują się do `cards.ts` | potwierdzone | zero trafień `cards.ts`/`CARD_KINDS` w obu plikach | grep (zero). ast-grep nie dotyczy `.mjs` ze stałymi |
| 19 | 6 stron używa `useCardPage`, labirynt nie | potwierdzone | `useCardPage()`: `Dictation:27`, `Money:26`, `Nonogram:29`, `Sequence:28`, `Sudoku:37`, `Symmetry:28` (`*Generator.tsx`); `WorksheetGenerator.tsx` składa hooki ręcznie (`:35, 37, 41`) | `useCardPage($$$)` |
| 20 | `memory.note ?? favorite.note` w 7 z 7 generatorów | potwierdzone | `Sequence:104`, `Worksheet:125`, `Money:94`, `Dictation:116`, `Symmetry:121`, `Sudoku:152`, `Nonogram:121` | `memory.note ?? favorite.note` |
| 21 | Logika paska postaci w labiryncie powiela `useBarCharacter` | potwierdzone, numery linii hooka poprawione | labirynt: `WorksheetGenerator.tsx:39-40, 47-49, 79-91, 93-97, 104-111`; hook: `useBarCharacter.ts:31-32, 34-36, 39-51, 53-57, 59-66`; `characterSrc`: hook `:37`, labirynt w `MazeSheet` `:205` | odczyt obu plików; grep nazw funkcji |
| 22 | Labirynt nie przekazuje `newProfileCards`, pozostałe 6 tak | potwierdzone | `newProfileCards=`: `Dictation:115`, `Money:93`, `Nonogram:120`, `Sequence:103`, `Sudoku:151`, `Symmetry:120`; brak w `WorksheetGenerator.tsx` | grep `newProfileCards=` |
| 23 | Labirynt „nie ma `disabled={waitingForChild}`” | doprecyzowane | prawda dla kontrolki poziomu (`LevelChoiceControl` `:155-192`; `handleLevelSelect` `:99-102` bez strażnika). Ale `waitingForChild` trafia do `CardPage` (`WorksheetGenerator.tsx:122`), a `CardPage.tsx:125, 144` blokuje nim Generuj, więc Generuj jest zablokowany także w labiryncie | grep `waitingForChild` |
| 24 | Migracja `level`: 1 definicja + 2 wywołania + 1 `delete` | potwierdzone | `card-settings.ts:139-157` (`parseStoredCards`), wywołania `child-profiles.ts:282`, `last-used.ts:79`, `delete` `last-used.ts:55`; `catalog-badges.ts` bez kodu migracji | `parseStoredCards($$$)`, `delete $X.level` |
| 25 | Cztery kopie `isRecord` w `lib` | potwierdzone | `card-settings.ts:230`, `child-profiles.ts:304`, `last-used.ts:95`, `sheet/own-image-store.ts:94` | `function isRecord($$$) { $$$ }` |
| 26 | Brak `*.test.tsx` i bibliotek DOM | potwierdzone | 0 plików `*.test.tsx` w `src`/`tests`; 0 trafień `jsdom\|happy-dom\|testing-library` w `package.json` | `find`; grep (zero) |
| 27 | Seedy e2e: ≥10 plików z `setItem`; stary `level` w 9 plikach, ok. 21 linii | potwierdzone (liczba linii nieostra) | 10 plików `tests/e2e`: `card-settings, catalog, dialog-close, favorite-character, how-it-works, level-bar, money, own-image, phone-layout, profile-summary`; stary `level` na wierzchu w 9 (bez `money`), regex daje 19 linii (raport: ok. 21), więc zostawiono „ok.” | grep `setItem`, regex `level: "lat…"` (ast-grep nie pomaga: seed to literał JSON w testach) |
| 28 | `package.json:12`: sklejony token `analytics.test.tssrc/lib/last-used.test.ts` | potwierdzone | `package.json:12`; `last-used.test.ts` w skrypcie dwukrotnie, `analytics.test.ts` osobno nie występuje | odczyt linii 12 |
| 29 | `print-contract.test.ts` czyta `WorksheetGenerator.tsx` jako tekst (`:49`, `:91`) | potwierdzone | stała `:12`, `readRepoFile(WORKSHEET_GENERATOR)` w `:49`, `:91` | grep |

### Wnioski dla planowania

Żadne twierdzenie nie zostało obalone, ranking pozostaje bez zmian. Wyniki, które mogą wpływać na planowanie:

- **K1**: #8 pokazuje, że `writeLastUsed` zwraca `void`, więc scalenie writerów oznacza też zmianę sygnatury (wynik `boolean`), nie tylko pól. Do decyzji na etapie planowania.
- **K3**: #23 zawęża skutek różnicy `waitingForChild` do kontrolki poziomu (Generuj blokuje `CardPage`). Numery linii `useBarCharacter` w raporcie były przesunięte o ok. 6 linii, teraz poprawione. Do decyzji na etapie planowania, czy brak blokady kontrolki poziomu jest usterką.
- **Rozbicie `ProfileCorner.tsx`** (odrzucone w raporcie): #12 pokazuje 3 komponenty zależne od `DIALOG_ROW_CLASS` zamiast 1, więc koszt jest nieco większy. Do decyzji na etapie planowania, jeśli ta pozycja wróci.
