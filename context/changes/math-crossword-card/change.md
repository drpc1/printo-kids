---
change_id: math-crossword-card
title: Krzyżówka matematyczna – nowa karta (S-40, M-6)
status: impl_reviewed
created: 2026-11-13
updated: 2026-11-14
archived_at: null
---

## Notes

S-40 w M-6, issue drpc1/printo-kids#371. 11. rodzaj karty: siatka działań (dodawanie, odejmowanie) krzyżujących się we wspólnych polach, część liczb wpisana, reszta do uzupełnienia. Jedna sprawdzalna odpowiedź (solver), A4, margines 10 mm, czarny druk, poziomy łatwy/średni/trudny, postać przy poleceniu, profil pamięta pasek. Najpierw makiety (układ, zakresy liczb); plan i implementacja po akceptacji.

2026-11-13, makiety: pierwsza wersja (regularna siatka 5×5 / 7×7 z gołymi znakami oraz siatka z wynikami na brzegach) odrzucona. Użytkowniczka pokazała zdjęcie zeszytu ćwiczeń (krzyżówki „Mnożenie i dzielenie w zakresie 50”): każde pole to kratka, także znak działania i „=”; działania „a ○ b = c” biegną w prawo albo w dół i krzyżują się swobodnie we wspólnych polach z liczbami, jak słowa w krzyżówce. Łatwy poziom: samo dodawanie do 10. Makieta v2 (`mockup.mts`, `mockups.html`, `mockup-*.svg`) idzie za tym wzorem; liczby są prawdziwe i dają się wyliczyć bez zgadywania.

2026-11-13: użytkowniczka chce więcej niż trzy poziomy; trudność wyznaczają rodzaj działań, największa liczba i wielkość krzyżówki. Propozycja do akceptacji: Poziom 1–7 (+ do 10; + − do 10; + − do 20; + − do 100; · do 30; · : do 50; wszystkie do 100), mnożenie i dzielenie w tabliczce mnożenia (czynniki, dzielnik i iloraz do 10).

2026-11-13, poprawki użytkowniczki: większa kratka na Poziomach 1 i 2 (26 i 24 mm), więcej działań na Poziomach 2, 3 i 7 (9, 13, 20). Puste kratki (użytkowniczka nie miała zdania): propozycja, żeby rosły z poziomem razem z „łańcuchem” (ile pustych pól trzeba wyliczyć, zanim da się wyliczyć następne): Poziomy 1–2 łańcuch 1 (każde puste pole wprost z podanych liczb), 3 → 2, 4–5 → 3, 6–7 → 4; ok. 40% pustych na Poziomie 1, do 60% na Poziomie 7. Bez osobnej kontrolki na pasku.
