---
change_id: gh324-waluty-eur-usd
title: Karta „Kto ma więcej?”: pieniądze w EUR i USD
status: impl_reviewed
created: 2026-11-09
updated: 2026-11-09
archived_at: null
---

## Notes

GitHub drpc1/printo-kids#324. Makiety: `context/ideas/waluty/makieta-eur.jpg`, `makieta-usd.jpg`. Poprzednia zmiana: #270 (kolory). Decyzje otwarte: waluta jako ustawienie paska czy osobna karta; nominały i sumy poziomów EUR/USD; ryzyko obrazków USD z portretami (PRD Open Questions 14).

### Decyzje użytkowniczki (2026-11-09)

1. Waluta: ustawienie paska `currency`, pamiętane w profilu (nie osobna karta).
2. Nominały: bez centów/groszy. USD łatwy: moneta 1 $ + banknot 5 $ (wyjątek od „łatwy tylko monety” dla USD). 50 € w trudnym: nierozstrzygnięte.
3. Obrazki USD: użytkowniczka sprawdzi prawo sama; obrazki zostają jak w makiecie do czasu jej potwierdzenia.
4. Centów/groszy na razie nie dodajemy. Poziom trudny może mieć nominały większe niż 20 (np. 50, 100; PLN, EUR i USD). Konkretne zestawy i sumy do ustalenia w planie.
5. Obrazki USD: wdrożyć wszystko z makiet (użytkowniczka usunie przed merge, jeśli prawo będzie wątpliwe). Po każdej fazie push i PR do main, bez merge. Zestawy nominałów trudnego powyżej 20 dobiera Claude (sumy i limity sztuk z układu karty).
6. (2026-11-09, po obejrzeniu) Dolar bez monet: moneta 1 $ jest rzadka, więc `1usd.png` to banknot 1 $; USD ma tylko banknoty (1, 5, 10, 20, 50, 100), w kupce najwyżej 9 (`MAX_NOTES_WITHOUT_COINS`). Euro bez zmian.
