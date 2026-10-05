---
project: PrintoKids
checked: 2026-10-05
status: active
---

# Test plan: PrintoKids

Stopniowe wdrażanie testów dla istniejącego produktu. Ten plik jest strategią. Kod testów, kotwice plików i konfiguracja bramek powstają w kolejnych fazach przez `/10x-research` → `/10x-plan` → `/10x-implement`.

## §1 Strategia

Trzy zasady. Każda faza wdrożenia przekazuje je do `/10x-plan`.

1. **Koszt × sygnał.** Każdy test, który dodaje wdrożenie — klasyczny lub AI-natywny — musi odpowiedzieć na jedno pytanie: jaki jest najtańszy test, który daje prawdziwy sygnał dla tego ryzyka? Nie promuj do e2e, ponieważ „czuje się bezpieczniej”; nie nakładaj modelu wizyjnego na deterministyczną różnicę, która już wykrywa regresję.

2. **Obawy użytkowników są dowodem.** Ryzyka, przez które zespół przeszedł, mają taką samą wagę jak linie PRD lub dane hot-spotów.

3. **Ryzyka to scenariusze, a nie lokalizacje kodu.** Mapa w §2 cytuje dowody: linie PRD, odpowiedzi z wywiadu, katalogi hot-spotów z liczbą zmian, ograniczenia stosu. Nie cytuje `plik:linia`, nazw funkcji, nazw schematów ani nazw modułów i nie twierdzi, że dany plik jest miejscem awarii. Katalog hot-spotów jest dowodem prawdopodobieństwa. To, gdzie w kodzie przebiega awaria, ustala `/10x-research` w fazie wdrożenia.

Skan hot-spotów: zakres `src`, 14 commitów od 2026-09-04. Najczęstsze katalogi: `src/components/` (kartka), `src/components/auth/`, `src/pages/auth/`, `src/pages/`, `src/components/ui/`. Katalog `src/lib/maze/` — 2 zmiany / 30 dni. Katalogi auth są śladem zmian startera i nie wchodzą do budżetu testów (§7).

Warstwy AI-natywnej nie ma. Obraz podglądu druku nie daje tańszego sygnału niż kontrakt układu albo ręczny podgląd Chrome.

## §2 Mapa ryzyk

Wpływ i prawdopodobieństwo: Wysoki / Średni / Niski.

- **Wpływ wysoki** — krytyczna funkcja bez obejścia: dziecko dostaje labirynt, którego nie da się uczciwie rozwiązać.
- **Wpływ średni** — da się zauważyć przed oddaniem kartki albo zły przebieg CI daje fałszywą pewność.
- **Prawdopodobieństwo wysokie** — było sparzenie albo obszar jest najczęstszy w ostatnich 30 dniach.
- **Prawdopodobieństwo średnie** — wymaga tego PRD albo świeży plasterek, ale awarii jeszcze nie zaobserwowano.
- **Prawdopodobieństwo niskie** — algorytm stoi i katalog prawie się nie zmienia.

Najpierw Wysoki × Wysoki. Takiej pary na mapie nie ma. Ryzyko 1 jest Wysokie × Niskie i zostaje testem, nie alertem: wywiad nazwał je krytycznym, bez obejścia, a sprawdzenie jest tanie. Poziomy trudności są zaparkowane w roadmapie i podniosą jego prawdopodobieństwo, gdy wejdą.

| # | Scenariusz awarii | Wpływ | Prawdopodobieństwo | Źródło |
| - | --- | --- | --- | --- |
| 1 | Generator uznaje za gotową kartę labirynt bez ścieżki albo z więcej niż jedną ścieżką | Wysoki | Niski | Logika biznesowa w PRD (dokładnie jedno rozwiązanie); wywiad P1 i P4; katalog `src/lib/maze/` — 2 zmiany / 30 dni. Poziomy trudności zaparkowane w roadmapie podniosą to prawdopodobieństwo później |
| 2 | Na ekranie kartka wygląda dobrze, a w podglądzie druku Chrome labirynt jest obcięty albo wchodzi druga strona | Średni | Wysoki | Wywiad P1 i P2; FR-005 i margines 10 mm w PRD; ryzyko S-02 w roadmapie (przeglądarki różnie stosują marginesy); katalog `src/components/` — najczęstsze zmiany / 30 dni |
| 3 | Na wydruku brakuje „Meta”, albo wybrana postać nie stoi przy starcie lub zasłania wejście, choć na ekranie jest inaczej | Średni | Średni | Kryteria US-01 w PRD; zarchiwizowany plasterek postaci; katalog `src/components/`; UX z wywiadu P1, zawężony do faktów na kartce |
| 4 | Zielony przebieg automatyczny mówi o kontach ze startera, a nie o kartce | Średni | Wysoki | Job smoke w CI; opis smoke w AGENTS.md; wywiad P5 |
| 5 | Edge, Firefox albo Safari powtarza obcięcie lub drugą stronę, gdy Chrome jest już dobry | Średni | Średni | Wymaganie PRD: aktualne desktopowe Chrome, Edge, Firefox i Safari; sparzenie z wywiadu P2 dotyczy tylko Chrome |

### Risk Response Guidance

| Ryzyko | Co udowodni ochronę | Musi kwestionować | Kontekst dla badania | Najtańsza warstwa | Anty-wzorzec |
| - | --- | --- | --- | --- | --- |
| 1 | Labirynt bez ścieżki i labirynt z dwiema ścieżkami nie są traktowane jako gotowa kartka | Test szczęśliwej ścieżki oznacza, że złe liczby ścieżek są odrzucane | Jak dziś rozstrzygana jest liczba ścieżek i co staje się kartką | Test jednostkowy na istniejącym runnerze Node | Asercja skopiowana ze szczęśliwej ścieżki; wyrocznia wzięta z bieżącego wyniku generatora |
| 2 | Podgląd druku Chrome to jedna strona A4, labirynt nieobcięty, margines co najmniej 10 mm, podczas gdy ekran wygląda dobrze | Dobry ekran oznacza dobry druk | Co odróżnia widok ekranu od strony drukowanej | Kontrakt układu, jeśli badanie znajdzie sprawdzalną regułę; inaczej ręczny podgląd Chrome | Zrzut ekranu kartki; pełne e2e aplikacji; test stron startera |
| 3 | Przy wybranej postaci jest ona przy starcie, „Meta” jest przy końcu, a wydruk zgadza się z tymi faktami | Widok na ekranie oznacza ten sam wydruk | Kiedy postać i „Meta” wchodzą na kartkę i co z nich zostaje w druku | Ten sam kontrakt kartki co przy ryzyku 2, nie osobna warstwa | Migawka pikseli rysunku; test „czy rodzic rozumie ekran” |
| 4 | Automatyczny przebieg, który ma chronić produkt, odpala testy kartki, a nie konta | Smoke zwracający 200 na stronie głównej oznacza rozwiązywalny labirynt i jedną stronę A4 | Co CI uruchamia dziś i które z tych poleceń dotyczą startera | Zostawić `npm test` jako bramkę produktu; nie dokładać asercji startera do smoke | Nowe testy logowania, dashboardu albo API kont |
| 5 | Po naprawie Chrome ten sam wydruk jest jedną stroną A4 także w Edge, Firefox i Safari | Dobry Chrome oznacza dobre pozostałe trzy przeglądarki | Czy reguła z ryzyka 2 jest wspólna, czy każda przeglądarka łamie ją inaczej | Ręczny podgląd druku w pozostałych trzech, dopiero gdy Chrome jest zielony | Macierz automatycznych przeglądarek jako pierwszy test druku |

## §3 Stopniowe wdrażanie

Słownik statusu: `not started` → `change opened` → `researched` → `planned` → `implementing` → `complete`.

| # | Faza | Cel ochrony | Ryzyka | Typy testów | Status | Change folder |
| - | --- | --- | --- | --- | --- | --- |
| 1 | Ochrona liczby ścieżek | Udowodnić, że zero ścieżek i więcej niż jedna ścieżka nie dają gotowej kartki | 1 | Jednostkowe, obecny runner Node | change opened | testing-path-count |
| 2 | Kontrakt druku i kartki | Udowodnić jedną stronę A4 w Chrome, margines 10 mm oraz „Meta” i postać; potem ręcznie Edge, Firefox i Safari | 2, 3, 5 | Kontrakt układu plus ręczny podgląd druku | not started | print-sheet-contract |
| 3 | Bramka produktu bez startera | Przebieg automatyczny pilnuje testów kartki i nie obrasta testami kont | 4 | Istniejące `npm test` w CI; smoke startera bez nowych asercji | not started | — |

Kolejność: faza 1 ma najwyższy wpływ i najtańszą warstwę. Faza 2 ma najwyższe prawdopodobieństwo i jedyne sparzenie. Faza 3 domyka dół, gdy jest już co pilnować.

## §4 Stos

Astro 7 SSR, wyspy React, TypeScript, Tailwind, Cloudflare Workers. Node 22.14.0. Produkt nie ma kont, płatności, AI ani zadań w tle. Dane labiryntu i przyszłych profili zostają na urządzeniu.

Baza testów: **sparse**. `npm test` uruchamia jeden plik runnera Node w katalogu `src/lib/maze/`. Nie ma konfiguracji Vitest, Jest ani Playwright. CI odpala ten test oraz smoke po flow kont. AGENTS.md nadal opisuje brak runnera testów jednostkowych — to jest nieaktualne względem `package.json` i workflow CI.

**Stack grounding tools (current session):**

- Docs: not available in current session; checked: 2026-10-04
- Search: WebSearch dostępny, nie użyty do wyboru narzędzia; checked: 2026-10-04
- Runtime/browser: przeglądarka w sesji nadaje się do ręcznego podglądu, nie jest runnerem testów; checked: 2026-10-04
- Provider/platform: not available in current session; checked: 2026-10-04

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
