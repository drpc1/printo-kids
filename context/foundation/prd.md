---
project: PrintoKids
version: 5
status: draft
created: 2026-09-18
context_type: greenfield
product_type: web-app
target_scale:
  users: small
timeline_budget:
  mvp_weeks: 6
  hard_deadline: null
  after_hours_only: true
---

## Vision & Problem Statement

Rodzic przedszkolaka ściągnął już wszystkie darmowe labirynty z internetu, które odpowiadały skalą trudności, a dziecku wciąż mało. Inne karty, które znajduje, są za łatwe albo za trudne; dalsze szukanie i ściąganie z wielu stron nie daje nowej karty na właściwym poziomie.

Brakuje sposobu na wygenerowanie nowej karty na właściwym poziomie, gdy skończy się dopasowana gotowa biblioteka. Osobny wgląd — czemu gotowe paczki tego nie rozwiązują poza skończoną biblioteką — nie został jeszcze ustalony.

# TODO: insight — see Open Questions

## User & Persona

Primary persona: rodzic dziecka w wieku przedszkolnym, w tym twórca produktu. Sięga po produkt, gdy dziecko chce kolejną kartę, a dopasowany darmowy zestaw labiryntów jest już wyczerpany.

### Secondary persona

Wielu rodziców / opiekunów — kierunek produktu, nie warunek pierwszej wersji.

## Success Criteria

### Primary

- Rodzic może ręcznie wybrać poziom, wygenerować rozwiązywalny labirynt, zobaczyć jego podgląd i wydrukować go jako jedną stronę A4.

### Secondary

- Rodzic może wybrać ulubioną postać dziecka, która pojawia się na każdej karcie.
- Rodzic może wybrać dowolną postać z katalogu jedenastu dostarczonych postaci.
- Rodzic może na telefonie wygenerować kartę i wydrukować ją jako jedną stronę A4.
- Rodzic może wybrać rodzaj karty w katalogu z miniaturami na stronie głównej i wejść na stronę generatora tego rodzaju.
- Rodzic może wygenerować kartę symetrii, na której dziecko dorysowuje drugą połowę obiektu (np. rakiety, robota, truskawki) na kratce, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także z telefonu.
- Rodzic może wybrać poziom karty symetrii (rozmiar kratki, katalog obiektów, podpowiedź).
- Rodzic może niezależnie od poziomu włączyć kolory na karcie symetrii; kratki wzoru drukują się w prawdziwych kolorach kredek, bez liter i bez legendy; domyślnie obiekt jest czarną sylwetką.
- Rodzic wybiera poziom każdej karty bez nazw wieku: karty z trzema poziomami mają łatwy / średni / trudny, karty z większą liczbą poziomów numery (Poziom 1, 2, 3…); każdy poziom ma krótki opis tego, co się zmienia.
- Profil dziecka sam pamięta ustawienia każdego rodzaju karty (poziom, kolory, kategorię i inne ustawienia z paska) i pokazuje je w katalogu; ulubioną postać rodzic zmienia jawnie.
- Na każdej karcie wybrana postać w kolorze stoi przy poleceniu i „mówi” je dziecku.
- Rodzic rozumie, co pamięta profil i co zmienia poziom, z krótkich podpowiedzi w miejscu, w którym coś wybiera, bez samouczka.
- Rodzic może wygenerować kartę sekwencji, na której dziecko uzupełnia brakujące elementy ciągu liczb i kształtów, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także z telefonu.
- Rodzic może wybrać poziom karty sekwencji (Poziom 1–4).
- Rodzic może wygenerować kartę sudoku 4×4, 6×6 albo 9×9 z prostymi kształtami do narysowania albo z cyframi, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także z telefonu.
- Rodzic może wybrać rozmiar sudoku i jego poziom (łatwy, średni, trudny), a przy kształtach włączyć kolory.
- Rodzic może wygenerować nonogram, w którym po zamalowaniu kratek według liczb pojawia się obiekt z katalogu szablonów (np. rakieta, robot, truskawka), zobaczyć jego podgląd i wydrukować go jako jedną stronę A4, także z telefonu.
- Rodzic może wybrać poziom nonogramu (łatwy, średni, trudny); łatwy to prosty wariant dla przedszkolaków, w którym każdy rząd jest opisany znaczkami.
- Rodzic może wygenerować kartę dyktanda graficznego, na której dziecko rysuje po liniach kratki według strzałek i odkrywa obrys obiektu z katalogu szablonów, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także z telefonu.
- Rodzic może wybrać poziom dyktanda graficznego (łatwy, średni, trudny).
- Rodzic dostaje na karcie symetrii, nonogramie i dyktandzie więcej różnych obiektów niż rakieta, robot i truskawka, pogrupowanych w kategorie.
- Rodzic może wybrać na karcie symetrii, nonogramie i dyktandzie jedną kategorię obiektów (np. Zwierzęta) albo „Wszystkie”.

### Guardrails

- Drukowanie nie wymaga utworzenia profilu dziecka.
- Wygenerowanie labiryntu trwa nie dłużej niż 5 sekund.
- Na telefonie przyciski generowania i drukowania nie zasłaniają się nawzajem.
- Na telefonie labirynt mieści się na jednej stronie A4 w szerokości i w długości.

## User Stories

### US-01: Rodzic generuje labirynt do wydruku

- **Given** rodzic może wybrać postać i poziom trudności labiryntu
- **When** wybierze te parametry i uruchomi generowanie
- **Then** otrzymuje gotowy do wydruku labirynt A4 o wybranym poziomie trudności; na Poziomie 6 wybrana postać stoi nad narożnym startem, lewą krawędzią równo z lewą krawędzią labiryntu, a pas nad znakiem równa się pasowi pod „Meta”; Poziomy 1–5 zostają ze znakiem na środku wejścia

#### Acceptance Criteria

- Labirynt zajmuje większą część strony A4.
- Labirynt nie przekracza wąskich marginesów strony.
- Istnieje dokładnie jedna prawidłowa ścieżka prowadząca od startu do mety.
- Na Poziomach 1–5 przy starcie znajduje się wybrana postać, na środku wejścia. Na Poziomie 6 wybrana postać stoi nad narożnym startem, lewą krawędzią równo z lewą krawędzią labiryntu, a pas nad znakiem równa się pasowi pod „Meta”.
- Na Poziomach 1–5 start jest na środku górnej krawędzi, a napis „Meta” na środku dolnej. Poziom 6 ma start i metę w narożnikach.

### US-02: Rodzic wskazuje własny obrazek, który zostaje w przeglądarce i staje przy starcie

- **Given** rodzic ma własny plik obrazka, na przykład zdjęcie dziecka
- **When** wskaże ten plik przed generowaniem labiryntu
- **Then** obrazek staje przy starcie na karcie, a plik zostaje w przeglądarce i nie jest wysyłany na serwer

#### Acceptance Criteria

- Rodzic wskazuje własny obrazek, który zostaje w przeglądarce i staje przy starcie.
- Plik nie trafia na serwer, także na czas generowania.
- Po złożeniu karty usługa nie przechowuje kopii pliku.

### US-03: Pełny katalog postaci przy karcie i przy profilu

- **Given** rodzic wybiera postać do karty, tworzy profil dziecka albo zapisuje ulubioną postać istniejącego profilu
- **When** otwiera listę postaci
- **Then** widzi cały dostarczony katalog i może wskazać dowolną postać; przy niższej rozdzielczości pełna lista zostaje widoczna

#### Acceptance Criteria

- Katalog to jedenaście postaci: Samochodzik, Rakieta, Dinozaur, Jednorożec, Kot, Pies, Robot, Smok, Strażak, Syrenka i Wróżka. Wiersz „Bez postaci” zostaje.
- Ta sama lista jest przy pasku „Postać” na stronie każdej karty, przy tworzeniu profilu i przy zapisie ulubionej postaci.
- Wygląd dodawania profilu i zapisu ulubionej postaci może się zmienić, żeby zmieścić pełną listę.
- Przy niższej rozdzielczości pełna lista jest widoczna, a nie ucięta.
- Ostatnio użyta postać i ulubiona postać profilu mogą być dowolną postacią z katalogu.
- Ulubiona postać profilu może być własnym obrazkiem rodzica po „Zapisz”, a postać z katalogu nadal może być ulubioną.
- Pasek nadal pokazuje wybraną postać. Na Poziomie 6 labiryntu wybrana postać stoi nad narożnym startem, lewą krawędzią równo z lewą krawędzią labiryntu, a pas nad znakiem równa się pasowi pod „Meta”; Poziomy 1–5 zostają ze znakiem na środku wejścia.
- Przy aktywnym profilu zmiana postaci na pasku dotyczy tylko bieżącej wizyty na stronie karty i nie zmienia ulubionej; rodzic może ją zapisać jako ulubioną jednym wyborem pod listą (US-08).

### US-04: Rodzic korzysta ze strony na telefonie

- **Given** rodzic otwiera stronę na telefonie
- **When** generuje labirynt i uruchamia druk
- **Then** przyciski Generuj i Drukuj nie nachodzą na siebie, a labirynt mieści się na jednej stronie A4 i na szerokość, i na długość

#### Acceptance Criteria

- Generuj i Drukuj są osobno klikalne; jeden nie zasłania drugiego.
- Labirynt nie wychodzi poza jedną stronę A4 ani w szerokości, ani w długości, i zachowuje margines co najmniej 10 mm. Margines dotyczy ścian i ramki labiryntu; znak postaci przy starcie może wejść w ten pas.
- Podgląd karty przed drukiem zostaje na telefonie.
- Profil, wybór postaci i nagłówek zostają używalne i nie zasłaniają karty ani przycisków.
- Druk nadal nie wymaga profilu dziecka.
- Desktopowe Chrome, Edge, Brave, Firefox i Safari zostają w zakresie. Telefon dochodzi, a nie je zastępuje. Na iOS Chrome i Brave używają silnika Safari (WebKit), więc ich układ odpowiada Safari, a druk sprawdza się w każdej z nich osobno.

### US-05: Rodzic wybiera rodzaj karty z katalogu

- **Given** rodzic otwiera stronę główną, na której jest katalog rodzajów kart
- **When** kliknie miniaturę wybranego rodzaju
- **Then** otwiera się strona generatora tego rodzaju; labirynt działa tak jak dotąd

#### Acceptance Criteria

- Strona główna to katalog: każdy rodzaj karty ma miniaturę pokazującą z grubsza, jak wygląda wygenerowana karta, i nazwę. Rodzic nie musi zgadywać po nazwie.
- Każdy rodzaj ma własną stronę z własnym adresem (labirynt: `/maze`, symetria: `/symmetry`). Kliknięcie miniatury otwiera ją.
- Katalog mieści co najmniej 10 rodzajów i jest czytelny na telefonie (miniatury w 2 kolumnach) i na komputerze.
- Na stronie generatora jest link „Wszystkie karty” z powrotem do katalogu.
- Strona generatora ma ten sam układ co dziś: profil w rogu, pasek ustawień, Generuj i Drukuj, karta A4 na dole. Pod kartą nic nie ma.
- Po wejściu z katalogu labirynt działa tak jak dotąd: przepływ, poziomy, postać, druk i margines są bez zmian względem US-01, US-03 i US-04.
- Wybrany profil dziecka zostaje po przejściu między katalogiem a stronami generatorów.
- Przy wybranym profilu miniatura karty, której profil już używał, pokazuje zapamiętany poziom (np. „poz. 4”, „średni”); karta, której profil jeszcze nie używał, nie ma plakietki (US-08; decyzja 2026-10-27).
- Druk nadal nie wymaga profilu dziecka.
- Pasek „Postać” jest na stronie każdego rodzaju karty. Na labiryncie postać stoi przy starcie, na pozostałych kartach przy poleceniu (US-21; decyzja 2026-10-26, wcześniej pasek był tylko przy labiryncie).
- Strony generatorów można zmieniać niezależnie od siebie: zmiana jednej nie zmienia drugiej.

### US-06: Rodzic generuje kartę symetrii do druku

- **Given** rodzic otworzył z katalogu stronę „Symetria”
- **When** uruchomi generowanie
- **Then** otrzymuje gotową do wydruku kartę A4: połowa obiektu jest narysowana na kratce, druga połowa jest pusta, a dziecko ma ją dorysować jako odbicie

#### Acceptance Criteria

- Kratka jest oddzielona osią symetrii; wzór leży po jednej stronie osi, druga strona jest pusta.
- Odpowiedź jest jedna: odbicie wzoru względem osi. Aplikacja potrafi ją wyliczyć i sprawdzić.
- Wzór to połowa rozpoznawalnego obiektu z katalogu szablonów (np. rakieta, robot, truskawka, jabłko, motyl), a nie przypadkowa plama. Nad kratką jest jedno zdanie polecenia; przy nim stoi wybrana postać (US-21).
- Wzór nie jest pusty i nie jest już symetryczny w całości.
- Każde Generuj daje nowy wzór: inny obiekt albo inny wariant tego samego obiektu niż poprzednia karta.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm (ściany i ramka kratki) i drukuje się jako jedna strona.
- Bez odpowiedzi na kartce. Domyślnie druk jest czarny; kolory, gdy rodzic je włączy, są prawdziwymi kolorami kratek (US-09).
- Te same warunki na telefonie co w US-04: Generuj i Drukuj nie nachodzą na siebie, karta mieści się na A4 w szerokości i w długości, podgląd zostaje. Przeglądarki jak w US-04, w tym Brave.

### US-07: Rodzic wybiera poziom karty symetrii

- **Given** rodzic jest na stronie „Symetria”
- **When** wybierze poziom (Poziom 1–4)
- **Then** karta ma kratkę, obiekty i podpowiedź zgodne z tym poziomem

#### Acceptance Criteria

- Poziom zmienia rozmiar kratki, katalog obiektów (Poziom 1 prostsze, Poziom 4 bogatsze) i podpowiedź (kilka kratek odpowiedzi już zamalowanych, bledszych niż wzór także bez kolorów). Reguły są w Business Logic.
- Poziom nie włącza kolorów; to osobne ustawienie rodzica (US-09).
- Każdy poziom mieści się na jednej stronie A4 z marginesem 10 mm.
- Poziom jest na pasku strony symetrii. Profil i ostatnie parametry pamiętają go same (US-08).

### US-08: Profil dziecka pamięta ustawienia każdej karty

> Wraca do zakresu 2026-10-26 w nowym kształcie: zamiast wieku, który ustawia poziomy, profil sam pamięta ustawienia każdego rodzaju karty. Wcześniejsze badanie (`context/changes/profile-age-and-levels/research.md`) opisuje dawny zapis; jego rekomendacje dotyczące wieku już nie obowiązują.

- **Given** rodzic ma profil dziecka albo wygenerował już kartę bez profilu
- **When** wróci na stronę karty, wybierze profil albo wejdzie na stronę innego rodzaju karty
- **Then** pasek ma ustawienia, które ten profil (albo urządzenie bez profilu) ostatnio wybrał dla tej karty, a ulubiona postać jest taka, jak zapisana w profilu

#### Acceptance Criteria

- Profil dziecka to imię i ulubiona postać. Tworzenie profilu pyta tylko o imię i postać, bez poziomów; nowy profil zaczyna od domyślnego poziomu labiryntu (Poziom 3) (decyzja 2026-10-27).
- Każdy rodzaj karty ma w profilu własne ustawienia: wszystko, co jest na pasku tej karty poza postacią i poza „Pokaż rozwiązanie” (tabela w Business Logic „Profil i zapamiętane ustawienia”). Nowe rodzaje kart dokładają swoje ustawienia w ten sam sposób.
- Ustawienia karty zmienia się wyłącznie na pasku tej karty. Przy aktywnym profilu każda zmiana zapisuje się w profilu od razu, bez przycisku „Zapisz”, i dotyczy tylko tej karty.
- Karta, której profil jeszcze nie używał, startuje z domyślnymi ustawieniami tej karty.
- Ulubiona postać zmienia się tylko jawnie: w oknie profilu albo wyborem „Ustaw jako ulubioną” pod listą postaci na pasku. Inna postać wybrana na pasku działa tylko do końca wizyty na tej stronie.
- Bez profilu ostatnio użyte ustawienia są pamiętane osobno dla każdego rodzaju karty, a ostatnio użyta postać jest wspólna dla wszystkich kart. Są widocznymi, edytowalnymi wartościami domyślnymi (FR-006).
- Okno profilu pokazuje imię, ulubioną postać, usuwanie profilu i podsumowanie ustawień kart tylko do odczytu („Labirynt: Poziom 4 · Nonogram: średni, Zwierzęta”); pozycja podsumowania prowadzi do strony tej karty. Okno nie ma kontrolek poziomów.
- Katalog przy wybranym profilu pokazuje na miniaturach zapamiętany poziom (US-05).
- Zapisane wcześniej profile i ostatnie parametry nadal się wczytują: dawny poziom profilu i ostatnich parametrów zostaje poziomem labiryntu, dawna postać zostaje ulubioną postacią profilu i ostatnio użytą postacią.
- Dane zostają na urządzeniu.

### US-09: Rodzic włącza kolory na karcie symetrii

- **Given** rodzic jest na stronie „Symetria”
- **When** włączy kolory, niezależnie od wybranego poziomu
- **Then** kratki obiektu mają prawdziwe kolory, a dziecko dorysowuje odbicie i koloruje je kredkami według wzoru

#### Acceptance Criteria

- Kolory to osobny przełącznik na pasku strony symetrii, niezależny od poziomu. Domyślnie są wyłączone: obiekt jest czarną sylwetką.
- Kolor to prawdziwy kolor kratki, bez liter i bez legendy (decyzja 2026-10-23 po makiecie). Detale będące pustymi kratkami wewnątrz sylwetki (okno rakiety, oczy robota, pestki truskawki) też dostają kolor, chyba że szablon zostawia je białe (brzuch pingwina, kropki muchomora, paski babeczki; decyzja 2026-10-25 po makiecie katalogu). Na drukarce czarno-białej kolory schodzą do odcieni szarości.
- Odpowiedź nadal jest jedna: odbicie obiektu razem z kolorem każdej kratki.
- Przełączenie kolorów zostawia tę samą kartę; nie generuje nowej.
- Wyłączenie kolorów daje ten sam rodzaj obiektu jako czarną sylwetkę.
- Profil i ostatnie parametry pamiętają kolory tak jak poziom (US-08).

### US-10: Rodzic generuje kartę sekwencji do druku

- **Given** rodzic otworzył z katalogu stronę „Sekwencje”
- **When** uruchomi generowanie
- **Then** otrzymuje gotową do wydruku kartę A4 z kilkoma ciągami liczb i kształtów, w których brakuje jednego lub dwóch elementów; dziecko dopisuje lub dorysowuje je w pustych polach

#### Acceptance Criteria

- Karta ma kilka ciągów, jeden pod drugim. Każdy ciąg to rząd pól, w którym część pól jest wypełniona, a część pusta. Nad ciągami jest jedno zdanie polecenia.
- Elementy to proste kształty (koło, kwadrat, trójkąt, gwiazdka) i liczby. Ciąg może mieszać jedno i drugie, zgodnie z poziomem (US-11).
- Każdy ciąg ma dokładnie jedną odpowiedź: do pustego pola pasuje wyłącznie jedna reguła z jawnej listy reguł, a pole ma wtedy jedną wartość. Aplikacja potrafi ją wyliczyć i sprawdzić. Karta, w której do pustego pola pasują dwie reguły dające różne odpowiedzi, nie jest pokazana.
- Każde Generuj daje nową kartę: inne reguły albo inne elementy niż poprzednia karta.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm i drukuje się jako jedna strona. Druk jest czarny i bez odpowiedzi na kartce; postać przy poleceniu drukuje się w kolorze (US-21).
- Te same warunki na telefonie co w US-04: Generuj i Drukuj nie nachodzą na siebie, karta mieści się na A4 w szerokości i w długości, podgląd zostaje. Przeglądarki jak w US-04, w tym Brave.
- Strona sekwencji ma pasek „Postać”; wybrana postać stoi przy poleceniu, a elementy ciągów nie używają postaci (US-21).

### US-11: Rodzic wybiera poziom karty sekwencji

- **Given** rodzic jest na stronie „Sekwencje”
- **When** wybierze poziom (Poziom 1–4)
- **Then** karta ma długość ciągów, rodzaj reguł i liczbę brakujących elementów zgodne z tym poziomem

#### Acceptance Criteria

- Poziom zmienia długość ciągu, rodzaj reguł (kształty, liczby, mieszane), liczbę ciągów i liczbę pustych pól. Reguły są w Business Logic.
- Każdy poziom mieści się na jednej stronie A4 z marginesem 10 mm.
- Poziom jest na pasku strony sekwencji. Profil i ostatnie parametry pamiętają go same (US-08).

### US-12: Rodzic generuje kartę sudoku do druku

- **Given** rodzic otworzył z katalogu stronę „Sudoku”
- **When** uruchomi generowanie
- **Then** otrzymuje gotową do wydruku kartę A4 z planszą sudoku 4×4 z prostymi kształtami; w każdym wierszu brakuje jednego kształtu, a dziecko dorysowuje go tak, by w każdym wierszu, w każdej kolumnie i w każdym kwadracie 2×2 każdy z czterech kształtów wystąpił raz

#### Acceptance Criteria

- Plansza 4×4 używa czterech kształtów wylosowanych z pięciu najprostszych: koło, kwadrat, trójkąt, serce, krzyżyk (decyzja 2026-10-24). Kształty są grubymi czarnymi konturami z pustym środkiem. Nad planszą jest zdanie polecenia. Pod planszą jest jeden rząd: rysunek i nazwa każdej figury tej karty, w kolejności katalogu, ta sama wielkość na każdym rozmiarze.
- W każdym wierszu jest dokładnie jedno puste pole; jego miejsce w wierszu jest losowe.
- Rozwiązanie jest dokładnie jedno: plansza ma jedno poprawne uzupełnienie, które aplikacja potrafi wyliczyć i sprawdzić. Plansza z więcej niż jednym uzupełnieniem nie jest pokazana.
- Każde Generuj daje nową planszę: inny układ albo inne kształty niż poprzednia karta.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm i drukuje się jako jedna strona. Druk jest bez odpowiedzi na kartce.
- Te same warunki na telefonie co w US-04: Generuj i Drukuj nie nachodzą na siebie, karta mieści się na A4 w szerokości i w długości, podgląd zostaje. Przeglądarki jak w US-04, w tym Brave.
- Strona sudoku ma pasek „Postać”; wybrana postać stoi przy poleceniu (US-21). Pola planszy nie używają postaci z katalogu.

### US-13: Rodzic wybiera rozmiar i poziom sudoku

- **Given** rodzic jest na stronie „Sudoku”
- **When** wybierze rozmiar planszy (4×4, 6×6, 9×9) i poziom (łatwy, średni, trudny)
- **Then** plansza ma ten rozmiar, symbole zgodne z rozmiarem i liczbę pustych pól zgodną z poziomem

#### Acceptance Criteria

- Na pasku strony sudoku są dwa osobne wybory: „Rozmiar” i „Poziom”. Sudoku nie nazywa poziomów wiekiem (decyzja 2026-10-24).
- 4×4 ma jeden poziom: w każdym wierszu brakuje jednego pola (US-12). Pasek „Poziom” nie daje przy nim wyboru.
- 6×6 (prostokąty 2×3) ma trzy poziomy różniące się liczbą pustych pól. Symbole to sześć kształtów albo cyfry 1–6; wybiera je osobny przełącznik „Kształty / Cyfry”, widoczny przy 6×6 i 9×9.
- 9×9 (kwadraty 3×3) ma trzy poziomy różniące się liczbą pustych pól. Symbole to dziewięć kształtów albo cyfry 1–9 (ten sam przełącznik „Kształty / Cyfry”; cyfry dają zwykłe sudoku).
- Liczby pustych pól są w Business Logic. Przy każdej z nich rozwiązanie jest dokładnie jedno.
- Każdy rozmiar i poziom mieści się na jednej stronie A4 z marginesem 10 mm.
- Profil i ostatnie parametry pamiętają rozmiar, poziom, „Kształty / Cyfry” i kolory (US-08).

### US-14: Rodzic włącza kolory kształtów na karcie sudoku

- **Given** rodzic jest na stronie „Sudoku”, a plansza ma kształty (4×4 albo 6×6 i 9×9 z kształtami)
- **When** włączy kolory
- **Then** każdy kształt ma stały kolor kredki, a dziecko dorysowuje brakujący kształt i koloruje go według wzoru

#### Acceptance Criteria

- Kolory to osobny przełącznik na pasku strony sudoku, jak w symetrii (US-09). Domyślnie są wyłączone: kształty są czarnymi konturami.
- Każdy kształt ma jeden stały kolor na całej planszy (np. serce czerwone, koło niebieskie, trójkąt zielony). Bez liter i bez legendy kolorów. Rysunek na liście używa tej samej kredki, a nazwa zostaje czarna. Na drukarce czarno-białej kolory schodzą do odcieni szarości.
- Przełączenie kolorów zostawia tę samą planszę; nie generuje nowej.
- Przy cyfrach przełącznik kolorów nie jest dostępny.

### US-15: Rodzic generuje nonogram do druku

- **Given** rodzic otworzył z katalogu stronę „Nonogram”
- **When** uruchomi generowanie
- **Then** otrzymuje gotową do wydruku kartę A4 z pustą kratką i liczbami nad kolumnami i przy wierszach; dziecko zamalowuje kratki według liczb, a po rozwiązaniu widzi obiekt z katalogu szablonów

#### Acceptance Criteria

- Obrazek to cała sylwetka obiektu z katalogu szablonów symetrii (połowa szablonu i jej odbicie), zamalowane kratki czarne, puste białe. Detale będące dziurami w sylwetce (okno, oczy, pestki) zostają pustymi kratkami.
- Na poziomach średnim i trudnym nad każdą kolumną i z lewej strony każdego wiersza są liczby: długości kolejnych ciągów zamalowanych kratek. Nad kratką jest jedno zdanie polecenia. Karta nie zdradza nazwy obiektu.
- Na poziomach średnim i trudnym rozwiązanie jest dokładnie jedno: liczby wyznaczają jeden obrazek, który aplikacja potrafi wyliczyć i sprawdzić. Nonogram z więcej niż jednym rozwiązaniem nie jest pokazany. Dziecko dochodzi do obrazka bez zgadywania: wystarczają same liczby wiersz po wierszu i kolumna po kolumnie (decyzja 2026-10-25).
- Każde Generuj daje nowy nonogram: inny obiekt albo inny wariant niż poprzednia karta.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm i drukuje się jako jedna strona. Druk jest czarny i bez rozwiązania na kartce.
- Rodzic może włączyć „Pokaż rozwiązanie”, żeby zobaczyć sylwetkę na ekranie i sprawdzić dziecko. Domyślnie wyłączone; przełączenie zostawia tę samą kartę, a wydruk nigdy nie pokazuje rozwiązania (decyzja 2026-10-25).
- Te same warunki na telefonie co w US-04: Generuj i Drukuj nie nachodzą na siebie, karta mieści się na A4 w szerokości i w długości, podgląd zostaje. Przeglądarki jak w US-04, w tym Brave.
- Poziom łatwy (decyzja 2026-10-25, po makiecie: klasyczny nonogram jest za trudny dla przedszkolaków) nie ma liczb przy kolumnach. Z lewej strony każdego wiersza stoją znaczki po kolei: biały, szary albo czarny kwadracik z liczbą kratek, białe włącznie, np. „2 białe, 3 szare, 1 czarne, 2 białe”. Dziecko koloruje wiersz od lewej: białe kratki zostawia puste, szare koloruje na szaro, czarne na czarno. Rozwiązanie jest jedno, bo wiersz jest opisany w całości.
- Strona nonogramu ma pasek „Postać”; wybrana postać stoi przy poleceniu (US-21). Rozwiązaniem nadal jest obiekt z katalogu szablonów, nie postać.

### US-16: Rodzic wybiera poziom nonogramu

- **Given** rodzic jest na stronie „Nonogram”
- **When** wybierze poziom (łatwy, średni, trudny)
- **Then** karta ma siatkę, rodzaj opisu i obiekt zgodne z poziomem

#### Acceptance Criteria

- Na pasku strony jest wybór „Poziom”: łatwy, średni, trudny. Nonogram nie nazywa poziomów wiekiem (decyzja 2026-10-25, jak sudoku w US-13); domyślnie jest średni.
- Łatwy to prosty wariant dla przedszkolaków (siatka 8×12, znaczki przy wierszach); średni (12×15) i trudny (18×24) to klasyczny nonogram z liczbami. Klasyczny 8×12 odpadł.
- Zmiana poziomu przy pokazanej karcie generuje nową kartę na wybranym poziomie, a „Pokaż rozwiązanie” zostaje wyłączone.
- Każdy poziom ma grubszą linię co 5 kratek, mieści się na jednej stronie A4 z marginesem 10 mm, a kratka, liczby i znaczki są dość duże, żeby dziecko zamalowało pole i przeczytało liczbę.
- Profil i ostatnie parametry pamiętają poziom i kategorię (US-08; do 2026-10-26 poziom żył tylko w stanie strony). „Pokaż rozwiązanie” nie jest zapamiętywane i zawsze startuje wyłączone.

### US-17: Rodzic generuje kartę dyktanda graficznego do druku

- **Given** rodzic otworzył z katalogu stronę „Dyktando graficzne”
- **When** uruchomi generowanie
- **Then** otrzymuje gotową do wydruku kartę A4 z pustą kratką, zaznaczonym punktem startu i listą poleceń w postaci strzałek z liczbą kratek; dziecko rysuje po liniach kratki i odkrywa obrys obiektu

#### Acceptance Criteria

- Polecenie to liczba kratek i strzałka (→, ←, ↑, ↓), np. „3 →”. Polecenia stoją nad kratką w kolejności czytania, jedno zdanie polecenia nad nimi.
- Droga z poleceń to zewnętrzny obrys sylwetki obiektu z katalogu szablonów symetrii. Zaczyna się i kończy w punkcie startu, nie przecina się i nie dotyka samej siebie. Dziury w sylwetce (okno, oczy) nie są rysowane.
- Odpowiedź jest jedna: rysunek wynika wprost z poleceń. Aplikacja potrafi go wyliczyć i sprawdzić, że wraca do startu i mieści się w kratce.
- Każde Generuj daje nową kartę: inny obiekt albo inny wariant niż poprzednia karta.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm i drukuje się jako jedna strona. Druk jest czarny i bez rysunku odpowiedzi.
- Rodzic może włączyć „Pokaż rozwiązanie”, żeby zobaczyć na ekranie kreskę zewnętrznego obrysu. Domyślnie wyłączone; przełączenie zostawia tę samą kartę. Udane Generuj oraz zmiana poziomu, która układa nową kartę, wyłączają przełącznik. Sama zmiana kategorii go nie wyłącza. Nieudane Generuj zostawia przełącznik i poprzednią kartę. Wydruk nigdy nie pokazuje obrysu (decyzja 2026-10-25).
- Te same warunki na telefonie co w US-04: Generuj i Drukuj nie nachodzą na siebie, karta mieści się na A4 w szerokości i w długości, podgląd zostaje. Przeglądarki jak w US-04, w tym Brave.
- Strona dyktanda ma pasek „Postać”; wybrana postać stoi przy poleceniu (US-21). Rysunkiem nadal jest obrys obiektu z katalogu szablonów, nie postaci.

### US-18: Rodzic wybiera poziom dyktanda graficznego

- **Given** rodzic jest na stronie „Dyktando graficzne”
- **When** wybierze poziom (łatwy, średni, trudny)
- **Then** karta ma kratkę, obiekt i liczbę poleceń zgodne z tym poziomem

#### Acceptance Criteria

- Poziom zmienia rozmiar kratki i katalog obiektów (łatwy prostsze, trudny bogatsze), a przez to liczbę poleceń. Reguły są w Business Logic. Dyktando nie nazywa poziomów wiekiem (decyzja 2026-10-26), jak nonogram, z którym dzieli rozmiary obiektów.
- Każdy poziom mieści się na jednej stronie A4 z marginesem 10 mm razem z listą poleceń.
- Poziom jest na pasku strony dyktanda. Profil i ostatnie parametry pamiętają poziom i kategorię (US-08).

### US-19: Rodzic dostaje więcej obiektów na kartach z szablonów

- **Given** rodzic generuje kolejne karty symetrii, nonogramy albo dyktanda
- **When** klika Generuj wiele razy
- **Then** widzi więcej różnych obiektów niż rakieta, robot i truskawka

#### Acceptance Criteria

- Katalog szablonów ma pięć kategorii: Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny, Domy i budowle. Każda ma co najmniej cztery obiekty; startowa lista jest w Business Logic („Katalog szablonów obiektów”).
- Każdy obiekt jest symetryczny lewo–prawo, pionowy i rozpoznawalny po samej sylwetce. Ma wersję na każdy rozmiar szablonu (połowa 4×12, 6×15 i 9×24) i części losowane przez generator, jak dziś rakieta, robot i truskawka.
- Każdy obiekt ma co najmniej jedną kategorię; może mieć kilka.
- Nowe obiekty spełniają reguły karty symetrii (dotykają osi, mają kolor szablonu) i są dostępne w nonogramie i dyktandzie, gdy te karty istnieją.
- Kategorie są widoczne na pasku (US-20, S-26); „Wszystkie” jest domyślne.
- Labirynt, sekwencje i sudoku zostają bez zmian.

### US-20: Rodzic wybiera kategorię obiektów

- **Given** rodzic jest na stronie symetrii, nonogramu albo dyktanda graficznego
- **When** wybierze kategorię obiektów
- **Then** kolejne Generuj losuje obiekt tylko z tej kategorii

#### Acceptance Criteria

- Na pasku strony jest wybór „Kategoria”: Wszystkie, Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny, Domy i budowle. Domyślnie „Wszystkie”.
- Można wybrać dokładnie jedną kategorię. „Wszystkie” to też kategoria, a nie zaznaczenie kilku; kilku kategorii naraz nie da się zaznaczyć.
- Wybrana kategoria obowiązuje przy następnym Generuj, jak każde ustawienie generatora, i nie zmienia działania poziomu, rozmiaru ani kolorów.
- Każde Generuj w kategorii daje inny obiekt albo inny wariant niż poprzednia karta, na każdym poziomie i rozmiarze.
- Profil i ostatnie parametry pamiętają kategorię osobno dla każdej karty, jak poziom (US-08). Wybór na jednej stronie nie zmienia drugiej.
- Pasek z kategorią zostaje używalny na telefonie: Generuj i Drukuj nie nachodzą na siebie (US-04).

### US-21: Postać mówi polecenie na każdej karcie

- **Given** rodzic wybrał postać (z profilu, z ostatnich parametrów albo na pasku)
- **When** generuje kartę innego rodzaju niż labirynt
- **Then** wybrana postać stoi przy zdaniu polecenia, a polecenie jest w jej dymku, jakby postać mówiła je dziecku

#### Acceptance Criteria

- Postać to ten sam kolorowy obrazek co na labiryncie, z tego samego katalogu, także własny obrazek rodzica (US-02).
- Postać drukuje się zawsze w kolorze, niezależnie od przełącznika kolorów karty (decyzja 2026-10-26). Na drukarce czarno-białej schodzi do odcieni szarości.
- Przy „Bez postaci” karta ma samo zdanie polecenia, bez dymka.
- Postać jest ozdobą: nie zmienia zadania, odpowiedzi ani trudności. Pola zadania (kratka symetrii, ciągi, plansza sudoku, kratka nonogramu i dyktanda) nie używają postaci.
- Postać i dymek mieszczą się w obszarze karty nad zadaniem; zadanie nadal zajmuje większą część strony, a karta jest jedną stroną A4 z marginesem 10 mm.
- Na labiryncie postać zostaje przy starcie jak w US-01; labirynt nie dostaje dymka.

### US-22: Rodzic rozumie ustawienia z podpowiedzi w miejscu wyboru

- **Given** rodzic zmienia poziom, ustawienie karty albo postać, albo otwiera okno profilu
- **When** wykonuje wybór
- **Then** w tym samym miejscu widzi krótką podpowiedź, co się stało i co zostanie zapamiętane

#### Acceptance Criteria

- Po zmianie ustawienia na pasku przy aktywnym profilu pojawia się krótki komunikat „Zapamiętane dla {imię}”, który znika sam i nie zasłania karty ani przycisków.
- Pod listą postaci przy aktywnym profilu, gdy wybrana postać różni się od ulubionej, jest tekst „Tylko na tę kartę” i wybór „Ustaw jako ulubioną {imię}”.
- Każdy wiersz listy poziomów ma nazwę i pół zdania o tym, co się zmienia; przy labiryncie, symetrii, sekwencjach i dyktandzie (kartach z dawną nazwą wiekową) ma też pod opisem typowy wiek z kolumny „Dawna nazwa”. Wiersz ma więc trzy linie, np. „Poziom 3” / „mniejsza kratka, bez podpowiedzi” / „zwykle ok. 6 lat”; sudoku i nonogram mają dwie linie („łatwy” / „znaczki przy wierszach, duża kratka”), bez wieku (decyzja 2026-10-26).
- Okno profilu ma jedno zdanie: ustawienia każdej karty zapamiętują się same, a ulubiona postać zmienia się tylko jawnie.
- W stopce jest link do krótkiej strony „Jak to działa” z całą zasadą profilu, poziomów i postaci.
- Nie ma samouczka przy pierwszym wejściu ani okna pomocy, które trzeba zamknąć, żeby korzystać ze strony.

## Functional Requirements

### Generator i druk

- FR-001: Rodzic może wybrać jeden z poziomów trudności danego rodzaju karty: łatwy / średni / trudny przy kartach z trzema poziomami, Poziom 1…N przy kartach z większą liczbą poziomów; każdy poziom ma krótki opis tego, co zmienia, a przy labiryncie, symetrii, sekwencjach i dyktandzie, które miały dawną nazwę wiekową, także typowy wiek pod opisem. Priority: must-have
  > Socrates: Counter-argument considered: nazwy poziomów mogą wprowadzać w błąd bez mierzalnych reguł. Resolution: revised (2026-10-26); poziomy nazwane wiekiem oceniały dziecko i nie pasowały do kart, w których umiejętności rosną w innym tempie, więc żadna karta nie nazywa poziomów wiekiem. Reguły (szerokość alejki, długość drogi, kratka, ciągi) są w Business Logic. Poziom 3 labiryntu i Poziom 3 symetrii nie oznaczają tej samej trudności.
- FR-002: Rodzic może wybrać postać z dostarczonego zestawu. Priority: must-have
  > Socrates: Counter-argument considered: przygotowanie i prawa do postaci mogą opóźnić podstawowy przepływ. Resolution: kept; źródło postaci i prawa pozostają otwartym pytaniem.
- FR-003: Rodzic może wygenerować strukturalnie poprawny labirynt zgodny z wybranymi parametrami. Priority: must-have
  > Socrates: Counter-argument considered: poprawność i trudność mogą być niemożliwe do potwierdzenia bez ludzkiego oka. Resolution: kept; połączenie start–meta, unikalność rozwiązania, zakręty, długość i punkty wyboru mają być sprawdzalne według jawnych reguł.
- FR-004: Rodzic może zobaczyć kartę A4 przed uruchomieniem standardowego drukowania. Priority: must-have
  > Socrates: Counter-argument considered: osobny podgląd może dublować standardowe okno drukowania. Resolution: revised; karta ma być widoczna przed drukiem, ale nie wymaga osobnego dodatkowego ekranu.
- FR-005: Rodzic może wydrukować kartę jako jedną stronę A4. Priority: must-have
  > Socrates: Counter-argument considered: przeglądarki i drukarki różnie stosują marginesy oraz skalowanie. Resolution: kept; obsługiwane środowiska i mierzalne granice wydruku wymagają doprecyzowania.
- FR-006: Rodzic bez profilu dziecka otrzymuje jako widoczne, edytowalne wartości domyślne ostatnio użyte parametry: ustawienia osobno dla każdego rodzaju karty i jedną ostatnio użytą postać dla wszystkich kart. Priority: must-have
  > Socrates: Counter-argument considered: wspólne urządzenie może podstawić ustawienia innego dziecka. Resolution: revised; wartości są zawsze widoczne i można je zmienić przed generowaniem, a osobne dzieci mają osobne profile.

### Profile dzieci

- FR-007: Rodzic może utworzyć opcjonalny lokalny profil dziecka z imieniem i ulubioną postacią. Priority: must-have
  > Socrates: Counter-argument considered: profile nie są potrzebne do podstawowej wartości i zwiększają zakres MVP. Resolution: kept; korzystanie z profilu pozostaje opcjonalne, ale możliwość zarządzania profilami należy do MVP. Od 2026-10-26 tworzenie nie pyta o poziom; ustawienia kart profil zbiera sam (FR-017).
- FR-008: Rodzic może wyświetlić i wybrać zapisany profil dziecka, gdy istnieje rzeczywisty wybór profilu. Priority: must-have
  > Socrates: Counter-argument considered: selektor jest zbędny dla rodzica jednego dziecka. Resolution: revised; wybór profilu nie jest pokazywany, gdy nie ma rzeczywistego wyboru.
- FR-009: Rodzic może jawnie zmienić ulubioną postać profilu w oknie profilu albo wyborem „Ustaw jako ulubioną” przy pasku; ustawienia kart profil zapamiętuje sam (FR-017). Priority: must-have
  > Socrates: Counter-argument considered: jednorazowa zmiana parametrów karty nie powinna przypadkiem zmieniać profilu, np. gdy rodzeństwo drukuje na profilu Oli. Resolution: revised (2026-10-26); jawny zapis zostaje tylko dla ulubionej postaci, bo jest wspólna dla wszystkich kart. Ustawienia karty zapisują się same, bo są zawsze widoczne na pasku i plakietkach katalogu, a każdą zmianę cofa jeden wybór; ręczny zapis dla każdej z sześciu kart byłby uciążliwy.
- FR-010: Rodzic może usunąć profil dziecka po potwierdzeniu operacji. Priority: must-have
  > Socrates: Counter-argument considered: przypadkowe usunięcie lokalnego profilu może być nieodwracalne. Resolution: revised; usunięcie wymaga potwierdzenia.

### Gotowe karty

- FR-011: Rodzic może wybrać gotowy labirynt z biblioteki, zobaczyć podgląd i wydrukować go na A4. Priority: nice-to-have
  > Socrates: Counter-argument considered: przygotowanie i utrzymywanie przykładów zabiera czas podstawowym funkcjom. Resolution: kept as nice-to-have outside MVP.

### Katalog postaci i telefon

- FR-012: Rodzic może wybrać dowolną postać z dostarczonego katalogu jedenastu postaci: Samochodzik, Rakieta, Dinozaur, Jednorożec, Kot, Pies, Robot, Smok, Strażak, Syrenka i Wróżka. Priority: must-have
- FR-013: Rodzic może na telefonie wygenerować labirynt, zobaczyć kartę i wydrukować ją jako jedną stronę A4. Priority: must-have

### Rodzaje kart i symetria

- FR-014: Rodzic może wybrać rodzaj karty w katalogu z miniaturami na stronie głównej; każdy rodzaj ma własną stronę generatora, a labirynt na niej nie zmienia działania. Priority: must-have
  > Socrates: Counter-argument considered: katalog to dodatkowe kliknięcie dla rodzica, który chce tylko labirynt. Resolution: kept; miniatura pokazuje, jak wygląda karta, więc rodzic nie zgaduje po nazwie, a strona generatora zostaje taka jak dziś. Skrót „ostatnio użyte” jest możliwym dodatkiem poza tym kamieniem.
- FR-015: Rodzic może wygenerować kartę symetrii z połową obiektu z katalogu szablonów i jedną sprawdzalną odpowiedzią, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have
  > Socrates: Counter-argument considered: dorysowanie odbicia na kratce może być za łatwe do zrobienia samemu bez aplikacji. Resolution: kept; wartość to nowa karta na właściwym poziomie na żądanie, ten sam problem co przy labiryncie.
- FR-016: Rodzic może wybrać poziom karty symetrii (Poziom 1–4: rozmiar kratki, katalog obiektów, podpowiedź). Priority: must-have
  > Socrates: Counter-argument considered: bez mierzalnych reguł nazwy poziomów mogą wprowadzać w błąd, a sam rozmiar kratki zmienia głównie motorykę, nie trudność odbicia. Resolution: revised (2026-10-23); poziom łączy kratkę z położeniem obiektu, osią i podpowiedzią, a reguły są w Business Logic. Numery zamiast wieku od 2026-10-26 (FR-001).
- FR-017: Profil dziecka sam pamięta ustawienia każdego rodzaju karty (wszystko z paska poza postacią i „Pokaż rozwiązanie”), zapisuje każdą zmianę na pasku od razu i pokazuje zapamiętany poziom na miniaturach katalogu oraz w podsumowaniu okna profilu; ustawienia karty zmienia się tylko na pasku tej karty. Priority: must-have
  > Socrates: Counter-argument considered: nowe pola w zapisanych profilach mogą zepsuć istniejące dane, a edycja ustawień w dwóch miejscach (okno profilu i pasek) myli. Resolution: revised (2026-10-26); stare profile i ostatnie parametry nadal się wczytują, a dawny poziom zostaje poziomem labiryntu. Okno profilu pokazuje ustawienia tylko do odczytu, więc jest jedno miejsce zmiany, z podglądem karty. Wiek w profilu odpadł: nie wyznacza poziomu żadnej karty.
- FR-018: Rodzic może niezależnie od poziomu włączyć kolory na karcie symetrii; kratki wzoru mają prawdziwe kolory, bez liter i bez legendy, domyślnie czarna sylwetka. Priority: must-have
  > Socrates: Counter-argument considered: kolorowy druk wymaga kolorowej drukarki i łamie wspólną umowę czarnego druku. Resolution: revised (2026-10-23); po makiecie użytkownik wybrał prawdziwe kolory zamiast liter i legendy, a domyślny druk zostaje czarną sylwetką; kolor wymaga kolorowej drukarki, na czarno-białej schodzi do szarości.

### Sekwencje i sudoku

- FR-019: Rodzic może wygenerować kartę sekwencji z kilkoma ciągami liczb i kształtów, w których brakuje elementów, z jedną sprawdzalną odpowiedzią każdego ciągu, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have
  > Socrates: Counter-argument considered: ciąg z lukami bywa niejednoznaczny, bo do pustego miejsca pasują dwie reguły. Resolution: kept; generator sprawdza jawną listę reguł i odrzuca ciąg, w którym dwie reguły dają różne odpowiedzi.
- FR-020: Rodzic może wybrać poziom karty sekwencji (Poziom 1–4: długość ciągu, rodzaj reguł, liczba pustych pól). Priority: must-have
  > Socrates: Counter-argument considered: poziomy bez mierzalnych reguł wprowadzają w błąd. Resolution: kept; reguły są w Business Logic, wartości startowe potwierdza wydruk. Numery zamiast wieku od 2026-10-26 (FR-001).
- FR-021: Rodzic może wygenerować kartę sudoku 4×4 z prostymi kształtami do narysowania i jednym rozwiązaniem, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have
  > Socrates: Counter-argument considered: dziecko w wieku przedszkolnym nie rysuje postaci w małych polach. Resolution: revised (2026-10-24); zamiast postaci z katalogu proste kształty (koło, kwadrat, trójkąt, serce, krzyżyk, gwiazdka, romb, księżyc, kropla), które dziecko umie narysować; legenda numerów odpada, a z nią pytanie o prawa do postaci w sudoku.
- FR-022: Rodzic może wybrać rozmiar sudoku (4×4, 6×6, 9×9) i poziom (łatwy, średni, trudny: liczba pustych pól), a przy 6×6 i 9×9 kształty albo cyfry. Priority: must-have
  > Socrates: Counter-argument considered: im więcej pustych pól, tym łatwiej o wiele rozwiązań, a dwa paski odchodzą od poziomów nazwanych wiekiem jak w innych kartach. Resolution: revised (2026-10-24); generator zostawia tylko takie pola, przy których rozwiązanie jest dokładnie jedno; użytkowniczka wybrała dwa paski, bo 7-latek robi już 9×9 i wiek nie wyznacza rozmiaru.
- FR-023: Rodzic może włączyć kolory kształtów na karcie sudoku; każdy kształt ma stały kolor kredki, domyślnie czarne kontury. Priority: must-have
  > Socrates: Counter-argument considered: kolorowy druk łamie wspólną umowę czarnego druku. Resolution: kept; jak w symetrii (FR-018) domyślny druk zostaje czarny, a kolor jest wyborem rodzica.

### Nonogram, dyktando graficzne i obiekty z szablonów

- FR-024: Rodzic może wygenerować nonogram, którego rozwiązaniem jest sylwetka obiektu z katalogu szablonów, z jednym sprawdzalnym rozwiązaniem, zobaczyć jego podgląd i wydrukować go jako jedną stronę A4, także na telefonie. Priority: must-have
  > Socrates: Counter-argument considered: sylwetka narysowana do symetrii nie musi dawać nonogramu z jednym rozwiązaniem, a „Nonogram postaci” czekał na bitmapy postaci. Resolution: revised (2026-10-25); obrazkiem jest obiekt z szablonów symetrii zamiast postaci, a generator sprawdza solverem jedno rozwiązanie i nie pokazuje wariantu, który go nie ma.
- FR-025: Rodzic może wybrać poziom nonogramu (łatwy, średni, trudny): łatwy to prosty wariant ze znaczkami przy wierszach, średni i trudny to klasyczny nonogram 12×15 i 18×24. Priority: must-have
  > Socrates: Counter-argument considered: poziomy nazwane wiekiem jak w innych kartach. Resolution: revised (2026-10-25); poziomy nazwane łatwy, średni, trudny, nie wiekiem, jak sudoku (FR-022). Po makiecie użytkowniczka uznała klasyczny nonogram za zbyt trudny dla przedszkolaków, więc łatwy to prosty wariant ze znaczkami (biały, szary, czarny z liczbą kratek), a klasyczny jest dla starszych dzieci.
- FR-026: Rodzic może wygenerować kartę dyktanda graficznego z poleceniami (liczba kratek i strzałka), które prowadzą po liniach kratki wzdłuż obrysu obiektu z katalogu szablonów, z jedną sprawdzalną odpowiedzią, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have
  > Socrates: Counter-argument considered: obrys sylwetki może dotykać sam siebie w narożniku kratki i wtedy polecenia są dwuznaczne dla dziecka. Resolution: kept; generator odrzuca warianty, których obrys się przecina albo dotyka sam siebie.
- FR-027: Rodzic może wybrać poziom dyktanda graficznego (łatwy, średni, trudny: rozmiar kratki, katalog obiektów, liczba poleceń). Priority: must-have
  > Socrates: Counter-argument considered: poziomy bez mierzalnych reguł wprowadzają w błąd. Resolution: kept; reguły są w Business Logic, wartości startowe potwierdza wydruk. Revised (2026-10-26): łatwy / średni / trudny zamiast 5, 6 i 7 lat, jak nonogram (FR-025), z którym dyktando dzieli trzy rozmiary obiektów.
- FR-028: Rodzic dostaje więcej obiektów z katalogu szablonów, pogrupowanych w pięć kategorii po co najmniej cztery obiekty, na karcie symetrii, nonogramie i dyktandzie. Priority: must-have
  > Socrates: Counter-argument considered: każda gotowa lista szablonów to znowu skończona biblioteka (Open Questions 7). Resolution: kept; więcej obiektów z losowanymi częściami odsuwa powtórki, a trzy karty dzielą jeden katalog, więc każdy nowy obiekt działa trzy razy. Revised (2026-10-25): lista z przykładów (jabłko, motyl, korona) zamieniona na obiekty pionowe, bo wszystkie siatki są wyższe niż szersze, a szeroki obiekt zajmuje tylko pas kartki.
- FR-029: Rodzic może wybrać na pasku symetrii, nonogramu i dyktanda jedną kategorię obiektów albo „Wszystkie”. Priority: must-have
  > Socrates: Counter-argument considered: wąska kategoria szybciej się powtarza, a zaznaczanie kilku kategorii daje więcej swobody. Resolution: kept as single choice (2026-10-25, decyzja użytkownika); „Wszystkie” to osobna kategoria, a każda kategoria ma co najmniej cztery obiekty w każdym rozmiarze, więc kolejne karty się nie powtarzają.

### Postać na kartach i podpowiedzi

- FR-030: Na każdej karcie poza labiryntem wybrana postać stoi przy zdaniu polecenia i „mówi” je w dymku; drukuje się zawsze w kolorze. Priority: must-have
  > Socrates: Counter-argument considered: kolorowa postać łamie umowę czarnego druku, a pasek „Postać” wraca na strony, które go celowo nie miały. Resolution: kept (2026-10-26); postać jest ozdobą, nie częścią zadania, więc nie zmienia odpowiedzi; drukuje się w kolorze jak na labiryncie i na czarno-białej drukarce schodzi do szarości. Ulubiona postać z profilu dostaje sens na każdej karcie, a „Bez postaci” zostaje.
- FR-031: Rodzic widzi krótkie podpowiedzi w miejscu wyboru (komunikat o zapamiętaniu, „Tylko na tę kartę”, opis poziomu, zdanie w oknie profilu) i może otworzyć stronę „Jak to działa”. Priority: must-have
  > Socrates: Counter-argument considered: podpowiedzi to łatka na zbyt złożony model ustawień. Resolution: kept; zasada jest prosta (karta pamięta pasek, postać zmienia się jawnie), a podpowiedź pokazuje ją dokładnie wtedy, gdy rodzic coś zmienia. Jeśli wydruk próbny pokaże, że podpowiedzi nie wystarczają, poprawiamy model, a nie dokładamy samouczek.
- FR-032: Rodzic może w oknie profilu przywrócić domyślne ustawienia wszystkich kart („Zacznij od nowa”); imię i ulubiona postać zostają. Priority: nice-to-have
  > Socrates: Counter-argument considered: to kolejny przycisk w oknie, które ma zostać małe. Resolution: kept as nice-to-have; przydaje się, gdy profil przechodzi na młodsze rodzeństwo, ale to samo da się zrobić paskiem każdej karty.

## Non-Functional Requirements

- Od uruchomienia generowania do pokazania gotowej karty upływa nie więcej niż 5 sekund.
- Karta mieści się na jednej stronie A4 i zachowuje margines co najmniej 10 mm z każdej strony. Margines dotyczy ścian i ramki labiryntu; znak postaci przy starcie może wejść w ten pas.
- Generowanie, podgląd i druk działają w aktualnych desktopowych wersjach Chrome, Edge, Brave, Firefox i Safari.
- Generowanie, podgląd i druk działają na telefonie w aktualnych mobilnych wersjach Chrome, Edge, Brave, Firefox i Safari.
- Na telefonie kontrolki generowania i drukowania nie nachodzą na siebie.
- Na telefonie labirynt mieści się na jednej stronie A4 w szerokości i w długości, z marginesem co najmniej 10 mm. Margines dotyczy ścian i ramki labiryntu; znak postaci przy starcie może wejść w ten pas.
- Karta symetrii spełnia te same granice co labirynt: generowanie do 5 sekund, jedna strona A4, margines co najmniej 10 mm (ściany i ramka kratki), domyślny druk czarny, a przy włączonych kolorach prawdziwe kolory kratek bez liter i legendy, te same przeglądarki na komputerze i na telefonie, w tym Brave.
- Karty sekwencji i sudoku spełniają te same granice co labirynt: generowanie do 5 sekund (także sudoku 9×9 na najtrudniejszym poziomie), jedna strona A4, margines co najmniej 10 mm, domyślny druk czarny bez odpowiedzi (sudoku z włączonymi kolorami drukuje kształty w kolorach), te same przeglądarki na komputerze i na telefonie, w tym Brave.
- Nonogram i dyktando graficzne spełniają te same granice co labirynt: generowanie do 5 sekund (także trudny nonogram ze sprawdzeniem jednego rozwiązania), jedna strona A4, margines co najmniej 10 mm, czarny druk bez odpowiedzi, te same przeglądarki na komputerze i na telefonie, w tym Brave.
- Postać przy poleceniu (US-21) jest jedynym elementem, który drukuje się w kolorze niezależnie od przełącznika kolorów karty.
- Lokalne profile dzieci, zapamiętane w nich ustawienia kart i ostatnie parametry pozostają dostępne między wizytami do czasu usunięcia ich przez rodzica albo wyczyszczenia danych przeglądarki.
- Dane profili dzieci i ostatnie parametry nie opuszczają urządzenia.
- Wygenerowane karty nie są przechowywane po zakończeniu przepływu drukowania.

## Business Logic

Aplikacja zawsze tworzy labirynt z dokładnie jednym rozwiązaniem, a poziom wyznaczają szerokość alejki i sposób losowania labiryntu.

Rodzic wybiera jeden z sześciu numerowanych poziomów (Poziom 1–6) oraz jedną z jedenastu postaci dostarczonego katalogu: Samochodzik, Rakieta, Dinozaur, Jednorożec, Kot, Pies, Robot, Smok, Strażak, Syrenka albo Wróżka. Może też zostać bez postaci. Obrys zostaje pionowym prostokątem na kartce A4. Osobnej kontrolki długości drogi nie ma. Dwa poziomy mogą dzielić szerokość alejki i różnić się sposobem losowania. Każde Generuj daje nowy labirynt.

| Poziom   | Dawna nazwa | Alejka      | Siatka | Losowanie                         | Droga do mety (typowo) |
| -------- | ----------- | ----------- | ------ | --------------------------------- | ---------------------- |
| Poziom 1 | 3 lata      | około 21 mm | 9×11   | krótka droga, dużo krótkich odnóg | około 21 komórek       |
| Poziom 2 | 4 lata      | około 21 mm | 9×11   | długa, kręta droga                | około 41 komórek       |
| Poziom 3 | 5 lat       | około 15 mm | 13×16  | krótka droga, dużo krótkich odnóg | około 32 komórek       |
| Poziom 4 | 6 lat       | około 15 mm | 13×16  | długa, kręta droga                | około 80 komórek       |
| Poziom 5 | 7–8 lat     | około 11 mm | 17×21  | długa, kręta droga                | około 130 komórek      |
| Poziom 6 | nastolatek  | około 7 mm  | 27×33  | długa, kręta droga                | około 300 komórek      |

Kolumna „Dawna nazwa” w tej i kolejnych tabelach łączy poziom z dotychczasową etykietą i z zapisanymi danymi; nie jest nazwą poziomu ani etykietą na pasku, ale jest źródłem dopisku o typowym wieku pod opisem w liście poziomów labiryntu, symetrii, sekwencji i dyktanda (Open Questions 12, decyzja 2026-10-26).

Droga do mety nie jest progiem. To typowa długość dla siatki i sposobu losowania; pojedyncza karta może być krótsza albo dłuższa.

Na Poziomach 1–5 start jest na środku górnej krawędzi, napis „Meta” na środku dolnej, a znak postaci zostaje na środku wejścia. Na Poziomie 6 start i meta są w narożnikach; wybrana postać stoi nad narożnym startem, lewą krawędzią równo z lewą krawędzią labiryntu, a pas nad znakiem równa się pasowi pod „Meta”. Pętle w jego ślepych odnogach są dozwolone, jeśli nie powstaje druga droga od startu do mety.

Krótki poziom przy tej samej alejce losuje się sposobem, który daje krótszą drogę i więcej krótkich odnóg, żeby krótka droga nie była zagadką ukrytą wśród pułapek. Dłuższy poziom losuje długą, krętą drogę z mniejszą liczbą rozgałęzień.

Wynikiem jest karta A4. Labirynt zajmuje większą część strony, zachowuje margines co najmniej 10 mm i spełnia reguły wybranego poziomu.

### Karta symetrii

Aplikacja zawsze tworzy kartę z dokładnie jedną odpowiedzią: odbiciem wzoru względem osi. Poziom wyznaczają rozmiar kratki, katalog obiektów i podpowiedź; oś jest zawsze pionowa (pozioma odpadła 2026-10-23: obiekty z katalogu są symetryczne lewo–prawo, obrócone leżałyby na boku). Kolory są osobnym ustawieniem rodzica, niezależnym od poziomu.

Rodzic wybiera jeden z czterech numerowanych poziomów (Poziom 1–4). Kartka to pionowy prostokąt A4 z kratką podzieloną osią na dwie równe połowy i jednym zdaniem polecenia nad kratką. Wzór jest połową symetrycznego obiektu (np. rakieta, robot, truskawka, jabłko, motyl, korona) zamalowaną na kratkach po jednej stronie osi; druga strona jest pusta poza kratkami podpowiedzi. Dziecko zamalowuje kratki po drugiej stronie tak, by obiekt odbijał się w osi. Wzór nie używa postaci z katalogu; postać stoi tylko przy poleceniu (US-21).

Obiekty pochodzą z katalogu szablonów zapisanych w kodzie. Szablon ma części, które generator losuje (np. liczba okien i kształt skrzydeł rakiety, pestki truskawki, oczy i ramiona robota), więc ten sam obiekt daje różne karty. Każde Generuj daje inny obiekt albo inny wariant niż poprzednia karta. Szablon musi zmieścić się w połowie siatki danego poziomu. Poziom 1 ma własne, prostsze warianty obiektów rysowane na połowie 4×12; Poziomy 2 i 3 używają szablonów 6×15; Poziom 4 ma bogatsze warianty (więcej części i szczegółów) rysowane na połowie 9×24.

| Poziom   | Dawna nazwa | Kratka      | Siatka (cała) | Obiekty             | Podpowiedź                       |
| -------- | ----------- | ----------- | ------------- | ------------------- | -------------------------------- |
| Poziom 1 | 4 lata      | około 20 mm | 8×12          | proste, połowa 4×12 | 3 kratki odbicia przy osi, blade |
| Poziom 2 | 5 lat       | około 15 mm | 12×16         | szablony 6×15       | brak                             |
| Poziom 3 | 6 lat       | około 12 mm | 14×20         | szablony 6×15       | brak                             |
| Poziom 4 | 7 lat       | około 10 mm | 18×24         | bogate, połowa 9×24 | brak                             |

Obiekt zawsze dotyka osi, a dziecko go przedłuża. Odsunięcie obiektu od osi odpadło (2026-10-23): odsunięta połowa przestaje być jednym obiektem. Trudność rośnie przez mniejszą kratkę, większą siatkę, bogatsze obiekty i brak podpowiedzi. Wartości są startowe i zostają potwierdzone na wydruku.

Kolory (US-09): przy włączonych kolorach każda kratka obiektu ma prawdziwy kolor kredki (czerwony, zielony, żółty, niebieski, pomarańczowy, szary, czarny albo brązowy; brązowy doszedł 2026-10-25 z katalogiem obiektów), bez liter i bez legendy. Detale będące dziurami w sylwetce (okno, oczy, usta, pestki) wykrywa generator i maluje kolorem szablonu albo zostawia białe, gdy szablon tak ustala (brzuch pingwina, kropki muchomora). Odpowiedź to odbicie wraz z kolorem każdej kratki. Przełącznik nie zmienia karty. Przy wyłączonych kolorach obiekt jest czarną sylwetką.

Reguły, które generator sprawdza: wzór ma co najmniej jedną zamalowaną kratkę i co najmniej jedną pustą w swojej połowie; żadna zamalowana kratka nie leży na osi; druga połowa zawiera wyłącznie kratki podpowiedzi, które są częścią odbicia, i nie całe odbicie; odpowiedź jest dokładnie odbiciem, przy kolorach razem z literą każdej kratki; obiekt dotyka osi, a liczba podpowiedzi zgadza się z poziomem. Karta, która łamie którąś z tych reguł, nie jest pokazana.

Wynikiem jest karta A4. Kratka zajmuje większą część strony, zachowuje margines co najmniej 10 mm i spełnia reguły wybranego poziomu.

### Karta sekwencji

Aplikacja zawsze tworzy kartę, w której każdy ciąg ma dokładnie jedną odpowiedź. Poziom wyznaczają długość ciągu, rodzaj reguł i liczba pustych pól. Rodzic wybiera jeden z czterech numerowanych poziomów (Poziom 1–4). Kartka to pionowy prostokąt A4 z jednym zdaniem polecenia na górze i ciągami jeden pod drugim; każdy ciąg to rząd pól, część pól jest wypełniona, część pusta.

Elementy to cztery kształty (koło, kwadrat, trójkąt, gwiazdka) i liczby. Reguły pochodzą z jawnej listy: powtarzanie wzoru (AB, ABC, AAB), liczby rosnące o 1 lub o 2, liczby malejące o 1, rosnące grupy (A, AB, ABB) i mieszanie: kształt na przemian z liczbą rosnącą. Ciąg dla pustego pola jest poprawny, gdy z całej listy reguł pasuje do niego dokładnie jedna odpowiedź. Karta, której którykolwiek ciąg nie spełnia tego, nie jest pokazana.

| Poziom   | Dawna nazwa | Długość ciągu | Reguły                                               | Puste pola w ciągu | Liczba ciągów |
| -------- | ----------- | ------------- | ---------------------------------------------------- | ------------------ | ------------- |
| Poziom 1 | 4 lata      | 5 pól         | wzór AB z dwoma kształtami                           | 1                  | 5             |
| Poziom 2 | 5 lat       | 7 pól         | wzór AB, AAB, ABC z kształtami                       | 1–2                | 6             |
| Poziom 3 | 6 lat       | 8 pól         | wzór AB, AAB, ABC z kształtami                       | 2                  | 7             |
| Poziom 4 | 7 lat       | 8 pól         | mieszane: kształt z liczbą, malejące i rosnące grupy | 2–3                | 7             |

Pola wypełniają szerokość wiersza, więc krótszy ciąg daje większe pole na odpowiedź; dlatego najłatwiejszy poziom ma najkrótszy ciąg. Wszystkie pola mają cienką ramkę, puste pole ma ramkę przerywaną i mały znak zapytania w rogu. Kształty są obrysami. Polecenie: „Co pasuje w puste pole? Uzupełnij.” Na Poziomach 1 i 2 jedno puste pole jest zawsze na końcu ciągu, drugie (jeśli jest) leży w drugiej połowie, a wzór pokazuje się w całości przed pierwszą luką.

Doprecyzowanie z planu poziomów (2026-10-24):

- Rosnące grupy to bloki A, AB, ABB, ABBB… sklejone i ucięte do długości ciągu (przy 8 polach: A A B A B B A B).
- Mieszane to jeden stały kształt na przemian z liczbą rosnącą o 1 (kształt na polach parzystych albo nieparzystych).
- Liczby na karcie mają od 1 do 20, więc w polu są najwyżej dwie cyfry. Liczba to gruba cyfra na środku pola, bez ramki.
- Na Poziomach 1 i 2 luki wyglądają jak w tabeli (ostatnie pole, druga luka w drugiej połowie). Na Poziomach 3 i 4 luki leżą w dowolnych polach po tych, które pokazują regułę (liczby: dwa pierwsze pola, wzory ABC i AAB oraz grupy: trzy pierwsze). Poziom 4 ma trzy ciągi z trzema lukami, pozostałe cztery z dwiema.
- Poziom 3 losuje po dwa ciągi AB, AAB i ABC oraz jeden dowolny z tych trzech; Poziom 4 po dwa ciągi kształt z liczbą, malejące o 1 i rosnące grupy oraz jeden dowolny.
- Jedna karta nie pokazuje dwa razy tej samej sekwencji, nawet z lukami w innych polach.
- Dwuznaczność liczy się względem całej listy reguł, także na Poziomach 1 i 2; wiersz, do którego pasuje inna reguła z inną odpowiedzią (np. AAB z dwiema lukami pasujące też do rosnących grup), nie jest pokazany.

Kolory są osobnym ustawieniem rodzica, niezależnym od poziomu. Domyślnie kształty są czarnymi konturami. Po włączeniu każdy kształt tej karty ma jedną kredkę, tę samą w każdym wierszu, wylosowaną przy Generuj z dziewięciu kredek. Liczby, „?” i puste pola zostają jak przy wyłączonych kolorach. Przełącznik nie układa nowej karty.

Wartości są startowe i zostają potwierdzone na wydruku. Wynikiem jest karta A4; ciągi zajmują większą część strony i zachowują margines co najmniej 10 mm.

### Karta sudoku

Przebudowane 2026-10-24: zamiast planszy 4×4 z postaciami z katalogu trzy rozmiary z prostymi kształtami albo cyframi, a rozmiar i poziom są dwoma osobnymi wyborami, nie wiekiem (7-latek robi już 9×9).

Aplikacja zawsze tworzy planszę z dokładnie jednym rozwiązaniem. Zasada: w każdym wierszu, w każdej kolumnie i w każdym bloku każdy symbol występuje raz. Generator układa pełne poprawne sudoku, potem usuwa pola tak, by pozostałe wypełnione pola nadal miały jedno rozwiązanie, aż do liczby pustych pól dla rozmiaru i poziomu. Plansza, która tego nie spełnia, nie jest pokazana. Plansza nie używa postaci z katalogu; postać stoi tylko przy poleceniu (US-21).

Kształty to: koło, kwadrat, trójkąt, serce, krzyżyk, gwiazdka, romb, księżyc, kropla — proste do narysowania przez dziecko. Plansza 4×4 losuje cztery z pięciu najprostszych (koło, kwadrat, trójkąt, serce, krzyżyk), 6×6 sześć, 9×9 używa wszystkich dziewięciu. Przy 6×6 i 9×9 rodzic wybiera kształty albo cyfry (przełącznik „Kształty / Cyfry”, 9×9 z cyframi to zwykłe sudoku). Pod planszą z kształtami jest jeden rząd: rysunek i nazwa każdej figury tej karty, w kolejności katalogu, ta sama wielkość na każdym rozmiarze. Karta z cyframi rzędu nie ma.

| Rozmiar | Bloki | Symbole                                  | Poziom | Puste pola                                     |
| ------- | ----- | ---------------------------------------- | ------ | ---------------------------------------------- |
| 4×4     | 2×2   | 4 kształty                               | jeden  | 4 z 16: jedno w każdym wierszu, miejsce losowe |
| 6×6     | 2×3   | 6 kształtów albo cyfry 1–6 (przełącznik) | łatwy  | 12 z 36                                        |
| 6×6     | 2×3   | jak wyżej                                | średni | 18 z 36                                        |
| 6×6     | 2×3   | jak wyżej                                | trudny | 22 z 36                                        |
| 9×9     | 3×3   | 9 kształtów albo cyfry 1–9 (przełącznik) | łatwy  | 35 z 81                                        |
| 9×9     | 3×3   | jak wyżej                                | średni | 45 z 81                                        |
| 9×9     | 3×3   | jak wyżej                                | trudny | 52 z 81                                        |

Plansza 4×4 z jednym pustym polem w każdym wierszu ma zawsze jedno rozwiązanie: brakujący kształt wynika z samego wiersza.

Kolory (US-14): przy kształtach rodzic może włączyć kolory. Każdy kształt ma wtedy jeden stały kolor kredki na całej planszy, bez liter i bez legendy kolorów. Rysunek na liście używa tej samej kredki, a nazwa zostaje czarna. Przypisanie (zatwierdzone na wydruku 2026-10-25, kształty wypełnione kolorem): serce czerwone, koło niebieskie, trójkąt zielony, kwadrat pomarańczowy, krzyżyk fioletowy, gwiazdka żółta, romb brązowy, księżyc szary, kropla czarna. Przełącznik nie zmienia planszy. Domyślnie kształty są czarnymi konturami. Przy cyfrach kolorów nie ma.

Wartości są startowe i zostają potwierdzone na wydruku; użytkowniczka nie jest pewna, czy 6×6 i 9×9 nie są za trudne (Open Questions 9). Wynikiem jest karta A4: plansza zajmuje większą część strony i zachowuje margines co najmniej 10 mm.

### Katalog szablonów obiektów

Dodane 2026-10-25. Karta symetrii, nonogram i dyktando graficzne biorą obiekty z jednego katalogu szablonów zapisanych w kodzie (patrz „Karta symetrii”). Szablon to połowa obiektu symetrycznego lewo–prawo z częściami losowanymi przez generator i kolorem kredki każdej kratki; cała sylwetka to połowa i jej odbicie. Każdy obiekt ma trzy rozmiary: połowa 4×12 (cała 8×12), 6×15 (cała 12×15) i 9×24 (cała 18×24).

Od 2026-10-25 (S-21) katalog ma 22 obiekty z tabeli poniżej; wcześniej miał trzy: rakieta, robot, truskawka. Obiekt pasuje do katalogu, gdy jest symetryczny lewo–prawo, pionowy (wszystkie siatki są wyższe niż szersze), rozpoznawalny po samej czarnej sylwetce także w połowie 4×12, szeroki przy osi, ma dziury na detale i warianty, mieści się w ośmiu kolorach kredek (z brązowym) i nie ma części stykających się tylko rogiem kratki (psują obrys dyktanda).

Obiekty są pogrupowane w pięć kategorii (US-19). Obiekt ma co najmniej jedną kategorię i może mieć kilka. Lista (✓ — już jest):

| Kategoria        | Obiekty                                                   |
| ---------------- | --------------------------------------------------------- |
| Zwierzęta        | sowa ✓, biedronka ✓, pingwin ✓, kot ✓, królik ✓           |
| Jedzenie         | truskawka ✓, babeczka ✓, gruszka ✓, marchewka ✓, ananas ✓ |
| Przyroda         | choinka ✓, tulipan w doniczce ✓, muchomor ✓, kaktus ✓     |
| Kosmos i maszyny | rakieta ✓, robot ✓, balon na ogrzane powietrze ✓, UFO ✓   |
| Domy i budowle   | domek ✓, wieża zamku ✓, latarnia morska ✓, wieżowiec ✓    |

Lista jest startowa; obiekt, który nie daje się narysować czytelnie w połowie 4×12, zastępuje inny obiekt tej samej kategorii. Sezonowa kategoria (święta, pory roku) i „Morze” czekają na więcej obiektów. Szerokie obiekty (motyl, korona) odpadły z listy startowej. Po makiecie z 2026-10-25 lody w rożku zastąpiły marchewka i ananas, a namiot wieżowiec: oba były nieczytelne w połowie 4×12. Królik doszedł jako piąte zwierzę, zapas dla nonogramu i dyktanda.

Rodzic wybiera jedną kategorię albo „Wszystkie” (US-20); „Wszystkie” to osobna kategoria, kilku naraz nie da się zaznaczyć. Generator losuje obiekt tylko z wybranej kategorii. Nowy obiekt spełnia reguły karty symetrii w każdym rozmiarze. Nonogram i dyktando mogą pomijać warianty, które łamią ich reguły (nonogram bez jednego rozwiązania, obrys dotykający sam siebie); każda kategoria musi zostawić każdej karcie w każdym rozmiarze co najmniej kilka obiektów albo wariantów, żeby kolejne Generuj się nie powtarzało.

### Karta nonogramu

Dodane 2026-10-25. Aplikacja zawsze tworzy nonogram z dokładnie jednym rozwiązaniem. Rozwiązaniem jest cała sylwetka obiektu z katalogu szablonów: zamalowane kratki czarne, puste białe, dziury w sylwetce zostają puste. Kolory szablonu nonogram pomija. Rodzic wybiera poziom: łatwy, średni albo trudny (nie wiek, jak w sudoku). Poziomy średni i trudny to klasyczny nonogram opisany wyżej; poziom łatwy to prosty wariant, opisany niżej. Kartka to pionowy prostokąt A4 z jednym zdaniem polecenia, kratką i liczbami: z lewej strony każdego wiersza i nad każdą kolumną długości kolejnych ciągów zamalowanych kratek, w kolejności. Pusty wiersz albo kolumna ma liczbę 0. Polecenie: „Zamaluj kratki według liczb. Co się ukryło?”. Karta nie pokazuje nazwy obiektu.

| Poziom | Karta                  | Siatka (cała) | Obiekty                       | Kratka (około) |
| ------ | ---------------------- | ------------- | ----------------------------- | -------------- |
| łatwy  | znaczki przy wierszach | 8×12          | proste warianty z połowy 4×12 | 14 mm          |
| średni | klasyczna, liczby      | 12×15         | warianty z połowy 6×15        | 12 mm          |
| trudny | klasyczna, liczby      | 18×24         | bogate warianty z połowy 9×24 | 7 mm           |

Poziom łatwy (decyzja 2026-10-25 po makiecie): nie ma liczb przy kolumnach, a każdy wiersz jest opisany w całości znaczkami po kolei, białymi włącznie; liczby kratek w wierszu dają razem 8. Znaczek ma bok około 9,5 mm, a wiersz mieści najwyżej 7 znaczków. Trzy tony powstają z sylwetki obiektu regułą obrysu, bez kolorów szablonu: kratka obiektu z pustym sąsiadem albo na brzegu siatki jest czarna, kratka z czterema zamalowanymi sąsiadami szara, pozostałe (także dziury w sylwetce) białe. Rozwiązanie jest jedno z samej konstrukcji i nie wymaga sprawdzenia solverem. Grubsza linia biegnie co 5 kratek na każdym poziomie.

Kratka średniego poziomu ma 12 mm (makieta 2026-10-25: lepiej wypełnia kartkę niż 10 mm), liczby są pogrubione, ok. 6 mm, a co 5 kratek od lewej i od góry biegnie grubsza linia.

Reguła, którą generator sprawdza: z liczb wiersza i kolumn wynika dokładnie jeden obrazek i jest nim sylwetka obiektu, a dochodzi się do niego bez zgadywania (samym wnioskowaniem w wierszach i kolumnach). Wariant, który dopuszcza drugi obrazek, nie jest pokazany; generator losuje inny. Każde Generuj daje inny obiekt albo inny wariant niż poprzednia karta. Wartości są startowe i zostają potwierdzone na wydruku (Open Questions 11).

### Karta dyktanda graficznego

Dodane 2026-10-25. Aplikacja zawsze tworzy kartę z jedną odpowiedzią: rysunkiem, który wynika z poleceń. Kartka to pionowy prostokąt A4 z jednym zdaniem polecenia, listą poleceń i pustą kratką z zaznaczonym punktem startu. Polecenie to liczba kratek i strzałka (→, ←, ↑, ↓); dziecko rysuje odcinek po linii kratki. Bez skosów. Polecenie: „Rysuj po liniach kratki według strzałek. Zacznij od kropki.”.

Droga to zewnętrzny obrys całej sylwetki obiektu z katalogu szablonów, obiegany w jednym kierunku od punktu startu z powrotem do niego. Kolejne odcinki w tym samym kierunku łączą się w jedno polecenie. Dziury w sylwetce (okno, oczy, pestki) nie są rysowane. Kratka jest większa od obiektu o co najmniej jedną kratkę z każdej strony, a punkt startu leży na obrysie, w lewym górnym rogu sylwetki.

| Poziom | Dawna nazwa | Kratka (około) | Obiekty                        |
| ------ | ----------- | -------------- | ------------------------------ |
| łatwy  | 5 lat       | 14 mm          | proste, z połowy 4×12 (8×12)   |
| średni | 6 lat       | 11 mm          | szablony z połowy 6×15 (12×15) |
| trudny | 7 lat       | 8 mm           | bogate, z połowy 9×24 (18×24)  |

Liczba poleceń wynika z obiektu; im bogatszy obiekt, tym więcej poleceń. Reguły, które generator sprawdza: droga wraca do punktu startu, nie przecina się i nie dotyka sama siebie (także w narożniku kratki), mieści się w kratce, a rysunek z poleceń to dokładnie obrys sylwetki. Wariant, który łamie którąś z tych reguł, nie jest pokazany. Każde Generuj daje inny obiekt albo inny wariant niż poprzednia karta. Rodzic może włączyć „Pokaż rozwiązanie”, żeby zobaczyć na ekranie kreskę zewnętrznego obrysu. Domyślnie wyłączone; przełączenie zostawia tę samą kartę. Udane Generuj oraz zmiana poziomu, która układa nową kartę, wyłączają przełącznik. Sama zmiana kategorii go nie wyłącza. Nieudane Generuj zostawia przełącznik i poprzednią kartę. Wydruk nigdy nie pokazuje obrysu (decyzja 2026-10-25). Wartości są startowe i zostają potwierdzone na wydruku (Open Questions 11). Wynikiem jest karta A4; kratka i polecenia zajmują większą część strony i zachowują margines co najmniej 10 mm.

### Poziomy

Ustalone 2026-10-26: żadna karta nie nazywa poziomów wiekiem. Karty z trzema poziomami mają łatwy / średni / trudny (nonogram, dyktando graficzne; sudoku ma dodatkowo osobny wybór rozmiaru). Karty z większą liczbą poziomów mają własną skalę „Poziom 1…N”, od najłatwiejszego: labirynt 1–6, symetria 1–4, sekwencje 1–4. Numery i nazwy nie są porównywalne między kartami.

Każdy wiersz listy poziomów ma nazwę, pół zdania o tym, co zmienia poziom, i, przy labiryncie, symetrii, sekwencjach i dyktandzie, typowy wiek pod opisem; wiersz ma trzy linie, np. „Poziom 1” / „duża kratka, podpowiedź przy osi” / „zwykle ok. 4 lata”. Sudoku i nonogram nie mają wieku. Zapisane identyfikatory poziomów mogą zostać w danych; zmienia się etykieta, więc zapisane profile i ostatnie parametry wczytują się bez migracji.

### Profil i zapamiętane ustawienia

Profil dziecka zawiera imię, ulubioną postać i ustawienia każdego rodzaju karty. Ustawienia karty to wszystko, co jest na pasku tej karty poza postacią i poza „Pokaż rozwiązanie”:

| Karta              | Zapamiętane ustawienia                      |
| ------------------ | ------------------------------------------- |
| Labirynt           | poziom                                      |
| Symetria           | poziom, kolory, kategoria                   |
| Sekwencje          | poziom, kolory                              |
| Sudoku             | rozmiar, poziom, „Kształty / Cyfry”, kolory |
| Nonogram           | poziom, kategoria                           |
| Dyktando graficzne | poziom, kategoria                           |

Zasady:

- Ustawienia karty zmienia się tylko na pasku tej karty. Przy aktywnym profilu każda zmiana zapisuje się w profilu od razu, a komunikat „Zapamiętane dla {imię}” to potwierdza. Okno profilu pokazuje je tylko do odczytu.
- Karta, której profil jeszcze nie używał, startuje z ustawieniami domyślnymi tej karty (tymi samymi co przy pierwszej wizycie bez profilu).
- Ulubiona postać zmienia się tylko jawnie: w oknie profilu albo wyborem „Ustaw jako ulubioną” pod listą postaci. Inna postać wybrana na pasku przy aktywnym profilu obowiązuje do końca wizyty na tej stronie; przy następnym wejściu wraca ulubiona.
- Bez profilu urządzenie pamięta ostatnie ustawienia osobno dla każdej karty i jedną ostatnio użytą postać dla wszystkich kart.
- Profil nie przechowuje wieku. Wiek nie ustawia żadnego poziomu.
- Przy wybranym profilu miniatury katalogu pokazują zapamiętany poziom (sudoku: rozmiar i poziom, np. „6×6 · średni”).
- „Pokaż rozwiązanie” w nonogramie nie jest zapamiętywane i zawsze startuje wyłączone.
- Zgodność wstecz: dawne pole poziomu w profilu i w ostatnich parametrach zostaje poziomem labiryntu; dawna postać profilu zostaje ulubioną, a dawna postać ostatnich parametrów ostatnio użytą postacią.

### Postać na kartach

Na labiryncie postać stoi przy starcie. Na pozostałych kartach stoi przy zdaniu polecenia nad zadaniem, a polecenie jest w jej dymku. Postać to ten sam kolorowy obrazek z katalogu albo własny obrazek rodzica i drukuje się zawsze w kolorze. Przy „Bez postaci” zostaje samo polecenie. Postać nie wpływa na zadanie, odpowiedź ani poziom; obiekty w symetrii, nonogramie i dyktandzie dalej pochodzą z katalogu szablonów.

Postać jako treść zadania (np. połowa sylwetki w symetrii, obrazek odkrywany w nonogramie albo dyktandzie) wymaga obrysów postaci na kratce i zostaje poza zakresem (Po MVP).

## Access Control

Jeden lokalny użytkownik-rodzic; bez logowania i bez podziału na role. Ustawienia pozostają na urządzeniu.

Rodzic może korzystać z generatora bez tworzenia profilu dziecka. Opcjonalne nazwane profile dzieci przechowują ulubioną postać i ustawienia każdego rodzaju karty osobno, aby skrócić kolejne generowanie. Dzieci nie mają kont ani dostępu do aplikacji.

Wygenerowane karty nie są zapisywane; ich cykl życia kończy się po wydruku.

## Non-Goals

- Kolejne rodzaje kart wchodzą jako osobne kamienie, po jednym naraz, a nie razem z labiryntem. Pierwszym po labiryncie jest symetria (US-05–US-09, FR-014–FR-018). Drugi kamień kart (2026-10-23) bierze dwa rodzaje naraz, wyjątkowo, na prośbę użytkownika: sekwencje i sudoku (US-10–US-14, FR-019–FR-023). Do tego samego kamienia dochodzą 2026-10-25, także na prośbę użytkownika, nonogram i dyktando graficzne (US-15–US-18, FR-024–FR-027) oraz nowe obiekty w katalogu szablonów z wyborem kategorii (US-19–US-20, FR-028–FR-029). Rodzaje z listy „Po MVP” zostają poza zakresem, dopóki ich kamień nie jest otwarty.
- MVP nie używa LLM do generowania ani oceniania kart — rezultat podlega jawnym regułom algorytmicznym.
- MVP nie ma kont rodziców ani synchronizacji między urządzeniami — ustawienia i profile pozostają lokalne.
- MVP nie zapisuje ani nie archiwizuje wygenerowanych kart — ich cykl życia kończy się po wydruku.
- MVP nie dostarcza biblioteki gotowych kart — FR-011 pozostaje możliwym rozszerzeniem poza MVP.
- MVP nie ma poziomu dla osoby dorosłej. Najstarszy poziom labiryntu to Poziom 6 (dawny nastolatek).
- MVP nie ma samouczka przy pierwszym wejściu ani okna pomocy; wyjaśnienia to podpowiedzi w miejscu wyboru i strona „Jak to działa” (US-22).
- Profil nie przechowuje wieku dziecka i nie wyznacza poziomów z wieku.

## Po MVP

Zapisane 2026-10-10, żeby nie zginęło. Poza bieżącym kamieniem. Żaden z tych typów nie wchodzi do zakresu, dopóki jego kamień nie jest otwarty.

Wspólna umowa z labiryntem: generator algorytmiczny, jedna sprawdzalna odpowiedź, poziomy bez nazw wieku (od 2026-10-26), jedna strona A4, czarny druk z kolorową postacią przy poleceniu. Bez modelu językowego.

Symetria przeszła z tej listy do zakresu (2026-10-22): US-05–US-09, FR-014–FR-018, Business Logic „Karta symetrii”. Strona główna staje się katalogiem z miniaturami, a każdy rodzaj karty dostaje własną stronę generatora; druk, margines, ostatnie parametry i profil dziecka zostają. Ta przebudowa mieści kolejne rodzaje, ale nie dostarcza całej listy poniżej.

Sekwencje i sudoku przeszły z tej listy do zakresu (2026-10-23): US-10–US-14, FR-019–FR-023, Business Logic „Karta sekwencji” i „Karta sudoku”. Sudoku przebudowane 2026-10-24: rozmiary 4×4, 6×6 i 9×9 z kształtami albo cyframi, rozmiar i poziom zamiast wieku.

Nonogram przeszedł z tej listy do zakresu (2026-10-25) w wersji z obiektami z katalogu szablonów zamiast postaci: US-15–US-16, FR-024–FR-025, Business Logic „Karta nonogramu”. Dyktando graficzne nie było na tej liście; weszło do zakresu tego samego dnia: US-17–US-18, FR-026–FR-027, Business Logic „Karta dyktanda graficznego”.

Pozostałe typy nie mają kolejności. Następny typ dostaje US i FR dopiero przy otwarciu jego kamienia.

- **Obrysy postaci na kratce.** Wspólny warunek kilku pozycji poniżej: każda postać z katalogu narysowana na kratce (bitmapa i jedna zamknięta linia obrysu), zapisana w kodzie jak szablony obiektów. Makieta z 2026-10-26: wszystkie 11 postaci da się narysować na kratce ok. 15×15 z detalami jako pustymi kratkami (oczy, okna, pas strażaka), a obrys każdej to jedna zamknięta linia. Pies i kot oraz dinozaur i smok wymagają wyraźniejszych różnic (uszy, wąsy, skrzydło). Własny obrazek rodzica nie ma obrysu.
- **Połącz kropki.** Sylwetka wybranej postaci. Czeka na obrysy postaci.
- **Który nie pasuje.** Jeden obrazek łamie jawną regułę. Kartka odpada, gdy druga reguła wskazuje inny obrazek.
- **Nonogram i dyktando postaci.** Po rozwiązaniu widać postać zamiast obiektu z szablonów. Czeka na obrysy postaci. Nonogram i dyktando z obiektami z szablonów są już w zakresie (FR-024, FR-026). Z makiety: pełna postać w dyktandzie to 32–64 polecenia, więc pasuje do poziomu trudnego; łatwy potrzebuje prostszych obrysów.
- **Karty kodowania.** Kratka, postać, meta i strzałki. Jedna najkrótsza droga.
- **Porównywanie kwot w złotych.** Dwie kupki monet albo jedna kupka i cena. Liczy się wartość monet, nie liczba sztuk. „Ułóż dokładnie tę kwotę” czeka na regułę, która zostawia jeden układ.

Poza tą listą zostają kolorowanki oraz działania na liczbach z dopiskiem waluty.

## Open Questions

1. **Insight — czemu gotowe paczki PDF nie rozwiązują tego poza skończoną biblioteką?** — TBD by user. Block: no (pain and missing capability are captured; the second vision paragraph is incomplete until this lands).
2. ~~**Ile komórek głębokości odróżnia płytką ślepą uliczkę od głębokiej?**~~ — Zamknięte 2026-10-16 jako nieaktualne: poziom wyznacza sposób losowania, nie próg głębokości odnogi (`random-maze-generator`).
3. **Jakie jest źródło dostarczonych postaci i jakie prawa pozwalają użyć ich w produkcie?** — Owner: user. Block: yes before publishing the character-selection feature. Pierwszy nazwany zestaw (2026-10-04): samochodzik, rakieta, dinozaur, rysowane z pomocą AI. Katalog na 2026-10-10 dokłada jednorożca, kota, psa, robota, smoka, strażaka, syrenkę i wróżkę. Planowanie FR-012 nie czeka na prawa; publikacja szerszego katalogu czeka.
4. ~~**Czy poziom nastolatka ma pokazywać postać?**~~ — Zamknięte 2026-10-25: na nastolatku wybrana postać stoi nad narożnym startem, lewą krawędzią równo z lewą krawędzią labiryntu, a pas nad znakiem równa się pasowi pod „Meta”; młodsze poziomy zostają ze znakiem na środku wejścia (`teen-level-character-choice`).
5. **Czy startowe wartości poziomów symetrii (kratka, siatka, obiekty, podpowiedź) pasują dziecku?** — Owner: user. Block: no. Tabela w Business Logic jest propozycją z 2026-10-22, przebudowaną 2026-10-23 (obiekty zamiast gęstości plamy); potwierdza ją wydruk w kamieniu poziomów (S-13), nie planowanie. Połowa siatki 8×12 ma 4 kratki szerokości: rozstrzygnięte 2026-10-23 po makiecie, poziom 4 lat ma własne, prostsze warianty obiektów, a poziom 7 lat bogatsze. Oś pozioma i odsunięcie od osi wycofane z poziomów. Czeka na wydruk w S-13 (faza 4).
6. **Czy karta symetrii ma kiedyś używać postaci jako wzoru (np. połowa sylwetki)?** — Owner: user. Block: no. Częściowo rozstrzygnięte 2026-10-26: postać stoi przy poleceniu na każdej karcie (US-21). Postać jako wzór na kratce zależy od obrysów postaci (Po MVP), jak „Połącz kropki”. Szablony obiektów karty symetrii (2026-10-23) to osobny katalog i nie czekają na tę decyzję.
7. **Ile szablonów obiektów i jakich wariantów wystarczy, żeby kolejne karty się nie powtarzały?** — Owner: team. Block: no. Ustalone 2026-10-23: obiekty zamiast przypadkowych plam. Gotowa lista szablonów to skończona biblioteka, czyli problem z wizji produktu; warianty części mają go zmiękczyć. Otwarte: czy starszy poziom ma też dostawać ornamenty budowane z reguł (np. romby, pierścienie), które dają się generować bez końca.
8. ~~**Czy dziecko przedszkolne uzupełni sudoku obrazkowe numerem z legendy, czy narysuje postać?**~~ — Zamknięte 2026-10-24: sudoku nie używa postaci ani legendy numerów; dziecko rysuje proste kształty albo wpisuje cyfry. Pytanie 3 o prawa do postaci sudoku już nie dotyczy.
9. **Czy startowe wartości poziomów sekwencji i sudoku (długość ciągu, reguły, liczba pustych pól) pasują dziecku?** — Owner: user. Block: no. Tabele w Business Logic są propozycją z 2026-10-23 (sudoku przebudowane 2026-10-24); potwierdza je wydruk, nie planowanie. Użytkowniczka nie jest pewna, czy 6×6 (12/18/22 pustych) i 9×9 (35/45/52 pustych) nie są za trudne dla dzieci. Wartości poziomów sekwencji potwierdził wydruk z 2026-10-24 (S-17); sudoku zostaje otwarte do wydruku S-19. Wydruk z 2026-10-24 nie obowiązuje już dla mieszanki +1 i +2 na Poziomie 3.
10. ~~**Kiedy wraca profil z wiekiem i poziomami osobno dla każdego rodzaju karty (US-08, FR-017)?**~~ — Zamknięte 2026-10-26: profil wraca bez wieku. Pamięta sam ustawienia każdej karty z paska, pokazuje je w katalogu i w oknie profilu tylko do odczytu, a ulubiona postać zmienia się jawnie (US-08, FR-009, FR-017).
11. **Czy startowe wartości nonogramu i dyktanda graficznego (siatka, kratka, obiekty) pasują dziecku, i czy każda kategoria w każdym rozmiarze zostawia dość obiektów z jednym rozwiązaniem nonogramu i obrysem bez dotknięć?** — Owner: user (wartości), team (liczba obiektów). Block: no. Tabele w Business Logic są propozycją z 2026-10-25; potwierdza je wydruk. Liczbę obiektów, które przechodzą reguły dyktanda, pokazała implementacja (2026-10-25, z trzema dzisiejszymi obiektami): 5 lat 18 z 20 wariantów i 9 różnych obrysów (20–28 poleceń), 6 lat 18 z 20 i 9 (24–44), 7 lat 32 z 40 i 14 (36–76). Nonogram (S-22, 2026-10-25, przed rozszerzeniem katalogu): wszystkie dzisiejsze warianty miały jedno rozwiązanie bez zgadywania — 20 z 20 w 8×12, 20 z 20 w 12×15 i 40 z 40 w 18×24. Nonogram po poziomach (S-24, 2026-10-25, po rozszerzeniu katalogu do 22 obiektów): poziom łatwy 116 z 116 wariantów spełnia reguły znaczków; średni 119 z 124 i trudny 184 z 216 wariantów ma jedno rozwiązanie bez zgadywania, a w trudnym `kot` i `tulipan` nie mają żadnego takiego wariantu, więc generator ich tam nie pokazuje; Generuj trwa do 8 ms, sprawdzenie wszystkich wariantów trudnego do 3 s. Test pilnuje, by każdy obiekt średniego poziomu miał co najmniej jeden taki wariant. Czy znaczki 9,5 mm (łatwy) i kratka 7 mm (trudny) są dość duże dla dziecka, potwierdza wydruk. Liczby po wyborze kategorii (S-26, 2026-10-25, stan katalogu z tego dnia): w każdej z pięciu kategorii zostają co najmniej 3 obiekty i co najmniej 8 różnych obrysów dyktanda na każdym poziomie, a nonogram ma co najmniej 16 wariantów z jednym rozwiązaniem na każdym rozmiarze. Najcieńsze miejsca to Przyroda w dużym nonogramie (3 obiekty, 24 warianty) i Domy i budowle w dyktandzie 6 lat (8 obrysów z 16 wariantów). Żadna kombinacja nie zostaje z jednym obrysem ani z zerem, więc kategoria nie wymaga komunikatu ani wyłączenia; test pilnuje co najmniej dwóch kart w każdej kombinacji, bez pinowania liczb.
12. ~~**Czy lista poziomów ma obok opisu pokazywać typowy wiek (np. „Poziom 3 · zwykle ok. 5 lat”)?**~~ — Zamknięte 2026-10-26: tak, pod opisem, w trzeciej linii wiersza, tylko przy labiryncie, symetrii, sekwencjach i dyktandzie (kartach z dawną nazwą wiekową); sudoku i nonogram bez wieku. Wiek pomaga przy pierwszym wyborze, ale nie jest nazwą poziomu ani etykietą na pasku, żeby nie oceniać nim dziecka (US-22, FR-001).
