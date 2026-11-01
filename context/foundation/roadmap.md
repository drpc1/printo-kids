---
project: PrintoKids
version: 1
status: draft
created: 2026-09-27
updated: 2026-11-01
prd_version: 6
main_goal: low-complexity
top_blocker: decisions
milestone_id: four-new-card-kinds
milestone_seq: 5
milestone_status: open
---

# Roadmap: PrintoKids

> Derived from `context/foundation/prd.md` (v6) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Milestone

**M-5: Cztery nowe rodzaje kart: pieniądze, który nie pasuje, kopiowanie rysunku i szlaczki** — Status: open

- **Intent:** Katalog ma sześć rodzajów kart, a dziecko 4–8 lat potrzebuje też porównywania wartości pieniędzy, wykrywania odstępstwa od reguły, przerysowywania wzoru na kratce i prowadzenia ręki po liniach. M-5 pokazuje, że rodzic generuje i drukuje każdą z czterech nowych kart z własnym poziomem bez nazwy wieku, że profil pamięta pasek każdej z nich, a postać stoi przy poleceniu. Po M-5 katalog ma dziesięć rodzajów.
- **Source materials:** `context/foundation/prd.md` (v6)
- **Done when:** every F-NN and S-NN in „At a glance” is `done`. Sekcje „Po tym kamieniu” i „Parked” nie wliczają się.
- **Scope anchors:** FR-033, FR-034, FR-035, FR-036, FR-037, FR-038, FR-039, FR-040; US-23, US-24, US-25, US-26, US-27, US-28, US-29, US-30; Business Logic „Karta „Kto ma więcej?””, „Karta „Który nie pasuje””, „Karta „Skopiuj rysunek na kratce”” i „Karta szlaczków”. Dziedziczone bez zmian: FR-014 (katalog), FR-017 (pamięć paska), FR-030 (postać przy poleceniu), FR-031 (podpowiedzi), US-05, US-08, US-21, US-22. Miniatura i wpis w katalogu (US-05), pamięć paska, podsumowanie w oknie profilu, plakietki w katalogu i opis w „Jak to działa” obejmują nowe karty (S-33 do S-37).

## Vision recap

Rodzic przedszkolaka wyczerpał darmowe karty o właściwej skali trudności, a dziecko wciąż chce kolejną. Brakuje sposobu, żeby wygenerować nową kartę na właściwym poziomie, gdy skończy się dopasowana gotowa biblioteka. Po czterech kamieniach jest sześć rodzajów kart, poziomy bez wieku i profil pamiętający pasek każdej karty; M-5 dokłada cztery nowe umiejętności na tym samym wzorcu strony, paska i druku.

## North star

**S-33: Rodzic generuje i drukuje kartę „Kto ma więcej?” z wyborem poziomu** — to jedyna z czterech kart z nową umiejętnością (wartość pieniędzy) i nowymi rysunkami (moneta, banknot), a jej czytelność na czarnym druku rozstrzyga, czy M-5 ma sens. Przy celu niskiej złożoności stoi pierwsza, bo jeśli nie wyjdzie, pozostałe trzy karty (na istniejących wzorcach) nie ratują wartości kamienia.

> Gwiazda przewodnia (north star) — tu: najmniejszy kompletny kawałek, którego dowiezienie pokazuje, że kamień ma sens; stoi możliwie wcześnie, bo reszta ma sens tylko wtedy, gdy ten działa.

## At a glance

| ID   | Change ID              | Outcome (user can …)                                                                                                                                                                                          | Prerequisites          | PRD refs                                                    | Status   |
| ---- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------- | -------- |
| S-33 | coins-who-has-more     | Rodzic otwiera z katalogu „Kto ma więcej?”, wybiera poziom (łatwy / średni / trudny), generuje kartę A4 z kupkami monet i banknotów 1–20 zł, podgląda ją i drukuje; profil pamięta poziom                     | —                      | US-23, US-24, FR-033, FR-034, FR-014, FR-017, FR-030, US-05 | done     |
| S-34 | odd-one-out-card       | Rodzic otwiera z katalogu „Który nie pasuje”, wybiera poziom i kolory, generuje kartę A4 z rzędami obrazków, w których jeden łamie regułę (kształt, kolor, rozmiar, liczba, kategoria), podgląda ją i drukuje | —                      | US-25, US-26, FR-035, FR-036, FR-014, FR-017, FR-030, US-05 | ready    |
| S-35 | copy-the-drawing-card  | Rodzic otwiera z katalogu „Skopiuj rysunek na kratce”, wybiera poziom i kategorię, generuje kartę A4 z czarną sylwetką obiektu w jednej kratce i pustą kratką obok, podgląda ją i drukuje                     | —                      | US-27, US-28, FR-037, FR-038, FR-014, FR-017, FR-030, US-05 | ready    |
| S-36 | pattern-lines-card     | Rodzic otwiera z katalogu „Szlaczki”, wybiera poziom (1–4), generuje kartę A4 ze szlaczkami do prowadzenia po kropkach albo do kontynuowania, podgląda ją i drukuje                                           | —                      | US-29, US-30, FR-039, FR-040, FR-014, FR-017, FR-030, US-05 | ready    |
| S-37 | how-it-works-new-cards | Rodzic otwiera „Jak to działa” i widzi poprawny opis poziomów i profilu także dla czterech nowych kart, bez nieaktualnych zdań o tym, które karty mają trzy poziomy albo wiek                                 | S-33, S-34, S-35, S-36 | US-22, FR-031                                               | proposed |

## Baseline

What's already in place in the codebase as of `2026-11-01` (z kodu na main po M-4 i z `tech-stack.md`).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — katalog sześciu kart na `/` (`src/lib/cards.ts`), wspólna powłoka `GeneratorShell.astro` i wspólny `CardPage.tsx` z `useCardPage`, strony labiryntu, symetrii, sekwencji, sudoku, nonogramu i dyktanda (`*Generator.tsx`), wybory poziomu i kategorii (`LevelChoice`, `CategoryChoice`), róg profilu na każdej stronie, strona `how-it-works.astro`.
- **Backend / API:** absent by design — generowanie działa w przeglądarce, bez endpointu.
- **Data:** present — tylko na urządzeniu: `src/lib/card-settings.ts`, `child-profiles.ts`, `last-used.ts`, `catalog-badges.ts` i `card-summary.ts` pamiętają ustawienia sześciu kart i plakietki; odczyt jest tolerancyjny (zły wpis → wartość domyślna), więc nowe karty dochodzą bez migracji.
- **Auth:** absent by design — PRD: jeden lokalny rodzic.
- **Deploy / infra:** present — CI (lint, test, check, build, smoke) i Playwright e2e na projektach Chromium, pominięcie jobów przy zmianach tylko w `context/`. `npm test` wylicza pliki testów jawnie, więc nowe pliki testów trzeba dopisać do skryptu.
- **Observability:** partial — dzienniki platformy, bez śledzenia błędów aplikacji.

## Foundations

Brak. Wspólny wzorzec strony karty (`CardPage`, `useCardPage`), zapis ustawień per karta, katalog, plakietki i postać przy poleceniu już istnieją (Baseline: Frontend, Data); każdy z czterech kawałków korzysta z nich i dokłada swój wpis w katalogu i w pamięci paska. Wspólnego elementu, który musiałby powstać przed którymkolwiek z nich, nie ma.

## Slices

### S-33: Kto ma więcej?

- **Outcome:** Rodzic otwiera z katalogu „Kto ma więcej?”, wybiera poziom (łatwy / średni / trudny), uruchamia generowanie i dostaje kartę A4 z pięcioma rzędami po dwie kupki monet i banknotów (1, 2, 5, 10, 20 zł) oddzielone polem „=”; zakreśla większą kupkę albo „tyle samo”. Widzi podgląd, drukuje kartę jako jedną stronę A4 także z telefonu, profil pamięta poziom, a wybrana postać stoi przy poleceniu. Karta ma własną miniaturę i wpis w katalogu na stronie głównej. Okno profilu i plakietka na miniaturze pokazują zapamiętany poziom, a opis karty trafia do listy „Rodzaje kart” na stronie „Jak to działa”. Generator liczy wartość każdej kupki i nie pokazuje kart łamiących reguły poziomu (remis najwyżej w jednym rzędzie). Jako pierwsza z czterech kart zamienia wpisaną na sztywno liczbę sześciu kart w testach (zapis ustawień, podsumowanie profilu, plakietki na telefonie, katalog) na liczbę z katalogu, żeby S-34 do S-36 dokładały karty bez zmiany tych testów.
- **Change ID:** coins-who-has-more
- **PRD refs:** US-23, US-24, FR-033, FR-034, FR-014, FR-017, FR-030, US-05
- **Prerequisites:** —
- **Parallel with:** S-34, S-35, S-36
- **Blockers:** —
- **Unknowns:**
  - Jak wyglądają moneta i banknot na czarnym druku, żeby dziecko odczytało nominał bez koloru? Rozstrzyga makieta przed planem. — Owner: user. Block: no.
  - Czy stylizowane koło i prostokąt z nominałem omijają prawa do wyglądu pieniędzy NBP? PRD Open Questions 14. — Owner: user. Block: no.
  - Czy dziecko 6 lat radzi sobie z poziomem łatwym bez dodawania? Potwierdza wydruk. — Owner: user. Block: no.
- **Risk:** Najwięcej nowych rysunków (moneta, banknot, kupka) i nowych reguł (remis, „liczba sztuk myli”); jeśli nominał nie jest czytelny na czarnym druku, karta nie ma sensu. Dzieli `cards.ts`, pamięć ustawień i plakietki katalogu z pozostałymi trzema kawałkami, więc scala się pierwszy, a S-34 do S-36 po nim. Miejsca z liczbą sześciu kart wpisaną na sztywno (stan 2026-11-01): `src/lib/card-settings.test.ts` (`CARD_SETTINGS_IDS.length, 6`), `src/lib/card-summary.ts` i jego test („the six cards”), `tests/e2e/phone-layout.spec.ts` (`toHaveCount(6)` dla plakietek), `tests/e2e/catalog.spec.ts` (kolejność kart w katalogu) i lista stron w `scripts/smoke.mjs`; badanie przed planem sprawdza, czy nie ma ich więcej. Nowa strona dochodzi do sprawdzianu HTTP (`scripts/smoke.mjs`), a wysokość druku mierzy się osobno w Safari, Chrome iOS i Brave iOS (lessons.md).
- **Status:** done

### S-34: Który nie pasuje

- **Outcome:** Rodzic otwiera z katalogu „Który nie pasuje”, wybiera poziom (łatwy / średni / trudny) i opcjonalnie włącza kolory, uruchamia generowanie i dostaje kartę A4 z 5–6 rzędami obrazków (4–6 w rzędzie), w których dokładnie jeden łamie regułę rzędu (kształt, rozmiar, liczba, kolor po włączeniu kolorów albo kategoria obiektu). Zakreśla ten jeden, podgląda i drukuje kartę; profil pamięta poziom i kolory, a postać stoi przy poleceniu. Karta ma własną miniaturę i wpis w katalogu na stronie głównej. Okno profilu i plakietka na miniaturze pokazują zapamiętany poziom, a opis karty trafia do „Jak to działa”. Generator nie pokazuje rzędu, w którym inna reguła wskazuje inny obrazek.
- **Change ID:** odd-one-out-card
- **PRD refs:** US-25, US-26, FR-035, FR-036, FR-014, FR-017, FR-030, US-05
- **Prerequisites:** — (scala się po S-33, który zmienia liczbę kart w testach)
- **Parallel with:** S-33, S-35, S-36
- **Blockers:** —
- **Unknowns:**
  - Które reguły i ile obrazków w rzędzie dają na każdym poziomie rząd bez dwuznaczności (kategoria obiektu bywa sporna dla dziecka)? Rozstrzyga makieta i test dwuznaczności przed planem. — Owner: user (wartości), team (liczba rzędów). Block: no.
  - Jak dobrać dziewięć kolorów kredek z sudoku do reguły „kolor”? — Owner: team. Block: no.
- **Risk:** Dwuznaczność: rząd, w którym pasuje druga reguła, psuje jedną odpowiedź; trzeba sprawdzać wszystkie reguły naraz jak w sekwencjach. Najmniej nowego kodu z czterech (kształty z sudoku, obiekty z szablonów), więc najtańszy do zrównoleglenia z S-33. Nowa strona dochodzi do sprawdzianu HTTP (`scripts/smoke.mjs`), a wysokość druku mierzy się osobno w Safari, Chrome iOS i Brave iOS (lessons.md).
- **Status:** ready

### S-35: Skopiuj rysunek na kratce

- **Outcome:** Rodzic otwiera z katalogu „Skopiuj rysunek na kratce”, wybiera poziom (łatwy / średni / trudny) i kategorię obiektów, uruchamia generowanie i dostaje kartę A4 z dwiema kratkami tej samej siatki: w jednej czarna sylwetka obiektu z katalogu szablonów, druga pusta. Dziecko przerysowuje sylwetkę; rodzic podgląda i drukuje kartę, profil pamięta poziom i kategorię, a postać stoi przy poleceniu. Karta ma własną miniaturę i wpis w katalogu na stronie głównej. Okno profilu i plakietka na miniaturze pokazują zapamiętany poziom, a opis karty trafia do „Jak to działa”. Aplikacja nie ocenia rysunku dziecka.
- **Change ID:** copy-the-drawing-card
- **PRD refs:** US-27, US-28, FR-037, FR-038, FR-014, FR-017, FR-030, US-05
- **Prerequisites:** — (scala się po S-33, który zmienia liczbę kart w testach)
- **Parallel with:** S-33, S-34, S-36
- **Blockers:** —
- **Unknowns:**
  - Czy dwie kratki obok siebie mieszczą się na A4 z marginesem 10 mm na każdym poziomie, i czy kratka 5 mm na trudnym jest dość duża dla dziecka? PRD Open Questions 13; rozstrzyga makieta przed planem. — Owner: user. Block: no.
  - Czy kratki dostają numery kolumn i wierszy, żeby dziecko wiedziało, od czego zacząć? PRD Open Questions 13. — Owner: user. Block: no.
- **Risk:** Układ dwóch kratek na pionowym A4 wymusza małą kratkę na trudnym poziomie; jeśli 5 mm jest za mało, trudny zostaje przy siatce 12×15. Współdzieli katalog szablonów z symetrią, nonogramem i dyktandem, więc nie wolno przestawić ich obiektów. Nowa strona dochodzi do sprawdzianu HTTP (`scripts/smoke.mjs`), a wysokość druku mierzy się osobno w Safari, Chrome iOS i Brave iOS (lessons.md).
- **Status:** ready

### S-36: Szlaczki

- **Outcome:** Rodzic otwiera z katalogu „Szlaczki”, wybiera poziom (Poziom 1–4), uruchamia generowanie i dostaje kartę A4 z ośmioma rzędami szlaczków: na Poziomach 1–2 dziecko prowadzi ołówek po kropkach, na Poziomach 3–4 kontynuuje pokazany początek wzoru. Rodzic podgląda i drukuje kartę; profil pamięta poziom, a postać stoi przy poleceniu. Karta ma własną miniaturę i wpis w katalogu na stronie głównej. Okno profilu i plakietka na miniaturze pokazują zapamiętany poziom, a opis karty trafia do „Jak to działa”. Aplikacja nie ocenia rysunku dziecka.
- **Change ID:** pattern-lines-card
- **PRD refs:** US-29, US-30, FR-039, FR-040, FR-014, FR-017, FR-030, US-05
- **Prerequisites:** — (scala się po S-33, który zmienia liczbę kart w testach)
- **Parallel with:** S-33, S-34, S-35
- **Blockers:** —
- **Unknowns:**
  - Jak gruba ma być linia i jak duże kropki, żeby wyszły na zwykłej drukarce domowej? PRD Open Questions 15; rozstrzyga wydruk próbny przed planem. — Owner: user. Block: no.
  - Czy dwa tryby (kropki, kontynuacja) na jednym pasku poziomów są dla rodzica czytelne? Opis poziomu mówi, który tryb to jest. — Owner: user. Block: no.
- **Risk:** Nowy rodzaj rysowania bez katalogu szablonów: ścieżki kropek i wzory trzeba zbudować od zera i wypróbować na papierze. Tryb kontynuacji ma wyjątek od „jednej sprawdzalnej odpowiedzi” (PRD US-29), więc testy sprawdzają regułę wzoru, nie rysunek dziecka. Nowa strona dochodzi do sprawdzianu HTTP (`scripts/smoke.mjs`), a wysokość druku mierzy się osobno w Safari, Chrome iOS i Brave iOS (lessons.md).
- **Status:** ready

### S-37: „Jak to działa” po czterech nowych kartach

- **Outcome:** Rodzic otwiera ze stopki „Jak to działa” i znajduje na liście „Rodzaje kart” dziesięć rodzajów z opisami (cztery nowe dochodzą z `cards.ts` w S-33 do S-36), a akapit „Poziomy” mówi prawdę o wszystkich dziesięciu: które karty mają łatwy / średni / trudny (nowe „Kto ma więcej?”, „Który nie pasuje”, „Skopiuj rysunek na kratce”), które numery (szlaczki 1–4) i że żadna z nowych kart nie ma wieku pod opisem. Akapit „Profil dziecka” nadal zgadza się z tym, co profil pamięta (poziom, kolory, kategoria).
- **Change ID:** how-it-works-new-cards
- **PRD refs:** US-22, FR-031
- **Prerequisites:** S-33, S-34, S-35, S-36
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Akapit „Poziomy” i test zgodności treści z UI i PRD są pisane na sztywno pod sześć kart; edycja przed końcem czterech kart rozjedzie się z tym, co rodzic widzi, a równolegle w czterech kawałkach dawałaby konflikt w jednym pliku. Dlatego idzie na końcu, jak S-32 w M-4. Sam opis każdej karty w liście „Rodzaje kart” dodaje już kawałek karty (test wymaga niepustego opisu).
- **Status:** proposed

## Backlog Handoff

Issues na GitHubie z etykietą `roadmap-slice` idą za „At a glance” i „Done”. Zmiana statusu plasterka wymaga tej samej zmiany w issue: zamknąć zrobione, otworzyć nowe z aktywnego kamienia, `status:ready` tylko gdy wiersz poniżej mówi yes. Sekcje „Po tym kamieniu” i „Parked” nie dostają issue, dopóki ich kamień nie jest otwarty.

| Roadmap ID | Change ID              | Suggested issue title                           | Ready for `/10x-plan` | Notes                                                                                    |
| ---------- | ---------------------- | ----------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| S-33       | coins-who-has-more     | Karta „Kto ma więcej?” z poziomami              | yes                   | Run `/10x-new coins-who-has-more`, potem `/10x-plan`. Najpierw makieta monety i banknotu |
| S-34       | odd-one-out-card       | Karta „Który nie pasuje” z poziomami i kolorami | yes                   | Run `/10x-new odd-one-out-card`, potem `/10x-plan`. Najpierw makieta rzędów              |
| S-35       | copy-the-drawing-card  | Karta „Skopiuj rysunek na kratce” z poziomami   | yes                   | Run `/10x-new copy-the-drawing-card`, potem `/10x-plan`. Najpierw makieta układu         |
| S-36       | pattern-lines-card     | Karta szlaczków z poziomami 1–4                 | yes                   | Run `/10x-new pattern-lines-card`, potem `/10x-plan`. Najpierw wydruk próbny linii       |
| S-37       | how-it-works-new-cards | „Jak to działa” po czterech nowych kartach      | no                    | Czeka na S-33 do S-36                                                                    |

## Open Roadmap Questions

1. **Insight — czemu gotowe paczki PDF nie rozwiązują tego poza skończoną biblioteką?** — Owner: user. Block: no.
2. **Jakie jest źródło dostarczonych postaci i jakie prawa pozwalają użyć ich w produkcie?** — Owner: user. Block: no dla planowania (PRD Open Questions 3).
3. **Czy układ i kratka „Skopiuj rysunek na kratce” mieszczą się na A4, i czy kratki dostają numery?** — Owner: user (wartości), team (makieta). Block: no. Dotyczy S-35 (PRD Open Questions 13).
4. **Czy poziomy „Kto ma więcej?” i „Który nie pasuje” pasują dziecku, i czy wygląd monety i banknotu jest czytelny na czarnym druku bez kopiowania wzorów NBP?** — Owner: user. Block: no. Dotyczy S-33 i S-34 (PRD Open Questions 14).
5. **Czy szlaczki z kropkami i z kontynuacją wzoru są czytelne na zwykłej drukarce domowej i dla dziecka?** — Owner: user. Block: no. Dotyczy S-36 (PRD Open Questions 15).
6. **Jak długo trwa M-5 (cztery karty naraz)?** — Owner: user. Block: no. `delivery_weeks` nieustalone (PRD Open Questions 16); roadmapa sekwencjonuje bez dat.

## Parked

- **„Zacznij od nowa” w oknie profilu (FR-032)** — Why parked: nice-to-have; to samo da się zrobić paskiem każdej karty.
- **Pieniądze: grosze, banknoty powyżej 20 zł, ceny, reszta i „Ułóż dokładnie tę kwotę”** — Why parked: PRD §Non-Goals (2026-11-01); ostatnie czeka na regułę z jednym układem.
- **Ocena rysunku dziecka przez aplikację** — Why parked: PRD §Non-Goals; kopiowanie i szlaczki znają wzór, nie rozpoznają rysunku.
- **Sekwencja AB/AAB jako reguła „Który nie pasuje”** — Why parked: poza zakresem startu (shape-notes M-5); łączy tę kartę z sekwencjami.
- **Postać jako treść zadania (obrysy postaci na kratce)** — Why parked: PRD Po MVP; postać jest ozdobą przy poleceniu.
- **Inne typy kart pracy poza dziesięcioma istniejącymi** — Why parked: PRD §Non-Goals: kolejne rodzaje wchodzą jako osobne kamienie. Lista jest w „Po tym kamieniu”.
- **Samouczek przy pierwszym wejściu i okno pomocy** — Why parked: PRD §Non-Goals; pomoc to podpowiedzi w miejscu wyboru i strona „Jak to działa”.
- **Generowanie albo ocena kart modelem językowym** — Why parked: PRD §Non-Goals; rezultat ma wynikać z jawnych reguł algorytmicznych.
- **Konta rodziców i synchronizacja między urządzeniami** — Why parked: PRD §Non-Goals; ustawienia i profile zostają na urządzeniu.
- **Zapis i archiwum wygenerowanych kart** — Why parked: PRD §Non-Goals; cykl życia karty kończy się po wydruku.
- **Biblioteka gotowych kart (FR-011)** — Why parked: PRD §Non-Goals; nice-to-have poza MVP.

## Po tym kamieniu

Nie wlicza się do „Done when” M-5. Kamień nie jest otwarty. Numery S-10 (`symmetry-worksheet`) i S-14 (`profile-age-and-levels`) zostają nieużyte.

Wspólna umowa z labiryntem: algorytm, jedna sprawdzalna odpowiedź (poza wyjątkiem szlaczków), poziomy bez nazw wieku, jedna strona A4, czarny druk z kolorową postacią przy poleceniu, bez modelu językowego.

Bez numeru, ta sama umowa:

- **Obrysy postaci na kratce** — wspólny warunek trzech pozycji niżej. Makieta z 2026-10-26: 11 postaci da się narysować na kratce ok. 15×15, a obrys każdej to jedna zamknięta linia.
- **Połącz kropki** — sylwetka postaci. Czeka na obrysy.
- **Nonogram i dyktando postaci** — rozwiązanie odsłania postać zamiast obiektu z szablonów. Czeka na obrysy.
- **Karty kodowania** — kratka, postać, meta, strzałki, jedna najkrótsza droga.
- **Pieniądze, ciąg dalszy** — jedna kupka i cena („czy wystarczy?”), grosze, reszta, „ułóż dokładnie tę kwotę”. Wymaga pierwszej wersji „Kto ma więcej?” (S-33).

Kolorowanki oraz działania na liczbach z dopiskiem waluty zostają poza tą listą.

## Milestone History

- **M-4: Poziomy bez wieku, profil pamiętający karty i postać na każdej karcie** (`profile-levels-and-character`) — closed 2026-11-01. Rodzic wybiera poziom każdej karty bez nazw wieku, profil sam pamięta pasek każdej karty i pokazuje go w katalogu, ulubiona postać stoi przy poleceniu na każdej karcie i zmienia się tylko jawnie, a strona „Jak to działa” tłumaczy zasady. Slice'y S-27 do S-32.
- **M-3: Sekwencje, sudoku, nonogram i dyktando graficzne** (`sequences-and-sudoku-cards`) — closed 2026-10-26. Rodzic generuje i drukuje cztery nowe rodzaje kart (sekwencje, sudoku 4×4/6×6/9×9 z kolorami, nonogram i dyktando graficzne) z własnymi poziomami albo rozmiarami, a symetria, nonogram i dyktando biorą obiekty z katalogu 22 szablonów w pięciu kategoriach z wyborem kategorii. S-14 (wiek w profilu) nie wrócił w M-3; zastąpiły go S-28 i S-29 w M-4.
- **M-2: Karta symetrii na A4** (`symmetry-card-a4`) — closed 2026-10-23. Rodzic wybiera rodzaj karty w katalogu, generuje kartę symetrii na poziomie nazwanym wiekiem, włącza kolory i drukuje ją jako jedną stronę A4 także z telefonu. S-14 (wiek i poziomy w profilu) wyjęty z kamienia i odłożony na prośbę użytkownika do czasu, gdy będzie więcej rodzajów kart.
- **M-1: Pierwsza drukowalna karta A4** (`first-printable-a4-maze`) — closed 2026-10-22. Rodzic generuje labirynt na wybranym poziomie, wybiera postać, korzysta z profili dzieci i drukuje kartę jako jedną stronę A4 także z telefonu.

## Done

- **F-01: (foundation) Wejście na stronę główną pokazuje, do czego jest narzędzie, i przycisk generowania labiryntu (na razie nie działa).** — Archived 2026-09-29 → `context/archive/2026-09-28-worksheet-page-shell/`. Lesson: —.
- **S-01: Rodzic może wygenerować rozwiązywalny labirynt i zobaczyć go jako kartę A4 na stronie.** — Archived 2026-10-01 → `context/archive/2026-09-28-first-printable-maze/`. Lesson: —.
- **S-02: Rodzic może wydrukować tę kartę jako jedną stronę A4.** — Archived 2026-10-03 → `context/archive/2026-09-29-print-a4-maze/`. Lesson: —.
- **S-03: Rodzic może wybrać postać z dostarczonego zestawu; postać stoi przy starcie labiryntu.** — Archived 2026-10-04 → `context/archive/2026-10-04-maze-character-choice/`. Lesson: —.
- **S-04: Rodzic bez profilu dziecka dostaje ostatnio użyte parametry jako widoczne, edytowalne wartości domyślne.** — Archived 2026-10-05 → `context/archive/2026-10-05-last-used-print-params/`. Lesson: —.
- **S-05: Rodzic może utworzyć opcjonalny lokalny profil dziecka z ulubioną postacią oraz wybrać zapisany profil, gdy istnieje rzeczywisty wybór.** — Archived 2026-10-08 → `context/archive/2026-10-06-child-profile-create-select/`. Lesson: —.
- **S-06: Rodzic może jawnie zapisać zmienione ustawienia profilu dziecka i usunąć profil po potwierdzeniu.** — Archived 2026-10-09 → `context/archive/2026-10-08-child-profile-save-delete/`. Lesson: —.
- **F-02: (foundation) Wejście do aplikacji to kartka do druku; nie ma już ekranów logowania ani dashboardu ze startera, a automatyczny sprawdzian HTTP pilnuje strony produktu.** — Archived 2026-10-11 → `context/archive/2026-10-03-remove-starter-scaffold/`. Lesson: —.
- **S-08: Rodzic może wybrać dowolną postać z katalogu jedenastu, także przy tworzeniu profilu i przy zapisie ulubionej postaci, a pełna lista zostaje widoczna na węższym oknie.** — Archived 2026-10-11 → `context/archive/2026-10-11-full-character-catalog/`. Lesson: —.
- **S-07: Rodzic może wybrać jeden z sześciu poziomów nazwanych wiekiem i dostać labirynt A4 zgodny z szerokością alejki i długością drogi tego poziomu.** — Archived 2026-10-16 → `context/archive/2026-10-11-maze-difficulty-levels/`. Lesson: —. Wybór poziomu przy tworzeniu i edycji profilu (FR-007, FR-009) domknęło `profile-level-choice` — archived 2026-10-17 → `context/archive/2026-10-17-profile-level-choice/`.
- **S-09: Rodzic może na telefonie wygenerować labirynt i wydrukować go jako jedną stronę A4; Generuj i Drukuj nie nachodzą na siebie, a labirynt nie wychodzi poza stronę ani na szerokość, ani na długość.** — Archived 2026-10-21 → `context/archive/2026-10-13-phone-worksheet/`. Lesson: —.
- **S-11: Rodzic może wydrukować kartę, na której labirynt wraz z postacią jest odrobinę niżej, a margines górny i dolny zostają takie same także wtedy, gdy postać stoi u góry.** — Archived 2026-10-22 → `context/archive/2026-10-22-printed-maze-equal-margins/`. Lesson: —.
- **F-03: (foundation) Strona główna to katalog kart z miniaturą labiryntu; labirynt działa bez zmian pod własnym adresem, ze wspólną powłoką strony generatora** — Archived 2026-10-23 → `context/archive/2026-10-22-card-catalog-home/`. Lesson: —.
- **S-12: Rodzic może wejść z katalogu na stronę symetrii (`/symetria`), wygenerować kartę z połową obiektu (np. rakieta, robot, truskawka) i jedną odpowiedzią, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie.** — Archived 2026-10-23 → `context/archive/2026-10-23-symmetry-first-printable/`. Lesson: —.
- **S-13: Rodzic może wybrać poziom symetrii nazwany wiekiem (kratka, obiekty, podpowiedź) na pasku strony symetrii.** — Archived 2026-10-23 → `context/archive/2026-10-23-symmetry-difficulty-levels/`. Lesson: —.
- **S-15: Rodzic może niezależnie od poziomu włączyć kolory na karcie symetrii: kratki obiektu (także okno, oczy i pestki) mają prawdziwe kolory, bez liter i bez legendy, a dziecko koloruje odbicie kredkami według wzoru. Domyślnie obiekt jest czarną sylwetką.** — Archived 2026-10-23 → `context/archive/2026-10-23-symmetry-color-codes/`. Lesson: —.
- **S-16: Rodzic może wejść z katalogu na stronę „Sekwencje” (`/sekwencje`), wygenerować kartę z kilkoma ciągami liczb i kształtów, w których brakuje elementów, i jedną odpowiedzią każdego ciągu, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie.** — Archived 2026-10-24 → `context/archive/2026-10-23-sequences-first-printable/`. Lesson: —.
- **S-18: Rodzic może wejść z katalogu na stronę „Sudoku” (`/sudoku`), wygenerować planszę 4×4 z czterema prostymi kształtami jako czarnymi konturami (w każdym wierszu brakuje jednego, miejsce losowe) i jednym rozwiązaniem, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Generator i sprawdzenie jednego rozwiązania powstają od razu dla 4×4, 6×6 i 9×9 (bloki 2×2, 2×3, 3×3), ale strona pokazuje tylko 4×4.** — Archived 2026-10-24 → `context/archive/2026-10-23-picture-sudoku-first-printable/`. Lesson: —.
- **S-17: Rodzic może wybrać poziom sekwencji nazwany wiekiem (4–7 lat: długość ciągu, rodzaj reguł, liczba pustych pól i ciągów) na pasku strony sekwencji.** — Archived 2026-10-24 → `context/archive/2026-10-24-sequence-difficulty-levels/`. Lesson: —.
- **S-19: Rodzic może wybrać na pasku strony sudoku rozmiar (4×4, 6×6, 9×9) i poziom (łatwy, średni, trudny: 6×6 — 12/18/22 pustych z 36, 9×9 — 35/45/52 z 81; 4×4 ma jeden poziom), a przy 6×6 przełącznikiem „Kształty / Cyfry” wybrać symbole.** — Archived 2026-10-24 → `context/archive/2026-10-24-picture-sudoku-levels/`. Lesson: —.
- **S-20: Rodzic może włączyć kolory na karcie sudoku z kształtami; każdy kształt ma jeden stały kolor kredki na całej planszy, a przełącznik nie zmienia planszy. Domyślnie czarne kontury; przy cyfrach przełącznika nie ma.** — Archived 2026-10-25 → `context/archive/2026-10-25-picture-sudoku-colors/`. Lesson: —.
- **S-23: Rodzic może wejść z katalogu na stronę „Dyktando graficzne”, wygenerować kartę z poleceniami (liczba kratek i strzałka) prowadzącymi od kropki startu po zewnętrznym obrysie obiektu z katalogu szablonów (poziom 6 lat, obiekty 12×15), zobaczyć podgląd i wydrukować ją jako jedną stronę A4 bez rysunku odpowiedzi, także na telefonie.** — Archived 2026-10-25 → `context/archive/2026-10-25-graphic-dictation-first-printable/`. Lesson: —.
- **S-22: Rodzic może wejść z katalogu na stronę „Nonogram”, wygenerować nonogram średni (12×15) z liczbami przy wierszach i nad kolumnami, którego jedynym rozwiązaniem jest cała sylwetka obiektu z katalogu szablonów, zobaczyć podgląd i wydrukować go jako jedną stronę A4 bez rozwiązania, także na telefonie.** — Archived 2026-10-25 → `context/archive/2026-10-25-nonogram-first-printable/`. Lesson: —.
- **S-21: Rodzic klikający Generuj na karcie symetrii widzi więcej obiektów niż rakieta, robot i truskawka. Katalog ma pięć kategorii (Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny, Domy i budowle) po co najmniej cztery obiekty, każdy w trzech rozmiarach szablonu (połowa 4×12, 6×15, 9×24), z losowanymi częściami, kolorem kredki każdej kratki i etykietą kategorii. Wyboru kategorii na pasku jeszcze nie ma (S-26); generator losuje ze wszystkich. Nonogram i dyktando biorą obiekty z tego samego katalogu.** — Archived 2026-10-25 → `context/archive/2026-10-25-template-object-catalog/`. Lesson: —.
- **S-25: Rodzic może wybrać poziom dyktanda graficznego nazwany wiekiem (5 lat: kratka około 14 mm i obiekty 8×12; 6 lat: 11 mm i 12×15; 7 lat: 8 mm i 18×24) na pasku strony dyktanda.** — Archived 2026-10-25 → `context/archive/2026-10-25-graphic-dictation-levels/`. Lesson: —.
- **S-26: Rodzic może wybrać na pasku strony symetrii, nonogramu i dyktanda graficznego „Kategoria”: Wszystkie, Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny albo Domy i budowle. Można wybrać dokładnie jedną, domyślnie „Wszystkie”; kolejne Generuj losuje obiekt tylko z niej.** — Archived 2026-10-25 → `context/archive/2026-10-25-object-category-choice/`. Lesson: —.
- **S-24: Rodzic może wybrać na pasku strony nonogramu poziom: łatwy (prosty wariant dla przedszkolaków), średni (klasyczny 12×15) albo trudny (klasyczny 18×24).** — Archived 2026-10-26 → `context/archive/2026-10-25-nonogram-sizes/`. Lesson: —.
- **S-27: Rodzic wybiera Poziom 1–6 w labiryncie, Poziom 1–4 w symetrii i sekwencjach oraz łatwy / średni / trudny w dyktandzie; każdy wiersz listy poziomów (także w sudoku i nonogramie) ma pół zdania o tym, co zmienia poziom. Zapisane identyfikatory poziomów zostają, więc profile i ostatnie parametry wczytują się bez zmian.** — Archived 2026-10-26 → `context/archive/2026-10-26-level-labels-without-age/`. Lesson: —.
- **S-28: Rodzic wraca na stronę dowolnej z sześciu kart i ma na pasku ustawienia, które ostatnio wybrał dla tej karty (tabela w PRD Business Logic „Profil i zapamiętane ustawienia”): przy aktywnym profilu każda zmiana zapisuje się w profilu od razu i potwierdza ją krótki komunikat „Zapamiętane dla {imię}”; bez profilu urządzenie pamięta je osobno dla każdej karty. Karta, której profil jeszcze nie używał, startuje z ustawieniami domyślnymi. Stare profile i ostatnie parametry nadal się wczytują, a dawny poziom zostaje poziomem labiryntu.** — Archived 2026-10-27 → `context/archive/2026-10-26-card-settings-memory/`. Lesson: —.
- **S-30: Rodzic widzi pasek „Postać” na stronie każdej karty. Na symetrii, sekwencjach, sudoku, nonogramie i dyktandzie wybrana postać (z katalogu albo własny obrazek) stoi w kolorze przy zdaniu polecenia, a polecenie jest w jej dymku; przy „Bez postaci” zostaje samo polecenie. Zadanie, odpowiedź, druk na jednej stronie A4 i margines 10 mm zostają bez zmian.** — Archived 2026-10-27 → `context/archive/2026-10-27-character-speaks-instruction/`. Lesson: —.
- **S-29: Rodzic tworzy profil, podając tylko imię i postać; okno profilu nie ma już kontrolek poziomu, pokazuje jedno zdanie o zasadzie i podsumowanie ustawień kart tylko do odczytu („Labirynt: Poziom 4 · Nonogram: średni, Zwierzęta”), z których każda pozycja prowadzi do strony karty. W katalogu przy wybranym profilu miniatura każdej karty, której profil używał, ma plakietkę z zapamiętanym poziomem.** — Archived 2026-10-27 → `context/archive/2026-10-27-profile-window-summary/`. Lesson: —.
- **S-31: Rodzic przy aktywnym profilu wybiera inną postać na pasku tylko na bieżącą wizytę na stronie; pod listą widzi „Tylko na tę kartę” i może jednym wyborem „Ustaw jako ulubioną {imię}” zapisać ją w profilu. Przy następnym wejściu wraca ulubiona. Bez profilu ostatnio użyta postać jest wspólna dla wszystkich kart.** — Archived 2026-10-27 → `context/archive/2026-10-27-favorite-character-explicit/`. Lesson: —.
- **S-32: Rodzic otwiera ze stopki krótką stronę „Jak to działa” z zasadą poziomów, profilu i postaci. Strona `/how-it-works` jest statyczna, a stopka z linkiem jest na katalogu i na stronach generatorów, ukryta w druku A4. Bez samouczka i bez okna pomocy.** — Archived 2026-10-31 → `context/archive/2026-10-31-s32-how-does-it-work/`. Lesson: —.
- **S-33: Rodzic otwiera z katalogu „Kto ma więcej?”, wybiera poziom (łatwy / średni / trudny), uruchamia generowanie i dostaje kartę A4 z pięcioma rzędami po dwie kupki monet i banknotów (1, 2, 5, 10, 20 zł) oddzielone polem „=”; zakreśla większą kupkę albo „tyle samo”. Widzi podgląd, drukuje kartę jako jedną stronę A4 także z telefonu, profil pamięta poziom, a wybrana postać stoi przy poleceniu. Karta ma własną miniaturę i wpis w katalogu na stronie głównej. Okno profilu i plakietka na miniaturze pokazują zapamiętany poziom, a opis karty trafia do listy „Rodzaje kart” na stronie „Jak to działa”. Generator liczy wartość każdej kupki i nie pokazuje kart łamiących reguły poziomu (remis najwyżej w jednym rzędzie). Jako pierwsza z czterech kart zamienia wpisaną na sztywno liczbę sześciu kart w testach (zapis ustawień, podsumowanie profilu, plakietki na telefonie, katalog) na liczbę z katalogu, żeby S-34 do S-36 dokładały karty bez zmiany tych testów.** — Archived 2026-11-01 → `context/archive/2026-11-01-coins-who-has-more/`. Lesson: —.
