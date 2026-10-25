---
project: PrintoKids
version: 1
status: draft
created: 2026-09-27
updated: 2026-10-25
prd_version: 4
main_goal: low-complexity
top_blocker: capacity
milestone_id: sequences-and-sudoku-cards
milestone_seq: 3
milestone_status: open
---

# Roadmap: PrintoKids

> Derived from `context/foundation/prd.md` (v4) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Milestone

**M-3: Sekwencje, sudoku, nonogram i dyktando graficzne** — Status: open

- **Intent:** Pokazać, że katalog kart rośnie o kilka rodzajów naraz bez przebudowy: karta sekwencji (dziecko uzupełnia brakujące elementy ciągu liczb i kształtów) i karta sudoku 4×4, 6×6 i 9×9 z prostymi kształtami albo cyframi (przebudowane 2026-10-24). Rozszerzone 2026-10-25 na prośbę użytkownika o nonogram i dyktando graficzne, których obrazkiem jest obiekt z katalogu szablonów symetrii, oraz o nowe obiekty w tym katalogu. Każda karta ma własną stronę, własne poziomy albo rozmiary, podgląd i druk jako jedna strona A4, także z telefonu. Strumienie idą równolegle. Profil z wiekiem i poziomami per rodzaj karty (S-14) zostaje poza tym kamieniem.
- **Source materials:** `context/foundation/prd.md` (v4)
- **Done when:** every F-NN and S-NN in „At a glance” is `done`. Sekcje „Po tym kamieniu” i „Parked” nie wliczają się.
- **Scope anchors:** US-10–US-20, FR-019–FR-029, NFR „Karty sekwencji i sudoku…” i „Nonogram i dyktando graficzne…”, Business Logic „Karta sekwencji”, „Karta sudoku”, „Katalog szablonów obiektów”, „Karta nonogramu” i „Karta dyktanda graficznego”. Labirynt zostaje bez zmian; symetria dostaje tylko nowe obiekty i wybór kategorii.

## Vision recap

Rodzic przedszkolaka wyczerpał darmowe labirynty o właściwej skali trudności, a dziecko wciąż chce kolejną kartę. Szukanie i ściąganie z wielu stron nie daje nowej karty na tym samym poziomie. Brakuje sposobu, żeby wygenerować nową kartę, gdy skończy się dopasowana gotowa biblioteka. M-3 dokłada cztery kolejne rodzaje kart na tych samych zasadach: algorytm, jedna sprawdzalna odpowiedź, wiek, jedna strona A4.

## North star

**S-16: Rodzic może wygenerować kartę sekwencji, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie** — najmniejszy kompletny przepływ, który dowodzi, że trzeci rodzaj karty przechodzi cały łańcuch (katalog, generowanie z jawną regułą jednej odpowiedzi, podgląd, druk) na własnej stronie. Ryzykiem jest sprawdzenie, że do pustego pola pasuje dokładnie jedna reguła; sudoku powtarza ten wzorzec z innym sprawdzeniem (jedno rozwiązanie).

> North star — tu: najmniejszy kompletny przepływ, którego udane dowiezienie pokazuje, że kamień ma sens. Stoi możliwie wcześnie, bo reszta ma sens tylko jeśli ten przepływ działa.

## At a glance

| ID   | Change ID                         | Outcome (user can …)                                                                                                                                                                                                               | Prerequisites    | PRD refs      | Status   |
| ---- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------- | -------- |
| S-16 | sequences-first-printable         | Rodzic może wejść z katalogu na stronę sekwencji, wygenerować kartę z kilkoma ciągami liczb i kształtów z brakującymi elementami i jedną odpowiedzią, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie    | —                | US-10, FR-019 | done     |
| S-18 | picture-sudoku-first-printable    | Rodzic może wejść z katalogu na stronę sudoku, wygenerować planszę 4×4 z czarnymi kształtami (w każdym wierszu brakuje jednego) i jednym rozwiązaniem, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie   | —                | US-12, FR-021 | done     |
| S-17 | sequence-difficulty-levels        | Rodzic może wybrać poziom sekwencji nazwany wiekiem (długość ciągu, rodzaj reguł, liczba pustych pól) na pasku strony sekwencji                                                                                                    | S-16             | US-11, FR-020 | done     |
| S-19 | picture-sudoku-levels             | Rodzic może wybrać rozmiar sudoku (4×4, 6×6, 9×9) i poziom (łatwy, średni, trudny: liczba pustych pól), a przy 6×6 i 9×9 kształty albo cyfry                                                                                       | S-18             | US-13, FR-022 | done     |
| S-20 | picture-sudoku-colors             | Rodzic może włączyć kolory kształtów na karcie sudoku; każdy kształt ma stały kolor kredki, domyślnie czarne kontury                                                                                                               | S-18             | US-14, FR-023 | done     |
| S-21 | template-object-catalog           | Rodzic dostaje na karcie symetrii (a potem na nonogramie i dyktandzie) więcej obiektów z pięciu kategorii po co najmniej cztery, każdy w trzech rozmiarach szablonu i z losowanymi częściami                                       | —                | US-19, FR-028 | done     |
| S-22 | nonogram-first-printable          | Rodzic może wejść z katalogu na stronę nonogramu, wygenerować nonogram średni (12×15), którego jedynym rozwiązaniem jest sylwetka obiektu z szablonów, zobaczyć podgląd i wydrukować go jako jedną stronę A4, także na telefonie   | —                | US-15, FR-024 | done     |
| S-23 | graphic-dictation-first-printable | Rodzic może wejść z katalogu na stronę dyktanda graficznego, wygenerować kartę ze strzałkami prowadzącymi po obrysie obiektu z szablonów (poziom 6 lat), zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie | —                | US-17, FR-026 | done     |
| S-24 | nonogram-sizes                    | Rodzic może wybrać rozmiar nonogramu (mały 8×12, średni 12×15, duży 18×24) na pasku strony nonogramu                                                                                                                               | S-22             | US-16, FR-025 | planning |
| S-25 | graphic-dictation-levels          | Rodzic może wybrać poziom dyktanda graficznego nazwany wiekiem (5–7 lat: kratka i obiekty) na pasku strony dyktanda                                                                                                                | S-23             | US-18, FR-027 | done     |
| S-26 | object-category-choice            | Rodzic może wybrać na pasku symetrii, nonogramu i dyktanda jedną kategorię obiektów albo „Wszystkie”                                                                                                                               | S-21, S-22, S-23 | US-20, FR-029 | done     |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below; this table is the proposed reading order across parallel tracks.

| Stream | Theme     | Chain                            | Note                                                                                                 |
| ------ | --------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| A      | Sekwencje | `S-16` → `S-17`                  | Gwiazda przewodnia kamienia; poziomy dopiero po pierwszej drukowalnej karcie.                        |
| B      | Sudoku    | `S-18` → `S-19`, `S-18` → `S-20` | Równolegle do strumienia A; obie pierwsze karty dotykają katalogu (`src/lib/cards.ts`).              |
| C      | Obiekty   | `S-21` → `S-26`                  | Nowe szablony z kategoriami; wybór kategorii łączy się ze strumieniami D i E (czeka na S-22 i S-23). |
| D      | Nonogram  | `S-22` → `S-24`                  | Równolegle do C i E; rozmiary dopiero po pierwszej drukowalnej karcie.                               |
| E      | Dyktando  | `S-23` → `S-25`                  | Równolegle do C i D; poziomy dopiero po pierwszej drukowalnej karcie.                                |

## Baseline

What's already in place in the codebase as of `2026-10-23` (z kodu i z `tech-stack.md`, M-2 zamknięty).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — katalog kart na `/` (`src/components/CardCatalog.astro`, `src/lib/cards.ts` z rodzajami `labirynt` i `symetria`), wspólna powłoka strony generatora (`GeneratorShell.astro`), strony `/labirynt` i `/symetria`, kit `src/components/ui`. Wzorzec strony karty: `SymmetryGenerator.tsx` (Generuj, przycisk poziomu, karta SVG, Drukuj, róg profilu).
- **Backend / API:** absent by design — strona renderowana po stronie serwera, bez endpointu generowania; generowanie działa w przeglądarce.
- **Data:** present — tylko na urządzeniu: ostatnio użyte parametry (`src/lib/last-used.ts`) i profile dzieci (`src/lib/child-profiles.ts`), oba tylko dla postaci i poziomu labiryntu. Poziom symetrii i kolory żyją w stanie strony. Nowe karty trzymają poziom w stanie strony tak samo.
- **Auth:** absent by design — konta usunięte w F-02; PRD: jeden lokalny rodzic.
- **Deploy / infra:** present — CI (lint, test, check, build, smoke). `npm test` wylicza pliki testów jawnie, więc nowe pliki testów trzeba dopisać do skryptu.
- **Observability:** partial — dzienniki platformy, bez śledzenia błędów aplikacji.

Do ponownego użycia bez zmian: druk A4 (`@page`, 210×297, margines 10 mm), układ strony SVG z `src/lib/symmetry/layout.ts` i `sheet.ts` jako wzorzec, przełącznik kolorów z symetrii (dla kolorów sudoku), profil w rogu (bez zmian).

## Foundations

Brak. Katalog kart (F-03) już mieści co najmniej 10 rodzajów, a wzorzec strony karty istnieje (S-12). Każda z pierwszych kart dokłada do niego własny wpis, stronę i miniaturę.

## Slices

### S-16: Karta sekwencji: strona, generowanie, podgląd i druk A4

- **Outcome:** Rodzic może wejść z katalogu na stronę „Sekwencje” (`/sekwencje`), wygenerować kartę z kilkoma ciągami liczb i kształtów, w których brakuje elementów, i jedną odpowiedzią każdego ciągu, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie.
- **Change ID:** sequences-first-printable
- **PRD refs:** US-10, FR-019
- **Prerequisites:** —
- **Parallel with:** S-18
- **Blockers:** —
- **Unknowns:**
  - Które ustawienie dostaje pierwsza wersja? Rekomendacja: jedno stałe, wiersz „5 lat” z tabeli PRD (ciągi 7-polowe, wzór AB/AAB/ABC z kształtami, 1–2 puste pola, 6 ciągów); poziomy dochodzą w S-17. — Owner: team. Block: no.
  - Jak wygląda puste pole do wpisania i jak wygląda liczba w polu na czarnym druku? Rozstrzyga makieta przed planem. — Owner: user. Block: no.
- **Risk:** Sprawdzenie, że do pustego pola pasuje dokładnie jedna reguła z jawnej listy, to jedyne nietrywialne miejsce. Odrzucenie ciągu zbyt często psuje szybkość generowania (limit 5 s) albo zmniejsza różnorodność kart. Pierwszy wpis w `src/lib/cards.ts` i miniatura w `public/thumbnails/` dzielą pliki ze S-18, więc strumienie nie powinny edytować ich jednocześnie bez uzgodnienia.
- **Status:** done

### S-18: Sudoku 4×4 z kształtami: strona, generowanie, podgląd i druk A4

- **Outcome:** Rodzic może wejść z katalogu na stronę „Sudoku” (`/sudoku`), wygenerować planszę 4×4 z czterema prostymi kształtami jako czarnymi konturami (w każdym wierszu brakuje jednego, miejsce losowe) i jednym rozwiązaniem, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Generator i sprawdzenie jednego rozwiązania powstają od razu dla 4×4, 6×6 i 9×9 (bloki 2×2, 2×3, 3×3), ale strona pokazuje tylko 4×4.
- **Change ID:** picture-sudoku-first-printable
- **PRD refs:** US-12, FR-021
- **Prerequisites:** —
- **Parallel with:** S-16
- **Blockers:** —
- **Unknowns:**
  - Jak rysować kształty (koło, kwadrat, trójkąt, serce, gwiazdka, krzyżyk, romb, księżyc, kropla) w SVG, żeby czarny kontur był czytelny i łatwy do odrysowania? Rozstrzyga makieta przed planem. — Owner: user. Block: no.
- **Risk:** Generator musi dawać jedno rozwiązanie. Przy 4×4 z jednym pustym polem w wierszu to wynika z reguły, ale 9×9 z 52 pustymi wymaga solvera liczącego rozwiązania w granicy 5 s, więc solver jest testowany już tutaj. Dzieli z S-16 katalog kart i miniatury.
- **Status:** done

### S-17: Poziomy sekwencji

- **Outcome:** Rodzic może wybrać poziom sekwencji nazwany wiekiem (4–7 lat: długość ciągu, rodzaj reguł, liczba pustych pól i ciągów) na pasku strony sekwencji.
- **Change ID:** sequence-difficulty-levels
- **PRD refs:** US-11, FR-020
- **Prerequisites:** S-16
- **Parallel with:** S-18, S-19
- **Blockers:** —
- **Unknowns:**
  - Czy startowe wartości z tabeli PRD pasują dziecku? — Owner: user. Block: no. Potwierdza je wydruk (PRD Open Questions 9).
- **Risk:** Każdy poziom musi mieścić się na jednej stronie A4 z marginesem 10 mm, a bogatsze reguły zwiększają szansę na odrzucone ciągi (więcej niż jedna pasująca reguła). Poziom żyje w stanie strony, jak poziom symetrii.
- **Status:** done

### S-19: Rozmiary i poziomy sudoku

- **Outcome:** Rodzic może wybrać na pasku strony sudoku rozmiar (4×4, 6×6, 9×9) i poziom (łatwy, średni, trudny: 6×6 — 12/18/22 pustych z 36, 9×9 — 35/45/52 z 81; 4×4 ma jeden poziom), a przy 6×6 przełącznikiem „Kształty / Cyfry” wybrać symbole.
- **Change ID:** picture-sudoku-levels
- **PRD refs:** US-13, FR-022
- **Prerequisites:** S-18
- **Parallel with:** S-16, S-17, S-20
- **Blockers:** —
- **Unknowns:**
  - Czy liczby pustych pól nie są za trudne dla dzieci? — Owner: user. Block: no. Potwierdza wydruk (PRD Open Questions 9).
- **Risk:** Przy 52 pustych z 81 jednoznaczne rozwiązanie jest trudniejsze do wylosowania; generator może potrzebować kilku prób, w granicy 5 s. Kratka 9×9 musi być dość duża, żeby dziecko wpisało cyfrę. Rozmiar i poziom żyją w stanie strony.
- **Status:** done

### S-20: Kolory kształtów w sudoku

- **Outcome:** Rodzic może włączyć kolory na karcie sudoku z kształtami; każdy kształt ma jeden stały kolor kredki na całej planszy, a przełącznik nie zmienia planszy. Domyślnie czarne kontury; przy cyfrach przełącznika nie ma.
- **Change ID:** picture-sudoku-colors
- **PRD refs:** US-14, FR-023
- **Prerequisites:** S-18
- **Parallel with:** S-16, S-17, S-19, S-21, S-22, S-23, S-24, S-25, S-26
- **Blockers:** —
- **Unknowns:**
  - Jakie przypisanie kolorów do kształtów? Rekomendacja: kolory kredek z symetrii (czerwony, zielony, żółty, niebieski, pomarańczowy, szary, czarny) plus dwa nowe (fioletowy, brązowy), bo 9×9 z kształtami potrzebuje dziewięciu kolorów. — Owner: user. Block: no.
- **Risk:** Ukrycie przełącznika przy cyfrach wymaga S-19; jeśli S-20 idzie pierwsze, przełącznik dotyczy tylko 4×4. Pasek strony sudoku dzieli pliki z S-19.
- **Status:** done

### S-21: Katalog obiektów z kategoriami

- **Outcome:** Rodzic klikający Generuj na karcie symetrii widzi więcej obiektów niż rakieta, robot i truskawka. Katalog ma pięć kategorii (Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny, Domy i budowle) po co najmniej cztery obiekty, każdy w trzech rozmiarach szablonu (połowa 4×12, 6×15, 9×24), z losowanymi częściami, kolorem kredki każdej kratki i etykietą kategorii. Wyboru kategorii na pasku jeszcze nie ma (S-26); generator losuje ze wszystkich. Nonogram i dyktando biorą obiekty z tego samego katalogu.
- **Change ID:** template-object-catalog
- **PRD refs:** US-19, FR-028
- **Prerequisites:** —
- **Parallel with:** S-20, S-22, S-23, S-24, S-25
- **Blockers:** —
- **Unknowns:**
  - Jak wyglądają nowe obiekty w każdym rozmiarze i które części losować? Rozstrzyga makieta przed planem, jak przy pierwszych szablonach. — Owner: user. Block: no.
  - Czy siedem kolorów kredek wystarczy (brak brązowego dla pnia, sowy, gruszki)? Jeśli S-20 doda kolory dla sudoku, katalog może z nich skorzystać. — Owner: user. Block: no. Rozstrzygnięte 2026-10-25 po makiecie: brązowy dochodzi do palety symetrii, a szablon może zostawić dziury białe.
- **Risk:** Około 17 nowych obiektów w trzech rozmiarach to najwięcej treści w kamieniu; plan może podzielić slice po kategoriach. Najmniejsza połowa (4×12) ma tylko 4 kratki szerokości, więc część obiektów może wymagać zamiany na inny z tej samej kategorii. Każdy szablon musi przejść reguły symetrii (dotyka osi, co najmniej 3 kratki przy osi na podpowiedź poziomu 4 lat).
- **Status:** done

### S-22: Nonogram: strona, generowanie, podgląd i druk A4

- **Outcome:** Rodzic może wejść z katalogu na stronę „Nonogram”, wygenerować nonogram średni (12×15) z liczbami przy wierszach i nad kolumnami, którego jedynym rozwiązaniem jest cała sylwetka obiektu z katalogu szablonów, zobaczyć podgląd i wydrukować go jako jedną stronę A4 bez rozwiązania, także na telefonie.
- **Change ID:** nonogram-first-printable
- **PRD refs:** US-15, FR-024
- **Prerequisites:** —
- **Parallel with:** S-20, S-21, S-23, S-25
- **Blockers:** —
- **Unknowns:**
  - Ile z dzisiejszych wariantów 12×15 ma nonogram z jednym rozwiązaniem? Jeśli za mało, S-21 albo poprawki szablonów muszą dojść przed wydaniem. — Owner: team. Block: no. Pokaże pierwszy solver.
  - Jak wyglądają liczby i kratka na czarnym druku (grubość linii co 5 kratek, rozmiar cyfr)? Rozstrzyga makieta przed planem. — Owner: user. Block: no.
- **Risk:** Solver sprawdzający jedno rozwiązanie jest jedynym nietrywialnym miejscem i musi zmieścić się w 5 s także dla 18×24 w S-24, więc powinien być testowany od razu na wszystkich trzech rozmiarach. Dzieli z S-23 katalog kart i miniatury.
- **Status:** done

### S-23: Dyktando graficzne: strona, generowanie, podgląd i druk A4

- **Outcome:** Rodzic może wejść z katalogu na stronę „Dyktando graficzne”, wygenerować kartę z poleceniami (liczba kratek i strzałka) prowadzącymi od kropki startu po zewnętrznym obrysie obiektu z katalogu szablonów (poziom 6 lat, obiekty 12×15), zobaczyć podgląd i wydrukować ją jako jedną stronę A4 bez rysunku odpowiedzi, także na telefonie.
- **Change ID:** graphic-dictation-first-printable
- **PRD refs:** US-17, FR-026
- **Prerequisites:** —
- **Parallel with:** S-20, S-21, S-22, S-24
- **Blockers:** —
- **Unknowns:**
  - Ile wariantów ma obrys, który nie dotyka sam siebie w narożniku kratki? — Owner: team. Block: no. Pokaże pierwsza implementacja.
  - Jak ułożyć listę poleceń na kartce (wiersze, rozmiar strzałek), żeby zmieściła się nad kratką? Rozstrzyga makieta przed planem. — Owner: user. Block: no.
- **Risk:** Lista poleceń dla bogatszych obiektów może być długa i zabrać miejsce kratce; poziom 7 lat w S-25 tego nie ułatwi. Dzieli z S-22 katalog kart i miniatury.
- **Status:** done

### S-24: Rozmiary nonogramu

- **Outcome:** Rodzic może wybrać na pasku strony nonogramu rozmiar: mały (8×12), średni (12×15) albo duży (18×24); każdy mieści się na jednej stronie A4 z marginesem 10 mm.
- **Change ID:** nonogram-sizes
- **PRD refs:** US-16, FR-025
- **Prerequisites:** S-22
- **Parallel with:** S-20, S-21, S-23, S-25, S-26
- **Blockers:** —
- **Unknowns:**
  - Czy kratka około 7 mm w dużym nonogramie jest dość duża dla dziecka? — Owner: user. Block: no. Potwierdza wydruk (PRD Open Questions 11).
- **Risk:** Duży rozmiar ma najwięcej liczb przy wierszach i kolumnach i najdłuższe sprawdzenie jednego rozwiązania. Rozmiar żyje w stanie strony.
- **Status:** planning

### S-25: Poziomy dyktanda graficznego

- **Outcome:** Rodzic może wybrać poziom dyktanda graficznego nazwany wiekiem (5 lat: kratka około 14 mm i obiekty 8×12; 6 lat: 11 mm i 12×15; 7 lat: 8 mm i 18×24) na pasku strony dyktanda.
- **Change ID:** graphic-dictation-levels
- **PRD refs:** US-18, FR-027
- **Prerequisites:** S-23
- **Parallel with:** S-20, S-21, S-22, S-24, S-26
- **Blockers:** —
- **Unknowns:**
  - Czy startowe wartości pasują dziecku? — Owner: user. Block: no. Potwierdza wydruk (PRD Open Questions 11).
- **Risk:** Poziom 7 lat ma najdłuższą listę poleceń i najmniejszą kratkę; oba muszą zmieścić się na jednej stronie A4. Poziom żyje w stanie strony.
- **Status:** done

### S-26: Wybór kategorii obiektów

- **Outcome:** Rodzic może wybrać na pasku strony symetrii, nonogramu i dyktanda graficznego „Kategoria”: Wszystkie, Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny albo Domy i budowle. Można wybrać dokładnie jedną, domyślnie „Wszystkie”; kolejne Generuj losuje obiekt tylko z niej.
- **Change ID:** object-category-choice
- **PRD refs:** US-20, FR-029
- **Prerequisites:** S-21, S-22, S-23
- **Parallel with:** S-20, S-24, S-25
- **Blockers:** —
- **Unknowns:**
  - Czy kategoria zostawia dość obiektów w każdym rozmiarze po odrzuceniach nonogramu i dyktanda, żeby kolejne karty się nie powtarzały? — Owner: team. Block: no. PRD Open Questions 11. Rozstrzygnięte 2026-10-25: najmniej 3 obiekty i 8 obrysów w każdej kombinacji, więc bez komunikatu i bez wyłączania kategorii.
- **Risk:** Dotyka paska trzech stron naraz; pasek symetrii ma już poziom i kolory, a nonogram rozmiar, więc kategoria musi zmieścić się na telefonie. Czeka na S-22 i S-23, żeby nie dorabiać kategorii do każdej strony osobno. Kategoria żyje w stanie strony.
- **Status:** done

## Backlog Handoff

Issues na GitHubie z etykietą `roadmap-slice` idą za „At a glance” i „Done”. Zmiana statusu plasterka wymaga tej samej zmiany w issue: zamknąć zrobione, otworzyć nowe z aktywnego kamienia, `status:ready` tylko gdy wiersz poniżej mówi yes. Sekcje „Po tym kamieniu” i „Parked” nie dostają issue, dopóki ich kamień nie jest otwarty.

| Roadmap ID | Change ID                         | Suggested issue title                                           | Ready for `/10x-plan` | Notes                                                                                    |
| ---------- | --------------------------------- | --------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| S-16       | sequences-first-printable         | Karta sekwencji: strona, generowanie, podgląd i druk A4         | yes                   | Run `/10x-new sequences-first-printable`, potem `/10x-plan`. Równolegle do S-18          |
| S-18       | picture-sudoku-first-printable    | Sudoku 4×4 z kształtami: strona, generowanie, podgląd i druk A4 | yes                   | Run `/10x-new picture-sudoku-first-printable`, potem `/10x-plan`. Równolegle do S-16     |
| S-17       | sequence-difficulty-levels        | Poziomy sekwencji                                               | no                    | Czeka na S-16                                                                            |
| S-19       | picture-sudoku-levels             | Rozmiary i poziomy sudoku                                       | no                    | Czeka na S-18                                                                            |
| S-20       | picture-sudoku-colors             | Kolory kształtów w sudoku                                       | yes                   | Run `/10x-new picture-sudoku-colors`, potem `/10x-plan`                                  |
| S-21       | template-object-catalog           | Katalog obiektów z kategoriami                                  | yes                   | Run `/10x-new template-object-catalog`, potem `/10x-plan`. Równolegle do S-20, S-22–S-25 |
| S-22       | nonogram-first-printable          | Nonogram: strona, generowanie, podgląd i druk A4                | yes                   | Run `/10x-new nonogram-first-printable`, potem `/10x-plan`. Równolegle do S-23           |
| S-23       | graphic-dictation-first-printable | Dyktando graficzne: strona, generowanie, podgląd i druk A4      | yes                   | Run `/10x-new graphic-dictation-first-printable`, potem `/10x-plan`. Równolegle do S-22  |
| S-24       | nonogram-sizes                    | Rozmiary nonogramu                                              | no                    | Czeka na S-22                                                                            |
| S-25       | graphic-dictation-levels          | Poziomy dyktanda graficznego                                    | no                    | Czeka na S-23                                                                            |
| S-26       | object-category-choice            | Wybór kategorii obiektów                                        | no                    | Czeka na S-21, S-22 i S-23                                                               |

## Open Roadmap Questions

1. **Insight — czemu gotowe paczki PDF nie rozwiązują tego poza skończoną biblioteką?** — Owner: user. Block: no.
2. **Jakie jest źródło dostarczonych postaci i jakie prawa pozwalają użyć ich w produkcie?** — Owner: user. Block: no (od 2026-10-24 sudoku nie używa postaci; publikacja szerszego katalogu czeka).
3. ~~**Czy poziom nastolatka ma pokazywać postać?**~~ — Zamknięte 2026-10-25: na nastolatku wybrana postać stoi nad narożnym startem, lewą krawędzią równo z lewą krawędzią labiryntu, a pas nad znakiem równa się pasowi pod „Meta”; młodsze poziomy zostają ze znakiem na środku wejścia (`teen-level-character-choice`, issue #54).
4. **Czy startowe wartości poziomów symetrii, sekwencji i sudoku pasują dziecku?** — Owner: user. Block: no. PRD Open Questions 5 i 9.
5. ~~**Czy sudoku obrazkowe uzupełnia się numerem z legendy, czy rysunkiem postaci?**~~ — Zamknięte 2026-10-24: kształty do narysowania albo cyfry, bez postaci (PRD Open Questions 8).
6. **Kiedy wraca S-14 (profil z wiekiem i poziomami per rodzaj karty)?** — Owner: user. Block: no. PRD Open Questions 10.

## Parked

- **S-14: Wiek w profilu i poziomy osobno dla każdego rodzaju karty** — Why parked: odłożone 2026-10-23 do czasu, gdy będzie więcej rodzajów kart i wiadomo, które ustawienia mają sens w profilu. Change ID: `profile-age-and-levels` (jest `change.md` i `research.md`, bez planu). PRD refs: US-08, FR-017; wraca jako slice następnego kamienia. Wcześniej wykluczony z M-2, który zamknięto bez niego.
- **Inne typy kart pracy poza symetrią, sekwencjami, sudoku, nonogramem i dyktandem graficznym** — Why parked: PRD §Non-Goals: kolejne rodzaje wchodzą jako osobne kamienie. Lista jest w „Po tym kamieniu”.
- **Generowanie albo ocena kart modelem językowym** — Why parked: PRD §Non-Goals; rezultat ma wynikać z jawnych reguł algorytmicznych.
- **Konta rodziców i synchronizacja między urządzeniami** — Why parked: PRD §Non-Goals; ustawienia i profile zostają na urządzeniu.
- **Zapis i archiwum wygenerowanych kart** — Why parked: PRD §Non-Goals; cykl życia karty kończy się po wydruku.
- **Biblioteka gotowych kart (FR-011)** — Why parked: PRD §Non-Goals; nice-to-have poza MVP.

## Po tym kamieniu

Nie wlicza się do „Done when” M-3. Kamień nie jest otwarty. Numer S-10 (`symmetry-worksheet`) zostaje nieużyty.

Wspólna umowa z labiryntem: algorytm, jedna sprawdzalna odpowiedź, wiek, jedna strona A4, czarny druk, bez modelu językowego.

Bez numeru, ta sama umowa:

- **Połącz kropki** — sylwetka postaci. Czeka na obrys.
- **Który nie pasuje** — jedna złamana reguła. Kartka odpada, gdy druga reguła wskazuje inny obrazek.
- **Nonogram postaci** — rozwiązanie odsłania postać. Czeka na bitmapę. Nonogram z obiektami z szablonów jest w M-3 (S-22, S-24).
- **Karty kodowania** — kratka, postać, meta, strzałki, jedna najkrótsza droga.
- **Porównywanie kwot w złotych** — wartość kupek monet, nie liczba sztuk. „Ułóż dokładnie tę kwotę” czeka na jeden układ.

Kolorowanki oraz działania na liczbach z dopiskiem waluty zostają poza tą listą.

## Milestone History

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
