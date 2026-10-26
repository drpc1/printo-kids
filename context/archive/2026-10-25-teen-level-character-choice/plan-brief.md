# Teen level character choice — Plan Brief

> Full plan: `context/changes/teen-level-character-choice/plan.md`

## What & Why

Na poziomie nastolatka pasek „Postać” zostaje aktywny, a karta rysuje napis „Start” i nie rysuje znaku. Rodzic wybiera coś, co nie ma skutku. Ta zmiana daje skutek na karcie: wybrana postać stoi nad narożnym startem.

## Starting Point

Nastolatek jest jedynym poziomem z `showCharacter: false`. Start i meta są w narożnikach. Znak 30×30 wyśrodkowany na kolumnie 0 wychodziłby około 1,5 mm poza lewą krawędź kartki. Przesunięcie równych pasów (pas nad znakiem równy pasowi pod „Meta”) już działa dla poziomów, które postać pokazują. Ostatnio użyta postać i ulubiona postać profilu już przeżywają przełączenie poziomu. PRD w US-01, US-03 i w logice labiryntu nadal mówi, że nastolatek postaci nie pokazuje.

## Desired End State

Rodzic wybiera postać albo własny obrazek, generuje nastolatka i widzi znak 30×30, którego lewa krawędź pokrywa się z lewą krawędzią labiryntu. Karta jest niżej niż dziś, tak że biały pas nad znakiem równa się pasowi pod „Meta”. „Bez postaci” zostawia „Start” w narożniku, a labirynt przy tej zmianie nie skacze. Młodsze poziomy zostają ze znakiem na środku wejścia. Ta sama postać wraca po zejściu na 5 lat i powrocie.

## Key Decisions Made

| Decision       | Choice                                            | Why (1 sentence)                                                                      |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Skutek wyboru  | Nastolatek rysuje postać; pasek zostaje aktywny   | Wybór bez rysunku myli rodzica, a młodsze dziecko może chcieć ten poziom              |
| Poziom znaku   | Lewa krawędź 30×30 równa lewej krawędzi labiryntu | Wyśrodkowanie na kolumnie 0 wystaje poza kartkę; margines ścian zostaje 10 mm         |
| Pion karty     | Istniejące przesunięcie równych pasów             | Ten sam margines co na poziomach, które już pokazują postać                           |
| Napis „Start”  | Znika, gdy postać jest wybrana                    | Ta sama reguła co na poziomach od 3 lat do 7–8 lat; środek kolumny 0 leży pod znakiem |
| Pamięć postaci | Bez zmian zapisu                                  | Ostatnio użyta postać i ulubiona profilu już nie giną przy nastolatku                 |

## Scope

**In scope:**

- `showCharacter: true` dla nastolatka
- Przypięcie lewej krawędzi znaku do lewej krawędzi labiryntu, gdy wyśrodkowanie wyszłoby poza labirynt
- Testy układu i migawka poziomów
- US-01, US-03, akapit logiki labiryntu, zamknięcie pytania 4 w PRD i pytania 3 w roadmapie

**Out of scope:**

- Wyłączenie paska „Postać” i dopisek, że poziom postaci nie rysuje
- Przesunięcie wejścia albo mety, inny rozmiar znaku, inny margines ścian
- Wyśrodkowanie na młodszych poziomach
- Zapis ostatnio użytej postaci, profilu i własnego obrazka
- Margines drukarki, miniatury katalogu, testy przeglądarkowe paska, `test-plan.md`

## Architecture / Approach

Generator już przekazuje flagę poziomu do układu. Włączenie flagi uruchamia istniejące rysowanie znaku i istniejące przesunięcie w dół. Układ dostaje jedną regułę poziomą, niezależną od identyfikatora poziomu: lewa krawędź znaku nie może wypaść na lewo od lewej krawędzi labiryntu. Faza karty ląduje pierwsza, tekst produktu druga.

## Phases at a Glance

| Phase                             | What it delivers                                                    | Key risk                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1. Teen sheet draws the character | Znak na nastolatku, lewa krawędź przy labiryncie, równe pasy, testy | Pętla testu, która wymaga środka znaku na kolumnie wejścia, złapie nastolatka i ktoś przywróci wyśrodkowanie |
| 2. Product text matches the sheet | PRD i pytanie roadmapy opisują rysowany znak                        | Zostanie zdanie „Poziom nastolatka postaci nie pokazuje” w US-01, US-03 albo w logice labiryntu              |

**Prerequisites:** Brak. Generator, układ i zapis postaci są w drzewie.
**Estimated effort:** Jedna sesja, dwie fazy. Faza 1 jest kodem i testami, faza 2 jest tekstem produktu.

## Open Risks & Assumptions

- Góra znaku wypada około 10 mm od brzegu, tak jak na innych poziomach ze znakiem. Drukarki, które obcinają bliżej krawędzi, są osobną zmianą `print-printer-margins`, nie tą.
- Przypięcie do `maze.x` na dzisiejszej kartce daje 10 mm. Reguła jest ogólna (nie identyfikator „nastolatek”), więc nowy poziom z wejściem w kolumnie 0 dostałby to samo przypięcie.

## Success Criteria (Summary)

- Na nastolatku wybrana postać albo własny obrazek stoi lewą krawędzią równo z labiryntem, bez napisu „Start”, a pas nad znakiem równa się pasowi pod „Meta”.
- „Bez postaci” zostawia „Start” w narożniku i nie przesuwa labiryntu względem karty z postacią.
- Ta sama postać przeżywa przejście na 5 lat i z powrotem, a PRD już nie mówi, że nastolatek postaci nie pokazuje.
