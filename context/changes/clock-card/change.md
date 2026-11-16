---
change_id: clock-card
title: Karta „Zegar” — odczytaj, dorysuj albo połącz godzinę na tarczy
status: implementing
created: 2026-11-15
updated: 2026-11-16
archived_at: null
---

## Notes

Nowa karta po krzyżówce matematycznej (M-6). Kształt ustalony z użytkowniczką 2026-11-15 na interaktywnej makiecie w rozmowie (bez pliku):

- Rzędy tarcz zegara ze wskazówkami. Trzy tryby na jednym przełączniku „Tryb”: **Odczytaj** (dziecko wpisuje godzinę pod tarczą, 6 tarcz), **Dorysuj** (pod pustą tarczą stoi godzina, dziecko rysuje wskazówki, 6 tarcz), **Połącz** (5 tarcz po lewej, 5 zegarów cyfrowych po prawej w innej kolejności, dziecko łączy kreską). Domyślnie Odczytaj.
- Poziomy 1–5, bez wieku na pasku: 1 pełne godziny, 2 wpół do, 3 kwadranse, 4 co 5 minut, 5 co minutę. Domyślnie Poziom 1. Cel projektu (nie etykieta): 5–6, 6–7, 7, 7–8, 8–9 lat; tryby od najłatwiejszego: Połącz, Odczytaj, Dorysuj.
- Tarcza wynika z poziomu, bez osobnego przełącznika: zawsze liczby 1–12, od Poziomu 4 kreski minut. Tarcza bez liczb odpadła (dzieci uczące się zegara potrzebują liczb; to umiejętność ok. 9 lat).
- Przełącznik „24 h”, domyślnie wyłączony: pod tarczą pora dnia słowami („rano”, „po południu”, „wieczorem”, „w nocy”), odpowiedź w zapisie 24-godzinnym (19:30). Słowa zamiast ikon słońca/księżyca, bo ikona jest dwuznaczna, a 24 h jest dla dzieci, które czytają. Generator unika godzin na granicach pór.
- Odpowiedź tylko cyframi („7:30”), bez zapisu słownego.
- Bez „Pokaż rozwiązanie” (decyzja użytkowniczki 2026-11-15: odpowiedzi łatwo sprawdzić okiem).
- Profil pamięta poziom, tryb i 24 h. Zmiana poziomu, trybu albo 24 h przy pokazanej karcie układa nową kartę.

### Makieta w skali (2026-11-16, zaakceptowana)

`mockup.mts` rysuje karty A4 1:1 (trzy tryby na Poziomie 1 i 4, warianty 24 h na Poziomie 2, arkusz szczegółów wskazówek) z prawdziwym pasem postaci (`src/lib/sheet/speech.ts`) i sam sprawdza margines 10 mm, kąty wskazówek (7:30 → 225°, między 7 a 8), brak powtórek, minuty poziomu, godziny graniczne i to, że w Połącz żaden zegar cyfrowy nie stoi na wysokości swojej tarczy. Uruchom: `node --experimental-strip-types context/changes/clock-card/mockup.mts` (pisze `mockup-*.svg` i `mockups.html`). Wymiary: Odczytaj/Dorysuj 2 × 3, tarcza ok. 60 mm (z 24 h 52–54 mm), kratki 18 × 13 mm, zegar cyfrowy 42 × 15 mm, cyfry 10 mm; Połącz 5 rzędów, tarcza 45 mm (z 24 h 38 mm), kropki 83–90 mm od siebie.

Decyzje użytkowniczki po makiecie (zapisane w PRD US-33, US-34 i Business Logic „Karta „Zegar””):

1. Liczby tarczy leżą nad wskazówkami z białą obwódką (długa wskazówka zakrywała „12” i „6”).
2. Pola odpowiedzi w Odczytaj to dwie kratki z dwukropkiem, nie linie.
3. Od Poziomu 2 co najmniej połowa tarcz ma minuty nowe dla poziomu (P2 :30, P3 :15/:45, P4 wielokrotności 5 poza kwadransami, P5 niepodzielne przez 5).
4. Przy 24 h bez godzin po północy (0:xx); „w nocy” to 23:xx i 1:00–3:59.

Pora dnia przy 24 h stoi pod każdą tarczą, także w Dorysuj (jak w PRD).

Następna po zegarze: karty kodowania. „Połącz kropki” i „Znajdź różnice” czekają na katalog rysunków wektorowych (pikselowe sylwetki z szablonów nie wystarczą).
