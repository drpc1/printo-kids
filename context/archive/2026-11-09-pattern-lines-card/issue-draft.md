# Szkic issue (niepublikowany): Szlaczki — kategorie obrazków startu i celu

> Szkic do przejrzenia przez użytkowniczkę. Nie jest założony na GitHubie. Powstał w frame S-36 (2026-11-09).

**Tytuł:** Szlaczki: kategorie obrazków startu i celu (pole „Brak”, kontury, kolory)

## Po co

Karta szlaczków z S-36 to same rzędy wzorów. Makiety (`context/changes/pattern-lines-card/mockup-v4-*.svg`) pokazały,
że karta jest dużo ciekawsza dla dziecka, gdy rząd prowadzi od obrazka do celu (królik skacze łukami do marchewki,
łódka płynie falą do latarni). Ta zmiana dodaje to jako wybór kategorii na pasku.

## Zakres

- Na pasku szlaczków wybór „Kategoria” z polem **„Brak”** (karta bez obrazków, jak po S-36) i kategoriami obrazków.
  Do rozstrzygnięcia: czy „Brak” jest domyślne (inne karty mają domyślnie „Wszystkie”) i jakie są kategorie.
- Obrazki startu i celu w każdym rzędzie; szlaczek to droga między nimi, a ruch pasuje do wzoru.
- Czarny druk: **kontury** obrazków (dziecko je potem koloruje). Kolorowy druk: obrazki **w kolorach**.
  Przełącznik „Kolory” wraca na tę kartę razem z kategoriami.
- **Sensowne pary** start → cel (pszczoła → kwiatek, ptak → gniazdo, auto → garaż…), bez powtórzeń na karcie.
- **Nowe rysunki**: dzisiejsze ikony („Który nie pasuje”, 25 sztuk) dają za mało par; np. pociąg, rower, żaba,
  pszczoła, motyl, gniazdo, garaż. Bez postaci i znaków towarowych (Open Questions 3).
- Profil pamięta kategorię i kolory (tabela „Profil i zapamiętane ustawienia” w PRD).

## Testy

- Reguły par: para nie powtarza się na karcie, kategoria daje dość par na każdy poziom (jak sprawdzenie kategorii
  w dyktandzie i nonogramie).
- Wąski przebieg Strykera na wyborze par i odczycie kategorii w `card-settings.ts` (AGENTS.md: tylko kod tej zmiany).

## Zależności

Po S-36 (karta bez obrazków) i najlepiej po S-37. Nie należy do M-5.
