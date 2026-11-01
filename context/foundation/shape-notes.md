---
project: PrintoKids
context_type: brownfield
created: 2026-11-01
updated: 2026-11-01
product_type: web-app
target_scale:
  users: small
timeline_budget:
  delivery_weeks: TBD
  hard_deadline: null
  after_hours_only: true
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6, 7]
  frs_drafted: 8
  quality_check_status: warned
  gray_areas_resolved:
    - topic: context type
      decision: brownfield (git history, lockfile, src/); poprzedni zapis greenfield z 2026-09-16 zarchiwizowany w context/foundation/archive/shape-notes-2026-11-01-0900.md
    - topic: milestone
      decision: M-5, cztery nowe rodzaje kart naraz (wyjątek od zasady „po jednym kamieniu”, na prośbę użytkowniczki, jak drugi i trzeci kamień kart)
    - topic: karta z pieniędzmi
      decision: nazwa „Kto ma więcej?”; wiek 6–8 lat; nominały 1/2/5/10/20 zł, bez groszy; remis akceptowalny jako odpowiedź „tyle samo”
    - topic: „Który nie pasuje” reguły
      decision: kształt i kolor, kategoria obiektu, rozmiar albo liczba (sekwencja AB/AAB poza zakresem startu)
    - topic: kopiowanie rysunku
      decision: cały obiekt z katalogu szablonów, czarna sylwetka, bez osi i bez odbicia
    - topic: szlaczki
      decision: dwa tryby jako poziomy — kropki do prowadzenia (jedna odpowiedź) na niższych poziomach, wzór do kontynuowania na wyższych
    - topic: umowa kart z M-4
      decision: wszystkie cztery dziedziczą poziomy bez wieku, pamięć paska w profilu i postać w dymku przy poleceniu
---

# Shape notes — M-5: cztery nowe rodzaje kart

## Current System

PrintoKids ma sześć rodzajów kart: labirynt, symetria, sekwencje, sudoku, nonogram i dyktando graficzne. Każdy ma własną stronę generatora (`/maze`, `/symmetry`, …), katalog z miniaturami na stronie głównej, profil dziecka pamiętający pasek każdej karty, postać w dymku przy poleceniu (poza labiryntem) i druk na jednej stronie A4. Obiekty z jednego katalogu 34 szablonów zasilają symetrię, nonogram i dyktando; kształty i kolory kredek z sudoku zasilają sekwencje. M-4 zamknięty 2026-11-01 (poziomy bez wieku, pamięć profilu, postać na każdej karcie, strona „Jak to działa”). PRD v5.

## Seed idea

Cztery nowe rodzaje kart w jednym kamieniu (M-5): porównywarka pieniędzy „Kto ma więcej?”, „Który nie pasuje”, „Skopiuj rysunek na kratce” i szlaczki.

## Vision & Problem Statement

Rodzic ma sześć rodzajów kart, ale dziecko 4–8 lat potrzebuje też umiejętności, których te karty nie ćwiczą: porównywania wartości pieniędzy, wykrywania reguły i odstępstwa, przerysowywania wzoru na kratce oraz prowadzenia ręki po liniach przed pisaniem. Kolejne karty dają nowe umiejętności na właściwym poziomie, gdy dopasowana biblioteka darmowych kart się skończy. Brak: insightu, czemu gotowe paczki PDF tego nie robią (Open Questions z PRD 1).

## User & Persona

Ta sama osoba co dotąd: rodzic dziecka w wieku przedszkolnym i wczesnoszkolnym, w tym twórca produktu. „Kto ma więcej?” celuje w dzieci 6–8 lat; pozostałe karty w przedszkolaków i młodszych uczniów.

## Access Control

Bez zmian — jeden lokalny użytkownik-rodzic, bez logowania, profile i ustawienia na urządzeniu. Brak zmian planowanych.

## Success Criteria

### Primary

- Rodzic może wygenerować każdą z czterech nowych kart (Kto ma więcej?, Który nie pasuje, Skopiuj rysunek na kratce, Szlaczki), zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także z telefonu.

### Secondary

- Rodzic może wybrać poziom każdej nowej karty bez nazw wieku, a profil sam zapamiętuje ustawienia paska.
- Na każdej nowej karcie wybrana postać w kolorze stoi przy poleceniu (US-21).
- Katalog ma miniatury i plakietki z poziomem dla czterech nowych kart, czyli dziesięć rodzajów razem.

### Guardrails

- Zostają bez zmian: generowanie do 5 sekund, margines 10 mm, czarny druk, brak profilu nie blokuje druku, Generuj i Drukuj nie nachodzą na siebie na telefonie.
- Sześć istniejących kart działa dokładnie tak jak dotąd; wspólny CardPage, useCardPage i pamięć paska nie psują się.
- Aplikacja nie ocenia rysunku dziecka na żadnej karcie.

## Timeline acknowledgment

delivery_weeks: TBD — cztery karty naraz to zakres większy niż typowy kamień; ustala się przy planowaniu pierwszej z nich. Acknowledged on 2026-11-01: zakres czterech kart naraz użytkowniczka wybrała świadomie.

## Constraints & Preserved Behavior

- Sześć istniejących kart i ich testy (`npm test`, Playwright, smoke) zostają bez zmian.
- Katalog szablonów (34 obiekty), kształty z sudoku i kolory kredek są współdzielone; nowe karty ich nie psują ani nie przestawiają.
- Zapisane profile i ostatnie parametry wczytują się bez migracji; nowe karty dokładają swoje ustawienia w tabeli „Profil i zapamiętane ustawienia”.
- Wygląd pieniędzy: bez kopiowania wzorów NBP; moneta i banknot to stylizowane koło i prostokąt z nominałem (do potwierdzenia, prawa do wyglądu).

## Functional Requirements

### Kto ma więcej? (pieniądze)

- FR-033: Rodzic może wygenerować kartę „Kto ma więcej?”, na której dziecko porównuje wartość dwóch kupek monet i banknotów (1, 2, 5, 10, 20 zł, bez groszy) i zakreśla większą, mniejszą albo „tyle samo”; zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: remis psuje jedną sprawdzalną odpowiedź. Resolution: remis akceptowalny; „tyle samo” jest dopuszczoną odpowiedzią, a generator wylicza wartość każdej kupki i wie, które porównanie jest poprawne.
- FR-034: Rodzic może wybrać poziom karty „Kto ma więcej?” (liczba sztuk jednego nominału, różne nominały, liczba sztuk myli). Priority: must-have. Change: new

### Który nie pasuje

- FR-035: Rodzic może wygenerować kartę „Który nie pasuje”, na której w każdym rzędzie jeden obrazek łamie jawną regułę (kształt albo kolor, kategoria obiektu, rozmiar albo liczba), zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: dwie reguły mogą wskazać inny obrazek. Resolution: kept; generator sprawdza wszystkie reguły naraz, jak w sekwencjach, i nie pokazuje rzędu, w którym pasuje inna odpowiedź.
- FR-036: Rodzic może wybrać poziom karty „Który nie pasuje” (rodzaj reguły, liczba obrazków w rzędzie, liczba rzędów). Priority: must-have. Change: new

### Skopiuj rysunek na kratce

- FR-037: Rodzic może wygenerować kartę „Skopiuj rysunek na kratce”, na której dziecko przerysowuje czarną sylwetkę obiektu z katalogu szablonów z jednej kratki do pustej, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: dwie kratki obok siebie nie mieszczą się na pionowym A4 z marginesem 10 mm. Resolution: kept; układ (kratki obok siebie albo jedna nad drugą) i rozmiar kratki wynikają z poziomu i muszą mieścić się w 10 mm marginesu; rozstrzyga makieta.
- FR-038: Rodzic może wybrać poziom karty „Skopiuj rysunek na kratce” (rozmiar kratki, katalog obiektów) i kategorię obiektów. Priority: must-have. Change: new

### Szlaczki

- FR-039: Rodzic może wygenerować kartę ze szlaczkami: na niższych poziomach dziecko łączy kropki wzdłuż wzoru (jedna ścieżka), na wyższych kontynuuje pokazany wzór w pustych wierszach; zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have. Change: new
  > Socrates: Counter-argument considered: dwa tryby w jednej karcie mieszają różne umiejętności. Resolution: kept; opis poziomu mówi wprost, który tryb to jest (kropki albo wzór), a poziom jest jedynym wyborem na pasku.
- FR-040: Rodzic może wybrać poziom szlaczków (Poziom 1…N: kropki, potem wzór do kontynuowania; wzorzec i grubość). Priority: must-have. Change: new

### Wspólne (dziedziczone z M-4, bez nowych FR)

- FR-014 (katalog z miniaturami), FR-017 (pamięć paska w profilu), FR-030 (postać mówi polecenie), FR-031 (podpowiedzi) obowiązują dla czterech nowych kart tak jak dla sześciu istniejących. Change: preserved.

## User Stories

Do wygenerowania przy `/10x-prd` z FR-033…FR-040: dla każdej karty jedna historyjka generowania i jedna wyboru poziomu, w kształcie US-06/US-07. Nie dopisuję ich tutaj, żeby nie wymyślać treści użytkowniczki; szczegóły (zdania poleceń, układy, tabele poziomów) ustala PRD z użytkowniczką.

## Non-Functional Requirements

- Nowe karty spełniają te same granice co sześć istniejących: generowanie do 5 sekund, jedna strona A4, margines co najmniej 10 mm, czarny druk bez odpowiedzi na kartce, te same przeglądarki na komputerze i na telefonie, w tym Brave.
- Postać przy poleceniu jest jedynym elementem drukowanym w kolorze (US-21).
- Sześć istniejących kart zachowuje wygląd i wyniki sprzed zmiany.

## Business Logic

Aplikacja zawsze tworzy kartę, której zadanie ma jawną regułę wyznaczającą poprawną odpowiedź albo wzór, więc rodzic nie wymyśla zadań sam. Dla pieniędzy odpowiedzią jest wartość kupki; dla „Który nie pasuje” odstępstwo od jawnej reguły; dla kopiowania i szlaczków wzór, który dziecko powtarza, bez oceny rysunku przez aplikację. Szczegóły, tabele poziomów i listy reguł powstają przy PRD v6.

## Non-Goals

- Pieniądze zostają przy nominałach 1/2/5/10/20 zł; grosze, reszta, ceny i „Ułóż dokładnie tę kwotę” poza zakresem M-5 (ostatnia czeka na regułę z jednym układem).
- Aplikacja nie ocenia rysunku dziecka (szlaczki, kopiowanie).
- Sekwencja AB/AAB jako reguła „Który nie pasuje” poza zakresem startu.
- Postacie z katalogu jako treść zadania, kolorowanki i działania na liczbach z dopiskiem waluty zostają poza zakresem (jak w PRD Po MVP).

## Forward: technical-roadmap

- Pieniądze: nominały jako stylizowane koło/prostokąt z liczbą, bez kopiowania wzorów NBP.
- Współdzielone: katalog 34 obiektów szablonów (kopiowanie), kształty z sudoku i kolory kredek (Który nie pasuje).

## Open Questions

1. **Jak pokazać monetę i banknot na czarnym druku, żeby dziecko odróżniło nominał?** — Owner: user. Block: nie, rozstrzyga makieta.
2. **Jakie są poziomy czterech kart (tabele, jak w PRD Business Logic)?** — Owner: user. Block: tak dla PRD v6.
3. **Jak długo trwa M-5 (delivery_weeks)?** — Owner: user. Block: nie.

## Quality cross-check

- Timeline: `delivery_weeks` nie jest ustalone (TBD) — roadmapa będzie sekwencjonować bez dat, ale PRD v6 powinien je podać albo zapisać jawnie jako otwarte.
- User Stories nie są jeszcze napisane — powstają w `/10x-prd` z FR-033…FR-040 razem z tabelami poziomów.
