---
project: PrintoKids
version: 2
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

- Rodzic może wybrać ulubioną postać dziecka do labiryntu.
- Rodzic może wybrać dowolną postać z katalogu jedenastu dostarczonych postaci.
- Rodzic może na telefonie wygenerować kartę i wydrukować ją jako jedną stronę A4.
- Rodzic może wybrać rodzaj karty w katalogu z miniaturami na stronie głównej i wejść na stronę generatora tego rodzaju.
- Rodzic może wygenerować kartę symetrii, na której dziecko dorysowuje drugą połowę obiektu (np. rakiety, robota, truskawki) na kratce, zobaczyć jej podgląd i wydrukować ją jako jedną stronę A4, także z telefonu.
- Rodzic może wybrać poziom karty symetrii (rozmiar kratki, katalog obiektów, podpowiedź).
- Rodzic może niezależnie od poziomu włączyć kolory na karcie symetrii; kratki wzoru drukują się w prawdziwych kolorach kredek, bez liter i bez legendy; domyślnie obiekt jest czarną sylwetką.
- Rodzic może zapamiętać w profilu dziecka wspólny wiek i ulubioną postać oraz osobny poziom każdego rodzaju karty, także jako ostatnie parametry.

### Guardrails

- Drukowanie nie wymaga utworzenia profilu dziecka.
- Wygenerowanie labiryntu trwa nie dłużej niż 5 sekund.
- Na telefonie przyciski generowania i drukowania nie zasłaniają się nawzajem.
- Na telefonie labirynt mieści się na jednej stronie A4 w szerokości i w długości.

## User Stories

### US-01: Rodzic generuje labirynt do wydruku

- **Given** rodzic może wybrać postać i poziom trudności labiryntu
- **When** wybierze te parametry i uruchomi generowanie
- **Then** otrzymuje gotowy do wydruku labirynt A4 o wybranym poziomie trudności; wybrana postać stoi przy starcie, poza poziomem nastolatka

#### Acceptance Criteria

- Labirynt zajmuje większą część strony A4.
- Labirynt nie przekracza wąskich marginesów strony.
- Istnieje dokładnie jedna prawidłowa ścieżka prowadząca od startu do mety.
- Na poziomach od 3 lat do 7–8 lat przy starcie znajduje się wybrana postać. Poziom nastolatka postaci nie pokazuje.
- Na poziomach od 3 lat do 7–8 lat start jest na środku górnej krawędzi, a napis „Meta” na środku dolnej. Poziom nastolatka ma start i metę w narożnikach.

### US-02: Rodzic wstawia własny obrazek — poza MVP

- **Given** rodzic ma własny plik obrazka, na przykład zdjęcie dziecka
- **When** wskaże ten plik przed generowaniem labiryntu
- **Then** obrazek staje przy starcie na karcie, a plik zostaje w przeglądarce i nie jest wysyłany na serwer

#### Acceptance Criteria

- Ta historyjka jest poza MVP. Jest zapisana, żeby do niej wrócić po katalogu dostarczonych postaci.
- Plik nie trafia na serwer, także na czas generowania.
- Po złożeniu karty usługa nie przechowuje kopii pliku.

### US-03: Pełny katalog postaci przy karcie i przy profilu

- **Given** rodzic wybiera postać do karty, tworzy profil dziecka albo zapisuje ulubioną postać istniejącego profilu
- **When** otwiera listę postaci
- **Then** widzi cały dostarczony katalog i może wskazać dowolną postać; przy niższej rozdzielczości pełna lista zostaje widoczna

#### Acceptance Criteria

- Katalog to jedenaście postaci: Samochodzik, Rakieta, Dinozaur, Jednorożec, Kot, Pies, Robot, Smok, Strażak, Syrenka i Wróżka. Wiersz „Bez postaci” zostaje.
- Ta sama lista jest przy pasku „Postać” na kartce, przy tworzeniu profilu i przy zapisie ulubionej postaci.
- Wygląd dodawania profilu i zapisu ulubionej postaci może się zmienić, żeby zmieścić pełną listę.
- Przy niższej rozdzielczości pełna lista jest widoczna, a nie ucięta.
- Ostatnio użyta postać i ulubiona postać profilu mogą być dowolną postacią z katalogu.
- Własny obrazek rodzica zostaje przy US-02.
- Pasek nadal pokazuje wybraną postać. Poziom nastolatka postaci nie pokazuje.

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
- Każdy rodzaj ma własną stronę z własnym adresem (labirynt: `/labirynt`, symetria: `/symetria`). Kliknięcie miniatury otwiera ją.
- Katalog mieści co najmniej 10 rodzajów i jest czytelny na telefonie (miniatury w 2 kolumnach) i na komputerze.
- Na stronie generatora jest link „Wszystkie karty” z powrotem do katalogu.
- Strona generatora ma ten sam układ co dziś: profil w rogu, pasek ustawień, Generuj i Drukuj, karta A4 na dole. Pod kartą nic nie ma.
- Po wejściu z katalogu labirynt działa tak jak dotąd: przepływ, poziomy, postać, druk i margines są bez zmian względem US-01, US-03 i US-04.
- Wybrany profil dziecka zostaje po przejściu między katalogiem a stronami generatorów.
- Druk nadal nie wymaga profilu dziecka.
- Pasek „Postać” jest pokazany tylko przy labiryncie. Karta symetrii postaci nie pokazuje.
- Strony generatorów można zmieniać niezależnie od siebie: zmiana jednej nie zmienia drugiej.

### US-06: Rodzic generuje kartę symetrii do druku

- **Given** rodzic otworzył z katalogu stronę „Symetria”
- **When** uruchomi generowanie
- **Then** otrzymuje gotową do wydruku kartę A4: połowa obiektu jest narysowana na kratce, druga połowa jest pusta, a dziecko ma ją dorysować jako odbicie

#### Acceptance Criteria

- Kratka jest oddzielona osią symetrii; wzór leży po jednej stronie osi, druga strona jest pusta.
- Odpowiedź jest jedna: odbicie wzoru względem osi. Aplikacja potrafi ją wyliczyć i sprawdzić.
- Wzór to połowa rozpoznawalnego obiektu z katalogu szablonów (np. rakieta, robot, truskawka, jabłko, motyl), a nie przypadkowa plama. Nad kratką jest jedno zdanie polecenia.
- Wzór nie jest pusty i nie jest już symetryczny w całości.
- Każde Generuj daje nowy wzór: inny obiekt albo inny wariant tego samego obiektu niż poprzednia karta.
- Karta zajmuje większą część strony A4, nie przekracza marginesu 10 mm (ściany i ramka kratki) i drukuje się jako jedna strona.
- Bez odpowiedzi na kartce. Domyślnie druk jest czarny; kolory, gdy rodzic je włączy, są prawdziwymi kolorami kratek (US-09).
- Te same warunki na telefonie co w US-04: Generuj i Drukuj nie nachodzą na siebie, karta mieści się na A4 w szerokości i w długości, podgląd zostaje. Przeglądarki jak w US-04, w tym Brave.

### US-07: Rodzic wybiera poziom karty symetrii

- **Given** rodzic jest na stronie „Symetria”
- **When** wybierze poziom nazwany wiekiem (około 4–7 lat)
- **Then** karta ma kratkę, obiekty i podpowiedź zgodne z tym poziomem

#### Acceptance Criteria

- Poziom zmienia rozmiar kratki, katalog obiektów (4 lata prostsze, 7 lat bogatsze) i podpowiedź (kilka kratek odpowiedzi już zamalowanych, bledszych niż wzór także bez kolorów). Reguły są w Business Logic.
- Poziom nie włącza kolorów; to osobne ustawienie rodzica (US-09).
- Każdy poziom mieści się na jednej stronie A4 z marginesem 10 mm.
- Poziom jest na pasku strony symetrii. Wybór poziomu w profilu dla symetrii dochodzi z US-08.

### US-08: Rodzic zapamiętuje wiek i poziomy w profilu

- **Given** rodzic ma profil dziecka albo wygenerował już kartę
- **When** wróci na stronę, wybierze profil albo wejdzie na stronę innego rodzaju karty
- **Then** ustawienia są takie, jak ostatnio albo jak w profilu, i dają się zmienić przed generowaniem

#### Acceptance Criteria

- Profil dziecka ma wspólne ustawienia: wiek i ulubioną postać. Obowiązują wszystkie rodzaje kart.
- Każdy rodzaj karty ma własny poziom. Wiek ustawia go na starcie na najbliższy poziom tego rodzaju (symetria zaczyna się od 4 lat, więc wiek 3 lat daje jej poziom 4 lat).
- Rodzic może wybrać poziom danego rodzaju niezależnie od wieku dziecka, na przykład labirynt trudniejszy niż wiek, i zapisać go w profilu.
- Rodzaje kart mogą mieć własne dodatkowe ustawienia (np. kolory karty symetrii, US-09). Dochodzą osobno i nie zmieniają wspólnych pól.
- Ostatnio użyte parametry są pamiętane osobno dla każdego rodzaju karty i są widocznymi, edytowalnymi wartościami domyślnymi (jak FR-006).
- Profil zmienia się tylko po wyraźnym zapisie (FR-009).
- Zapisane wcześniej profile i ostatnie parametry nadal się wczytują; poziom labiryntu z dawnego profilu zostaje poziomem labiryntu.
- Dane zostają na urządzeniu.

### US-09: Rodzic włącza kolory na karcie symetrii

- **Given** rodzic jest na stronie „Symetria”
- **When** włączy kolory, niezależnie od wybranego poziomu
- **Then** kratki obiektu mają prawdziwe kolory, a dziecko dorysowuje odbicie i koloruje je kredkami według wzoru

#### Acceptance Criteria

- Kolory to osobny przełącznik na pasku strony symetrii, niezależny od poziomu i wieku. Domyślnie są wyłączone: obiekt jest czarną sylwetką.
- Kolor to prawdziwy kolor kratki, bez liter i bez legendy (decyzja 2026-10-23 po makiecie). Detale będące pustymi kratkami wewnątrz sylwetki (okno rakiety, oczy robota, pestki truskawki) też dostają kolor. Na drukarce czarno-białej kolory schodzą do odcieni szarości.
- Odpowiedź nadal jest jedna: odbicie obiektu razem z kolorem każdej kratki.
- Przełączenie kolorów zostawia tę samą kartę; nie generuje nowej.
- Wyłączenie kolorów daje ten sam rodzaj obiektu jako czarną sylwetkę.
- Zapis kolorów w profilu i w ostatnich parametrach dochodzi z US-08 jako dodatkowe ustawienie karty symetrii.

## Functional Requirements

### Generator i druk

- FR-001: Rodzic może wybrać jeden z dostarczonych poziomów trudności. Priority: must-have
  > Socrates: Counter-argument considered: nazwy poziomów mogą wprowadzać w błąd bez mierzalnych reguł. Resolution: kept; poziomy są nazwane wiekiem, a reguły szerokości alejki i długości drogi są w Business Logic.
- FR-002: Rodzic może wybrać postać z dostarczonego zestawu. Priority: must-have
  > Socrates: Counter-argument considered: przygotowanie i prawa do postaci mogą opóźnić podstawowy przepływ. Resolution: kept; źródło postaci i prawa pozostają otwartym pytaniem.
- FR-003: Rodzic może wygenerować strukturalnie poprawny labirynt zgodny z wybranymi parametrami. Priority: must-have
  > Socrates: Counter-argument considered: poprawność i trudność mogą być niemożliwe do potwierdzenia bez ludzkiego oka. Resolution: kept; połączenie start–meta, unikalność rozwiązania, zakręty, długość i punkty wyboru mają być sprawdzalne według jawnych reguł.
- FR-004: Rodzic może zobaczyć kartę A4 przed uruchomieniem standardowego drukowania. Priority: must-have
  > Socrates: Counter-argument considered: osobny podgląd może dublować standardowe okno drukowania. Resolution: revised; karta ma być widoczna przed drukiem, ale nie wymaga osobnego dodatkowego ekranu.
- FR-005: Rodzic może wydrukować kartę jako jedną stronę A4. Priority: must-have
  > Socrates: Counter-argument considered: przeglądarki i drukarki różnie stosują marginesy oraz skalowanie. Resolution: kept; obsługiwane środowiska i mierzalne granice wydruku wymagają doprecyzowania.
- FR-006: Rodzic bez profilu dziecka otrzymuje jako widoczne, edytowalne wartości domyślne ostatnio użyte parametry. Priority: must-have
  > Socrates: Counter-argument considered: wspólne urządzenie może podstawić ustawienia innego dziecka. Resolution: revised; wartości są zawsze widoczne i można je zmienić przed generowaniem.

### Profile dzieci

- FR-007: Rodzic może utworzyć opcjonalny lokalny profil dziecka z domyślną trudnością i postacią. Priority: must-have
  > Socrates: Counter-argument considered: profile nie są potrzebne do podstawowej wartości i zwiększają zakres MVP. Resolution: kept; korzystanie z profilu pozostaje opcjonalne, ale możliwość zarządzania profilami należy do MVP.
- FR-008: Rodzic może wyświetlić i wybrać zapisany profil dziecka, gdy istnieje rzeczywisty wybór profilu. Priority: must-have
  > Socrates: Counter-argument considered: selektor jest zbędny dla rodzica jednego dziecka. Resolution: revised; wybór profilu nie jest pokazywany, gdy nie ma rzeczywistego wyboru.
- FR-009: Rodzic może jawnie zapisać zmienione ustawienia profilu dziecka. Priority: must-have
  > Socrates: Counter-argument considered: jednorazowa zmiana parametrów karty nie powinna przypadkiem zmieniać profilu. Resolution: revised; profil zmienia się wyłącznie po wyraźnym zapisie.
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
- FR-016: Rodzic może wybrać poziom karty symetrii nazwany wiekiem (rozmiar kratki, katalog obiektów, podpowiedź). Priority: must-have
  > Socrates: Counter-argument considered: bez mierzalnych reguł nazwy poziomów mogą wprowadzać w błąd, a sam rozmiar kratki zmienia głównie motorykę, nie trudność odbicia. Resolution: revised (2026-10-23); poziom łączy kratkę z położeniem obiektu, osią i podpowiedzią, a reguły są w Business Logic.
- FR-017: Rodzic może zapamiętać w profilu dziecka wspólny wiek i ulubioną postać oraz osobny poziom każdego rodzaju karty, a ostatnie parametry są pamiętane osobno dla każdego rodzaju. Priority: must-have
  > Socrates: Counter-argument considered: nowe pola w zapisanych profilach mogą zepsuć istniejące dane. Resolution: revised; stare profile i ostatnie parametry nadal się wczytują, a dawny poziom labiryntu zostaje poziomem labiryntu. Wiek ustawia poziomy tylko na starcie; rodzic może je zmienić niezależnie.
- FR-018: Rodzic może niezależnie od poziomu włączyć kolory na karcie symetrii; kratki wzoru mają prawdziwe kolory, bez liter i bez legendy, domyślnie czarna sylwetka. Priority: must-have
  > Socrates: Counter-argument considered: kolorowy druk wymaga kolorowej drukarki i łamie wspólną umowę czarnego druku. Resolution: revised (2026-10-23); po makiecie użytkownik wybrał prawdziwe kolory zamiast liter i legendy, a domyślny druk zostaje czarną sylwetką; kolor wymaga kolorowej drukarki, na czarno-białej schodzi do szarości.

## Non-Functional Requirements

- Od uruchomienia generowania do pokazania gotowej karty upływa nie więcej niż 5 sekund.
- Karta mieści się na jednej stronie A4 i zachowuje margines co najmniej 10 mm z każdej strony. Margines dotyczy ścian i ramki labiryntu; znak postaci przy starcie może wejść w ten pas.
- Generowanie, podgląd i druk działają w aktualnych desktopowych wersjach Chrome, Edge, Brave, Firefox i Safari.
- Generowanie, podgląd i druk działają na telefonie w aktualnych mobilnych wersjach Chrome, Edge, Brave, Firefox i Safari.
- Na telefonie kontrolki generowania i drukowania nie nachodzą na siebie.
- Na telefonie labirynt mieści się na jednej stronie A4 w szerokości i w długości, z marginesem co najmniej 10 mm. Margines dotyczy ścian i ramki labiryntu; znak postaci przy starcie może wejść w ten pas.
- Karta symetrii spełnia te same granice co labirynt: generowanie do 5 sekund, jedna strona A4, margines co najmniej 10 mm (ściany i ramka kratki), domyślny druk czarny, a przy włączonych kolorach prawdziwe kolory kratek bez liter i legendy, te same przeglądarki na komputerze i na telefonie, w tym Brave.
- Lokalne profile dzieci i ostatnie parametry pozostają dostępne między wizytami do czasu usunięcia ich przez rodzica albo wyczyszczenia danych przeglądarki.
- Dane profili dzieci i ostatnie parametry nie opuszczają urządzenia.
- Wygenerowane karty nie są przechowywane po zakończeniu przepływu drukowania.

## Business Logic

Aplikacja zawsze tworzy labirynt z dokładnie jednym rozwiązaniem, a poziom wyznaczają szerokość alejki i sposób losowania labiryntu.

Rodzic wybiera jeden z sześciu poziomów nazwanych wiekiem oraz jedną z jedenastu postaci dostarczonego katalogu: Samochodzik, Rakieta, Dinozaur, Jednorożec, Kot, Pies, Robot, Smok, Strażak, Syrenka albo Wróżka. Może też zostać bez postaci. Obrys zostaje pionowym prostokątem na kartce A4. Osobnej kontrolki długości drogi nie ma. Dwa poziomy mogą dzielić szerokość alejki i różnić się sposobem losowania. Każde Generuj daje nowy labirynt.

| Poziom     | Alejka      | Siatka | Losowanie                         | Droga do mety (typowo) |
| ---------- | ----------- | ------ | --------------------------------- | ---------------------- |
| 3 lata     | około 21 mm | 9×11   | krótka droga, dużo krótkich odnóg | około 21 komórek       |
| 4 lata     | około 21 mm | 9×11   | długa, kręta droga                | około 41 komórek       |
| 5 lat      | około 15 mm | 13×16  | krótka droga, dużo krótkich odnóg | około 32 komórek       |
| 6 lat      | około 15 mm | 13×16  | długa, kręta droga                | około 80 komórek       |
| 7–8 lat    | około 11 mm | 17×21  | długa, kręta droga                | około 130 komórek      |
| nastolatek | około 7 mm  | 27×33  | długa, kręta droga                | około 300 komórek      |

Droga do mety nie jest progiem. To typowa długość dla siatki i sposobu losowania; pojedyncza karta może być krótsza albo dłuższa.

Na poziomach od 3 lat do 7–8 lat start jest na środku górnej krawędzi, napis „Meta” na środku dolnej, a przy starcie stoi wybrana postać. Poziom nastolatka ma start i metę w narożnikach i nie pokazuje postaci. Pętle w jego ślepych odnogach są dozwolone, jeśli nie powstaje druga droga od startu do mety.

Krótki poziom przy tej samej alejce losuje się sposobem, który daje krótszą drogę i więcej krótkich odnóg, żeby krótka droga nie była zagadką ukrytą wśród pułapek. Dłuższy poziom losuje długą, krętą drogę z mniejszą liczbą rozgałęzień.

Wynikiem jest karta A4. Labirynt zajmuje większą część strony, zachowuje margines co najmniej 10 mm i spełnia reguły wybranego poziomu.

### Karta symetrii

Aplikacja zawsze tworzy kartę z dokładnie jedną odpowiedzią: odbiciem wzoru względem osi. Poziom wyznaczają rozmiar kratki, katalog obiektów i podpowiedź; oś jest zawsze pionowa (pozioma odpadła 2026-10-23: obiekty z katalogu są symetryczne lewo–prawo, obrócone leżałyby na boku). Kolory są osobnym ustawieniem rodzica, niezależnym od poziomu.

Rodzic wybiera jeden z czterech poziomów nazwanych wiekiem. Kartka to pionowy prostokąt A4 z kratką podzieloną osią na dwie równe połowy i jednym zdaniem polecenia nad kratką. Wzór jest połową symetrycznego obiektu (np. rakieta, robot, truskawka, jabłko, motyl, korona) zamalowaną na kratkach po jednej stronie osi; druga strona jest pusta poza kratkami podpowiedzi. Dziecko zamalowuje kratki po drugiej stronie tak, by obiekt odbijał się w osi. Karta nie pokazuje postaci z katalogu labiryntu.

Obiekty pochodzą z katalogu szablonów zapisanych w kodzie. Szablon ma części, które generator losuje (np. liczba okien i kształt skrzydeł rakiety, pestki truskawki, oczy i ramiona robota), więc ten sam obiekt daje różne karty. Każde Generuj daje inny obiekt albo inny wariant niż poprzednia karta. Szablon musi zmieścić się w połowie siatki danego poziomu. Poziom 4 lat ma własne, prostsze warianty obiektów rysowane na połowie 4×12; poziomy 5 i 6 lat używają szablonów 6×15; poziom 7 lat ma bogatsze warianty (więcej części i szczegółów) rysowane na połowie 9×24.

| Poziom | Kratka      | Siatka (cała) | Obiekty             | Podpowiedź                       |
| ------ | ----------- | ------------- | ------------------- | -------------------------------- |
| 4 lata | około 20 mm | 8×12          | proste, połowa 4×12 | 3 kratki odbicia przy osi, blade |
| 5 lat  | około 15 mm | 12×16         | szablony 6×15       | brak                             |
| 6 lat  | około 12 mm | 14×20         | szablony 6×15       | brak                             |
| 7 lat  | około 10 mm | 18×24         | bogate, połowa 9×24 | brak                             |

Obiekt zawsze dotyka osi, a dziecko go przedłuża. Odsunięcie obiektu od osi odpadło (2026-10-23): odsunięta połowa przestaje być jednym obiektem. Trudność rośnie przez mniejszą kratkę, większą siatkę, bogatsze obiekty i brak podpowiedzi. Wartości są startowe i zostają potwierdzone na wydruku.

Kolory (US-09): przy włączonych kolorach każda kratka obiektu ma prawdziwy kolor kredki (czerwony, zielony, żółty, niebieski, pomarańczowy, szary albo czarny), bez liter i bez legendy. Detale będące dziurami w sylwetce (okno, oczy, usta, pestki) wykrywa generator i maluje kolorem szablonu. Odpowiedź to odbicie wraz z kolorem każdej kratki. Przełącznik nie zmienia karty. Przy wyłączonych kolorach obiekt jest czarną sylwetką.

Reguły, które generator sprawdza: wzór ma co najmniej jedną zamalowaną kratkę i co najmniej jedną pustą w swojej połowie; żadna zamalowana kratka nie leży na osi; druga połowa zawiera wyłącznie kratki podpowiedzi, które są częścią odbicia, i nie całe odbicie; odpowiedź jest dokładnie odbiciem, przy kolorach razem z literą każdej kratki; obiekt dotyka osi, a liczba podpowiedzi zgadza się z poziomem. Karta, która łamie którąś z tych reguł, nie jest pokazana.

Wynikiem jest karta A4. Kratka zajmuje większą część strony, zachowuje margines co najmniej 10 mm i spełnia reguły wybranego poziomu.

## Access Control

Jeden lokalny użytkownik-rodzic; bez logowania i bez podziału na role. Ustawienia pozostają na urządzeniu.

Rodzic może korzystać z generatora bez tworzenia profilu dziecka. Opcjonalne nazwane profile dzieci przechowują wspólny wiek i ulubioną postać oraz poziom każdego rodzaju karty osobno (od kamienia symetrii), aby skrócić kolejne generowanie. Dzieci nie mają kont ani dostępu do aplikacji.

Wygenerowane karty nie są zapisywane; ich cykl życia kończy się po wydruku.

## Non-Goals

- Kolejne rodzaje kart wchodzą jako osobne kamienie, po jednym naraz, a nie razem z labiryntem. Pierwszym po labiryncie jest symetria (US-05–US-09, FR-014–FR-018). Rodzaje z listy „Po MVP” zostają poza zakresem, dopóki ich kamień nie jest otwarty.
- MVP nie używa LLM do generowania ani oceniania kart — rezultat podlega jawnym regułom algorytmicznym.
- MVP nie ma kont rodziców ani synchronizacji między urządzeniami — ustawienia i profile pozostają lokalne.
- MVP nie zapisuje ani nie archiwizuje wygenerowanych kart — ich cykl życia kończy się po wydruku.
- MVP nie dostarcza biblioteki gotowych kart — FR-011 pozostaje możliwym rozszerzeniem poza MVP.
- MVP nie przyjmuje własnego obrazka od rodzica — US-02 zostaje poza MVP. Katalog dostarczonych postaci idzie pierwszy.
- MVP nie ma poziomu dla osoby dorosłej. Najstarszy poziom to nastolatek.

## Po MVP

Zapisane 2026-10-10, żeby nie zginęło. Poza bieżącym kamieniem. Żaden z tych typów nie wchodzi do zakresu, dopóki jego kamień nie jest otwarty.

Wspólna umowa z labiryntem: generator algorytmiczny, jedna sprawdzalna odpowiedź, trudność nazwana wiekiem, jedna strona A4, czarny druk. Bez modelu językowego.

Symetria przeszła z tej listy do zakresu (2026-10-22): US-05–US-09, FR-014–FR-018, Business Logic „Karta symetrii”. Strona główna staje się katalogiem z miniaturami, a każdy rodzaj karty dostaje własną stronę generatora; druk, margines, ostatnie parametry i profil dziecka zostają. Ta przebudowa mieści kolejne rodzaje, ale nie dostarcza całej listy poniżej.

Pozostałe typy nie mają kolejności. Następny typ dostaje US i FR dopiero przy otwarciu jego kamienia.

- **Sekwencje.** Dziecko wskazuje, co będzie dalej. Kartka odpada, gdy do pustego miejsca pasują dwie reguły.
- **Połącz kropki.** Sylwetka wybranej postaci. Czeka na obrys każdej postaci.
- **Który nie pasuje.** Jeden obrazek łamie jawną regułę. Kartka odpada, gdy druga reguła wskazuje inny obrazek.
- **Nonogram postaci.** Po rozwiązaniu widać uproszczoną postać. Czeka na małą bitmapę postaci.
- **Karty kodowania.** Kratka, postać, meta i strzałki. Jedna najkrótsza droga.
- **Sudoku obrazkowe.** Układ 4×4 z symbolami. Układ 9×9 zostaje przy nastolatku.
- **Porównywanie kwot w złotych.** Dwie kupki monet albo jedna kupka i cena. Liczy się wartość monet, nie liczba sztuk. „Ułóż dokładnie tę kwotę” czeka na regułę, która zostawia jeden układ.

Poza tą listą zostają kolorowanki oraz działania na liczbach z dopiskiem waluty.

## Open Questions

1. **Insight — czemu gotowe paczki PDF nie rozwiązują tego poza skończoną biblioteką?** — TBD by user. Block: no (pain and missing capability are captured; the second vision paragraph is incomplete until this lands).
2. ~~**Ile komórek głębokości odróżnia płytką ślepą uliczkę od głębokiej?**~~ — Zamknięte 2026-10-16 jako nieaktualne: poziom wyznacza sposób losowania, nie próg głębokości odnogi (`random-maze-generator`).
3. **Jakie jest źródło dostarczonych postaci i jakie prawa pozwalają użyć ich w produkcie?** — Owner: user. Block: yes before publishing the character-selection feature. Pierwszy nazwany zestaw (2026-10-04): samochodzik, rakieta, dinozaur, rysowane z pomocą AI. Katalog na 2026-10-10 dokłada jednorożca, kota, psa, robota, smoka, strażaka, syrenkę i wróżkę. Planowanie FR-012 nie czeka na prawa; publikacja szerszego katalogu czeka. Własny plik rodzica jest US-02 i zostaje poza MVP.
4. **Czy poziom nastolatka ma pokazywać postać?** — Owner: user. Block: no. Dziś pasek „Postać” zostaje aktywny przy nastolatku, a karta postaci nie rysuje, co myli rodzica. Albo wybór postaci blokuje się przy nastolatku, albo nastolatek też dostaje postać, bo młodsze dzieci mogą chcieć ten poziom. Nowa zmiana, issue drpc1/printo-kids#54 (2026-10-22).
5. **Czy startowe wartości poziomów symetrii (kratka, siatka, obiekty, podpowiedź) pasują dziecku?** — Owner: user. Block: no. Tabela w Business Logic jest propozycją z 2026-10-22, przebudowaną 2026-10-23 (obiekty zamiast gęstości plamy); potwierdza ją wydruk w kamieniu poziomów (S-13), nie planowanie. Połowa siatki 8×12 ma 4 kratki szerokości: rozstrzygnięte 2026-10-23 po makiecie, poziom 4 lat ma własne, prostsze warianty obiektów, a poziom 7 lat bogatsze. Oś pozioma i odsunięcie od osi wycofane z poziomów. Czeka na wydruk w S-13 (faza 4).
6. **Czy karta symetrii ma kiedyś używać postaci (np. połowa sylwetki)?** — Owner: user. Block: no. Dziś karta postaci nie pokazuje, a strona symetrii nie ma paska „Postać” (US-05). Zależy od obrysów postaci, jak „Połącz kropki”. Szablony obiektów karty symetrii (2026-10-23) to osobny katalog i nie czekają na tę decyzję.
7. **Ile szablonów obiektów i jakich wariantów wystarczy, żeby kolejne karty się nie powtarzały?** — Owner: team. Block: no. Ustalone 2026-10-23: obiekty zamiast przypadkowych plam. Gotowa lista szablonów to skończona biblioteka, czyli problem z wizji produktu; warianty części mają go zmiękczyć. Otwarte: czy starszy poziom ma też dostawać ornamenty budowane z reguł (np. romby, pierścienie), które dają się generować bez końca.
