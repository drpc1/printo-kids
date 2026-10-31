---
change_id: gh114-maze-too-easy
title: Labirynty odrobinę trudniejsze na każdym poziomie (GitHub 114)
status: archived
created: 2026-10-30
updated: 2026-10-31
archived_at: 2026-10-31T07:58:46Z
---

## Notes

GitHub issue 114: "Labirynty: odrobinę trudniejsze na każdym poziomie". Karty wydają się za łatwe (uwaga z używania, 2026-10-25). Podnieść trudność o jeden mały krok na każdym z sześciu poziomów (siatki w `src/lib/maze/levels.ts`), bez nowej skali wieku. Karta zostaje jedną stroną A4 z marginesem 10 mm, z postacią tam, gdzie poziom ją pokazuje, i z jedną drogą od startu do mety. Docelowe wymiary siatki ustalamy przy implementacji.

### Wnioski z testów (4-latek i 6-latek, 2026-10-30)

- 4-latek bez problemu robił Poziomy 1–3.
- 6-latek bez problemu robił wszystkie poziomy, z Poziomem 6 włącznie.
- Trudność bardzo różni się między wygenerowanymi kartami, zwłaszcza na niższych poziomach: raz prawie prosta droga w dół kartki, raz droga ciągnąca się przez cały labirynt.
- Na niższych poziomach droga często biegnie prawie cały czas w dół, z przesunięciami w lewo lub prawo o 2 pola, i trzyma się środka.
- Mało dłuższych ślepych uliczek (na wszystkich poziomach).
- Mało sensownych rozgałęzień (chyba na wszystkich poziomach).
- Droga od mety do startu często wydaje się ciekawsza i trudniejsza niż od startu do mety.

Wniosek wstępny: sama większa siatka (jak w issue) może nie wystarczyć. Problem wygląda na jakość losowania: rozrzut trudności, droga przy środku, krótkie ślepe uliczki, mało rozgałęzień.

Dodatkowo: alejki trzeba chyba odrobinę zmniejszyć od Poziomu 2, a każdy poziom ma mieć inną szerokość alejki (dziś Poziomy 1–2 dzielą ok. 21 mm, a 3–4 ok. 15 mm). To zmienia tabelę poziomów w PRD (Business Logic). Użytkowniczka nie wie dokładnie, co ma się zmienić; spisała wszystkie odczucia.
