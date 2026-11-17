---
project: PrintoKids
version: 6
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
- Rodzic może wybrać dowolną postać z katalogu czternastu postaci: jedenastu stałych i trzech świątecznych widocznych na liście 15.11–6.01 (GitHub 370).
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
- Rodzic może wygenerować kartę „Kto ma więcej?”, na której dziecko porównuje wartość dwóch kupek monet i banknotów (w złotych, euro albo dolarach, bez groszy i centów) i wpisuje między nimi „<”, „>” albo „=”, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także z telefonu.
- Rodzic może wygenerować kartę „Który nie pasuje”, na której dziecko zakreśla w każdym rzędzie obrazek łamiący jawną regułę (kształt, kolor, rozmiar, liczba albo kategoria obiektu).
- Rodzic może wygenerować kartę „Skopiuj obrazek”, na której dziecko przerysowuje sylwetkę obiektu z katalogu szablonów (domyślnie czarną, po włączeniu kolorów w kolorach kredek) z jednej kratki do pustej obok.
- Rodzic może wygenerować kartę szlaczków, na której dziecko prowadzi ołówek po kropkach albo kontynuuje pokazany wzór.
- Rodzic wybiera poziom każdej z czterech nowych kart bez nazw wieku, a profil sam pamięta ustawienia ich paska; na każdej stoi postać przy poleceniu.
- Rodzic może wygenerować krzyżówkę matematyczną, w której działania „a ○ b = c” krzyżują się we wspólnych liczbach, a dziecko uzupełnia puste pola, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także z telefonu (2026-11-13, S-40).
- Rodzic może wybrać poziom krzyżówki matematycznej (Poziom 1–7: od dodawania do 10 po cztery działania do 100); profil sam pamięta poziom (2026-11-13, S-40).
- Rodzic może wygenerować kartę „Zegar”, na której dziecko odczytuje godzinę z tarczy ze wskazówkami, dorysowuje wskazówki do podanej godziny albo łączy tarczę z zegarem cyfrowym, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także z telefonu (2026-11-15).
- Rodzic może wybrać poziom karty „Zegar” (Poziom 1–5: od pełnych godzin po co minutę), tryb i zapis 24-godzinny; profil sam pamięta pasek (2026-11-15).
- Rodzic może wygenerować kartę kodowania, na której dziecko zapisuje strzałkami jedyną najkrótszą drogę postaci do mety na kratce z przeszkodami albo idzie za podanymi strzałkami i zakreśla obrazek, na którym skończyło, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także z telefonu (2026-11-17, S-42).
- Rodzic może wybrać poziom karty kodowania (Poziom 1–4: od kratki 5×5 po 10×10) i tryb (Zapisz, Wykonaj); profil sam pamięta pasek (2026-11-17, S-42).

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
- Na Poziomach 1–5 start jest na środku górnej krawędzi, a napis „Meta” stoi pod wyjściem w losowej kolumnie dolnej krawędzi, co najmniej 2 kolumny od środka (decyzja 2026-10-30, GitHub 114). Poziom 6 ma start i metę w narożnikach.
- Każdy poziom ma inną szerokość alejki. Karta jest najlepszą z kilku wylosowanych według liczby głębokich odnóg przy drodze i drogi, która nie trzyma się środka kartki.

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

- Katalog to czternaście postaci: jedenaście stałych (Samochodzik, Rakieta, Dinozaur, Jednorożec, Kot, Pies, Robot, Smok, Strażak, Syrenka i Wróżka) i trzy świąteczne (Bałwanek, Mikołaj, Renifer). Wiersz „Brak” (bez postaci) zostaje. Świąteczne postacie są na liście wyboru tylko od 15.11 do 6.01, zaraz po „Brak” i oddzielone od pozostałych kreską; poza oknem lista ma jedenaście postaci bez kreski. Zapisana ulubiona albo ostatnio użyta postać świąteczna zostaje poza oknem: jej wiersz jest na liście zaznaczony, a karta ją pokazuje (decyzja 2026-11-15, GitHub 370).
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
- Katalog mieści co najmniej 10 rodzajów i jest czytelny na telefonie (miniatury w 2 kolumnach) i na komputerze. Od M-5 ma dziesięć: każda z czterech nowych kart (US-23, US-25, US-27, US-29) ma własną miniaturę pokazującą z grubsza, jak wygląda wygenerowana karta, i nazwę. Od M-6 ma dwanaście: dochodzą krzyżówka matematyczna (US-31) i zegar (US-33), każda z własną miniaturą (2026-11-16, S-41). W M-7 dochodzi karta kodowania (US-35) z własną miniaturą i adresem (propozycja: `/coding`, jak `/clock`).
- Na stronie generatora jest link „Wszystkie karty” z powrotem do katalogu.
- Strona generatora ma ten sam układ co dziś: profil w rogu, pasek ustawień, Generuj i Drukuj, karta A4 na dole. Pod kartą nic nie ma poza stopką z linkami „Jak to działa” i „Podziel się opinią” (US-22).
- Po wejściu z katalogu labirynt działa tak jak dotąd: przepływ, poziomy, postać, druk i margines są bez zmian względem US-01, US-03 i US-04.
- Wybrany profil dziecka zostaje po przejściu między katalogiem a stronami generatorów.
- Profil w rogu strony głównej jest klikalny tak samo jak na stronach generatorów: wybór, dodanie, edycja, usunięcie i „Bez profilu”; miniatury od razu pokazują zapamiętany poziom wybranego profilu. Okno profilu nie otwiera się samo, także gdy są co najmniej dwa profile i żaden nie jest wybrany (decyzja 2026-10-31, GitHub 234). Zdanie dotyczy katalogu; na stronie generatora, gdy są co najmniej dwa profile i żaden nie jest zapamiętany, okno wyboru profilu otwiera się celowo przy pierwszym wejściu (`openingVisit`).
- Przy wybranym profilu miniatura karty, której profil już używał, pokazuje zapamiętany poziom (np. „poz. 4”, „średni”); karta, której profil jeszcze nie używał, nie ma plakietki (US-08; decyzja 2026-10-27).
- Druk nadal nie wymaga profilu dziecka.
- Pasek „Postać” jest na stronie każdego rodzaju karty. Na labiryncie postać stoi przy starcie, na pozostałych kartach przy poleceniu (US-21; decyzja 2026-10-26, wcześniej pasek był tylko przy labiryncie).
- Strony generatorów można zmieniać niezależnie od siebie: zmiana jednej nie zmienia drugiej.
- Strona „Jak to działa” (US-22) opisuje każdy rodzaj karty w dwóch–trzech zdaniach: co dziecko robi i co jest na kartce. Rodzaje są w kolejności katalogu (alfabetycznie), a każdy tytuł prowadzi do strony generatora. Opis rodzaju żyje przy jego definicji w kodzie (`CARD_KINDS`), żeby nowy rodzaj dostawał go tam, gdzie powstaje; strona główna zostaje bez opisów (decyzja 2026-10-31, GitHub 233).

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
- Elementy to proste kształty (koło, kwadrat, trójkąt, gwiazdka, serce, krzyżyk, ukośna strzałka; trzy ostatnie doszły w GitHub 112) i liczby. Ciąg może mieszać jedno i drugie, zgodnie z poziomem (US-11).
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

- Plansza 4×4 używa czterech kształtów wylosowanych z pięciu najprostszych: koło, kwadrat, trójkąt, serce, krzyżyk (decyzja 2026-10-24). Kształty są grubymi czarnymi konturami z pustym środkiem. Nad planszą jest zdanie polecenia. Pod planszą jest ramka o szerokości planszy z napisem „Użyj:” i samymi rysunkami figur tej karty (bez nazw), w kolejności katalogu, ta sama wielkość (13 mm) na każdym rozmiarze; odstęp ramki od planszy jest taki sam jak od polecenia do planszy (decyzja 2026-10-30, GitHub 174, po makiecie 9×9).
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
- Każdy kształt ma jeden stały kolor na całej planszy (np. serce czerwone, koło niebieskie, trójkąt zielony). Bez liter i bez legendy kolorów. Rysunek na liście używa tej samej kredki. Na drukarce czarno-białej kolory schodzą do odcieni szarości.
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
- Droga z poleceń to zewnętrzny obrys sylwetki obiektu: z katalogu szablonów symetrii albo z katalogu kształtów dyktanda, które nie muszą być symetryczne (decyzja 2026-10-30, GitHub 115). Zaczyna się i kończy w punkcie startu, nie przecina się i nie dotyka samej siebie. Dziury w sylwetce (okno, oczy) nie są rysowane.
- Odpowiedź jest jedna: rysunek wynika wprost z poleceń. Aplikacja potrafi go wyliczyć i sprawdzić, że wraca do startu i mieści się w kratce.
- Każde Generuj daje nową kartę: inny obiekt albo inny wariant niż poprzednia karta. Kształt bez osi symetrii może wypaść też odbity w poziomie; odbicie to inny obrys, więc to inna karta.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm i drukuje się jako jedna strona. Druk jest czarny i bez rysunku odpowiedzi.
- Rodzic może włączyć „Pokaż rozwiązanie”, żeby zobaczyć na ekranie kreskę zewnętrznego obrysu. Domyślnie wyłączone; przełączenie zostawia tę samą kartę. Udane Generuj oraz zmiana poziomu, która układa nową kartę, wyłączają przełącznik. Zmiana kategorii układa nową kartę i wyłącza przełącznik, tak jak zmiana poziomu. Nieudane Generuj albo nieudana nowa karta nie zostawia poprzedniej karty: w jej miejscu jest przyczyna, a przełącznik jest wyłączony. Wydruk nigdy nie pokazuje obrysu (decyzja 2026-10-25).
- Te same warunki na telefonie co w US-04: Generuj i Drukuj nie nachodzą na siebie, karta mieści się na A4 w szerokości i w długości, podgląd zostaje. Przeglądarki jak w US-04, w tym Brave.
- Strona dyktanda ma pasek „Postać”; wybrana postać stoi przy poleceniu (US-21). Rysunkiem nadal jest obrys obiektu z katalogu szablonów albo kształtów dyktanda, nie postaci.

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

- Katalog szablonów ma siedem kategorii: Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny, Domy i budowle, Kształty oraz Boże Narodzenie. Każda ma co najmniej cztery obiekty; startowa lista jest w Business Logic („Katalog szablonów obiektów”). „Boże Narodzenie” jest kategorią z oknem dat: pasek pokazuje ją od 15 listopada do 6 stycznia włącznie, według daty urządzenia (decyzja 2026-11-14, GitHub 369).
- Każdy obiekt szablonów jest symetryczny lewo–prawo, pionowy i rozpoznawalny po samej sylwetce. Kształty tylko dla dyktanda (Business Logic „Karta dyktanda graficznego”) są wyjątkiem: nie muszą być symetryczne ani pionowe. Ma wersję na każdy rozmiar szablonu (połowa 4×12, 6×15 i 9×24) i części losowane przez generator, jak dziś rakieta, robot i truskawka. Figury kategorii „Kształty” (koło, romb, trójkąt, serce, gwiazda, krzyżyk, księżyc, chmurka) zachowują własne proporcje: koło jest tak wysokie jak szerokie i zajmuje pas siatki, a nie jej całą wysokość; to wyjątek od „pionowy” (decyzja 2026-10-31, GitHub 198).
- Każdy obiekt ma co najmniej jedną kategorię; może mieć kilka.
- Nowe obiekty spełniają reguły karty symetrii (dotykają osi, mają kolor szablonu) i są dostępne w nonogramie i dyktandzie, gdy te karty istnieją.
- Kategorie są widoczne na pasku (US-20, S-26); „Wszystkie” jest domyślne i przez cały rok losuje z pełnego katalogu, także z obiektów świątecznych.
- Labirynt, sekwencje i sudoku zostają bez zmian.

### US-20: Rodzic wybiera kategorię obiektów

- **Given** rodzic jest na stronie symetrii, nonogramu albo dyktanda graficznego
- **When** wybierze kategorię obiektów
- **Then** kolejne Generuj losuje obiekt tylko z tej kategorii

#### Acceptance Criteria

- Na pasku strony jest wybór „Kategoria”: Wszystkie, potem kategorie z oknem dat (w dniach okna), potem kategorie stałe alfabetycznie po polskich nazwach (Domy i budowle, Jedzenie, Kosmos i maszyny, Kształty, Przyroda, Zwierzęta); nowa kategoria stała wpada w swoje miejsce alfabetu. Od 15.11 do 6.01 druga pozycja to „Boże Narodzenie”. Poza oknem tej kategorii na pasku nie ma, a zapamiętana w profilu albo w ostatnich parametrach pokazuje się na pasku i w podsumowaniu profilu jako „Wszystkie”; pierwsza zmiana na pasku tej karty zapisuje „Wszystkie”. Domyślnie „Wszystkie” (decyzje 2026-10-31, GitHub 211; 2026-11-14, GitHub 369).
- Można wybrać dokładnie jedną kategorię. „Wszystkie” to też kategoria, a nie zaznaczenie kilku; kilku kategorii naraz nie da się zaznaczyć.
- Zmiana kategorii przy pokazanej karcie od razu układa nową kartę z wybranej kategorii, jak zmiana poziomu; bez pokazanej karty kategoria obowiązuje przy następnym Generuj. Kategoria nie zmienia działania poziomu, rozmiaru ani kolorów (decyzja 2026-11-06, GitHub 283).
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
- Przy wyborze „Brak” karta ma samo zdanie polecenia, bez dymka.
- Postać jest ozdobą: nie zmienia zadania, odpowiedzi ani trudności. Pola zadania (kratka symetrii, ciągi, plansza sudoku, kratka nonogramu i dyktanda) nie używają postaci.
- Postać i dymek mieszczą się w obszarze karty nad zadaniem; zadanie nadal zajmuje większą część strony, a karta jest jedną stroną A4 z marginesem 10 mm.
- Na labiryncie postać zostaje przy starcie jak w US-01; labirynt nie dostaje dymka.

### US-22: Rodzic rozumie ustawienia z podpowiedzi w miejscu wyboru

- **Given** rodzic zmienia poziom, ustawienie karty albo postać, albo otwiera okno profilu
- **When** wykonuje wybór
- **Then** w tym samym miejscu widzi krótką podpowiedź, co się stało i co zostanie zapamiętane

#### Acceptance Criteria

- Po zmianie ustawienia na pasku przy aktywnym profilu pojawia się krótki komunikat „Zapamiętane dla {imię}”, który znika sam i nie zasłania karty ani przycisków.
- Gdy zapis ustawień do aktywnego profilu się nie uda (pełny lub zablokowany magazyn, profil usunięty w innej zakładce), w tym samym wierszu co „Zapamiętane dla {imię}” pojawia się krótki komunikat o błędzie („Nie udało się zapamiętać ustawień”), który znika sam i nie zasłania karty ani przycisków; bez profilu komunikatu nie ma (decyzja 2026-11-08, GitHub 284).
- Pod listą postaci przy aktywnym profilu, gdy wybrana postać różni się od ulubionej, jest tekst „Tylko na tę kartę” i wybór „Ustaw jako ulubioną {imię}”.
- Każdy wiersz listy poziomów ma nazwę i pół zdania o tym, co się zmienia; przy labiryncie, symetrii, sekwencjach i dyktandzie (kartach z dawną nazwą wiekową) ma też pod opisem typowy wiek z kolumny „Dawna nazwa”. Wiersz ma więc trzy linie, np. „Poziom 3” / „mniejsza kratka, bez podpowiedzi” / „zwykle ok. 6 lat”; sudoku i nonogram mają dwie linie („łatwy” / „znaczki przy wierszach, duża kratka”), bez wieku (decyzja 2026-10-26).
- Okno profilu ma jedno zdanie: ustawienia każdej karty zapamiętują się same, a ulubiona postać zmienia się tylko jawnie.
- W stopce jest link do krótkiej strony „Jak to działa” z całą zasadą profilu, poziomów i postaci. Strona wymienia wszystkie rodzaje kart z krótkim opisem i opisuje poziomy każdej z nich, także czterech kart z M-5 („Kto ma więcej?”, „Który nie pasuje”, „Skopiuj obrazek”, szlaczki; US-23–US-30) i kart z M-6 (krzyżówka matematyczna, zegar; US-31–US-34; 2026-11-16).
- W stopce obok „Jak to działa” jest link „Podziel się opinią” do anonimowego, zewnętrznego formularza (Google Forms), otwierany w nowej karcie. Formularz wypełnia się dobrowolnie poza aplikacją; aplikacja nie wysyła do niego żadnych danych z urządzenia. Stopka z oboma linkami nie drukuje się (decyzja 2026-11-06, GitHub 292).
- Gdy Generuj albo nowa karta po zmianie ustawienia się nie udały, w miejscu karty jest krótka przyczyna (np. brak kolejnych różnych kart w kategorii), pasek ustawień zostaje, a Drukuj jest wyłączone (decyzja 2026-11-06, GitHub 283).
- Drukuj na karcie, która już była drukowana, pyta „Ta karta była już drukowana” z wyborem „Nowa karta” i „Drukuj tę samą”. „Nowa karta” tylko układa nową kartę, a drukuje ją następne Drukuj, bo Safari blokuje druk, który nie wynika wprost z kliknięcia (decyzja 2026-11-07). Ctrl+P i druk z menu przeglądarki drukują bez pytania, bo przeglądarka nie pozwala ich przerwać, ale oznaczają kartę jako wydrukowaną, więc następne Drukuj na przycisku już ostrzeże. Zmiana postaci, kolorów i „Pokaż rozwiązanie” nie układa nowej karty (decyzja 2026-11-06, GitHub 283); wyjątkiem są kolory na karcie „Który nie pasuje”, bo kolor jest tam częścią zadania i zmiana układa nową kartę (US-26; decyzja 2026-11-08, GitHub 265).
- Nie ma samouczka przy pierwszym wejściu ani okna pomocy, które trzeba zamknąć, żeby korzystać ze strony.

### US-23: Rodzic generuje kartę „Kto ma więcej?” do druku

> Dodane 2026-11-01 (M-5). Cztery nowe rodzaje kart (US-23–US-30) wchodzą jednym kamieniem, wyjątkowo, na prośbę użytkowniczki, jak sekwencje i sudoku w M-3. Wartości w Business Logic są startowe i zostają potwierdzone na wydruku.

- **Given** rodzic otworzył z katalogu stronę „Kto ma więcej?”
- **When** uruchomi generowanie
- **Then** otrzymuje gotową do wydruku kartę A4 z kilkoma rzędami po dwie kupki monet i banknotów; dziecko wpisuje w każdym rzędzie w pustym polu między kupkami „<”, „>” (która kupka jest większa) albo „=” (gdy kupki są równe)

#### Acceptance Criteria

- Karta ma kilka rzędów, jeden pod drugim. W każdym rzędzie stoją dwie kupki oddzielone pustym polem, w którym dziecko wpisuje znak (decyzja 2026-11-01). Nad rzędami jest jedno zdanie polecenia; przy nim stoi wybrana postać (US-21).
- Waluta to osobny wybór na pasku: złote, euro albo dolary (GitHub 324, decyzja 2026-11-09); domyślnie złote. Nominały to 1, 2, 5, 10, 20, 50 i 100 w jednostce waluty (poziomy używają ich zestawów, Business Logic „Karta „Kto ma więcej?””). Grosze, centy, ceny i reszta nie występują (decyzja 2026-11-01). Nominał jest widoczny jako liczba na każdej monecie i na każdym banknocie, więc druk czarny nic nie traci.
- Odpowiedź jest jedna w rzędzie: lewa kupka większa („>”), prawa większa („<”) albo równe („=”). Aplikacja liczy wartość każdej kupki i potrafi sprawdzić odpowiedź. Remis jest dozwoloną odpowiedzią, nie błędem, i na karcie występuje w zerze albo jednym rzędzie (decyzja 2026-11-01).
- Liczy się wartość, nie liczba sztuk. Na poziomach wyższych w części rzędów kupka z większą liczbą sztuk ma mniejszą wartość.
- Wygląd monet i banknotów jest stylizowany i nie może uchodzić za prawdziwy pieniądz (Open Questions 14): domyślnie koło i prostokąt z nominałem w czerni; po włączeniu kolorów (US-24) kolorowe obrazki użytkowniczki o tym samym rozmiarze, z nominałem na każdym kawałku.
- Każde Generuj daje nową kartę: inne kupki niż poprzednia.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm i drukuje się jako jedna strona. Domyślnie druk jest czarny, a po włączeniu kolorów (US-24) monety i banknoty drukują się w kolorach; bez odpowiedzi na kartce, a postać przy poleceniu drukuje się w kolorze (US-21).
- Te same warunki na telefonie co w US-04: Generuj i Drukuj nie nachodzą na siebie, karta mieści się na A4 w szerokości i w długości, podgląd zostaje. Przeglądarki jak w US-04, w tym Brave.

### US-24: Rodzic wybiera poziom karty „Kto ma więcej?” i włącza kolory

- **Given** rodzic jest na stronie „Kto ma więcej?”
- **When** wybierze poziom (łatwy, średni, trudny)
- **Then** karta ma nominały, sumy i sposób mylenia liczby sztuk zgodne z tym poziomem

#### Acceptance Criteria

- Poziom zmienia zestaw nominałów, wielkość sum i to, czy liczba sztuk myli. Reguły są w Business Logic „Karta „Kto ma więcej?””. Karta nie nazywa poziomów wiekiem; zakładany wiek dziecka to 6–8 lat. Waluta (zł, €, $) wybiera zestawy nominałów poziomów; jest zapamiętywana w profilu jak poziom i kolory, a jej zmiana przy pokazanej karcie układa nową kartę (jak zmiana poziomu), bo nominały się różnią (GitHub 324, decyzja 2026-11-09).
- Każdy poziom mieści się na jednej stronie A4 z marginesem 10 mm.
- Poziom jest na pasku strony. Profil i ostatnie parametry pamiętają go same (US-08).
- Na pasku jest też przełącznik „Kolory”, niezależny od poziomu, domyślnie wyłączony: karta jest wtedy czarnym konturem, czytelnym na czarno-białej drukarce. Włączony rysuje monety i banknoty jako kolorowe, stylizowane obrazki; nominał zostaje liczbą na każdym kawałku, a wszystkie monety mają jedną średnicę i wszystkie banknoty jeden rozmiar (wielkość nie zdradza wartości). Przełącznik nie układa nowej karty. Profil i ostatnie parametry pamiętają kolory tak jak poziom (US-08).

### US-25: Rodzic generuje kartę „Który nie pasuje” do druku

- **Given** rodzic otworzył z katalogu stronę „Który nie pasuje”
- **When** uruchomi generowanie
- **Then** otrzymuje gotową do wydruku kartę A4 z kilkoma rzędami obrazków, w których jeden łamie jawną regułę; dziecko zakreśla ten jeden

#### Acceptance Criteria

- Karta ma kilka rzędów, jeden pod drugim. W każdym rzędzie wszystkie obrazki poza jednym łączy ta sama cecha, a jeden się od nich różni. Nad rzędami jest jedno zdanie polecenia; przy nim stoi wybrana postać (US-21).
- Reguła pochodzi z jawnej listy: kształt, kolor, rozmiar, liczba i kategoria obiektu (Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny, Domy i budowle; bez „Kształtów”). Obiekt kategorii to prosta ikona wektorowa, po pięć w każdej kategorii, a nie sylwetka z katalogu szablonów, bo pikselowe sylwetki były nieczytelne w rzędzie obrazków (decyzja 2026-11-08, GitHub 265; Business Logic „Karta „Który nie pasuje””). Kolor działa tylko po włączeniu kolorów (US-26); bez nich druk jest czarny i reguły to pozostałe cztery.
- Odpowiedź jest jedna w rzędzie: dokładnie jeden obrazek łamie regułę rzędu, a żadna inna reguła z listy nie wskazuje innego obrazka. Rząd, w którym pasuje inna reguła z inną odpowiedzią, nie jest pokazany. Aplikacja potrafi ją wyliczyć i sprawdzić.
- Każde Generuj daje nową kartę: inne reguły albo inne obrazki niż poprzednia karta.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm i drukuje się jako jedna strona. Druk jest bez odpowiedzi na kartce.
- Te same warunki na telefonie co w US-04.

### US-26: Rodzic wybiera poziom karty „Który nie pasuje” i włącza kolory

- **Given** rodzic jest na stronie „Który nie pasuje”
- **When** wybierze poziom (łatwy, średni, trudny) albo włączy kolory
- **Then** karta ma rodzaj reguł, liczbę obrazków w rzędzie i liczbę rzędów zgodne z poziomem, a obrazki mają kolory kredek po włączeniu kolorów

#### Acceptance Criteria

- Poziom zmienia, które reguły występują, ile obrazków stoi w rzędzie, ile jest rzędów, ile cech rozprasza (rozpraszacze), jak bardzo mały obrazek różni się od dużego i jak liczne są grupy w regule liczby (decyzja 2026-11-08, GitHub 265). Reguły są w Business Logic „Karta „Który nie pasuje””.
- Kolory są osobnym przełącznikiem jak w sekwencjach i sudoku; domyślnie wyłączone. Inaczej niż na innych kartach przełącznik układa nową kartę, bo z kolorami dochodzi reguła koloru i kolorowe rozpraszacze, a karta z kolorowymi rzędami bez kolorów traciłaby jedną odpowiedź (decyzja 2026-11-08, GitHub 265).
- Karta nie ma „Pokaż rozwiązanie” (decyzja 2026-11-08, GitHub 265).
- Poziom i kolory pamięta profil i ostatnie parametry (US-08).

### US-27: Rodzic generuje kartę „Skopiuj obrazek” do druku

- **Given** rodzic otworzył z katalogu stronę „Skopiuj obrazek”
- **When** uruchomi generowanie
- **Then** otrzymuje gotową do wydruku kartę A4 z dwiema kratkami tej samej wielkości: w jednej jest sylwetka obiektu (domyślnie czarna), druga jest pusta; dziecko przerysowuje sylwetkę, zamalowując te same kratki (po włączeniu kolorów kredkami według wzoru)

#### Acceptance Criteria

- Sylwetka to cały obiekt z katalogu szablonów symetrii (połowa szablonu i jej odbicie), zamalowane kratki czarne, puste białe. Detale będące dziurami w sylwetce zostają pustymi kratkami. Karta nie zdradza nazwy obiektu.
- Obie kratki mają tę samą siatkę; nie ma osi symetrii ani odbicia. Kratki stoją obok siebie na każdym poziomie, bez numerów wierszy i kolumn; rozmiar kratki wynika z poziomu (10 / 7 / 5 mm), a obie kratki z odstępem 10 mm mieszczą się na A4 z marginesem 10 mm (decyzja 2026-11-09 po makiecie, Open Questions 13). Sylwetka jest wyśrodkowana w pionie w siatce.
- Odpowiedź jest jedna: te same zamalowane kratki w drugiej kratce (przy kolorach także w tych samych kolorach). Aplikacja ją zna; nie ocenia rysunku dziecka.
- Każde Generuj daje nową kartę: inny obiekt albo inny wariant niż poprzednia karta.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm i drukuje się jako jedna strona. Domyślnie druk jest czarny; po włączeniu kolorów lewa kratka drukuje się w kolorach kredek (US-28).
- Te same warunki na telefonie co w US-04.

### US-28: Rodzic wybiera poziom i kategorię karty „Skopiuj obrazek” i włącza kolory

- **Given** rodzic jest na stronie „Skopiuj obrazek”
- **When** wybierze poziom (łatwy, średni, trudny), kategorię obiektów albo włączy kolory
- **Then** karta ma kratkę i obiekty zgodne z poziomem, wylosowane z wybranej kategorii, a sylwetka ma kolory kredek po włączeniu kolorów

#### Acceptance Criteria

- Poziom zmienia rozmiar siatki, wielkość kratki i katalog obiektów (łatwy prostsze, trudny bogatsze). Reguły są w Business Logic „Karta „Skopiuj obrazek””.
- Kategoria działa jak w US-20: jeden wybór, „Wszystkie” domyślnie, alfabetycznie po polskich nazwach.
- Kolory to osobny przełącznik na pasku, niezależny od poziomu, jak w symetrii (US-09). Domyślnie wyłączone: sylwetka jest czarna. Włączone: każda kratka sylwetki ma kolor kredki z szablonu obiektu, bez liter i bez legendy; dziury w sylwetce (okno, oczy) mają kolor szablonu albo zostają białe, gdy szablon tak ustala. Kolory ma tylko lewa kratka, prawa zostaje pusta. Przełącznik zostawia tę samą kartę; nie generuje nowej. Na drukarce czarno-białej kolory schodzą do odcieni szarości (decyzja 2026-11-10, prośba użytkowniczki).
- Poziom, kategorię i kolory pamięta profil i ostatnie parametry (US-08).

### US-29: Rodzic generuje kartę szlaczków do druku

- **Given** rodzic otworzył z katalogu stronę „Szlaczki”
- **When** uruchomi generowanie
- **Then** otrzymuje gotową do wydruku kartę A4 z rzędami szlaczków: na niższych poziomach dziecko prowadzi ołówek po kropkach, na wyższych kontynuuje pokazany wzór w pustej części rzędu

#### Acceptance Criteria

- Karta ma kilka rzędów, jeden pod drugim (4–7 zależnie od poziomu). Nad rzędami jest jedno zdanie polecenia, inne dla każdego trybu; przy nim stoi wybrana postać (US-21). Karta nie ma innych obrazków (decyzja 2026-11-09; obrazki startu i celu w rzędach to osobna zmiana z kategoriami).
- Wzór pochodzi z jawnej puli poziomu (Business Logic „Karta szlaczków”). Karta pokazuje jeden wzór na rząd i nie powtarza wzoru, dopóki pula starcza. Wzór ma losowaną długość kroku i łagodność (stosunek wysokości do kroku) w granicach poziomu, więc dwie karty prawie nigdy nie są takie same.
- W trybie samych kropek (Poziomy 1–2) ścieżka wzdłuż kropek jest jedna i się nie krzyżuje; aplikacja ją zna. W trybie kontynuacji początek wzoru jednoznacznie wyznacza regułę; aplikacja ją zna, ale nie ocenia rysunku dziecka. To wyjątek od „jednej sprawdzalnej odpowiedzi” (decyzja 2026-11-01).
- Linie i kropki są dość grube i wyraźne, by wyszły na zwykłej drukarce domowej (Open Questions 15).
- Każde Generuj daje nową kartę: inne wzory albo inna kolejność niż poprzednia karta.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm i drukuje się jako jedna strona. Druk jest czarny.
- Te same warunki na telefonie co w US-04.

### US-30: Rodzic wybiera poziom szlaczków

- **Given** rodzic jest na stronie „Szlaczki”
- **When** wybierze poziom (Poziom 1–4)
- **Then** karta ma tryb, pulę wzorów, łagodność kształtu i liczbę rzędów zgodne z tym poziomem

#### Acceptance Criteria

- Poziomy 1–2 to kropki. Poziom 3 to dwa powtórzenia wzoru po kropkach, a dalej dziecko rysuje samo. Poziom 4 to kontynuacja wzoru narysowanego linią, w liniaturze jak w zeszycie do kaligrafii. Opis poziomu mówi wprost, który tryb to jest. Reguły są w Business Logic „Karta szlaczków” (decyzja 2026-11-09).
- Na Poziomach 3–4 pasek ma przełącznik „Linie” (linie pomocnicze), domyślnie włączony: na Poziomie 3 przerywane linie na górze i na dole wzoru, na Poziomie 4 liniatura. Wyłączony zostawia bladą linię dolną. Przełącznik nie układa nowej karty. Na Poziomach 1–2 go nie ma (jak „Kształty / Cyfry” w sudoku przy 4×4).
- Każdy poziom mieści się na jednej stronie A4 z marginesem 10 mm.
- Poziom jest na pasku strony. Profil i ostatnie parametry pamiętają poziom i „Linie” (US-08).

### US-31: Rodzic generuje krzyżówkę matematyczną do druku

> Dodane 2026-11-13 (M-6, S-40, GitHub 371). Makiety, poziomy, wielkości kratek i puste pola zaakceptowała użytkowniczka 2026-11-13; wartości w Business Logic są startowe i zostają potwierdzone na wydruku.

- **Given** rodzic otworzył z katalogu stronę „Krzyżówka matematyczna”
- **When** uruchomi generowanie
- **Then** otrzymuje gotową do wydruku kartę A4 z krzyżówką: działania „a ○ b = c” biegną w prawo albo w dół i krzyżują się we wspólnych polach z liczbami, część liczb jest wpisana, a reszta pusta; dziecko wpisuje brakujące liczby

#### Acceptance Criteria

- Każde pole krzyżówki (liczba, znak działania, „=”) jest osobną kratką, jak w zeszytach ćwiczeń. Działanie ma dwie liczby, jeden znak i wynik, czyli pięć kratek w prawo albo w dół; liczby są od 1 do największej liczby poziomu (US-32). Nad krzyżówką jest jedno zdanie polecenia: „Uzupełnij krzyżówkę. Działania czytaj w prawo i w dół.”; przy nim stoi wybrana postać (US-21).
- Znaki to „+”, „−”, „·” i „:”. Mnożenie i dzielenie zostają w tabliczce mnożenia: czynniki, dzielnik i iloraz od 2 do 10, dzielenie bez reszty. Każde działanie jest prawdziwe.
- Każde nowe działanie przecina już stojące w polu z liczbą (w jednym albo dwóch polach); kratki dwóch działań nie stykają się bokiem poza przecięciem.
- Miejsca w krzyżówce, w których nic się nie wpisuje, a które ze wszystkich czterech stron otaczają kratki działań (bez tego wyglądałyby jak puste pola do wpisania), są zakreskowane ukośnie jasnoszarą kreską, na ekranie i na wydruku (decyzja 2026-11-14, po podglądzie strony). Miejsca przy brzegu krzyżówki, z mniej niż czterema ścianami, zostają białe.
- Odpowiedź jest jedna, a dziecko dochodzi do każdego pustego pola bez zgadywania: wystarczają same działania, w których brakuje jednej liczby, w kolejności „łańcucha” (Business Logic „Karta krzyżówki matematycznej”). Aplikacja potrafi ją wyliczyć i sprawdzić. Karta, której nie da się rozwiązać w ten sposób, nie jest pokazana.
- To samo działanie (np. 1 + 1 = 2) powtarza się na karcie tylko wtedy, gdy nie ma innego.
- Każde Generuj daje nową kartę: inne działania albo inny układ niż poprzednia karta.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm i drukuje się jako jedna strona. Druk jest czarny i bez odpowiedzi na kartce; postać przy poleceniu drukuje się w kolorze (US-21).
- Rodzic może włączyć „Pokaż rozwiązanie”, żeby zobaczyć brakujące liczby na ekranie i sprawdzić dziecko. Domyślnie wyłączone; przełączenie zostawia tę samą kartę. Udane Generuj oraz zmiana poziomu, która układa nową kartę, wyłączają przełącznik. Wydruk nigdy nie pokazuje rozwiązania.
- Te same warunki na telefonie co w US-04: Generuj i Drukuj nie nachodzą na siebie, karta mieści się na A4 w szerokości i w długości, podgląd zostaje. Przeglądarki jak w US-04, w tym Brave.
- Strona ma pasek „Postać”; wybrana postać stoi przy poleceniu (US-21). Pola krzyżówki nie używają postaci.

### US-32: Rodzic wybiera poziom krzyżówki matematycznej

- **Given** rodzic jest na stronie „Krzyżówka matematyczna”
- **When** wybierze poziom (Poziom 1–7)
- **Then** karta ma rodzaj działań, największą liczbę, wielkość krzyżówki i liczbę pustych pól zgodne z tym poziomem

#### Acceptance Criteria

- Poziomy to numery bez nazw wieku (decyzja 2026-11-13): Poziom 1 dodawanie do 10; Poziom 2 dodawanie i odejmowanie do 10; Poziom 3 dodawanie i odejmowanie do 20; Poziom 4 dodawanie i odejmowanie do 100; Poziom 5 mnożenie do 30; Poziom 6 mnożenie i dzielenie do 50; Poziom 7 wszystkie cztery działania do 100. Każdy wiersz listy poziomów ma nazwę i pół zdania o tym, co się zmienia, bez wieku pod opisem (jak karty z M-5).
- Poziom zmienia też liczbę działań, wielkość kratki i liczbę pustych pól razem z „łańcuchem”. Osobnej kontrolki liczby pustych pól nie ma. Reguły są w Business Logic.
- Domyślny jest Poziom 2.
- Zmiana poziomu przy pokazanej karcie od razu układa nową kartę, a „Pokaż rozwiązanie” zostaje wyłączone (US-22).
- Każdy poziom mieści się na jednej stronie A4 z marginesem 10 mm.
- Poziom jest na pasku strony. Profil i ostatnie parametry pamiętają go same (US-08). „Pokaż rozwiązanie” nie jest zapamiętywane i zawsze startuje wyłączone.

### US-33: Rodzic generuje kartę „Zegar” do druku

> Dodane 2026-11-15 (M-6, slot S-41). Kształt karty ustaliła użytkowniczka 2026-11-15 na interaktywnej makiecie; wartości w Business Logic są startowe i zostają potwierdzone na wydruku.

- **Given** rodzic otworzył z katalogu stronę „Zegar”
- **When** uruchomi generowanie
- **Then** otrzymuje gotową do wydruku kartę A4 z tarczami zegara ze wskazówkami; zależnie od trybu dziecko wpisuje godzinę pod tarczą, dorysowuje wskazówki do godziny podanej pod pustą tarczą albo łączy kreską tarczę z zegarem cyfrowym pokazującym tę samą godzinę

#### Acceptance Criteria

- Tarcza ma liczby 1–12 na każdym poziomie, kreski godzin, a od Poziomu 4 także kreski minut (US-34). Tarczy bez liczb nie ma (decyzja 2026-11-15: dzieci, które uczą się zegara, opierają się na liczbach). Wskazówka minutowa jest długa i cienka, godzinowa krótka i gruba; godzinowa stoi tam, gdzie na prawdziwym zegarze (o 7:30 między 7 a 8). Liczby leżą nad wskazówkami z białą obwódką, żeby długa wskazówka nie zakrywała „12” ani „6” (decyzja 2026-11-16, po makiecie).
- Na pasku jest wybór „Tryb”: Odczytaj, Dorysuj, Połącz; domyślnie Odczytaj. Odczytaj: pod każdą z sześciu tarcz ze wskazówkami są dwie puste kratki z dwukropkiem między nimi („__ : __”) na godzinę i minuty (kratki, nie linie; decyzja 2026-11-16). Dorysuj: pod każdą z sześciu pustych tarcz (tylko środek) stoi godzina w ramce zegara cyfrowego, a dziecko rysuje obie wskazówki. Połącz: pięć tarcz ze wskazówkami po lewej, pięć zegarów cyfrowych z tymi samymi godzinami po prawej w innej kolejności, przy każdej kropka do połączenia kreską. Nad tarczami jest jedno zdanie polecenia, inne dla każdego trybu; przy nim stoi wybrana postać (US-21).
- Godzina na karcie jest zapisana tylko cyframi („7:30”), bez zapisu słownego (decyzja 2026-11-15).
- Odpowiedź jest jedna przy każdej tarczy: godzina wskazana przez wskazówki. Przy wyłączonym 24 h godzina ma postać 1:00–12:59 (12:30, nie 0:30). Godziny na jednej karcie się nie powtarzają, od Poziomu 2 co najmniej połowa tarcz ma minuty nowe dla poziomu (US-34), a w trybie Połącz kolejność zegarów cyfrowych różni się od kolejności tarcz. Aplikacja zna odpowiedź i potrafi ją sprawdzić.
- Karta nie ma „Pokaż rozwiązanie” (decyzja 2026-11-15: odpowiedź łatwo sprawdzić okiem).
- Każde Generuj daje nową kartę: inne godziny albo inną kolejność niż poprzednia karta.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm i drukuje się jako jedna strona. Druk jest czarny i bez odpowiedzi na kartce; postać przy poleceniu drukuje się w kolorze (US-21).
- Te same warunki na telefonie co w US-04: Generuj i Drukuj nie nachodzą na siebie, karta mieści się na A4 w szerokości i w długości, podgląd zostaje. Przeglądarki jak w US-04, w tym Brave.
- Strona ma pasek „Postać”; wybrana postać stoi przy poleceniu (US-21). Tarcze nie używają postaci.

### US-34: Rodzic wybiera poziom, tryb i zapis 24-godzinny karty „Zegar”

- **Given** rodzic jest na stronie „Zegar”
- **When** wybierze poziom (Poziom 1–5), tryb albo włączy „24 h”
- **Then** karta ma godziny, tarczę i zapis zgodne z tymi ustawieniami

#### Acceptance Criteria

- Poziomy to numery bez nazw wieku i bez wieku pod opisem (jak karty z M-5): Poziom 1 pełne godziny; Poziom 2 pełne godziny i wpół do; Poziom 3 kwadranse; Poziom 4 co 5 minut; Poziom 5 co minutę. Każdy wiersz listy poziomów ma nazwę i pół zdania o tym, co się zmienia. Domyślny jest Poziom 1.
- Wygląd tarczy wynika z poziomu (kreski minut od Poziomu 4); osobnej kontrolki tarczy nie ma (decyzja 2026-11-15).
- Od Poziomu 2 co najmniej połowa tarcz na karcie ma minuty nowe dla poziomu (np. wpół do na Poziomie 2), żeby karta nie wyszła z samych łatwiejszych godzin (decyzja 2026-11-16).
- Na pasku jest przełącznik „24 h”, niezależny od poziomu i trybu, domyślnie wyłączony. Włączony: godziny są z całej doby poza godziną po północy (0:xx; decyzja 2026-11-16), pod każdą tarczą stoi słowami pora dnia („rano”, „po południu”, „wieczorem”, „w nocy”), a godzina jest zapisana w systemie 24-godzinnym (19:30). Odczytaj: dziecko wpisuje godzinę 24-godzinną na podstawie tarczy i pory dnia; Dorysuj: przy „19:30” rysuje wskazówki na 7:30; Połącz: zegary cyfrowe pokazują godziny 24-godzinne. Pora dnia jest słowem, nie ikoną, bo słońce i księżyc są dwuznaczne (decyzja 2026-11-15).
- Zmiana poziomu, trybu albo „24 h” przy pokazanej karcie od razu układa nową kartę, bo zmieniają się godziny albo ich liczba (US-22).
- Każdy poziom i tryb mieści się na jednej stronie A4 z marginesem 10 mm.
- Profil i ostatnie parametry pamiętają poziom, tryb i „24 h” (US-08).

### US-35: Rodzic generuje kartę kodowania do druku

> Dodane 2026-11-17 (M-7, S-42). Kształt karty ustaliła użytkowniczka 2026-11-17 na makiecie (`context/changes/coding-card/`); wartości w Business Logic są startowe i zostają potwierdzone na wydruku.

- **Given** rodzic otworzył z katalogu stronę „Kodowanie”
- **When** uruchomi generowanie
- **Then** otrzymuje gotową do wydruku kartę A4 z kratką, przeszkodami i wybraną postacią na starcie; zależnie od trybu dziecko zapisuje strzałkami drogę postaci do mety albo idzie za podanymi strzałkami i zakreśla obrazek, na którym skończyło

#### Acceptance Criteria

- Kratka ma pola wolne i przeszkody (szare pola); postać stoi w polu startu. Kroki są tylko w prawo, w lewo, w górę i w dół, o jedno pole, bez wchodzenia na przeszkody i poza kratkę. Strzałki są bezwzględne (→ ← ↑ ↓), jak w dyktandzie graficznym.
- Na pasku jest wybór „Tryb”: Zapisz, Wykonaj. Zapisz: na kratce jest meta (flaga w szachownicę), a pod kratką puste pola na strzałki, dokładnie tyle, ile kroków ma najkrótsza droga; pierwsze pola są wpisane szarym jako przykład zapisu. Wykonaj: pod kratką są podane strzałki, a na kratce trzy obrazki (gwiazdka, serce, koło); droga ze strzałek kończy się na jednym z nich. Nad kratką jest jedno zdanie polecenia, inne dla każdego trybu; przy nim stoi wybrana postać (US-21).
- Odpowiedź jest jedna. Zapisz: najkrótsza droga od startu do mety jest dokładnie jedna, więc jedna jest droga, która mieści się w polach; kratka z dwiema najkrótszymi drogami tej samej długości nie jest pokazana. Wykonaj: droga ze strzałek omija przeszkody, nie wraca na to samo pole i kończy się na jednym obrazku; dwa pozostałe obrazki nie leżą na drodze. Aplikacja zna odpowiedź i potrafi ją sprawdzić.
- Przy wyborze postaci „Brak” start na kratce to kółko z napisem „Start”, a polecenie stoi bez dymka.
- Karta nie ma „Pokaż rozwiązanie” (propozycja; Open Questions 18).
- Każde Generuj daje nową kartę: inną kratkę albo inną drogę niż poprzednia karta.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm i drukuje się jako jedna strona. Druk jest czarny i bez odpowiedzi na kartce (poza szarymi polami przykładu w trybie Zapisz); postać przy poleceniu i na starcie drukuje się w kolorze (US-21).
- Te same warunki na telefonie co w US-04: Generuj i Drukuj nie nachodzą na siebie, karta mieści się na A4 w szerokości i w długości, podgląd zostaje. Przeglądarki jak w US-04, w tym Brave.

### US-36: Rodzic wybiera poziom i tryb karty kodowania

- **Given** rodzic jest na stronie „Kodowanie”
- **When** wybierze poziom (Poziom 1–4) albo tryb
- **Then** karta ma kratkę, długość drogi i zapis zgodne z tymi ustawieniami

#### Acceptance Criteria

- Poziomy to numery bez nazw wieku i bez wieku pod opisem (jak karty z M-5): Poziom 1 kratka 5×5; Poziom 2 kratka 6×6; Poziom 3 kratka 8×8; Poziom 4 kratka 10×10 i zapis „liczba kratek i strzałka” („3 →”, jak w dyktandzie). Poziom zmienia też długość drogi, liczbę zakrętów, liczbę przeszkód i liczbę pól przykładu. Każdy wiersz listy poziomów ma nazwę i pół zdania o tym, co się zmienia. Reguły są w Business Logic.
- Tryb jest osobnym wyborem, niezależnym od poziomu: każdy tryb ma wszystkie poziomy (decyzja 2026-11-17).
- Zmiana poziomu albo trybu przy pokazanej karcie od razu układa nową kartę (US-22).
- Każdy poziom i tryb mieści się na jednej stronie A4 z marginesem 10 mm.
- Profil i ostatnie parametry pamiętają poziom i tryb (US-08).

## Functional Requirements

### Generator i druk

- FR-001: Rodzic może wybrać jeden z poziomów trudności danego rodzaju karty: łatwy / średni / trudny przy kartach z trzema poziomami, Poziom 1…N przy kartach z większą liczbą poziomów; każdy poziom ma krótki opis tego, co zmienia, a przy labiryncie, symetrii, sekwencjach i dyktandzie, które miały dawną nazwę wiekową, także typowy wiek pod opisem. Priority: must-have
  > Socrates: Counter-argument considered: nazwy poziomów mogą wprowadzać w błąd bez mierzalnych reguł. Resolution: revised (2026-10-26); poziomy nazwane wiekiem oceniały dziecko i nie pasowały do kart, w których umiejętności rosną w innym tempie, więc żadna karta nie nazywa poziomów wiekiem. Reguły (szerokość alejki, długość drogi, kratka, ciągi) są w Business Logic. Poziom 3 labiryntu i Poziom 3 symetrii nie oznaczają tej samej trudności.
- FR-002: Rodzic może wybrać postać z dostarczonego zestawu. Priority: must-have
  > Socrates: Counter-argument considered: przygotowanie i prawa do postaci mogą opóźnić podstawowy przepływ. Resolution: kept; źródło postaci i prawa zamknięte 2026-11-17 (Open Questions 3).
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

- FR-012: Rodzic może wybrać dowolną postać z dostarczonego katalogu czternastu postaci: jedenastu stałych (Samochodzik, Rakieta, Dinozaur, Jednorożec, Kot, Pies, Robot, Smok, Strażak, Syrenka i Wróżka) i trzech świątecznych (Bałwanek, Mikołaj, Renifer), które lista pokazuje tylko 15.11–6.01. Priority: must-have
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
- FR-026: Rodzic może wygenerować kartę dyktanda graficznego z poleceniami (liczba kratek i strzałka), które prowadzą po liniach kratki wzdłuż obrysu obiektu z katalogu szablonów albo z katalogu kształtów dyktanda, z jedną sprawdzalną odpowiedzią, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have
  > Socrates: Counter-argument considered: obrys sylwetki może dotykać sam siebie w narożniku kratki i wtedy polecenia są dwuznaczne dla dziecka. Resolution: kept; generator odrzuca warianty, których obrys się przecina albo dotyka sam siebie. Revised (2026-10-30, GitHub 115): obiekty tylko dla dyktanda nie muszą być symetryczne; rysuje się je ręcznie jako całe sylwetki, a te same reguły obrysu obowiązują je tak samo.
- FR-027: Rodzic może wybrać poziom dyktanda graficznego (łatwy, średni, trudny: rozmiar kratki, katalog obiektów, liczba poleceń). Priority: must-have
  > Socrates: Counter-argument considered: poziomy bez mierzalnych reguł wprowadzają w błąd. Resolution: kept; reguły są w Business Logic, wartości startowe potwierdza wydruk. Revised (2026-10-26): łatwy / średni / trudny zamiast 5, 6 i 7 lat, jak nonogram (FR-025), z którym dyktando dzieli trzy rozmiary obiektów.
- FR-028: Rodzic dostaje więcej obiektów z katalogu szablonów, pogrupowanych w siedem kategorii po co najmniej cztery obiekty, na karcie symetrii, nonogramie, dyktandzie i „Skopiuj obrazek”. Priority: must-have
  > Socrates: Counter-argument considered: każda gotowa lista szablonów to znowu skończona biblioteka (Open Questions 7). Resolution: kept; więcej obiektów z losowanymi częściami odsuwa powtórki, a trzy karty dzielą jeden katalog, więc każdy nowy obiekt działa trzy razy. Revised (2026-10-25): lista z przykładów (jabłko, motyl, korona) zamieniona na obiekty pionowe, bo wszystkie siatki są wyższe niż szersze, a szeroki obiekt zajmuje tylko pas kartki. Revised (2026-10-30, GitHub 115): dyktando ma dodatkowo własne kształty bez osi symetrii (Business Logic „Karta dyktanda graficznego”); kategoria „Kształty” z figurami geometrycznymi weszła w GitHub 198. Revised (2026-10-30, GitHub 124): kotwica (Kosmos i maszyny) i lizak (Jedzenie) wchodzą do istniejących kategorii, a istniejące obiekty dostają kolejne warianty części; korona zostaje poza listą. Revised (2026-10-31, GitHub 198): szósta kategoria „Kształty” z ośmioma figurami geometrycznymi (symetrycznymi lewo–prawo, o własnych proporcjach); korona nie weszła, bo jest szeroka i niska. Revised (2026-11-14, GitHub 369): siódma kategoria „Boże Narodzenie” z oknem dat 15.11–6.01 (bombka, dzwonek, prezent, piernik, bałwanek, aniołek, a z istniejących choinka i gwiazda oraz renifer jako kształt dyktanda); święta mają zdążyć przed grudniem, więc to kategoria na istniejącym mechanizmie, a nie tag z S-43.
- FR-029: Rodzic może wybrać na pasku symetrii, nonogramu i dyktanda jedną kategorię obiektów albo „Wszystkie”. Priority: must-have
  > Socrates: Counter-argument considered: wąska kategoria szybciej się powtarza, a zaznaczanie kilku kategorii daje więcej swobody. Resolution: kept as single choice (2026-10-25, decyzja użytkownika); „Wszystkie” to osobna kategoria, a każda kategoria ma co najmniej cztery obiekty w każdym rozmiarze, więc kolejne karty się nie powtarzają. Revised (2026-11-14, GitHub 369): kategorie mogą mieć okno dat; lista na pasku zależy od daty urządzenia, a „Wszystkie” zostaje pełnym katalogiem przez cały rok.

### Postać na kartach i podpowiedzi

- FR-030: Na każdej karcie poza labiryntem wybrana postać stoi przy zdaniu polecenia i „mówi” je w dymku; drukuje się zawsze w kolorze. Priority: must-have
  > Socrates: Counter-argument considered: kolorowa postać łamie umowę czarnego druku, a pasek „Postać” wraca na strony, które go celowo nie miały. Resolution: kept (2026-10-26); postać jest ozdobą, nie częścią zadania, więc nie zmienia odpowiedzi; drukuje się w kolorze jak na labiryncie i na czarno-białej drukarce schodzi do szarości. Ulubiona postać z profilu dostaje sens na każdej karcie, a „Brak” zostaje.
- FR-031: Rodzic widzi krótkie podpowiedzi w miejscu wyboru (komunikat o zapamiętaniu, „Tylko na tę kartę”, opis poziomu, zdanie w oknie profilu) i może otworzyć stronę „Jak to działa”. Priority: must-have
  > Socrates: Counter-argument considered: podpowiedzi to łatka na zbyt złożony model ustawień. Resolution: kept; zasada jest prosta (karta pamięta pasek, postać zmienia się jawnie), a podpowiedź pokazuje ją dokładnie wtedy, gdy rodzic coś zmienia. Jeśli wydruk próbny pokaże, że podpowiedzi nie wystarczają, poprawiamy model, a nie dokładamy samouczek.
- FR-032: Rodzic może w oknie profilu przywrócić domyślne ustawienia wszystkich kart („Zacznij od nowa”); imię i ulubiona postać zostają. Priority: nice-to-have
  > Socrates: Counter-argument considered: to kolejny przycisk w oknie, które ma zostać małe. Resolution: kept as nice-to-have; przydaje się, gdy profil przechodzi na młodsze rodzeństwo, ale to samo da się zrobić paskiem każdej karty.

### Kto ma więcej?, Który nie pasuje, Skopiuj obrazek i Szlaczki

- FR-033: Rodzic może wygenerować kartę „Kto ma więcej?”, na której dziecko porównuje wartość dwóch kupek monet i banknotów (w złotych, euro albo dolarach, bez groszy i centów) i wpisuje między nimi „<”, „>” albo „=”, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have
  > Socrates: Counter-argument considered: remis psuje jedną sprawdzalną odpowiedź. Resolution: remis akceptowalny (2026-11-01); „=” jest dopuszczoną odpowiedzią, a aplikacja liczy wartość każdej kupki i zna poprawne porównanie.
- FR-034: Rodzic może wybrać poziom karty „Kto ma więcej?” (łatwy, średni, trudny: nominały, sumy, liczba sztuk myli). Priority: must-have
  > Socrates: Counter-argument considered: dziecko 6 lat nie umie jeszcze dodawać. Resolution: kept; łatwy poziom porównuje tylko liczbę sztuk jednego nominału, a wartości poziomów potwierdza wydruk (Open Questions 14).
- FR-035: Rodzic może wygenerować kartę „Który nie pasuje”, na której w każdym rzędzie jeden obrazek łamie jawną regułę (kształt, kolor, rozmiar, liczba albo kategoria obiektu), zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have
  > Socrates: Counter-argument considered: dwie reguły mogą wskazać inny obrazek. Resolution: kept (2026-11-01); generator sprawdza wszystkie reguły naraz, jak w sekwencjach, i nie pokazuje rzędu, w którym pasuje inna odpowiedź.
- FR-036: Rodzic może wybrać poziom karty „Który nie pasuje” (łatwy, średni, trudny: rodzaj reguł, liczba obrazków w rzędzie, liczba rzędów, rozpraszacze, subtelność różnicy rozmiaru i grupy w regule liczby) i włączyć kolory, co układa nową kartę. Priority: must-have
  > Socrates: Counter-argument considered: kolory jako ozdoba nie mogą zostać, gdy kolor jest regułą i rozpraszaczem. Resolution: revised (2026-11-08, GitHub 265); na tej karcie kolory należą do zadania, więc zmiana układa nową kartę, a ikony kategorii zostają czarne także z kolorami.
- FR-037: Rodzic może wygenerować kartę „Skopiuj obrazek”, na której dziecko przerysowuje czarną sylwetkę obiektu z katalogu szablonów z jednej kratki do pustej, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have
  > Socrates: Counter-argument considered: dwie kratki obok siebie nie mieszczą się na pionowym A4 z marginesem 10 mm. Resolution: kept (2026-11-01), rozstrzygnięte 2026-11-09 po makiecie (S-35): dwie kratki obok siebie mieszczą się w 10 mm marginesu na każdym poziomie, także trudny z kratką 5 mm (2 × 18 × 5 mm + odstęp 10 mm = 190 mm); kratki nie mają numerów (Open Questions 13).
- FR-038: Rodzic może wybrać poziom karty „Skopiuj obrazek” (łatwy, średni, trudny: rozmiar kratki i katalog obiektów) oraz kategorię obiektów i włączyć kolory sylwetki. Priority: must-have
- FR-039: Rodzic może wygenerować kartę szlaczków, na której dziecko prowadzi ołówek po kropkach (niższe poziomy) albo kontynuuje pokazany wzór (wyższe poziomy), zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have
  > Socrates: Counter-argument considered: dwa tryby w jednej karcie mieszają różne umiejętności. Resolution: kept (2026-11-01); opis poziomu mówi wprost, który tryb to jest, a poziom jest jedynym wyborem na pasku.
- FR-040: Rodzic może wybrać poziom szlaczków (Poziom 1–4: tryb, pula wzorów, łagodność kształtu, liczba rzędów), a na Poziomach 3–4 włączyć albo wyłączyć linie pomocnicze. Priority: must-have
  > Socrates: Counter-argument considered: sztywne przypisanie sześciu wzorów do poziomów szybko się powtarza, a Poziom 1 z makiety był za trudny dla 3-latka. Resolution: revised (2026-11-09, makiety w `context/changes/pattern-lines-card/`); poziomy celują w 3–4, 5–6, 6–7 i 8–10 lat (cel projektu, nie etykieta), mają pule wzorów i losowaną łagodność, a Poziom 4 pomaga w nauce pisania (liniatura, elementy liter).

### Krzyżówka matematyczna

- FR-041: Rodzic może wygenerować krzyżówkę matematyczną, w której działania „a ○ b = c” (dodawanie, odejmowanie, mnożenie, dzielenie) krzyżują się we wspólnych polach z liczbami, część liczb jest wpisana, a reszta pusta i da się ją wyliczyć bez zgadywania; zobaczyć jej podgląd, w razie potrzeby pokazać rozwiązanie na ekranie i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have
  > Socrates: Counter-argument considered: samo dodawanie z pustym składnikiem to odejmowanie, więc karta nie uczy niczego nowego. Resolution: kept (2026-11-13); tak działają zeszyty ćwiczeń, które pokazała użytkowniczka, a krzyżówka daje nową kartę na właściwym poziomie na żądanie, ten sam problem co przy innych kartach.
- FR-042: Rodzic może wybrać poziom krzyżówki matematycznej (Poziom 1–7: rodzaj działań, największa liczba, liczba działań, kratka, puste pola i łańcuch). Priority: must-have
  > Socrates: Counter-argument considered: siedem poziomów to dużo do wyboru, a poziomy bez mierzalnych reguł wprowadzają w błąd. Resolution: kept (2026-11-13); użytkowniczka chciała więcej niż trzy poziomy, a każdy zmienia jedną rzecz naraz (rodzaj działań, zakres liczb albo wielkość), z jawną tabelą w Business Logic; wartości startowe potwierdza wydruk (Open Questions 17).

### Zegar

- FR-043: Rodzic może wygenerować kartę „Zegar” z tarczami zegara ze wskazówkami w trzech trybach (odczytaj godzinę, dorysuj wskazówki, połącz tarczę z zegarem cyfrowym), z jedną sprawdzalną odpowiedzią przy każdej tarczy, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have
  > Socrates: Counter-argument considered: trzy tryby na jednej karcie mieszają różne umiejętności, a tryb Połącz zdradza odpowiedź, bo stoi obok. Resolution: kept (2026-11-15); tryb to jeden wybór na pasku, jak tryb szlaczków wynikający z poziomu, a Połącz jest celowo najłatwiejszy (rozpoznanie zamiast przypomnienia). Dorysuj ćwiczy położenie wskazówki godzinowej, czego sam odczyt nie sprawdza.
- FR-044: Rodzic może wybrać poziom karty „Zegar” (Poziom 1–5: pełne godziny, wpół do, kwadranse, co 5 minut, co minutę), tryb i zapis 24-godzinny z porą dnia pod tarczą. Priority: must-have
  > Socrates: Counter-argument considered: tarcza ze wskazówkami nie odróżnia 7:30 od 19:30, więc zapis 24-godzinny nie ma jednej odpowiedzi. Resolution: revised (2026-11-15); przy włączonym 24 h pod tarczą stoi słowami pora dnia, a generator unika godzin na granicach pór, więc odpowiedź jest jedna. Ikony słońca i księżyca odpadły, bo są dwuznaczne.

### Kodowanie

- FR-045: Rodzic może wygenerować kartę kodowania z kratką, przeszkodami i postacią na starcie w dwóch trybach (zapisz strzałkami jedyną najkrótszą drogę do mety; wykonaj podane strzałki i zakreśl obrazek na końcu drogi), z jedną sprawdzalną odpowiedzią, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Priority: must-have
  > Socrates: Counter-argument considered: „najkrótsza droga” jest dla przedszkolaka abstrakcyjna, a na kratce z przeszkodami bywa kilka dróg tej samej długości. Resolution: kept (2026-11-17); generator liczy najkrótsze drogi i nie pokazuje kratki, w której jest ich więcej niż jedna, a pól na strzałki jest dokładnie tyle, ile kroków, więc dłuższa droga się nie mieści i słowo „najkrótsza” nie jest potrzebne. Wykonaj nie potrzebuje najkrótszej drogi, bo strzałki są podane.
- FR-046: Rodzic może wybrać poziom karty kodowania (Poziom 1–4: kratka, długość drogi, zakręty, przeszkody, zapis „3 →” na Poziomie 4) i tryb (Zapisz, Wykonaj). Priority: must-have
  > Socrates: Counter-argument considered: dwa tryby w jednej karcie mieszają planowanie z czytaniem poleceń, a tryb mógłby wynikać z poziomu. Resolution: kept (2026-11-17, decyzja użytkowniczki po makiecie); tryb to osobny wybór na pasku, jak w zegarze, bo obie umiejętności rosną z kratką i długością drogi, a rodzic wybiera, co dziecko ćwiczy.

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
- Karty „Kto ma więcej?”, „Który nie pasuje”, „Skopiuj obrazek” i szlaczki spełniają te same granice co labirynt: generowanie do 5 sekund, jedna strona A4, margines co najmniej 10 mm, czarny druk bez odpowiedzi na kartce (karty „Który nie pasuje” i „Kto ma więcej?” z włączonymi kolorami drukują obrazki w kolorach, a „Skopiuj obrazek” sylwetkę w kolorach kredek), te same przeglądarki na komputerze i na telefonie, w tym Brave.
- Krzyżówka matematyczna (2026-11-13, S-40) spełnia te same granice co labirynt: generowanie do 5 sekund (także Poziom 7 z czterema działaniami do 100 i 20 działaniami), jedna strona A4, margines co najmniej 10 mm, czarny druk bez odpowiedzi na kartce (rozwiązanie tylko na ekranie), te same przeglądarki na komputerze i na telefonie, w tym Brave.
- Karta „Zegar” (2026-11-15) spełnia te same granice co labirynt: generowanie do 5 sekund, jedna strona A4, margines co najmniej 10 mm, czarny druk bez odpowiedzi na kartce, te same przeglądarki na komputerze i na telefonie, w tym Brave.
- Karta kodowania (2026-11-17, S-42) spełnia te same granice co labirynt: generowanie do 5 sekund (także Poziom 4 w trybie Zapisz ze sprawdzeniem jednej najkrótszej drogi), jedna strona A4, margines co najmniej 10 mm, czarny druk bez odpowiedzi na kartce (szare pola przykładu i szare przeszkody to nie odpowiedź), te same przeglądarki na komputerze i na telefonie, w tym Brave.
- Postać przy poleceniu (US-21) jest jedynym elementem, który drukuje się w kolorze niezależnie od przełącznika kolorów karty.
- Lokalne profile dzieci, zapamiętane w nich ustawienia kart i ostatnie parametry pozostają dostępne między wizytami do czasu usunięcia ich przez rodzica albo wyczyszczenia danych przeglądarki.
- Dane profili dzieci, zapamiętane w nich ustawienia kart i ostatnie parametry nie opuszczają urządzenia; aplikacja nie przekazuje ich nikomu. Licznik odsłon to osobna sprawa: na produkcji (nie na stagingu) strony ładują zewnętrzny skrypt Cloudflare Web Analytics, a przeglądarka wysyła mu dane odsłony, m.in. adres strony i adres IP; skrypt nie dostaje od aplikacji profili ani ustawień (`src/lib/analytics.ts`, GitHub 271). Formularz opinii ze stopki (US-22) jest zewnętrzny i anonimowy; rodzic wypełnia go sam, a aplikacja nic do niego nie przekazuje.
- Wygenerowane karty nie są przechowywane po zakończeniu przepływu drukowania.

## Business Logic

Aplikacja zawsze tworzy labirynt z dokładnie jednym rozwiązaniem, a poziom wyznaczają szerokość alejki i sposób losowania labiryntu.

Rodzic wybiera jeden z sześciu numerowanych poziomów (Poziom 1–6) oraz jedną z czternastu postaci dostarczonego katalogu: Samochodzik, Rakieta, Dinozaur, Jednorożec, Kot, Pies, Robot, Smok, Strażak, Syrenka, Wróżka albo, od 15.11 do 6.01, Bałwanek, Mikołaj, Renifer. Może też zostać bez postaci. Obrys zostaje pionowym prostokątem na kartce A4. Osobnej kontrolki długości drogi nie ma. Każdy poziom ma inną szerokość alejki. Każde Generuj daje nowy labirynt.

| Poziom   | Dawna nazwa | Alejka       | Siatka | Losowanie                         | Droga do mety (typowo) |
| -------- | ----------- | ------------ | ------ | --------------------------------- | ---------------------- |
| Poziom 1 | 3 lata      | około 21 mm  | 9×11   | krótka droga, dużo krótkich odnóg | około 23 komórki       |
| Poziom 2 | 4 lata      | około 17 mm  | 11×13  | kręta droga                       | około 47 komórek       |
| Poziom 3 | 5 lat       | około 15 mm  | 13×16  | dłuższa, kręta droga              | około 74 komórki       |
| Poziom 4 | 6 lat       | około 13 mm  | 15×18  | długa, kręta droga                | około 100 komórek      |
| Poziom 5 | 7–8 lat     | około 10 mm  | 19×23  | długa, kręta droga                | około 160 komórek      |
| Poziom 6 | nastolatek  | około 6,6 mm | 29×35  | długa, kręta droga                | około 390 komórek      |

Kolumna „Dawna nazwa” w tej i kolejnych tabelach łączy poziom z dotychczasową etykietą i z zapisanymi danymi; nie jest nazwą poziomu ani etykietą na pasku, ale jest źródłem dopisku o typowym wieku pod opisem w liście poziomów labiryntu, symetrii, sekwencji i dyktanda (Open Questions 12, decyzja 2026-10-26).

Droga do mety nie jest progiem. To typowa długość dla siatki i sposobu losowania; pojedyncza karta może być krótsza albo dłuższa.

Na Poziomach 1–5 start jest na środku górnej krawędzi, a znak postaci zostaje na środku wejścia. Wyjście jest w dolnym wierszu, w losowej kolumnie co najmniej 2 kolumny od środka, a napis „Meta” stoi pod nim. Na Poziomie 6 start i meta są w narożnikach; wybrana postać stoi nad narożnym startem, lewą krawędzią równo z lewą krawędzią labiryntu, a pas nad znakiem równa się pasowi pod „Meta”. Pętle w jego ślepych odnogach są dozwolone, jeśli nie powstaje druga droga od startu do mety; odcięte komórki (wyspy, do których nie da się dojść ze startu) nie są dozwolone (decyzja 2026-11-03). W kodzie to kod `unreachable-cells` w `mazeSpec`: karta z taką komórką nie jest pokazana.

Poziom 1 losuje się sposobem, który daje krótszą drogę i więcej krótkich odnóg, żeby krótka droga nie była zagadką ukrytą wśród pułapek. Poziomy 2–6 losują krętą drogę zaczynając od losowej komórki, więc odnogi są równo rozłożone między startem a metą. Generator losuje 20 labiryntów i bierze ten, który ma najwięcej głębokich odnóg przy drodze (ślepy fragment co najmniej 5 komórek) i najmniej drogi w środkowej trzeciej szerokości kartki. Dzięki temu nie trafia się karta z prawie prostą drogą w dół przy środku (GitHub 114, testy na 4-latku i 6-latku 2026-10-30).

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

Elementy to siedem kształtów (koło, kwadrat, trójkąt, gwiazdka, serce, krzyżyk, ukośna strzałka; trzy ostatnie doszły w GitHub 112) i liczby. Reguły pochodzą z jawnej listy: powtarzanie wzoru (AB, ABC, AAB, ABB), liczby rosnące o 1 lub o 2, liczby malejące o 1 i mieszanie: kształt na przemian z liczbą rosnącą. Ciąg dla pustego pola jest poprawny, gdy z całej listy reguł pasuje do niego dokładnie jedna odpowiedź. Karta, której którykolwiek ciąg nie spełnia tego, nie jest pokazana.

| Poziom   | Dawna nazwa | Długość ciągu | Reguły                                         | Puste pola w ciągu | Liczba ciągów |
| -------- | ----------- | ------------- | ---------------------------------------------- | ------------------ | ------------- |
| Poziom 1 | 4 lata      | 5 pól         | wzór AB z dwoma kształtami                     | 1                  | 5             |
| Poziom 2 | 5 lat       | 7 pól         | wzór AB, AAB, ABC z kształtami                 | 1–2                | 6             |
| Poziom 3 | 6 lat       | 8 pól         | wzór AB, AAB, ABC z kształtami                 | 2                  | 7             |
| Poziom 4 | 7 lat       | 8 pól         | mieszane: kształt z liczbą, malejące, wzór ABB | 2–3                | 7             |

Pola wypełniają szerokość wiersza, więc krótszy ciąg daje większe pole na odpowiedź; dlatego najłatwiejszy poziom ma najkrótszy ciąg. Wszystkie pola mają cienką ramkę, puste pole ma ramkę przerywaną i mały znak zapytania w rogu. Kształty są obrysami. Polecenie: „Co pasuje w puste pole? Uzupełnij.” Na Poziomach 1 i 2 jedno puste pole jest zawsze na końcu ciągu, drugie (jeśli jest) leży w drugiej połowie, a wzór pokazuje się w całości przed pierwszą luką.

Doprecyzowanie z planu poziomów (2026-10-24):

- Rosnące grupy to bloki A, AB, ABB, ABBB… sklejone i ucięte do długości ciągu (przy 8 polach: A A B A B B A B). Karta ich nie losuje (od 2026-10-30, GitHub 117: na 8 polach nie widać wzrostu grup), ale sprawdzenie dwuznaczności je zna, także w wariantach, w których bloki zaczynają się od ABB, ABBB… albo rośnie pierwszy kształt (AAB, AAAB…).
- Mieszane to jeden stały kształt na przemian z liczbą rosnącą o 1 (kształt na polach parzystych albo nieparzystych).
- Liczby na karcie mają od 1 do 20, więc w polu są najwyżej dwie cyfry. Liczba to gruba cyfra na środku pola, bez ramki.
- Na Poziomach 1 i 2 luki wyglądają jak w tabeli (ostatnie pole, druga luka w drugiej połowie). Na Poziomach 3 i 4 luki leżą w dowolnych polach po tych, które pokazują regułę (liczby: dwa pierwsze pola, wzory ABC, AAB i ABB: trzy pierwsze). Poziom 4 ma trzy ciągi z trzema lukami, pozostałe cztery z dwiema.
- Poziom 3 losuje po dwa ciągi AB, AAB i ABC oraz jeden dowolny z tych trzech; Poziom 4 po dwa ciągi kształt z liczbą, malejące o 1 i wzór ABB oraz jeden dowolny.
- Jedna karta nie pokazuje dwa razy tej samej sekwencji, nawet z lukami w innych polach.
- Dwuznaczność liczy się względem całej listy reguł, także na Poziomach 1 i 2; wiersz, do którego pasuje inna reguła z inną odpowiedzią (np. AAB z dwiema lukami pasujące też do rosnących grup), nie jest pokazany. Dwuznaczność liczy się też względem odczytań, które dziecko widzi na kartce poza listą: rosnące grupy w wariantach (patrz wyżej) oraz powtarzającą się jednostkę o okresie 5–6 pól, gdy każde jej pole jest widoczne, a któreś widać co najmniej dwa razy (decyzja 2026-10-30, GitHub 117). Przez to na Poziomie 2 wiersz AAB z dwiema lukami nie jest pokazany; wiersze AAB mają tam jedną lukę.
- Mieszane pokazują co najmniej dwie liczby, żeby krok liczenia był widoczny w wierszu (decyzja 2026-10-30, GitHub 117).

Kolory są osobnym ustawieniem rodzica, niezależnym od poziomu. Domyślnie kształty są czarnymi konturami. Po włączeniu każdy kształt tej karty ma jedną kredkę, tę samą w każdym wierszu, wylosowaną przy Generuj z dziewięciu kredek. Liczby, „?” i puste pola zostają jak przy wyłączonych kolorach. Przełącznik nie układa nowej karty.

Wartości są startowe i zostają potwierdzone na wydruku. Wynikiem jest karta A4; ciągi zajmują większą część strony i zachowują margines co najmniej 10 mm.

### Karta sudoku

Przebudowane 2026-10-24: zamiast planszy 4×4 z postaciami z katalogu trzy rozmiary z prostymi kształtami albo cyframi, a rozmiar i poziom są dwoma osobnymi wyborami, nie wiekiem (7-latek robi już 9×9).

Aplikacja zawsze tworzy planszę z dokładnie jednym rozwiązaniem. Zasada: w każdym wierszu, w każdej kolumnie i w każdym bloku każdy symbol występuje raz. Generator układa pełne poprawne sudoku, potem usuwa pola tak, by pozostałe wypełnione pola nadal miały jedno rozwiązanie, aż do liczby pustych pól dla rozmiaru i poziomu. Plansza, która tego nie spełnia, nie jest pokazana. Plansza nie używa postaci z katalogu; postać stoi tylko przy poleceniu (US-21).

Kształty to: koło, kwadrat, trójkąt, serce, krzyżyk, gwiazdka, romb, księżyc, kropla — proste do narysowania przez dziecko. Plansza 4×4 losuje cztery z pięciu najprostszych (koło, kwadrat, trójkąt, serce, krzyżyk), 6×6 sześć, 9×9 używa wszystkich dziewięciu. Przy 6×6 i 9×9 rodzic wybiera kształty albo cyfry (przełącznik „Kształty / Cyfry”, 9×9 z cyframi to zwykłe sudoku). Pod planszą z kształtami jest ramka o szerokości planszy z napisem „Użyj:” i samymi rysunkami figur tej karty (bez nazw), w kolejności katalogu, ta sama wielkość (13 mm) na każdym rozmiarze. Lewa i prawa krawędź ramki leżą równo z krawędziami planszy, a odstęp od dołu planszy do ramki jest taki sam jak od polecenia do planszy; kształty stoją zwartą grupą (odstęp do 8 mm, na 9×9 ok. 5 mm) obok napisu (decyzja 2026-10-30, GitHub 174, po makiecie 9×9). Karta z cyframi ramki nie ma.

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

Kolory (US-14): przy kształtach rodzic może włączyć kolory. Każdy kształt ma wtedy jeden stały kolor kredki na całej planszy, bez liter i bez legendy kolorów. Rysunek na liście używa tej samej kredki. Przypisanie (zatwierdzone na wydruku 2026-10-25, kształty wypełnione kolorem): serce czerwone, koło niebieskie, trójkąt zielony, kwadrat pomarańczowy, krzyżyk fioletowy, gwiazdka żółta, romb brązowy, księżyc szary, kropla czarna. Przełącznik nie zmienia planszy. Domyślnie kształty są czarnymi konturami. Przy cyfrach kolorów nie ma.

Wartości są startowe i zostają potwierdzone na wydruku; użytkowniczka nie jest pewna, czy 6×6 i 9×9 nie są za trudne (Open Questions 9). Wynikiem jest karta A4: plansza zajmuje większą część strony i zachowuje margines co najmniej 10 mm.

### Katalog szablonów obiektów

Dodane 2026-10-25. Karta symetrii, nonogram i dyktando graficzne biorą obiekty z jednego katalogu szablonów zapisanych w kodzie (patrz „Karta symetrii”). Szablon to połowa obiektu symetrycznego lewo–prawo z częściami losowanymi przez generator i kolorem kredki każdej kratki; cała sylwetka to połowa i jej odbicie. Każdy obiekt ma trzy rozmiary: połowa 4×12 (cała 8×12), 6×15 (cała 12×15) i 9×24 (cała 18×24). Kształty bez osi symetrii są tylko w dyktandzie i mają własny katalog (patrz „Karta dyktanda graficznego”); symetria i nonogram ich nie używają.

Od 2026-10-25 (S-21) katalog ma 22 obiekty z tabeli poniżej, od 2026-10-30 (GH #118) 24, od 2026-10-30 (GH #124) 26, od 2026-10-31 (GH #198) 34, od 2026-11-14 (GH #369) 40; wcześniej miał trzy: rakieta, robot, truskawka. Obiekt pasuje do katalogu, gdy jest symetryczny lewo–prawo, pionowy (wszystkie siatki są wyższe niż szersze), rozpoznawalny po samej czarnej sylwetce także w połowie 4×12, szeroki przy osi, ma dziury na detale i warianty, mieści się w ośmiu kolorach kredek (z brązowym) i nie ma części stykających się tylko rogiem kratki (psują obrys dyktanda). Wyjątkiem od „pionowy” są auto i autobus (2026-10-30, GH #118): widok z boku, niski i szeroki, symetryczny, bo oba końce są takie same (kabina na osi, koło po każdej stronie); wypełniają całą szerokość siatki, a nie jej wysokość. Drugim wyjątkiem są figury „Kształty” (2026-10-31, GH #198): koło, romb, trójkąt, serce, gwiazda, krzyżyk, księżyc (poziomy sierp) i chmurka zachowują własne proporcje, więc koło jest tak wysokie jak szerokie, a chmurka szeroka i niska; zajmują pas siatki, nie jej całą wysokość.

Obiekty są pogrupowane w siedem kategorii (US-19). Obiekt ma co najmniej jedną kategorię i może mieć kilka. Lista (✓ — już jest):

| Kategoria        | Obiekty                                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zwierzęta        | sowa ✓, biedronka ✓, pingwin ✓, kot ✓, królik ✓                                                                                                                   |
| Jedzenie         | truskawka ✓, babeczka ✓, gruszka ✓, marchewka ✓, ananas ✓, lizak ✓                                                                                                |
| Przyroda         | choinka ✓, tulipan w doniczce ✓, muchomor ✓, kaktus ✓                                                                                                             |
| Kosmos i maszyny | rakieta ✓, robot ✓, balon na ogrzane powietrze ✓, UFO ✓, auto ✓, autobus ✓, kotwica ✓                                                                             |
| Domy i budowle   | domek ✓, wieża zamku ✓, latarnia morska ✓, wieżowiec ✓                                                                                                            |
| Kształty         | koło ✓, romb ✓, trójkąt ✓, serce ✓, gwiazda ✓ (też Boże Narodzenie), krzyżyk ✓, księżyc ✓, chmurka ✓                                                              |
| Boże Narodzenie  | bombka ✓, dzwonek ✓, prezent ✓, piernik ✓, bałwanek ✓, aniołek ✓, choinka ✓ (też Przyroda), gwiazda ✓ (też Kształty), renifer ✓ (kształt dyktanda, też Zwierzęta) |

Kategoria „Boże Narodzenie” ma okno dat (GitHub 369, 2026-11-14): pasek pokazuje ją od 15.11 do 6.01 włącznie według daty lokalnej urządzenia, ustalonej przy wejściu na stronę; okno przechodzi przez Nowy Rok. Okno steruje tylko listą na pasku i tym, jak pasek czyta zapamiętaną kategorię (poza oknem „Boże Narodzenie” czyta się jako „Wszystkie”); „Wszystkie” zawsze losuje z pełnego katalogu, także poza oknem, bo „Skopiuj obrazek” sprawdza kartę i koloruje ją względem pełnego katalogu. Sześć nowych obiektów z szablonów ma tylko tę kategorię; choinka (Przyroda) i gwiazda (Kształty) mają dwie, a renifer (kształt dyktanda) Boże Narodzenie i Zwierzęta. Bałwanek w kolorach ma szary korpus, czarny kapelusz i pomarańczowy nos; piernik ma czarne oczy i czerwony uśmiech. Odpadły po makiecie: świeca i rękawiczka (nieczytelne). Pory roku i inne święta (Wielkanoc, Mikołajki) zostają poza tym kawałkiem, na tym samym mechanizmie okna.

Lista jest startowa; obiekt, który nie daje się narysować czytelnie w połowie 4×12, zastępuje inny obiekt tej samej kategorii. Sezonowa kategoria „Boże Narodzenie” weszła w GitHub 369; pory roku i „Morze” czekają na więcej obiektów. Szerokie obiekty (motyl, korona) odpadły z listy startowej; korona nie weszła też do „Kształty” (GitHub 198), bo jest szeroka i niska. Kotwica (Kosmos i maszyny) i lizak (Jedzenie) dochodzą 2026-10-30 (GitHub 124): oba pionowe i symetryczne lewo–prawo; cukierek w papierku odpadł, bo jest szeroki i niski. GitHub 124 dokłada też kolejne warianty części istniejącym obiektom, najpierw tym, którym nonogram lub dyktando odrzuca najwięcej wariantów. Po makiecie z 2026-10-25 lody w rożku zastąpiły marchewka i ananas, a namiot wieżowiec: oba były nieczytelne w połowie 4×12. Królik doszedł jako piąte zwierzę, zapas dla nonogramu i dyktanda.

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

Droga to zewnętrzny obrys całej sylwetki obiektu z katalogu szablonów albo z katalogu kształtów dyktanda (niżej), obiegany w jednym kierunku od punktu startu z powrotem do niego. Kolejne odcinki w tym samym kierunku łączą się w jedno polecenie. Dziury w sylwetce (okno, oczy, pestki) nie są rysowane. Kratka jest większa od obiektu o co najmniej jedną kratkę z każdej strony, a punkt startu leży na obrysie (decyzja 2026-11-06: w którym wierzchołku, nie ma znaczenia).

| Poziom | Dawna nazwa | Kratka (około) | Obiekty                        |
| ------ | ----------- | -------------- | ------------------------------ |
| łatwy  | 5 lat       | 14 mm          | proste, z połowy 4×12 (8×12)   |
| średni | 6 lat       | 11 mm          | szablony z połowy 6×15 (12×15) |
| trudny | 7 lat       | 8 mm           | bogate, z połowy 9×24 (18×24)  |

Kształty dyktanda (dodane 2026-10-30, GitHub 115): oprócz obiektów z szablonów dyktando ma własny katalog całych sylwetek, które nie muszą być symetryczne ani pionowe. Rysuje się je ręcznie na kratce (zatwierdzona makieta w `context/changes/gh115-non-symetric-shapes/`), nie mają losowanych części, a ich wariantem jest odbicie w poziomie: kształt i jego lustro to dwa obrysy, więc dwie różne karty. Kształt ma rysunek tylko na poziomach, na których wygląda czytelnie; na łatwej kratce 8 kolumn nie wszystkie się mieszczą. Kształty mają te same kategorie co obiekty szablonów i losują się razem z nimi:

| Kategoria                  | Kształt                                                             | Poziomy               |
| -------------------------- | ------------------------------------------------------------------- | --------------------- |
| Zwierzęta                  | ryba, kaczka                                                        | średni, trudny        |
| Zwierzęta                  | dinozaur                                                            | łatwy, średni, trudny |
| Kosmos i maszyny           | lokomotywa, ciężarówka, statek, łódka z masztem (bez żagla)         | łatwy, średni, trudny |
| Kosmos i maszyny           | helikopter                                                          | średni, trudny        |
| Przyroda                   | parasol                                                             | łatwy, średni, trudny |
| Domy i budowle             | klucz pionowy, klucz poziomy (okrągła główka, zęby po obu stronach) | łatwy, średni, trudny |
| Boże Narodzenie            | skarpeta                                                            | łatwy, średni, trudny |
| Boże Narodzenie            | laska cukrowa, czapka Mikołaja, sanki                               | średni, trudny        |
| Boże Narodzenie, Zwierzęta | renifer                                                             | trudny                |

Kształty świąteczne dyktanda (GitHub 369) mają kategorię „Boże Narodzenie”, renifer także „Zwierzęta”; poziom bez rysunku kształt pomija. Jedzenie nie ma kształtów dyktanda, tylko obiekty z szablonów. Kategoria „Kształty” z figurami geometrycznymi (GitHub 198) składa się z obiektów z szablonów, a nie z kształtów dyktanda; kotwica i lizak wchodzą do Kosmosu i maszyn oraz Jedzenia (GitHub 124). Te same reguły obrysu (jedna zamknięta linia, bez rozłączeń i bez styku rogiem, dziury wypełnione) obowiązują kształty tak samo jak obiekty z szablonów.

Liczba poleceń wynika z obiektu; im bogatszy obiekt, tym więcej poleceń. Reguły, które generator sprawdza: droga wraca do punktu startu, nie przecina się i nie dotyka sama siebie (także w narożniku kratki), mieści się w kratce, a rysunek z poleceń to dokładnie obrys sylwetki. Wariant, który łamie którąś z tych reguł, nie jest pokazany. Każde Generuj daje inny obiekt albo inny wariant niż poprzednia karta. Rodzic może włączyć „Pokaż rozwiązanie”, żeby zobaczyć na ekranie kreskę zewnętrznego obrysu. Domyślnie wyłączone; przełączenie zostawia tę samą kartę. Udane Generuj oraz zmiana poziomu, która układa nową kartę, wyłączają przełącznik. Zmiana kategorii układa nową kartę i wyłącza przełącznik, tak jak zmiana poziomu. Nieudane Generuj albo nieudana nowa karta nie zostawia poprzedniej karty: w jej miejscu jest przyczyna, a przełącznik jest wyłączony. Wydruk nigdy nie pokazuje obrysu (decyzja 2026-10-25). Wartości są startowe i zostają potwierdzone na wydruku (Open Questions 11). Wynikiem jest karta A4; kratka i polecenia zajmują większą część strony i zachowują margines co najmniej 10 mm.

### Karta „Kto ma więcej?”

Dodane 2026-11-01 (M-5). Aplikacja zawsze tworzy kartę, w której każdy rząd ma dokładnie jedną poprawną odpowiedź: kupkę o większej wartości albo równe kupki. Poziom wyznaczają zestaw nominałów, wielkość sum i to, czy liczba sztuk myli. Kartka to pionowy prostokąt A4 z jednym zdaniem polecenia („Gdzie jest więcej pieniędzy? Wskaż <, > lub =.”) i pięcioma rzędami; w rzędzie stoją dwie kupki oddzielone pustym polem na znak „<”, „>” albo „=”, które wpisuje dziecko (decyzja 2026-11-01).

Kupka to zestaw monet i banknotów jednej waluty (złote, euro, dolary; GitHub 324, 2026-11-09). W złotych monetami są 1, 2 i 5 zł, a banknotami 10, 20, 50 i 100 zł; w euro monetami 1 i 2 €, a banknotami 5, 10, 20, 50 i 100 €; w dolarach wyłącznie banknotami 1, 5, 10, 20, 50 i 100 $, bo moneta 1 $ jest rzadko spotykana (decyzja 2026-11-09; bez 200 €). Wartość ma w jednej walucie jedną postać, więc dolar nie ma monety 1 $ obok banknotu 1 $. Moneta to koło z grubą liczbą, banknot to prostokąt z grubą liczbą; wszystkie monety mają tę samą wielkość, żeby wielkość nie zdradzała wartości, a wszystkie banknoty tę samą (banknot 18 × 9 mm). Wygląd jest stylizowany i nie kopiuje wzorów NBP. Wartość kupki to suma nominałów; grosze i centy nie występują. Czarny rysunek euro i dolara ma przy liczbie mały znak waluty (€, $; złote bez znaku, jak dotąd).

Kolory (US-24): osobne ustawienie rodzica, niezależne od poziomu, domyślnie wyłączone. Wyłączone to czarny kontur opisany wyżej. Włączone rysuje każdy kawałek jako gotowy kolorowy obrazek użytkowniczki (`public/money/<nominał>zl.png`, w euro `<nominał>eur.png`, w dolarach `<nominał>usd.png`; srebrna 1 zł, złota 2 zł, dwukolorowa 5 zł, banknoty 10 zł i 20 zł w różnych barwach); kolor jest czystą funkcją nominału, nominał zostaje liczbą na każdym kawałku, a obrazek jest stylizowany, bez zabezpieczeń i dokładnych wzorów NBP. Obrazek skaluje się do średnicy monety albo do rozmiaru banknotu, więc wielkość nadal nie zdradza wartości. Obrazki euro i dolara są wycięte z makiet użytkowniczki. Przełącznik nie zmienia karty.

| Poziom | Nominały w złotych       | Nominały w euro          | Nominały w dolarach                 | Sumy w kupce | Liczba sztuk w kupce                           | Rzędy, w których liczba sztuk myli |
| ------ | ------------------------ | ------------------------ | ----------------------------------- | ------------ | ---------------------------------------------- | ---------------------------------- |
| łatwy  | tylko monety 1, 2, 5     | tylko monety 1, 2        | banknoty 1 i 5 (dolar nie ma monet) | do 10        | 1–5                                            | żaden                              |
| średni | monety 1, 2, 5           | monety 1, 2 i banknot 5  | banknoty 1, 5, 10                   | do 20        | 1–8                                            | dokładnie 2 z 5                    |
| trudny | 1, 2, 5, 10, 20, 50, 100 | 1, 2, 5, 10, 20, 50, 100 | 1, 5, 10, 20, 50, 100               | do 200       | 1–10, w tym najwyżej 4 banknoty (w dolarach 9) | co najmniej 3 z 5                  |

Rząd „myli”, gdy kupka z ściśle mniejszą liczbą sztuk jest ściśle więcej warta; równa liczba sztuk przy różnej wartości i remis nie „mylą”. Dwie identyczne kupki nie są remisem.

Reguły, które generator sprawdza: suma każdej kupki mieści się w sumach poziomu; kupki w jednym rzędzie różnią się wartością albo są równe tylko w jednym rzędzie na karcie (decyzja 2026-11-01: remis dozwolony); na poziomie łatwym kupki mają tylko monety (dolar nie ma monet, więc ma banknoty 1 i 5 $), najwyżej 5 sztuk i żaden rząd nie myli; w kupce jest najwyżej 4 banknoty, bo więcej nie mieści się w ramce kupki (z czterema banknotami i sześcioma monetami ramka jest pełna); w dolarach, które nie mają monet, najwyżej 9 banknotów (trzy rzędy po trzy); na poziomie średnim dokładnie 2 z 5 rzędów myli, a na trudnym co najmniej 3 z 5; kupka mieści się w polu rzędu na A4. Karta, która łamie którąś z tych reguł, nie jest pokazana. Czarny druk niczego nie traci, bo nominał to liczba, także na kolorowym obrazku. Wartości są startowe i zostają potwierdzone na wydruku (Open Questions 14). Wynikiem jest karta A4; rzędy zajmują większą część strony i zachowują margines co najmniej 10 mm.

### Karta „Który nie pasuje”

Dodane 2026-11-01 (M-5). Aplikacja zawsze tworzy kartę, w której w każdym rzędzie dokładnie jeden obrazek łamie regułę rzędu, a żadna inna reguła z listy nie wskazuje innego obrazka. Kartka to pionowy prostokąt A4 z jednym zdaniem polecenia („Który nie pasuje? Zakreśl go.”) i rzędami obrazków jeden pod drugim.

Reguły pochodzą z jawnej listy: kształt (koło, kwadrat, trójkąt, serce, krzyżyk z katalogu sudoku), rozmiar (duży lub mały), liczba (grupa 1–6 tych samych kształtów ułożonych jak oczka kostki), kolor (siedem kredek: czerwona, niebieska, zielona, pomarańczowa, fioletowa, żółta, brązowa; bez szarej i czarnej, bo mylą się z konturem) i kategoria obiektu (prosta ikona wektorowa: czarna sylwetka z białymi detalami). Reguła kategorii używa pięciu kategorii po pięć ikon: Zwierzęta (kot, ryba, ptak, żółw, królik), Jedzenie (jabłko, gruszka, marchewka, lody, banan), Przyroda (drzewo, choinka, kwiat, grzyb, liść), Kosmos i maszyny (rakieta, auto, samolot, łódka, UFO), Domy i budowle (domek, wieża zamku, namiot, latarnia morska, wieżowiec). Ikony zastąpiły sylwetki z katalogu szablonów, bo pikselowe sylwetki były nieczytelne w rzędzie obrazków (makieta zatwierdzona 2026-11-08, GitHub 265). Kategoria „Kształty” nie bierze w niej udziału, bo myliłaby się z regułą kształtu. W rzędzie tej reguły n−1 różnych ikon jest z jednej kategorii, a odstająca z innej; ikona ma jedną kategorię, więc nie pasuje do dwóch odpowiedzi. Ikony zostają czarne także z kolorami. Ikona nieczytelna na wydruku może być wymieniona na inny obiekt tej samej kategorii. Reguła „kolor” wymaga włączonych kolorów (US-26); bez nich obrazki są czarnymi konturami.

Jeden rząd opiera się na jednej regule. Pozostałe cechy są albo jednakowe, albo są rozpraszaczami. Rozpraszacz to cecha inna niż reguła rzędu, która zmienia się tak, że każda jej wartość występuje w rzędzie co najmniej dwa razy, więc niczego nie wskazuje. Rozpraszaczami mogą być kolor (tylko z kolorami), kształt i rozmiar; liczba nigdy, a w rzędzie kategorii tylko rozmiar. Liczba rozpraszaczy z tabeli to górna granica: rząd dostaje tyle, ile cech jest dostępnych. Jednoznaczność: cecha reguły ma dokładnie jeden obrazek z wartością występującą w rzędzie raz (to odpowiedź), a żadna inna cecha nie ma takiego obrazka. Dwuznaczność liczy się względem całej listy reguł, jak w sekwencjach (decyzja 2026-11-08, GitHub 265).

| Poziom | Reguły w karcie                                | Obrazków w rzędzie | Rzędów | Rozpraszacze | Mały / duży | Grupy w regule liczby                   |
| ------ | ---------------------------------------------- | ------------------ | ------ | ------------ | ----------- | --------------------------------------- |
| łatwy  | kształt, rozmiar                               | 4                  | 5      | brak         | 0,5         | nie dotyczy (reguły liczby nie ma)      |
| średni | kształt, rozmiar, liczba, kolor (po włączeniu) | 5                  | 5      | do 1         | 0,55        | większość 2 albo 3 sztuki, odstająca ±1 |
| trudny | wszystkie, w tym kategoria obiektu             | 6                  | 6      | do 2         | 0,72        | większość 4 albo 5 sztuk, odstająca ±1  |

Każda reguła poziomu (kolor tylko z kolorami) występuje na karcie co najmniej raz, dwa sąsiednie rzędy mają różne reguły, a jedna karta nie pokazuje dwa razy tego samego rzędu. Obrazki to proste kontury; przy kategorii obiektu to ikony, bez nazw. Kolory są osobnym ustawieniem rodzica, niezależnym od poziomu, ale na tej karcie należą do zadania: przełącznik przy pokazanej karcie układa nową kartę (jak zmiana poziomu), bo z kolorami dochodzi reguła koloru i kolorowe rozpraszacze (decyzja 2026-11-08, GitHub 265). Karta nie ma „Pokaż rozwiązanie”. Wartości są startowe i zostają potwierdzone na wydruku (Open Questions 14). Wynikiem jest karta A4; rzędy zajmują większą część strony i zachowują margines co najmniej 10 mm.

### Karta „Skopiuj obrazek”

Dodane 2026-11-01 (M-5) jako „Skopiuj rysunek na kratce”; przemianowana 2026-11-13 na życzenie użytkowniczki („na kratce” było oczywiste i zbędne w nazwie). Aplikacja zawsze tworzy kartę z jedną odpowiedzią: tymi samymi zamalowanymi kratkami w drugiej kratce. Kartka to pionowy prostokąt A4 z jednym zdaniem polecenia („Przerysuj obrazek na pustą kratkę.”) i dwiema kratkami tej samej siatki: w jednej czarna sylwetka obiektu, druga pusta. Nie ma osi symetrii ani odbicia; to różni tę kartę od symetrii.

Obiekt pochodzi z katalogu szablonów (połowa i jej odbicie, jak w nonogramie) z losowanymi częściami; detale będące dziurami w sylwetce zostają pustymi kratkami. Kategoria jak w US-20. Kolory (US-28) to osobne ustawienie rodzica, niezależne od poziomu, domyślnie wyłączone: sylwetka jest wtedy czarna. Włączone: każda kratka lewej kratki ma kolor kredki z szablonu, a dziury w sylwetce kolor szablonu albo biel, jak w symetrii (US-09); prawa kratka zostaje pusta. Przełącznik nie układa nowej karty.

| Poziom | Siatka (cała) | Obiekty                       | Kratka (około)                     |
| ------ | ------------- | ----------------------------- | ---------------------------------- |
| łatwy  | 8×12          | proste warianty z połowy 4×12 | 11 mm                              |
| średni | 12×15         | warianty z połowy 6×15        | 7,5 mm                             |
| trudny | 18×24         | bogate warianty z połowy 9×24 | 5 mm, czytelność potwierdza wydruk |

Dwie kratki stoją obok siebie na każdym poziomie, z odstępem 10 mm, wyśrodkowane w poziomie. Polecenie z kratkami zaczyna się 56 mm od góry strony — dokładnie na wysokości, na której zaczyna się polecenie domyślnego sudoku (4×4, bez postaci) — a nie przypięte do samej góry jak labirynt, sekwencje czy „Kto ma więcej?”, ani wyśrodkowane w pionie na całej stronie jak sudoku i nonogram (decyzja 2026-11-13, GitHub 363): ten sam wzór wyśrodkowania dawałby tej karcie głębszy start niż im, bo jej siatka (ograniczona szerokością strony, nie wysokością) jest niższa niż ich. Trudny zajmuje całą szerokość między marginesami (2 × 18 × 5 mm + 10 mm = 190 mm). Kratki nie mają numerów wierszy i kolumn. Sylwetka jest wyśrodkowana w pionie w siatce, żeby szerokie obiekty (autobus, auto) nie zostawiały pustych dolnych wierszy. Jeśli wydruk pokaże, że 5 mm na trudnym jest za mało, trudny wraca do planu z siatką 12×15 i bogatszymi wariantami (decyzja 2026-11-09, Open Questions 13). Reguły, które generator sprawdza: obie kratki mają tę samą siatkę, wzór jest sylwetką obiektu z katalogu, druga kratka jest pusta, a obie kratki mieszczą się na A4 z marginesem 10 mm. Aplikacja nie ocenia rysunku dziecka. Każde Generuj daje inny obiekt albo inny wariant niż poprzednia karta. Wartości są startowe i zostają potwierdzone na wydruku.

### Karta szlaczków

Dodane 2026-11-01 (M-5), przebudowane 2026-11-09 po makietach (`context/changes/pattern-lines-card/frame.md`, `mockup-v6.mts`). Aplikacja zawsze tworzy kartę, na której wzór każdego rzędu wynika z jawnej reguły. Poziom wyznaczają tryb, pula wzorów, łagodność kształtu i liczba rzędów. Kartka to pionowy prostokąt A4 z jednym zdaniem polecenia i rzędami jeden pod drugim, rozłożonymi równo od polecenia do dołu kartki. Karta nie ma obrazków poza postacią przy poleceniu.

Tryby. **Kropki** (Poziomy 1–2): dziecko prowadzi ołówek po kropkach rozstawionych wzdłuż wzoru; pod kropkami biegnie jasnoszara ścieżka, a start oznacza puste kółko wokół pierwszej kropki. Ścieżka jest jedna i się nie krzyżuje (pętle nie wchodzą do trybu kropek). **Kropki na początku** (Poziom 3): dwa pierwsze powtórzenia wzoru są wykropkowane, a resztę rzędu dziecko rysuje samo; jedno powtórzenie nie wystarcza, bo pojedyncza fala i górka wyglądają tak samo. Pętle i pętle w dół w tej wykropkowanej części mogą się z konstrukcji krzyżować (pętla przecina samą siebie); szara ścieżka pokazuje kierunek, a reguła „bez skrzyżowań” ich nie obejmuje (decyzja 2026-11-09, S-36 plan). **Kontynuacja** (Poziom 4): co najmniej trzy powtórzenia narysowane linią, reszta rzędu pusta.

Łagodność. Każdy rząd losuje długość kroku i stosunek wysokości do kroku z zakresu poziomu, więc ten sam wzór bywa na kilku poziomach, coraz wyższy i gęstszy. Rząd losuje wzór z puli poziomu bez powtórzeń na karcie, dopóki pula starcza.

| Poziom   | Cel projektu (nie etykieta) | Tryb                            | Rzędy | Krok     | Wysokość / krok | Pula wzorów                                                                                                                                                                                                                                        |
| -------- | --------------------------- | ------------------------------- | ----- | -------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Poziom 1 | 3–4 lata                    | kropki co ok. 4 mm              | 4     | 40–52 mm | 0,2–0,42        | linia prosta, fala, zygzak, górki, miseczki                                                                                                                                                                                                        |
| Poziom 2 | 5–6 lat                     | kropki co ok. 3,5 mm            | 5     | 30–42 mm | 0,35–0,6        | fala, zygzak, górki, miseczki, schodki, kopce, zęby smoka, górka i kreska, domki (pięć w rzędzie), bramy, czubki, fala i kreska                                                                                                                    |
| Poziom 3 | 6–7 lat                     | dwa powtórzenia po kropkach     | 6     | 22–30 mm | 0,5–0,85        | zygzak, fala, górki, miseczki, schodki, kopce, zęby smoka, pętle, górka i kreska, ząbek i kreska, klocki, rury, domki, bramy, czubki, duży i mały ząbek, pętle w dół (j, g), laseczki (i)                                                          |
| Poziom 4 | 8–10 lat (klasy 1–3)        | kontynuacja linią, w liniaturze | 7     | 12–20 mm | z liniatury     | pętle (e), spirale, pętla wysoka i niska (l e), górka duża i mała (m n), pętla i górka, fala i pętla, górka i ząbek, schodek i górka, zęby smoka, kopce, klocki, rury, czary, pętle w dół (j g), pętla w górę i w dół, duży i mały ząbek, laseczki |

Poziom 1 ma o 15 mm większy pusty pas na dole kartki, żeby dziecku było wygodniej trzymać kartkę, a ręka, która wyjedzie poza kształt, została na papierze. Na Poziomie 4 wysokość wzoru wyznacza liniatura (małe elementy 6,5 mm, wysokie 13 mm), więc losowany jest tylko krok 12–20 mm; stosunek wysokości do kroku dotyczy Poziomów 1–3 (decyzja 2026-11-09, S-36 plan). Poziom 4 pomaga w nauce pisania: liniatura jak w zeszycie do kaligrafii (górna, przerywana środkowa, dolna i blada linia pod dolną); małe elementy (e, o, i, m n) sięgają linii środkowej, wysokie (l) górnej, pętle w dół (j g) schodzą pod dolną. Przełącznik „Linie” (US-30) na Poziomach 3–4 włącza i wyłącza linie pomocnicze; domyślnie włączony.

Odrzucone po makietach (2026-11-09): kreski pionowe i skośne, fala po skosie, pierścienie, piramidki, obrazki startu i celu w S-36 (wracają z kategoriami, z polem „Brak”) oraz wzory z postaciami i znakami towarowymi; zostają ogólne motywy (klocki, rury, zęby smoka, czary).

Reguły, które generator sprawdza: każdy rząd ma wzór z puli poziomu; dwa rzędy jednej karty nie są takie same; w trybie samych kropek (Poziomy 1–2) ścieżka się nie krzyżuje; Poziom 3 pokazuje dokładnie dwa powtórzenia po kropkach, Poziom 4 co najmniej trzy; wzór mieści się w rzędzie i nie wchodzi w margines. Aplikacja nie ocenia rysunku dziecka (decyzja 2026-11-01). Każde Generuj daje inne parametry, inne wzory albo inną kolejność niż poprzednia karta. Wartości są startowe i zostają potwierdzone na wydruku (Open Questions 15). Wynikiem jest karta A4; rzędy zajmują większą część strony i zachowują margines co najmniej 10 mm.

### Karta krzyżówki matematycznej

Dodane 2026-11-13 (M-6, S-40, GitHub 371); makiety i poziomy zaakceptowała użytkowniczka 2026-11-13. Aplikacja zawsze tworzy kartę, na której każde puste pole da się wyliczyć bez zgadywania, a odpowiedź jest jedna. Kartka to pionowy prostokąt A4 z jednym zdaniem polecenia („Uzupełnij krzyżówkę. Działania czytaj w prawo i w dół.”) i krzyżówką pod nim, wyśrodkowaną w obszarze pod poleceniem. Poziom wyznaczają rodzaj działań, największa liczba, liczba działań (wielkość krzyżówki), kratka i liczba pustych pól razem z „łańcuchem”. Karta nie ma obrazków poza postacią przy poleceniu; nie ma kolorów ani kategorii.

Działanie to dwie liczby, jeden znak i wynik, zapisane „a ○ b = c” w pięciu kratkach w prawo albo w dół: każde pole (liczba, znak, „=”) jest osobną kratką, jak w zeszytach ćwiczeń. Znaki to „+”, „−” (U+2212), „·” i „:”. Wszystkie liczby są od 1 do największej liczby poziomu. Mnożenie jest w tabliczce mnożenia (czynniki 2–10); dzielenie: dzielnik i iloraz 2–10, bez reszty, dzielna różna od dzielnika. Krzyżówka: każde nowe działanie przecina już stojące w polu z liczbą (jedno albo dwa przecięcia); kratki dwóch działań nie stykają się bokiem poza przecięciem, a przed i za działaniem jest pusto. To samo działanie (np. 1 + 1 = 2) powtarza się na karcie tylko wtedy, gdy nie ma innego.

| Poziom | Działania | Największa liczba | Działań (cel) | Kratka do | Puste (cel) | Najwyżej pustych w działaniu | Łańcuch do |
| ------ | --------- | ----------------- | ------------- | --------- | ----------- | ---------------------------- | ---------- |
| 1      | +         | 10                | 5             | 26 mm     | 40%         | 1                            | 1          |
| 2      | + −       | 10                | 9             | 24 mm     | 45%         | 1                            | 1          |
| 3      | + −       | 20                | 13            | 17 mm     | 50%         | 2                            | 2          |
| 4      | + −       | 100               | 12            | 16 mm     | 50%         | 2                            | 3          |
| 5      | ·         | 30                | 12            | 16 mm     | 50%         | 2                            | 3          |
| 6      | · :       | 50                | 15            | 14,5 mm   | 55%         | 2                            | 4          |
| 7      | + − · :   | 100               | 20            | 13,5 mm   | 60%         | 2                            | 4          |

Poziomy to numery bez wieku i bez wieku pod opisem. Domyślny jest Poziom 2. Opisy poziomów w UI: Poziom 1 „dodawanie do 10”, Poziom 2 „dodawanie i odejmowanie do 10”, Poziom 3 „dodawanie i odejmowanie do 20”, Poziom 4 „dodawanie i odejmowanie do 100”, Poziom 5 „mnożenie do 30”, Poziom 6 „mnożenie i dzielenie do 50”, Poziom 7 „wszystkie cztery działania do 100”.

Łańcuch (decyzja 2026-11-13): puste pole ma łańcuch 1, gdy wynika z działania, w którym reszta liczb jest wpisana; łańcuch N, gdy najpierw trzeba wyliczyć pole o łańcuchu N−1. Poziomy 1–2 mają łańcuch 1 (każde puste pole wprost z podanych liczb), Poziom 3 do 2, Poziomy 4–5 do 3, Poziomy 6–7 do 4. W jednym działaniu brakuje najwyżej tylu liczb, ile pokazuje tabela. Puste pola rosną z poziomem (około 40% na Poziomie 1, 60% na Poziomie 7) i nie mają osobnej kontrolki na pasku.

„Cel” w tabeli: generator dąży do tej liczby działań i pustych pól; karta z mniejszą liczbą działań niż cel o więcej niż ustalona tolerancja nie jest pokazana (tolerancja w kodzie poziomów, z komentarzem). Ciaśniejsza siatka może dać mniej działań niż cel.

Zakreskowane miejsca (decyzja 2026-11-14): wolne miejsce w siatce, które ma kratki działań ze wszystkich czterech stron, jest zakreskowane (ukośna, jasnoszara kreska), żeby było jasne, że nic się w nim nie wpisuje; układ karty podaje je jako `gaps`.

Reguły, które generator sprawdza: każde działanie jest prawdziwe; liczby mieszczą się w zakresie poziomu; znak jest z poziomu, a mnożenie i dzielenie mieszczą się w tabliczce; kratki działań nie stykają się poza przecięciem; każde puste pole da się wyliczyć samymi działaniami z jedną brakującą liczbą (bez zgadywania); łańcuch i liczba pustych pól w działaniu mieszczą się w limitach poziomu; karta ma co najmniej jedno puste pole i nie mniej działań niż cel minus tolerancja; kolejne Generuj daje inną kartę. Karta, która łamie którąś z tych reguł, nie jest pokazana. Niezależna wyrocznia w testach potwierdza jedno rozwiązanie.

„Pokaż rozwiązanie” (decyzja 2026-11-13): rodzic może włączyć je na pasku, żeby zobaczyć brakujące liczby na ekranie jako szare cyfry; domyślnie wyłączone, nie zapamiętywane i nie drukowane. Udane Generuj i zmiana poziomu je wyłączają.

Wartości potwierdził wydruk 2026-11-14 (Open Questions 17). Wynikiem jest karta A4: krzyżówka zajmuje większą część strony i zachowuje margines co najmniej 10 mm.

### Karta „Zegar”

Dodane 2026-11-15 (M-6, slot S-41); kształt karty ustaliła użytkowniczka na interaktywnej makiecie. Aplikacja zawsze tworzy kartę, w której każda tarcza ma jedną odpowiedź: godzinę wskazaną przez wskazówki. Kartka to pionowy prostokąt A4 z jednym zdaniem polecenia i tarczami pod nim. Poziom wyznacza, jakie minuty występują i jak wygląda tarcza; tryb wyznacza, co robi dziecko; „24 h” wyznacza zapis. Karta nie ma kolorów, kategorii ani „Pokaż rozwiązanie”.

Tarcza: okrąg, liczby 1–12, kreski godzin (grubsze przy 12, 3, 6 i 9), środek. Wskazówka minutowa jest długa i cienka, godzinowa krótka i gruba; godzinowa przesuwa się z minutami (kąt 30° na godzinę plus 0,5° na minutę), jak na prawdziwym zegarze. Od Poziomu 4 tarcza ma też kreski minut. Tarczy bez liczb nie ma: to umiejętność ok. 9 lat, po nauce odczytu, i rodzic ćwiczy ją na prawdziwym zegarze (decyzja 2026-11-15). Liczby leżą nad wskazówkami z białą obwódką: długa wskazówka przechodzi przez pierścień liczb i bez obwódki zakrywa „12” o pełnej godzinie albo „6” o wpół do (decyzja 2026-11-16, po makiecie). Zegar cyfrowy to ramka z godziną zapisaną cyframi („7:30”, minuty zawsze dwiema cyframi). Pola odpowiedzi w trybie Odczytaj to dwie kratki z dwukropkiem, nie linie (decyzja 2026-11-16).

Makieta (2026-11-16, `context/changes/clock-card/mockup.mts`, zaakceptowana): Odczytaj i Dorysuj to 2 kolumny × 3 rzędy z tarczą ok. 60 mm (z 24 h ok. 52–54 mm, bo pod tarczą dochodzi słowo pory dnia), kratki odpowiedzi 18 × 13 mm, zegar cyfrowy 42 × 15 mm z cyframi 10 mm; Połącz to 5 rzędów z tarczą 45 mm (z 24 h 38 mm) i kropkami ok. 85–90 mm od siebie. Liczby na tarczy mają ok. 0,2 promienia (ok. 6 mm na karcie Odczytaj). Pora dnia przy 24 h stoi pod każdą tarczą, także w trybie Dorysuj. Wartości są startowe i zostają potwierdzone na wydruku.

| Tryb                | Tarcz na karcie | Co jest na kartce                                                                | Co robi dziecko                        | Polecenie (startowe)                 | Opis w liście trybów (startowy) |
| ------------------- | --------------- | -------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------ | ------------------------------- |
| Odczytaj (domyślny) | 6 (2 × 3)       | tarcza ze wskazówkami, pod nią pola „__ : __”                                    | wpisuje godzinę                        | „Która godzina? Wpisz pod zegarem.”  | „dziecko wpisuje godzinę”       |
| Dorysuj             | 6 (2 × 3)       | pusta tarcza (tylko środek), pod nią godzina w ramce zegara cyfrowego            | rysuje obie wskazówki                  | „Dorysuj wskazówki: krótką i długą.” | „dziecko rysuje wskazówki”      |
| Połącz              | 5               | tarcze ze wskazówkami po lewej, zegary cyfrowe z tymi samymi godzinami po prawej | łączy kreską tarczę z zegarem cyfrowym | „Połącz zegar z tą samą godziną.”    | „dziecko łączy zegar z godziną” |

Tryb wybiera się na pasku z listy, tak jak poziom: przycisk „Tryb: Odczytaj” otwiera listę trzech trybów, a każdy wiersz ma nazwę i pół zdania o tym, co robi dziecko (decyzja 2026-11-16, S-41).

| Poziom   | Cel projektu (nie etykieta) | Minuty             | Tarcza                     | Opis w UI (startowy)      |
| -------- | --------------------------- | ------------------ | -------------------------- | ------------------------- |
| Poziom 1 | 5–6 lat                     | :00                | liczby 1–12, kreski godzin | „pełne godziny”           |
| Poziom 2 | 6–7 lat                     | :00 i :30          | jak wyżej                  | „pełne godziny i wpół do” |
| Poziom 3 | 7 lat                       | :00, :15, :30, :45 | jak wyżej                  | „kwadranse”               |
| Poziom 4 | 7–8 lat                     | co 5 minut         | dochodzą kreski minut      | „co 5 minut”              |
| Poziom 5 | 8–9 lat                     | dowolna minuta     | jak Poziom 4               | „co minutę”               |

Domyślny jest Poziom 1, tryb Odczytaj i 24 h wyłączone (decyzja 2026-11-15). Cel projektu to szacunek z typowego toku nauki zegara w przedszkolu i klasach 1–3; nie jest etykietą na pasku ani wiekiem pod opisem, jak w szlaczkach. Tryby od najłatwiejszego: Połącz (dziecko rozpoznaje godzinę wśród podanych), Odczytaj (przypomina ją sobie i wpisuje), Dorysuj (musi wiedzieć, gdzie stoi wskazówka godzinowa, i odróżnić długość wskazówek). Na Poziomie 2 dziecko zwykle myli się na wskazówce godzinowej przy wpół do, bo stoi między liczbami; jeśli wydruk pokaże, że to za trudne, wpół do może przejść bliżej kwadransów. Od Poziomu 2 co najmniej połowa tarcz na karcie ma minuty nowe dla poziomu (Poziom 2 :30, Poziom 3 :15 i :45, Poziom 4 wielokrotności 5 poza kwadransami, Poziom 5 minuty niepodzielne przez 5), żeby karta wyższego poziomu nie wyszła z samych łatwiejszych godzin (decyzja 2026-11-16, po makiecie).

„24 h”: osobny przełącznik, niezależny od poziomu i trybu, domyślnie wyłączony. Wyłączony: godziny 1:00–12:59 (12:30, nie 0:30). Włączony: godziny z całej doby, zapis 0:00–23:59, a pod każdą tarczą słowami pora dnia: „rano” 5:00–11:59, „po południu” 12:00–17:59, „wieczorem” 18:00–21:59, „w nocy” 22:00–4:59. Generator nie losuje godzin w pierwszej i ostatniej godzinie pory dnia (np. 12:xx, 17:xx), żeby granica pory nie budziła sporu („w południe” czy „po południu”). Nie losuje też godzin po północy (0:00–0:59), bo dziecko łatwo wpisze 12:30 albo 24:30 zamiast 0:30; „w nocy” daje więc 23:xx i 1:00–3:59 (decyzja 2026-11-16, po makiecie). Pora dnia jest słowem, nie ikoną, bo słońce i księżyc są dwuznaczne, a 24 h jest dla dzieci, które czytają (klasy 2–3) (decyzja 2026-11-15). Granice pór potwierdził wydruk 2026-11-16 i zostają bez zmian.

Reguły, które generator sprawdza: każda godzina ma minuty z poziomu; od Poziomu 2 co najmniej połowa tarcz ma minuty nowe dla poziomu; godziny na jednej karcie się nie powtarzają (przy wyłączonym 24 h 7:30 i 19:30 to ta sama godzina); w trybie Połącz kolejność zegarów cyfrowych różni się od kolejności tarcz i żaden zegar cyfrowy nie stoi na wysokości swojej tarczy; przy 24 h żadna godzina nie leży w godzinie granicznej pory dnia ani po północy (0:xx); kąty wskazówek wynikają z godziny; tarcze mieszczą się na A4 z marginesem 10 mm. Karta, która łamie którąś z tych reguł, nie jest pokazana. Zmiana poziomu, trybu albo „24 h” przy pokazanej karcie od razu układa nową kartę. Każde Generuj daje inne godziny albo inną kolejność niż poprzednia karta. Wartości potwierdził wydruk 2026-11-16 w Safari, Chrome iOS i Brave iOS oraz próba z dzieckiem: liczby i wskazówki są czytelne, godzina mieści się w kratkach, a wskazówki da się dorysować; wartości startowe zostają bez zmian. Wynikiem jest karta A4; tarcze zajmują większą część strony i zachowują margines co najmniej 10 mm.

### Karta kodowania

Dodane 2026-11-17 (M-7, S-42); kształt karty ustaliła użytkowniczka na makiecie (`context/changes/coding-card/mockup.mts`, `frame.md`). Aplikacja zawsze tworzy kartę z jedną odpowiedzią. Kartka to pionowy prostokąt A4 z jednym zdaniem polecenia i kratką pod nim, a pod kratką rzędem pól ze strzałkami; blok kratki i pól jest wyśrodkowany w obszarze pod poleceniem. Poziom wyznacza kratkę, długość drogi, zakręty, przeszkody, zapis i liczbę pól przykładu; tryb wyznacza, co robi dziecko. Karta nie ma kolorów, kategorii ani „Pokaż rozwiązanie”.

Kratka: pola wolne (białe) i przeszkody (szare pola, decyzja 2026-11-17: kreskowanie odpadło). W polu startu stoi wybrana postać (ten sam obrazek co przy poleceniu, także własny obrazek rodzica); przy „Brak” start to kółko z napisem „Start”. Krok to przejście o jedno pole w prawo, w lewo, w górę albo w dół, bez skosów, bez wchodzenia na przeszkodę i poza kratkę. Strzałki są bezwzględne (→ ← ↑ ↓), jak w dyktandzie graficznym; „obróć się w lewo” nie występuje. Strzałki są rysowane kreską, nie znakiem czcionki, żeby telefon i drukarka rysowały je tak samo.

| Tryb              | Co jest na kartce                                                                                             | Co robi dziecko                                             | Polecenie (startowe)                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Zapisz (domyślny) | postać na starcie, meta (flaga w szachownicę), pod kratką puste pola; pierwsze pola wpisane szarym (przykład) | zapisuje strzałkami drogę postaci do mety                   | „Zapisz strzałkami drogę do mety. Jedna strzałka to jeden krok.” (Poziom 4: „Zapisz drogę do mety. Liczba kratek i strzałka.”) |
| Wykonaj           | postać na starcie, trzy obrazki (gwiazdka, serce, koło), pod kratką podane strzałki                           | idzie za strzałkami i zakreśla obrazek, na którym skończyło | „Idź za strzałkami. Zakreśl, dokąd dojdziesz.”                                                                                 |

Tryb wybiera się na pasku z listy, tak jak w zegarze: przycisk „Tryb: Zapisz” otwiera listę dwóch trybów, a każdy wiersz ma nazwę i pół zdania o tym, co robi dziecko. Tryb nie zależy od poziomu (decyzja 2026-11-17). Domyślny tryb Zapisz jest propozycją (Open Questions 18).

| Poziom   | Kratka | Bok pola (około) | Przeszkody (około) | Kroków drogi | Zakrętów (co najmniej) | Zapis                            | Pola przykładu (Zapisz) | Opis w UI (startowy)          |
| -------- | ------ | ---------------- | ------------------ | ------------ | ---------------------- | -------------------------------- | ----------------------- | ----------------------------- |
| Poziom 1 | 5×5    | 34 mm            | 24% pól            | 6–8          | 1                      | jedna strzałka na krok           | 1                       | „kratka 5×5, krótka droga”    |
| Poziom 2 | 6×6    | 29 mm            | 26% pól            | 9–12         | 2                      | jedna strzałka na krok           | 1                       | „kratka 6×6, dłuższa droga”   |
| Poziom 3 | 8×8    | 22 mm            | 28% pól            | 13–17        | 3                      | jedna strzałka na krok           | 2                       | „kratka 8×8, więcej zakrętów” |
| Poziom 4 | 10×10  | 18 mm            | 30% pól            | 18–24        | 4                      | „3 →” (liczba kratek i strzałka) | 2                       | „kratka 10×10, zapis „3 →””   |

Domyślny jest Poziom 1. Poziomy to numery bez wieku i bez wieku pod opisem. Na Poziomie 4 kolejne kroki w tym samym kierunku łączą się w jedno polecenie „liczba kratek i strzałka”, jak w dyktandzie, więc droga 24 kroków to ok. 9 pól zamiast 24. Długość drogi wydłużyła użytkowniczka po pierwszej makiecie (2026-11-17: było 4–6, 6–9, 9–13, 13–18). Pola przykładu (pomysł użytkowniczki 2026-11-17) to pierwsze kroki odpowiedzi wpisane szarym, bledsze niż druk, jak podpowiedź przy osi w symetrii; pokazują, jak się zapisuje strzałki (na Poziomie 4 np. „1 →”, „2 ↑”), a dziecko pisze dalej. W trybie Wykonaj pól przykładu nie ma, bo strzałki są podane.

Zapisz — jedna najkrótsza droga: generator losuje przeszkody, start i metę i liczy wyszukiwaniem wszerz (BFS) odległość i liczbę najkrótszych dróg od startu do każdego pola; kratka jest dobra, gdy do mety prowadzi dokładnie jedna najkrótsza droga, jej długość i liczba zakrętów mieszczą się w poziomie. Pól na strzałki jest dokładnie tyle, ile kroków tej drogi (na Poziomie 4 tyle, ile poleceń „n →”): dłuższa droga się w nich nie mieści, a każda droga tej długości to ta jedna, więc słowo „najkrótsza” w poleceniu nie jest potrzebne. Inne, dłuższe drogi do mety mogą istnieć. Wyszukiwanie drogi labiryntu (`countPaths` w `src/lib/maze/generate.ts`) liczy drogi między ścianami komórek, a nie po polach z przeszkodami, więc karta ma własne, krótkie wyszukiwanie. Makieta: na 300 kart Poziom 1 potrzebował średnio 47 losowań kratki (ok. 2 ms na kartę), Poziom 4 średnio ok. 2400 (ok. 0,2 s); plan może celować metą w daleki punkt, żeby losowań było mniej.

Wykonaj — jedna kratka końcowa: droga ze strzałek jest losowana po wolnych polach, bez wracania na to samo pole (dziecko nie gubi się na skrzyżowaniu własnej drogi), z długością i liczbą zakrętów poziomu; nie musi być najkrótsza. Kończy się na jednym z trzech obrazków; dwa pozostałe stoją blisko końca drogi (do 3 kroków), ale nie na niej, żeby dziecko nie zatrzymało się za wcześnie. Który obrazek jest celem, losuje się z kartą.

Reguły, które generator sprawdza: start, meta i obrazki leżą na wolnych polach; droga odpowiedzi nie wchodzi na przeszkodę ani poza kratkę i nie wraca na to samo pole; w Zapisz najkrótsza droga do mety jest dokładnie jedna, ma długość i liczbę zakrętów poziomu, a liczba pól równa się liczbie kroków (Poziom 4: liczbie poleceń); w Wykonaj droga kończy się na obrazku-celu, a pozostałe obrazki nie leżą na drodze; kratka i pola mieszczą się na A4 z marginesem 10 mm. Karta, która łamie którąś z tych reguł, nie jest pokazana. Zmiana poziomu albo trybu przy pokazanej karcie od razu układa nową kartę. Każde Generuj daje inną kratkę albo inną drogę niż poprzednia karta. Wartości są startowe i zostają potwierdzone na wydruku (Open Questions 18). Wynikiem jest karta A4; kratka i pola zajmują większą część strony i zachowują margines co najmniej 10 mm.

### Poziomy

Ustalone 2026-10-26: żadna karta nie nazywa poziomów wiekiem. Karty z trzema poziomami mają łatwy / średni / trudny (nonogram, dyktando graficzne; sudoku ma dodatkowo osobny wybór rozmiaru). Karty z większą liczbą poziomów mają własną skalę „Poziom 1…N”, od najłatwiejszego: labirynt 1–6, symetria 1–4, sekwencje 1–4, szlaczki 1–4, krzyżówka matematyczna 1–7 (od M-6, 2026-11-13, S-40; bez wieku pod opisem), zegar 1–5 (od 2026-11-15; bez wieku pod opisem), kodowanie 1–4 (od M-7, 2026-11-17, S-42; bez wieku pod opisem). Od M-5 łatwy / średni / trudny mają też „Kto ma więcej?”, „Który nie pasuje” i „Skopiuj obrazek”; żadna z czterech nowych kart nie ma wieku pod opisem. Numery i nazwy nie są porównywalne między kartami.

Każdy wiersz listy poziomów ma nazwę, pół zdania o tym, co zmienia poziom, i, przy labiryncie, symetrii, sekwencjach i dyktandzie, typowy wiek pod opisem; wiersz ma trzy linie, np. „Poziom 1” / „duża kratka, podpowiedź przy osi” / „zwykle ok. 4 lata”. Sudoku i nonogram nie mają wieku. Zapisane identyfikatory poziomów mogą zostać w danych; zmienia się etykieta, więc zapisane profile i ostatnie parametry wczytują się bez migracji.

### Profil i zapamiętane ustawienia

Profil dziecka zawiera imię, ulubioną postać i ustawienia każdego rodzaju karty. Ustawienia karty to wszystko, co jest na pasku tej karty poza postacią i poza „Pokaż rozwiązanie”:

| Karta                  | Zapamiętane ustawienia                      |
| ---------------------- | ------------------------------------------- |
| Labirynt               | poziom                                      |
| Symetria               | poziom, kolory, kategoria                   |
| Sekwencje              | poziom, kolory                              |
| Sudoku                 | rozmiar, poziom, „Kształty / Cyfry”, kolory |
| Nonogram               | poziom, kategoria                           |
| Dyktando graficzne     | poziom, kategoria                           |
| Kto ma więcej?         | poziom, waluta, kolory                      |
| Który nie pasuje       | poziom, kolory                              |
| Skopiuj obrazek        | poziom, kolory, kategoria                   |
| Szlaczki               | poziom, linie                               |
| Krzyżówka matematyczna | poziom                                      |
| Zegar                  | poziom, tryb, 24 h                          |
| Kodowanie              | poziom, tryb                                |

Zasady:

- Ustawienia karty zmienia się tylko na pasku tej karty. Przy aktywnym profilu każda zmiana zapisuje się w profilu od razu, a komunikat „Zapamiętane dla {imię}” to potwierdza. Okno profilu pokazuje je tylko do odczytu.
- Karta, której profil jeszcze nie używał, startuje z ustawieniami domyślnymi tej karty (tymi samymi co przy pierwszej wizycie bez profilu).
- Ulubiona postać zmienia się tylko jawnie: w oknie profilu albo wyborem „Ustaw jako ulubioną” pod listą postaci. Inna postać wybrana na pasku przy aktywnym profilu obowiązuje do końca wizyty na tej stronie; przy następnym wejściu wraca ulubiona.
- Bez profilu urządzenie pamięta ostatnie ustawienia osobno dla każdej karty i jedną ostatnio użytą postać dla wszystkich kart.
- Profil nie przechowuje wieku. Wiek nie ustawia żadnego poziomu.
- Przy wybranym profilu miniatury katalogu pokazują zapamiętany poziom (sudoku: rozmiar i poziom, np. „6×6 · średni”).
- Podsumowanie zegara w oknie profilu to poziom i tryb, a przy włączonym 24 h także „24 h”, np. „Zegar: Poziom 2 · Odczytaj” albo „Zegar: Poziom 4 · Połącz · 24 h”. Tryb stoi zawsze, także domyślny, bo zmienia całe zadanie; plakietka w katalogu to sam poziom („poz. 4”) (decyzja 2026-11-16, S-41).
- Podsumowanie kodowania w oknie profilu to poziom i tryb, np. „Kodowanie: Poziom 2 · Zapisz”, jak w zegarze; plakietka w katalogu to sam poziom („poz. 2”) (propozycja 2026-11-17, S-42; kształt okna profilu przy 16 kartach przebudowuje S-52).
- „Pokaż rozwiązanie” w nonogramie, dyktandzie i krzyżówce matematycznej nie jest zapamiętywane i zawsze startuje wyłączone.
- Zgodność wstecz: dawne pole poziomu w profilu i w ostatnich parametrach zostaje poziomem labiryntu; dawna postać profilu zostaje ulubioną, a dawna postać ostatnich parametrów ostatnio użytą postacią.

### Postać na kartach

Na labiryncie postać stoi przy starcie. Na pozostałych kartach stoi przy zdaniu polecenia nad zadaniem, a polecenie jest w jej dymku. Postać to ten sam kolorowy obrazek z katalogu albo własny obrazek rodzica i drukuje się zawsze w kolorze. Przy wyborze „Brak” zostaje samo polecenie. Postać nie wpływa na zadanie, odpowiedź ani poziom; obiekty w symetrii, nonogramie i dyktandzie dalej pochodzą z katalogu szablonów.

Postać jako treść zadania (np. połowa sylwetki w symetrii, obrazek odkrywany w nonogramie albo dyktandzie) wymaga obrysów postaci na kratce i zostaje poza zakresem (Po MVP).

## Access Control

Jeden lokalny użytkownik-rodzic; bez logowania i bez podziału na role. Ustawienia pozostają na urządzeniu.

Rodzic może korzystać z generatora bez tworzenia profilu dziecka. Opcjonalne nazwane profile dzieci przechowują ulubioną postać i ustawienia każdego rodzaju karty osobno, aby skrócić kolejne generowanie. Dzieci nie mają kont ani dostępu do aplikacji.

Wygenerowane karty nie są zapisywane; ich cykl życia kończy się po wydruku.

## Non-Goals

- Kolejne rodzaje kart wchodzą jako osobne kamienie, po jednym naraz, a nie razem z labiryntem. Pierwszym po labiryncie jest symetria (US-05–US-09, FR-014–FR-018). Drugi kamień kart (2026-10-23) bierze dwa rodzaje naraz, wyjątkowo, na prośbę użytkownika: sekwencje i sudoku (US-10–US-14, FR-019–FR-023). Do tego samego kamienia dochodzą 2026-10-25, także na prośbę użytkownika, nonogram i dyktando graficzne (US-15–US-18, FR-024–FR-027) oraz nowe obiekty w katalogu szablonów z wyborem kategorii (US-19–US-20, FR-028–FR-029). Czwarty kamień kart (M-5, 2026-11-01) bierze cztery rodzaje naraz, wyjątkowo, na prośbę użytkowniczki: „Kto ma więcej?”, „Który nie pasuje”, „Skopiuj obrazek” i szlaczki (US-23–US-30, FR-033–FR-040). Rodzaje z listy „Po MVP” zostają poza zakresem, dopóki ich kamień nie jest otwarty.
- Kamień M-6 (2026-11-13) zaczyna się od jednej karty: krzyżówki matematycznej (US-31–US-32, FR-041–FR-042; S-40). Nie obejmuje osobnej kontrolki liczby pustych pól, wieku pod opisem poziomu, działań z więcej niż jednym znakiem (np. „a + b − c = d”) ani kolejności wykonywania działań, ramki „Użyj:” z brakującymi liczbami, kolorów, kategorii i obrazków na karcie.
- Druga karta M-6 (2026-11-15) to „Zegar” (US-33–US-34, FR-043–FR-044; slot S-41). Nie obejmuje tarczy bez liczb ani z samymi 12, 3, 6, 9, zapisu słownego godziny („wpół do ósmej”), wskazówki sekundowej, obliczeń zegarowych („która będzie za 20 minut?”), „Pokaż rozwiązanie”, kolorów ani kategorii. Karty kodowania (slot S-42) przeszły do M-7 (zawężenie M-6 2026-11-16).
- Pierwsza karta M-7 (2026-11-17) to karta kodowania (US-35–US-36, FR-045–FR-046; S-42). Nie obejmuje strzałek względnych („obróć się w lewo”), pętli i powtórzeń („3 × →” jako osobnej instrukcji), kroków po skosie, wielu postaci ani zbierania przedmiotów po drodze, kolorów, kategorii ani „Pokaż rozwiązanie”.
- Kamień M-5 nie obejmuje groszy i centów, banknotu 200 €, monet dolarowych, cen i reszty w „Kto ma więcej?”, kwoty „ułóż dokładnie tę kwotę” ani oceny rysunku dziecka na kartach „Skopiuj obrazek” i szlaczki (decyzja 2026-11-01).
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

„Kto ma więcej?” (dawniej „Porównywanie kwot w złotych”), „Który nie pasuje”, „Skopiuj obrazek” i szlaczki przeszły z tej listy do zakresu (2026-11-01, M-5): US-23–US-30, FR-033–FR-040, Business Logic „Karta „Kto ma więcej?””, „Karta „Który nie pasuje””, „Karta „Skopiuj obrazek”” i „Karta szlaczków”. „Skopiuj obrazek” i szlaczki nie były na tej liście.

„Zegar” nie był na tej liście; wszedł do zakresu 2026-11-15 (M-6): US-33–US-34, FR-043–FR-044, Business Logic „Karta „Zegar””. Jako następną kartę M-6 użytkowniczka wybrała 2026-11-15 karty kodowania.

Karty kodowania przeszły z tej listy do zakresu (2026-11-17, M-7, S-42): US-35–US-36, FR-045–FR-046, Business Logic „Karta kodowania”. Nie korzystają z wyszukiwania drogi labiryntu (inna kratka), tylko z własnego.

Pozostałe typy nie mają kolejności. Następny typ dostaje US i FR dopiero przy otwarciu jego kamienia.

- **Obrysy postaci na kratce.** Wspólny warunek kilku pozycji poniżej: każda postać z katalogu narysowana na kratce (bitmapa i jedna zamknięta linia obrysu), zapisana w kodzie jak szablony obiektów. Makieta z 2026-10-26: wszystkie 11 postaci da się narysować na kratce ok. 15×15 z detalami jako pustymi kratkami (oczy, okna, pas strażaka), a obrys każdej to jedna zamknięta linia. Pies i kot oraz dinozaur i smok wymagają wyraźniejszych różnic (uszy, wąsy, skrzydło). Własny obrazek rodzica nie ma obrysu.
- **Rysunki wektorowe do kart obrazkowych.** Wspólny warunek „Połącz kropki” i „Znajdź różnice” (decyzja 2026-11-15 po makietach): pikselowe sylwetki z katalogu szablonów są za kanciaste, bo obrys z kratki ma same kąty proste, a różnica w jednej kratce to plama, nie szczegół rysunku. Potrzebny jest osobny katalog prostych rysunków wektorowych, jak ikony kategorii w „Który nie pasuje” (GitHub 265), albo obrysy postaci.
- **Połącz kropki.** Ponumerowane kropki na obrysie rysunku; dziecko łączy je po kolei i odkrywa obiekt. Poziomy: liczba kropek (do 10, 20, 50), liczenie co 2 albo wstecz. Odpowiedź jest jedna, bo kolejność numerów wyznacza linię. Czeka na rysunki wektorowe albo obrysy postaci.
- **Znajdź różnice.** Dwa takie same rysunki obok siebie, różniące się w kilku szczegółach; dziecko zakreśla różnice. Poziom wyznacza liczba i wielkość różnic; różnice się nie stykają, żeby dwie nie wyglądały jak jedna. Czeka na rysunki wektorowe.
- **Nonogram i dyktando postaci.** Po rozwiązaniu widać postać zamiast obiektu z szablonów. Czeka na obrysy postaci. Nonogram i dyktando z obiektami z szablonów są już w zakresie (FR-024, FR-026). Z makiety: pełna postać w dyktandzie to 32–64 polecenia, więc pasuje do poziomu trudnego; łatwy potrzebuje prostszych obrysów.
- **Pieniądze, ciąg dalszy.** Jedna kupka i cena („czy wystarczy?”), grosze, reszta. „Ułóż dokładnie tę kwotę” czeka na regułę, która zostawia jeden układ. Wymaga pierwszej wersji „Kto ma więcej?” (M-5).

Poza tą listą zostają kolorowanki oraz działania na liczbach z dopiskiem waluty.

## Open Questions

1. **Insight — czemu gotowe paczki PDF nie rozwiązują tego poza skończoną biblioteką?** — TBD by user. Block: no (pain and missing capability are captured; the second vision paragraph is incomplete until this lands).
2. ~~**Ile komórek głębokości odróżnia płytką ślepą uliczkę od głębokiej?**~~ — Zamknięte 2026-10-16 jako nieaktualne: poziom wyznacza sposób losowania, nie próg głębokości odnogi (`random-maze-generator`).
3. ~~**Jakie jest źródło dostarczonych postaci i jakie prawa pozwalają użyć ich w produkcie?**~~ — Zamknięte 2026-11-17 (decyzja użytkowniczki): wszystkie rysunki postaci wygenerowała sama innym AI, z zastrzeżeniem, żeby nie przypominały obiektów z reklam, i ma do nich prawa; dotyczy to też kolejnych postaci sezonowych. Wcześniej: Owner: user. Block: yes before publishing the character-selection feature. Pierwszy nazwany zestaw (2026-10-04): samochodzik, rakieta, dinozaur, rysowane z pomocą AI. Katalog na 2026-10-10 dokłada jednorożca, kota, psa, robota, smoka, strażaka, syrenkę i wróżkę. Planowanie FR-012 nie czeka na prawa; publikacja szerszego katalogu czeka. Dopisek 2026-11-15 (GitHub 370): Mikołaj, renifer i bałwanek to ogólne postacie narysowane z pomocą AI przez użytkowniczkę, która ma do nich prawa; renifer ma ciemny nos (nie czerwony), żeby nie przypominał Rudolfa, a Mikołaj nie jest maskotką żadnej marki.
4. ~~**Czy poziom nastolatka ma pokazywać postać?**~~ — Zamknięte 2026-10-25: na nastolatku wybrana postać stoi nad narożnym startem, lewą krawędzią równo z lewą krawędzią labiryntu, a pas nad znakiem równa się pasowi pod „Meta”; młodsze poziomy zostają ze znakiem na środku wejścia (`teen-level-character-choice`).
5. **Czy startowe wartości poziomów symetrii (kratka, siatka, obiekty, podpowiedź) pasują dziecku?** — Owner: user. Block: no. Tabela w Business Logic jest propozycją z 2026-10-22, przebudowaną 2026-10-23 (obiekty zamiast gęstości plamy); potwierdza ją wydruk w kamieniu poziomów (S-13), nie planowanie. Połowa siatki 8×12 ma 4 kratki szerokości: rozstrzygnięte 2026-10-23 po makiecie, poziom 4 lat ma własne, prostsze warianty obiektów, a poziom 7 lat bogatsze. Oś pozioma i odsunięcie od osi wycofane z poziomów. Czeka na wydruk w S-13 (faza 4).
6. **Czy karta symetrii ma kiedyś używać postaci jako wzoru (np. połowa sylwetki)?** — Owner: user. Block: no. Częściowo rozstrzygnięte 2026-10-26: postać stoi przy poleceniu na każdej karcie (US-21). Postać jako wzór na kratce zależy od obrysów postaci (Po MVP), jak „Połącz kropki”. Szablony obiektów karty symetrii (2026-10-23) to osobny katalog i nie czekają na tę decyzję.
7. **Ile szablonów obiektów i jakich wariantów wystarczy, żeby kolejne karty się nie powtarzały?** — Owner: team. Block: no. Ustalone 2026-10-23: obiekty zamiast przypadkowych plam. Gotowa lista szablonów to skończona biblioteka, czyli problem z wizji produktu; warianty części mają go zmiękczyć. Otwarte: czy starszy poziom ma też dostawać ornamenty budowane z reguł (np. romby, pierścienie), które dają się generować bez końca.
8. ~~**Czy dziecko przedszkolne uzupełni sudoku obrazkowe numerem z legendy, czy narysuje postać?**~~ — Zamknięte 2026-10-24: sudoku nie używa postaci ani legendy numerów; dziecko rysuje proste kształty albo wpisuje cyfry. Pytanie 3 o prawa do postaci sudoku już nie dotyczy.
9. **Czy startowe wartości poziomów sekwencji i sudoku (długość ciągu, reguły, liczba pustych pól) pasują dziecku?** — Owner: user. Block: no. Tabele w Business Logic są propozycją z 2026-10-23 (sudoku przebudowane 2026-10-24); potwierdza je wydruk, nie planowanie. Użytkowniczka nie jest pewna, czy 6×6 (12/18/22 pustych) i 9×9 (35/45/52 pustych) nie są za trudne dla dzieci. Wartości poziomów sekwencji potwierdził wydruk z 2026-10-24 (S-17); sudoku zostaje otwarte do wydruku S-19. Wydruk z 2026-10-24 nie obowiązuje już dla mieszanki +1 i +2 na Poziomie 3.
10. ~~**Kiedy wraca profil z wiekiem i poziomami osobno dla każdego rodzaju karty (US-08, FR-017)?**~~ — Zamknięte 2026-10-26: profil wraca bez wieku. Pamięta sam ustawienia każdej karty z paska, pokazuje je w katalogu i w oknie profilu tylko do odczytu, a ulubiona postać zmienia się jawnie (US-08, FR-009, FR-017).
11. **Czy startowe wartości nonogramu i dyktanda graficznego (siatka, kratka, obiekty) pasują dziecku, i czy każda kategoria w każdym rozmiarze zostawia dość obiektów z jednym rozwiązaniem nonogramu i obrysem bez dotknięć?** — Owner: user (wartości), team (liczba obiektów). Block: no. Tabele w Business Logic są propozycją z 2026-10-25; potwierdza je wydruk. Liczbę obiektów, które przechodzą reguły dyktanda, pokazała implementacja (2026-10-25, z trzema dzisiejszymi obiektami): 5 lat 18 z 20 wariantów i 9 różnych obrysów (20–28 poleceń), 6 lat 18 z 20 i 9 (24–44), 7 lat 32 z 40 i 14 (36–76). Nonogram (S-22, 2026-10-25, przed rozszerzeniem katalogu): wszystkie dzisiejsze warianty miały jedno rozwiązanie bez zgadywania — 20 z 20 w 8×12, 20 z 20 w 12×15 i 40 z 40 w 18×24. Nonogram po poziomach (S-24, 2026-10-25, po rozszerzeniu katalogu do 22 obiektów): poziom łatwy 116 z 116 wariantów spełnia reguły znaczków; średni 119 z 124 i trudny 184 z 216 wariantów ma jedno rozwiązanie bez zgadywania, a w trudnym `kot` i `tulipan` nie mają żadnego takiego wariantu, więc generator ich tam nie pokazuje; Generuj trwa do 8 ms, sprawdzenie wszystkich wariantów trudnego do 3 s. Test pilnuje, by każdy obiekt średniego poziomu miał co najmniej jeden taki wariant. Czy znaczki 9,5 mm (łatwy) i kratka 7 mm (trudny) są dość duże dla dziecka, potwierdza wydruk. Liczby po wyborze kategorii (S-26, 2026-10-25, stan katalogu z tego dnia): w każdej z pięciu kategorii zostają co najmniej 3 obiekty i co najmniej 8 różnych obrysów dyktanda na każdym poziomie, a nonogram ma co najmniej 16 wariantów z jednym rozwiązaniem na każdym rozmiarze. Najcieńsze miejsca to Przyroda w dużym nonogramie (3 obiekty, 24 warianty) i Domy i budowle w dyktandzie 6 lat (8 obrysów z 16 wariantów). Żadna kombinacja nie zostaje z jednym obrysem ani z zerem, więc kategoria nie wymaga komunikatu ani wyłączenia; test pilnuje co najmniej dwóch kart w każdej kombinacji, bez pinowania liczb. Kategoria „Kształty” (GitHub 198, 2026-10-31, katalog 34 obiekty): każdy z ośmiu obiektów ma co najmniej jeden poprawny wariant w każdym rozmiarze; łatwy nonogram 25 z 25 wariantów, średni 32 z 32 i trudny 64 z 64 ma jedno rozwiązanie bez zgadywania, a dyktando daje po 8 różnych obrysów na poziom (dziury w figurach nie zmieniają obrysu, więc kolejne karty dyktanda w tej kategorii powtarzają się szybciej niż w innych). Chmurka jest rysowana ręcznie, gwiazda w połowie 4×12 też. Po GitHub 124 (2026-10-30, katalog 26 obiektów, trzeci wariant części siedmiu obiektów): łatwy nonogram 156 z 156 wariantów, średni 164 z 172, trudny 248 z 292 mają jedno rozwiązanie bez zgadywania; `kot` i `tulipan` mają już działające warianty w trudnym, więc test pilnuje teraz każdego obiektu trudnego poziomu, bez wyjątków. Sprawdzenie wszystkich wariantów trudnego trwało 1,5–6,7 s zależnie od obciążenia maszyny, a próg testu to 15 s. W dyktandzie najmniej różnych obrysów z siedmiu obiektów mają teraz `truskawka` (2 na 5 i 6 lat) i `latarnia` (2 na 5 lat), wcześniej po 1. Boże Narodzenie (GitHub 369, 2026-11-14, katalog 40 obiektów; pomiar w `context/changes/christmas-objects/mockup-measure.txt`): sześć nowych obiektów ma w nonogramie łatwym wszystkie kombinacje z jednym rozwiązaniem (od 4 z 4 do 24 z 24), w średnim i trudnym co najmniej jedną; najcieńsze są aniołek (średni 6 z 12, trudny 12 z 24) i piernik (4 kombinacje na łatwym). W dyktandzie nowe obiekty dają od 2 (bombka, prezent) do 12 (aniołek) różnych obrysów na poziom, a pięć kształtów przechodzi obrys, także odbity, na każdym narysowanym poziomie (16–52 polecenia, limit 55 i 84). Znany kompromis: w czerni prezent ma 2–3 różne sylwetki, a bombki z gładką kulą zlewają się; ocenia je wydruk na stagingu (faza 5 planu `christmas-objects`).
12. ~~**Czy lista poziomów ma obok opisu pokazywać typowy wiek (np. „Poziom 3 · zwykle ok. 5 lat”)?**~~ — Zamknięte 2026-10-26: tak, pod opisem, w trzeciej linii wiersza, tylko przy labiryncie, symetrii, sekwencjach i dyktandzie (kartach z dawną nazwą wiekową); sudoku i nonogram bez wieku. Wiek pomaga przy pierwszym wyborze, ale nie jest nazwą poziomu ani etykietą na pasku, żeby nie oceniać nim dziecka (US-22, FR-001).
13. ~~**Czy układ i kratka „Skopiuj obrazek” mieszczą się na A4 (dwie kratki obok siebie), i czy kratka 5 mm na trudnym poziomie jest dość duża dla dziecka?**~~ — Zamknięte 2026-11-09 po makiecie (S-35): dwie kratki obok siebie mieszczą się w marginesie 10 mm na każdym poziomie (kratki 10 / 7 / 5 mm), kratki nie dostają numerów wierszy i kolumn, a sylwetka jest wyśrodkowana w pionie. Czytelność 5 mm na papierze potwierdza wydruk w fazie 3 planu `copy-the-drawing-card`; jeśli jest za mało, trudny wraca do planu z siatką 12×15. Dopisek 2026-11-13 (GitHub 363): karta nadal wypełniała wyraźnie mniej wysokości strony niż nonogram tej samej siatki (43–49% vs 61%+), bo dwie kratki obok siebie są ograniczone szerokością strony (190 mm), nie wysokością. Łatwy i średni podniesione do granicy szerokości (10→11 mm, 7→7,5 mm); trudny zostaje na 5 mm, już na granicy. Stos (jedna kratka nad drugą) sprawdzony ponownie makietą i odrzucony: zmniejsza kratkę na dwóch z trzech poziomów (np. trudny 4,85 mm) i zostawia duży, pusty odstęp między kratkami. Pełna zgodność z wypełnieniem nonogramu wymagałaby mniejszej siatki niż istniejący najmniejszy szablon (4×12), czyli nowego katalogu obiektów tylko dla tej karty — nieproporcjonalne do kosmetycznej różnicy; nie podjęte. Przy okazji, na życzenie użytkowniczki po wizualnym porównaniu z sudoku: blok polecenia i kratek najpierw wrócił do wyśrodkowania w pionie jak na sudoku/nonogramie (to, co PR #362 chwilowo zastąpił przypięciem do górnego marginesu), ale próba pokazała, że ten sam wzór wyśrodkowania sadowi tę kartę głębiej niż sudoku i nonogram (ok. 90 mm zamiast ich 46–56 mm), bo jej siatka jest niższa od ich — czyli odtwarza dokładnie „zaczyna się w połowie strony”, ten sam problem co przed PR #362. Ostatecznie blok dostał stały odstęp od górnego marginesu (`COPY_DRAWING_SHEET.topOffset`), skalibrowany na dokładnie `layoutSudokuSheet`'s `instruction.top` domyślnego sudoku (4×4, bez postaci): 56 mm od góry strony, czyli 46 mm ponad 10 mm marginesem — niżej niż w pełni przypięte karty (labirynt, sekwencje, „Kto ma więcej?”…), dokładnie na wysokości sudoku, bez odtwarzania ani starego, ani nowego problemu.
14. **Czy poziomy „Kto ma więcej?” (nominały do 100 w trzech walutach, sumy do 10, 20 i 200, liczba sztuk myli) i „Który nie pasuje” (reguły, liczba obrazków w rzędzie) pasują dziecku, i czy wygląd monety i banknotu jest czytelny na czarnym druku i w kolorze, bez kopiowania wzorów NBP?** — Owner: user. Block: nie. Tabele w Business Logic są propozycją z 2026-11-01; potwierdza je wydruk. Otwarte: czy dziecko 6 lat radzi sobie z małymi kupkami mieszanych monet na poziomie łatwym (sumy do 10 zł, najwyżej 5 sztuk, bez mylących rzędów; decyzja 2026-11-01, wcześniej jeden nominał w rzędzie). Prawa do wyglądu pieniędzy: użytkowniczka sprawdziła (2026-11-01), że wizerunek można pokazać na karcie edukacyjnej, o ile reprodukcja nie może uchodzić za prawdziwy pieniądz; rysunki są więc uproszczone (czarna wersja: moneta to koło, banknot to prostokąt z nominałem, bez zabezpieczeń i godeł). Kolorowa wersja (GitHub #270, 2026-11-08) używa obrazków, które użytkowniczka sama przygotowała; są stylizowane, mają orła i profil władcy, ale nie mają zabezpieczeń, więc dalej nie uchodzą za prawdziwy pieniądz; autorstwo i prawa do obrazków ma użytkowniczka. To zmienia wcześniejsze „bez godeł” dla wersji kolorowej. Czytelność nominału na czarnym druku potwierdził wydruk makiety (2026-11-01). Czytelność obrazków w rozmiarze karty (moneta 11 mm, banknot 18 × 9 mm) na wydruku w kolorze i w czerni z bielą potwierdziła użytkowniczka (2026-11-08). Do potwierdzenia przez użytkowniczkę, bo to propozycje, a nie jej decyzje: remis najwyżej w jednym rzędzie karty i pięć rzędów na karcie (jej decyzja z 2026-11-01 to tylko „remis jest dozwolony”). „Który nie pasuje” (GitHub 265, decyzja 2026-11-08): makiety zatwierdziła użytkowniczka, ale wartości (rozpraszacze, mały obrazek 0,5 / 0,55 / 0,72 dużego, grupy w regule liczby, czytelność ikon kategorii i małych grup na A4) są startowe i potwierdza je wydruk po S-34. Obrazki euro i dolara (GitHub 324, 2026-11-09) wycięła z makiet użytkowniczki; makieta euro ma stylizowaną architekturę bez portretów, a makieta dolara portrety, napis „THE UNITED STATES OF AMERICA” i pieczęć Skarbu, czyli bliżej prawdziwych wzorów; wdrożone na jej polecenie, a ocenę, czy wolno je pokazać na karcie edukacyjnej, ma ona (w razie wątpliwości obrazki `*usd.png` do usunięcia lub uproszczenia przed merge). Dolar nie ma monet (decyzja 2026-11-09: moneta 1 $ jest rzadka, więc jest banknot 1 $), więc każdy kawałek dolara ma cyfrę. Lista na koniec M-5: GitHub drpc1/printo-kids#263.
15. ~~**Czy szlaczki z kropkami (Poziomy 1–2) i z kontynuacją wzoru (Poziomy 3–4) są czytelne na zwykłej drukarce domowej i dla dziecka?**~~ — Owner: user. Block: nie. Tabela w Business Logic jest propozycją z 2026-11-01, przebudowaną 2026-11-09 po makietach (`context/changes/pattern-lines-card/`); potwierdza ją wydruk i próba z dzieckiem, które odbywają się po scaleniu i nie blokują dostarczenia karty ani zamknięcia S-36 (decyzja 2026-11-10). Zamknięte 2026-11-10: użytkowniczka wydrukowała karty i sprawdziła je z dzieckiem; kropki, jasnoszara ścieżka, linia 0,6 mm i liniatura są czytelne, a startowe wartości poziomów zostają bez zmian.
16. **Jak długo trwa M-5 (cztery karty naraz)?** — Owner: user. Block: nie. Roadmapa sekwencjonuje bez dat; `delivery_weeks` nie jest ustalone.
17. ~~**Czy startowe wartości poziomów krzyżówki matematycznej (liczba działań, kratka, puste pola, łańcuch) pasują dziecku?**~~ — Zamknięte 2026-11-14 po wydruku użytkowniczki: wszystkie poziomy (1–7) wychodzą na jednej stronie A4, cyfry mieszczą się w kratkach także na Poziomie 7 (13,5 mm), liczby da się wpisać w kratki na Poziomach 1–2, a zakreskowanie jest widoczne; startowe wartości poziomów zostają bez zmian. Na telefonie (Brave, Chrome, Safari) wydruk wykazał jeszcze liczby niewycentrowane w kratce; poprawione w GitHub 371 (jawne przesunięcie linii bazowej zamiast `dominant-baseline`). Wcześniej: Owner: user. Block: nie. Tabela w Business Logic „Karta krzyżówki matematycznej” jest propozycją z 2026-11-13 (S-40), zaakceptowaną po makietach; potwierdza ją wydruk w fazie 4 planu `math-crossword-card`: czy cyfry mieszczą się w kratce 13,5 mm na Poziomie 7, czy dziecko daje radę wpisać liczby w kratki 26 i 24 mm na Poziomach 1–2 i czy łańcuch 3–4 na Poziomach 4–7 nie jest za trudny.
18. **Czy startowe wartości karty kodowania (kratka, bok pola, długość drogi, przeszkody, pola przykładu) pasują dziecku, i czy domyślny tryb Zapisz oraz brak „Pokaż rozwiązanie” są dobre?** — Owner: user. Block: nie. Tabela w Business Logic „Karta kodowania” jest propozycją z 2026-11-17 (S-42), przyjętą po makiecie (`context/changes/coding-card/`); potwierdza ją wydruk: czy strzałka mieści się w polu 16 mm na Poziomach 3–4, czy szare pola przykładu nie mylą się z przeszkodami (ten sam odcień w makiecie; może trzeba jaśniejszego) i czy droga 18–24 kroków na Poziomie 4 nie jest za długa. Domyślny tryb Zapisz i brak „Pokaż rozwiązanie” (jak w zegarze: odpowiedź da się sprawdzić, prowadząc palcem po strzałkach) to propozycje sesji, nie decyzje użytkowniczki.
