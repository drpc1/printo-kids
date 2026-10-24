# Własny plik rodzica jako postać labiryntu — Plan Brief

> Full plan: `context/changes/parent-supplied-maze-image/plan.md`
> Research: `context/changes/parent-supplied-maze-image/research.md`

## What & Why

Rodzic wskazuje własne zdjęcie, na przykład zdjęcie dziecka, i widzi je przy starcie labiryntu. Plik zostaje w przeglądarce i nie idzie na serwer. Katalog jedenastu postaci zostaje.

## Starting Point

Kartka rysuje tylko plik `/characters/<id>.png` albo słowo „Start”. Ostatnio użyte i profile pamiętają id z katalogu. Obce id przy odczycie znika. Wyboru pliku, płótna i drugiego magazynu w aplikacji nie ma. US-02 w PRD i w Parked jest nadal poza MVP.

## Desired End State

W oknie „Postać” jest wiersz „Własne zdjęcie”. Po wskazaniu pliku kartka mieści cały obrazek w kwadracie 30 mm. Kopia ma dłuższy bok co najwyżej 512 px: ze 1024×512 zostaje 512×256, a 200×100 zostaje 200×100.

Bez profilu wybór Kota zdejmuje zdjęcie z kartki i zostawia miniaturę w wierszu, także po odświeżeniu. Ala z ulubionym Kotem po wskazaniu pliku bez „Zapisz” po odświeżeniu znowu widzi Kota, a miniatura zostaje. „Zapisz” wstawia kopię do profilu. Późniejszy plik przy „Bez profilu” nie podmienia kopii Ali.

## Key Decisions Made

| Decision                | Choice                                                                    | Why (1 sentence)                                                  | Source   |
| ----------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------- |
| Gdzie wskazuje się plik | Wiersz w oknie „Postać”: pasek, nowy profil, zapis ulubionej              | Ta sama lista co katalog                                          | Research |
| Typy i próg             | JPEG, PNG, WebP; powyżej 8 × 1024 × 1024 bajtów odpada przed dekodowaniem | Złe pliki nie podmieniają postaci                                 | Research |
| Rozmiar kopii           | Dłuższy bok schodzi do 512 px; 200 px zostaje 200 px                      | „Zmniejszona” dotyczy tylko większego boku                        | Plan     |
| Obrót                   | Jak w galerii; oryginał nie zostaje                                       | Rodzic widzi to samo ułożenie co w zdjęciach                      | Research |
| Kwadrat na kartce       | Cały obrazek w 30×30, data URL, nie `blob:`                               | Wydruk bierze ten sam SVG                                         | Research |
| Alfa                    | Zostaje; JPEG bez alfy zostaje nieprzezroczysty                           | Wycięta postać przepuszcza labirynt                               | Plan     |
| Po Kocie                | Kartka pokazuje Kota, miniatura zostaje w wierszu okna                    | „Zdejmuje z kartki”, a kopia zostaje między wizytami              | Plan     |
| Bez „Zapisz”            | Odświeżenie wraca do ulubionej postaci, kopia zostaje w wierszu           | Do profilu wchodzi dopiero „Zapisz”                               | Plan     |
| Dwa zapisy bajtów       | Klucz urządzenia to wiersz; profil trzyma migawkę od „Zapisz” / „Utwórz”  | Późniejszy plik nie podmienia Ali                                 | Plan     |
| Id                      | `wlasne` w polu `character`; bajty obok                                   | Odczyt listy id zostaje, data URL nie wchodzi w to pole           | Plan     |
| Odmowa                  | Zdanie w otwartym oknie                                                   | Inaczej kliknięcie wygląda jak nic                                | Plan     |
| HEIC                    | Przyjmij, gdy ta przeglądarka otworzy; bez biblioteki                     | Rolka iPhone’a ma przejść; Chrome i surowy HEIC dostają komunikat | Plan     |
| Nastolatek              | Kartka nie rysuje zdjęcia                                                 | Tak jak postać z katalogu; #54 osobno                             | Research |
| Dokumenty               | Poprawić zdania „poza MVP” i zdjąć Parked; nie dodawać wiersza M-2        | Kamień symetrii kończy się jak teraz                              | Plan     |

## Scope

**In scope:** kopia pliku, wiersz w trzech listach, kartka, klucz urządzenia, migawka profilu, komunikaty odmowy, zdania US-02 w PRD, zdjęcie bulletu z Parked.

**Out of scope:** S-12, issue #54, wiersz w M-2, kotwica „Labirynt zostaje bez zmian”, dekoder HEIC, IndexedDB, powiększanie, kadrowanie, GIF, wiele zdjęć naraz.

## Architecture / Approach

Funkcja kopii zwraca data URL albo powód odmowy. Ekran zapisuje udaną kopię pod `printo-kids:own-image` i od razu rysuje ją na pasku. „Utwórz” i „Zapisz” kopiują ten href do pola `image` profilu. Kartka po odświeżeniu profilu bierze migawkę, a wiersz zawsze pokazuje kopię urządzenia.

## Phases at a Glance

| Phase              | What it delivers                                  | Key risk                                                                                 |
| ------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1. Kopia pliku     | Próg, typ, obrót, skala, alfa, testy              | Obrót i alfa łatwo pomylić z samym prefiksem MIME                                        |
| 2. Wiersz i kartka | Wiersz, SVG, dwa zapisy, komunikaty, Playwright   | `characterSrc === null` dziś rysuje „Start”; „Zapisz” przy tym samym id nic nie zapisuje |
| 3. PRD i Parked    | Zdania „poza MVP” schodzą, M-2 bez nowego wiersza | Łatwo ruszyć kotwicę kamienia symetrii                                                   |

**Prerequisites:** katalog postaci, profile i ostatnio użyte są już na stronie. Nowej zależności nie ma.
**Estimated effort:** około 2–3 sesji na 3 fazy.

## Open Risks & Assumptions

- Wydruk SVG z data URL na iPhonie nie był sprawdzany. Zostaje ręcznym krokiem fazy 2.
- Duży plik tuż poniżej progu dekoduje się na wątku strony i może chwilę zająć kartę.
- Gdy `localStorage` odmówi zapisu, wybór zostaje, a rodzic widzi komunikat. Wiele dużych migawek PNG może ten limit spotkać.
- Kotwica M-2 nadal mówi, że labirynt zostaje bez zmian, bo ten change świadomie nie wchodzi do „At a glance”.

## Success Criteria (Summary)

- Wskazane zdjęcie staje przy starcie, całe, w kwadracie 30 mm, i przeżywa odświeżenie jako kopia w przeglądarce.
- Kot zdejmuje je z kartki i zostawia miniaturę w oknie. Profil Ali zmienia się dopiero po „Zapisz”.
- Zły plik nie podmienia postaci i mówi dlaczego. Na nastolatku kartka pokazuje „Start”.
