---
project: PrintoKids
checked: 2026-10-06
status: active
---

# Test plan: PrintoKids

Stopniowe wdrażanie testów dla istniejącego produktu. Ten plik jest strategią. Kod testów, kotwice plików i konfiguracja bramek powstają w kolejnych fazach przez `/10x-research` → `/10x-plan` → `/10x-implement`.

## §1 Strategia

Trzy zasady. Każda faza wdrożenia przekazuje je do `/10x-plan`.

1. **Koszt × sygnał.** Każdy test, który dodaje wdrożenie — klasyczny lub AI-natywny — musi odpowiedzieć na jedno pytanie: jaki jest najtańszy test, który daje prawdziwy sygnał dla tego ryzyka? Nie promuj do e2e, ponieważ „czuje się bezpieczniej”; nie nakładaj modelu wizyjnego na deterministyczną różnicę, która już wykrywa regresję.

2. **Obawy użytkowników są dowodem.** Ryzyka, przez które zespół przeszedł, mają taką samą wagę jak linie PRD lub dane hot-spotów.

3. **Ryzyka to scenariusze, a nie lokalizacje kodu.** Mapa w §2 cytuje dowody: linie PRD, odpowiedzi z wywiadu, katalogi hot-spotów z liczbą zmian, ograniczenia stosu. Nie cytuje `plik:linia`, nazw funkcji, nazw schematów ani nazw modułów i nie twierdzi, że dany plik jest miejscem awarii. Katalog hot-spotów jest dowodem prawdopodobieństwa. To, gdzie w kodzie przebiega awaria, ustala `/10x-research` w fazie wdrożenia.

Skan hot-spotów: zakres `src`, 19 commitów od 2026-09-06. Liczby przy katalogach to wystąpienia ścieżek w tych commitach: `src/components/` 39, `src/pages/` 15, `src/lib/` 11. `src/lib/maze/` ma 3 wystąpienia. `src/components/auth/` ma 11 wystąpień i `src/pages/auth/` ma 6; oba zostają śladem startera poza budżetem testów (§7). Poprawka rysowania wspólnej ściany z 2026-10-01 jest dowodem prawdopodobieństwa ryzyka 1.

Warstwy AI-natywnej nie ma. Obraz podglądu druku nie daje tańszego sygnału niż kontrakt układu albo ręczny podgląd Chrome.

## §2 Mapa ryzyk

Wpływ i prawdopodobieństwo: Wysoki / Średni / Niski.

- **Wpływ wysoki** — krytyczna funkcja bez obejścia: dziecko dostaje labirynt, którego nie da się uczciwie rozwiązać.
- **Wpływ średni** — da się zauważyć przed oddaniem kartki albo zły przebieg CI daje fałszywą pewność.
- **Prawdopodobieństwo wysokie** — było sparzenie albo obszar jest najczęstszy w ostatnich 30 dniach.
- **Prawdopodobieństwo średnie** — wymaga tego PRD albo świeży plasterek, ale awarii jeszcze nie zaobserwowano.
- **Prawdopodobieństwo niskie** — algorytm stoi i katalog prawie się nie zmienia.

Najpierw Wysoki × Wysoki. Takiej pary na mapie nie ma. Ryzyko 1 jest Wysokie × Średnie: wywiad nazwał je krytycznym, bez obejścia, a sprawdzenie jest tanie. Prawdopodobieństwo średnie bierze się z włączonych przez użytkownika zaparkowanych poziomów i z trzech wystąpień `src/lib/maze/`, nie z tego, że progi łatwy/średni/trudny są już znane.

| # | Scenariusz awarii | Wpływ | Prawdopodobieństwo | Źródło |
| - | --- | --- | --- | --- |
| 1 | Kartka wygląda na gotową, a labiryntu nie da się uczciwie rozwiązać: brak ścieżki, więcej niż jedna, albo po zmianie rysowania, kształtu lub poziomów wynik przestaje być prawidłowy | Wysoki | Średni | PRD (dokładnie jedno rozwiązanie); wywiad P1 i P4; użytkownik włączył zaparkowane poziomy; katalog `src/lib/maze/` — 3 wystąpienia ścieżek; poprawka rysowania wspólnej ściany z 2026-10-01 |
| 2 | Ekran jest dobry, a podgląd druku Chrome obcina labirynt albo daje drugą stronę | Średni | Wysoki | Wywiad P2; FR-005 i margines 10 mm w PRD; ryzyko S-02 w roadmapie; katalog `src/components/` — 39 wystąpień ścieżek |
| 3 | Brak „Meta”, przy starcie nie ma wybranej postaci albo stoi inna, postać zasłania wejście, albo wydruk nie zgadza się z tymi faktami | Średni | Średni | Kryteria US-01 w PRD; zarchiwizowany plasterek postaci; katalog `src/components/` |
| 4 | Edge, Firefox albo Safari powtarza obcięcie lub drugą stronę, gdy Chrome jest dobry | Średni | Średni | Wymaganie PRD: aktualne desktopowe Chrome, Edge, Firefox i Safari; wywiad P2 dotyczy tylko Chrome |
| 5 | Jednorazowa zmiana kartki zapisuje się jako profil, usunięcie przechodzi bez potwierdzenia, albo profil, ostatnie parametry lub własny obrazek opuszczają urządzenie. To nie jest alert o chmurze | Wysoki | Niski | FR-009, FR-010, NFR danych na urządzeniu, US-02; roadmapa S-05 i S-06. To nie jest alert o chmurze |
| 6 | Przebieg automatyczny poświadcza konta ze startera albo budżet schodzi na testy startera | Średni | Wysoki | Wywiad P5; job smoke w CI; roadmapa F-02 `proposed`; katalog `src/components/auth/` — 11 wystąpień ścieżek; katalog `src/pages/auth/` — 6 wystąpień ścieżek |

### Risk Response Guidance

| Ryzyko | Co udowodni ochronę | Musi kwestionować | Kontekst dla badania | Najtańsza warstwa | Anty-wzorzec |
| - | --- | --- | --- | --- | --- |
| 1 | Kartka bez uczciwego rozwiązania nie jest gotowa: zero ścieżek, więcej niż jedna ścieżka, albo wynik, który po zmianie rysowania, kształtu lub poziomów przestaje być prawidłowy | Test szczęśliwej ścieżki oznacza, że złe liczby ścieżek są odrzucane; progi łatwy/średni/trudny są już znane | Jak dziś rozstrzygana jest prawidłowa kartka i które reguły już istnieją | Test jednostkowy na runnerze Node | Wyrocznia skopiowana z bieżącego rysunku; progi poziomów wymyślone przed ich ustaleniem |
| 2 | Jedna strona A4, labirynt nieobcięty, margines co najmniej 10 mm | Dobry ekran oznacza dobry druk | Co odróżnia widok ekranu od strony drukowanej | Kontrakt układu, inaczej ręczny podgląd Chrome | Zrzut ekranu, pełne e2e, testy stron startera |
| 3 | Na kartce jest postać właśnie wybrana albo przywrócona jako ostatnia, „Bez postaci” zostawia napis Start, „Meta” jest przy końcu, a wydruk zgadza się z tymi faktami | Znacznik o właściwym rozmiarze oznacza właściwą postać; widok na ekranie oznacza ten sam wydruk | Kiedy właśnie wybrana albo przywrócona postać i „Meta” wchodzą na kartkę i co zostaje w druku przy „Bez postaci” | Ten sam kontrakt kartki co przy ryzyku 2; wyrocznią jest adres pliku tej postaci, nie migawka pikseli | Migawka pikseli rysunku; test „czy rodzic rozumie ekran” |
| 4 | Po naprawie Chrome ten sam wydruk jest jedną stroną A4 także w Edge, Firefox i Safari | Dobry Chrome oznacza dobre pozostałe przeglądarki | Czy reguła z ryzyka 2 jest wspólna, czy Edge, Firefox i Safari łamią ją inaczej | Ręczny podgląd druku pozostałych trzech, dopiero gdy Chrome jest zielony | Macierz automatycznych przeglądarek jako pierwszy test druku |
| 5 | Testu nie pisać, zanim istnieje S-05, S-06 albo US-02. Jawny zapis, potwierdzenie usunięcia, dane zostają na urządzeniu. To nie jest alert o chmurze | Zapis lokalny oznacza, że dane zostały; każda zmiana kartki jest zmianą profilu | Kiedy jednorazowa zmiana kartki staje się profilem i co opuszcza urządzenie | Kontrakt lokalny, gdy istnieje S-05, S-06 albo US-02 | Test profilu albo uploadu przed tym kodem; test konta |
| 6 | Przebieg automatyczny, który ma chronić produkt, odpala testy kartki, a nie konta; bramka pilnuje kartki i nie obrasta testami kont | Smoke startera oznacza rozwiązywalny labirynt i jedną stronę A4 | Co CI uruchamia dziś i które z tych poleceń dotyczą startera | Zostawić `npm test` jako bramkę produktu; nie dokładać asercji startera do smoke | Nowe testy logowania, dashboardu albo API kont |

## §3 Stopniowe wdrażanie

Słownik statusu: `not started` → `change opened` → `researched` → `planned` → `implementing` → `complete`.

| # | Faza | Cel ochrony | Ryzyka | Typy testów | Status | Change folder |
| - | --- | --- | --- | --- | --- | --- |
| 1 | Prawidłowy labirynt po zmianie rysowania | Kartka bez uczciwego rozwiązania nie jest gotowa | 1 | Jednostkowy na obecnym runnerze Node | change opened | path-count-test |
| 2 | Kontrakt druku i faktów kartki | Jedna strona A4 w Chrome, labirynt nieobcięty, margines co najmniej 10 mm, „Meta” oraz na starcie ta postać, która została wybrana albo przywrócona. Firefox i Safari zostają ręcznym podglądem, nadal otwartym. To, która postać weszła na kartkę, jest w tej fazie nadal otwarte: obecny plan `print-sheet-contract` tego nie sprawdza | 2, 3, 4 | Kontrakt układu w Chrome; ręczny podgląd Firefox i Safari | implementing | print-sheet-contract |
| 3 | Dane lokalne po powstaniu plasterka | Jawny zapis, potwierdzenie usunięcia, dane zostają na urządzeniu, i tylko gdy plasterek istnieje | 5 | Kontrakt lokalny, gdy istnieje S-05, S-06 albo US-02 | not started | — |
| 4 | Bramka produktu bez startera | Bramka pilnuje kartki i nie obrasta testami kont | 6 | `npm test` jako bramka produktu; smoke startera bez nowych asercji | not started | — |

Kolejność bierze się z wpływu i sparzenia, zgodnie z wywiadem P3. Faza 1 ma najwyższy wpływ i najtańszą warstwę. Faza 2 ma najwyższe prawdopodobieństwo i jedyne sparzenie z podglądu Chrome.

## §4 Stos

Astro 7 SSR, wyspy React, TypeScript, Tailwind, Cloudflare Workers. Node 22.14.0. Produkt nie ma kont, płatności, AI ani zadań w tle. Dane labiryntu i przyszłych profili zostają na urządzeniu.

Baza testów: **sparse**. `npm test` uruchamia cztery pliki w `src/lib/`: `maze/generate.test.ts`, `sheet/layout.test.ts`, `sheet/print-contract.test.ts`, `last-used.test.ts`. Nie ma Vitest, Jest ani Playwright. CI odpala `npm test` oraz, osobno, smoke po flow kont. AGENTS.md nadal opisuje brak runnera testów jednostkowych — to jest nieaktualne wobec `package.json`.

**Stack grounding tools (current session):**

- Docs: not available in current session; checked: 2026-10-06
- Search: WebSearch dostępny, nie użyty do wyboru narzędzia; checked: 2026-10-06
- Runtime/browser: przeglądarka w sesji nadaje się do ręcznego podglądu, nie jest runnerem testów; checked: 2026-10-06
- Provider/platform: not available in current session; checked: 2026-10-06

## §5 Co jest już sprawdzone

Jest test szczęśliwej ścieżki generatora. Przypadki „zero ścieżek” i „dwie ścieżki” nie są sprawdzone. Druk, „Meta”, postać przy starcie i zgodność ekranu z wydrukiem nie mają testu produktu. Smoke w CI sprawdza flow kont ze startera.

## §6 Podręcznik

Wypełnia się przy zamknięciu fazy wdrożenia. Do tego czasu wzorzec jest nazwany po zachowaniu, nie po pliku.

### Liczba ścieżek

TBD — patrz §3 Faza 1 dla wzorca odmowy kartki przy zero ścieżkach i przy więcej niż jednej ścieżce.

### Druk i znaczniki kartki

TBD — patrz §3 Faza 2 dla wzorca obcięcia lub drugiej strony oraz braku „Meta” lub postaci przy starcie.

### Bramka produktu

TBD — patrz §3 Faza 3 dla wzorca bramki, która pilnuje kartki i nie pokrywa startera.

## §7 Poza budżetem

- Logowanie, rejestracja, potwierdzenie maila, dashboard, API kont i dokładanie asercji startera do smoke.
- Migawki pikseli kartki i rysunków postaci.
- Zgodność labiryntu z poziomem trudności, dopóki poziomów nie ma.
- Własny obrazek rodzica.
- Automatyczne „czy rodzic rozumie ekran”. To zostaje ręcznym sprawdzeniem.
