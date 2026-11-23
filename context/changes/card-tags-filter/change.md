---
change_id: card-tags-filter
title: Umiejętności i filtr kart w katalogu
status: impl_reviewed
created: 2026-11-22
updated: 2026-11-23
archived_at: null
---

## Notes

S-43 (roadmapa M-7, GitHub drpc1/printo-kids#374). Decyzje użytkowniczki z 2026-11-22, zapisane w roadmapie w PR drpc1/printo-kids#457:

- Pięć umiejętności „Co ćwiczy?”; każda karta ma jedną albo dwie:
  - Liczby: Krzyżówka matematyczna, Kto ma więcej, Labirynt liczbowy
  - Logika: Kodowanie, Który nie pasuje, Labirynt, Nonogram, Sekwencje, Sudoku
  - Rysowanie: Dyktando graficzne, Labirynt, Skopiuj obrazek, Symetria, Szlaczki
  - Spostrzegawczość: Cienie, Który nie pasuje, Od najmniejszego, Skopiuj obrazek, Symetria
  - Czas i pieniądze: Zegar, Kto ma więcej
- Zasada: umiejętność pasuje, gdy rodzic się nie zdziwi (stąd Zegar i Od najmniejszego poza Liczbami).
- Filtr: rząd chipów nad katalogiem („Wszystkie” + pięć umiejętności), jeden wybór, „Wszystkie” domyślne; chip ukrywa karty bez tej umiejętności, karta z dwiema umiejętnościami pokazuje się pod obiema; umiejętności stoją pod nazwą na miniaturze. Odrzucone: sekcje z nagłówkami.
- Wybór nie jest zapamiętywany (ani profil, ani urządzenie).
- Nazwa pojęcia: „umiejętność”, w kodzie `CardKind.skills`; nie „kategoria”, „tag” ani „filtr”. Do glosariusza i PRD (US-05, FR-014) w planie.
- Ryzyka: e2e i plakietki zakładają stałą liczbę miniatur; S-47 („Cienie”) jeszcze otwarte, możliwy konflikt w `src/lib/cards.ts`.
