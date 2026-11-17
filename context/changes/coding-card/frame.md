# Frame Brief: S-42 Karta kodowania

> Framing step before /10x-plan. Captures what is actually at issue, separated from what was assumed.
> Frame to rozmowa nad makietą z użytkowniczką (2026-11-17), nie śledztwo w kodzie: pytanie brzmi „co budujemy”.

## Reported Observation

Karty kodowania (roadmap S-42, M-7) nie istnieją. PRD „Po MVP”, „Karty kodowania”: kratka, postać, meta i strzałki;
jedna najkrótsza droga; dziecko zapisuje drogę strzałkami w pustych polach albo, w drugim wariancie, wykonuje podane
strzałki na kratce; przeszkody to zamalowane pola; generator odrzuca kratki z dwiema najkrótszymi drogami; „może użyć
wyszukiwania drogi z labiryntu”. Roadmapa (Unknowns S-42): poziomy, wielkość kratki i oba warianty — przełącznik czy
wynik poziomu? — rozstrzyga makieta przed US i FR. Block: yes przed `/10x-plan`.

## Initial Framing (preserved)

- **Stated approach**: jedna karta, dwa warianty, poziomy Poziom 1–N bez wieku, postać przy poleceniu (US-21) i postać
  na kratce jako start, A4 z marginesem 10 mm, czarny druk bez odpowiedzi, telefon jak US-04.
- **Proposed direction**: makieta → decyzje → US/FR w PRD → `/10x-plan`.

## Dimension Map

1. **Dwa warianty** — „Zapisz” (dziecko układa drogę: planowanie) i „Wykonaj” (dziecko czyta polecenia: dekodowanie)
   to różne umiejętności, ale obie rosną z wielkością kratki i długością drogi. ← główne pytanie
2. **Poziomy** — co rośnie: kratka, przeszkody, długość drogi, zakręty, zapis.
3. **Jedna odpowiedź** — „najkrótsza” jest dla przedszkolaka abstrakcyjna; co mówi dziecku, że droga ma być najkrótsza?
4. **Odpowiedź w Wykonaj** — gdzie dziecko kończy i jak to zaznacza.
5. **Postać** — w dymku i na kratce; co, gdy „Brak”.

## Hypothesis Investigation

| Wymiar                                      | Dowód (makieta `mockup.mts`, 2026-11-17)                                                                                                                                                                                            | Werdykt                                                             |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Wyszukiwanie drogi z labiryntu się przyda   | `src/lib/maze/generate.ts` `countPaths` liczy drogi w labiryncie ze ścianami między komórkami; kratka kodowania ma zamalowane pola. Makieta liczy najkrótsze drogi własnym BFS (odległość + liczba dróg, ucięta na 2), ok. 30 linii | WEAK — własny BFS, nie kod labiryntu                                |
| Jedna najkrótsza droga jest kosztowna       | 300 kart na poziom, po wydłużeniu drogi: Zapisz średnio 47 / 199 / 640 / 2415 losowań kratki na kartę, 1,8 / 8,5 / 48 / 196 ms na kartę; Wykonaj 2–8 losowań, < 1 ms. Ślepe losowanie; generator może celować metą w daleką kratkę  | STRONG — mieści się w 5 s, ale Poziom 4 warto przyspieszyć w planie |
| Dziecko nie wie, że droga ma być najkrótsza | Pól na strzałki jest dokładnie tyle, ile kroków najkrótszej drogi: dłuższa się nie zmieści, a każda droga tej długości jest tą jedną                                                                                                | STRONG — liczba pól zastępuje słowo „najkrótsza”                    |
| Wykonaj potrzebuje jednej najkrótszej drogi | Strzałki są podane, więc odpowiedź (kratka końcowa) jest jedna z konstrukcji; droga nie musi być najkrótsza, ma tylko omijać przeszkody i nie wracać na tę samą kratkę                                                              | STRONG — reguła tylko dla Zapisz                                    |

## Propozycja makiety (do decyzji)

| Poziom | Kratka | Bok kratki | Przeszkody | Kroków | Zakrętów (co najmniej) | Zapis                                              |
| ------ | ------ | ---------- | ---------- | ------ | ---------------------- | -------------------------------------------------- |
| 1      | 5×5    | 34 mm      | ok. 24%    | 6–8    | 1                      | pojedyncze strzałki                                |
| 2      | 6×6    | 29 mm      | ok. 26%    | 9–12   | 2                      | pojedyncze strzałki                                |
| 3      | 8×8    | 22 mm      | ok. 28%    | 13–17  | 3                      | pojedyncze strzałki                                |
| 4      | 10×10  | 18 mm      | ok. 30%    | 18–24  | 4                      | „3 →” (liczba kratek i strzałka, jak w dyktandzie) |

- Strzałki bezwzględne (→ ← ↑ ↓), jak w dyktandzie graficznym; bez „obróć się w lewo”.
- **Zapisz**: postać na starcie, meta to flaga w szachownicę; pod kratką tyle pustych pól, ile kroków.
  Polecenie: „Zapisz strzałkami drogę do mety. Jedna strzałka to jeden krok.”
- **Wykonaj**: postać na starcie, pod kratką podane strzałki, na kratce trzy obrazki (gwiazdka, serce, koło);
  droga kończy się na jednym z nich, dwa pozostałe stoją blisko końca, poza drogą. Polecenie: „Idź za strzałkami.
  Zakreśl, dokąd dojdziesz.”
- Strzałki rysowane kreską (nie znakiem czcionki), żeby telefon i drukarka rysowały je tak samo.
- Margines 10 mm na każdej karcie, dolny zapas 20–37 mm; czarny druk, bez odpowiedzi; postać w kolorze (US-21).

## Pytania do użytkowniczki

1. Warianty: przełącznik „Tryb” na pasku (Zapisz / Wykonaj, jak w zegarze) czy wynik poziomu?
2. Poziomy i kratki z tabeli: zostają, czy coś zmienić?
3. Zapis na Poziomie 4: „3 →” czy pojedyncze strzałki (wariant `wariant-zapisz-poziom-4-pojedyncze`)?
4. Wykonaj: trzy obrazki do zakreślenia czy X w ostatniej kratce (wariant `wariant-wykonaj-poziom-2-krzyzyk`)?
5. Postać „Brak”: start jako kółko z napisem „Start” (wariant `wariant-zapisz-poziom-1-bez-postaci`)?
6. Przeszkody: szare pola czy kreskowane (wariant `wariant-zapisz-poziom-2-kreskowane`)?

## Decyzje użytkowniczki

1. **Przełącznik „Tryb”** na pasku: Zapisz / Wykonaj, jak w zegarze; każdy tryb ma wszystkie poziomy (2026-11-17).
2. Poziomy: użytkowniczka ogląda makietę (otwarte).
3. **Poziom 4 zapisuje „3 →”** (liczba kratek i strzałka, jak w dyktandzie) (2026-11-17).
4. **Wykonaj: trzy obrazki** (gwiazdka, serce, koło) do zakreślenia; **przeszkody to szare pola** (2026-11-17).
5. Pomysł użytkowniczki (2026-11-17): w Zapisz pierwsze pola są wpisane szarym jako przykład zapisu. W makiecie:
   1 pole na Poziomach 1–2, 2 pola na Poziomach 3–4 (na Poziomie 4 np. „1 →”, „2 ↑”); warianty bez podpowiedzi
   dla porównania. Użytkowniczka zatwierdziła 1 / 1 / 2 / 2 pola (2026-11-17).
6. **Dłuższa droga na każdym poziomie** (2026-11-17, po makiecie): 6–8 / 9–12 / 13–17 / 18–24 kroków, kratki bez zmian.
